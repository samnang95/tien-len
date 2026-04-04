<template>
  <div class="room1-root">
    <!-- Filigree overlay pattern -->
    <div class="filigree-overlay"></div>

    <h1 class="sr-only">TIẾN LÊN</h1>
    <img src="/images/game_logo.png" alt="Tiến Lên" class="game-logo" />
    <p class="subtitle">Southern Vietnamese Card Game</p>

    <!-- Money Board -->
    <div class="money-board">
      <div v-for="(name, i) in playerNames" :key="'w'+i" class="money-chip">
        <span class="chip-icon">{{ i === 0 ? '👤' : '🤖' }}</span>
        {{ name }} <span class="font-bold" :class="walletClass(i)">${{ wallets[i] }}</span>
      </div>
    </div>

    <!-- Bet Bar -->
    <div class="bet-bar">
      <strong class="text-gold">Bet per game:</strong> <span>${{ betAmount }}</span>
      <button @click="betModalOpen = true" class="bet-change-btn">⚙ Change</button>
    </div>

    <!-- Scoreboard -->
    <div class="scoreboard">
      <div v-for="(name, i) in playerNames" :key="'s'+i" class="score-chip">
        {{ name }} <span class="text-white font-bold">{{ scores[i] }}</span>
      </div>
    </div>

    <!-- ═══════ TABLE ═══════ -->
    <div class="table-wrapper">
      <!-- Rope border decoration -->
      <div class="rope-border"></div>
      <!-- Inner table surface -->
      <div class="table-surface">

        <!-- CPU 2 (top) -->
        <div class="seat seat-top">
          <div class="player-label" :class="{ 'active-player': current === 3 }">
            {{ cpuLabel(3) }}
          </div>
          <div class="cpu-hand-h">
            <template v-if="showCpuCards(3)">
              <PlayingCard v-for="(c, j) in hands[3]" :key="j" :card="c" class="w-[50px]! h-[72px]! text-[0.75rem]! cursor-default!" />
            </template>
            <template v-else>
              <div v-for="j in hands[3].length" :key="j" class="card-sm"></div>
            </template>
          </div>
        </div>

        <!-- Middle row: CPU1 (left) + Play Area + CPU3 (right) -->
        <div class="middle-row">
          <!-- CPU 1 left -->
          <div class="seat seat-side seat-left">
            <div class="player-label-side" :class="{ 'active-player': current === 1 }">
              {{ cpuLabel(1) }}
            </div>
            <div class="cpu-hand-v">
              <template v-if="showCpuCards(1)">
                <PlayingCard v-for="(c, j) in hands[1]" :key="j" :card="c" class="w-[50px]! h-[72px]! text-[0.75rem]! cursor-default! side-card-reveal" />
              </template>
              <template v-else>
                <div v-for="j in hands[1].length" :key="j" class="card-sm-v"></div>
              </template>
            </div>
          </div>

          <!-- Play Area -->
          <div class="play-area">
            <div class="play-area-label">LAST PLAYED</div>
            <div class="played-cards-row">
              <PlayingCard v-for="(c, j) in lastPlayed" :key="j" :card="c" class="cursor-default! played-card" />
            </div>
            <div class="play-area-who">{{ whosePlayText }}</div>
            <div class="play-area-msg">{{ msg }}</div>
            <!-- Turn indicator -->
            <div class="turn-indicator">
              <span v-if="!gameOver && current === 0" class="turn-text pulse-glow">YOUR TURN</span>
              <span v-else-if="!gameOver && current > 0" class="turn-text">CPU {{ current }} THINKING</span>
            </div>
          </div>

          <!-- CPU 3 right -->
          <div class="seat seat-side seat-right">
            <div class="player-label-side" :class="{ 'active-player': current === 2 }">
              {{ cpuLabel(2) }}
            </div>
            <div class="cpu-hand-v">
              <template v-if="showCpuCards(2)">
                <PlayingCard v-for="(c, j) in hands[2]" :key="j" :card="c" class="w-[50px]! h-[72px]! text-[0.75rem]! cursor-default! side-card-reveal" />
              </template>
              <template v-else>
                <div v-for="j in hands[2].length" :key="j" class="card-sm-v"></div>
              </template>
            </div>
          </div>
        </div>

        <!-- YOUR HAND -->
        <div class="seat seat-bottom">
          <div class="player-label" :class="{ 'active-player': current === 0 }">
            {{ hands[0].length === 0 ? 'YOU ✓' : 'YOU' }}
          </div>
          <div class="your-hand-row" :style="{ opacity: passedPlayers.has(0) && !gameOver ? 0.5 : 1 }">
            <PlayingCard v-for="(c, j) in hands[0]" :key="j"
              :card="c"
              :selected="selected.includes(j)"
              class="your-card"
              @click="toggleSelect(j)" />
          </div>
          <div class="action-buttons">
            <button class="btn btn-play" :disabled="!isMyTurn || selected.length === 0" @click="playSelected">Play</button>
            <button class="btn btn-pass" :disabled="!isMyTurn || lastPlayed.length === 0" @click="pass">Pass</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Win Overlay -->
    <div v-if="showOverlay" class="overlay-backdrop" @click.self>
      <div class="overlay-box max-sm:max-h-[85vh] max-sm:overflow-y-auto">
        <h2>{{ overlayTitle }}</h2>
        <p>{{ overlayMsg }}</p>
        <div class="text-lg font-bold my-1.5 mb-3.5" :class="overlayMoneyWin ? 'text-[#2ecc71]' : 'text-[#e74c3c]'">
          {{ overlayMoney }}
        </div>
        <div class="text-xs text-white/45 mb-4.5">{{ overlayWallets }}</div>
        <div class="text-xs text-white/40 mb-3">{{ overlayScore }}</div>

        <!-- Loser cards -->
        <div v-if="loserCards.length > 0" class="mb-4">
          <div class="text-xs text-white/50 tracking-widest mb-1.5">🃏 {{ loserName }} remaining cards (4th place):</div>
          <div class="flex gap-1 justify-center flex-wrap">
            <PlayingCard v-for="(c, j) in loserCards" :key="j" :card="c"
              class="w-[46px]! h-[66px]! text-[0.7rem]! cursor-default! hover:transform-none! max-sm:w-[38px]! max-sm:h-[54px]!" />
          </div>
          <div v-if="loserPenaltyText" class="mt-2 text-sm text-[#e74c3c] font-bold tracking-[0.03em]">{{ loserPenaltyText }}</div>
        </div>

        <!-- Boom overlay -->
        <div v-if="boomHands.length > 0">
          <div v-for="(bh, i) in boomHands" :key="i" class="boom-player-row">
            <div class="boom-player-name">{{ bh.name }}{{ bh.winner ? ' 👑' : '' }}</div>
            <div class="boom-hand">
              <PlayingCard v-for="(c, j) in bh.cards" :key="j" :card="c" class="boom-card cursor-default! hover:transform-none!" />
            </div>
          </div>
        </div>

        <div class="flex gap-3 justify-center flex-wrap">
          <button class="btn btn-new" @click="newGame()">▶ New Game</button>
          <button class="btn-reset" @click="resetScore()">↺ Reset Score</button>
        </div>
      </div>
    </div>

    <!-- Bet Modal -->
    <div v-if="betModalOpen" class="fixed inset-0 z-200 flex items-center justify-center" style="background: rgba(0,0,0,0.7);">
      <div class="rounded-2xl border-2 border-gold text-center"
        style="background: linear-gradient(135deg, #1a5c38, #0f3d25); box-shadow: 0 20px 50px rgba(0,0,0,0.7); padding: 40px 48px; min-width: 340px;">
        <h3 class="text-xl text-gold" style="font-family: var(--font-cinzel); margin-bottom: 28px;">💵 Set Bet Amount</h3>
        <label style="display: block; font-size: 0.875rem; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-align: left;">Quick select:</label>
        <div style="display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; justify-content: center;">
          <button v-for="p in [50,100,200,500,1000]" :key="p"
            @click="betAmount = p; betInput = p"
            class="bet-preset" :class="{ 'bg-gold/30 text-white': betAmount === p }">
            ${{ p }}
          </button>
        </div>
        <label style="display: block; font-size: 0.875rem; color: rgba(255,255,255,0.6); margin-bottom: 12px; text-align: left;">Custom amount:</label>
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 32px;">
          <input v-model.number="betInput" type="number" min="1" placeholder="e.g. 250"
            class="flex-1 rounded-lg border border-white/20 text-white text-sm outline-none focus:border-gold"
            style="background: rgba(0,0,0,0.3); font-family: var(--font-body); padding: 10px 16px;" />
        </div>
        <div style="display: flex; gap: 16px; justify-content: center;">
          <button class="btn btn-play" @click="confirmBet()">Confirm</button>
          <button class="btn btn-pass" @click="betModalOpen = false">Cancel</button>
        </div>
      </div>
    </div>

    <GameToolbar :muted="isMuted" @toggle-mute="toggleMute" @new-game="newGame" @leave="leaveRoom" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSound } from '../composables/useSound.js'
