<template>
  <div class="absolute z-2" style="top:6%; animation: ufoFloat 6s ease-in-out infinite, ufoDrift 20s linear infinite;">
    <div style="width:48px; height:20px; background: linear-gradient(180deg, #8899cc, #667799); border-radius:50%; position:relative; image-rendering:pixelated; box-shadow: 0 -8px 0 4px #aabbdd, 0 4px 0 0 #556688, -4px 0 0 0 #7788aa, 4px 0 0 0 #7788aa;">
      <!-- Dome -->
      <div class="absolute" style="top:-12px; left:50%; transform:translateX(-50%); width:20px; height:10px; background:#99aacc; border-radius:50% 50% 0 0; box-shadow: 0 0 6px rgba(100,200,255,0.4);"></div>
      <!-- Lights -->
      <div class="absolute" style="top:2px; left:4px; width:6px; height:6px; background:#ff6b6b; border-radius:50%; box-shadow: 10px 0 0 #5bff5b, 20px 0 0 #ff6b6b, 30px 0 0 #5bff5b; animation: ufoLights 0.8s ease-in-out infinite alternate;"></div>
    </div>
    <!-- Beam -->
    <div style="width:24px; height:50px; margin:0 auto; background: linear-gradient(180deg, rgba(100,200,255,0.3), transparent); clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%); animation: beamPulse 1.5s ease-in-out infinite alternate;"></div>
  </div>
</template>
