<!-- src/modules/charts/components/DonutChart.vue -->
<template>
  <div class="donut-chart">
    <!-- Filtros/Toggles para mostrar/ocultar segmentos -->
    <div class="variable-filters" v-if="variables && variables.length > 0">
      <button 
        v-for="variable in variables" 
        :key="variable.key"
        @click="toggleVariable(variable.key)"
        :class="['filter-btn', { 
          'active': isVariableActive(variable.key),
          [variable.colorClass]: true 
        }]"
      >
        <span :class="['legend-dot', variable.colorClass]"></span>
        {{ variable.label }}
      </button>
    </div>

    <!-- SVG de la gráfica de dona -->
    <div class="chart-svg-container">
      <svg :width="size" :height="size" class="donut-svg">
        <!-- Círculo de fondo (gris) -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="backgroundColor"
          :stroke-width="strokeWidth"
        />
        
        <!-- Círculo de progreso (color principal) -->
        <circle
          v-if="shouldShowProgress"
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="primaryColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          :transform="`rotate(-90 ${center} ${center})`"
          class="progress-circle"
        />
        
        <!-- Texto central con el porcentaje -->
        <text
          :x="center"
          :y="center + 4"
          text-anchor="middle"
          class="percentage-text"
        >
          {{ displayValue }}
        </text>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 220
  },
  variables: {
    type: Array,
    default: () => []
  }
})

// Variables internas con estado activo/inactivo
const internalVariables = ref([])

// Inicializar variables
const initializeVariables = () => {
  if (props.variables && props.variables.length > 0) {
    internalVariables.value = props.variables.map(v => ({
      ...v,
      active: v.active !== undefined ? v.active : true
    }))
  }
}

// Inicializar al montar
initializeVariables()

// Reinicializar si cambian las props
watch(() => props.variables, () => {
  initializeVariables()
}, { deep: true })

// Configuración de colores
const primaryColor = computed(() => {
  if (props.data.length > 0 && props.data[0].color) {
    return props.data[0].color
  }
  return '#009d14'
})

const backgroundColor = computed(() => {
  if (props.data.length > 1 && props.data[1].color) {
    return props.data[1].color
  }
  return '#E8E8E8'
})

// Calculados para el SVG
const center = computed(() => props.size / 2)
const strokeWidth = computed(() => 19)
const radius = computed(() => (props.size / 2) - (strokeWidth.value / 2))
const circumference = computed(() => 2 * Math.PI * radius.value)

// Obtener el valor del primer elemento
const primaryValue = computed(() => {
  return props.data.length > 0 ? props.data[0].value : 0
})

// Valor a mostrar en el centro
const displayValue = computed(() => {
  if (props.subtitle) {
    return props.subtitle
  }
  const percentage = primaryValue.value <= 1 ? primaryValue.value * 100 : primaryValue.value
  return `${Math.round(percentage)}%`
})

// Verificar si alguna variable está activa
const activeVariablesCount = computed(() => {
  return internalVariables.value.filter(v => v.active).length
})

// Determinar si mostrar el progreso
const shouldShowProgress = computed(() => {
  // Si no hay variables, siempre mostrar
  if (!props.variables || props.variables.length === 0) {
    return true
  }
  // Si hay variables, mostrar solo si hay alguna activa
  return activeVariablesCount.value > 0
})

// Calcular el offset para mostrar el progreso
const strokeDashoffset = computed(() => {
  if (!shouldShowProgress.value) {
    return circumference.value // Ocultar completamente
  }
  
  const percentage = primaryValue.value <= 1 ? primaryValue.value * 100 : primaryValue.value
  const progress = percentage / 100
  return circumference.value * (1 - progress)
})

// Métodos
const toggleVariable = (key) => {
  const variable = internalVariables.value.find(v => v.key === key)
  if (variable) {
    variable.active = !variable.active
  }
}

const isVariableActive = (key) => {
  return internalVariables.value.find(v => v.key === key)?.active || false
}
</script>

<style scoped>
.donut-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 100%;
}

/* Filtros de variables */
.variable-filters {
  display: flex;
  flex-direction: row;
  min-height: 35px;
  padding: 6px;
  border-radius: 20px;
  flex-wrap: wrap;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
  gap: 2px;
  background: #f5f5f5;
  flex-shrink: 0;
  width: 100%;
  margin-bottom: 5px;
}

.filter-btn {
  flex: 0 1 auto;
  border: none;
  padding: 1px 12px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: transparent;
  color: #666;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-btn:hover {
  background: #e5e7eb;
}

.filter-btn.active {
  background: white;
  color: #2c3e50;
}

/* Legend dot dentro del botón */
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Colores para diferentes tipos */
.legend-dot.green {
  background: #7cb342;
}

.legend-dot.light-green {
  background: #9ccc65;
}

.legend-dot.dark-green {
  background: #558b2f;
}

.legend-dot.red {
  background: #DC143C;
}

.legend-dot.light-red {
  background: #ef5350;
}

.legend-dot.dark-red {
  background: #b71c1c;
}

.legend-dot.gray {
  background: #9ca3af;
}

.chart-svg-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.donut-svg {
  overflow: visible;
}

.progress-circle {
  transition: stroke-dashoffset 0.8s ease-in-out, stroke-width 0.2s ease;
}

.donut-chart:hover .progress-circle {
  stroke-width: 20;
}

.percentage-text {
  font-size: 14px;
  font-weight: bold;
  fill: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Animación de entrada */
.progress-circle {
  animation: drawCircle 1.2s ease-out;
}

@keyframes drawCircle {
  from {
    stroke-dashoffset: var(--circumference, 314);
  }
  to {
    stroke-dashoffset: var(--final-offset);
  }
}

@media (max-width: 768px) {
  .filter-btn {
    font-size: 9px;
    padding: 3px 8px;
    gap: 4px;
  }
  
  .legend-dot {
    width: 10px;
    height: 10px;
  }
}
</style>