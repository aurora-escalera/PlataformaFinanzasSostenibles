<!-- src/modules/charts/components/DonutChart.vue -->
<!-- ✅ ACTUALIZADO: Mejor centrado vertical, letra más grande, mejor distribución del espacio -->
<template>
  <div class="donut-chart-container">
    
    <!-- ========== ESTADO VACÍO: Cuando no hay datos ========== -->
    <div v-if="isEmptyState" class="empty-state-container">
      <div class="empty-state-content" :class="badgeColorClass">
        <!-- Icono -->
        <div class="empty-icon" :class="badgeColorClass">
          <svg v-if="badgeColorClass === 'green'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12h6M12 9v6" stroke-linecap="round"/>
          </svg>
          <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
          </svg>
        </div>
        
        <!-- Título -->
        <h3 class="empty-title">{{ emptyStateTitle }}</h3>
        
        <!-- Descripción -->
        <p class="empty-description">{{ emptyStateDescription }}</p>
        
        <!-- Badge con año -->
        <div class="empty-badge" :class="badgeColorClass">
          <span class="empty-badge-label">{{ badgeSubtitle }}</span>
        </div>
      </div>
    </div>
    
    <!-- ========== ESTADO NORMAL: Con datos ========== -->
    <template v-else>
      <!-- Layout principal: Dona | Lista de Sectores -->
      <div class="donut-layout">
        
        <!-- LADO IZQUIERDO: Dona centrada verticalmente -->
        <div class="donut-side">
          <div class="donut-content">
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
                
                <!-- Segmentos de la dona usando paths -->
                <path
                  v-for="(segment, index) in arcSegments"
                  :key="'segment-' + index"
                  class="donut-segment"
                  :class="{ 
                    'dimmed': !activeSectors[index] || (hoveredIndex !== null && hoveredIndex !== index),
                    'highlighted': hoveredIndex === index
                  }"
                  :d="segment.path"
                  fill="none"
                  :stroke="segment.color"
                  :stroke-width="strokeWidth"
                  stroke-linecap="butt"
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
            
            <!-- Info debajo de la dona -->
            <div class="donut-info">
              <div class="info-badge" :class="badgeColorClass">
                {{ mainPercentage }}%
              </div>
              <div class="info-year">{{ selectedYear }}</div>
            </div>
          </div>
        </div>
        
        <!-- LADO DERECHO: Lista de Sectores centrada verticalmente -->
        <div class="sectors-side">
          <div class="sectors-content">
            <div class="sectors-header">
              <span class="sectors-title">{{ badgeTitle }}</span>
            </div>
            
            <!-- Lista de sectores estilo imagen 2 -->
            <div class="sectors-list">
              <div 
                v-for="(sector, index) in processedSectors" 
                :key="'sector-' + index"
                class="sector-row"
                :class="{ 
                  dimmed: !activeSectors[index],
                  highlighted: hoveredIndex === index 
                }"
                @mouseenter="onSectorHover(index)"
                @mouseleave="onSectorLeave"
                @click="toggleSector(index)"
              >
                <div class="sector-left">
                  <span class="sector-dot" :style="{ backgroundColor: sector.color }"></span>
                  <span class="sector-name">{{ sector.label }}</span>
                </div>
                <div class="sector-right">
                  <span class="sector-value">{{ formatValue(sector.value) }}</span>
                  <span class="sector-percent-badge" :style="{ backgroundColor: sector.color }">
                    {{ getPercentForSector(index) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- Barra segmentada inferior -->
      <div class="distribution-bar-section">
        <div class="distribution-header">
          <span class="distribution-label">Distribución</span>
          <span class="distribution-total" :class="badgeColorClass">{{ formatValue(totalActiveSectors) }}</span>
        </div>
        
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
              animationDelay: (index * 0.1) + 's'
            }"
            @mouseenter="onSectorHover(index)"
            @mouseleave="onSectorLeave"
            @click="toggleSector(index)"
          >
            <span v-if="getSegmentWidth(index) > 10" class="bar-segment-label">
              {{ getPercentForSector(index) }}%
            </span>
          </div>
        </div>
      </div>
      
      <div class="currency-note">{{ currencyLegend }}</div>
    </div>
    </template>
    
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

// ========== ESTADO VACÍO ==========
const isEmptyState = computed(() => {
  return totalAllSectors.value === 0
})

const emptyStateTitle = computed(() => {
  if (props.title === 'IS') return 'Sin Ingresos Sostenibles'
  if (props.title === 'IIC') return 'Sin Ingresos Intensivos en Carbono'
  if (props.title === 'PS') return 'Sin Presupuestos Sostenibles'
  if (props.title === 'PIC') return 'Sin Presupuestos Intensivos en Carbono'
  return 'Sin datos disponibles'
})

const emptyStateDescription = computed(() => {
  if (props.title === 'IS') return 'No se registraron ingresos sostenibles para este período'
  if (props.title === 'IIC') return 'No se registraron ingresos intensivos en carbono para este período'
  if (props.title === 'PS') return 'No se asignaron presupuestos sostenibles para este período'
  if (props.title === 'PIC') return 'No se asignaron presupuestos intensivos en carbono para este período'
  return 'No hay información disponible para mostrar'
})

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
// Función para calcular punto en el arco
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}

