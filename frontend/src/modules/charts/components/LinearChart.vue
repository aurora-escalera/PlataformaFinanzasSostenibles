<template>
  <div class="linear-chart-container">
    <!-- Header con título y controles -->
    <div v-if="!hideHeader" class="chart-header">
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
        :width="dimensions.width" 
        :height="dimensions.height"
        class="line-chart"
        @mousemove="handleMouseMove"
        @mouseleave="hideTooltip"
      >
        <!-- Grid lines horizontales -->
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

        <!-- Etiquetas del eje Y -->
        <g class="y-axis-labels">
          <text
            v-for="i in gridLines"
            :key="`y-label-${i}`"
            :x="chartPadding.left - 10"
            :y="chartPadding.top + (i - 1) * gridSpacing + 4"
            class="y-axis-label"
            text-anchor="end"
          >
            {{ formatYAxisValue(getYAxisValue(i - 1)) }}
          </text>
        </g>

        <!-- Línea vertical punteada del hover -->
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

        <!-- Líneas -->
        <g class="lines">
          <g v-for="(variable, idx) in visibleVariables" :key="`line-${variable}`">
            <!-- Línea principal -->
            <path
              :d="getLinePath(variable)"
              :stroke="getVariableColor(variable)"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="['line-path', { 'line-exit': animatingVariables.has(variable) }]"
              :style="{ 
                animationDelay: animatingVariables.has(variable) ? '400ms' : `${idx * 0.1}s`,
                animationDuration: animatingVariables.has(variable) ? '300ms' : '1.5s'
              }"
            />

            <!-- Puntos animados que se mueven -->
            <g class="animated-data-points">
              <circle
                v-if="hoverState.visible && animatingPoints[`${variable}-x`] !== undefined"
                :cx="getAnimatedPointX(variable)"
                :cy="getAnimatedPointY(variable)"
                :r="5"
                :fill="getDarkerColor(variable)"
                class="data-point animated-point"
                :style="{ 
                  filter: `drop-shadow(0 0 8px ${getDarkerColor(variable)})`,
                  opacity: 1
                }"
              />
            </g>

            <!-- Puntos de datos permanentes -->
            <g class="permanent-data-points">
              <circle
                v-for="(point, i) in getVariableData(variable)"
                :key="`permanent-point-${variable}-${i}`"
                :cx="getXPosition(i)"
                :cy="getAnimatedY(variable, i)"
                :r="2"
                :fill="getVariableColor(variable)"
                class="data-point-permanent"
              />
            </g>

            <!-- Puntos de datos con hover -->
            <g class="data-points">
              <circle
                v-for="(point, i) in getVariableData(variable)"
                :key="`point-${variable}-${i}`"
                :cx="getXPosition(i)"
                :cy="getAnimatedY(variable, i)"
                :r="hoverState.visible && hoverState.index === i && animatingPoints[`${variable}-x`] === undefined ? 5 : 0"
                :fill="getVariableColor(variable)"
                :class="['data-point', { 'is-hovered': hoverState.visible && hoverState.index === i }]"
                :style="{ 
                  filter: `drop-shadow(0 0 8px ${getVariableColor(variable)})`
                }"
              />
            </g>
          </g>
        </g>
      </svg>

      <!-- ✅ Tooltip fijo en la parte superior, alineado con el punto en X -->
      <transition name="tooltip-fade">
        <div 
          v-if="hoverState.visible"
          class="tooltip-container"
          :style="{ left: `${hoverState.x}px` }"
        >
          <div class="tooltip-header">
            <span class="tooltip-year-label">{{ hoverState.label }}</span>
          </div>
          <div class="tooltip-content">
            <div 
              v-for="variable in visibleVariables"
              :key="`tooltip-${variable}`"
              class="tooltip-item"
            >
              <span class="tooltip-color-indicator" :style="{ backgroundColor: getVariableColor(variable) }"></span>
              <span class="tooltip-variable-name">{{ variable }}:</span>
              <span class="tooltip-variable-value">{{ formatValue(getVariableData(variable)[hoverState.index]) }}</span>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Eje X externo -->
    <div v-if="hasData" class="x-axis-container">
      <div 
        v-for="(label, i) in props.xLabels"
        :key="`x-label-external-${i}`"
        class="x-axis-label"
        :style="{ left: `${getXPosition(i)}px` }"
      >
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Análisis histórico'
  },
  subtitle: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => ({})
  },
  xLabels: {
    type: Array,
    default: () => ['2020', '2021', '2022', '2023', '2024']
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  gridLines: {
    type: Number,
    default: 5
  },
  valueFormatter: {
    type: Function,
    default: null
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 400
  },
  padding: {
    type: Object,
    default: () => ({
      top: 30,
      right: 40,
      bottom: 90,
      left: 60
    })
  },
  hideHeader: {
    type: Boolean,
    default: false
  },
  showCurrencySymbol: {
    type: Boolean,
    default: true
  },
  decimalPlaces: {
    type: Number,
    default: null
  },
  valueSuffix: {
    type: String,
    default: ''
  },
  valuePrefix: {
    type: String,
    default: ''
  },
  initialVisibleVariables: {
    type: Array,
    default: null
  }
})

