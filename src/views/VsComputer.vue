<template>
  <div class="flex flex-col items-center w-full min-h-dvh pb-2.5 relative overflow-x-hidden animate-[gameRoomFadeIn_0.6s_ease-out] bg-felt-dark bg-[url('/images/felt_background.png')] bg-center bg-cover bg-fixed gap-1.5">
    <!-- Filigree overlay -->
    <div class="fixed inset-0 pointer-events-none z-[-1] opacity-[0.04]"
      style="background-image: radial-gradient(ellipse 80px 80px at 20% 30%, rgba(212,168,67,0.6) 0%, transparent 70%), radial-gradient(ellipse 60px 60px at 80% 20%, rgba(212,168,67,0.4) 0%, transparent 70%), radial-gradient(ellipse 100px 100px at 50% 70%, rgba(212,168,67,0.5) 0%, transparent 70%), radial-gradient(ellipse 50px 50px at 10% 80%, rgba(212,168,67,0.3) 0%, transparent 70%), radial-gradient(ellipse 70px 70px at 90% 85%, rgba(212,168,67,0.4) 0%, transparent 70%); background-size: 200px 200px; background-repeat: repeat;"></div>

    <h1 class="sr-only">TIẾN LÊN</h1>
    <img src="/images/game_logo.png" alt="Tiến Lên"
      class="rounded-xl w-[min(120px,35vw)] relative z-1 max-md:w-20 max-[480px]:w-[60px] max-[400px]:w-[50px]"
      style="filter: drop-shadow(0 4px 20px rgba(212,168,67,0.4));" />
    <p class="text-[0.6rem] text-white/35 tracking-[0.2em] relative z-1 max-md:text-[0.5rem] max-[480px]:text-[0.45rem] max-[400px]:hidden">
      Southern Vietnamese Card Game
    </p>

    <!-- Money Board -->
    <div class="flex gap-3 flex-wrap justify-center relative z-1 max-md:gap-1.5 max-[480px]:gap-1">
      <div v-for="(name, i) in playerNames" :key="'w'+i"
        class="border border-gold/40 text-[0.85rem] text-gold-light flex items-center justify-center gap-2 backdrop-blur-sm max-md:text-[0.72rem] max-[480px]:text-[0.6rem] max-[400px]:text-[0.52rem]"
        style="background: #0f3d25; border-radius: 48px; padding: 4px 18px;">
        <span class="text-[0.9rem] max-md:hidden max-[480px]:hidden">{{ i === 0 ? '👤' : '🤖' }}</span>
        {{ name }} <span class="font-bold" :class="walletClass(i)">${{ wallets[i] }}</span>
      </div>
    </div>



    <!-- Bet Bar -->
    <div class="flex items-center gap-2 text-[0.72rem] text-white/60 backdrop-blur-sm relative z-1 border border-gold/40 max-md:text-[0.65rem] max-[480px]:text-[0.55rem] max-[480px]:gap-1.5 max-[400px]:text-[0.5rem]"
      style="background: #0f3d25; border-radius: 48px; padding: 2px 18px;">
      <strong class="text-gold">Bet per game:</strong> <span>${{ betAmount }}</span>
      <button @click="betModalOpen = true" class="bet-change-btn max-[480px]:text-[0.55rem] max-[480px]:px-2 max-[480px]:py-0.5">⚙ Change</button>
    </div>

    <!-- Scoreboard -->
    <div class="flex gap-3 relative z-1 max-md:gap-1.5 max-[480px]:gap-1">
      <div v-for="(name, i) in playerNames" :key="'s'+i"
        class="border border-gold/40 text-[0.7rem] text-gold-light max-md:text-[0.6rem] max-[480px]:text-[0.52rem] max-[400px]:text-[0.48rem]"
        style="background: #0f3d25; border-radius: 48px; padding: 2px 18px;">
        {{ name }} <span class="text-white font-bold">{{ scores[i] }}</span>
      </div>
    </div>

    <!-- TABLE SURFACE -->
    <div class="table-surface relative z-1 flex-1 w-[min(1200px,99vw)] max-md:w-screen" style="min-height: 0;">
        <!-- CPU 3 (top) -->
        <div class="w-full flex-1 flex flex-col items-center justify-center gap-1.5">
          <div class="relative">
            <div class="player-label" :class="{ 'active-player': current === 3 }">{{ cpuLabel(3) }}</div>
            <div v-if="playerAction.player === 3" :key="playerAction.id" class="player-action-bubble"
              :class="{ 'pass-action': playerAction.text === 'PASS' }">{{ playerAction.text }}</div>
          </div>
          <div class="flex flex-nowrap justify-center min-h-[72px] max-[480px]:min-h-[50px] max-[400px]:min-h-[40px]">
            <template v-if="showCpuCards(3)">
              <PlayingCard v-for="(c, j) in hands[3]" :key="j" :card="c" class="w-[90px]! h-[128px]! text-[1rem]! cursor-default!" />
            </template>
            <template v-else>
              <div v-for="j in hands[3].length" :key="j" class="card-sm"
                :class="{ 'deal-to-top': isDealing, 'turn-card-glow': current === 3 && !gameOver }"
                :style="isDealing ? { animationDelay: ((j-1) * 4 + 3) * 45 + 'ms' } : {}"></div>
            </template>
          </div>
        </div>

        <!-- Middle row -->
        <div class="flex-1 flex w-full gap-2.5 items-stretch max-md:gap-[3px] max-[480px]:gap-0.5">
          <!-- CPU 1 left -->
          <div class="shrink-0 w-1/4 flex flex-row items-center justify-center gap-1 max-md:w-[15%] max-[480px]:w-[12%]">
            <div class="relative">
              <div class="player-label-side -rotate-90" :class="{ 'active-player': current === 1 }">{{ cpuLabel(1) }}</div>
              <div v-if="playerAction.player === 1" :key="playerAction.id" class="player-action-bubble"
                :class="{ 'pass-action': playerAction.text === 'PASS' }">{{ playerAction.text }}</div>
            </div>
            <div class="flex flex-col items-center">
              <template v-if="showCpuCards(1)">
                <PlayingCard v-for="(c, j) in hands[1]" :key="j" :card="c" class="w-[90px]! h-[128px]! text-[1rem]! cursor-default! side-card-reveal" />
              </template>
              <template v-else>
                <div v-for="j in hands[1].length" :key="j" class="card-sm-v"
                  :class="{ 'deal-to-left': isDealing, 'turn-card-glow': current === 1 && !gameOver }"
                  :style="isDealing ? { animationDelay: ((j-1) * 4 + 1) * 45 + 'ms' } : {}"></div>
              </template>
            </div>
          </div>

          <!-- Play Area -->
          <div class="flex-1 min-h-[320px] rounded-[14px] border border-white/6 flex flex-col items-center justify-center gap-1 p-2 max-md:min-h-[100px] max-md:p-1.5 max-md:gap-[3px] max-[480px]:min-h-[70px] max-[480px]:p-1 max-[480px]:gap-0.5 max-[480px]:rounded-[10px] max-[400px]:min-h-[55px] max-[400px]:p-[3px]"
            style="background: radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.35) 100%); box-shadow: inset 0 0 30px rgba(0,0,0,0.3);">
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
              <div class="text-[0.6rem] tracking-[0.25em] text-white/25 uppercase max-md:text-[0.45rem] max-[480px]:text-[0.38rem] max-[480px]:tracking-[0.15em] max-[400px]:text-[0.32rem]">LAST PLAYED</div>
              <div class="flex flex-nowrap justify-center">
                <PlayingCard v-for="(c, j) in lastPlayed" :key="c.rank + c.suit" :card="c"
                  class="cursor-default! played-card played-card-glow" :class="playAnimClass"
                  :style="{ animationDelay: j * 80 + 'ms' }" />
              </div>
              <div class="text-[0.72rem] italic text-gold-light max-md:text-[0.55rem] max-[480px]:text-[0.48rem] max-[400px]:text-[0.42rem]">{{ whosePlayText }}</div>
              <div class="text-[0.82rem] min-h-[1.2em] text-[#f9ca24] max-md:text-[0.65rem] max-[480px]:text-[0.55rem] max-[400px]:text-[0.48rem]"
                style="font-family: var(--font-cinzel);">{{ msg }}</div>
              <div class="flex items-center justify-center gap-2 mt-1 min-h-7 max-md:min-h-5 max-md:mt-0.5 max-[480px]:min-h-4 max-[480px]:mt-px">
                <span v-if="!gameOver && current === 0" class="turn-text pulse-glow">YOUR TURN</span>
                <span v-else-if="!gameOver && current > 0" class="turn-text">CPU {{ current }} THINKING</span>
              </div>
            </template>
          </div>

          <!-- CPU 2 right -->
          <div class="shrink-0 w-1/4 flex flex-row items-center justify-center gap-1 max-md:w-[15%] max-[480px]:w-[12%]">
            <div class="flex flex-col items-center">
              <template v-if="showCpuCards(2)">
                <PlayingCard v-for="(c, j) in hands[2]" :key="j" :card="c" class="w-[90px]! h-[128px]! text-[1rem]! cursor-default! side-card-reveal" />
              </template>
              <template v-else>
                <div v-for="j in hands[2].length" :key="j" class="card-sm-v"
                  :class="{ 'deal-to-right': isDealing, 'turn-card-glow': current === 2 && !gameOver }"
                  :style="isDealing ? { animationDelay: ((j-1) * 4 + 2) * 45 + 'ms' } : {}"></div>
              </template>
            </div>
            <div class="relative">
              <div class="player-label-side rotate-90" :class="{ 'active-player': current === 2 }">{{ cpuLabel(2) }}</div>
              <div v-if="playerAction.player === 2" :key="playerAction.id" class="player-action-bubble"
                :class="{ 'pass-action': playerAction.text === 'PASS' }">{{ playerAction.text }}</div>
            </div>
          </div>
        </div>

        <!-- YOUR HAND -->
        <div class="w-full flex-1 flex flex-col items-center justify-center gap-1.5">
          <div class="relative inline-flex flex-col items-center">
            <div class="player-label" :class="{ 'active-player': current === 0 }">
              {{ hands[0].length === 0 ? 'YOU ✓' : 'YOU' }}
            </div>
            <div v-if="playerAction.player === 0" :key="playerAction.id" class="player-action-bubble"
              :class="{ 'pass-action': playerAction.text === 'PASS' }">{{ playerAction.text }}</div>
          </div>
          <div class="flex flex-nowrap justify-center px-5 transition-opacity duration-300 max-md:px-1 max-[480px]:px-0.5"
            :style="{ opacity: passedPlayers.has(0) && !gameOver ? 0.5 : 1, minHeight: 'var(--card-h)' }">
            <PlayingCard v-for="(c, j) in hands[0]" :key="j"
              :card="c" :selected="selected.includes(j)"
              class="your-card"
              :class="{ 'deal-to-bottom': isDealing }"
              :style="isDealing ? { animationDelay: (j * 4) * 45 + 'ms', pointerEvents: 'none' } : {}"
              @click="toggleSelect(j)" />
          </div>
          <div class="flex gap-2.5 mt-1 max-md:gap-2 max-md:mt-0.5 max-[480px]:gap-1.5">
            <button class="btn btn-play" :disabled="!isMyTurn || selected.length === 0" @click="playSelected">Play</button>
            <button class="btn btn-pass" :disabled="!isMyTurn || lastPlayed.length === 0" @click="pass">Pass</button>
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
        style="background: linear-gradient(135deg, var(--color-felt), var(--color-felt-dark)); box-shadow: 0 20px 50px rgba(0,0,0,0.7); padding: 40px 48px; min-width: 340px;">
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
import { useVsComputer, playerNames } from '../composables/useVsComputer.js'
import { computed } from 'vue'
import PlayingCard from '../components/PlayingCard.vue'
import GameToolbar from '../components/GameToolbar.vue'

