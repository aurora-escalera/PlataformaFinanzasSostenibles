<template>
  <div class="donut-item-vertical">
    <!-- Barra de distribución horizontal superior -->
    <div class="distribution-bar-section">
      <div class="distribution-header">
        <span class="distribution-label">Distribución</span>
        <span class="distribution-value" :class="badgeColorClass">{{ displayValue }}</span>
      </div>
      <div class="distribution-bar">
        <div 
          v-for="(sector, index) in computedSectorPaths" 
          :key="'bar-' + index"
          class="distribution-segment"
          :class="{ 
            dimmed: !activeSectors[index],
            highlighted: hoveredIndex === index 
          }"
          :style="{ 
            width: sector.displayPercent + '%', 
            background: sector.color 
          }"
          @mouseenter="onSectorHover(index)"
          @mouseleave="onSectorLeave"
          @click="toggleSector(index)"
        />
      </div>
      <!-- ✅ Leyenda de moneda dinámica -->
      <div class="currency-legend">{{ currencyLegend }}</div>
    </div>
    
    <!-- Área principal - Dona + Badge -->
    <div class="donut-main-area">
      <!-- Dona SVG -->
      <div class="donut-svg-container">
        <svg class="donut-svg" viewBox="0 0 200 200">
          <!-- Anillo de fondo -->
          <circle cx="100" cy="100" r="72" fill="none" stroke="#e2e8f0" stroke-width="25"/>
          
          <!-- Sectores -->
          <template v-for="(sector, index) in computedSectorPaths" :key="index">
            <!-- Caso especial: sector es 100% - usar círculo completo -->
            <circle
              v-if="sector.isFullCircle"
              class="donut-ring"
              :class="{ 
                dimmed: !activeSectors[index] || (hoveredIndex !== null && hoveredIndex !== index),
                highlighted: hoveredIndex === index 
              }"
              cx="100"
              cy="100"
              r="72"
              fill="none"
              :stroke="sector.color"
              stroke-width="25"
              @mouseenter="onSectorHover(index)"
              @mouseleave="onSectorLeave"
              @click="toggleSector(index)"
            />
            <!-- Caso normal: usar path de arco -->
            <path 
              v-else
              class="donut-ring"
              :class="{ 
                dimmed: !activeSectors[index] || (hoveredIndex !== null && hoveredIndex !== index),
                highlighted: hoveredIndex === index 
              }"
              :d="sector.path"
              fill="none"
              :stroke="sector.color"
              stroke-width="25"
              @mouseenter="onSectorHover(index)"
              @mouseleave="onSectorLeave"
              @click="toggleSector(index)"
            />
          </template>
          
          <!-- Porcentajes en el anillo -->
          <text 
            v-for="(sector, index) in computedSectorPaths" 
            :key="'pct-' + index"
            class="sector-percent"
            :class="{ dimmed: !activeSectors[index] || (hoveredIndex !== null && hoveredIndex !== index) }"
            :x="sector.percentX"
            :y="sector.percentY"
            text-anchor="middle"
            dominant-baseline="middle"
            :transform="`rotate(${sector.textRotation}, ${sector.percentX}, ${sector.percentY})`"
            v-show="parseFloat(sector.displayPercent) >= 5"
          >
            {{ sector.displayPercent }} %
          </text>
        </svg>
        
        <!-- Centro con valor -->
        <div class="donut-center">
          <div class="center-value" :class="badgeColorClass">{{ displayValue }}</div>
        </div>
      </div>
      
      <!-- Badge indicador -->
      <div class="badge-indicator" :class="badgeColorClass">
        <div class="badge-icon-circle" :class="badgeColorClass">
          <svg v-if="badgeColorClass === 'green'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="badge-text">{{ badgeTitle }}</span>
      </div>
    </div>
    
    <!-- Lista de datos inferior -->
    <div class="data-list-section">
      <div 
        v-for="(sector, index) in processedSectors" 
        :key="index"
        class="data-list-item"
        :class="{ 
          active: activeSectors[index], 
          dimmed: !activeSectors[index],
          highlighted: hoveredIndex === index 
        }"
        @click="toggleSector(index)"
        @mouseenter="onSectorHover(index)"
        @mouseleave="onSectorLeave"
      >
        <div class="data-item-left">
          <span 
            class="data-color-dot" 
            :style="{ background: sector.color, boxShadow: '0 2px 6px ' + sector.color + '40' }"
          />
          <span class="data-item-label">{{ sector.shortLabel || sector.label }}</span>
        </div>
        <div class="data-item-right">
          <span class="data-item-value">{{ formatValue(sector.value) }}</span>
          <span class="data-item-percent" :style="{ background: sector.color }">
            {{ getPercentForSector(index) }} %
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
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
  },
  currency: {
    type: String,
    default: 'MXN' // 'USD' para Regional, 'MXN' para Estados
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

// Título del badge
const badgeTitle = computed(() => {
  if (props.title === 'IS') return 'Ingresos\nSostenibles'
  if (props.title === 'IIC') return 'Ingresos\nInt. Carbono'
  if (props.title === 'PS') return 'Presupuestos\nSostenibles'
  if (props.title === 'PIC') return 'Presupuestos\nInt. Carbono'
  return props.title
})

// Procesar sectores con shortLabels para los filtros
const processedSectors = computed(() => {
  return props.sectors.map(sector => {
    let shortLabel = sector.label
    
    if (sector.label === 'Movilidad Sustentable') shortLabel = 'Movilidad Sustentable'
    if (sector.label === 'Protección Ambiental') shortLabel = 'Protección Ambiental'
    if (sector.label === 'Desastres Naturales') shortLabel = 'Desastres Naturales'
    
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

// ✅ Leyenda de moneda dinámica
const currencyLegend = computed(() => {
  if (props.currency === 'USD') {
    return '* Cifras en dólares estadounidenses (USD)'
  }
  return '* Cifras en pesos mexicanos (MXN)'
})

// Obtener porcentaje para un sector específico
function getPercentForSector(index) {
  if (!props.sectors[index] || totalAllSectors.value === 0) return '0.00'
  const percent = (props.sectors[index].value / totalAllSectors.value) * 100
  return percent.toFixed(2)
}

// Título dinámico a mostrar en el indicador
const displayTitle = computed(() => {
  if (hoveredIndex.value !== null && processedSectors.value[hoveredIndex.value]) {
    return processedSectors.value[hoveredIndex.value].label
  }
  
  const activeIndices = activeSectors.value
    .map((active, i) => active ? i : -1)
    .filter(i => i !== -1)
  
  if (activeIndices.length === props.sectors.length || activeIndices.length === 0) {
    if (props.title === 'IS') return 'Ingresos Sostenibles'
    if (props.title === 'IIC') return 'Ingresos Int. Carbono'
    if (props.title === 'PS') return 'Presupuestos Sostenibles'
    if (props.title === 'PIC') return 'Presupuestos Int. Carbono'
    return props.title
  } 
  else if (activeIndices.length === 1) {
    return processedSectors.value[activeIndices[0]]?.label || ''
  } 
  else {
    return activeIndices.map(i => processedSectors.value[i]?.shortLabel || processedSectors.value[i]?.label).join(' + ')
  }
})

// Valor dinámico a mostrar (suma de sectores activos)
const displayValue = computed(() => {
  if (hoveredIndex.value !== null && processedSectors.value[hoveredIndex.value]) {
    return formatValue(processedSectors.value[hoveredIndex.value].value)
  }
  
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

// ✅ CORREGIDO: Calcular paths SVG de los sectores con manejo especial para 100%
const computedSectorPaths = computed(() => {
  if (!props.sectors || props.sectors.length === 0) return []
  
  const cx = 100
  const cy = 100
  const r = 72
  
  const total = totalAllSectors.value
  
  let currentAngle = -90
  
  return props.sectors.map((sector, index) => {
    const percent = total > 0 ? (sector.value / total) * 100 : 0
    const angleSpan = (percent / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angleSpan
    
    // ✅ NUEVO: Detectar si es un círculo completo (100% o muy cercano)
    const isFullCircle = angleSpan >= 359.9
    
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    
    const largeArc = angleSpan > 180 ? 1 : 0
    
    // Calcular posición del porcentaje (en el medio del arco)
    const midAngle = startAngle + angleSpan / 2
    const midRad = (midAngle * Math.PI) / 180
    const percentX = cx + r * Math.cos(midRad)
    const percentY = cy + r * Math.sin(midRad)
    
    // Para 100%, posicionar el texto arriba del centro
    const textRotation = isFullCircle ? 0 : midAngle + 90
    const finalPercentX = isFullCircle ? cx : percentX
    const finalPercentY = isFullCircle ? cy - r : percentY
    
    currentAngle = endAngle
    
    // ✅ NUEVO: Para círculo completo, no necesitamos path (usaremos <circle>)
    let path = ''
    if (!isFullCircle && angleSpan > 0) {
      path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
    }
    
    return {
      ...sector,
      path,
      isFullCircle, // ✅ NUEVO: Flag para renderizar círculo en lugar de path
      percentX: finalPercentX,
      percentY: finalPercentY,
      textRotation,
      displayPercent: percent.toFixed(2)
    }
  })
})

// Métodos
function toggleSector(index) {
  activeSectors.value[index] = !activeSectors.value[index]
  
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
  if (!value || value === 0) return '$0.00'
  
  const millions = value / 1000000
  
  if (millions >= 1000) {
    // Billones (miles de millones)
    return '$' + (millions / 1000).toFixed(2) + ' B'
  } else if (millions >= 1) {
    // Millones
    return '$' + millions.toFixed(2) + ' M'
  } else if (millions >= 0.01) {
    // Millones pequeños
    return '$' + millions.toFixed(2) + ' M'
  } else {
    // Miles
    const thousands = value / 1000
    return '$' + thousands.toFixed(2) + ' K'
  }
}
</script>

<style scoped>
/* ============================================
   Container principal - Vertical Stack
   TAMAÑOS AUMENTADOS para mayor altura
   ============================================ */
.donut-item-vertical {
  flex: 1;
  border-radius: 0 0 12px 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background-color: white;
  gap: 12px;
}

/* ============================================
   Barra de distribución horizontal superior
   ============================================ */
.distribution-bar-section {
  flex-shrink: 0;
}

.distribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.distribution-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.distribution-value {
  font-size: 15px;
  font-weight: 700;
}

.distribution-value.green {
  color: #166534;
}

.distribution-value.red {
  color: #dc2626;
}

.distribution-bar {
  display: flex;
  height: 14px;
  border-radius: 7px;
  overflow: hidden;
  background: #e2e8f0;
}

.distribution-segment {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.distribution-segment:hover {
  filter: brightness(1.1);
}

.distribution-segment.dimmed {
  opacity: 0.2;
}

.distribution-segment.highlighted {
  filter: brightness(1.15);
}

/* ✅ Leyenda de moneda */
.currency-legend {
  font-size: 12px;
  font-style: italic;
  color: #94a3b8;
  margin-top: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================
   Área principal - Dona + Badge
   ============================================ */
.donut-main-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-height: 180px;
  padding: 10px 0;
}

/* Dona SVG - TAMAÑO AUMENTADO */
.donut-svg-container {
  position: relative;
  width: 170px;
  height: 170px;
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

/* Porcentajes dentro del anillo */
.sector-percent {
  font-size: 11px;
  font-weight: 600;
  fill: white;
  stroke: #1e3a5f;
  stroke-width: 2px;
  paint-order: stroke fill;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.sector-percent.dimmed {
  opacity: 0.2;
}

/* Centro con valor - TAMAÑO AUMENTADO */
.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.center-value {
  font-size: 16px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.center-value.green {
  color: #166534;
}

.center-value.red {
  color: #dc2626;
}

/* ============================================
   Badge indicador - TAMAÑO AUMENTADO
   ============================================ */
.badge-indicator {
  padding: 16px 14px;
  border-radius: 14px;
  text-align: center;
  flex-shrink: 0;
  min-width: 80px;
}

.badge-indicator.green {
  background: #f0fdf4;
  border: 2px solid #86efac;
}

.badge-indicator.red {
  background: #fef2f2;
  border: 2px solid #fca5a5;
}

.badge-icon-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.badge-icon-circle.green {
  background: linear-gradient(135deg, #166534 0%, #15803d 100%);
  color: white;
}

.badge-icon-circle.red {
  background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%);
  color: white;
}

.badge-icon-circle svg {
  width: 20px;
  height: 20px;
}

.badge-text {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.3;
  white-space: pre-line;
}

.badge-indicator.green .badge-text {
  color: #166534;
}

.badge-indicator.red .badge-text {
  color: #dc2626;
}

/* ============================================
   Lista de datos inferior - TAMAÑO AUMENTADO
   ============================================ */
.data-list-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.data-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.data-list-item:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
}

.data-list-item:hover,
.data-list-item.highlighted {
  background: white;
}

.data-list-item.dimmed {
  opacity: 0.35;
}

.data-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.data-color-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.data-item-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.data-item-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.data-item-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e3a5f;
}

.data-item-percent {
  font-size: 11px;
  font-weight: 500;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  min-width: 65px;
  text-align: center;
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 768px) {
  .donut-svg-container {
    width: 140px;
    height: 140px;
  }
  
  .donut-main-area {
    gap: 16px;
  }
  
  .badge-indicator {
    padding: 12px 10px;
  }
  
  .badge-icon-circle {
    width: 32px;
    height: 32px;
  }
  
  .badge-icon-circle svg {
    width: 16px;
    height: 16px;
  }
  
  .badge-text {
    font-size: 7px;
  }
  
  .center-value {
    font-size: 18px;
  }
  
  .data-item-label {
    font-size: 11px;
  }
  
  .data-item-value {
    font-size: 12px;
  }
  
  .data-item-percent {
    font-size: 10px;
    padding: 3px 8px;
    min-width: 58px;
  }
}
</style>