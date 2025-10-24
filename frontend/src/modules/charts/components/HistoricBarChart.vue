<!-- src/modules/charts/components/HistoricBarChart.vue -->
<template>
  <div class="vertical-bar-chart-container">
    <!-- Header con título -->
    <div class="chart-header">
      <div class="header-content">
        <h3 class="chart-title">{{ title }}</h3>
      </div>
    </div>

    <!-- Filtros de variables (botones) -->
    <div v-if="showFilters && availableVariables.length > 0" class="variable-filters">
      <button 
        v-for="variable in availableVariables" 
        :key="variable.key"
        @click="toggleVariable(variable.key)"
        :class="['filter-btn', { 'active': visibleVariables.includes(variable.key) }]"
        :style="{ 
          backgroundColor: visibleVariables.includes(variable.key) ? variable.color : 'white',
          color: visibleVariables.includes(variable.key) ? 'white' : '#6b7280'
        }"
      >
        {{ variable.label }}
      </button>
    </div>

    <!-- Leyenda -->
    <div v-if="showLegend && availableVariables.length > 0" class="chart-legend">
      <div 
        v-for="variable in availableVariables" 
        :key="'legend-' + variable.key"
        class="legend-item"
      >
        <span 
          class="legend-dot" 
          :style="{ backgroundColor: variable.color }"
        ></span>
        <span class="legend-label">{{ variable.label }}</span>
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
        class="bar-chart"
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
        <g class="y-axis">
          <text
            v-for="(label, i) in yAxisLabels"
            :key="`y-label-${i}`"
            :x="padding.left - 10"
            :y="padding.top + i * gridSpacing + 5"
            class="y-axis-label"
            text-anchor="end"
          >
            {{ label }}
          </text>
        </g>

        <!-- Grupos de barras por año -->
        <g class="bars">
          <g 
            v-for="(yearData, yearIndex) in data" 
            :key="`year-${yearIndex}`"
            class="bar-group"
          >
            <!-- Barra para cada variable visible -->
            <rect
              v-for="(variable, varIndex) in getVisibleVariablesForYear(yearData)"
              :key="`bar-${yearIndex}-${varIndex}`"
              :x="getBarX(yearIndex, varIndex)"
              :y="getBarY(variable.value)"
              :width="dynamicBarWidth"
              :height="getBarHeight(variable.value)"
              :fill="variable.color"
              class="bar bar-animated"
              :style="{ 
                animationDelay: `${yearIndex * 0.1}s`,
                transition: 'width 0.3s ease, x 0.3s ease'
              }"
              @mouseenter="handleBarHover(variable, yearData.year, $event)"
              @mousemove="handleBarMove($event)"
              @mouseleave="handleBarLeave"
            />
          </g>
        </g>
      </svg>
    </div>

    <!-- Eje X externo (fuera del SVG) -->
    <div v-if="hasData" class="x-axis-container">
      <div 
        v-for="(yearData, i) in data"
        :key="`x-label-${i}`"
        class="x-axis-label"
        :style="{ left: `${getXLabelPosition(i)}%` }"
      >
        {{ yearData.year }}
      </div>
    </div>

    <!-- Tooltip con Teleport -->
    <Teleport to="body">
      <div 
        v-if="tooltip.visible"
        class="tooltip"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          <div class="tooltip-color" :style="{ backgroundColor: tooltip.color }"></div>
          <div class="tooltip-info">
            <div class="tooltip-header">
              <span class="tooltip-variable">{{ tooltip.variable }}</span>
              <span class="tooltip-year">{{ tooltip.year }}</span>
            </div>
            <div class="tooltip-value">{{ formatValue(tooltip.value) }}</div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Gráfica de barras'
  },
  // Array de objetos: [{ year: '2020', variables: [{ key, label, value, color }] }]
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  showFilters: {
    type: Boolean,
    default: false
  },
  showLegend: {
    type: Boolean,
    default: false
  },
  gridLines: {
    type: Number,
    default: 5
  }
})

// Estado
const chartWrapper = ref(null)
const dimensions = ref({ width: 600, height: 300 })

// Estado del tooltip
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  variable: '',
  value: 0,
  year: '',
  color: ''
})

// Configuración de padding
const padding = { top: 20, right: 40, bottom: 10, left: 80 }

// Variables visibles (para filtros)
const visibleVariables = ref([])

// Obtener todas las variables únicas disponibles
const availableVariables = computed(() => {
  if (props.data.length === 0) return []
  
  const varsMap = new Map()
  props.data.forEach(yearData => {
    yearData.variables.forEach(variable => {
      if (!varsMap.has(variable.key)) {
        varsMap.set(variable.key, {
          key: variable.key,
          label: variable.label,
          color: variable.color
        })
      }
    })
  })
  
  return Array.from(varsMap.values())
})

// Inicializar con todas las variables visibles
watch(() => props.data, (newData) => {
  if (newData.length > 0 && visibleVariables.value.length === 0) {
    visibleVariables.value = availableVariables.value.map(v => v.key)
  }
}, { immediate: true, deep: true })

// Obtener variables visibles para un año específico
const getVisibleVariablesForYear = (yearData) => {
  return yearData.variables.filter(v => visibleVariables.value.includes(v.key))
}

