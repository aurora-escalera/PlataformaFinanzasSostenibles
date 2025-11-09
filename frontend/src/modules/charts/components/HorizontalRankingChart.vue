<!-- HorizontalRankingChart.vue - CON EJE X NUMÉRICO -->
<template>
  <div class="horizontal-bar-chart" :style="{ width: width, height: height }">
    <!-- Título -->
    <div v-if="title" class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
    </div>

    <!-- Contenedor principal -->
    <div class="chart-content">
      <!-- Contenedor de barras con labels -->
      <div class="bars-container" :class="{ 'has-hover': hoveredBarKey !== null }">
        <div 
          v-for="variable in activeVariables" 
          :key="variable.key"
          class="bar-row"
          :class="{ 
            'is-hovered': hoveredBarKey === variable.key,
            'is-dimmed': hoveredBarKey !== null && hoveredBarKey !== variable.key
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
            <div class="tooltip-value">{{ formatValue(tooltip.value) }}</div>
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
  valueFormatter: { type: Function, default: null }
})

const hoveredBarKey = ref(null)
const tooltip = ref({ visible: false, x: 0, y: 0, label: '', value: '', color: '' })
const internalVariables = ref([])
const animatedWidths = ref({})

const initializeVariables = () => {
  internalVariables.value = props.variables.map(v => ({
    key: v.key,
    label: v.label || v.key,
    value: v.value || 0,
    colorClass: v.colorClass || 'default',
    color: v.color || '#3b82f6',
    active: false
  }))
  
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
    const delay = props.showAllBars && count > 10 ? 50 : 200
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

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

const dynamicBarHeight = computed(() => {
  const count = activeVariables.value.length
  if (count === 0) return '100%'
  if (props.showAllBars && count > 10) return '22px'  // ✅ Reducido de 30px a 22px
  return `${100 / count}%`
})

const maxValue = computed(() => {
  const values = activeVariables.value.map(v => v.value)
  return Math.max(...values, 1)
})

// Calcular ticks del eje X
const xAxisTicks = computed(() => {
  const max = maxValue.value
  const step = max / 5 // 5 divisiones
  
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
    top: `${tooltip.value.y - 50}px`
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
    color: variable.color
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
  return typeof value === 'number' ? value.toFixed(1) : value
}
</script>

<style scoped>
.horizontal-bar-chart {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 10px;  /* ✅ Reducido de 15px a 10px */
  box-sizing: border-box;
  height: 100%;
  width: 100%;
}

.chart-header {
  margin-bottom: 10px;  /* ✅ Reducido de 15px a 10px */
  text-align: center;
}

.chart-title {
  margin: 0;
  font-size: 16px;  /* ✅ Reducido de 18px a 16px */
  font-weight: 600;
  color: #2c3e50;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chart-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.bars-container {
  display: flex;
  flex-direction: column;
  gap: 2px;  /* ✅ Reducido de 4px a 2px */
  flex: 1;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 5px;  /* ✅ Reducido de 10px a 5px */
}

.bar-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  align-items: center;
  height: v-bind(dynamicBarHeight);
  min-height: 22px;  /* ✅ Reducido de 30px a 22px */
  padding: 1px 0;  /* ✅ Reducido de 2px a 1px */
  transition: opacity 0.3s ease, transform 0.2s ease;
  cursor: pointer;
}

.bar-row.is-hovered {
  opacity: 1;
  transform: scale(1.01);
  z-index: 10;
}

.bar-row.is-dimmed {
  opacity: 0.4;
}

/* Label del estado */
.state-label {
  font-size: 11px;  /* ✅ Reducido de 12px a 11px */
  font-weight: 500;
  color: #374151;
  text-align: right;
  padding-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Área de la barra con grid */
.bar-chart-area {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 20px;  /* ✅ Reducido de 28px a 20px */
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
  border-radius: 4px;  /* ✅ Reducido de 6px a 4px */
  min-height: 20px;  /* ✅ Reducido de 28px a 20px */
}

.bar-horizontal {
  height: 100%;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bar-row.is-hovered .bar-horizontal {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Valor dentro de la barra */
.bar-value {
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Eje X */
.x-axis {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 2px solid #e5e7eb;
}

.x-axis-spacer {
  /* Espacio para alinear con los labels */
}

.x-axis-labels {
  position: relative;
  height: 30px;
}

.x-axis-tick {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tick-label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  margin-top: 4px;
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
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 999999;
}

.tooltip-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.tooltip-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tooltip-label {
  font-weight: 600;
  font-size: 12px;
}

.tooltip-value {
  font-size: 11px;
  opacity: 0.9;
}

/* Scrollbar personalizado */
.bars-container::-webkit-scrollbar {
  width: 8px;
}

.bars-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.bars-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.bars-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>