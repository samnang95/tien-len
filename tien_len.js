// ── SOUND SYSTEM (Web Audio API) ───────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getCtx(){ if(!audioCtx) audioCtx = new AudioCtx(); return audioCtx; }

const SFX = {
  // Card select click
  click(){
    const ctx=getCtx(), t=ctx.currentTime;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(1200,t); o.frequency.exponentialRampToValueAtTime(800,t+0.06);
    g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.08);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.08);
  },

  // Card deselect
  deselect(){
    const ctx=getCtx(), t=ctx.currentTime;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(800,t); o.frequency.exponentialRampToValueAtTime(500,t+0.06);
    g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.06);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.06);
  },

  // Play cards (slam down)
  play(){
    const ctx=getCtx(), t=ctx.currentTime;
    // Thud noise
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.15,ctx.sampleRate);
    const data=buf.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*0.03));
    const src=ctx.createBufferSource(); src.buffer=buf;
    const flt=ctx.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=600;
    const g=ctx.createGain(); g.gain.setValueAtTime(0.35,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.15);
    src.connect(flt); flt.connect(g); g.connect(ctx.destination); src.start(t);
    // Snap tone
    const o=ctx.createOscillator(), g2=ctx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(300,t); o.frequency.exponentialRampToValueAtTime(100,t+0.08);
    g2.gain.setValueAtTime(0.15,t); g2.gain.exponentialRampToValueAtTime(0.001,t+0.1);
    o.connect(g2); g2.connect(ctx.destination); o.start(t); o.stop(t+0.1);
  },

  // AI plays cards (softer version)
  aiPlay(){
    const ctx=getCtx(), t=ctx.currentTime;
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.1,ctx.sampleRate);
    const data=buf.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*0.02));
    const src=ctx.createBufferSource(); src.buffer=buf;
    const flt=ctx.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=500;
    const g=ctx.createGain(); g.gain.setValueAtTime(0.18,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.1);
    src.connect(flt); flt.connect(g); g.connect(ctx.destination); src.start(t);
  },

  // Pass
  pass(){
    const ctx=getCtx(), t=ctx.currentTime;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(500,t); o.frequency.exponentialRampToValueAtTime(300,t+0.15);
    g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.15);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.15);
  },

  // Invalid move
  error(){
    const ctx=getCtx(), t=ctx.currentTime;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='square'; o.frequency.setValueAtTime(200,t); o.frequency.setValueAtTime(150,t+0.1);
    g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.25);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.25);
  },

  // Win fanfare
  win(){
    const ctx=getCtx(), t=ctx.currentTime;
    const notes=[523,659,784,1047]; // C5 E5 G5 C6
    notes.forEach((f,i)=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='triangle';
      o.frequency.setValueAtTime(f,t+i*0.12);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.2,t+i*0.12);
      g.gain.setValueAtTime(0.2,t+i*0.12); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.35);
      o.connect(g); g.connect(ctx.destination); o.start(t+i*0.12); o.stop(t+i*0.12+0.35);
    });
  },

  // Lose sound
  lose(){
    const ctx=getCtx(), t=ctx.currentTime;
    const notes=[400,350,280,200];
    notes.forEach((f,i)=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(f,t+i*0.15);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.12,t+i*0.15);
      g.gain.setValueAtTime(0.12,t+i*0.15); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.15+0.3);
      o.connect(g); g.connect(ctx.destination); o.start(t+i*0.15); o.stop(t+i*0.15+0.3);
    });
  },

  // Deal / new game
  deal(){
    const ctx=getCtx(), t=ctx.currentTime;
    for(let i=0;i<6;i++){
      const buf=ctx.createBuffer(1,ctx.sampleRate*0.04,ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let j=0;j<data.length;j++) data[j]=(Math.random()*2-1)*Math.exp(-j/(ctx.sampleRate*0.008));
      const src=ctx.createBufferSource(); src.buffer=buf;
      const flt=ctx.createBiquadFilter(); flt.type='highpass'; flt.frequency.value=800;
      const g=ctx.createGain(); g.gain.setValueAtTime(0.1,t+i*0.06); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.06+0.04);
      src.connect(flt); flt.connect(g); g.connect(ctx.destination); src.start(t+i*0.06);
    }
  },

  // Bomb (four of a kind)
  bomb(){
    const ctx=getCtx(), t=ctx.currentTime;
    // Explosion rumble
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.5,ctx.sampleRate);
    const data=buf.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*0.12));
    const src=ctx.createBufferSource(); src.buffer=buf;
    const flt=ctx.createBiquadFilter(); flt.type='lowpass'; flt.frequency.setValueAtTime(400,t); flt.frequency.exponentialRampToValueAtTime(80,t+0.4);
    const g=ctx.createGain(); g.gain.setValueAtTime(0.4,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.5);
    src.connect(flt); flt.connect(g); g.connect(ctx.destination); src.start(t);
    // Impact tone
    const o=ctx.createOscillator(), g2=ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(30,t+0.3);
    g2.gain.setValueAtTime(0.2,t); g2.gain.exponentialRampToValueAtTime(0.001,t+0.35);
    o.connect(g2); g2.connect(ctx.destination); o.start(t); o.stop(t+0.35);
  }
};

