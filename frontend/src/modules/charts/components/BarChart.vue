<!-- src/modules/charts/components/BarChart.vue -->
<!-- ✅ ACTUALIZADO: Botón de exportación circular en header dark -->
<template>
  <div class="vertical-bar-chart">

    <!-- ✅ Header Dark con botón de exportación -->
    <div class="bar-header-dark">
      <div class="bar-header-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="20" x2="12" y2="10"/>
          <line x1="18" y1="20" x2="18" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="16"/>
        </svg>
      </div>
      <div class="bar-header-text">
        <span class="bar-header-title">{{ headerTitle }}</span>
        <span class="bar-header-subtitle">{{ selectedState }} • {{ selectedYear }}</span>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-cards-row">
      <div
        v-for="(variable, index) in variables"
        :key="variable.key"
        class="kpi-card"
        :class="[
          variable.colorClass,
          { 
            'active': isVariableActive(variable.key),
            'hovered': hoveredCard === index
          }
        ]"
        :style="getKpiCardStyle(variable, index)"
        @click="toggleVariable(variable.key)"
        @mouseenter="hoveredCard = index"
        @mouseleave="hoveredCard = null"
      >
        <span class="kpi-dot" :class="variable.colorClass"></span>
        <div class="kpi-value">{{ formatCurrency(variable.value) }}</div>
        <div v-if="variable.percentage !== undefined && variable.percentage !== null" class="kpi-percentage" :class="variable.colorClass">
         Porcentaje: {{ formatPercentage(variable.percentage) }}% 
        </div>
        <div v-if="variable.position !== undefined && variable.position !== null" class="kpi-position" :class="variable.colorClass">
          Posición: No. {{ variable.position }}
        </div>
        <div class="kpi-label">{{ variable.shortLabel || variable.label }}</div>
      </div>
    </div>
    
    <div class="currency-legend">{{ currencyLegend }}</div>

    <!-- ÁREA DEL GRÁFICO -->
    <div class="chart-area">
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

      <div class="grid-lines">
        <div
          v-for="tick in yAxisTicks"
          :key="'grid-' + tick.value"
          class="grid-line"
          :style="{ bottom: `${tick.position}%` }"
        ></div>
      </div>

      <div class="bars-container" :class="`bars-count-${activeVariables.length}`" ref="barsContainerRef">
        <div 
          v-for="variable in activeVariables" 
          :key="variable.key"
          class="bar-column"
        >
          <div 
            v-show="hoveredBar?.key !== variable.key"
            class="bar-value-label" 
            :class="variable.colorClass"
          >
            {{ formatCurrency(variable.value) }}
          </div>
          <div class="bar-wrapper-vertical">
            <div 
              class="bar-vertical"
              :class="variable.colorClass"
              :style="{ height: getBarHeightPixels(variable.value) + 'px' }"
              @mouseenter="(e) => { hoveredBar = variable; updateTooltipPosition(e) }"
              @mousemove="updateTooltipPosition"
              @mouseleave="hoveredBar = null"
            >
              <span 
                v-if="getBarHeightPixels(variable.value) > 30"
                class="bar-percentage"
              >
                {{ getPercentageOfTotal(variable.value) }}%
              </span>
            </div>
          </div>
        </div>

        <div v-if="activeVariables.length === 0" class="empty-state">
          <p>Selecciona al menos una variable para visualizar</p>
        </div>
      </div>
    </div>

  </div>

  <!-- Tooltip -->
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
        <div v-if="hoveredBar.percentage" class="tooltip-item">
          <span class="tooltip-variable-name">Porcentaje:</span>
          <span class="tooltip-variable-value">{{ formatPercentage(hoveredBar.percentage) }}%</span>
        </div>
        <div v-if="hoveredBar.position" class="tooltip-item">
          <span class="tooltip-variable-name">Posición:</span>
          <span class="tooltip-variable-value">#{{ hoveredBar.position }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  data: { type: [Object, Array], required: true, default: () => [] },
  title: { type: String, default: 'Presupuestos' },
  headerTitle: { type: String, default: 'Análisis Presupuestario' },
  selectedState: { type: String, default: '' },
  selectedYear: { type: String, default: '' },
  currency: { type: String, default: 'MXN' }
})

const emit = defineEmits(['export'])

const showExportMenu = ref(false)
const exportWrapperRef = ref(null)

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
}

const handleExport = (format) => {
  showExportMenu.value = false
  emit('export', { format, data: getExportData() })
}

