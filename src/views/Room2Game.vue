<template>
  <div>
  <!-- LOBBY SCREEN -->
  <div v-if="screen === 'lobby'" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
    style="background: linear-gradient(180deg, #061a0e 0%, #0a2a16 25%, #0f3d25 45%, #1a5c38 60%, #237a4b 75%, #1a5c38 90%, #0a2a16 100%);">
    <PixelStars />
    <PixelClouds />

    <div class="lobby-panel">
      <div class="absolute -inset-0.5 rounded-[14px] border-2 pointer-events-none" style="border-color: rgba(212,168,67,0.5); animation: glowBorder 2s ease-in-out infinite alternate;"></div>
      <div class="rounded-[10px] text-center relative overflow-hidden"
        style="padding: 56px 40px; background: linear-gradient(180deg, #0a2a16 0%, #0f3d25 30%, #134a2c 60%, #0a2a16 100%);">

        <img src="/images/game_logo.png" alt="Tiến Lên" class="rounded-xl"
          style="display: block; margin: 0 auto 32px auto; width: min(140px, 40vw); filter: drop-shadow(0 0 20px rgba(212,168,67,0.4)); animation: logoFloat 3s ease-in-out infinite alternate;" />

        <h1 style="margin-bottom: 16px; font-family: 'Press Start 2P', monospace; font-size: clamp(1.2rem, 4vw, 2rem); color: #d4a843; text-shadow: 0 0 10px rgba(212,168,67,0.8), 0 0 30px rgba(212,168,67,0.4), 0 4px 0 #0a2a16; animation: titleGlow 2s ease-in-out infinite alternate;">
          MULTIPLAYER
        </h1>
        <p style="font-family: 'Press Start 2P', monospace; font-size: clamp(0.45rem, 1.5vw, 0.65rem); color: rgba(240,201,110,0.7); letter-spacing: 0.15em; margin-bottom: 36px; text-transform: uppercase;">
          Play with friends online
        </p>

        <!-- Main lobby -->
        <div v-if="lobbyView === 'main'">
          <div style="text-align: left; margin-bottom: 16px;">
            <label class="lobby-label">Your nickname</label>
            <input v-model="nickname" type="text" class="lobby-input" placeholder="Enter your name" maxlength="12" />
          </div>
          <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-top: 24px;">
            <button @click="showCreate" class="pixel-play-btn-sm orange">CREATE ROOM</button>
            <button @click="showJoin" class="pixel-play-btn-sm green">JOIN ROOM</button>
          </div>
        </div>

        <!-- Create form -->
        <div v-if="lobbyView === 'create'">
          <p class="lobby-info">Creating a new room...</p>
          <button @click="doCreateRoom" class="pixel-play-btn-sm orange">CREATE</button>
          <button @click="lobbyView = 'main'" class="lobby-back-btn">← Back</button>
        </div>

        <!-- Join form -->
        <div v-if="lobbyView === 'join'">
          <div style="text-align: left; margin-bottom: 10px;">
            <label class="lobby-label">Room Code</label>
            <input v-model="roomCodeInput" type="text" class="lobby-input" style="text-align: center; letter-spacing: 0.3em; text-transform: uppercase;" placeholder="ABC123" maxlength="6" />
          </div>
          <button @click="doJoinRoom" class="pixel-play-btn-sm green" style="margin-top: 14px;">JOIN</button>
          <button @click="lobbyView = 'main'" class="lobby-back-btn">← Back</button>
        </div>

        <div v-if="lobbyError" class="lobby-error" style="margin-top: 12px;">{{ lobbyError }}</div>

        <router-link to="/" style="display: inline-block; margin-top: 32px; color: rgba(240,201,110,0.35); font-family: 'Press Start 2P', monospace; font-size: 0.4rem; text-decoration: none; transition: color 0.15s;">← Back to Main Menu</router-link>
      </div>
      <div class="absolute inset-0 rounded-[10px] pointer-events-none z-1"
        style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);"></div>
    </div>
  </div>

  <!-- WAITING ROOM -->
  <div v-if="screen === 'waiting'" class="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden"
    style="background: linear-gradient(180deg, #061a0e 0%, #0a2a16 25%, #0f3d25 45%, #1a5c38 60%, #237a4b 75%, #1a5c38 90%, #0a2a16 100%);">
    <PixelStars />

    <div class="lobby-panel" style="width: min(560px, 92vw);">
      <div class="absolute -inset-0.5 rounded-[14px] border-2 pointer-events-none" style="border-color: rgba(212,168,67,0.5); animation: glowBorder 2s ease-in-out infinite alternate;"></div>
      <div class="rounded-[10px] text-center relative overflow-hidden"
        style="padding: 48px 30px; background: linear-gradient(180deg, #0a2a16 0%, #0f3d25 30%, #134a2c 60%, #0a2a16 100%);">

        <h2 style="font-family: 'Press Start 2P', monospace; font-size: clamp(0.7rem, 2.5vw, 1rem); color: #d4a843; text-shadow: 0 0 10px rgba(212,168,67,0.5); margin-bottom: 24px;">
          WAITING FOR PLAYERS
        </h2>

        <!-- Room code display -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; padding: 10px 20px; border-radius: 10px; border: 1px solid rgba(212,168,67,0.3); background: rgba(0,0,0,0.4);">
          <span style="font-family: 'Press Start 2P', monospace; font-size: 0.45rem; color: rgba(255,255,255,0.5);">Room Code:</span>
          <span style="font-family: 'Press Start 2P', monospace; font-size: clamp(1rem, 3vw, 1.5rem); color: #fff; letter-spacing: 0.3em; text-shadow: 0 0 10px rgba(212,168,67,0.6);">{{ roomCode }}</span>
          <button @click="copyCode" style="background: transparent; border: none; font-size: 1.125rem; cursor: pointer; opacity: 0.6; transition: opacity 0.2s;">{{ copied ? '✅' : '📋' }}</button>
        </div>

        <!-- Player slots -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px;">
          <div v-for="i in 4" :key="i" class="player-slot" :class="slotClass(i - 1)">
            <span class="slot-num" :class="{ 'bg-[#2ecc71]/30 text-[#2ecc71]': slotFilled(i - 1) }">{{ i }}</span>
            <span class="slot-name" :class="{ 'text-white': slotFilled(i - 1) }">{{ slotText(i - 1) }}</span>
          </div>
        </div>

        <p style="font-family: 'Press Start 2P', monospace; font-size: 0.45rem; color: rgba(240,201,110,0.6); margin-bottom: 20px; animation: hintBlink 2s ease-in-out infinite;">
          {{ playerCount }} player{{ playerCount !== 1 ? 's' : '' }} joined
        </p>

        <button v-if="isHost && playerCount >= 1" @click="doStartGame" class="pixel-play-btn-sm orange">
          ▶ START GAME
        </button>

        <button @click="doLeaveRoom" class="lobby-back-btn" style="margin-top: 20px;">← Leave Room</button>
      </div>
    </div>
  </div>

  <!-- GAME TABLE -->
  <div v-if="screen === 'game'" class="room2-game-root">
    <!-- Filigree overlay pattern -->
    <div class="r2-filigree-overlay"></div>

    <img src="/images/game_logo.png" alt="Tiến Lên" class="r2-game-logo" />
    <p class="r2-subtitle">Multiplayer — Room {{ roomCode }}</p>

    <!-- Scoreboard -->
    <div class="r2-scoreboard">
      <div v-for="seat in activeSeats" :key="'sc'+seat" class="r2-score-chip">
        {{ gs?.names?.[seat] || 'P'+(seat+1) }} <span class="text-white font-bold">{{ gs?.scores?.[seat] || 0 }}</span>
      </div>
    </div>

    <!-- ═══════ TABLE ═══════ -->
    <div class="r2-table-wrapper">
      <!-- Rope border decoration -->
      <div class="r2-rope-border"></div>
      <!-- Inner table surface -->
      <div class="r2-table-surface">

        <!-- Opponent top -->
        <div v-if="activeSeats.includes(topSeat)" class="r2-seat">
          <div class="player-label" :class="labelClass(topSeat)">{{ labelText(topSeat) }}</div>
          <div class="r2-cpu-hand-h">
            <div v-for="j in opponentCardCount(topSeat)" :key="j" class="r2-card-sm-h"></div>
          </div>
        </div>

        <!-- Middle row -->
        <div class="r2-middle-row">
          <!-- Left -->
          <div v-if="activeSeats.includes(leftSeat)" class="r2-seat-side">
            <div class="player-label-side" :class="labelClass(leftSeat)">{{ labelText(leftSeat) }}</div>
            <div class="r2-cpu-hand-v">
              <div v-for="j in opponentCardCount(leftSeat)" :key="j" class="r2-card-sm-v"></div>
            </div>
          </div>

          <!-- Play Area -->
          <div class="r2-play-area">
            <div class="r2-play-area-label">LAST PLAYED</div>
            <div class="r2-played-cards-row">
              <PlayingCard v-for="(c, j) in (gs?.lastPlayed || [])" :key="j" :card="c" class="!cursor-default played-card" />
            </div>
            <div class="r2-play-area-who">{{ whosePlayText }}</div>
            <div class="r2-play-area-msg">{{ gs?.message || '' }}</div>
            <!-- Timer -->
            <div class="r2-timer">
              <span v-if="turnTimeLeft > 0 && !gs?.gameOver" class="font-bold transition-colors duration-500"
                :class="turnTimeLeft <= 5 ? 'text-[#e74c3c]' : turnTimeLeft <= 15 ? 'text-[#f39c12]' : 'text-[#2ecc71]'"
                style="font-family: var(--font-cinzel); font-size: 0.9rem;">{{ turnTimeLeft }}s</span>
            </div>
          </div>

          <!-- Right -->
          <div v-if="activeSeats.includes(rightSeat)" class="r2-seat-side">
            <div class="player-label-side" :class="labelClass(rightSeat)">{{ labelText(rightSeat) }}</div>
            <div class="r2-cpu-hand-v">
              <div v-for="j in opponentCardCount(rightSeat)" :key="j" class="r2-card-sm-v"></div>
            </div>
          </div>
        </div>

        <!-- YOUR HAND -->
        <div class="r2-seat">
          <div class="player-label" :class="labelClass(mySeat)">{{ labelText(mySeat) }} (You)</div>
          <div class="r2-your-hand" :style="{ opacity: amPassed ? 0.5 : 1 }">
            <PlayingCard v-for="(c, j) in myHand" :key="j" :card="c"
              :selected="selectedSet.has(j)"
              class="your-card" @click="toggleSelect(j)" />
          </div>
          <div class="r2-action-buttons">
            <button class="btn btn-play" :disabled="!mpIsMyTurn" @click="mpPlaySelected">Play</button>
            <button class="btn btn-pass" :disabled="!canPass" @click="mpPass">Pass</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Win Overlay -->
    <div v-if="showGameOverlay" class="overlay-backdrop">
      <div class="overlay-box max-md:p-4 max-md:w-[92vw] max-md:max-w-[400px] max-md:max-h-[85vh] max-md:overflow-y-auto" :class="{ '!max-w-[700px] !w-[94vw]': isBoom }">
        <h2>{{ gameOverTitle }}</h2>
        <div v-html="gameOverMsg" class="mb-3"></div>
        <div class="text-xs text-white/40 mb-3">{{ gameOverScores }}</div>

        <!-- Boom cards -->
        <div v-if="boomHands.length > 0">
          <div v-for="(bh, i) in boomHands" :key="i" class="boom-player-row">
            <div class="boom-player-name">{{ bh.name }}{{ bh.winner ? ' 👑' : '' }}</div>
            <div class="boom-hand">
              <PlayingCard v-for="(c, j) in bh.cards" :key="j" :card="c" class="boom-card !cursor-default hover:!transform-none" />
            </div>
          </div>
        </div>

        <div class="flex gap-3 justify-center flex-wrap">
          <button v-if="isHost" class="btn btn-new" @click="doHostNewGame">▶ New Game</button>
        </div>
        <p v-if="!isHost" style="font-family: 'Press Start 2P', monospace; font-size: 0.45rem; color: rgba(240,201,110,0.7); margin-top: 12px; animation: hintBlink 2s ease-in-out infinite;">
          ⏳ Waiting for host to start next game...
        </p>
        <button @click="doLeaveRoom" class="lobby-back-btn mt-3">← Leave Room</button>
      </div>
    </div>

    <GameToolbar :muted="isMuted" :show-reset="isHost" @toggle-mute="toggleMute" @new-game="doHostNewGame" @leave="doLeaveRoom" />
  </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSound } from '../composables/useSound.js'