// ── CONSTANTS ──────────────────────────────────────────────
const SUITS = ['♠','♣','♦','♥'];
const RANKS = ['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
const SUIT_VAL = {'♠':0,'♣':1,'♦':2,'♥':3};
const RANK_VAL = {};
RANKS.forEach((r,i) => RANK_VAL[r] = i);
const TWO_CUT_PENALTY = {'♠': 10, '♣': 20, '♦': 30, '♥': 40};

function cardValue(c){ return RANK_VAL[c.rank]*4 + SUIT_VAL[c.suit]; }
function sortHand(h){ h.sort((a,b) => cardValue(a)-cardValue(b)); }

// ── CUT 2 PENALTY ─────────────────────────────────────────
// When a 2 is beaten ("cut"), money transfers based on suit
function applyCutTwoPenalty(cuttingPlayer, cutCards, cutPlayer) {
  if (cutPlayer < 0) return;
  let totalPenalty = 0;
  const details = [];
  cutCards.forEach(c => {
    if (c.rank === '2') {
      const penalty = TWO_CUT_PENALTY[c.suit];
      totalPenalty += penalty;
      details.push('2' + c.suit + ' ($' + penalty + ')');
    }
  });
  if (totalPenalty > 0) {
    wallets[cuttingPlayer] += totalPenalty;
    wallets[cutPlayer] -= totalPenalty;
    updateWallets();
    const cutterName = cuttingPlayer === 0 ? 'You' : 'CPU ' + cuttingPlayer;
    const loserName = cutPlayer === 0 ? 'You' : 'CPU ' + cutPlayer;
    setMsg('🐷 ' + cutterName + ' cut ' + details.join(', ') + '! ' + loserName + ' -$' + totalPenalty);
  }
}

function createDeck(){
  const d=[];
  for(const s of SUITS) for(const r of RANKS) d.push({rank:r,suit:s});
  for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]; }
  return d;
}

// ── STATE ──────────────────────────────────────────────────
let hands=[[],[],[],[]];
let current=0;
let lastPlayed=[];
let lastPlayer=-1;
let passCount=0;
let passedPlayers = new Set(); // players who passed — locked out until new round
let selected=[];
let scores=[0,0,0,0];
let gameOver=false;
let betAmount=100;
let wallets=[1000,1000,1000,1000]; // 0=you, 1-3=cpu
let finishOrder=[]; // tracks order players empty their hands
const RANK_REWARDS=[30, 15, -15, -30]; // 1st, 2nd, 3rd, 4th

// ── TIMER ─────────────────────────────────────────────────
// Timer disabled for Room 1 — no time limit for human player
let turnTimer = null;
let turnTimeLeft = 0;
let aiActionTimer = null;