// Función para crear path de arco
function describeArc(x, y, radius, startAngle, endAngle) {
  // Caso especial: círculo completo (360°)
  if (endAngle - startAngle >= 359.99) {
    // Dibujar círculo completo usando dos arcos de 180°
    const start = polarToCartesian(x, y, radius, 0)
    const mid = polarToCartesian(x, y, radius, 180)
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, 1, 0, mid.x, mid.y,
      "A", radius, radius, 0, 1, 0, start.x, start.y
    ].join(" ")
  }
  
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ")
}

// Segmentos usando paths de arco (sin gaps)
const arcSegments = computed(() => {
  if (!props.sectors || props.sectors.length === 0) return []
  
  const total = totalAllSectors.value
  if (total === 0) return []
  
  let currentAngle = 0
  
  return props.sectors.map((sector, index) => {
    const percentage = (sector.value / total) * 100
    const angle = (percentage / 100) * 360
    
    const startAngle = currentAngle
    let endAngle = currentAngle + angle
    
    // Si es 100% (o muy cercano), usar 360 grados completos
    if (percentage >= 99.99) {
      endAngle = startAngle + 360
    } else {
      // Pequeño overlap para evitar gaps (0.5 grados) solo si no es el último
      endAngle = Math.min(endAngle + 0.5, startAngle + 360)
    }
    
    const path = describeArc(center, center, radius, startAngle, endAngle)
    
    currentAngle += angle
    
    return {
      ...sector,
      percentage,
      path,
      startAngle,
      endAngle
    }
  })
})

// Mantener animatedSegments para compatibilidad (si se usa en otro lugar)
const animatedSegments = computed(() => arcSegments.value)

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
  padding: 20px;
  background: white;
  border-radius: 12px;
  gap: 16px;
  overflow: hidden;
  box-sizing: border-box;
}

/* ============================================
   ESTADO VACÍO
   ============================================ */
.empty-state-container {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  gap: 14px;
  padding: 40px;
  border-radius: 16px;
  background: #fafbfc;
}

.empty-state-content.green {
  border: 2px solid #86efac;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.12);
}

.empty-state-content.red {
  border: 2px solid #fca5a5;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.12);
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon.green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #22c55e;
  border: 2px dashed #86efac;
}

.empty-icon.red {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #ef4444;
  border: 2px dashed #fca5a5;
}

.empty-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.empty-description {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.empty-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  margin-top: 4px;
}

.empty-badge.green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
}

.empty-badge.red {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fca5a5;
}

.empty-badge-label {
  font-size: 14px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.empty-badge.green .empty-badge-label {
  color: #166534;
}

.empty-badge.red .empty-badge-label {
  color: #dc2626;
}

.empty-badge-year {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  padding-left: 8px;
  border-left: 1px solid #e2e8f0;
}

/* ============================================
   LAYOUT PRINCIPAL: DONA | LISTA SECTORES
   ============================================ */
.donut-layout {
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 32px;
  min-height: 0;
  align-items: center; /* ✅ Centrado vertical */
}

/* ============================================
   LADO IZQUIERDO: DONA CENTRADA
   ============================================ */
.donut-side {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 220px;
  height: 100%;
}

.donut-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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
  transition: all 0.3s ease;
}

.donut-segment.dimmed {
  opacity: 0.25;
}

