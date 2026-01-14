<!-- src/modules/charts/components/RegionalUnifiedCard.vue -->
<!-- ✅ Card unificada con 4 subcards: Barras Sostenible | Dona Sostenible | Barras Carbono | Dona Carbono -->
<!-- ✅ ACTUALIZADO: Toggle en KPI cards para mostrar/ocultar barras -->
<template>
  <div class="main-card">
    <!-- Header simple -->
    <div class="main-card-header">
      <h2 class="main-card-title">{{ mainTitle }} - {{ selectedYear }}</h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <!-- Contenido con 4 subcards -->
    <div v-else class="main-card-content">
      
      <!-- SUBCARD 1: Barras - Sostenible -->
      <div class="sub-card">
        <div class="sub-card-header">
          <div class="sub-header-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
            </svg>
          </div>
          <div class="sub-header-text">
            <div class="sub-header-title">{{ sustainableBarTitle }}</div>
            <div class="sub-header-subtitle">Regional • {{ selectedYear }}</div>
          </div>
        </div>
        <div class="sub-card-body">
          <div class="kpi-cards-row">
            <div 
              class="kpi-card gray" 
              :class="{ 'active': sustainableReferenceActive, 'inactive': !sustainableReferenceActive }"
              @click="toggleSustainableReference"
            >
              <span class="kpi-dot gray"></span>
              <div class="kpi-value">{{ formatCurrency(referenceValue) }}</div>
              <div class="kpi-label">{{ referenceLabel }}</div>
            </div>
            <div 
              class="kpi-card green" 
              :class="{ 'active': sustainableValueActive, 'inactive': !sustainableValueActive }"
              @click="toggleSustainableValue"
            >
              <span class="kpi-dot green"></span>
              <div class="kpi-value">{{ formatCurrency(sustainableValue) }}</div>
              <div class="kpi-percent green">Porcentaje: {{ sustainablePercent }}%</div>
              <div v-if="sustainablePosition" class="kpi-position green">Posición: No. {{ sustainablePosition }}</div>
              <div class="kpi-label">{{ sustainableTitle }}</div>
            </div>
          </div>
          <div class="currency-legend">* Cifras en {{ currencyLabel }}</div>
          <div class="chart-area">
            <div class="y-axis">
              <span v-for="tick in yAxisTicksSustainable" :key="tick" class="y-tick">{{ formatCurrency(tick) }}</span>
            </div>
            <div class="grid-lines">
              <div class="grid-line" v-for="n in 5" :key="n"></div>
            </div>
            <div class="bars-container" :class="sustainableBarsClass">
              <!-- Barra Reference (gray) -->
              <div v-if="sustainableReferenceActive" class="bar-column">
                <div class="bar-value-label gray">{{ formatCurrency(referenceValue) }}</div>
                <div class="bar gray" :style="{ height: getBarHeight(referenceValue, maxSustainableValue) + '%' }">
                  <span class="bar-percent">100.00%</span>
                </div>
              </div>
              <!-- Barra Sustainable (green) -->
              <div v-if="sustainableValueActive" class="bar-column">
                <div class="bar-value-label green">{{ formatCurrency(sustainableValue) }}</div>
                <div class="bar green" :style="{ height: getBarHeight(sustainableValue, maxSustainableValue) + '%' }">
                  <span v-if="getBarHeight(sustainableValue, maxSustainableValue) >= 15" class="bar-percent">{{ getSustainableBarPercent() }}%</span>
                </div>
              </div>
              <!-- Empty state -->
              <div v-if="!sustainableReferenceActive && !sustainableValueActive" class="empty-state">
                <p>Selecciona al menos una variable</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUBCARD 2: Dona - Sostenible -->
      <div class="sub-card">
        <div class="donut-header green">
          <div class="donut-header-icon green">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span>Componentes de {{ sustainableTitle }}</span>
        </div>
        <div class="donut-content">
          <div class="donut-summary">
            <div class="summary-header">
              <span class="summary-label">Distribución</span>
              <span class="summary-value green">{{ formatCurrency(sustainableSectorsTotal) }}</span>
            </div>
            <div class="distribution-bar">
              <div 
                v-for="(sector, index) in sustainableSectors" 
                :key="index"
                class="distribution-segment"
                :style="{ width: getSectorPercent(sector.value, sustainableSectorsTotal) + '%', background: sector.color }"
              ></div>
            </div>
          </div>
          <div class="currency-legend-donut">* Cifras en {{ currencyLabel }}</div>
          
          <!-- No data state -->
          <div v-if="sustainableSectors.length === 0" class="no-data-state green">
            <div class="no-data-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <h3 class="no-data-title">Sin datos disponibles</h3>
            <p class="no-data-text">No se registraron datos en los sectores de <strong>{{ sustainableTitle }}</strong> para el año <strong>{{ selectedYear }}</strong></p>
          </div>

          <!-- Donut + Badge -->
          <div v-else class="donut-main">
            <div class="donut-svg-container">
              <svg class="donut-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" stroke-width="12"/>
                <circle 
                  v-for="(sector, index) in sustainableDonutPaths" 
                  :key="index"
                  cx="50" cy="50" r="38" 
                  fill="none" 
                  :stroke="sector.color"
                  stroke-width="12"
                  :stroke-dasharray="sector.dashArray"
                  :stroke-dashoffset="sector.dashOffset"
                  stroke-linecap="round"
                />
              </svg>
              <div class="donut-center">
                <span class="center-value green">{{ formatCurrency(sustainableSectorsTotal) }}</span>
              </div>
            </div>
            <div class="donut-badge green">
              <div class="badge-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="badge-text">{{ sustainableBadgeText }}</span>
            </div>
          </div>

          <!-- Components list -->
          <div v-if="sustainableSectors.length > 0" class="components-list">
            <div v-for="(sector, index) in sustainableSectors" :key="index" class="component-item">
              <div class="component-left">
                <span class="component-dot" :style="{ background: sector.color }"></span>
                <span class="component-name">{{ sector.label }}</span>
              </div>
              <div class="component-right">
                <span class="component-value">{{ formatCurrency(sector.value) }}</span>
                <span class="component-percent" :style="{ background: sector.color }">{{ getSectorPercent(sector.value, sustainableSectorsTotal) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUBCARD 3: Barras - Carbono -->
      <div class="sub-card">
        <div class="sub-card-header">
          <div class="sub-header-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
            </svg>
          </div>
          <div class="sub-header-text">
            <div class="sub-header-title">{{ carbonBarTitle }}</div>
            <div class="sub-header-subtitle">Regional • {{ selectedYear }}</div>
          </div>
        </div>
        <div class="sub-card-body">
          <div class="kpi-cards-row">
            <div 
              class="kpi-card gray" 
              :class="{ 'active': carbonTotalActive, 'inactive': !carbonTotalActive }"
              @click="toggleCarbonTotal"
            >
              <span class="kpi-dot gray"></span>
              <div class="kpi-value">{{ formatCurrency(totalValue) }}</div>
              <div class="kpi-label">{{ totalLabel }}</div>
            </div>
            <div 
              class="kpi-card red" 
              :class="{ 'active': carbonValueActive, 'inactive': !carbonValueActive }"
              @click="toggleCarbonValue"
            >
              <span class="kpi-dot red"></span>
              <div class="kpi-value">{{ formatCurrency(carbonValue) }}</div>
              <div class="kpi-percent red">Porcentaje: {{ carbonPercent }}%</div>
              <div v-if="carbonPosition" class="kpi-position red">Posición: No. {{ carbonPosition }}</div>
              <div class="kpi-label">{{ carbonTitle }}</div>
            </div>
          </div>
          <div class="currency-legend">* Cifras en {{ currencyLabel }}</div>
          <div class="chart-area">
            <div class="y-axis">
              <span v-for="tick in yAxisTicksCarbon" :key="tick" class="y-tick">{{ formatCurrency(tick) }}</span>
            </div>
            <div class="grid-lines">
              <div class="grid-line" v-for="n in 5" :key="n"></div>
            </div>
            <div class="bars-container" :class="carbonBarsClass">
              <!-- Barra Total (gray) -->
              <div v-if="carbonTotalActive" class="bar-column">
                <div class="bar-value-label gray">{{ formatCurrency(totalValue) }}</div>
                <div class="bar gray" :style="{ height: getBarHeight(totalValue, maxCarbonValue) + '%' }">
                  <span class="bar-percent">100.00%</span>
                </div>
              </div>
              <!-- Barra Carbon (red) -->
              <div v-if="carbonValueActive" class="bar-column">
                <div class="bar-value-label red">{{ formatCurrency(carbonValue) }}</div>
                <div class="bar red" :style="{ height: getBarHeight(carbonValue, maxCarbonValue) + '%' }">
                  <span v-if="getBarHeight(carbonValue, maxCarbonValue) >= 15" class="bar-percent">{{ getCarbonBarPercent() }}%</span>
                </div>
              </div>
              <!-- Empty state -->
              <div v-if="!carbonTotalActive && !carbonValueActive" class="empty-state">
                <p>Selecciona al menos una variable</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUBCARD 4: Dona - Carbono -->
      <div class="sub-card">
        <div class="donut-header red">
          <div class="donut-header-icon red">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span>Componentes de {{ carbonTitle }}</span>
        </div>
        <div class="donut-content">
          <div class="donut-summary">
            <div class="summary-header">
              <span class="summary-label">Distribución</span>
              <span class="summary-value red">{{ formatCurrency(carbonSectorsTotal) }}</span>
            </div>
            <div class="distribution-bar">
              <div 
                v-for="(sector, index) in carbonSectors" 
                :key="index"
                class="distribution-segment"
                :style="{ width: getSectorPercent(sector.value, carbonSectorsTotal) + '%', background: sector.color }"
              ></div>
            </div>
          </div>
          <div class="currency-legend-donut">* Cifras en {{ currencyLabel }}</div>
          
          <!-- No data state -->
          <div v-if="carbonSectors.length === 0" class="no-data-state red">
            <div class="no-data-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <h3 class="no-data-title">Sin datos disponibles</h3>
            <p class="no-data-text">No se registraron datos en los sectores de <strong>{{ carbonTitle }}</strong> para el año <strong>{{ selectedYear }}</strong></p>
          </div>

          <!-- Donut + Badge -->
          <div v-else class="donut-main">
            <div class="donut-svg-container">
              <svg class="donut-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" stroke-width="12"/>
                <circle 
                  v-for="(sector, index) in carbonDonutPaths" 
                  :key="index"
                  cx="50" cy="50" r="38" 
                  fill="none" 
                  :stroke="sector.color"
                  stroke-width="12"
                  :stroke-dasharray="sector.dashArray"
                  :stroke-dashoffset="sector.dashOffset"
                  stroke-linecap="round"
                />
              </svg>
              <div class="donut-center">
                <span class="center-value red">{{ formatCurrency(carbonSectorsTotal) }}</span>
              </div>
            </div>
            <div class="donut-badge red">
              <div class="badge-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="badge-text">{{ carbonBadgeText }}</span>
            </div>
          </div>

          <!-- Components list -->
          <div v-if="carbonSectors.length > 0" class="components-list">
            <div v-for="(sector, index) in carbonSectors" :key="index" class="component-item">
              <div class="component-left">
                <span class="component-dot" :style="{ background: sector.color }"></span>
                <span class="component-name">{{ sector.label }}</span>
              </div>
              <div class="component-right">
                <span class="component-value">{{ formatCurrency(sector.value) }}</span>
                <span class="component-percent" :style="{ background: sector.color }">{{ getSectorPercent(sector.value, carbonSectorsTotal) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  cardType: { type: String, default: 'ingresos' },
  selectedYear: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  currency: { type: String, default: 'USD' },
  
  totalValue: { type: Number, default: 0 },
  referenceValue: { type: Number, default: 0 },
  
  sustainableValue: { type: Number, default: 0 },
  sustainablePercent: { type: Number, default: 0 },
  sustainablePosition: { type: Number, default: null },
  sustainableSectors: { type: Array, default: () => [] },
  
  carbonValue: { type: Number, default: 0 },
  carbonPercent: { type: Number, default: 0 },
  carbonPosition: { type: Number, default: null },
  carbonSectors: { type: Array, default: () => [] }
})

// ============================================
// ESTADO DE ACTIVACIÓN DE BARRAS
// ============================================
// Sostenible
const sustainableReferenceActive = ref(true)
const sustainableValueActive = ref(true)

// Carbono
const carbonTotalActive = ref(true)
const carbonValueActive = ref(true)

// Toggle functions
const toggleSustainableReference = () => {
  sustainableReferenceActive.value = !sustainableReferenceActive.value
}

const toggleSustainableValue = () => {
  sustainableValueActive.value = !sustainableValueActive.value
}

const toggleCarbonTotal = () => {
  carbonTotalActive.value = !carbonTotalActive.value
}

const toggleCarbonValue = () => {
  carbonValueActive.value = !carbonValueActive.value
}

// Clase dinámica para el contenedor de barras según cuántas están activas
const sustainableBarsClass = computed(() => {
  const count = (sustainableReferenceActive.value ? 1 : 0) + (sustainableValueActive.value ? 1 : 0)
  return `bars-count-${count}`
})

const carbonBarsClass = computed(() => {
  const count = (carbonTotalActive.value ? 1 : 0) + (carbonValueActive.value ? 1 : 0)
  return `bars-count-${count}`
})

// ============================================
// TÍTULOS
// ============================================
const mainTitle = computed(() => props.cardType === 'ingresos' ? 'Ingresos Regionales' : 'Presupuestos Regionales')
const totalLabel = computed(() => props.cardType === 'ingresos' ? 'Total' : 'Gasto Total')
const referenceLabel = computed(() => props.cardType === 'ingresos' ? 'Financiamiento Total' : 'Gasto Total')
const sustainableTitle = computed(() => props.cardType === 'ingresos' ? 'Ingresos Sostenibles' : 'Presupuesto Sostenible')
const carbonTitle = computed(() => props.cardType === 'ingresos' ? 'Ingresos Intensivos en Carbono' : 'Presupuestos Intensivos en Carbono')
const sustainableBarTitle = computed(() => props.cardType === 'ingresos' ? 'Financiamiento Total vs Ingresos Sostenibles' : 'Gasto Total vs Presupuesto Sostenible')
const carbonBarTitle = computed(() => props.cardType === 'ingresos' ? 'Ingreso Total vs Ingresos Intensivos en Carbono' : 'Gasto Total vs Presupuestos Intensivos en Carbono')
const sustainableBadgeText = computed(() => props.cardType === 'ingresos' ? 'INGRESOS\nSOSTENIBLES' : 'PRESUPUESTOS\nSOSTENIBLES')
const carbonBadgeText = computed(() => props.cardType === 'ingresos' ? 'INGRESOS\nINT. CARBONO' : 'PRESUPUESTOS\nINT. CARBONO')
const currencyLabel = computed(() => props.currency === 'USD' ? 'dólares estadounidenses (USD)' : 'pesos mexicanos (MXN)')

// ============================================
// TOTALES
// ============================================
const sustainableSectorsTotal = computed(() => props.sustainableSectors.reduce((acc, s) => acc + (s.value || 0), 0))
const carbonSectorsTotal = computed(() => props.carbonSectors.reduce((acc, s) => acc + (s.value || 0), 0))

// Max values para barras - DINÁMICOS según barras activas
const maxSustainableValue = computed(() => {
  const values = []
  if (sustainableReferenceActive.value) values.push(props.referenceValue)
  if (sustainableValueActive.value) values.push(props.sustainableValue)
  if (values.length === 0) return 1 // Evitar división por 0
  return Math.max(...values) * 1.25
})

const maxCarbonValue = computed(() => {
  const values = []
  if (carbonTotalActive.value) values.push(props.totalValue)
  if (carbonValueActive.value) values.push(props.carbonValue)
  if (values.length === 0) return 1 // Evitar división por 0
  return Math.max(...values) * 1.25
})

// Y-axis ticks
const yAxisTicksSustainable = computed(() => generateYAxisTicks(maxSustainableValue.value))
const yAxisTicksCarbon = computed(() => generateYAxisTicks(maxCarbonValue.value))

function generateYAxisTicks(max) {
  const step = max / 4
  return [max, step * 3, step * 2, step, 0]
}

// ============================================
// DONUT PATHS
// ============================================
const sustainableDonutPaths = computed(() => calculateDonutPaths(props.sustainableSectors, sustainableSectorsTotal.value))
const carbonDonutPaths = computed(() => calculateDonutPaths(props.carbonSectors, carbonSectorsTotal.value))

function calculateDonutPaths(sectors, total) {
  if (!sectors.length || total === 0) return []
  const circumference = 2 * Math.PI * 38
  let currentOffset = circumference * 0.25
  
  return sectors.map(sector => {
    const percent = (sector.value / total) * 100
    const dashLength = (percent / 100) * circumference
    const dashArray = `${dashLength} ${circumference - dashLength}`
    const dashOffset = currentOffset
    currentOffset -= dashLength
    return { ...sector, dashArray, dashOffset }
  })
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function getBarHeight(value, max) {
  if (!max || max === 0) return 0
  return Math.max((value / max) * 100, 2)
}

// Calcula el porcentaje relativo al total de referencia
function getSustainableBarPercent() {
  if (!props.referenceValue || props.referenceValue === 0) return '0.00'
  return ((props.sustainableValue / props.referenceValue) * 100).toFixed(2)
}

function getCarbonBarPercent() {
  if (!props.totalValue || props.totalValue === 0) return '0.00'
  return ((props.carbonValue / props.totalValue) * 100).toFixed(2)
}

function getSectorPercent(value, total) {
  if (!total || total === 0) return '0.00'
  return ((value / total) * 100).toFixed(2)
}

function formatCurrency(value) {
  if (!value || value === 0) return '$0'
  if (Math.abs(value) >= 1000000000) return `$${(value / 1000000000).toFixed(2)} B`
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)} M`
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(2)} K`
  return `$${value.toFixed(0)}`
}
</script>

<style scoped>
/* ============================================
   CARD CONTENEDORA PRINCIPAL
   ============================================ */
.main-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #1a365d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.main-card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #1a365d;
}

