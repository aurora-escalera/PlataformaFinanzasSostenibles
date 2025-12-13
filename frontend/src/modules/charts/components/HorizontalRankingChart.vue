<!-- HorizontalRankingChart.vue - Con colores dinámicos por variable -->
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
            'is-hovered': hoveredBarKey === variable.key || isSelected(variable),
            'is-dimmed': (hoveredBarKey !== null && hoveredBarKey !== variable.key) || (selectedState !== null && !isSelected(variable))
          }"
          @mouseenter="handleMouseEnter(variable, $event)"
          @mousemove="handleMouseMove($event)"
          @mouseleave="handleMouseLeave"
        >
          <!-- Label del estado (izquierda) -->
          <div class="state-label">
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
              <div 
                class="bar-horizontal"
                :class="variable.colorClass"
                :style="{ 
                  width: getAnimatedWidth(variable) + '%',
                  background: variable.color
                }"
              >
                <!-- Valor dentro de la barra -->
                <span class="bar-value">{{ formatValue(variable.value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeVariables.length === 0" class="empty-state">
          <p>{{ emptyMessage }}</p>
        </div>
      </div>

      <!-- Eje X con valores -->
      <div class="x-axis">
        <div class="x-axis-spacer"></div>
        <div class="x-axis-labels">
          <div 
            v-for="tick in xAxisTicks" 
            :key="tick.value"
            class="x-axis-tick"
            :style="{ left: tick.position + '%' }"
          >
            <span class="tick-label">{{ tick.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <div v-if="tooltip.visible" class="tooltip" :style="tooltipStyle">
        <div class="tooltip-content">
          <div class="tooltip-color" :style="{ backgroundColor: tooltip.color }"></div>
          <div class="tooltip-info">
            <div class="tooltip-label">{{ tooltip.label }}</div>
            <div class="tooltip-value">{{ currentVariableKey || 'IFSS' }}: {{ formatValue(tooltip.value) }}</div>
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
  // ✅ NUEVO: Variable seleccionada para determinar rangos de color
  selectedVariable: { 
    type: [Object, String, null], 
    default: null 
  }
})

const hoveredBarKey = ref(null)
const tooltip = ref({ visible: false, x: 0, y: 0, label: '', value: '', color: '', classification: '' })
const internalVariables = ref([])
const animatedWidths = ref({})

// ✅ Obtener la key de la variable actual
const currentVariableKey = computed(() => {
  if (!props.selectedVariable) return null
  if (typeof props.selectedVariable === 'string') return props.selectedVariable
  return props.selectedVariable?.key || null
})

// ============================================================================
// RANGOS DE COLORES POR VARIABLE
// ============================================================================

/**
 * IFSS - Índice de Finanzas Sostenibles Subnacional
 * Muy Bajo <= 0.5 | 0.5 < Bajo < 1.5 | 1.5 <= Medio Bajo < 1.9 | 
 * 1.9 <= Medio < 2.3 | 2.3 <= Medio Alto < 4 | 4 <= Alto
 */
const getIFSSColor = (value) => {
  const numValue = parseFloat(value) || 0
  if (numValue >= 4) return { color: '#6ac952', label: 'Alto' }
  if (numValue >= 2.3) return { color: '#94d351', label: 'Medio Alto' }
  if (numValue >= 1.9) return { color: '#bddc50', label: 'Medio' }
  if (numValue >= 1.5) return { color: '#e6a74c', label: 'Medio Bajo' }
  if (numValue > 0.5) return { color: '#e67849', label: 'Bajo' }
  return { color: '#e52845', label: 'Muy Bajo' }
}

/**
 * IS - Ingresos Sostenibles (valores en porcentaje, mayor es mejor)
 * Muy Bajo < 0.11% | 0.11% <= Bajo < 0.51% | 0.51% <= Medio Bajo < 1.25% |
 * 1.25% <= Medio < 3.29% | 3.29% <= Medio Alto < 10% | 10% <= Alto
 */
const getISColor = (value) => {
  const numValue = parseFloat(value) || 0
  if (numValue >= 10) return { color: '#6ac952', label: 'Alto' }
  if (numValue >= 3.29) return { color: '#94d351', label: 'Medio Alto' }
  if (numValue >= 1.25) return { color: '#bddc50', label: 'Medio' }
  if (numValue >= 0.51) return { color: '#e6a74c', label: 'Medio Bajo' }
  if (numValue >= 0.11) return { color: '#e67849', label: 'Bajo' }
  return { color: '#e52845', label: 'Muy Bajo' }
}

/**
 * IIC - Ingresos Intensivos en Carbono (INVERTIDO: menor es mejor)
 * 0.49% <= Bajo < 2.1% | 2.1% <= Medio Bajo < 4.32% |
 * 4.32% <= Medio < 6.19% | 6.19% <= Medio Alto < 11.08% | >= 11.08% Muy Alto
 */
const getIICColor = (value) => {
  const numValue = parseFloat(value) || 0
  if (numValue < 2.1) return { color: '#6ac952', label: 'Bajo' }
  if (numValue < 4.32) return { color: '#94d351', label: 'Medio Bajo' }
  if (numValue < 6.19) return { color: '#bddc50', label: 'Medio' }
  if (numValue < 11.08) return { color: '#e6a74c', label: 'Medio Alto' }
  return { color: '#e52845', label: 'Muy Alto' }
}

/**
 * PS - Presupuestos Sostenibles (valores en porcentaje, mayor es mejor)
 * Muy Bajo <= 0.13% | 0.13% <= Bajo < 0.54% | 0.54% <= Medio Bajo < 1.50% |
 * 1.50% <= Medio < 4.59% | 4.59% <= Alto
 */
const getPSColor = (value) => {
  const numValue = parseFloat(value) || 0
  if (numValue >= 4.59) return { color: '#6ac952', label: 'Alto' }
  if (numValue >= 1.50) return { color: '#bddc50', label: 'Medio' }
  if (numValue >= 0.54) return { color: '#e6a74c', label: 'Medio Bajo' }
  if (numValue >= 0.13) return { color: '#e67849', label: 'Bajo' }
  return { color: '#e52845', label: 'Muy Bajo' }
}

/**
 * PIC - Presupuestos Intensivos en Carbono (INVERTIDO: menor es mejor)
 * < 0.11% Muy Bajo (verde alto) | 0.11% <= Bajo < 2.18% | 2.18% <= Medio Bajo < 4.13% |
 * 4.13% <= Medio < 6.22% | 6.22% <= Medio Alto < 15.53% | >= 15.53% Muy Alto (rojo)
 */
const getPICColor = (value) => {
  const numValue = parseFloat(value) || 0
  if (numValue < 0.11) return { color: '#6ac952', label: 'Muy Bajo' }
  if (numValue < 2.18) return { color: '#94d351', label: 'Bajo' }
  if (numValue < 4.13) return { color: '#f0d648', label: 'Medio Bajo' }
  if (numValue < 6.22) return { color: '#e6a74c', label: 'Medio' }
  if (numValue < 15.53) return { color: '#e67849', label: 'Medio Alto' }
  return { color: '#e52845', label: 'Muy Alto' }
}

// ============================================================================
// FUNCIÓN PRINCIPAL: Obtener color según variable seleccionada
// ============================================================================

const getColorByVariable = (value) => {
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
      // Por defecto usar rangos de IFSS
      return getIFSSColor(value)
  }
}

// ✅ Función wrapper para obtener solo el color
const getColorValue = (value) => {
  return getColorByVariable(value).color
}

// ✅ Función wrapper para obtener solo la clasificación
const getClassification = (value) => {
  return getColorByVariable(value).label
}

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
      active: false
    }
  })
  
  animatedWidths.value = {}
  props.variables.forEach(v => {
    animatedWidths.value[v.key] = 0
  })
}

