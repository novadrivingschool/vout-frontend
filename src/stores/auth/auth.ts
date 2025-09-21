import { defineStore } from 'pinia'
import http from '@/services/http'
import { explainAxiosError } from '@/utils/http-errors'

// —— Tipos según tu backend NestJS
export interface LoginDto { email: string; password: string }
export interface RefreshTokenDto { refreshToken: string }
export interface TokensDto { accessToken: string; refreshToken: string }

export interface User {
  id: string
  email: string
  roles?: string[]
  isActive?: boolean
  createdAt?: string
  updatedAt?: string

  // Campos de conveniencia (aplanados desde profile)
  firstName?: string
  lastName?: string
  avatarUrl?: string
  employee_number?: string
  birthdate?: string       // 'YYYY-MM-DD'
  phone?: string
  gender?: string
  metadata?: Record<string, any>

  [k: string]: unknown
}


export interface AuthResponseDto {
    user: User
    tokens: TokensDto
}

type Nullable<T> = T | null

// 👇 Prefijo solicitado
const PREFIX = 'VOUT_'
const ACCESS_KEY = `${PREFIX}auth.accessToken`
const REFRESH_KEY = `${PREFIX}auth.refreshToken`
const USER_KEY = `${PREFIX}auth.user`

// 🔐 Helper robusto para decodificar JWT (base64url seguro y sin excepciones)
function parseJwt(token: string): any {
    try {
        if (!token) return {}
        const parts = token.split('.')
        if (parts.length < 2) return {}
        const payload = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
        const json = atob(padded)
        return JSON.parse(json)
    } catch {
        return {}
    }
}

// Carga segura del user del localStorage
function readUserFromStorage(): Nullable<User> {
    try {
        const raw = localStorage.getItem(USER_KEY)
        return raw ? JSON.parse(raw) as User : null
    } catch {
        return null
    }
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: (localStorage.getItem(ACCESS_KEY) || '') as string,
        refreshToken: (localStorage.getItem(REFRESH_KEY) || '') as string,
        // UI only
        user: readUserFromStorage(),
        loading: false as boolean,
    }),

    getters: {
        isAuthenticated: (s) => Boolean(s.accessToken),

        // ROLES siempre desde el JWT
        roles: (s): string[] => {
            const p = parseJwt(s.accessToken || '')
            return Array.isArray(p?.roles) ? p.roles : []
        },

        displayName: (s): string => {
            const fn = s.user?.firstName?.trim() ?? ''
            const ln = s.user?.lastName?.trim() ?? ''
            const name = `${fn} ${ln}`.trim()
            return name || 'User'
        },

        greeting(): string {
            const hour = new Date().getHours()
            if (hour >= 5 && hour < 12) return 'Good Morning'
            if (hour >= 12 && hour < 18) return 'Good Afternoon'
            return 'Good Evening'
        },

        greetingIcon(): string {
            const hour = new Date().getHours()
            if (hour >= 5 && hour < 12) return 'mdi-weather-sunny'
            if (hour >= 12 && hour < 18) return 'mdi-weather-partly-cloudy'
            return 'mdi-weather-night'
        },
    },

    actions: {
        // Aplica header Authorization si está el token
        applyAuthHeader() {
            if (this.accessToken) {
                (http as any).defaults ??= {}
                    ; (http as any).defaults.headers ??= { common: {} }
                    ; (http as any).defaults.headers.common.Authorization = `Bearer ${this.accessToken}`
            } else if ((http as any).defaults?.headers?.common?.Authorization) {
                delete (http as any).defaults.headers.common.Authorization
            }
        },

        setSession(payload: AuthResponseDto) {
            this.user = payload.user
            this.accessToken = payload.tokens.accessToken
            this.refreshToken = payload.tokens.refreshToken

            localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
            localStorage.setItem(ACCESS_KEY, this.accessToken)
            localStorage.setItem(REFRESH_KEY, this.refreshToken)

            // 👉 asegura que siguientes requests lleven el token
            this.applyAuthHeader()
        },

        clearSession() {
            this.user = null
            this.accessToken = ''
            this.refreshToken = ''
            localStorage.removeItem(USER_KEY)
            localStorage.removeItem(ACCESS_KEY)
            localStorage.removeItem(REFRESH_KEY)
            this.applyAuthHeader() // limpia Authorization
        },

        // POST /auth/login
        async login(credentials: LoginDto): Promise<AuthResponseDto> {
            this.loading = true
            try {
                const { data } = await http.post<AuthResponseDto>('/auth/login', credentials)
                this.setSession(data)
                return data
            } catch (e) {
                const msg = explainAxiosError(e, {
                    400: 'Invalid request. Please check the fields.',
                    401: 'Incorrect credentials. Please check your email and password.',
                    422: 'Invalid data. Fix the form and try again.',
                    429: 'Too many requests. Please try again later.',
                    500: 'Server error. Please try again later.',
                    default: 'Unable to sign in. Please try again.',
                })
                throw new Error(msg)
            } finally {
                this.loading = false
            }
        },

        // POST /auth/refresh
        async refresh(): Promise<TokensDto> {
            try {
                const body: RefreshTokenDto = { refreshToken: this.refreshToken }
                const { data } = await http.post<TokensDto>('/auth/refresh', body)

                this.accessToken = data.accessToken
                this.refreshToken = data.refreshToken
                localStorage.setItem(ACCESS_KEY, this.accessToken)
                localStorage.setItem(REFRESH_KEY, this.refreshToken)

                // vuelve a setear header con el nuevo token
                this.applyAuthHeader()
                return data
            } catch (e: any) {
                // si el refresh está roto (401/403), mata la sesión
                const msg = explainAxiosError(e, { default: 'Could not refresh the session.' })
                this.clearSession()
                throw new Error(msg)
            }
        },

        // POST /auth/logout (204)
        async logout(): Promise<void> {
            try {
                // si el backend exige token para logout, ya va en Authorization
                await http.post('/auth/logout')
            } catch {
                // no bloqueamos el logout de UI si el backend responde 401/500
            } finally {
                this.clearSession()
            }
        },
    },
})
