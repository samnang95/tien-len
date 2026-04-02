// ═══════════════════════════════════════════════════════════════
// TIẾN LÊN — MULTIPLAYER (Room 2)
// Firebase Realtime Database Integration
// ═══════════════════════════════════════════════════════════════

// ── FIREBASE CONFIG ──
const firebaseConfig = {
  apiKey: "AIzaSy8hgWb4INKU1418pGaxdqUhtrtQV8BC8is",
  authDomain: "tien-len-ac1a2.firebaseapp.com",
  databaseURL: "https://tien-len-ac1a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tien-len-ac1a2",
  storageBucket: "tien-len-ac1a2.firebasestorage.app",
  messagingSenderId: "554951223890",
  appId: "1:554951223890:web:2ef967c27a96f453d1cd8b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ── CARD CONSTANTS ──
const SUITS = ['♠','♣','♦','♥'];
const RANKS = ['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
const SUIT_SYM = {'♠':'♠','♣':'♣','♦':'♦','♥':'♥'};
const RED_SUITS = new Set(['♦','♥']);
const NUM_PLAYERS = 4;

// ── PLAYER STATE ──
let playerId = localStorage.getItem('tl_pid');
if (!playerId) {
  playerId = 'p_' + Math.random().toString(36).substr(2,9) + '_' + Date.now();
  localStorage.setItem('tl_pid', playerId);
}
let playerName = localStorage.getItem('tl_pname') || '';
let mySeat = -1;
let roomCode = '';
let isHost = false;

// ── FIREBASE LISTENERS ──
let roomRef = null;
let playersRef = null;
let gameRef = null;
let listeners = [];

// ── GAME STATE ──
let gs = null; // full game state from Firebase
let selected = new Set();
let turnTimer = null;
let turnTimeLeft = 30;
const TURN_TIME = 30;

// ═══════════════════════════════════════════════════════════════
// SOUND EFFECTS
// ═══════════════════════════════════════════════════════════════
const SFX = {
  ctx: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  play(type) {
    this.init();
    const c = this.ctx, now = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    if (type === 'play')   { o.frequency.value = 523; g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.2); o.start(now); o.stop(now+0.2); }
    if (type === 'pass')   { o.frequency.value = 220; o.type = 'triangle'; g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.15); o.start(now); o.stop(now+0.15); }
    if (type === 'win')    { [523,659,784].forEach((f,i) => { const o2=c.createOscillator(),g2=c.createGain(); o2.connect(g2); g2.connect(c.destination); o2.frequency.value=f; g2.gain.setValueAtTime(0.12,now+i*0.12); g2.gain.exponentialRampToValueAtTime(0.001,now+i*0.12+0.3); o2.start(now+i*0.12); o2.stop(now+i*0.12+0.3); }); return; }
    if (type === 'error')  { o.frequency.value = 180; o.type = 'sawtooth'; g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.15); o.start(now); o.stop(now+0.15); }
    if (type === 'join')   { o.frequency.value = 440; g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.25); o.start(now); o.stop(now+0.25); }
  }
};

// ═══════════════════════════════════════════════════════════════
// CARD LOGIC (same as single player)
// ═══════════════════════════════════════════════════════════════
function cardValue(c) { return RANKS.indexOf(c.rank) * 4 + SUITS.indexOf(c.suit); }
function cardRankIdx(c) { return RANKS.indexOf(c.rank); }

function makeDeck() {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ rank: r, suit: s });
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function sortHand(hand) {
  return [...hand].sort((a, b) => cardValue(a) - cardValue(b));
}

