<!-- HorizontalRankingChart.vue - Con colores dinámicos por variable y filtro de leyenda -->
<!-- ✅ ACTUALIZADO: Soporte para filtro de leyenda desde el mapa -->
<!-- ✅ ACTUALIZADO: Valores 0 se muestran en gris con "Sin datos" -->
<template>
  <div class="horizontal-bar-chart" :style="{ width: width, height: height }">
    <!-- Título -->
    <div v-if="title" class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
    </div>

    <!-- Contenedor principal -->
    <div class="chart-content">
      <!-- Contenedor de barras con labels -->
      <div class="bars-container" :class="{ 'has-hover': hoveredBarKey !== null || selectedState !== null }">
        <div 
          v-for="variable in activeVariables" 
          :key="variable.key"
          class="bar-row"
          :class="{ 
            'is-hovered': hoveredBarKey === variable.key && !legendFilter,
            'is-selected': isSelected(variable) && !legendFilter,
            'is-dimmed': !legendFilter && ((hoveredBarKey !== null && hoveredBarKey !== variable.key && !isSelected(variable)) || 
                         (selectedState !== null && isSelectionActive && !isSelected(variable) && hoveredBarKey === null)),
            'is-legend-highlighted': legendFilter && barMatchesLegendFilter(variable),
            'is-legend-dimmed': legendFilter && !barMatchesLegendFilter(variable),
            'is-no-data': isNoData(variable.value)
          }"
          @mouseenter="handleMouseEnter(variable, $event)"
          @mousemove="handleMouseMove($event)"
          @mouseleave="handleMouseLeave"
        >
          <!-- Label del estado (izquierda) -->
          <div class="state-label" :class="{ 
            'selected-label': isSelected(variable) && !legendFilter,
            'legend-highlighted-label': legendFilter && barMatchesLegendFilter(variable)
          }">
            {{ variable.label }}
          </div>
          
          <!-- Contenedor de barra con grid -->
          <div class="bar-chart-area">
            <!-- Grid lines (fondo) -->
            <div class="grid-lines">
              <div 
                v-for="tick in xAxisTicks" 
                :key="tick.value"
                class="grid-line"
                :style="{ left: tick.position + '%' }"
              ></div>
            </div>
            
            <!-- Barra -->
            <div class="bar-wrapper-horizontal">
              <!-- Barra con valor (solo si hay datos) -->
              <div 
                v-if="!isNoData(variable.value)"
                class="bar-horizontal"
                :class="[
                  variable.colorClass, 
                  { 
                    'selected-bar': isSelected(variable) && !legendFilter,
                    'legend-highlighted-bar': legendFilter && barMatchesLegendFilter(variable)
                  }
                ]"
                :style="{ 
                  width: getBarWidth(variable.value) + '%',
                  background: variable.color
                }"
              >
                <span class="bar-value">
                  {{ formatValue(variable.value) }}
                </span>
              </div>
              
              <!-- Texto "Sin datos" cuando no hay datos -->
              <span v-else class="no-data-text">
                Sin datos
              </span>
            </div>

            <!-- ✅ Indicador flotante debajo de la barra -->
            <transition name="floating-indicator">
              <span 
                v-if="isSelected(variable) && !legendFilter && !isNoData(variable.value)" 
                class="floating-classification"
                :style="{ 
                  color: variable.color,
                  textShadow: `0 0 8px ${variable.color}60`
                }"
              >
                {{ variable.classification }}
              </span>
            </transition>
          </div>
        </div>

        <div v-if="activeVariables.length === 0" class="empty-state">
          <p>{{ emptyMessage }}</p>
        </div>
      </div>

      <!-- ✅ LEYENDA DE COLORES AL FONDO (7 CATEGORÍAS) -->
      <div class="color-legend-strip">
        <div class="legend-spacer"></div>
        <div class="legend-bar-container">
          <div class="legend-items">
            <div 
              v-for="(item, index) in legendItems" 
              :key="index"
              class="legend-item"
              :style="{ flex: item.flex || 1 }"
            >
              <div 
                class="legend-color-block" 
                :style="{ backgroundColor: item.color }"
              >
                <!-- ✅ Indicador dentro del bloque de color -->
                <span class="legend-indicator">{{ item.label }}</span>
              </div>
              <span class="legend-range-value">{{ item.range }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip (para hover, no para selección) -->
    <Teleport to="body">
      <div v-if="tooltip.visible && !isTooltipForSelectedState && !legendFilter" class="tooltip" :style="tooltipStyle">
        <div class="tooltip-content">
          <div class="tooltip-color" :style="{ backgroundColor: tooltip.color }"></div>
          <div class="tooltip-info">
            <div class="tooltip-label">{{ tooltip.label }}</div>
              <div class="tooltip-value">
                {{ tooltip.isNoData ? 'Sin datos disponibles' : `${currentVariableKey || 'IFSS'}: ${formatValue(tooltip.value)}` }}
              </div>
            <div class="tooltip-classification">{{ tooltip.classification }}</div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  variables: { type: Array, required: true, default: () => [] },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' },
  title: { type: String, default: '' },
  showFilters: { type: Boolean, default: false },
  emptyMessage: { type: String, default: 'No hay datos para visualizar' },
  animationDelay: { type: Number, default: 800 },
  showAllBars: { type: Boolean, default: false },
  initialBarsCount: { type: Number, default: 4 },
  valueFormatter: { type: Function, default: null },
  selectedState: { type: String, default: null },
  // Variable seleccionada para determinar rangos de color
  selectedVariable: { 
    type: [Object, String, null], 
    default: null 
  },
  // ✅ NUEVO: Filtro de leyenda desde el mapa
  legendFilter: {
    type: Object,
    default: null
  }
})

