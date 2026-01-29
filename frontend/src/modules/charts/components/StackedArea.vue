<template>
  <div class="area-chart-container" ref="containerRef">
    <div v-if="!props.hideHeader" class="chart-header">
      <div class="header-content">
        <h3 class="chart-title">{{ title }}</h3>
        <p v-if="subtitle" class="chart-subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div v-if="availableVariables.length > 0" class="variable-filters">
      <button 
        v-for="variable in availableVariables" 
        :key="variable"
        @click="toggleVariable(variable)"
        class="filter-btn"
        :class="{ 
          'filter-active': visibleVariables.includes(variable),
          'filter-inactive': !visibleVariables.includes(variable)
        }"
      >
        <span class="btn-color-dot" :style="{ backgroundColor: getVariableColor(variable) }"></span>
        <span class="btn-label">{{ getButtonLabel(variable) }}</span>
      </button>
    </div>

    <div 
      v-if="availableVariables.length > 0" 
      class="currency-legend"
      :style="{ color: props.hideCurrencyLegend ? 'transparent' : '#888' }"
    >
      * Cifras en dólares estadounidenses (USD)
    </div>

    <div v-if="!hasData" class="no-data">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3v18h18"/>
        <path d="M18 17V9"/>
        <path d="M13 17V5"/>
        <path d="M8 17v-3"/>
      </svg>
      <p>No hay datos disponibles</p>
    </div>

    <div v-else class="chart-wrapper" ref="chartWrapper">
      <svg 
        ref="svgRef"
        :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
        preserveAspectRatio="xMidYMid meet"
        class="area-chart"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
        @click="handleClick"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <g class="grid">
          <line
            v-for="i in gridLines"
            :key="`grid-${i}`"
            :x1="chartPadding.left"
            :y1="chartPadding.top + (i - 1) * gridSpacing"
            :x2="dimensions.width - chartPadding.right"
            :y2="chartPadding.top + (i - 1) * gridSpacing"
            class="grid-line"
          />
        </g>

        <g class="y-axis-labels">
          <text
            v-for="i in gridLines"
            :key="`y-label-${i}`"
            :x="chartPadding.left - 8"
            :y="chartPadding.top + (i - 1) * gridSpacing + 3"
            class="y-axis-label"
            text-anchor="end"
          >
            {{ formatYAxisValue(getYAxisValue(i - 1)) }}
          </text>
        </g>

        <g class="x-axis-labels">
          <text
            v-for="(label, i) in props.xLabels"
            :key="`x-label-${i}`"
            :x="getXPosition(i)"
            :y="dimensions.height - chartPadding.bottom + 20"
            class="x-axis-label-svg"
            text-anchor="middle"
          >
            {{ label }}
          </text>
        </g>

        <defs>
          <linearGradient
            v-for="variable in visibleVariables"
            :key="`gradient-${variable}`"
            :id="`gradient-${getVariableId(variable)}`"
            x1="0%" y1="0%" x2="0%" y2="100%"
          >
            <stop offset="0%" :stop-color="getVariableColor(variable)" stop-opacity="0.8"/>
            <stop offset="100%" :stop-color="getVariableColor(variable)" stop-opacity="0.2"/>
          </linearGradient>
        </defs>

        <line
          v-if="hoverState.visible"
          :x1="hoverState.x"
          :y1="chartPadding.top"
          :x2="hoverState.x"
          :y2="dimensions.height - chartPadding.bottom"
          class="hover-line"
          stroke="#9ca3af"
          stroke-width="0.5"
          stroke-dasharray="4 4"
        />

        <line
          v-if="hoverState.visible && hoverState.yValue !== null"
          :x1="chartPadding.left"
          :y1="hoverState.yPosition"
          :x2="dimensions.width - chartPadding.right"
          :y2="hoverState.yPosition"
          class="hover-line"
          stroke="#9ca3af"
          stroke-width="0.8"
        />

        <g class="areas">
          <g v-for="(variable, idx) in visibleVariables" :key="`area-${variable}`">
            <path
              :d="getAreaPath(variable, idx)"
              :fill="`url(#gradient-${getVariableId(variable)})`"
              class="area-path"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            />
            
            <path
              :d="getLinePath(variable, idx)"
              :stroke="getVariableColor(variable)"
              :stroke-width="responsiveStrokeWidth"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="line-path"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            />

            <g class="animated-data-points">
              <circle
                v-if="hoverState.visible && animatingPoints[`${variable}-x`] !== undefined"
                :cx="getAnimatedPointX(variable, idx)"
                :cy="getAnimatedPointY(variable, idx)"
                :r="responsivePointRadius"
                :fill="getDarkerColor(variable)"
                class="data-point animated-point"
                :style="{ filter: `drop-shadow(0 0 8px ${getDarkerColor(variable)})`, opacity: 1 }"
              />
            </g>

            <g class="data-points">
              <circle
                v-for="(point, i) in getVariableData(variable)"
                :key="`point-${variable}-${i}`"
                :cx="getXPosition(i)"
                :cy="getStackedY(variable, i, idx)"
                :r="hoverState.visible && hoverState.index === i && animatingPoints[`${variable}-x`] === undefined ? responsivePointRadius : 0"
                :fill="getVariableColor(variable)"
                :class="['data-point', { 'is-hovered': hoverState.visible && hoverState.index === i }]"
                :style="{ filter: `drop-shadow(0 0 8px ${getVariableColor(variable)})` }"
              />
            </g>
          </g>
        </g>
      </svg>
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
              <span class="tooltip-variable-name">{{ item.name }}:</span>
              <span class="tooltip-variable-value">{{ item.formattedValue }}</span>
            </div>
            
            <div v-if="item.percentage !== null" class="tooltip-item tooltip-sub-item">
              <span class="tooltip-variable-name">Porcentaje:</span>
              <span class="tooltip-variable-value">{{ item.percentage }}%</span>
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
  showCurrencySymbol: { type: Boolean, default: true },
  decimalPlaces: { type: Number, default: null },
  valueSuffix: { type: String, default: '' },
  valuePrefix: { type: String, default: '' },
  hideHeader: { type: Boolean, default: false },
  width: { type: Number, default: null },
  height: { type: Number, default: null },
  initialVisibleVariables: { type: Array, default: null },
  positionsByYear: { type: Object, default: () => ({}) },
  percentagesByYear: { type: Object, default: () => ({}) },
  tooltipLabels: { type: Object, default: () => ({}) },
  buttonLabels: { type: Object, default: () => ({}) },
  hideCurrencyLegend: { type: Boolean, default: false }
})

