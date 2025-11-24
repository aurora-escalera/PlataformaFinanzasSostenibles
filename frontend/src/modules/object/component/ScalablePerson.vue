<!-- PersonChart.vue - Figura humana escalable según población -->
<template>
  <div class="person-chart">
    <svg 
      :viewBox="`0 0 100 ${svgHeight}`" 
      class="person-svg"
      :style="{ height: containerHeight + 'px' }"
    >
      <defs>
        <linearGradient id="personGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1a4d7a" />
          <stop offset="100%" stop-color="#0F3759" />
        </linearGradient>
        
        <filter id="personShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Sombra en el suelo -->
      <ellipse 
        :cx="50" 
        :cy="svgHeight - 3"
        :rx="personScale * 15" 
        :ry="personScale * 3"
        fill="rgba(15, 55, 89, 0.2)"
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
          fill="url(#personGradient)"
          class="person-head"
        />
        
        <!-- Cuerpo -->
        <rect
          x="-7"
          y="-20"
          width="14"
          height="24"
          rx="2.5"
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
    
    <!-- Indicador de escala -->
    <div class="scale-indicator">
      <div class="scale-bar">
        <div 
          class="scale-fill" 
          :style="{ width: animatedValue + '%', background: scaleColor }"
        ></div>
      </div>
      <div class="scale-label">
        {{ formatPopulation(props.value) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  value: { 
    type: Number, 
    default: 0
  }
})

const animatedValue = ref(0)

// Normalizar población a escala 0-100 usando escala logarítmica
const normalizedValue = computed(() => {
  if (props.value === 0) return 0
  
  // Escala logarítmica para mejor visualización
  // Poblaciones típicas en México: 50,000 a 10,000,000
  const minPop = 50000  // Población mínima esperada
  const maxPop = 10000000  // Población máxima esperada (Ej: CDMX)
  
  // Normalizar con logaritmo para mejor distribución visual
  const logValue = Math.log10(props.value)
  const logMin = Math.log10(minPop)
  const logMax = Math.log10(maxPop)
  
  const normalized = ((logValue - logMin) / (logMax - logMin)) * 100
  
  // Limitar entre 0 y 100
  return Math.max(0, Math.min(100, normalized))
})

// Altura del contenedor según el valor normalizado
const containerHeight = computed(() => {
  return 55 + (animatedValue.value / 100) * 20
})

// Altura del SVG
const svgHeight = computed(() => {
  return 75 + (animatedValue.value / 100) * 20
})

// Escala de la persona (0.6 a 1.0) - Reducida para evitar desbordamiento
const personScale = computed(() => {
  return 0.6 + (animatedValue.value / 100) * 0.4
})

// Posición Y de la persona para mantenerla en el suelo
const personY = computed(() => {
  return svgHeight.value - 25
})

// Color de la barra según el valor
const scaleColor = computed(() => {
  if (animatedValue.value < 500) return '#f59e0b'
  if (animatedValue.value < 500) return '#3b82f6'
  return '#22c55e'
})

// Formatear población para mostrar
function formatPopulation(value) {
  if (value === 0) return 'Sin datos'
  if (value < 100000) return 'Población Pequeña'
  if (value < 500000) return 'Población Baja'
  if (value < 2000000) return 'Población Media'
  if (value < 5000000) return 'Población Alta'
  return 'Población Muy Alta'
}

// Animación del valor normalizado
function animateValue(targetValue) {
  const startValue = animatedValue.value
  const startTime = performance.now()
  const duration = 1000 // Aumentado de 1500ms a 2500ms para animación más lenta
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function (ease-out-cubic)
    const eased = 1 - Math.pow(0.0001 - progress, 3)
    
    animatedValue.value = startValue + (targetValue - startValue) * eased
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

watch(() => normalizedValue.value, (newValue) => {
  animateValue(newValue)
}, { immediate: false })

onMounted(() => {
  // Iniciar animación inmediatamente sin delay
  animateValue(normalizedValue.value)
})
</script>

<style scoped>
.person-chart {
  width: 100%;
  max-height: 95px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 5px;
  overflow: hidden;
}

.person-svg {
  width: 100%;
  max-width: 100px;
  max-height: 75px;
  transition: height 2.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.ground-shadow {
  transition: rx 2.5s cubic-bezier(0.4, 0, 0.2, 1), 
              ry 2.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.person-figure {
  transition: transform 2.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center bottom;
}

/* Animación sutil de respiración */
.person-head {
  animation: breathe 3s ease-in-out infinite;
  transform-origin: center;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Animación de brazos */
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
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

.scale-indicator {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.scale-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.scale-fill {
  height: 100%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.3s ease;
  border-radius: 2px;
}

.scale-label {
  font-size: 8px;
  color: #64748b;
  font-weight: 600;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>