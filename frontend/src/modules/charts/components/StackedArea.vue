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
      <!-- Tooltip principal (estilo HistoricBarChart) -->
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
    </Teleport>
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
  hideHeader: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: null
  },
  height: {
    type: Number,
    default: null
  },
  // ✅ NUEVO: Variables que deben estar visibles al cargar
  initialVisibleVariables: {
    type: Array,
    default: null
    // Ejemplo: ['IS Total', 'Financ. para desarrollo total']
    // Si es null, usa el comportamiento por defecto (primeras 2 variables)
  }
})

const emit = defineEmits(['variable-toggle'])

// Estado
const chartWrapper = ref(null)
const svgRef = ref(null)
const containerRef = ref(null)
const dimensions = ref({ width: 800, height: 300 })
let resizeObserver = null

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
const padding = { top: 10, right: 15, bottom: 25, left: 40 }

// Paleta de colores por defecto (fallback)
const colorPalette = [
  '#7cb342',  // Verde sostenible
  '#9E9E9E',  // Gris
  '#DC143C',  // Rojo carbono
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
  'IIC_H': '#8B0000',      // dark-red
  'IIC_M': '#DC143C',      // red
  'IIC_C': '#FF6B6B',      // light-red
  
  // Grises - Totales
  'Financiamiento Total': '#9E9E9E',
  'Gasto Total': '#9E9E9E',
  'Ingreso Total': '#9E9E9E',
  'GT ($)': '#9E9E9E',
  'IT ($)': '#9E9E9E',
  'PT ($)': '#9E9E9E',
}

// Variables disponibles y visibles
const availableVariables = computed(() => Object.keys(props.data))
const visibleVariables = ref([])

// Estado de animación para cada variable
const animatedData = ref({})

// ✅ Watch para detectar cambios en datos (de vacío a con datos)
watch(() => props.data, (newData, oldData) => {
  const vars = Object.keys(newData)
  const oldVars = oldData ? Object.keys(oldData) : []
  
  console.log('📊 [StackedArea] Watch data ejecutado')
  console.log('  - Variables anteriores:', oldVars.length)
  console.log('  - Variables nuevas:', vars)
  
  // Inicializar datos animados en cero
  vars.forEach(variable => {
    if (!animatedData.value[variable]) {
      animatedData.value[variable] = new Array(props.xLabels.length).fill(0)
    }
  })

  // Solo activar si pasamos de 0 variables a tener variables (datos recién cargados)
  const hadNoData = oldVars.length === 0
  const hasDataNow = vars.length > 0
  
  if (hadNoData && hasDataNow && visibleVariables.value.length === 0) {
    activateInitialVariables(vars)
  }
}, { deep: true })

// ✅ Función para activar variables iniciales
const activateInitialVariables = (vars) => {
  console.log('🎯 [StackedArea] Activando variables iniciales...')
  console.log('  - initialVisibleVariables prop:', props.initialVisibleVariables)
  console.log('  - Variables disponibles:', vars)
  
  if (props.initialVisibleVariables && props.initialVisibleVariables.length > 0) {
    // Usar las variables especificadas en initialVisibleVariables
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
    // Comportamiento por defecto: activar primeras 2 variables
    console.log('  📌 Usando comportamiento por defecto (primeras 2 variables)')
    if (vars[0]) {
      setTimeout(() => {
        toggleVariable(vars[0])
      }, 100)
    }
    
    if (vars[1]) {
      setTimeout(() => {
        toggleVariable(vars[1])
      }, 500)
    }
  }
}

// Comprobar si hay datos
const hasData = computed(() => {
  return visibleVariables.value.length > 0 && 
         visibleVariables.value.some(v => props.data[v] && props.data[v].length > 0)
})

// Actualizar dimensiones cuando cambien los datos visibles
watch(hasData, async (newVal) => {
  if (newVal) {
    await nextTick()
    await nextTick()
    await nextTick()
    
    updateDimensions()
    
    if (chartWrapper.value) {
      if (resizeObserver) {
        resizeObserver.disconnect()
      } else {
        resizeObserver = new ResizeObserver(() => {
          requestAnimationFrame(() => {
            updateDimensions()
          })
        })
      }
      resizeObserver.observe(chartWrapper.value)
    }
  }
}, { immediate: true })

