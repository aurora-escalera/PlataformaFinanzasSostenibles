<!-- src/modules/charts/components/HistoricBarChart.vue -->
<template>
  <div class="bar-chart-container">
    <!-- 1. TÍTULO -->
    <div v-if="!hideHeader" class="chart-title-section">
      <h3 class="chart-title">{{ title }}</h3>
    </div>

    <!-- 2. FILTROS/VARIABLES CON CONTENEDOR -->
    <div v-if="showFilters" class="filters-wrapper">
      <div class="filters-section">
        <button
          v-for="variable in visibleVariables"
          :key="variable.key"
          @click="toggleFilter(variable.key)"
          class="filter-btn"
          :class="{ 
            'filter-active': activeFilters[variable.key] !== false,
            'filter-inactive': activeFilters[variable.key] === false
          }"
        >
          <span class="btn-color-dot" :style="{ backgroundColor: variable.color }"></span>
          {{ variable.label }}
        </button>
      </div>
    </div>

    <!-- ✅ NUEVA LEYENDA EN GRIS -->
    <div v-if="showFilters" class="currency-legend">
      * Cifras en dólares estadounidenses (USD)
    </div>

    <!-- 3. ÁREA DEL GRÁFICO -->
    <div class="chart-area">
      <!-- Eje Y con escala dinámica -->
      <div class="y-axis">
        <div 
          v-for="tick in yAxisTicks" 
          :key="tick.value"
          class="y-tick"
          :style="{ bottom: `${tick.position}%` }"
        >
          <span class="tick-label">{{ formatCurrency(tick.value) }}</span>
        </div>
      </div>

      <div class="grid-lines">
        <div
          v-for="tick in yAxisTicks"
          :key="tick.value"
          class="grid-line"
          :style="{ bottom: `${tick.position}%` }"
        ></div>
      </div>

      <!-- Barras agrupadas -->
      <div class="bars-container" ref="barsContainerRef">
        <div 
          v-for="yearData in data" 
          :key="yearData.year"
          class="year-group"
          :style="{ marginRight: yearGroupGap }"
        >
          <!-- Barras de ese año -->
          <div class="bars-wrapper">
            <template v-for="variable in getFilteredVariables(yearData)" :key="variable.key">
              <div
                v-if="activeFilters[variable.key] !== false"
                class="bar-item"
              >
                <!-- Barra con animación -->
                <div 
                  class="bar"
                  :style="{
                    height: `${getBarHeight(variable.value)}px`,
                    backgroundColor: variable.color,
                    width: `${barWidth}px`
                  }"
                  @mouseenter="(e) => { hoveredYear = yearData.year; updateTooltipPosition(e) }"
                  @mousemove="updateTooltipPosition"
                  @mouseleave="hoveredYear = null"
                >
                </div>
                
              </div>
              
            </template>
          </div>
          
          <!-- Año label -->
        </div>
      </div>
      
    </div>

    <!-- ✅ ETIQUETAS DE AÑOS DEBAJO DEL GRÁFICO -->
    <div class="x-axis-labels-container">
      <div class="x-axis-spacer"></div>
      <div class="x-axis-labels">
        <div 
          v-for="yearData in data" 
          :key="yearData.year"
          class="year-label"
        >
          {{ yearData.year }}
        </div>
      </div>
    </div>


    <!-- Tooltip Global con TODAS las variables activas -->
    <Teleport to="body">
      <div 
        v-if="hoveredYear && tooltipItems.length > 0"
        class="tooltip-container"
        :style="{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`
        }"
      >
        <div class="tooltip-header">
          <span class="tooltip-year-label">{{ hoveredYear }}</span>
        </div>
        <div class="tooltip-content">
          <template v-for="(item, idx) in tooltipItems" :key="item.key">
            <!-- Separador entre variables -->
            <div v-if="idx > 0" class="tooltip-separator"></div>
            
            <!-- Variable -->
            <div class="tooltip-item">
              <span class="tooltip-color-indicator" :style="{ backgroundColor: item.color }"></span>
              <span class="tooltip-variable-name">{{ item.label }}:</span>
              <span class="tooltip-variable-value">{{ formatCurrency(item.value) }}</span>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Gráfico de Barras'
  },
  data: {
    type: Array,
    required: true,
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  showLegend: {
    type: Boolean,
    default: false
  },
  hideHeader: {
    type: Boolean,
    default: false
  },
  visibleVariableKeys: {
    type: Array,
    default: null,
  },
  variablesConfig: {
    type: Object,
    default: null,
  },
  initialActiveVariables: {
    type: Array,
    default: null,
  }
})

