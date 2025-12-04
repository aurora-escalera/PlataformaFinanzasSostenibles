<template>
  <div class="area-chart-container">
    <!-- Header con título y controles -->
    <div class="chart-header">
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
            :x="padding.left - 10"
            :y="padding.top + (i - 1) * gridSpacing + 4"
            class="y-axis-label"
            text-anchor="end"
          >
            {{ formatYAxisValue(getYAxisValue(i - 1)) }}
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
          :y1="0"
          :x2="hoverState.x"
          :y2="dimensions.height"
          class="hover-line"
          stroke="#9ca3af"
          stroke-width="0.5"
          stroke-dasharray="4 4"
        />

        <!-- Línea horizontal punteada del hover (desde eje Y hasta el punto) -->
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

        <!-- Áreas apiladas (de abajo hacia arriba) -->
        <g class="areas">
          <g v-for="(variable, idx) in visibleVariables" :key="`area-${variable}`">
            <!-- Área con gradiente -->
            <path
              :d="getAreaPath(variable, idx)"
              :fill="`url(#gradient-${getVariableId(variable)})`"
              class="area-path"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            />
            
            <!-- Línea de borde superior -->
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

            <!-- Puntos animados que se mueven (prioridad durante animación) -->
            <g class="animated-data-points">
              <circle
                v-if="hoverState.visible && animatingPoints[`${variable}-x`] !== undefined"
                :cx="getAnimatedPointX(variable, idx)"
                :cy="getAnimatedPointY(variable, idx)"
                :r="3"
                :fill="getDarkerColor(variable)"
                class="data-point animated-point"
                :style="{ 
                  filter: `drop-shadow(0 0 8px ${getDarkerColor(variable)})`,
                  opacity: 1
                }"
              />
            </g>

            <!-- Puntos de datos estáticos (solo cuando NO hay animación) -->
            <g class="data-points">
              <circle
                v-for="(point, i) in getVariableData(variable)"
                :key="`point-${variable}-${i}`"
                :cx="getXPosition(i)"
                :cy="getStackedY(variable, i, idx)"
                :r="hoverState.visible && hoverState.index === i && animatingPoints[`${variable}-x`] === undefined ? 3 : 0"
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
    </div>

    <!-- Tooltips con Teleport -->
    <Teleport to="body">
      <!-- Tooltip fijo en la parte superior -->
      <transition name="tooltip-fade">
        <div 
          v-if="hoverState.visible" 
          class="tooltip-fixed"
          :style="tooltipFixedStyle"
        >
          <div class="tooltip-year">{{ hoverState.label }}</div>
          <div class="tooltip-items">
            <div 
              v-for="variable in visibleVariables"
              :key="`tooltip-${variable}`"
              class="tooltip-item"
            >
              <div class="tooltip-item-header">
                <div 
                  class="tooltip-dot" 
                  :style="{ backgroundColor: getVariableColor(variable) }"
                ></div>
                <span class="tooltip-variable">{{ variable }}</span>
              </div>
              <div class="tooltip-value">
                {{ formatValue(getVariableData(variable)[hoverState.index]) }}
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Tooltip Y (a la izquierda) -->
      <transition name="tooltip-fade">
        <div 
          v-if="hoverState.visible && hoverState.yValue !== null" 
          class="tooltip-y"
          :style="tooltipYStyle"
        >
          {{ formatValue(hoverState.yValue) }}
        </div>
      </transition>

      <!-- Tooltip X (en el eje inferior) -->
      <transition name="tooltip-x-fade">
        <div 
          v-if="hoverState.visible" 
          class="tooltip-x"
          :style="tooltipXStyle"
        >
          {{ hoverState.label }}
        </div>
      </transition>
    </Teleport>

    <!-- ✅ CORREGIDO: Eje X con posicionamiento absoluto (igual que LinearChart) -->
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
    default: () => ({
      'IS Total': [45234.5, 52341.2, 58123.7, 61456.8, 67234.9],
      'Financ. para desarrollo total': [23456.8, 48123.4, 52341.9, 54234.5, 55678.2]
    })
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
  }
})

const emit = defineEmits(['variable-toggle'])

