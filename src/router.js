import { createRouter, createWebHistory } from 'vue-router'
import StartScreen from './views/StartScreen.vue'
import VsComputer from './views/VsComputer.vue'
import PlayWithFriends from './views/PlayWithFriends.vue'
import Presentation from './views/Presentation.vue'

const routes = [
  { path: '/', name: 'home', component: StartScreen },
  { path: '/vs-computer', name: 'vs-computer', component: VsComputer },
  { path: '/play-with-friends', name: 'play-with-friends', component: PlayWithFriends },
  { path: '/presentation', name: 'presentation', component: Presentation },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