// También actualizar cuando cambie availableVariables
watch(availableVariables, async () => {
  await nextTick()
  if (hasData.value) {
    updateDimensions()
  }
})

// Watch para cambios en props width/height
watch([() => props.width, () => props.height], () => {
  updateDimensions()
})

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

  return maxStack * 1.1 || 100
})

// Función para obtener el valor del eje Y en una posición específica
const getYAxisValue = (index) => {
  const step = maxY.value / (props.gridLines - 1)
  return maxY.value - (index * step)
}

// Formatear los valores del eje Y
const formatYAxisValue = (value) => {
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  
  const prefix = props.showCurrencySymbol ? '$' : props.valuePrefix
  const suffix = props.valueSuffix
  
  if (props.decimalPlaces !== null && !props.showCurrencySymbol) {
    return `${prefix}${value.toFixed(props.decimalPlaces)}${suffix}`
  }
  
  if (props.decimalPlaces !== null && props.showCurrencySymbol) {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(props.decimalPlaces)}M`
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(props.decimalPlaces)}K`
    }
    return `$${value.toFixed(props.decimalPlaces)}`
  }
  
  if (props.showCurrencySymbol) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
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

// Espaciado de grid
const gridSpacing = computed(() => {
  return (dimensions.value.height - padding.top - padding.bottom) / (props.gridLines - 1)
})

// Obtener datos de variable (usando datos animados)
const getVariableData = (variable) => {
  return animatedData.value[variable] || []
}

// ✅ Obtener color de variable - AHORA CON COLORES SEMÁNTICOS
const getVariableColor = (variable) => {
  // Primero buscar en el mapa semántico
  if (semanticColors[variable]) {
    return semanticColors[variable]
  }
  
  // Buscar coincidencias parciales
  const lowerVar = variable.toLowerCase()
  
  // Patrones para verde (sostenible)
  if (lowerVar.includes('sostenible') || lowerVar.includes(' is') || lowerVar === 'is' || lowerVar.includes('ps')) {
    return '#7cb342'
  }
  
  // Patrones para rojo (carbono)
  if (lowerVar.includes('carbono') || lowerVar.includes('iic') || lowerVar.includes('pic')) {
    return '#DC143C'
  }
  
  // Patrones para gris (totales)
  if (lowerVar.includes('total') || lowerVar.includes('gt') || lowerVar.includes('it') || lowerVar.includes('pt')) {
    return '#9E9E9E'
  }
  
  // Fallback a la paleta por índice
  const index = availableVariables.value.indexOf(variable)
  return colorPalette[index % colorPalette.length]
}

// Obtener color más oscuro para puntos
const getDarkerColor = (variable) => {
  const color = getVariableColor(variable)
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
    visibleVariables.value.splice(index, 1)
    animateToZero(variable)
  } else {
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

  const topPoints = data.map((value, i) => {
    const x = getXPosition(i)
    const stackSum = getStackedSum(variableIndex, i) + value
    const y = getYPosition(stackSum)
    return { x, y }
  })

  const bottomPoints = data.map((value, i) => {
    const x = getXPosition(i)
    const stackSum = getStackedSum(variableIndex, i)
    const y = getYPosition(stackSum)
    return { x, y }
  }).reverse()

  let path = generateSmoothPath(topPoints)
  
  if (bottomPoints.length > 0) {
    path += ' L ' + bottomPoints.map(p => `${p.x} ${p.y}`).join(' L ')
  }
  
  path += ' Z'
  return path
}