const emit = defineEmits(['variable-toggle'])

const chartWrapper = ref(null)
const svgRef = ref(null)
const containerRef = ref(null)
const dimensions = ref({ width: 800, height: 300 })
let resizeObserver = null

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => windowWidth.value <= 768)

const chartPadding = computed(() => {
  const w = windowWidth.value
  if (w <= 320) return { top: 15, right: 10, bottom: 25, left: 35 }
  if (w <= 360) return { top: 18, right: 12, bottom: 28, left: 38 }
  if (w <= 390) return { top: 18, right: 15, bottom: 30, left: 40 }
  if (w <= 430) return { top: 20, right: 18, bottom: 30, left: 45 }
  if (w <= 480) return { top: 20, right: 20, bottom: 32, left: 48 }
  if (w <= 768) return { top: 20, right: 22, bottom: 32, left: 50 }
  return { top: 20, right: 25, bottom: 35, left: 55 }
})

const responsiveStrokeWidth = computed(() => {
  const w = windowWidth.value
  if (w <= 320) return 1.5
  if (w <= 390) return 1.8
  if (w <= 480) return 2
  return 2
})

const responsivePointRadius = computed(() => {
  const w = windowWidth.value
  if (w <= 320) return 2
  if (w <= 390) return 2.5
  if (w <= 480) return 3
  return 3
})

const hoverState = ref({
  visible: false,
  x: 0,
  index: -1,
  label: '',
  yValue: null,
  yPosition: 0,
  previousIndex: -1
})

const tooltipLocked = ref(false)
const animatingPoints = ref({})

