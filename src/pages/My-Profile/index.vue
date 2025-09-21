<!-- src/pages/MyProfile/index.vue -->
<!-- <route lang="json">
{
  "meta": { "requiresAuth": true }
}
</route> -->
<template>
    <v-container fluid class="py-6">
        <v-card class="elevation-3 rounded-lg overflow-hidden">
            <v-toolbar density="comfortable" color="surface" class="px-4">
                <v-toolbar-title class="text-h6 font-weight-semibold d-flex align-center ga-2">
                    <v-icon>mdi-badge-account</v-icon>
                    My Profile
                </v-toolbar-title>
                <v-spacer />
                <v-btn variant="tonal" color="primary" :loading="usersStore.loading" @click="refreshMe">
                    <v-icon start>mdi-refresh</v-icon>
                    Refresh
                </v-btn>
            </v-toolbar>

            <v-divider />

            <!-- Header -->
            <div class="px-6 pt-6 pb-2 d-flex flex-wrap align-start ga-6">
                <!-- Avatar con iniciales -->
                <v-avatar size="88" class="elevation-1">
                    <div class="d-flex align-center justify-center h-100 text-h5 font-weight-bold">
                        {{ initials }}
                    </div>
                </v-avatar>

                <div class="d-flex flex-column ga-1">
                    <div class="text-h6">{{ fullName || '—' }}</div>
                    <div class="text-medium-emphasis">{{ me.email }}</div>
                    <div class="d-flex flex-wrap ga-1 mt-2">
                        <v-chip v-for="(r, i) in me.roles || []" :key="i" size="small" variant="tonal"
                            :color="roleColor(r)">
                            {{ r }}
                        </v-chip>
                        <span v-if="!me.roles?.length" class="text-medium-emphasis">No roles</span>
                    </div>
                    <div class="d-flex flex-wrap ga-2 mt-2">
                        <v-chip size="small" variant="flat" :color="me.isActive ? 'success' : 'error'">
                            {{ me.isActive ? 'Active' : 'Inactive' }}
                        </v-chip>
                        <v-chip v-if="me.employee_number" size="small" variant="tonal" color="primary">
                            <v-icon start>mdi-badge-account-horizontal</v-icon> {{ me.employee_number }}
                        </v-chip>
                    </div>
                </div>
            </div>

            <!-- Form perfil -->
            <v-card-text class="px-6 pb-2">
                <v-form ref="formRef" v-model="formValid" @submit.prevent="onSaveProfile">
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.firstName" label="First Name" variant="outlined"
                                density="comfortable" hide-details="auto" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.lastName" label="Last Name" variant="outlined"
                                density="comfortable" hide-details="auto" />
                        </v-col>
                    </v-row>

                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.email" label="Email" type="email" :rules="[rules.email]"
                                variant="outlined" density="comfortable" hide-details="auto" disabled />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.phone" label="Phone" variant="outlined" density="comfortable"
                                hide-details="auto" />
                        </v-col>
                    </v-row>

                    <v-row dense>
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
                            <v-select v-model="form.gender" :items="genderOptions" label="Gender" variant="outlined"
                                density="comfortable" hide-details="auto" />
                        </v-col>
                    </v-row>

                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.employee_number" label="Employee Number" variant="outlined"
                                density="comfortable" hide-details="auto" disabled />
                        </v-col>
                    </v-row>

                    <div class="d-flex ga-2 mt-4">
                        <v-btn type="submit" color="primary" :loading="usersStore.loading">
                            <v-icon start>mdi-content-save</v-icon>
                            Save changes
                        </v-btn>
                        <v-btn variant="text" @click="resetForm" :disabled="usersStore.loading">Reset</v-btn>
                    </div>
                </v-form>
            </v-card-text>

            <v-divider class="my-4" />

            <!-- Cambiar contraseña -->
            <v-card-text class="px-6 pb-6">
                <div class="d-flex align-center ga-2 mb-3">
                    <v-icon>mdi-shield-key</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Change Password</span>
                </div>

                <v-form ref="pwdFormRef" v-model="pwdFormValid" @submit.prevent="onChangePassword">
                    <v-row dense>
                        <v-col cols="12" md="4">
                            <v-text-field v-model="pwd.currentPassword" :type="showCurr ? 'text' : 'password'"
                                :append-icon="showCurr ? 'mdi-eye-off' : 'mdi-eye'" @click:append="showCurr = !showCurr"
                                label="Current password" :rules="[rules.required, rules.min8]" variant="outlined"
                                density="comfortable" hide-details="auto" />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field v-model="pwd.newPassword" :type="showNew ? 'text' : 'password'"
                                :append-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'" @click:append="showNew = !showNew"
                                label="New password" :rules="[rules.required, rules.min8]" variant="outlined"
                                density="comfortable" hide-details="auto" />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field v-model="pwd.confirmPassword" :type="showConf ? 'text' : 'password'"
                                :append-icon="showConf ? 'mdi-eye-off' : 'mdi-eye'" @click:append="showConf = !showConf"
                                label="Confirm new password" :rules="[rules.required, mustMatch]" variant="outlined"
                                density="comfortable" hide-details="auto" />
                        </v-col>
                    </v-row>

                    <div class="d-flex ga-2 mt-3">
                        <v-btn type="submit" color="primary" :loading="usersStore.loading">
                            <v-icon start>mdi-lock-reset</v-icon>
                            Update password
                        </v-btn>
                        <v-btn variant="text" @click="resetPwd" :disabled="usersStore.loading">Clear</v-btn>
                    </div>
                </v-form>
            </v-card-text>

            <div class="px-4 py-3 text-caption text-medium-emphasis d-flex align-center">
                <v-icon size="16" class="me-2">mdi-clock-outline</v-icon>
                Last updated: {{ lastUpdatedText }}
            </div>
        </v-card>

        <!-- Feedback -->
        <v-snackbar v-model="snack.show" :timeout="2200" location="bottom right" color="primary">
            {{ snack.message }}
        </v-snackbar>
        <v-snackbar v-model="errSnack.show" :timeout="3500" location="bottom right" color="error">
            {{ errSnack.message }}
        </v-snackbar>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { definePage } from 'vue-router/auto'
