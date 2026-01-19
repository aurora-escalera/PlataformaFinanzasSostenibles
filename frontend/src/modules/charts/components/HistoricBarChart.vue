<!-- src/modules/charts/components/HistoricBarChart.vue -->
<!-- ✅ MODIFICADO: Agregada prop buttonLabels para personalizar etiquetas de botones sin afectar tooltip -->
<template>
  <div class="bar-chart-container">
    <div v-if="!hideHeader" class="chart-title-section">
      <h3 class="chart-title">{{ title }}</h3>
    </div>

    <div v-if="showFilters" class="filters-wrapper">
      <div class="filters-section">
        <button
          v-for="variable in visibleVariables"
          :key="variable.key"
          @click="toggleFilter(variable.key)"
          class="filter-btn"
          :class="{ 
            'filter-active': activeFilters[variable.key] !== false,
            'filter-inactive': activeFilters[variable.key] === false
          }"
        >
          <span class="btn-color-dot" :style="{ backgroundColor: variable.color }"></span>
          {{ getButtonLabel(variable) }}
        </button>
      </div>
    </div>

    <div v-if="showFilters" class="currency-legend">
      * Cifras en dólares estadounidenses (USD)
    </div>

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
          :key="tick.value"
          class="grid-line"
          :style="{ bottom: `${tick.position}%` }"
        ></div>
      </div>

      <div 
        class="bars-scroll-container" 
        ref="barsScrollContainerRef"
        :class="{ 'has-scroll': needsScroll }"
        @scroll="handleScroll"
      >
        <div 
          class="bars-container" 
          ref="barsContainerRef"
          :style="scrollContainerStyle"
        >
          <div 
            v-for="yearData in data" 
            :key="yearData.year"
            class="year-group"
            :style="yearGroupStyle"
          >
            <div class="bars-wrapper" :style="{ gap: `${barGap}px` }">
              <template v-for="variable in getFilteredVariables(yearData)" :key="variable.key">
                <div
                  v-if="activeFilters[variable.key] !== false"
                  class="bar-item"
                >
                  <div 
                    class="bar"
                    :style="{
                      height: `${getBarHeight(variable.value)}px`,
                      backgroundColor: variable.color,
                      width: `${barWidth}px`
                    }"
                    @mouseenter="(e) => { hoveredYear = yearData.year; updateTooltipPosition(e) }"
                    @mousemove="updateTooltipPosition"
                    @mouseleave="hoveredYear = null"
                  ></div>
                </div>
              </template>
            </div>
          </div>
        </div>
        
        <transition name="fade">
          <div 
            v-if="needsScroll && !isScrolledToEnd" 
            class="scroll-indicator scroll-indicator-right"
            @click="scrollRight"
          >
            <span class="scroll-arrow">›</span>
          </div>
        </transition>
        
        <transition name="fade">
          <div 
            v-if="needsScroll && isScrolledFromStart" 
            class="scroll-indicator scroll-indicator-left"
            @click="scrollLeft"
          >
            <span class="scroll-arrow">‹</span>
          </div>
        </transition>
      </div>
    </div>

    <div class="x-axis-labels-wrapper">
      <div class="x-axis-spacer"></div>
      <div 
        class="x-axis-labels-scroll"
        ref="xAxisScrollRef"
        :class="{ 'has-scroll': needsScroll }"
      >
        <div class="x-axis-labels" :style="scrollContainerStyle">
          <div 
            v-for="yearData in data" 
            :key="yearData.year"
            class="year-label"
            :style="yearLabelStyle"
          >
            {{ yearData.year }}
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div 
        v-if="hoveredYear && tooltipItems.length > 0"
        class="tooltip-container"
        :style="{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }"
      >
        <div class="tooltip-header">
          <span class="tooltip-year-label">{{ hoveredYear }}</span>
        </div>
        <div class="tooltip-content">
          <template v-for="(item, idx) in tooltipItems" :key="item.key">
            <div v-if="idx > 0" class="tooltip-separator"></div>
            <div class="tooltip-item">
              <span class="tooltip-color-indicator" :style="{ backgroundColor: item.color }"></span>
              <span class="tooltip-variable-name">{{ item.label }}:</span>
              <span class="tooltip-variable-value">{{ formatCurrency(item.value) }}</span>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Gráfico de Barras' },
  data: { type: Array, required: true },
  showFilters: { type: Boolean, default: true },
  showLegend: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
  visibleVariableKeys: { type: Array, default: null },
  variablesConfig: { type: Object, default: null },
  initialActiveVariables: { type: Array, default: null },
  maxYearsWithoutScroll: { type: Number, default: 6 },
  // ✅ NUEVA PROP: Etiquetas personalizadas para botones de filtro (no afecta tooltip)
  buttonLabels: { type: Object, default: () => ({}) }
})

