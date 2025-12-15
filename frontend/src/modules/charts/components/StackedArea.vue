<template>
  <div class="area-chart-container" ref="containerRef">
    <!-- Header con título y controles - SOLO si hideHeader es false -->
    <div v-if="!props.hideHeader" class="chart-header">
      <div class="header-content">
        <h3 class="chart-title">{{ title }}</h3>
        <p v-if="subtitle" class="chart-subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Filtros de variables (botones) -->
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
        {{ variable }}
      </button>
    </div>

    <!-- Mensaje si no hay datos -->
    <div v-if="!hasData" class="no-data">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3v18h18"/>
        <path d="M18 17V9"/>
        <path d="M13 17V5"/>
        <path d="M8 17v-3"/>
      </svg>
      <p>No hay datos disponibles</p>
    </div>

    <!-- Gráfica SVG -->
    <div v-else class="chart-wrapper" ref="chartWrapper">
      <svg 
        ref="svgRef"
        :width="dimensions.width"
        :height="dimensions.height"
        class="area-chart"
        @mousemove="handleMouseMove"
        @mouseleave="hideTooltip"
      >
        <!-- Grid lines horizontales -->
        <g class="grid">
          <line
            v-for="i in gridLines"
            :key="`grid-${i}`"
            :x1="padding.left"
            :y1="padding.top + (i - 1) * gridSpacing"
            :x2="dimensions.width - padding.right"
            :y2="padding.top + (i - 1) * gridSpacing"
            class="grid-line"
          />
        </g>

        <!-- Etiquetas del eje Y -->
        <g class="y-axis-labels">
          <text
            v-for="i in gridLines"
            :key="`y-label-${i}`"
            :x="padding.left - 5"
            :y="padding.top + (i - 1) * gridSpacing + 3"
            class="y-axis-label"
            text-anchor="end"
          >
            {{ formatYAxisValue(getYAxisValue(i - 1)) }}
          </text>
        </g>

        <!-- Etiquetas del eje X (DENTRO del SVG) -->
        <g class="x-axis-labels">
          <text
            v-for="(label, i) in props.xLabels"
            :key="`x-label-${i}`"
            :x="getXPosition(i)"
            :y="dimensions.height - padding.bottom + 15"
            class="x-axis-label-svg"
            text-anchor="middle"
          >
            {{ label }}
          </text>
        </g>

        <!-- Definir gradientes para cada variable -->
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

        <!-- Línea vertical punteada del hover -->
        <line
          v-if="hoverState.visible"
          :x1="hoverState.x"
          :y1="padding.top"
          :x2="hoverState.x"
          :y2="dimensions.height - padding.bottom"
          class="hover-line"
          stroke="#9ca3af"
          stroke-width="0.5"
          stroke-dasharray="4 4"
        />

        <!-- Línea horizontal punteada del hover -->
        <line
          v-if="hoverState.visible && hoverState.yValue !== null"
          :x1="padding.left"
          :y1="hoverState.yPosition"
          :x2="dimensions.width - padding.right"
          :y2="hoverState.yPosition"
          class="hover-line"
          stroke="#9ca3af"
          stroke-width="0.8"
        />

        <!-- Áreas apiladas -->
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
              stroke-width="2"
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
                :r="3"
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
                :r="hoverState.visible && hoverState.index === i && animatingPoints[`${variable}-x`] === undefined ? 3 : 0"
                :fill="getVariableColor(variable)"
                :class="['data-point', { 'is-hovered': hoverState.visible && hoverState.index === i }]"
                :style="{ filter: `drop-shadow(0 0 8px ${getVariableColor(variable)})` }"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>

    <!-- Tooltip con Teleport -->
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
            <!-- Iterar sobre items del tooltip con separadores -->
            <template v-for="(item, idx) in tooltipItems" :key="item.key">
              <!-- Separador antes de cada variable excepto la primera -->
              <div v-if="idx > 0" class="tooltip-separator"></div>
              
              <!-- Valor principal -->
              <div class="tooltip-item">
                <span class="tooltip-color-indicator" :style="{ backgroundColor: item.color }"></span>
                <span class="tooltip-variable-name">{{ item.name }}:</span>
                <span class="tooltip-variable-value">{{ item.formattedValue }}</span>
              </div>
              
              <!-- Porcentaje (si existe) -->
              <div v-if="item.percentage !== null" class="tooltip-item tooltip-sub-item">
                <span class="tooltip-variable-name">Porcentaje:</span>
                <span class="tooltip-variable-value">{{ item.percentage }}%</span>
              </div>
              
              <!-- Posición (si existe) -->
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
  // ✅ NUEVAS PROPS para tooltip extendido
  positionsByYear: { type: Object, default: () => ({}) },
  percentagesByYear: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['variable-toggle'])

const chartWrapper = ref(null)
const svgRef = ref(null)
const containerRef = ref(null)
const dimensions = ref({ width: 800, height: 300 })
let resizeObserver = null

