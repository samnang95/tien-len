<template>
  <div>
  <!-- LOBBY SCREEN -->
  <div v-if="screen === 'lobby'" class="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden"
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
          PLAY WITH FRIENDS
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
  <div v-if="screen === 'waiting'" class="fixed inset-0 z-9998 flex items-center justify-center overflow-hidden"
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

        <button @click="doLeaveRoom" class="lobby-back-btn" style="margin-top: 20px;">← Leave Game</button>
      </div>
    </div>
  </div>

  <!-- GAME TABLE -->
  <div v-if="screen === 'game'"
    class="flex flex-col items-center w-full min-h-dvh pb-2.5 relative overflow-x-hidden animate-[gameRoomFadeIn_0.6s_ease-out] bg-felt-dark bg-[url('/images/felt_background.png')] bg-center bg-cover bg-fixed gap-1.5">

    <!-- Filigree overlay -->
    <div class="fixed inset-0 pointer-events-none z-[-1] opacity-[0.04]"
      style="background-image: radial-gradient(ellipse 80px 80px at 20% 30%, rgba(212,168,67,0.6) 0%, transparent 70%), radial-gradient(ellipse 60px 60px at 80% 20%, rgba(212,168,67,0.4) 0%, transparent 70%), radial-gradient(ellipse 100px 100px at 50% 70%, rgba(212,168,67,0.5) 0%, transparent 70%), radial-gradient(ellipse 50px 50px at 10% 80%, rgba(212,168,67,0.3) 0%, transparent 70%), radial-gradient(ellipse 70px 70px at 90% 85%, rgba(212,168,67,0.4) 0%, transparent 70%); background-size: 200px 200px; background-repeat: repeat;"></div>

    <img src="/images/game_logo.png" alt="Tiến Lên"
      class="mt-1 rounded-xl w-[100px] relative z-1 max-md:w-[60px] max-md:mt-px max-[480px]:w-[50px] max-[400px]:w-[40px]"
      style="filter: drop-shadow(0 4px 20px rgba(212,168,67,0.4));" />
    <p class="text-[0.7rem] text-white/35 tracking-[0.2em] mb-2 relative z-1 max-md:text-[0.5rem] max-md:mb-px max-[480px]:text-[0.42rem] max-[400px]:hidden">
      Play with Friends — Room {{ roomCode }}
    </p>

    <!-- Scoreboard -->
    <div class="flex gap-3 flex-wrap justify-center relative z-1 max-md:gap-1.5 max-[480px]:gap-1">
      <div v-for="seat in activeSeats" :key="'sc'+seat"
        class="border border-gold/40 text-[0.78rem] text-gold-light backdrop-blur-sm max-md:text-[0.62rem] max-[480px]:text-[0.52rem] max-[400px]:text-[0.44rem]"
        style="background: #0f3d25; border-radius: 48px; padding: 2px 18px;">
        {{ gs?.names?.[seat] || 'P'+(seat+1) }} <span class="text-white font-bold">{{ gs?.scores?.[seat] || 0 }}</span>
      </div>
    </div>

    <!-- TABLE WRAPPER -->
    <div class="relative z-1 p-2 flex flex-col flex-1 w-[min(1200px,99vw)] max-md:p-[3px] max-md:w-screen max-[480px]:p-[2px]">
      <div class="r2-rope-border"></div>
      <div class="r2-table-surface flex-1 w-full" style="min-height: 0;">

        <!-- Opponent top -->
        <div v-if="activeSeats.includes(topSeat)" class="w-full flex-1 flex flex-col items-center justify-center gap-1.5">
          <div class="relative">
            <div class="player-label-side" :class="labelClass(topSeat)">{{ labelText(topSeat) }}</div>
            <div v-if="playerAction.player === topSeat" :key="playerAction.id" class="player-action-bubble"
              :class="{ 'pass-action': playerAction.text === 'PASS' }">{{ playerAction.text }}</div>
          </div>
          <div class="flex flex-nowrap justify-center min-h-[50px] max-[480px]:min-h-8 max-[400px]:min-h-6">
            <div v-for="j in opponentCardCount(topSeat)" :key="j" class="r2-card-sm-h"
              :class="{ 'deal-to-top': isDealing, 'turn-card-glow': gs?.current === topSeat && !gs?.gameOver }"
              :style="isDealing ? { animationDelay: ((j-1) * 4 + 2) * 45 + 'ms' } : {}"></div>
          </div>
        </div>

        <!-- Middle row -->
        <div class="flex-1 flex w-full gap-2.5 items-stretch max-md:gap-[3px] max-[480px]:gap-0.5">
          <!-- Left -->
          <div v-if="activeSeats.includes(leftSeat)"
            class="shrink-0 w-1/4 flex flex-row items-center justify-center gap-1 max-md:w-[15%] max-[480px]:w-[12%]">
            <div class="relative">
              <div class="player-label-side -rotate-90" :class="labelClass(leftSeat)">{{ labelText(leftSeat) }}</div>
              <div v-if="playerAction.player === leftSeat" :key="playerAction.id" class="player-action-bubble"
                :class="{ 'pass-action': playerAction.text === 'PASS' }">{{ playerAction.text }}</div>
            </div>
            <div class="flex flex-col items-center">
              <div v-for="j in opponentCardCount(leftSeat)" :key="j" class="r2-card-sm-v"
                :class="{ 'deal-to-left': isDealing, 'turn-card-glow': gs?.current === leftSeat && !gs?.gameOver }"
                :style="isDealing ? { animationDelay: ((j-1) * 4 + 1) * 45 + 'ms' } : {}"></div>
            </div>
          </div>

          <!-- Play Area -->
          <div class="flex-1 min-h-[120px] rounded-2xl border border-white/6 flex flex-col items-center justify-center gap-1.5 p-3 max-md:min-h-[70px] max-md:p-1.5 max-md:gap-[3px] max-[480px]:min-h-[55px] max-[480px]:p-1 max-[480px]:gap-0.5 max-[480px]:rounded-[10px] max-[400px]:min-h-[45px] max-[400px]:p-[3px]"
            style="background: radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.25) 100%); box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
            <!-- Dealing visual -->
            <template v-if="isDealing">
              <div class="deal-center">
                <div class="deal-deck-pile">
                  <div v-for="i in 6" :key="i" class="deal-deck-card"
                    :style="{ transform: `translateX(${(i-3)*0.8}px) translateY(${-i*1.5}px)`, opacity: 1 - i * 0.06 }"></div>
                </div>
                <div class="deal-label">DEALING<span class="deal-ellipsis"></span></div>
              </div>
            </template>
            <!-- Normal play area -->
            <template v-else>
              <div class="text-[0.6rem] tracking-[0.25em] text-white/25 uppercase max-md:text-[0.4rem] max-[480px]:text-[0.35rem] max-[480px]:tracking-[0.15em] max-[400px]:text-[0.3rem]">LAST PLAYED</div>
              <div class="flex flex-nowrap justify-center min-h-[90px] my-2 max-md:min-h-[60px] max-md:my-[3px] max-[480px]:min-h-[50px] max-[480px]:my-0.5">
                <PlayingCard v-for="(c, j) in (gs?.lastPlayed || [])" :key="c.rank + c.suit" :card="c"
                  class="cursor-default! played-card played-card-glow" :class="playAnimClass"
                  :style="{ animationDelay: j * 80 + 'ms' }" />
              </div>
              <div class="text-[0.82rem] italic text-gold-light max-md:text-[0.5rem] max-[480px]:text-[0.42rem] max-[400px]:text-[0.38rem]">{{ whosePlayText }}</div>
              <div class="text-[0.95rem] min-h-[1.3em] text-[#f9ca24] max-md:text-[0.55rem] max-[480px]:text-[0.48rem] max-[400px]:text-[0.42rem]"
                style="font-family: var(--font-cinzel);">{{ gs?.message || '' }}</div>
              <div class="flex items-center justify-center gap-2 mt-1 min-h-7 max-md:min-h-5 max-md:mt-px max-[480px]:min-h-4">
                <span v-if="turnTimeLeft > 0 && !gs?.gameOver" class="font-bold transition-colors duration-500"
                  :class="turnTimeLeft <= 5 ? 'text-[#e74c3c]' : turnTimeLeft <= 15 ? 'text-[#f39c12]' : 'text-[#2ecc71]'"
                  style="font-family: var(--font-cinzel); font-size: 0.9rem;">{{ turnTimeLeft }}s</span>
              </div>
            </template>
          </div>

          <!-- Right -->
          <div v-if="activeSeats.includes(rightSeat)"
            class="shrink-0 w-1/4 flex flex-row items-center justify-center gap-1 max-md:w-[15%] max-[480px]:w-[12%]">
            <div class="flex flex-col items-center">
              <div v-for="j in opponentCardCount(rightSeat)" :key="j" class="r2-card-sm-v"
                :class="{ 'deal-to-right': isDealing, 'turn-card-glow': gs?.current === rightSeat && !gs?.gameOver }"
                :style="isDealing ? { animationDelay: ((j-1) * 4 + 3) * 45 + 'ms' } : {}"></div>
            </div>
            <div class="relative">
              <div class="player-label-side rotate-90" :class="labelClass(rightSeat)">{{ labelText(rightSeat) }}</div>
              <div v-if="playerAction.player === rightSeat" :key="playerAction.id" class="player-action-bubble"
                :class="{ 'pass-action': playerAction.text === 'PASS' }">{{ playerAction.text }}</div>
            </div>
          </div>
        </div>

        <!-- YOUR HAND -->
        <div class="w-full flex-1 flex flex-col items-center justify-center gap-1.5">
          <div class="relative inline-flex flex-col items-center">
            <div class="player-label-side" :class="labelClass(mySeat)">{{ labelText(mySeat) }} (You)</div>
            <div v-if="playerAction.player === mySeat" :key="playerAction.id" class="player-action-bubble"
              :class="{ 'pass-action': playerAction.text === 'PASS' }">{{ playerAction.text }}</div>
          </div>
          <div class="flex flex-nowrap justify-center px-5 transition-opacity duration-300 max-md:px-1 max-[480px]:px-0.5"
            :style="{ opacity: amPassed ? 0.5 : 1, minHeight: 'var(--card-h)' }">
            <PlayingCard v-for="(c, j) in myHand" :key="j" :card="c"
              :selected="selectedSet.has(j)" class="your-card"
              :class="{ 'deal-to-bottom': isDealing }"
              :style="isDealing ? { animationDelay: (j * 4) * 45 + 'ms', pointerEvents: 'none' } : {}"
              @click="toggleSelect(j)" />
          </div>
          <div class="flex gap-2.5 mt-1 max-md:gap-2 max-md:mt-px max-[480px]:gap-1.5">
            <button class="btn btn-play" :disabled="!mpIsMyTurn" @click="mpPlaySelected">Play</button>
            <button class="btn btn-pass" :disabled="!canPass" @click="mpPass">Pass</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Win Overlay -->
    <div v-if="showGameOverlay" class="overlay-backdrop">
      <div class="overlay-box max-md:p-4 max-md:w-[92vw] max-md:max-w-[400px] max-md:max-h-[85vh] max-md:overflow-y-auto" :class="{ 'max-w-[700px]! w-[94vw]!': isBoom }">
        <h2>{{ gameOverTitle }}</h2>
        <div v-html="gameOverMsg" class="mb-3"></div>
        <div class="text-xs text-white/40 mb-3">{{ gameOverScores }}</div>
        <div v-if="boomHands.length > 0">
          <div v-for="(bh, i) in boomHands" :key="i" class="boom-player-row">
            <div class="boom-player-name">{{ bh.name }}{{ bh.winner ? ' 👑' : '' }}</div>
            <div class="boom-hand">
              <PlayingCard v-for="(c, j) in bh.cards" :key="j" :card="c" class="boom-card cursor-default! hover:transform-none!" />
            </div>
          </div>
        </div>
        <div class="flex gap-3 justify-center flex-wrap">
          <button v-if="isHost" class="btn btn-new" @click="doHostNewGame">▶ New Game</button>
        </div>
        <p v-if="!isHost" style="font-family: 'Press Start 2P', monospace; font-size: 0.45rem; color: rgba(240,201,110,0.7); margin-top: 12px; animation: hintBlink 2s ease-in-out infinite;">
          ⏳ Waiting for host to start next game...
        </p>
        <button @click="doLeaveRoom" class="lobby-back-btn mt-3">← Leave Game</button>
      </div>
    </div>

    <GameToolbar :muted="isMuted" :show-reset="false" @toggle-mute="toggleMute" @new-game="doHostNewGame" @leave="doLeaveRoom" />
  </div>
  </div>