const colorPalette = ['#7cb342', '#9E9E9E', '#DC143C', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444']

const semanticColors = {
  'IS Total': '#7cb342', 'IS': '#7cb342', 'Ingresos Sostenibles': '#7cb342',
  'PS': '#7cb342', 'Presupuestos Sostenibles': '#7cb342',
  'IIC Total': '#DC143C', 'IIC': '#DC143C', 'Ingresos Intensivos en Carbono': '#DC143C',
  'PIC': '#DC143C', 'Presupuestos Intensivos en Carbono': '#DC143C',
  'Financiamiento Total': '#9E9E9E', 'Gasto Total': '#9E9E9E', 'Ingreso Total': '#9E9E9E',
  'IFS': '#9E9E9E', ' IFS': '#9E9E9E'
}

const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])
const animatedData = ref({})

const getButtonLabel = (variable) => {
  if (props.buttonLabels[variable]) {
    return props.buttonLabels[variable]
  }
  return variable
}

const tooltipInternalStyle = computed(() => {
  if (!hoverState.value.visible || hoverState.value.index === -1) return { display: 'none' }
  
  const xPos = getXPositionPercent(hoverState.value.index)
  let topPos = '5%'
  let leftPos = xPos
  let transform = 'translateX(-50%)'
  
  if (xPos < 25) {
    leftPos = 5
    transform = 'translateX(0)'
  } else if (xPos > 75) {
    leftPos = 95
    transform = 'translateX(-100%)'
  }
  
  return { 
    left: `${leftPos}%`,
    top: topPos,
    transform: transform
  }
})

const getXPositionPercent = (index) => {
  const len = props.xLabels.length
  if (len <= 1) return 50
  
  const leftPadPercent = (chartPadding.value.left / dimensions.value.width) * 100
  const rightPadPercent = (chartPadding.value.right / dimensions.value.width) * 100
  const availablePercent = 100 - leftPadPercent - rightPadPercent
  
  return leftPadPercent + (index / (len - 1)) * availablePercent
}

const tooltipItems = computed(() => {
  if (!hoverState.value.visible || hoverState.value.index === -1) return []
  
  const year = String(hoverState.value.label)
  const index = hoverState.value.index
  
  return visibleVariables.value.map(varName => {
    const data = props.data[varName] || []
    const value = data[index]
    const color = getVariableColor(varName)
    const displayName = props.tooltipLabels[varName] || varName
    
    let percentage = null
    if (props.percentagesByYear && props.percentagesByYear[year]) {
      const pct = props.percentagesByYear[year][varName]
      if (pct !== undefined && pct !== null) {
        percentage = typeof pct === 'number' ? pct.toFixed(2) : pct
      }
    }
    
    let position = null
    if (props.positionsByYear && props.positionsByYear[year]) {
      position = props.positionsByYear[year][varName] ?? null
    }
    
    return {
      key: `${varName}-${year}`,
      name: displayName,
      value,
      formattedValue: formatValue(value),
      color,
      percentage,
      position
    }
  })
})

watch(() => props.data, (newData, oldData) => {
  const vars = Object.keys(newData)
  const oldVars = oldData ? Object.keys(oldData) : []
  
  vars.forEach(variable => {
    if (!animatedData.value[variable]) {
      animatedData.value[variable] = new Array(props.xLabels.length).fill(0)
    }
  })

  if (oldVars.length === 0 && vars.length > 0 && visibleVariables.value.length === 0) {
    activateInitialVariables(vars)
  }
}, { deep: true })

const activateInitialVariables = (vars) => {
  if (props.initialVisibleVariables?.length > 0) {
    props.initialVisibleVariables.forEach((varName, index) => {
      const matchedVar = vars.find(v => v === varName || v.trim() === varName.trim())
      if (matchedVar) {
        setTimeout(() => toggleVariable(matchedVar), 100 + index * 400)
      }
    })
  } else {
    if (vars[0]) setTimeout(() => toggleVariable(vars[0]), 100)
    if (vars[1]) setTimeout(() => toggleVariable(vars[1]), 500)
  }
}

const hasData = computed(() => {
  return visibleVariables.value.length > 0 && 
         visibleVariables.value.some(v => props.data[v] && props.data[v].length > 0)
})

watch(hasData, async (newVal) => {
  if (newVal) {
    await nextTick()
    updateDimensions()
    if (chartWrapper.value) {
      if (resizeObserver) resizeObserver.disconnect()
      else resizeObserver = new ResizeObserver(() => requestAnimationFrame(() => updateDimensions()))
      resizeObserver.observe(chartWrapper.value)
    }
  }
}, { immediate: true })

