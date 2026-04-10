const fs = require('fs');
const filePath = '/Users/user/VsCodeProject/Tiến-Lên/src/views/Presentation.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove all old transition tags
content = content.replace(/<\/?transition(?: name="slide-fade")?>/g, '');

// 2. Wrap the whole slides area in ONE transition
content = content.replace(
  /<div class="w-full relative flex justify-center items-center min-h-\[70vh\]">([\s\S]*?)<\/div>\s*<!-- Navigation Controls -->/m,
  (match, inner) => {
    return `<div class="w-full relative flex justify-center items-center min-h-[70vh]">\n        <transition name="slide-fade" mode="out-in">${inner}        </transition>\n      </div>\n\n      <!-- Navigation Controls -->`;
  }
);

// 3. Remove "absolute " class
content = content.replace(/class="absolute w-full/g, 'class="w-full');

// 4. Change v-if to v-else-if for slides > 1
for (let i = 2; i <= 7; i++) {
  content = content.replace(new RegExp(`v-if="currentSlide === ${i}"`, 'g'), `v-else-if="currentSlide === ${i}"`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixed slides to use out-in transition without absolute positioning.");
