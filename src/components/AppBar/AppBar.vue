<template>
<v-app-bar app fixed color="#88C7DE" dark>
  <!-- Ícono sin margen extra -->
  <v-app-bar-nav-icon color="white"
    @click="drawerOpen = !drawerOpen"
    class="tight-navicon"
  />

  <!-- Logo pegado al ícono -->
   <v-toolbar-title>
      <v-img
    src="@/assets/Logos/voutLogo1.png"
    alt="Logo"
    
    max-width="190"
    class="cursor-pointer"
    @click="$router.push('/welcome')"
  />
   </v-toolbar-title>

     
    <v-spacer />

    <!-- BOTÓN DE TEMA -->
    <v-btn icon @click="isDarkTheme = !isDarkTheme" title="Toggle theme">
      <v-icon color="white">{{ isDarkTheme ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
    </v-btn>

    <v-btn icon @click="handleLogout" title="Log out">
      <v-icon color="white">mdi-logout</v-icon><!-- v-if="!isLoginPage"  -->
    </v-btn>
  </v-app-bar>

  <!-- LEFT SIDEBAR -->
  <v-navigation-drawer
  v-if="!isLoginPage"
  v-model="drawerOpen"
  temporary
  :width="300"
>

    <v-list nav dense>
      <!-- Navigation Items -->

      

      <!-- Activity Report (grupo desplegable) -->
      <v-list-group v-model="groupStates.activityReport">
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-chart-bar" title="Activity Report" />
        </template>
        <v-list-item v-for="sub in activityReport" :key="`table-${sub.route}`" :to="sub.route" :title="sub.title"
          :prepend-icon="sub.icon" link />
      </v-list-group>

    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const router = useRouter()
const route = useRoute()
const drawerOpen = ref(false)

const isLoginPage = computed(() => route.path === '/')

const theme = useTheme()

resizeObserver: null as ResizeObserver | null,



  // Cargar el tema guardado en localStorage
  onMounted(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'light'
    theme.global.name.value = savedTheme
  })

// Emite evento para forzar redibujo del calendario al cambiar el drawer
watch(drawerOpen, () => {
  window.dispatchEvent(new CustomEvent('drawer-toggled'))
})


const isDarkTheme = computed({
  get: () => theme.global.name.value === 'dark',
  set: (val) => {
    const selected = val ? 'dark' : 'light'
    theme.global.name.value = selected
    localStorage.setItem('app-theme', selected) // Guardar elección
  },
})


// State for list group expansions
const groupStates = ref({

  activityReport: true,
})


const activityReport = [
  { title: 'User Activity Report', icon: 'mdi-file-document', route: '/activity-report' }
]

const handleLogout = () => {
  localStorage.removeItem('auth')
  router.push('/')
}
</script>
