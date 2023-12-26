import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'openings',
      component: () => import('../views/OpeningsView.vue')
    },
    {
      path: '/openings',
      name: 'openings',
      component: () => import('../views/OpeningsView.vue')
    }
  ]
})

export default router