import {
  createDeck, sortHand, classify, beats, getAllValidCombos,
  aiLead, aiRespond, checkInstantWin, TWO_CUT_PENALTY, cardValue
} from '../composables/useCardLogic.js'
import PlayingCard from '../components/PlayingCard.vue'
import GameToolbar from '../components/GameToolbar.vue'

const router = useRouter()
const { SFX, isMuted, toggleMute } = useSound()

// ── STATE ──
const hands = ref([[], [], [], []])
const current = ref(0)
const lastPlayed = ref([])
const lastPlayer = ref(-1)
const passCount = ref(0)
const passedPlayers = ref(new Set())
const selected = ref([])
const scores = ref([0, 0, 0, 0])
const gameOver = ref(false)
const betAmount = ref(100)
const betInput = ref(100)
const betModalOpen = ref(false)
const wallets = ref([1000, 1000, 1000, 1000])
const finishOrder = ref([])
const lastWinner = ref(-1)
const msg = ref('')
const showOverlay = ref(false)
const overlayTitle = ref('')
const overlayMsg = ref('')
const overlayMoney = ref('')
const overlayMoneyWin = ref(true)
const overlayWallets = ref('')
const overlayScore = ref('')
const loserCards = ref([])
const loserName = ref('')
const loserPenaltyText = ref('')
const boomHands = ref([])

