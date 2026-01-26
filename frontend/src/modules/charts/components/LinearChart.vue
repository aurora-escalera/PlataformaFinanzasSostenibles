<template>
  <div class="linear-chart-container">
    <div v-if="!hideHeader" class="chart-header">
      <div class="header-content">
        <h3 class="chart-title">{{ title }}</h3>
        <p v-if="subtitle" class="chart-subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div v-if="availableVariables.length > 0" class="variable-filters">
      <button 
        v-for="varName in availableVariables" 
        :key="varName"
        @click="toggleVariable(varName)"
        class="filter-btn"
        :class="{ 
          'filter-active': visibleVariables.includes(varName),
          'filter-inactive': !visibleVariables.includes(varName)
        }"
      >
        <span class="btn-color-dot" :style="{ backgroundColor: getVariableColor(varName) }"></span>
        {{ getButtonLabel(varName) }}
      </button>
    </div>

    <div v-if="!hasData" class="no-data">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
      </svg>
      <p>No hay datos disponibles</p>
    </div>

    <div v-else class="chart-wrapper" ref="chartWrapper">
      <svg 
        ref="svgRef"
        :width="dimensions.width" 
        :height="dimensions.height"
        class="line-chart"
        @mousemove="handleMouseMove"
        @mouseleave="hideTooltip"
      >
        <!-- Área de gradiente debajo de la línea -->
        <defs>
          <linearGradient v-for="varName in visibleVariables" :key="`grad-${varName}`" 
            :id="`gradient-${varName.replace(/\s+/g, '-')}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="getVariableColor(varName)" stop-opacity="0.2"/>
            <stop offset="100%" :stop-color="getVariableColor(varName)" stop-opacity="0.02"/>
          </linearGradient>
        </defs>

        <!-- Grid lines -->
        <g class="grid">
          <line v-for="i in gridLines" :key="`grid-${i}`"
            :x1="chartPadding.left" :y1="chartPadding.top + (i - 1) * gridSpacing"
            :x2="dimensions.width - chartPadding.right" :y2="chartPadding.top + (i - 1) * gridSpacing"
            class="grid-line"/>
        </g>

        <!-- Y axis labels -->
        <g class="y-axis-labels">
          <text v-for="i in gridLines" :key="`y-label-${i}`"
            :x="chartPadding.left - 10" :y="chartPadding.top + (i - 1) * gridSpacing + 4"
            class="y-axis-label" text-anchor="end">
            {{ formatYAxisValue(getYAxisValue(i - 1)) }}
          </text>
        </g>

        <!-- Hover line -->
        <line v-if="hoverState.visible"
          :x1="hoverState.x" :y1="chartPadding.top"
          :x2="hoverState.x" :y2="dimensions.height - chartPadding.bottom"
          class="hover-line"/>

        <!-- Lines and points -->
        <g class="lines">
          <g v-for="(varName, idx) in visibleVariables" :key="`line-${varName}`">
            <!-- Área con gradiente -->
            <path 
              :d="getAreaPath(varName)" 
              :fill="`url(#gradient-${varName.replace(/\s+/g, '-')})`"
              class="area-fill"
              :style="{ animationDelay: `${idx * 0.1}s` }"/>

            <!-- Línea principal -->
            <path :d="getLinePath(varName)" :stroke="getVariableColor(varName)"
              stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"
              :class="['line-path', { 'line-exit': animatingVariables.has(varName) }]"
              :style="{ animationDelay: animatingVariables.has(varName) ? '400ms' : `${idx * 0.1}s`,
                        animationDuration: animatingVariables.has(varName) ? '300ms' : '1.5s' }"/>

            <!-- Puntos permanentes visibles -->
            <g class="permanent-data-points">
              <g v-for="(point, i) in getVariableData(varName)" :key="`point-group-${varName}-${i}`">
                <!-- Círculo exterior (halo) -->
                <circle 
                  :cx="getXPosition(i)" 
                  :cy="getAnimatedY(varName, i)" 
                  :r="hoverState.visible && hoverState.index === i ? 12 : 8"
                  :fill="getVariableColor(varName)"
                  fill-opacity="0.15"
                  class="point-halo"/>
                
                <!-- Círculo principal -->
                <circle 
                  :cx="getXPosition(i)" 
                  :cy="getAnimatedY(varName, i)" 
                  :r="hoverState.visible && hoverState.index === i ? 7 : 5"
                  :fill="getVariableColor(varName)"
                  stroke="white"
                  stroke-width="2"
                  class="point-main"
                  :class="{ 'point-hovered': hoverState.visible && hoverState.index === i }"/>
                
                <!-- Etiqueta con el valor (solo número) -->
                <text 
                  :x="getXPosition(i)" 
                  :y="getAnimatedY(varName, i) - 15"
                  text-anchor="middle"
                  class="value-label-text"
                  :class="{ 'label-hovered': hoverState.visible && hoverState.index === i }">
                  {{ formatPointValue(point) }}
                </text>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>

    <!-- X axis labels -->
    <div v-if="hasData" class="x-axis-container">
      <div v-for="(label, i) in xLabels" :key="`x-${i}`" 
        class="x-axis-label" 
        :class="{ 'x-label-active': hoverState.visible && hoverState.index === i }"
        :style="{ left: `${getXPosition(i)}px` }">
        {{ label }}
      </div>
    </div>

    <!-- Tooltip con Teleport (igual que StackedArea) -->
    <Teleport to="body">
      <transition name="tooltip-fade">
        <div 
          v-if="hoverState.visible" 
          class="tooltip-container"
          :style="tooltipFixedStyle"
        >
          <div class="tooltip-header">
            <span class="tooltip-year-label">{{ hoverState.label }}</span>
          </div>
          <div class="tooltip-content">
            <template v-for="(item, idx) in tooltipItems" :key="item.key">
              <div v-if="idx > 0" class="tooltip-separator"></div>
              
              <div class="tooltip-item">
                <span class="tooltip-color-indicator" :style="{ backgroundColor: item.color }"></span>
                <span class="tooltip-variable-name">{{ getButtonLabel(item.name) }}:</span>
                <span class="tooltip-variable-value">{{ item.formattedValue }}</span>
              </div>
              
              <div v-if="item.position !== null" class="tooltip-item tooltip-sub-item">
                <span class="tooltip-variable-name">Posición:</span>
                <span class="tooltip-variable-value tooltip-position-value">No. {{ item.position }}</span>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Análisis histórico' },
  subtitle: { type: String, default: '' },
  data: { type: Object, default: () => ({}) },
  xLabels: { type: Array, default: () => ['2020', '2021', '2022', '2023', '2024'] },
  showLegend: { type: Boolean, default: true },
  gridLines: { type: Number, default: 5 },
  valueFormatter: { type: Function, default: null },
  width: { type: Number, default: 800 },
  height: { type: Number, default: 400 },
  padding: { type: Object, default: () => ({ top: 50, right: 40, bottom: 50, left: 60 }) },
  hideHeader: { type: Boolean, default: false },
  showCurrencySymbol: { type: Boolean, default: false },
  decimalPlaces: { type: Number, default: 2 },
  valueSuffix: { type: String, default: '' },
  valuePrefix: { type: String, default: '' },
  initialVisibleVariables: { type: Array, default: null },
  positionsByYear: { type: Object, default: () => ({}) },
  buttonLabels: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['variable-toggle'])
