<!-- src/modules/charts/components/DonutChart.vue -->
<!-- ✅ ACTUALIZADO: Botón de exportación circular en distribution-header -->
<template>
  <div class="donut-item-vertical">
    <!-- Barra de distribución horizontal superior -->
    <div class="distribution-bar-section">
      <div class="distribution-header">
        <span class="distribution-label">Distribución</span>
        <div class="distribution-header-right">
          <span class="distribution-value" :class="badgeColorClass">{{ displayValue }}</span>
          
          <!-- ✅ Botón de exportación circular -->
          <div class="export-button-wrapper" ref="exportWrapperRef">
            <button 
              class="export-btn-circle"
              :class="[badgeColorClass, { 'is-open': showExportMenu }]"
              @click.stop="toggleExportMenu"
              title="Exportar datos"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            
            <!-- Dropdown menu -->
            <transition name="dropdown-fade">
              <div v-if="showExportMenu" class="export-dropdown-mini">
                <button class="export-option" @click="handleExport('xlsx')">
                  <span class="option-icon xlsx">XLS</span>
                  <span class="option-text">Excel</span>
                </button>
                <button class="export-option" @click="handleExport('csv')">
                  <span class="option-icon csv">CSV</span>
                  <span class="option-text">CSV</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
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
      <div class="currency-legend">{{ currencyLegend }}</div>
    </div>
    
    <!-- Área principal - Dona + Badge -->
    <div class="donut-main-area">
      <div class="donut-svg-container">
        <svg class="donut-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="72" fill="none" stroke="#e2e8f0" stroke-width="25"/>
          
          <template v-for="(sector, index) in computedSectorPaths" :key="index">
            <circle
              v-if="sector.isFullCircle"
              class="donut-ring"
              :class="{ 
                dimmed: !activeSectors[index] || (hoveredIndex !== null && hoveredIndex !== index),
                highlighted: hoveredIndex === index 
              }"
              cx="100" cy="100" r="72"
              fill="none"
              :stroke="sector.color"
              stroke-width="25"
              @mouseenter="onSectorHover(index)"
              @mouseleave="onSectorLeave"
              @click="toggleSector(index)"
            />
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  size: { type: Number, default: 220 },
  variables: { type: Array, default: () => [] },
  sectors: { type: Array, default: () => [] },
  currency: { type: String, default: 'MXN' }
})

const emit = defineEmits(['export'])

const showExportMenu = ref(false)
const exportWrapperRef = ref(null)

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
}

const handleExport = (format) => {
  showExportMenu.value = false
  emit('export', { format, data: getExportData() })
}

const getExportData = () => {
  return props.sectors.map(s => ({
    'Sector': s.label,
    'Valor': s.value,
    'Porcentaje': totalAllSectors.value > 0 
      ? `${((s.value / totalAllSectors.value) * 100).toFixed(2)}%` 
      : '0%'
  }))
}