const emit = defineEmits(['variable-toggle'])

const chartWrapper = ref(null)
const dimensions = ref({ width: props.width, height: props.height })

const hoverState = ref({
  visible: false,
  x: 0,
  index: -1,
  label: '',
  previousIndex: -1
})

const animatingPoints = ref({})

const chartPadding = computed(() => props.padding)

// Paleta de colores por defecto (fallback)
const colorPalette = [
  '#7cb342',
  '#9E9E9E',
  '#DC143C',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#ef4444',
]

// Mapa de colores semánticos basados en el nombre de la variable
const semanticColors = {
  // Verdes - Sostenibles
  'IS Total': '#7cb342',
  'IS': '#7cb342',
  'Ingresos Sostenibles': '#7cb342',
  'PS': '#7cb342',
  'Presupuestos Sostenibles': '#7cb342',
  
  // Rojos - Intensivos en Carbono
  'IIC Total': '#DC143C',
  'IIC': '#DC143C',
  'Ingresos Intensivos en Carbono': '#DC143C',
  'PIC': '#DC143C',
  'Presupuestos Intensivos en Carbono': '#DC143C',
  
  // Variantes de rojo para IIC
  'IIC_H': '#8B0000',
  'IIC_M': '#DC143C',
  'IIC_C': '#FF6B6B',
  
  // Grises - Totales
  'Financiamiento Total': '#9E9E9E',
  'Gasto Total': '#9E9E9E',
  'Ingreso Total': '#9E9E9E',
  'GT ($)': '#9E9E9E',
  'IT ($)': '#9E9E9E',
  'PT ($)': '#9E9E9E',
  
  // Para HomePage
  'IFS': '#9E9E9E',
  ' IFS': '#9E9E9E',
}

const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])

const animatedData = ref({})
const animatingVariables = ref(new Set())

watch(() => props.data, (newData, oldData) => {
  const vars = Object.keys(newData)
  const oldVars = oldData ? Object.keys(oldData) : []
  
  vars.forEach(variable => {
    if (!animatedData.value[variable]) {
      animatedData.value[variable] = [...(newData[variable] || [])]
    }
  })

  const hadNoData = oldVars.length === 0
  const hasDataNow = vars.length > 0
  
  if (hadNoData && hasDataNow && visibleVariables.value.length === 0) {
    activateInitialVariables(vars)
  }
  
  nextTick(() => {
    updateDimensions()
  })
}, { deep: true })

watch(availableVariables, () => {
  nextTick(() => {
    updateDimensions()
  })
})

watch([() => props.width, () => props.height], () => {
  updateDimensions()
})

const chartHeight = computed(() => dimensions.value.height - chartPadding.value.top - chartPadding.value.bottom)
const chartWidth = computed(() => dimensions.value.width - chartPadding.value.left - chartPadding.value.right)
const gridSpacing = computed(() => chartHeight.value / (props.gridLines - 1))

const allVisibleValues = computed(() => {
  const values = []
  visibleVariables.value.forEach(variable => {
    if (props.data[variable] && Array.isArray(props.data[variable])) {
      values.push(...props.data[variable].filter(v => v !== null && v !== undefined && !isNaN(v)))
    }
  })
  return values.length > 0 ? values : [0]
})

