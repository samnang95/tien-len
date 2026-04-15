<template>
  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <!-- Deep casino gradient background -->
    <div class="absolute inset-0" style="background: radial-gradient(ellipse at center, #1a5c38 0%, #0f3d25 40%, #0a2a16 80%, #05140b 100%);"></div>

    <!-- Filigree/Pattern overlay (reused from VsComputer) -->
    <div class="absolute inset-0 opacity-[0.06]"
      style="background-image: radial-gradient(ellipse 80px 80px at 20% 30%, rgba(212,168,67,0.6) 0%, transparent 70%), radial-gradient(ellipse 60px 60px at 80% 20%, rgba(212,168,67,0.4) 0%, transparent 70%), radial-gradient(ellipse 100px 100px at 50% 70%, rgba(212,168,67,0.5) 0%, transparent 70%), radial-gradient(ellipse 50px 50px at 10% 80%, rgba(212,168,67,0.3) 0%, transparent 70%), radial-gradient(ellipse 70px 70px at 90% 85%, rgba(212,168,67,0.4) 0%, transparent 70%); background-size: 200px 200px; background-repeat: repeat;">
    </div>
    
    <!-- Floating Gold Dust -->
    <div v-for="dust in dustParticles" :key="dust.id" class="gold-dust"
         :style="{
           left: dust.left,
           animationDelay: dust.delay,
           animationDuration: dust.duration,
           opacity: dust.opacity,
           transform: dust.scale
         }"></div>
         
    <!-- Floating Playing Cards -->
    <div v-for="cardData in floatCards" :key="cardData.id" class="floating-card-wrapper"
         :style="{
           left: cardData.left,
           animationDelay: cardData.delay,
           animationDuration: cardData.duration,
           '--r1': cardData.r1,
           '--r2': cardData.r2,
           opacity: cardData.opacity
         }">
      <PlayingCard :card="{ suit: cardData.suit, rank: cardData.rank }" class="bg-card" />
    </div>

    <!-- Soft edge vignette -->
    <div class="absolute inset-0" style="box-shadow: inset 0 0 150px rgba(0,0,0,0.9);"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PlayingCard from './PlayingCard.vue'

const suits = ['♠', '♥', '♣', '♦']
const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2']

const dustParticles = ref(Array.from({ length: 40 }).map((_, i) => ({
  id: 'dust-' + i,
  left: Math.random() * 100 + '%',
  delay: (Math.random() * -20) + 's',
  duration: (15 + Math.random() * 25) + 's',
  opacity: 0.1 + Math.random() * 0.5,
  scale: 'scale(' + (0.3 + Math.random() * 1.2) + ')'
})))

const floatCards = ref(Array.from({ length: 9 }).map((_, i) => ({
  id: 'card-' + i,
  suit: suits[i % 4],
  rank: ranks[Math.floor(Math.random() * ranks.length)],
  left: (Math.random() * 85 + 5) + '%',
  delay: (Math.random() * -50) + 's',
  duration: (35 + Math.random() * 20) + 's',
  r1: Math.random() * 360 + 'deg',
  r2: Math.random() * 360 + 'deg',
  opacity: 0.15 + Math.random() * 0.25
})))
</script>

<style scoped>
.gold-dust {
  position: absolute;
  bottom: -10px;
  width: 4px;
  height: 4px;
  background: #f0c96e;
  border-radius: 50%;
  box-shadow: 0 0 12px #d4a843, 0 0 24px #f0c96e;
  animation: floatUp linear infinite;
  will-change: transform, opacity;
}

.floating-card-wrapper {
  position: absolute;
  bottom: -150px;
  animation: cardDrift linear infinite;
  will-change: transform;
}

.bg-card {
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8) !important;
  pointer-events: none !important;
  cursor: default !important;
  transform: scale(0.8) !important;
}

.bg-card:hover {
  transform: scale(0.8) !important; /* Disable default hover effect */
}

@keyframes floatUp {
  0% { transform: translateY(10vh); opacity: 0; }
  10% { opacity: var(--opacity); }
  90% { opacity: var(--opacity); }
  100% { transform: translateY(-110vh); opacity: 0; }
}

@keyframes cardDrift {
  0% { transform: translateY(10vh) rotateX(0deg) rotateY(0deg) rotateZ(var(--r1)); }
  100% { transform: translateY(-120vh) rotateX(360deg) rotateY(240deg) rotateZ(var(--r2)); }
}
</style>