const hoveredBarKey = ref(null)
const tooltip = ref({ visible: false, x: 0, y: 0, label: '', value: '', color: '', classification: '', isNoData: false })
const internalVariables = ref([])
const isAnimated = ref(false)
const isSelectionActive = ref(true)

// ============================================================================
// ✅ NUEVO: Función para detectar si un valor es "sin datos"
// ============================================================================
const isNoData = (value) => {
  if (value === null || value === undefined || value === '') return true
  
  const numValue = parseFloat(value)
  return isNaN(numValue) || numValue === 0
}

// Obtener la key de la variable actual
const currentVariableKey = computed(() => {
  if (!props.selectedVariable) return null
  if (typeof props.selectedVariable === 'string') return props.selectedVariable
  return props.selectedVariable?.key || null
})

// Verificar si el tooltip es para el estado seleccionado (para no mostrarlo)
const isTooltipForSelectedState = computed(() => {
  if (!props.selectedState || !tooltip.value.label) return false
  return tooltip.value.label === props.selectedState
})

// ============================================================================
// COLORES BASE (7 categorías)
// ============================================================================
const COLORS = {
  VERDE_FUERTE: '#22c55e',
  VERDE: '#94d351',
  VERDE_BAJO: '#bddc50',
  AMARILLO: '#facc15',
  ANARANJADO: '#e6a74c',
  ROJO: '#ef4444',
  ROJO_FUERTE: '#dc2626',
  GRIS: '#9ca3af'  // ✅ Color para "sin datos"
}

// ============================================================================
// RANGOS DE COLORES POR VARIABLE (7 categorías cada una)
// ============================================================================

/**
 * IFSS - Índice de Finanzas Sostenibles Subnacional
 */
const getIFSSColor = (value) => {
  const numValue = parseFloat(value) || 0
  
  // ✅ Sin datos
  if (isNoData(value)) return { color: COLORS.GRIS, label: 'Sin datos' }
  
  if (numValue >= 3.5) return { color: COLORS.VERDE_FUERTE, label: 'Muy Alto' }
  if (numValue >= 2.9) return { color: COLORS.VERDE, label: 'Alto' }
  if (numValue >= 2.3) return { color: COLORS.VERDE_BAJO, label: 'Medio Alto' }
  if (numValue >= 1.8) return { color: COLORS.AMARILLO, label: 'Medio' }
  if (numValue >= 1.2) return { color: COLORS.ANARANJADO, label: 'Medio Bajo' }
  if (numValue >= 0.6) return { color: COLORS.ROJO, label: 'Bajo' }
  return { color: COLORS.ROJO_FUERTE, label: 'Muy Bajo' }
}

/**
 * IS - Ingresos Sostenibles
 */