// Estado
const chartWrapper = ref(null)
const dimensions = ref({ width: 800, height: 300 })

// Estado del hover
const hoverState = ref({
  visible: false,
  x: 0,
  index: -1,
  label: '',
  yValue: null,
  yPosition: 0,
  previousIndex: -1
})

// Estado para la animación de los puntos
const animatingPoints = ref({})

// Configuración de padding - IGUAL QUE LinearChart
const padding = { top: 30, right: 40, bottom: 90, left: 60 }

// Paleta de colores
const colorPalette = [
  '#10b981',
  '#3b82f6',
  '#a3e635',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#ef4444',
]

// Variables disponibles y visibles (inicialmente TODAS inactivas)
const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])

// Estado de animación para cada variable
const animatedData = ref({})

// Inicializar variables TODAS inactivas
watch(() => props.data, (newData) => {
  const vars = Object.keys(newData)
  
  // Inicializar datos animados en cero
  vars.forEach(variable => {
    if (!animatedData.value[variable]) {
      animatedData.value[variable] = new Array(props.xLabels.length).fill(0)
    }
  })

  // Si no hay variables visibles, no mostrar ninguna por defecto
  if (visibleVariables.value.length === 0) {
    // No hacer nada, mantener todas inactivas
  }
}, { immediate: true })

// Comprobar si hay datos
const hasData = computed(() => {
  return visibleVariables.value.length > 0 && 
         visibleVariables.value.some(v => props.data[v] && props.data[v].length > 0)
})

// Actualizar dimensiones cuando cambien los datos visibles
watch(hasData, async (newVal) => {
  if (newVal) {
    await nextTick()
    updateDimensions()
  }
}, { immediate: true })

// Máximo valor Y
const maxY = computed(() => {
  if (!hasData.value) return 100

  let maxStack = 0
  for (let i = 0; i < props.xLabels.length; i++) {
    let stackSum = 0
    visibleVariables.value.forEach(variable => {
      const value = animatedData.value[variable]?.[i] || 0
      stackSum += value
    })
    maxStack = Math.max(maxStack, stackSum)
  }

  // Agregar un pequeño margen del 10% arriba del valor máximo
  return maxStack * 1.1 || 100
})

// Función para obtener el valor del eje Y en una posición específica
const getYAxisValue = (index) => {
  const step = maxY.value / (props.gridLines - 1)
  return maxY.value - (index * step)
}

// Función para formatear los valores del eje Y
const formatYAxisValue = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return value.toFixed(0)
}

// Espaciado de grid
const gridSpacing = computed(() => {
  return (dimensions.value.height - padding.top - padding.bottom) / (props.gridLines - 1)
})

// Obtener datos de variable (usando datos animados)
const getVariableData = (variable) => {
  return animatedData.value[variable] || []
}

// Obtener color de variable
const getVariableColor = (variable) => {
  const index = availableVariables.value.indexOf(variable)
  return colorPalette[index % colorPalette.length]
}

// Obtener color más oscuro para puntos
const getDarkerColor = (variable) => {
  const color = getVariableColor(variable)
  // Convertir hex a RGB y oscurecer
  const hex = color.replace('#', '')
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40)
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40)
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40)
  return `rgb(${r}, ${g}, ${b})`
}

// ID para gradientes
const getVariableId = (variable) => {
  return variable.replace(/[^a-zA-Z0-9]/g, '-')
}

// Toggle variable
const toggleVariable = (variable) => {
  const index = visibleVariables.value.indexOf(variable)
  
  if (index > -1) {
    // Desactivar: animar hacia 0
    visibleVariables.value.splice(index, 1)
    animateToZero(variable)
  } else {
    // Activar: agregar y animar desde 0 hasta valor real
    visibleVariables.value.push(variable)
    animateFromZero(variable)
  }
  
  emit('variable-toggle', { variable, visible: index === -1 })
}

