// ═══════════════════════════════════════════════════════════════
// SOUND SYSTEM COMPOSABLE — Web Audio API
// ═══════════════════════════════════════════════════════════════

import { ref } from 'vue'

const AudioCtx = window.AudioContext || window.webkitAudioContext
let audioCtx = null
function getCtx() { if (!audioCtx) audioCtx = new AudioCtx(); return audioCtx }

const isMuted = ref(false)

export function useSound() {

  function playIfNotMuted(fn) {
    if (isMuted.value) return
    fn()
  }

  const SFX = {
    click() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(1200, t); o.frequency.exponentialRampToValueAtTime(800, t + 0.06)
        g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.08)
      })
    },
    deselect() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(800, t); o.frequency.exponentialRampToValueAtTime(500, t + 0.06)
        g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.06)
      })
    },
    play() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03))
        const src = ctx.createBufferSource(); src.buffer = buf
        const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 600
        const g = ctx.createGain(); g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
        src.connect(flt); flt.connect(g); g.connect(ctx.destination); src.start(t)
        const o = ctx.createOscillator(), g2 = ctx.createGain()
        o.type = 'triangle'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(100, t + 0.08)
        g2.gain.setValueAtTime(0.15, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
        o.connect(g2); g2.connect(ctx.destination); o.start(t); o.stop(t + 0.1)
      })
    },
    aiPlay() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02))
        const src = ctx.createBufferSource(); src.buffer = buf
        const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 500
        const g = ctx.createGain(); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
        src.connect(flt); flt.connect(g); g.connect(ctx.destination); src.start(t)
      })
    },
    pass() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(300, t + 0.15)
        g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.15)
      })
    },
    error() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.type = 'square'; o.frequency.setValueAtTime(200, t); o.frequency.setValueAtTime(150, t + 0.1)
        g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.25)
      })
    },
    win() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const notes = [523, 659, 784, 1047]
        notes.forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain()
          o.type = 'triangle'
          o.frequency.setValueAtTime(f, t + i * 0.12)
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + i * 0.12)
          g.gain.setValueAtTime(0.2, t + i * 0.12); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.35)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.35)
        })
      })
    },
    lose() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const notes = [400, 350, 280, 200]
        notes.forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain()
          o.type = 'sine'
          o.frequency.setValueAtTime(f, t + i * 0.15)
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + i * 0.15)
          g.gain.setValueAtTime(0.12, t + i * 0.15); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.15); o.stop(t + i * 0.15 + 0.3)
        })
      })
    },
    deal() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        for (let i = 0; i < 6; i++) {
          const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
          const data = buf.getChannelData(0)
          for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.008))
          const src = ctx.createBufferSource(); src.buffer = buf
          const flt = ctx.createBiquadFilter(); flt.type = 'highpass'; flt.frequency.value = 800
          const g = ctx.createGain(); g.gain.setValueAtTime(0.1, t + i * 0.06); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.04)
          src.connect(flt); flt.connect(g); g.connect(ctx.destination); src.start(t + i * 0.06)
        }
      })
    },
    bomb() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12))
        const src = ctx.createBufferSource(); src.buffer = buf
        const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.setValueAtTime(400, t); flt.frequency.exponentialRampToValueAtTime(80, t + 0.4)
        const g = ctx.createGain(); g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
        src.connect(flt); flt.connect(g); g.connect(ctx.destination); src.start(t)
        const o = ctx.createOscillator(), g2 = ctx.createGain()
        o.type = 'sawtooth'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.3)
        g2.gain.setValueAtTime(0.2, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
        o.connect(g2); g2.connect(ctx.destination); o.start(t); o.stop(t + 0.35)
      })
    },
    startSFX() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const notes = [262, 330, 392, 523, 659, 784]
        notes.forEach((f, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain()
          o.type = 'square'
          o.frequency.setValueAtTime(f, t + i * 0.08)
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + i * 0.08)
          g.gain.setValueAtTime(0.12, t + i * 0.08); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.2)
        })
      })
    },
    join() {
      playIfNotMuted(() => {
        const ctx = getCtx(), t = ctx.currentTime
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.value = 440; g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
        o.start(t); o.stop(t + 0.25)
      })
    }
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
  }

  return { SFX, isMuted, toggleMute }
}
