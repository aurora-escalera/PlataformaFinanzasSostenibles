<template>
  <div class="donut-item-glass">
    <!-- Badge superior con título dinámico -->
    <div class="donut-badge-glass" :class="badgeColorClass">
      <svg v-if="badgeColorClass === 'green'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      <span class="badge-text">{{ displayTitle }}</span>
    </div>
    
    <!-- Filtros -->
    <div class="variable-filters-glass">
      <button 
        v-for="(sector, index) in processedSectors" 
        :key="index"
        class="filter-btn-glass"
        :class="{ active: activeSectors[index], dimmed: !activeSectors[index] && hasActiveFilters }"
        @click="toggleSector(index)"
      >
        <span class="filter-dot" :style="{ background: sector.color }"></span>
        {{ sector.shortLabel || sector.label }}
      </button>
    </div>
    
    <!-- Dona SVG -->
    <div class="donut-svg-container">
      <svg class="donut-svg" viewBox="0 0 200 200">
        <!-- Anillo de fondo - CAMBIADO a gris claro -->
        <circle cx="100" cy="100" r="72" fill="none" stroke="#e2e8f0" stroke-width="24"/>
        
        <!-- Sectores -->
        <path 
          v-for="(sector, index) in computedSectorPaths" 
          :key="index"
          class="donut-ring"
          :class="{ 
            dimmed: !activeSectors[index] || (hoveredIndex !== null && hoveredIndex !== index),
            highlighted: hoveredIndex === index 
          }"
          :d="sector.path"
          fill="none"
          :stroke="sector.color"
          stroke-width="24"
          @mouseenter="onSectorHover(index)"
          @mouseleave="onSectorLeave"
        />
        
        <!-- Porcentajes -->
        <text 
          v-for="(sector, index) in computedSectorPaths" 
          :key="'pct-' + index"
          class="sector-percent"
          :class="{ dimmed: !activeSectors[index] || (hoveredIndex !== null && hoveredIndex !== index) }"
          :x="sector.percentX"
          :y="sector.percentY"
          text-anchor="middle"
          v-show="sector.displayPercent >= 5"
        >
          {{ sector.displayPercent }}%
        </text>
      </svg>
      
      <!-- Centro con valor -->
      <div class="donut-center">
        <div class="center-value" :class="badgeColorClass">{{ displayValue }}</div>
      </div>
    </div>
    
    <!-- Stats inferiores -->
    <div class="stats-row-glass">
      <div 
        v-for="(sector, index) in processedSectors" 
        :key="index"
        class="stat-glass"
        :class="{ active: activeSectors[index], dimmed: hoveredIndex !== null && hoveredIndex !== index }"
        @click="toggleSector(index)"
      >
        <div class="stat-value">{{ formatValue(sector.value) }}</div>
        <div class="stat-label">{{ sector.shortLabel || sector.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // Props existentes para compatibilidad con ChartsComponent
  data: {
    type: Array,
    default: () => []
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
    // Cada sector viene de ChartsComponent: { key, label, value, color, colorClass }
  }
})

// Estado
const activeSectors = ref([])
const hoveredIndex = ref(null)

// Determinar color del badge basado en el título (IS, IIC, PS, PIC)
const badgeColorClass = computed(() => {
  if (props.title === 'IS' || props.title === 'PS') {
    return 'green'
  }
  return 'red'
})

// Procesar sectores con shortLabels para los filtros
const processedSectors = computed(() => {
  return props.sectors.map(sector => {
    let shortLabel = sector.label
    
    // Acortar labels largos para que quepan en los filtros
    if (sector.label === 'Movilidad Sustentable') shortLabel = 'Movilidad'
    if (sector.label === 'Protección Ambiental') shortLabel = 'Protección'
    if (sector.label === 'Desastres Naturales') shortLabel = 'Desastres'
    
    return {
      ...sector,
      shortLabel
    }
  })
})

// Inicializar sectores activos cuando cambian los props
watch(() => props.sectors, (newSectors) => {
  if (newSectors && newSectors.length > 0) {
    activeSectors.value = newSectors.map(() => true)
  }
}, { immediate: true })

// Calcular el total de todos los sectores
const totalAllSectors = computed(() => {
  return props.sectors.reduce((acc, sector) => acc + (sector.value || 0), 0)
})

// Título dinámico a mostrar en el badge
const displayTitle = computed(() => {
  // Si hay hover, mostrar el sector bajo el cursor
  if (hoveredIndex.value !== null && processedSectors.value[hoveredIndex.value]) {
    return processedSectors.value[hoveredIndex.value].label
  }
  
  // Obtener índices de sectores activos
  const activeIndices = activeSectors.value
    .map((active, i) => active ? i : -1)
    .filter(i => i !== -1)
  
  // Si todos activos o ninguno, mostrar título por defecto
  if (activeIndices.length === props.sectors.length || activeIndices.length === 0) {
    if (props.title === 'IS') return 'Sectores de Ingresos Sostenibles'
    if (props.title === 'IIC') return 'Sectores de Ingresos Int. en Carbono'
    if (props.title === 'PS') return 'Sectores de Presupuestos Sostenibles'
    if (props.title === 'PIC') return 'Sectores de Presupuestos Int. en Carbono'
    return props.title
  } 
  // Si solo uno activo, mostrar su nombre completo
  else if (activeIndices.length === 1) {
    return processedSectors.value[activeIndices[0]]?.label || ''
  } 
  // Si varios activos, mostrar nombres cortos unidos por +
  else {
    return activeIndices.map(i => processedSectors.value[i]?.shortLabel || processedSectors.value[i]?.label).join(' + ')
  }
})

