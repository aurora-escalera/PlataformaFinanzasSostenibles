<!-- src/modules/charts/components/HorizontalBarChart.vue -->
<template>
  <div 
    class="horizontal-bar-chart" 
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

    <!-- Contenedor de barras horizontales -->
    <div class="bars-container">
      <!-- Fila para cada variable activa -->
      <div 
        v-for="variable in activeVariables" 
        :key="variable.key"
        class="bar-row"
      >
        <!-- Wrapper de la barra horizontal -->
        <div class="bar-wrapper-horizontal">
          <div 
            class="bar-horizontal"
            :class="variable.colorClass"
            :style="{ 
              width: getBarWidth(variable.value) + '%',
              background: getBarColor(variable)
            }"
          >
          </div>
        </div>

        <!-- Valor numérico a la derecha -->
       
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
  // Datos de las variables
  variables: {
    type: Array,
    required: true,
    default: () => []
    // Formato esperado:
    // [
    //   { key: 'var1', label: 'Variable 1', value: 100, colorClass: 'blue', active: true },
    //   { key: 'var2', label: 'Variable 2', value: 200, colorClass: 'green', active: true }
    // ]
  },

  // Dimensiones del gráfico
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: 'auto'
  },

  // Título opcional
  title: {
    type: String,
    default: ''
  },

  // Mostrar/ocultar elementos
  showFilters: {
    type: Boolean,
    default: false
  },
  showLegend: {
    type: Boolean,
    default: false
  },

  // Mensaje cuando está vacío
  emptyMessage: {
    type: String,
    default: 'No hay datos para visualizar'
  },

  // Altura de cada barra
  barHeight: {
    type: String,
    default: '30px'
  },

  // Espaciado entre barras
  barGap: {
    type: String,
    default: '10px'
  },

  // Usar gradientes personalizados
  useGradients: {
    type: Boolean,
    default: true
  }
})

// Copia interna de las variables para manejar el estado
const internalVariables = ref([])

// Inicializar variables internas desde props
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

// Observar cambios en props.variables
watch(() => props.variables, () => {
  initializeVariables()
}, { immediate: true, deep: true })

// Computed: Variables activas
const activeVariables = computed(() => {
  return internalVariables.value.filter(v => v.active)
})

// Computed: Valor máximo para calcular porcentajes
const maxValue = computed(() => {
  const values = activeVariables.value.map(v => v.value)
  return Math.max(...values, 1)
})

// Métodos
const toggleVariable = (key) => {
  const variable = internalVariables.value.find(v => v.key === key)
  if (variable) {
    variable.active = !variable.active
  }
}

const getBarWidth = (value) => {
  const percentage = (value / maxValue.value) * 100
  return Math.min(percentage, 100)
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
</script>

<style scoped>
.horizontal-bar-chart {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-sizing: border-box;
}

.chart-header {
  margin-bottom: 10px;
}

.chart-title {
  margin: 0;
  letter-spacing: -0.5px;
  font-size: 7px;
  text-align:center;
  font-weight: 400;
  color: #484d56;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Filtros */
.variable-filters {
  background-color: red;
  display: flex;
  flex-direction: row;
  gap: 1px;
  border-radius: 24px;
  flex-wrap: nowrap;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
  padding: 2px;
  background: white;
}

.filter-btn {
  flex: 0 1 auto;
  border: none;
  padding: 2px 10px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 5px;
  font-weight: 100;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: white;
  transition: all 0.3s ease;
  white-space: normal;
}

.filter-btn:hover {
  background: #e5e7eb;
}

.filter-btn.active {
  background: #1e3a5f;
  color: white;
}

/* Leyenda */
.chart-legend {
  display: flex;
  flex-direction: row;
  gap: 1px;
  flex-wrap: nowrap;
  justify-content: center;
  flex-wrap: wrap;
  justify-content: center;
}

.legend-item {
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  font-size: 5px;
  gap: 3px;
  color: #4b5563;
  padding: 2px;
}

.legend-dot {
  width: 5px;
  height: 5px;
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

/* Contenedor de barras horizontales */
.bars-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  width: 100%;
  position: relative;
}

.bar-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  animation: slideIn 0.5s ease;
  height: v-bind(barHeight);
  align-items: center;
  animation: slideUp 0.5s ease;
  transition: width 0.4s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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


.bar-wrapper-horizontal {
  width: 100%; 
  height: 100%;
  background: #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.bar-horizontal {
  width: 100%; 
  height: 100%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100px;
  color: #9ca3af;
  font-size: 14px;
}
</style>