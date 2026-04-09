<template>
  <router-view v-slot="{ Component, route }">
    <transition name="page-fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>

  <!-- Rotate Device Prompt (Mobile Portrait Only) -->
  <div id="rotate-prompt">
    <div class="rotate-phone-anim">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
      </svg>
    </div>
    <h2 class="text-xl text-gold" style="font-family: var(--font-cinzel); font-weight: 700; margin-bottom: 8px;">Rotate Device</h2>
    <p class="text-sm text-white/60 text-center max-w-[260px] leading-relaxed">
      Tiến Lên requires a wider view. Please turn your phone sideways to play.
    </p>
  </div>
</template>

<script setup>
</script>

<style>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* Hide by default */
#rotate-prompt {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #0a1128;
  background-image: radial-gradient(circle at center, rgba(30,50,80,1) 0%, rgba(10,17,40,1) 100%);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* Show only on phone screens in portrait mode */
@media screen and (max-width: 768px) and (orientation: portrait) {
  #rotate-prompt {
    display: flex;
  }
}

.rotate-phone-anim {
  color: var(--color-gold);
  margin-bottom: 24px;
  animation: phoneTurn 2.5s ease-in-out infinite;
}

@keyframes phoneTurn {
  0% { transform: rotate(0deg); }
  35% { transform: rotate(-90deg); }
  65% { transform: rotate(-90deg); }
  100% { transform: rotate(0deg); }
}
</style>