const getExportData = () => {
  return variables.value.map(v => ({
    'Indicador': v.label,
    'Valor': v.value,
    'Porcentaje': v.percentage ? `${v.percentage}%` : 'N/A',
    'Posición': v.position || 'N/A'
  }))
}

const handleClickOutside = (event) => {
  if (exportWrapperRef.value && !exportWrapperRef.value.contains(event.target)) {
    showExportMenu.value = false
  }
}

const variables = ref([
  { key: 'presupuesto_total', label: 'Presupuesto Total', shortLabel: 'Presupuesto Total', colorClass: 'gray', color: '#9ca3af', value: 0, position: null, percentage: null, active: false },
  { key: 'presupuesto_sostenible', label: 'Presupuesto Sostenible', shortLabel: 'Presupuesto Sostenible', colorClass: 'green', color: '#7cb342', value: 0, position: null, percentage: null, active: false },
  { key: 'presupuesto_carbono', label: 'Presupuesto Intensivo en Carbono', shortLabel: 'Presupuesto Intensivo en Carbono', colorClass: 'red', color: '#DC143C', value: 0, position: null, percentage: null, active: false }
])

const barsContainerRef = ref(null)
const barsContainerHeight = ref(300)
const hoveredBar = ref(null)
const hoveredCard = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const hasActivatedOnce = ref(false)

const initializeVariablesFromData = () => {
  if (props.data && props.data.variables && Array.isArray(props.data.variables)) {
    variables.value = props.data.variables.map(dataVar => ({
      key: dataVar.key,
      label: dataVar.label || dataVar.key,
      shortLabel: getShortLabel(dataVar.label || dataVar.key),
      colorClass: dataVar.colorClass || 'gray',
      color: dataVar.color || '#9ca3af',
      value: dataVar.value || 0,
      position: dataVar.position !== undefined ? dataVar.position : null,
      percentage: dataVar.percentage !== undefined ? dataVar.percentage : null,
      active: false
    }))
  } else if (Array.isArray(props.data) && props.data.length > 0 && props.data[0].variables) {
    variables.value = props.data[0].variables.map(dataVar => ({
      key: dataVar.key,
      label: dataVar.label || dataVar.key,
      shortLabel: getShortLabel(dataVar.label || dataVar.key),
      colorClass: dataVar.colorClass || 'gray',
      color: dataVar.color || '#9ca3af',
      value: dataVar.value || 0,
      position: dataVar.position !== undefined ? dataVar.position : null,
      percentage: dataVar.percentage !== undefined ? dataVar.percentage : null,
      active: false
    }))
  }
}

const getShortLabel = (label) => {
  const shortLabels = {
    'Presupuesto Total': 'Presupuesto Total', 'Presupuestos Sostenibles': 'Presupuestos Sostenibles',
    'Presupuestos Intensivos en Carbono': 'Presupuestos Intensivos en Carbono',
    'Ingreso Total': 'Total', 'Ingresos Sostenibles': 'Ingresos Sostenibles',
    'Ingresos Intensivos en Carbono': 'Ingresos Intensivos en Carbono',
    'PT': 'Presupuesto Total', 'PS': 'Presupuestos Sostenibles', 'IT': 'Ingreso Total',
    'IS': 'Ingresos Sostenibles', 'IIC': 'Ingresos Intensivos en Carbono'
  }
  return shortLabels[label] || label
}

const getPercentageOfTotal = (value) => {
  const totalVar = variables.value[0]
  if (!totalVar || totalVar.value === 0) return '0.00'
  return ((value / totalVar.value) * 100).toFixed(2)
}

const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0.00'
  return parseFloat(value).toFixed(2)
}

const getKpiCardStyle = (variable, index) => {
  const isActive = variable.active
  const isHovered = hoveredCard.value === index
  return {
    background: isActive ? `linear-gradient(135deg, ${variable.color}08 0%, ${variable.color}15 100%)` : '#f8fafc',
    borderColor: isActive ? variable.color : '#e2e8f0',
    opacity: isActive ? 1 : 0.5,
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered ? `0 4px 12px ${variable.color}25` : 'none'
  }
}

initializeVariablesFromData()

watch(() => props.data, () => {
  initializeVariablesFromData()
  if (!hasActivatedOnce.value) {
    nextTick(() => { activateVariablesSequentially(); hasActivatedOnce.value = true })
  } else {
    nextTick(() => { variables.value.forEach(v => v.active = true) })
  }
}, { deep: true })

const activeVariables = computed(() => variables.value.filter(v => v.active))

