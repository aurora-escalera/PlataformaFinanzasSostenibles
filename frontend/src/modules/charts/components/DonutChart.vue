<!-- src/modules/charts/components/DonutChart.vue -->
<!-- ✅ PROPUESTA A: Dona Izquierda + Info Derecha (Vertical) -->
<template>
  <div class="donut-chart-container">
    
    <!-- Layout principal: Info | Dona -->
    <div class="donut-layout">
      
      <!-- LADO IZQUIERDO: Información (centrado) -->
      <div class="info-side">
        
        <!-- Header con título y badge -->
        <div class="info-header">
          <div class="info-title-section">
            <h3 class="info-title">{{ badgeTitle }}</h3>
            <div class="info-subtitle">{{ selectedYear }}</div>
          </div>
          <div class="info-badge" :class="badgeColorClass">
            {{ mainPercentage }}%
          </div>
        </div>
        
        <!-- Métricas principales -->
        <div class="info-metrics">
          <div class="metric-item">
            <div class="metric-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Total</span>
              <span class="metric-value" :class="badgeColorClass">{{ displayValue }}</span>
            </div>
          </div>
          
          <div class="metric-item" v-if="position">
            <div class="metric-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">Posición</span>
              <span class="metric-value position">#{{ position }}</span>
            </div>
          </div>
        </div>
        
        <!-- Separador -->
        <div class="info-divider"></div>
        
      </div>
      
      <!-- LADO DERECHO: Dona -->
      <div class="donut-side">
        <div class="donut-wrapper">
          <svg 
            class="donut-svg" 
            :viewBox="`0 0 ${svgSize} ${svgSize}`"
          >
            <!-- Círculo de fondo -->
            <circle 
              class="donut-background"
              :cx="center" 
              :cy="center" 
              :r="radius"
              fill="none"
              stroke="#f1f5f9"
              :stroke-width="strokeWidth"
            />
            
            <!-- Segmentos de la dona -->
            <circle
              v-for="(segment, index) in animatedSegments"
              :key="'segment-' + index"
              class="donut-segment"
              :class="{ 
                'dimmed': !activeSectors[index] || (hoveredIndex !== null && hoveredIndex !== index),
                'highlighted': hoveredIndex === index
              }"
              :cx="center"
              :cy="center"
              :r="radius"
              fill="none"
              :stroke="segment.color"
              :stroke-width="hoveredIndex === index ? strokeWidth + 6 : strokeWidth"
              :stroke-dasharray="segment.dashArray"
              :stroke-dashoffset="segment.dashOffset"
              stroke-linecap="butt"
              style="transform: rotate(-90deg); transform-origin: center;"
              @mouseenter="onSectorHover(index)"
              @mouseleave="onSectorLeave"
              @click="toggleSector(index)"
            />
          </svg>
          
          <!-- Centro de la dona -->
          <div class="donut-center">
            <div class="center-icon" :class="badgeColorClass">
              <svg v-if="badgeColorClass === 'green'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="center-value" :class="badgeColorClass">{{ displayValue }}</div>
            <div class="center-label">{{ badgeSubtitle }}</div>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Barra de distribución con cards -->
    <div class="distribution-section">
      
      <!-- Header de distribución -->
      <div class="distribution-header">
        <span class="distribution-title">Distribución por componente</span>
        <span class="distribution-total" :class="badgeColorClass">{{ displayValue }}</span>
      </div>
      
      <!-- Barra segmentada grande -->
      <div class="segmented-bar-wrapper">
        <div class="segmented-bar">
          <div 
            v-for="(sector, index) in processedSectors" 
            :key="'bar-' + index"
            class="bar-segment"
            :class="{ 
              dimmed: !activeSectors[index],
              highlighted: hoveredIndex === index 
            }"
            :style="{ 
              width: getSegmentWidth(index) + '%', 
              backgroundColor: sector.color,
              animationDelay: (index * 0.15) + 's'
            }"
            @mouseenter="onSectorHover(index)"
            @mouseleave="onSectorLeave"
            @click="toggleSector(index)"
          >
            <span v-if="getSegmentWidth(index) > 15" class="bar-segment-label">
              {{ getPercentForSector(index) }}%
            </span>
          </div>
        </div>
      </div>
      
      <!-- Cards de sectores -->
      <div class="sector-cards">
        <div 
          v-for="(sector, index) in processedSectors" 
          :key="'card-' + index"
          class="sector-card"
          :class="{ 
            dimmed: !activeSectors[index],
            highlighted: hoveredIndex === index 
          }"
          :style="{ 
            borderColor: sector.color,
            animationDelay: (index * 0.1 + 0.3) + 's'
          }"
          @mouseenter="onSectorHover(index)"
          @mouseleave="onSectorLeave"
          @click="toggleSector(index)"
        >
          <div class="card-color-bar" :style="{ backgroundColor: sector.color }"></div>
          <div class="card-content">
            <div class="card-header">
              <span class="card-dot" :style="{ backgroundColor: sector.color }"></span>
              <span class="card-name">{{ sector.label }}</span>
            </div>
            <div class="card-value">{{ formatValue(sector.value) }}</div>
            <div class="card-percent" :style="{ color: sector.color }">{{ getPercentForSector(index) }}%</div>
          </div>
        </div>
      </div>
      
      <!-- Nota de moneda -->
      <div class="currency-note">{{ currencyLegend }}</div>
      
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  size: { type: Number, default: 220 },
  variables: { type: Array, default: () => [] },
  sectors: { type: Array, default: () => [] },
  currency: { type: String, default: 'MXN' },
  position: { type: [Number, String], default: null },
  percentage: { type: [Number, String], default: null },
  selectedYear: { type: String, default: '' }
})

