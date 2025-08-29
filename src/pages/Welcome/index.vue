<template>
  <v-container fluid style="padding-left: 0; padding-right: 0;">
    <v-row justify="center">
      <!-- Usamos cols="12" para que ocupe todo el ancho disponible y ajustamos max-width en la card -->
      <v-col cols="12" md="10" lg="10">
        <v-card
          class="pa-8 text-center"
          elevation="6"
          style="max-width: 1200px; margin: auto;"
        >
          <v-icon size="72" class="mb-4">{{ userStore.greetingIcon }}</v-icon>
          <h2 class="mb-2">{{ userStore.greeting }}, {{ userStore.name }}!</h2>
          <p class="text-subtitle-1 grey--text">
            Let's make today productive!
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/User/userStore'
const userStore = useUserStore()


</script>

<style scoped>
.v-card {
  border-radius: 16px;
}
</style>