import { useFirebase } from '../composables/useFirebase.js'
import { createDeck, sortHand, classify, beats, checkInstantWin, cardValue } from '../composables/useCardLogic.js'
import PlayingCard from '../components/PlayingCard.vue'
import GameToolbar from '../components/GameToolbar.vue'
import PixelStars from '../components/PixelStars.vue'
import PixelClouds from '../components/PixelClouds.vue'

const router = useRouter()
const { SFX, isMuted, toggleMute } = useSound()
const fb = useFirebase()

// ── STATE ──
const screen = ref('lobby')
const lobbyView = ref('main')
const lobbyError = ref('')
const nickname = ref(fb.getPlayerName() || '')
const roomCodeInput = ref('')
const roomCode = ref('')
const isHost = ref(false)
const mySeat = ref(-1)
const playerCount = ref(0)
const copied = ref(false)
const slots = ref({}) // seat => { name, pid }
const gs = ref(null) // game state from Firebase
const selectedSet = ref(new Set())
const turnTimeLeft = ref(30)
const TURN_TIME = 30
const showGameOverlay = ref(false)
const gameOverTitle = ref('')
const gameOverMsg = ref('')
const gameOverScores = ref('')
const boomHands = ref([])
const isBoom = ref(false)

let listeners = []
let turnTimer = null