const hoverState = ref({
  visible: false,
  x: 0,
  index: -1,
  label: '',
  yValue: null,
  yPosition: 0,
  previousIndex: -1
})

const animatingPoints = ref({})
const padding = { top: 10, right: 15, bottom: 25, left: 40 }

const colorPalette = ['#7cb342', '#9E9E9E', '#DC143C', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444']

const semanticColors = {
  'IS Total': '#7cb342', 'IS': '#7cb342', 'Ingresos Sostenibles': '#7cb342',
  'PS': '#7cb342', 'Presupuestos Sostenibles': '#7cb342',
  'IIC Total': '#DC143C', 'IIC': '#DC143C', 'Ingresos Intensivos en Carbono': '#DC143C',
  'PIC': '#DC143C', 'Presupuestos Intensivos en Carbono': '#DC143C',
  'Financiamiento Total': '#9E9E9E', 'Gasto Total': '#9E9E9E', 'Ingreso Total': '#9E9E9E',
}

const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])
const animatedData = ref({})

// ✅ COMPUTED: Items del tooltip con valor, porcentaje y posición
const tooltipItems = computed(() => {
  if (!hoverState.value.visible || hoverState.value.index === -1) return []
  
  const year = String(hoverState.value.label)
  const index = hoverState.value.index
  
  return visibleVariables.value.map(varName => {
    const data = props.data[varName] || []
    const value = data[index]
    const color = getVariableColor(varName)
    
    // Obtener porcentaje
    let percentage = null
    if (props.percentagesByYear && props.percentagesByYear[year]) {
      const pct = props.percentagesByYear[year][varName]
      if (pct !== undefined && pct !== null) {
        percentage = typeof pct === 'number' ? pct.toFixed(2) : pct
      }
    }
    
    // Obtener posición
    let position = null
    if (props.positionsByYear && props.positionsByYear[year]) {
      position = props.positionsByYear[year][varName] ?? null
    }
    
    return {
      key: `${varName}-${year}`,
      name: varName,
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

watch(() => props.positionsByYear, (v) => console.log('📍 [StackedArea] positionsByYear:', v), { deep: true, immediate: true })
watch(() => props.percentagesByYear, (v) => console.log('📊 [StackedArea] percentagesByYear:', v), { deep: true, immediate: true })

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
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)} B`
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)} M`
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)} K`
    return `$${value.toFixed(2)}`
  }
  
  if (props.decimalPlaces !== null) return `${prefix}${value.toFixed(props.decimalPlaces)}${suffix}`
  if (Math.abs(value) >= 1e9) return `${prefix}${(value / 1e9).toFixed(2)} B${suffix}`
  if (Math.abs(value) >= 1e6) return `${prefix}${(value / 1e6).toFixed(2)} M${suffix}`
  if (Math.abs(value) >= 1e3) return `${prefix}${(value / 1e3).toFixed(2)} K${suffix}`
  return `${prefix}${value.toFixed(2)}${suffix}`
}

const gridSpacing = computed(() => (dimensions.value.height - padding.top - padding.bottom) / (props.gridLines - 1))

const getVariableData = (variable) => animatedData.value[variable] || []

const getVariableColor = (variable) => {
  if (semanticColors[variable]) return semanticColors[variable]
  const l = variable.toLowerCase()
  if (l.includes('sostenible') || l === 'is' || l.includes('ps')) return '#7cb342'
  if (l.includes('carbono') || l.includes('iic') || l.includes('pic')) return '#DC143C'
  if (l.includes('total') || l.includes('financiamiento')) return '#9E9E9E'
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
  const chartWidth = dimensions.value.width - padding.left - padding.right
  return padding.left + index * (chartWidth / (props.xLabels.length - 1))
}

const getYPosition = (value) => {
  const chartHeight = dimensions.value.height - padding.top - padding.bottom
  return dimensions.value.height - padding.bottom - (value / maxY.value) * chartHeight
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
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  const scaleX = dimensions.value.width / rect.width
  const mouseX = (event.clientX - rect.left) * scaleX
  
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

const hideTooltip = () => { hoverState.value.visible = false; animatingPoints.value = {} }

const tooltipFixedStyle = computed(() => {
  if (!svgRef.value || !hoverState.value.visible) return {}
  const ctm = svgRef.value.getScreenCTM()
  if (!ctm) return {}
  const screenX = ctm.a * hoverState.value.x + ctm.e
  const screenY = ctm.b * hoverState.value.x + ctm.d * hoverState.value.yPosition + ctm.f
  return { left: `${screenX}px`, top: `${screenY}px` }
})

const formatValue = (value) => {
  if (value == null) return 'N/A'
  if (props.valueFormatter) return props.valueFormatter(value)
  const prefix = props.showCurrencySymbol ? '$' : props.valuePrefix
  const suffix = props.valueSuffix
  
  if (props.showCurrencySymbol) {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)} B`
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)} M`
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)} K`
    return `$${value.toFixed(2)}`
  }
  
  if (props.decimalPlaces !== null) return `${prefix}${value.toFixed(props.decimalPlaces)}${suffix}`
  if (Math.abs(value) >= 1e9) return `${prefix}${(value / 1e9).toFixed(2)} B${suffix}`
  if (Math.abs(value) >= 1e6) return `${prefix}${(value / 1e6).toFixed(2)} M${suffix}`
  if (Math.abs(value) >= 1e3) return `${prefix}${(value / 1e3).toFixed(2)} K${suffix}`
  return `${prefix}${value.toFixed(2)}${suffix}`
}

