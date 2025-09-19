<route lang="json">{
    "name": "forbidden",
    "meta": {
        "requiresAuth": true
    }
}</route>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
function goBack() {
    router.push('/welcome') // ajusta si quieres otra ruta
}
</script>

<template>
    <v-container class="fill-height d-flex flex-column align-center justify-center text-center">
        <v-icon size="80" color="error" class="mb-4">mdi-lock-alert</v-icon>

        <h1 class="text-h5 font-weight-bold mb-2">Access Denied</h1>
        <p class="text-medium-emphasis mb-6">
            You don’t have permission to view this page.
        </p>

        <v-btn color="primary" variant="flat" @click="goBack">
            Go to Dashboard
        </v-btn>
    </v-container>
</template>
