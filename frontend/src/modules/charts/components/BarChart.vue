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
        <span :class="['legend-dot', variable.colorClass]"></span>
        {{ variable.label }}
      </button>
    </div>

    <!-- 3. ÁREA DEL GRÁFICO CON EJES -->
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

      <!-- Grid lines de fondo -->
      <div class="grid-lines">
        <div
          v-for="tick in yAxisTicks"
          :key="tick.value"
          class="grid-line"
          :style="{ bottom: `${tick.position}%` }"
        ></div>
      </div>

      <!-- Contenedor de barras verticales -->
      <div class="bars-container" :class="`bars-count-${activeVariables.length}`" ref="barsContainerRef">
        <!-- Barra para cada variable activa -->
        <div 
          v-for="variable in activeVariables" 
          :key="variable.key"
          class="bar-column"
        >
          <!-- Wrapper de la barra -->
          <div class="bar-wrapper-vertical">
            <div 
              class="bar-vertical"
              :class="variable.colorClass"
              :style="{ height: getBarHeightPixels(variable.value) + 'px' }"
              @mouseenter="(e) => { hoveredBar = variable; updateTooltipPosition(e) }"
              @mousemove="updateTooltipPosition"
              @mouseleave="hoveredBar = null"
            >
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay variables seleccionadas -->
        <div v-if="activeVariables.length === 0" class="empty-state">
          <p>Selecciona al menos una variable para visualizar</p>
        </div>
      </div>
    </div>

  </div>

  <!-- Tooltip Global con position: fixed -->
  <Teleport to="body">
    <div 
      v-if="hoveredBar"
      class="tooltip-container"
      :style="{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`
      }"
    >
      <div class="tooltip-content">
        <div class="tooltip-item">
          <span class="tooltip-color-indicator" :class="hoveredBar.colorClass"></span>
          <span class="tooltip-variable-name">{{ hoveredBar.label }}:</span>
          <span class="tooltip-variable-value">{{ formatCurrency(hoveredBar.value) }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

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

const barsContainerRef = ref(null)
const barsContainerHeight = ref(300) // Altura por defecto
const hoveredBar = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

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

// Computed: Valor máximo para calcular porcentajes de altura (ajustado al 80%)
const maxValue = computed(() => {
  const values = activeVariables.value.map(v => v.value)
  const max = Math.max(...values, 1)
  // Multiplicar por 1.25 para que la barra más alta ocupe 80% (100/80 = 1.25)
  return max * 1.25
})

// Calcular ticks del eje Y
const yAxisTicks = computed(() => {
  const max = maxValue.value
  const step = max / 4
  return [
    { value: 0, position: 0 },
    { value: step, position: 25 },
    { value: step * 2, position: 50 },
    { value: step * 3, position: 75 },
    { value: max, position: 100 }
  ]
})

// Función para actualizar posición del tooltip
const updateTooltipPosition = (event) => {
  const rect = event.target.getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10 // 10px arriba de la barra
  }
}

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

// Calcular altura de barra en píxeles
const getBarHeightPixels = (value) => {
  if (maxValue.value === 0) return 0
  const percentage = (value / maxValue.value) * 100
  const heightInPixels = (barsContainerHeight.value * percentage) / 100
  return heightInPixels
}

// Formatear moneda
const formatCurrency = (value) => {
  if (Math.abs(value) >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`
  } else if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
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

// Actualizar altura del contenedor de barras
const updateBarsContainerHeight = () => {
  if (barsContainerRef.value) {
    const height = barsContainerRef.value.clientHeight - 20
    if (height > 0) {
      barsContainerHeight.value = height
    }
  }
}

// Observar cambios de tamaño
onMounted(async () => {
  await nextTick()
  updateBarsContainerHeight()
  
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
.vertical-bar-chart {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  border: 1px solid #e5e7eb;
  gap: 10px;
}

.chart-header {
  position: relative;
  margin-bottom: 5px;
  width: 100%;
  flex-shrink: 0;
}

.chart-title {
  margin: 0;
  letter-spacing: -0.5px;
  font-size: 17px;
  text-align: center;
  font-weight: 600;
  color: #484d56;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Filtros de bar chart */
.variable-filters {
  display: flex;
  flex-direction: row;
  height: 35px;
  padding: 6px;
  border-radius: 20px;
  flex-wrap: nowrap;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
  gap: 2px;
  margin-bottom: 5px;
  background: #f5f5f5;
  flex-shrink: 0;
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

.filter-btn.active.gray {
  background: white;
  color: #2c3e50;
}

.filter-btn.active.red {
  background: white;
  color: #2c3e50;
}

.filter-btn.active.green {
  background: white;
  color: #2c3e50;
}

/* Legend dot dentro del botón */
.legend-dot {
  width: 6px;
  height: 6px;
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

/* ✅ ÁREA DEL GRÁFICO CON EJES */
.chart-area {
  margin-top: 10px;
  flex: 1;
  display: flex;
  position: relative;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow: visible;
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
  transition: bottom 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.tick-label {
  font-size: 10px;
  color: #666;
  text-align: right;
  width: 50px;
  padding-right: 8px;
}

/* ✅ GRID LINES */
.grid-lines {
  position: absolute;
  top: 0;
  left: 60px;
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

/* Contenedor de barras verticales */
.bars-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 5px;
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.bar-column {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  animation: slideUp 0.5s ease;
  transition: width 0.4s ease;
  justify-content: flex-end;
}

.bar-wrapper-vertical {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
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

.bar-vertical {
  width: 100%;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px 12px 0 0;
  position: relative;
  min-height: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.bar-vertical:hover {
  opacity: 0.8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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


.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #9ca3af;
  font-size: 14px;
}

/* ✅ TOOLTIP */
.tooltip-container {
  position: fixed;
  transform: translate(-50%, calc(-100% - 15px));
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

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.tooltip-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.tooltip-color-indicator.gray {
  background: #9ca3af;
}

.tooltip-color-indicator.red {
  background: #DC143C;
}

.tooltip-color-indicator.green {
  background: #7cb342;
}

.tooltip-variable-name {
  color: #666;
  flex-shrink: 0;
  font-size: 14px;
}

.tooltip-variable-value {
  color: #333;
  font-weight: 600;
  margin-left: auto;
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
    height: auto;
  }
  
  .filter-btn {
    min-width: auto;
  }
}
</style>