// Función auxiliar para generar paths suaves - MEJORADA
const generateSmoothPath = (points) => {
  if (points.length < 2) return ''
  
  let path = `M ${points[0].x} ${points[0].y}`
  
  if (points.length === 2) {
    path += ` L ${points[1].x} ${points[1].y}`
    return path
  }

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    
    // Calcular la diferencia de Y para ajustar la tensión
    const yDiff = Math.abs(next.y - current.y)
    const xDiff = Math.abs(next.x - current.x)
    
    // Si la diferencia es muy grande, reducir la tensión para evitar overshoot
    // Si los valores son similares, usar tensión mínima para líneas más rectas
    let tension = 0.2
    
    // Detectar si hay un cambio muy abrupto
    if (yDiff > 50) {
      tension = 0.1 // Muy poco suavizado para cambios grandes
    }
    
    // Detectar si los valores son muy similares (casi planos)
    if (yDiff < 5) {
      tension = 0.05 // Casi línea recta para valores similares
    }
    
    let cp1x, cp1y, cp2x, cp2y
    
    if (i === 0) {
      // Primera curva
      cp1x = current.x + (next.x - current.x) * tension
      cp1y = current.y
      cp2x = next.x - (next.x - current.x) * tension
      cp2y = next.y
    } else {
      const prev = points[i - 1]
      
      // Calcular la pendiente entre puntos anteriores y siguientes
      const prevYDiff = Math.abs(current.y - prev.y)
      const nextYDiff = i < points.length - 2 ? Math.abs(points[i + 2].y - next.y) : 0
      
      // Ajustar tensión basada en cambios de dirección
      let localTension = tension
      
      // Si venimos de un valor alto y vamos a valores bajos estables
      if (prevYDiff > 30 && yDiff < 10) {
        localTension = 0.05
      }
      
      // Si los valores anteriores y actuales son similares (zona plana)
      if (prevYDiff < 5 && yDiff < 5) {
        localTension = 0.02
      }
      
      cp1x = current.x + (next.x - prev.x) * localTension * 0.5
      cp1y = current.y + (next.y - prev.y) * localTension * 0.3
      
      if (i < points.length - 2) {
        const nextNext = points[i + 2]
        cp2x = next.x - (nextNext.x - current.x) * localTension * 0.5
        cp2y = next.y - (nextNext.y - current.y) * localTension * 0.3
      } else {
        cp2x = next.x - (next.x - current.x) * localTension
        cp2y = next.y
      }
      
      // Limitar los puntos de control para evitar que la curva vaya por debajo del mínimo
      // o por encima del máximo de los puntos adyacentes
      const minY = Math.min(current.y, next.y)
      const maxY = Math.max(current.y, next.y)
      
      // Permitir solo un pequeño margen de overshoot
      const margin = (maxY - minY) * 0.1
      cp1y = Math.max(minY - margin, Math.min(maxY + margin, cp1y))
      cp2y = Math.max(minY - margin, Math.min(maxY + margin, cp2y))
    }
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
  }
  
  return path
}

// Path de la línea
const getLinePath = (variable, variableIndex) => {
  const data = getVariableData(variable)
  if (!data || data.length === 0) return ''

  const points = data.map((value, i) => {
    const x = getXPosition(i)
    const stackSum = getStackedSum(variableIndex, i) + value
    const y = getYPosition(stackSum)
    return { x, y }
  })
  
  return generateSmoothPath(points)
}

// Manejo del mouse
const handleMouseMove = (event) => {
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  
  const scaleX = dimensions.value.width / rect.width
  const mouseX = (event.clientX - rect.left) * scaleX
  
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
  
  let totalY = 0
  visibleVariables.value.forEach((variable, idx) => {
    const data = getVariableData(variable)
    totalY += data[closestIndex] || 0
  })
  
  const yPosition = getYPosition(totalY)
  
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
  animatingPoints.value = {}
}

// Estilos de tooltip
const tooltipFixedStyle = computed(() => {
  if (!svgRef.value || !hoverState.value.visible) return {}
  
  const svg = svgRef.value
  const ctm = svg.getScreenCTM()
  if (!ctm) return {}
  
  const svgX = hoverState.value.x
  const svgY = hoverState.value.yPosition
  
  const screenX = ctm.a * svgX + ctm.c * svgY + ctm.e
  const screenY = ctm.b * svgX + ctm.d * svgY + ctm.f
  
  return {
    left: `${screenX}px`,
    top: `${screenY}px`
  }
})