const getISColor = (value) => {
  const numValue = parseFloat(value) || 0
  
  // ✅ Sin datos
  if (isNoData(value)) return { color: COLORS.GRIS, label: 'Sin datos' }
  
  if (numValue > 5.5) return { color: COLORS.VERDE_FUERTE, label: 'Muy Alto' }
  if (numValue >= 4.10) return { color: COLORS.VERDE, label: 'Alto' }
  if (numValue >= 2.51) return { color: COLORS.VERDE_BAJO, label: 'Medio Alto' }
  if (numValue >= 1.10) return { color: COLORS.AMARILLO, label: 'Medio' }
  if (numValue >= 0.51) return { color: COLORS.ANARANJADO, label: 'Medio Bajo' }
  if (numValue >= 0.10) return { color: COLORS.ROJO, label: 'Bajo' }
  return { color: COLORS.ROJO_FUERTE, label: 'Muy Bajo' }
}

/**
 * IIC - Ingresos Intensivos en Carbono (INVERTIDO)
 */
const getIICColor = (value) => {
  const numValue = parseFloat(value) || 0
  
  // ✅ Sin datos
  if (isNoData(value)) return { color: COLORS.GRIS, label: 'Sin datos' }
  
  if (numValue > 10.0) return { color: COLORS.ROJO_FUERTE, label: 'Muy Alto' }
  if (numValue >= 8.1) return { color: COLORS.ROJO, label: 'Alto' }
  if (numValue >= 6.1) return { color: COLORS.ANARANJADO, label: 'Medio Alto' }
  if (numValue >= 4.1) return { color: COLORS.AMARILLO, label: 'Medio' }
  if (numValue >= 2.1) return { color: COLORS.VERDE_BAJO, label: 'Medio Bajo' }
  if (numValue >= 0.1) return { color: COLORS.VERDE, label: 'Bajo' }
  return { color: COLORS.VERDE_FUERTE, label: 'Muy Bajo' }
}

/**
 * PS - Presupuestos Sostenibles
 */
const getPSColor = (value) => {
  const numValue = parseFloat(value) || 0
  
  // ✅ Sin datos
  if (isNoData(value)) return { color: COLORS.GRIS, label: 'Sin datos' }
  
  if (numValue > 5.5) return { color: COLORS.VERDE_FUERTE, label: 'Muy Alto' }
  if (numValue >= 4.10) return { color: COLORS.VERDE, label: 'Alto' }
  if (numValue >= 2.51) return { color: COLORS.VERDE_BAJO, label: 'Medio Alto' }
  if (numValue >= 1.10) return { color: COLORS.AMARILLO, label: 'Medio' }
  if (numValue >= 0.51) return { color: COLORS.ANARANJADO, label: 'Medio Bajo' }
  if (numValue >= 0.10) return { color: COLORS.ROJO, label: 'Bajo' }
  return { color: COLORS.ROJO_FUERTE, label: 'Muy Bajo' }
}

/**
 * PIC - Presupuestos Intensivos en Carbono (INVERTIDO)
 */
const getPICColor = (value) => {
  const numValue = parseFloat(value) || 0
  
  // ✅ Sin datos
  if (isNoData(value)) return { color: COLORS.GRIS, label: 'Sin datos' }
  
  if (numValue > 10.0) return { color: COLORS.ROJO_FUERTE, label: 'Muy Alto' }
  if (numValue >= 8.10) return { color: COLORS.ROJO, label: 'Alto' }
  if (numValue >= 6.10) return { color: COLORS.ANARANJADO, label: 'Medio Alto' }
  if (numValue >= 4.10) return { color: COLORS.AMARILLO, label: 'Medio' }
  if (numValue >= 2.10) return { color: COLORS.VERDE_BAJO, label: 'Medio Bajo' }
  if (numValue >= 0.10) return { color: COLORS.VERDE, label: 'Bajo' }
  return { color: COLORS.VERDE_FUERTE, label: 'Muy Bajo' }
}

// ============================================================================
// FUNCIÓN PRINCIPAL: Obtener color según variable seleccionada
// ============================================================================

