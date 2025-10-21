<template>
  <div class="linear-chart-container">
    <!-- Header con título y controles -->
    <div class="chart-header">
      <div class="header-content">
        <h3 class="chart-title">{{ title }}</h3>
        <p v-if="subtitle" class="chart-subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Filtros de variables (botones) -->
    <div v-if="availableVariables.length > 0" class="variable-filters">
      <button 
        v-for="variable in availableVariables" 
        :key="variable"
        @click="toggleVariable(variable)"
        :class="['filter-btn', { 'active': visibleVariables.includes(variable) }]"
        :style="{ 
          '--btn-color': getVariableColor(variable),
          backgroundColor: visibleVariables.includes(variable) ? getVariableColor(variable) : 'white',
          color: visibleVariables.includes(variable) ? 'white' : '#6b7280'
        }"
      >
        {{ variable }}
      </button>
    </div>

    <!-- Mensaje si no hay datos -->
    <div v-if="!hasData" class="no-data">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3v18h18"/>
        <path d="M18 17V9"/>
        <path d="M13 17V5"/>
        <path d="M8 17v-3"/>
      </svg>
      <p>No hay datos disponibles</p>
    </div>

    <!-- Gráfica SVG -->
    <div v-else class="chart-wrapper" ref="chartWrapper">
      <svg 
        :width="dimensions.width" 
        :height="dimensions.height"
        class="line-chart"
        @mousemove="handleMouseMove"
        @mouseleave="hideTooltip"
      >
        <!-- Grid lines horizontales -->
        <g class="grid">
          <line
            v-for="i in gridLines"
            :key="`grid-${i}`"
            :x1="padding.left"
            :y1="padding.top + (i - 1) * gridSpacing"
            :x2="dimensions.width - padding.right"
            :y2="padding.top + (i - 1) * gridSpacing"
            class="grid-line"
          />
        </g>

        <!-- Línea vertical punteada del hover -->
        <line
          v-if="hoverState.visible"
          :x1="hoverState.x"
          :y1="padding.top"
          :x2="hoverState.x"
          :y2="dimensions.height - padding.bottom"
          class="hover-line"
          stroke="#9ca3af"
          stroke-width="1.5"
          stroke-dasharray="4 4"
        />

        <!-- Líneas y áreas -->
        <g class="lines">
          <g v-for="variable in visibleVariables" :key="`line-${variable}`">
            <!-- Línea principal con animación -->
            <path
              :d="getLinePath(variable)"
              :stroke="getVariableColor(variable)"
              stroke-width="1.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="line-path"
            />

            <!-- Puntos de datos -->
            <g class="data-points">
              <circle
                v-for="(point, i) in getVariableData(variable)"
                :key="`point-${variable}-${i}`"
                :cx="getXPosition(i)"
                :cy="getY(point)"
                :r="hoverState.visible && hoverState.index === i ? 3 : 2"
                :fill="getVariableColor(variable)"
                :class="['data-point', { 'is-hovered': hoverState.visible && hoverState.index === i }]"
              />
            </g>
          </g>
        </g>

        <!-- Áreas interactivas invisibles para detectar hover -->
        <g class="interaction-areas">
          <rect
            v-for="(label, i) in props.xLabels"
            :key="`interaction-${i}`"
            :x="getInteractionX(i)"
            :y="padding.top"
            :width="getInteractionWidth()"
            :height="dimensions.height - padding.top - padding.bottom"
            fill="transparent"
            class="interaction-rect"
            @mouseenter="showTooltipForIndex(i)"
          />
        </g>
      </svg>

      <!-- Tooltip fijo en la parte superior -->
      <transition name="tooltip-fade">
        <div 
          v-if="hoverState.visible" 
          class="tooltip-fixed"
          :style="tooltipFixedStyle"
        >
          <div class="tooltip-year">{{ hoverState.label }}</div>
          <div class="tooltip-items">
            <div 
              v-for="variable in visibleVariables"
              :key="`tooltip-${variable}`"
              class="tooltip-item"
            >
              <div class="tooltip-item-header">
                <div 
                  class="tooltip-dot" 
                  :style="{ backgroundColor: getVariableColor(variable) }"
                ></div>
                <span class="tooltip-variable">{{ variable }}</span>
              </div>
              <div class="tooltip-value">
                {{ formatValue(getVariableData(variable)[hoverState.index]) }}
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Eje X externo (fuera del SVG) -->
    <div v-if="hasData" class="x-axis-container">
      <div 
        v-for="(label, i) in props.xLabels"
        :key="`x-label-external-${i}`"
        class="x-axis-label"
        :style="{ left: `${getXPositionPercentage(i)}%` }"
      >
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Análisis histórico'
  },
  subtitle: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => ({
      'IS Total': [45234.5, 52341.2, 58123.7, 61456.8, 67234.9],
      'Financ. para desarrollo total': [23456.8, 48123.4, 52341.9, 54234.5, 55678.2]
    })
  },
  xLabels: {
    type: Array,
    default: () => ['2020', '2021', '2022', '2023', '2024']
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  gridLines: {
    type: Number,
    default: 5
  },
  valueFormatter: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['variable-toggle'])