const chartWrapper = ref(null)
const svgRef = ref(null)
const dimensions = ref({ width: props.width, height: props.height })
const hoverState = ref({ visible: false, x: 0, index: -1, label: '', previousIndex: -1 })
const animatingPoints = ref({})
const chartPadding = computed(() => props.padding)

const colorPalette = ['#6b7280', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444']
const semanticColors = {
  'IS Total': '#10b981', 'IS': '#10b981', 'PS': '#10b981',
  'IIC Total': '#ef4444', 'IIC': '#ef4444', 'PIC': '#ef4444',
  'IFS': '#6b7280', ' IFS': '#6b7280'
}

const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])
const animatedData = ref({})
const animatingVariables = ref(new Set())

// Función para obtener el label del botón
const getButtonLabel = (varName) => {
  if (props.buttonLabels && props.buttonLabels[varName]) {
    return props.buttonLabels[varName]
  }
  return varName
}

// Posición del tooltip fija (estilo StackedArea)
const tooltipFixedStyle = computed(() => {
  if (!svgRef.value || !hoverState.value.visible) return {}
  
  const ctm = svgRef.value.getScreenCTM()
  if (!ctm) return {}
  
  // Obtener posición Y del punto
  let pointY = 0
  if (hoverState.value.index !== -1 && visibleVariables.value.length > 0) {
    const firstVar = visibleVariables.value[0]
    pointY = getAnimatedY(firstVar, hoverState.value.index)
  }
  
  const screenX = ctm.a * (hoverState.value.x + 200) + ctm.e
  const screenY = ctm.d * (pointY - 50) + ctm.f  // ← Tu ajuste de -180
  
  return { 
    left: `${screenX}px`, 
    top: `${screenY}px` 
  }
})

