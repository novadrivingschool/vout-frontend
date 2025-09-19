<template>
  <v-container fluid class="pa-0 mt-appbar">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="9" xl="8">
        <v-card class="text-center hero-card" elevation="10" max-width="1200" style="margin:auto;">
          <div class="hero-head">
            <!-- Bloque animado según la hora -->
            <div class="hero-anim" :class="dayPhase">
              <!-- Morning: sun rotates -->
              <template v-if="dayPhase === 'morning'">
                <v-icon size="64" class="sun spin">mdi-weather-sunny</v-icon>
              </template>

              <!-- Afternoon: sun + drifting cloud -->
              <template v-else-if="dayPhase === 'afternoon'">
                <div class="sky">
                  <v-icon size="64" class="sun fixed-sun">mdi-weather-sunny</v-icon>
                  <v-icon size="64" class="cloud drift">mdi-cloud-outline</v-icon>
                </div>
              </template>

              <!-- Night: moon floats + twinkling stars -->
              <template v-else>
                <div class="night-sky">
                  <v-icon size="64" class="moon float">mdi-moon-waxing-crescent</v-icon>
                  <span class="star s1"></span>
                  <span class="star s2"></span>
                  <span class="star s3"></span>
                  <span class="star s4"></span>
                </div>
              </template>
            </div>

            <!-- Título / subtítulo -->
            <h1 class="hero-title">
              {{ auth.greeting }}, {{ auth.displayName }}!
            </h1>
            <p class="hero-subtitle">
              Let's make today productive!
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth/auth'

const auth = useAuthStore()

// Fase del día (para decidir animaciones)
const dayPhase = computed<'morning' | 'afternoon' | 'night'>(() => {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  return 'night'
})
</script>

<style scoped>
/* Separación del appbar — compacta */
.mt-appbar {
  margin-top: calc(var(--v-layout-top, 64px) + 12px);
}

/* Card con contraste que respeta el tema */
.hero-card {
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  padding: 24px 20px;
  background: linear-gradient(180deg,
      color-mix(in srgb, var(--v-theme-surface) 88%, var(--v-theme-primary) 12%) 0%,
      color-mix(in srgb, var(--v-theme-surface) 72%, var(--v-theme-primary) 28%) 100%);
  outline: 1px solid color-mix(in srgb, var(--v-theme-on-surface) 8%, transparent);
}

/* Contenido centrado */
.hero-head {
  display: grid;
  justify-items: center;
  gap: 8px;
}

/* Área del ícono animado: altura fija para no dejar huecos */
.hero-anim {
  position: relative;
  height: 78px;
  /* controla alto del bloque del ícono */
  width: 160px;
  /* ancho para las composiciones (sol+nube/estrellas) */
  display: grid;
  place-items: center;
}

/* Título/Subtítulo */
.hero-title {
  margin: 4px 0 0;
  line-height: 1.2;
  font-weight: 600;
  font-size: clamp(22px, 3.4vw, 40px);
  color: var(--v-theme-on-surface);
  text-shadow: 0 1px 0 rgba(0, 0, 0, .08);
}

.hero-subtitle {
  margin: 2px 0 0;
  font-size: clamp(13px, 1.8vw, 16px);
  color: color-mix(in srgb, var(--v-theme-on-surface) 78%, transparent);
}

/* ===== Colores base por fase ===== */
.morning .sun {
  color: #FFC107;
}

/* amber */
.afternoon .sun {
  color: #40C4FF;
}

/* light blue */
.afternoon .cloud {
  color: #bae2ff;
  opacity: .95;
}

.night .moon {
  color: #B39DDB;
}

/* lavender */

/* Sombras suaves para volumen */
.sun,
.cloud,
.moon {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, .18));
}

/* ======= Morning: sun rotates ======= */
.spin {
  animation: spin 9s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* ======= Afternoon: drifting cloud ======= */
.sky {
  position: relative;
  width: 160px;
  height: 78px;
}

.fixed-sun {
  position: absolute;
  left: 6px;
  top: 2px;
}

.cloud {
  position: absolute;
  left: 46px;
  top: 0;
  animation: drift-x 4.6s ease-in-out infinite;
}

@keyframes drift-x {
  0% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(34px);
  }

  100% {
    transform: translateX(0);
  }
}

/* ======= Night: floating moon + twinkling stars ======= */
.night-sky {
  position: relative;
  width: 160px;
  height: 78px;
}

.moon {
  position: absolute;
  left: 14px;
  top: 0;
  animation: float-y 3.2s ease-in-out infinite;
}

@keyframes float-y {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

/* Estrellas (cuatro puntos) con parpadeo desfasado */
.star {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #D1C4E9;
  opacity: .85;
  box-shadow: 0 0 8px rgba(209, 196, 233, .6);
  animation: twinkle 2.2s ease-in-out infinite;
}

.s1 {
  right: 18px;
  top: 10px;
  animation-delay: .1s;
}

.s2 {
  right: 36px;
  top: 22px;
  animation-delay: .6s;
}

.s3 {
  right: 8px;
  top: 28px;
  animation-delay: 1.1s;
}

.s4 {
  right: 48px;
  top: 8px;
  animation-delay: 1.5s;
}

@keyframes twinkle {

  0%,
  100% {
    opacity: .25;
    transform: scale(.85);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive tweaks */
@media (max-width:600px) {
  .hero-card {
    padding: 20px 16px;
    border-radius: 14px;
  }

  .hero-anim {
    width: 140px;
    height: 72px;
  }
}
</style>