const RANK_REWARDS = [30, 15, -15, -30]
const playerNames = ['You', 'CPU 1', 'CPU 2', 'CPU 3']

let aiActionTimer = null

const isMyTurn = computed(() => current.value === 0 && !gameOver.value && !passedPlayers.value.has(0))

const whosePlayText = computed(() => {
  if (lastPlayed.value.length > 0) {
    const who = lastPlayer.value === 0 ? 'You' : ('CPU ' + lastPlayer.value)
    const ctype = classify(lastPlayed.value)
    return who + ' played ' + (ctype ? ctype.label : '')
  }
  return ''
})

function walletClass(i) {
  if (wallets.value[i] > 1000) return 'text-[#2ecc71]'
  if (wallets.value[i] < 1000) return 'text-[#e74c3c]'
  return 'text-white'
}

function cpuLabel(p) {
  let name = 'CPU ' + p
  if (hands.value[p].length === 0) name += ' ✓'
  return name
}

function showCpuCards(p) {
  const isBoom = finishOrder.value.length === 4 && finishOrder.value[0] !== undefined && hands.value[finishOrder.value[0]].length === 13
  return gameOver.value && !isBoom && finishOrder.value.indexOf(p) === 3 && hands.value[p].length > 0
}

function setMsg(t) { msg.value = t }

// ── CUT 2 PENALTY ──
function applyCutTwoPenalty(cuttingPlayer, cutCards, cutPlayer) {
  if (cutPlayer < 0) return
  let totalPenalty = 0
  const details = []
  cutCards.forEach(c => {
    if (c.rank === '2') {
      const penalty = TWO_CUT_PENALTY[c.suit]
      totalPenalty += penalty
      details.push('2' + c.suit + ' ($' + penalty + ')')
    }
  })
  if (totalPenalty > 0) {
    wallets.value[cuttingPlayer] += totalPenalty
    wallets.value[cutPlayer] -= totalPenalty
    const cutterName = playerNames[cuttingPlayer]
    const loserN = playerNames[cutPlayer]
    setMsg('🐷 ' + cutterName + ' cut ' + details.join(', ') + '! ' + loserN + ' -$' + totalPenalty)
  }
}

