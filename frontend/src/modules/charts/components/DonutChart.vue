<!-- src/modules/charts/components/DonutChart.vue -->
<template>
  <div class="donut-chart">
    <!-- SVG de la gráfica de dona -->
    <div class="chart-svg-container">
      <svg :width="size" :height="size" class="donut-svg">
        <!-- Círculo de fondo (gris) -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="backgroundColor"
          :stroke-width="strokeWidth"
        />
        
        <!-- Círculo de progreso (rojo) -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="primaryColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          stroke-linecap="round"
          :transform="`rotate(-90 ${center} ${center})`"
          class="progress-circle"
        />
        
        <!-- Texto central con el porcentaje -->
        <text
          :x="center"
          :y="center + 4"
          text-anchor="middle"
          class="percentage-text"
        >
          {{ displayValue }}
        </text>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 100
  }
})

// Configuración de colores (rojo y gris como en tu diseño) '#E8E8E8' 
const primaryColor = '#DC143C'  // Rojo
const backgroundColor = '#65a30d'  // Gris claro

// Calculados para el SVG
const center = computed(() => props.size / 2)
const strokeWidth = computed(() => 8)
const radius = computed(() => (props.size / 2) - (strokeWidth.value / 2))
const circumference = computed(() => 2 * Math.PI * radius.value)

// Obtener el valor del primer elemento (que debe ser el valor principal)
const primaryValue = computed(() => {
  return props.data.length > 0 ? props.data[0].value : 0
})

// Valor a mostrar en el centro (prioriza subtitle, luego calcula porcentaje)
const displayValue = computed(() => {
  if (props.subtitle) {
    return props.subtitle
  }
  return `${primaryValue.value}%`
})

// Calcular el offset para mostrar el progreso
const strokeDashoffset = computed(() => {
  // Si el valor ya viene como porcentaje (0-100), usarlo directamente
  const percentage = primaryValue.value <= 1 ? primaryValue.value * 100 : primaryValue.value
  const progress = percentage / 100
  return circumference.value * (1 - progress)
})
</script>

<style scoped>
.donut-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.chart-svg-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.donut-svg {
  overflow: visible;
}

.progress-circle {
  transition: stroke-dashoffset 0.8s ease-in-out;
}

.percentage-text {
  font-size: 6px;
  font-weight: bold;
  fill: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Animación inicial */
.donut-chart:hover .progress-circle {
  stroke-width: 10;
  transition: stroke-width 0.2s ease;
}

/* Animación de entrada */
.progress-circle {
  animation: drawCircle 1.2s ease-out;
}

@keyframes drawCircle {
  from {
    stroke-dashoffset: var(--circumference, 314);
  }
  to {
    stroke-dashoffset: var(--final-offset);
  }
}
</style>