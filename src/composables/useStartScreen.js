import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSound } from './useSound.js'

// ─── Decoration cards shown on the start screen ───────────────────────────────
export const decoCards = [
  { char: '🂡', color: '#ff6b6b' },
  { char: '🂱', color: '#ffd93d' },
  { char: '🃁', color: '#6bff6b' },
  { char: '🃑', color: '#6bcdff' },
]

// ─── Composable ───────────────────────────────────────────────────────────────
export function useStartScreen() {
  const router    = useRouter()
  const { SFX }   = useSound()
  const fadingOut = ref(false)

  function enterRoom(route) {
    SFX.startSFX()
    fadingOut.value = true
    setTimeout(() => {
      router.push({ name: route })
    }, 800)
  }

  return { fadingOut, enterRoom }
}