// Estado
const chartWrapper = ref(null)
const dimensions = ref({ width: 600, height: 300 })

// Estado del hover
const hoverState = ref({
  visible: false,
  x: 0,
  index: -1,
  label: ''
})

// Configuración de padding
const padding = { top: 20, right: 100, bottom: 130, left: 40 }

// Paleta de colores
const colorPalette = [
  '#10b981',
  '#a3e635',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#ef4444',
]

// Variables disponibles y visibles (inicialmente TODAS inactivas)
const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])

// Estado de animación para cada variable
const animatedData = ref({})

// Inicializar variables TODAS inactivas
watch(() => props.data, (newData) => {
  const vars = Object.keys(newData)
  
  // Inicializar datos animados en el mínimo valor
  vars.forEach(variable => {
    if (!animatedData.value[variable]) {
      animatedData.value[variable] = new Array(props.xLabels.length).fill(null)
    }
  })
  
  // Solo inicializar visibleVariables si está vacío (primera carga)
  if (visibleVariables.value.length === 0) {
    // Dejar todas inactivas inicialmente
    visibleVariables.value = []
  }
}, { immediate: true, deep: true })

// Calcular el punto más alto de la gráfica (valor Y mínimo en píxeles)
const highestPoint = computed(() => {
  if (!hoverState.value.visible) return padding.top
  
  let minY = Infinity
  visibleVariables.value.forEach(variable => {
    const data = getVariableData(variable)
    if (data[hoverState.value.index] !== null && 
        data[hoverState.value.index] !== undefined && 
        !isNaN(data[hoverState.value.index])) {
      const y = getY(data[hoverState.value.index])
      if (y < minY) {
        minY = y
      }
    }
  })
  
  return minY === Infinity ? padding.top : minY
})

// Estilo del tooltip fijo
const tooltipFixedStyle = computed(() => {
  const rect = chartWrapper.value?.getBoundingClientRect()
  if (!rect) return {}
  
  return {
    left: `${hoverState.value.x}px`,
    top: `${highestPoint.value - 200}px`
  }
})

// Dimensiones del gráfico
const chartHeight = computed(() => dimensions.value.height - padding.top - padding.bottom)
const chartWidth = computed(() => dimensions.value.width - padding.left - padding.right)
const gridSpacing = computed(() => chartHeight.value / (props.gridLines - 1))

// Calcular posición X para cada punto
const getXPosition = (index) => {
  const dataLength = props.xLabels.length
  if (dataLength <= 1) return padding.left
  const step = chartWidth.value / (dataLength - 1)
  return padding.left + index * step
}

// Calcular posición X en porcentaje para las etiquetas externas
const getXPositionPercentage = (index) => {
  const dataLength = props.xLabels.length
  if (dataLength <= 1) return 0
  
  const totalWidth = dimensions.value.width
  const usableWidth = chartWidth.value
  const leftPaddingPercentage = (padding.left / totalWidth) * 100
  const usableWidthPercentage = (usableWidth / totalWidth) * 100
  
  const step = usableWidthPercentage / (dataLength - 1)
  return leftPaddingPercentage + (index * step)
}

// Área de interacción para cada punto (alineada con el espacio de las líneas)
const getInteractionX = (index) => {
  const dataLength = props.xLabels.length
  
  // Para el primer punto
  if (index === 0) {
    return padding.left
  }
  
  // Para el resto, el área comienza desde el punto anterior
  return getXPosition(index - 1)
}

const getInteractionWidth = () => {
  const dataLength = props.xLabels.length
  if (dataLength <= 1) return chartWidth.value
  
  // El ancho es exactamente la distancia entre dos puntos consecutivos
  const step = chartWidth.value / (dataLength - 1)
  return step
}

