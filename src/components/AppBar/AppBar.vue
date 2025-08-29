<template>

  <v-app-bar app fixed class="custom-appbar" dark>
    <!-- Ícono sin margen extra -->
    <v-app-bar-nav-icon color="white" @click="drawerOpen = !drawerOpen" class="tight-navicon" />



    <!-- Logo pegado al ícono -->
    <v-toolbar-title>
      <v-img src="@/assets/Logos/voutLogoBlanco.png" alt="Logo" max-width="190" class="cursor-pointer"
        @click="$router.push('/welcome')" />
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
  <v-navigation-drawer v-if="!isLoginPage" v-model="drawerOpen" temporary :width="300">

    <v-list nav dense>
      <!-- Navigation Items -->



      <!-- Activity Report -->
      <v-list-group v-model="groupStates.activityReport" >
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-chart-bar" title="Activity Report" style="min-height:40px;"/>
        </template>
        <v-list-item v-for="sub in activityReport" :key="`table-${sub.route}`" :to="sub.route" :title="sub.title"
          :prepend-icon="sub.icon" link />
      </v-list-group>

      <!-- Costumers -->
      <v-list-group v-model="groupStates.Customers" >
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-handshake" title="Customers" style="min-height:35px;" />
        </template>
        <v-list-item v-for="sub in Customers" :key="`table-${sub.route}`" :to="sub.route" :title="sub.title"
          :prepend-icon="sub.icon" link  />
      </v-list-group>

      <!-- Departments -->
      <v-list-group v-model="groupStates.Departments" >
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-account-group" title="Departments"  style="min-height:35px;" />
        </template>
        <v-list-item v-for="sub in Departments" :key="`table-${sub.route}`" :to="sub.route" :title="sub.title"
          :prepend-icon="sub.icon" link />
      </v-list-group>

      <!-- Activities -->
      <v-list-group v-model="groupStates.Activities">
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-calendar-check" title="Activities" dense style="min-height:35px;" />
        </template>
        <v-list-item v-for="sub in Activities" :key="`table-${sub.route}`" :to="sub.route" :title="sub.title"
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
  Customers: true,
  Departments: true,
  Activities: true,
})



const activityReport = [
  { title: 'User Activity Report', icon: 'mdi-file-document', route: '/activity-report' }
]

const Customers = [
  { title: 'Customers', icon: 'mdi-account-multiple', route: '/customers' }
]

const Departments = [
  { title: 'Departments', icon: 'mdi-briefcase', route: '/departments' }
]

const Activities = [
  { title: 'Activities', icon: 'mdi-clipboard-text', route: '/activities' }
]

const handleLogout = () => {
  localStorage.removeItem('auth')
  router.push('/')
}
</script>


<style scoped>
.custom-appbar {
  background: linear-gradient(135deg,
      #001a26 0%,
      #004f75 50%,
      #0099cc 100%) !important;
}


.v-list-group {
  margin-bottom: 0px !important;
}

.v-list-item {
  margin-bottom: 0px !important;
}


</style>

