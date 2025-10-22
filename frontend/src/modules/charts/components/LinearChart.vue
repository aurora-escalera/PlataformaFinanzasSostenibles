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

        <!-- Etiquetas del eje Y -->
        <g class="y-axis-labels">
          <text
            v-for="i in gridLines"
            :key="`y-label-${i}`"
            :x="padding.left - 10"
            :y="padding.top + (i - 1) * gridSpacing + 4"
            class="y-axis-label"
            text-anchor="end"
          >
            {{ formatYAxisValue(getYAxisValue(i - 1)) }}
          </text>
        </g>

        <!-- Línea vertical punteada del hover -->
        <line
          v-if="hoverState.visible"
          :x1="hoverState.x"
          :y1="0"
          :x2="hoverState.x"
          :y2="dimensions.height"
          class="hover-line"
          stroke="#9ca3af"
          stroke-width="0.5"
          stroke-dasharray="4 4"
        />

        <!-- Línea horizontal punteada del hover -->
        <line
          v-if="hoverState.visible && hoverState.yValue !== null"
          :x1="0"
          :y1="hoverState.yPosition"
          :x2="dimensions.width"
          :y2="hoverState.yPosition"
          class="hover-line"
          stroke="#9ca3af"
          stroke-width="0.8"
        />

        <!-- Líneas -->
        <g class="lines">
          <g v-for="(variable, idx) in visibleVariables" :key="`line-${variable}`">
            <!-- Línea principal -->
            <path
              :d="getLinePath(variable)"
              :stroke="getVariableColor(variable)"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="['line-path', { 'line-exit': animatingVariables.has(variable) }]"
              :style="{ 
                animationDelay: animatingVariables.has(variable) ? '400ms' : `${idx * 0.1}s`,
                animationDuration: animatingVariables.has(variable) ? '300ms' : '1.5s'
              }"
            />

            <!-- Puntos animados que se mueven (prioridad durante animación) -->
            <g class="animated-data-points">
              <circle
                v-if="hoverState.visible && animatingPoints[`${variable}-x`] !== undefined"
                :cx="getAnimatedPointX(variable)"
                :cy="getAnimatedPointY(variable)"
                :r="5"
                :fill="getDarkerColor(variable)"
                class="data-point animated-point"
                :style="{ 
                  filter: `drop-shadow(0 0 8px ${getDarkerColor(variable)})`,
                  opacity: 1
                }"
              />
            </g>

            <!-- Puntos de datos permanentes (siempre visibles) -->
            <g class="permanent-data-points">
              <circle
                v-for="(point, i) in getVariableData(variable)"
                :key="`permanent-point-${variable}-${i}`"
                :cx="getXPosition(i)"
                :cy="getAnimatedY(variable, i)"
                :r="2"
                :fill="getVariableColor(variable)"
                class="data-point-permanent"
              />
            </g>

            <!-- Puntos de datos con hover (solo cuando NO hay animación de movimiento) -->
            <g class="data-points">
              <circle
                v-for="(point, i) in getVariableData(variable)"
                :key="`point-${variable}-${i}`"
                :cx="getXPosition(i)"
                :cy="getAnimatedY(variable, i)"
                :r="hoverState.visible && hoverState.index === i && animatingPoints[`${variable}-x`] === undefined ? 5 : 0"
                :fill="getVariableColor(variable)"
                :class="['data-point', { 'is-hovered': hoverState.visible && hoverState.index === i }]"
                :style="{ 
                  filter: `drop-shadow(0 0 8px ${getVariableColor(variable)})`
                }"
              />
            </g>
          </g>
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

      <!-- Tooltip Y (a la izquierda) -->
      <transition name="tooltip-fade">
        <div 
          v-if="hoverState.visible && hoverState.yValue !== null" 
          class="tooltip-y"
          :style="tooltipYStyle"
        >
          {{ formatValue(hoverState.yValue) }}
        </div>
      </transition>

      <!-- Tooltip X (en el eje inferior) -->
      <transition name="tooltip-x-fade">
        <div 
          v-if="hoverState.visible" 
          class="tooltip-x"
          :style="tooltipXStyle"
        >
          {{ hoverState.label }}
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

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
  label: '',
  yValue: null,
  yPosition: 0,
  previousIndex: -1
})

