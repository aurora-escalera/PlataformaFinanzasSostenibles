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
        {{ varName }}
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
        :width="dimensions.width" 
        :height="dimensions.height"
        class="line-chart"
        @mousemove="handleMouseMove"
        @mouseleave="hideTooltip"
      >
        <g class="grid">
          <line v-for="i in gridLines" :key="`grid-${i}`"
            :x1="chartPadding.left" :y1="chartPadding.top + (i - 1) * gridSpacing"
            :x2="dimensions.width - chartPadding.right" :y2="chartPadding.top + (i - 1) * gridSpacing"
            class="grid-line"/>
        </g>

        <g class="y-axis-labels">
          <text v-for="i in gridLines" :key="`y-label-${i}`"
            :x="chartPadding.left - 10" :y="chartPadding.top + (i - 1) * gridSpacing + 4"
            class="y-axis-label" text-anchor="end">
            {{ formatYAxisValue(getYAxisValue(i - 1)) }}
          </text>
        </g>

        <line v-if="hoverState.visible"
          :x1="hoverState.x" :y1="chartPadding.top"
          :x2="hoverState.x" :y2="dimensions.height - chartPadding.bottom"
          class="hover-line" stroke="#9ca3af" stroke-width="0.5" stroke-dasharray="4 4"/>

        <g class="lines">
          <g v-for="(varName, idx) in visibleVariables" :key="`line-${varName}`">
            <path :d="getLinePath(varName)" :stroke="getVariableColor(varName)"
              stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"
              :class="['line-path', { 'line-exit': animatingVariables.has(varName) }]"
              :style="{ animationDelay: animatingVariables.has(varName) ? '400ms' : `${idx * 0.1}s`,
                        animationDuration: animatingVariables.has(varName) ? '300ms' : '1.5s' }"/>

            <g class="animated-data-points">
              <circle v-if="hoverState.visible && animatingPoints[`${varName}-x`] !== undefined"
                :cx="getAnimatedPointX(varName)" :cy="getAnimatedPointY(varName)" :r="5"
                :fill="getDarkerColor(varName)" class="data-point animated-point"
                :style="{ filter: `drop-shadow(0 0 8px ${getDarkerColor(varName)})`, opacity: 1 }"/>
            </g>

            <g class="permanent-data-points">
              <circle v-for="(point, i) in getVariableData(varName)" :key="`perm-${varName}-${i}`"
                :cx="getXPosition(i)" :cy="getAnimatedY(varName, i)" :r="2"
                :fill="getVariableColor(varName)" class="data-point-permanent"/>
            </g>

            <g class="data-points">
              <circle v-for="(point, i) in getVariableData(varName)" :key="`pt-${varName}-${i}`"
                :cx="getXPosition(i)" :cy="getAnimatedY(varName, i)"
                :r="hoverState.visible && hoverState.index === i && animatingPoints[`${varName}-x`] === undefined ? 5 : 0"
                :fill="getVariableColor(varName)"
                :class="['data-point', { 'is-hovered': hoverState.visible && hoverState.index === i }]"
                :style="{ filter: `drop-shadow(0 0 8px ${getVariableColor(varName)})` }"/>
            </g>
          </g>
        </g>
      </svg>

      <transition name="tooltip-fade">
        <div v-if="hoverState.visible" class="tooltip-container" :style="{ left: `${hoverState.x}px` }">
          <div class="tooltip-header">
            <span class="tooltip-year-label">{{ hoverState.label }}</span>
          </div>
          <div class="tooltip-content">
            <template v-for="item in tooltipItems" :key="item.key">
              <div class="tooltip-item">
                <span class="tooltip-color-indicator" :style="{ backgroundColor: item.color }"></span>
                <span class="tooltip-variable-name">{{ item.name }}:</span>
                <span class="tooltip-variable-value">{{ item.formattedValue }}</span>
              </div>
              <div v-if="item.position !== null" class="tooltip-item tooltip-position">

                <span class="tooltip-variable-name">Posición:</span>
                <span class="tooltip-variable-value tooltip-position-value">No. {{ item.position }}</span>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </div>

    <div v-if="hasData" class="x-axis-container">
      <div v-for="(label, i) in xLabels" :key="`x-${i}`" class="x-axis-label" :style="{ left: `${getXPosition(i)}px` }">
        {{ label }}
      </div>
    </div>
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
  padding: { type: Object, default: () => ({ top: 30, right: 40, bottom: 90, left: 60 }) },
  hideHeader: { type: Boolean, default: false },
  showCurrencySymbol: { type: Boolean, default: true },
  decimalPlaces: { type: Number, default: null },
  valueSuffix: { type: String, default: '' },
  valuePrefix: { type: String, default: '' },
  initialVisibleVariables: { type: Array, default: null },
  positionsByYear: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['variable-toggle'])