.donut-segment.highlighted {
  filter: brightness(1.15) drop-shadow(0 0 8px rgba(0,0,0,0.3));
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
  width: 40px;
  height: 40px;
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

.center-icon svg {
  width: 20px;
  height: 20px;
}

.center-value {
  font-size: 20px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.1;
  transition: all 0.3s ease;
}

.center-value.green { color: #166534; }
.center-value.red { color: #dc2626; }

.center-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

/* Info debajo de la dona */
.donut-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 700;
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

.info-year {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* ============================================
   LADO DERECHO: LISTA DE SECTORES CENTRADA
   ============================================ */
.sectors-side {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  height: 100%;
  justify-content: center; /* ✅ Centrado vertical */
}

.sectors-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 100%;
}

.sectors-header {
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.sectors-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Lista de sectores */
.sectors-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
}

/* Scrollbar personalizado */
.sectors-list::-webkit-scrollbar {
  width: 5px;
}

.sectors-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.sectors-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.sectors-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Fila de sector - COMPACTO para evitar scroll */
.sector-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  flex-shrink: 0;
}

.sector-row:hover,
.sector-row.highlighted {
  background: white;
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateX(4px);
}

.sector-row.dimmed {
  opacity: 0.4;
  transform: scale(0.98);
}

.sector-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.sector-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.sector-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sector-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.sector-value {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sector-percent-badge {
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  min-width: 54px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* ============================================
   BARRA SEGMENTADA INFERIOR
   ============================================ */
.distribution-bar-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 16px;
  border-top: 2px solid #e2e8f0;
}

.distribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.distribution-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.distribution-total {
  font-size: 18px;
  font-weight: 700;
}

.distribution-total.green { color: #166534; }
.distribution-total.red { color: #dc2626; }

.segmented-bar-wrapper {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.segmented-bar {
  display: flex;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  gap: 3px;
}

.bar-segment {
  height: 100%;
  border-radius: 5px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: segmentGrow 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
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
  font-size: 13px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.currency-note {
  font-size: 11px;
  font-style: italic;
  color: #94a3b8;
  text-align: right;
}

/* ============================================
   RESPONSIVE - Tablets (≤768px)
   ============================================ */
@media (max-width: 768px) {
  .donut-chart-container {
    padding: 14px;
    gap: 12px;
  }
  
  .donut-layout {
    flex-direction: column;
    gap: 20px;
  }
  
  .donut-side {
    width: 100%;
    height: auto;
    flex-shrink: 0;
  }
  
  .donut-content {
    flex-direction: row;
    gap: 20px;
    align-items: center;
  }
  
  .donut-wrapper {
    width: 140px;
    height: 140px;
  }
  
  .donut-info {
    justify-content: center;
  }
  
  .center-icon {
    width: 32px;
    height: 32px;
  }
  
  .center-icon svg {
    width: 16px;
    height: 16px;
  }
  
  .center-value {
    font-size: 15px;
  }
  
  .center-label {
    font-size: 9px;
  }
  
  .info-badge {
    padding: 5px 12px;
    font-size: 13px;
  }
  
  .info-year {
    font-size: 11px;
  }
  
  /* ✅ Scroll para sectors-side */
  .sectors-side {
    flex: 1;
    min-height: 0;
    max-height: 180px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .sectors-content {
    gap: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .sectors-header {
    padding-bottom: 6px;
    flex-shrink: 0;
  }
  
  .sectors-title {
    font-size: 14px;
  }
  
  /* ✅ Lista con scroll interno */
  .sectors-list {
    gap: 4px;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    padding-right: 8px;
    -webkit-overflow-scrolling: touch;
  }
  
  /* ✅ Scrollbar visible y estilizado */
  .sectors-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .sectors-list::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  .sectors-list::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 3px;
  }
  
  .sectors-list::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
  
  .sector-row {
    padding: 8px 12px;
    border-radius: 8px;
    flex-shrink: 0;
  }
  
  .sector-dot {
    width: 10px;
    height: 10px;
  }
  
  .sector-name {
    font-size: 12px;
  }
  
  .sector-value {
    font-size: 13px;
  }
  
  .sector-percent-badge {
    padding: 3px 7px;
    font-size: 10px;
    min-width: 45px;
    border-radius: 12px;
  }
  
  .distribution-bar-section {
    gap: 8px;
    padding-top: 12px;
    flex-shrink: 0;
  }
  
  .distribution-label {
    font-size: 11px;
  }
  
  .distribution-total {
    font-size: 15px;
  }
  
  .segmented-bar-wrapper {
    padding: 3px;
    border-radius: 8px;
  }
  
  .segmented-bar {
    height: 24px;
    border-radius: 5px;
    gap: 2px;
  }
  
  .bar-segment {
    border-radius: 4px;
  }
  
  .bar-segment-label {
    font-size: 10px;
  }
  
  .currency-note {
    font-size: 10px;
  }
  
  /* Empty state responsive */
  .empty-state-content {
    padding: 30px 20px;
    gap: 12px;
  }
  
  .empty-icon {
    width: 60px;
    height: 60px;
  }
  
  .empty-icon svg {
    width: 36px;
    height: 36px;
  }
  
  .empty-title {
    font-size: 15px;
  }
  
  .empty-description {
    font-size: 12px;
  }
  
  .empty-badge {
    padding: 6px 12px;
  }
  
  .empty-badge-label {
    font-size: 12px;
  }
}

/* ============================================
   RESPONSIVE - Móviles medianos (≤480px)
   ============================================ */
@media (max-width: 480px) {
  .donut-chart-container {
    padding: 10px;
    gap: 8px;
  }
  
  .donut-layout {
    gap: 14px;
  }
  
  .donut-content {
    flex-direction: column;
    gap: 10px;
  }
  
  .donut-wrapper {
    width: 120px;
    height: 120px;
  }
  
  .center-icon {
    width: 28px;
    height: 28px;
    margin-bottom: 3px;
  }
  
  .center-icon svg {
    width: 14px;
    height: 14px;
  }
  
  .center-value {
    font-size: 13px;
  }
  
  .center-label {
    font-size: 8px;
  }
  
  .info-badge {
    padding: 4px 10px;
    font-size: 12px;
  }
  
  .info-year {
    font-size: 10px;
  }
  
  /* ✅ Scroll para sectors-side */
  .sectors-side {
    max-height: 160px;
  }
  
  .sectors-header {
    padding-bottom: 5px;
  }
  
  .sectors-title {
    font-size: 12px;
  }
  
  .sectors-list {
    gap: 3px;
    padding-right: 6px;
  }
  
  .sectors-list::-webkit-scrollbar {
    width: 5px;
  }
  
  .sector-row {
    padding: 7px 10px;
    border-radius: 6px;
  }
  
  .sector-left {
    gap: 8px;
  }
  
  .sector-dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
  
  .sector-name {
    font-size: 11px;
  }
  
  .sector-right {
    gap: 8px;
  }
  
  .sector-value {
    font-size: 11px;
  }
  
  .sector-percent-badge {
    padding: 2px 6px;
    font-size: 9px;
    min-width: 38px;
    border-radius: 10px;
  }
  
  .distribution-bar-section {
    gap: 6px;
    padding-top: 10px;
  }
  
  .distribution-label {
    font-size: 10px;
  }
  
  .distribution-total {
    font-size: 13px;
  }
  
  .segmented-bar-wrapper {
    padding: 2px;
    border-radius: 6px;
  }
  
  .segmented-bar {
    height: 20px;
    border-radius: 4px;
    gap: 2px;
  }
  
  .bar-segment {
    border-radius: 3px;
    min-width: 3px;
  }
  
  .bar-segment-label {
    font-size: 9px;
  }
  
  .currency-note {
    font-size: 9px;
  }
  
  /* Empty state */
  .empty-state-content {
    padding: 24px 16px;
    gap: 10px;
  }
  
  .empty-icon {
    width: 52px;
    height: 52px;
  }
  
  .empty-icon svg {
    width: 30px;
    height: 30px;
  }
  
  .empty-title {
    font-size: 14px;
  }
  
  .empty-description {
    font-size: 11px;
  }
  
  .empty-badge {
    padding: 5px 10px;
  }
  
  .empty-badge-label {
    font-size: 11px;
  }
}

/* ============================================
   RESPONSIVE - iPhone 14 Pro Max (≤430px)
   ============================================ */
@media (max-width: 430px) {
  .donut-wrapper {
    width: 110px;
    height: 110px;
  }
  
  .center-icon {
    width: 26px;
    height: 26px;
  }
  
  .center-icon svg {
    width: 13px;
    height: 13px;
  }
  
  .center-value {
    font-size: 12px;
  }
  
  /* ✅ Scroll para sectors-side */
  .sectors-side {
    max-height: 150px;
  }
  
  .sectors-list {
    padding-right: 5px;
  }
  
  .sectors-list::-webkit-scrollbar {
    width: 4px;
  }
  
  .sector-row {
    padding: 6px 9px;
  }
  
  .sector-name {
    font-size: 10px;
  }
  
  .sector-value {
    font-size: 10px;
  }
  
  .sector-percent-badge {
    padding: 2px 5px;
    font-size: 8px;
    min-width: 34px;
  }
}

/* ============================================
   RESPONSIVE - Pixel 7 / Galaxy S20 Ultra (≤414px)
   ============================================ */
@media (max-width: 414px) {
  .donut-chart-container {
    padding: 8px;
    gap: 6px;
  }
  
  .donut-layout {
    gap: 12px;
  }
  
  .donut-wrapper {
    width: 105px;
    height: 105px;
  }
  
  .center-icon {
    width: 24px;
    height: 24px;
  }
  
  .center-icon svg {
    width: 12px;
    height: 12px;
  }
  
  .center-value {
    font-size: 11px;
  }
  
  .center-label {
    font-size: 7px;
  }
  
  .info-badge {
    padding: 3px 8px;
    font-size: 11px;
  }
  
  /* ✅ Scroll para sectors-side */
  .sectors-side {
    max-height: 140px;
  }
  
  .sectors-title {
    font-size: 11px;
  }
  
  .sectors-list {
    padding-right: 4px;
  }
  
  .sector-row {
    padding: 5px 8px;
    border-radius: 5px;
  }
  
  .sector-left {
    gap: 6px;
  }
  
  .sector-dot {
    width: 7px;
    height: 7px;
  }
  
  .sector-name {
    font-size: 9px;
  }
  
  .sector-right {
    gap: 6px;
  }
  
  .sector-value {
    font-size: 9px;
  }
  
  .sector-percent-badge {
    padding: 2px 4px;
    font-size: 7px;
    min-width: 30px;
    border-radius: 8px;
  }
  
  .distribution-label {
    font-size: 9px;
  }
  
  .distribution-total {
    font-size: 12px;
  }
  
  .segmented-bar {
    height: 18px;
  }
  
  .bar-segment-label {
    font-size: 8px;
  }
  
  .currency-note {
    font-size: 8px;
  }
  
  /* Empty state */
  .empty-state-content {
    padding: 20px 14px;
    gap: 8px;
  }
  
  .empty-icon {
    width: 46px;
    height: 46px;
  }
  
  .empty-icon svg {
    width: 26px;
    height: 26px;
  }
  
  .empty-title {
    font-size: 13px;
  }
  
  .empty-description {
    font-size: 10px;
  }
}

/* ============================================
   RESPONSIVE - iPhone 12 Pro (≤390px)
   ============================================ */
@media (max-width: 390px) {
  .donut-chart-container {
    padding: 7px;
    gap: 5px;
  }
  
  .donut-layout {
    gap: 10px;
  }
  
  .donut-content {
    gap: 8px;
  }
  
  .donut-wrapper {
    width: 95px;
    height: 95px;
  }
  
  .center-icon {
    width: 22px;
    height: 22px;
    margin-bottom: 2px;
  }
  
  .center-icon svg {
    width: 11px;
    height: 11px;
  }
  
  .center-value {
    font-size: 10px;
  }
  
  .center-label {
    font-size: 6px;
  }
  
  .info-badge {
    padding: 3px 7px;
    font-size: 10px;
  }
  
  .info-year {
    font-size: 9px;
  }
  
  /* ✅ Scroll para sectors-side */
  .sectors-side {
    max-height: 130px;
  }
  
  .sectors-header {
    padding-bottom: 4px;
  }
  
  .sectors-title {
    font-size: 10px;
  }
  
  .sectors-list {
    gap: 2px;
    padding-right: 4px;
  }
  
  .sectors-list::-webkit-scrollbar {
    width: 3px;
  }
  
  .sector-row {
    padding: 4px 7px;
    border-radius: 4px;
  }
  
  .sector-left {
    gap: 5px;
  }
  
  .sector-dot {
    width: 6px;
    height: 6px;
  }
  
  .sector-name {
    font-size: 8px;
  }
  
  .sector-right {
    gap: 5px;
  }
  
  .sector-value {
    font-size: 8px;
  }
  
  .sector-percent-badge {
    padding: 1px 4px;
    font-size: 6.5px;
    min-width: 26px;
    border-radius: 6px;
  }
  
  .distribution-bar-section {
    gap: 5px;
    padding-top: 8px;
  }
  
  .distribution-label {
    font-size: 8px;
  }
  
  .distribution-total {
    font-size: 11px;
  }
  
  .segmented-bar-wrapper {
    padding: 2px;
    border-radius: 5px;
  }
  
  .segmented-bar {
    height: 16px;
    border-radius: 3px;
  }
  
  .bar-segment {
    border-radius: 2px;
    min-width: 2px;
  }
  
  .bar-segment-label {
    font-size: 7px;
  }
  
  .currency-note {
    font-size: 7px;
  }
  
  /* Empty state */
  .empty-state-content {
    padding: 18px 12px;
    gap: 7px;
  }
  
  .empty-icon {
    width: 42px;
    height: 42px;
  }
  
  .empty-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .empty-title {
    font-size: 12px;
  }
  
  .empty-description {
    font-size: 9px;
  }
  
  .empty-badge {
    padding: 4px 8px;
  }
  
  .empty-badge-label {
    font-size: 10px;
  }
}

/* ============================================
   RESPONSIVE - Samsung Galaxy S8+ (≤360px)
   ============================================ */
@media (max-width: 360px) {
  .donut-chart-container {
    padding: 6px;
    gap: 4px;
  }
  
  .donut-layout {
    gap: 8px;
  }
  
  .donut-content {
    gap: 6px;
  }
  
  .donut-wrapper {
    width: 85px;
    height: 85px;
  }
  
  .center-icon {
    width: 20px;
    height: 20px;
    margin-bottom: 1px;
  }
  
  .center-icon svg {
    width: 10px;
    height: 10px;
  }
  
  .center-value {
    font-size: 9px;
  }
  
  .center-label {
    font-size: 5.5px;
  }
  
  .info-badge {
    padding: 2px 6px;
    font-size: 9px;
  }
  
  .info-year {
    font-size: 8px;
  }
  
  /* ✅ Scroll para sectors-side */
  .sectors-side {
    max-height: 115px;
  }
  
  .sectors-header {
    padding-bottom: 3px;
  }
  
  .sectors-title {
    font-size: 9px;
  }
  
  .sectors-list {
    gap: 2px;
    padding-right: 3px;
  }
  
  .sectors-list::-webkit-scrollbar {
    width: 3px;
  }
  
  .sector-row {
    padding: 4px 6px;
    border-radius: 4px;
  }
  
  .sector-left {
    gap: 4px;
  }
  
  .sector-dot {
    width: 5px;
    height: 5px;
    border-radius: 1px;
  }
  
  .sector-name {
    font-size: 7px;
  }
  
  .sector-right {
    gap: 4px;
  }
  
  .sector-value {
    font-size: 7px;
  }
  
  .sector-percent-badge {
    padding: 1px 3px;
    font-size: 6px;
    min-width: 22px;
    border-radius: 5px;
  }
  
  .distribution-bar-section {
    gap: 4px;
    padding-top: 6px;
  }
  
  .distribution-label {
    font-size: 7px;
  }
  
  .distribution-total {
    font-size: 10px;
  }
  
  .segmented-bar-wrapper {
    padding: 1px;
    border-radius: 4px;
  }
  
  .segmented-bar {
    height: 14px;
    border-radius: 3px;
    gap: 1px;
  }
  
  .bar-segment {
    border-radius: 2px;
    min-width: 2px;
  }
  
  .bar-segment-label {
    font-size: 6px;
  }
  
  .currency-note {
    font-size: 6px;
  }
  
  /* Empty state */
  .empty-state-content {
    padding: 16px 10px;
    gap: 6px;
  }
  
  .empty-icon {
    width: 38px;
    height: 38px;
  }
  
  .empty-icon svg {
    width: 22px;
    height: 22px;
  }
  
  .empty-title {
    font-size: 11px;
  }
  
  .empty-description {
    font-size: 8px;
  }
  
  .empty-badge {
    padding: 3px 7px;
  }
  
  .empty-badge-label {
    font-size: 9px;
  }
}

/* ============================================
   RESPONSIVE - iPhone SE (≤320px)
   ============================================ */
@media (max-width: 320px) {
  .donut-chart-container {
    padding: 5px;
    gap: 3px;
  }
  
  .donut-layout {
    gap: 6px;
  }
  
  .donut-content {
    gap: 5px;
  }
  
  .donut-wrapper {
    width: 75px;
    height: 75px;
  }
  
  .center-icon {
    width: 18px;
    height: 18px;
    margin-bottom: 1px;
  }
  
  .center-icon svg {
    width: 9px;
    height: 9px;
  }
  
  .center-value {
    font-size: 8px;
  }
  
  .center-label {
    font-size: 5px;
  }
  
  .info-badge {
    padding: 2px 5px;
    font-size: 8px;
    border-radius: 12px;
  }
  
  .info-year {
    font-size: 7px;
  }
  
  /* ✅ Scroll para sectors-side */
  .sectors-side {
    max-height: 100px;
  }
  
  .sectors-header {
    padding-bottom: 2px;
  }
  
  .sectors-title {
    font-size: 8px;
  }
  
  .sectors-list {
    gap: 1.5px;
    padding-right: 2px;
  }
  
  .sectors-list::-webkit-scrollbar {
    width: 2px;
  }
  
  .sector-row {
    padding: 3px 5px;
    border-radius: 3px;
  }
  
  .sector-left {
    gap: 3px;
  }
  
  .sector-dot {
    width: 4px;
    height: 4px;
    border-radius: 1px;
  }
  
  .sector-name {
    font-size: 6px;
  }
  
  .sector-right {
    gap: 3px;
  }
  
  .sector-value {
    font-size: 6px;
  }
  
  .sector-percent-badge {
    padding: 1px 2px;
    font-size: 5px;
    min-width: 18px;
    border-radius: 4px;
  }
  
  .distribution-bar-section {
    gap: 3px;
    padding-top: 5px;
  }
  
  .distribution-label {
    font-size: 6px;
  }
  
  .distribution-total {
    font-size: 9px;
  }
  
  .segmented-bar-wrapper {
    padding: 1px;
    border-radius: 3px;
  }
  
  .segmented-bar {
    height: 12px;
    border-radius: 2px;
    gap: 1px;
  }
  
  .bar-segment {
    border-radius: 1.5px;
    min-width: 1px;
  }
  
  .bar-segment-label {
    font-size: 5px;
  }
  
  .currency-note {
    font-size: 5px;
  }
  
  /* Empty state */
  .empty-state-content {
    padding: 14px 8px;
    gap: 5px;
    border-radius: 12px;
  }
  
  .empty-icon {
    width: 34px;
    height: 34px;
  }
  
  .empty-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .empty-title {
    font-size: 10px;
  }
  
  .empty-description {
    font-size: 7px;
    line-height: 1.4;
  }
  
  .empty-badge {
    padding: 3px 6px;
    border-radius: 14px;
  }
  
  .empty-badge-label {
    font-size: 8px;
  }
}

/* ============================================
   RESPONSIVE - Landscape en móviles
   ============================================ */
@media (max-width: 768px) and (orientation: landscape) {
  .donut-layout {
    flex-direction: row;
    gap: 16px;
  }
  
  .donut-side {
    width: auto;
    height: 100%;
  }
  
  .donut-content {
    flex-direction: column;
    gap: 8px;
  }
  
  .donut-wrapper {
    width: 100px;
    height: 100px;
  }
  
  /* ✅ Scroll para sectors-side en landscape */
  .sectors-side {
    max-height: none;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  
  .sectors-content {
    height: 100%;
    overflow: hidden;
  }
  
  .sectors-list {
    max-height: 120px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .sector-row {
    padding: 5px 8px;
  }
  
  .sector-name {
    font-size: 9px;
  }
  
  .sector-value {
    font-size: 9px;
  }
  
  .sector-percent-badge {
    font-size: 7px;
    min-width: 28px;
  }

}
</style>