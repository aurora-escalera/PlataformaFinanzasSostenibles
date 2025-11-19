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
        class="filter-btn"
        :class="{ 
          'filter-active': visibleVariables.includes(variable),
          'filter-inactive': !visibleVariables.includes(variable)
        }"
      >
        <span class="btn-color-dot" :style="{ backgroundColor: getVariableColor(variable) }"></span>
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
            :x1="chartPadding.left"
            :y1="chartPadding.top + (i - 1) * gridSpacing"
            :x2="dimensions.width - chartPadding.right"
            :y2="chartPadding.top + (i - 1) * gridSpacing"
            class="grid-line"
          />
        </g>

        <!-- Etiquetas del eje Y -->
        <g class="y-axis-labels">
          <text
            v-for="i in gridLines"
            :key="`y-label-${i}`"
            :x="chartPadding.left - 10"
            :y="chartPadding.top + (i - 1) * gridSpacing + 4"
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

            <!-- Puntos animados que se mueven -->
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

            <!-- Puntos de datos permanentes -->
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

            <!-- Puntos de datos con hover -->
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

      <!-- Tooltip Y -->
      <transition name="tooltip-fade">
        <div 
          v-if="hoverState.visible && hoverState.yValue !== null" 
          class="tooltip-y"
          :style="tooltipYStyle"
        >
          {{ formatValue(hoverState.yValue) }}
        </div>
      </transition>

      <!-- Tooltip X -->
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

    <!-- Eje X externo -->
    <div v-if="hasData" class="x-axis-container">
      <div 
        v-for="(label, i) in props.xLabels"
        :key="`x-label-external-${i}`"
        class="x-axis-label"
        :style="{ left: `${getXPosition(i)}px` }"
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
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 400
  },
  padding: {
    type: Object,
    default: () => ({
      top: 30,
      right: 40,
      bottom: 90,
      left: 60
    })
  }
})

const emit = defineEmits(['variable-toggle'])

// Estado
const chartWrapper = ref(null)
const dimensions = ref({ width: props.width, height: props.height })

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

// Configuración de padding - Ahora usa props
const chartPadding = computed(() => props.padding)

// Paleta de colores
const colorPalette = [
  '#0F3759',
  '#6B8FA3'
]

// Variables disponibles y visibles
const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])

// Estado de animación para cada variable
const animatedData = ref({})
const animatingVariables = ref(new Set())

// ✅ NUEVO: Watch para actualizar dimensiones cuando cambien los datos
watch(() => props.data, (newData) => {
  const vars = Object.keys(newData)
  
  vars.forEach(variable => {
    if (!animatedData.value[variable]) {
      animatedData.value[variable] = [...(newData[variable] || [])]
    }
  })

  if (visibleVariables.value.length === 0 && vars.length > 0) {
    if (vars[0]) {
      setTimeout(() => {
        toggleVariable(vars[0])
      }, 100)
    }
    
    if (vars[1]) {
      setTimeout(() => {
        toggleVariable(vars[1])
      }, 900)
    }
  }
  
  // ✅ AGREGADO: Actualizar dimensiones cuando cambien los datos
  nextTick(() => {
    updateDimensions()
  })
}, { deep: true })

// ✅ NUEVO: Watch para actualizar dimensiones cuando cambien las variables disponibles
watch(availableVariables, () => {
  nextTick(() => {
    updateDimensions()
  })
})

// ✅ Watch para actualizar dimensiones cuando cambien width o height
watch([() => props.width, () => props.height], () => {
  updateDimensions()
})

// Dimensiones del gráfico
const chartHeight = computed(() => dimensions.value.height - chartPadding.value.top - chartPadding.value.bottom)
const chartWidth = computed(() => dimensions.value.width - chartPadding.value.left - chartPadding.value.right)
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

// Máximo y mínimo ajustados
const maxValue = computed(() => {
  if (allVisibleValues.value.length === 0) return 100
  const max = Math.max(...allVisibleValues.value)
  const min = Math.min(...allVisibleValues.value)
  
  if (max === min) {
    return max > 0 ? max * 1.2 : max + 10
  }
  
  const range = max - min
  return max + (range * 0.20)
})

const minValue = computed(() => {
  if (allVisibleValues.value.length === 0) return 0
  const max = Math.max(...allVisibleValues.value)
  const min = Math.min(...allVisibleValues.value)
  
  if (max === min) {
    return min > 0 ? min * 0.8 : min - 10
  }
  
  const range = max - min
  return min - (range * 0.20)
})

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

// Obtener color más oscuro para puntos animados
const getDarkerColor = (variable) => {
  const color = getVariableColor(variable)
  const hex = color.replace('#', '')
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30)
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30)
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30)
  return `rgb(${r}, ${g}, ${b})`
}