const playerId = fb.getPlayerId()

// Computed seats relative to player
const activeSeats = computed(() => gs.value?.activeSeats || [0, 1, 2, 3])
const topSeat = computed(() => (mySeat.value + 2) % 4)
const leftSeat = computed(() => (mySeat.value + 3) % 4)
const rightSeat = computed(() => (mySeat.value + 1) % 4)
const myHand = computed(() => gs.value?.hands?.[mySeat.value] || [])

const mpIsMyTurn = computed(() => {
  if (!gs.value || gs.value.gameOver) return false
  return gs.value.current === mySeat.value && !(gs.value.finishOrder || []).includes(mySeat.value)
})

const canPass = computed(() => {
  if (!mpIsMyTurn.value) return false
  const lp = gs.value?.lastPlayed || []
  if (lp.length === 0) return false
  if (gs.value?.lastPlayer === mySeat.value) return false
  const passedList = gs.value?.passedPlayers || []
  return !passedList.includes(mySeat.value)
})

const amPassed = computed(() => {
  if (!gs.value) return false
  const passedList = gs.value.passedPlayers || []
  return passedList.includes(mySeat.value) && gs.value.current !== mySeat.value && !gs.value.gameOver
})

const whosePlayText = computed(() => {
  if (!gs.value) return ''
  const names = gs.value.names || {}
  if (gs.value.current === mySeat.value) return '⏳ Your turn!'
  if (gs.value.current >= 0) return '⏳ ' + (names[gs.value.current] || 'Player') + "'s turn"
  return ''
})

function labelText(seat) {
  if (!gs.value) return seatName(seat)
  const names = gs.value.names || {}
  const fo = gs.value.finishOrder || []
  let name = names[seat] || ('Player ' + (seat + 1))
  const pos = fo.indexOf(seat)
  if (pos >= 0) name += [' 🥇', ' 🥈', ' 🥉', ' 4th'][pos]
  return name
}
function seatName(seat) { return slots.value[seat]?.name || 'Empty' }
function labelClass(seat) {
  if (!gs.value) return {}
  const fo = gs.value.finishOrder || []
  return {
    'active-player': gs.value.current === seat && !fo.includes(seat),
    'mp-finished': fo.includes(seat),
  }
}
function opponentCardCount(seat) { return gs.value?.hands?.[seat]?.length || 0 }

function slotFilled(i) { return !!slots.value[i] }
function slotClass(i) {
  const s = slots.value[i]
  if (!s) return 'player-slot empty'
  return 'player-slot filled' + (s.pid === playerId ? ' is-you' : '')
}
function slotText(i) {
  const s = slots.value[i]
  if (!s) return 'Waiting...'
  return s.name + (s.pid === playerId ? ' (You)' : '')
}

// ── LOBBY ACTIONS ──
function showCreate() {
  if (!nickname.value.trim()) { lobbyError.value = 'Please enter a nickname'; SFX.error(); return }
  fb.setPlayerName(nickname.value.trim())
  lobbyView.value = 'create'
  lobbyError.value = ''
}
function showJoin() {
  if (!nickname.value.trim()) { lobbyError.value = 'Please enter a nickname'; SFX.error(); return }
  fb.setPlayerName(nickname.value.trim())
  lobbyView.value = 'join'
  lobbyError.value = ''
}

async function doCreateRoom() {
  try {
    SFX.join()
    const result = await fb.createRoom(nickname.value.trim())
    roomCode.value = result.code
    mySeat.value = result.seat
    isHost.value = true
    setupListeners()
    screen.value = 'waiting'
  } catch (e) {
    lobbyError.value = e.message
    SFX.error()
  }
}