</template>

<script setup>
import { usePlayWithFriends } from '../composables/usePlayWithFriends.js'
import { computed } from 'vue'
import PlayingCard from '../components/PlayingCard.vue'
import GameToolbar from '../components/GameToolbar.vue'
import PixelStars from '../components/PixelStars.vue'
import PixelClouds from '../components/PixelClouds.vue'

const {
  screen, lobbyView, lobbyError, nickname, roomCodeInput, roomCode,
  isHost, mySeat, playerCount, copied, slots, gs,
  selectedSet, turnTimeLeft, showGameOverlay, isDealing, playerAction,
  gameOverTitle, gameOverMsg, gameOverScores, boomHands, isBoom,
  activeSeats, topSeat, leftSeat, rightSeat, myHand,
  mpIsMyTurn, canPass, amPassed, whosePlayText,
  isMuted, toggleMute,
  labelText, labelClass, seatName, opponentCardCount,
  slotFilled, slotClass, slotText,
  showCreate, showJoin, doCreateRoom, doJoinRoom, copyCode,
  toggleSelect, mpPlaySelected, mpPass,
  doStartGame, doHostNewGame, doLeaveRoom,
} = usePlayWithFriends()

const playAnimClass = computed(() => {
  if (!gs.value) return ''
  const p = gs.value.lastPlayer
  if (p === undefined || p < 0 || (gs.value.lastPlayed || []).length === 0) return ''
  if (p === mySeat.value) return 'play-from-bottom'
  if (p === topSeat.value) return 'play-from-top'
  if (p === leftSeat.value) return 'play-from-left'
  if (p === rightSeat.value) return 'play-from-right'
  return ''
})
</script>