const emit = defineEmits(['export'])

// Configuración del SVG
const svgSize = 200
const center = svgSize / 2
const strokeWidth = 28
const radius = (svgSize - strokeWidth) / 2 - 8
const circumference = 2 * Math.PI * radius

// Estado
const activeSectors = ref([])
const hoveredIndex = ref(null)

// Computed para colores y etiquetas
const badgeColorClass = computed(() => {
  if (props.title === 'IS' || props.title === 'PS') return 'green'
  return 'red'
})

const badgeTitle = computed(() => {
  if (props.title === 'IS') return 'Ingresos Sostenibles'
  if (props.title === 'IIC') return 'Ingresos Intensivos en Carbono'
  if (props.title === 'PS') return 'Presupuestos Sostenibles'
  if (props.title === 'PIC') return 'Presupuestos Intensivos en Carbono'
  return props.title
})

const badgeSubtitle = computed(() => {
  if (props.title === 'IS') return 'IS'
  if (props.title === 'IIC') return 'IIC'
  if (props.title === 'PS') return 'PS'
  if (props.title === 'PIC') return 'PIC'
  return props.title
})

const mainPercentage = computed(() => {
  if (props.percentage) return parseFloat(props.percentage).toFixed(2)
  return totalPercentage.value.toFixed(2)
})

const processedSectors = computed(() => {
  return props.sectors.map(sector => ({
    ...sector,
    shortLabel: sector.label
  }))
})

// Inicializar sectores activos
watch(() => props.sectors, (newSectors) => {
  if (newSectors && newSectors.length > 0) {
    activeSectors.value = newSectors.map(() => true)
  }
}, { immediate: true })

// Cálculos
const totalAllSectors = computed(() => {
  return props.sectors.reduce((acc, sector) => acc + (sector.value || 0), 0)
})

const totalActiveSectors = computed(() => {
  return activeSectors.value.reduce((acc, active, i) => {
    return active && props.sectors[i] ? acc + props.sectors[i].value : acc
  }, 0)
})

const totalPercentage = computed(() => {
  if (totalAllSectors.value === 0) return 0
  return (totalActiveSectors.value / totalAllSectors.value) * 100
})

const currencyLegend = computed(() => {
  return props.currency === 'USD' 
    ? '* Cifras en dólares estadounidenses (USD)' 
    : '* Cifras en pesos mexicanos (MXN)'
})

