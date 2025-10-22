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
        :class="['filter-btn', { 'active': visibleVariables.includes(variable) }]"
        :style="{ 
          '--btn-color': getVariableColor(variable),
          backgroundColor: visibleVariables.includes(variable) ? getVariableColor(variable) : 'white',
          color: visibleVariables.includes(variable) ? 'white' : '#6b7280'
        }"
      >
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

        <!-- Línea horizontal punteada del hover (desde eje Y hasta el punto) -->
        <line
          v-if="hoverState.visible && hoverState.yValue !== null"
          :x1="padding.left"
          :y1="hoverState.yPosition"
          :x2="hoverState.x"
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

        <!-- Áreas interactivas invisibles - ya no necesarias con mousemove -->
        <!-- 
        <g class="interaction-areas">
          <rect
            v-for="(label, i) in props.xLabels"
            :key="`interaction-${i}`"
            :x="getInteractionX(i)"
            :y="padding.top"
            :width="getInteractionWidth()"
            :height="dimensions.height - padding.top - padding.bottom"
            fill="transparent"
            class="interaction-rect"
            @mouseenter="showTooltipForIndex(i)"
          />
        </g>
        -->
      </svg>

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
    </div>

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

    <!-- Eje X externo (fuera del SVG) -->
    <div v-if="hasData" class="x-axis-container">
      <div 
        v-for="(label, i) in props.xLabels"
        :key="`x-label-external-${i}`"
        class="x-axis-label"
        :style="{ left: `${getXPositionPercentage(i)}%` }"
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
const dimensions = ref({ width: 600, height: 300 })

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

// Configuración de padding
const padding = { top: 10, right: 100, bottom: 130, left: 40 }

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
  
  // Solo inicializar visibleVariables si está vacío (primera carga)
  if (visibleVariables.value.length === 0) {
    // Dejar todas inactivas inicialmente
    visibleVariables.value = []
  }
}, { immediate: true, deep: true })

// Calcular valores apilados para cada punto
const getStackedValues = computed(() => {
  const stacked = {}
  const dataLength = props.xLabels.length
  
  visibleVariables.value.forEach((variable, varIndex) => {
    stacked[variable] = []
    const data = getVariableData(variable)
    
    for (let i = 0; i < dataLength; i++) {
      let stackedValue = data[i] || 0
      
      // Sumar los valores de las variables anteriores
      for (let j = 0; j < varIndex; j++) {
        const prevVariable = visibleVariables.value[j]
        const prevData = getVariableData(prevVariable)
        stackedValue += (prevData[i] || 0)
      }
      
      stacked[variable].push(stackedValue)
    }
  })
  
  return stacked
})

const tooltipXStyle = computed(() => {
  if (!hoverState.value.visible) return {}
  
  // Usar la misma función que usa el eje X para consistencia
  const percentage = getXPositionPercentage(hoverState.value.index)
  
  return {
    left: `${percentage}%`,
    bottom: '70px', // 20px desde abajo del contenedor (sobre el eje X)
    transform: 'translateX(-6%)'
  }
})

// Calcular el punto más alto de la gráfica (valor Y mínimo en píxeles)
const highestPoint = computed(() => {
  if (!hoverState.value.visible) return padding.top
  
  let minY = Infinity
  visibleVariables.value.forEach(variable => {
    const y = getStackedY(variable, hoverState.value.index, visibleVariables.value.indexOf(variable))
    if (y < minY) {
      minY = y
    }
  })
  
  return minY === Infinity ? padding.top : minY
})

// Estilo del tooltip fijo
const tooltipFixedStyle = computed(() => {
  if (!hoverState.value.visible) return {}
  
  return {
    left: `${hoverState.value.x + 70}px`,
    top: `${hoverState.value.yPosition + 65}px`,  // 20px arriba del punto
    transform: 'translate(-50%, -100%)'  // Centrado horizontal y arriba del cursor
  }
})
// Estilo del tooltip Y (a la izquierda)
const tooltipYStyle = computed(() => {
  return {
    top: `${hoverState.value.yPosition}px`,
    left: `${padding.left - 10}px`
  }
})