// ── INIT NEW GAME ──
function newGame() {
  showOverlay.value = false
  gameOver.value = false
  selected.value = []
  finishOrder.value = []
  passedPlayers.value = new Set()
  boomHands.value = []
  loserCards.value = []
  loserPenaltyText.value = ''
  clearAiTimer()

  const deck = createDeck()
  const h = [[], [], [], []]
  for (let i = 0; i < 52; i++) h[i % 4].push(deck[i])
  h.forEach((hand, i) => { h[i] = sortHand(hand) })
  hands.value = h

  lastPlayed.value = []
  lastPlayer.value = -1
  passCount.value = 0

  if (lastWinner.value >= 0) {
    current.value = lastWinner.value
  } else {
    current.value = 0
    for (let p = 0; p < 4; p++) {
      if (h[p].some(c => c.rank === '3' && c.suit === '♠')) { current.value = p; break }
    }
  }

  setMsg('')
  SFX.deal()

  // Check instant win
  for (let p = 0; p < 4; p++) {
    const reason = checkInstantWin(h[p])
    if (reason) {
      gameOver.value = true
      lastWinner.value = p
      SFX.bomb()
      setTimeout(() => SFX.win(), 500)
      finishOrder.value = [p]
      for (let q = 0; q < 4; q++) { if (q !== p) finishOrder.value.push(q) }
      scores.value[p]++

      // Build boom overlay
      showOverlay.value = true
      overlayTitle.value = '💣 ' + reason + ' BOOM! 💣'
      const winnerName = p === 0 ? '🎉 You' : 'CPU ' + p
      overlayMsg.value = winnerName + ' has ' + reason.toLowerCase() + ' — INSTANT WIN!'
      overlayMoney.value = ''
      overlayMoneyWin.value = true
      overlayWallets.value = `You $${wallets.value[0]}  •  CPU1 $${wallets.value[1]}  •  CPU2 $${wallets.value[2]}  •  CPU3 $${wallets.value[3]}`
      overlayScore.value = `Wins — You ${scores.value[0]}  •  CPU1 ${scores.value[1]}  •  CPU2 ${scores.value[2]}  •  CPU3 ${scores.value[3]}`

      boomHands.value = [0, 1, 2, 3].map(q => ({
        name: q === 0 ? 'You' : 'CPU ' + q,
        winner: q === p,
        cards: h[q],
      }))
      return
    }
  }

  if (current.value !== 0) scheduleAiTurn()
  else {
    const startMsg = lastWinner.value >= 0 ? 'Your turn — winner goes first!' : 'Your turn — you have 3♠, lead freely!'
    setMsg(startMsg)
  }
}

// ── SELECTION ──
function toggleSelect(i) {
  if (current.value !== 0 || gameOver.value || passedPlayers.value.has(0)) return
  const idx = selected.value.indexOf(i)
  if (idx >= 0) { selected.value.splice(idx, 1); SFX.deselect() }
  else { selected.value.push(i); SFX.click() }
}

// ── PLAY CARDS ──
function playSelected() {
  if (current.value !== 0 || gameOver.value || selected.value.length === 0 || passedPlayers.value.has(0)) return
  clearAiTimer()
  const cards = selected.value.map(i => hands.value[0][i])
  const combo = classify(cards)
  if (!combo) { SFX.error(); setMsg('❌ Invalid combination'); return }
  if (lastPlayed.value.length > 0) {
    if (!beats(combo, lastPlayed.value)) { SFX.error(); setMsg('❌ Cannot beat the last play'); return }
  }
  if (lastPlayed.value.length > 0) applyCutTwoPenalty(0, lastPlayed.value, lastPlayer.value)
  if (combo.type === 'quad') SFX.bomb(); else SFX.play()
  selected.value.sort((a, b) => b - a).forEach(i => hands.value[0].splice(i, 1))
  selected.value = []
  lastPlayed.value = cards
  lastPlayer.value = 0
  passCount.value = 0
  setMsg('')
  if (hands.value[0].length === 0) {
    if (!finishOrder.value.includes(0)) finishOrder.value.push(0)
    if (finishOrder.value.length >= 3) { endGame(); return }
  }
  current.value = nextAlive(1)
  if (current.value !== 0) scheduleAiTurn()
  else setMsg('Your turn!')
}

function pass() {
  if (current.value !== 0 || lastPlayed.value.length === 0 || gameOver.value || passedPlayers.value.has(0)) return
  clearAiTimer()
  SFX.pass()
  passCount.value++
  passedPlayers.value.add(0)
  setMsg('You passed — waiting for new round...')
  advanceAfterPass()
}

function nextAlive(from) {
  let n = from % 4
  let attempts = 0
  while ((hands.value[n].length === 0 || passedPlayers.value.has(n)) && attempts < 4) {
    n = (n + 1) % 4
    attempts++
  }
  return n
}

function advanceAfterPass() {
  const alivePlayers = [0, 1, 2, 3].filter(p => hands.value[p].length > 0)
  const activePlayers = alivePlayers.filter(p => !passedPlayers.value.has(p))

  if (activePlayers.length <= 1) {
    const roundWinner = activePlayers[0] !== undefined ? activePlayers[0] : lastPlayer.value
    passCount.value = 0
    lastPlayed.value = []
    lastPlayer.value = -1
    passedPlayers.value = new Set()
    current.value = roundWinner
    const winner = roundWinner === 0 ? 'Your' : ('CPU ' + roundWinner)
    if (current.value !== 0) { setMsg(winner + ' leads freely!'); scheduleAiTurn() }
    else setMsg('Your turn — lead freely!')
    return
  }

  const next = nextAlive((current.value + 1) % 4)
  current.value = next
  if (current.value !== 0) scheduleAiTurn()
  else {
    if (lastPlayed.value.length === 0) setMsg('Your turn — lead freely!')
    else setMsg('Your turn!')
  }
}