const handleClickOutside = (event) => {
  if (exportWrapperRef.value && !exportWrapperRef.value.contains(event.target)) {
    showExportMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const activeSectors = ref([])
const hoveredIndex = ref(null)

const badgeColorClass = computed(() => {
  if (props.title === 'IS' || props.title === 'PS') return 'green'
  return 'red'
})

const badgeTitle = computed(() => {
  if (props.title === 'IS') return 'Ingresos\nSostenibles'
  if (props.title === 'IIC') return 'Ingresos\nInt. Carbono'
  if (props.title === 'PS') return 'Presupuestos\nSostenibles'
  if (props.title === 'PIC') return 'Presupuestos\nInt. Carbono'
  return props.title
})

const processedSectors = computed(() => {
  return props.sectors.map(sector => ({
    ...sector,
    shortLabel: sector.label
  }))
})

watch(() => props.sectors, (newSectors) => {
  if (newSectors && newSectors.length > 0) {
    activeSectors.value = newSectors.map(() => true)
  }
}, { immediate: true })

const totalAllSectors = computed(() => {
  return props.sectors.reduce((acc, sector) => acc + (sector.value || 0), 0)
})

const currencyLegend = computed(() => {
  return props.currency === 'USD' ? '* Cifras en dólares estadounidenses (USD)' : '* Cifras en pesos mexicanos (MXN)'
})

function getPercentForSector(index) {
  if (!props.sectors[index] || totalAllSectors.value === 0) return '0.00'
  const percent = (props.sectors[index].value / totalAllSectors.value) * 100
  return percent.toFixed(2)
}

const displayValue = computed(() => {
  if (hoveredIndex.value !== null && processedSectors.value[hoveredIndex.value]) {
    return formatValue(processedSectors.value[hoveredIndex.value].value)
  }
  
  const sum = activeSectors.value.reduce((acc, active, i) => {
    return active && props.sectors[i] ? acc + props.sectors[i].value : acc
  }, 0)
  
  return formatValue(sum)
})

const computedSectorPaths = computed(() => {
  if (!props.sectors || props.sectors.length === 0) return []
  
  const cx = 100, cy = 100, r = 72
  const total = totalAllSectors.value
  let currentAngle = -90
  
  return props.sectors.map((sector) => {
    const percent = total > 0 ? (sector.value / total) * 100 : 0
    const angleSpan = (percent / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angleSpan
    const isFullCircle = angleSpan >= 359.9
    
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    
    const largeArc = angleSpan > 180 ? 1 : 0
    const midAngle = startAngle + angleSpan / 2
    const midRad = (midAngle * Math.PI) / 180
    const percentX = cx + r * Math.cos(midRad)
    const percentY = cy + r * Math.sin(midRad)
    
    const textRotation = isFullCircle ? 0 : midAngle + 90
    const finalPercentX = isFullCircle ? cx : percentX
    const finalPercentY = isFullCircle ? cy - r : percentY
    
    currentAngle = endAngle
    
    let path = ''
    if (!isFullCircle && angleSpan > 0) {
      path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
    }
    
    return {
      ...sector,
      path,
      isFullCircle,
      percentX: finalPercentX,
      percentY: finalPercentY,
      textRotation,
      displayPercent: percent.toFixed(2)
    }
  })
})

function toggleSector(index) {
  activeSectors.value[index] = !activeSectors.value[index]
  if (!activeSectors.value.some(Boolean)) {
    activeSectors.value = activeSectors.value.map(() => true)
  }
}

function onSectorHover(index) {
  if (activeSectors.value[index]) hoveredIndex.value = index
}

function onSectorLeave() {
  hoveredIndex.value = null
}

function formatValue(value) {
  if (!value || value === 0) return '$0.00'
  const millions = value / 1000000
  if (millions >= 1000) return '$' + (millions / 1000).toFixed(2) + ' B'
  if (millions >= 1) return '$' + millions.toFixed(2) + ' M'
  if (millions >= 0.01) return '$' + millions.toFixed(2) + ' M'
  return '$' + (value / 1000).toFixed(2) + ' K'
}
</script>

<style scoped>
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

.distribution-bar-section { flex-shrink: 0; }

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

.distribution-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.distribution-value { font-size: 15px; font-weight: 700; }
.distribution-value.green { color: #166534; }
.distribution-value.red { color: #dc2626; }

/* ✅ Botón de exportación circular pequeño */
.export-button-wrapper { position: relative; }

.export-btn-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn-circle.green {
  background: #f0fdf4;
  border-color: #86efac;
  color: #166534;
}

.export-btn-circle.green:hover { background: #dcfce7; }

.export-btn-circle.red {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.export-btn-circle.red:hover { background: #fee2e2; }

.export-btn-circle:hover { transform: scale(1.08); }
.export-btn-circle.is-open { transform: scale(1.08); }
.export-btn-circle svg { width: 10px; height: 10px; }

.export-dropdown-mini {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  z-index: 1000;
  min-width: 95px;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  font-size: 11px;
  color: #374151;
}

.export-option:hover { background: #f3f4f6; }
.export-option:first-child { border-bottom: 1px solid #e5e7eb; }

.option-icon {
  font-size: 8px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 3px;
  color: white;
}

.option-icon.xlsx { background: #107c41; }
.option-icon.csv { background: #6366f1; }
.option-text { font-weight: 500; }

.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-enter-from, .dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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

.distribution-segment:hover { filter: brightness(1.1); }
.distribution-segment.dimmed { opacity: 0.2; }
.distribution-segment.highlighted { filter: brightness(1.15); }

.currency-legend {
  font-size: 12px;
  font-style: italic;
  color: #94a3b8;
  margin-top: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.donut-main-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-height: 180px;
  padding: 10px 0;
}

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

.donut-ring:hover { filter: brightness(1.1); }
.donut-ring.dimmed { opacity: 0.2; }
.donut-ring.highlighted { filter: brightness(1.15); stroke-width: 28; }

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

.sector-percent.dimmed { opacity: 0.2; }

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.center-value { font-size: 16px; font-weight: 700; transition: all 0.3s ease; }
.center-value.green { color: #166534; }
.center-value.red { color: #dc2626; }

.badge-indicator {
  padding: 16px 14px;
  border-radius: 14px;
  text-align: center;
  flex-shrink: 0;
  min-width: 80px;
}

.badge-indicator.green { background: #f0fdf4; border: 2px solid #86efac; }
.badge-indicator.red { background: #fef2f2; border: 2px solid #fca5a5; }

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

.badge-icon-circle svg { width: 20px; height: 20px; }

.badge-text {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.3;
  white-space: pre-line;
}

.badge-indicator.green .badge-text { color: #166534; }
.badge-indicator.red .badge-text { color: #dc2626; }

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

.data-list-item:not(:last-child) { border-bottom: 1px solid #e2e8f0; }
.data-list-item:hover, .data-list-item.highlighted { background: white; }
.data-list-item.dimmed { opacity: 0.35; }

.data-item-left { display: flex; align-items: center; gap: 10px; }

.data-color-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.data-item-label { font-size: 12px; font-weight: 500; color: #374151; }
.data-item-right { display: flex; align-items: center; gap: 14px; }
.data-item-value { font-size: 14px; font-weight: 500; color: #1e3a5f; }

.data-item-percent {
  font-size: 11px;
  font-weight: 500;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  min-width: 65px;
  text-align: center;
}

@media (max-width: 768px) {
  .donut-svg-container { width: 140px; height: 140px; }
  .donut-main-area { gap: 16px; }
  .badge-indicator { padding: 12px 10px; }
  .badge-icon-circle { width: 32px; height: 32px; }
  .badge-icon-circle svg { width: 16px; height: 16px; }
  .badge-text { font-size: 7px; }
  .center-value { font-size: 18px; }
  .data-item-label { font-size: 11px; }
  .data-item-value { font-size: 12px; }
  .data-item-percent { font-size: 10px; padding: 3px 8px; min-width: 58px; }
  .export-btn-circle { width: 20px; height: 20px; }
  .export-btn-circle svg { width: 9px; height: 9px; }
}
</style>