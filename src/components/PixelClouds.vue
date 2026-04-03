<template>
  <div class="absolute inset-0 pointer-events-none overflow-hidden">
    <div v-for="(cloud, i) in clouds" :key="i"
      class="absolute opacity-60"
      :style="cloudStyle(cloud)"
      style="image-rendering: pixelated; border-radius: 4px;"
    ></div>
  </div>
</template>

<script setup>
const clouds = [
  { top: '8%', w: 80, h: 24, color: '#1a5c38', dur: 18, delay: 0, shadows: '8px -8px 0 0,16px -8px 0 0,24px -8px 0 0,32px -8px 0 0,16px -16px 0 0,24px -16px 0 0,40px 0 0 0,-8px 0 0 0' },
  { top: '18%', w: 64, h: 20, color: '#237a4b', dur: 22, delay: -5, shadows: '8px -8px 0 0,16px -8px 0 0,24px -8px 0 0,32px 0 0 0,-8px 0 0 0' },
  { top: '72%', w: 96, h: 24, color: '#0f3d25', dur: 25, delay: -8, shadows: '8px -8px 0 0,16px -8px 0 0,24px -8px 0 0,32px -8px 0 0,40px -8px 0 0,16px -16px 0 0,24px -16px 0 0,32px -16px 0 0,48px 0 0 0,-8px 0 0 0' },
  { top: '82%', w: 72, h: 20, color: '#1a5c38', dur: 20, delay: -12, shadows: '8px -8px 0 0,16px -8px 0 0,24px -8px 0 0,-8px 0 0 0,32px 0 0 0' },
  { top: '35%', w: 56, h: 18, color: '#155030', dur: 28, delay: -3, shadows: '8px -8px 0 0,16px -8px 0 0,24px 0 0 0,-8px 0 0 0' },
  { top: '55%', w: 88, h: 22, color: '#0f3d25', dur: 15, delay: -7, shadows: '8px -8px 0 0,16px -8px 0 0,24px -8px 0 0,32px -8px 0 0,8px -16px 0 0,16px -16px 0 0,40px 0 0 0,-8px 0 0 0' },
]

function cloudStyle(c) {
  const boxShadow = c.shadows.split(',').map(s => s.trim() + ' ' + c.color).join(',')
  return {
    top: c.top,
    width: c.w + 'px',
    height: c.h + 'px',
    background: c.color,
    boxShadow: boxShadow,
    animation: `floatCloud ${c.dur}s linear infinite`,
    animationDelay: c.delay + 's',
  }
}
</script>