// Animar desde 0 hasta el valor real
const animateFromZero = (variable) => {
  const duration = 1000
  const startTime = Date.now()
  const targetData = props.data[variable]
  
  if (!animatedData.value[variable]) {
    animatedData.value[variable] = new Array(targetData.length).fill(0)
  }

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = easeOutCubic(progress)

    animatedData.value[variable] = targetData.map(value => value * easeProgress)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

// Animar hacia 0
const animateToZero = (variable) => {
  const duration = 500
  const startTime = Date.now()
  const startData = [...(animatedData.value[variable] || [])]

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = easeInCubic(progress)

    animatedData.value[variable] = startData.map(value => value * (1 - easeProgress))

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      // Al finalizar, establecer en 0
      animatedData.value[variable] = new Array(startData.length).fill(0)
    }
  }

  animate()
}

// Easing functions
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeInCubic = (t) => t * t * t

// Posición X
const getXPosition = (index) => {
  const chartWidth = dimensions.value.width - padding.left - padding.right
  const step = chartWidth / (props.xLabels.length - 1)
  return padding.left + index * step
}

// Posición Y para un valor
const getYPosition = (value) => {
  const chartHeight = dimensions.value.height - padding.top - padding.bottom
  const ratio = value / maxY.value
  return dimensions.value.height - padding.bottom - ratio * chartHeight
}

// Posición Y apilada
const getStackedY = (variable, dataIndex, variableIndex) => {
  let stackSum = 0
  
  for (let i = 0; i <= variableIndex; i++) {
    const v = visibleVariables.value[i]
    const data = getVariableData(v)
    stackSum += data[dataIndex] || 0
  }
  
  return getYPosition(stackSum)
}

// Suma apilada hasta cierto índice (excluyente)
const getStackedSum = (variableIndex, dataIndex) => {
  let sum = 0
  for (let i = 0; i < variableIndex; i++) {
    const v = visibleVariables.value[i]
    const data = getVariableData(v)
    sum += data[dataIndex] || 0
  }
  return sum
}

// Path del área
const getAreaPath = (variable, variableIndex) => {
  const data = getVariableData(variable)
  if (!data || data.length === 0) return ''

  // Crear puntos para la línea superior
  const topPoints = data.map((value, i) => {
    const x = getXPosition(i)
    const stackSum = getStackedSum(variableIndex, i) + value
    const y = getYPosition(stackSum)
    return { x, y }
  })

  // Crear puntos para la línea inferior
  const bottomPoints = data.map((value, i) => {
    const x = getXPosition(i)
    const stackSum = getStackedSum(variableIndex, i)
    const y = getYPosition(stackSum)
    return { x, y }
  }).reverse()

  // Generar path suave para la línea superior
  let path = generateSmoothPath(topPoints)
  
  // Agregar la línea inferior
  if (bottomPoints.length > 0) {
    path += ' L ' + bottomPoints.map(p => `${p.x} ${p.y}`).join(' L ')
  }
  
  path += ' Z'
  return path
}

// Función auxiliar para generar paths suaves (curvas Catmull-Rom)
const generateSmoothPath = (points) => {
  if (points.length < 2) return ''
  
  let path = `M ${points[0].x} ${points[0].y}`
  
  if (points.length === 2) {
    path += ` L ${points[1].x} ${points[1].y}`
    return path
  }

  // Usar curvas cúbicas de Bézier más suaves
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    
    // Calcular puntos de control para una curva más sutil
    const tension = 0.3 // Factor de tensión (0 = línea recta, 1 = muy curveado)
    
    let cp1x, cp1y, cp2x, cp2y
    
    if (i === 0) {
      // Primera curva
      cp1x = current.x + (next.x - current.x) * tension
      cp1y = current.y
      cp2x = next.x - (next.x - current.x) * tension
      cp2y = next.y
    } else {
      // Curvas intermedias
      const prev = points[i - 1]
      cp1x = current.x + (next.x - prev.x) * tension * 0.5
      cp1y = current.y + (next.y - prev.y) * tension * 0.5
      
      if (i < points.length - 2) {
        const nextNext = points[i + 2]
        cp2x = next.x - (nextNext.x - current.x) * tension * 0.5
        cp2y = next.y - (nextNext.y - current.y) * tension * 0.5
      } else {
        cp2x = next.x - (next.x - current.x) * tension
        cp2y = next.y
      }
    }
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
  }
  
  return path
}