const getColorByVariable = (value) => {
  // ✅ Verificar primero si es sin datos
  if (isNoData(value)) {
    return { color: COLORS.GRIS, label: 'Sin datos' }
  }
  
  const variableKey = currentVariableKey.value
  
  switch (variableKey) {
    case 'IS':
      return getISColor(value)
    case 'IIC':
      return getIICColor(value)
    case 'PS':
      return getPSColor(value)
    case 'PIC':
      return getPICColor(value)
    case 'IFSS':
    default:
      return getIFSSColor(value)
  }
}

// ============================================================================
// ✅ NUEVO: Funciones para filtro de leyenda
// ============================================================================

/**
 * Obtener el nivel de clasificación de un valor (para IFSS por defecto)
 */
const getValueLevel = (value) => {
  // ✅ Sin datos no tiene nivel
  if (isNoData(value)) return 'sin-datos'
  
  const numValue = parseFloat(value) || 0
  
  // Usar los rangos según la variable seleccionada
  const variableKey = currentVariableKey.value
  
  if (variableKey === 'IS' || variableKey === 'PS') {
    if (numValue > 5.5) return 'muy-alto'
    if (numValue >= 4.10) return 'alto'
    if (numValue >= 2.51) return 'medio-alto'
    if (numValue >= 1.10) return 'medio'
    if (numValue >= 0.51) return 'medio-bajo'
    if (numValue >= 0.10) return 'bajo'
    return 'muy-bajo'
  }
  
  if (variableKey === 'IIC' || variableKey === 'PIC') {
    // Invertido
    if (numValue > 10.0) return 'muy-alto'
    if (numValue >= 8.1) return 'alto'
    if (numValue >= 6.1) return 'medio-alto'
    if (numValue >= 4.1) return 'medio'
    if (numValue >= 2.1) return 'medio-bajo'
    if (numValue >= 0.1) return 'bajo'
    return 'muy-bajo'
  }
  
  // IFSS por defecto
  if (numValue >= 3.5) return 'muy-alto'
  if (numValue >= 2.9) return 'alto'
  if (numValue >= 2.3) return 'medio-alto'
  if (numValue >= 1.8) return 'medio'
  if (numValue >= 1.2) return 'medio-bajo'
  if (numValue >= 0.6) return 'bajo'
  return 'muy-bajo'
}

/**
 * Verificar si una barra coincide con el filtro de leyenda activo
 */
const barMatchesLegendFilter = (variable) => {
  if (!props.legendFilter) return true
  
  // ✅ NUEVO: Si el filtro contiene una lista de estados, filtrar por nombre
  if (props.legendFilter.states && Array.isArray(props.legendFilter.states)) {
    // variable.label contiene el nombre del estado (ej: "Jalisco", "CDMX")
    // variable.key también puede contener el nombre
    return props.legendFilter.states.includes(variable.label) || 
           props.legendFilter.states.includes(variable.key)
  }
  
  // Fallback: filtrar por nivel (compatibilidad con código anterior)
  return getValueLevel(variable.value) === props.legendFilter.level
}

// ============================================================================
// LEYENDA DE COLORES DINÁMICA CON 7 CATEGORÍAS
// ============================================================================