// Dimensiones del gráfico
const chartHeight = computed(() => dimensions.value.height - padding.top - padding.bottom)
const chartWidth = computed(() => dimensions.value.width - padding.left - padding.right)
const gridSpacing = computed(() => chartHeight.value / (props.gridLines - 1))

// Calcular posición X para cada punto
const getXPosition = (index) => {
  const dataLength = props.xLabels.length
  if (dataLength <= 1) return padding.left
  const step = chartWidth.value / (dataLength - 1)
  return padding.left + index * step
}

// Calcular posición X en porcentaje para las etiquetas externas
const getXPositionPercentage = (index) => {
  const dataLength = props.xLabels.length
  if (dataLength <= 1) return 0
  
  const totalWidth = dimensions.value.width
  const usableWidth = chartWidth.value
  const leftPaddingPercentage = (padding.left / totalWidth) * 100
  const usableWidthPercentage = (usableWidth / totalWidth) * 100
  
  const step = usableWidthPercentage / (dataLength - 1)
  return leftPaddingPercentage + (index * step)
}

// Área de interacción para cada punto
const getInteractionX = (index) => {
  if (index === 0) {
    return padding.left
  }
  return getXPosition(index - 1)
}

const getInteractionWidth = () => {
  const dataLength = props.xLabels.length
  if (dataLength <= 1) return chartWidth.value
  
  const step = chartWidth.value / (dataLength - 1)
  return step
}

// Calcular el máximo valor apilado
const maxStackedValue = computed(() => {
  let maxVal = 0
  const dataLength = props.xLabels.length
  
  for (let i = 0; i < dataLength; i++) {
    let sum = 0
    visibleVariables.value.forEach(variable => {
      const data = getVariableData(variable)
      sum += (data[i] || 0)
    })
    if (sum > maxVal) {
      maxVal = sum
    }
  }
  
  // Reducir el margen superior para que las curvas sean más pronunciadas
  // En vez de 1.1 (10% extra), usamos 1.02 (2% extra) para que ocupen más espacio
  return maxVal > 0 ? maxVal * 1.02 : 100
})

// Verificar si hay datos
const hasData = computed(() => {
  return availableVariables.value.length > 0 && 
         visibleVariables.value.length > 0
})

// Funciones
const toggleVariable = async (variable) => {
  const index = visibleVariables.value.indexOf(variable)
  
  if (index > -1) {
    // Desactivar: animar hacia cero
    await animateVariableOut(variable)
    visibleVariables.value.splice(index, 1)
  } else {
    // Activar: agregar y animar desde cero
    visibleVariables.value.push(variable)
    await animateVariableIn(variable)
  }
  
  emit('variable-toggle', visibleVariables.value)
}

// Animar entrada de variable (desde cero hacia valores reales)
const animateVariableIn = async (variable) => {
  const realData = props.data[variable] || []
  const steps = 15
  const duration = 800
  const stepDuration = duration / steps
  
  // Inicializar en cero
  animatedData.value[variable] = new Array(realData.length).fill(0)
  
  // Animar cada paso
  for (let step = 0; step <= steps; step++) {
    const progress = step / steps
    const easedProgress = easeOutCubic(progress)
    
    animatedData.value[variable] = realData.map((value, i) => {
      if (value === null || value === undefined || isNaN(value)) return 0
      return value * easedProgress
    })
    
    await new Promise(resolve => setTimeout(resolve, stepDuration))
  }
  
  // Asegurar valores finales exactos
  animatedData.value[variable] = [...realData]
}

// Animar salida de variable (desde valores reales hacia cero)
const animateVariableOut = async (variable) => {
  const realData = props.data[variable] || []
  const currentData = animatedData.value[variable] || realData
  const steps = 15
  const duration = 600
  const stepDuration = duration / steps
  
  // Animar cada paso hacia cero
  for (let step = 0; step <= steps; step++) {
    const progress = step / steps
    const easedProgress = easeInCubic(progress)
    
    animatedData.value[variable] = currentData.map((value, i) => {
      if (value === null || value === undefined || isNaN(value)) return 0
      const realValue = realData[i] || 0
      return realValue * (1 - easedProgress)
    })
    
    await new Promise(resolve => setTimeout(resolve, stepDuration))
  }
  
  // Finalizar en cero
  animatedData.value[variable] = new Array(realData.length).fill(0)
}