function startTurnTimer(){
  // No timer in Room 1 — just show whose turn it is
  const el = document.getElementById('turn-timer');
  if(current === 0){
    el.innerHTML = `<span class="timer-label">YOUR TURN</span>`;
  } else {
    el.innerHTML = `<span class="timer-label">CPU ${current} THINKING</span>`;
  }
}

function clearTurnTimer(){
  if(turnTimer){ clearInterval(turnTimer); turnTimer=null; }
  if(aiActionTimer){ clearTimeout(aiActionTimer); aiActionTimer=null; }
}

function hideTimer(){
  clearTurnTimer();
  document.getElementById('turn-timer').innerHTML = '';
}

function onTimerExpired(){
  // No timer expiry in Room 1
}

// ── INIT ───────────────────────────────────────────────────
function newGame(){
  document.getElementById('overlay').classList.add('hidden');
  gameOver=false; selected=[]; finishOrder=[];
  passedPlayers.clear();
  hideTimer();
  const deck=createDeck();
  hands=[[],[],[],[]];
  for(let i=0;i<52;i++) hands[i%4].push(deck[i]);
  hands.forEach(h=>sortHand(h));
  lastPlayed=[]; lastPlayer=-1; passCount=0;
  current=0;
  for(let p=0;p<4;p++){
    if(hands[p].some(c=>c.rank==='3'&&c.suit==='♠')){ current=p; break; }
  }
  setMsg('');
  SFX.deal();
  render();
  if(current!==0) scheduleAiTurn();
  else { setMsg('Your turn — you have 3♠, lead freely!'); startTurnTimer(); }
}

// ── RENDER ─────────────────────────────────────────────────
function render(){
  const yh=document.getElementById('your-hand');
  yh.innerHTML='';
  hands[0].forEach((c,i)=>{
    const el=makeCardEl(c);
    el.onclick=()=>toggleSelect(i);
    if(selected.includes(i)) el.classList.add('selected');
    yh.appendChild(el);
  });

  for(let p=1;p<=3;p++){
    const el=document.getElementById('hand-cpu'+p);
    el.innerHTML='';
    // Show cards face-up for 4th place player when game ends
    const showCards = gameOver && hands[p].length > 0;
    hands[p].forEach(c=>{
      if(showCards){
        const cardEl=makeCardEl(c);
        cardEl.style.width='50px'; cardEl.style.height='72px';
        cardEl.style.fontSize='0.75rem';
        cardEl.style.cursor='default';
        el.appendChild(cardEl);
      } else {
        const d=document.createElement('div');
        d.className='card-sm'; el.appendChild(d);
      }
    });
  }

  ['you','cpu1','cpu2','cpu3'].forEach((id,i)=>{
    const el=document.getElementById('lbl-'+id);
    el.className='player-label'+(current===i?' active-player':'');
    let name=id==='you'?'YOU':'CPU '+id.slice(3);
    if(hands[i].length===0) name+=' ✓';
    el.textContent=name;
  });

  const pa=document.getElementById('played-cards');
  pa.innerHTML='';
  lastPlayed.forEach(c=>{ pa.appendChild(makeCardEl(c)); });

  const wp=document.getElementById('whose-play');
  if(lastPlayed.length>0){
    const who=lastPlayer===0?'You':('CPU '+lastPlayer);
    const ctype=classify(lastPlayed);
    wp.textContent=who+' played '+(ctype?ctype.label:'');
  } else {
    wp.textContent='';
  }

  const myTurn=current===0&&!gameOver&&!passedPlayers.has(0);
  document.getElementById('btn-play').disabled=!myTurn;
  document.getElementById('btn-pass').disabled=!myTurn||lastPlayed.length===0;

  // Grey out cards when you've passed this round
  document.getElementById('your-hand').style.opacity = (passedPlayers.has(0) && !gameOver) ? '0.5' : '1';
}