const chartWrapper = ref(null)
const dimensions = ref({ width: props.width, height: props.height })
const hoverState = ref({ visible: false, x: 0, index: -1, label: '', previousIndex: -1 })
const animatingPoints = ref({})
const chartPadding = computed(() => props.padding)
const colorPalette = ['#7cb342', '#9E9E9E', '#DC143C', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444']
const semanticColors = {
  'IS Total': '#7cb342', 'IS': '#7cb342', 'PS': '#7cb342',
  'IIC Total': '#DC143C', 'IIC': '#DC143C', 'PIC': '#DC143C',
  'IFS': '#9E9E9E', ' IFS': '#9E9E9E'
}

const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])
const animatedData = ref({})
const animatingVariables = ref(new Set())

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
  return max === min ? (max > 0 ? max * 1.2 : max + 10) : max + (max - min) * 0.2
})

const minValue = computed(() => {
  const max = Math.max(...allVisibleValues.value), min = Math.min(...allVisibleValues.value)
  return max === min ? (min > 0 ? min * 0.8 : min - 10) : min - (max - min) * 0.2
})

const hasData = computed(() => visibleVariables.value.length > 0 && visibleVariables.value.some(v => props.data[v]?.length > 0))
const getVariableData = v => props.data[v] || []

const getVariableColor = v => {
  if (semanticColors[v]) return semanticColors[v]
  const l = v.toLowerCase()
  if (l.includes('sostenible') || l === 'is' || l.includes('ps')) return '#7cb342'
  if (l.includes('carbono') || l.includes('iic') || l.includes('pic')) return '#DC143C'
  if (l.includes('total') || l.includes('ifs')) return '#9E9E9E'
  return colorPalette[availableVariables.value.indexOf(v) % colorPalette.length]
}

const getDarkerColor = v => {
  const c = getVariableColor(v).replace('#', '')
  return `rgb(${Math.max(0, parseInt(c.substr(0,2),16)-30)},${Math.max(0, parseInt(c.substr(2,2),16)-30)},${Math.max(0, parseInt(c.substr(4,2),16)-30)})`
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
  const pre = props.showCurrencySymbol ? '$' : props.valuePrefix, suf = props.valueSuffix
  if (props.decimalPlaces !== null) return `${pre}${val.toFixed(props.decimalPlaces)}${suf}`
  if (props.showCurrencySymbol) {
    if (Math.abs(val) >= 1e9) return `$${(val/1e9).toFixed(1)}B`
    if (Math.abs(val) >= 1e6) return `$${(val/1e6).toFixed(1)}M`
    if (Math.abs(val) >= 1e3) return `$${(val/1e3).toFixed(1)}K`
    return `$${Math.round(val)}`
  }
  return Math.abs(val) < 10 ? `${pre}${val.toFixed(2)}${suf}` : `${pre}${Math.round(val)}${suf}`
}

const formatValue = val => {
  if (val == null) return 'N/A'
  if (props.valueFormatter) return props.valueFormatter(val)
  const pre = props.showCurrencySymbol ? '$' : props.valuePrefix, suf = props.valueSuffix
  if (props.decimalPlaces !== null) return `${pre}${val.toFixed(props.decimalPlaces)}${suf}`
  if (props.showCurrencySymbol) {
    if (Math.abs(val) >= 1e9) return `$${(val/1e9).toFixed(1)}B`
    if (Math.abs(val) >= 1e6) return `$${(val/1e6).toFixed(1)}M`
    if (Math.abs(val) >= 1e3) return `$${(val/1e3).toFixed(1)}K`
    return `$${val.toFixed(0)}`
  }
  return Math.abs(val) < 10 ? `${pre}${val.toFixed(2)}${suf}` : `${pre}${val.toFixed(0)}${suf}`
}