const {
  hands, current, lastPlayed, lastPlayer, passedPlayers, playerAction,
  selected, scores, gameOver, isDealing, betAmount, betInput, betModalOpen,
  wallets, finishOrder, msg, showOverlay,
  overlayTitle, overlayMsg, overlayMoney, overlayMoneyWin,
  overlayWallets, overlayScore, loserCards, loserName, loserPenaltyText, boomHands,
  isMyTurn, whosePlayText,
  isMuted, toggleMute,
  walletClass, cpuLabel, showCpuCards,
  newGame, toggleSelect, playSelected, pass,
  resetScore, confirmBet, leaveRoom,
} = useVsComputer()

newGame()

const playAnimClass = computed(() => {
  const p = lastPlayer.value
  if (p < 0 || lastPlayed.value.length === 0) return ''
  return ['play-from-bottom', 'play-from-left', 'play-from-right', 'play-from-top'][p] || ''
})
</script>


<style>
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

.rope-border {
  position: absolute; inset: 0; border-radius: 36px; border: 3px solid transparent;
  background: transparent padding-box, linear-gradient(135deg, rgba(200,170,90,0.3), rgba(160,130,70,0.15), rgba(200,170,90,0.3)) border-box;
  pointer-events: none; z-index: 2;
}
.rope-border::before { content: ''; position: absolute; inset: -2px; border-radius: 38px; border: 2px solid rgba(180,150,90,0.12); pointer-events: none; }
.rope-border::after { content: ''; position: absolute; inset: 2px; border-radius: 34px; border: 2px solid rgba(180,150,90,0.08); pointer-events: none; }

