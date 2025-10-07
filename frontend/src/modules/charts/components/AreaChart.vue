<!-- src/modules/charts/components/AreaChart.vue -->
<template>
  <div class="area-chart-cont">    
    <div class="legend" v-if="showLegend">
        <div 
            v-for="(item, index) in chartData"
            :key="index"
            class="legend-item"
        >
        <div class="legend-color" :style="{ backgroundColor: colors[index % colors.length] }"></div>
            <span class="legend-label">{{ item.label }}</span>
        </div>
        </div>
    <div class="chart-container">
        <!-- Leyenda -->
      <svg 
        width="100%" 
        height="100%" 
        :viewBox="`0 0 ${size} ${size}`"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Círculos de fondo (anillos) -->
        <circle
          v-for="ring in rings"
          :key="ring"
          :cx="centerX"
          :cy="centerY"
          :r="ring"
          fill="none"
          stroke="#f0f0f0"
          stroke-width="1"
        />
        
        <!-- Sectores de datos -->
        <path
          v-for="(segment, index) in animatedSegments"
          :key="index"
          :d="segment.path"
          :fill="segment.color"
          :class="['segment', { 'hovered': hoveredIndex === index }]"
          @mouseenter="handleMouseEnter(index, segment, $event)"
          @mouseleave="handleMouseLeave"
        />
        
        <!-- Líneas radiales -->
        <line
          v-for="(line, index) in radialLines"
          :key="`line-${index}`"
          :x1="centerX"
          :y1="centerY"
          :x2="line.x"
          :y2="line.y"
          stroke="#ffffff"
          stroke-width="2"
        />
      </svg>
      
      <!-- Tooltip -->
      <div 
        v-if="tooltip.visible" 
        class="tooltip"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          <div class="tooltip-color" :style="{ backgroundColor: tooltip.color }"></div>
          <div class="tooltip-info">
            <div class="tooltip-label">{{ tooltip.label }}</div>
            <div class="tooltip-value">{{ tooltip.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'

const props = defineProps({
  // En el futuro, estos datos vendrán de un archivo Excel
  excelData: {
    type: Array,
    default: null
  },
  colors: {
    type: Array,
    default: () => ['#FF6B9D', '#4ECDC4', '#FFE66D', '#95A5A6', '#3498DB']
  },
  size: {
    type: Number,
    default: 400
  },
  innerRadius: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: ''
  },
  showLegend: {
    type: Boolean,
    default: true
  }
})

// DATOS HARDCODEADOS - Simulan datos de Excel
// TODO: Reemplazar con datos reales del archivo Excel
const hardcodedData = [
  { label: 'Red', value: 11 },
  { label: 'Green', value: 16 },
  { label: 'Yellow', value: 7 },
  { label: 'Grey', value: 3 },
  { label: 'Blue', value: 14 }
]

// Usar datos del prop si existen, si no usar hardcoded
const chartData = computed(() => {
  return props.excelData || hardcodedData
})

const centerX = computed(() => props.size / 2)
const centerY = computed(() => props.size / 2)
const maxRadius = computed(() => (props.size / 2) - 20)

const hoveredIndex = ref(null)
const animationProgress = ref(0)
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  value: '',
  color: ''
})

// Animar al montar
onMounted(() => {
  animateChart()
})

// Animar cuando cambian los datos
watch(() => chartData.value, () => {
  animationProgress.value = 0
  animateChart()
})

const animateChart = () => {
  const duration = 1500 // 1.5 segundos
  const startTime = Date.now()

  const animate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / duration, 1)
    
    // Ease-out cubic
    animationProgress.value = 1 - Math.pow(1 - progress, 3)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// Calcular el valor máximo para normalización
const maxValue = computed(() => {
  return Math.max(...chartData.value.map(item => item.value))
})

// Generar anillos de fondo
const rings = computed(() => {
  const ringCount = 4
  const step = (maxRadius.value - props.innerRadius) / ringCount
  return Array.from({ length: ringCount }, (_, i) => 
    props.innerRadius + (step * (i + 1))
  )
})

