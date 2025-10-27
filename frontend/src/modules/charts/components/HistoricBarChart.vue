<!-- src/modules/charts/components/HistoricBarChart.vue -->
<template>
  <div class="bar-chart-container">
    <!-- Header con título y filtros -->
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      
      <!-- Filtros de variables -->
      <div v-if="showFilters" class="filters-container">
        <button
          v-for="variable in uniqueVariables"
          :key="variable.key"
          @click="toggleFilter(variable.key)"
          class="filter-btn"
          :class="{ 
            'active': activeFilters[variable.key] !== false,
            'inactive': activeFilters[variable.key] === false
          }"
          :style="{
            borderColor: activeFilters[variable.key] !== false ? variable.color : '#ccc'
          }"
        >
          <span class="filter-indicator" 
                :style="{ backgroundColor: activeFilters[variable.key] !== false ? variable.color : '#ccc' }">
          </span>
          {{ variable.label }}
        </button>
      </div>
    </div>

    <!-- Área del gráfico -->
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
          <div class="tick-line"></div>
        </div>
      </div>

      <!-- Barras agrupadas -->
      <div class="bars-container">
        <div 
          v-for="yearData in data" 
          :key="yearData.year"
          class="year-group"
        >
          <!-- Barras de ese año -->
          <div class="bars-wrapper">
            <template v-for="variable in yearData.variables" :key="variable.key">
              <div
                v-if="activeFilters[variable.key] !== false"
                class="bar-item"
              >
                <!-- Barra con animación -->
                <div 
                  class="bar"
                  :style="{
                    height: `${getBarHeight(variable.value)}%`,
                    backgroundColor: variable.color,
                    width: `${barWidth}px`
                  }"
                  @mouseenter="(e) => { hoveredBar = { year: yearData.year, variable }; updateTooltipPosition(e) }"
                  @mousemove="updateTooltipPosition"
                  @mouseleave="hoveredBar = null"
                >
                </div>
              </div>
            </template>
          </div>
          
          <!-- Año label -->
          <div class="year-label">{{ yearData.year }}</div>
        </div>
      </div>
    </div>

    <!-- Leyenda (opcional) -->
    <div v-if="showLegend" class="legend">
      <div 
        v-for="variable in uniqueVariables"
        :key="variable.key"
        class="legend-item"
      >
        <span class="legend-color" :style="{ backgroundColor: variable.color }"></span>
        <span class="legend-label">{{ variable.label }}</span>
      </div>
    </div>

    <!-- Tooltip Global con position: fixed -->
    <Teleport to="body">
      <div 
        v-if="hoveredBar"
        class="tooltip-fixed"
        :style="{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`
        }"
      >
        <div class="tooltip-title">{{ hoveredBar.variable.label }}</div>
        <div class="tooltip-value">{{ formatCurrency(hoveredBar.variable.value) }}</div>
        <div class="tooltip-year">{{ hoveredBar.year }}</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Gráfico de Barras'
  },
  data: {
    type: Array,
    required: true,
    // Estructura: [{ year: '2020', variables: [{ key, label, value, color }] }]
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  showLegend: {
    type: Boolean,
    default: false
  }
})

const hoveredBar = ref(null)
const activeFilters = ref({})
const tooltipPosition = ref({ x: 0, y: 0 })

// Función para actualizar posición del tooltip
const updateTooltipPosition = (event) => {
  const rect = event.target.getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10 // 10px arriba de la barra
  }
}

// Extraer variables únicas
const uniqueVariables = computed(() => {
  if (!props.data || props.data.length === 0) return []
  
  const variablesMap = new Map()
  props.data.forEach(yearData => {
    if (yearData.variables && Array.isArray(yearData.variables)) {
      yearData.variables.forEach(variable => {
        if (!variablesMap.has(variable.key)) {
          variablesMap.set(variable.key, {
            key: variable.key,
            label: variable.label,
            color: variable.color
          })
        }
      })
    }
  })
  return Array.from(variablesMap.values())
})

// Inicializar filtros
watch(uniqueVariables, (newVars) => {
  newVars.forEach(variable => {
    if (!(variable.key in activeFilters.value)) {
      activeFilters.value[variable.key] = true
    }
  })
}, { immediate: true })

// ✅ CÁLCULO DINÁMICO DEL MÁXIMO (barra más alta = 80% del espacio)
const maxVisibleValue = computed(() => {
  if (!props.data || props.data.length === 0) return 100
  
  let maxValue = 0
  props.data.forEach(yearData => {
    if (yearData.variables && Array.isArray(yearData.variables)) {
      yearData.variables.forEach(variable => {
        if (activeFilters.value[variable.key] !== false && variable.value) {
          if (variable.value > maxValue) {
            maxValue = variable.value
          }
        }
      })
    }
  })
  
  // Multiplicar por 1.25 para que la barra más alta ocupe 80% (100/80 = 1.25)
  return maxValue > 0 ? maxValue * 1.25 : 100
})