// Estado para la animación de los puntos
const animatingPoints = ref({})

// Configuración de padding
const padding = { top: 10, right: 20, bottom: 70, left: 20 }

// Paleta de colores (igual que StackedArea)
const colorPalette = [
  '#10b981',
  '#3b82f6',
  '#a3e635',
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
const animatingVariables = ref(new Set())

// Inicializar variables TODAS inactivas
watch(() => props.data, (newData) => {
  const vars = Object.keys(newData)
  
  // Inicializar datos animados en valores reales (para que estén listos)
  vars.forEach(variable => {
    if (!animatedData.value[variable]) {
      animatedData.value[variable] = [...(newData[variable] || [])]
    }
  })

  // Si no hay variables visibles, no mostrar ninguna por defecto
  if (visibleVariables.value.length === 0) {
    visibleVariables.value = []
  }
}, { immediate: true, deep: true })

// Dimensiones del gráfico
const chartHeight = computed(() => dimensions.value.height - padding.top - padding.bottom)
const chartWidth = computed(() => dimensions.value.width - padding.left - padding.right)
const gridSpacing = computed(() => chartHeight.value / (props.gridLines - 1))

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

// Máximo y mínimo de los datos visibles
const maxValue = computed(() => Math.max(...allVisibleValues.value, 0))
const minValue = computed(() => Math.min(...allVisibleValues.value, 0))

// Calcular la escala Y
const yScale = computed(() => {
  const range = maxValue.value - minValue.value
  return range > 0 ? chartHeight.value / range : 1
})

// Verificar si hay datos
const hasData = computed(() => {
  return visibleVariables.value.length > 0 && 
         visibleVariables.value.some(v => props.data[v] && props.data[v].length > 0)
})

// Obtener datos de una variable
const getVariableData = (variable) => {
  return props.data[variable] || []
}

// Obtener color de una variable
const getVariableColor = (variable) => {
  const index = availableVariables.value.indexOf(variable)
  return colorPalette[index % colorPalette.length]
}

// Obtener ID único para la variable (para gradientes)
const getVariableId = (variable) => {
  return variable.replace(/\s+/g, '-').toLowerCase()
}

// Obtener color más oscuro para puntos animados
const getDarkerColor = (variable) => {
  const color = getVariableColor(variable)
  // Convertir hex a rgb y oscurecer
  const hex = color.replace('#', '')
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30)
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30)
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30)
  return `rgb(${r}, ${g}, ${b})`
}

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

// Calcular posición Y para un valor
const getY = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return dimensions.value.height - padding.bottom
  }
  const normalizedValue = value - minValue.value
  return dimensions.value.height - padding.bottom - (normalizedValue * yScale.value)
}

// Calcular posición Y usando datos animados
const getAnimatedY = (variable, index) => {
  const value = animatedData.value[variable]?.[index]
  return getY(value)
}

// Obtener valor del eje Y para una línea de grid
const getYAxisValue = (index) => {
  const step = (maxValue.value - minValue.value) / (props.gridLines - 1)
  return maxValue.value - (step * index)
}

// Formatear valor del eje Y
const formatYAxisValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