// ── AI ──
function clearAiTimer() {
  if (aiActionTimer) { clearTimeout(aiActionTimer); aiActionTimer = null }
}

function scheduleAiTurn() {
  const delay = 2000 + Math.floor(Math.random() * 3000)
  aiActionTimer = setTimeout(aiTurn, delay)
}

function aiTurn() {
  if (gameOver.value) return
  const p = current.value
  if (hands.value[p].length === 0) {
    current.value = nextAlive((p + 1) % 4)
    if (current.value !== 0) scheduleAiTurn()
    return
  }

  let played = lastPlayed.value.length === 0
    ? aiLead(p, hands.value)
    : aiRespond(p, lastPlayed.value, hands.value, lastPlayer.value)

  if (played) {
    if (lastPlayed.value.length > 0) applyCutTwoPenalty(p, lastPlayed.value, lastPlayer.value)
    const aiCombo = classify(played)
    if (aiCombo && aiCombo.type === 'quad') SFX.bomb(); else SFX.aiPlay()
    played.forEach(pc => {
      const idx = hands.value[p].findIndex(x => x === pc)
      if (idx >= 0) hands.value[p].splice(idx, 1)
    })
    lastPlayed.value = played
    lastPlayer.value = p
    passCount.value = 0
    setMsg('')
    if (hands.value[p].length === 0) {
      if (!finishOrder.value.includes(p)) finishOrder.value.push(p)
      if (finishOrder.value.length >= 3) { endGame(); return }
    }
    current.value = nextAlive((p + 1) % 4)
    if (current.value !== 0) scheduleAiTurn()
    else setMsg('Your turn!')
  } else {
    SFX.pass()
    setMsg('CPU ' + p + ' passed.')
    passCount.value++
    passedPlayers.value.add(p)
    advanceAfterPass()
  }
}

// ── END GAME ──
function endGame() {
  gameOver.value = true
  for (let p = 0; p < 4; p++) {
    if (!finishOrder.value.includes(p)) finishOrder.value.push(p)
  }

  const winner = finishOrder.value[0]
  lastWinner.value = winner
  if (winner === 0) SFX.win(); else SFX.lose()
  scores.value[winner]++

  const rankLabels = ['1st', '2nd', '3rd', '4th']
  const rankDetails = []
  for (let i = 0; i < 4; i++) {
    const p = finishOrder.value[i]
    wallets.value[p] += RANK_REWARDS[i]
    const name = playerNames[p]
    const reward = RANK_REWARDS[i]
    rankDetails.push(rankLabels[i] + ' ' + name + ': ' + (reward >= 0 ? '+$' + reward : '-$' + Math.abs(reward)))
  }

  const loserPlayer = finishOrder.value[3]
  const lCards = hands.value[loserPlayer]
  let twoPenalty = 0
  const twoPenaltyDetails = []
  lCards.forEach(c => {
    if (c.rank === '2') {
      const penalty = TWO_CUT_PENALTY[c.suit]
      twoPenalty += penalty
      twoPenaltyDetails.push('2' + c.suit + ' (-$' + penalty + ')')
    }
  })
  if (twoPenalty > 0) wallets.value[loserPlayer] -= twoPenalty

  showOverlay.value = true
  overlayTitle.value = winner === 0 ? '🎉 You Win!' : 'CPU ' + winner + ' Wins!'
  overlayMsg.value = rankDetails.join('  •  ')

  const yourRank = finishOrder.value.indexOf(0)
  const yourReward = RANK_REWARDS[yourRank]
  let yourTotal = yourReward
  if (yourRank === 3) yourTotal -= twoPenalty
  if (yourTotal >= 0) {
    overlayMoney.value = '+$' + yourTotal + ' 🤑 (' + rankLabels[yourRank] + ')'
    overlayMoneyWin.value = true
  } else {
    overlayMoney.value = '-$' + Math.abs(yourTotal) + ' (' + rankLabels[yourRank] + ')'
    overlayMoneyWin.value = false
  }

  overlayWallets.value = `You $${wallets.value[0]}  •  CPU1 $${wallets.value[1]}  •  CPU2 $${wallets.value[2]}  •  CPU3 $${wallets.value[3]}`
  overlayScore.value = `Wins — You ${scores.value[0]}  •  CPU1 ${scores.value[1]}  •  CPU2 ${scores.value[2]}  •  CPU3 ${scores.value[3]}`

  if (lCards.length > 0) {
    loserCards.value = lCards
    loserName.value = loserPlayer === 0 ? 'Your' : 'CPU ' + loserPlayer + "'s"
    loserPenaltyText.value = twoPenalty > 0 ? '🐷 Holding 2s penalty: ' + twoPenaltyDetails.join(', ') + ' → Total -$' + twoPenalty : ''
  } else {
    loserCards.value = []
  }
}