// Calcular ángulo para cada segmento
const anglePerSegment = computed(() => (2 * Math.PI) / chartData.value.length)

// Generar segmentos con valores originales
const segments = computed(() => {
  return chartData.value.map((item, index) => {
    const startAngle = index * anglePerSegment.value - Math.PI / 2
    const endAngle = startAngle + anglePerSegment.value
    
    // Radio basado en el valor
    const radius = props.innerRadius + 
      ((maxRadius.value - props.innerRadius) * (item.value / maxValue.value))
    
    return {
      startAngle,
      endAngle,
      radius,
      color: props.colors[index % props.colors.length],
      label: item.label,
      value: item.value
    }
  })
})

// Segmentos animados
const animatedSegments = computed(() => {
  return segments.value.map(segment => {
    const animatedRadius = props.innerRadius + 
      ((segment.radius - props.innerRadius) * animationProgress.value)
    
    // Calcular puntos del arco
    const startX = centerX.value + props.innerRadius * Math.cos(segment.startAngle)
    const startY = centerY.value + props.innerRadius * Math.sin(segment.startAngle)
    
    const endX = centerX.value + props.innerRadius * Math.cos(segment.endAngle)
    const endY = centerY.value + props.innerRadius * Math.sin(segment.endAngle)
    
    const outerStartX = centerX.value + animatedRadius * Math.cos(segment.startAngle)
    const outerStartY = centerY.value + animatedRadius * Math.sin(segment.startAngle)
    
    const outerEndX = centerX.value + animatedRadius * Math.cos(segment.endAngle)
    const outerEndY = centerY.value + animatedRadius * Math.sin(segment.endAngle)
    
    // Crear path del segmento
    const largeArcFlag = 0
    const path = `
      M ${startX} ${startY}
      L ${outerStartX} ${outerStartY}
      A ${animatedRadius} ${animatedRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
      L ${endX} ${endY}
      A ${props.innerRadius} ${props.innerRadius} 0 ${largeArcFlag} 0 ${startX} ${startY}
      Z
    `
    
    return {
      path,
      color: segment.color,
      label: segment.label,
      value: segment.value
    }
  })
})

// Generar líneas radiales
const radialLines = computed(() => {
  return chartData.value.map((_, index) => {
    const angle = index * anglePerSegment.value - Math.PI / 2
    return {
      x: centerX.value + maxRadius.value * Math.cos(angle),
      y: centerY.value + maxRadius.value * Math.sin(angle)
    }
  })
})

const handleMouseEnter = (index, segment, event) => {
  hoveredIndex.value = index
  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    label: segment.label,
    value: segment.value,
    color: segment.color
  }
}

const handleMouseLeave = () => {
  hoveredIndex.value = null
  tooltip.value.visible = false
}

const tooltipStyle = computed(() => {
  if (!tooltip.value.visible) return { display: 'none' }
  
  return {
    position: 'fixed',
    left: `${tooltip.value.x + 15}px`,
    top: `${tooltip.value.y - 40}px`,
    pointerEvents: 'none',
    zIndex: 1000
  }
})
</script>

<style scoped>
.area-chart-cont {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container {
  position: relative;
  flex: 1;
  min-height: 0;
}

/* Leyendas de la gráfica */
.legend {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  padding: 10px 5px 0px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1px;
  font-size: 5.5px;
  color: #666;
  padding-left: 8px;
}

.legend-color {
  width: 10px;
  height: 4px;

}

.legend-label {
 padding-top: 0px;
  font-weight: 100;
}

/* Segmentos de la grafica */
.segment {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.segment:hover {
  opacity: 0.8;
}

.segment.hovered {
  filter: brightness(1.1);
}
/* Tooltip */
.tooltip {
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tooltip-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.tooltip-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tooltip-label {
  font-weight: 600;
  font-size: 11px;
}

.tooltip-value {
  font-size: 10px;
  opacity: 0.9;
}
</style>