// Formatear valor para tooltip
const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A'
  
  if (props.valueFormatter) {
    return props.valueFormatter(value)
  }
  
  const prefix = props.showCurrencySymbol ? '$' : props.valuePrefix
  const suffix = props.valueSuffix
  
  if (props.decimalPlaces !== null && !props.showCurrencySymbol) {
    return `${prefix}${value.toFixed(props.decimalPlaces)}${suffix}`
  }
  
  if (props.decimalPlaces !== null && props.showCurrencySymbol) {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(props.decimalPlaces)}M`
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(props.decimalPlaces)}K`
    }
    return `$${value.toFixed(props.decimalPlaces)}`
  }
  
  if (props.showCurrencySymbol) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }
  
  if (Math.abs(value) >= 1000000) {
    return `${prefix}${(value / 1000000).toFixed(2)}M${suffix}`
  } else if (Math.abs(value) >= 1000) {
    return `${prefix}${(value / 1000).toFixed(2)}K${suffix}`
  }
  
  if (Math.abs(value) < 10) {
    return `${prefix}${value.toFixed(2)}${suffix}`
  }
  
  return `${prefix}${value.toFixed(2)}${suffix}`
}

// Actualizar dimensiones
const updateDimensions = () => {
  if (props.width !== null && props.height !== null) {
    dimensions.value = {
      width: props.width,
      height: props.height
    }
    return
  }
  
  if (props.width !== null && chartWrapper.value) {
    const rect = chartWrapper.value.getBoundingClientRect()
    dimensions.value = {
      width: props.width,
      height: rect.height > 0 ? Math.floor(rect.height) : 300
    }
    return
  }
  
  if (props.height !== null && chartWrapper.value) {
    const rect = chartWrapper.value.getBoundingClientRect()
    dimensions.value = {
      width: rect.width > 0 ? Math.floor(rect.width) : 800,
      height: props.height
    }
    return
  }
  
  if (chartWrapper.value) {
    const rect = chartWrapper.value.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      dimensions.value = {
        width: Math.floor(rect.width),
        height: Math.floor(rect.height)
      }
    }
  }
}

// ✅ onMounted con delay para activar variables si los datos ya existen
onMounted(async () => {
  await nextTick()
  await nextTick()
  
  setTimeout(() => {
    updateDimensions()
    
    // ✅ Si ya hay datos al montar, activar variables iniciales
    const vars = Object.keys(props.data)
    if (vars.length > 0 && visibleVariables.value.length === 0) {
      console.log('🚀 [StackedArea] onMounted (después de delay) - Datos disponibles:', vars)
      
      // Inicializar animatedData
      vars.forEach(variable => {
        if (!animatedData.value[variable]) {
          animatedData.value[variable] = new Array(props.xLabels.length).fill(0)
        }
      })
      
      // Activar variables iniciales
      activateInitialVariables(vars)
    }
    
    if (chartWrapper.value) {
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          updateDimensions()
        })
      })
      resizeObserver.observe(chartWrapper.value)
    }
  }, 100)
  
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
  padding: 4px 6px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
  overflow: visible;
}

.chart-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.chart-title {
  margin: 0;
  letter-spacing: -0.2px;
  font-size: 12px;
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.chart-subtitle {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
  line-height: 1.2;
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

.filter-btn:hover {
  transform: scale(1.05);
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  color: #9ca3af;
  gap: 8px;
}

.no-data svg {
  opacity: 0.5;
  width: 32px;
  height: 32px;
}

.no-data p {
  margin: 0;
  font-size: 12px;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: block;
  overflow: visible;
  box-sizing: border-box;
}

.area-chart {
  display: block;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
}

.y-axis-label {
  font-size: 9px;
  font-weight: 300;
  fill: #6b7280;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

.x-axis-label-svg {
  font-size: 10px;
  font-weight: 300;
  fill: #6b7280;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

.hover-line {
  transition: opacity 0.15s ease;
  pointer-events: none;
}

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

.tooltip-container {
  position: fixed;
  transform: translate(-50%, calc(-100% - 12px));
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 99999;
  min-width: 150px;
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
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
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
  transition: all 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-100% - 20px));
}
</style>