const hoveredYear = ref(null)
const activeFilters = ref({})
const tooltipPosition = ref({ x: 0, y: 0 })
const barsContainerRef = ref(null)
const barsScrollContainerRef = ref(null)
const xAxisScrollRef = ref(null)
const barsContainerHeight = ref(200)
const barsContainerWidth = ref(800)
const scrollPosition = ref(0)
const isScrolledToEnd = ref(false)
const isScrolledFromStart = ref(false)
const isMobile = ref(false)

const checkIsMobile = () => { isMobile.value = window.innerWidth <= 768 }

const needsScroll = computed(() => (props.data?.length || 0) > props.maxYearsWithoutScroll)

const yearGroupWidth = computed(() => {
  if (!needsScroll.value) return null
  const containerWidth = barsContainerWidth.value || 800
  return Math.max(containerWidth / 6, 80)
})

const totalBarsWidth = computed(() => {
  if (!needsScroll.value) return null
  return (props.data?.length || 0) * yearGroupWidth.value
})

const scrollContainerStyle = computed(() => {
  if (!needsScroll.value) return { width: '100%' }
  return { minWidth: `${totalBarsWidth.value}px`, width: `${totalBarsWidth.value}px` }
})

const yearGroupStyle = computed(() => {
  if (!needsScroll.value) return {}
  return { width: `${yearGroupWidth.value}px`, minWidth: `${yearGroupWidth.value}px`, flex: 'none' }
})

const yearLabelStyle = computed(() => {
  if (!needsScroll.value) return { flex: '1' }
  return { width: `${yearGroupWidth.value}px`, minWidth: `${yearGroupWidth.value}px`, flex: 'none' }
})

const handleScroll = (event) => {
  const container = event.target
  scrollPosition.value = container.scrollLeft
  const maxScroll = container.scrollWidth - container.clientWidth
  isScrolledToEnd.value = container.scrollLeft >= maxScroll - 10
  isScrolledFromStart.value = container.scrollLeft > 10
  if (xAxisScrollRef.value) xAxisScrollRef.value.scrollLeft = container.scrollLeft
}

const scrollRight = () => {
  if (barsScrollContainerRef.value) {
    barsScrollContainerRef.value.scrollBy({ left: yearGroupWidth.value * 2, behavior: 'smooth' })
  }
}

const scrollLeft = () => {
  if (barsScrollContainerRef.value) {
    barsScrollContainerRef.value.scrollBy({ left: -yearGroupWidth.value * 2, behavior: 'smooth' })
  }
}

// ✅ NUEVA FUNCIÓN: Obtener etiqueta para botón de filtro
const getButtonLabel = (variable) => {
  if (props.buttonLabels[variable.key]) {
    return props.buttonLabels[variable.key]
  }
  if (props.buttonLabels[variable.label]) {
    return props.buttonLabels[variable.label]
  }
  return variable.label
}

// ✅ TOOLTIP usa los labels ORIGINALES, no los buttonLabels
const tooltipItems = computed(() => {
  if (!hoveredYear.value || !props.data) return []
  const yearData = props.data.find(d => d.year === hoveredYear.value)
  if (!yearData?.variables) return []
  return getFilteredVariables(yearData)
    .filter(v => activeFilters.value[v.key] !== false)
    .map(v => ({ key: v.key, label: v.label, value: v.value, color: v.color }))
})