function classify(cards) {
  if (!cards || cards.length === 0) return null;
  const n = cards.length;
  const ranks = cards.map(c => cardRankIdx(c));
  const sorted = [...ranks].sort((a, b) => a - b);
  const allSame = r => r.every(x => x === r[0]);
  const isConsec = r => { const s = [...r].sort((a,b)=>a-b); for(let i=1;i<s.length;i++) if(s[i]!==s[i-1]+1) return false; return s[s.length-1] <= 11; }; // no 2 in runs

  if (n === 1) return { type: 'single', rank: sorted[0], high: Math.max(...cards.map(cardValue)) };
  if (n === 2 && allSame(ranks)) return { type: 'pair', rank: sorted[0], high: Math.max(...cards.map(cardValue)) };
  if (n === 3 && allSame(ranks)) return { type: 'triple', rank: sorted[0], high: Math.max(...cards.map(cardValue)) };
  if (n === 4 && allSame(ranks)) return { type: 'four', rank: sorted[0], high: Math.max(...cards.map(cardValue)) };

  // Double pair: 2 consecutive pairs (4 cards), no 2s
  if (n === 4 && !ranks.includes(12)) {
    const sortedCards = [...cards].sort((a,b) => cardRankIdx(a) - cardRankIdx(b));
    const r0 = cardRankIdx(sortedCards[0]), r1 = cardRankIdx(sortedCards[1]);
    const r2 = cardRankIdx(sortedCards[2]), r3 = cardRankIdx(sortedCards[3]);
    if (r0 === r1 && r2 === r3 && r2 - r0 === 1) {
      return { type: 'doublepair', rank: r2, high: Math.max(...cards.map(cardValue)) };
    }
  }

  if (n >= 3 && isConsec(sorted)) {
    const uniqueRanks = [...new Set(ranks)];
    if (uniqueRanks.length === n) return { type: 'run', length: n, rank: Math.max(...sorted), high: Math.max(...cards.map(cardValue)) };
  }

  // Double run (pairs sequence): must be even, >= 6 cards
  if (n >= 6 && n % 2 === 0) {
    const pairRanks = [];
    const sortedCards = [...cards].sort((a,b) => cardRankIdx(a) - cardRankIdx(b));
    let valid = true;
    for (let i = 0; i < sortedCards.length; i += 2) {
      if (cardRankIdx(sortedCards[i]) !== cardRankIdx(sortedCards[i+1])) { valid = false; break; }
      pairRanks.push(cardRankIdx(sortedCards[i]));
    }
    if (valid) {
      const prSorted = [...pairRanks].sort((a,b)=>a-b);
      let isConsecPairs = true;
      for (let i = 1; i < prSorted.length; i++) {
        if (prSorted[i] !== prSorted[i-1]+1) { isConsecPairs = false; break; }
      }
      if (isConsecPairs && prSorted[prSorted.length-1] <= 11) {
        return { type: 'dblrun', length: n, rank: Math.max(...prSorted), high: Math.max(...cards.map(cardValue)) };
      }
    }
  }
  return null;
}

function beats(combo, prevCards) {
  const prev = classify(prevCards);
  if (!prev) return true; // free turn

  // Four-of-a-kind beats single 2 or pair of 2s
  if (combo.type === 'four') {
    if (prev.type === 'single' && prev.rank === 12) return true;
    if (prev.type === 'pair' && prev.rank === 12) return true;
    if (prev.type === 'four') return combo.high > prev.high;
  }
  // Double run of 8+ beats everything
  if (combo.type === 'dblrun' && combo.length >= 8) {
    if (prev.type === 'single' && prev.rank === 12) return true;
    if (prev.type === 'pair' && prev.rank === 12) return true;
    if (prev.type === 'four') return true;
  }
  // Pair sequence of 3+ pairs can chop a single 2
  if (combo.type === 'dblrun' && combo.length >= 6 && prev.type === 'single' && prev.rank === 12)
    return true;
  // Same type and length
  if (combo.type !== prev.type) return false;
  if ((combo.type === 'run' || combo.type === 'dblrun') && combo.length !== prev.length) return false;
  return combo.high > prev.high;
}

// ═══════════════════════════════════════════════════════════════
// SCREEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function showScreen(id) {
  ['lobby-screen', 'waiting-room', 'mp-game'].forEach(s => {
    document.getElementById(s).classList.toggle('hidden', s !== id);
  });
}

function showLobbyMain() {
  document.getElementById('lobby-main').classList.remove('hidden');
  document.getElementById('create-form').classList.add('hidden');
  document.getElementById('join-form').classList.add('hidden');
  document.getElementById('lobby-error').classList.add('hidden');
}

function showCreateRoom() {
  const name = document.getElementById('nickname-input').value.trim();
  if (!name) { showError('Please enter a nickname'); return; }
  playerName = name;
  localStorage.setItem('tl_pname', name);
  document.getElementById('lobby-main').classList.add('hidden');
  document.getElementById('create-form').classList.remove('hidden');
  document.getElementById('lobby-error').classList.add('hidden');
}