watch(availableVariables, async () => {
  await nextTick()
  if (hasData.value) updateDimensions()
})

watch([() => props.width, () => props.height], () => updateDimensions())

const maxY = computed(() => {
  if (!hasData.value) return 100
  let maxStack = 0
  for (let i = 0; i < props.xLabels.length; i++) {
    let stackSum = 0
    visibleVariables.value.forEach(variable => {
      stackSum += animatedData.value[variable]?.[i] || 0
    })
    maxStack = Math.max(maxStack, stackSum)
  }
  return maxStack * 1.1 || 100
})

const getYAxisValue = (index) => maxY.value - (index * maxY.value / (props.gridLines - 1))

const formatYAxisValue = (value) => {
  if (props.valueFormatter) return props.valueFormatter(value)
  const prefix = props.showCurrencySymbol ? '$' : props.valuePrefix
  const suffix = props.valueSuffix
  
  if (props.showCurrencySymbol) {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }
  
  if (props.decimalPlaces !== null) return `${prefix}${value.toFixed(props.decimalPlaces)}${suffix}`
  if (Math.abs(value) >= 1e9) return `${prefix}${(value / 1e9).toFixed(1)}B${suffix}`
  if (Math.abs(value) >= 1e6) return `${prefix}${(value / 1e6).toFixed(1)}M${suffix}`
  if (Math.abs(value) >= 1e3) return `${prefix}${(value / 1e3).toFixed(1)}K${suffix}`
  return `${prefix}${value.toFixed(0)}${suffix}`
}

const gridSpacing = computed(() => (dimensions.value.height - chartPadding.value.top - chartPadding.value.bottom) / (props.gridLines - 1))

const getVariableData = (variable) => animatedData.value[variable] || []

const getVariableColor = (variable) => {
  if (semanticColors[variable]) return semanticColors[variable]
  const l = variable.toLowerCase()
  if (l.includes('sostenible') || l === 'is' || l.includes('ps')) return '#7cb342'
  if (l.includes('carbono') || l.includes('iic') || l.includes('pic')) return '#DC143C'
  if (l.includes('total') || l.includes('financiamiento') || l.includes('ifs')) return '#9E9E9E'
  return colorPalette[availableVariables.value.indexOf(variable) % colorPalette.length]
}

const getDarkerColor = (variable) => {
  const c = getVariableColor(variable).replace('#', '')
  return `rgb(${Math.max(0,parseInt(c.substr(0,2),16)-40)},${Math.max(0,parseInt(c.substr(2,2),16)-40)},${Math.max(0,parseInt(c.substr(4,2),16)-40)})`
}

const getVariableId = (variable) => variable.replace(/[^a-zA-Z0-9]/g, '-')

const toggleVariable = (variable) => {
  const index = visibleVariables.value.indexOf(variable)
  if (index > -1) {
    visibleVariables.value.splice(index, 1)
    animateToZero(variable)
  } else {
    visibleVariables.value.push(variable)
    animateFromZero(variable)
  }
  emit('variable-toggle', { variable, visible: index === -1 })
}

const animateFromZero = (variable) => {
  const duration = 1000, startTime = Date.now()
  const targetData = props.data[variable]
  if (!animatedData.value[variable]) animatedData.value[variable] = new Array(targetData.length).fill(0)
  const animate = () => {
    const p = Math.min((Date.now() - startTime) / duration, 1)
    animatedData.value[variable] = targetData.map(v => v * easeOutCubic(p))
    if (p < 1) requestAnimationFrame(animate)
  }
  animate()
}