<style>
.lobby-panel {
  position: relative; z-index: 10;
  width: min(520px, 92vw); padding: 4px; border-radius: 12px;
  background: linear-gradient(135deg, #237a4b, #1a5c38, #0f3d25);
  box-shadow: 0 0 40px rgba(35,122,75,0.4), 0 0 80px rgba(35,122,75,0.15), inset 0 1px 0 rgba(255,255,255,0.2);
}
.lobby-label { font-family: 'Press Start 2P', monospace; font-size: 0.5rem; color: rgba(240,201,110,0.8); letter-spacing: 0.1em; display: block; margin-bottom: 6px; text-transform: uppercase; }
.lobby-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 2px solid rgba(212,168,67,0.3); background: rgba(0,0,0,0.4); color: #fff; font-family: 'Press Start 2P', monospace; font-size: 0.7rem; outline: none; transition: border-color 0.2s; }
.lobby-input:focus { border-color: rgba(212,168,67,0.8); box-shadow: 0 0 12px rgba(212,168,67,0.2); }
.lobby-input::placeholder { color: rgba(255,255,255,0.25); font-family: 'Press Start 2P', monospace; font-size: 0.55rem; }
.lobby-info { font-family: 'Press Start 2P', monospace; font-size: 0.5rem; color: rgba(240,201,110,0.6); margin-bottom: 16px; }
.lobby-back-btn { display: inline-block; margin-top: 12px; background: none; border: none; color: rgba(240,201,110,0.5); font-family: 'Press Start 2P', monospace; font-size: 0.45rem; cursor: pointer; transition: color 0.15s; }
.lobby-back-btn:hover { color: rgba(240,201,110,0.9); }
.lobby-error { font-family: 'Press Start 2P', monospace; font-size: 0.45rem; color: #ff6b6b; padding: 8px 12px; background: rgba(255,50,50,0.1); border: 1px solid rgba(255,50,50,0.3); border-radius: 6px; }

.pixel-play-btn-sm { display: inline-flex; align-items: center; gap: 8px; padding: 12px 30px; border: none; border-radius: 8px; color: #fff; font-family: 'Press Start 2P', monospace; font-size: clamp(0.65rem, 1.5vw, 0.85rem); cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; text-shadow: 0 2px 0 rgba(0,0,0,0.3); letter-spacing: 0.1em; animation: playPulse 1.5s ease-in-out infinite; }
.pixel-play-btn-sm.orange { background: linear-gradient(180deg, #ff8844, #ff6622, #dd4400); box-shadow: 0 4px 0 #aa3300, 0 6px 20px rgba(255,100,30,0.4); }
.pixel-play-btn-sm.green { background: linear-gradient(180deg, #27ae60, #1e8449, #196f3d); box-shadow: 0 4px 0 #145a32, 0 6px 20px rgba(39,174,96,0.4); }
.pixel-play-btn-sm:hover { transform: translateY(-2px); }
.pixel-play-btn-sm:active { transform: translateY(2px); }

.player-slot { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
.player-slot.filled { border-color: rgba(46,204,113,0.5); background: rgba(46,204,113,0.08); }
.player-slot.is-you { border-color: rgba(212,168,67,0.6); background: rgba(212,168,67,0.08); }
.slot-num { width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-family: 'Press Start 2P', monospace; font-size: 0.5rem; color: rgba(255,255,255,0.4); flex-shrink: 0; }
.slot-name { font-family: 'Press Start 2P', monospace; font-size: 0.5rem; color: rgba(255,255,255,0.3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.r2-rope-border {
  position: absolute; inset: 0; border-radius: 48px; border: 4px solid transparent;
  background: transparent padding-box, linear-gradient(135deg, rgba(200,170,90,0.5), rgba(160,130,70,0.3), rgba(200,170,90,0.5)) border-box;
  pointer-events: none; z-index: 2;
}
.r2-rope-border::before { content: ''; position: absolute; inset: -2px; border-radius: 50px; border: 2px solid rgba(180,150,90,0.2); pointer-events: none; }
.r2-rope-border::after { content: ''; position: absolute; inset: 2px; border-radius: 46px; border: 2px solid rgba(180,150,90,0.15); pointer-events: none; }

.r2-table-surface {
  border-radius: 44px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px;
  position: relative; z-index: 1; overflow: hidden;
  background: #0f3d25 url('/images/felt_background.png') center/cover !important;
}

.player-label { font-size: 0.72rem; letter-spacing: 0.18em; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 500; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
.player-label.active-player { color: var(--color-gold); font-weight: 700; text-shadow: 0 0 12px rgba(212,168,67,0.5); }
.player-label.mp-finished { color: #2ecc71 !important; }

.player-label-side { background: rgba(0,0,0,0.65); padding: 3px 10px; border-radius: 6px; white-space: nowrap; font-size: 0.58rem; letter-spacing: 0.15em; color: rgba(255,255,255,0.5); text-transform: uppercase; backdrop-filter: blur(4px); border: 1px solid rgba(212,168,67,0.15); flex-shrink: 0; }
.player-label-side.active-player { color: var(--color-gold); font-weight: 700; border-color: rgba(212,168,67,0.4); box-shadow: 0 0 10px rgba(212,168,67,0.2); }

.r2-card-sm-h { width: 44px; height: 62px; border-radius: 6px; background: url('/images/card_back.png') center/cover !important; border: 1.5px solid rgba(255,255,255,0.2); box-shadow: 2px 2px 5px rgba(0,0,0,0.4); margin-right: -26px; flex-shrink: 0; }
.r2-card-sm-h:last-child { margin-right: 0; }
.r2-card-sm-v { width: 72px; height: 48px; border-radius: 6px; background: url('/images/card_back.png') center/cover !important; border: 1.5px solid rgba(255,255,255,0.2); box-shadow: 2px 2px 5px rgba(0,0,0,0.4); margin-bottom: -36px; flex-shrink: 0; }
.r2-card-sm-v:last-child { margin-bottom: 0; }

.your-card { margin-right: -36px; }
.your-card:last-child { margin-right: 0; }
.played-card { margin-right: -36px; cursor: default; }

@media (max-width: 768px) {
  .r2-rope-border { border-radius: 20px; border-width: 3px; }
  .r2-rope-border::before { border-radius: 22px; }
  .r2-rope-border::after { border-radius: 18px; }
  .r2-table-surface { border-radius: 18px; padding: 8px 6px; gap: 4px; }
  .player-label { font-size: 0.45rem !important; letter-spacing: 0.1em; }
  .player-label-side { font-size: 0.38rem !important; padding: 1px 4px; }
  .r2-card-sm-h { width: 20px; height: 30px; margin-right: -12px; }
  .r2-card-sm-v { width: 38px; height: 26px; margin-bottom: -18px; }
  .your-card { margin-right: -24px; }
  .played-card { margin-right: -22px; }
}
@media (max-width: 480px) {
  .r2-rope-border { border-radius: 16px; border-width: 2px; }
  .r2-rope-border::before { border-radius: 18px; border-width: 1px; }
  .r2-rope-border::after { border-radius: 14px; border-width: 1px; }
  .r2-table-surface { border-radius: 14px; padding: 6px 4px; gap: 3px; }
  .player-label { font-size: 0.38rem !important; letter-spacing: 0.08em; }
  .player-label-side { font-size: 0.32rem !important; padding: 1px 3px; border-radius: 4px; }
  .r2-card-sm-h { width: 16px; height: 24px; margin-right: -10px; border-radius: 3px; }
  .r2-card-sm-v { width: 28px; height: 20px; margin-bottom: -14px; border-radius: 3px; }
  .your-card { margin-right: -20px; }
  .played-card { margin-right: -18px; }
}
@media (max-width: 400px) {
  .r2-table-surface { padding: 4px 3px; gap: 2px; }
  .player-label-side { font-size: 0.28rem !important; padding: 1px 2px; }
  .r2-card-sm-h { width: 14px; height: 20px; margin-right: -8px; border-radius: 2px; }
  .r2-card-sm-v { width: 22px; height: 16px; margin-bottom: -12px; border-radius: 2px; }
  .your-card { margin-right: -17px; }
  .played-card { margin-right: -16px; }
}
</style>