// Calcular todos los valores visibles
const allVisibleValues = computed(() => {
  const values = []
  visibleVariables.value.forEach(variable => {
    if (props.data[variable] && Array.isArray(props.data[variable])) {
      values.push(...props.data[variable].filter(v => v !== null && v !== undefined && !isNaN(v)))
    }
  })
  return values.length > 0 ? values : [0]
})

// Rango de valores
const minValue = computed(() => {
  const min = Math.min(...allVisibleValues.value)
  return Math.floor(min * 0.95)
})

const maxValue = computed(() => {
  const max = Math.max(...allVisibleValues.value)
  return Math.ceil(max * 1.05)
})

const valueRange = computed(() => maxValue.value - minValue.value || 1)

// Verificar si hay datos
const hasData = computed(() => {
  return availableVariables.value.length > 0 && 
         visibleVariables.value.length > 0 &&
         allVisibleValues.value.length > 0
})

// Funciones
const toggleVariable = async (variable) => {
  const index = visibleVariables.value.indexOf(variable)
  
  if (index > -1) {
    // Desactivar: animar hacia el mínimo
    await animateVariableOut(variable)
    visibleVariables.value.splice(index, 1)
  } else {
    // Activar: agregar y animar desde el mínimo
    visibleVariables.value.push(variable)
    await animateVariableIn(variable)
  }
  
  emit('variable-toggle', visibleVariables.value)
}

// Animar entrada de variable (desde mínimo hacia valores reales)
const animateVariableIn = async (variable) => {
  const realData = props.data[variable] || []
  const steps = 50 // Pasos de animación
  const duration = 600 // ms total
  const stepDuration = duration / steps
  
  // Inicializar en el valor mínimo
  animatedData.value[variable] = new Array(realData.length).fill(minValue.value)
  
  // Animar cada paso
  for (let step = 0; step <= steps; step++) {
    const progress = step / steps
    const easedProgress = easeOutCubic(progress)
    
    animatedData.value[variable] = realData.map((value, i) => {
      if (value === null || value === undefined || isNaN(value)) return null
      return minValue.value + (value - minValue.value) * easedProgress
    })
    
    await new Promise(resolve => setTimeout(resolve, stepDuration))
  }
  
  // Asegurar valores finales exactos
  animatedData.value[variable] = [...realData]
}

// Animar salida de variable (desde valores reales hacia mínimo)
const animateVariableOut = async (variable) => {
  const realData = props.data[variable] || []
  const currentData = animatedData.value[variable] || realData
  const steps = 20
  const duration = 400 // ms total (más rápido para salida)
  const stepDuration = duration / steps
  
  // Animar cada paso hacia el mínimo
  for (let step = 0; step <= steps; step++) {
    const progress = step / steps
    const easedProgress = easeInCubic(progress)
    
    animatedData.value[variable] = currentData.map((value, i) => {
      if (value === null || value === undefined || isNaN(value)) return null
      const realValue = realData[i]
      if (realValue === null || realValue === undefined || isNaN(realValue)) return null
      return realValue - (realValue - minValue.value) * easedProgress
    })
    
    await new Promise(resolve => setTimeout(resolve, stepDuration))
  }
  
  // Finalizar en null para ocultar
  animatedData.value[variable] = new Array(realData.length).fill(null)
}

// Funciones de easing
const easeOutCubic = (t) => {
  return 1 - Math.pow(1 - t, 3)
}

const easeInCubic = (t) => {
  return Math.pow(t, 3)
}

const getVariableColor = (variable) => {
  const index = availableVariables.value.indexOf(variable)
  return colorPalette[index % colorPalette.length]
}

const getVariableId = (variable) => {
  return variable.replace(/[^a-zA-Z0-9]/g, '-')
}

const getVariableData = (variable) => {
  // Retornar datos animados si existen, sino los datos reales
  return animatedData.value[variable] || props.data[variable] || []
}

const getY = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return padding.top + chartHeight.value
  }
  const percentage = (value - minValue.value) / valueRange.value
  return padding.top + chartHeight.value * (1 - percentage)
}

const getLinePath = (variable) => {
  const data = getVariableData(variable)
  if (data.length === 0) return ''

  let path = ''
  let isFirst = true

  for (let i = 0; i < data.length; i++) {
    if (data[i] !== null && data[i] !== undefined && !isNaN(data[i])) {
      const x = getXPosition(i)
      const y = getY(data[i])
      
      if (isFirst) {
        path += `M ${x} ${y}`
        isFirst = false
      } else {
        path += ` L ${x} ${y}`
      }
    }
  }
  
  return path
}