function makeCardEl(c, size=''){
  const div=document.createElement('div');
  div.className='card';
  if(size==='small'){ div.style.width='50px'; div.style.height='72px'; }
  const isRed=c.suit==='♥'||c.suit==='♦';
  div.innerHTML=`<div class="card-face ${isRed?'red':'black'}">
    <div><div class="rank">${c.rank}</div><div class="suit">${c.suit}</div></div>
    <div class="center-suit">${c.suit}</div>
    <div class="bottom"><div class="rank">${c.rank}</div><div class="suit">${c.suit}</div></div>
  </div>`;
  return div;
}

// ── SELECT ─────────────────────────────────────────────────
function toggleSelect(i){
  if(current!==0||gameOver||passedPlayers.has(0)) return;
  const idx=selected.indexOf(i);
  if(idx>=0){ selected.splice(idx,1); SFX.deselect(); }
  else { selected.push(i); SFX.click(); }
  render();
}

// ── PLAY ───────────────────────────────────────────────────
function playSelected(){
  if(current!==0||gameOver||selected.length===0||passedPlayers.has(0)) return;
  clearTurnTimer();
  const cards=selected.map(i=>hands[0][i]);
  const combo=classify(cards);
  if(!combo){ SFX.error(); setMsg('❌ Invalid combination'); startTurnTimer(); return; }
  if(lastPlayed.length>0){
    if(!beats(combo, lastPlayed)){ SFX.error(); setMsg('❌ Cannot beat the last play'); startTurnTimer(); return; }
  }
  if(lastPlayed.length>0) applyCutTwoPenalty(0, lastPlayed, lastPlayer);
  if(combo.type==='quad') SFX.bomb(); else SFX.play();
  selected.sort((a,b)=>b-a).forEach(i=>hands[0].splice(i,1));
  selected=[];
  lastPlayed=cards; lastPlayer=0; passCount=0;
  setMsg('');
  if(hands[0].length===0){
    if(!finishOrder.includes(0)) finishOrder.push(0);
    if(finishOrder.length>=3){ hideTimer(); render(); endGame(); return; }
  }
  current=nextAlive((0+1)%4); render();
  if(current!==0) scheduleAiTurn();
  else { setMsg('Your turn!'); startTurnTimer(); }
}

function pass(){
  if(current!==0||lastPlayed.length===0||gameOver||passedPlayers.has(0)) return;
  clearTurnTimer();
  SFX.pass();
  passCount++;
  passedPlayers.add(0); // locked out until new round
  setMsg('You passed — waiting for new round...');
  advanceAfterPass();
}

function nextAlive(from){
  let n=from%4;
  let attempts=0;
  while((hands[n].length===0 || passedPlayers.has(n)) && attempts<4){
    n=(n+1)%4;
    attempts++;
  }
  return n;
}

function advanceAfterPass(){
  // Count players who are alive AND haven't passed
  const alivePlayers = [0,1,2,3].filter(p => hands[p].length > 0);
  const activePlayers = alivePlayers.filter(p => !passedPlayers.has(p));

  // If only 1 active player left → they won the round, NEW ROUND starts
  if(activePlayers.length <= 1){
    const roundWinner = activePlayers[0] !== undefined ? activePlayers[0] : lastPlayer;
    passCount=0; lastPlayed=[]; lastPlayer=-1;
    passedPlayers.clear(); // ← ONLY here: everyone unlocked for new round
    current = roundWinner;
    const winner = roundWinner===0 ? 'Your' : ('CPU '+roundWinner);
    render();
    if(current!==0){ setMsg(winner+' leads freely!'); scheduleAiTurn(); }
    else { setMsg('Your turn — lead freely!'); startTurnTimer(); }
    return;
  }

  const next=nextAlive((current+1)%4);
  current=next;
  render();
  if(current!==0) scheduleAiTurn();
  else {
    if(lastPlayed.length===0) setMsg('Your turn — lead freely!');
    else setMsg('Your turn!');
    startTurnTimer();
  }
}