const activateBarsWithAnimation = async () => {
  await new Promise(resolve => setTimeout(resolve, props.animationDelay))
  
  const count = props.showAllBars 
    ? internalVariables.value.length 
    : Math.min(props.initialBarsCount, internalVariables.value.length)
  
  for (let i = 0; i < count; i++) {
    internalVariables.value[i].active = true
    await new Promise(resolve => setTimeout(resolve, 50))
    const targetWidth = getBarWidth(internalVariables.value[i].value)
    animatedWidths.value[internalVariables.value[i].key] = targetWidth
    const delay = props.showAllBars && count > 10 ? 20 : 200
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

// ✅ Watch para actualizar colores cuando cambia la variable seleccionada
watch(() => props.selectedVariable, (newVar, oldVar) => {
  console.log('🔄 [HorizontalRankingChart] Variable cambió de', oldVar, 'a', newVar)
  // Recalcular colores para todas las barras
  internalVariables.value = internalVariables.value.map(v => {
    const colorInfo = getColorByVariable(v.value)
    return {
      ...v,
      color: colorInfo.color,
      classification: colorInfo.label
    }
  })
}, { deep: true })

watch(() => props.variables, () => {
  initializeVariables()
  activateBarsWithAnimation()
}, { immediate: true, deep: true })

onMounted(() => {
  activateBarsWithAnimation()
})

const activeVariables = computed(() => {
  return internalVariables.value.filter(v => v.active)
})

// Verificar si una barra está seleccionada
const isSelected = (variable) => {
  if (!props.selectedState) return false
  return variable.label === props.selectedState || variable.key === props.selectedState
}

// Cálculo dinámico de altura por barra
const dynamicBarHeight = computed(() => {
  const count = activeVariables.value.length
  if (count === 0) return '100%'
  
  const titleHeight = 30
  const xAxisHeight = 36
  const gapSize = 3
  const totalGaps = (count - 1) * gapSize
  
  return `calc((100% - ${titleHeight}px - ${xAxisHeight}px - ${totalGaps}px) / ${count})`
})

const maxValue = computed(() => {
  const values = activeVariables.value.map(v => v.value)
  return Math.max(...values, 1)
})

// Calcular ticks del eje X
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
    classification: variable.classification
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
  const percentage = (value / maxValue.value) * 100
  return Math.min(percentage, 100)
}

const getAnimatedWidth = (variable) => {
  return animatedWidths.value[variable.key] || 0
}

const formatValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  return typeof value === 'number' ? value.toFixed(2) : value
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
  font-size: 14px;
  font-weight: 600;
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
  transition: opacity 0.3s ease, transform 0.2s ease;
  cursor: pointer;
}

.bar-row.is-hovered {
  opacity: 1;
  transform: scale(1.02);
  z-index: 10;
}

.bar-row.is-dimmed {
  opacity: 0.2;
  transition: opacity 0.3s ease, filter 0.3s ease;
}

/* Label del estado */
.state-label {
  font-size: 13px;
  font-weight: 100;
  color: #374151;
  text-align: right;
  padding-right: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.2;
}

/* Área de la barra con grid */
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

.bar-horizontal {
  height: 100%;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
  position: relative;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.bar-row.is-hovered .bar-horizontal {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* Valor dentro de la barra */
.bar-value {
  font-size: 9px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

/* Eje X */
.x-axis {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 2px solid #e5e7eb;
  flex-shrink: 0;
  height: 28px;
}

.x-axis-spacer {
  /* Espacio para alinear con los labels */
}

.x-axis-labels {
  position: relative;
  height: 22px;
}

.x-axis-tick {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tick-label {
  font-size: 9px;
  font-weight: 500;
  color: #6b7280;
  margin-top: 3px;
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
</style>