<!-- src/modules/charts/components/VerticalBarChart.vue -->
<template>
  <div 
    class="vertical-bar-chart" 
    :style="{ 
      width: width, 
      height: height 
    }"
  >
    <!-- Título del componente -->
    <div v-if="title" class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
    </div>

    <!-- Filtros/Toggles para mostrar/ocultar variables (opcional) -->
    <div v-if="showFilters" class="variable-filters">
      <button 
        v-for="variable in internalVariables" 
        :key="variable.key"
        @click="toggleVariable(variable.key)"
        :class="['filter-btn', { 
          'active': variable.active,
          [variable.colorClass]: true 
        }]"
      >
        <span class="filter-dot" :style="{ backgroundColor: getBarColor(variable) }"></span>
        <span class="filter-label">{{ variable.label }}</span>
      </button>
    </div>

    <!-- Contenedor de barras verticales -->
    <div 
      class="bars-container"
      :class="[
        `bars-count-${activeVariables.length}`,
        { 'has-hover': hoveredBarKey !== null }
      ]"
    >
      <!-- Columna para cada variable activa -->
      <div 
        v-for="variable in activeVariables" 
        :key="variable.key"
        class="bar-column"
        :class="{ 
          'is-hovered': hoveredBarKey === variable.key,
          'is-dimmed': hoveredBarKey !== null && hoveredBarKey !== variable.key
        }"
        @mouseenter="handleMouseEnter(variable, $event)"
        @mousemove="handleMouseMove($event)"
        @mouseleave="handleMouseLeave"
      >
        <!-- Wrapper de la barra vertical -->
        <div class="bar-wrapper-vertical">
          <div 
            class="bar-vertical"
            :class="variable.colorClass"
            :style="{ 
              height: getAnimatedHeight(variable) + '%',
              background: getBarColor(variable)
            }"
          >
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay variables seleccionadas -->
      <div v-if="activeVariables.length === 0" class="empty-state">
        <p>{{ emptyMessage }}</p>
      </div>
    </div>

    <!-- ✅ Tooltip con Teleport -->
    <Teleport to="body">
      <div 
        v-if="tooltip.visible"
        class="tooltip"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          <div class="tooltip-color" :style="{ backgroundColor: tooltip.color }"></div>
          <div class="tooltip-info">
            <div class="tooltip-label">{{ tooltip.label }}</div>
            <div class="tooltip-value">{{ tooltip.value }}</div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  variables: {
    type: Array,
    required: true,
    default: () => []
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: 'auto'
  },
  title: {
    type: String,
    default: ''
  },
  showFilters: {
    type: Boolean,
    default: false
  },
  showLegend: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No hay datos para visualizar'
  },
  useGradients: {
    type: Boolean,
    default: true
  },
  showValues: {
    type: Boolean,
    default: true
  },
  showLabels: {
    type: Boolean,
    default: true
  },
  animationDelay: {
    type: Number,
    default: 800
  }
})

// ✅ Estado del hover
const hoveredBarKey = ref(null)

// ✅ Estado del tooltip
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  value: '',
  color: ''
})

// Copia interna de las variables para manejar el estado
const internalVariables = ref([])
const animatedHeights = ref({})

// ✅ Inicializar variables con TODAS inactivas y alturas en 0
const initializeVariables = () => {
  internalVariables.value = props.variables.map(v => ({
    key: v.key,
    label: v.label || v.key,
    value: v.value || 0,
    colorClass: v.colorClass || 'default',
    color: v.color || null,
    active: false
  }))
  
  // ✅ Inicializar todas las alturas en 0
  animatedHeights.value = {}
  props.variables.forEach(v => {
    animatedHeights.value[v.key] = 0
  })
}

