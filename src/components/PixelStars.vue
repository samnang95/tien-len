<template>
  <div class="absolute inset-0 pointer-events-none" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  count: { type: Number, default: 80 }
})

const container = ref(null)

onMounted(() => {
  if (!container.value) return
  const colors = ['#ffffff', '#aaccff', '#ffe4b5', '#c5d0ff', '#ffd700']
  for (let i = 0; i < props.count; i++) {
    const star = document.createElement('div')
    const size = Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1
    const color = colors[Math.floor(Math.random() * colors.length)]
    star.className = 'absolute'
    star.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%; top:${Math.random() * 100}%;
      background:${color};
      box-shadow: 0 0 ${size + 1}px ${color};
      image-rendering: pixelated;
      animation: twinkle ${1.5 + Math.random() * 3}s ease-in-out infinite alternate;
      animation-delay: ${Math.random() * 3}s;
    `
    container.value.appendChild(star)
  }
})
</script>