function showJoinRoom() {
  const name = document.getElementById('nickname-input').value.trim();
  if (!name) { showError('Please enter a nickname'); return; }
  playerName = name;
  localStorage.setItem('tl_pname', name);
  document.getElementById('lobby-main').classList.add('hidden');
  document.getElementById('join-form').classList.remove('hidden');
  document.getElementById('lobby-error').classList.add('hidden');
}

function showError(msg) {
  const el = document.getElementById('lobby-error');
  el.textContent = msg;
  el.classList.remove('hidden');
  SFX.play('error');
}

// ═══════════════════════════════════════════════════════════════
// ROOM MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function createRoom() {
  SFX.play('join');
  roomCode = generateRoomCode();
  isHost = true;
  mySeat = 0;

  roomRef = db.ref('rooms/' + roomCode);

  // Check if code already exists
  const snap = await roomRef.get();
  if (snap.exists()) {
    roomCode = generateRoomCode(); // regenerate
    roomRef = db.ref('rooms/' + roomCode);
  }

  await roomRef.set({
    host: playerId,
    status: 'waiting',
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    players: {
      [playerId]: {
        name: playerName,
        seat: 0,
        connected: true
      }
    }
  });

  // Presence: remove player on disconnect
  roomRef.child('players/' + playerId + '/connected').onDisconnect().set(false);

  listenForPlayers();
  showScreen('waiting-room');
  document.getElementById('display-room-code').textContent = roomCode;
}

async function joinRoom() {
  const codeInput = document.getElementById('room-code-input').value.trim().toUpperCase();
  if (codeInput.length !== 6) { showError('Room code must be 6 characters'); return; }

  roomCode = codeInput;
  roomRef = db.ref('rooms/' + roomCode);

  // Check room exists
  const snap = await roomRef.get();
  if (!snap.exists()) { showError('Room not found. Check the code.'); return; }

  const room = snap.val();
  if (room.status !== 'waiting') { showError('Game already in progress'); return; }

  // Count current players
  const players = room.players || {};
  const playerCount = Object.keys(players).length;
  if (playerCount >= 4) { showError('Room is full (4/4)'); return; }

  // Find next available seat
  const takenSeats = Object.values(players).map(p => p.seat);
  mySeat = [0, 1, 2, 3].find(s => !takenSeats.includes(s));
  isHost = false;

  SFX.play('join');

  await roomRef.child('players/' + playerId).set({
    name: playerName,
    seat: mySeat,
    connected: true
  });

  // Presence
  roomRef.child('players/' + playerId + '/connected').onDisconnect().set(false);

  listenForPlayers();
  showScreen('waiting-room');
  document.getElementById('display-room-code').textContent = roomCode;
}

function leaveRoom() {
  // Cleanup listeners
  listeners.forEach(l => l());
  listeners = [];

  if (roomRef && playerId) {
    roomRef.child('players/' + playerId).remove();
    // If host leaves, delete the room
    if (isHost) roomRef.remove();
  }

  clearInterval(turnTimer);
  roomRef = null;
  gameRef = null;
  gs = null;
  mySeat = -1;
  selected.clear();

  showScreen('lobby-screen');
  showLobbyMain();
}

function copyRoomCode() {
  navigator.clipboard.writeText(roomCode).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = '✅';
    setTimeout(() => btn.textContent = '📋', 1500);
  });
}