// ── AI ─────────────────────────────────────────────────────
function scheduleAiTurn(){
  startTurnTimer();
  // AI acts after random 2-5 seconds within the 10s window
  const delay = 2000 + Math.floor(Math.random() * 3000);
  aiActionTimer = setTimeout(aiTurn, delay);
}

function aiTurn(){
  if(gameOver) return;
  clearTurnTimer();
  const p=current;
  if(hands[p].length===0){ current=nextAlive((p+1)%4); render(); if(current!==0) scheduleAiTurn(); else { startTurnTimer(); } return; }

  let played = lastPlayed.length===0 ? aiLead(p) : aiRespond(p, lastPlayed);

  if(played){
    if(lastPlayed.length>0) applyCutTwoPenalty(p, lastPlayed, lastPlayer);
    const aiCombo=classify(played);
    if(aiCombo&&aiCombo.type==='quad') SFX.bomb(); else SFX.aiPlay();
    played.forEach(pc=>{ const idx=hands[p].findIndex(x=>x===pc); if(idx>=0) hands[p].splice(idx,1); });
    lastPlayed=played; lastPlayer=p; passCount=0;
    setMsg('');
    if(hands[p].length===0){
      if(!finishOrder.includes(p)) finishOrder.push(p);
      if(finishOrder.length>=3){ hideTimer(); render(); endGame(); return; }
    }
    current=nextAlive((p+1)%4); render();
    if(current!==0) scheduleAiTurn();
    else { setMsg('Your turn!'); startTurnTimer(); }
  } else {
    SFX.pass();
    setMsg('CPU '+p+' passed.');
    passCount++;
    passedPlayers.add(p); // CPU locked out until new round
    advanceAfterPass();
  }
}

function aiLead(p){
  const hand=hands[p];
  const all=getAllValidCombos(hand);
  if(hand.length<=3) return all.sort((a,b)=>b.length-a.length)[0]||[hand[0]];

  function scoreCombo(cards){
    const c=classify(cards);
    if(!c) return -999;
    let s=cards.length*10;
    if(cards.some(x=>x.rank==='2')) s-=25;
    s-=c.highVal*0.4;
    if(c.type==='pair') s+=5;
    if(c.type==='triple') s+=8;
    if(c.type==='pairseq') s+=c.len*6;
    if(c.type==='straight') s+=c.len*4;
    if(c.type==='quad') s-=40;
    return s;
  }
  all.sort((a,b)=>scoreCombo(b)-scoreCombo(a));
  return all[0]||[hand[0]];
}

function aiRespond(p, lp){
  const hand=hands[p];
  const all=getAllValidCombos(hand);
  const beaters=all.filter(cards=>{ const c=classify(cards); return c&&beats(c,lp); });
  if(beaters.length===0) return null;

  const lastHandSize=lastPlayer>=0?hands[lastPlayer].length:99;
  const urgent=lastHandSize<=3;

  const bombs=beaters.filter(c=>classify(c)?.type==='quad');
  const normal=beaters.filter(c=>classify(c)?.type!=='quad');

  function scoreBeater(cards){
    const c=classify(cards);
    let s=0;
    s-=c.highVal;
    s+=cards.length*2;
    if(cards.some(x=>x.rank==='2')) s-=15;
    if(urgent) s+=c.highVal*0.4;
    return s;
  }

  if(normal.length>0){
    normal.sort((a,b)=>scoreBeater(b)-scoreBeater(a));
    return normal[0];
  }
  if(bombs.length>0) return bombs[0];
  return null;
}

function getAllValidCombos(hand){
  const results=[];
  hand.forEach(c=>results.push([c]));
  for(let sz=2;sz<=4;sz++){
    getCombos(hand,sz).forEach(combo=>{ if(classify(combo)) results.push(combo); });
  }
  for(let len=3;len<=hand.length;len++){
    getCombos(hand,len).forEach(combo=>{
      const c=classify(combo);
      if(c&&(c.type==='straight'||c.type==='pairseq')) results.push(combo);
    });
  }
  return results;
}