// Calcular posición X usando todo el ancho disponible
const getXPosition = (index) => {
  const dataLength = props.xLabels.length
  if (dataLength <= 1) return chartPadding.value.left + chartWidth.value / 2
  
  const availableWidth = dimensions.value.width - chartPadding.value.left - chartPadding.value.right
  const step = availableWidth / (dataLength - 1)
  const position = chartPadding.value.left + index * step
  
  return position
}

// Calcular posición Y para un valor
const getY = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return dimensions.value.height - chartPadding.value.bottom
  }
  
  const range = maxValue.value - minValue.value
  if (range === 0) {
    return chartPadding.value.top + chartHeight.value / 2
  }
  
  const normalizedValue = value - minValue.value
  const percentage = normalizedValue / range
  
  const y = chartPadding.value.top + chartHeight.value * (1 - percentage)
  
  return Math.max(chartPadding.value.top, Math.min(dimensions.value.height - chartPadding.value.bottom, y))
}

// Calcular posición Y usando datos animados
const getAnimatedY = (variable, index) => {
  const value = animatedData.value[variable]?.[index]
  return getY(value)
}

// Obtener valor del eje Y para una línea de grid
const getYAxisValue = (index) => {
  const range = maxValue.value - minValue.value
  const step = range / (props.gridLines - 1)
  return maxValue.value - (step * index)
}

// Formatear valor del eje Y
const formatYAxisValue = (value) => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M` 
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${Math.round(value)}`
}

// Formatear valor para tooltip
const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A'
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

// Generar path para una línea
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
    animatingVariables.value.add(variable)
    
    const data = props.data[variable]
    if (data) {
      const startValues = [...animatedData.value[variable]]
      const range = maxValue.value - minValue.value
      const endValue = minValue.value - (range * 0.5)
      
      const pointsDuration = 500
      const totalDuration = pointsDuration + 300
      
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / totalDuration, 1)
        
        if (elapsed < pointsDuration) {
          const pointProgress = elapsed / pointsDuration
          const easeProgress = 1 - Math.pow(1 - pointProgress, 3)
          
          animatedData.value[variable] = startValues.map(val => 
            val - (val - endValue) * easeProgress
          )
        } else {
          animatedData.value[variable] = new Array(data.length).fill(endValue)
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          visibleVariables.value.splice(visibleVariables.value.indexOf(variable), 1)
          animatingVariables.value.delete(variable)
        }
      }
      
      animate()
    }
  } else {
    visibleVariables.value.push(variable)
    animatingVariables.value.add(variable)
    
    const data = props.data[variable]
    if (data) {
      const range = maxValue.value - minValue.value
      const startValue = minValue.value - (range * 0.5)
      
      animatedData.value[variable] = new Array(data.length).fill(startValue)
      
      const duration = 800
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        
        animatedData.value[variable] = data.map((val, i) => {
          const start = startValue
          const end = val
          return start + (end - start) * easeProgress
        })
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
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
    left: `${chartPadding.value.left - 15}px`,
    top: `${hoverState.value.yPosition}px`
  }
})

// Estilo del tooltip X
const tooltipXStyle = computed(() => {
  return {
    left: `${hoverState.value.x}px`,
    top: `${dimensions.value.height - chartPadding.value.bottom + 10}px`,
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

// ✅ Función para actualizar dimensiones - Usa directamente las props
const updateDimensions = () => {
  dimensions.value = {
    width: props.width,
    height: props.height
  }
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  updateDimensions()
})

onUnmounted(() => {
  // Cleanup si es necesario
})
</script>

<style scoped>
.linear-chart-container {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: visible;
}

/* Header sin padding extra (usa el del contenedor) */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
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

/* Filtros sin margen extra (usa el del contenedor) */
.variable-filters {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 6px;
  margin-bottom: 12px;
  display: flex;
  justify-content: center; 
  width: 100%;
  gap: 4px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  color: #666;
  transition: all 0.3s ease;
}

.btn-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.filter-btn.filter-active {
  background: white;      
  color: #2c3e50;        
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-btn.filter-inactive {
  background: transparent; 
  color: #999;            
  opacity: 0.7;
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

/* ✅ SIN padding - El SVG usa todo el ancho */
.chart-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  overflow: visible;
  box-sizing: border-box;
}

.line-chart {
  width: 100%;
  height: 100%;
  display: block;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
}

.y-axis-label {
  font-size: 14px;
  font-weight: 300;
  fill: #6b7280;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

.hover-line {
  transition: opacity 0.15s ease;
  pointer-events: none;
}

/* ✅ SIN padding lateral - Las etiquetas deben alinearse con el SVG */
.x-axis-container {
  position: relative;
  width: 100%;
  height: 30px;
  margin-top: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  overflow: visible;
  box-sizing: border-box;
}

.x-axis-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 100;
  color: #6b7280;
  white-space: nowrap;
  user-select: none;
}

/* Animaciones */
.line-path {
  stroke-dasharray: 3000;
  stroke-dashoffset: 3000;
  animation: drawLine 1.5s ease-out forwards;
}

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

/* Tooltips */
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
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.3px;
}

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