// Funciones de easing
const easeOutCubic = (t) => {
  return 1 - Math.pow(1 - t, 3)
}

const easeInCubic = (t) => {
  return Math.pow(t, 3)
}

// Obtener posición X animada del punto
const getAnimatedPointX = (variable, varIndex) => {
  if (!hoverState.value.visible) return 0
  
  const key = `${variable}-x`
  if (animatingPoints.value[key] !== undefined) {
    return animatingPoints.value[key]
  }
  
  return getXPosition(hoverState.value.index)
}

// Obtener posición Y animada del punto
const getAnimatedPointY = (variable, varIndex) => {
  if (!hoverState.value.visible) return 0
  
  const key = `${variable}-y`
  if (animatingPoints.value[key] !== undefined) {
    return animatingPoints.value[key]
  }
  
  return getStackedY(variable, hoverState.value.index, varIndex)
}

// Animar puntos deslizándose por toda la curva
const animatePointsTransition = async (fromIndex, toIndex, variable, varIndex) => {
  if (fromIndex === -1 || fromIndex === toIndex) return
  
  console.log(`Animando ${variable} de ${fromIndex} a ${toIndex}`)
  
  const animKey = `${variable}-animating`
  
  // Cancelar animación previa si existe
  if (animatingPoints.value[animKey]) {
    animatingPoints.value[animKey] = false
    await nextTick()
  }
  
  animatingPoints.value[animKey] = true
  
  const data = getVariableData(variable)
  
  // Determinar dirección del movimiento
  const movingForward = toIndex > fromIndex
  const startIdx = Math.min(fromIndex, toIndex)
  const endIdx = Math.max(fromIndex, toIndex)
  
  // Generar puntos a lo largo de la curva
  const curvePoints = []
  
  // Iterar por cada segmento entre puntos
  for (let segIdx = startIdx; segIdx < endIdx; segIdx++) {
    const p1 = {
      x: getXPosition(segIdx),
      y: getStackedY(variable, segIdx, varIndex)
    }
    const p2 = {
      x: getXPosition(segIdx + 1),
      y: getStackedY(variable, segIdx + 1, varIndex)
    }
    
    const midX = (p1.x + p2.x) / 2
    const pointsPerSegment = 20 // Más puntos para animación más suave
    
    // Generar puntos intermedios usando curva de Bézier
    for (let j = 0; j <= pointsPerSegment; j++) {
      const t = j / pointsPerSegment
      const mt = 1 - t
      
      // Puntos de control
      const cp1 = { x: midX, y: p1.y }
      const cp2 = { x: midX, y: p2.y }
      
      // Curva de Bézier cúbica
      const x = Math.pow(mt, 3) * p1.x + 
                3 * Math.pow(mt, 2) * t * cp1.x + 
                3 * mt * Math.pow(t, 2) * cp2.x + 
                Math.pow(t, 3) * p2.x
      
      const y = Math.pow(mt, 3) * p1.y + 
                3 * Math.pow(mt, 2) * t * cp1.y + 
                3 * mt * Math.pow(t, 2) * cp2.y + 
                Math.pow(t, 3) * p2.y
      
      if (j < pointsPerSegment || segIdx === endIdx - 1) {
        curvePoints.push({ x, y })
      }
    }
  }
  
  // Si va hacia atrás, invertir los puntos
  if (!movingForward) {
    curvePoints.reverse()
  }
  
  console.log(`Total de puntos en la curva: ${curvePoints.length}`)
  
  // Animar usando async/await con nextTick para forzar renderizado
  const totalDuration = 200 // ms
  const delayPerFrame = totalDuration / curvePoints.length
  
  for (let i = 0; i < curvePoints.length; i++) {
    if (!animatingPoints.value[animKey]) {
      console.log('Animación cancelada')
      break
    }
    
    const point = curvePoints[i]
    animatingPoints.value[`${variable}-x`] = point.x
    animatingPoints.value[`${variable}-y`] = point.y
    
    if (i % 5 === 0) { // Log cada 5 frames para no saturar consola
      console.log(`Frame ${i}: x=${point.x.toFixed(1)}, y=${point.y.toFixed(1)}`)
    }
    
    // Esperar a que Vue actualice el DOM
    await nextTick()
    // Pequeña pausa para que sea visible
    await new Promise(resolve => setTimeout(resolve, delayPerFrame))
  }
  
  console.log('Animación completada')
  
  // Limpiar valores animados
  delete animatingPoints.value[`${variable}-x`]
  delete animatingPoints.value[`${variable}-y`]
  delete animatingPoints.value[animKey]
}