const hoveredYear = ref(null)
const activeFilters = ref({})
const tooltipPosition = ref({ x: 0, y: 0 })
const barsContainerRef = ref(null)
const barsContainerHeight = ref(200)

// ✅ Detectar si es móvil
const isMobile = ref(false)

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const tooltipItems = computed(() => {
  if (!hoveredYear.value || !props.data) return []
  
  const yearData = props.data.find(d => d.year === hoveredYear.value)
  if (!yearData || !yearData.variables) return []
  
  const filteredVars = getFilteredVariables(yearData)
  
  return filteredVars
    .filter(v => activeFilters.value[v.key] !== false)
    .map(v => ({
      key: v.key,
      label: v.label,
      value: v.value,
      color: v.color
    }))
})

const semanticColors = {
  'IS': '#7cb342',
  'IS Total': '#7cb342',
  'Ingresos Sostenibles': '#7cb342',
  'PS': '#7cb342',
  'Presupuestos Sostenibles': '#7cb342',
  'IIC': '#DC143C',
  'IIC Total': '#DC143C',
  'PIC': '#DC143C',
  'Presupuestos Intensivos en Carbono': '#DC143C',
  'Ingresos Intensivos en Carbono': '#DC143C',
  'IIC_H': '#8B0000',
  'IIC_M': '#DC143C',
  'IIC_T': '#FF6B6B',
  'Financiamiento Total': '#9E9E9E',
  'Gasto Total': '#9E9E9E',
  'Ingreso Total': '#9E9E9E',
  'GT ($)': '#9E9E9E',
  'IT ($)': '#9E9E9E',
  'PT ($)': '#9E9E9E',
}

const getSemanticColor = (key, label, originalColor) => {
  if (semanticColors[key]) {
    return semanticColors[key]
  }
  
  if (semanticColors[label]) {
    return semanticColors[label]
  }
  
  const lowerKey = (key || '').toLowerCase()
  
  if (lowerKey === 'is' || lowerKey.includes('is_') || lowerKey.includes('sostenible') || lowerKey === 'ps') {
    return '#7cb342'
  }
  
  if (lowerKey === 'iic_h') return '#8B0000'
  if (lowerKey === 'iic_m') return '#DC143C'
  if (lowerKey === 'iic_t') return '#FF6B6B'
  
  if (lowerKey === 'iic' || lowerKey.includes('iic') || lowerKey === 'pic' || lowerKey.includes('carbono')) {
    return '#DC143C'
  }
  
  if (lowerKey.includes('total') || lowerKey.includes('gt') || lowerKey.includes('it') || lowerKey.includes('pt')) {
    return '#9E9E9E'
  }
  
  const lowerLabel = (label || '').toLowerCase()
  
  if (lowerLabel.includes('sostenible') || lowerLabel.includes(' is')) {
    return '#7cb342'
  }
  
  if (lowerLabel.includes('carbono') || lowerLabel.includes('iic') || lowerLabel.includes('pic')) {
    return '#DC143C'
  }
  
  if (lowerLabel.includes('total')) {
    return '#9E9E9E'
  }
  
  return originalColor
}

const updateTooltipPosition = (event) => {
  const rect = event.target.getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10
  }
}

const uniqueVariables = computed(() => {
  if (!props.data || props.data.length === 0) return []
  
  const variablesMap = new Map()
  props.data.forEach(yearData => {
    if (yearData.variables && Array.isArray(yearData.variables)) {
      yearData.variables.forEach(variable => {
        if (!variablesMap.has(variable.key)) {
          if (props.variablesConfig && props.variablesConfig[variable.key]) {
            const config = props.variablesConfig[variable.key]
            const baseColor = config.color || variable.color
            variablesMap.set(variable.key, {
              key: variable.key,
              label: config.label || variable.label,
              color: getSemanticColor(variable.key, config.label || variable.label, baseColor),
              order: config.order || 0
            })
          } else {
            variablesMap.set(variable.key, {
              key: variable.key,
              label: variable.label,
              color: getSemanticColor(variable.key, variable.label, variable.color),
              order: 0
            })
          }
        }
      })
    }
  })
  
  const variables = Array.from(variablesMap.values())
  variables.sort((a, b) => (a.order || 0) - (b.order || 0))
  
  return variables
})