const updateDimensions = () => {
  if (props.width !== null && props.height !== null) {
    dimensions.value = { width: props.width, height: props.height }
    return
  }
  if (chartWrapper.value) {
    const rect = chartWrapper.value.getBoundingClientRect()
    dimensions.value = {
      width: props.width ?? (rect.width > 0 ? Math.floor(rect.width) : 800),
      height: props.height ?? (rect.height > 0 ? Math.floor(rect.height) : 300)
    }
  }
}

onMounted(async () => {
  await nextTick()
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
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
})
</script>

<style scoped>
.area-chart-container { width: 100%; height: 100%; display: flex; flex-direction: column; background: white; border-radius: 12px; padding: 4px 6px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box; overflow: visible; }
.chart-header { display: flex; justify-content: center; align-items: center; margin-bottom: 4px; flex-shrink: 0; }
.header-content { flex: 1; }
.chart-title { margin: 0; letter-spacing: -0.2px; font-size: 12px; text-align: center; font-weight: 600; color: #2c3e50; line-height: 1.2; }
.chart-subtitle { font-size: 11px; color: #6b7280; margin: 0; line-height: 1.2; text-align: center; }
.variable-filters { background: #f5f5f5; border-radius: 20px; padding: 6px; margin-bottom: 12px; display: flex; justify-content: center; width: 100%; gap: 4px; flex-wrap: wrap; flex-shrink: 0; }
.filter-btn { padding: 6px 14px; border: none; border-radius: 16px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 6px; background: transparent; color: #666; transition: all 0.3s ease; }
.btn-color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.filter-btn.filter-active { background: white; color: #2c3e50; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.filter-btn.filter-inactive { background: transparent; color: #999; opacity: 0.7; }
.filter-btn:hover { transform: scale(1.05); }
.no-data { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; min-height: 0; color: #9ca3af; gap: 8px; }
.no-data svg { opacity: 0.5; width: 32px; height: 32px; }
.no-data p { margin: 0; font-size: 12px; }
.chart-wrapper { position: relative; width: 100%; height: 100%; flex: 1; min-height: 0; min-width: 0; display: block; overflow: visible; box-sizing: border-box; }
.area-chart { display: block; }
.grid-line { stroke: #e5e7eb; stroke-width: 1; }
.y-axis-label { font-size: 14px; font-weight: 300; fill: #6b7280; user-select: none; }
.x-axis-label-svg { font-size: 10px; font-weight: 300; fill: #6b7280; user-select: none; }
.hover-line { transition: opacity 0.15s ease; pointer-events: none; }
.area-path { opacity: 0; animation: fadeInArea 1s ease-out forwards; }
.line-path { stroke-dasharray: 3000; stroke-dashoffset: 3000; animation: drawLine 1.5s ease-out forwards; }
.data-point { opacity: 1; transform-origin: center; transition: r 0.2s ease; }
.animated-point { transition: none !important; animation: none !important; }
.data-point.is-hovered { opacity: 1; filter: drop-shadow(0 0 6px rgba(0,0,0,0.4)); }
@keyframes fadeInArea { to { opacity: 1; } }
@keyframes drawLine { to { stroke-dashoffset: 0; } }

.tooltip-container { position: fixed; transform: translate(-50%, calc(-100% - 12px)); background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); pointer-events: none; z-index: 99999; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.tooltip-container::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 8px solid transparent; border-top-color: white; }
.tooltip-header { margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.tooltip-year-label { font-size: 14px; font-weight: 600; color: #333; }
.tooltip-content { display: flex; flex-direction: column; gap: 5px; }
.tooltip-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.tooltip-color-indicator { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
.tooltip-variable-name { color: #666; flex-shrink: 0; }
.tooltip-variable-value { color: #333; font-weight: 600; margin-left: auto; }
.tooltip-sub-item { padding-left: 18px; }
.tooltip-sub-item .tooltip-variable-name { color: #888; font-size: 11px; }
.tooltip-sub-item .tooltip-variable-value { font-size: 11px; }
.tooltip-position-value { color: #333; font-weight: 600; }
.tooltip-separator { height: 1px; background: #e0e0e0; margin: 4px 0; }
.tooltip-fade-enter-active, .tooltip-fade-leave-active { transition: all 0.2s ease; }
.tooltip-fade-enter-from, .tooltip-fade-leave-to { opacity: 0; transform: translate(-50%, calc(-100% - 20px)); }
</style>