<!-- src/modules/charts/components/BarChart.vue -->
<template>
  <div class="vertical-bar-chart">
    <!-- Título del componente -->
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
    </div>

    <!-- Filtros/Toggles para mostrar/ocultar variables -->
    <div class="variable-filters">
      <button 
        v-for="variable in variables" 
        :key="variable.key"
        @click="toggleVariable(variable.key)"
        :class="['filter-btn', { 
          'active': isVariableActive(variable.key),
          [variable.colorClass]: true 
        }]"
      >
        {{ variable.label }}
      </button>
    </div>

    <!-- Leyenda con indicadores de color -->
    <div class="chart-legend">
      <div 
        v-for="variable in variables" 
        :key="'legend-' + variable.key"
        class="legend-item"
      >
        <span :class="['legend-dot', variable.colorClass]"></span>
        <span class="legend-label">{{ variable.label }}</span>
      </div>
    </div>

    <!-- Contenedor de barras verticales -->
    <div class="bars-container" :class="`bars-count-${activeVariables.length}`">
      <!-- Barra para cada variable activa -->
      <div 
        v-for="variable in activeVariables" 
        :key="variable.key"
        class="bar-column"
      >
        <!-- Valor numérico arriba de la barra -->
        <div class="bar-value-top">{{ formatValue(variable.value) }}</div>
        
        <!-- Wrapper de la barra -->
        <div class="bar-wrapper-vertical">
          <div 
            class="bar-vertical"
            :class="variable.colorClass"
            :style="{ height: getBarHeight(variable.value) + '%' }"
          >
          </div>
        </div>
        
        <!-- Label debajo de la barra -->
        <div class="bar-label-bottom">

        </div>
      </div>

      <!-- Mensaje cuando no hay variables seleccionadas -->
      <div v-if="activeVariables.length === 0" class="empty-state">
        <p>Selecciona al menos una variable para visualizar</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  },
  title: {
    type: String,
    default: 'Presupuestos'
  }
})

// Variables disponibles con sus configuraciones
const variables = ref([
  {
    key: 'presupuesto_total',
    label: 'Presupuesto Total',
    colorClass: 'gray',
    value: 0,
    active: true
  },
  {
    key: 'presupuesto_carbono',
    label: 'Presupuesto Intensivo en Carbono',
    colorClass: 'red',
    value: 0,
    active: false
  },
  {
    key: 'presupuesto_sostenible',
    label: 'Presupuesto sostenible',
    colorClass: 'green',
    value: 0,
    active: false
  }
])

// Inicializar valores desde props.data
if (props.data.is_amount !== undefined) {
  variables.value[1].value = props.data.is_amount
}
if (props.data.iic_amount !== undefined) {
  variables.value[2].value = props.data.iic_amount
}
// Calcular presupuesto total como suma
variables.value[0].value = variables.value[1].value + variables.value[2].value

// Computed: Variables activas
const activeVariables = computed(() => {
  return variables.value.filter(v => v.active)
})

// Computed: Valor máximo para calcular porcentajes de altura
const maxValue = computed(() => {
  const values = activeVariables.value.map(v => v.value)
  return Math.max(...values, 1)
})

// Métodos
const toggleVariable = (key) => {
  const variable = variables.value.find(v => v.key === key)
  if (variable) {
    variable.active = !variable.active
  }
}

const isVariableActive = (key) => {
  return variables.value.find(v => v.key === key)?.active || false
}

const getBarHeight = (value) => {
  const percentage = (value / maxValue.value) * 100
  return Math.min(percentage, 100)
}

const formatValue = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  } else if (value >= 1000) {
    return (value / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  return value.toLocaleString()
}
</script>

<style scoped>
.vertical-bar-chart {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 127.5px;
  align-items: center; 
  background: white;
  border-radius: 12px;
}

.chart-header {
  position: relative;
  margin-bottom: 5px;
  width: 100%;
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

/* Filtros  de bar chart 1 */
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

.filter-btn.active.gray {
  background: #1e3a5f;
  color: white;
}

.filter-btn.active.red {
  background: #1e3a5f;
  color: white;
}

.filter-btn.active.green {
  background: #1e3a5f;
  color: white;
}

/* Leyendas de la grafica de barras */
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

.legend-dot.gray {
  background: #9ca3af;
}

.legend-dot.red {
  background: #DC143C;
}

.legend-dot.green {
  background: #7cb342;
}


/* Contenedor de barras verticales */
.bars-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 5px;
  flex: 1;
  width: 100%;
  position: relative;

}

.bar-column {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  animation: slideUp 0.5s ease;
  transition: width 0.4s ease;

}

.bar-wrapper-vertical {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: flex-end;
}

/* Ajuste dinámico del ancho según cantidad de barras */
.bars-container.bars-count-1 .bar-column {
  width: 100%;
  max-width: 600px;
}

.bars-container.bars-count-2 .bar-column {
  width: 45%;
  max-width: 350px;
}

.bars-container.bars-count-3 .bar-column {
  width: 30%;
  max-width: 250px;
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

.bar-value-top {
  font-size: 6px;
  font-weight: 100px;
}

.bar-vertical {
  width: 100%;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px 12px 0 0;
  position: relative;
}

.bar-vertical.gray {
  background: linear-gradient(to top, #6b7280 0%, #9ca3af 100%);
}

.bar-vertical.red {
  background: linear-gradient(to top, #b91c1c 0%, #DC143C 100%);
}

.bar-vertical.green {
  background: linear-gradient(to top, #65a30d 0%, #7cb342 100%);
}

.bar-label-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.color-indicator {
  width: 80px;
  height: 1px;
  border-radius: 24px;
}

.color-indicator.gray {
  background: #6b7280;
}

.color-indicator.red {
  background: #DC143C;
}

.color-indicator.green {
  background: #7cb342;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
  color: #9ca3af;
  font-size: 14px;
}

@media (max-width: 768px) {
  .bars-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .bars-container.bars-count-1 .bar-column,
  .bars-container.bars-count-2 .bar-column,
  .bars-container.bars-count-3 .bar-column {
    width: 100%;
    max-width: none;
  }
  
  .bar-wrapper-vertical {
    height: 250px;
  }
  
  .variable-filters {
    flex-direction: column;
  }
  
  .filter-btn {
    min-width: auto;
  }
}
</style>