// ═══════════════════════════════════════════════════════════════
// LISTEN FOR PLAYERS IN WAITING ROOM
// ═══════════════════════════════════════════════════════════════
function listenForPlayers() {
  playersRef = roomRef.child('players');
  const unsub = playersRef.on('value', (snap) => {
    const players = snap.val() || {};
    const playerCount = Object.keys(players).length;

    // Update slots
    for (let i = 0; i < 4; i++) {
      const slot = document.getElementById('slot-' + i);
      const player = Object.values(players).find(p => p.seat === i);
      const pid = Object.keys(players).find(k => players[k].seat === i);

      if (player) {
        slot.classList.remove('empty');
        slot.classList.add('filled');
        slot.classList.toggle('is-you', pid === playerId);
        slot.querySelector('.slot-name').textContent = player.name + (pid === playerId ? ' (You)' : '');
      } else {
        slot.classList.add('empty');
        slot.classList.remove('filled', 'is-you');
        slot.querySelector('.slot-name').textContent = 'Waiting...';
      }
    }

    // Update status
    const statusEl = document.getElementById('waiting-status');
    statusEl.textContent = `${playerCount} player${playerCount !== 1 ? 's' : ''} joined`;

    // Show start button for host when at least 1 player
    const startBtn = document.getElementById('btn-start-game');
    if (isHost && playerCount >= 1) {
      startBtn.style.display = 'inline-flex';
    } else {
      startBtn.style.display = 'none';
    }
  });
  listeners.push(() => playersRef.off('value', unsub));

  // Listen for game start
  const statusUnsub = roomRef.child('status').on('value', (snap) => {
    if (snap.val() === 'playing') {
      listenForGame();
      showScreen('mp-game');
      document.getElementById('game-room-code').textContent = roomCode;
      // Show reset button only for host
      document.getElementById('mp-reset-btn').style.display = isHost ? 'flex' : 'none';
    }
  });
  listeners.push(() => roomRef.child('status').off('value', statusUnsub));
}

// ═══════════════════════════════════════════════════════════════
// START GAME (host only)
// ═══════════════════════════════════════════════════════════════
async function startGame() {
  if (!isHost) return;
  SFX.play('play');

  // Get players
  const snap = await playersRef.get();
  const players = snap.val();
  const playerCount = Object.keys(players).length;
  if (playerCount < 1) return;

  // Build player name map & active seats
  const nameMap = {};
  const activeSeats = [];
  Object.values(players).forEach(p => {
    nameMap[p.seat] = p.name;
    activeSeats.push(p.seat);
  });
  activeSeats.sort((a, b) => a - b);

  // Shuffle and deal 13 cards to each active player
  const deck = makeDeck();
  const hands = [[], [], [], []];
  let cardIdx = 0;
  for (let i = 0; i < 13; i++) {
    for (const seat of activeSeats) {
      hands[seat].push(deck[cardIdx++]);
    }
  }

  // Sort each hand
  for (const seat of activeSeats) hands[seat] = sortHand(hands[seat]);

  // Find who has 3♠ (among active players)
  let starter = activeSeats[0];
  for (const seat of activeSeats) {
    if (hands[seat].some(c => c.rank === '3' && c.suit === '♠')) {
      starter = seat;
      break;
    }
  }

  // Write game state
  await roomRef.child('game').set({
    hands: hands,
    current: starter,
    lastPlayed: [],
    lastPlayer: -1,
    passCount: 0,
    finishOrder: [],
    scores: [0, 0, 0, 0],
    wallets: [1000, 1000, 1000, 1000],
    betAmount: 100,
    gameOver: false,
    message: nameMap[starter] + ' starts (has 3♠)',
    turnStartedAt: firebase.database.ServerValue.TIMESTAMP,
    names: nameMap,
    activeSeats: activeSeats,
    passedPlayers: []
  });

  await roomRef.child('status').set('playing');
}

// ═══════════════════════════════════════════════════════════════
// LISTEN FOR GAME STATE
// ═══════════════════════════════════════════════════════════════
function listenForGame() {
  gameRef = roomRef.child('game');
  const unsub = gameRef.on('value', (snap) => {
    gs = snap.val();
    if (!gs) return;
    selected.clear();
    renderGame();
    startTurnCountdown();

    if (gs.gameOver) {
      showGameOver();
    } else {
      // New game started — auto-hide the overlay
      document.getElementById('mp-overlay').classList.add('hidden');
    }
  });
  listeners.push(() => gameRef.off('value', unsub));
}

