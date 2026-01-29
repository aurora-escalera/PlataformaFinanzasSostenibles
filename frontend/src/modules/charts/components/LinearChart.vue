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
        <span class="btn-label">{{ getButtonLabel(varName) }}</span>
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
        :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
        preserveAspectRatio="xMidYMid meet"
        class="line-chart"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
        @click="handleClick"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <defs>
          <linearGradient v-for="varName in visibleVariables" :key="`grad-${varName}`" 
            :id="`gradient-${varName.replace(/\s+/g, '-')}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="getVariableColor(varName)" stop-opacity="0.2"/>
            <stop offset="100%" :stop-color="getVariableColor(varName)" stop-opacity="0.02"/>
          </linearGradient>
        </defs>

        <g class="grid">
          <line v-for="i in gridLines" :key="`grid-${i}`"
            :x1="chartPadding.left" :y1="chartPadding.top + (i - 1) * gridSpacing"
            :x2="dimensions.width - chartPadding.right" :y2="chartPadding.top + (i - 1) * gridSpacing"
            class="grid-line"/>
        </g>

        <g class="y-axis-labels">
          <text v-for="i in gridLines" :key="`y-label-${i}`"
            :x="chartPadding.left - 8" :y="chartPadding.top + (i - 1) * gridSpacing + 4"
            class="y-axis-label" text-anchor="end">
            {{ formatYAxisValue(getYAxisValue(i - 1)) }}
          </text>
        </g>

        <line v-if="hoverState.visible"
          :x1="hoverState.x" :y1="chartPadding.top"
          :x2="hoverState.x" :y2="dimensions.height - chartPadding.bottom"
          class="hover-line"/>

        <g class="lines">
          <g v-for="(varName, idx) in visibleVariables" :key="`line-${varName}`">
            <path 
              :d="getAreaPath(varName)" 
              :fill="`url(#gradient-${varName.replace(/\s+/g, '-')})`"
              class="area-fill"
              :style="{ animationDelay: `${idx * 0.1}s` }"/>

            <path :d="getLinePath(varName)" :stroke="getVariableColor(varName)"
              :stroke-width="responsiveStrokeWidth" fill="none" stroke-linecap="round" stroke-linejoin="round"
              :class="['line-path', { 'line-exit': animatingVariables.has(varName) }]"
              :style="{ animationDelay: animatingVariables.has(varName) ? '400ms' : `${idx * 0.1}s`,
                        animationDuration: animatingVariables.has(varName) ? '300ms' : '1.5s' }"/>

            <g class="permanent-data-points">
              <g v-for="(point, i) in getVariableData(varName)" :key="`point-group-${varName}-${i}`">
                <circle 
                  :cx="getXPosition(i)" 
                  :cy="getAnimatedY(varName, i)" 
                  :r="getHaloRadius(i)"
                  :fill="getVariableColor(varName)"
                  fill-opacity="0.15"
                  class="point-halo"/>
                
                <circle 
                  :cx="getXPosition(i)" 
                  :cy="getAnimatedY(varName, i)" 
                  :r="getPointRadius(i)"
                  :fill="getVariableColor(varName)"
                  stroke="white"
                  :stroke-width="responsivePointStroke"
                  class="point-main"
                  :class="{ 'point-hovered': hoverState.visible && hoverState.index === i }"/>
                
                <text 
                  :x="getXPosition(i)" 
                  :y="getAnimatedY(varName, i) - responsiveLabelOffset"
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

    <div v-if="hasData" class="x-axis-container">
      <div v-for="(label, i) in xLabels" :key="`x-${i}`" 
        class="x-axis-label" 
        :class="{ 'x-label-active': hoverState.visible && hoverState.index === i }"
        :style="{ left: getXPositionPercent(i) + '%' }">
        {{ label }}
      </div>
    </div>

    <transition name="tooltip-fade">
      <div 
        v-if="hoverState.visible" 
        class="tooltip-container"
        :class="{ locked: tooltipLocked }"
        :style="tooltipInternalStyle"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

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
const tooltipLocked = ref(false)
const animatingPoints = ref({})

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobileView = computed(() => windowWidth.value <= 768)

