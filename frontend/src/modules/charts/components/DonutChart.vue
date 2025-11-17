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
        
        <!-- ✅ FIX: Separar v-if en elemento contenedor -->
        <g v-if="shouldShowProgress">
          <!-- ✅ FIX: v-for en elemento hijo separado -->
          <template v-if="allSectorsWithState.length > 0">
            <path
              v-for="(sector, index) in allSectorsWithState"
              :key="`sector-${sector.key}-${index}`"
              :d="getSectorPath(sector, index)"
              fill="none"
              :stroke="getSectorColor(sector)"
              :stroke-width="strokeWidth"
              :class="['sector-path', { 'sector-inactive': !sector.isActive }]"
              @mouseenter="(e) => handleSectorHover(sector, e)"
              @mousemove="updateTooltipPosition"
              @mouseleave="handleSectorLeave"
            />
          </template>
        </g>

        <!-- Labels de porcentaje en cada segmento -->
        <g v-if="shouldShowProgress">
          <template v-if="allSectorsWithState.length > 0">
            <text
              v-for="(sector, index) in allSectorsWithState"
              :key="`label-${sector.key}-${index}`"
              :x="getSectorLabelPosition(sector, index).x"
              :y="getSectorLabelPosition(sector, index).y"
              text-anchor="middle"
              :class="['sector-label', { 'sector-label-inactive': !sector.isActive }]"
              pointer-events="none"
            >
              {{ getSectorPercentage(sector) }}
            </text>
          </template>
        </g>
        
        <!-- Texto central con el porcentaje -->
        <text
          :x="center"
          :y="center + 4"
          text-anchor="middle"
          class="percentage-text"
        >
         
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
import { ref, computed, watch } from 'vue'

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
    default: 220
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

// ✅ Estado de toggle del usuario
const userToggles = ref({})

// Estado del tooltip
const hoveredSector = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// ✅ Key para forzar re-render del SVG cuando cambien los sectores
const sectorsKey = computed(() => {
  if (!props.sectors || props.sectors.length === 0) return 'empty'
  return props.sectors.map(s => `${s.key}-${s.value || 0}`).join('_')
})

// ✅ OPTIMIZADO: Variables internas como computed
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

// ✅ SIMPLIFICADO: Calcular sectores con estado activo/inactivo
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

// Función para formatear moneda
const formatCurrency = (value) => {
  if (value === null || value === undefined) return ''
  
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

// Manejar hover en segmento de la gráfica
const handleSectorHover = (sector, event) => {
  hoveredSector.value = sector
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
const strokeWidth = computed(() => 28)
const radius = computed(() => (props.size / 2) - (strokeWidth.value / 2))

// Obtener color del sector
const getSectorColor = (sector) => {
  if (!sector.hasData) {
    return '#E8E8E8'
  }
  return sector.isActive ? sector.color : '#D0D0D0'
}

// ✅ FIX: Función para calcular el path SVG de cada sector con manejo especial para 360°
const getSectorPath = (sector, index) => {
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
  
  // ✅ FIX: Caso especial para sectores que ocupan 100% (360°)
  // Un arco SVG no puede ser exactamente 360°, así que lo dibujamos como dos semicírculos
  if (sectorAngle >= 359.99) {
    const topY = cy - r
    const bottomY = cy + r
    // Dibujar como dos arcos de 180° que forman un círculo completo
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

// Función para calcular el porcentaje de un sector
const getSectorPercentage = (sector) => {
  if (totalAllSectorsValue.value === 0) return ''
  const percentage = (sector.value / totalAllSectorsValue.value) * 100
  
  if (percentage < 5) return ''
  
  return `${percentage.toFixed(2)}%`
}

// Función para calcular la posición del label
const getSectorLabelPosition = (sector, index) => {
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
  
  const labelRadius = r
  
  return {
    x: cx + labelRadius * Math.cos(midRad),
    y: cy + labelRadius * Math.sin(midRad) + 4
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

// ✅ Watch optimizado para detectar cambios en sectores
watch(() => props.sectors, (newSectors) => {
  if (newSectors && newSectors.length > 0) {
    newSectors.forEach(sector => {
      const hasData = sector.value > 0
      if (!hasData && userToggles.value[sector.key] === true) {
        delete userToggles.value[sector.key]
      }
    })
  }
}, { deep: true })
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
  transition: stroke-width 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
}

.sector-path:hover {
  stroke-width: 32;
}

.sector-path.sector-inactive {
  opacity: 0.5;
  cursor: default;
}

.sector-path.sector-inactive:hover {
  stroke-width: 28;
}

.percentage-text {
  font-size: 14px;
  font-weight: bold;
  fill: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
}

.sector-label {
  font-size: 11px;
  font-weight: 700;
  fill: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.sector-label-inactive {
  fill: #666;
  opacity: 0.6;
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