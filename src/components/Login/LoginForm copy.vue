<template>
    <v-container fluid class="login-screen d-flex align-center justify-center">
        <v-card class="login-card pa-8" width="500">
            <!-- Logo + Título -->
            <div class="text-center mb-1">
                <v-img src="@/assets/logos/voutLogoBlanco.png" alt="V-Out Logo" contain class="mx-auto mb-2" />
            </div>
            <!-- Formulario -->
            <v-form @submit.prevent="handleLogin">
                <v-text-field v-model="email" label="Username" variant="underlined" density="comfortable"
                    style="color: white" class="mb-4 minimal-input" hide-details />
                <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'" label="Password"
                    variant="underlined" density="comfortable" style="color: white" class="mb-6 minimal-input "
                    hide-details :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword" />
                <v-btn type="submit" class="custom-btn" block rounded>
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
        router.push('/welcome')
    } else {
        alert('Invalid credentials')
    }
}
</script>

<style scoped>
.login-screen {
    min-height: 100vh;
    padding: 0;
    position: relative;
    overflow: hidden;
    background-color: #ffffff;
    /* Fondo blanco */

    /* Fondo con imagen */
    background-image: url('@/assets/Logos/FondoLogin.png');
    /* ruta relativa desde tu proyecto */
    background-size: cover;
    /* ajusta la imagen para cubrir todo el contenedor */
    background-position: center;
    /* centra la imagen */
    background-repeat: no-repeat;
    /* evita repetir la imagen */
}

/* Eliminamos el fondo diagonal */
.login-screen::before {
    content: "";
    display: none;
    /* quitamos el gradiente anterior */
}

/* Card azul translúcido con efecto de luz */

.login-card {
    position: relative;
    z-index: 1;

    background:
        linear-gradient(135deg, #001a26 0%, #004f75 50%, #0099cc 100%);

    backdrop-filter: blur(15px);
    border-radius: 15px;

    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    overflow: hidden;

}


/* Inputs */
.minimal-input .v-field {
    background-color: transparent !important;
    border-radius: 0;
}

.minimal-input input {
    color: white !important;
}

.minimal-input :deep(.v-field-label) {
    color: #ccc !important;
}


.minimal-input :deep(.v-icon) {
    color: white !important;
}

/* Botón */
.custom-btn {
    background-color: transparent !important;
    color: white !important;
    border: 2px solid #F28C2B !important;
    font-weight: 600;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.custom-btn:hover {
    background-color: #F28C2B !important;
}
</style>