// ✅ CALCULAR ALTURA DE BARRA (en porcentaje del contenedor)
const getBarHeight = (value) => {
  if (maxVisibleValue.value === 0) return 0
  return (value / maxVisibleValue.value) * 100
}

// Calcular ticks del eje Y
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

// ✅ ANCHO DINÁMICO DE BARRAS
const barWidth = computed(() => {
  const activeCount = Object.values(activeFilters.value).filter(v => v !== false).length
  if (activeCount === 0) return 40
  
  // Calcular ancho basado en el número de años y barras activas
  const totalYears = props.data?.length || 5
  const totalBars = totalYears * activeCount
  
  // Ancho base que se ajusta según la cantidad de barras
  const baseWidth = 50
  const minWidth = 25
  const maxWidth = 80
  
  // Fórmula que reduce el ancho cuando hay más barras
  const calculatedWidth = baseWidth / Math.sqrt(activeCount * 0.8)
  
  return Math.max(minWidth, Math.min(maxWidth, calculatedWidth))
})

// Toggle filtro
const toggleFilter = (key) => {
  activeFilters.value[key] = !activeFilters.value[key]
}

// Formatear moneda
const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  overflow: visible; /* ✅ Permite que los tooltips se vean fuera */
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.chart-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.filters-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 2px solid;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  transform: scale(1.05);
}

.filter-btn.inactive {
  opacity: 0.4;
  background: #f5f5f5;
}

.filter-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

/* ✅ ÁREA DEL GRÁFICO */
.chart-area {
  flex: 1;
  display: flex;
  position: relative;
  min-height: 0; /* Permite que flex: 1 funcione correctamente */
  width: 100%; /* ✅ Ocupa todo el ancho disponible */
  overflow: visible; /* ✅ Permite que los tooltips se vean fuera del contenedor */
}

/* ✅ EJE Y */
.y-axis {
  width: 60px;
  position: relative;
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
}

.y-tick {
  position: absolute;
  right: 0;
  width: 100%;
  display: flex;
  align-items: center;
  transition: bottom 0.6s cubic-bezier(0.4, 0, 0.2, 1); /* ✅ Animación del eje */
}

.tick-label {
  font-size: 10px;
  color: #666;
  text-align: right;
  width: 50px;
  padding-right: 8px;
}

.tick-line {
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  position: absolute;
  right: 0;
}

/* ✅ CONTENEDOR DE BARRAS */
.bars-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 12px; /* ✅ Gap reducido para mejor distribución */
  padding: 0 16px 30px 16px;
  overflow-x: auto; /* ✅ Scroll horizontal si es necesario */
  overflow-y: visible; /* ✅ Permite que los tooltips se vean arriba */
  position: relative;
  min-width: 0; /* ✅ Permite que el contenedor se ajuste sin desbordarse */
  width: 100%; /* ✅ Ocupa todo el ancho disponible */
}

/* ✅ GRUPO DE AÑO */
.year-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  flex: 1; /* ✅ Cada año ocupa espacio igual */
  min-width: 0; /* ✅ Permite que se comprima si es necesario */
  justify-content: flex-end;
}

/* ✅ WRAPPER DE BARRAS - CRÍTICO */
.bars-wrapper {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  justify-content: center; /* ✅ Centra las barras horizontalmente */
  flex: 1; /* Ocupa todo el espacio disponible */
  min-height: 0; /* Permite calcular alturas correctamente */
  min-width: 0; /* ✅ Evita desbordamiento */
  position: relative;
}

/* ✅ ITEM DE BARRA */
.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  transition: opacity 0.3s ease;
  position: relative; /* ✅ Contexto para posicionamiento del tooltip */
  overflow: visible; /* ✅ Permite que el tooltip se salga */
}

/* ✅ BARRA CON ANIMACIÓN */
.bar {
  min-height: 2px; /* Siempre visible */
  border-radius: 4px 4px 0 0;
  position: relative;
  cursor: pointer;
  transition: 
    height 0.6s cubic-bezier(0.4, 0, 0.2, 1), /* ✅ Animación suave de altura */
    width 0.3s ease, /* ✅ Animación de ancho */
    opacity 0.3s ease,
    transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar:hover {
  opacity: 0.8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Tooltip con position: fixed (fuera del flujo) */
.tooltip-fixed {
  position: fixed;
  transform: translate(-50%, -100%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 99999; /* ✅ Por encima de todo en el documento */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: left 0.1s ease, top 0.1s ease;
}

.tooltip-fixed::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-value {
  font-size: 13px;
  font-weight: bold;
  color: #4CAF50;
}

.tooltip-year {
  font-size: 10px;
  color: #bbb;
  margin-top: 2px;
}

.year-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
  text-align: center;
  flex-shrink: 0;
  height: 20px;
  line-height: 20px;
}

/* Leyenda */
.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
</style>