function resetScore() {
  scores.value = [0, 0, 0, 0]
  wallets.value = [1000, 1000, 1000, 1000]
  overlayMoney.value = ''
  overlayWallets.value = 'Wallets & scores reset!'
  overlayScore.value = ''
}

function confirmBet() {
  betAmount.value = Math.max(1, betInput.value || 100)
  betModalOpen.value = false
}

function leaveRoom() {
  clearAiTimer()
  gameOver.value = true
  router.push({ name: 'home' })
}

onUnmounted(() => { clearAiTimer() })

// Start game automatically
newGame()
</script>

<style scoped>
/* ═══════════════════════════════════════════════════
   ROOT & BACKGROUND
   ═══════════════════════════════════════════════════ */
.room1-root {
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

/* Filigree / damask pattern overlay */
.filigree-overlay {
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

.sr-only {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* ═══════════════════════════════════════════════════
   LOGO & TOP BAR
   ═══════════════════════════════════════════════════ */
.game-logo {
  margin-top: 6px;
  border-radius: 12px;
  width: min(120px, 35vw);
  filter: drop-shadow(0 4px 20px rgba(212,168,67,0.4));
  position: relative;
  z-index: 1;
}

.subtitle {
  font-size: 0.6rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.2em;
  margin-bottom: 5px;
  position: relative;
  z-index: 1;
}

/* ═══════════════════════════════════════════════════
   MONEY / BET / SCORE
   ═══════════════════════════════════════════════════ */
.money-board {
  display: flex;
  gap: 8px;
  margin-bottom: 5px;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.money-chip {
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(212,168,67,0.35);
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 0.7rem;
  color: var(--color-gold-light);
  display: flex;
  align-items: center;
  gap: 5px;
  backdrop-filter: blur(4px);
}

.chip-icon {
  font-size: 0.65rem;
}

.bet-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.6);
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(4px);
  position: relative;
  z-index: 1;
}

.scoreboard {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}

.score-chip {
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(212,168,67,0.3);
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 0.7rem;
  color: var(--color-gold-light);
}

/* ═══════════════════════════════════════════════════
   TABLE
   ═══════════════════════════════════════════════════ */
.table-wrapper {
  position: relative;
  width: min(780px, 94vw);
  z-index: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
}

/* Rope-style border */
.rope-border {
  position: absolute;
  inset: 0;
  border-radius: 36px;
  border: 3px solid transparent;
  background:
    transparent padding-box,
    linear-gradient(135deg, rgba(200,170,90,0.3), rgba(160,130,70,0.15), rgba(200,170,90,0.3)) border-box;
  pointer-events: none;
  z-index: 2;
}

.rope-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 38px;
  border: 2px solid rgba(180,150,90,0.12);
  pointer-events: none;
}

.rope-border::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 34px;
  border: 2px solid rgba(180,150,90,0.08);
  pointer-events: none;
}