// ═══════════════════════════════════════════════════════════════
// RENDER GAME
// ═══════════════════════════════════════════════════════════════
function renderGame() {
  if (!gs) return;

  // Determine seat positions relative to player
  // mySeat = bottom, (mySeat+2)%4 = top, (mySeat+1)%4 = right, (mySeat+3)%4 = left
  const topSeat = (mySeat + 2) % 4;
  const rightSeat = (mySeat + 1) % 4;
  const leftSeat = (mySeat + 3) % 4;

  const names = gs.names || {};
  const finishOrder = gs.finishOrder || [];
  const activeSeats = gs.activeSeats || [0,1,2,3];

  // Labels
  function labelText(seat) {
    if (!activeSeats.includes(seat)) return 'Empty';
    let name = names[seat] || ('Player ' + (seat + 1));
    const pos = finishOrder.indexOf(seat);
    if (pos >= 0) name += [' 🥇',' 🥈',' 🥉',' 4th'][pos];
    return name;
  }

  document.getElementById('mp-lbl-top').textContent = labelText(topSeat);
  document.getElementById('mp-lbl-left').textContent = labelText(leftSeat);
  document.getElementById('mp-lbl-right').textContent = labelText(rightSeat);
  document.getElementById('mp-lbl-you').textContent = labelText(mySeat) + ' (You)';

  // Active player markers
  ['mp-lbl-top','mp-lbl-left','mp-lbl-right','mp-lbl-you'].forEach((id, i) => {
    const seat = [topSeat, leftSeat, rightSeat, mySeat][i];
    const el = document.getElementById(id);
    el.classList.toggle('mp-active', gs.current === seat && !finishOrder.includes(seat));
    el.classList.toggle('mp-finished', finishOrder.includes(seat));
  });

  // Show/hide opponent zones based on active seats
  document.getElementById('mp-hand-top').parentElement.style.display = activeSeats.includes(topSeat) ? '' : 'none';
  document.getElementById('mp-hand-left').parentElement.style.display = activeSeats.includes(leftSeat) ? '' : 'none';
  document.getElementById('mp-hand-right').parentElement.style.display = activeSeats.includes(rightSeat) ? '' : 'none';

  // Render opponent hands (face down)
  renderOpponentHand('mp-hand-top', topSeat);
  renderOpponentHand('mp-hand-left', leftSeat);
  renderOpponentHand('mp-hand-right', rightSeat);

  // Render your hand (face up)
  renderMyHand();

  // Render played cards
  renderPlayedCards();

  // Message
  document.getElementById('mp-msg').textContent = gs.message || '';
  document.getElementById('mp-whose-play').textContent = gs.current !== undefined ?
    (gs.current === mySeat ? '⏳ Your turn!' : '⏳ ' + (names[gs.current] || 'Player') + "'s turn") : '';

  // Scoreboard — only show active players
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('mp-sc-' + i);
    if (activeSeats.includes(i)) {
      el.style.display = '';
      el.innerHTML = (names[i] || 'P'+(i+1)) + ' <span>' + (gs.scores?.[i] || 0) + '</span>';
    } else {
      el.style.display = 'none';
    }
  }

  // Enable/disable buttons
  // If it's your turn (gs.current === mySeat), you can always play
  // passedPlayers only prevents PASSING again, not playing when assigned your turn
  const passedList = gs.passedPlayers || [];
  const isMyTurn = gs.current === mySeat && !gs.gameOver && !finishOrder.includes(mySeat);
  document.getElementById('mp-btn-play').disabled = !isMyTurn;
  // Can't pass if: not your turn, free play, or already passed this round
  const canPass = isMyTurn && gs.lastPlayed && gs.lastPlayed.length > 0 && gs.lastPlayer !== mySeat && !passedList.includes(mySeat);
  document.getElementById('mp-btn-pass').disabled = !canPass;

  // Grey out cards when you've passed this round (but only if it's NOT your turn as free play)
  const amPassed = passedList.includes(mySeat) && gs.current !== mySeat && !gs.gameOver;
  document.getElementById('mp-your-hand').style.opacity = amPassed ? '0.5' : '1';
}

function renderOpponentHand(containerId, seat) {
  const el = document.getElementById(containerId);
  const hand = gs.hands?.[seat] || [];
  el.innerHTML = '';
  for (let i = 0; i < hand.length; i++) {
    const card = document.createElement('div');
    card.className = 'card-sm';
    el.appendChild(card);
  }
}

function renderMyHand() {
  const el = document.getElementById('mp-your-hand');
  const hand = gs.hands?.[mySeat] || [];
  el.innerHTML = '';

  hand.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = 'card' + (selected.has(idx) ? ' selected' : '');
    const isRed = RED_SUITS.has(c.suit);
    card.innerHTML = `
      <div class="card-face ${isRed ? 'red' : 'black'}">
        <div><span class="rank">${c.rank}</span><span class="suit">${c.suit}</span></div>
        <span class="center-suit">${c.suit}</span>
        <div class="bottom"><span class="rank">${c.rank}</span><span class="suit">${c.suit}</span></div>
      </div>`;
    card.onclick = () => toggleSelect(idx);
    el.appendChild(card);
  });
}

