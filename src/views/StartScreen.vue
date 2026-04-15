<template>
  <div
    class="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden transition-all duration-800"
    :class="fadingOut ? 'opacity-0 scale-110 pointer-events-none' : ''"
    style="background: linear-gradient(180deg, #061a0e 0%, #0a2a16 25%, #0f3d25 45%, #1a5c38 60%, #237a4b 75%, #1a5c38 90%, #0a2a16 100%);"
  >
    <PremiumBackground />

    <!-- Start Panel -->
    <div
      class="relative z-10 p-1 rounded-xl w-[min(520px,90vw)]"
      style="background: linear-gradient(135deg, #237a4b, #1a5c38, #0f3d25); box-shadow: 0 0 40px rgba(35,122,75,0.4), 0 0 80px rgba(35,122,75,0.15), inset 0 1px 0 rgba(255,255,255,0.2); animation: panelPulse 3s ease-in-out infinite alternate;"
    >
      <!-- Glow border -->
      <div
        class="absolute -inset-0.5 rounded-[14px] border-2 border-gold/50 pointer-events-none"
        style="animation: glowBorder 2s ease-in-out infinite alternate;"
      ></div>

      <div
        class="rounded-[10px] text-center relative px-12 py-10 flex flex-col items-center gap-8 max-h-[92dvh] overflow-y-auto max-md:px-6 max-md:py-6 max-md:gap-5 max-[480px]:px-4 max-[480px]:py-5 max-[480px]:gap-4"
        style="background: linear-gradient(180deg, #0a2a16 0%, #0f3d25 30%, #134a2c 60%, #0a2a16 100%);"
      >
        <!-- Deco cards -->
        <div class="flex justify-center gap-2 w-full max-md:gap-1.5">
          <span
            v-for="(card, i) in decoCards"
            :key="i"
            class="text-[1.875rem] max-md:text-[1.3rem] max-[480px]:text-[1.1rem]"
            :style="{
              animationDelay: i * 0.15 + 's',
              color: card.color,
              animation: 'cardBounce 1.5s ease-in-out infinite',
              filter: 'drop-shadow(0 0 8px rgba(212,168,67,0.5))',
            }"
            >{{ card.char }}</span
          >
        </div>

        <!-- Logo -->
        <img
          src="/images/game_logo.png"
          alt="Tiến Lên"
          class="rounded-xl w-[min(160px,35vw)] max-md:w-[min(110px,28vw)] max-[480px]:w-[80px]"
          style="filter: drop-shadow(0 0 20px rgba(212,168,67,0.4)); animation: logoFloat 3s ease-in-out infinite alternate;"
        />

        <!-- Title -->
        <h1
          class="tracking-[0.08em] text-gold"
          style="font-family: 'Press Start 2P', monospace; font-size: clamp(1.5rem, 5vw, 2.8rem); text-shadow: 0 0 10px rgba(212,168,67,0.8), 0 0 30px rgba(212,168,67,0.4), 0 4px 0 #0a2a16, 0 5px 0 #061a0e; animation: titleGlow 2s ease-in-out infinite alternate;"
        >
          TIẾN LÊN
        </h1>

        <p
          class="tracking-[0.15em] uppercase text-[rgba(240,201,110,0.7)]"
          style="font-family: 'Press Start 2P', monospace; font-size: clamp(0.45rem, 1.5vw, 0.65rem);"
        >
          Southern Vietnamese Card Game
        </p>

        <!-- Buttons -->
        <div class="flex gap-4 justify-center flex-wrap relative z-2 max-md:gap-3">
          <button @click="enterRoom('vs-computer')" class="pixel-play-btn">
            <span style="font-size: 0.85em; filter: drop-shadow(0 0 4px rgba(255,255,100,0.5));">▶</span>
            <span>VS COMPUTER</span>
          </button>
          <button @click="enterRoom('play-with-friends')" class="pixel-play-btn room-2-btn">
            <span style="font-size: 0.85em; filter: drop-shadow(0 0 4px rgba(255,255,100,0.5));">▶</span>
            <span>PLAY WITH FRIENDS</span>
          </button>
        </div>

        <div class="mt-2 text-center relative z-2 w-full">
          <router-link to="/presentation" class="presentation-link">
             <span style="filter: drop-shadow(0 0 4px rgba(100,255,200,0.5));" class="mr-2">📊</span>
             VIEW PRESENTATION
          </router-link>
        </div>

        <p
          class="tracking-widest text-[rgba(240,201,110,0.35)]"
          style="font-family: 'Press Start 2P', monospace; font-size: clamp(0.35rem, 1vw, 0.5rem); animation: hintBlink 2s ease-in-out infinite;"
        >
          vs Computer · Play with Friends
        </p>
      </div>

      <!-- Scanlines -->
      <div
        class="absolute inset-0 rounded-[10px] pointer-events-none z-1"
        style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);"
      ></div>
    </div>

  </div>
