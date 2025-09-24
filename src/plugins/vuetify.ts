// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// Labs components
import { VCalendar } from 'vuetify/labs/VCalendar'
import { VTimePicker } from 'vuetify/labs/VTimePicker'

export default createVuetify({
  // (2) Densidad global (compacta) + ajustes por componente
  defaults: {
    global: { density: 'compact' },
    VBtn: { density: 'comfortable' },       // botones un pelín más altos
    VTextField: { density: 'compact' },
    VSelect: { density: 'compact' },
    VTextarea: { density: 'compact' },
    VDataTable: { density: 'compact' },
    VListItem: { density: 'compact' },
    VToolbar: { density: 'comfortable' },
    VChip: { density: 'comfortable' },
    VCard: { rounded: 'lg' },
  },

  // Tu tema tal cual
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#F4F5F7',
          surface: '#F9FAFB',
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#A5B4FC',
          error: '#EF4444',
          warning: '#FACC15',
          success: '#10B981',
          info: '#60A5FA',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#0D1117',
          surface: '#161B22',
          primary: '#3B82F6',
          secondary: '#8B949E',
          accent: '#60A5FA',
          error: '#EF4444',
          warning: '#F59E0B',
          success: '#3BA55D',
          info: '#93C5FD',
        },
      }
    },
  },

  components: { VCalendar, VTimePicker },
})