import { format } from 'date-fns'
import { useUsersStore } from '@/stores/users/users'

definePage({ meta: { requiresAuth: true } })

const usersStore = useUsersStore()

// Estado local del usuario autenticado (aplanado, con fallback profile)
const me = reactive<any>({
    id: '',
    email: '',
    roles: [] as string[],
    isActive: true,
    createdAt: '',
    updatedAt: '',

    firstName: '',
    lastName: '',
    avatarUrl: '',
    employee_number: '',
    birthdate: '',
    phone: '',
    gender: '',
    metadata: undefined as Record<string, any> | undefined,

    profile: undefined as any, // fallback si backend regresara anidado
})

const lastUpdated = ref<Date | null>(null)
const lastUpdatedText = computed(() => (lastUpdated.value ? lastUpdated.value.toLocaleString() : '—'))

const fullName = computed(() => [me.firstName, me.lastName].filter(Boolean).join(' ').trim())

// Iniciales (primer nombre + apellido, sin tildes)
const initials = computed(() => {
    const norm = (s: string) =>
        (s || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .trim()

    const first = norm(me.firstName).split(/\s+/)[0]?.[0] ?? ''
    const last = norm(me.lastName).split(/\s+/)[0]?.[0] ?? ''
    return (first + last).toUpperCase()
})

function roleColor(r: string) {
    if (r === 'admin') return 'red'
    if (r === 'employee') return 'teal'
    if (r === 'customer') return 'indigo'
    return 'primary'
}

// ---- Form perfil
const formRef = ref<any>(null)
const formValid = ref(false)
const menu = ref(false)

const genderOptions = ['male', 'female', 'other', 'prefer_not_to_say'] // ajusta si backend usa 'M'/'F'

// Si tu backend usa 'M'/'F', mapea aquí. Si no, puedes dejarlo vacío.
const genderMap: Record<string, string> = {
    male: 'M',
    female: 'F',
    other: 'other',
    prefer_not_to_say: 'prefer_not_to_say',
}

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthdate: '' as string | Date,
    gender: '' as string,
    employee_number: '', // read-only
})

