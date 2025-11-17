<!-- src/modules/charts/components/DonutChart.vue -->
<template>
  <div class="donut-chart">
    <!-- Filtros/Toggles para mostrar/ocultar segmentos -->
    <div class="variable-filters" v-if="variables && variables.length > 0">
      <button 
        v-for="variable in variables" 
        :key="variable.key"
        @click="toggleVariable(variable.key)"
        :disabled="isVariableDisabled(variable.key)"
        :class="['filter-btn', { 
          'active': isVariableActive(variable.key),
          'disabled': isVariableDisabled(variable.key),
          [variable.colorClass]: true 
        }]"
      >
        <span :class="['legend-dot', variable.colorClass]"></span>
        {{ variable.label }}
      </button>
    </div>

    <!-- SVG de la gráfica de dona -->
    <div class="chart-svg-container">
      <svg 
        :key="sectorsKey"
        :width="size" 
        :height="size" 
        class="donut-svg"
      >
        <!-- Círculo de fondo (gris) -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="backgroundColor"
          :stroke-width="strokeWidth"
        />
        
        <!-- Segmentos de la dona con animación -->
        <g v-if="shouldShowProgress">
          <template v-if="allSectorsWithState.length > 0">
            <path
              v-for="(sector, index) in allSectorsWithState"
              :key="`sector-${sector.key}-${index}`"
              :d="getSectorPath(sector, index, animatedProgress)"
              fill="none"
              :stroke="getSectorColor(sector)"
              :stroke-width="hoveredSectorIndex === index ? strokeWidth + 5 : strokeWidth"
              :class="['sector-path', { 
                'sector-inactive': !sector.isActive,
                'sector-hovered': hoveredSectorIndex === index
              }]"
              @mouseenter="handleSectorHover(sector, index, $event)"
              @mousemove="updateTooltipPosition"
              @mouseleave="handleSectorLeave"
            />
            <!-- ✅ Bordes blancos entre sectores -->
            <line
              v-if="index < allSectorsWithState.length - 1"
              :key="`divider-${sector.key}-${index}`"
              :x1="getSectorDividerStart(sector, index, animatedProgress).x"
              :y1="getSectorDividerStart(sector, index, animatedProgress).y"
              :x2="getSectorDividerEnd(sector, index, animatedProgress).x"
              :y2="getSectorDividerEnd(sector, index, animatedProgress).y"
              stroke="white"
              stroke-width="2"
              pointer-events="none"
            />
          </template>
        </g>

        <!-- ✅ Porcentajes DENTRO del anillo (pequeños y delgados) -->
        <g v-if="shouldShowProgress && animatedProgress >= 0.9">
          <template v-if="allSectorsWithState.length > 0">
            <text
              v-for="(sector, index) in allSectorsWithState"
              :key="`percent-${sector.key}-${index}`"
              :x="getSectorLabelPosition(sector, index, 'inner').x"
              :y="getSectorLabelPosition(sector, index, 'inner').y"
              text-anchor="middle"
              :class="['sector-percent', { 'sector-percent-inactive': !sector.isActive }]"
              pointer-events="none"
            >
              {{ getSectorPercentage(sector) }}
            </text>
          </template>
        </g>

        <!-- ✅ Nombres FUERA del donut -->
        <g v-if="shouldShowProgress && animatedProgress >= 0.9">
          <template v-if="allSectorsWithState.length > 0">
            <text
              v-for="(sector, index) in allSectorsWithState"
              :key="`name-${sector.key}-${index}`"
              :x="getSectorLabelPosition(sector, index, 'outer').x"
              :y="getSectorLabelPosition(sector, index, 'outer').y"
              text-anchor="middle"
              :class="['sector-name', { 'sector-name-inactive': !sector.isActive }]"
              pointer-events="none"
            >
              {{ sector.label }}
            </text>
          </template>
        </g>
        
        <!-- ✅ NUEVO: Título de la variable arriba del total -->
        <text
          :x="center"
          :y="center - 15"
          text-anchor="middle"
          class="variable-title-text"
        >
          {{ title }}
        </text>
        
        <!-- ✅ Suma total en el centro (no porcentaje) -->
        <text
          :x="center"
          :y="center + 12"
          text-anchor="middle"
          class="total-value-text"
        >
          {{ formatTotalValue(totalAllSectorsValue) }}
        </text>
      </svg>
    </div>

    <!-- Tooltip para mostrar valores en $ -->
    <Teleport to="body">
      <div 
        v-if="hoveredSector"
        class="donut-tooltip"
        :style="{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`
        }"
      >
        <div class="tooltip-content">
          <span class="tooltip-label">{{ hoveredSector.label }}</span>
          <span class="tooltip-value">{{ formatCurrency(hoveredSector.value) }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 280
  },
  variables: {
    type: Array,
    default: () => []
  },
  sectors: {
    type: Array,
    default: () => []
  }
})