const legendItems = computed(() => {
  const variableKey = currentVariableKey.value
  
  switch (variableKey) {
    case 'IS':
      return [
        { color: COLORS.VERDE_FUERTE, range: '>5.5', label: 'Muy Alto' },
        { color: COLORS.VERDE, range: '4.1-5.5', label: 'Alto' },
        { color: COLORS.VERDE_BAJO, range: '2.5-4.0', label: 'M. Alto' },
        { color: COLORS.AMARILLO, range: '1.1-2.5', label: 'Medio' },
        { color: COLORS.ANARANJADO, range: '0.5-1.0', label: 'M. Bajo' },
        { color: COLORS.ROJO, range: '0.1-0.5', label: 'Bajo' },
        { color: COLORS.ROJO_FUERTE, range: '<0.1', label: 'Muy Bajo' }
      ]
    case 'IIC':
      return [
        { color: COLORS.VERDE_FUERTE, range: '<0.1', label: 'Muy Bajo' },
        { color: COLORS.VERDE, range: '0.1-2.0', label: 'Bajo' },
        { color: COLORS.VERDE_BAJO, range: '2.1-4.0', label: 'M. Bajo' },
        { color: COLORS.AMARILLO, range: '4.1-6.0', label: 'Medio' },
        { color: COLORS.ANARANJADO, range: '6.1-8.0', label: 'M. Alto' },
        { color: COLORS.ROJO, range: '8.1-10', label: 'Alto' },
        { color: COLORS.ROJO_FUERTE, range: '>10', label: 'Muy Alto' }
      ]
    case 'PS':
      return [
        { color: COLORS.VERDE_FUERTE, range: '>5.5', label: 'Muy Alto' },
        { color: COLORS.VERDE, range: '4.1-5.5', label: 'Alto' },
        { color: COLORS.VERDE_BAJO, range: '2.5-4.0', label: 'M. Alto' },
        { color: COLORS.AMARILLO, range: '1.1-2.5', label: 'Medio' },
        { color: COLORS.ANARANJADO, range: '0.5-1.0', label: 'M. Bajo' },
        { color: COLORS.ROJO, range: '0.1-0.5', label: 'Bajo' },
        { color: COLORS.ROJO_FUERTE, range: '<0.1', label: 'Muy Bajo' }
      ]
    case 'PIC':
      return [
        { color: COLORS.VERDE_FUERTE, range: '<0.1', label: 'Muy Bajo' },
        { color: COLORS.VERDE, range: '0.1-2.0', label: 'Bajo' },
        { color: COLORS.VERDE_BAJO, range: '2.1-4.0', label: 'M. Bajo' },
        { color: COLORS.AMARILLO, range: '4.1-6.0', label: 'Medio' },
        { color: COLORS.ANARANJADO, range: '6.1-8.0', label: 'M. Alto' },
        { color: COLORS.ROJO, range: '8.1-10', label: 'Alto' },
        { color: COLORS.ROJO_FUERTE, range: '>10', label: 'Muy Alto' }
      ]
    case 'IFSS':
    default:
      return [
        { color: COLORS.VERDE_FUERTE, range: '3.5-4.0', label: 'Muy Alto' },
        { color: COLORS.VERDE, range: '2.9-3.4', label: 'Alto' },
        { color: COLORS.VERDE_BAJO, range: '2.3-2.8', label: 'M. Alto' },
        { color: COLORS.AMARILLO, range: '1.8-2.2', label: 'Medio' },
        { color: COLORS.ANARANJADO, range: '1.2-1.7', label: 'M. Bajo' },
        { color: COLORS.ROJO, range: '0.6-1.1', label: 'Bajo' },
        { color: COLORS.ROJO_FUERTE, range: '0.0-0.5', label: 'Muy Bajo' }
      ]
  }
})

// ============================================================================
// INICIALIZACIÓN Y LÓGICA DE BARRAS
// ============================================================================

const initializeVariables = () => {
  console.log('🎨 [HorizontalRankingChart] Inicializando con variable:', currentVariableKey.value)
  
  internalVariables.value = props.variables.map(v => {
    const colorInfo = getColorByVariable(v.value)
    return {
      key: v.key,
      label: v.label || v.key,
      value: v.value || 0,
      colorClass: v.colorClass || 'default',
      color: colorInfo.color,
      classification: colorInfo.label,
      active: true
    }
  })
}

// Watch para actualizar colores cuando cambia la variable seleccionada
watch(() => props.selectedVariable, (newVar, oldVar) => {
  console.log('🔄 [HorizontalRankingChart] Variable cambió de', oldVar, 'a', newVar)
  
  if (props.selectedState) {
    isSelectionActive.value = false
  }
  
  isAnimated.value = false
  
  internalVariables.value = internalVariables.value.map(v => {
    const colorInfo = getColorByVariable(v.value)
    return {
      ...v,
      color: colorInfo.color,
      classification: colorInfo.label
    }
  })
  
  requestAnimationFrame(() => {
    setTimeout(() => {
      isAnimated.value = true
      
      if (props.selectedState) {
        setTimeout(() => {
          isSelectionActive.value = true
        }, 850)
      }
    }, 50)
  })
}, { deep: true })

