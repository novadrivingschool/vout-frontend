<!-- src/pages/Hr/index.vue -->
<template>
    <v-container fluid class="py-6">
        <v-card class="elevation-3 rounded-lg overflow-hidden">
            <!-- Toolbar -->
            <v-toolbar density="comfortable" color="surface" class="px-4">
                <v-toolbar-title class="text-h6 font-weight-semibold">
                    Staff
                </v-toolbar-title>

                <v-spacer />

                <div class="d-flex align-center ga-3">
                    <v-btn variant="tonal" color="primary" :loading="usersStore.loading" @click="refresh">
                        <v-icon start>mdi-refresh</v-icon>
                        Refresh
                    </v-btn>

                    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" density="comfortable"
                        variant="outlined" hide-details class="search-field" :disabled="usersStore.loading" />

                    <v-btn color="primary" @click="openCreate" class="ms-1">
                        <v-icon start>mdi-account-plus</v-icon>
                        Add Employee
                    </v-btn>
                </div>
            </v-toolbar>

            <v-divider />

            <!-- Data table -->
            <v-data-table :headers="headers" :items="items" :search="search" :loading="usersStore.loading" item-key="id"
                class="bg-surface corporate-table">
                <!-- Roles -->
                <template #item.roles="{ item }">
                    <div class="d-flex flex-wrap gap-1">
                        <v-chip v-for="(r, idx) in item.roles" :key="idx" size="small" :color="roleColor(r)"
                            variant="tonal" class="mr-1 mb-1">
                            {{ r }}
                        </v-chip>
                        <span v-if="!item.roles?.length" class="text-medium-emphasis">—</span>
                    </div>
                </template>

                <!-- Active -->
                <template #item.isActive="{ item }">
                    <v-chip :color="item.isActive ? 'success' : 'error'" size="small" variant="flat">
                        {{ item.isActive ? 'Active' : 'Inactive' }}
                    </v-chip>
                </template>

                <!-- Actions -->
                <template #item.actions="{ item }">
                    <div class="d-flex align-center ga-2 justify-end">
                        <v-tooltip text="Edit" location="top">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon size="small" color="info" variant="tonal"
                                    @click="openEdit(item)">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>

                        <v-tooltip text="Delete" location="top">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" icon size="small" color="error" variant="tonal"
                                    @click="onDelete(item.id)">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                    </div>
                </template>

                <template #no-data>
                    <div class="py-10 text-medium-emphasis text-center">No employees found.</div>
                </template>
            </v-data-table>

            <v-divider />

            <!-- Footer info -->
            <div class="px-4 py-3 text-caption text-medium-emphasis d-flex align-center">
                <v-icon size="16" class="me-2">mdi-clock-outline</v-icon>
                Last updated: {{ lastUpdatedText }}
            </div>
        </v-card>

        <!-- Dialog create / edit -->
        <v-dialog v-model="dialog" max-width="720" persistent>
            <v-card class="rounded-lg">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">{{ isEditing ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
                    <span class="text-h6">{{ isEditing ? 'Edit Employee' : 'Add Employee' }}</span>
                </v-card-title>

                <v-card-text>
                    <v-form ref="formRef" v-model="formValid">
                        <!-- Profile -->
                        <v-row class="mb-1" dense>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.firstName" label="First Name" variant="outlined"
                                    density="comfortable" hide-details="auto" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.lastName" label="Last Name" variant="outlined"
                                    density="comfortable" hide-details="auto" />
                            </v-col>
                        </v-row>

                        <!-- Credentials -->
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.email" label="Email" type="email"
                                    :rules="[rules.required, rules.email]" variant="outlined" density="comfortable"
                                    hide-details="auto" />
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.password" :type="isEditing ? 'text' : 'password'"
                                    :label="isEditing ? 'Password (leave empty to keep)' : 'Password'"
                                    :rules="[rules.min8]" :disabled="true" variant="outlined" density="comfortable"
                                    hide-details="auto" /><!-- :disabled="isEditing" -->
                            </v-col>
                        </v-row>

                        <!-- Roles / Active -->
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-select v-model="form.roles" :items="ROLE_OPTIONS" label="Roles" chips multiple
                                    variant="outlined" density="comfortable" hide-details="auto" />
                            </v-col>

                            <v-col cols="12" md="6" class="d-flex align-center">
                                <v-switch v-model="form.isActive" color="success" hide-details inset
                                    :label="form.isActive ? 'Active' : 'Inactive'" />
                            </v-col>
                        </v-row>

                        <!-- More profile -->
                        <v-row dense class="mt-1">
                            <v-col cols="12" md="6">
                                <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition"
                                    offset-y min-width="auto">
                                    <template #activator="{ props }">
                                        <v-text-field v-model="form.birthdate" label="Birthdate" readonly v-bind="props"
                                            variant="outlined" density="comfortable" hide-details="auto" />
                                    </template>

                                    <v-date-picker v-model="form.birthdate" @update:model-value="selectDate" />
                                </v-menu>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.phone" label="Phone" variant="outlined"
                                    density="comfortable" hide-details="auto" />
                            </v-col>
                        </v-row>

                        <v-row dense>
                            <v-col cols="12" md="6">
                                <v-select v-model="form.gender"
                                    :items="['male', 'female', 'other', 'prefer_not_to_say']" label="Gender"
                                    variant="outlined" density="comfortable" hide-details="auto" />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="px-4 pb-4">
                    <v-spacer />
                    <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
                    <v-btn color="primary" :loading="usersStore.loading" @click="save">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Loading overlay -->
        <v-overlay :model-value="usersStore.loading" class="align-center justify-center" persistent>
            <v-progress-circular indeterminate size="42" width="4" />
        </v-overlay>

        <!-- Snackbar -->
        <v-snackbar v-model="snack.show" :timeout="2500" location="bottom right" color="primary">
            {{ snack.message }}
        </v-snackbar>
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useUsersStore } from '@/stores/users/users'
import { format } from 'date-fns'
import { definePage } from 'vue-router/auto'

