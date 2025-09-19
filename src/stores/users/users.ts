import { defineStore } from 'pinia'
import http from '@/services/http'
import { explainAxiosError } from '@/utils/http-errors'

/** ---- Tipos del backend ---- */
export interface UserProfile {
    firstName?: string
    lastName?: string
    birthdate?: string
    phone?: string
    gender?: string
    avatarUrl?: string
    metadata?: Record<string, any>
}

export interface User {
    id: string
    email: string
    roles?: string[]
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
    // El backend podría devolver nombres en raíz o dentro de profile:
    firstName?: string
    lastName?: string
    avatarUrl?: string
    profile?: UserProfile
    [k: string]: unknown
}

/** CreateUserDto real que espera el backend (con profile opcional) */
export interface CreateUserDto {
    email: string
    password: string
    roles?: string[]
    isActive?: boolean
    profile?: UserProfile
}

/** UpdateUserDto real del backend (campos opcionales, también profile) */
export interface UpdateUserDto {
    email?: string
    password?: string
    roles?: string[]
    isActive?: boolean
    profile?: UserProfile
}

/**
 * Payload conveniente del frontend:
 * puedes pasar plano (firstName/lastName/...) y lo mapeamos a dto.profile.
 */
export type CreateUserPayload =
    Omit<CreateUserDto, 'profile'> &
    Partial<UserProfile> & { profile?: UserProfile }

export type UpdateUserPayload =
    Omit<UpdateUserDto, 'profile'> &
    Partial<UserProfile> & { profile?: UserProfile }

type Nullable<T> = T | null

/** Normaliza un User para tener firstName/lastName/avatarUrl siempre accesibles */
function normalizeUser(u: any): User {
    if (!u) return u
    const profile: UserProfile | undefined = u.profile
    return {
        ...u,
        firstName: u.firstName ?? profile?.firstName,
        lastName: u.lastName ?? profile?.lastName,
        avatarUrl: u.avatarUrl ?? profile?.avatarUrl,
        profile,
    }
}

/** Convierte payload (plano o con profile) → CreateUserDto backend */
function toCreateDto(payload: CreateUserPayload): CreateUserDto {
    const { email, password, roles, isActive, profile, ...flat } = payload
    const prof: UserProfile | undefined =
        profile ?? // si ya viene
        (Object.keys(flat).length
            ? {
                firstName: flat.firstName,
                lastName: flat.lastName,
                birthdate: flat.birthdate,
                phone: flat.phone,
                gender: flat.gender,
                avatarUrl: flat.avatarUrl,
                metadata: flat.metadata,
            }
            : undefined)

    return { email, password, roles, isActive, profile: prof }
}

/** Convierte payload (plano o con profile) → UpdateUserDto backend */
function toUpdateDto(payload: UpdateUserPayload): UpdateUserDto {
    const { email, password, roles, isActive, profile, ...flat } = payload
    const anyFlat = Object.keys(flat).some(k => (flat as any)[k] !== undefined)
    const prof: UserProfile | undefined =
        profile ??
        (anyFlat
            ? {
                firstName: flat.firstName,
                lastName: flat.lastName,
                birthdate: flat.birthdate,
                phone: flat.phone,
                gender: flat.gender,
                avatarUrl: flat.avatarUrl,
                metadata: flat.metadata,
            }
            : undefined)

    return { email, password, roles, isActive, profile: prof }
}

export const useUsersStore = defineStore('users', {
    state: () => ({
        users: [] as User[],
        currentUser: null as Nullable<User>,
        loading: false as boolean,
    }),

    actions: {
        // POST /users
        async createUser(payload: CreateUserPayload): Promise<User> {
            this.loading = true
            try {
                const dto = toCreateDto(payload)
                const { data } = await http.post<User>('/users', dto)
                const user = normalizeUser(data)
                this.users.push(user)
                return user
            } catch (e) {
                const msg = explainAxiosError(e, {
                    400: 'Invalid data or email already registered.',
                    401: 'Unauthorized. Please sign in.',
                    403: 'Access denied.',
                    422: 'Validation error. Check the fields.',
                    default: 'Failed to create user.'
                })
                throw new Error(msg)
            } finally {
                this.loading = false
            }
        },

        // GET /users
        async fetchUsers(): Promise<User[]> {
            this.loading = true
            try {
                const { data } = await http.get<User[]>('/users')
                this.users = (data ?? []).map(normalizeUser)
                return this.users
            } catch (e) {
                const msg = explainAxiosError(e, {
                    401: 'Unauthorized. Please sign in.',
                    403: 'Access denied.',
                    default: 'Failed to load users list.'
                })
                throw new Error(msg)
            } finally {
                this.loading = false
            }
        },

        // GET /users/me
        async fetchMe(): Promise<User> {
            this.loading = true
            try {
                const { data } = await http.get<User>('/users/me')
                const user = normalizeUser(data)
                this.currentUser = user
                return user
            } catch (e) {
                const msg = explainAxiosError(e, {
                    401: 'Unauthorized. Please sign in.',
                    404: 'User not found.',
                    default: 'Failed to fetch current user.'
                })
                throw new Error(msg)
            } finally {
                this.loading = false
            }
        },

        // GET /users/:id
        async fetchUser(id: string): Promise<User> {
            this.loading = true
            try {
                const { data } = await http.get<User>(`/users/${id}`)
                return normalizeUser(data)
            } catch (e) {
                const msg = explainAxiosError(e, {
                    401: 'Unauthorized. Please sign in.',
                    403: 'Access denied.',
                    404: 'User not found.',
                    default: 'Failed to fetch user.'
                })
                throw new Error(msg)
            } finally {
                this.loading = false
            }
        },

        // PATCH /users/:id
        async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
            this.loading = true
            try {
                const dto = toUpdateDto(payload)
                const { data } = await http.patch<User>(`/users/${id}`, dto)
                const user = normalizeUser(data)
                // sync local state
                const idx = this.users.findIndex(u => u.id === id)
                if (idx >= 0) this.users[idx] = user
                if (this.currentUser?.id === id) this.currentUser = user
                return user
            } catch (e) {
                const msg = explainAxiosError(e, {
                    400: 'Invalid data or no fields to update.',
                    401: 'Unauthorized. Please sign in.',
                    403: 'Access denied.',
                    404: 'User not found.',
                    422: 'Validation error.',
                    default: 'Failed to update user.'
                })
                throw new Error(msg)
            } finally {
                this.loading = false
            }
        },

        // DELETE /users/:id
        async deleteUser(id: string): Promise<void> {
            this.loading = true
            try {
                await http.delete(`/users/${id}`)
                this.users = this.users.filter(u => u.id !== id)
                if (this.currentUser?.id === id) this.currentUser = null
            } catch (e) {
                const msg = explainAxiosError(e, {
                    401: 'Unauthorized. Please sign in.',
                    403: 'Access denied.',
                    404: 'User not found.',
                    default: 'Failed to delete user.'
                })
                throw new Error(msg)
            } finally {
                this.loading = false
            }
        },
    }
})
