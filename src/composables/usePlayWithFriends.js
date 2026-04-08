import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSound } from './useSound.js'
import { useFirebase } from './useFirebase.js'
import { createDeck, sortHand, classify, beats, checkInstantWin, aiLead, aiRespond } from './useCardLogic.js'

// ─── Composable ───────────────────────────────────────────────────────────────
export function usePlayWithFriends() {
  const router = useRouter()
  const { SFX, isMuted, toggleMute } = useSound()
  const fb = useFirebase()

  // ── State ──────────────────────────────────────────────────────────────────
  const screen         = ref('lobby')
  const lobbyView      = ref('main')
  const lobbyError     = ref('')
  const nickname       = ref(fb.getPlayerName() || '')
  const roomCodeInput  = ref('')
  const roomCode       = ref('')
  const isHost         = ref(false)
  const mySeat         = ref(-1)
  const playerCount    = ref(0)
  const copied         = ref(false)
  const slots          = ref({})              // seat => { name, pid }
  const gs             = ref(null)            // game state from Firebase
  const selectedSet    = ref(new Set())
  const turnTimeLeft   = ref(30)
  const TURN_TIME      = 30
  const showGameOverlay = ref(false)
  const gameOverTitle  = ref('')
  const gameOverMsg    = ref('')
  const gameOverScores = ref('')
  const boomHands      = ref([])
  const isBoom         = ref(false)
  const isDealing      = ref(false)
  const playerAction   = ref({ player: -1, text: '', id: 0 })

  let listeners  = []
  let turnTimer  = null
  let dealTimer  = null
  let actionTimer = null
  let cpuTimer   = null

  const playerId = fb.getPlayerId()

  // ── Computed seats ─────────────────────────────────────────────────────────
  const activeSeats   = computed(() => gs.value?.activeSeats || [0, 1, 2, 3])
  const topSeat       = computed(() => (mySeat.value + 2) % 4)
  const leftSeat      = computed(() => (mySeat.value + 3) % 4)
  const rightSeat     = computed(() => (mySeat.value + 1) % 4)
  const myHand        = computed(() => gs.value?.hands?.[mySeat.value] || [])

  const mpIsMyTurn = computed(() => {
    if (!gs.value || gs.value.gameOver || isDealing.value) return false
    return gs.value.current === mySeat.value && !(gs.value.finishOrder || []).includes(mySeat.value)
  })

  const canPass = computed(() => {
    if (!mpIsMyTurn.value || isDealing.value) return false
    const lp = gs.value?.lastPlayed || []
    if (lp.length === 0) return false
    if (gs.value?.lastPlayer === mySeat.value) return false
    return !(gs.value?.passedPlayers || []).includes(mySeat.value)
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

  // ── UI Helpers ─────────────────────────────────────────────────────────────
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

  function showPlayerAction(seat, text) {
    if (actionTimer) clearTimeout(actionTimer)
    playerAction.value = { player: seat, text, id: Date.now() }
    actionTimer = setTimeout(() => {
      playerAction.value = { player: -1, text: '', id: 0 }
    }, 1400)
  }

  function labelClass(seat) {
    if (!gs.value) return {}
    const fo = gs.value.finishOrder || []
    return {
      'active-player': gs.value.current === seat && !fo.includes(seat),
      'mp-finished':   fo.includes(seat),
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

  // ── Lobby Actions ──────────────────────────────────────────────────────────
  function showCreate() {
    if (!nickname.value.trim()) { lobbyError.value = 'Please enter a nickname'; SFX.error(); return }
    fb.setPlayerName(nickname.value.trim())
    lobbyView.value  = 'create'
    lobbyError.value = ''
  }

  function showJoin() {
    if (!nickname.value.trim()) { lobbyError.value = 'Please enter a nickname'; SFX.error(); return }
    fb.setPlayerName(nickname.value.trim())
    lobbyView.value  = 'join'
    lobbyError.value = ''
  }

  async function doCreateRoom() {
    try {
      SFX.join()
      const result   = await fb.createRoom(nickname.value.trim())
      roomCode.value = result.code
      mySeat.value   = result.seat
      isHost.value   = true
      setupListeners()
      screen.value   = 'waiting'
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
      const result   = await fb.joinRoom(code, nickname.value.trim())
      roomCode.value = result.code
      mySeat.value   = result.seat
      isHost.value   = false
      setupListeners()
      screen.value   = 'waiting'
    } catch (e) {
      lobbyError.value = e.message
      SFX.error()
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode.value).then(() => {
      copied.value = true
      setTimeout(() => (copied.value = false), 1500)
    })
  }

  // ── Firebase Listeners ─────────────────────────────────────────────────────
  function setupListeners() {
    const unsub1 = fb.listenPlayers(roomCode.value, (players) => {
      const newSlots = {}
      let count = 0
      Object.entries(players).forEach(([pid, p]) => {
        newSlots[p.seat] = { name: p.name, pid }
        count++
      })
      slots.value       = newSlots
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
    let prevGameOver = true  // start true so first game triggers deal
    const unsub = fb.listenGame(roomCode.value, (gameState) => {
      const wasGameOver  = prevGameOver
      prevGameOver       = gameState?.gameOver ?? true
      gs.value           = gameState
      if (!gameState) return
      selectedSet.value  = new Set()

    // Detect new game start: transition from gameOver to not gameOver
      if (wasGameOver && !gameState.gameOver) {
        triggerDealAnimation()
      }

      startTurnCountdown()
      if (gameState.gameOver) showGameOver()
      else showGameOverlay.value = false

      if (!isDealing.value) handleCpuTurn(gameState)
    })
    listeners.push(unsub)
  }

  function triggerDealAnimation() {
    if (dealTimer) { clearTimeout(dealTimer); dealTimer = null }
    isDealing.value = true
    SFX.deal()
    dealTimer = setTimeout(() => {
      isDealing.value = false
      dealTimer = null
      if (gs.value) handleCpuTurn(gs.value)
    }, 2800)
  }

  // ── CPU Multiplayer Logic ──────────────────────────────────────────────────
  function handleCpuTurn(gameState) {
    if (!isHost.value || gameState.gameOver || isDealing.value) return;
    const p = gameState.current;
    if (!gameState.cpuSeats?.includes(p)) return;
    if ((gameState.finishOrder || []).includes(p)) return;

    if (cpuTimer) clearTimeout(cpuTimer);
    cpuTimer = setTimeout(() => {
      executeCpuMove(gameState, p)
    }, 2000 + Math.floor(Math.random() * 2000));
  }

  async function executeCpuMove(gameState, p) {
    if (!isHost.value || gameState.gameOver || gameState.current !== p) return;
    
    const hand = gameState.hands[p] || []
    if (hand.length === 0) return mpPassForCpu(gameState, p)

    const lastPlayed = gameState.lastPlayed || []
    const isFree = lastPlayed.length === 0 || gameState.lastPlayer === p
    
    let playedCards = isFree
       ? aiLead(p, gameState.hands)
       : aiRespond(p, lastPlayed, gameState.hands, gameState.lastPlayer)

    if (playedCards && playedCards.length > 0) {
       SFX.play()
       const combo = classify(playedCards)
       const newHand = [...hand]
       playedCards.forEach(c => {
         const idx = newHand.findIndex(x => x.rank === c.rank && x.suit === c.suit)
         if (idx >= 0) newHand.splice(idx, 1)
       })
       
       let finished = newHand.length === 0
       const finishOrder = [...(gameState.finishOrder || [])]
       const names = gameState.names || {}
       if (finished) finishOrder.push(p)

       const activeSts = gameState.activeSeats || [0, 1, 2, 3]
       let currentPassedList = [...(gameState.passedPlayers || [])]
       if (finished) currentPassedList = []
       
       let next = findNextPlayer(p, finishOrder, activeSts, currentPassedList)
       if (next === p && !finished) {
         currentPassedList = []
         next = findNextPlayer(p, finishOrder, activeSts, currentPassedList)
       }

       const isGameOver = finishOrder.length >= activeSts.length - 1
       if (isGameOver) {
         for (const s of activeSts) { if (!finishOrder.includes(s)) { finishOrder.push(s); break } }
       }

       let message = (names[p] || 'CPU') + ' played ' + playedCards.map(x => x.rank + x.suit).join(' ')
       if (finished) message += ' — FINISHED! 🎉'

       let update = {
         ['hands/' + p]: newHand,
         current: isGameOver ? -1 : next,
         lastPlayed: sortHand(playedCards),
         lastPlayer: p,
         passCount: 0, passedPlayers: currentPassedList,
         finishOrder, gameOver: isGameOver, message
       }

       if (isGameOver) {
         const scores = [...(gameState.scores || [0,0,0,0])]
         const numPlayers = activeSts.length
         for (let i = 0; i < finishOrder.length; i++) {
            scores[finishOrder[i]] += Math.max(numPlayers - 1 - i, 0)
         }
         update.scores = scores
       }
       showPlayerAction(p, combo ? combo.label : 'Played')
       await fb.updateGameState(roomCode.value, update)
    } else {
       await mpPassForCpu(gameState, p)
    }
  }

  async function mpPassForCpu(gameState, p) {
    if (!isHost.value) return;
    SFX.pass()
    showPlayerAction(p, 'PASS')

    const passedList = gameState.passedPlayers || []
    const finishOrder = gameState.finishOrder || []
    const activeSts = gameState.activeSeats || [0, 1, 2, 3]
    const names = gameState.names || {}

    const newPassedPlayers = [...passedList, p]

    const alivePlayers = activeSts.filter(s => {
       return (gameState.hands[s] || []).length > 0 && !finishOrder.includes(s)
    })

    const isLastPlayerAlive = alivePlayers.includes(gameState.lastPlayer)
    const requiredPasses = isLastPlayerAlive ? alivePlayers.length - 1 : alivePlayers.length

    if (newPassedPlayers.length >= requiredPasses) {
      let roundWinner = gameState.lastPlayer
      const winnerHand = gameState.hands[roundWinner] || []
      if (winnerHand.length === 0 || finishOrder.includes(roundWinner)) {
         roundWinner = findNextPlayer(roundWinner, finishOrder, activeSts, [])
      }

      await fb.updateGameState(roomCode.value, {
         current: roundWinner, lastPlayed: [], lastPlayer: -1,
         passCount: 0, passedPlayers: [],
         message: (names[roundWinner] || 'Player') + "'s free turn"
      })
      return
    }

    const next = findNextPlayer(p, finishOrder, activeSts, newPassedPlayers)
    await fb.updateGameState(roomCode.value, {
      current: next, passCount: (gameState.passCount || 0) + 1,
      passedPlayers: newPassedPlayers,
      message: (names[p] || 'CPU') + ' passed'
    })
  }

  // ── Game Start ─────────────────────────────────────────────────────────────
  async function doStartGame() {
    if (!isHost.value) return
    SFX.play()

    const nameMap  = {}
    const activeSts = []
    const cpuSeats  = []
    let cpuIndex    = 1
    
    Object.entries(slots.value).forEach(([seat, data]) => {
      const s = parseInt(seat)
      nameMap[s] = data.name
      activeSts.push(s)
    })

    // Auto-fill CPU players for missing seats
    for (let c = 0; c < 4; c++) {
      if (!activeSts.includes(c)) {
        nameMap[c] = `CPU ${cpuIndex++}`
        activeSts.push(c)
        cpuSeats.push(c)
      }
    }
    activeSts.sort((a, b) => a - b)

    const deck  = createDeck()
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
        finishOrder: fo, scores, wallets: [1000, 1000, 1000, 1000], betAmount: 100,
        gameOver: true, message: '💣 ' + nameMap[boomWinner] + ' has ' + boomReason + ' — INSTANT WIN! 💣',
        names: nameMap, activeSeats: activeSts, passedPlayers: [], cpuSeats,
        fourTwosBoom: boomWinner, boomReason,
      })
    } else {
      await fb.setGameState(roomCode.value, {
        hands, current: starter, lastPlayed: [], lastPlayer: -1, passCount: 0,
        finishOrder: [], scores: [0, 0, 0, 0], wallets: [1000, 1000, 1000, 1000], betAmount: 100,
        gameOver: false, message: nameMap[starter] + ' starts (has 3♠)',
        names: nameMap, activeSeats: activeSts, passedPlayers: [], cpuSeats,
      })
    }
    await fb.setStatus(roomCode.value, 'playing')
  }

  // ── Play / Pass ────────────────────────────────────────────────────────────
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
    const hand  = gs.value.hands[mySeat.value]
    const cards = [...selectedSet.value].map(i => hand[i])
    if (cards.length === 0) { SFX.error(); return }

    const combo = classify(cards)
    if (!combo) { SFX.error(); return }

    const lastP      = gs.value.lastPlayed || []
    const isFreePlay = lastP.length === 0 || gs.value.lastPlayer === mySeat.value
    if (!isFreePlay && !beats(combo, lastP)) { SFX.error(); return }

    SFX.play()

    const newHand     = sortHand(hand.filter((_, i) => !selectedSet.value.has(i)))
    const finishOrder = [...(gs.value.finishOrder || [])]
    const names       = gs.value.names || {}
    let finished      = false
    if (newHand.length === 0) { finishOrder.push(mySeat.value); finished = true }

    const activeSts         = gs.value.activeSeats || [0, 1, 2, 3]
    let currentPassedList   = [...(gs.value.passedPlayers || [])]
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
      lastPlayed: sortHand(cards), lastPlayer: mySeat.value,
      passCount: 0, passedPlayers: currentPassedList,
      finishOrder, gameOver: isGameOver, message,
    }

    if (isGameOver) {
      const scores    = [...(gs.value.scores || [0, 0, 0, 0])]
      const numPlayers = activeSts.length
      for (let i = 0; i < finishOrder.length; i++) {
        scores[finishOrder[i]] += Math.max(numPlayers - 1 - i, 0)
      }
      update.scores = scores
    }

    selectedSet.value = new Set()
    showPlayerAction(mySeat.value, combo.label)
    await fb.updateGameState(roomCode.value, update)
  }

  async function mpPass() {
    if (!gs.value) return
    const passedList = gs.value.passedPlayers || []
    if (gs.value.current !== mySeat.value || gs.value.gameOver || passedList.includes(mySeat.value)) return
    SFX.pass()
    showPlayerAction(mySeat.value, 'PASS')

    const finishOrder       = gs.value.finishOrder || []
    const names             = gs.value.names || {}
    const activeSts         = gs.value.activeSeats || [0, 1, 2, 3]
    const newPassedPlayers  = [...passedList, mySeat.value]

    const alivePlayers  = activeSts.filter(s => {
      const hand = gs.value.hands[s] || []
      return hand.length > 0 && !finishOrder.includes(s)
    })
    const activePlayers = alivePlayers.filter(s => !newPassedPlayers.includes(s))

    const isLastPlayerAlive = alivePlayers.includes(gs.value.lastPlayer)
    const requiredPasses = isLastPlayerAlive ? alivePlayers.length - 1 : alivePlayers.length

    if (newPassedPlayers.length >= requiredPasses) {
      let roundWinner = gs.value.lastPlayer

      // CRITICAL FIX: If round winner has no cards, pass lead to next player who does
      const winnerHand = gs.value.hands[roundWinner] || []
      if (winnerHand.length === 0 || finishOrder.includes(roundWinner)) {
        roundWinner = findNextPlayer(roundWinner, finishOrder, activeSts, [])
      }

      await fb.updateGameState(roomCode.value, {
        current: roundWinner, lastPlayed: [], lastPlayer: -1,
        passCount: 0, passedPlayers: [],
        message: (names[roundWinner] || 'Player') + "'s free turn",
      })
      return
    }

    const next = findNextPlayer(mySeat.value, finishOrder, activeSts, newPassedPlayers)
    await fb.updateGameState(roomCode.value, {
      current: next, passCount: (gs.value.passCount || 0) + 1,
      passedPlayers: newPassedPlayers,
      message: (names[mySeat.value] || 'Player') + ' passed',
    })
  }

  function findNextPlayer(currentSeat, finishOrder, activeSts, passedList) {
    const seats      = activeSts || [0, 1, 2, 3]
    const passed     = passedList || []
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

  // ── Timer ──────────────────────────────────────────────────────────────────
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

  // ── Game Over ──────────────────────────────────────────────────────────────
  function showGameOver() {
    showGameOverlay.value  = true
    const fo               = gs.value.finishOrder || []
    const names            = gs.value.names || {}
    const activeSts        = gs.value.activeSeats || [0, 1, 2, 3]
    const isFourTwosBoom   = gs.value.fourTwosBoom !== undefined && gs.value.fourTwosBoom >= 0

    isBoom.value = isFourTwosBoom

    const numPlayers = activeSts.length
    let titles
    if (numPlayers === 2)      titles = ['🏆 Winner!', '💀 Loser']
    else if (numPlayers === 3) titles = ['🥇 1st Place!', '🥈 2nd Place!', '💀 Last Place']
    else                       titles = ['🥇 1st Place!', '🥈 2nd Place!', '🥉 3rd Place!', '💀 Last Place']

    const myPos = fo.indexOf(mySeat.value)

    if (isFourTwosBoom) {
      const boomPlayer       = gs.value.fourTwosBoom
      const boomName         = names[boomPlayer] || 'Player'
      const reason           = gs.value.boomReason || 'FOUR 2s'
      gameOverTitle.value    = '💣 ' + reason + ' BOOM! 💣'
      gameOverMsg.value      = boomName + ' — INSTANT WIN!'
      boomHands.value        = activeSts.map(seat => ({
        name:   names[seat] || 'Player ' + (seat + 1),
        winner: seat === boomPlayer,
        cards:  gs.value.hands?.[seat] || [],
      }))
    } else {
      gameOverTitle.value = myPos >= 0 ? titles[myPos] : 'Game Over'
      gameOverMsg.value   = fo.map((seat, i) =>
        '<div>' + (titles[i] || (i + 1) + 'th') + ': <strong>' + (names[seat] || 'Player') + '</strong></div>'
      ).join('')
      boomHands.value = []
    }

    const scores         = gs.value.scores || [0, 0, 0, 0]
    gameOverScores.value = 'Scores: ' + activeSts.map(i => (names[i] || 'P' + (i + 1)) + ': ' + scores[i]).join(' | ')

    if (isFourTwosBoom && gs.value.fourTwosBoom === mySeat.value) SFX.win()
    else if (myPos === 0) SFX.win()
  }

  async function doHostNewGame() {
    if (!isHost.value) return
    showGameOverlay.value = false

    const nameMap   = {}
    const activeSts = []
    const cpuSeats  = []
    let cpuIndex    = 1
    Object.entries(slots.value).forEach(([seat, data]) => {
      const s = parseInt(seat)
      nameMap[s] = data.name
      activeSts.push(s)
    })

    for (let c = 0; c < 4; c++) {
      if (!activeSts.includes(c)) {
        nameMap[c] = `CPU ${cpuIndex++}`
        activeSts.push(c)
        cpuSeats.push(c)
      }
    }
    activeSts.sort((a, b) => a - b)

    const deck  = createDeck()
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
        finishOrder: fo, scores, wallets: gs.value?.wallets || [1000, 1000, 1000, 1000],
        betAmount: gs.value?.betAmount || 100, gameOver: true,
        message: '💣 ' + nameMap[boomWinner] + ' has ' + boomReason + ' — INSTANT WIN! 💣',
        names: nameMap, activeSeats: activeSts, passedPlayers: [], cpuSeats,
        fourTwosBoom: boomWinner, boomReason,
      })
    } else {
      await fb.setGameState(roomCode.value, {
        hands, current: starter, lastPlayed: [], lastPlayer: -1, passCount: 0,
        finishOrder: [], scores, wallets: gs.value?.wallets || [1000, 1000, 1000, 1000],
        betAmount: gs.value?.betAmount || 100, gameOver: false,
        message: nameMap[starter] + ' starts (winner goes first)',
        names: nameMap, activeSeats: activeSts, passedPlayers: [], cpuSeats,
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
    gs.value          = null
    mySeat.value      = -1
    selectedSet.value = new Set()
    router.push({ name: 'home' })
  }

  onUnmounted(() => {
    clearInterval(turnTimer)
    if (dealTimer) { clearTimeout(dealTimer); dealTimer = null }
    if (actionTimer) { clearTimeout(actionTimer); actionTimer = null }
    listeners.forEach(fn => fn())
    listeners = []
  })

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    // state
    screen, lobbyView, lobbyError, nickname, roomCodeInput, roomCode,
    isHost, mySeat, playerCount, copied, slots, gs,
    selectedSet, turnTimeLeft, showGameOverlay, isDealing, playerAction,
    gameOverTitle, gameOverMsg, gameOverScores, boomHands, isBoom,
    // computed
    activeSeats, topSeat, leftSeat, rightSeat, myHand,
    mpIsMyTurn, canPass, amPassed, whosePlayText,
    // sound
    isMuted, toggleMute,
    // UI helpers
    labelText, labelClass, seatName, opponentCardCount,
    slotFilled, slotClass, slotText,
    // lobby
    showCreate, showJoin, doCreateRoom, doJoinRoom, copyCode,
    // game
    toggleSelect, mpPlaySelected, mpPass,
    doStartGame, doHostNewGame, doLeaveRoom,
  }
}