// ── COMBO LOGIC ────────────────────────────────────────────
/*
  Types: single, pair, triple, quad, straight, pairseq
  pairseq = consecutive pairs (3+ pairs), e.g. 3-3,4-4,5-5
  Bombs: quad beats everything; pairseq of 3+ beats a single 2
*/
function classify(cards){
  const n=cards.length;
  if(n===0) return null;
  const sorted=cards.slice().sort((a,b)=>cardValue(a)-cardValue(b));
  const ranks=sorted.map(c=>c.rank);
  const rvals=sorted.map(c=>RANK_VAL[c.rank]);
  const uniqRanks=[...new Set(ranks)];
  const highVal=cardValue(sorted[n-1]);

  // Single
  if(n===1) return {type:'single', highVal, label:'single'};

  // Pair
  if(n===2&&uniqRanks.length===1)
    return {type:'pair', highVal, label:'pair of '+ranks[0]};

  // Triple
  if(n===3&&uniqRanks.length===1)
    return {type:'triple', highVal, label:'triple '+ranks[0]};

  // Four of a kind (bomb)
  if(n===4&&uniqRanks.length===1)
    return {type:'quad', highVal, label:'BOMB (four '+ranks[0]+'s)'};

  // Straight: 3+ consecutive ranks, no 2s
  if(n>=3&&n%2!==0||n>=3){
    if(!rvals.includes(12)){
      const uniqRV=[...new Set(rvals)].sort((a,b)=>a-b);
      if(uniqRV.length===n){
        const consecutive=uniqRV.every((v,i)=>i===0||v===uniqRV[i-1]+1);
        if(consecutive)
          return {type:'straight', len:n, highVal, label:n+'-card straight'};
      }
    }
  }

  // Pair sequence: must be even count ≥6 (3 pairs), consecutive ranks, no 2s
  if(n>=6&&n%2===0){
    const pairCount=n/2;
    if(!rvals.includes(12)){
      // Group by rank
      const rankGroups={};
      sorted.forEach(c=>{ rankGroups[c.rank]=(rankGroups[c.rank]||[]).concat(c); });
      const groupRanks=Object.keys(rankGroups);
      if(groupRanks.length===pairCount && groupRanks.every(r=>rankGroups[r].length===2)){
        const gRvals=groupRanks.map(r=>RANK_VAL[r]).sort((a,b)=>a-b);
        const consec=gRvals.every((v,i)=>i===0||v===gRvals[i-1]+1);
        if(consec)
          return {type:'pairseq', len:pairCount, highVal, label:pairCount+'-pair sequence'};
      }
    }
  }

  return null;
}

function beats(combo, prevCards){
  const prev=classify(prevCards);
  if(!prev) return true;

  // Quad (bomb) beats everything except a higher quad
  if(combo.type==='quad'){
    if(prev.type==='quad') return combo.highVal>prev.highVal;
    return true; // bomb beats all
  }

  // Pair sequence of 3+ pairs can chop a single 2
  if(combo.type==='pairseq'&&combo.len>=3&&prev.type==='single'&&prevCards[0].rank==='2')
    return true;

  // Must match type
  if(combo.type!==prev.type) return false;

  // Straight: must match length
  if(combo.type==='straight'&&combo.len!==prev.len) return false;

  // Pair seq: must match number of pairs
  if(combo.type==='pairseq'&&combo.len!==prev.len) return false;

  return combo.highVal>prev.highVal;
}

function getCombos(arr,k){
  const result=[];
  function bt(start,cur){
    if(cur.length===k){ result.push([...cur]); return; }
    for(let i=start;i<=arr.length-(k-cur.length);i++){
      cur.push(arr[i]); bt(i+1,cur); cur.pop();
    }
  }
  bt(0,[]);
  return result;
}