// Formatear valor para tooltip
const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A'
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  return new Intl.NumberFormat('es-MX', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Generar path para una línea (usando datos animados)
const getLinePath = (variable) => {
  const data = animatedData.value[variable]
  if (!data || data.length === 0) return ''

  return data.map((value, i) => {
    const x = getXPosition(i)
    const y = getY(value)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')
}

// Toggle variable visibility
const toggleVariable = (variable) => {
  const index = visibleVariables.value.indexOf(variable)
  
  if (index > -1) {
    // ====== ANIMACIÓN DE SALIDA ======
    animatingVariables.value.add(variable)
    
    const data = props.data[variable]
    if (data) {
      const startValues = [...animatedData.value[variable]]
      const range = maxValue.value - minValue.value
      const endValue = minValue.value - (range * 0.5) // Caer al mismo nivel que empiezan
      
      const pointsDuration = 500 // Duración de caída de puntos
      const lineDelay = 400 // Delay antes de que empiece a desaparecer la línea
      const totalDuration = pointsDuration + 300 // Tiempo total incluyendo línea
      
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / totalDuration, 1)
        
        // Fase 1: Caída de puntos (primeros 500ms)
        if (elapsed < pointsDuration) {
          const pointProgress = elapsed / pointsDuration
          const easeProgress = 1 - Math.pow(1 - pointProgress, 3)
          
          // Animar puntos cayendo
          animatedData.value[variable] = startValues.map(val => 
            val - (val - endValue) * easeProgress
          )
        } else {
          // Mantener puntos abajo mientras la línea desaparece
          animatedData.value[variable] = new Array(data.length).fill(endValue)
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Al terminar toda la animación, remover la variable
          visibleVariables.value.splice(visibleVariables.value.indexOf(variable), 1)
          animatingVariables.value.delete(variable)
        }
      }
      
      animate()
    }
  } else {
    // ====== ANIMACIÓN DE ENTRADA ======
    visibleVariables.value.push(variable)
    animatingVariables.value.add(variable)
    
    const data = props.data[variable]
    if (data) {
      // Calcular un valor inicial muy abajo (más abajo que el mínimo visible)
      const range = maxValue.value - minValue.value
      const startValue = minValue.value - (range * 0.5) // ⭐ Empieza 50% más abajo del rango
      
      // Iniciar desde mucho más abajo
      animatedData.value[variable] = new Array(data.length).fill(startValue)
      
      const duration = 800
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Easing cúbico para efecto de "rebote suave"
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        
        // Animar desde muy abajo hacia el valor real
        animatedData.value[variable] = data.map((val, i) => {
          const start = startValue
          const end = val
          return start + (end - start) * easeProgress
        })
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Asegurar valores finales exactos
          animatedData.value[variable] = [...data]
          animatingVariables.value.delete(variable)
        }
      }
      
      animate()
    }
  }
  
  emit('variable-toggle', variable, visibleVariables.value.includes(variable))
}

// Estilo del tooltip fijo
const tooltipFixedStyle = computed(() => {
  return {
    left: `${hoverState.value.x}px`,
    top: `5px`
  }
})

// Estilo del tooltip Y
const tooltipYStyle = computed(() => {
  return {
    left: `${padding.left - 15}px`,
    top: `${hoverState.value.yPosition}px`
  }
})

// Estilo del tooltip X
const tooltipXStyle = computed(() => {
  return {
    left: `${hoverState.value.x}px`,
    top: `${dimensions.value.height - padding.bottom + 10}px`,
    transform: 'translateX(-50%)'
  }
})

// Obtener posición X animada del punto
const getAnimatedPointX = (variable) => {
  return animatingPoints.value[`${variable}-x`] || 0
}

// Obtener posición Y animada del punto
const getAnimatedPointY = (variable) => {
  return animatingPoints.value[`${variable}-y`] || 0
}

// Manejar movimiento del mouse
const handleMouseMove = (event) => {
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  const x = event.clientX - rect.left
  
  // Encontrar el índice más cercano
  let closestIndex = 0
  let minDistance = Infinity
  
  props.xLabels.forEach((_, i) => {
    const pointX = getXPosition(i)
    const distance = Math.abs(x - pointX)
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = i
    }
  })
  
  const previousIndex = hoverState.value.index
  const pointX = getXPosition(closestIndex)
  
  // Calcular el valor Y del punto más alto en este índice (usando datos animados)
  let highestY = null
  let highestYPosition = 0
  
  visibleVariables.value.forEach(variable => {
    const value = animatedData.value[variable]?.[closestIndex]
    if (value !== null && value !== undefined && !isNaN(value)) {
      const y = getY(value)
      if (highestY === null || value > highestY) {
        highestY = value
        highestYPosition = y
      }
    }
  })
  
  hoverState.value = {
    visible: true,
    x: pointX,
    index: closestIndex,
    label: props.xLabels[closestIndex],
    yValue: highestY,
    yPosition: highestYPosition,
    previousIndex: previousIndex
  }
  
  // Animar el movimiento de los puntos si cambió el índice
  if (previousIndex !== closestIndex && previousIndex !== -1) {
    visibleVariables.value.forEach(variable => {
      const startX = getXPosition(previousIndex)
      const endX = getXPosition(closestIndex)
      const startY = getAnimatedY(variable, previousIndex)
      const endY = getAnimatedY(variable, closestIndex)
      
      const duration = 200
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        
        animatingPoints.value[`${variable}-x`] = startX + (endX - startX) * easeProgress
        animatingPoints.value[`${variable}-y`] = startY + (endY - startY) * easeProgress
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          delete animatingPoints.value[`${variable}-x`]
          delete animatingPoints.value[`${variable}-y`]
        }
      }
      
      animate()
    })
  }
}