watch(() => props.variables, () => {
  if (props.selectedState) {
    isSelectionActive.value = false
  }
  
  isAnimated.value = false
  initializeVariables()
  
  requestAnimationFrame(() => {
    setTimeout(() => {
      isAnimated.value = true
      
      if (props.selectedState) {
        setTimeout(() => {
          isSelectionActive.value = true
        }, 850)
      }
    }, 50)
  })
}, { immediate: true, deep: true })

onMounted(() => {
  initializeVariables()
  
  if (props.selectedState) {
    isSelectionActive.value = false
  }
  
  requestAnimationFrame(() => {
    setTimeout(() => {
      isAnimated.value = true
      
      if (props.selectedState) {
        setTimeout(() => {
          isSelectionActive.value = true
        }, 850)
      }
    }, 50)
  })
})

const activeVariables = computed(() => {
  const count = props.showAllBars 
    ? internalVariables.value.length 
    : Math.min(props.initialBarsCount, internalVariables.value.length)
  return internalVariables.value.slice(0, count)
})

const isSelected = (variable) => {
  if (!props.selectedState) return false
  if (!isSelectionActive.value) return false
  return variable.label === props.selectedState || variable.key === props.selectedState
}

const dynamicBarHeight = computed(() => {
  const count = activeVariables.value.length
  if (count === 0) return '100%'
  
  const titleHeight = 30
  const legendHeight = 40
  const gapSize = 3
  const totalGaps = (count - 1) * gapSize
  
  return `calc((100% - ${titleHeight}px - ${legendHeight}px - ${totalGaps}px) / ${count})`
})

const maxValue = computed(() => {
  const values = activeVariables.value.map(v => v.value)
  return Math.max(...values, 1)
})

const xAxisTicks = computed(() => {
  const max = maxValue.value
  const step = max / 5
  
  const ticks = []
  for (let i = 0; i <= 5; i++) {
    const value = (step * i)
    const position = (value / max) * 100
    
    ticks.push({
      value: value,
      label: value.toFixed(1),
      position: position
    })
  }
  
  return ticks
})

const tooltipStyle = computed(() => {
  return {
    left: `${tooltip.value.x + 15}px`,
    top: `${tooltip.value.y - 60}px`
  }
})

const handleMouseEnter = (variable, event) => {
  hoveredBarKey.value = variable.key
  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    label: variable.label,
    value: variable.value,
    color: variable.color,
    classification: variable.classification,
    isNoData: isNoData(variable.value)  // ✅ Agregar flag para tooltip
  }
}

const handleMouseMove = (event) => {
  if (tooltip.value.visible) {
    tooltip.value.x = event.clientX
    tooltip.value.y = event.clientY
  }
}

const handleMouseLeave = () => {
  hoveredBarKey.value = null
  tooltip.value.visible = false
}

const getBarWidth = (value) => {
  if (!isAnimated.value) return 0
  
  // ✅ Sin datos = sin barra
  if (isNoData(value)) {
    return 0
  }
  
  const numValue = parseFloat(value) || 0
  const minWidth = 5  // Ancho mínimo absoluto
  
  // Escala con offset para mejor diferenciación en valores pequeños
  const percentage = (numValue / maxValue.value) * 100
  
  // Agregar un "boost" base + el porcentaje real
  // Así valores pequeños empiezan en minWidth y crecen proporcionalmente
  const boostedWidth = minWidth + (percentage * 0.9)
  
  return Math.min(boostedWidth, 100)
}


const formatValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  if (typeof value === 'number') {
    const variableKey = props.selectedVariable?.key
    
    // Si es una variable específica (IS, IIC, PS, PIC), 3 decimales + '%'
    if (variableKey === 'IS' || variableKey === 'IIC' || variableKey === 'PS' || variableKey === 'PIC') {
      const truncated = Math.trunc(value * 1000) / 1000
      return truncated.toFixed(3) + '%'
    }
    
    // Todas las variables (IFSS): 2 decimales
    const truncated = Math.trunc(value * 100) / 100
    return truncated.toFixed(2)
  }
  return value
}
</script>

<style scoped>
.horizontal-bar-chart {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
}

.chart-header {
  margin-bottom: 8px;
  text-align: center;
  flex-shrink: 0;
  height: 22px;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 300;
  color: #2c3e50;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chart-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.bars-container {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  width: 100%;
  overflow: hidden;
  min-height: 0;
}