function renderPlayedCards() {
  const el = document.getElementById('mp-played-cards');
  const cards = gs.lastPlayed || [];
  el.innerHTML = '';
  cards.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cursor = 'default';
    const isRed = RED_SUITS.has(c.suit);
    card.innerHTML = `
      <div class="card-face ${isRed ? 'red' : 'black'}">
        <div><span class="rank">${c.rank}</span><span class="suit">${c.suit}</span></div>
        <span class="center-suit">${c.suit}</span>
        <div class="bottom"><span class="rank">${c.rank}</span><span class="suit">${c.suit}</span></div>
      </div>`;
    el.appendChild(card);
  });
}

function toggleSelect(idx) {
  if (gs.current !== mySeat || gs.gameOver) return;
  if (selected.has(idx)) selected.delete(idx);
  else selected.add(idx);
  SFX.play('play');
  renderMyHand();
}

// ═══════════════════════════════════════════════════════════════
// PLAY CARDS / PASS
// ═══════════════════════════════════════════════════════════════
async function mpPlaySelected() {
  if (gs.current !== mySeat || gs.gameOver) return;

  const hand = gs.hands[mySeat];
  const cards = [...selected].map(i => hand[i]);

  if (cards.length === 0) { SFX.play('error'); return; }

  const combo = classify(cards);
  if (!combo) {
    SFX.play('error');
    document.getElementById('mp-msg').textContent = 'Invalid combo!';
    return;
  }

  const lastPlayed = gs.lastPlayed || [];
  const isFreePlay = lastPlayed.length === 0 || gs.lastPlayer === mySeat;

  if (!isFreePlay && !beats(combo, lastPlayed)) {
    SFX.play('error');
    document.getElementById('mp-msg').textContent = 'Must beat the current cards!';
    return;
  }

  SFX.play('play');

  // Remove played cards from hand
  const newHand = hand.filter((_, i) => !selected.has(i));
  const finishOrder = [...(gs.finishOrder || [])];
  const names = gs.names || {};

  // Check if player finished
  let finished = false;
  if (newHand.length === 0) {
    finishOrder.push(mySeat);
    finished = true;
  }

  // Determine next player
  const activeSeats = gs.activeSeats || [0,1,2,3];
  // When someone plays a card, passedPlayers stays the same (round continues)
  // BUT if the player finished, clear passes — it's a new situation
  let currentPassedList = [...(gs.passedPlayers || [])];
  if (finished) {
    currentPassedList = []; // player finished, reset round
  }
  let next = findNextPlayer(mySeat, finishOrder, activeSeats, currentPassedList);

  // If next player is the lastPlayer (came full circle), clear passes — new round
  if (next === mySeat && !finished) {
    // Shouldn't happen, but safety
    currentPassedList = [];
    next = findNextPlayer(mySeat, finishOrder, activeSeats, currentPassedList);
  }

  // Check game over (all but 1 active player finished)
  const gameOver = finishOrder.length >= activeSeats.length - 1;
  if (gameOver) {
    // Add last remaining player
    for (const s of activeSeats) {
      if (!finishOrder.includes(s)) { finishOrder.push(s); break; }
    }
  }

  // Calculate message
  let message = (names[mySeat] || 'Player') + ' played ' + cards.map(c => c.rank + c.suit).join(' ');
  if (finished) message += ' — FINISHED! 🎉';

  // Build update
  const update = {
    ['hands/' + mySeat]: newHand,
    current: gameOver ? -1 : next,
    lastPlayed: cards,
    lastPlayer: mySeat,
    passCount: 0,
    passedPlayers: currentPassedList,
    finishOrder: finishOrder,
    gameOver: gameOver,
    message: message,
    turnStartedAt: firebase.database.ServerValue.TIMESTAMP
  };

  // If game over, calculate scores based on player count
  if (gameOver) {
    const scores = [...(gs.scores || [0,0,0,0])];
    const numPlayers = activeSeats.length;
    // Dynamic scoring: winner gets most, loser gets 0
    // 2 players: [1, 0]
    // 3 players: [2, 1, 0]
    // 4 players: [3, 2, 1, 0]
    for (let i = 0; i < finishOrder.length; i++) {
      scores[finishOrder[i]] += Math.max(numPlayers - 1 - i, 0);
    }
    update.scores = scores;
  }

  selected.clear();
  await gameRef.update(update);
}

