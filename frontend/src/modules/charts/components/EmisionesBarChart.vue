<template>
  <div class="emisiones-chart-container">
    <!-- Contenedor del gráfico -->
    <div class="chart-content">
      <div 
        v-for="(item, index) in chartData"
        :key="index"
        class="bar-row"
        @mouseenter="handleMouseEnter(index, item, $event)"
        @mousemove="handleMouseMove($event)"
        @mouseleave="handleMouseLeave"
      >
        <!-- Etiqueta izquierda -->
        <div class="bar-label">
          <div class="bar-color-dot" :style="{ backgroundColor: colors[index % colors.length] }"></div>
          <span>{{ item.label }}</span>
        </div>
        
        <!-- Barra -->
        <div class="bar-track">
          <div 
            class="bar-fill"
            :style="{ 
              width: getBarWidth(item.value) + '%',
              backgroundColor: colors[index % colors.length]
            }"
          >
          </div>
        </div>
        
        <!-- Valor derecho -->
        <div class="bar-value">
          {{ formatNumber(item.value) }}
        </div>
      </div>
    </div>
    
    <!-- Tooltip -->
    <Teleport to="body">
      <div 
        v-if="tooltip.visible"
        class="chart-tooltip"
        :style="tooltipStyle"
      >
        <div class="tooltip-header" :style="{ borderLeftColor: tooltip.color }">
          {{ tooltip.label }}
        </div>
        <div class="tooltip-body">
          <span class="tooltip-value">{{ formatNumber(tooltip.value) }}</span>
          <span class="tooltip-unit">toneladas</span>
        </div>
        <div class="tooltip-percentage">
          {{ tooltip.percentage }}% del total
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  excelData: {
    type: Array,
    default: null
  },
  colors: {
    type: Array,
    default: () => ['#0F3759', '#1E5A8A', '#2D7BB8', '#5A9BD4', '#8BBDE8']
  },
  title: {
    type: String,
    default: ''
  }
})

const hardcodedData = [
  { label: 'Fuentes Fijas', value: 3 },
  { label: 'Fuente Aérea', value: 77 },
  { label: 'Carreteros', value: 101 },
  { label: 'No Carreteros', value: 5 },
  { label: 'Naturales', value: 124 }
]

const chartData = computed(() => {
  return props.excelData || hardcodedData
})

const maxValue = computed(() => {
  if (chartData.value.length === 0) return 1
  return Math.max(...chartData.value.map(item => item.value))
})

const totalValue = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.value, 0)
})

const getBarWidth = (value) => {
  if (maxValue.value === 0) return 0
  return (value / maxValue.value) * 100
}

const formatNumber = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('es-MX').format(Math.round(value))
}

// Tooltip
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  value: 0,
  color: '',
  percentage: 0
})

const handleMouseEnter = (index, item, event) => {
  const percentage = totalValue.value > 0 
    ? ((item.value / totalValue.value) * 100).toFixed(1)
    : 0
    
  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    label: item.label,
    value: item.value,
    color: props.colors[index % props.colors.length],
    percentage
  }
}

const handleMouseMove = (event) => {
  if (tooltip.value.visible) {
    tooltip.value.x = event.clientX
    tooltip.value.y = event.clientY
  }
}

const handleMouseLeave = () => {
  tooltip.value.visible = false
}

const tooltipStyle = computed(() => ({
  left: `${tooltip.value.x + 15}px`,
  top: `${tooltip.value.y - 60}px`
}))
</script>

<style scoped>
.emisiones-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  box-sizing: border-box;
}

/* Contenido del gráfico */
.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  min-height: 0;
}

/* Fila de barra */
.bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 4px;
  padding: 2px 0;
}

.bar-row:hover {
  background: rgba(59, 130, 246, 0.05);
}

/* Etiqueta */
.bar-label {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 90px;
  min-width: 90px;
  font-size: 12px;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Track de la barra */
.bar-track {
  flex: 1;
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.25), transparent);
  border-radius: 5px 5px 0 0;
}

/* Valor */
.bar-value {
  width: 45px;
  min-width: 45px;
  font-size: 11px;
  font-weight: 600;
  color: #1e3a5f;
  text-align: right;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* Tooltip */
.chart-tooltip {
  position: fixed;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  pointer-events: none;
  z-index: 999999;
  overflow: hidden;
  min-width: 120px;
  border: 1px solid #e2e8f0;
}

.tooltip-header {
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #1e3a5f;
  background: #f8fafc;
  border-left: 3px solid;
}

.tooltip-body {
  padding: 6px 10px 3px;
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.tooltip-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e3a5f;
}

.tooltip-unit {
  font-size: 9px;
  color: #64748b;
}

.tooltip-percentage {
  padding: 0 10px 6px;
  font-size: 9px;
  color: #64748b;
}
</style>