const maxValue = computed(() => {
  const values = activeVariables.value.map(v => v.value)
  return Math.max(...values, 1) * 1.25
})

const yAxisTicks = computed(() => {
  const max = maxValue.value
  const step = max / 4
  return [
    { value: 0, position: 0 }, { value: step, position: 25 },
    { value: step * 2, position: 50 }, { value: step * 3, position: 75 }, { value: max, position: 100 }
  ]
})

const updateTooltipPosition = (event) => {
  const rect = event.target.getBoundingClientRect()
  tooltipPosition.value = { x: rect.left + rect.width / 2, y: rect.top - 10 }
}

const toggleVariable = (key) => {
  const variable = variables.value.find(v => v.key === key)
  if (variable) variable.active = !variable.active
}

const isVariableActive = (key) => variables.value.find(v => v.key === key)?.active || false

const currencyLegend = computed(() => {
  return props.currency === 'USD' ? '* Cifras en dólares estadounidenses (USD)' : '* Cifras en pesos mexicanos (MXN)'
})

const getBarHeightPixels = (value) => {
  if (maxValue.value === 0) return 0
  return (barsContainerHeight.value * (value / maxValue.value) * 100) / 100
}

const formatCurrency = (value) => {
  if (Math.abs(value) >= 1000000000) return `$${(value / 1000000000).toFixed(2)} B`
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)} M`
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(2)} K`
  return `$${value.toFixed(0)}`
}

const activateVariablesSequentially = () => {
  setTimeout(() => {
    variables.value.forEach((variable, index) => {
      setTimeout(() => { variable.active = true }, index * 600)
    })
  }, 300)
}