const tooltipItems = computed(() => {
  if (!hoverState.value.visible || hoverState.value.index === -1) return []
  const year = String(hoverState.value.label)
  const index = hoverState.value.index
  
  return visibleVariables.value.map(varName => {
    const data = props.data[varName] || []
    const value = data[index]
    const color = getVariableColor(varName)
    let position = null
    if (props.positionsByYear && props.positionsByYear[year]) {
      position = props.positionsByYear[year][varName] ?? null
    }
    return { key: `${varName}-${year}`, name: varName, value, formattedValue: formatValue(value), color, position }
  })
})

watch(() => props.data, (newData, oldData) => {
  const vars = Object.keys(newData)
  vars.forEach(v => { if (!animatedData.value[v]) animatedData.value[v] = [...(newData[v] || [])] })
  if ((!oldData || Object.keys(oldData).length === 0) && vars.length > 0 && visibleVariables.value.length === 0) {
    activateInitialVariables(vars)
  }
  nextTick(() => updateDimensions())
}, { deep: true })

watch(() => props.positionsByYear, (v) => console.log('📍 [LinearChart] positionsByYear:', v), { deep: true, immediate: true })
watch(availableVariables, () => nextTick(() => updateDimensions()))
watch([() => props.width, () => props.height], () => updateDimensions())

const chartHeight = computed(() => dimensions.value.height - chartPadding.value.top - chartPadding.value.bottom)
const chartWidth = computed(() => dimensions.value.width - chartPadding.value.left - chartPadding.value.right)
const gridSpacing = computed(() => chartHeight.value / (props.gridLines - 1))

const allVisibleValues = computed(() => {
  const vals = []
  visibleVariables.value.forEach(v => {
    if (props.data[v]) vals.push(...props.data[v].filter(x => x != null && !isNaN(x)))
  })
  return vals.length > 0 ? vals : [0]
})

const maxValue = computed(() => {
  const max = Math.max(...allVisibleValues.value), min = Math.min(...allVisibleValues.value)
  return max === min ? (max > 0 ? max * 1.2 : max + 10) : max + (max - min) * 0.25
})

const minValue = computed(() => {
  const max = Math.max(...allVisibleValues.value), min = Math.min(...allVisibleValues.value)
  return max === min ? (min > 0 ? min * 0.8 : min - 10) : min - (max - min) * 0.15
})

const hasData = computed(() => visibleVariables.value.length > 0 && visibleVariables.value.some(v => props.data[v]?.length > 0))
const getVariableData = v => props.data[v] || []

const getVariableColor = v => {
  if (semanticColors[v]) return semanticColors[v]
  const l = v.toLowerCase()
  if (l.includes('sostenible') || l === 'is' || l.includes('ps')) return '#10b981'
  if (l.includes('carbono') || l.includes('iic') || l.includes('pic')) return '#ef4444'
  if (l.includes('total') || l.includes('ifs')) return '#6b7280'
  return colorPalette[availableVariables.value.indexOf(v) % colorPalette.length]
}

const getXPosition = i => {
  const len = props.xLabels.length
  if (len <= 1) return chartPadding.value.left + chartWidth.value / 2
  return chartPadding.value.left + i * (dimensions.value.width - chartPadding.value.left - chartPadding.value.right) / (len - 1)
}

