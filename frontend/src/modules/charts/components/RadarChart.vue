<!-- src/modules/charts/components/RadarChart.vue -->
<template>
  <div class="radar-chart-container" ref="containerRef">
    <svg 
      :width="svgWidth" 
      :height="svgHeight"
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      class="radar-svg"
    >
      <!-- Círculos de fondo (niveles) -->
      <g class="grid-circles">
        <circle 
          v-for="level in gridLevels" 
          :key="`circle-${level}`"
          :cx="centerX" 
          :cy="centerY" 
          :r="getRadius(level)"
          class="grid-circle"
        />
      </g>

      <!-- Ejes radiales -->
      <g class="axes">
        <line 
          v-for="(point, index) in dataPoints" 
          :key="`axis-${index}`"
          :x1="centerX" 
          :y1="centerY"
          :x2="point.axisX" 
          :y2="point.axisY"
          class="axis-line"
        />
      </g>

      <!-- Polígono de datos -->
      <g class="data-polygon">
        <polygon
          :points="polygonPoints"
          class="data-area"
          :style="{ fill: fillColor, stroke: strokeColor }"
        />
      </g>

      <!-- Puntos de datos -->
      <g class="data-points">
        <circle 
          v-for="(point, index) in dataPoints" 
          :key="`point-${index}`"
          :cx="point.x" 
          :cy="point.y" 
          :r="4"
          class="data-point"
          :style="{ fill: strokeColor }"
        />
      </g>

      <!-- Etiquetas -->
      <g class="labels">
        <text 
          v-for="(point, index) in dataPoints" 
          :key="`label-${index}`"
          :x="point.labelX" 
          :y="point.labelY"
          class="label-text"
          :text-anchor="getLabelAnchor(point.angle)"
          :dy="getLabelDY(point.angle)"
        >
          {{ point.label }}
        </text>
      </g>

      <!-- Valores en los puntos (opcional) -->
      <g v-if="showValues" class="value-labels">
        <text 
          v-for="(point, index) in dataPoints" 
          :key="`value-${index}`"
          :x="point.valueX" 
          :y="point.valueY"
          class="value-text"
          text-anchor="middle"
        >
          {{ Math.round(point.value) }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  width: {
    type: [Number, String],
    default: '100%'
  },
  height: {
    type: [Number, String],
    default: '100%'
  },
  maxValue: {
    type: Number,
    default: 100
  },
  gridLevels: {
    type: Number,
    default: 5
  },
  fillColor: {
    type: String,
    default: 'rgba(15, 55, 89, 0.2)'
  },
  strokeColor: {
    type: String,
    default: '#0F3759'
  },
  showValues: {
    type: Boolean,
    default: false
  },
  showLegend: {
    type: Boolean,
    default: false
  }
})

const containerRef = ref(null)
const svgWidth = ref(400)
const svgHeight = ref(400)

// Configuración del gráfico
const padding = 80
const centerX = computed(() => svgWidth.value / 2)
const centerY = computed(() => svgHeight.value / 2)
const maxRadius = computed(() => Math.min(svgWidth.value, svgHeight.value) / 2 - padding)

// Niveles de la cuadrícula
const gridLevels = computed(() => {
  return Array.from({ length: props.gridLevels }, (_, i) => (i + 1) * (props.maxValue / props.gridLevels))
})

// Función para obtener el radio de un nivel
const getRadius = (level) => {
  return (level / props.maxValue) * maxRadius.value
}

// Calcular puntos de datos
const dataPoints = computed(() => {
  if (!props.data || props.data.length === 0) return []
  
  const angleStep = (2 * Math.PI) / props.data.length
  
  return props.data.map((item, index) => {
    const angle = angleStep * index - Math.PI / 2 // Empezar desde arriba
    const normalizedValue = Math.min(item.value / props.maxValue, 1)
    const radius = normalizedValue * maxRadius.value
    
    // Posición del punto de datos
    const x = centerX.value + radius * Math.cos(angle)
    const y = centerY.value + radius * Math.sin(angle)
    
    // Posición del final del eje
    const axisX = centerX.value + maxRadius.value * Math.cos(angle)
    const axisY = centerY.value + maxRadius.value * Math.sin(angle)
    
    // Posición de la etiqueta (fuera del gráfico)
    const labelDistance = maxRadius.value + 30
    const labelX = centerX.value + labelDistance * Math.cos(angle)
    const labelY = centerY.value + labelDistance * Math.sin(angle)
    
    // Posición del valor (cerca del punto)
    const valueDistance = radius + 15
    const valueX = centerX.value + valueDistance * Math.cos(angle)
    const valueY = centerY.value + valueDistance * Math.sin(angle)
    
    return {
      label: item.label,
      value: item.value,
      x,
      y,
      axisX,
      axisY,
      labelX,
      labelY,
      valueX,
      valueY,
      angle
    }
  })
})

// Puntos del polígono
const polygonPoints = computed(() => {
  return dataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})

// Función para determinar el anclaje del texto según el ángulo
const getLabelAnchor = (angle) => {
  const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  
  if (normalizedAngle < Math.PI / 4 || normalizedAngle > 7 * Math.PI / 4) {
    return 'start' // Derecha
  } else if (normalizedAngle > 3 * Math.PI / 4 && normalizedAngle < 5 * Math.PI / 4) {
    return 'end' // Izquierda
  } else {
    return 'middle' // Centro
  }
}

// Función para ajustar la posición vertical del texto
const getLabelDY = (angle) => {
  const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  
  if (normalizedAngle > Math.PI / 4 && normalizedAngle < 3 * Math.PI / 4) {
    return '1.2em' // Abajo
  } else if (normalizedAngle > 5 * Math.PI / 4 && normalizedAngle < 7 * Math.PI / 4) {
    return '-0.3em' // Arriba
  } else {
    return '0.4em' // Centro
  }
}

// Observar cambios de tamaño del contenedor
const updateDimensions = () => {
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  svgWidth.value = rect.width || 400
  svgHeight.value = rect.height || 400
}

onMounted(() => {
  updateDimensions()
  
  // Observador de tamaño
  const resizeObserver = new ResizeObserver(() => {
    updateDimensions()
  })
  
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
  
  // Cleanup
  return () => {
    if (containerRef.value) {
      resizeObserver.unobserve(containerRef.value)
    }
  }
})

watch(() => [props.width, props.height], () => {
  updateDimensions()
})
</script>

<style scoped>
.radar-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-svg {
  max-width: 100%;
  max-height: 100%;
}

.grid-circle {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 1;
}

.axis-line {
  stroke: #cbd5e1;
  stroke-width: 1;
}

.data-area {
  fill-opacity: 0.3;
  stroke-width: 2;
  stroke-linejoin: round;
}

.data-point {
  stroke: white;
  stroke-width: 2;
  transition: r 0.2s ease;
}

.data-point:hover {
  r: 6;
}

.label-text {
  font-size: 11px;
  font-weight: 600;
  fill: #475569;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
}

.value-text {
  font-size: 10px;
  font-weight: 700;
  fill: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
}
</style>