/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'
import '@/styles/autofill-fix.css'
//import '@/styles/responsive.scss'

// ⬇️ Zoom global (usa zoom/transform y CSS vars)
import '@/styles/ui-zoom.css'

const app = createApp(App)
registerPlugins(app)

/* ---------------------- UI ZOOM (dev + prod) ---------------------- */
// Agrega la clase que activa el zoom global
document.documentElement.classList.add('app-zoom')

// Helpers
const clamp = (n: number) => Math.max(0.7, Math.min(1.1, n))
const applyZoom = (z: number) =>
  document.documentElement.style.setProperty('--app-zoom', String(z))

const lsKey = 'APP_UI_SCALE'

function hasLocalOverride(): boolean {
  const v = localStorage.getItem(lsKey)
  return v !== null && !Number.isNaN(parseFloat(v))
}

function readLocalOverride(): number {
  return clamp(parseFloat(localStorage.getItem(lsKey) as string))
}

function computeAdaptiveZoom(): number {
  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = window.devicePixelRatio || 1

  // Breakpoints prácticos para laptop/desktop
  let z = 1
  if (w <= 1280 || h <= 800) z = 0.85
  else if (w <= 1366 || h <= 864) z = 0.875
  else if (w <= 1440 || h <= 900) z = 0.9
  else if (w <= 1536 || h <= 960) z = 0.94
  else if (w <= 1920) z = 0.97

  // Ajuste fino por pantallas de alta densidad
  if (dpr >= 2 && (w <= 1536 || h <= 960)) z -= 0.02

  return clamp(z)
}

// Env (opcional)
const envAny = (import.meta as any).env || {}
const envFixed = envAny.VITE_UI_ZOOM as string | undefined
const adaptiveEnabled = (envAny.VITE_UI_ZOOM_ADAPTIVE ?? 'true') !== 'false'

// Prioridad: LocalStorage > ENV fijo > Adaptativo > 1
let fixed = false

if (hasLocalOverride()) {
  fixed = true
  applyZoom(readLocalOverride())
} else if (envFixed !== undefined && envFixed !== '') {
  fixed = true
  applyZoom(clamp(parseFloat(envFixed)))
} else if (adaptiveEnabled) {
  applyZoom(computeAdaptiveZoom())
} else {
  fixed = true
  applyZoom(1)
}

// Recalcular en resize si estamos en modo adaptativo
if (!fixed && adaptiveEnabled) {
  window.addEventListener('resize', () => applyZoom(computeAdaptiveZoom()))
}

// API opcional para fijar escala en runtime y persistirla
;(window as any).setUiScale = (z: number) => {
  const v = clamp(z)
  localStorage.setItem(lsKey, String(v))
  applyZoom(v)
}
/* --------------------------------------------------------------- */

app.mount('#app')