const updateTooltipPosition = (event) => {
  const rect = event.target.getBoundingClientRect()
  tooltipPosition.value = { x: rect.left + rect.width / 2, y: rect.top - 10 }
}

const semanticColors = {
  'IS': '#7cb342', 'IS Total': '#7cb342', 'Ingresos Sostenibles': '#7cb342',
  'PS': '#7cb342', 'Presupuestos Sostenibles': '#7cb342',
  'IIC': '#DC143C', 'IIC Total': '#DC143C', 'PIC': '#DC143C',
  'Presupuestos Intensivos en Carbono': '#DC143C', 'Ingresos Intensivos en Carbono': '#DC143C',
  'IIC_H': '#8B0000', 'IIC_M': '#DC143C', 'IIC_T': '#FF6B6B',
  'Financiamiento Total': '#9E9E9E', 'Gasto Total': '#9E9E9E', 'Ingreso Total': '#9E9E9E',
  'GT ($)': '#9E9E9E', 'IT ($)': '#9E9E9E', 'PT ($)': '#9E9E9E',
}

const getSemanticColor = (key, label, originalColor) => {
  if (semanticColors[key]) return semanticColors[key]
  if (semanticColors[label]) return semanticColors[label]
  const lowerKey = (key || '').toLowerCase()
  if (lowerKey === 'is' || lowerKey.includes('is_') || lowerKey.includes('sostenible') || lowerKey === 'ps') return '#7cb342'
  if (lowerKey === 'iic_h') return '#8B0000'
  if (lowerKey === 'iic_m') return '#DC143C'
  if (lowerKey === 'iic_t') return '#FF6B6B'
  if (lowerKey === 'iic' || lowerKey.includes('iic') || lowerKey === 'pic' || lowerKey.includes('carbono')) return '#DC143C'
  if (lowerKey.includes('total') || lowerKey.includes('gt') || lowerKey.includes('it') || lowerKey.includes('pt')) return '#9E9E9E'
  const lowerLabel = (label || '').toLowerCase()
  if (lowerLabel.includes('sostenible') || lowerLabel.includes(' is')) return '#7cb342'
  if (lowerLabel.includes('carbono') || lowerLabel.includes('iic') || lowerLabel.includes('pic')) return '#DC143C'
  if (lowerLabel.includes('total')) return '#9E9E9E'
  return originalColor
}

const uniqueVariables = computed(() => {
  if (!props.data || props.data.length === 0) return []
  const variablesMap = new Map()
  props.data.forEach(yearData => {
    yearData.variables?.forEach(variable => {
      if (!variablesMap.has(variable.key)) {
        const config = props.variablesConfig?.[variable.key]
        const baseColor = config?.color || variable.color
        variablesMap.set(variable.key, {
          key: variable.key,
          label: config?.label || variable.label,
          color: getSemanticColor(variable.key, config?.label || variable.label, baseColor),
          order: config?.order || 0
        })
      }
    })
  })
  return Array.from(variablesMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0))
})

const visibleVariables = computed(() => {
  if (!props.visibleVariableKeys?.length) return uniqueVariables.value
  return uniqueVariables.value.filter(v => props.visibleVariableKeys.includes(v.key))
})

const getFilteredVariables = (yearData) => {
  if (!yearData.variables) return []
  let filtered = yearData.variables
  if (props.visibleVariableKeys?.length) {
    filtered = filtered.filter(v => props.visibleVariableKeys.includes(v.key))
  }
  return filtered.map(v => {
    const config = props.variablesConfig?.[v.key]
    const label = config?.label || v.label
    const color = config?.color || v.color
    return { ...v, label, color: getSemanticColor(v.key, label, color), order: config?.order || 0 }
  }).sort((a, b) => (a.order || 0) - (b.order || 0))
}

const autoActivationDone = ref(false)