// Helpers
function toFormFromMe() {
    form.firstName = me.firstName || me.profile?.firstName || ''
    form.lastName = me.lastName || me.profile?.lastName || ''
    form.email = me.email || ''
    form.phone = me.phone || me.profile?.phone || ''
    form.birthdate = me.birthdate || me.profile?.birthdate || ''
    form.gender = me.gender || me.profile?.gender || ''
    form.employee_number = me.employee_number || me.profile?.employee_number || ''
}

function selectDate(date: string | Date) {
    form.birthdate = date
    menu.value = false
}

const rules = {
    required: (v: any) => (!!v || v === false) || 'Required.',
    email: (v: string) => /^\S+@\S+\.\S+$/.test(v) || 'Invalid email.',
    min8: (v: string) => (!!v && v.length >= 8) || 'Min 8 chars.',
}

// ---- Password form
const pwdFormRef = ref<any>(null)
const pwdFormValid = ref(false)
const pwd = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const showCurr = ref(false), showNew = ref(false), showConf = ref(false)
const mustMatch = (v: string) => v === pwd.newPassword || 'Passwords do not match.'
function resetPwd() { pwd.currentPassword = pwd.newPassword = pwd.confirmPassword = ''; showCurr.value = showNew.value = showConf.value = false }

// ---- Feedback
const snack = reactive({ show: false, message: '' })
const errSnack = reactive({ show: false, message: '' })

// ---- Actions
async function refreshMe() {
    try {
        const data = await usersStore.fetchMe()
        Object.assign(me, data || {})
        toFormFromMe()
        lastUpdated.value = new Date()
    } catch (e: any) {
        errSnack.message = e.message || 'Failed to load profile.'
        errSnack.show = true
    }
}

// Construye payload plano (lo mapea toUpdateDto → dto.profile) y agrega root no-op
function buildPayload() {
    const toYYYYMMDD = (val: string | Date) =>
        typeof val === 'string' ? val : format(val, 'yyyy-MM-dd')

    const payload: any = {
        // planos -> el store los mete en dto.profile
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
        birthdate: form.birthdate ? toYYYYMMDD(form.birthdate) : undefined,
        // si backend usa 'M'/'F', se mapea; si no, queda igual
        gender: (genderMap[form.gender] ?? form.gender) || undefined,

        // root no-op para que el backend no diga "no fields to update"
        isActive: me.isActive,
    }

    return payload
}

async function onSaveProfile() {
    const result = await formRef.value?.validate()
    const valid = typeof result === 'object' ? !!result.valid : !!result
    if (!valid) return

    try {
        const payload = buildPayload()

        // Si todos los planos vienen undefined y solo queda isActive (no-op), evita pegar al backend
        const { isActive, ...profileLike } = payload
        const onlyRoot = Object.values(profileLike).every(v => typeof v === 'undefined')
        if (onlyRoot) {
            snack.message = 'Nothing to update.'
            snack.show = true
            formRef.value?.resetValidation()
            return
        }

        await usersStore.updateMe(payload)

        // Relee del backend para asegurar consistencia visual
        const fresh = await usersStore.fetchMe()
        Object.assign(me, fresh || {})
        toFormFromMe()
        lastUpdated.value = new Date()

        snack.message = 'Profile updated successfully.'
        snack.show = true

        // Limpia validaciones tras guardar
        formRef.value?.resetValidation()
    } catch (e: any) {
        errSnack.message = e.message || 'Failed to update profile.'
        errSnack.show = true
    }
}

async function onChangePassword() {
    const result = await pwdFormRef.value?.validate()
    const valid = typeof result === 'object' ? !!result.valid : !!result
    if (!valid) return

    try {
        await usersStore.changeMyPassword({
            currentPassword: pwd.currentPassword,
            newPassword: pwd.newPassword,
        })

        resetPwd()
        pwdFormRef.value?.resetValidation()

        snack.message = 'Password updated successfully.'
        snack.show = true
    } catch (e: any) {
        errSnack.message = e.message || 'Failed to change password.'
        errSnack.show = true
    }
}

function resetForm() {
    toFormFromMe()
    formRef.value?.resetValidation()
}

onMounted(refreshMe)
</script>

<style scoped>
:deep(.v-field) {
    --v-field-padding-start: 12px;
    --v-field-padding-end: 8px;
}
</style>
