import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { useAuthStore } from '@/stores/auth/auth'

const http: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:3000',
    withCredentials: false,
})

// —— Refresh queue para evitar múltiples llamadas simultáneas
let isRefreshing = false
let failedQueue: Array<{ resolve: (v?: unknown) => void; reject: (e?: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token || undefined)))
    failedQueue = []
}

// Helper para setear el Authorization de forma type-safe con Axios v1
function setAuthHeader(
    headers: AxiosRequestHeaders | undefined,
    token: string
) {
    // Axios v1 usa AxiosHeaders (con .set) o un objeto plano en algunos casos
    if (!headers) return
    const h = headers as any
    if (typeof h.set === 'function') {
        h.set('Authorization', `Bearer ${token}`)
    } else {
        // fallback a objeto plano
        ; (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const store = useAuthStore()
    const token = store.accessToken
    if (token) {
        // No sobrescribimos headers; solo seteamos Authorization
        setAuthHeader(config.headers, token)
    }
    return config
})

http.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
        const store = useAuthStore()

        if (!originalRequest) return Promise.reject(error)

        // Si no es 401 o ya intentamos refresh en esta misma request, rechazamos
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }
        if (!store.refreshToken) {
            await store.logout()
            return Promise.reject(error)
        }

        if (isRefreshing) {
            // Espera a que termine el refresh en curso
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token?: unknown) => {
                        if (typeof token === 'string') {
                            setAuthHeader(originalRequest.headers, token)
                        }
                        resolve(http(originalRequest))
                    },
                    reject: (err) => reject(err),
                })
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const newTokens = await store.refresh() // llama al action del store
            processQueue(null, newTokens?.accessToken ?? null)

            if (newTokens?.accessToken) {
                setAuthHeader(originalRequest.headers, newTokens.accessToken)
            }
            return http(originalRequest)
        } catch (err) {
            processQueue(err, null)
            await store.logout()
            return Promise.reject(err)
        } finally {
            isRefreshing = false
        }
    }
)

export default http
