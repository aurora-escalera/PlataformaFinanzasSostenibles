<!-- ScalablePerson.vue - Figura humana escalable según población -->
<!-- ✅ MODIFICADO: Personaje más grande, sin barra, sin animación de crecimiento -->
<template>
  <div class="person-chart">
    <svg 
      :viewBox="`0 0 100 ${svgHeight}`" 
      class="person-svg"
    >
      <defs>
        <linearGradient id="personGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2d5a87" />
          <stop offset="100%" stop-color="#0F3759" />
        </linearGradient>
        
        <linearGradient id="personGradientHead" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a5f" />
          <stop offset="100%" stop-color="#0F3759" />
        </linearGradient>
        
        <filter id="personShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="2" flood-opacity="0.25"/>
        </filter>
      </defs>
      
      <!-- Círculos de onda animados -->
      <circle 
        v-for="(ring, index) in 3" 
        :key="'ring-' + index"
        cx="50" 
        :cy="personY"
        :r="personScale * (25 + index * 15)"
        fill="none"
        :stroke="'rgba(30, 58, 95, ' + (0.15 - index * 0.04) + ')'"
        stroke-width="1.5"
        class="pulse-ring"
        :style="{ animationDelay: index * 0.4 + 's' }"
      />
      
      <!-- Sombra en el suelo -->
      <ellipse 
        :cx="50" 
        :cy="svgHeight - 2"
        :rx="personScale * 15" 
        :ry="personScale * 4"
        fill="rgba(15, 55, 89, 0.15)"
        class="ground-shadow"
      />
      
      <!-- Figura humana -->
      <g 
        :transform="`translate(50, ${personY}) scale(${personScale})`"
        class="person-figure"
        filter="url(#personShadow)"
      >
        <!-- Cabeza -->
        <circle 
          cx="0" 
          cy="-30" 
          r="10" 
          fill="url(#personGradientHead)"
          class="person-head"
        />
        
        <!-- Brillo en cabeza -->
        <ellipse
          cx="-3"
          cy="-33"
          rx="3"
          ry="2"
          fill="rgba(255, 255, 255, 0.25)"
        />
        
        <!-- Cuerpo -->
        <rect
          x="-7"
          y="-20"
          width="14"
          height="24"
          rx="3"
          fill="url(#personGradient)"
          class="person-body"
        />
        
        <!-- Brazos -->
        <rect
          x="-15"
          y="-16"
          width="8"
          height="3"
          rx="1.5"
          fill="url(#personGradient)"
          class="person-arm-left"
        />
        <rect
          x="7"
          y="-16"
          width="8"
          height="3"
          rx="1.5"
          fill="url(#personGradient)"
          class="person-arm-right"
        />
        
        <!-- Piernas -->
        <rect
          x="-6"
          y="4"
          width="4"
          height="15"
          rx="2"
          fill="url(#personGradient)"
          class="person-leg-left"
        />
        <rect
          x="2"
          y="4"
          width="4"
          height="15"
          rx="2"
          fill="url(#personGradient)"
          class="person-leg-right"
        />
      </g>
    </svg>
    
    <!-- Indicador de puntos -->
    <div class="scale-dots-indicator">
      <div class="dots-container">
        <span 
          v-for="n in 5" 
          :key="n" 
          class="dot"
          :class="{ 'active': n <= scaleLevel }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { 
    type: Number, 
    default: 0
  }
})

// Normalizar población a escala 0-100 usando escala logarítmica
const normalizedValue = computed(() => {
  if (props.value === 0) return 0
  
  const minPop = 50000
  const maxPop = 10000000
  
  const logValue = Math.log10(props.value)
  const logMin = Math.log10(minPop)
  const logMax = Math.log10(maxPop)
  
  const normalized = ((logValue - logMin) / (logMax - logMin)) * 100
  
  return Math.max(0, Math.min(100, normalized))
})

// Calcular nivel de escala (1-5) basado en el valor
const scaleLevel = computed(() => {
  const val = props.value
  if (val >= 8000000) return 5
  if (val >= 4000000) return 4
  if (val >= 2000000) return 3
  if (val >= 1000000) return 2
  return 1
})

// Altura del SVG - más grande
const svgHeight = computed(() => {
  return 95
})

// Escala de la persona - MÁS GRANDE (0.9 a 1.3)
const personScale = computed(() => {
  return 0.9 + (normalizedValue.value / 100) * 0.4
})

// Posición Y de la persona
const personY = computed(() => {
  return svgHeight.value - 22
})
</script>

<style scoped>
.person-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 5px;
  overflow: hidden;
}

.person-svg {
  width: 100%;
  height: auto;
  max-width: 70px;
  flex: 1;
  min-height: 0;
}

/* Círculos de onda pulsante */
.pulse-ring {
  opacity: 0;
  animation: pulseRing 3s ease-out infinite;
}

@keyframes pulseRing {
  0% {
    opacity: 0.6;
    transform: scale(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}

.person-figure {
  transform-origin: center bottom;
}

/* Animación de respiración */
.person-head {
  animation: breathe 3s ease-in-out infinite;
  transform-origin: center;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

/* Animación sutil de brazos */
.person-arm-left,
.person-arm-right {
  animation: wave 4s ease-in-out infinite;
  transform-origin: right center;
}

.person-arm-right {
  transform-origin: left center;
  animation-delay: 2s;
}

@keyframes wave {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(3deg);
  }
}

/* Indicador de puntos */
.scale-dots-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.dots-container {
  display: flex;
  gap: 5px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.dot.active {
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  box-shadow: 0 2px 6px rgba(30, 58, 95, 0.35);
}
</style>