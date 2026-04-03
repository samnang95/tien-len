<template>
  <div class="card" :class="{ selected }" @click="$emit('click')">
    <div class="card-face" :class="colorClass">
      <div><span class="rank">{{ card.rank }}</span><span class="suit">{{ card.suit }}</span></div>
      <span class="center-suit">{{ card.suit }}</span>
      <div class="bottom"><span class="rank">{{ card.rank }}</span><span class="suit">{{ card.suit }}</span></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { isRed } from '../composables/useCardLogic.js'

const props = defineProps({
  card: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
defineEmits(['click'])

const colorClass = computed(() => isRed(props.card) ? 'red' : 'black')
</script>
