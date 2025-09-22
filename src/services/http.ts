// http.ts (corregido)
import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { useAuthStore } from '@/stores/auth/auth'

const http: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:3000',
    withCredentials: false,
})

// ---- Helpers
const AUTH_ENDPOINTS = ['/auth/login', '/auth/logout', '/auth/refresh']
const isAuthUrl = (url?: string) => !!url && AUTH_ENDPOINTS.some(p => url.toLowerCase().includes(p))

let isRefreshing = false
let failedQueue: Array<{ resolve: (v?: unknown) => void; reject: (e?: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token || undefined)))
    failedQueue = []
}

function setAuthHeader(headers: AxiosRequestHeaders | undefined, token: string) {
    if (!headers) return
    const h = headers as any
    if (typeof h.set === 'function') h.set('Authorization', `Bearer ${token}`)
    else (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
}

// ---- Request: no adjuntar Authorization en endpoints de auth
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!isAuthUrl(config.url)) {
        const store = useAuthStore()
        const token = store.accessToken
        if (token) setAuthHeader(config.headers, token)
    }
    return config
})

// ---- Response: no refrescar/ desloguear en endpoints de auth; evitar loop
http.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
        const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
        if (!original) return Promise.reject(error)

        const status = error.response?.status
        const store = useAuthStore()

        // ⛔️ Ignora 401 de /auth/login | /auth/logout | /auth/refresh
        if (status !== 401 || original._retry || isAuthUrl(original.url)) {
            return Promise.reject(error)
        }

        // Sin refresh token: limpia sesión local y corta (no llames /auth/logout)
        if (!store.refreshToken) {
            store.clearSession?.()
            return Promise.reject(error)
        }

        // Si ya hay un refresh en curso, encola
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token?: unknown) => {
                        if (typeof token === 'string') setAuthHeader(original.headers, token)
                        resolve(http(original))
                    },
                    reject,
                })
            })
        }

        // Intento único de refresh
        original._retry = true
        isRefreshing = true
        try {
            const newTokens = await store.refresh()
            processQueue(null, newTokens?.accessToken ?? null)

            if (newTokens?.accessToken) {
                setAuthHeader(original.headers, newTokens.accessToken)
            }
            return http(original)
        } catch (err) {
            processQueue(err, null)
            // Sólo limpieza local; NO pegamos a /auth/logout para evitar bucle
            store.clearSession?.()
            return Promise.reject(err)
        } finally {
            isRefreshing = false
        }
    }
)

export default http