watch(visibleVariables, (newVars) => {
  newVars.forEach(variable => {
    if (!(variable.key in activeFilters.value)) {
      activeFilters.value[variable.key] = props.initialActiveVariables?.includes(variable.key) || false
    }
  })
  if (!autoActivationDone.value && newVars.length > 0) {
    autoActivationDone.value = true
    if (newVars[0]) setTimeout(() => { activeFilters.value[newVars[0].key] = true }, 100)
    if (newVars[1]) setTimeout(() => { activeFilters.value[newVars[1].key] = true }, 400)
  }
}, { immediate: true })

const toggleFilter = (key) => { activeFilters.value[key] = !activeFilters.value[key] }

const maxVisibleValue = computed(() => {
  if (!props.data?.length) return 100
  let maxValue = 0
  props.data.forEach(yearData => {
    getFilteredVariables(yearData).forEach(variable => {
      if (activeFilters.value[variable.key] !== false && variable.value > maxValue) {
        maxValue = variable.value
      }
    })
  })
  return maxValue > 0 ? maxValue * 0.8 : 100
})

const getBarHeight = (value) => {
  if (maxVisibleValue.value === 0) return 0
  return (barsContainerHeight.value * (value / maxVisibleValue.value) * 100) / 100
}

const yAxisTicks = computed(() => {
  const max = maxVisibleValue.value
  const step = max / 4
  return [
    { value: 0, position: 0 },
    { value: step, position: 25 },
    { value: step * 2, position: 50 },
    { value: step * 3, position: 75 },
    { value: max, position: 100 }
  ]
})

const barWidth = computed(() => {
  const activeCount = Object.values(activeFilters.value).filter(v => v !== false).length
  const yearsCount = props.data?.length || 1
  if (activeCount === 0) return isMobile.value ? 30 : 50

  if (needsScroll.value) {
    const groupWidth = yearGroupWidth.value
    const groupMargin = isMobile.value ? 8 : 16
    const gapBetweenBars = activeCount > 1 ? Math.max(2, Math.min(4, 60 / activeCount)) : 0
    const availableForBars = groupWidth - groupMargin
    const totalGaps = (activeCount - 1) * gapBetweenBars
    const calculatedWidth = (availableForBars - totalGaps) / activeCount
    const minWidth = isMobile.value ? 15 : 20
    const maxWidth = isMobile.value ? 50 : 80
    return Math.max(minWidth, Math.min(maxWidth, calculatedWidth))
  }

  const containerWidth = barsContainerWidth.value || 800
  const availableWidth = containerWidth - 20
  const widthPerYearGroup = availableWidth / yearsCount
  const gapBetweenBars = activeCount > 1 ? Math.max(2, Math.min(4, 60 / activeCount)) : 0
  const groupMargin = isMobile.value ? 8 : 16
  const availableForBars = widthPerYearGroup - groupMargin
  const totalGaps = (activeCount - 1) * gapBetweenBars
  const calculatedWidth = (availableForBars - totalGaps) / activeCount

  let minWidth, maxWidth
  if (isMobile.value) {
    minWidth = 12
    maxWidth = activeCount === 1 ? 50 : activeCount === 2 ? 40 : activeCount === 3 ? 30 : 25
  } else {
    minWidth = 18
    maxWidth = activeCount === 1 ? 90 : activeCount === 2 ? 65 : activeCount === 3 ? 50 : activeCount === 4 ? 40 : 35
  }
  return Math.max(minWidth, Math.min(maxWidth, calculatedWidth))
})

const barGap = computed(() => {
  const width = barWidth.value
  const activeCount = Object.values(activeFilters.value).filter(v => v !== false).length
  if (activeCount <= 1) return 0
  if (isMobile.value) return width > 35 ? 3 : width > 25 ? 2 : 1
  return width > 60 ? 5 : width > 45 ? 4 : width > 30 ? 3 : 2
})

