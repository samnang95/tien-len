<template>
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-all duration-800"
    :class="fadingOut ? 'opacity-0 scale-110 pointer-events-none' : ''"
    style="
      background: linear-gradient(
        180deg,
        #061a0e 0%,
        #0a2a16 25%,
        #0f3d25 45%,
        #1a5c38 60%,
        #237a4b 75%,
        #1a5c38 90%,
        #0a2a16 100%
      );
    "
  >
    <PixelStars />
    <PixelClouds />
    <PixelUfo />

    <!-- Start Panel -->
    <div
      class="relative z-10 p-1 rounded-xl"
      style="
        width: min(520px, 90vw);
        background: linear-gradient(135deg, #237a4b, #1a5c38, #0f3d25);
        box-shadow:
          0 0 40px rgba(35, 122, 75, 0.4),
          0 0 80px rgba(35, 122, 75, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        animation: panelPulse 3s ease-in-out infinite alternate;
      "
    >
      <!-- Glow border -->
      <div
        class="absolute -inset-0.5 rounded-[14px] border-2 pointer-events-none"
        style="
          border-color: rgba(212, 168, 67, 0.5);
          animation: glowBorder 2s ease-in-out infinite alternate;
        "
      ></div>

      <div
        class="rounded-[10px] text-center relative overflow-hidden"
        style="
          padding: 48px 48px;
          background: linear-gradient(
            180deg,
            #0a2a16 0%,
            #0f3d25 30%,
            #134a2c 60%,  
            #0a2a16 100%
          );
        "
      >
        <!-- Deco cards -->
        <div
          style="
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 32px;
          "
        >
          <span
            v-for="(card, i) in decoCards"
            :key="i"
            style="font-size: 1.875rem"
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
          class="rounded-xl"
          style="
            display: block;
            margin: 0 auto 32px auto;
            width: min(160px, 40vw);
            filter: drop-shadow(0 0 20px rgba(212, 168, 67, 0.4));
            animation: logoFloat 3s ease-in-out infinite alternate;
          "
        />

        <!-- Title -->
        <h1
          style="
            margin-bottom: 20px;
            font-family: 'Press Start 2P', monospace;
            font-size: clamp(1.5rem, 5vw, 2.8rem);
            color: #d4a843;
            text-shadow:
              0 0 10px rgba(212, 168, 67, 0.8),
              0 0 30px rgba(212, 168, 67, 0.4),
              0 4px 0 #0a2a16,
              0 5px 0 #061a0e;
            letter-spacing: 0.08em;
            animation: titleGlow 2s ease-in-out infinite alternate;
          "
        >
          TIẾN LÊN
        </h1>

        <p
          style="
            font-family: 'Press Start 2P', monospace;
            font-size: clamp(0.45rem, 1.5vw, 0.65rem);
            color: rgba(240, 201, 110, 0.7);
            letter-spacing: 0.15em;
            margin-bottom: 44px;
            text-transform: uppercase;
          "
        >
          Southern Vietnamese Card Game
        </p>

        <!-- Buttons -->
        <div
          style="
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            position: relative;
            z-index: 2;
          "
        >
          <button @click="enterRoom('room1')" class="pixel-play-btn">
            <span
              style="
                font-size: 0.85em;
                filter: drop-shadow(0 0 4px rgba(255, 255, 100, 0.5));
              "
              >▶</span
            >
            <span>ROOM 1</span>
          </button>
          <button @click="enterRoom('room2')" class="pixel-play-btn room-2-btn">
            <span
              style="
                font-size: 0.85em;
                filter: drop-shadow(0 0 4px rgba(255, 255, 100, 0.5));
              "
              >▶</span
            >
            <span>ROOM 2</span>
          </button>
        </div>

        <p
          style="
            font-family: 'Press Start 2P', monospace;
            font-size: clamp(0.35rem, 1vw, 0.5rem);
            color: rgba(240, 201, 110, 0.35);
            margin-top: 32px;
            letter-spacing: 0.1em;
            animation: hintBlink 2s ease-in-out infinite;
          "
        >
          Select a room to start playing
        </p>
      </div>

      <!-- Scanlines -->
      <div
        class="absolute inset-0 rounded-[10px] pointer-events-none z-1"
        style="
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.08) 2px,
            rgba(0, 0, 0, 0.08) 4px
          );
        "
      ></div>
    </div>

    <!-- Ground -->
    <div
      class="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
      style="
        background: linear-gradient(
          180deg,
          transparent 0%,
          rgba(6, 26, 14, 0.8) 100%
        );
      "
    ></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSound } from "../composables/useSound.js";
import PixelStars from "../components/PixelStars.vue";
import PixelClouds from "../components/PixelClouds.vue";
import PixelUfo from "../components/PixelUfo.vue";

const router = useRouter();
const { SFX } = useSound();
const fadingOut = ref(false);

const decoCards = [
  { char: "🂡", color: "#ff6b6b" },
  { char: "🂱", color: "#ffd93d" },
  { char: "🃁", color: "#6bff6b" },
  { char: "🃑", color: "#6bcdff" },
];

function enterRoom(route) {
  SFX.startSFX();
  fadingOut.value = true;
  setTimeout(() => {
    router.push({ name: route });
  }, 800);
}
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
</style>
