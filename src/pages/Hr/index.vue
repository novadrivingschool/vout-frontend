<!-- src/pages/Hr/index.vue -->
<!-- <route lang="json">
{
  "meta": {
    "requiresAuth": true,
    "roles": ["admin"]
  }
}
</route> -->
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

                <!-- Actions con separación -->
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
                    <div class="py-10 text-medium-emphasis text-center">
                        No employees found.
                    </div>
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
                            <!-- Birthdate -->
                            <!-- <v-col cols="12" md="6">
                                <v-text-field v-model="form.birthdate" label="Birthdate (YYYY-MM-DD)"
                                    placeholder="YYYY-MM-DD" variant="outlined" density="comfortable"
                                    hide-details="auto" />
                            </v-col> -->
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
                            <!-- AVATAR -->
                            <!-- <v-col cols="12" md="6">
                                <v-text-field v-model="form.avatarUrl" label="Avatar URL" :rules="[rules.url]"
                                    variant="outlined" density="comfortable" hide-details="auto" />
                            </v-col> -->
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="px-4 pb-4">
                    <v-spacer />
                    <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
                    <v-btn color="primary" :loading="usersStore.loading" @click="save">
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Loading overlay al refrescar/operar -->
        <v-overlay :model-value="usersStore.loading" class="align-center justify-center" persistent>
            <v-progress-circular indeterminate size="42" width="4" />
        </v-overlay>

        <!-- Snackbar feedback -->
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


/** 👉 Esto inyecta meta en la ruta generada por el auto-router */
definePage({
  meta: {
    requiresAuth: true,
    roles: ['admin'], // SOLO admin
  },
})

/** (Cinturón y tirantes) fallback por si el meta no se regeneró aún */
/* const router = useRouter()
const auth = useAuthStore()
if (!auth.roles?.includes('admin')) {
  router.replace('/forbidden') // ajusta a tu path real
} */

// ====== Store ======
const usersStore = useUsersStore()

// Ajusta a tu enum Role del backend
const ROLE_OPTIONS = ['admin', 'employee', 'customer']

// ====== Tipos de la tabla ======
type EmployeeRow = {
    id: string
    email: string
    fullName: string
    roles?: string[]
    isActive?: boolean
    createdAt?: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
    profile?: any
}

type Header<E> = {
    title: string
    key: keyof E | 'actions'
    sortable?: boolean
    align?: 'start' | 'end' | 'center'
    width?: string | number
}

const menu = ref(false)


// Headers (corporativos)
const headers: ReadonlyArray<Header<EmployeeRow>> = [
    { title: 'Name', key: 'fullName', sortable: true, align: 'start' },
    { title: 'Email', key: 'email', sortable: true, align: 'start' },
    { title: 'Roles', key: 'roles', sortable: false, align: 'start' },
    { title: 'Active', key: 'isActive', sortable: true, align: 'start', width: 110 },
    { title: 'Created', key: 'createdAt', sortable: true, align: 'start', width: 140 },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: 140 },
]

// Map backend → filas
const items = computed<EmployeeRow[]>(() =>
    (usersStore.users || []).map(u => ({
        id: u.id,
        email: u.email,
        fullName: [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || '-',
        roles: u.roles ?? [],
        isActive: u.isActive ?? true,
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
        firstName: u.firstName,
        lastName: u.lastName,
        avatarUrl: u.avatarUrl,
        profile: u.profile,
    }))
)

// Búsqueda
const search = ref('')

// Last updated
const lastUpdated = ref<Date | null>(null)
const lastUpdatedText = computed(() =>
    lastUpdated.value ? lastUpdated.value.toLocaleString() : '—'
)

// Snackbar
const snack = reactive({ show: false, message: '' })

// Dialog & form
const dialog = ref(false)
const isEditing = ref(false)
const formRef = ref<any>(null)
const formValid = ref(false)
const editingId = ref<string | null>(null)

type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say' | string

const initialForm = () => ({
    email: '',
    password: 'secreto123', // requerido solo al crear
    isActive: true,
    roles: ['employee'] as string[],

    firstName: '',
    lastName: '',
    birthdate: '',
    phone: '',
    gender: '' as Gender,
    avatarUrl: '',
    metadata: undefined as Record<string, any> | undefined,
})

const form = reactive(initialForm())

// Validaciones
const rules = {
    required: (v: any) => (!!v || v === false) || 'Required.',
    email: (v: string) => /^\S+@\S+\.\S+$/.test(v) || 'Invalid email.',
    min8: (v: string) => (isEditing.value || (v && v.length >= 8)) || 'Min 8 chars.',
    url: (v: string) => (!v || /^(https?:\/\/|data:image)/i.test(v)) || 'Invalid URL.',
}

// Métodos
function openCreate() {
    isEditing.value = false
    editingId.value = null
    Object.assign(form, initialForm())
    dialog.value = true
}

function openEdit(row: EmployeeRow) {
    isEditing.value = true
    editingId.value = row.id
    Object.assign(form, {
        email: row.email || '',
        password: '',
        isActive: row.isActive ?? true,
        roles: Array.isArray(row.roles) ? [...row.roles] : ['employee'],

        firstName: row.firstName || row.profile?.firstName || '',
        lastName: row.lastName || row.profile?.lastName || '',
        birthdate: row.profile?.birthdate || '',
        phone: row.profile?.phone || '',
        gender: row.profile?.gender || '',
        avatarUrl: row.avatarUrl || row.profile?.avatarUrl || '',
        metadata: row.profile?.metadata || undefined,
    })
    dialog.value = true
}

function closeDialog() {
    dialog.value = false
}

async function save() {
    const result = await formRef.value?.validate()
    const valid = typeof result === 'object' ? !!result.valid : !!result
    if (!valid) return

    try {
        if (isEditing.value && editingId.value) {
            await usersStore.updateUser(editingId.value, { ...form })
            snack.message = 'Employee updated successfully.'
        } else {
            await usersStore.createUser({ ...form })
            snack.message = 'Employee created successfully.'
        }
        snack.show = true
        closeDialog()
        await refresh(false) // silent refresh to show latest list
    } catch (e: any) {
        alert(e.message || 'Failed to save user.')
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
    // Paleta corporativa por rol (ajústala a tu branding)
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
    // si el picker devuelve un string ya en ISO, lo dejamos
    if (typeof date === 'string') {
        form.birthdate = date
    } else {
        // si devuelve Date -> lo formateamos
        form.birthdate = format(date, 'yyyy-MM-dd')
    }
    menu.value = false // cerrar menú al seleccionar
}



// Cargar al montar
onMounted(async () => {
    await refresh(false)
})
</script>

<style scoped>
/* Espaciado correcto entre search y Add */
.search-field {
    min-width: 260px;
    max-width: 360px;
}

/* Apariencia corporativa de la tabla (más aire entre celdas) */
.corporate-table :deep(.v-data-table__tr)>* {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}

/* Botones de acciones con mejor separación ya se logra con ga-2 en el slot */
</style>
