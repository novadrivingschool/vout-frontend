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

  // ✅ Solo la hoja final decide si es pública
  const leaf = to.matched[to.matched.length - 1]
  const isPublic = leaf?.meta?.public === true
  if (isPublic) return

  // ✅ Si cualquier record pide auth, exige estar logueado
  const requiresAuth = to.matched.some(r => r.meta?.requiresAuth === true)
  if (requiresAuth && !isAuthenticated) {
    return { path: LOGIN, query: { redirect: to.fullPath } }
  }

  if (isAuthenticated && to.path === LOGIN) return WELCOME

  // ✅ Unir roles requeridos de toda la cadena
  const requiredRoles = to.matched.flatMap(r => (r.meta?.roles as string[] | undefined) ?? [])

  if (requiredRoles.length) {
    // Tus roles vienen del token (getter auth.roles). Compara case-insensitive.
    const userRoles = (auth.roles ?? []).map(r => r.toLowerCase())
    const ok = requiredRoles.some(r => userRoles.includes(String(r).toLowerCase()))
    if (!ok) return FORBIDDEN
  }
})



export default router