/* Diagonal rope decorations */
.rope-diagonal {
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

.rope-diagonal::before {
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

.rope-diagonal-1 {
  width: 140%;
  top: 50%;
  left: -20%;
  transform: rotate(-18deg);
}

.rope-diagonal-2 {
  width: 140%;
  top: 50%;
  left: -20%;
  transform: rotate(18deg);
}

/* Inner table surface */
.table-surface {
  border-radius: 32px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  background: #145230 url('/images/felt_background.png') center/cover;
  box-shadow:
    0 0 60px rgba(0,0,0,0.7),
    inset 0 0 50px rgba(0,0,0,0.4),
    inset 0 0 120px rgba(0,0,0,0.2);
}

/* ═══════════════════════════════════════════════════
   SEATS & PLAYER LABELS
   ═══════════════════════════════════════════════════ */
.seat { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 6px; }

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

/* ═══════════════════════════════════════════════════
   CPU HANDS
   ═══════════════════════════════════════════════════ */
/* Horizontal (top CPU) */
.cpu-hand-h {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  min-height: 32px;
}

.cpu-hand-h .card-sm {
  width: 28px;
  height: 40px;
  border-radius: 4px;
  background: url('/images/card_back.png') center/cover;
  border: 1.5px solid rgba(255,255,255,0.2);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.4);
  margin-right: -16px;
  flex-shrink: 0;
}
.cpu-hand-h .card-sm:last-child { margin-right: 0; }

/* Vertical (side CPUs) */
.cpu-hand-v {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-sm-v {
  width: 28px;
  height: 40px;
  border-radius: 4px;
  background: url('/images/card_back.png') center/cover;
  border: 1.5px solid rgba(255,255,255,0.2);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.4);
  margin-bottom: -28px;
  flex-shrink: 0;
}
.card-sm-v:last-child { margin-bottom: 0; }

.side-card-reveal {
  margin-bottom: -58px;
}
.side-card-reveal:last-child { margin-bottom: 0; }

/* ═══════════════════════════════════════════════════
   MIDDLE ROW
   ═══════════════════════════════════════════════════ */
.middle-row {
  display: flex;
  width: 100%;
  gap: 10px;
  align-items: center;
}

.seat-side {
  position: relative;
  width: 90px;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════
   PLAY AREA
   ═══════════════════════════════════════════════════ */
.play-area {
  flex: 1;
  min-height: 100px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background:
    radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.35) 100%);
  box-shadow: inset 0 0 30px rgba(0,0,0,0.3);
}

.play-area-label {
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
}

.played-cards-row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}

.play-area-who {
  font-size: 0.72rem;
  color: var(--color-gold-light);
  font-style: italic;
}

.play-area-msg {
  font-size: 0.82rem;
  color: #f9ca24;
  min-height: 1.2em;
  font-family: var(--font-cinzel);
}

.turn-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  min-height: 28px;
}

.turn-text {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.12em;
  font-weight: 700;
}

.pulse-glow {
  color: var(--color-gold);
  text-shadow: 0 0 10px rgba(212,168,67,0.5);
  animation: turnPulse 1.5s ease-in-out infinite;
}

@keyframes turnPulse {
  0%, 100% { opacity: 1; text-shadow: 0 0 10px rgba(212,168,67,0.5); }
  50% { opacity: 0.7; text-shadow: 0 0 20px rgba(212,168,67,0.8); }
}

/* ═══════════════════════════════════════════════════
   YOUR HAND
   ═══════════════════════════════════════════════════ */
.your-hand-row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  min-height: var(--card-h);
  padding: 0 20px;
  transition: opacity 0.3s ease;
}

.your-card {
  margin-right: -24px;
}
.your-card:last-child { margin-right: 0; }

.played-card {
  margin-right: -24px;
  cursor: default;
}
.played-card:last-child { margin-right: 0; }

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

/* ═══════════════════════════════════════════════════
   BET BUTTON
   ═══════════════════════════════════════════════════ */
.bet-change-btn {
  background: rgba(212,168,67,0.15);
  border: 1px solid rgba(212,168,67,0.4);
  color: var(--color-gold);
  border-radius: 14px;
  padding: 3px 12px;
  font-size: 0.75rem;
  cursor: pointer;
  font-family: var(--font-body);
  transition: background 0.15s;
}
.bet-change-btn:hover { background: rgba(212,168,67,0.28); }

