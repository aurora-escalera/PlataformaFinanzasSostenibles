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
        {{ variable.label }}
      </button>
    </div>

    <!-- Leyenda con indicadores de color (opcional) -->
    <div v-if="showLegend" class="chart-legend">
      <div 
        v-for="variable in internalVariables" 
        :key="'legend-' + variable.key"
        class="legend-item"
      >
        <span :class="['legend-dot', variable.colorClass]"></span>
        <span class="legend-label">{{ variable.label }}</span>
      </div>
    </div>

    <!-- Contenedor de barras verticales -->
    <div 
      class="bars-container"
      :class="`bars-count-${activeVariables.length}`"
    >
      <!-- Columna para cada variable activa -->
      <div 
        v-for="variable in activeVariables" 
        :key="variable.key"
        class="bar-column"
      >
        <!-- Wrapper de la barra vertical -->
        <div class="bar-wrapper-vertical">
          <div 
            class="bar-vertical"
            :class="variable.colorClass"
            :style="{ 
              height: getBarHeight(variable.value) + '%',
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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
  }
})

const internalVariables = ref([])

const initializeVariables = () => {
  internalVariables.value = props.variables.map(v => ({
    key: v.key,
    label: v.label || v.key,
    value: v.value || 0,
    colorClass: v.colorClass || 'default',
    color: v.color || null,
    active: v.active !== undefined ? v.active : true
  }))
}

watch(() => props.variables, () => {
  initializeVariables()
}, { immediate: true, deep: true })

const activeVariables = computed(() => {
  return internalVariables.value.filter(v => v.active)
})

// Computed para calcular el ancho dinámico
const dynamicBarWidth = computed(() => {
  const count = activeVariables.value.length
  if (count === 0) return '100%'
  return `${100 / count}%`
})

const maxValue = computed(() => {
  const values = activeVariables.value.map(v => v.value)
  return Math.max(...values, 1)
})

const toggleVariable = (key) => {
  const variable = internalVariables.value.find(v => v.key === key)
  if (variable) {
    variable.active = !variable.active
  }
}

const getBarHeight = (value) => {
  const percentage = (value / maxValue.value) * 100
  return Math.min(percentage, 100)
}

const getBarColor = (variable) => {
  if (variable.color) {
    return variable.color
  }

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
  font-size: 7px;
  text-align: center;
  font-weight: 400;
  color: #484d56;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Filtros */
.variable-filters {
  display: flex;
  flex-direction: row;
  height: 12px;
  padding: 2px 0;
  border-radius: 24px;
  flex-wrap: nowrap;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
  gap: 2px;
  margin-bottom: 5px;
  flex-shrink: 0;
}

.filter-btn {
  flex: 0 1 auto;
  border: none;
  padding: 1px 5px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 5px;
  font-weight: 100;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  background: #e5e7eb;
}

.filter-btn.active {
  background: #737373;
  color: white;
}

/* Leyenda */
.chart-legend {
  display: flex;
  flex-direction: row;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 6px;
  gap: 3px;
  color: #4b5563;
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.gray { background: #9ca3af; }
.legend-dot.red { background: #DC143C; }
.legend-dot.green { background: #7cb342; }
.legend-dot.blue { background: #3b82f6; }
.legend-dot.yellow { background: #eab308; }
.legend-dot.purple { background: #a78bfa; }
.legend-dot.orange { background: #fb923c; }
.legend-dot.default { background: #6b7280; }

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
  animation: slideUp 0.5s ease;
  transition: width 0.3s ease;
  width: v-bind(dynamicBarWidth);
  max-width: 80px;
  min-width: 30px;
  height: 100%;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
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
}

.bar-vertical {
  width: 100%;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
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

@media (max-width: 768px) {
  .bars-container {
    flex-wrap: wrap;
  }

  .bar-column {
    min-width: 50px;
  }
}
</style>