import { createRouter, createWebHistory } from 'vue-router'
import StartScreen from './views/StartScreen.vue'
import VsComputer from './views/VsComputer.vue'
import PlayWithFriends from './views/PlayWithFriends.vue'

const routes = [
  { path: '/', name: 'home', component: StartScreen },
  { path: '/room1', name: 'room1', component: VsComputer },
  { path: '/room2', name: 'room2', component: PlayWithFriends },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