// Valor dinámico a mostrar (suma de sectores activos)
const displayValue = computed(() => {
  // Si hay hover, mostrar el valor del sector
  if (hoveredIndex.value !== null && processedSectors.value[hoveredIndex.value]) {
    return formatValue(processedSectors.value[hoveredIndex.value].value)
  }
  
  // Sumar valores de sectores activos
  const sum = activeSectors.value.reduce((acc, active, i) => {
    return active && props.sectors[i] ? acc + props.sectors[i].value : acc
  }, 0)
  
  return formatValue(sum)
})

// Computed: hay filtros activos (no todos seleccionados)
const hasActiveFilters = computed(() => {
  const activeCount = activeSectors.value.filter(Boolean).length
  return activeCount > 0 && activeCount < props.sectors.length
})

// Calcular paths SVG de los sectores con sus posiciones de porcentaje
const computedSectorPaths = computed(() => {
  if (!props.sectors || props.sectors.length === 0) return []
  
  const cx = 100
  const cy = 100
  const r = 72
  
  const total = totalAllSectors.value
  
  let currentAngle = -90 // Empezar desde arriba (12 en punto)
  
  return props.sectors.map((sector, index) => {
    const percent = total > 0 ? (sector.value / total) * 100 : 0
    const angleSpan = (percent / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angleSpan
    
    // Calcular puntos del arco
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    
    const largeArc = angleSpan > 180 ? 1 : 0
    
    // Punto medio para el porcentaje (centrado en el arco)
    const midAngle = startAngle + angleSpan / 2
    const midRad = (midAngle * Math.PI) / 180
    const percentX = cx + r * Math.cos(midRad)
    const percentY = cy + r * Math.sin(midRad) + 4
    
    currentAngle = endAngle
    
    return {
      ...sector,
      path: angleSpan > 0 ? `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}` : '',
      percentX,
      percentY,
      displayPercent: Math.round(percent * 10) / 10
    }
  })
})

// Métodos
function toggleSector(index) {
  activeSectors.value[index] = !activeSectors.value[index]
  
  // Si todos están desactivados, reactivar todos
  if (!activeSectors.value.some(Boolean)) {
    activeSectors.value = activeSectors.value.map(() => true)
  }
}

function onSectorHover(index) {
  if (activeSectors.value[index]) {
    hoveredIndex.value = index
  }
}

function onSectorLeave() {
  hoveredIndex.value = null
}

function formatValue(value) {
  if (!value || value === 0) return '$0'
  
  // Los valores vienen en pesos, convertir a millones
  const millions = value / 1000000
  
  if (millions >= 1000) {
    return '$' + (millions / 1000).toFixed(1) + 'B'
  } else if (millions >= 1) {
    return '$' + Math.round(millions) + 'M'
  } else if (millions >= 0.1) {
    return '$' + millions.toFixed(1) + 'M'
  } else {
    const thousands = value / 1000
    return '$' + Math.round(thousands) + 'K'
  }
}
</script>

<style scoped>
.donut-item-glass {
  flex: 1;
  border-radius: 16px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
  background-color: transparent;
}

/* ✅ Badge superior - Adaptado para fondo blanco */
.donut-badge-glass {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  max-width: 100%;
}

.donut-badge-glass .badge-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

/* ✅ Badge verde - fondo verde claro, texto verde oscuro */
.donut-badge-glass.green {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}

/* ✅ Badge rojo - fondo rojo claro, texto rojo oscuro */
.donut-badge-glass.red {
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.donut-badge-glass svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ✅ Filtros - Adaptados para fondo blanco */
.variable-filters-glass {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  padding: 5px;
  background: #f1f5f9;
  border-radius: 20px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
}

.filter-btn-glass {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn-glass:hover {
  background: #e2e8f0;
  color: #1e3a5f;
}

/* ✅ Botón activo - fondo azul oscuro, texto blanco */
.filter-btn-glass.active {
  background: #1e3a5f;
  color: white;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.3);
}

.filter-btn-glass.dimmed {
  opacity: 0.3;
}

.filter-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* SVG Donut */
.donut-svg-container {
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.donut-ring {
  transition: all 0.3s ease;
  cursor: pointer;
}

.donut-ring:hover {
  filter: brightness(1.1);
}

.donut-ring.dimmed {
  opacity: 0.2;
}

.donut-ring.highlighted {
  filter: brightness(1.15);
  stroke-width: 28;
}

/* ✅ Porcentajes dentro del anillo - azul oscuro */
.sector-percent {
  font-size: 9px;
  font-weight: 600;
  fill: #1e3a5f;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.sector-percent.dimmed {
  opacity: 0.2;
}

/* Centro - solo valor */
.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

/* ✅ Valor central - colores adaptados */
.center-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e3a5f;
  transition: all 0.3s ease;
}

.center-value.green {
  color: #166534;
}

.center-value.red {
  color: #dc2626;
}

/* ✅ Stats inferiores - Adaptados para fondo blanco */
.stats-row-glass {
  display: flex;
  gap: 6px;
  width: 100%;
}

.stat-glass {
  flex: 1;
  background: #f8fafc;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 0;
}

.stat-glass:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-glass.dimmed {
  opacity: 0.3;
}

.stat-glass.active {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

/* ✅ Valor en stats - azul oscuro */
.stat-value {
  font-size: 12px;
  font-weight: 700;
  color: #1e3a5f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✅ Label en stats - gris */
.stat-label {
  font-size: 8px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 3px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive */
@media (max-width: 768px) {
  .donut-svg-container {
    width: 140px;
    height: 140px;
  }
  
  .filter-btn-glass {
    padding: 5px 8px;
    font-size: 9px;
  }
  
  .center-value {
    font-size: 16px;
  }
  
  .stat-value {
    font-size: 11px;
  }
}
</style>