const chartPadding = computed(() => {
  const w = windowWidth.value
  if (w <= 320) return { top: 25, right: 10, bottom: 25, left: 30 }
  if (w <= 360) return { top: 28, right: 12, bottom: 28, left: 32 }
  if (w <= 390) return { top: 30, right: 15, bottom: 30, left: 35 }
  if (w <= 430) return { top: 32, right: 18, bottom: 32, left: 38 }
  if (w <= 480) return { top: 35, right: 20, bottom: 35, left: 42 }
  if (w <= 768) return { top: 40, right: 25, bottom: 40, left: 50 }
  return props.padding
})

const responsiveStrokeWidth = computed(() => {
  const w = windowWidth.value
  if (w <= 320) return 1.5
  if (w <= 390) return 2
  if (w <= 480) return 2.5
  return 3
})

const responsivePointStroke = computed(() => {
  const w = windowWidth.value
  if (w <= 320) return 1
  if (w <= 390) return 1.5
  return 2
})

const responsiveLabelOffset = computed(() => {
  const w = windowWidth.value
  if (w <= 320) return 10
  if (w <= 390) return 12
  if (w <= 480) return 13
  return 15
})

const getHaloRadius = (i) => {
  const w = windowWidth.value
  const isHovered = hoverState.value.visible && hoverState.value.index === i
  if (w <= 320) return isHovered ? 8 : 5
  if (w <= 390) return isHovered ? 9 : 6
  if (w <= 480) return isHovered ? 10 : 7
  return isHovered ? 12 : 8
}

const getPointRadius = (i) => {
  const w = windowWidth.value
  const isHovered = hoverState.value.visible && hoverState.value.index === i
  if (w <= 320) return isHovered ? 4 : 3
  if (w <= 390) return isHovered ? 5 : 3.5
  if (w <= 480) return isHovered ? 6 : 4
  return isHovered ? 7 : 5
}

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

const getButtonLabel = (varName) => {
  if (props.buttonLabels && props.buttonLabels[varName]) {
    return props.buttonLabels[varName]
  }
  return varName
}