async function doJoinRoom() {
  const code = roomCodeInput.value.trim().toUpperCase()
  if (code.length !== 6) { lobbyError.value = 'Room code must be 6 characters'; SFX.error(); return }
  try {
    SFX.join()
    const result = await fb.joinRoom(code, nickname.value.trim())
    roomCode.value = result.code
    mySeat.value = result.seat
    isHost.value = false
    setupListeners()
    screen.value = 'waiting'
  } catch (e) {
    lobbyError.value = e.message
    SFX.error()
  }
}

function copyCode() {
  navigator.clipboard.writeText(roomCode.value).then(() => {
    copied.value = true
    setTimeout(() => copied.value = false, 1500)
  })
}

// ── LISTENERS ──
function setupListeners() {
  const unsub1 = fb.listenPlayers(roomCode.value, (players) => {
    const newSlots = {}
    let count = 0
    Object.entries(players).forEach(([pid, p]) => {
      newSlots[p.seat] = { name: p.name, pid }
      count++
    })
    slots.value = newSlots
    playerCount.value = count
  })
  listeners.push(unsub1)

  const unsub2 = fb.listenStatus(roomCode.value, (status) => {
    if (status === 'playing') {
      setupGameListener()
      screen.value = 'game'
    }
  })
  listeners.push(unsub2)
}

function setupGameListener() {
  const unsub = fb.listenGame(roomCode.value, (gameState) => {
    gs.value = gameState
    if (!gameState) return
    selectedSet.value = new Set()
    startTurnCountdown()
    if (gameState.gameOver) {
      showGameOver()
    } else {
      showGameOverlay.value = false
    }
  })
  listeners.push(unsub)
}

// ── GAME START ──
async function doStartGame() {
  if (!isHost.value) return
  SFX.play()

  const nameMap = {}
  const activeSts = []
  Object.entries(slots.value).forEach(([seat, data]) => {
    const s = parseInt(seat)
    nameMap[s] = data.name
    activeSts.push(s)
  })
  activeSts.sort((a, b) => a - b)

  const deck = createDeck()
  const hands = [[], [], [], []]
  let ci = 0
  for (let i = 0; i < 13; i++) {
    for (const seat of activeSts) hands[seat].push(deck[ci++])
  }
  for (const seat of activeSts) hands[seat] = sortHand(hands[seat])

  let starter = activeSts[0]
  for (const seat of activeSts) {
    if (hands[seat].some(c => c.rank === '3' && c.suit === '♠')) { starter = seat; break }
  }

  // Check instant win
  let boomWinner = -1, boomReason = ''
  for (const seat of activeSts) {
    const reason = checkInstantWin(hands[seat])
    if (reason) { boomWinner = seat; boomReason = reason; break }
  }

  if (boomWinner >= 0) {
    const fo = [boomWinner, ...activeSts.filter(s => s !== boomWinner)]
    const scores = [0, 0, 0, 0]; scores[boomWinner] = 1
    await fb.setGameState(roomCode.value, {
      hands, current: -1, lastPlayed: [], lastPlayer: -1, passCount: 0,
      finishOrder: fo, scores, wallets: [1000,1000,1000,1000], betAmount: 100,
      gameOver: true, message: '💣 ' + nameMap[boomWinner] + ' has ' + boomReason + ' — INSTANT WIN! 💣',
      names: nameMap, activeSeats: activeSts, passedPlayers: [],
      fourTwosBoom: boomWinner, boomReason
    })
  } else {
    await fb.setGameState(roomCode.value, {
      hands, current: starter, lastPlayed: [], lastPlayer: -1, passCount: 0,
      finishOrder: [], scores: [0,0,0,0], wallets: [1000,1000,1000,1000], betAmount: 100,
      gameOver: false, message: nameMap[starter] + ' starts (has 3♠)',
      names: nameMap, activeSeats: activeSts, passedPlayers: []
    })
  }
  await fb.setStatus(roomCode.value, 'playing')
}

// ── PLAY / PASS ──
function toggleSelect(idx) {
  if (!gs.value || gs.value.current !== mySeat.value || gs.value.gameOver) return
  const newSet = new Set(selectedSet.value)
  if (newSet.has(idx)) newSet.delete(idx)
  else newSet.add(idx)
  selectedSet.value = newSet
  SFX.click()
}

async function mpPlaySelected() {
  if (!gs.value || gs.value.current !== mySeat.value || gs.value.gameOver) return
  const hand = gs.value.hands[mySeat.value]
  const cards = [...selectedSet.value].map(i => hand[i])
  if (cards.length === 0) { SFX.error(); return }

  const combo = classify(cards)
  if (!combo) { SFX.error(); return }

  const lastP = gs.value.lastPlayed || []
  const isFreePlay = lastP.length === 0 || gs.value.lastPlayer === mySeat.value
  if (!isFreePlay && !beats(combo, lastP)) { SFX.error(); return }

  SFX.play()

  const newHand = hand.filter((_, i) => !selectedSet.value.has(i))
  const finishOrder = [...(gs.value.finishOrder || [])]
  const names = gs.value.names || {}
  let finished = false
  if (newHand.length === 0) { finishOrder.push(mySeat.value); finished = true }

  const activeSts = gs.value.activeSeats || [0,1,2,3]
  let currentPassedList = [...(gs.value.passedPlayers || [])]
  if (finished) currentPassedList = []
  let next = findNextPlayer(mySeat.value, finishOrder, activeSts, currentPassedList)
  if (next === mySeat.value && !finished) {
    currentPassedList = []
    next = findNextPlayer(mySeat.value, finishOrder, activeSts, currentPassedList)
  }

  const isGameOver = finishOrder.length >= activeSts.length - 1
  if (isGameOver) {
    for (const s of activeSts) { if (!finishOrder.includes(s)) { finishOrder.push(s); break } }
  }

  let message = (names[mySeat.value] || 'Player') + ' played ' + cards.map(c => c.rank + c.suit).join(' ')
  if (finished) message += ' — FINISHED! 🎉'

  const update = {
    ['hands/' + mySeat.value]: newHand,
    current: isGameOver ? -1 : next,
    lastPlayed: cards, lastPlayer: mySeat.value,
    passCount: 0, passedPlayers: currentPassedList,
    finishOrder, gameOver: isGameOver, message,
  }

  if (isGameOver) {
    const scores = [...(gs.value.scores || [0,0,0,0])]
    const numPlayers = activeSts.length
    for (let i = 0; i < finishOrder.length; i++) {
      scores[finishOrder[i]] += Math.max(numPlayers - 1 - i, 0)
    }
    update.scores = scores
  }

  selectedSet.value = new Set()
  await fb.updateGameState(roomCode.value, update)
}

