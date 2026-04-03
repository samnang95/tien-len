<template>
  <!-- Floating toolbar buttons (bottom right) -->
  <div class="fixed bottom-3.5 right-3.5 flex gap-2 z-50 max-md:bottom-2 max-md:right-2 max-md:gap-1.5">
    <button @click="emit('toggleMute')"
      class="toolbar-btn" :class="{ 'text-white/40 border-white/15': muted }"
      :title="muted ? 'Unmute' : 'Mute'">
      {{ muted ? '🔇' : '🔊' }}
    </button>
    <button v-if="showReset" @click="emit('newGame')" class="toolbar-btn" title="New Game">🔄</button>
    <button @click="emit('leave')" class="toolbar-btn" title="Leave Room">🚪</button>
    <button @click="rulesOpen = !rulesOpen" class="toolbar-btn" title="Rules">?</button>
  </div>

  <!-- Rules panel -->
  <div v-if="rulesOpen"
    class="fixed bottom-[54px] right-3.5 max-md:bottom-[46px] max-md:right-2 max-md:w-[260px] max-md:text-[0.68rem]
      border border-gold/30 rounded-[10px] p-3.5 px-[18px] w-[280px] text-[0.75rem] leading-[1.7] text-white/75 z-50"
    style="background: rgba(10,30,18,0.97);">
    <strong class="text-gold">Tiến Lên – Official Rules</strong><br><br>
    <strong class="text-gold">Card Order (low → high):</strong><br>
    3 4 5 6 7 8 9 10 J Q K A 2<br><br>
    <strong class="text-gold">Suit Order (low → high):</strong><br>
    ♠ ♣ ♦ ♥<br><br>
    <strong class="text-gold">Valid Plays:</strong><br>
    • <strong>Single</strong> – any one card<br>
    • <strong>Pair</strong> – two cards same rank<br>
    • <strong>Triple</strong> – three same rank<br>
    • <strong>Double Pair</strong> – two consecutive pairs, no 2s<br>
    • <strong>Straight</strong> – 3+ consecutive ranks (no 2s)<br>
    • <strong>Pair Sequence</strong> – 3+ consecutive pairs<br>
    • <strong>Four of a Kind</strong> – bomb, beats anything<br><br>
    <strong class="text-gold">Beating Rules:</strong><br>
    • Must match TYPE and SIZE of last play<br>
    • Higher card value wins (rank first, then suit)<br>
    • Pair sequence of 3+ beats single 2<br>
    • Four of a kind beats everything<br><br>
    <strong class="text-gold">Turn Flow:</strong><br>
    • Player with 3♠ goes first<br>
    • Must play or pass<br>
    • If all others pass → last player leads freely<br>
    • First to empty hand wins!<br><br>
    <strong class="text-gold">Special Rule:</strong><br>
    • 💣 Four 2s or 6 pairs = instant win!
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  muted: Boolean,
  showReset: { type: Boolean, default: true },
})
const emit = defineEmits(['toggleMute', 'newGame', 'leave'])
const rulesOpen = ref(false)
</script>

<style scoped>
.toolbar-btn {
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(212,168,67,0.3);
  color: var(--color-gold);
  border-radius: 50%;
  width: 36px; height: 36px;
  cursor: pointer; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, transform 0.15s, border-color 0.2s;
  backdrop-filter: blur(4px);
}
.toolbar-btn:hover {
  background: rgba(0,0,0,0.7);
  border-color: var(--color-gold);
  transform: scale(1.1);
}
@media (max-width: 768px) {
  .toolbar-btn { width: 30px; height: 30px; font-size: 0.85rem; }
}
</style>