const updateBarsContainerHeight = () => {
  if (barsContainerRef.value) {
    const height = barsContainerRef.value.clientHeight - 35
    if (height > 0) barsContainerHeight.value = height
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await nextTick()
  updateBarsContainerHeight()
  if (barsContainerRef.value) {
    const resizeObserver = new ResizeObserver(() => updateBarsContainerHeight())
    resizeObserver.observe(barsContainerRef.value)
  }
  if (!hasActivatedOnce.value && variables.value.length > 0) {
    await nextTick()
    activateVariablesSequentially()
    hasActivatedOnce.value = true
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.data, () => { nextTick(() => updateBarsContainerHeight()) }, { deep: true })
</script>

<style scoped>
.vertical-bar-chart {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bar-header-dark {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  flex-shrink: 0;
}

.bar-header-icon {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #93c5fd;
}

.bar-header-icon svg { width: 12px; height: 12px; }

.bar-header-text { display: flex; flex-direction: column; flex: 1; }

.bar-header-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

.bar-header-subtitle {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 10px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}

.option-icon {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 5px;
  border-radius: 3px;
  color: white;
}

.option-icon.xlsx { background: #107c41; }
.option-icon.csv { background: #6366f1; }
.option-text { font-weight: 500; }

.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-enter-from, .dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* KPI Cards */
.kpi-cards-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  flex-shrink: 0;
  padding: 15px 15px 0 15px;
}

.kpi-card {
  padding: 10px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.kpi-dot { 
  width: 12px; height: 12px; border-radius: 2px; 
  position: absolute; top: 10px; right: 10px;
}
.kpi-dot.gray { background: #9ca3af; }
.kpi-dot.green { background: #7cb342; }
.kpi-dot.red { background: #DC143C; }

.kpi-value {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.kpi-percentage { font-size: 13px; font-weight: 500; margin-top: 2px; }
.kpi-percentage.gray { color: #6b7280; }
.kpi-percentage.green { color: #3f6212; }
.kpi-percentage.red { color: #991b1b; }

.kpi-position { font-size: 13px; font-weight: 500; margin-top: 2px; }
.kpi-position.gray { color: #6b7280; }
.kpi-position.green { color: #3f6212; }
.kpi-position.red { color: #991b1b; }

.kpi-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin-top: 2px;
}

.currency-legend {
  font-size: 11px;
  font-style: italic;
  color: #94a3b8;
  padding: 4px 15px 0 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chart-area {
  margin-top: 10px;
  flex: 1;
  display: flex;
  position: relative;
  min-height: 0;
  width: 100%;
  overflow: visible;
  padding: 25px 40px 30px 25px;
  background: #fafbfc;
  border-radius: 8px;
  margin-left: 15px;
  margin-right: 15px;
  margin-bottom: 15px;
  width: calc(100% - 30px);
}

.y-axis { width: 65px; position: relative; flex-shrink: 0; }

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
  width: 55px;
  padding-right: 10px;
}

.grid-lines {
  position: absolute;
  top: 25px;
  left: 90px;
  right: 40px;
  bottom: 30px;
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

.bars-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
  padding: 0 30px;
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

.bar-value-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  white-space: nowrap;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.3px;
}

.bar-value-label.gray { color: #6b7280; }
.bar-value-label.green { color: #558b2f; }
.bar-value-label.red { color: #b91c1c; }

.bar-wrapper-vertical {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bars-container.bars-count-1 .bar-column { width: 100%; max-width: 700px; }
.bars-container.bars-count-2 .bar-column { width: 60%; max-width: 400px; }
.bars-container.bars-count-3 .bar-column { width: 28%; max-width: 220px; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.bar-vertical {
  width: 100%;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px 12px 0 0;
  position: relative;
  min-height: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
}

.bar-vertical:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.bar-vertical.gray { background: linear-gradient(to top, #6b7280 0%, #9ca3af 100%); }
.bar-vertical.red { background: linear-gradient(to top, #b91c1c 0%, #DC143C 100%); }
.bar-vertical.green { background: linear-gradient(to top, #65a30d 0%, #7cb342 100%); }

.bar-percentage {
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

.tooltip-container {
  position: fixed;
  transform: translate(-50%, calc(-100% - 10px));
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 6px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  pointer-events: none;
  z-index: 99999;
  min-width: 120px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tooltip-container::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: white;
}

.tooltip-content { display: flex; flex-direction: column; gap: 3px; }
.tooltip-item { display: flex; align-items: center; gap: 5px; font-size: 10px; }

.tooltip-color-indicator { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.tooltip-color-indicator.gray { background: #9ca3af; }
.tooltip-color-indicator.red { background: #DC143C; }
.tooltip-color-indicator.green { background: #7cb342; }

.tooltip-variable-name { color: #666; font-size: 10px; }
.tooltip-variable-value { color: #333; font-weight: 600; margin-left: auto; font-size: 10px; }

/* ============================================
   RESPONSIVE - Media Queries
   ============================================ */

/* Tablets */
@media (max-width: 768px) {
  .vertical-bar-chart {
    border-radius: 10px;
  }
  
  .bar-header-dark {
    padding: 8px 10px;
    gap: 6px;
  }
  
  .bar-header-icon {
    width: 24px;
    height: 24px;
    min-width: 24px;
    border-radius: 5px;
  }
  
  .bar-header-icon svg {
    width: 10px;
    height: 10px;
  }
  
  .bar-header-title {
    font-size: 11px;
  }
  
  .bar-header-subtitle {
    font-size: 9px;
  }
  
  .export-btn-circle {
    width: 26px;
    height: 26px;
  }
  
  .export-btn-circle svg {
    width: 12px;
    height: 12px;
  }
  
  .export-dropdown-mini {
    min-width: 90px;
  }
  
  .export-option {
    padding: 8px 10px;
    font-size: 11px;
    gap: 6px;
  }
  
  .option-icon {
    font-size: 8px;
    padding: 2px 4px;
  }
  
  /* KPI Cards - mantener 3 columnas en móvil */
  .kpi-cards-row {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 6px;
    padding: 10px 10px 0 10px;
  }
  
  .kpi-card {
    padding: 6px;
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
  }
  
  .kpi-dot {
    width: 8px;
    height: 8px;
    top: 6px;
    right: 6px;
  }
  
  .kpi-value {
    font-size: 11px;
  }
  
  .kpi-percentage,
  .kpi-position {
    font-size: 9px;
  }
  
  .kpi-label {
    font-size: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .currency-legend {
    font-size: 9px;
    padding: 4px 10px 0 10px;
  }
  
  /* ✅ ALTURA FIJA para chart-area en móvil */
  .chart-area {
    padding: 15px 20px 20px 15px;
    margin: 8px 10px 10px 10px;
    width: calc(100% - 20px);
    border-radius: 6px;
    height: 250px;
    min-height: 250px;
    flex: none;
  }
  
  .y-axis {
    width: 50px;
  }
  
  .tick-label {
    font-size: 8px;
    width: 45px;
    padding-right: 5px;
  }
  
  .grid-lines {
    left: 65px;
    right: 20px;
  }
  
  .bars-container {
    padding: 0 15px;
    gap: 12px;
    height: 100%;
  }
  
  .bars-container.bars-count-1 .bar-column,
  .bars-container.bars-count-2 .bar-column,
  .bars-container.bars-count-3 .bar-column {
    width: 100%;
    max-width: none;
  }
  
  .bar-value-label {
    font-size: 10px;
  }
  
  .bar-vertical {
    border-radius: 8px 8px 0 0;
    padding-bottom: 6px;
  }
  
  .bar-percentage {
    font-size: 10px;
  }
  
  .empty-state {
    font-size: 12px;
  }
  
  /* Ocultar tooltip en móvil */
  .tooltip-container {
    display: none !important;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .vertical-bar-chart {
    border-radius: 8px;
  }
  
  .bar-header-dark {
    padding: 6px 8px;
    gap: 5px;
  }
  
  .bar-header-icon {
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: 4px;
  }
  
  .bar-header-icon svg {
    width: 9px;
    height: 9px;
  }
  
  .bar-header-title {
    font-size: 10px;
  }
  
  .bar-header-subtitle {
    font-size: 8px;
  }
  
  .export-btn-circle {
    width: 22px;
    height: 22px;
  }
  
  .export-btn-circle svg {
    width: 10px;
    height: 10px;
  }
  
  .export-dropdown-mini {
    min-width: 85px;
  }
  
  .export-option {
    padding: 7px 8px;
    font-size: 10px;
    gap: 5px;
  }
  
  .option-icon {
    font-size: 7px;
    padding: 2px 3px;
  }
  
  /* KPI Cards - mantener 3 columnas en móvil pequeño */
  .kpi-cards-row {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 4px;
    padding: 8px 8px 0 8px;
  }
  
  .kpi-card {
    padding: 5px;
    border-radius: 5px;
    border-width: 1px;
    width: 100%;
    box-sizing: border-box;
  }
  
  .kpi-dot {
    width: 6px;
    height: 6px;
    top: 5px;
    right: 5px;
  }
  
  .kpi-value {
    font-size: 10px;
  }
  
  .kpi-percentage,
  .kpi-position {
    font-size: 8px;
  }
  
  .kpi-label {
    font-size: 7px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .currency-legend {
    font-size: 8px;
    padding: 3px 8px 0 8px;
  }
  
  /* ✅ ALTURA FIJA para chart-area en móvil pequeño */
  .chart-area {
    padding: 12px 15px 15px 10px;
    margin: 6px 8px 8px 8px;
    width: calc(100% - 16px);
    border-radius: 5px;
    height: 220px;
    min-height: 220px;
    flex: none;
  }
  
  .y-axis {
    width: 40px;
  }
  
  .tick-label {
    font-size: 7px;
    width: 38px;
    padding-right: 3px;
  }
  
  .grid-lines {
    left: 50px;
    right: 15px;
    top: 12px;
    bottom: 15px;
  }
  
  .bars-container {
    padding: 0 10px;
    gap: 8px;
    height: 100%;
  }
  
  .bar-value-label {
    font-size: 9px;
    margin-bottom: 2px;
  }
  
  .bar-vertical {
    border-radius: 6px 6px 0 0;
    padding-bottom: 4px;
  }
  
  .bar-percentage {
    font-size: 9px;
  }
  
  .empty-state {
    font-size: 11px;
  }
}

/* Landscape en móviles */
@media (max-width: 768px) and (orientation: landscape) {
  .bar-header-dark {
    padding: 6px 8px;
  }
  
  .bar-header-icon {
    width: 20px;
    height: 20px;
  }
  
  .bar-header-title {
    font-size: 10px;
  }
  
  .bar-header-subtitle {
    font-size: 8px;
  }
  
  /* KPI Cards en fila en landscape */
  .kpi-cards-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    padding: 8px;
  }
  
  .kpi-card {
    padding: 6px;
  }
  
  .kpi-value {
    font-size: 11px;
  }
  
  .kpi-percentage,
  .kpi-position {
    font-size: 9px;
  }
  
  .kpi-label {
    font-size: 8px;
  }
  
  .currency-legend {
    font-size: 7px;
  }
  
  /* ✅ ALTURA FIJA para chart-area en landscape */
  .chart-area {
    padding: 10px 15px 12px 10px;
    margin: 5px 8px 8px 8px;
    height: 180px;
    min-height: 180px;
    flex: none;
  }
  
  .bars-container {
    height: 100%;
  }
  
  .y-axis {
    width: 45px;
  }
  
  .tick-label {
    font-size: 7px;
  }
  
  .bar-value-label {
    font-size: 8px;
  }
  
  .bar-percentage {
    font-size: 8px;
  }
}
</style>