async function mpPass() {
  if (!gs.value) return
  const passedList = gs.value.passedPlayers || []
  if (gs.value.current !== mySeat.value || gs.value.gameOver || passedList.includes(mySeat.value)) return
  SFX.pass()

  const finishOrder = gs.value.finishOrder || []
  const names = gs.value.names || {}
  const activeSts = gs.value.activeSeats || [0,1,2,3]
  const newPassedPlayers = [...passedList, mySeat.value]

  const alivePlayers = activeSts.filter(s => {
    const hand = gs.value.hands[s] || []
    return hand.length > 0 && !finishOrder.includes(s)
  })
  const activePlayers = alivePlayers.filter(s => !newPassedPlayers.includes(s))

  if (activePlayers.length <= 1) {
    const roundWinner = activePlayers[0] !== undefined ? activePlayers[0] : gs.value.lastPlayer
    await fb.updateGameState(roomCode.value, {
      current: roundWinner, lastPlayed: [], lastPlayer: -1,
      passCount: 0, passedPlayers: [],
      message: (names[roundWinner] || 'Player') + "'s free turn",
    })
    return
  }

  let next = findNextPlayer(mySeat.value, finishOrder, activeSts, newPassedPlayers)
  await fb.updateGameState(roomCode.value, {
    current: next, passCount: (gs.value.passCount || 0) + 1,
    passedPlayers: newPassedPlayers,
    message: (names[mySeat.value] || 'Player') + ' passed',
  })
}

function findNextPlayer(currentSeat, finishOrder, activeSts, passedList) {
  const seats = activeSts || [0,1,2,3]
  const passed = passedList || []
  const currentIdx = seats.indexOf(currentSeat)
  for (let i = 1; i <= seats.length; i++) {
    const nextSeat = seats[(currentIdx + i) % seats.length]
    if (!finishOrder.includes(nextSeat) && !passed.includes(nextSeat)) return nextSeat
  }
  for (let i = 1; i <= seats.length; i++) {
    const nextSeat = seats[(currentIdx + i) % seats.length]
    if (!finishOrder.includes(nextSeat)) return nextSeat
  }
  return currentSeat
}

// ── TIMER ──
function startTurnCountdown() {
  clearInterval(turnTimer)
  turnTimeLeft.value = TURN_TIME
  if (!gs.value || gs.value.gameOver || gs.value.current === -1) return

  turnTimer = setInterval(() => {
    turnTimeLeft.value--
    if (turnTimeLeft.value <= 0 && gs.value?.current === mySeat.value) {
      clearInterval(turnTimer)
      mpPass()
    } else if (turnTimeLeft.value <= 0) {
      clearInterval(turnTimer)
    }
  }, 1000)
}

// ── GAME OVER ──
function showGameOver() {
  showGameOverlay.value = true
  const fo = gs.value.finishOrder || []
  const names = gs.value.names || {}
  const activeSts = gs.value.activeSeats || [0,1,2,3]
  const isFourTwosBoom = gs.value.fourTwosBoom !== undefined && gs.value.fourTwosBoom >= 0

  isBoom.value = isFourTwosBoom

  const numPlayers = activeSts.length
  let titles
  if (numPlayers === 2) titles = ['🏆 Winner!', '💀 Loser']
  else if (numPlayers === 3) titles = ['🥇 1st Place!', '🥈 2nd Place!', '💀 Last Place']
  else titles = ['🥇 1st Place!', '🥈 2nd Place!', '🥉 3rd Place!', '💀 Last Place']

  const myPos = fo.indexOf(mySeat.value)

  if (isFourTwosBoom) {
    const boomPlayer = gs.value.fourTwosBoom
    const boomName = names[boomPlayer] || 'Player'
    const reason = gs.value.boomReason || 'FOUR 2s'
    gameOverTitle.value = '💣 ' + reason + ' BOOM! 💣'
    gameOverMsg.value = boomName + ' — INSTANT WIN!'

    boomHands.value = activeSts.map(seat => ({
      name: names[seat] || 'Player ' + (seat + 1),
      winner: seat === boomPlayer,
      cards: gs.value.hands?.[seat] || [],
    }))
  } else {
    gameOverTitle.value = myPos >= 0 ? titles[myPos] : 'Game Over'
    gameOverMsg.value = fo.map((seat, i) =>
      '<div>' + (titles[i] || (i+1)+'th') + ': <strong>' + (names[seat] || 'Player') + '</strong></div>'
    ).join('')
    boomHands.value = []
  }

  const scores = gs.value.scores || [0,0,0,0]
  gameOverScores.value = 'Scores: ' + activeSts.map(i => (names[i] || 'P'+(i+1)) + ': ' + scores[i]).join(' | ')

  if (isFourTwosBoom && gs.value.fourTwosBoom === mySeat.value) SFX.win()
  else if (myPos === 0) SFX.win()
}