const getY = val => {
  if (val == null || isNaN(val)) return dimensions.value.height - chartPadding.value.bottom
  const range = maxValue.value - minValue.value
  if (range === 0) return chartPadding.value.top + chartHeight.value / 2
  return Math.max(chartPadding.value.top, Math.min(dimensions.value.height - chartPadding.value.bottom,
    chartPadding.value.top + chartHeight.value * (1 - (val - minValue.value) / range)))
}

const getAnimatedY = (v, i) => getY(animatedData.value[v]?.[i])
const getYAxisValue = i => maxValue.value - (maxValue.value - minValue.value) / (props.gridLines - 1) * i

const formatYAxisValue = val => {
  if (props.valueFormatter) return props.valueFormatter(val)
  const pre = props.showCurrencySymbol ? '$' : props.valuePrefix
  const suf = props.valueSuffix
  if (props.decimalPlaces !== null) return `${pre}${val.toFixed(props.decimalPlaces)}${suf}`
  return `${pre}${val.toFixed(2)}${suf}`
}

const formatValue = val => {
  if (val == null) return 'N/A'
  if (props.valueFormatter) return props.valueFormatter(val)
  const pre = props.showCurrencySymbol ? '$' : props.valuePrefix
  const suf = props.valueSuffix
  if (props.decimalPlaces !== null) return `${pre}${val.toFixed(props.decimalPlaces)}${suf}`
  return `${pre}${val.toFixed(2)}${suf}`
}

// Formato compacto para las etiquetas sobre los puntos
const formatPointValue = val => {
  if (val == null || isNaN(val)) return '—'
  return val.toFixed(2)
}

const getLinePath = v => {
  const d = animatedData.value[v]
  return d?.length ? d.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getXPosition(i)} ${getY(val)}`).join(' ') : ''
}

// Path para el área con gradiente
const getAreaPath = v => {
  const d = animatedData.value[v]
  if (!d?.length) return ''
  
  const linePath = d.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getXPosition(i)} ${getY(val)}`).join(' ')
  const bottomY = dimensions.value.height - chartPadding.value.bottom
  const lastX = getXPosition(d.length - 1)
  const firstX = getXPosition(0)
  
  return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
}

const toggleVariable = v => {
  const idx = visibleVariables.value.indexOf(v)
  if (idx > -1) {
    animatingVariables.value.add(v)
    const data = props.data[v]
    if (data) {
      const startVals = [...animatedData.value[v]], endVal = minValue.value - (maxValue.value - minValue.value) * 0.5
      const start = Date.now()
      const anim = () => {
        const p = Math.min((Date.now() - start) / 800, 1), e = 1 - Math.pow(1 - p, 3)
        animatedData.value[v] = startVals.map(x => x - (x - endVal) * e)
        if (p < 1) requestAnimationFrame(anim)
        else { visibleVariables.value.splice(visibleVariables.value.indexOf(v), 1); animatingVariables.value.delete(v) }
      }
      anim()
    }
  } else {
    visibleVariables.value.push(v)
    animatingVariables.value.add(v)
    const data = props.data[v]
    if (data) {
      const startVal = minValue.value - (maxValue.value - minValue.value) * 0.5
      animatedData.value[v] = new Array(data.length).fill(startVal)
      const start = Date.now()
      const anim = () => {
        const p = Math.min((Date.now() - start) / 800, 1), e = 1 - Math.pow(1 - p, 3)
        animatedData.value[v] = data.map(x => startVal + (x - startVal) * e)
        if (p < 1) requestAnimationFrame(anim)
        else { animatedData.value[v] = [...data]; animatingVariables.value.delete(v) }
      }
      anim()
    }
  }
  emit('variable-toggle', v, visibleVariables.value.includes(v))
}