// Estado de toggle del usuario
const userToggles = ref({})

// Estado del tooltip
const hoveredSector = ref(null)
const hoveredSectorIndex = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// ✅ NUEVO: Estado de animación
const animatedProgress = ref(0)
const isAnimating = ref(false)

// Key para forzar re-render del SVG cuando cambien los sectores
const sectorsKey = computed(() => {
  if (!props.sectors || props.sectors.length === 0) return 'empty'
  return props.sectors.map(s => `${s.key}-${s.value || 0}`).join('_')
})

// Variables internas como computed
const internalVariables = computed(() => {
  if (!props.variables || props.variables.length === 0) {
    return []
  }
  
  return props.variables.map(v => {
    const sector = props.sectors?.find(s => s.key === v.key)
    const hasData = sector && 
                    sector.value !== null && 
                    sector.value !== undefined && 
                    !isNaN(sector.value) &&
                    sector.value > 0
    
    const userToggle = userToggles.value[v.key]
    const shouldBeActive = hasData && (userToggle !== undefined ? userToggle : true)
    
    return {
      ...v,
      active: shouldBeActive,
      disabled: !hasData
    }
  })
})

// Calcular sectores con estado activo/inactivo
const allSectorsWithState = computed(() => {
  if (!props.sectors || props.sectors.length === 0) {
    return []
  }
  
  return props.sectors.map(sector => {
    const hasData = sector.value !== null && 
                    sector.value !== undefined && 
                    !isNaN(sector.value) &&
                    sector.value > 0
    
    const userToggle = userToggles.value[sector.key]
    const isActive = hasData && (userToggle !== undefined ? userToggle : true)
    
    return {
      ...sector,
      isActive: isActive,
      hasData: hasData
    }
  })
})

// Calcular el valor total de TODOS los sectores
const totalAllSectorsValue = computed(() => {
  return allSectorsWithState.value.reduce((sum, sector) => sum + (sector.value || 0), 0)
})

// Determinar si mostrar el progreso
const shouldShowProgress = computed(() => {
  return allSectorsWithState.value.some(s => s.hasData)
})