const visibleVariables = computed(() => {
  if (!props.visibleVariableKeys || props.visibleVariableKeys.length === 0) {
    return uniqueVariables.value
  }
  
  return uniqueVariables.value.filter(variable => 
    props.visibleVariableKeys.includes(variable.key)
  )
})

const getFilteredVariables = (yearData) => {
  if (!yearData.variables || !Array.isArray(yearData.variables)) return []
  
  if (props.visibleVariableKeys && props.visibleVariableKeys.length > 0) {
    const filtered = yearData.variables.filter(v => 
      props.visibleVariableKeys.includes(v.key)
    )
    
    if (props.variablesConfig) {
      return filtered.map(v => {
        const configLabel = props.variablesConfig[v.key]?.label || v.label
        const configColor = props.variablesConfig[v.key]?.color || v.color
        return {
          ...v,
          label: configLabel,
          color: getSemanticColor(v.key, configLabel, configColor),
          order: props.variablesConfig[v.key]?.order || 0
        }
      }).sort((a, b) => (a.order || 0) - (b.order || 0))
    }
    
    return filtered.map(v => ({
      ...v,
      color: getSemanticColor(v.key, v.label, v.color)
    }))
  }
  
  if (props.variablesConfig) {
    return yearData.variables.map(v => {
      const configLabel = props.variablesConfig[v.key]?.label || v.label
      const configColor = props.variablesConfig[v.key]?.color || v.color
      return {
        ...v,
        label: configLabel,
        color: getSemanticColor(v.key, configLabel, configColor),
        order: props.variablesConfig[v.key]?.order || 0
      }
    }).sort((a, b) => (a.order || 0) - (b.order || 0))
  }
  
  return yearData.variables.map(v => ({
    ...v,
    color: getSemanticColor(v.key, v.label, v.color)
  }))
}

const autoActivationDone = ref(false)

watch(visibleVariables, (newVars) => {
  newVars.forEach(variable => {
    if (!(variable.key in activeFilters.value)) {
      if (props.initialActiveVariables && Array.isArray(props.initialActiveVariables)) {
        activeFilters.value[variable.key] = props.initialActiveVariables.includes(variable.key)
      } else {
        activeFilters.value[variable.key] = false
      }
    }
  })
  
  if (!autoActivationDone.value && newVars.length > 0) {
    autoActivationDone.value = true
    
    if (newVars[0]) {
      setTimeout(() => {
        activeFilters.value[newVars[0].key] = true
      }, 100)
    }
    
    if (newVars[1]) {
      setTimeout(() => {
        activeFilters.value[newVars[1].key] = true
      }, 400)
    }
  }
}, { immediate: true })

const maxVisibleValue = computed(() => {
  if (!props.data || props.data.length === 0) return 100
  
  let maxValue = 0
  props.data.forEach(yearData => {
    if (yearData.variables && Array.isArray(yearData.variables)) {
      const filteredVars = getFilteredVariables(yearData)
      filteredVars.forEach(variable => {
        if (activeFilters.value[variable.key] !== false && variable.value) {
          if (variable.value > maxValue) {
            maxValue = variable.value
          }
        }
      })
    }
  })
  
  return maxValue > 0 ? maxValue * 0.8 : 100
})

const getBarHeight = (value) => {
  if (maxVisibleValue.value === 0) return 0
  const percentage = (value / maxVisibleValue.value) * 100
  const heightInPixels = (barsContainerHeight.value * percentage) / 100
  return heightInPixels
}

const yAxisTicks = computed(() => {
  const max = maxVisibleValue.value
  const step = max / 4
  return [
    { value: 0, position: 0 },
    { value: step, position: 25 },
    { value: step * 2, position: 50 },
    { value: step * 3, position: 75 },
    { value: max, position: 100 }
  ]
})