const handleMouseMove = e => {
  const rect = e.currentTarget.getBoundingClientRect()
  const scaleX = dimensions.value.width / rect.width
  const x = (e.clientX - rect.left) * scaleX
  
  const len = props.xLabels.length
  if (len === 0) return
  
  let closest = 0
  
  if (len > 1) {
    for (let i = 0; i < len; i++) {
      const pointX = getXPosition(i)
      
      // El punto se activa cuando el cursor está a 30% de distancia ANTES del punto
      // (desde el punto anterior hacia este punto)
      if (i === 0) {
        // Primer punto: activo desde el inicio hasta 70% hacia el segundo punto
        const nextX = getXPosition(1)
        const threshold = pointX + (nextX - pointX) * 0.7
        if (x < threshold) { closest = 0; break }
      } else if (i === len - 1) {
        // Último punto: siempre activo después del threshold del penúltimo
        closest = len - 1
      } else {
        // Puntos intermedios: activo desde 30% antes hasta 70% después
        const prevX = getXPosition(i - 1)
        const nextX = getXPosition(i + 1)
        const startThreshold = prevX + (pointX - prevX) * 0.3
        const endThreshold = pointX + (nextX - pointX) * 0.7
        
        if (x >= startThreshold && x < endThreshold) { closest = i; break }
      }
    }
  }
  
  const prev = hoverState.value.index
  hoverState.value = { 
    visible: true, 
    x: getXPosition(closest), 
    index: closest, 
    label: props.xLabels[closest], 
    previousIndex: prev 
  }
}

const activateInitialVariables = vars => {
  if (props.initialVisibleVariables?.length > 0) {
    props.initialVisibleVariables.forEach((n, i) => {
      const m = vars.find(v => v === n || v.trim() === n.trim())
      if (m) setTimeout(() => toggleVariable(m), 100 + i * 400)
    })
  } else {
    if (vars[0]) setTimeout(() => toggleVariable(vars[0]), 100)
    if (vars[1]) setTimeout(() => toggleVariable(vars[1]), 900)
  }
}

const hideTooltip = () => { 
  hoverState.value = { visible: false, x: 0, index: -1, label: '', previousIndex: -1 }
  animatingPoints.value = {} 
}

const updateDimensions = () => { dimensions.value = { width: props.width, height: props.height } }

onMounted(async () => {
  await nextTick()
  updateDimensions()
  console.log('🚀 [LinearChart] Montado - positionsByYear:', props.positionsByYear)
  setTimeout(() => {
    const vars = Object.keys(props.data)
    if (vars.length > 0 && visibleVariables.value.length === 0) {
      vars.forEach(v => { if (!animatedData.value[v]) animatedData.value[v] = [...(props.data[v] || [])] })
      activateInitialVariables(vars)
    }
  }, 100)
})
</script>

<style scoped>
.linear-chart-container {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: visible;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  line-height: 1.4;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chart-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
  text-align: center;
}

.variable-filters {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 6px;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: #666;
  transition: all 0.3s ease;
}

