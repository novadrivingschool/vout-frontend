<template>
    <v-container fluid class="login-screen d-flex align-center justify-center">
        <v-card class="pa-8 login-card" width="380" elevation="4">
            <div class="mb-6 d-flex logo-wrapper">
                <v-img src="@/assets/Logos/ant.png" alt="CRM Logo" max-width="100" max-height="100" contain
                    class="logo-img" />
                <h2 class="crm-title text-white">Flowly</h2>
            </div>
            <p class="crm-subtitle"><strong class="highlight">CRM</strong> Empowering your workflow</p>

            <v-form @submit.prevent="handleLogin" class="mt-6">
                <v-text-field v-model="email" label="Email" variant="underlined" density="comfortable"
                    class="mb-4 minimal-input" hide-details />
                <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'" label="Password"
                    variant="underlined" density="comfortable" class="mb-6 minimal-input" hide-details
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword" />

                <v-btn type="submit" color="#2d2d2d" class="custom-btn" block rounded>
                    Sign In
                </v-btn>
            </v-form>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = () => {
    if (email.value === 'admin' && password.value === '1234') {
        //router.push('/dashboard')
        router.push('/leads')
    } else {
        alert('Invalid credentials')
    }
}
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');

/* Fuerza pantalla completa y fondo oscuro, sin depender del padre */
.login-screen {
    min-height: 100vh;
    /* clave */
    background-color: #121212;
    padding: 0;
    /* elimina padding lateral del container */
}

/* --- tus estilos tal cual --- */
.login-card {
    background-color: #1f1f1f;
    border-radius: 16px;
}

.minimal-input .v-field {
    background-color: transparent !important;
    border-bottom: 1px solid #555;
    border-radius: 0;
}

.minimal-input .v-label {
    color: white !important;
}

.minimal-input input {
    color: white !important;
}

/* Label flotante de Vuetify 3 */
.minimal-input .v-field-label {
  color: white !important;
}

.minimal-input .v-icon {
  color: white !important;
}

/* Texto que escribe el usuario + caret */
.minimal-input :deep(.v-field__input) {
  color: #fff !important;
  caret-color: #fff !important;
}

/* Label flotante (Vuetify 3) */
.minimal-input :deep(.v-field-label) {
  color: #fff !important;
}

/* Ícono del ojo */
.minimal-input :deep(.v-icon) {
  color: #fff !important;
}

/* Línea inferior del "underlined" (más visible) */
.minimal-input :deep(.v-field__outline),
.minimal-input :deep(.v-field__overlay) {
  border-color: rgba(255,255,255,0.7) !important;
  background: transparent !important;
}

.v-input__control {
    color: white !important;
}

.custom-btn {
    color: white;
    background-color: #2d2d2d;
    transition: background-color .3s ease;
}

.custom-btn:hover {
    background-color: #3a3a3a;
}

.logo-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 2px;
}

.logo-img {
    display: inline-block;
    vertical-align: bottom;
}

.crm-title {
    font-size: 4.5rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 5.5px;
    font-family: 'Space Grotesk', sans-serif;
}

.crm-subtitle {
    font-size: .9rem;
    color: #b0b0b0;
    margin-top: -30px;
    margin-left: 10px;
}

.highlight {
    color: #fff;
    font-weight: 600;
}
</style>