// Path de la línea
const getLinePath = (variable, variableIndex) => {
  const data = getVariableData(variable)
  if (!data || data.length === 0) return ''

  // Crear puntos
  const points = data.map((value, i) => {
    const x = getXPosition(i)
    const stackSum = getStackedSum(variableIndex, i) + value
    const y = getYPosition(stackSum)
    return { x, y }
  })
  
  return generateSmoothPath(points)
}

// ✅ CORREGIDO: Manejo del mouse con transición al 30%
const handleMouseMove = (event) => {
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  
  const dataLength = props.xLabels.length
  let closestIndex = 0
  
  if (dataLength === 1) {
    closestIndex = 0
  } else {
    // Calcular puntos de transición al 30% del camino
    const transitionPoints = []
    for (let i = 0; i < dataLength - 1; i++) {
      const currentX = getXPosition(i)
      const nextX = getXPosition(i + 1)
      const distance = nextX - currentX
      transitionPoints.push(currentX + distance * 0.05)
    }
    
    // Determinar en qué rango está el cursor
    if (mouseX < transitionPoints[0]) {
      closestIndex = 0
    } else if (mouseX >= transitionPoints[transitionPoints.length - 1]) {
      closestIndex = dataLength - 1
    } else {
      for (let i = 0; i < transitionPoints.length - 1; i++) {
        if (mouseX >= transitionPoints[i] && mouseX < transitionPoints[i + 1]) {
          closestIndex = i + 1
          break
        }
      }
    }
  }
  
  const x = getXPosition(closestIndex)
  
  // Calcular el valor Y total en este punto
  let totalY = 0
  visibleVariables.value.forEach((variable, idx) => {
    const data = getVariableData(variable)
    totalY += data[closestIndex] || 0
  })
  
  const yPosition = getYPosition(totalY)
  
  // Si cambió el índice, animar los puntos
  if (closestIndex !== hoverState.value.index) {
    animatePointsToIndex(closestIndex)
  }
  
  hoverState.value = {
    visible: true,
    x,
    index: closestIndex,
    label: props.xLabels[closestIndex],
    yValue: totalY,
    yPosition,
    previousIndex: hoverState.value.index
  }
}

// Animar puntos hacia un nuevo índice
const animatePointsToIndex = (targetIndex) => {
  const duration = 200
  const startTime = Date.now()
  
  visibleVariables.value.forEach((variable, idx) => {
    const startIndex = hoverState.value.index >= 0 ? hoverState.value.index : targetIndex
    const startX = getXPosition(startIndex)
    const targetX = getXPosition(targetIndex)
    
    const startStackSum = startIndex >= 0 ? 
      getStackedSum(idx, startIndex) + (getVariableData(variable)[startIndex] || 0) : 0
    const targetStackSum = getStackedSum(idx, targetIndex) + (getVariableData(variable)[targetIndex] || 0)
    
    const startY = getYPosition(startStackSum)
    const targetY = getYPosition(targetStackSum)
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      
      animatingPoints.value[`${variable}-x`] = startX + (targetX - startX) * eased
      animatingPoints.value[`${variable}-y`] = startY + (targetY - startY) * eased
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Limpiar animación al terminar
        delete animatingPoints.value[`${variable}-x`]
        delete animatingPoints.value[`${variable}-y`]
      }
    }
    
    animate()
  })
}

// Obtener posiciones animadas de puntos
const getAnimatedPointX = (variable) => {
  return animatingPoints.value[`${variable}-x`] || 0
}

const getAnimatedPointY = (variable) => {
  return animatingPoints.value[`${variable}-y`] || 0
}

const hideTooltip = () => {
  hoverState.value.visible = false
  // Limpiar puntos animados
  animatingPoints.value = {}
}

// Estilos de tooltips - POSITION FIXED
const tooltipFixedStyle = computed(() => {
  if (!chartWrapper.value) return {}
  const rect = chartWrapper.value.getBoundingClientRect()
  return {
    left: `${rect.left + hoverState.value.x + 70}px`,
    top: `${rect.top + 10}px`
  }
})