</template>

<script setup>
import { useStartScreen, decoCards } from '../composables/useStartScreen.js'
import PremiumBackground from '../components/PremiumBackground.vue'

const { fadingOut, enterRoom } = useStartScreen()
</script>


<style scoped>
.pixel-play-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 36px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(180deg, #ff8844 0%, #ff6622 50%, #dd4400 100%);
  color: #fff;
  font-family: "Press Start 2P", monospace;
  font-size: clamp(0.75rem, 2vw, 1rem);
  cursor: pointer;
  position: relative;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
  box-shadow:
    0 4px 0 #aa3300,
    0 6px 20px rgba(255, 100, 30, 0.4),
    0 0 40px rgba(255, 100, 30, 0.2);
  animation: playPulse 1.5s ease-in-out infinite;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.3);
  letter-spacing: 0.12em;
  image-rendering: pixelated;
  z-index: 2;
}
.pixel-play-btn::before {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 11px;
  border: 2px solid rgba(255, 200, 100, 0.5);
  pointer-events: none;
  animation: btnBorderGlow 1.5s ease-in-out infinite alternate;
}
@media (max-width: 768px), (max-height: 550px) {
  .pixel-play-btn {
    padding: 10px 24px;
    font-size: clamp(0.55rem, 1.8vw, 0.8rem);
  }
}
.pixel-play-btn:hover {
  transform: translateY(-3px);
  box-shadow:
    0 7px 0 #aa3300,
    0 10px 30px rgba(255, 100, 30, 0.5),
    0 0 60px rgba(255, 100, 30, 0.3);
}
.pixel-play-btn:active {
  transform: translateY(2px);
  box-shadow:
    0 1px 0 #aa3300,
    0 2px 10px rgba(255, 100, 30, 0.4);
}
.room-2-btn {
  background: linear-gradient(
    180deg,
    #27ae60 0%,
    #1e8449 50%,
    #196f3d 100%
  ) !important;
  box-shadow:
    0 4px 0 #145a32,
    0 6px 20px rgba(39, 174, 96, 0.4),
    0 0 40px rgba(39, 174, 96, 0.2) !important;
}
.room-2-btn::before {
  border: 2px solid rgba(100, 255, 150, 0.5) !important;
}
.room-2-btn:hover {
  box-shadow:
    0 7px 0 #145a32,
    0 10px 30px rgba(39, 174, 96, 0.5),
    0 0 60px rgba(39, 174, 96, 0.3) !important;
}

.presentation-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #a7f3d0;
  font-family: "Press Start 2P", monospace;
  font-size: clamp(0.45rem, 1.2vw, 0.65rem);
  text-decoration: none;
  background: rgba(6, 78, 59, 0.4);
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid rgba(52, 211, 153, 0.3);
  transition: all 0.2s ease;
  text-shadow: 0 0 8px rgba(52, 211, 153, 0.4);
  letter-spacing: 0.1em;
}
.presentation-link:hover {
  background: rgba(6, 78, 59, 0.7);
  border-color: rgba(52, 211, 153, 0.8);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.2);
}
.presentation-link:active {
  transform: translateY(0);
}
</style>