const animateToZero = (variable) => {
  const duration = 500, startTime = Date.now()
  const startData = [...(animatedData.value[variable] || [])]
  const animate = () => {
    const p = Math.min((Date.now() - startTime) / duration, 1)
    animatedData.value[variable] = startData.map(v => v * (1 - easeInCubic(p)))
    if (p < 1) requestAnimationFrame(animate)
    else animatedData.value[variable] = new Array(startData.length).fill(0)
  }
  animate()
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeInCubic = (t) => t * t * t

const getXPosition = (index) => {
  const chartWidth = dimensions.value.width - chartPadding.value.left - chartPadding.value.right
  return chartPadding.value.left + index * (chartWidth / (props.xLabels.length - 1))
}

const getYPosition = (value) => {
  const chartHeight = dimensions.value.height - chartPadding.value.top - chartPadding.value.bottom
  return dimensions.value.height - chartPadding.value.bottom - (value / maxY.value) * chartHeight
}

const getStackedY = (variable, dataIndex, variableIndex) => {
  let stackSum = 0
  for (let i = 0; i <= variableIndex; i++) {
    stackSum += getVariableData(visibleVariables.value[i])[dataIndex] || 0
  }
  return getYPosition(stackSum)
}

const getStackedSum = (variableIndex, dataIndex) => {
  let sum = 0
  for (let i = 0; i < variableIndex; i++) {
    sum += getVariableData(visibleVariables.value[i])[dataIndex] || 0
  }
  return sum
}

const getAreaPath = (variable, variableIndex) => {
  const data = getVariableData(variable)
  if (!data?.length) return ''
  const topPoints = data.map((value, i) => ({ x: getXPosition(i), y: getYPosition(getStackedSum(variableIndex, i) + value) }))
  const bottomPoints = data.map((_, i) => ({ x: getXPosition(i), y: getYPosition(getStackedSum(variableIndex, i)) })).reverse()
  return generateSmoothPath(topPoints) + ' L ' + bottomPoints.map(p => `${p.x} ${p.y}`).join(' L ') + ' Z'
}

const generateSmoothPath = (points) => {
  if (points.length < 2) return ''
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i], next = points[i + 1]
    const tension = Math.abs(next.y - curr.y) > 50 ? 0.1 : Math.abs(next.y - curr.y) < 5 ? 0.05 : 0.2
    let cp1x, cp1y, cp2x, cp2y
    if (i === 0) {
      cp1x = curr.x + (next.x - curr.x) * tension; cp1y = curr.y
      cp2x = next.x - (next.x - curr.x) * tension; cp2y = next.y
    } else {
      const prev = points[i - 1]
      cp1x = curr.x + (next.x - prev.x) * tension * 0.5
      cp1y = curr.y + (next.y - prev.y) * tension * 0.3
      cp2x = i < points.length - 2 ? next.x - (points[i + 2].x - curr.x) * tension * 0.5 : next.x - (next.x - curr.x) * tension
      cp2y = i < points.length - 2 ? next.y - (points[i + 2].y - curr.y) * tension * 0.3 : next.y
    }
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
  }
  return path
}

const getLinePath = (variable, variableIndex) => {
  const data = getVariableData(variable)
  if (!data?.length) return ''
  const points = data.map((value, i) => ({ x: getXPosition(i), y: getYPosition(getStackedSum(variableIndex, i) + value) }))
  return generateSmoothPath(points)
}

const handleMouseMove = (event) => {
  if (tooltipLocked.value) return
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  const scaleX = dimensions.value.width / rect.width
  const mouseX = (event.clientX - rect.left) * scaleX
  processHover(mouseX)
}

const handleTouchStart = (event) => {
  if (tooltipLocked.value) {
    tooltipLocked.value = false
    hoverState.value.visible = false
    return
  }
  event.preventDefault()
  const touch = event.touches[0]
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  const scaleX = dimensions.value.width / rect.width
  const touchX = (touch.clientX - rect.left) * scaleX
  processHover(touchX)
  tooltipLocked.value = true
}

const handleTouchMove = (event) => {
  if (tooltipLocked.value) return
  event.preventDefault()
  const touch = event.touches[0]
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  const scaleX = dimensions.value.width / rect.width
  const touchX = (touch.clientX - rect.left) * scaleX
  processHover(touchX)
}

const handleTouchEnd = () => {
  if (!tooltipLocked.value) {
    hideTooltip()
  }
}

const handleClick = (event) => {
  if (tooltipLocked.value) {
    tooltipLocked.value = false
    hoverState.value.visible = false
  } else {
    const svg = event.currentTarget
    const rect = svg.getBoundingClientRect()
    const scaleX = dimensions.value.width / rect.width
    const mouseX = (event.clientX - rect.left) * scaleX
    processHover(mouseX)
    tooltipLocked.value = true
  }
}

