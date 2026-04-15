import { ref, computed, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSound } from './useSound.js'
import {
  createDeck, sortHand, classify, beats,
  aiLead, aiRespond, checkInstantWin, TWO_CUT_PENALTY,
} from './useCardLogic.js'

// ─── Constants ────────────────────────────────────────────────────────────────
const RANK_REWARDS = [30, 15, -15, -30]
export const playerNames = ['You', 'CPU 1', 'CPU 2', 'CPU 3']

// ─── Composable ───────────────────────────────────────────────────────────────
export function useVsComputer() {
  const router = useRouter()
  const { SFX, isMuted, toggleMute } = useSound()

  // ── State ──────────────────────────────────────────────────────────────────
  const hands          = ref([[], [], [], []])
  const current        = ref(0)
  const lastPlayed     = ref([])
  const lastPlayer     = ref(-1)
  const passCount      = ref(0)
  const passedPlayers  = ref(new Set())
  const selected       = ref([])
  const scores         = ref([0, 0, 0, 0])
  const gameOver       = ref(false)
  const betAmount      = ref(100)
  const betInput       = ref(100)
  const betModalOpen   = ref(false)
  const wallets        = ref([1000, 1000, 1000, 1000])
  const finishOrder    = ref([])
  const lastWinner     = ref(-1)
  const msg            = ref('')
  const showOverlay    = ref(false)
  const overlayTitle   = ref('')
  const overlayMsg     = ref('')
  const overlayMoney   = ref('')
  const overlayMoneyWin = ref(true)
  const overlayWallets = ref('')
  const overlayScore   = ref('')
  const loserCards     = ref([])
  const loserName      = ref('')
  const loserPenaltyText = ref('')
  const boomHands      = ref([])
  const isDealing      = ref(false)
  const playerAction   = ref({ player: -1, text: '', id: 0 })
  const turnTimeLeft   = ref(0)

  let aiActionTimer = null
  let dealTimer = null
  let actionTimer = null
  let turnTimer = null
  const TURN_TIME = 30

  function startTurnCountdown() {
    clearInterval(turnTimer)
    turnTimeLeft.value = 0

    if (gameOver.value || current.value !== 0 || isDealing.value) return

    const isFreePlay = lastPlayed.value.length === 0 || lastPlayer.value === current.value
    if (isFreePlay) return

    turnTimeLeft.value = TURN_TIME

    turnTimer = setInterval(() => {
      turnTimeLeft.value--
      if (turnTimeLeft.value <= 0 && current.value === 0 && !isDealing.value) {
        clearInterval(turnTimer)
        pass()
      } else if (turnTimeLeft.value <= 0) {
        clearInterval(turnTimer)
      }
    }, 1000)
  }

  watch(current, startTurnCountdown)
  watch(isDealing, startTurnCountdown)

  // ── Computed ───────────────────────────────────────────────────────────────
  const isMyTurn = computed(() =>
    current.value === 0 && !gameOver.value && !passedPlayers.value.has(0) && !isDealing.value
  )

  const whosePlayText = computed(() => {
    if (lastPlayed.value.length > 0) {
      const who = lastPlayer.value === 0 ? 'You' : ('CPU ' + lastPlayer.value)
      const ctype = classify(lastPlayed.value)
      return who + ' played ' + (ctype ? ctype.label : '')
    }
    return ''
  })

  // ── UI Helpers ─────────────────────────────────────────────────────────────
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
    const isBoom =
      finishOrder.value.length === 4 &&
      finishOrder.value[0] !== undefined &&
      hands.value[finishOrder.value[0]].length === 13
    return gameOver.value && !isBoom && finishOrder.value.indexOf(p) === 3 && hands.value[p].length > 0
  }

  function setMsg(t) { msg.value = t }

  function showPlayerAction(player, text) {
    if (actionTimer) clearTimeout(actionTimer)
    playerAction.value = { player, text, id: Date.now() }
    actionTimer = setTimeout(() => {
      playerAction.value = { player: -1, text: '', id: 0 }
    }, 1400)
  }

  // ── Penalty ────────────────────────────────────────────────────────────────
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
      wallets.value[cutPlayer]     -= totalPenalty
      const cutterName = playerNames[cuttingPlayer]
      const loserN     = playerNames[cutPlayer]
      setMsg('🐷 ' + cutterName + ' cut ' + details.join(', ') + '! ' + loserN + ' -$' + totalPenalty)
    }
  }

  // ── Game Loop ──────────────────────────────────────────────────────────────
  function newGame() {
    showOverlay.value    = false
    gameOver.value       = false
    selected.value       = []
    finishOrder.value    = []
    passedPlayers.value  = new Set()
    boomHands.value      = []
    loserCards.value     = []
    loserPenaltyText.value = ''
    clearAiTimer()
    clearDealTimer()

    const deck = createDeck()
    const h = [[], [], [], []]
    for (let i = 0; i < 52; i++) h[i % 4].push(deck[i])
    h.forEach((hand, i) => { h[i] = sortHand(hand) })
    hands.value = h

    lastPlayed.value  = []
    lastPlayer.value  = -1
    passCount.value   = 0
    current.value     = -1
    setMsg('')
    isDealing.value = true
    SFX.deal()

    // After dealing animation completes, start the game
    dealTimer = setTimeout(() => {
      isDealing.value = false

      if (lastWinner.value >= 0) {
        current.value = lastWinner.value
      } else {
        current.value = 0
        for (let p = 0; p < 4; p++) {
          if (h[p].some(c => c.rank === '3' && c.suit === '♠')) { current.value = p; break }
        }
      }

      // Check instant win
      for (let p = 0; p < 4; p++) {
        const reason = checkInstantWin(h[p])
        if (reason) {
          gameOver.value    = true
          lastWinner.value  = p
          SFX.bomb()
          setTimeout(() => SFX.win(), 500)
          finishOrder.value = [p]
          for (let q = 0; q < 4; q++) { if (q !== p) finishOrder.value.push(q) }
          scores.value[p]++

          showOverlay.value  = true
          overlayTitle.value = '💣 ' + reason + ' BOOM! 💣'
          const winnerName   = p === 0 ? '🎉 You' : 'CPU ' + p
          overlayMsg.value   = winnerName + ' has ' + reason.toLowerCase() + ' — INSTANT WIN!'
          overlayMoney.value = ''
          overlayMoneyWin.value = true
          overlayWallets.value = `You $${wallets.value[0]}  •  CPU1 $${wallets.value[1]}  •  CPU2 $${wallets.value[2]}  •  CPU3 $${wallets.value[3]}`
          overlayScore.value   = `Wins — You ${scores.value[0]}  •  CPU1 ${scores.value[1]}  •  CPU2 ${scores.value[2]}  •  CPU3 ${scores.value[3]}`
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
        const startMsg = lastWinner.value >= 0
          ? 'Your turn — winner goes first!'
          : 'Your turn — you have 3♠, lead freely!'
        setMsg(startMsg)
      }
    }, 2800)
  }

  function endGame() {
    gameOver.value = true
    for (let p = 0; p < 4; p++) {
      if (!finishOrder.value.includes(p)) finishOrder.value.push(p)
    }

    const winner = finishOrder.value[0]
    lastWinner.value = winner

    const rankLabels  = ['1st', '2nd', '3rd', '4th']
    const rankDetails = []
    for (let i = 0; i < 4; i++) {
      const p      = finishOrder.value[i]
      wallets.value[p] += RANK_REWARDS[i]
      const name   = playerNames[p]
      const reward = RANK_REWARDS[i]
      rankDetails.push(rankLabels[i] + ' ' + name + ': ' + (reward >= 0 ? '+$' + reward : '-$' + Math.abs(reward)))
    }

    const loserPlayer      = finishOrder.value[3]
    const lCards           = hands.value[loserPlayer]
    let twoPenalty         = 0
    const twoPenaltyDetails = []
    lCards.forEach(c => {
      if (c.rank === '2') {
        const penalty = TWO_CUT_PENALTY[c.suit]
        twoPenalty += penalty
        twoPenaltyDetails.push('2' + c.suit + ' (-$' + penalty + ')')
      }
    })
    if (twoPenalty > 0) wallets.value[loserPlayer] -= twoPenalty

    setTimeout(() => {
      if (winner === 0) SFX.win(); else SFX.lose()
      scores.value[winner]++
      showOverlay.value   = true
      overlayTitle.value  = winner === 0 ? '🎉 You Win!' : 'CPU ' + winner + ' Wins!'
      overlayMsg.value    = rankDetails.join('  •  ')

      const yourRank    = finishOrder.value.indexOf(0)
      const yourReward  = RANK_REWARDS[yourRank]
      let yourTotal     = yourReward
      if (yourRank === 3) yourTotal -= twoPenalty
      if (yourTotal >= 0) {
        overlayMoney.value    = '+$' + yourTotal + ' 🤑 (' + rankLabels[yourRank] + ')'
        overlayMoneyWin.value = true
      } else {
        overlayMoney.value    = '-$' + Math.abs(yourTotal) + ' (' + rankLabels[yourRank] + ')'
        overlayMoneyWin.value = false
      }

      overlayWallets.value = `You $${wallets.value[0]}  •  CPU1 $${wallets.value[1]}  •  CPU2 $${wallets.value[2]}  •  CPU3 $${wallets.value[3]}`
      overlayScore.value   = `Wins — You ${scores.value[0]}  •  CPU1 ${scores.value[1]}  •  CPU2 ${scores.value[2]}  •  CPU3 ${scores.value[3]}`

      if (lCards.length > 0) {
        loserCards.value       = lCards
        loserName.value        = loserPlayer === 0 ? 'Your' : 'CPU ' + loserPlayer + "'s"
        loserPenaltyText.value = twoPenalty > 0
          ? '🐷 Holding 2s penalty: ' + twoPenaltyDetails.join(', ') + ' → Total -$' + twoPenalty
          : ''
      } else {
        loserCards.value = []
      }
    }, 1500)
  }

  // ── Player Actions ─────────────────────────────────────────────────────────
  function toggleSelect(i) {
    if (current.value !== 0 || gameOver.value || passedPlayers.value.has(0)) return
    const idx = selected.value.indexOf(i)
    if (idx >= 0) { selected.value.splice(idx, 1); SFX.deselect() }
    else { selected.value.push(i); SFX.click() }
  }

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
    hands.value[0] = sortHand(hands.value[0])
    selected.value  = []
    lastPlayed.value = sortHand(cards)
    lastPlayer.value = 0
    passCount.value  = 0
    setMsg('')
    showPlayerAction(0, combo.label)
    if (hands.value[0].length === 0) {
      if (!finishOrder.value.includes(0)) finishOrder.value.push(0)
      if (finishOrder.value.length >= 3) { endGame(); return }
    }
    current.value = nextAlive(NEXT_TURN[0])
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
    showPlayerAction(0, 'PASS')
    advanceAfterPass()
  }

  // ── Round Helpers ──────────────────────────────────────────────────────────
  // Counter-Clockwise order: CPU 1(1) -> Me(0) -> CPU 2(2) -> CPU 3(3)
  const NEXT_TURN = { 0: 2, 2: 3, 3: 1, 1: 0 }

  function nextAlive(from) {
    let n = from
    let attempts = 0
    while ((hands.value[n].length === 0 || passedPlayers.value.has(n)) && attempts < 4) {
      n = NEXT_TURN[n]
      attempts++
    }
    return n
  }

  function advanceAfterPass() {
    const alivePlayers  = [0, 1, 2, 3].filter(p => hands.value[p].length > 0)
    
    const isLastPlayerAlive = alivePlayers.includes(lastPlayer.value)
    const requiredPasses = isLastPlayerAlive ? alivePlayers.length - 1 : alivePlayers.length

    if (passedPlayers.value.size >= requiredPasses) {
      let roundWinner = lastPlayer.value

      // CRITICAL FIX: If round winner has no cards, pass lead to next player who does (ignoring pass status)
      if (hands.value[roundWinner].length === 0) {
        let n = NEXT_TURN[roundWinner]
        while (hands.value[n].length === 0 && n !== roundWinner) {
          n = NEXT_TURN[n]
        }
        roundWinner = n
      }

      passCount.value         = 0
      lastPlayed.value        = []
      lastPlayer.value        = -1
      passedPlayers.value     = new Set()
      current.value           = roundWinner
      const winner            = roundWinner === 0 ? 'Your' : ('CPU ' + roundWinner)
      if (current.value !== 0) { setMsg(winner + ' leads freely!'); scheduleAiTurn() }
      else setMsg('Your turn — lead freely!')
      return
    }

    const next = nextAlive(NEXT_TURN[current.value])
    current.value = next
    if (current.value !== 0) scheduleAiTurn()
    else {
      if (lastPlayed.value.length === 0) setMsg('Your turn — lead freely!')
      else setMsg('Your turn!')
    }
  }

  // ── AI ─────────────────────────────────────────────────────────────────────
  function clearAiTimer() {
    if (aiActionTimer) { clearTimeout(aiActionTimer); aiActionTimer = null }
  }

  function clearDealTimer() {
    if (dealTimer) { clearTimeout(dealTimer); dealTimer = null }
  }

  function scheduleAiTurn() {
    const delay = 2000 + Math.floor(Math.random() * 3000)
    aiActionTimer = setTimeout(aiTurn, delay)
  }

  function aiTurn() {
    if (gameOver.value) return
    const p = current.value
    if (hands.value[p].length === 0) {
      current.value = nextAlive(NEXT_TURN[p])
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
      lastPlayed.value = sortHand(played)
      lastPlayer.value = p
      passCount.value  = 0
      setMsg('')
      showPlayerAction(p, aiCombo ? aiCombo.label : 'Played')
      if (hands.value[p].length === 0) {
        if (!finishOrder.value.includes(p)) finishOrder.value.push(p)
        if (finishOrder.value.length >= 3) { endGame(); return }
      }
      current.value = nextAlive(NEXT_TURN[p])
      if (current.value !== 0) scheduleAiTurn()
      else setMsg('Your turn!')
    } else {
      SFX.pass()
      setMsg('CPU ' + p + ' passed.')
      showPlayerAction(p, 'PASS')
      passCount.value++
      passedPlayers.value.add(p)
      advanceAfterPass()
    }
  }

  // ── Utilities ──────────────────────────────────────────────────────────────
  function resetScore() {
    scores.value         = [0, 0, 0, 0]
    wallets.value        = [1000, 1000, 1000, 1000]
    overlayMoney.value   = ''
    overlayWallets.value = 'Wallets & scores reset!'
    overlayScore.value   = ''
  }

  function confirmBet() {
    betAmount.value  = Math.max(1, betInput.value || 100)
    betModalOpen.value = false
  }

  function leaveRoom() {
    clearAiTimer()
    clearDealTimer()
    gameOver.value = true
    router.push({ name: 'home' })
  }

  onUnmounted(() => {
    clearAiTimer()
    clearDealTimer()
    if (actionTimer) clearTimeout(actionTimer)
    if (turnTimer) clearInterval(turnTimer)
  })

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    // state
    hands, current, lastPlayed, lastPlayer, passCount, passedPlayers, playerAction,
    selected, scores, gameOver, isDealing, betAmount, betInput, betModalOpen,
    wallets, finishOrder, lastWinner, msg, showOverlay,
    overlayTitle, overlayMsg, overlayMoney, overlayMoneyWin,
    overlayWallets, overlayScore, loserCards, loserName, loserPenaltyText, boomHands,
    turnTimeLeft,
    // computed
    isMyTurn, whosePlayText,
    // sound
    isMuted, toggleMute,
    // functions
    walletClass, cpuLabel, showCpuCards,
    newGame, toggleSelect, playSelected, pass,
    resetScore, confirmBet, leaveRoom,
  }
}