// Segmentos para el SVG
const animatedSegments = computed(() => {
  if (!props.sectors || props.sectors.length === 0) return []
  
  const total = totalAllSectors.value
  if (total === 0) return []
  
  let accumulatedOffset = 0
  
  return props.sectors.map((sector, index) => {
    const percentage = (sector.value / total) * 100
    const segmentLength = (percentage / 100) * circumference
    const gapSize = 0
    
    const dashArray = `${Math.max(segmentLength - gapSize, 0)} ${circumference - segmentLength + gapSize}`
    const dashOffset = -accumulatedOffset
    
    accumulatedOffset += segmentLength
    
    return {
      ...sector,
      percentage,
      dashArray,
      dashOffset
    }
  })
})

// Valor mostrado
const displayValue = computed(() => {
  if (hoveredIndex.value !== null && processedSectors.value[hoveredIndex.value]) {
    return formatValue(processedSectors.value[hoveredIndex.value].value)
  }
  return formatValue(totalActiveSectors.value)
})

// Funciones de interacción
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

function getPercentForSector(index) {
  if (!props.sectors[index] || totalAllSectors.value === 0) return '0.00'
  const percent = (props.sectors[index].value / totalAllSectors.value) * 100
  return percent.toFixed(2)
}

function getSegmentWidth(index) {
  if (!props.sectors[index] || totalAllSectors.value === 0) return 0
  return (props.sectors[index].value / totalAllSectors.value) * 100
}

function formatValue(value) {
  if (!value || value === 0) return '$0'
  const absValue = Math.abs(value)
  if (absValue >= 1000000000) return '$' + (value / 1000000000).toFixed(2) + ' B'
  if (absValue >= 1000000) return '$' + (value / 1000000).toFixed(2) + ' M'
  if (absValue >= 1000) return '$' + (value / 1000).toFixed(2) + ' K'
  return '$' + value.toFixed(0)
}
</script>

<style scoped>
.donut-chart-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
  background: white;
  border-radius: 12px;
  gap: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

/* ============================================
   LAYOUT PRINCIPAL: INFO | DONA
   ============================================ */
.donut-layout {
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 24px;
  min-height: 0;
  align-items: center;
}

/* ============================================
   LADO IZQUIERDO: INFORMACIÓN (CENTRADO)
   ============================================ */
.info-side {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 12px;
  justify-content: center;
}

/* ============================================
   LADO DERECHO: DONA
   ============================================ */
.donut-side {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 200px;
}

.donut-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
}

.donut-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.donut-background {
  opacity: 0.6;
}

.donut-segment {
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.donut-segment.dimmed {
  opacity: 0.2;
}

.donut-segment.highlighted {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
}

/* Centro de la dona */
.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: none;
}

.center-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.center-icon.green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.35);
}

.center-icon.red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
}

.center-value {
  font-size: 18px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.1;
  transition: all 0.3s ease;
}