.main-card-title {
  font-size: 17px;
  font-weight: 400;
  color: #163C5F;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
}

/* Loading & Error */
.loading-state, .error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; color: #64748b; gap: 12px;
}
.spinner {
  width: 40px; height: 40px; border: 3px solid #e5e7eb;
  border-top-color: #1e3a5f; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================
   CONTENIDO CON 4 SUBCARDS
   ============================================ */
.main-card-content {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1.3fr 1fr;
  gap: 16px;
  padding: 16px;
}

/* ============================================
   SUBCARD BASE
   ============================================ */
.sub-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ============================================
   SUBCARD BARRAS
   ============================================ */
.sub-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  color: white;
}

.sub-header-icon {
  width: 26px; height: 26px; border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  display: flex; align-items: center; justify-content: center;
  color: #93c5fd;
}

.sub-header-text { flex: 1; }
.sub-header-title { font-size: 12px; font-weight: 600; }
.sub-header-subtitle { font-size: 9px; color: rgba(255, 255, 255, 0.6); }

.sub-card-body {
  padding: 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ============================================
   KPI CARDS CON TOGGLE
   ============================================ */
.kpi-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.kpi-card {
  padding: 10px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Estados activo/inactivo */
.kpi-card.active {
  opacity: 1;
}

.kpi-card.inactive {
  opacity: 0.4;
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
}

.kpi-card.gray.active { background: #f8fafc; border-color: #9ca3af; }
.kpi-card.green.active { background: linear-gradient(135deg, rgba(124, 179, 66, 0.08) 0%, rgba(124, 179, 66, 0.15) 100%); border-color: #7cb342; }
.kpi-card.red.active { background: linear-gradient(135deg, rgba(220, 20, 60, 0.08) 0%, rgba(220, 20, 60, 0.15) 100%); border-color: #DC143C; }

.kpi-dot {
  position: absolute; top: 10px; right: 10px;
  width: 10px; height: 10px; border-radius: 3px;
}
.kpi-dot.gray { background: #9ca3af; }
.kpi-dot.green { background: #7cb342; }
.kpi-dot.red { background: #DC143C; }

.kpi-value { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
.kpi-percent { font-size: 12px; font-weight: 500; }
.kpi-percent.green { color: #3f6212; }
.kpi-percent.red { color: #991b1b; }
.kpi-position { font-size: 11px; font-weight: 500; }
.kpi-position.green { color: #3f6212; }
.kpi-position.red { color: #991b1b; }
.kpi-label { font-size: 10px; color: #64748b; margin-top: 3px; }

.currency-legend { font-size: 10px; font-style: italic; color: #94a3b8; margin-bottom: 10px; }

/* ============================================
   CHART AREA
   ============================================ */
.chart-area {
  flex: 1;
  display: flex;
  position: relative;
  background: #fafbfc;
  border-radius: 8px;
  padding: 16px 24px 16px 55px;
  min-height: 200px;
}

.y-axis {
  position: absolute; left: 0; top: 16px; bottom: 16px; width: 50px;
  display: flex; flex-direction: column; justify-content: space-between;
}

.y-tick { font-size: 9px; color: #666; text-align: right; padding-right: 6px; }

.bars-container {
  flex: 1; display: flex; justify-content: center; align-items: flex-end;
  gap: 24px; padding: 0 16px; position: relative;
}

.grid-lines {
  position: absolute; top: 0; left: 55px; right: 24px; bottom: 0;
  display: flex; flex-direction: column; justify-content: space-between;
  pointer-events: none;
}

.grid-line { height: 1px; background: #e5e7eb; }

/* Clases dinámicas para ancho de barras */
.bars-container.bars-count-1 .bar-column {
  width: 350px;
  max-width: 350px;
}

.bars-container.bars-count-2 .bar-column {
  width: 200px;
  max-width: 220px;
}

.bar-column {
  display: flex; flex-direction: column; align-items: center;
  height: 100%; justify-content: flex-end;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.bar-value-label { font-size: 11px; font-weight: 600; margin-bottom: 5px; }
.bar-value-label.gray { color: #6b7280; }
.bar-value-label.green { color: #558b2f; }
.bar-value-label.red { color: #b91c1c; }

.bar {
  width: 100%; border-radius: 8px 8px 0 0;
  display: flex; align-items: flex-end; justify-content: center;
  padding-bottom: 8px; min-height: 8px;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar.gray { background: linear-gradient(to top, #6b7280 0%, #9ca3af 100%); }
.bar.green { background: linear-gradient(to top, #65a30d 0%, #7cb342 100%); }
.bar.red { background: linear-gradient(to top, #b91c1c 0%, #DC143C 100%); }

.bar-percent { font-size: 11px; font-weight: 700; color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); }

/* Empty state */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
}

/* ============================================
   SUBCARD DONAS
   ============================================ */
.donut-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px 8px 0 0;
  color: white;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
}

.donut-header-icon {
  width: 22px; height: 22px; border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  display: flex; align-items: center; justify-content: center;
}

.donut-header-icon.green { color: #86efac; }
.donut-header-icon.red { color: #fca5a5; }

.donut-content {
  flex: 1; display: flex; flex-direction: column;
  padding: 14px; background: white;
}

/* Distribution bar */
.donut-summary { margin-bottom: 12px; }
.summary-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 6px;
}
.summary-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; }
.summary-value { font-size: 14px; font-weight: 700; }
.summary-value.green { color: #166534; }
.summary-value.red { color: #dc2626; }

.distribution-bar {
  display: flex; height: 12px; border-radius: 6px; overflow: hidden; background: #e5e7eb;
}
.distribution-segment { height: 100%; transition: width 0.4s ease; }

.currency-legend-donut {
  font-size: 10px; font-style: italic; color: #94a3b8; margin-bottom: 12px;
}

/* Donut + Badge */
.donut-main {
  display: flex; align-items: center; justify-content: center; gap: 14px;
  padding: 12px 0; flex: 1;
}

.donut-svg-container { position: relative; width: 100px; height: 100px; }
.donut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }

.donut-center {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  text-align: center;
}
.center-value { font-size: 13px; font-weight: 700; }
.center-value.green { color: #166534; }
.center-value.red { color: #dc2626; }

.donut-badge {
  padding: 12px 10px; border-radius: 12px; text-align: center;
}
.donut-badge.green { background: #f0fdf4; border: 1px solid #86efac; }
.donut-badge.red { background: #fef2f2; border: 1px solid #fca5a5; }

.badge-icon {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 8px;
}
.donut-badge.green .badge-icon { background: linear-gradient(135deg, #166534, #22c55e); color: white; }
.donut-badge.red .badge-icon { background: linear-gradient(135deg, #991b1b, #ef4444); color: white; }

.badge-text {
  font-size: 8px; font-weight: 700; text-transform: uppercase;
  line-height: 1.3; white-space: pre-line;
}
.donut-badge.green .badge-text { color: #166534; }
.donut-badge.red .badge-text { color: #991b1b; }

/* Components List */
.components-list { display: flex; flex-direction: column; gap: 6px; }

.component-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 10px; background: #f8fafc; border-radius: 8px;
  transition: all 0.2s ease;
}
.component-item:hover { background: #f1f5f9; }

.component-left { display: flex; align-items: center; gap: 8px; }
.component-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.component-name { font-size: 10px; font-weight: 500; color: #374151; }

.component-right { display: flex; align-items: center; gap: 8px; }
.component-value { font-size: 11px; font-weight: 600; color: #1e293b; }
.component-percent {
  font-size: 9px; font-weight: 600; color: white;
  padding: 3px 8px; border-radius: 10px; min-width: 50px; text-align: center;
}

/* No data state */
.no-data-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  padding: 20px; text-align: center;
}
.no-data-state.green { color: #166534; }
.no-data-state.red { color: #991b1b; }
.no-data-icon { opacity: 0.5; }
.no-data-title { font-size: 13px; font-weight: 600; margin: 0; }
.no-data-text { font-size: 11px; color: #64748b; margin: 0; }
.no-data-text strong { color: inherit; }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1400px) {
  .main-card-content { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 900px) {
  .main-card-content { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .kpi-cards-row { grid-template-columns: 1fr; }
  .chart-area { min-height: 160px; padding: 12px 16px 12px 45px; }
  .bar-column { width: 60px !important; }
  .donut-main { flex-direction: column; }
}
</style>