const handleMouseLeave = () => {
  if (!tooltipLocked.value) {
    hideTooltip()
  }
}

const processHover = (mouseX) => {
  const dataLength = props.xLabels.length
  let closestIndex = 0
  if (dataLength > 1) {
    for (let i = 0; i < dataLength - 1; i++) {
      if (mouseX < getXPosition(i) + (getXPosition(i + 1) - getXPosition(i)) * 0.5) { closestIndex = i; break }
      closestIndex = i + 1
    }
  }
  
  const x = getXPosition(closestIndex)
  let totalY = 0
  visibleVariables.value.forEach(v => { totalY += getVariableData(v)[closestIndex] || 0 })
  
  if (closestIndex !== hoverState.value.index) animatePointsToIndex(closestIndex)
  
  hoverState.value = { visible: true, x, index: closestIndex, label: props.xLabels[closestIndex], yValue: totalY, yPosition: getYPosition(totalY), previousIndex: hoverState.value.index }
}

const animatePointsToIndex = (targetIndex) => {
  const duration = 200, startTime = Date.now()
  visibleVariables.value.forEach((variable, idx) => {
    const startIndex = hoverState.value.index >= 0 ? hoverState.value.index : targetIndex
    const startX = getXPosition(startIndex), targetX = getXPosition(targetIndex)
    const startY = getYPosition(getStackedSum(idx, startIndex) + (getVariableData(variable)[startIndex] || 0))
    const targetY = getYPosition(getStackedSum(idx, targetIndex) + (getVariableData(variable)[targetIndex] || 0))
    const animate = () => {
      const p = Math.min((Date.now() - startTime) / duration, 1), e = easeOutCubic(p)
      animatingPoints.value[`${variable}-x`] = startX + (targetX - startX) * e
      animatingPoints.value[`${variable}-y`] = startY + (targetY - startY) * e
      if (p < 1) requestAnimationFrame(animate)
      else { delete animatingPoints.value[`${variable}-x`]; delete animatingPoints.value[`${variable}-y`] }
    }
    animate()
  })
}

const getAnimatedPointX = (variable) => animatingPoints.value[`${variable}-x`] || 0
const getAnimatedPointY = (variable) => animatingPoints.value[`${variable}-y`] || 0

const hideTooltip = () => { 
  hoverState.value.visible = false
  animatingPoints.value = {}
  tooltipLocked.value = false
}

const formatValue = (value) => {
  if (value == null) return 'N/A'
  if (props.valueFormatter) return props.valueFormatter(value)
  const prefix = props.showCurrencySymbol ? '$' : props.valuePrefix
  const suffix = props.valueSuffix
  
  if (props.showCurrencySymbol) {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }
  
  if (props.decimalPlaces !== null) return `${prefix}${value.toFixed(props.decimalPlaces)}${suffix}`
  if (Math.abs(value) >= 1e9) return `${prefix}${(value / 1e9).toFixed(2)}B${suffix}`
  if (Math.abs(value) >= 1e6) return `${prefix}${(value / 1e6).toFixed(2)}M${suffix}`
  if (Math.abs(value) >= 1e3) return `${prefix}${(value / 1e3).toFixed(2)}K${suffix}`
  return `${prefix}${value.toFixed(2)}${suffix}`
}

const updateDimensions = () => {
  windowWidth.value = window.innerWidth
  
  if (chartWrapper.value) {
    const rect = chartWrapper.value.getBoundingClientRect()
    const w = windowWidth.value
    
    let width = rect.width > 0 ? rect.width : (props.width ?? 800)
    let height = rect.height > 0 ? rect.height : (props.height ?? 300)
    
    if (w <= 768 && rect.width > 0) {
      height = Math.max(rect.height, rect.width * 0.5, 180)
    }
    
    dimensions.value = { width, height }
  } else {
    dimensions.value = { 
      width: props.width ?? 800, 
      height: props.height ?? 300 
    }
  }
}

