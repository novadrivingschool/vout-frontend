import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '@/stores/auth/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Usa returns tipados (sin next)
router.beforeEach((to) => {
  const auth = useAuthStore()
  const isAuthenticated = auth.isAuthenticated

  const LOGIN = '/'
  const WELCOME = '/Welcome'
  const FORBIDDEN = '/Forbidden'

  if (to.meta?.public) return

  if (to.meta?.requiresAuth && !isAuthenticated) {
    return { path: LOGIN, query: { redirect: to.fullPath } }
  }

  if (isAuthenticated && to.path === LOGIN) {
    return WELCOME
  }

  const needRoles = (to.meta?.roles as string[] | undefined) ?? []
  if (needRoles.length) {
    const userRoles = auth.roles ?? []
    const ok = needRoles.some(r => userRoles.includes(r))
    if (!ok) return FORBIDDEN
  }
})


export default router
