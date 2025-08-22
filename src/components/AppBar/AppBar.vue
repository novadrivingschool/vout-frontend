<template>
  <!-- TOP NAVBAR -->
  <v-app-bar app fixed color="primary" dark>
    <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen" />
    <v-toolbar-title>CRM Dashboard</v-toolbar-title>
    <v-spacer />

    <!-- BOTÓN DE TEMA -->
    <v-btn icon @click="isDarkTheme = !isDarkTheme" title="Toggle theme">
      <v-icon>{{ isDarkTheme ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
    </v-btn>

    <v-btn icon @click="handleLogout" title="Log out">
      <v-icon>mdi-logout</v-icon><!-- v-if="!isLoginPage"  -->
    </v-btn>
  </v-app-bar>

  <!-- LEFT SIDEBAR -->
  <v-navigation-drawer v-if="!isLoginPage" app v-model="drawerOpen" permanent :width="300">
    <v-list nav dense>
      <!-- Navigation Items -->
      <v-list-item v-for="item in navigationItems" :key="`nav-${item.route}`" :to="item.route" :title="item.title"
        :prepend-icon="item.icon" link />

      <!-- Virtual Office -->
      <v-list-group v-model="groupStates.virtualOffice">
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-office-building-outline" title="Virtual Office" />
        </template>
        <v-list-item v-for="virtual in virtualOffice" :key="`record-${virtual.route}`" :to="virtual.route"
          :title="virtual.title" :prepend-icon="virtual.icon" link />
      </v-list-group>

      <!-- Virtual Office -->
      <v-list-group v-model="groupStates.calendar">
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-calendar-month" title="Calendar" />
        </template>
        <v-list-item v-for="cal in calendar" :key="`record-${cal.route}`" :to="cal.route"
          :title="cal.title" :prepend-icon="cal.icon" link />
      </v-list-group>

      <!-- Section: Records -->
      <v-list-group v-model="groupStates.crmCore">
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-puzzle-outline" title="CRM Core" />
        </template>
        <v-list-item v-for="record in recordsSection" :key="`record-${record.route}`" :to="record.route"
          :title="record.title" :prepend-icon="record.icon" link />
      </v-list-group>

      <!-- Calendar -->
      <v-list-group v-model="groupStates.calendar">
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-calendar" title="Calendar" />
        </template>
        <v-list-item v-for="sub in typeCalendar" :key="`table-${sub.route}`" :to="sub.route" :title="sub.title"
          :prepend-icon="sub.icon" link />
      </v-list-group>

      <!-- Section: Students & Instructors -->
      <v-list-group v-model="groupStates.otherTables">
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-account-group" title="Students & Instructors" />
        </template>
        <v-list-item v-for="sub in studentsInstructors" :key="`table-${sub.route}`" :to="sub.route" :title="sub.title"
          :prepend-icon="sub.icon" link />
      </v-list-group>

      <!-- Section: Other Tables -->
      <v-list-group v-model="groupStates.studentsInstructors">
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-database" title="Other Tables" />
        </template>
        <v-list-item v-for="sub in otherTables" :key="`table-${sub.route}`" :to="sub.route" :title="sub.title"
          :prepend-icon="sub.icon" link />
      </v-list-group>

      <!-- Dashboard -->
      <v-list-group v-model="groupStates.dashboards">
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-view-dashboard" title="Dashboards" />
        </template>
        <v-list-item v-for="sub in dashboards" :key="`table-${sub.route}`" :to="sub.route" :title="sub.title"
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
  crmCore: true,
  otherTables: true,
  dashboards: true,
  calendar: true,
  studentsInstructors: true,
  virtualOffice: true,
})

const navigationItems = [
  { title: 'Payment', icon: 'mdi-credit-card-outline', route: '/payment' },
]

const recordsSection = [
  /* { title: 'Add', icon: 'mdi-account-plus-outline', route: '/add' }, */
  { title: 'Leads', icon: 'mdi-account-multiple', route: '/leads' },
  { title: 'Contacts', icon: 'mdi-account-box-outline', route: '/contacts' },
  { title: 'Deals', icon: 'mdi-handshake-outline', route: '/deals' },
]

const studentsInstructors = [
  { title: 'Students', icon: 'mdi-account-multiple-outline', route: '/students' },
  { title: 'Instructors', icon: 'mdi-account-tie-outline', route: '/instructors' },
]

const otherTables = [
  { title: 'Programs', icon: 'mdi-school-outline', route: '/programs' },
  { title: 'Sources', icon: 'mdi-source-branch', route: '/sources' },
  { title: 'Locations', icon: 'mdi-map-marker-outline', route: '/locations' },
  { title: 'Not Sold Reasons', icon: 'mdi-comment-question-outline', route: '/notsoldreasons' },
]

const dashboards = [
  { title: 'Admin dashboard', icon: 'mdi-monitor-dashboard', route: '/admin-dashboard' },
]

const typeCalendar = [
  { title: 'Instructor`s Calendar', icon: 'mdi-calendar-star', route: '/instructor-calendar' },
  { title: 'Student`s Calendar', icon: 'mdi-calendar-multiple', route: '/student-calendar' },
]

const virtualOffice = [
  { title: 'Virtual Office', icon: 'mdi-monitor-account', route: '/virtual-office' }
]

const calendar = [
  { title: 'Calendar', icon: 'mdi-calendar-month', route: '/calendar' }
]

const handleLogout = () => {
  localStorage.removeItem('auth')
  router.push('/')
}
</script>