// Función de easing para animación suave
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const getVariableColor = (variable) => {
  const index = availableVariables.value.indexOf(variable)
  return colorPalette[index % colorPalette.length]
}

const getDarkerColor = (variable) => {
  const color = getVariableColor(variable)
  
  // Convertir hex a RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Oscurecer solo unos tonos (restando 35 puntos RGB)
  const darkenAmount = 30
  const newR = Math.max(0, r - darkenAmount)
  const newG = Math.max(0, g - darkenAmount)
  const newB = Math.max(0, b - darkenAmount)
  
  // Convertir de vuelta a hex
  const toHex = (n) => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}

const getVariableId = (variable) => {
  return variable.replace(/[^a-zA-Z0-9]/g, '-')
}

const getVariableData = (variable) => {
  // Retornar datos animados si existen, sino los datos reales
  return animatedData.value[variable] || props.data[variable] || []
}

// Obtener la posición Y para un valor apilado
const getStackedY = (variable, index, varIndex) => {
  const stackedValues = getStackedValues.value
  const stackedValue = stackedValues[variable]?.[index] || 0
  
  const percentage = stackedValue / maxStackedValue.value
  return padding.top + chartHeight.value * (1 - percentage)
}

// Obtener la posición Y base (suma de variables anteriores)
const getBaseY = (varIndex, index) => {
  if (varIndex === 0) {
    return padding.top + chartHeight.value // Línea base
  }
  
  let sum = 0
  for (let i = 0; i < varIndex; i++) {
    const prevVariable = visibleVariables.value[i]
    const prevData = getVariableData(prevVariable)
    sum += (prevData[index] || 0)
  }
  
  const percentage = sum / maxStackedValue.value
  return padding.top + chartHeight.value * (1 - percentage)
}

const getLinePath = (variable, varIndex) => {
  const data = getVariableData(variable)
  if (data.length === 0) return ''

  const points = []
  
  // Recolectar todos los puntos
  for (let i = 0; i < data.length; i++) {
    const x = getXPosition(i)
    const y = getStackedY(variable, i, varIndex)
    points.push({ x, y })
  }
  
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  
  // Usar curvas tipo campana más suaves
  return createBellCurvePath(points)
}

// Función para crear curvas suaves tipo Catmull-Rom
const createSmoothPath = (points, tension = 0.4) => {
  if (points.length < 2) return ''
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  
  let path = `M ${points[0].x} ${points[0].y}`
  
  // Usar interpolación monotone cubic para curvas más naturales
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    
    // Calcular tangentes para curvas más suaves
    const t1x = (p2.x - p0.x) * tension
    const t1y = (p2.y - p0.y) * tension
    const t2x = (p3.x - p1.x) * tension
    const t2y = (p3.y - p1.y) * tension
    
    // Puntos de control para curva cúbica
    const cp1x = p1.x + t1x
    const cp1y = p1.y + t1y
    const cp2x = p2.x - t2x
    const cp2y = p2.y - t2y
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  
  return path
}

// Función alternativa con curvas más pronunciadas tipo "campana"
const createBellCurvePath = (points) => {
  if (points.length < 2) return ''
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  
  let path = `M ${points[0].x} ${points[0].y}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    
    // Calcular el punto medio
    const midX = (current.x + next.x) / 2
    
    // Usar el promedio de Y para puntos de control, creando curvas más suaves
    const avgY = (current.y + next.y) / 2
    
    // Los puntos de control están en el medio horizontalmente
    // pero mantienen las alturas originales para crear la curva
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`
  }
  
  return path
}

