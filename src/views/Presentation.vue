<template>
  <div class="h-dvh w-screen overflow-hidden text-white font-sans flex flex-col items-center justify-center relative presentation-bg">
    
    <!-- Background overlay / Grid -->
    <div class="absolute inset-0 z-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#10b981 1px, transparent 1px); background-size: 30px 30px;"></div>

    <!-- Vignette effect -->
    <div class="absolute inset-0 z-0 pointer-events-none" style="box-shadow: inset 0 0 150px rgba(0,0,0,0.8);"></div>

    <!-- Slide Content -->
    <div class="relative z-10 w-full max-w-6xl h-full flex flex-col justify-center items-center px-4 md:px-10 pb-20 md:pb-0 overflow-y-auto overflow-x-hidden">
      
      <div class="w-full relative flex justify-center items-center min-h-[70vh]">
        <transition name="slide-fade" mode="out-in">
          <!-- Slide 1: Title Slide -->
          <div v-if="currentSlide === 1" key="slide-1" class="w-full flex flex-col items-center text-center gap-6 md:gap-10">
            <div>
               <span class="text-5xl md:text-7xl">🃏</span>
            </div>
            <h1 class="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-br from-emerald-200 via-emerald-500 to-green-700 drop-shadow-[0_0_25px_rgba(16,185,129,0.4)] px-4" style="font-family: 'Inter', sans-serif;">
              Tiến Lên
            </h1>
            <h2 class="text-xl sm:text-3xl md:text-5xl font-bold text-emerald-50 max-w-4xl leading-tight px-2">
              Modernizing a Classic Card Game
            </h2>
            <div class="relative group inline-block">
              <div class="absolute -inset-1.5 bg-linear-to-r from-emerald-600 to-green-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <p class="relative text-sm sm:text-xl md:text-2xl text-emerald-100 px-8 py-3 md:px-12 md:py-4 rounded-full border border-emerald-500/30 bg-black/60 backdrop-blur-md font-medium tracking-wide">
                Built with <span class="text-emerald-400 font-bold">Vue 3</span> & <span class="text-[#FFCA28] font-bold">Firebase</span>
              </p>
            </div>
          </div>
          <!-- Slide 2: The Vision -->
          <div v-else-if="currentSlide === 2" key="slide-2" class="w-full px-4 sm:px-8 md:px-16 text-left flex flex-col gap-6 md:gap-10 items-start">
            <div class="inline-block border-b-2 border-emerald-600 pb-2">
               <h2 class="text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-tight">The Vision</h2>
            </div>
            <p class="text-lg sm:text-2xl md:text-3xl text-emerald-200/90 leading-snug font-light max-w-3xl">
              Why digitize this classic Southern Vietnamese card game?
            </p>
            <div class="space-y-6 md:space-y-10 text-base sm:text-xl md:text-2xl text-emerald-50/90 font-medium max-w-4xl w-full">
              <div class="flex items-start gap-4 md:gap-6 bg-white/5 p-4 md:p-6 rounded-2xl border border-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:translate-x-2">
                <div class="mt-0 md:mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-linear-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                   <svg class="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div class="flex flex-col gap-1 md:gap-2">
                  <h3 class="text-lg md:text-2xl font-bold text-emerald-50">Cross-device responsiveness</h3>
                  <p class="text-sm md:text-xl text-emerald-100/80 font-normal">Flawless gameplay across mobile, tablet, and desktop.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 md:gap-6 bg-white/5 p-4 md:p-6 rounded-2xl border border-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:translate-x-2">
                <div class="mt-0 md:mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-linear-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                   <svg class="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div class="flex flex-col gap-1 md:gap-2">
                  <h3 class="text-lg md:text-2xl font-bold text-emerald-50">Real-time multiplayer</h3>
                  <p class="text-sm md:text-xl text-emerald-100/80 font-normal">Connect friends instantly perfectly synced.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 md:gap-6 bg-white/5 p-4 md:p-6 rounded-2xl border border-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:translate-x-2">
                <div class="mt-0 md:mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-linear-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                   <svg class="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div class="flex flex-col gap-1 md:gap-2">
                  <h3 class="text-lg md:text-2xl font-bold text-emerald-50">Engaging UI</h3>
                  <p class="text-sm md:text-xl text-emerald-100/80 font-normal">A sleek, modern aesthetic providing a premium feel.</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Slide 3: Tech Stack -->
          <div v-else-if="currentSlide === 3" key="slide-3" class="w-full px-4 sm:px-8 md:px-16 text-left flex flex-col gap-6 md:gap-10 items-start">
            <div class="inline-block border-b-2 border-emerald-600 pb-2">
               <h2 class="text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-tight">Tech Stack</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-5xl w-full">
              <div class="group relative bg-[#0f172a]/80 border border-emerald-800/30 p-5 md:p-8 rounded-3xl backdrop-blur-md overflow-hidden transition-all hover:border-emerald-500/50">
                <div class="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                <div class="text-2xl md:text-4xl mb-2 md:mb-4 text-[#42b883]">🏎️</div>
                <h3 class="text-xl md:text-3xl font-bold text-white mb-1 md:mb-3">Vue 3 <span class="text-emerald-400 font-normal text-sm md:text-xl hidden md:inline">(Composition API)</span></h3>
                <p class="text-sm md:text-xl text-emerald-100/70 leading-relaxed">Reactive state management and robust logic.</p>
              </div>
              
              <div class="group relative bg-[#0f172a]/80 border border-emerald-800/30 p-5 md:p-8 rounded-3xl backdrop-blur-md overflow-hidden transition-all hover:border-[#646cff]/50">
                <div class="absolute -right-8 -top-8 w-32 h-32 bg-[#646cff]/10 rounded-full blur-2xl group-hover:bg-[#646cff]/20 transition-all"></div>
                <div class="text-2xl md:text-4xl mb-2 md:mb-4 text-[#646cff]">⚡</div>
                <h3 class="text-xl md:text-3xl font-bold text-white mb-1 md:mb-3">Vite</h3>
                <p class="text-sm md:text-xl text-emerald-100/70 leading-relaxed">Lightning-fast HMR and optimized bundling.</p>
              </div>

              <div class="group relative bg-[#0f172a]/80 border border-emerald-800/30 p-5 md:p-8 rounded-3xl backdrop-blur-md overflow-hidden transition-all hover:border-[#38bdf8]/50">
                <div class="absolute -right-8 -top-8 w-32 h-32 bg-[#38bdf8]/10 rounded-full blur-2xl group-hover:bg-[#38bdf8]/20 transition-all"></div>
                <div class="text-2xl md:text-4xl mb-2 md:mb-4 text-[#38bdf8]">🎨</div>
                <h3 class="text-xl md:text-3xl font-bold text-white mb-1 md:mb-3">Tailwind CSS</h3>
                <p class="text-sm md:text-xl text-emerald-100/70 leading-relaxed">Utility-first rapid UI development styling.</p>
              </div>

              <div class="group relative bg-[#0f172a]/80 border border-emerald-800/30 p-5 md:p-8 rounded-3xl backdrop-blur-md overflow-hidden transition-all hover:border-[#ffca28]/50">
                <div class="absolute -right-8 -top-8 w-32 h-32 bg-[#ffca28]/10 rounded-full blur-2xl group-hover:bg-[#ffca28]/20 transition-all"></div>
                <div class="text-2xl md:text-4xl mb-2 md:mb-4 text-[#ffca28]">🔥</div>
                <h3 class="text-xl md:text-3xl font-bold text-white mb-1 md:mb-3">Firebase</h3>
                <p class="text-sm md:text-xl text-emerald-100/70 leading-relaxed">Instant, deterministic synchronization.</p>
              </div>
            </div>
          </div>
          <!-- Slide 4: Project Architecture -->
          <div v-else-if="currentSlide === 4" key="slide-4" class="w-full px-4 sm:px-8 md:px-16 text-center flex flex-col items-center gap-6 md:gap-10">
            <div class="flex flex-col gap-2 md:gap-4">
              <h2 class="text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-tight">Project Architecture</h2>
              <p class="text-lg md:text-2xl text-emerald-400 font-light">Strict Separation of Concerns</p>
            </div>
            
            <div class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-5xl mx-auto w-full">
              <!-- UI Layer -->
              <div class="flex-1 w-full bg-linear-to-br from-white/10 to-transparent border border-white/10 p-6 md:p-10 rounded-4xl relative overflow-hidden backdrop-blur-md min-h-[180px] md:h-72 flex flex-col justify-center">
                <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-400 to-transparent"></div>
                <div class="flex items-center justify-center mb-3 md:mb-6">
                  <span class="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs md:text-sm font-bold tracking-wider uppercase border border-emerald-500/30">UI Components</span>
                </div>
                <h3 class="text-xl md:text-3xl text-white font-bold mb-2 md:mb-4">Vue Templates</h3>
                <p class="text-emerald-100/70 text-sm md:text-lg">Stateless visual layer. Focused solely on responsive layouts and animations.</p>
              </div>
              
              <!-- Connector -->
              <div class="flex md:flex flex-col items-center rotate-90 md:rotate-0 my-2 md:my-0">
                 <div class="w-10 h-10 md:w-16 md:h-16 rounded-full bg-emerald-900/50 border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] z-10">
                   <svg class="w-5 h-5 md:w-8 md:h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                 </div>
              </div>

              <!-- Logic Layer -->
              <div class="flex-1 w-full bg-linear-to-bl from-white/10 to-transparent border border-white/10 p-6 md:p-10 rounded-4xl relative overflow-hidden backdrop-blur-md min-h-[180px] md:h-72 flex flex-col justify-center">
                <div class="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#ffca28] to-transparent"></div>
                <div class="flex items-center justify-center mb-3 md:mb-6">
                  <span class="bg-[#ffca28]/20 text-[#ffca28] px-3 py-1 rounded-full text-xs md:text-sm font-bold tracking-wider uppercase border border-[#ffca28]/30">State & Logic</span>
                </div>
                <h3 class="text-xl md:text-3xl text-white font-bold mb-2 md:mb-4">Vue Composables</h3>
                <p class="text-emerald-100/70 text-sm md:text-lg">Central nervous system (<code class="font-mono bg-black/40 px-1 py-0.5 rounded text-emerald-300 text-xs md:text-sm">useCardLogic.js</code>).</p>
              </div>
            </div>
          </div>
          <!-- Slide 5: Core Features -->
          <div v-else-if="currentSlide === 5" key="slide-5" class="w-full px-4 sm:px-8 md:px-16 text-left flex flex-col gap-6 md:gap-10 items-start">
            <div class="inline-block border-b-2 border-emerald-600 pb-2">
               <h2 class="text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-tight">Core Features</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 max-w-5xl w-full">
              <div class="flex items-start gap-4 md:gap-5 group">
                <div class="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-linear-to-br from-emerald-600 to-green-800 flex items-center justify-center text-2xl md:text-3xl shadow-lg shadow-emerald-900 transition-transform">🤖</div>
                <div>
                  <h3 class="text-lg md:text-2xl font-bold text-emerald-50 mb-1 md:mb-2">Single Player (AI)</h3>
                  <p class="text-sm md:text-lg text-emerald-200/70">Sharpen your skills against responsive AI opponents utilizing real internal game logic.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 md:gap-5 group">
                <div class="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-2xl md:text-3xl shadow-lg shadow-blue-900 transition-transform">🌐</div>
                <div>
                  <h3 class="text-lg md:text-2xl font-bold text-emerald-50 mb-1 md:mb-2">Real-time Multiplayer</h3>
                  <p class="text-sm md:text-lg text-emerald-200/70">Seamless progression across devices securely synchronized via Firebase.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 md:gap-5 group">
                <div class="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-linear-to-br from-amber-500 to-orange-700 flex items-center justify-center text-2xl md:text-3xl shadow-lg shadow-amber-900 transition-transform">🔊</div>
                <div>
                  <h3 class="text-lg md:text-2xl font-bold text-emerald-50 mb-1 md:mb-2">Dynamic Sound Effects</h3>
                  <p class="text-sm md:text-lg text-emerald-200/70">High-fidelity audio feedback for dealing, shuffling, and playing combinations.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 md:gap-5 group">
                <div class="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-linear-to-br from-purple-500 to-pink-700 flex items-center justify-center text-2xl md:text-3xl shadow-lg shadow-purple-900 transition-transform">📱</div>
                <div>
                  <h3 class="text-lg md:text-2xl font-bold text-emerald-50 mb-1 md:mb-2">Responsive Layouts</h3>
                  <p class="text-sm md:text-lg text-emerald-200/70">Optimized UI that gracefully transitions between desktop and mobile displays.</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Slide 6: Technical Challenges -->
          <div v-else-if="currentSlide === 6" key="slide-6" class="w-full px-4 sm:px-8 md:px-16 text-left flex flex-col gap-6 md:gap-10 items-start">
            <div class="inline-block border-b-2 border-emerald-600 pb-2">
               <h2 class="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight">Technical Challenges</h2>
            </div>
            
            <div class="flex flex-col gap-4 md:gap-6 max-w-5xl w-full">
              <div class="group relative pl-4 md:pl-8 py-1 md:py-2">
                <div class="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-emerald-600 rounded-full transition-all"></div>
                <h3 class="text-lg md:text-2xl font-bold text-emerald-100 mb-1 md:mb-2">1. Validating "Tiến Lên" Combinations</h3>
                <p class="text-sm md:text-xl text-emerald-200/60 leading-relaxed transition-colors">
                  Creating an engine to reliably parse arbitrary selections. Required strict card ranking (Suit vs Value) logic.
                </p>
              </div>
              
              <div class="group relative pl-4 md:pl-8 py-1 md:py-2">
                <div class="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-emerald-600 rounded-full transition-all"></div>
                <h3 class="text-lg md:text-2xl font-bold text-emerald-100 mb-1 md:mb-2">2. Zero-Lag Multiplayer Synchronization</h3>
                <p class="text-sm md:text-xl text-emerald-200/60 leading-relaxed transition-colors">
                  Keeping up to 4 concurrent clients perfectly in sync without race conditions and handling disconnects gracefully.
                </p>
              </div>

              <div class="group relative pl-4 md:pl-8 py-1 md:py-2">
                <div class="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-emerald-600 rounded-full transition-all"></div>
                <h3 class="text-lg md:text-2xl font-bold text-emerald-100 mb-1 md:mb-2">3. Responsive CSS Animations</h3>
                <p class="text-sm md:text-xl text-emerald-200/60 leading-relaxed transition-colors">
                  Calculating exact spatial positions for cards originating from a central deck out to UI zones using CSS transforms.
                </p>
              </div>
            </div>
          </div>
          <!-- Slide 7: Q&A and Demo -->
          <div v-else-if="currentSlide === 7" key="slide-7" class="w-full text-center flex flex-col items-center gap-6 md:gap-10">
            <div class="w-20 h-20 md:w-32 md:h-32 mx-auto bg-emerald-900/40 rounded-full flex items-center justify-center border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-pulse-slow">
               <span class="text-4xl md:text-6xl text-emerald-400">✨</span>
            </div>
            <div class="flex flex-col gap-2 md:gap-4">
              <h2 class="text-5xl md:text-7xl font-black text-white tracking-tight">Let's Play!</h2>
              <p class="text-xl md:text-3xl text-emerald-300/80 font-light">Questions & Live Demo</p>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4 w-full">
               <button @click="$router.push('/')" class="group relative px-6 py-3 md:px-10 md:py-4 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-full font-bold text-base md:text-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] border border-emerald-400/50">
                  <span class="relative z-10 flex items-center justify-center gap-3">
                    Play the Game
                    <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </span>
               </button>
               <button @click="currentSlide = 1" class="px-6 py-3 md:px-10 md:py-4 bg-white/5 border border-white/20 hover:border-emerald-500/50 text-white rounded-full font-bold text-base md:text-xl transition-all hover:bg-white/10 backdrop-blur-sm">
                  Restart Deck
               </button>
            </div>
          </div>
        </transition>
      </div>

    </div>

    <!-- Navigation Controls -->
    <div class="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-6 z-50 bg-black/60 px-4 py-3 md:px-8 md:py-4 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl">
      <button @click="prevSlide" :disabled="currentSlide === 1" class="text-white hover:text-emerald-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 md:w-7 md:h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      
      <div class="flex gap-2 md:gap-3">
        <span v-for="i in 7" :key="i" class="w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-500" :class="i === currentSlide ? 'bg-emerald-500 w-6 md:w-10 shadow-[0_0_12px_#10b981]' : 'bg-white/20 cursor-pointer'" @click="currentSlide = i"></span>
      </div>

      <button @click="nextSlide" :disabled="currentSlide === 7" class="text-white hover:text-emerald-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 md:w-7 md:h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>

    <!-- Top Progress Bar -->
    <div class="absolute top-0 left-0 h-1 md:h-1.5 bg-white/5 w-full z-50">
      <div class="h-full bg-linear-to-r from-emerald-500 to-green-400 transition-all duration-700 ease-out shadow-[0_0_15px_#10b981]" :style="`width: ${(currentSlide / 7) * 100}%`"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentSlide = ref(1)

const nextSlide = () => {
  if (currentSlide.value < 7) currentSlide.value++
}

const prevSlide = () => {
  if (currentSlide.value > 1) currentSlide.value--
}

const handleKeydown = (e) => {
  if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'Enter') {
    nextSlide()
  } else if (e.key === 'ArrowLeft') {
    prevSlide()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap');

.presentation-bg {
  background-color: #05140b;
  background-image: 
    radial-gradient(ellipse at top right, #0a351f 0%, transparent 50%),
    radial-gradient(ellipse at bottom left, #052210 0%, transparent 50%);
}

.slide-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.98);
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}
</style>