// ✅ NUEVO: Función para formatear el valor total en el centro
const formatTotalValue = (value) => {
  if (value === null || value === undefined || value === 0) return '$0'
  
  if (Math.abs(value) >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`
  } else if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

// Función para formatear moneda
const formatCurrency = (value) => {
  if (value === null || value === undefined) return ''
  
  if (Math.abs(value) >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`
  } else if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

// ✅ MODIFICADO: Manejar hover con índice
const handleSectorHover = (sector, index, event) => {
  hoveredSector.value = sector
  hoveredSectorIndex.value = index
  updateTooltipPosition(event)
}

// Actualizar posición del tooltip
const updateTooltipPosition = (event) => {
  tooltipPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
}

// Limpiar hover
const handleSectorLeave = () => {
  hoveredSector.value = null
  hoveredSectorIndex.value = null
}

// Configuración de colores
const primaryColor = computed(() => {
  if (props.data.length > 0 && props.data[0].color) {
    return props.data[0].color
  }
  return '#009d14'
})

const backgroundColor = computed(() => {
  if (props.data.length > 1 && props.data[1].color) {
    return props.data[1].color
  }
  return '#E8E8E8'
})

// Calculados para el SVG
const center = computed(() => props.size / 2)
const strokeWidth = computed(() => 35)
const radius = computed(() => (props.size / 2) - (strokeWidth.value / 2))

// Obtener color del sector
const getSectorColor = (sector) => {
  if (!sector.hasData) {
    return '#E8E8E8'
  }
  return sector.isActive ? sector.color : '#D0D0D0'
}

// ✅ MODIFICADO: getSectorPath ahora acepta animatedProgress
const getSectorPath = (sector, index, progress = 1) => {
  const r = radius.value
  const cx = center.value
  const cy = center.value
  
  let startAngle = -90
  
  // Calcular ángulo inicial basado en sectores anteriores
  for (let i = 0; i < index; i++) {
    const prevSector = allSectorsWithState.value[i]
    const prevPercentage = totalAllSectorsValue.value > 0 
      ? (prevSector.value / totalAllSectorsValue.value) 
      : 0
    startAngle += prevPercentage * 360 * progress
  }
  
  const sectorPercentage = totalAllSectorsValue.value > 0 
    ? (sector.value / totalAllSectorsValue.value) 
    : 0
  const sectorAngle = sectorPercentage * 360 * progress
  
  // Caso especial para sectores de 360°
  if (sectorAngle >= 359.99) {
    const topY = cy - r
    const bottomY = cy + r
    return `M ${cx} ${topY} A ${r} ${r} 0 0 1 ${cx} ${bottomY} A ${r} ${r} 0 0 1 ${cx} ${topY}`
  }
  
  const endAngle = startAngle + sectorAngle
  
  const startRad = (startAngle * Math.PI) / 180
  const endRad = (endAngle * Math.PI) / 180
  
  const x1 = cx + r * Math.cos(startRad)
  const y1 = cy + r * Math.sin(startRad)
  const x2 = cx + r * Math.cos(endRad)
  const y2 = cy + r * Math.sin(endRad)
  
  const largeArcFlag = sectorAngle > 180 ? 1 : 0
  
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`
}

// ✅ NUEVO: Función para obtener el punto de inicio del divisor
const getSectorDividerStart = (sector, index, progress = 1) => {
  const r = radius.value
  const cx = center.value
  const cy = center.value
  const outerRadius = r + (strokeWidth.value / 2)
  const innerRadius = r - (strokeWidth.value / 2)
  
  let angle = -90
  
  for (let i = 0; i <= index; i++) {
    const currentSector = allSectorsWithState.value[i]
    const percentage = totalAllSectorsValue.value > 0 
      ? (currentSector.value / totalAllSectorsValue.value) 
      : 0
    angle += percentage * 360 * progress
  }
  
  const rad = (angle * Math.PI) / 180
  
  return {
    x: cx + innerRadius * Math.cos(rad),
    y: cy + innerRadius * Math.sin(rad)
  }
}

// ✅ NUEVO: Función para obtener el punto final del divisor
const getSectorDividerEnd = (sector, index, progress = 1) => {
  const r = radius.value
  const cx = center.value
  const cy = center.value
  const outerRadius = r + (strokeWidth.value / 2)
  
  let angle = -90
  
  for (let i = 0; i <= index; i++) {
    const currentSector = allSectorsWithState.value[i]
    const percentage = totalAllSectorsValue.value > 0 
      ? (currentSector.value / totalAllSectorsValue.value) 
      : 0
    angle += percentage * 360 * progress
  }
  
  const rad = (angle * Math.PI) / 180
  
  return {
    x: cx + outerRadius * Math.cos(rad),
    y: cy + outerRadius * Math.sin(rad)
  }
}

// Función para calcular el porcentaje de un sector
const getSectorPercentage = (sector) => {
  if (totalAllSectorsValue.value === 0) return ''
  const percentage = (sector.value / totalAllSectorsValue.value) * 100
  
  if (percentage < 3) return '' // Ocultar si es muy pequeño
  
  return `${percentage.toFixed(1)}%`
}

// ✅ MODIFICADO: Función para calcular la posición del label (inner o outer)
const getSectorLabelPosition = (sector, index, type = 'inner') => {
  const r = radius.value
  const cx = center.value
  const cy = center.value
  
  let startAngle = -90
  
  for (let i = 0; i < index; i++) {
    const prevSector = allSectorsWithState.value[i]
    const prevPercentage = totalAllSectorsValue.value > 0 
      ? (prevSector.value / totalAllSectorsValue.value) 
      : 0
    startAngle += prevPercentage * 360
  }
  
  const sectorPercentage = totalAllSectorsValue.value > 0 
    ? (sector.value / totalAllSectorsValue.value) 
    : 0
  const sectorAngle = sectorPercentage * 360
  
  const midAngle = startAngle + (sectorAngle / 2)
  const midRad = (midAngle * Math.PI) / 180
  
  // ✅ Determinar radio según tipo
  const labelRadius = type === 'inner' 
    ? r  // Dentro del anillo
    : r + strokeWidth.value + 25  // Fuera del donut
  
  return {
    x: cx + labelRadius * Math.cos(midRad),
    y: cy + labelRadius * Math.sin(midRad) + (type === 'inner' ? 4 : 5)
  }
}

// Métodos
const toggleVariable = (key) => {
  const variable = internalVariables.value.find(v => v.key === key)
  if (variable && !variable.disabled) {
    const currentState = userToggles.value[key] !== undefined ? userToggles.value[key] : true
    userToggles.value[key] = !currentState
  }
}

const isVariableActive = (key) => {
  return internalVariables.value.find(v => v.key === key)?.active || false
}

const isVariableDisabled = (key) => {
  return internalVariables.value.find(v => v.key === key)?.disabled || false
}

// ✅ NUEVO: Función de animación
const animateDonut = () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  animatedProgress.value = 0
  
  const duration = 1500 // 1.5 segundos
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing: ease-out cubic
    animatedProgress.value = 1 - Math.pow(1 - progress, 3)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating.value = false
    }
  }
  
  requestAnimationFrame(animate)
}

// Watch optimizado para detectar cambios en sectores
watch(() => props.sectors, (newSectors) => {
  if (newSectors && newSectors.length > 0) {
    newSectors.forEach(sector => {
      const hasData = sector.value > 0
      if (!hasData && userToggles.value[sector.key] === true) {
        delete userToggles.value[sector.key]
      }
    })
    
    // ✅ Animar cuando cambien los datos
    animateDonut()
  }
}, { deep: true })

// ✅ NUEVO: Animar al montar el componente
onMounted(() => {
  if (shouldShowProgress.value) {
    setTimeout(() => {
      animateDonut()
    }, 100)
  }
})
</script>

<style scoped>
.donut-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 100%;
}

.variable-filters {
  display: flex;
  flex-direction: row;
  min-height: 35px;
  padding: 6px;
  border-radius: 20px;
  flex-wrap: wrap;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
  gap: 2px;
  background: #f5f5f5;
  flex-shrink: 0;
  width: 100%;
  margin-bottom: 5px;
}

.filter-btn {
  flex: 0 1 auto;
  border: none;
  padding: 1px 12px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: transparent;
  color: #666;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-btn:hover {
  background: #e5e7eb;
}

.filter-btn.active {
  background: white;
  color: #2c3e50;
}

.filter-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: transparent;
}

.filter-btn.disabled:hover {
  background: transparent;
}

.filter-btn.disabled .legend-dot {
  opacity: 0.5;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.green {
  background: #7cb342;
}

.legend-dot.light-green {
  background: #9ccc65;
}

.legend-dot.dark-green {
  background: #558b2f;
}

.legend-dot.red {
  background: #DC143C;
}

.legend-dot.light-red {
  background: #ef5350;
}

.legend-dot.dark-red {
  background: #b71c1c;
}

.legend-dot.gray {
  background: #9ca3af;
}

.chart-svg-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.donut-svg {
  overflow: visible;
}

.sector-path {
  transition: stroke-width 0.3s ease, opacity 0.2s ease;
  cursor: pointer;
}

.sector-path.sector-hovered {
  filter: brightness(1.1);
}

.sector-path.sector-inactive {
  opacity: 0.5;
  cursor: default;
}

/* ✅ Porcentajes DENTRO del anillo - pequeños y delgados */
.sector-percent {
  font-size: 10px;
  font-weight: 300;
  fill: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0.95;
}

.sector-percent-inactive {
  fill: #888;
  opacity: 0.5;
}

/* ✅ Nombres FUERA del donut */
.sector-name {
  font-size: 13px;
  font-weight: 500;
  fill: #444;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
  letter-spacing: -0.3px;
}

.sector-name-inactive {
  fill: #999;
  opacity: 0.6;
}

/* ✅ NUEVO: Título de la variable (IS, PS, PIC, IIC) */
.variable-title-text {
  font-size: 18px;
  font-weight: 300;
  fill: #666;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
  letter-spacing: 0.5px;
}

/* ✅ Valor total en el centro */
.total-value-text {
  font-size: 20px;
  font-weight: 400;
  fill: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
  letter-spacing: -0.5px;
}

@media (max-width: 768px) {
  .filter-btn {
    font-size: 9px;
    padding: 3px 8px;
    gap: 4px;
  }
  
  .legend-dot {
    width: 10px;
    height: 10px;
  }
  
  .sector-percent {
    font-size: 9px;
  }
  
  .sector-name {
    font-size: 11px;
  }
  
  .variable-title-text {
    font-size: 13px;
  }
  
  .total-value-text {
    font-size: 18px;
  }
}

.donut-tooltip {
  position: fixed;
  transform: translate(-50%, calc(-100% - 15px));
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 999999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: left 0.05s ease, top 0.05s ease;
  white-space: nowrap;
  min-width: 120px;
}

.donut-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: white;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.tooltip-value {
  font-size: 14px;
  color: #333;
  font-weight: 700;
}
</style>