// ✅ Función para activar las primeras 4 barras con animación de relleno
const activateBarsWithAnimation = async () => {
  await new Promise(resolve => setTimeout(resolve, props.animationDelay))
  
  // ✅ Activar solo las primeras 4 barras
  const count = Math.min(4, internalVariables.value.length)
  
  for (let i = 0; i < count; i++) {
    internalVariables.value[i].active = true
    
    // ✅ Animar la altura desde 0 hasta el valor real
    await new Promise(resolve => setTimeout(resolve, 50))
    const targetHeight = getBarHeight(internalVariables.value[i].value)
    animatedHeights.value[internalVariables.value[i].key] = targetHeight
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

// Observar cambios en props.variables
watch(() => props.variables, () => {
  initializeVariables()
  activateBarsWithAnimation()
}, { immediate: true, deep: true })

// ✅ Activar animación al montar
onMounted(() => {
  activateBarsWithAnimation()
})

// Computed: Variables activas
const activeVariables = computed(() => {
  return internalVariables.value.filter(v => v.active)
})

// Computed para calcular el ancho dinámico
const dynamicBarWidth = computed(() => {
  const count = activeVariables.value.length
  if (count === 0) return '100%'
  return `${100 / count}%`
})

// Computed: Valor máximo para calcular porcentajes
const maxValue = computed(() => {
  const values = activeVariables.value.map(v => v.value)
  return Math.max(...values, 1)
})

// ✅ Computed: Estilo del tooltip
const tooltipStyle = computed(() => {
  return {
    left: `${tooltip.value.x + 15}px`,
    top: `${tooltip.value.y - 50}px`
  }
})

// Métodos
const toggleVariable = (key) => {
  const variable = internalVariables.value.find(v => v.key === key)
  if (variable) {
    variable.active = !variable.active
    
    // ✅ Animar el cambio de altura
    if (variable.active) {
      setTimeout(() => {
        animatedHeights.value[key] = getBarHeight(variable.value)
      }, 50)
    } else {
      animatedHeights.value[key] = 0
    }
  }
}

// ✅ Manejadores de eventos del tooltip
const handleMouseEnter = (variable, event) => {
  hoveredBarKey.value = variable.key
  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    label: variable.label,
    value: variable.value,
    color: getBarColor(variable)
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

const getBarHeight = (value) => {
  const percentage = (value / maxValue.value) * 100
  return Math.min(percentage, 100)
}

// ✅ Nueva función para obtener la altura animada
const getAnimatedHeight = (variable) => {
  return animatedHeights.value[variable.key] || 0
}

const getBarColor = (variable) => {
  // Si hay color personalizado, usarlo
  if (variable.color) {
    return variable.color
  }

  // Colores sólidos por defecto
  const solidColors = {
    gray: '#9ca3af',
    red: '#DC143C',
    green: '#7cb342',
    blue: '#3b82f6',
    yellow: '#eab308',
    purple: '#a78bfa',
    orange: '#fb923c',
    default: '#6b7280'
  }
  
  return solidColors[variable.colorClass] || solidColors.default
}

const formatValue = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B'
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toLocaleString()
}
</script>

<style scoped>
.vertical-bar-chart {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 10px;
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;
}

.chart-header {
  margin-bottom: 5px;
  flex-shrink: 0;
}

.chart-title {
  margin: 0;
  letter-spacing: -0.5px;
  font-size: 16px;
  text-align: center;
  font-weight: 400;
  color: #484d56;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Filtros */
.variable-filters {
  display: flex;
  flex-direction: row;
  min-height: 24px;
  height: auto;
  padding: 4px 8px;
  border-radius: 12%;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-bottom: 1px;
  flex-shrink: 0;
}

.filter-btn {
  flex: 0 0 auto;
  border: none;
  padding: 4px 10px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 200;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: white;
  transition: all 0.5s ease;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.filter-btn:hover {
  background: #e5e7eb;
}

.filter-btn.active {
  background: #737373;
  color: white;
}

/* ✅ Dot en los filtros */
.filter-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.filter-label {
  white-space: nowrap;
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Contenedor de barras verticales */
.bars-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  gap: 8px;
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 5px;
}

.bars-container::-webkit-scrollbar {
  height: 4px;
}

.bars-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.bars-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.bars-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transition: opacity 0.3s ease, transform 0.2s ease, width 0.3s ease;
  width: v-bind(dynamicBarWidth);
  max-width: 80px;
  min-width: 30px;
  height: 100%;
  cursor: pointer;
}

.bar-column.is-hovered {
  opacity: 1;
  transform: scale(1.02);
  z-index: 10;
}

.bar-column.is-dimmed {
  opacity: 0.3;
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

.bar-wrapper-vertical {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
}

.bar-vertical {
  width: 100%;
  transition: height 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.bar-column.is-hovered .bar-vertical {
  box-shadow: 0 -3px 8px rgba(0, 0, 0, 0.2);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100px;
  color: #9ca3af;
  font-size: 12px;
}

/* Ajuste dinámico según cantidad de barras */
.bars-container.bars-count-1 .bar-column,
.bars-container.bars-count-2 .bar-column {
  max-width: 100px;
}

.bars-container.bars-count-3 .bar-column,
.bars-container.bars-count-4 .bar-column {
  max-width: 80px;
}

.bars-container.bars-count-5 .bar-column,
.bars-container.bars-count-6 .bar-column {
  max-width: 60px;
}

/* ✅ Tooltip */
.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 8px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 999999;
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
}

.tooltip-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tooltip-label {
  font-weight: 600;
  font-size: 7px;
}

.tooltip-value {
  font-size: 6px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .bars-container {
    flex-wrap: wrap;
  }

  .bar-column {
    min-width: 50px;
  }
}
</style>