const getLinePath = v => {
  const d = animatedData.value[v]
  return d?.length ? d.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getXPosition(i)} ${getY(val)}`).join(' ') : ''
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

const getAnimatedPointX = v => animatingPoints.value[`${v}-x`] || 0
const getAnimatedPointY = v => animatingPoints.value[`${v}-y`] || 0

const handleMouseMove = e => {
  const rect = e.currentTarget.getBoundingClientRect(), x = e.clientX - rect.left
  const len = props.xLabels.length
  let closest = 0
  if (len > 1) {
    for (let i = 0; i < len - 1; i++) {
      if (x < getXPosition(i) + (getXPosition(i+1) - getXPosition(i)) * 0.5) { closest = i; break }
      closest = i + 1
    }
  }
  const prev = hoverState.value.index
  hoverState.value = { visible: true, x: getXPosition(closest), index: closest, label: props.xLabels[closest], previousIndex: prev }
  if (prev !== closest && prev !== -1) animatePointTransition(prev, closest)
}

const animatePointTransition = (from, to) => {
  visibleVariables.value.forEach(v => {
    const sx = getXPosition(from), ex = getXPosition(to), sy = getAnimatedY(v, from), ey = getAnimatedY(v, to)
    const start = Date.now()
    const anim = () => {
      const p = Math.min((Date.now() - start) / 200, 1), e = 1 - Math.pow(1 - p, 3)
      animatingPoints.value[`${v}-x`] = sx + (ex - sx) * e
      animatingPoints.value[`${v}-y`] = sy + (ey - sy) * e
      if (p < 1) requestAnimationFrame(anim)
      else { delete animatingPoints.value[`${v}-x`]; delete animatingPoints.value[`${v}-y`] }
    }
    anim()
  })
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

const hideTooltip = () => { hoverState.value = { visible: false, x: 0, index: -1, label: '', previousIndex: -1 }; animatingPoints.value = {} }
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
.linear-chart-container { width: 100%; height: 100%; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; box-sizing: border-box; overflow: visible; }
.chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-shrink: 0; }
.header-content { flex: 1; }
.chart-title { font-size: 14px; font-weight: 600; color: #2c3e50; margin: 0 0 4px 0; line-height: 1.4; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.chart-subtitle { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4; text-align: center; }
.variable-filters { background: #f5f5f5; border-radius: 20px; padding: 6px; margin-bottom: 12px; display: flex; justify-content: center; width: 100%; gap: 4px; flex-wrap: wrap; }
.filter-btn { padding: 6px 14px; border: none; border-radius: 16px; cursor: pointer; font-size: 11px; font-weight: 500; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; gap: 6px; background: transparent; color: #666; transition: all 0.3s ease; }
.btn-color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.filter-btn.filter-active { background: white; color: #2c3e50; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.filter-btn.filter-inactive { background: transparent; color: #999; opacity: 0.7; }
.filter-btn:hover { transform: scale(1.05); }
.no-data { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #9ca3af; gap: 12px; }
.no-data svg { opacity: 0.5; }
.no-data p { margin: 0; font-size: 14px; }
.chart-wrapper { position: relative; width: 100%; flex: 1; min-height: 0; display: flex; align-items: stretch; overflow: visible; box-sizing: border-box; }
.line-chart { width: 100%; height: 100%; display: block; }
.grid-line { stroke: #e5e7eb; stroke-width: 1; }
.y-axis-label { font-size: 14px; font-weight: 300; fill: #6b7280; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; user-select: none; }
.hover-line { transition: opacity 0.15s ease; pointer-events: none; }
.x-axis-container { position: relative; width: 100%; height: 30px; margin-top: 8px; flex-shrink: 0; display: flex; align-items: center; overflow: visible; box-sizing: border-box; }
.x-axis-label { position: absolute; transform: translateX(-50%); font-size: 12px; font-weight: 100; color: #6b7280; white-space: nowrap; user-select: none; }
.line-path { stroke-dasharray: 3000; stroke-dashoffset: 3000; animation: drawLine 1.5s ease-out forwards; }
.line-path.line-exit { animation: fadeLine 300ms ease-out forwards; stroke-dasharray: none; stroke-dashoffset: 0; }
.data-point-permanent { opacity: 1; transform-origin: center; transition: cy 0.05s ease; }
.data-point { opacity: 1; transform-origin: center; transition: r 0.2s ease, cy 0.05s ease; }
.animated-point { transition: none !important; animation: none !important; }
.data-point.is-hovered { opacity: 1; filter: drop-shadow(0 0 6px rgba(0,0,0,0.4)); }
@keyframes drawLine { to { stroke-dashoffset: 0; } }
@keyframes fadeLine { from { opacity: 1; } to { opacity: 0; } }
.tooltip-container { position: absolute; top: -10px; transform: translateX(-50%); background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); pointer-events: none; z-index: 100; min-width: 160px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; transition: left 0.15s ease; }
.tooltip-header { margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #f0f0f0; }
.tooltip-year-label { font-size: 12px; font-weight: 600; color: #333; }
.tooltip-content { display: flex; flex-direction: column; gap: 6px; }
.tooltip-item { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.tooltip-color-indicator { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
.tooltip-variable-name { color: #666; flex-shrink: 0; }
.tooltip-variable-value { color: #333; font-weight: 600; margin-left: auto; }
.tooltip-position { border-top: 1px dashed #e0e0e0; padding-top: 6px; margin-top: 2px; }
.tooltip-position-icon { font-size: 10px; }
.tooltip-position-value { color: #333; font-weight: 700; }
.tooltip-fade-enter-active, .tooltip-fade-leave-active { transition: opacity 0.2s ease; }
.tooltip-fade-enter-from, .tooltip-fade-leave-to { opacity: 0; }
</style>