<!-- src/modules/charts/components/VerticalBarChart.vue -->
<template>
  <div class="vertical-bar-chart-container">
    <!-- Header con título -->
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
            v-for="(year, yearIndex) in xLabels" 
            :key="`year-${yearIndex}`"
            class="bar-group"
          >
            <!-- Barra 1 (primera variable visible) -->
            <rect
              v-if="visibleVariables[0] && data[visibleVariables[0]]"
              :x="getBarX(yearIndex, 0)"
              :y="getBarY(data[visibleVariables[0]][yearIndex])"
              :width="barWidth"
              :height="getBarHeight(data[visibleVariables[0]][yearIndex])"
              :fill="getVariableColor(visibleVariables[0])"
              class="bar bar-animated"
              :style="{ animationDelay: `${yearIndex * 0.1}s` }"
              @mouseenter="handleBarHover(visibleVariables[0], data[visibleVariables[0]][yearIndex], year, $event)"
              @mousemove="handleBarMove($event)"
              @mouseleave="handleBarLeave"
            />

            <!-- Barra 2 (segunda variable visible) -->
            <rect
              v-if="visibleVariables[1] && data[visibleVariables[1]]"
              :x="getBarX(yearIndex, 1)"
              :y="getBarY(data[visibleVariables[1]][yearIndex])"
              :width="barWidth"
              :height="getBarHeight(data[visibleVariables[1]][yearIndex])"
              :fill="getVariableColor(visibleVariables[1])"
              class="bar bar-animated"
              :style="{ animationDelay: `${yearIndex * 0.1}s` }"
              @mouseenter="handleBarHover(visibleVariables[1], data[visibleVariables[1]][yearIndex], year, $event)"
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
        v-for="(label, i) in xLabels"
        :key="`x-label-${i}`"
        class="x-axis-label"
        :style="{ left: `${getXLabelPosition(i)}%` }"
      >
        {{ label }}
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
  subtitle: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => ({
      'Variable 1': [49640774480, 28392898350, 10994972955, 15806164249, 11434847973],
      'Variable 2': [15368642388, 13882525752, 2850000000, 2976737887, 385705374]
    })
  },
  xLabels: {
    type: Array,
    default: () => ['2020', '2021', '2022', '2023', '2024']
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

// Paleta de colores (mismos del componente original)
const colorPalette = [
  '#9ca3af', // Gris claro
  '#6b7280', // Gris oscuro
  '#DC143C', // Rojo
  '#7cb342', // Verde
  '#3b82f6', // Azul
  '#eab308', // Amarillo
  '#a78bfa', // Púrpura
  '#fb923c', // Naranja
]

// Variables disponibles y visibles
const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])

// Inicializar con las primeras 2 variables visibles (sin delay)
watch(() => props.data, (newData) => {
  const vars = Object.keys(newData)
  if (visibleVariables.value.length === 0 && vars.length > 0) {
    // Mostrar inmediatamente las primeras 2 variables para que se vea la animación
    visibleVariables.value = vars.slice(0, 2)
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

// Ancho de cada barra
const barWidth = computed(() => {
  const groupWidth = chartWidth.value / props.xLabels.length
  const barSpacing = 2 // ⭐ Gap de 2px entre barras del mismo año
  const groupPadding = 30 // ⭐ Espacio entre grupos de años (más gap)
  return (groupWidth - groupPadding - barSpacing * 3) / 2 // 2 barras por grupo
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
const toggleVariable = (variable) => {
  const index = visibleVariables.value.indexOf(variable)
  
  if (index > -1) {
    visibleVariables.value.splice(index, 1)
  } else {
    if (visibleVariables.value.length < 2) {
      visibleVariables.value.push(variable)
    } else {
      visibleVariables.value[1] = variable // Reemplaza la segunda
    }
  }
  
  emit('variable-toggle', visibleVariables.value)
}

const getVariableColor = (variable) => {
  const index = availableVariables.value.indexOf(variable)
  return colorPalette[index % colorPalette.length]
}

// Calcular posición X de una barra
const getBarX = (yearIndex, barIndex) => {
  const groupWidth = chartWidth.value / props.xLabels.length
  const groupStart = padding.left + yearIndex * groupWidth
  const barSpacing = 2 // ⭐ Gap de 2px entre barras del mismo año
  const groupPadding = 30 // ⭐ Padding lateral para centrar el grupo
  
  return groupStart + groupPadding/2 + barIndex * (barWidth.value + barSpacing)
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

// Posición de etiquetas del eje X
const getXLabelPosition = (index) => {
  const totalWidth = dimensions.value.width
  const usableWidth = chartWidth.value
  const leftPaddingPercentage = (padding.left / totalWidth) * 100
  const usableWidthPercentage = (usableWidth / totalWidth) * 100
  
  const groupWidth = usableWidthPercentage / props.xLabels.length
  return leftPaddingPercentage + (index * groupWidth) + (groupWidth / 2)
}

const formatValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
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
const handleBarHover = (variable, value, year, event) => {
  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    variable: variable,
    value: value,
    year: year,
    color: getVariableColor(variable)
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