// ── END GAME ───────────────────────────────────────────────
function endGame(){
  gameOver=true;

  // Determine 4th place: the player not in finishOrder
  for(let p=0;p<4;p++){
    if(!finishOrder.includes(p)) finishOrder.push(p);
  }

  const winner=finishOrder[0];
  if(winner===0) SFX.win(); else SFX.lose();
  scores[winner]++;

  // Apply ranking rewards: 1st +$30, 2nd +$15, 3rd -$15, 4th -$30
  const rankLabels=['1st','2nd','3rd','4th'];
  const rankDetails=[];
  for(let i=0;i<4;i++){
    const p=finishOrder[i];
    wallets[p]+=RANK_REWARDS[i];
    const name=p===0?'You':'CPU '+p;
    const reward=RANK_REWARDS[i];
    rankDetails.push(rankLabels[i]+' '+name+': '+(reward>=0?'+$'+reward:'-$'+Math.abs(reward)));
  }

  // 4th place penalty for holding 2s
  const loserPlayer = finishOrder[3];
  const loserCards = hands[loserPlayer];
  let twoPenalty = 0;
  const twoPenaltyDetails = [];
  loserCards.forEach(c => {
    if(c.rank === '2'){
      const penalty = TWO_CUT_PENALTY[c.suit];
      twoPenalty += penalty;
      twoPenaltyDetails.push('2'+c.suit+' (-$'+penalty+')');
    }
  });
  if(twoPenalty > 0){
    wallets[loserPlayer] -= twoPenalty;
  }

  updateScores();
  updateWallets();

  const ov=document.getElementById('overlay');
  ov.classList.remove('hidden');
  document.getElementById('ov-title').textContent=winner===0?'🎉 You Win!':'CPU '+winner+' Wins!';
  document.getElementById('ov-msg').textContent=rankDetails.join('  •  ');

  const moneyEl=document.getElementById('ov-money');
  const yourRank=finishOrder.indexOf(0);
  const yourReward=RANK_REWARDS[yourRank];
  let yourTotal = yourReward;
  if(yourRank === 3) yourTotal -= twoPenalty; // if you are 4th, include 2s penalty
  if(yourTotal>=0){
    moneyEl.textContent='+$'+yourTotal+' 🤑 ('+rankLabels[yourRank]+')';
    moneyEl.className='ov-money win';
  } else {
    moneyEl.textContent='-$'+Math.abs(yourTotal)+' ('+rankLabels[yourRank]+')';
    moneyEl.className='ov-money lose';
  }

  document.getElementById('ov-wallets').textContent=
    `You $${wallets[0]}  •  CPU1 $${wallets[1]}  •  CPU2 $${wallets[2]}  •  CPU3 $${wallets[3]}`;
  document.getElementById('ov-score').textContent=
    `Wins — You ${scores[0]}  •  CPU1 ${scores[1]}  •  CPU2 ${scores[2]}  •  CPU3 ${scores[3]}`;

  // Show 4th place player's remaining cards + 2s penalty
  const loserCardsEl = document.getElementById('ov-loser-cards');
  if(loserCards.length > 0){
    const loserName = loserPlayer===0 ? 'Your' : 'CPU '+loserPlayer+"'s";
    let penaltyHtml = '';
    if(twoPenalty > 0){
      penaltyHtml = `<div class="loser-penalty">🐷 Holding 2s penalty: ${twoPenaltyDetails.join(', ')} → Total -$${twoPenalty}</div>`;
    }
    loserCardsEl.innerHTML = `<div class="loser-label">🃏 ${loserName} remaining cards (4th place):</div><div class="loser-hand"></div>${penaltyHtml}`;
    const handEl = loserCardsEl.querySelector('.loser-hand');
    loserCards.forEach(c => { handEl.appendChild(makeCardEl(c)); });
  } else {
    loserCardsEl.innerHTML = '';
  }
}