.btn-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.filter-btn.filter-active {
  background: white;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-btn.filter-inactive {
  opacity: 0.6;
}

.filter-btn:hover {
  transform: scale(1.02);
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #9ca3af;
  gap: 12px;
}

.no-data svg {
  opacity: 0.5;
}

.no-data p {
  margin: 0;
  font-size: 14px;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  overflow: visible;
  box-sizing: border-box;
}

.line-chart {
  width: 100%;
  height: 100%;
  display: block;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
}

.y-axis-label {
  font-size: 12px;
  font-weight: 400;
  fill: #9ca3af;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

.hover-line {
  stroke: #d1d5db;
  stroke-width: 1;
  stroke-dasharray: 4 4;
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.x-axis-container {
  position: relative;
  width: 100%;
  height: 30px;
  margin-top: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  overflow: visible;
  box-sizing: border-box;
}

.x-axis-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  white-space: nowrap;
  user-select: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.x-axis-label.x-label-active {
  color: #374151;
  font-weight: 600;
  background: #f3f4f6;
}

/* Área con gradiente */
.area-fill {
  opacity: 0;
  animation: fadeInArea 1s ease-out forwards;
}

@keyframes fadeInArea {
  to { opacity: 1; }
}

/* Línea principal */
.line-path {
  stroke-dasharray: 3000;
  stroke-dashoffset: 3000;
  animation: drawLine 1.5s ease-out forwards;
}

.line-path.line-exit {
  animation: fadeLine 300ms ease-out forwards;
  stroke-dasharray: none;
  stroke-dashoffset: 0;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

@keyframes fadeLine {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Puntos */
.point-halo {
  transition: r 0.3s ease;
}

.point-main {
  transition: all 0.3s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

.point-main.point-hovered {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}

/* Etiquetas de valor sobre los puntos - SOLO NÚMERO EN GRIS */
.value-label-text {
  font-size: 12px;
  font-weight: 600;
  fill: #6b7280;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s ease;
}

.value-label-text.label-hovered {
  font-size: 14px;
  font-weight: 700;
  fill: #374151;
}

/* Tooltip con Teleport (igual que StackedArea) */
.tooltip-container { 
  position: fixed; 
  transform: translate(-50%, -100%); 
  background: white; 
  border: 1px solid #e0e0e0; 
  border-radius: 8px; 
  padding: 12px 14px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
  pointer-events: none; 
  z-index: 99999; 
  min-width: 200px; 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
}

.tooltip-container::after { 
  content: ''; 
  position: absolute; 
  top: 100%; 
  left: 50%; 
  transform: translateX(-50%); 
  border: 8px solid transparent; 
  border-top-color: white; 
}

.tooltip-header { 
  margin-bottom: 10px; 
  padding-bottom: 8px; 
  border-bottom: 1px solid #f0f0f0; 
}

.tooltip-year-label { 
  font-size: 14px; 
  font-weight: 600; 
  color: #333; 
}

.tooltip-content { 
  display: flex; 
  flex-direction: column; 
  gap: 5px; 
}

.tooltip-item { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 13px; 
}

.tooltip-color-indicator { 
  width: 10px; 
  height: 10px; 
  border-radius: 2px; 
  flex-shrink: 0; 
}

.tooltip-variable-name { 
  color: #666; 
  flex-shrink: 0; 
}

.tooltip-variable-value { 
  color: #333; 
  font-weight: 600; 
  margin-left: auto; 
}

.tooltip-sub-item { 
  padding-left: 18px; 
}

.tooltip-sub-item .tooltip-variable-name { 
  color: #888; 
  font-size: 11px; 
}

.tooltip-sub-item .tooltip-variable-value { 
  font-size: 11px; 
}

.tooltip-position-value { 
  color: #333; 
  font-weight: 600; 
}

.tooltip-separator { 
  height: 1px; 
  background: #e0e0e0; 
  margin: 4px 0; 
}

.tooltip-fade-enter-active, 
.tooltip-fade-leave-active { 
  transition: all 0.2s ease; 
}

.tooltip-fade-enter-from, 
.tooltip-fade-leave-to { 
  opacity: 0; 
}

/* Responsive */
@media (max-width: 768px) {
  .linear-chart-container {
    padding: 12px;
    border-radius: 10px;
  }
  
  .chart-title {
    font-size: 13px;
  }
  
  .filter-btn {
    padding: 6px 12px;
    font-size: 10px;
  }
  
  .value-label-text {
    font-size: 10px;
  }
  
  .value-label-text.label-hovered {
    font-size: 11px;
  }
  
  .x-axis-label {
    font-size: 10px;
  }
  
  .y-axis-label {
    font-size: 10px;
  }
  
  .tooltip-container {
    padding: 10px 12px;
    min-width: 160px;
  }
  
  .tooltip-year-label {
    font-size: 12px;
  }
  
  .tooltip-item {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .linear-chart-container {
    padding: 10px;
  }
  
  .chart-title {
    font-size: 12px;
  }
  
  .filter-btn {
    padding: 5px 10px;
    font-size: 9px;
    gap: 4px;
  }
  
  .btn-color-dot {
    width: 8px;
    height: 8px;
  }
  
  .value-label-text {
    font-size: 9px;
  }
  
  .tooltip-container {
    padding: 8px 10px;
    min-width: 140px;
  }
  
  .tooltip-year-label {
    font-size: 11px;
  }
  
  .tooltip-item {
    font-size: 10px;
  }
}
</style>