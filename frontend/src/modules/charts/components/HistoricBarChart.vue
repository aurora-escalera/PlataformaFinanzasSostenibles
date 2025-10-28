<!-- src/modules/charts/components/HistoricBarChart.vue -->
<template>
  <div class="bar-chart-container">
    <!-- 1. TÍTULO -->
    <div class="chart-title-section">
      <h3 class="chart-title">{{ title }}</h3>
    </div>

    <!-- 2. FILTROS/VARIABLES CON CONTENEDOR (estilo LinearChart) -->
    <div v-if="showFilters" class="filters-wrapper">
      <div class="filters-section">
        <button
          v-for="variable in uniqueVariables"
          :key="variable.key"
          @click="toggleFilter(variable.key)"
          class="filter-btn"
          :class="{ 
            'filter-active': activeFilters[variable.key] !== false,
            'filter-inactive': activeFilters[variable.key] === false
          }"
        >
          {{ variable.label }}
        </button>
      </div>
    </div>

    <!-- 3. LEYENDA CON CÍRCULOS (puntos) -->
    <div v-if="showLegend" class="legend-section">
      <div 
        v-for="variable in uniqueVariables"
        :key="variable.key"
        class="legend-item"
      >
        <span class="legend-color-dot" :style="{ backgroundColor: variable.color }"></span>
        <span class="legend-label">{{ variable.label }}</span>
      </div>
    </div>

    <!-- 4. ÁREA DEL GRÁFICO -->
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
                    height: `${getBarHeight(variable.value)}px`,
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


    <!-- Tooltip Global con position: fixed (estilo LinearChart) -->
    <Teleport to="body">
      <div 
        v-if="hoveredBar"
        class="tooltip-container"
        :style="{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`
        }"
      >
        <div class="tooltip-header">
          <span class="tooltip-year-label">{{ hoveredBar.year }}</span>
        </div>
        <div class="tooltip-content">
          <div class="tooltip-item">
            <span class="tooltip-color-indicator" :style="{ backgroundColor: hoveredBar.variable.color }"></span>
            <span class="tooltip-variable-name">{{ hoveredBar.variable.label }}:</span>
            <span class="tooltip-variable-value">{{ formatCurrency(hoveredBar.variable.value) }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

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
const barsContainerRef = ref(null)
const barsContainerHeight = ref(200) // Altura por defecto

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
  return maxValue > 0 ? maxValue * 1 : 100
})

// ✅ CALCULAR ALTURA DE BARRA (en píxeles absolutos)
const getBarHeight = (value) => {
  if (maxVisibleValue.value === 0) return 0
  const percentage = (value / maxVisibleValue.value) * 100
  // Calcular píxeles basados en la altura del contenedor
  const heightInPixels = (barsContainerHeight.value * percentage) / 100
  return heightInPixels
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
  
  // Caso especial: 1 sola barra activa → barras muy anchas
  if (activeCount === 1) {
    return 92
  }
  
  // Caso especial: 2 barras activas → ancho reducido para buena separación
  if (activeCount === 2) {
    return 42 // ✅ Reducido de 42 a 32 para mejor separación
  }

  // Ancho base que se ajusta según la cantidad de barras
  const baseWidth = 50
  const minWidth = 30
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

// Actualizar altura del contenedor de barras
const updateBarsContainerHeight = () => {
  if (barsContainerRef.value) {
    const height = barsContainerRef.value.clientHeight - 30 // Restar padding-bottom
    if (height > 0) {
      barsContainerHeight.value = height
    }
  }
}

// Observar cambios de tamaño
onMounted(async () => {
  await nextTick()
  updateBarsContainerHeight()
  
  // Observer para cambios de tamaño
  if (barsContainerRef.value) {
    const resizeObserver = new ResizeObserver(() => {
      updateBarsContainerHeight()
    })
    resizeObserver.observe(barsContainerRef.value)
  }
})

// Actualizar cuando cambien los datos
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
  display: flex;
  flex-direction: column;
  align-items: center; /* ✅ Centra todos los elementos hijos */
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  overflow: visible; /* ✅ Permite que los tooltips se vean fuera */
}

/* 1. SECCIÓN DE TÍTULO */
.chart-title-section {
  margin-bottom: 12px;
  width: 100%;
  text-align: center; /* ✅ Título centrado */
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
  margin-bottom: 12px;
  display: flex;
  justify-content: center; /* ✅ Centra el contenido */
  width: 100%; /* ✅ Mismo ancho que legend-section */
}

.filters-section {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center; /* ✅ Centra los botones */
}

.filter-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.3s ease;
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

/* 3. SECCIÓN DE LEYENDA CON CÍRCULOS */
.legend-section {
  display: flex;
  justify-content: center; /* ✅ Centra horizontalmente */
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding-bottom: 12px;
  width: 100%; /* ✅ Ocupa todo el ancho */
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #666;
}

.legend-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%; /* ✅ Círculo en vez de cuadrado */
  flex-shrink: 0;
}

.legend-label {
  white-space: nowrap;
}

/* ✅ ÁREA DEL GRÁFICO */
.chart-area {
  flex: 1;
  display: flex;
  position: relative;
  min-height: 0; /* Permite que flex: 1 funcione correctamente */
  width: 100%; /* ✅ Ocupa todo el ancho disponible */
  overflow: visible; /* ✅ Permite que los tooltips se vean fuera del contenedor */
  align-self: stretch; /* ✅ Se estira horizontalmente */
}

/* ✅ EJE Y */
.y-axis {
  width: 60px;
  position: relative;
  flex-shrink: 0;
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
display: none; 
}

/* ✅ CONTENEDOR DE BARRAS */
.bars-container {
  flex: 1;
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  overflow-y: visible;
  position: relative;
  height: 100%; 
  z-index: 2;
}

/* ✅ GRUPO DE AÑO */
.year-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  height: 100%;
  justify-content: flex-end; /* ✅ Alinea al fondo */
}

/* ✅ WRAPPER DE BARRAS - CRÍTICO */
.bars-wrapper {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  justify-content: center;
  flex: 1;
  width: 100%; 
}

/* ✅ ITEM DE BARRA */
.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end; /* ✅ Justifica al final (abajo) */
  transition: opacity 0.3s ease;
  position: relative;
  overflow: visible;
  /* ✅ NO height: 100% - deja que la barra defina su altura */
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
  /* ✅ CRÍTICO: La altura se calcula como porcentaje del bars-wrapper */
}

.bar:hover {
  opacity: 0.8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Tooltip con estilo LinearChart */
.tooltip-container {
  position: fixed;
  transform: translate(-50%, calc(-100% - 15px)); /* Un poco más arriba de la barra */
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 99999;
  min-width: 150px;
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
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.tooltip-year-label {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
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

/* ✅ ETIQUETAS DE AÑOS DEBAJO DEL GRÁFICO */
.x-axis-labels-container {
  width: 100%;
  display: flex;
  height: 30px;
  flex-shrink: 0;
}

.x-axis-spacer {
  width: 60px; /* Mismo ancho que y-axis */
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
  left: 60px; /* Mismo ancho que y-axis */
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
</style>