definePage({
    meta: {
        requiresAuth: true,
        roles: ['admin'],
    },
})

const usersStore = useUsersStore()
const ROLE_OPTIONS = ['admin', 'employee', 'customer']

type EmployeeRow = {
    id: string
    email: string
    fullName: string
    roles?: string[]
    isActive?: boolean
    createdAt?: string
    profile?: {
        firstName?: string
        lastName?: string
        birthdate?: string
        phone?: string
        gender?: string
        avatarUrl?: string
        metadata?: Record<string, any>
    } | null
}

type Header<E> = {
    title: string
    key: keyof E | 'actions'
    sortable?: boolean
    align?: 'start' | 'end' | 'center'
    width?: string | number
}

const menu = ref(false)

const headers: ReadonlyArray<Header<EmployeeRow>> = [
    { title: 'Name', key: 'fullName', sortable: true, align: 'start' },
    { title: 'Email', key: 'email', sortable: true, align: 'start' },
    { title: 'Roles', key: 'roles', sortable: false, align: 'start' },
    { title: 'Active', key: 'isActive', sortable: true, align: 'start', width: 110 },
    { title: 'Created', key: 'createdAt', sortable: true, align: 'start', width: 140 },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: 140 },
]

// 🔧 Map correcto desde backend → filas (usa profile para el nombre)
const items = computed<EmployeeRow[]>(() =>
    (usersStore.users || []).map(u => {
        const fn = u.profile?.firstName ?? ''
        const ln = u.profile?.lastName ?? ''
        return {
            id: u.id,
            email: u.email,
            fullName: [fn, ln].filter(Boolean).join(' ').trim() || '-',
            roles: u.roles ?? [],
            isActive: u.isActive ?? true,
            createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
            profile: u.profile ?? null,
        }
    })
)

const search = ref('')
const lastUpdated = ref<Date | null>(null)
const lastUpdatedText = computed(() => (lastUpdated.value ? lastUpdated.value.toLocaleString() : '—'))

const snack = reactive({ show: false, message: '' })

const dialog = ref(false)
const isEditing = ref(false)
const formRef = ref<any>(null)
const formValid = ref(false)
const editingId = ref<string | null>(null)

type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say' | string

type FlatForm = {
    email: string
    password: string
    isActive: boolean
    roles: string[]
    firstName: string
    lastName: string
    birthdate: string
    phone: string
    gender: Gender
    avatarUrl: string
    metadata?: Record<string, any> | undefined
}

const initialForm = (): FlatForm => ({
    email: '',
    password: 'secreto123', // requerido solo al crear
    isActive: true,
    roles: ['employee'],

    firstName: '',
    lastName: '',
    birthdate: '',
    phone: '',
    gender: '' as Gender,
    avatarUrl: '',
    metadata: undefined,
})

const form = reactive<FlatForm>(initialForm())

// 🔒 Snapshot original para detectar cambios
let original: FlatForm | null = null

const rules = {
    required: (v: any) => (!!v || v === false) || 'Required.',
    email: (v: string) => /^\S+@\S+\.\S+$/.test(v) || 'Invalid email.',
    min8: (v: string) => (!isEditing.value ? (v && v.length >= 8) : true) || 'Min 8 chars.',
    url: (v: string) => (!v || /^(https?:\/\/|data:image)/i.test(v)) || 'Invalid URL.',
}

