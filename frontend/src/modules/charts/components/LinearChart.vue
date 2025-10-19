<template>
  <div class="linear-chart-container">
    <!-- Header con título y controles -->
    <div class="chart-header">
      <div class="header-content">
        <h3 class="chart-title">{{ title }}</h3>
        <p v-if="subtitle" class="chart-subtitle">{{ subtitle }}</p>
      </div>
      
      <!-- Botón de menú -->
      <div class="chart-controls">
        <button 
          class="menu-button" 
          @click.stop="toggleMenu"
          :class="{ 'is-open': isMenuOpen }"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>

        <!-- Menú desplegable -->
        <transition name="menu-fade">
          <div v-if="isMenuOpen" class="dropdown-menu" @click.stop>
            <div class="menu-section">
              <div class="menu-section-title">Variables visibles</div>
              <div 
                v-for="variable in availableVariables" 
                :key="variable"
                class="menu-item"
                @click="toggleVariable(variable)"
              >
                <div class="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    :checked="visibleVariables.includes(variable)"
                    :id="`var-${variable}`"
                    class="menu-checkbox"
                    @click.stop
                  />
                  <label :for="`var-${variable}`" class="menu-label">
                    {{ variable }}
                  </label>
                </div>
                <div 
                  class="color-indicator" 
                  :style="{ backgroundColor: getVariableColor(variable) }"
                ></div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Leyenda de variables -->
    <div v-if="showLegend && visibleVariables.length > 0" class="chart-legend">
      <div 
        v-for="variable in visibleVariables"
        :key="`legend-${variable}`"
        class="legend-item"
        @click="toggleVariable(variable)"
      >
        <div 
          class="legend-dot" 
          :style="{ backgroundColor: getVariableColor(variable) }"
        ></div>
        <span class="legend-label">{{ variable }}</span>
      </div>
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
            <!-- Definir gradiente para el área -->
            <defs>
              <linearGradient :id="`gradient-${getVariableId(variable)}`" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :stop-color="getVariableColor(variable)" stop-opacity="0.2"/>
                <stop offset="100%" :stop-color="getVariableColor(variable)" stop-opacity="0.02"/>
              </linearGradient>
            </defs>

            <!-- Área bajo la línea -->
            <path
              :d="getAreaPath(variable)"
              :fill="`url(#gradient-${getVariableId(variable)})`"
              class="area-path"
            />

            <!-- Línea principal con animación -->
            <path
              :d="getLinePath(variable)"
              :stroke="getVariableColor(variable)"
              stroke-width="3"
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
                :r="hoverState.visible && hoverState.index === i ? 7 : 5"
                :fill="getVariableColor(variable)"
                :stroke="'white'"
                :stroke-width="2"
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
const isMenuOpen = ref(false)
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
const padding = { top: 0, right: 40, bottom: 50, left: 20 }

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

// Variables disponibles y visibles
const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])

// Inicializar variables visibles
watch(() => props.data, (newData) => {
  const vars = Object.keys(newData)
  if (vars.length > 0 && visibleVariables.value.length === 0) {
    visibleVariables.value = [...vars]
  }
}, { immediate: true })

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
    top: `${highestPoint.value - 150}px`  // 10px arriba del punto más alto
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

// Área de interacción para cada punto
const getInteractionX = (index) => {
  const dataLength = props.xLabels.length
  if (index === 0) return padding.left
  
  const currentX = getXPosition(index)
  const prevX = getXPosition(index - 1)
  return prevX + (currentX - prevX) / 2
}

const getInteractionWidth = () => {
  const dataLength = props.xLabels.length
  if (dataLength <= 1) return chartWidth.value
  
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
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleVariable = (variable) => {
  const index = visibleVariables.value.indexOf(variable)
  if (index > -1) {
    if (visibleVariables.value.length > 1) {
      visibleVariables.value.splice(index, 1)
    }
  } else {
    visibleVariables.value.push(variable)
  }
  emit('variable-toggle', visibleVariables.value)
}

const getVariableColor = (variable) => {
  const index = availableVariables.value.indexOf(variable)
  return colorPalette[index % colorPalette.length]
}

const getVariableId = (variable) => {
  return variable.replace(/[^a-zA-Z0-9]/g, '-')
}

const getVariableData = (variable) => {
  return props.data[variable] || []
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

const handleClickOutside = (e) => {
  if (!e.target.closest('.chart-controls')) {
    isMenuOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
  
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
  document.removeEventListener('click', handleClickOutside)
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
  overflow: hidden;
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
}

.chart-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.chart-controls {
  position: relative;
  margin-left: 16px;
}

.menu-button {
  padding: 6px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.menu-button:hover,
.menu-button.is-open {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #111827;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  min-width: 220px;
  z-index: 100;
}

.menu-section {
  padding: 8px;
}

.menu-section-title {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f9fafb;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.menu-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #10b981;
}

.menu-label {
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

.color-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  padding: 12px 0;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.legend-item:hover {
  opacity: 0.7;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
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
}

.line-chart {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

.grid-line {
  stroke: #f3f4f6;
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
  opacity: 0;
  transform-origin: center;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
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

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Escalonar animación de puntos */
.data-point:nth-child(1) { animation-delay: 0.8s; }
.data-point:nth-child(2) { animation-delay: 0.9s; }
.data-point:nth-child(3) { animation-delay: 1s; }
.data-point:nth-child(4) { animation-delay: 1.1s; }
.data-point:nth-child(5) { animation-delay: 1.2s; }
.data-point:nth-child(6) { animation-delay: 1.3s; }
.data-point:nth-child(7) { animation-delay: 1.4s; }
.data-point:nth-child(8) { animation-delay: 1.5s; }

/* Tooltip fijo */
.tooltip-fixed {
  position: absolute;
  background: #1f2937;
  color: white;
  border-radius: 6px;
  padding: 6px 8px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  min-width: 100px;
  transform: translateX(-50%);
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
  font-size: 12px;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tooltip-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tooltip-item-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tooltip-dot {
  width: 10px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tooltip-variable {
  font-size: 11px;
  font-weight: 100;
  color: rgba(255, 255, 255, 0.8);
}

.tooltip-value {
  font-size: 11px;
  font-weight: 100;
  color: white;
  padding-left: 10px;
}

/* Transiciones */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.2s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

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