.center-value.green { color: #166534; }
.center-value.red { color: #dc2626; }

.center-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

/* Header */
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.info-title-section {
  flex: 1;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 2px 0;
  line-height: 1.3;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.info-subtitle {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.info-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.info-badge.green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #166534;
  border: 1px solid #86efac;
}

.info-badge.red {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  border: 1px solid #fca5a5;
}

/* Métricas */
.info-metrics {
  display: flex;
  gap: 16px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 10px;
  flex: 1;
  transition: all 0.2s ease;
}

.metric-item:hover {
  background: #f1f5f9;
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.metric-value {
  font-size: 15px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.metric-value.green { color: #166534; }
.metric-value.red { color: #dc2626; }
.metric-value.position { color: #1e293b; }

/* Separador */
.info-divider {
  height: 1px;
  background: linear-gradient(90deg, #e2e8f0 0%, transparent 100%);
}

/* ============================================
   BARRA DE DISTRIBUCIÓN SEGMENTADA + CARDS
   ============================================ */
.distribution-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.distribution-title {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.distribution-total {
  font-size: 16px;
  font-weight: 700;
}

.distribution-total.green { color: #166534; }
.distribution-total.red { color: #dc2626; }

/* Barra segmentada grande */
.segmented-bar-wrapper {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.segmented-bar {
  display: flex;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  gap: 3px;
}

.bar-segment {
  height: 100%;
  border-radius: 6px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: segmentGrow 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes segmentGrow {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

.bar-segment:hover,
.bar-segment.highlighted {
  transform: scaleY(1.15);
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.bar-segment.dimmed {
  opacity: 0.25;
  transform: scaleY(0.85);
}

.bar-segment-label {
  color: white;
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

/* Cards de sectores */
.sector-cards {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sector-card {
  flex: 1;
  min-width: 100px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes cardSlideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.sector-card:hover,
.sector-card.highlighted {
  background: white;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.sector-card.dimmed {
  opacity: 0.35;
  transform: scale(0.95);
}

.card-color-bar {
  height: 4px;
  width: 100%;
  transition: height 0.3s ease;
}

.sector-card:hover .card-color-bar,
.sector-card.highlighted .card-color-bar {
  height: 6px;
}

.card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.card-name {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-value {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card-percent {
  font-size: 13px;
  font-weight: 700;
}

.currency-note {
  font-size: 10px;
  font-style: italic;
  color: #94a3b8;
  text-align: right;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .donut-chart-container {
    padding: 12px;
    gap: 10px;
  }
  
  .donut-layout {
    flex-direction: column-reverse;
    gap: 16px;
  }
  
  .donut-side {
    width: 100%;
    justify-content: center;
  }
  
  .donut-wrapper {
    width: 160px;
    height: 160px;
  }
  
  .center-icon {
    width: 36px;
    height: 36px;
  }
  
  .center-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .center-value {
    font-size: 16px;
  }
  
  .center-label {
    font-size: 10px;
  }
  
  .info-side {
    gap: 10px;
  }
  
  .info-title {
    font-size: 14px;
  }
  
  .info-badge {
    padding: 5px 10px;
    font-size: 13px;
  }
  
  .info-metrics {
    gap: 10px;
  }
  
  .metric-item {
    padding: 8px 10px;
  }
  
  .metric-icon {
    width: 28px;
    height: 28px;
  }
  
  .metric-icon svg {
    width: 14px;
    height: 14px;
  }
  
  .metric-label {
    font-size: 10px;
  }
  
  .metric-value {
    font-size: 14px;
  }
  
  /* Distribution section responsive */
  .distribution-section {
    gap: 10px;
  }
  
  .distribution-title {
    font-size: 11px;
  }
  
  .distribution-total {
    font-size: 14px;
  }
  
  .segmented-bar {
    height: 26px;
    gap: 2px;
  }
  
  .bar-segment-label {
    font-size: 10px;
  }
  
  .sector-cards {
    gap: 8px;
  }
  
  .sector-card {
    min-width: 80px;
  }
  
  .card-content {
    padding: 10px;
    gap: 4px;
  }
  
  .card-name {
    font-size: 10px;
  }
  
  .card-value {
    font-size: 14px;
  }
  
  .card-percent {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .donut-chart-container {
    padding: 10px;
    gap: 8px;
  }
  
  .donut-wrapper {
    width: 140px;
    height: 140px;
  }
  
  .center-icon {
    width: 32px;
    height: 32px;
    margin-bottom: 4px;
  }
  
  .center-icon svg {
    width: 16px;
    height: 16px;
  }
  
  .center-value {
    font-size: 14px;
  }
  
  .center-label {
    font-size: 9px;
  }
  
  .info-metrics {
    flex-direction: column;
    gap: 8px;
  }
  
  .metric-item {
    padding: 8px;
  }
  
  /* Distribution section responsive small */
  .segmented-bar-wrapper {
    padding: 3px;
    border-radius: 10px;
  }
  
  .segmented-bar {
    height: 22px;
    border-radius: 6px;
  }
  
  .bar-segment {
    border-radius: 4px;
    min-width: 6px;
  }
  
  .bar-segment-label {
    font-size: 9px;
  }
  
  .sector-cards {
    gap: 6px;
  }
  
  .sector-card {
    min-width: 70px;
    border-radius: 10px;
  }
  
  .card-color-bar {
    height: 3px;
  }
  
  .sector-card:hover .card-color-bar,
  .sector-card.highlighted .card-color-bar {
    height: 5px;
  }
  
  .card-content {
    padding: 8px;
    gap: 3px;
  }
  
  .card-dot {
    width: 8px;
    height: 8px;
  }
  
  .card-name {
    font-size: 9px;
  }
  
  .card-value {
    font-size: 12px;
  }
  
  .card-percent {
    font-size: 10px;
  }
  
  .currency-note {
    font-size: 9px;
  }
}
</style>