const getAreaPath = (variable, varIndex) => {
  const data = getVariableData(variable)
  if (data.length === 0) return ''

  const topPoints = []
  const bottomPoints = []
  
  // Recolectar puntos superiores e inferiores
  for (let i = 0; i < data.length; i++) {
    const x = getXPosition(i)
    const topY = getStackedY(variable, i, varIndex)
    const bottomY = getBaseY(varIndex, i)
    
    topPoints.push({ x, y: topY })
    bottomPoints.push({ x, y: bottomY })
  }
  
  if (topPoints.length === 0) return ''
  
  let path = ''
  
  // Comenzar desde el primer punto inferior
  path = `M ${bottomPoints[0].x} ${bottomPoints[0].y}`
  
  // Línea base con curvas suaves (de izquierda a derecha)
  if (bottomPoints.length > 2) {
    for (let i = 0; i < bottomPoints.length - 1; i++) {
      const current = bottomPoints[i]
      const next = bottomPoints[i + 1]
      const midX = (current.x + next.x) / 2
      
      path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`
    }
  } else if (bottomPoints.length === 2) {
    path += ` L ${bottomPoints[1].x} ${bottomPoints[1].y}`
  }
  
  // Línea vertical hasta el último punto superior
  path += ` L ${topPoints[topPoints.length - 1].x} ${topPoints[topPoints.length - 1].y}`
  
  // Línea superior con curvas suaves (de derecha a izquierda)
  if (topPoints.length > 2) {
    for (let i = topPoints.length - 1; i > 0; i--) {
      const current = topPoints[i]
      const prev = topPoints[i - 1]
      const midX = (current.x + prev.x) / 2
      
      path += ` C ${midX} ${current.y}, ${midX} ${prev.y}, ${prev.x} ${prev.y}`
    }
  } else if (topPoints.length === 2) {
    path += ` L ${topPoints[0].x} ${topPoints[0].y}`
  }
  
  // Cerrar el path conectando de vuelta al inicio
  path += ` L ${bottomPoints[0].x} ${bottomPoints[0].y} Z`
  
  return path
}

const formatValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  if (value === null || value === undefined || isNaN(value)) return '0'
  return value.toLocaleString('es-MX', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 1 
  })
}

const handleMouseMove = (event) => {
  if (!chartWrapper.value) return
  
  const rect = chartWrapper.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  
  // Encontrar entre qué dos puntos está el cursor
  let leftIndex = -1
  let rightIndex = -1
  let leftPointX = 0
  let rightPointX = 0
  
  for (let i = 0; i < props.xLabels.length - 1; i++) {
    const currentX = getXPosition(i)
    const nextX = getXPosition(i + 1)
    
    if (mouseX >= currentX && mouseX <= nextX) {
      leftIndex = i
      rightIndex = i + 1
      leftPointX = currentX
      rightPointX = nextX
      break
    }
  }
  
  // Si está antes del primer punto
  if (mouseX < getXPosition(0)) {
    leftIndex = 0
    rightIndex = 0
    leftPointX = getXPosition(0)
    rightPointX = getXPosition(0)
  }
  
  // Si está después del último punto
  if (mouseX > getXPosition(props.xLabels.length - 1)) {
    leftIndex = props.xLabels.length - 1
    rightIndex = props.xLabels.length - 1
    leftPointX = getXPosition(props.xLabels.length - 1)
    rightPointX = getXPosition(props.xLabels.length - 1)
  }
  
  if (leftIndex === -1) return
  
  // Calcular la distancia relativa entre los dos puntos
  const totalDistance = rightPointX - leftPointX
  const mouseDistance = mouseX - leftPointX
  const ratio = totalDistance > 0 ? mouseDistance / totalDistance : 0
  
  // Determinar hacia qué punto debe ir basándose en la posición del cursor
  // Si ratio < 0.5, está más cerca del punto izquierdo, si >= 0.5, del derecho
  const targetIndex = ratio < 0.5 ? leftIndex : rightIndex
  
  // Mostrar tooltip para el índice objetivo
  showTooltipForIndex(targetIndex, mouseX, ratio < 0.5 ? 'left' : 'right')
}

const showTooltipForIndex = (index, mouseX = null, direction = null) => {
  const previousIndex = hoverState.value.index
  
  // Calcular el valor Y más alto (la última variable visible apilada)
  let highestValue = 0
  let highestY = padding.top + chartHeight.value
  
  if (visibleVariables.value.length > 0) {
    const lastVariable = visibleVariables.value[visibleVariables.value.length - 1]
    const lastVarIndex = visibleVariables.value.length - 1
    highestY = getStackedY(lastVariable, index, lastVarIndex)
    
    // Sumar todos los valores en este punto
    visibleVariables.value.forEach(variable => {
      const data = getVariableData(variable)
      highestValue += (data[index] || 0)
    })
  }
  
  hoverState.value = {
    visible: true,
    x: getXPosition(index),
    index: index,
    label: props.xLabels[index],
    yValue: highestValue,
    yPosition: highestY,
    previousIndex: previousIndex
  }
  
  // Animar puntos basándose en la dirección del movimiento del cursor
  if (previousIndex !== -1 && previousIndex !== index && Math.abs(index - previousIndex) <= 3) {
    visibleVariables.value.forEach((variable, varIndex) => {
      animatePointsTransition(previousIndex, index, variable, varIndex)
    })
  } else if (previousIndex !== -1 && previousIndex !== index) {
    // Si el salto es muy grande, no animar
    animatingPoints.value = {}
  }
}

const hideTooltip = () => {
  hoverState.value = {
    visible: false,
    x: 0,
    index: -1,
    label: '',
    yValue: null,
    yPosition: 0,
    previousIndex: -1
  }
  // Limpiar animaciones
  animatingPoints.value = {}
}

const handleResize = () => {
  if (chartWrapper.value) {
    const parentWidth = chartWrapper.value.offsetWidth
    const parentHeight = chartWrapper.value.offsetHeight
    
    dimensions.value = {
      width: parentWidth || 600,
      height: parentHeight || 300
    }
  }
}

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  
  if (chartWrapper.value) {
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(chartWrapper.value)
    
    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.area-chart-container {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  padding-bottom: 60px; /* Espacio extra para tooltip X */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: visible;
  position: relative; /* Para que el tooltip X se posicione correctamente */
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.4;
  text-align: center;
}

.chart-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  text-align: center;
}

/* Filtros de variables */
.variable-filters {
  display: flex;
  flex-direction: row;
  height: 32px;
  padding: 4px;
  border-radius: 24px;
  flex-wrap: wrap;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
  gap: 6px;
  margin-bottom: 16px;
  flex-shrink: 0;
  background-color: white;
}

.filter-btn {
  flex: 0 1 auto;
  border: 1px solid #e5e7eb;
  padding: 4px 12px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.2px;
}

.filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.filter-btn.active {
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-weight: 600;
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
  align-items: center;
  justify-content: center;
  padding-bottom: 0;
  overflow: visible;
}

.area-chart {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
}

.hover-line {
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.interaction-rect {
  cursor: pointer;
}

/* Eje X externo */
.x-axis-container {
  position: relative;
  width: 100%;
  height: 30px;
  margin-top: 8px;
  flex-shrink: 0;
}

.x-axis-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
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
  position: absolute;
  background: #1f2937;
  color: white;
  border-radius: 6px;
  padding: 6px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 100px;
  min-height: 75px;
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
  padding-top: 10px;
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
  font-size: 9px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
}

.tooltip-value {
  font-size: 9px;
  font-weight: 200;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
}

/* Tooltip Y (a la izquierda) */
.tooltip-y {
  position: absolute;
  background: #F0F0F2;
  border: 1px solid #C5CBCE;
  color: black;
  border-radius: 4px;
  padding: 4px 8px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 10px;
  font-weight: 200;
  transform: translate(-100%, -50%);
  white-space: nowrap;
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

  letter-spacing: -0.3px;
}

/* Tooltip X (en el eje inferior) */
.tooltip-x {
  position: absolute;
  background: #F0F0F2;
  border: 1px solid #C5CBCE;
  color: black;
  border-radius: 4px;
  padding: 4px 10px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.3px;
}

/* Flecha del tooltip X (apunta hacia arriba) */
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

/* Borde de la flecha */
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

/* Transición específica para tooltip X */
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