const maxValue = computed(() => {
  if (allVisibleValues.value.length === 0) return 100
  const max = Math.max(...allVisibleValues.value)
  const min = Math.min(...allVisibleValues.value)
  
  if (max === min) {
    return max > 0 ? max * 1.2 : max + 10
  }
  
  const range = max - min
  return max + (range * 0.20)
})

const minValue = computed(() => {
  if (allVisibleValues.value.length === 0) return 0
  const max = Math.max(...allVisibleValues.value)
  const min = Math.min(...allVisibleValues.value)
  
  if (max === min) {
    return min > 0 ? min * 0.8 : min - 10
  }
  
  const range = max - min
  return min - (range * 0.20)
})

const yScale = computed(() => {
  const range = maxValue.value - minValue.value
  return range > 0 ? chartHeight.value / range : 1
})

const hasData = computed(() => {
  return visibleVariables.value.length > 0 && 
         visibleVariables.value.some(v => props.data[v] && props.data[v].length > 0)
})

const getVariableData = (variable) => {
  return props.data[variable] || []
}

// ✅ Obtener color de variable - CON COLORES SEMÁNTICOS
const getVariableColor = (variable) => {
  if (semanticColors[variable]) {
    return semanticColors[variable]
  }
  
  const lowerVar = variable.toLowerCase()
  
  if (lowerVar.includes('sostenible') || lowerVar.includes(' is') || lowerVar === 'is' || lowerVar.includes('ps')) {
    return '#7cb342'
  }
  
  if (lowerVar.includes('carbono') || lowerVar.includes('iic') || lowerVar.includes('pic')) {
    return '#DC143C'
  }
  
  if (lowerVar.includes('total') || lowerVar.includes('gt') || lowerVar.includes('it') || lowerVar.includes('pt') || lowerVar.includes('ifs')) {
    return '#9E9E9E'
  }
  
  const index = availableVariables.value.indexOf(variable)
  return colorPalette[index % colorPalette.length]
}

const getDarkerColor = (variable) => {
  const color = getVariableColor(variable)
  const hex = color.replace('#', '')
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30)
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30)
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30)
  return `rgb(${r}, ${g}, ${b})`
}

const getXPosition = (index) => {
  const dataLength = props.xLabels.length
  if (dataLength <= 1) return chartPadding.value.left + chartWidth.value / 2
  
  const availableWidth = dimensions.value.width - chartPadding.value.left - chartPadding.value.right
  const step = availableWidth / (dataLength - 1)
  const position = chartPadding.value.left + index * step
  
  return position
}

const getY = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return dimensions.value.height - chartPadding.value.bottom
  }
  
  const range = maxValue.value - minValue.value
  if (range === 0) {
    return chartPadding.value.top + chartHeight.value / 2
  }
  
  const normalizedValue = value - minValue.value
  const percentage = normalizedValue / range
  
  const y = chartPadding.value.top + chartHeight.value * (1 - percentage)
  
  return Math.max(chartPadding.value.top, Math.min(dimensions.value.height - chartPadding.value.bottom, y))
}

const getAnimatedY = (variable, index) => {
  const value = animatedData.value[variable]?.[index]
  return getY(value)
}

const getYAxisValue = (index) => {
  const range = maxValue.value - minValue.value
  const step = range / (props.gridLines - 1)
  return maxValue.value - (step * index)
}

const formatYAxisValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  
  const prefix = props.showCurrencySymbol ? '$' : props.valuePrefix
  const suffix = props.valueSuffix
  
  if (props.decimalPlaces !== null) {
    return `${prefix}${value.toFixed(props.decimalPlaces)}${suffix}`
  }
  
  if (props.showCurrencySymbol) {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M` 
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${Math.round(value)}`
  }
  
  if (Math.abs(value) >= 1000000) {
    return `${prefix}${(value / 1000000).toFixed(1)}M${suffix}` 
  } else if (Math.abs(value) >= 1000) {
    return `${prefix}${(value / 1000).toFixed(1)}K${suffix}`
  }
  
  if (Math.abs(value) < 10) {
    return `${prefix}${value.toFixed(2)}${suffix}`
  }
  
  return `${prefix}${Math.round(value)}${suffix}`
}