const handleResize = () => {
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
  
  setTimeout(() => {
    updateDimensions()
    const vars = Object.keys(props.data)
    if (vars.length > 0 && visibleVariables.value.length === 0) {
      vars.forEach(v => { if (!animatedData.value[v]) animatedData.value[v] = new Array(props.xLabels.length).fill(0) })
      activateInitialVariables(vars)
    }
    if (chartWrapper.value) {
      resizeObserver = new ResizeObserver(() => requestAnimationFrame(() => updateDimensions()))
      resizeObserver.observe(chartWrapper.value)
    }
  }, 100)
  
  setTimeout(() => updateDimensions(), 500)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
})
</script>

<style scoped>
.area-chart-container { 
  width: 100%; 
  height: 100%;
  min-height: 250px;
  display: flex; 
  flex-direction: column; 
  background: white; 
  border-radius: 12px; 
  padding: 12px; 
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
  box-sizing: border-box; 
  overflow: visible;
  position: relative;
}

.chart-header { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  margin-bottom: 8px; 
  flex-shrink: 0; 
}

.header-content { flex: 1; }

.chart-title { 
  margin: 0; 
  letter-spacing: -0.2px; 
  font-size: 14px; 
  text-align: center; 
  font-weight: 600; 
  color: #2c3e50; 
  line-height: 1.2; 
}

.chart-subtitle { 
  font-size: 12px; 
  color: #6b7280; 
  margin: 0; 
  line-height: 1.2; 
  text-align: center; 
}

.variable-filters { 
  background: #f5f5f5; 
  border-radius: 20px; 
  padding: 6px; 
  margin-bottom: 6px; 
  display: flex; 
  justify-content: center; 
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  gap: 6px; 
  flex-wrap: wrap; 
  flex-shrink: 0; 
}

.filter-btn { 
  padding: 8px 16px; 
  border: none; 
  border-radius: 16px; 
  cursor: pointer; 
  font-size: 12px; 
  font-weight: 500; 
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
  color: #2c3e50; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
}

.filter-btn.filter-inactive { 
  background: transparent; 
  color: #999; 
  opacity: 0.7; 
}

.filter-btn:hover { transform: scale(1.02); }

.currency-legend {
  font-size: 11px;
  font-style: italic;
  color: #888;
  text-align: left;
  width: 100%;
  margin-bottom: 8px;
  padding-left: 8px;
}

.no-data { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  flex: 1; 
  min-height: 150px; 
  color: #9ca3af; 
  gap: 8px; 
}

.no-data svg { opacity: 0.5; width: 36px; height: 36px; }
.no-data p { margin: 0; font-size: 13px; }

.chart-wrapper { 
  position: relative; 
  width: 100%; 
  flex: 1; 
  min-height: 180px; 
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible; 
  box-sizing: border-box; 
}

.area-chart { 
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}