.bar-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  align-items: center;
  height: v-bind(dynamicBarHeight);
  min-height: 12px;
  flex-shrink: 0;
  padding: 0;
  transition: opacity 0.4s ease, filter 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.bar-row.is-hovered {
  opacity: 1;
  transform: scale(1.02);
  z-index: 10;
}

.bar-row.is-selected {
  opacity: 1;
  transform: translateX(2px);
  z-index: 100;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
  min-height: 14px;
}

.bar-row.is-dimmed {
  opacity: 0.15;
  filter: grayscale(40%);
}

/* ============================================================================
   ✅ ESTILOS PARA "SIN DATOS"
   ============================================================================ */

.bar-row.is-no-data {
  opacity: 0.7;
}

.bar-row.is-no-data:hover {
  opacity: 0.85;
}

.no-data-text {
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
}

.floating-classification.no-data-classification {
  color: #6b7280 !important;
  text-shadow: none !important;
}

/* ============================================================================
   ✅ NUEVOS ESTILOS: Filtro de leyenda
   ============================================================================ */

.bar-row.is-legend-highlighted {
  opacity: 1;
  filter: none;
  transform: scale(1.01);
  z-index: 5;
}

.bar-row.is-legend-highlighted .bar-horizontal {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.bar-row.is-legend-dimmed {
  opacity: 0.2;
  filter: grayscale(50%);
}

.bar-row.is-legend-dimmed:hover {
  opacity: 0.4;
  filter: grayscale(25%);
}

.state-label.legend-highlighted-label {
  font-weight: 200;
  color: #1a202c;
}

.bar-horizontal.legend-highlighted-bar {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.494);
}

.bar-row.is-legend-highlighted .bar-value{
  color: white;
  font-size: 13px; 
  font-weight: 700;
}

/* ============================================================================ */

.state-label {
  font-size: 14px;
  font-weight: 100;
  color: #374151;
  text-align: right;
  padding-right: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.2;
  transition: all 0.3s ease;
}

.state-label.selected-label {
  font-weight: 200;
  color: #1a202c;
  font-size: 16px;
}

.bar-chart-area {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 12px;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #e5e7eb;
}

.bar-wrapper-horizontal {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  overflow: visible;
  border-radius: 4px;
  min-height: 12px;
}

.bar-row.is-selected .bar-wrapper-horizontal {
  background: transparent;
  box-shadow: none;
  border: none;
}

.bar-horizontal {
  height: 100%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  padding-left: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  min-width: 36px;
  box-sizing: border-box;
  padding-left: 60px; 
}

.bar-row.is-hovered .bar-horizontal {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.bar-horizontal.selected-bar {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }
  50% {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35), 0 0 0 3px rgba(255, 255, 255, 0.3);
  }
}

.bar-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.floating-classification {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  box-shadow: 200px #050709;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.floating-indicator-enter-active {
  animation: indicatorFadeIn 0.3s ease-out;
}

.floating-indicator-leave-active {
  animation: indicatorFadeOut 0.2s ease-in;
}