.table-surface {
  border-radius: 32px; padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 6px;
  position: relative; z-index: 1; overflow: hidden;
  background: #0f163d url('/images/felt_background.png') center/cover !important;
}

.player-label { font-size: 0.72rem; letter-spacing: 0.18em; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 500; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
.player-label.active-player { color: var(--color-gold); font-weight: 700; text-shadow: 0 0 12px rgba(212,168,67,0.5); }

.player-label-side { background: rgba(0,0,0,0.65); padding: 3px 10px; border-radius: 6px; white-space: nowrap; font-size: 0.58rem; letter-spacing: 0.15em; color: rgba(255,255,255,0.5); text-transform: uppercase; backdrop-filter: blur(4px); border: 1px solid rgba(212,168,67,0.15); flex-shrink: 0; }
.player-label-side.active-player { color: var(--color-gold); font-weight: 700; border-color: rgba(212,168,67,0.4); box-shadow: 0 0 10px rgba(212,168,67,0.2); }

.card-sm { width: 44px; height: 62px; border-radius: 6px; background: url('/images/card_back.png') center/cover !important; border: 1.5px solid rgba(255,255,255,0.2); box-shadow: 2px 2px 5px rgba(0,0,0,0.4); margin-right: -26px; flex-shrink: 0; }
.card-sm:last-child { margin-right: 0; }

.card-sm-v { width: 72px; height: 48px; border-radius: 6px; background: url('/images/card_back.png') center/cover !important; border: 1.5px solid rgba(255,255,255,0.2); box-shadow: 2px 2px 5px rgba(0,0,0,0.4); margin-bottom: -36px; flex-shrink: 0; }
.card-sm-v:last-child { margin-bottom: 0; }

.side-card-reveal { margin-bottom: -86px; }
.side-card-reveal:last-child { margin-bottom: 0; }

.your-card { margin-right: -36px; }
.your-card:last-child { margin-right: 0; }
.played-card { margin-right: -36px; cursor: default; }
.played-card:last-child { margin-right: 0; }

.bet-change-btn { background: rgba(212,168,67,0.15); border: 1px solid rgba(212,168,67,0.4); color: var(--color-gold); border-radius: 14px; padding: 3px 12px; font-size: 0.75rem; cursor: pointer; font-family: var(--font-body); transition: background 0.15s; }
.bet-change-btn:hover { background: rgba(212,168,67,0.28); }
.bet-preset { background: rgba(212,168,67,0.12); border: 1px solid rgba(212,168,67,0.35); color: var(--color-gold-light); border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 0.82rem; font-family: var(--font-body); transition: background 0.12s; }
.bet-preset:hover { background: rgba(212,168,67,0.3); color: #fff; }

@media (max-width: 768px) {
  .rope-border { border-radius: 20px; border-width: 3px; }
  .rope-border::before { border-radius: 22px; }
  .rope-border::after { border-radius: 18px; }
  .table-surface { border-radius: 18px; padding: 8px 6px; gap: 4px; }
  .player-label { font-size: 0.5rem; letter-spacing: 0.1em; }
  .player-label-side { font-size: 0.4rem; padding: 1px 4px; }
  .card-sm { width: 20px; height: 30px; margin-right: -12px; }
  .card-sm-v { width: 38px; height: 26px; margin-bottom: -18px; }
  .your-card { margin-right: -24px; }
  .played-card { margin-right: -22px; }
}
@media (max-width: 480px) {
  .rope-border { border-radius: 16px; border-width: 2px; }
  .rope-border::before { border-radius: 18px; border-width: 1px; }
  .rope-border::after { border-radius: 14px; border-width: 1px; }
  .table-surface { border-radius: 14px; padding: 6px 4px; gap: 3px; }
  .player-label { font-size: 0.42rem; letter-spacing: 0.08em; }
  .player-label-side { font-size: 0.35rem; padding: 1px 3px; border-radius: 4px; }
  .card-sm { width: 16px; height: 24px; margin-right: -10px; border-radius: 3px; }
  .card-sm-v { width: 28px; height: 20px; margin-bottom: -14px; border-radius: 3px; }
  .turn-text { font-size: 0.5rem; }
  .your-card { margin-right: -20px; }
  .played-card { margin-right: -18px; }
}
@media (max-width: 400px) {
  .table-surface { padding: 4px 3px; gap: 2px; }
  .player-label-side { font-size: 0.3rem; padding: 1px 2px; }
  .card-sm { width: 14px; height: 20px; margin-right: -8px; border-radius: 2px; }
  .card-sm-v { width: 22px; height: 16px; margin-bottom: -12px; border-radius: 2px; }
  .your-card { margin-right: -17px; }
  .played-card { margin-right: -16px; }
}
</style>