async function mpPass() {
  const passedList = gs.passedPlayers || [];
  if (gs.current !== mySeat || gs.gameOver || passedList.includes(mySeat)) return;
  SFX.play('pass');

  const finishOrder = gs.finishOrder || [];
  const names = gs.names || {};
  const activeSeats = gs.activeSeats || [0,1,2,3];
  const newPassedPlayers = [...passedList, mySeat]; // add me to passed list

  // Count players who are alive, not finished, and haven't passed
  const alivePlayers = activeSeats.filter(s => {
    const hand = gs.hands[s] || [];
    return hand.length > 0 && !finishOrder.includes(s);
  });
  const activePlayers = alivePlayers.filter(s => !newPassedPlayers.includes(s));

  // If only 1 active player left → round ends, new round starts
  if (activePlayers.length <= 1) {
    const roundWinner = activePlayers[0] !== undefined ? activePlayers[0] : gs.lastPlayer;
    const update = {
      current: roundWinner,
      lastPlayed: [],
      lastPlayer: -1,
      passCount: 0,
      passedPlayers: [], // everyone unlocked for new round
      message: (names[roundWinner] || 'Player') + "'s free turn",
      turnStartedAt: firebase.database.ServerValue.TIMESTAMP
    };
    await gameRef.update(update);
    return;
  }

  // Find next player (skip passed and finished)
  let next = findNextPlayer(mySeat, finishOrder, activeSeats, newPassedPlayers);

  const update = {
    current: next,
    passCount: (gs.passCount || 0) + 1,
    passedPlayers: newPassedPlayers,
    message: (names[mySeat] || 'Player') + ' passed',
    turnStartedAt: firebase.database.ServerValue.TIMESTAMP
  };

  await gameRef.update(update);
}

function findNextPlayer(currentSeat, finishOrder, activeSeats, passedList) {
  const seats = activeSeats || [0,1,2,3];
  const passed = passedList || [];
  const currentIdx = seats.indexOf(currentSeat);
  for (let i = 1; i <= seats.length; i++) {
    const nextSeat = seats[(currentIdx + i) % seats.length];
    if (!finishOrder.includes(nextSeat) && !passed.includes(nextSeat)) return nextSeat;
  }
  // Fallback: skip only finished
  for (let i = 1; i <= seats.length; i++) {
    const nextSeat = seats[(currentIdx + i) % seats.length];
    if (!finishOrder.includes(nextSeat)) return nextSeat;
  }
  return currentSeat;
}

// ═══════════════════════════════════════════════════════════════
// TURN TIMER
// ═══════════════════════════════════════════════════════════════
function startTurnCountdown() {
  clearInterval(turnTimer);
  turnTimeLeft = TURN_TIME;

  const timerEl = document.getElementById('mp-turn-timer');
  if (gs.gameOver || gs.current === -1) {
    timerEl.innerHTML = '';
    return;
  }

  timerEl.innerHTML = `<span class="mp-timer-text" id="timer-display">${TURN_TIME}s</span>`;

  turnTimer = setInterval(() => {
    turnTimeLeft--;
    const display = document.getElementById('timer-display');
    if (!display) { clearInterval(turnTimer); return; }

    display.textContent = turnTimeLeft + 's';
    display.classList.toggle('warn', turnTimeLeft <= 15 && turnTimeLeft > 5);
    display.classList.toggle('danger', turnTimeLeft <= 5);

    // Auto-pass when timer runs out and it's my turn
    if (turnTimeLeft <= 0 && gs.current === mySeat) {
      clearInterval(turnTimer);
      mpPass();
    } else if (turnTimeLeft <= 0) {
      clearInterval(turnTimer);
    }
  }, 1000);
}