// Dimensiones del gráfico
const chartHeight = computed(() => dimensions.value.height - padding.top - padding.bottom)
const chartWidth = computed(() => dimensions.value.width - padding.left - padding.right)
const gridSpacing = computed(() => chartHeight.value / (props.gridLines - 1))

// Calcular todos los valores visibles
const allVisibleValues = computed(() => {
  const values = []
  props.data.forEach(yearData => {
    yearData.variables.forEach(variable => {
      if (visibleVariables.value.includes(variable.key)) {
        values.push(variable.value)
      }
    })
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
  return props.data.length > 0 && 
         visibleVariables.value.length > 0 &&
         allVisibleValues.value.length > 0
})

// ✅ Ancho dinámico de cada barra según número de variables visibles
const dynamicBarWidth = computed(() => {
  const numBars = visibleVariables.value.length
  if (numBars === 0) return 0
  
  const groupWidth = chartWidth.value / props.data.length
  const barSpacing = 2
  
  // ✅ Padding dinámico: más pequeño cuando hay pocas variables (barras más anchas)
  let groupPadding
  if (numBars === 1) {
    groupPadding = 50  // Barras más anchas para 1 variable
  } else if (numBars === 2) {
    groupPadding = 40  // Barras medianas para 2 variables
  } else {
    groupPadding = 30  // Barras más pequeñas para 3+ variables
  }
  
  return (groupWidth - groupPadding - barSpacing * (numBars - 1)) / numBars
})

// Etiquetas del eje Y
const yAxisLabels = computed(() => {
  const labels = []
  for (let i = 0; i < props.gridLines; i++) {
    const value = maxValue.value - (i * (maxValue.value - minValue.value) / (props.gridLines - 1))
    labels.push(formatValue(value))
  }
  return labels
})

// Funciones
const toggleVariable = (variableKey) => {
  const index = visibleVariables.value.indexOf(variableKey)
  
  if (index > -1) {
    visibleVariables.value.splice(index, 1)
  } else {
    visibleVariables.value.push(variableKey)
  }
}

// ✅ Calcular posición X de una barra con width dinámico
const getBarX = (yearIndex, barIndex) => {
  const numBars = visibleVariables.value.length
  const groupWidth = chartWidth.value / props.data.length
  const groupStart = padding.left + yearIndex * groupWidth
  const barSpacing = 2
  
  // Padding dinámico igual que en dynamicBarWidth
  let groupPadding
  if (numBars === 1) {
    groupPadding = 50
  } else if (numBars === 2) {
    groupPadding = 40
  } else {
    groupPadding = 30
  }
  
  return groupStart + groupPadding/2 + barIndex * (dynamicBarWidth.value + barSpacing)
}

// Calcular posición Y de una barra
const getBarY = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return padding.top + chartHeight.value
  }
  const percentage = (value - minValue.value) / valueRange.value
  return padding.top + chartHeight.value * (1 - percentage)
}

// Calcular altura de una barra
const getBarHeight = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0
  }
  const percentage = (value - minValue.value) / valueRange.value
  return chartHeight.value * percentage
}

// Calcular posición del label X
const getXLabelPosition = (index) => {
  const groupWidth = 100 / props.data.length
  return (groupWidth * index) + (groupWidth / 2) + (padding.left / dimensions.value.width * 100)
}

// Formatear valores
const formatValue = (value) => {
  if (value >= 1000000000) {
    return '$' + (value / 1000000000).toFixed(1) + 'B'
  } else if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(1) + 'K'
  }
  
  return value.toLocaleString('es-MX', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

// Computed: Estilo del tooltip
const tooltipStyle = computed(() => {
  return {
    left: `${tooltip.value.x + 15}px`,
    top: `${tooltip.value.y - 50}px`
  }
})

// Manejadores de tooltip
const handleBarHover = (variable, year, event) => {
  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    variable: variable.label,
    value: variable.value,
    year: year,
    color: variable.color
  }
}

const handleBarMove = (event) => {
  if (tooltip.value.visible) {
    tooltip.value.x = event.clientX
    tooltip.value.y = event.clientY
  }
}

const handleBarLeave = () => {
  tooltip.value.visible = false
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
.vertical-bar-chart-container {
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

/* Leyenda */
.chart-legend {
  display: flex;
  flex-direction: row;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 11px;
  gap: 6px;
  color: #4b5563;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
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
  overflow: visible;
}

.bar-chart {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
}

.y-axis-label {
  font-size: 11px;
  font-weight: 500;
  fill: #6b7280;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

/* Barras */
.bar {
  cursor: pointer;
  transition: opacity 0.2s ease, filter 0.2s ease;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.bar-animated {
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  transform-origin: bottom;
}

.bar:hover {
  opacity: 1;
  filter: brightness(1.05);
  box-shadow: 0 -3px 8px rgba(0, 0, 0, 0.2);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tooltip */
.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  border-radius: 4px;
  padding: 4px 6px;
  pointer-events: none;
  z-index: 999999;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  font-size: 8px;
  white-space: nowrap;
}

.tooltip-content {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tooltip-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.tooltip-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.tooltip-variable {
  font-size: 7px;
  font-weight: 600;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tooltip-year {
  font-size: 7px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tooltip-value {
  font-size: 6px;
  font-weight: 500;
  color: white;
  opacity: 0.9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>