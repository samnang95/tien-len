// ═══════════════════════════════════════════════════════════════
// FIREBASE COMPOSABLE — Multiplayer Room Management
// ═══════════════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app'
import { getDatabase, ref as dbRef, set, get, update, remove, onValue, off, serverTimestamp, child } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSy8hgWb4INKU1418pGaxdqUhtrtQV8BC8is",
  authDomain: "tien-len-ac1a2.firebaseapp.com",
  databaseURL: "https://tien-len-ac1a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tien-len-ac1a2",
  storageBucket: "tien-len-ac1a2.firebasestorage.app",
  messagingSenderId: "554951223890",
  appId: "1:554951223890:web:2ef967c27a96f453d1cd8b"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

// Player ID persistence
let playerId = localStorage.getItem('tl_pid')
if (!playerId) {
  playerId = 'p_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  localStorage.setItem('tl_pid', playerId)
}

export function useFirebase() {
  function getPlayerId() { return playerId }

  function getPlayerName() {
    return localStorage.getItem('tl_pname') || ''
  }
  function setPlayerName(name) {
    localStorage.setItem('tl_pname', name)
  }

  function roomRef(code) { return dbRef(db, 'rooms/' + code) }
  function playersRef(code) { return child(dbRef(db, 'rooms/' + code), 'players') }
  function gameRef(code) { return child(dbRef(db, 'rooms/' + code), 'game') }
  function statusRef(code) { return child(dbRef(db, 'rooms/' + code), 'status') }

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
  }

  async function createRoom(playerName) {
    let code = generateRoomCode()
    let ref = roomRef(code)
    const snap = await get(ref)
    if (snap.exists()) {
      code = generateRoomCode()
      ref = roomRef(code)
    }
    await set(ref, {
      host: playerId,
      status: 'waiting',
      createdAt: serverTimestamp(),
      players: {
        [playerId]: { name: playerName, seat: 0, connected: true }
      }
    })
    return { code, seat: 0 }
  }

  async function joinRoom(code, playerName) {
    const ref = roomRef(code)
    const snap = await get(ref)
    if (!snap.exists()) throw new Error('Room not found')
    const room = snap.val()
    if (room.status !== 'waiting') throw new Error('Game already in progress')
    const players = room.players || {}
    const playerCount = Object.keys(players).length
    if (playerCount >= 4) throw new Error('Room is full (4/4)')
    const takenSeats = Object.values(players).map(p => p.seat)
    const seat = [0, 1, 2, 3].find(s => !takenSeats.includes(s))
    await set(child(playersRef(code), playerId), {
      name: playerName, seat, connected: true
    })
    return { code, seat }
  }

  function listenPlayers(code, callback) {
    const ref = playersRef(code)
    const unsub = onValue(ref, (snap) => callback(snap.val() || {}))
    return () => off(ref, 'value', unsub)
  }

  function listenStatus(code, callback) {
    const ref = statusRef(code)
    const unsub = onValue(ref, (snap) => callback(snap.val()))
    return () => off(ref, 'value', unsub)
  }

  function listenGame(code, callback) {
    const ref = gameRef(code)
    const unsub = onValue(ref, (snap) => callback(snap.val()))
    return () => off(ref, 'value', unsub)
  }

  async function setGameState(code, state) {
    await set(gameRef(code), { ...state, turnStartedAt: serverTimestamp() })
  }

  async function updateGameState(code, updates) {
    await update(gameRef(code), { ...updates, turnStartedAt: serverTimestamp() })
  }

  async function setStatus(code, status) {
    await set(statusRef(code), status)
  }

  async function leaveRoom(code, isHost) {
    await remove(child(playersRef(code), playerId))
    if (isHost) await remove(roomRef(code))
  }

  return {
    getPlayerId,
    getPlayerName,
    setPlayerName,
    generateRoomCode,
    createRoom,
    joinRoom,
    listenPlayers,
    listenStatus,
    listenGame,
    setGameState,
    updateGameState,
    setStatus,
    leaveRoom,
    serverTimestamp,
  }
}