const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A'
  
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  
  const prefix = props.showCurrencySymbol ? '$' : props.valuePrefix
  const suffix = props.valueSuffix
  
  if (props.decimalPlaces !== null) {
    return `${prefix}${value.toFixed(props.decimalPlaces)}${suffix}`
  }
  
  if (props.showCurrencySymbol) {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }
  
  if (Math.abs(value) >= 1000000) {
    return `${prefix}${(value / 1000000).toFixed(1)}M${suffix}`
  } else if (Math.abs(value) >= 1000) {
    return `${prefix}${(value / 1000).toFixed(1)}K${suffix}`
  }
  
  if (Math.abs(value) < 10) {
    return `${prefix}${value.toFixed(2)}${suffix}`
  }
  
  return `${prefix}${value.toFixed(0)}${suffix}`
}

const getLinePath = (variable) => {
  const data = animatedData.value[variable]
  if (!data || data.length === 0) return ''

  return data.map((value, i) => {
    const x = getXPosition(i)
    const y = getY(value)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')
}

const toggleVariable = (variable) => {
  const index = visibleVariables.value.indexOf(variable)
  
  if (index > -1) {
    animatingVariables.value.add(variable)
    
    const data = props.data[variable]
    if (data) {
      const startValues = [...animatedData.value[variable]]
      const range = maxValue.value - minValue.value
      const endValue = minValue.value - (range * 0.5)
      
      const pointsDuration = 500
      const totalDuration = pointsDuration + 300
      
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / totalDuration, 1)
        
        if (elapsed < pointsDuration) {
          const pointProgress = elapsed / pointsDuration
          const easeProgress = 1 - Math.pow(1 - pointProgress, 3)
          
          animatedData.value[variable] = startValues.map(val => 
            val - (val - endValue) * easeProgress
          )
        } else {
          animatedData.value[variable] = new Array(data.length).fill(endValue)
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          visibleVariables.value.splice(visibleVariables.value.indexOf(variable), 1)
          animatingVariables.value.delete(variable)
        }
      }
      
      animate()
    }
  } else {
    visibleVariables.value.push(variable)
    animatingVariables.value.add(variable)
    
    const data = props.data[variable]
    if (data) {
      const range = maxValue.value - minValue.value
      const startValue = minValue.value - (range * 0.5)
      
      animatedData.value[variable] = new Array(data.length).fill(startValue)
      
      const duration = 800
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        
        animatedData.value[variable] = data.map((val, i) => {
          const start = startValue
          const end = val
          return start + (end - start) * easeProgress
        })
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          animatedData.value[variable] = [...data]
          animatingVariables.value.delete(variable)
        }
      }
      
      animate()
    }
  }
  
  emit('variable-toggle', variable, visibleVariables.value.includes(variable))
}

const getAnimatedPointX = (variable) => {
  return animatingPoints.value[`${variable}-x`] || 0
}

const getAnimatedPointY = (variable) => {
  return animatingPoints.value[`${variable}-y`] || 0
}

const handleMouseMove = (event) => {
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  const x = event.clientX - rect.left
  
  const dataLength = props.xLabels.length
  let closestIndex = 0
  
  if (dataLength === 1) {
    closestIndex = 0
  } else {
    const transitionPoints = []
    for (let i = 0; i < dataLength - 1; i++) {
      const currentX = getXPosition(i)
      const nextX = getXPosition(i + 1)
      const distance = nextX - currentX
      transitionPoints.push(currentX + distance * 0.05)
    }
    
    if (x < transitionPoints[0]) {
      closestIndex = 0
    } else if (x >= transitionPoints[transitionPoints.length - 1]) {
      closestIndex = dataLength - 1
    } else {
      for (let i = 0; i < transitionPoints.length - 1; i++) {
        if (x >= transitionPoints[i] && x < transitionPoints[i + 1]) {
          closestIndex = i + 1
          break
        }
      }
    }
  }
  
  const previousIndex = hoverState.value.index
  const pointX = getXPosition(closestIndex)
  
  hoverState.value = {
    visible: true,
    x: pointX,
    index: closestIndex,
    label: props.xLabels[closestIndex],
    previousIndex: previousIndex
  }
  
  if (previousIndex !== closestIndex && previousIndex !== -1) {
    animatePointTransition(previousIndex, closestIndex)
  }
}