const tooltipYStyle = computed(() => {
  if (!chartWrapper.value) return {}
  const rect = chartWrapper.value.getBoundingClientRect()
  return {
    left: `${rect.left + padding.left - 8}px`,
    top: `${rect.top + hoverState.value.yPosition}px`
  }
})

const tooltipXStyle = computed(() => {
  if (!chartWrapper.value) return {}
  const rect = chartWrapper.value.getBoundingClientRect()
  return {
    left: `${rect.left + hoverState.value.x}px`,
    top: `${rect.top + dimensions.value.height - 130}px`,
    transform: 'translateX(-50%)'
  }
})

// Formatear valor
const formatValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

// Resize observer - SIMPLIFICADO
const updateDimensions = () => {
  if (chartWrapper.value && chartWrapper.value.parentElement) {
    const container = chartWrapper.value.parentElement
    dimensions.value = {
      width: container.clientWidth,
      height: Math.max(300, container.clientHeight - 50)
    }
  }
}

let resizeObserver = null

onMounted(async () => {
  await nextTick()
  await nextTick()
  updateDimensions()
  
  if (chartWrapper.value) {
    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        updateDimensions()
      })
    })
    resizeObserver.observe(chartWrapper.value.parentElement)
  }
  
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style scoped>
.area-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 16px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.chart-title {
  margin: 0 0 4px 0;
  letter-spacing: -0.2px;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.chart-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  text-align: center;
}

/* Filtros de variables */
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
  flex-shrink: 0;
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
  max-width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  box-sizing: border-box;
}

.area-chart {
  width: 100%;
  height: 100%;
  display: block;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
}

.y-axis-label {
  font-size: 9px;
  font-weight: 200;
  fill: #6b7280;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

.hover-line {
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.interaction-rect {
  cursor: pointer;
}

/* ✅ CORREGIDO: Eje X con posicionamiento absoluto (igual que LinearChart) */
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

/* Animaciones de áreas */
.area-path {
  opacity: 0;
  animation: fadeInArea 1s ease-out forwards;
}

.line-path {
  stroke-dasharray: 3000;
  stroke-dashoffset: 3000;
  animation: drawLine 1.5s ease-out forwards;
}

.data-point {
  opacity: 1;
  transform-origin: center;
  transition: r 0.2s ease;
}

.animated-point {
  transition: none !important;
  animation: none !important;
}

.data-point.is-hovered {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.4));
}

@keyframes fadeInArea {
  to {
    opacity: 1;
  }
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

/* Tooltip fijo */
.tooltip-fixed {
  position: fixed;
  background: #1f2937;
  color: white;
  border-radius: 6px;
  padding: 2px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 90px;
  min-height: 55px;
  opacity: 95%;
  transform: translateX(-50%);
  white-space: normal;
  text-align: center;
}

.tooltip-year {
  font-size: 9px;
  color: white;
  margin-bottom: 2px;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tooltip-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tooltip-item-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tooltip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tooltip-variable {
  font-size: 8px;
  font-weight: 100;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
}

.tooltip-value {
  font-size: 8px;
  font-weight: 100;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
}

.tooltip-y {
  position: fixed;
  background: #F0F0F2;
  border: 1px solid #C5CBCE;
  color: black;
  border-radius: 4px;
  padding: 4px 8px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 9px;
  font-weight: 200;
  transform: translate(-100%, -50%);
  white-space: nowrap;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  letter-spacing: -0.3px;
}

.tooltip-x {
  position: fixed;
  background: #F0F0F2;
  border: 1px solid #C5CBCE;
  color: black;
  border-radius: 4px;
  padding: 4px 10px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 9px;
  font-weight: 200;
  white-space: nowrap;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.3px;
}

.tooltip-x::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 5px 5px 5px;
  border-color: transparent transparent #F0F0F2 transparent;
  filter: blur(0.3px);
}

.tooltip-x::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent #C5CBCE transparent;
  filter: blur(0.3px);
  z-index: -1;
  margin-bottom: -1px;
}

/* Transiciones */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-5px);
}

.tooltip-x-fade-enter-active,
.tooltip-x-fade-leave-active {
  transition: all 0.2s ease;
}

.tooltip-x-fade-enter-from,
.tooltip-x-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%);
}
</style>