const getAreaPath = (variable) => {
  const data = getVariableData(variable)
  if (data.length === 0) return ''

  let path = ''
  let points = []

  for (let i = 0; i < data.length; i++) {
    if (data[i] !== null && data[i] !== undefined && !isNaN(data[i])) {
      points.push({
        x: getXPosition(i),
        y: getY(data[i]),
        index: i
      })
    }
  }

  if (points.length === 0) return ''

  path = `M ${points[0].x} ${getY(minValue.value)}`
  path += ` L ${points[0].x} ${points[0].y}`
  
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`
  }
  
  path += ` L ${points[points.length - 1].x} ${getY(minValue.value)}`
  path += ' Z'
  
  return path
}

const formatValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  return value.toLocaleString('es-MX', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 1 
  })
}

const handleMouseMove = (event) => {
  if (!chartWrapper.value) return
  
  const rect = chartWrapper.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  
  // Encontrar el índice más cercano
  let closestIndex = -1
  let minDistance = Infinity
  
  for (let i = 0; i < props.xLabels.length; i++) {
    const pointX = getXPosition(i)
    const distance = Math.abs(mouseX - pointX)
    
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = i
    }
  }
  
  // Solo mostrar si está dentro del área de interacción
  const interactionThreshold = getInteractionWidth() / 2
  if (minDistance < interactionThreshold) {
    showTooltipForIndex(closestIndex)
  } else {
    hideTooltip()
  }
}

const showTooltipForIndex = (index) => {
  hoverState.value = {
    visible: true,
    x: getXPosition(index),
    index: index,
    label: props.xLabels[index]
  }
}

const hideTooltip = () => {
  hoverState.value = {
    visible: false,
    x: 0,
    index: -1,
    label: ''
  }
}

const handleResize = () => {
  if (chartWrapper.value) {
    const parentWidth = chartWrapper.value.offsetWidth
    const parentHeight = chartWrapper.value.offsetHeight
    
    dimensions.value = {
      width: parentWidth || 600,
      height: parentHeight || 300
    }
  }
}

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  
  if (chartWrapper.value) {
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(chartWrapper.value)
    
    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.linear-chart-container {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: visible;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.4;
  text-align: center;
}

.chart-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  text-align: center;
}

/* Filtros de variables */
.variable-filters {
  display: flex;
  flex-direction: row;
  height: 32px;
  padding: 4px;
  border-radius: 24px;
  flex-wrap: wrap;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
  gap: 6px;
  margin-bottom: 16px;
  flex-shrink: 0;
  background-color: white;
}

.filter-btn {
  flex: 0 1 auto;
  border: 1px solid #e5e7eb;
  padding: 4px 12px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.2px;
}

.filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.filter-btn.active {
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-weight: 600;
}

.chart-controls {
  position: relative;
  margin-left: 16px;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #9ca3af;
  gap: 12px;
}

.no-data svg {
  opacity: 0.5;
}

.no-data p {
  margin: 0;
  font-size: 14px;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0;
  overflow: visible;
}

.line-chart {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
}

.hover-line {
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.interaction-rect {
  cursor: pointer;
}

/* Eje X externo */
.x-axis-container {
  position: relative;
  width: 100%;
  height: 30px;
  margin-top: 8px;
  flex-shrink: 0;
}

.x-axis-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  user-select: none;
}

/* Animaciones de líneas */
.line-path {
  stroke-dasharray: 3000;
  stroke-dashoffset: 3000;
  animation: drawLine 2s ease-out forwards;
}

.area-path {
  opacity: 0;
  animation: fadeInArea 1.5s ease-out 0.3s forwards;
}

.data-point {
  opacity: 1;
  transform-origin: center;
  transition: all 0.2s ease;
}

.data-point.is-hovered {
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.3));
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeInArea {
  to {
    opacity: 1;
  }
}

/* Tooltip fijo */
.tooltip-fixed {
  position: absolute;
  background: #1f2937;
  color: white;
  border-radius: 6px;
  padding: 12px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 280px;
  min-height: 120px;
  opacity: 95%;
  transform: translateX(-50%);
  white-space: normal;
  text-align: center;
}

.tooltip-fixed::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
}

.tooltip-year {
  font-size: 15px;
  color: white;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 10px;
}

.tooltip-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tooltip-item-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tooltip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;

}

.tooltip-variable {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
}

.tooltip-value {
  font-size: 14px;
  font-weight: 500;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
}

/* Transiciones */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-5px);
}
</style>