async function doHostNewGame() {
  if (!isHost.value) return
  showGameOverlay.value = false

  const nameMap = {}
  const activeSts = []
  Object.entries(slots.value).forEach(([seat, data]) => {
    const s = parseInt(seat)
    nameMap[s] = data.name
    activeSts.push(s)
  })
  activeSts.sort((a, b) => a - b)

  const deck = createDeck()
  const hands = [[], [], [], []]
  let ci = 0
  for (let i = 0; i < 13; i++) {
    for (const seat of activeSts) hands[seat].push(deck[ci++])
  }
  for (const seat of activeSts) hands[seat] = sortHand(hands[seat])

  const prevFo = gs.value?.finishOrder || []
  let starter
  if (prevFo.length > 0 && activeSts.includes(prevFo[0])) {
    starter = prevFo[0]
  } else {
    starter = activeSts[0]
    for (const seat of activeSts) {
      if (hands[seat].some(c => c.rank === '3' && c.suit === '♠')) { starter = seat; break }
    }
  }

  const scores = gs.value?.scores || [0, 0, 0, 0]

  let boomWinner = -1, boomReason = ''
  for (const seat of activeSts) {
    const reason = checkInstantWin(hands[seat])
    if (reason) { boomWinner = seat; boomReason = reason; break }
  }

  if (boomWinner >= 0) {
    const fo = [boomWinner, ...activeSts.filter(s => s !== boomWinner)]
    scores[boomWinner]++
    await fb.setGameState(roomCode.value, {
      hands, current: -1, lastPlayed: [], lastPlayer: -1, passCount: 0,
      finishOrder: fo, scores, wallets: gs.value?.wallets || [1000,1000,1000,1000],
      betAmount: gs.value?.betAmount || 100, gameOver: true,
      message: '💣 ' + nameMap[boomWinner] + ' has ' + boomReason + ' — INSTANT WIN! 💣',
      names: nameMap, activeSeats: activeSts, passedPlayers: [],
      fourTwosBoom: boomWinner, boomReason
    })
  } else {
    await fb.setGameState(roomCode.value, {
      hands, current: starter, lastPlayed: [], lastPlayer: -1, passCount: 0,
      finishOrder: [], scores, wallets: gs.value?.wallets || [1000,1000,1000,1000],
      betAmount: gs.value?.betAmount || 100, gameOver: false,
      message: nameMap[starter] + ' starts (winner goes first)',
      names: nameMap, activeSeats: activeSts, passedPlayers: []
    })
  }
}

async function doLeaveRoom() {
  clearInterval(turnTimer)
  listeners.forEach(fn => fn())
  listeners = []
  try {
    await fb.leaveRoom(roomCode.value, isHost.value)
  } catch (e) { /* ignore */ }
  gs.value = null
  mySeat.value = -1
  selectedSet.value = new Set()
  router.push({ name: 'home' })
}

onUnmounted(() => {
  clearInterval(turnTimer)
  listeners.forEach(fn => fn())
  listeners = []
})
</script>