.grid-line { stroke: #e5e7eb; stroke-width: 1; }
.y-axis-label { font-size: 11px; font-weight: 400; fill: #6b7280; user-select: none; }
.x-axis-label-svg { font-size: 11px; font-weight: 500; fill: #6b7280; user-select: none; }
.hover-line { transition: opacity 0.15s ease; pointer-events: none; }
.area-path { opacity: 0; animation: fadeInArea 1s ease-out forwards; }
.line-path { stroke-dasharray: 3000; stroke-dashoffset: 3000; animation: drawLine 1.5s ease-out forwards; }
.data-point { opacity: 1; transform-origin: center; transition: r 0.2s ease; }
.animated-point { transition: none !important; animation: none !important; }
.data-point.is-hovered { opacity: 1; filter: drop-shadow(0 0 6px rgba(0,0,0,0.4)); }

@keyframes fadeInArea { to { opacity: 1; } }
@keyframes drawLine { to { stroke-dashoffset: 0; } }

.tooltip-container { 
  position: absolute;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #d0d0d0; 
  border-radius: 5px; 
  padding: 5px 7px; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
  pointer-events: none; 
  z-index: 100; 
  min-width: 85px;
  max-width: 140px;
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
  .area-chart-container { padding: 10px; }
  .chart-title { font-size: 13px; }
  .filter-btn { padding: 6px 12px; font-size: 11px; }
}

@media (max-width: 768px) {
  .area-chart-container { padding: 8px; border-radius: 10px; min-height: 220px; }
  .chart-header { margin-bottom: 6px; }
  .chart-title { font-size: 12px; }
  .chart-subtitle { font-size: 10px; }
  .variable-filters { padding: 4px; margin-bottom: 4px; gap: 4px; border-radius: 14px; }
  .filter-btn { padding: 5px 10px; font-size: 10px; border-radius: 10px; gap: 5px; }
  .btn-color-dot { width: 7px; height: 7px; }
  .currency-legend { font-size: 9px; margin-bottom: 6px; padding-left: 4px; }
  .chart-wrapper { min-height: 160px; }
  .no-data svg { width: 28px; height: 28px; }
  .no-data p { font-size: 11px; }
  .y-axis-label { font-size: 8px; }
  .x-axis-label-svg { font-size: 8px; }
}

@media (max-width: 430px) {
  .area-chart-container { padding: 6px; border-radius: 8px; min-height: 200px; }
  .chart-title { font-size: 11px; }
  .variable-filters { padding: 3px; gap: 3px; }
  .filter-btn { padding: 4px 8px; font-size: 9px; gap: 4px; }
  .btn-color-dot { width: 6px; height: 6px; }
  .chart-wrapper { min-height: 140px; }
  .y-axis-label { font-size: 7px; }
  .x-axis-label-svg { font-size: 7px; }
}

@media (max-width: 412px) {
  .area-chart-container { padding: 5px; }
  .chart-title { font-size: 10px; }
  .filter-btn { padding: 3px 6px; font-size: 8px; }
  .btn-label { max-width: 70px; }
  .currency-legend { font-size: 8px; }
  .chart-wrapper { min-height: 130px; }
  .y-axis-label { font-size: 6px; }
  .x-axis-label-svg { font-size: 6px; }
}

@media (max-width: 390px) {
  .area-chart-container { padding: 4px; border-radius: 6px; min-height: 180px; }
  .chart-header { margin-bottom: 4px; }
  .chart-title { font-size: 10px; }
  .variable-filters { padding: 2px; gap: 2px; border-radius: 10px; }
  .filter-btn { padding: 3px 5px; font-size: 7px; gap: 3px; border-radius: 8px; }
  .btn-color-dot { width: 5px; height: 5px; }
  .btn-label { max-width: 60px; }
  .currency-legend { font-size: 7px; margin-bottom: 4px; }
  .chart-wrapper { min-height: 120px; }
  .no-data { min-height: 100px; }
  .no-data svg { width: 24px; height: 24px; }
  .no-data p { font-size: 9px; }
}

@media (max-width: 360px) {
  .area-chart-container { padding: 3px; border-radius: 5px; min-height: 160px; }
  .chart-title { font-size: 9px; }
  .chart-subtitle { font-size: 8px; }
  .variable-filters { padding: 2px; gap: 1px; border-radius: 8px; }
  .filter-btn { padding: 2px 4px; font-size: 6px; gap: 2px; border-radius: 6px; }
  .btn-color-dot { width: 4px; height: 4px; }
  .btn-label { max-width: 50px; }
  .currency-legend { font-size: 6px; margin-bottom: 3px; }
  .chart-wrapper { min-height: 100px; }
  .y-axis-label { font-size: 5px; }
  .x-axis-label-svg { font-size: 5px; }
}

@media (max-width: 320px) {
  .area-chart-container { padding: 2px; border-radius: 4px; min-height: 140px; }
  .chart-header { margin-bottom: 2px; }
  .chart-title { font-size: 8px; }
  .chart-subtitle { font-size: 7px; }
  .variable-filters { padding: 1px; gap: 1px; border-radius: 6px; margin-bottom: 2px; }
  .filter-btn { padding: 2px 3px; font-size: 5px; gap: 1px; border-radius: 4px; }
  .btn-color-dot { width: 3px; height: 3px; }
  .btn-label { max-width: 40px; }
  .currency-legend { font-size: 5px; margin-bottom: 2px; padding-left: 2px; }
  .chart-wrapper { min-height: 90px; }
  .no-data { min-height: 80px; }
  .no-data svg { width: 20px; height: 20px; }
  .no-data p { font-size: 8px; }
  .y-axis-label { font-size: 4px; }
  .x-axis-label-svg { font-size: 4px; }
}

@media (max-width: 768px) {
  .area-chart-container, .chart-wrapper {
    max-width: 100%;
    overflow-x: hidden;
  }
}
</style>