const formatCurrency = (value) => {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)} B`
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)} M`
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)} K`
  return `$${value.toFixed(2)}`
}

const updateBarsContainerDimensions = () => {
  checkIsMobile()
  if (isMobile.value) {
    barsContainerHeight.value = 150
    if (barsScrollContainerRef.value) {
      const width = barsScrollContainerRef.value.clientWidth
      if (width > 0) barsContainerWidth.value = width
    }
    return
  }
  if (barsScrollContainerRef.value) {
    const height = barsScrollContainerRef.value.clientHeight - 30
    const width = barsScrollContainerRef.value.clientWidth
    if (height > 0) barsContainerHeight.value = height
    if (width > 0) barsContainerWidth.value = width
  }
}

let resizeObserver = null

onMounted(async () => {
  await nextTick()
  window.addEventListener('resize', updateBarsContainerDimensions)
  updateBarsContainerDimensions()
  if (barsScrollContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (!isMobile.value) updateBarsContainerDimensions()
    })
    resizeObserver.observe(barsScrollContainerRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBarsContainerDimensions)
  resizeObserver?.disconnect()
})

watch(() => props.data, () => nextTick(updateBarsContainerDimensions), { deep: true })
watch(activeFilters, () => nextTick(updateBarsContainerDimensions), { deep: true })
</script>

<style scoped>
.bar-chart-container {
  width: 100%; height: 100%; max-width: 100%;
  display: flex; flex-direction: column; align-items: center;
  background: white; border-radius: 8px; padding: 16px;
  box-sizing: border-box; overflow: visible;
}
.chart-title-section { margin-bottom: 12px; width: 100%; text-align: center; }
.chart-title { margin: 0; font-size: 14px; font-weight: 600; color: #2c3e50; }
.filters-wrapper {
  background: #f5f5f5; border-radius: 20px; padding: 6px;
  margin-bottom: 4px; display: flex; justify-content: center; width: 100%;
}
.filters-section { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
.filter-btn {
  padding: 6px 14px; border: none; border-radius: 16px;
  background: transparent; color: #666; cursor: pointer;
  font-size: 13px; font-weight: 500; transition: all 0.3s ease;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.filter-btn.filter-active { background: white; color: #2c3e50; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.filter-btn.filter-inactive { background: transparent; color: #999; opacity: 0.7; }
.filter-btn:hover { transform: scale(1.05); }
.currency-legend {
  font-size: 11px; font-style: italic; color: #888;
  text-align: left; width: 100%; margin-bottom: 12px; padding-left: 8px;
}
.chart-area {
  margin-top: 8px; padding-top: 20px; flex: 1;
  display: flex; position: relative; min-height: 0;
  width: 100%; max-width: 100%; overflow: visible; align-self: stretch;
}
.y-axis { width: 70px; position: relative; flex-shrink: 0; }
.y-tick {
  position: absolute; right: 0; width: 100%;
  display: flex; align-items: center;
  transition: bottom 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.tick-label {
  font-size: 12px; font-weight: 300; color: #666;
  text-align: right; width: 65px; padding-right: 10px;
}
.bars-scroll-container {
  flex: 1; max-width: 100%; display: flex; align-items: flex-end;
  overflow-x: hidden; overflow-y: visible; position: relative; height: 100%; z-index: 2;
}
.bars-scroll-container.has-scroll {
  overflow-x: auto; scroll-behavior: smooth;
  scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.2) transparent;
}
.bars-scroll-container.has-scroll::-webkit-scrollbar { height: 6px; }
.bars-scroll-container.has-scroll::-webkit-scrollbar-track { background: transparent; }
.bars-scroll-container.has-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
.scroll-indicator {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 28px; height: 28px; background: rgba(22,60,95,0.85);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 10; transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.scroll-indicator:hover { background: rgba(22,60,95,1); transform: translateY(-50%) scale(1.1); }
.scroll-indicator-right { right: 5px; }
.scroll-indicator-left { left: 5px; }
.scroll-arrow { color: white; font-size: 18px; font-weight: bold; line-height: 1; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.bars-container { display: flex; align-items: flex-end; height: 100%; }
.year-group {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; flex: 1; height: 100%; justify-content: flex-end; min-width: 0;
}
.bars-wrapper {
  display: flex; align-items: flex-end; justify-content: center;
  flex: 1; width: 100%; min-width: 0;
}
.bar-item {
  display: flex; flex-direction: column; align-items: center;
  justify-content: flex-end; transition: opacity 0.3s ease;
  position: relative; overflow: visible;
}
.bar {
  min-height: 2px; border-radius: 4px 4px 0 0; position: relative; cursor: pointer;
  transition: height 0.6s cubic-bezier(0.4,0,0.2,1), width 0.3s ease, opacity 0.3s ease, transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.bar:hover { opacity: 0.8; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
.x-axis-labels-wrapper { width: 100%; display: flex; height: 30px; flex-shrink: 0; margin-top: 8px; }
.x-axis-spacer { width: 70px; flex-shrink: 0; }
.x-axis-labels-scroll { flex: 1; overflow-x: hidden; }
.x-axis-labels-scroll.has-scroll { overflow-x: auto; scrollbar-width: none; }
.x-axis-labels-scroll.has-scroll::-webkit-scrollbar { display: none; }
.x-axis-labels { display: flex; }
.year-label {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: #666; font-weight: 500; text-align: center;
}
.grid-lines { position: absolute; top: 0; left: 70px; right: 0; bottom: 0; pointer-events: none; z-index: 1; }
.grid-line { position: absolute; left: 0; right: 0; height: 1px; background-color: #e0e0e0; }
.tooltip-container {
  position: fixed; transform: translate(-50%, calc(-100% - 15px));
  background: white; border: 1px solid #e0e0e0; border-radius: 8px;
  padding: 12px 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  pointer-events: none; z-index: 99999; min-width: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.tooltip-container::after {
  content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  border: 8px solid transparent; border-top-color: white;
}
.tooltip-header { margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.tooltip-year-label { font-size: 14px; font-weight: 600; color: #333; }
.tooltip-content { display: flex; flex-direction: column; gap: 5px; }
.tooltip-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.tooltip-color-indicator { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
.tooltip-variable-name { color: #666; flex-shrink: 0; }
.tooltip-variable-value { color: #333; font-weight: 600; margin-left: auto; }
.tooltip-separator { height: 1px; background: #e0e0e0; margin: 4px 0; }

@media (max-width: 768px) {
  .bar-chart-container { padding: 10px; border-radius: 6px; }
  .chart-title { font-size: 12px; }
  .filters-wrapper { padding: 4px; margin-bottom: 3px; border-radius: 16px; }
  .filter-btn { padding: 4px 10px; font-size: 10px; border-radius: 12px; gap: 4px; }
  .btn-color-dot { width: 6px; height: 6px; }
  .currency-legend { font-size: 9px; margin-bottom: 8px; }
  .chart-area { margin-top: 6px; padding-top: 15px; height: 200px; min-height: 200px; max-height: 200px; flex: none; }
  .bars-scroll-container { height: 100%; max-height: 180px; align-items: flex-end !important; }
  .y-axis { width: 50px; }
  .tick-label { font-size: 9px; width: 45px; }
  .grid-lines { left: 50px; }
  .x-axis-labels-wrapper { height: 25px; margin-top: 6px; }
  .x-axis-spacer { width: 50px; }
  .year-label { font-size: 9px; }
  .tooltip-container { padding: 10px 12px; min-width: 160px; }
  .tooltip-year-label { font-size: 12px; }
  .tooltip-item { font-size: 11px; }
}

@media (max-width: 480px) {
  .bar-chart-container { padding: 8px; }
  .chart-title { font-size: 10px; }
  .filter-btn { padding: 3px 7px; font-size: 8px; }
  .currency-legend { font-size: 7px; }
  .chart-area { height: 180px; min-height: 180px; max-height: 180px; }
  .y-axis { width: 40px; }
  .tick-label { font-size: 7px; width: 36px; }
  .grid-lines { left: 40px; }
  .x-axis-spacer { width: 40px; }
  .year-label { font-size: 7px; }
  .tooltip-container { padding: 8px 10px; min-width: 130px; }
  .tooltip-year-label { font-size: 10px; }
  .tooltip-item { font-size: 9px; }
}
</style>