<style scoped>
.lobby-panel {
  position: relative; z-index: 10;
  width: min(520px, 92vw); padding: 4px; border-radius: 12px;
  background: linear-gradient(135deg, #237a4b, #1a5c38, #0f3d25);
  box-shadow: 0 0 40px rgba(35,122,75,0.4), 0 0 80px rgba(35,122,75,0.15), inset 0 1px 0 rgba(255,255,255,0.2);
}
.lobby-label {
  font-family: 'Press Start 2P', monospace; font-size: 0.5rem;
  color: rgba(240,201,110,0.8); letter-spacing: 0.1em;
  display: block; margin-bottom: 6px; text-transform: uppercase;
}
.lobby-input {
  width: 100%; padding: 10px 14px; border-radius: 8px;
  border: 2px solid rgba(212,168,67,0.3); background: rgba(0,0,0,0.4);
  color: #fff; font-family: 'Press Start 2P', monospace; font-size: 0.7rem; outline: none;
  transition: border-color 0.2s;
}
.lobby-input:focus { border-color: rgba(212,168,67,0.8); box-shadow: 0 0 12px rgba(212,168,67,0.2); }
.lobby-input::placeholder { color: rgba(255,255,255,0.25); font-family: 'Press Start 2P', monospace; font-size: 0.55rem; }
.lobby-info { font-family: 'Press Start 2P', monospace; font-size: 0.5rem; color: rgba(240,201,110,0.6); margin-bottom: 16px; }
.lobby-back-btn {
  display: inline-block; margin-top: 12px; background: none; border: none;
  color: rgba(240,201,110,0.5); font-family: 'Press Start 2P', monospace; font-size: 0.45rem;
  cursor: pointer; transition: color 0.15s;
}
.lobby-back-btn:hover { color: rgba(240,201,110,0.9); }
.lobby-error {
  font-family: 'Press Start 2P', monospace; font-size: 0.45rem;
  color: #ff6b6b; padding: 8px 12px;
  background: rgba(255,50,50,0.1); border: 1px solid rgba(255,50,50,0.3); border-radius: 6px;
}

.pixel-play-btn-sm {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 30px; border: none; border-radius: 8px;
  color: #fff; font-family: 'Press Start 2P', monospace;
  font-size: clamp(0.65rem, 1.5vw, 0.85rem); cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  text-shadow: 0 2px 0 rgba(0,0,0,0.3); letter-spacing: 0.1em;
  animation: playPulse 1.5s ease-in-out infinite;
}
.pixel-play-btn-sm.orange {
  background: linear-gradient(180deg, #ff8844, #ff6622, #dd4400);
  box-shadow: 0 4px 0 #aa3300, 0 6px 20px rgba(255,100,30,0.4);
}
.pixel-play-btn-sm.green {
  background: linear-gradient(180deg, #27ae60, #1e8449, #196f3d);
  box-shadow: 0 4px 0 #145a32, 0 6px 20px rgba(39,174,96,0.4);
}
.pixel-play-btn-sm:hover { transform: translateY(-2px); }
.pixel-play-btn-sm:active { transform: translateY(2px); }

.player-slot {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 10px;
  background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.08);
  transition: all 0.3s ease;
}
.player-slot.filled { border-color: rgba(46,204,113,0.5); background: rgba(46,204,113,0.08); }
.player-slot.is-you { border-color: rgba(212,168,67,0.6); background: rgba(212,168,67,0.08); }
.slot-num {
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Press Start 2P', monospace; font-size: 0.5rem;
  color: rgba(255,255,255,0.4); flex-shrink: 0;
}
.slot-name {
  font-family: 'Press Start 2P', monospace; font-size: 0.5rem;
  color: rgba(255,255,255,0.3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ═══════════════════════════════════════════════════
   GAME TABLE — Premium Casino Design
   ═══════════════════════════════════════════════════ */
.room2-game-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: 10px;
  background: var(--color-felt-dark);
  background-image: url('/images/felt_background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  animation: gameRoomFadeIn 0.6s ease-out;
  position: relative;
  overflow-x: hidden;
}

.r2-filigree-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.04;
  background-image:
    radial-gradient(ellipse 80px 80px at 20% 30%, rgba(212,168,67,0.6) 0%, transparent 70%),
    radial-gradient(ellipse 60px 60px at 80% 20%, rgba(212,168,67,0.4) 0%, transparent 70%),
    radial-gradient(ellipse 100px 100px at 50% 70%, rgba(212,168,67,0.5) 0%, transparent 70%),
    radial-gradient(ellipse 50px 50px at 10% 80%, rgba(212,168,67,0.3) 0%, transparent 70%),
    radial-gradient(ellipse 70px 70px at 90% 85%, rgba(212,168,67,0.4) 0%, transparent 70%);
  background-size: 200px 200px;
  background-repeat: repeat;
}

.r2-game-logo {
  margin-top: 4px;
  border-radius: 12px;
  width: 100px;
  filter: drop-shadow(0 4px 20px rgba(212,168,67,0.4));
  position: relative;
  z-index: 1;
}

.r2-subtitle {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.2em;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.r2-scoreboard {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.r2-score-chip {
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(212,168,67,0.3);
  border-radius: 20px;
  padding: 3px 14px;
  font-size: 0.78rem;
  color: var(--color-gold-light);
  backdrop-filter: blur(4px);
}

/* ── Table ── */
.r2-table-wrapper {
  position: relative;
  width: min(920px, 96vw);
  z-index: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.r2-rope-border {
  position: absolute;
  inset: 0;
  border-radius: 48px;
  border: 4px solid transparent;
  background:
    transparent padding-box,
    linear-gradient(135deg, rgba(200,170,90,0.5), rgba(160,130,70,0.3), rgba(200,170,90,0.5)) border-box;
  pointer-events: none;
  z-index: 2;
}
.r2-rope-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50px;
  border: 2px solid rgba(180,150,90,0.2);
  pointer-events: none;
}
.r2-rope-border::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 46px;
  border: 2px solid rgba(180,150,90,0.15);
  pointer-events: none;
}

.r2-rope-diagonal {
  position: absolute;
  height: 3px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(180,150,90,0.08) 10%,
    rgba(180,150,90,0.2) 30%,
    rgba(200,170,90,0.3) 50%,
    rgba(180,150,90,0.2) 70%,
    rgba(180,150,90,0.08) 90%,
    transparent 100%
  );
  z-index: 3;
  pointer-events: none;
}
.r2-rope-diagonal::before {
  content: '';
  position: absolute;
  inset: -1px 0;
  height: 5px;
  background: linear-gradient(90deg,
    transparent,
    rgba(120,100,60,0.08) 20%,
    rgba(120,100,60,0.12) 50%,
    rgba(120,100,60,0.08) 80%,
    transparent
  );
}
.r2-rope-diagonal-1 {
  width: 140%;
  top: 50%;
  left: -20%;
  transform: rotate(-18deg);
}
.r2-rope-diagonal-2 {
  width: 140%;
  top: 50%;
  left: -20%;
  transform: rotate(18deg);
}

.r2-table-surface {
  border-radius: 44px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  background: #1a5c38 url('/images/felt_background.png') center/cover;
  box-shadow:
    0 0 60px rgba(0,0,0,0.7),
    inset 0 0 40px rgba(0,0,0,0.3),
    inset 0 0 100px rgba(0,0,0,0.15);
}

/* ── Seats & Labels ── */
.r2-seat {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.player-label {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
.player-label.active-player {
  color: var(--color-gold);
  font-weight: 700;
  text-shadow: 0 0 12px rgba(212,168,67,0.5);
}
.player-label.mp-finished { color: #2ecc71 !important; }

.player-label-side {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background: rgba(0,0,0,0.65);
  padding: 3px 10px;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 0.58rem;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(212,168,67,0.15);
}
.player-label-side.active-player {
  color: var(--color-gold);
  font-weight: 700;
  border-color: rgba(212,168,67,0.4);
  box-shadow: 0 0 10px rgba(212,168,67,0.2);
}

/* ── CPU Hands ── */
.r2-cpu-hand-h {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  min-height: 32px;
}
.r2-card-sm-h {
  width: 28px;
  height: 40px;
  border-radius: 4px;
  background: url('/images/card_back.png') center/cover;
  border: 1.5px solid rgba(255,255,255,0.2);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.4);
  margin-right: -16px;
  flex-shrink: 0;
}
.r2-card-sm-h:last-child { margin-right: 0; }

.r2-cpu-hand-v {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.r2-card-sm-v {
  width: 28px;
  height: 40px;
  border-radius: 4px;
  background: url('/images/card_back.png') center/cover;
  border: 1.5px solid rgba(255,255,255,0.2);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.4);
  margin-bottom: -28px;
  flex-shrink: 0;
}
.r2-card-sm-v:last-child { margin-bottom: 0; }

/* ── Middle Row ── */
.r2-middle-row {
  display: flex;
  width: 100%;
  gap: 10px;
  align-items: center;
}

.r2-seat-side {
  position: relative;
  width: 90px;
  flex-shrink: 0;
}

/* ── Play Area ── */
.r2-play-area {
  flex: 1;
  min-height: 120px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.25) 100%);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
}

.r2-play-area-label {
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
}

.r2-played-cards-row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  min-height: 90px;
  margin: 8px 0;
}

.r2-play-area-who {
  font-size: 0.82rem;
  color: var(--color-gold-light);
  font-style: italic;
}

.r2-play-area-msg {
  font-size: 0.95rem;
  color: #f9ca24;
  min-height: 1.3em;
  font-family: var(--font-cinzel);
}

.r2-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  min-height: 28px;
}

/* ── Your Hand ── */
.r2-your-hand {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  min-height: var(--card-h);
  padding: 0 20px;
  transition: opacity 0.3s ease;
}

.your-card { margin-right: -30px; }
.your-card:last-child { margin-right: 0; }
.played-card { margin-right: -30px; cursor: default; }
.played-card:last-child { margin-right: 0; }

.r2-action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .r2-game-logo { width: 60px !important; margin-top: 2px !important; }
  .r2-subtitle { font-size: 0.5rem; margin-bottom: 2px; }
  .r2-scoreboard { gap: 4px; margin-bottom: 4px; }
  .r2-score-chip { font-size: 0.55rem; padding: 2px 8px; }
  .r2-table-wrapper { padding: 3px; width: 100vw !important; }
  .r2-rope-border { border-radius: 20px; border-width: 3px; }
  .r2-rope-border::before { border-radius: 22px; }
  .r2-rope-border::after { border-radius: 18px; }
  .r2-table-surface {
    border-radius: 18px;
    padding: 8px 6px;
    gap: 4px;
  }
  .r2-seat-side { width: 40px !important; }
  .r2-middle-row { gap: 3px; }
  .player-label { font-size: 0.45rem !important; letter-spacing: 0.1em; }
  .player-label-side { font-size: 0.38rem !important; padding: 1px 4px; }
  .r2-play-area { min-height: 70px; padding: 6px; gap: 3px; }
  .r2-play-area-label { font-size: 0.4rem; }
  .r2-play-area-who { font-size: 0.5rem; }
  .r2-play-area-msg { font-size: 0.55rem; }
  .r2-played-cards-row { min-height: 60px; margin: 3px 0; }
  .r2-timer { min-height: 20px; margin-top: 2px; }
  .your-card { margin-right: -24px; }
  .played-card { margin-right: -22px; }
  .r2-card-sm-v { width: 20px; height: 30px; margin-bottom: -20px; }
  .r2-card-sm-h { width: 20px; height: 30px; margin-right: -12px; }
  .r2-your-hand { min-height: auto; padding: 0 4px; }
  .r2-action-buttons { gap: 8px; margin-top: 2px; }
  .r2-rope-diagonal-1, .r2-rope-diagonal-2 { opacity: 0.5; }
}