@keyframes indicatorFadeIn {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes indicatorFadeOut {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
}

/* ============================================================================
   LEYENDA DE COLORES AL FONDO (7 CATEGORÍAS)
   ============================================================================ */

.color-legend-strip {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  flex-shrink: 0;
  height: 40px;
  margin-top: 0px;
  padding-top: 0px;
  border-top: 1px solid #e5e7eb;
}

.legend-spacer {
  /* Espacio para alinear con los labels de estados */
}

.legend-bar-container {
  width: 100%;
  height: 100%;
}

.legend-items {
  display: flex;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.legend-color-block {
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.legend-item:first-child .legend-color-block {
  border-radius: 4px 0 0 4px;
}

.legend-item:last-child .legend-color-block {
  border-radius: 0 4px 4px 0;
}

.legend-indicator {
  font-size: 9px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 2px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.legend-range-value {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 200px;
  color: #9ca3af;
  font-size: 14px;
}

/* Tooltip para hover */
.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.92);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  z-index: 999999;
}

.tooltip-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tooltip-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.tooltip-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-label {
  font-weight: 600;
  font-size: 13px;
}

.tooltip-value {
  font-size: 12px;
  opacity: 0.95;
}

.tooltip-classification {
  font-size: 11px;
  opacity: 0.85;
  font-style: italic;
}

/* ============================================
   RESPONSIVE - Media Queries
   ============================================ */

@media (max-width: 768px) {
  .horizontal-bar-chart {
    padding: 6px;
    border-radius: 10px;
  }
  
  .chart-header {
    height: 20px;
    margin-bottom: 6px;
  }
  
  .chart-title {
    font-size: 14px;
  }
  
  .bars-container {
    gap: 2px;
  }
  
  .bar-row {
    grid-template-columns: 100px 1fr;
    gap: 8px;
    min-height: 10px;
  }
  
  .state-label {
    font-size: 11px;
    padding-right: 4px;
  }
  
  .state-label.selected-label {
    font-size: 12px;
  }
  
  .bar-chart-area {
    min-height: 10px;
  }
  
  .bar-wrapper-horizontal {
    min-height: 10px;
  }
  
  .bar-horizontal {
    min-width: 30px;
    padding-right: 4px;
    padding-left: 3px;
  }
  
  .bar-value {
    font-size: 9px;
  }
  
  .no-data-text {
    font-size: 10px;
    padding-left: 6px;
  }
  
  .floating-classification {
    font-size: 10px;
    top: calc(100% + 6px);
    letter-spacing: 0.4px;
  }
  
  .color-legend-strip {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-top: 5px;
    margin-top: 5px;
  }

  .legend-spacer {
    display: none;
  }
  
  .legend-color-block {
    height: 16px;
  }
  
  .legend-indicator {
    font-size: 7px;
    padding: 0 1px;
  }
  
  .legend-range-value {
    font-size: 9px;
  }
  
  .tooltip {
    display: none !important;
  }
}

@media (max-width: 480px) {
  .horizontal-bar-chart {
    padding: 5px;
    border-radius: 8px;
  }
  
  .chart-header {
    height: 18px;
    margin-bottom: 4px;
  }
  
  .chart-title {
    font-size: 12px;
  }
  
  .bars-container {
    gap: 1px;
  }
  
  .bar-row {
    grid-template-columns: 70px 1fr;
    gap: 6px;
    min-height: 8px;
  }
  
  .state-label {
    font-size: 9px;
    padding-right: 3px;
  }
  
  .state-label.selected-label {
    font-size: 10px;
  }
  
  .bar-chart-area {
    min-height: 8px;
  }
  
  .bar-wrapper-horizontal {
    min-height: 8px;
    border-radius: 3px;
  }
  
  .bar-horizontal {
    min-width: 24px;
    padding-right: 3px;
    padding-left: 2px;
    border-radius: 3px;
  }
  
  .bar-value {
    font-size: 8px;
  }
  
  .no-data-text {
    font-size: 9px;
    padding-left: 4px;
  }
  
  .floating-classification {
    font-size: 8px;
    top: calc(100% + 4px);
    letter-spacing: 0.3px;
  }
  
  .color-legend-strip {
    grid-template-columns: 70px 1fr;
    gap: 6px;
    height: 32px;
  }
  
  .legend-color-block {
    height: 14px;
  }
  
  .legend-indicator {
    font-size: 5px;
    padding: 0 1px;
    letter-spacing: 0;
  }
  
  .legend-range-value {
    font-size: 7px;
    margin-top: 1px;
  }
  
  .grid-line {
    background: #f0f0f0;
  }
  
  .empty-state {
    min-height: 150px;
    font-size: 12px;
  }
}

@media (max-width: 768px) and (orientation: landscape) {
  .horizontal-bar-chart {
    padding: 4px;
  }
  
  .chart-header {
    height: 16px;
    margin-bottom: 4px;
  }
  
  .chart-title {
    font-size: 11px;
  }
  
  .bar-row {
    grid-template-columns: 80px 1fr;
    gap: 6px;
    min-height: 6px;
  }
  
  .state-label {
    font-size: 9px;
  }
  
  .bar-value {
    font-size: 8px;
  }
  
  .color-legend-strip {
    grid-template-columns: 80px 1fr;
    height: 28px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  
  .legend-color-block {
    height: 12px;
  }
  
  .legend-indicator {
    font-size: 5px;
  }
  
  .legend-range-value {
    font-size: 6px;
  }
}
</style>