function openCreate() {
    isEditing.value = false
    editingId.value = null
    Object.assign(form, initialForm())
    original = null
    dialog.value = true
}

function openEdit(row: EmployeeRow) {
    isEditing.value = true
    editingId.value = row.id

    const p = row.profile ?? {}
    const seed: FlatForm = {
        email: row.email || '',
        password: '',
        isActive: row.isActive ?? true,
        roles: Array.isArray(row.roles) ? [...row.roles] : ['employee'],

        firstName: p.firstName || '',
        lastName: p.lastName || '',
        birthdate: p.birthdate || '',
        phone: p.phone || '',
        gender: (p.gender as Gender) || '',
        avatarUrl: p.avatarUrl || '',
        metadata: p.metadata || undefined,
    }

    Object.assign(form, seed)
    original = JSON.parse(JSON.stringify(seed)) // deep clone
    dialog.value = true
}

function closeDialog() {
    dialog.value = false
}

// 🧠 Utilidad: compara arrays (roles)
function arraysEqual(a?: any[], b?: any[]) {
    if (!Array.isArray(a) && !Array.isArray(b)) return true
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false
    return a.every((v, i) => v === b[i])
}

// 🧠 Construye payload SOLO con cambios y con profile anidado
function buildUpdatePayload(current: FlatForm, base: FlatForm) {
    const payload: any = {}
    const profile: any = {}

    // Campos root
    if (current.email !== base.email) payload.email = current.email
    if (current.isActive !== base.isActive) payload.isActive = current.isActive
    if (!arraysEqual(current.roles, base.roles)) payload.roles = current.roles
    if (current.password && current.password.length >= 8 && current.password !== base.password) {
        payload.password = current.password
    }

    // Campos de perfil
    const PROFILE_KEYS: (keyof FlatForm)[] = ['firstName', 'lastName', 'birthdate', 'phone', 'gender', 'avatarUrl', 'metadata']
    for (const key of PROFILE_KEYS) {
        if (JSON.stringify(current[key]) !== JSON.stringify(base[key])) {
            profile[key] = current[key as keyof FlatForm]
        }
    }

    if (Object.keys(profile).length) payload.profile = profile

    return payload
}

// 🧠 Payload para crear (CreateUserDto)
function buildCreatePayload(current: FlatForm) {
    const payload: any = {
        email: current.email,
        password: current.password,
        isActive: current.isActive,
        roles: current.roles,
    }
    payload.profile = {
        firstName: current.firstName || undefined,
        lastName: current.lastName || undefined,
        birthdate: current.birthdate || undefined,
        phone: current.phone || undefined,
        gender: current.gender || undefined,
        avatarUrl: current.avatarUrl || undefined,
        metadata: current.metadata || undefined,
    }
    return payload
}

async function save() {
    const result = await formRef.value?.validate()
    const valid = typeof result === 'object' ? !!result.valid : !!result
    if (!valid) return

    try {
        if (isEditing.value && editingId.value && original) {
            const payload = buildUpdatePayload(form, original)
            if (!Object.keys(payload).length) {
                snack.message = 'No changes to save.'
                snack.show = true
                return
            }
            await usersStore.updateUser(editingId.value, payload)
            snack.message = 'Employee updated successfully.'
        } else {
            // Crear
            const payload = buildCreatePayload(form)
            await usersStore.createUser(payload)
            snack.message = 'Employee created successfully.'
        }
        snack.show = true
        closeDialog()
        await refresh(false)
    } catch (e: any) {
        alert(e?.response?.data?.message || e.message || 'Failed to save user.')
    }
}

async function onDelete(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
        await usersStore.deleteUser(id)
        snack.message = 'Employee deleted.'
        snack.show = true
        await refresh(false)
    } catch (e: any) {
        alert(e.message || 'Failed to delete user.')
    }
}

function roleColor(r: string) {
    if (r === 'admin') return 'red'
    if (r === 'employee') return 'teal'
    if (r === 'customer') return 'indigo'
    return 'primary'
}

async function refresh(showSnack = true) {
    await usersStore.fetchUsers()
    lastUpdated.value = new Date()
    if (showSnack) {
        snack.message = 'List refreshed.'
        snack.show = true
    }
}

function selectDate(date: string | Date) {
    if (typeof date === 'string') {
        form.birthdate = date
    } else {
        form.birthdate = format(date, 'yyyy-MM-dd')
    }
    menu.value = false
}

onMounted(async () => {
    await refresh(false)
})
</script>

<style scoped>
.search-field {
    min-width: 260px;
    max-width: 360px;
}

.corporate-table :deep(.v-data-table__tr)>* {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}
</style>