@media (max-width: 480px) {
  .r2-game-logo { width: 50px !important; }
  .r2-subtitle { font-size: 0.42rem; margin-bottom: 1px; }
  .r2-scoreboard { gap: 3px; margin-bottom: 3px; }
  .r2-score-chip { font-size: 0.48rem; padding: 1px 6px; }
  .r2-table-wrapper { padding: 2px; }
  .r2-rope-border { border-radius: 16px; border-width: 2px; }
  .r2-rope-border::before { border-radius: 18px; border-width: 1px; }
  .r2-rope-border::after { border-radius: 14px; border-width: 1px; }
  .r2-table-surface {
    border-radius: 14px;
    padding: 6px 4px;
    gap: 3px;
  }
  .r2-seat-side { width: 30px !important; }
  .r2-middle-row { gap: 2px; }
  .player-label { font-size: 0.38rem !important; letter-spacing: 0.08em; }
  .player-label-side { font-size: 0.32rem !important; padding: 1px 3px; border-radius: 4px; }
  .r2-play-area { min-height: 55px; padding: 4px; gap: 2px; border-radius: 10px; }
  .r2-play-area-label { font-size: 0.35rem; letter-spacing: 0.15em; }
  .r2-play-area-who { font-size: 0.42rem; }
  .r2-play-area-msg { font-size: 0.48rem; }
  .r2-played-cards-row { min-height: 50px; margin: 2px 0; }
  .r2-timer { min-height: 16px; margin-top: 1px; }
  .your-card { margin-right: -20px; }
  .played-card { margin-right: -18px; }
  .r2-card-sm-v { width: 16px; height: 24px; margin-bottom: -16px; border-radius: 3px; }
  .r2-card-sm-h { width: 16px; height: 24px; margin-right: -10px; border-radius: 3px; }
  .r2-cpu-hand-h { min-height: 24px; }
  .r2-your-hand { min-height: auto; padding: 0 2px; }
  .r2-action-buttons { gap: 6px; }
  .r2-rope-diagonal { display: none; }
  .r2-filigree-overlay { display: none; }
}

/* Extra small phones */
@media (max-width: 400px) {
  .r2-game-logo { width: 40px !important; }
  .r2-subtitle { display: none; }
  .r2-score-chip { padding: 1px 5px; font-size: 0.42rem; }
  .r2-table-surface { padding: 4px 3px; gap: 2px; }
  .r2-seat-side { width: 24px !important; }
  .player-label-side { font-size: 0.28rem !important; padding: 1px 2px; }
  .r2-play-area { min-height: 45px; padding: 3px; }
  .r2-play-area-label { font-size: 0.3rem; }
  .r2-play-area-who { font-size: 0.38rem; }
  .r2-play-area-msg { font-size: 0.42rem; }
  .your-card { margin-right: -17px; }
  .played-card { margin-right: -16px; }
  .r2-card-sm-v { width: 14px; height: 20px; margin-bottom: -14px; border-radius: 2px; }
  .r2-card-sm-h { width: 14px; height: 20px; margin-right: -8px; border-radius: 2px; }
  .r2-cpu-hand-h { min-height: 20px; }
}
</style>