.bet-preset {
  background: rgba(212,168,67,0.12);
  border: 1px solid rgba(212,168,67,0.35);
  color: var(--color-gold-light);
  border-radius: 8px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 0.82rem;
  font-family: var(--font-body);
  transition: background 0.12s;
}
.bet-preset:hover { background: rgba(212,168,67,0.3); color: #fff; }

/* ═══════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .game-logo { width: 80px !important; margin-top: 4px !important; }
  .subtitle { font-size: 0.5rem; margin-bottom: 2px; }
  .money-board { gap: 4px; margin-bottom: 3px; }
  .money-chip { padding: 2px 8px; font-size: 0.6rem; border-radius: 14px; }
  .chip-icon { display: none; }
  .bet-bar { font-size: 0.65rem; padding: 2px 10px; margin-bottom: 3px; }
  .scoreboard { gap: 4px; margin-bottom: 4px; }
  .score-chip { padding: 2px 8px; font-size: 0.6rem; }
  .table-wrapper { padding: 3px; width: 100vw !important; }
  .rope-border { border-radius: 20px; border-width: 3px; }
  .rope-border::before { border-radius: 22px; }
  .rope-border::after { border-radius: 18px; }
  .table-surface {
    border-radius: 18px;
    padding: 8px 6px;
    gap: 4px;
  }
  .seat-side { width: 40px !important; }
  .middle-row { gap: 3px; }
  .player-label { font-size: 0.5rem; letter-spacing: 0.1em; }
  .player-label-side { font-size: 0.4rem; padding: 1px 4px; }
  .play-area { min-height: 70px; padding: 6px; gap: 3px; }
  .play-area-label { font-size: 0.45rem; }
  .play-area-who { font-size: 0.55rem; }
  .play-area-msg { font-size: 0.65rem; }
  .turn-indicator { min-height: 20px; margin-top: 2px; }
  .turn-text { font-size: 0.6rem; }
  .your-card { margin-right: -24px; }
  .played-card { margin-right: -22px; }
  .your-hand-row { padding: 0 4px; }
  .action-buttons { gap: 8px; margin-top: 2px; }
  .card-sm-v { width: 20px; height: 30px; margin-bottom: -20px; }
  .cpu-hand-h .card-sm { width: 20px; height: 30px; margin-right: -12px; }
  .rope-diagonal-1, .rope-diagonal-2 { opacity: 0.5; }
}

@media (max-width: 480px) {
  .game-logo { width: 60px !important; }
  .subtitle { font-size: 0.45rem; margin-bottom: 1px; }
  .money-board { gap: 3px; margin-bottom: 2px; }
  .money-chip { padding: 1px 6px; font-size: 0.52rem; }
  .bet-bar { font-size: 0.55rem; padding: 1px 8px; margin-bottom: 2px; gap: 6px; }
  .bet-change-btn { font-size: 0.55rem; padding: 2px 8px; }
  .scoreboard { gap: 3px; margin-bottom: 3px; }
  .score-chip { padding: 1px 6px; font-size: 0.52rem; }
  .table-wrapper { padding: 2px; }
  .rope-border { border-radius: 16px; border-width: 2px; }
  .rope-border::before { border-radius: 18px; border-width: 1px; }
  .rope-border::after { border-radius: 14px; border-width: 1px; }
  .table-surface {
    border-radius: 14px;
    padding: 6px 4px;
    gap: 3px;
  }
  .seat-side { width: 30px !important; }
  .middle-row { gap: 2px; }
  .player-label { font-size: 0.42rem; letter-spacing: 0.08em; }
  .player-label-side { font-size: 0.35rem; padding: 1px 3px; border-radius: 4px; }
  .play-area { min-height: 55px; padding: 4px; gap: 2px; border-radius: 10px; }
  .play-area-label { font-size: 0.38rem; letter-spacing: 0.15em; }
  .play-area-who { font-size: 0.48rem; }
  .play-area-msg { font-size: 0.55rem; }
  .turn-indicator { min-height: 16px; margin-top: 1px; }
  .turn-text { font-size: 0.5rem; }
  .your-card { margin-right: -20px; }
  .played-card { margin-right: -18px; }
  .your-hand-row { padding: 0 2px; min-height: auto; }
  .action-buttons { gap: 6px; }
  .card-sm-v { width: 16px; height: 24px; margin-bottom: -16px; border-radius: 3px; }
  .cpu-hand-h .card-sm { width: 16px; height: 24px; margin-right: -10px; border-radius: 3px; }
  .cpu-hand-h { min-height: 24px; }
  .rope-diagonal { display: none; }
  .filigree-overlay { display: none; }
}

/* Extra small phones */
@media (max-width: 400px) {
  .game-logo { width: 50px !important; }
  .subtitle { display: none; }
  .money-chip { padding: 1px 5px; font-size: 0.48rem; }
  .bet-bar { font-size: 0.5rem; padding: 1px 6px; }
  .score-chip { padding: 1px 5px; font-size: 0.48rem; }
  .table-surface { padding: 4px 3px; gap: 2px; }
  .seat-side { width: 24px !important; }
  .player-label-side { font-size: 0.3rem; padding: 1px 2px; }
  .play-area { min-height: 45px; padding: 3px; }
  .play-area-label { font-size: 0.32rem; }
  .play-area-who { font-size: 0.42rem; }
  .play-area-msg { font-size: 0.48rem; }
  .your-card { margin-right: -17px; }
  .played-card { margin-right: -16px; }
  .card-sm-v { width: 14px; height: 20px; margin-bottom: -14px; border-radius: 2px; }
  .cpu-hand-h .card-sm { width: 14px; height: 20px; margin-right: -8px; border-radius: 2px; }
  .cpu-hand-h { min-height: 20px; }
}
</style>