const animatePointTransition = (fromIndex, toIndex) => {
  visibleVariables.value.forEach(variable => {
    const startX = getXPosition(fromIndex)
    const endX = getXPosition(toIndex)
    const startY = getAnimatedY(variable, fromIndex)
    const endY = getAnimatedY(variable, toIndex)
    
    const duration = 200
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      animatingPoints.value[`${variable}-x`] = startX + (endX - startX) * easeProgress
      animatingPoints.value[`${variable}-y`] = startY + (endY - startY) * easeProgress
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        delete animatingPoints.value[`${variable}-x`]
        delete animatingPoints.value[`${variable}-y`]
      }
    }
    
    animate()
  })
}

const activateInitialVariables = (vars) => {
  console.log('🎯 [LinearChart] Activando variables iniciales...')
  console.log('  - initialVisibleVariables prop:', props.initialVisibleVariables)
  console.log('  - Variables disponibles:', vars)
  
  if (props.initialVisibleVariables && props.initialVisibleVariables.length > 0) {
    props.initialVisibleVariables.forEach((varName, index) => {
      const matchedVar = vars.find(v => v === varName || v.trim() === varName.trim())
      if (matchedVar) {
        console.log(`  ✅ Activando "${matchedVar}" en ${100 + (index * 400)}ms`)
        setTimeout(() => {
          toggleVariable(matchedVar)
        }, 100 + (index * 400))
      } else {
        console.log(`  ❌ Variable "${varName}" NO encontrada`)
      }
    })
  } else {
    console.log('  📌 Usando comportamiento por defecto (primeras 2 variables)')
    if (vars[0]) {
      setTimeout(() => {
        toggleVariable(vars[0])
      }, 100)
    }
    
    if (vars[1]) {
      setTimeout(() => {
        toggleVariable(vars[1])
      }, 900)
    }
  }
}

const hideTooltip = () => {
  hoverState.value = {
    visible: false,
    x: 0,
    index: -1,
    label: '',
    previousIndex: -1
  }
  animatingPoints.value = {}
}

const updateDimensions = () => {
  dimensions.value = {
    width: props.width,
    height: props.height
  }
}

onMounted(async () => {
  await nextTick()
  updateDimensions()
  
  setTimeout(() => {
    const vars = Object.keys(props.data)
    if (vars.length > 0 && visibleVariables.value.length === 0) {
      console.log('🚀 [LinearChart] onMounted (después de delay) - Datos disponibles:', vars)
      
      vars.forEach(variable => {
        if (!animatedData.value[variable]) {
          animatedData.value[variable] = [...(props.data[variable] || [])]
        }
      })
      
      activateInitialVariables(vars)
    }
  }, 100)
})

onUnmounted(() => {
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
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
  line-height: 1.4;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chart-subtitle {
  font-size: 13px;
  color: #6b7280;
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
  width: 100%;
  gap: 4px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  color: #666;
  transition: all 0.3s ease;
}

.btn-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.filter-btn.filter-active {
  background: white;      
  color: #2c3e50;        
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-btn.filter-inactive {
  background: transparent; 
  color: #999;            
  opacity: 0.7;
}

.filter-btn:hover {
  transform: scale(1.05);
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
  font-size: 14px;
  font-weight: 300;
  fill: #6b7280;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

.hover-line {
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
  font-weight: 100;
  color: #6b7280;
  white-space: nowrap;
  user-select: none;
}

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

.data-point-permanent {
  opacity: 1;
  transform-origin: center;
  transition: cy 0.05s ease;
}

.data-point {
  opacity: 1;
  transform-origin: center;
  transition: r 0.2s ease, cy 0.05s ease;
}

.animated-point {
  transition: none !important;
  animation: none !important;
}

.data-point.is-hovered {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.4));
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeLine {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.tooltip-container {
  position: absolute;
  top: -60px;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 100;
  min-width: 150px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: left 0.15s ease;
}

.tooltip-header {
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.tooltip-year-label {
  font-size: 12px;
  font-weight: 600;
  color: #333;
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
  font-size: 11px;
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

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>