const barWidth = computed(() => {
  const activeCount = Object.values(activeFilters.value).filter(v => v !== false).length  
  
  // ✅ En móvil, barras más delgadas
  if (isMobile.value) {
    if (activeCount === 0) return 30
    if (activeCount === 1) return 60
    if (activeCount === 2) return 35
    if (activeCount === 3) return 25
    return Math.max(8, 30 / Math.sqrt(activeCount * 0.6))
  }
  
  if (activeCount === 0) return 50
  if (activeCount === 1) return 140
  if (activeCount === 2) return 75
  if (activeCount === 3) return 50

  const baseWidth = 50
  const minWidth = 10
  const maxWidth = 100
  
  const calculatedWidth = baseWidth / Math.sqrt(activeCount * 0.6)
  
  return Math.max(minWidth, Math.min(maxWidth, calculatedWidth))
})

const yearGroupGap = computed(() => {
  const activeCount = Object.values(activeFilters.value).filter(v => v !== false).length
  const totalVariables = visibleVariables.value.length
  
  if (activeCount === totalVariables && totalVariables > 0) {
    return '1px'
  }
  
  return '1px'
})

const toggleFilter = (key) => {
  activeFilters.value[key] = !activeFilters.value[key]
}

const formatCurrency = (value) => {
  if (Math.abs(value) >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)} B`
  } else if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)} M`
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(2)} K`
  }
  return `$${value.toFixed(2)}`
}

// ✅ FUNCIÓN ACTUALIZADA: Altura fija en móvil para evitar loop infinito
const updateBarsContainerHeight = () => {
  checkIsMobile()
  
  // En móvil, usar altura fija para evitar loop del ResizeObserver
  if (isMobile.value) {
    barsContainerHeight.value = 150
    return
  }
  
  // En desktop, calcular dinámicamente
  if (barsContainerRef.value) {
    const height = barsContainerRef.value.clientHeight - 30
    if (height > 0) {
      barsContainerHeight.value = height
    }
  }
}

let resizeObserver = null

onMounted(async () => {
  await nextTick()
  
  // Listener para resize
  window.addEventListener('resize', updateBarsContainerHeight)
  
  updateBarsContainerHeight()
  
  if (barsContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // Solo actualizar si NO es móvil (evita loop)
      if (!isMobile.value) {
        updateBarsContainerHeight()
      }
    })
    resizeObserver.observe(barsContainerRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBarsContainerHeight)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

watch(() => props.data, () => {
  nextTick(() => {
    updateBarsContainerHeight()
  })
}, { deep: true })
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  overflow: visible;
}

/* 1. SECCIÓN DE TÍTULO */
.chart-title-section {
  margin-bottom: 12px;
  width: 100%;
  text-align: center;
}

.chart-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

/* 2. SECCIÓN DE FILTROS CON CONTENEDOR */
.filters-wrapper {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 6px;
  margin-bottom: 4px;
  display: flex;
  justify-content: center; 
  width: 100%; 
}

.filters-section {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center; 
}

.filter-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

.filter-btn:hover {
  transform: scale(1.05);
}

/* LEYENDA EN GRIS */
.currency-legend {
  font-size: 11px;
  font-style: italic;
  color: #888;
  text-align: left;
  width: 100%;
  margin-bottom: 12px;
  padding-left: 8px;
}

/* ÁREA DEL GRÁFICO */
.chart-area {
  margin-top: 8px;
  padding-top: 20px;
  flex: 1;
  display: flex;
  position: relative;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow: visible;
  align-self: stretch;
}

/* EJE Y */
.y-axis {
  width: 70px;
  position: relative;
  flex-shrink: 0;
}

.y-tick {
  position: absolute;
  right: 0;
  width: 100%;
  display: flex;
  align-items: center;
  transition: bottom 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.tick-label {
  font-size: 12px;
  font-weight: 300;
  color: #666;
  text-align: right;
  width: 65px;
  padding-right: 10px;
}

.tick-line {
  display: none; 
}

/* CONTENEDOR DE BARRAS */
.bars-container {
  flex: 1;
  max-width: 100%;
  display: flex;
  align-items: flex-end;
  overflow-x: visible;
  overflow-y: visible;
  position: relative;
  height: 100%; 
  z-index: 2;
}

/* GRUPO DE AÑO */
.year-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 100%;
  height: 100%;
  justify-content: flex-end;
  min-width: 0;
}

/* WRAPPER DE BARRAS */
.bars-wrapper {
  display: flex;
  gap: 1px;
  align-items: flex-end;
  justify-content: center;
  flex: 1;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

/* ITEM DE BARRA */
.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  transition: opacity 0.3s ease;
  position: relative;
  overflow: visible;
}

/* BARRA CON ANIMACIÓN */
.bar {
  min-height: 2px;
  border-radius: 4px 4px 0 0;
  position: relative;
  cursor: pointer;
  transition: 
    height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s ease,
    opacity 0.3s ease,
    transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar:hover {
  opacity: 0.8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Tooltip */
.tooltip-container {
  position: fixed;
  transform: translate(-50%, calc(-100% - 15px));
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 99999;
  min-width: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: left 0.1s ease, top 0.1s ease;
}

.tooltip-container::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: white;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

.tooltip-header {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.tooltip-year-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tooltip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.tooltip-color-indicator {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.tooltip-variable-name {
  color: #666;
  flex-shrink: 0;
}

.tooltip-variable-value {
  color: #333;
  font-weight: 600;
  margin-left: auto;
}

.tooltip-separator {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}

/* ETIQUETAS DE AÑOS */
.x-axis-labels-container {
  width: 100%;
  display: flex;
  height: 30px;
  flex-shrink: 0;
  margin-top: 8px;
}

.x-axis-spacer {
  width: 70px;
  flex-shrink: 0;
}

.x-axis-labels {
  flex: 1;
  display: flex;
  overflow-x: auto;
}

.year-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #666;
  font-weight: 500;
  text-align: center;
}

/* Grid lines */
.grid-lines {
  position: absolute;
  top: 0;
  left: 70px;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e0e0e0;
}

/* ============================================
   RESPONSIVE - Media Queries
   ============================================ */

/* Tablets */
@media (max-width: 768px) {
  .bar-chart-container {
    padding: 10px;
    border-radius: 6px;
  }
  
  .chart-title-section {
    margin-bottom: 8px;
  }
  
  .chart-title {
    font-size: 12px;
  }
  
  .filters-wrapper {
    padding: 4px;
    margin-bottom: 3px;
    border-radius: 16px;
  }
  
  .filters-section {
    gap: 3px;
  }
  
  .filter-btn {
    padding: 4px 10px;
    font-size: 10px;
    border-radius: 12px;
    gap: 4px;
  }
  
  .btn-color-dot {
    width: 6px;
    height: 6px;
  }
  
  .currency-legend {
    font-size: 9px;
    margin-bottom: 8px;
    padding-left: 6px;
  }
  
  .chart-area {
    margin-top: 6px;
    padding-top: 15px;
    height: 200px;
    min-height: 200px;
    max-height: 200px;
    flex: none;
  }
  
  .bars-container {
    height: 100%;
    max-height: 180px;
    align-items: flex-end !important;
  }
  
  .bars-wrapper {
    align-items: flex-end !important;
    justify-content: center;
  }
  
  .bar-item {
    justify-content: flex-end !important;
    align-items: center;
  }
  
  .year-group {
    justify-content: flex-end !important;
  }
  
  .y-axis {
    width: 50px;
  }
  
  .tick-label {
    font-size: 9px;
    width: 45px;
    padding-right: 6px;
  }
  
  .grid-lines {
    left: 50px;
  }
  
  .bar {
    border-radius: 3px 3px 0 0;
  }
  
  .x-axis-labels-container {
    height: 25px;
    margin-top: 6px;
  }
  
  .x-axis-spacer {
    width: 50px;
  }
  
  .year-label {
    font-size: 9px;
  }
  
  .tooltip-container {
    padding: 10px 12px;
    min-width: 160px;
    border-radius: 6px;
  }
  
  .tooltip-header {
    margin-bottom: 8px;
    padding-bottom: 6px;
  }
  
  .tooltip-year-label {
    font-size: 12px;
  }
  
  .tooltip-content {
    gap: 4px;
  }
  
  .tooltip-item {
    font-size: 11px;
    gap: 6px;
  }
  
  .tooltip-color-indicator {
    width: 8px;
    height: 8px;
  }
  
  .tooltip-separator {
    margin: 3px 0;
  }
  
  .tooltip-container::after {
    border-width: 6px;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .bar-chart-container {
    padding: 8px;
    border-radius: 5px;
  }
  
  .chart-title-section {
    margin-bottom: 6px;
  }
  
  .chart-title {
    font-size: 10px;
  }
  
  .filters-wrapper {
    padding: 3px;
    margin-bottom: 2px;
    border-radius: 14px;
  }
  
  .filters-section {
    gap: 2px;
  }
  
  .filter-btn {
    padding: 3px 7px;
    font-size: 8px;
    border-radius: 10px;
    gap: 3px;
  }
  
  .btn-color-dot {
    width: 5px;
    height: 5px;
  }
  
  .currency-legend {
    font-size: 7px;
    margin-bottom: 6px;
    padding-left: 4px;
  }
  
  .chart-area {
    margin-top: 4px;
    padding-top: 10px;
    height: 180px;
    min-height: 180px;
    max-height: 180px;
    flex: none;
  }
  
  .bars-container {
    height: 100%;
    max-height: 160px;
    align-items: flex-end !important;
  }
  
  .bars-wrapper {
    align-items: flex-end !important;
    justify-content: center;
  }
  
  .bar-item {
    justify-content: flex-end !important;
    align-items: center;
  }
  
  .year-group {
    justify-content: flex-end !important;
  }
  
  .y-axis {
    width: 40px;
  }
  
  .tick-label {
    font-size: 7px;
    width: 36px;
    padding-right: 4px;
  }
  
  .grid-lines {
    left: 40px;
  }
  
  .bar {
    border-radius: 2px 2px 0 0;
  }
  
  .x-axis-labels-container {
    height: 20px;
    margin-top: 4px;
  }
  
  .x-axis-spacer {
    width: 40px;
  }
  
  .year-label {
    font-size: 7px;
  }
  
  .tooltip-container {
    padding: 8px 10px;
    min-width: 130px;
    border-radius: 5px;
  }
  
  .tooltip-header {
    margin-bottom: 6px;
    padding-bottom: 5px;
  }
  
  .tooltip-year-label {
    font-size: 10px;
  }
  
  .tooltip-content {
    gap: 3px;
  }
  
  .tooltip-item {
    font-size: 9px;
    gap: 5px;
  }
  
  .tooltip-color-indicator {
    width: 6px;
    height: 6px;
  }
  
  .tooltip-separator {
    margin: 2px 0;
  }
  
  .tooltip-container::after {
    border-width: 5px;
  }
}

/* Landscape en móviles */
@media (max-width: 768px) and (orientation: landscape) {
  .bar-chart-container {
    padding: 6px;
  }
  
  .chart-title {
    font-size: 10px;
  }
  
  .filters-wrapper {
    padding: 3px;
    margin-bottom: 2px;
  }
  
  .filter-btn {
    padding: 3px 8px;
    font-size: 8px;
  }
  
  .currency-legend {
    font-size: 7px;
    margin-bottom: 4px;
  }
  
  .chart-area {
    margin-top: 4px;
    padding-top: 8px;
    height: 150px;
    min-height: 150px;
    max-height: 150px;
  }
  
  .bars-container {
    max-height: 130px;
    align-items: flex-end !important;
  }
  
  .bars-wrapper {
    align-items: flex-end !important;
  }
  
  .bar-item {
    justify-content: flex-end !important;
  }
  
  .year-group {
    justify-content: flex-end !important;
  }
  
  .y-axis {
    width: 45px;
  }
  
  .tick-label {
    font-size: 7px;
    width: 40px;
  }
  
  .grid-lines {
    left: 45px;
  }
  
  .x-axis-labels-container {
    height: 18px;
    margin-top: 4px;
  }
  
  .x-axis-spacer {
    width: 45px;
  }
  
  .year-label {
    font-size: 7px;
  }
  
  .tooltip-container {
    padding: 6px 8px;
    min-width: 120px;
  }
  
  .tooltip-year-label {
    font-size: 9px;
  }
  
  .tooltip-item {
    font-size: 8px;
  }
}
</style>