// ═══════════════════════════════════════════════════════════════
// GAME OVER
// ═══════════════════════════════════════════════════════════════
function showGameOver() {
  const overlay = document.getElementById('mp-overlay');
  overlay.classList.remove('hidden');

  const finishOrder = gs.finishOrder || [];
  const names = gs.names || {};
  const activeSeats = gs.activeSeats || [0,1,2,3];

  // Build titles based on player count
  const numPlayers = activeSeats.length;
  let titles;
  if (numPlayers === 2) {
    titles = ['🏆 Winner!', '💀 Loser'];
  } else if (numPlayers === 3) {
    titles = ['🥇 1st Place!', '🥈 2nd Place!', '💀 Last Place'];
  } else {
    titles = ['🥇 1st Place!', '🥈 2nd Place!', '🥉 3rd Place!', '💀 Last Place'];
  }

  const myPos = finishOrder.indexOf(mySeat);
  document.getElementById('mp-ov-title').textContent = myPos >= 0 ? titles[myPos] : 'Game Over';
  document.getElementById('mp-ov-msg').innerHTML = finishOrder.map((seat, i) =>
    `<div>${titles[i] || (i+1)+'th'}: <strong>${names[seat] || 'Player'}</strong></div>`
  ).join('');

  const scores = gs.scores || [0,0,0,0];
  document.getElementById('mp-ov-score').innerHTML = 'Scores: ' +
    activeSeats.map(i => `${names[i] || 'P'+(i+1)}: ${scores[i]}`).join(' | ');

  // Show new game button for host, waiting message for others
  document.getElementById('mp-btn-newgame').style.display = isHost ? 'inline-flex' : 'none';
  document.getElementById('mp-ov-waiting').style.display = isHost ? 'none' : 'block';

  if (myPos === 0) SFX.play('win');
}

async function hostNewGame() {
  if (!isHost) return;
  document.getElementById('mp-overlay').classList.add('hidden');

  const snap = await playersRef.get();
  const players = snap.val();

  // Build active seats and name map
  const nameMap = {};
  const activeSeats = [];
  Object.values(players).forEach(p => {
    nameMap[p.seat] = p.name;
    activeSeats.push(p.seat);
  });
  activeSeats.sort((a, b) => a - b);

  const deck = makeDeck();
  const hands = [[], [], [], []];
  let cardIdx = 0;
  for (let i = 0; i < 13; i++) {
    for (const seat of activeSeats) {
      hands[seat].push(deck[cardIdx++]);
    }
  }
  for (const seat of activeSeats) hands[seat] = sortHand(hands[seat]);

  let starter = activeSeats[0];
  for (const seat of activeSeats) {
    if (hands[seat].some(c => c.rank === '3' && c.suit === '♠')) { starter = seat; break; }
  }

  const scores = gs.scores || [0,0,0,0];

  await gameRef.set({
    hands: hands,
    current: starter,
    lastPlayed: [],
    lastPlayer: -1,
    passCount: 0,
    finishOrder: [],
    scores: scores,
    wallets: gs.wallets || [1000,1000,1000,1000],
    betAmount: gs.betAmount || 100,
    gameOver: false,
    message: nameMap[starter] + ' starts (has 3♠)',
    turnStartedAt: firebase.database.ServerValue.TIMESTAMP,
    names: nameMap,
    activeSeats: activeSeats,
    passedPlayers: []
  });
}

// ═══════════════════════════════════════════════════════════════
// PIXEL STARS (same as main game)
// ═══════════════════════════════════════════════════════════════
function generatePixelStars(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.className = 'pixel-star';
    const size = Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1;
    star.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random()*100}%; left:${Math.random()*100}%;
      --dur:${1.5 + Math.random()*3}s;
      animation-delay:${Math.random()*3}s;
    `;
    container.appendChild(star);
  }
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  generatePixelStars('pixel-stars');
  generatePixelStars('pixel-stars-2');

  // Restore nickname
  if (playerName) {
    document.getElementById('nickname-input').value = playerName;
  }
});

// ── MUTE TOGGLE ────────────────────────────────────────────
let isMuted = false;
let originalSFXPlay = SFX.play.bind(SFX);

function toggleMute(){
  isMuted = !isMuted;
  const btn = document.getElementById('mute-btn');
  if(isMuted){
    SFX.play = () => {};
    btn.textContent = '🔇';
    btn.classList.add('muted');
  } else {
    SFX.play = originalSFXPlay;
    btn.textContent = '🔊';
    btn.classList.remove('muted');
  }
}

function toggleRules(){
  document.getElementById('rules-panel').classList.toggle('hidden');
}