const hideTooltip = () => {
  hoverState.value = {
    visible: false,
    x: 0,
    index: -1,
    label: '',
    yValue: null,
    yPosition: 0,
    previousIndex: -1
  }
  animatingPoints.value = {}
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
  margin-bottom: 5px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.chart-title {
  font-size: 10px;
  font-weight: 100;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.4;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  height: 15px;
  border-radius: 24px;
  flex-wrap: nowrap;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
  gap: 2px;
  margin-bottom: 5px;
  flex-shrink: 0;
  background-color: white;
}

.filter-btn {
  flex: 0 1 auto;
  border: none;
  padding: 5px 4px 5px 4px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 9px;
  font-weight: 100;
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
  font-weight: 200;
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

/* Estilos para las etiquetas del eje Y */
.y-axis-label {
  font-size: 9px;
  font-weight: 200;
  fill: #6b7280;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
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
  font-size: 9px;
  font-weight: 200;
  color: #6b7280;
  white-space: nowrap;
  user-select: none;
}

/* Animaciones de líneas */
.line-path {
  stroke-dasharray: 3000;
  stroke-dashoffset: 3000;
  animation: drawLine 1.5s ease-out forwards;
}

/* Animación de salida para líneas */
.line-path.line-exit {
  animation: fadeLine 300ms ease-out forwards;
  stroke-dasharray: none;
  stroke-dashoffset: 0;
}

.data-point-permanent {
  opacity: 1;
  transform-origin: center;
  transition: cy 0.05s ease;
}

.data-point {
  opacity: 1;
  transform-origin: center;
  transition: r 0.2s ease, cy 0.05s ease;
}

.animated-point {
  transition: none !important;
  animation: none !important;
}

.data-point.is-hovered {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.4));
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeLine {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Tooltip fijo */
.tooltip-fixed {
  position: absolute;
  background: #1f2937;
  color: white;
  border-radius: 6px;
  padding: 2px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 90px;
  min-height: 55px;
  opacity: 95%;
  transform: translateX(-50%);
  white-space: normal;
  text-align: center;
}

.tooltip-year {
  font-size: 9px;
  color: white;
  margin-bottom: 2px;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
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
  font-size: 8px;
  font-weight: 100;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
}

.tooltip-value {
  font-size: 8px;
  font-weight: 100;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
}

/* Tooltip Y (a la izquierda) */
.tooltip-y {
  position: absolute;
  background: #F0F0F2;
  border: 1px solid #C5CBCE;
  color: black;
  border-radius: 4px;
  padding: 4px 8px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 9px;
  font-weight: 200;
  transform: translate(-100%, -50%);
  white-space: nowrap;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  letter-spacing: -0.3px;
}

/* Tooltip X (en el eje inferior) */
.tooltip-x {
  position: absolute;
  background: #F0F0F2;
  border: 1px solid #C5CBCE;
  color: black;
  border-radius: 4px;
  padding: 4px 10px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 9px;
  font-weight: 200;
  white-space: nowrap;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.3px;
}

/* Flecha del tooltip X (apunta hacia arriba) */
.tooltip-x::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 5px 5px 5px;
  border-color: transparent transparent #F0F0F2 transparent;
  filter: blur(0.3px);
}

/* Borde de la flecha */
.tooltip-x::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent #C5CBCE transparent;
  filter: blur(0.3px);
  z-index: -1;
  margin-bottom: -1px;
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

/* Transición específica para tooltip X */
.tooltip-x-fade-enter-active,
.tooltip-x-fade-leave-active {
  transition: all 0.2s ease;
}

.tooltip-x-fade-enter-from,
.tooltip-x-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%);
}
</style>