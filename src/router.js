import { createRouter, createWebHistory } from 'vue-router'
import StartScreen from './views/StartScreen.vue'
import Room1Game from './views/Room1Game.vue'
import Room2Game from './views/Room2Game.vue'

const routes = [
  { path: '/', name: 'home', component: StartScreen },
  { path: '/room1', name: 'room1', component: Room1Game },
  { path: '/room2', name: 'room2', component: Room2Game },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