function resetScore(){
  scores=[0,0,0,0];
  wallets=[1000,1000,1000,1000];
  updateScores();
  updateWallets();
  document.getElementById('ov-money').textContent='';
  document.getElementById('ov-wallets').textContent='Wallets & scores reset!';
  document.getElementById('ov-score').textContent='';
}

function updateScores(){
  document.getElementById('sc-you').textContent=scores[0];
  document.getElementById('sc-cpu1').textContent=scores[1];
  document.getElementById('sc-cpu2').textContent=scores[2];
  document.getElementById('sc-cpu3').textContent=scores[3];
}

function updateWallets(){
  const ids=['you','cpu1','cpu2','cpu3'];
  ids.forEach((id,i)=>{
    const el=document.getElementById('wallet-'+id);
    el.textContent='$'+wallets[i];
    el.className='wallet'+(wallets[i]>1000?' gain':wallets[i]<1000?' loss':'');
  });
}

// ── BET MODAL ──────────────────────────────────────────────
function openBetModal(){
  document.getElementById('bet-input').value=betAmount;
  highlightPreset(betAmount);
  document.getElementById('bet-modal').classList.remove('hidden');
}
function closeBetModal(){
  document.getElementById('bet-modal').classList.add('hidden');
}
function selectPreset(val){
  betAmount=val;
  document.getElementById('bet-input').value=val;
  highlightPreset(val);
}
function highlightPreset(val){
  document.querySelectorAll('.bet-preset').forEach(b=>{
    b.classList.toggle('active', parseInt(b.textContent.replace('$',''))===val);
  });
}
function confirmBet(){
  const v=parseInt(document.getElementById('bet-input').value)||100;
  betAmount=Math.max(1,v);
  document.getElementById('bet-display').textContent='$'+betAmount;
  closeBetModal();
}

function setMsg(t){ document.getElementById('msg').textContent=t; }

function toggleRules(){
  document.getElementById('rules-panel').classList.toggle('hidden');
}

// ── START SCREEN ───────────────────────────────────────────

// Generate twinkling pixel stars
function generatePixelStars(){
  const container = document.getElementById('pixel-stars');
  if(!container) return;
  const count = 80;
  for(let i=0; i<count; i++){
    const star = document.createElement('div');
    star.className = 'pixel-star';
    const size = Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.setProperty('--dur', (1.5 + Math.random() * 3) + 's');
    star.style.animationDelay = (Math.random() * 3) + 's';
    // Slight color variation
    const colors = ['#ffffff', '#aaccff', '#ffe4b5', '#c5d0ff', '#ffd700'];
    star.style.background = colors[Math.floor(Math.random() * colors.length)];
    star.style.boxShadow = '0 0 ' + (size+1) + 'px ' + star.style.background;
    container.appendChild(star);
  }
}

// Play a retro "start" sound
function playStartSFX(){
  const ctx = getCtx(), t = ctx.currentTime;
  // Rising arpeggio
  const notes = [262, 330, 392, 523, 659, 784];
  notes.forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(f, t + i * 0.08);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + i * 0.08);
    g.gain.setValueAtTime(0.12, t + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
    o.connect(g); g.connect(ctx.destination);
    o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.2);
  });
}

// Transition from start screen to game room
function enterGameRoom(){
  playStartSFX();
  const startScreen = document.getElementById('start-screen');
  const gameRoom = document.getElementById('game-room');
  
  // Fade out start screen
  startScreen.classList.add('fade-out');
  
  // After animation, show game room and start game
  setTimeout(() => {
    startScreen.style.display = 'none';
    gameRoom.classList.remove('game-room-hidden');
    newGame();
  }, 800);
}

// Room 2 — Multiplayer (navigate to room2.html)
function enterRoom2(){
  playStartSFX();
  const startScreen = document.getElementById('start-screen');
  startScreen.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = 'room2.html';
  }, 800);
}

// Initialize start screen
generatePixelStars();