const tooltipInternalStyle = computed(() => {
  if (!hoverState.value.visible || hoverState.value.index === -1) return { display: 'none' }
  
  const xPos = getXPositionPercent(hoverState.value.index)
  let topPos = '10%'
  let leftPos = xPos
  let transform = 'translateX(-50%)'
  
  if (xPos < 20) {
    leftPos = 5
    transform = 'translateX(0)'
  } else if (xPos > 80) {
    leftPos = 95
    transform = 'translateX(-100%)'
  }
  
  return { 
    left: `${leftPos}%`,
    top: topPos,
    transform: transform
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

const getXPositionPercent = i => {
  const len = props.xLabels.length
  if (len <= 1) return 50
  
  const leftPadPercent = (chartPadding.value.left / dimensions.value.width) * 100
  const rightPadPercent = (chartPadding.value.right / dimensions.value.width) * 100
  const availablePercent = 100 - leftPadPercent - rightPadPercent
  
  return leftPadPercent + (i / (len - 1)) * availablePercent
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

const formatPointValue = val => {
  if (val == null || isNaN(val)) return '—'
  return val.toFixed(2)
}

const getLinePath = v => {
  const d = animatedData.value[v]
  return d?.length ? d.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getXPosition(i)} ${getY(val)}`).join(' ') : ''
}

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
  if (tooltipLocked.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const scaleX = dimensions.value.width / rect.width
  const x = (e.clientX - rect.left) * scaleX
  processHover(x)
}

const handleTouchStart = e => {
  if (tooltipLocked.value) {
    tooltipLocked.value = false
    hoverState.value.visible = false
    return
  }
  e.preventDefault()
  const touch = e.touches[0]
  const rect = e.currentTarget.getBoundingClientRect()
  const scaleX = dimensions.value.width / rect.width
  const x = (touch.clientX - rect.left) * scaleX
  processHover(x)
  tooltipLocked.value = true
}

const handleTouchMove = e => {
  if (tooltipLocked.value) return
  e.preventDefault()
  const touch = e.touches[0]
  const rect = e.currentTarget.getBoundingClientRect()
  const scaleX = dimensions.value.width / rect.width
  const x = (touch.clientX - rect.left) * scaleX
  processHover(x)
}

const handleTouchEnd = () => {
  if (!tooltipLocked.value) {
    hideTooltip()
  }
}

const handleClick = (e) => {
  if (tooltipLocked.value) {
    tooltipLocked.value = false
    hoverState.value.visible = false
  } else {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = dimensions.value.width / rect.width
    const x = (e.clientX - rect.left) * scaleX
    processHover(x)
    tooltipLocked.value = true
  }
}

const handleMouseLeave = () => {
  if (!tooltipLocked.value) {
    hideTooltip()
  }
}

const processHover = (x) => {
  const len = props.xLabels.length
  if (len === 0) return
  
  let closest = 0
  
  if (len > 1) {
    for (let i = 0; i < len; i++) {
      const pointX = getXPosition(i)
      
      if (i === 0) {
        const nextX = getXPosition(1)
        const threshold = pointX + (nextX - pointX) * 0.7
        if (x < threshold) { closest = 0; break }
      } else if (i === len - 1) {
        closest = len - 1
      } else {
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
  tooltipLocked.value = false
}

const updateDimensions = () => {
  if (chartWrapper.value) {
    const rect = chartWrapper.value.getBoundingClientRect()
    const w = windowWidth.value
    
    const realWidth = rect.width > 0 ? rect.width : props.width
    let realHeight = rect.height > 0 ? rect.height : props.height
    
    if (w <= 768) {
      const minHeight = realWidth * 0.6
      realHeight = Math.max(realHeight, minHeight, 200)
    }
    
    dimensions.value = { 
      width: realWidth, 
      height: realHeight
    }
  } else {
    dimensions.value = { width: props.width, height: props.height }
  }
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  updateDimensions()
}

// ✅ Ocultar tooltip al hacer scroll
const handleScroll = () => {
  if (hoverState.value.visible) {
    hideTooltip()
  }
}

onMounted(async () => {
  await nextTick()
  
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
  
  handleResize()
  
  setTimeout(() => handleResize(), 100)
  setTimeout(() => handleResize(), 500)
  
  setTimeout(() => {
    const vars = Object.keys(props.data)
    if (vars.length > 0 && visibleVariables.value.length === 0) {
      vars.forEach(v => { if (!animatedData.value[v]) animatedData.value[v] = [...(props.data[v] || [])] })
      activateInitialVariables(vars)
    }
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<style scoped>
.linear-chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: visible;
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.header-content { flex: 1; }

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
  white-space: nowrap;
}

.btn-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.btn-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-btn.filter-active {
  background: white;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-btn.filter-inactive { opacity: 0.6; }
.filter-btn:hover { transform: scale(1.02); }

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #9ca3af;
  gap: 12px;
}

.no-data svg { opacity: 0.5; }
.no-data p { margin: 0; font-size: 14px; }

.chart-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  box-sizing: border-box;
}

.line-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
  max-width: 100%;
  display: block;
  touch-action: none;
}

.grid-line { stroke: #e5e7eb; stroke-width: 1; }

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

.area-fill {
  opacity: 0;
  animation: fadeInArea 1s ease-out forwards;
}

@keyframes fadeInArea { to { opacity: 1; } }

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

@keyframes drawLine { to { stroke-dashoffset: 0; } }
@keyframes fadeLine { from { opacity: 1; } to { opacity: 0; } }

.point-halo { transition: r 0.3s ease; }

.point-main {
  transition: all 0.3s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

.point-main.point-hovered {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}

.value-label-text {
  font-size: 12px;
  font-weight: 200;
  fill: #374151;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.value-label-text.label-hovered {
  font-size: 13px;
  font-weight: 300;
  fill: #1e293b;
}

.tooltip-container { 
  position: absolute;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #d0d0d0; 
  border-radius: 5px; 
  padding: 5px 7px; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
  pointer-events: none; 
  z-index: 100; 
  min-width: 80px;
  max-width: 130px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
  backdrop-filter: blur(4px);
}

.tooltip-container.locked {
  border: 1px solid #d0d0d0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.tooltip-header { margin-bottom: 4px; padding-bottom: 3px; border-bottom: 1px solid #eee; }
.tooltip-year-label { font-size: 9px; font-weight: 600; color: #333; }
.tooltip-content { display: flex; flex-direction: column; gap: 2px; }
.tooltip-item { display: flex; align-items: center; gap: 4px; font-size: 8px; }
.tooltip-color-indicator { width: 5px; height: 5px; border-radius: 1px; flex-shrink: 0; }
.tooltip-variable-name { color: #666; flex-shrink: 0; font-size: 7px; }
.tooltip-variable-value { color: #333; font-weight: 600; margin-left: auto; font-size: 8px; }
.tooltip-sub-item { padding-left: 9px; }
.tooltip-sub-item .tooltip-variable-name { color: #888; font-size: 6px; }
.tooltip-sub-item .tooltip-variable-value { font-size: 7px; }
.tooltip-position-value { color: #333; font-weight: 600; }
.tooltip-separator { height: 1px; background: #eee; margin: 2px 0; }
.tooltip-fade-enter-active, .tooltip-fade-leave-active { transition: all 0.15s ease; }
.tooltip-fade-enter-from, .tooltip-fade-leave-to { opacity: 0; }

@media (max-width: 1024px) {
  .linear-chart-container { padding: 16px; }
  .chart-title { font-size: 15px; }
  .filter-btn { padding: 7px 14px; font-size: 11px; }
}

@media (max-width: 768px) {
  .linear-chart-container { padding: 12px; border-radius: 10px; min-height: 280px; }
  .chart-header { margin-bottom: 8px; }
  .chart-title { font-size: 13px; }
  .chart-subtitle { font-size: 11px; }
  .variable-filters { padding: 4px; gap: 4px; margin-bottom: 8px; border-radius: 16px; }
  .filter-btn { padding: 6px 10px; font-size: 10px; gap: 5px; border-radius: 12px; }
  .btn-color-dot { width: 8px; height: 8px; }
  .chart-wrapper { min-height: 180px; }
  .line-chart { min-height: 180px; }
  .value-label-text { font-size: 11px; }
  .value-label-text.label-hovered { font-size: 12px; }
  .x-axis-container { height: 24px; margin-top: 4px; }
  .x-axis-label { font-size: 9px; padding: 2px 4px; }
  .y-axis-label { font-size: 9px; }
  .no-data { height: 200px; }
  .no-data svg { width: 36px; height: 36px; }
  .no-data p { font-size: 12px; }
}

@media (max-width: 430px) {
  .linear-chart-container { padding: 10px; border-radius: 8px; min-height: 260px; }
  .chart-title { font-size: 12px; }
  .chart-subtitle { font-size: 10px; }
  .variable-filters { padding: 3px; gap: 3px; margin-bottom: 6px; }
  .filter-btn { padding: 5px 8px; font-size: 9px; gap: 4px; border-radius: 10px; }
  .btn-color-dot { width: 7px; height: 7px; }
  .chart-wrapper { min-height: 160px; }
  .line-chart { min-height: 160px; }
  .value-label-text { font-size: 10px; }
  .value-label-text.label-hovered { font-size: 11px; }
  .x-axis-label { font-size: 8px; padding: 2px 3px; }
  .y-axis-label { font-size: 8px; }
}

@media (max-width: 412px) {
  .linear-chart-container { padding: 9px; }
  .chart-title { font-size: 11px; }
  .filter-btn { padding: 4px 7px; font-size: 8px; }
  .btn-label { max-width: 80px; }
  .value-label-text { font-size: 7px; }
  .x-axis-container { height: 20px; }
  .x-axis-label { font-size: 7px; }
  .y-axis-label { font-size: 7px; }
}

@media (max-width: 390px) {
  .linear-chart-container { padding: 8px; border-radius: 6px; min-height: 240px; }
  .chart-header { margin-bottom: 6px; }
  .chart-title { font-size: 11px; }
  .variable-filters { padding: 2px; gap: 2px; margin-bottom: 5px; border-radius: 12px; }
  .filter-btn { padding: 4px 6px; font-size: 8px; gap: 3px; border-radius: 8px; }
  .btn-color-dot { width: 6px; height: 6px; }
  .btn-label { max-width: 70px; }
  .chart-wrapper { min-height: 140px; }
  .line-chart { min-height: 140px; }
  .value-label-text { font-size: 9px; }
  .value-label-text.label-hovered { font-size: 10px; }
  .x-axis-container { height: 18px; margin-top: 3px; }
  .x-axis-label { font-size: 7px; padding: 1px 2px; }
  .y-axis-label { font-size: 7px; }
  .no-data { height: 150px; }
  .no-data svg { width: 28px; height: 28px; }
  .no-data p { font-size: 10px; }
}

@media (max-width: 360px) {
  .linear-chart-container { padding: 6px; border-radius: 5px; }
  .chart-header { margin-bottom: 4px; }
  .chart-title { font-size: 10px; }
  .chart-subtitle { font-size: 8px; }
  .variable-filters { padding: 2px; gap: 2px; margin-bottom: 4px; border-radius: 10px; }
  .filter-btn { padding: 3px 5px; font-size: 7px; gap: 2px; border-radius: 6px; }
  .btn-color-dot { width: 5px; height: 5px; }
  .btn-label { max-width: 55px; }
  .value-label-text { font-size: 8px; }
  .value-label-text.label-hovered { font-size: 9px; }
  .x-axis-container { height: 16px; margin-top: 2px; }
  .x-axis-label { font-size: 6px; padding: 1px 2px; }
  .y-axis-label { font-size: 6px; }
  .no-data { height: 120px; }
  .no-data svg { width: 24px; height: 24px; }
  .no-data p { font-size: 9px; }
}

@media (max-width: 320px) {
  .linear-chart-container { padding: 5px; border-radius: 4px; }
  .chart-header { margin-bottom: 3px; }
  .chart-title { font-size: 9px; }
  .chart-subtitle { font-size: 7px; }
  .variable-filters { padding: 1px; gap: 1px; margin-bottom: 3px; border-radius: 8px; }
  .filter-btn { padding: 2px 4px; font-size: 6px; gap: 2px; border-radius: 5px; }
  .btn-color-dot { width: 4px; height: 4px; }
  .btn-label { max-width: 45px; }
  .value-label-text { font-size: 7px; }
  .value-label-text.label-hovered { font-size: 8px; }
  .x-axis-container { height: 14px; margin-top: 2px; }
  .x-axis-label { font-size: 5px; padding: 1px; }
  .y-axis-label { font-size: 5px; }
  .no-data { height: 100px; }
  .no-data svg { width: 20px; height: 20px; }
  .no-data p { font-size: 8px; }
}

@media (max-width: 768px) {
  .linear-chart-container, .chart-wrapper, .x-axis-container {
    max-width: 100%;
    overflow-x: hidden;
  }
}
</style>