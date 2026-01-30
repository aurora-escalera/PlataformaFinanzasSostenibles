<!-- src/modules/qualitativeRegionalIndicators/AmbientalesRegionalView.vue -->
<!-- ✅ REDISEÑADO: Estilo limpio con dos cards y gráficas de dona -->
<template>
  <div class="ambientales-container">
    <!-- ✅ LOADING STATE mientras carga años -->
    <div v-if="!yearsLoaded" class="global-empty-state">
      <div class="empty-state-content">
        <div class="spinner"></div>
        <p class="empty-state-description">Cargando información...</p>
      </div>
    </div>

    <!-- ✅ EMPTY STATE cuando no hay año o año inválido -->
    <div v-else-if="!selectedYear || !isYearValid" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <h2 class="empty-state-title">
          {{ !selectedYear ? 'Selecciona un año' : 'Año no disponible' }}
        </h2>
        <p class="empty-state-description">
          {{ !selectedYear 
            ? 'Selecciona un año en el filtro superior para visualizar los indicadores ambientales.' 
            : `El año ${selectedYear} no tiene datos disponibles. Años disponibles: ${validYears.join(', ')}` 
          }}
        </p>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div v-else class="cards-wrapper" :class="{ 'animate-in': isAnimating }">
      
      <!-- ================================ -->
      <!-- CARD 1: INDICADORES AMBIENTALES -->
      <!-- ================================ -->
      <div class="main-card">
        <!-- HEADER -->
        <div class="card-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <span class="header-title">Indicadores Ambientales</span>
        </div>

        <!-- BODY -->
        <div v-if="loading" class="card-body loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else class="card-body">
          <!-- IRC - Índice de Riesgo Climático -->
          <div class="indicator-row">
            <div class="indicator-icon-box irc">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Índice de Riesgo Climático (IRC)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill irc" :style="{ width: isAnimating ? getIRCBarWidth(countryData?.IRC) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount irc">{{ countryData?.IRC || '—' }}</span>
              <span class="value-unit">puntos</span>
            </div>
          </div>

          <!-- TARN - Tasa de Agotamiento -->
          <div class="indicator-row">
            <div class="indicator-icon-box tarn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Tasa Agotamiento Recursos Naturales (TARN)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill tarn" :style="{ width: isAnimating ? Math.min(countryData?.TARN || 0, 100) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount tarn">{{ countryData?.TARN || '—' }}%</span>
              <span class="value-unit">del GNI</span>
            </div>
          </div>

          <!-- ECO2 - Emisiones CO2 -->
          <div class="indicator-row">
            <div class="indicator-icon-box eco2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Emisiones Anuales CO₂ (ECO2)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill eco2" :style="{ width: isAnimating ? '75%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount eco2">{{ formatEmissions(countryData?.ECO2) }}</span>
              <span class="value-unit">Mt CO₂</span>
            </div>
          </div>

          <!-- ECO2PC - Emisiones per cápita -->
          <div class="indicator-row">
            <div class="indicator-icon-box eco2pc">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Emisiones CO₂ per Cápita (ECO2PC)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill eco2pc" :style="{ width: isAnimating ? getCO2PCBarWidth(countryData?.ECO2PC) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount eco2pc">{{ countryData?.ECO2PC || '—' }}</span>
              <span class="value-unit">t CO₂/hab</span>
            </div>
          </div>

          <!-- CTE - Consumo Total Energía -->
          <div class="indicator-row">
            <div class="indicator-icon-box cte">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Consumo Total de Energía (CTE)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill cte" :style="{ width: isAnimating ? getCTEBarWidth(countryData?.CTE) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount cte">{{ countryData?.CTE || '—' }}</span>
              <span class="value-unit">MWh/hab</span>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="card-footer">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Fuentes: Germanwatch, Banco Mundial, IEA {{ selectedYear }}</span>
        </div>
      </div>

      <!-- ================================ -->
      <!-- CARD 2: GRÁFICAS (GEI + ENERGÍA) -->
      <!-- ================================ -->
      <div class="main-card charts-card">
        <!-- HEADER -->
        <div class="card-header charts-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <span class="header-title">Distribución por Sectores</span>
        </div>

        <!-- BODY -->
        <div v-if="loading" class="card-body loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else class="card-body charts-body">
          
          <!-- SECCIÓN GEI -->
          <div class="chart-section">
            <div class="chart-section-title">Emisiones GEI por Sector</div>
            <div class="chart-row">
              <div class="donut-container">
                <svg :width="donutSize" :height="donutSize" :viewBox="`0 0 ${donutSize} ${donutSize}`">
                  <circle :cx="donutSize/2" :cy="donutSize/2" :r="donutRadius" fill="none" stroke="#e2e8f0" :stroke-width="strokeWidth"/>
                  <path v-for="(segment, index) in geiArcs" :key="'gei-'+index" :d="segment.path" fill="none" :stroke="segment.color" :stroke-width="strokeWidth"/>
                </svg>
                <div class="donut-center">
                  <span class="donut-center-text">GEI</span>
                </div>
              </div>
              <div class="chart-legend">
                <div v-for="item in geiLegend" :key="item.key" class="legend-row">
                  <div class="legend-dot" :style="{ background: item.color }"></div>
                  <span class="legend-label">{{ item.label }}</span>
                  <span class="legend-value" :style="{ color: item.color }">{{ item.value }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="charts-divider"></div>

          <!-- SECCIÓN MATRIZ ENERGÉTICA -->
          <div class="chart-section">
            <div class="chart-section-title">Matriz Energética</div>
            <div class="chart-row">
              <div class="donut-container">
                <svg :width="energyDonutSize" :height="energyDonutSize" :viewBox="`0 0 ${energyDonutSize} ${energyDonutSize}`">
                  <circle :cx="energyDonutSize/2" :cy="energyDonutSize/2" :r="energyDonutRadius" fill="none" stroke="#e2e8f0" :stroke-width="energyStrokeWidth"/>
                  <path v-for="(segment, index) in energyArcs" :key="'energy-'+index" :d="segment.path" fill="none" :stroke="segment.color" :stroke-width="energyStrokeWidth"/>
                </svg>
                <div class="donut-center energy-center">
                  <span class="donut-center-value" :style="{ color: '#ef4444' }">{{ countryData?.CCF || '—' }}%</span>
                  <span class="donut-center-label">Fósil</span>
                </div>
              </div>
              <div class="chart-legend energy-legend">
                <div class="legend-row">
                  <div class="legend-dot fossil"></div>
                  <span class="legend-label">Combustibles fósiles (CCF)</span>
                  <span class="legend-value fossil">{{ countryData?.CCF || '—' }}%</span>
                </div>
                <div class="energy-bar-full">
                  <div class="energy-bar-fill fossil" :style="{ width: (countryData?.CCF || 0) + '%' }"></div>
                </div>
                <div class="legend-row">
                  <div class="legend-dot renewable"></div>
                  <span class="legend-label">Energías renovables (CER)</span>
                  <span class="legend-value renewable">{{ countryData?.CER || '—' }}%</span>
                </div>
                <div class="energy-bar-full renewable-track">
                  <div class="energy-bar-fill renewable" :style="{ width: (countryData?.CER || 0) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="card-footer">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>{{ countryData?.País || 'México' }} {{ selectedYear }} | Fuente: IEA</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'

const props = defineProps({
  selectedYear: { type: [String, Number], default: null },
  selectedCountry: { type: String, default: 'México' }
})

const emit = defineEmits(['back', 'years-loaded'])

const { fetchRegionalData, fetchRegionalSheetNames } = useStorageData()
const rawData = ref([])
const loading = ref(false)
const error = ref(null)
const isAnimating = ref(false)

// Estado de años válidos
const validYears = ref([])
const yearsLoaded = ref(false)

// Donut config GEI
const donutSize = 90
const strokeWidth = 12
const donutRadius = (donutSize - strokeWidth) / 2

// Donut config Energía
const energyDonutSize = 90
const energyStrokeWidth = 12
const energyDonutRadius = (energyDonutSize - energyStrokeWidth) / 2

// Colores GEI
const geiColors = {
  energy: '#0F3759',
  agriculture: '#2563eb',
  industrial: '#60a5fa',
  waste: '#93c5fd'
}

const countryData = computed(() => {
  if (rawData.value.length === 0) return null
  const found = rawData.value.find(row => row['País']?.toLowerCase() === props.selectedCountry?.toLowerCase())
  return found || rawData.value[0]
})

// Computed para validar año
const isYearValid = computed(() => {
  if (!yearsLoaded.value) return false
  if (!props.selectedYear) return false
  const yearStr = String(props.selectedYear)
  return validYears.value.some(y => String(y) === yearStr)
})

// ============================================
// FUNCIONES DE FORMATO Y CÁLCULO
// ============================================

const formatEmissions = (value) => {
  if (!value || value === '—') return '—'
  const num = Number(value)
  if (isNaN(num)) return value
  if (num >= 1e9) return (num / 1e9).toFixed(1)
  if (num >= 1e6) return (num / 1e6).toFixed(1)
  if (num >= 1e3) return (num / 1e3).toFixed(1)
  return num.toLocaleString('es-MX')
}

const getIRCBarWidth = (value) => {
  const num = Number(value) || 0
  // IRC máximo aprox 200
  return Math.min((num / 200) * 100, 100)
}

const getCO2PCBarWidth = (value) => {
  const num = Number(value) || 0
  // CO2 per cápita máximo aprox 20 toneladas
  return Math.min((num / 20) * 100, 100)
}

const getCTEBarWidth = (value) => {
  const num = Number(value) || 0
  // CTE máximo aprox 15 MWh/hab
  return Math.min((num / 15) * 100, 100)
}

// ============================================
// DATOS PARA GRÁFICAS
// ============================================

const geiLegend = computed(() => [
  { key: 'energy', label: 'Energía', value: countryData.value?.GEI_EN || 0, color: geiColors.energy },
  { key: 'agriculture', label: 'Agricultura', value: countryData.value?.GEI_AGUT || 0, color: geiColors.agriculture },
  { key: 'industrial', label: 'Industrial', value: countryData.value?.GEI_PI || 0, color: geiColors.industrial },
  { key: 'waste', label: 'Residuos', value: countryData.value?.GEI_RE || 0, color: geiColors.waste }
])

// Funciones para arcos SVG
const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}

const geiArcs = computed(() => {
  const data = geiLegend.value.filter(item => Number(item.value) > 0)
  const total = data.reduce((sum, item) => sum + Number(item.value), 0)
  if (total === 0) return []
  
  const cx = donutSize / 2
  const cy = donutSize / 2
  let currentAngle = 0
  
  return data.map((item) => {
    const percentage = Number(item.value) / total
    const sweepAngle = percentage * 360
    const startAngle = currentAngle
    const endAngle = startAngle + sweepAngle
    currentAngle = endAngle
    
    return {
      path: describeArc(cx, cy, donutRadius, startAngle, endAngle),
      color: item.color
    }
  })
})

const energyArcs = computed(() => {
  const ccf = Number(countryData.value?.CCF) || 0
  const cer = Number(countryData.value?.CER) || 0
  const total = ccf + cer
  if (total === 0) return []
  
  const cx = energyDonutSize / 2
  const cy = energyDonutSize / 2
  const data = [
    { value: ccf, color: '#ef4444' },
    { value: cer, color: '#22c55e' }
  ].filter(item => item.value > 0)
  
  let currentAngle = 0
  
  return data.map((item) => {
    const percentage = item.value / total
    const sweepAngle = percentage * 360
    const startAngle = currentAngle
    const endAngle = startAngle + sweepAngle
    currentAngle = endAngle
    
    return {
      path: describeArc(cx, cy, energyDonutRadius, startAngle, endAngle),
      color: item.color
    }
  })
})

const triggerAnimation = () => {
  isAnimating.value = false
  nextTick(() => {
    setTimeout(() => {
      isAnimating.value = true
    }, 150)
  })
}

// ============================================
// CARGA DE DATOS
// ============================================

const loadValidYears = async () => {
  try {
    console.log('📅 [AmbientalesRegionalView] Cargando años válidos...')
    const sheetNames = await fetchRegionalSheetNames('ambientalesRegional')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => Number(b) - Number(a))
    
    validYears.value = years
    yearsLoaded.value = true
    
    console.log('📅 [AmbientalesRegionalView] Años válidos:', years)
    
    if (years.length > 0) {
      console.log('📤 [AmbientalesRegionalView] Emitiendo años al padre:', years)
      emit('years-loaded', years)
    }
    
    return years
  } catch (err) {
    console.error('❌ [AmbientalesRegionalView] Error cargando años:', err)
    yearsLoaded.value = true
    return []
  }
}

const loadData = async () => {
  if (!props.selectedYear) return
  if (!yearsLoaded.value) return
  
  const yearStr = String(props.selectedYear)
  
  if (!validYears.value.some(y => String(y) === yearStr)) {
    console.warn(`⚠️ [AmbientalesRegionalView] Año ${yearStr} no disponible`)
    return
  }
  
  loading.value = true
  isAnimating.value = false
  
  try {
    console.log(`📊 [AmbientalesRegionalView] Cargando datos para año: ${yearStr}`)
    const data = await fetchRegionalData('ambientalesRegional', yearStr)
    if (data && data.length > 0) {
      rawData.value = data
      console.log(`✅ [AmbientalesRegionalView] Datos cargados: ${data.length} registros`)
      triggerAnimation()
    }
  } catch (err) {
    console.error('❌ [AmbientalesRegionalView] Error:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// ============================================
// WATCHERS
// ============================================

watch(() => props.selectedYear, async (newYear) => {
  if (newYear && yearsLoaded.value) {
    rawData.value = []
    await loadData()
  }
}, { immediate: false })

watch(yearsLoaded, (loaded) => {
  if (loaded && props.selectedYear && isYearValid.value) {
    loadData()
  }
})

// ============================================
// LIFECYCLE
// ============================================

onMounted(async () => {
  console.log('🚀 [AmbientalesRegionalView] Montado con año:', props.selectedYear)
  await loadValidYears()
  if (props.selectedYear && isYearValid.value) {
    await loadData()
  }
})
</script>

<style scoped>
.ambientales-container {
  background-color: #f8fafc;
  border-radius: 12px;
  height: 100%;
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* Empty State */
.global-empty-state { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  height: 100%; 
  background: white; 
  border-radius: 16px; 
}

.empty-state-content { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  text-align: center; 
  max-width: 280px; 
}

.empty-state-icon { 
  width: 64px; 
  height: 64px; 
  margin-bottom: 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%); 
  border-radius: 50%; 
}

.empty-state-title { 
  font-size: 15px; 
  font-weight: 600; 
  color: #2d3748; 
  margin: 0 0 6px 0; 
}

.empty-state-description { 
  font-size: 12px; 
  color: #718096; 
  margin: 0; 
  line-height: 1.4; 
}

.spinner { 
  width: 30px; 
  height: 30px; 
  border: 3px solid #e2e8f0; 
  border-top-color: #0F3759; 
  border-radius: 50%; 
  animation: spin 1s linear infinite; 
  margin-bottom: 12px; 
}

/* Cards Wrapper */
.cards-wrapper {
  display: flex;
  gap: 16px;
  height: 100%;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.cards-wrapper.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Main Card */
.main-card { 
  background: white; 
  border-radius: 16px; 
  flex: 1;
  display: flex; 
  flex-direction: column; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); 
  overflow: hidden;
}

.charts-card {
  flex: 0.9;
}

/* Header */
.card-header { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 14px 18px; 
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); 
  flex-shrink: 0; 
}

.charts-header {
  background: linear-gradient(135deg, #1a4d7a 0%, #2d5f8a 100%);
}

.header-icon { 
  width: 36px; 
  height: 36px; 
  border-radius: 10px; 
  background: rgba(255, 255, 255, 0.15); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
}

.header-title { 
  flex: 1; 
  font-size: 14px; 
  font-weight: 600; 
  color: white; 
}

/* Body */
.card-body { 
  flex: 1; 
  padding: 12px 14px; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  gap: 8px; 
  overflow: hidden; 
}

.charts-body {
  gap: 12px;
  justify-content: flex-start;
}

/* ================================ */
/* INDICATOR ROW */
/* ================================ */
.indicator-row { 
  display: flex; 
  align-items: center; 
  gap: 14px; 
  padding: 12px 14px; 
  background: #f8fafc; 
  border-radius: 12px; 
}

.indicator-icon-box { 
  width: 40px; 
  height: 40px; 
  border-radius: 10px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
}

.indicator-icon-box.irc { background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); }
.indicator-icon-box.tarn { background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); }
.indicator-icon-box.eco2 { background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); }
.indicator-icon-box.eco2pc { background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); }
.indicator-icon-box.cte { background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); }

.indicator-info { 
  flex: 1; 
  min-width: 0; 
  display: flex; 
  flex-direction: column; 
  gap: 5px; 
}

.indicator-name { 
  font-size: 11px; 
  font-weight: 600; 
  color: #1e293b; 
  line-height: 1.3; 
}

.indicator-bar { 
  height: 5px; 
  background: #e2e8f0; 
  border-radius: 3px; 
  overflow: hidden; 
  max-width: 140px; 
}

.indicator-bar-fill { 
  height: 100%; 
  border-radius: 3px; 
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); 
}

.indicator-bar-fill.irc { background: #0F3759; }
.indicator-bar-fill.tarn { background: #0F3759; }
.indicator-bar-fill.eco2 { background: #0F3759; }
.indicator-bar-fill.eco2pc { background: #0F3759; }
.indicator-bar-fill.cte { background: #0F3759; }

.indicator-value { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-end; 
  min-width: 70px; 
}

.value-amount { 
  font-size: 18px; 
  font-weight: 800; 
  color: #0F3759; 
  line-height: 1; 
}

.value-amount.irc { color: #0F3759; }
.value-amount.tarn { color: #0F3759; }
.value-amount.eco2 { color: #0F3759; }
.value-amount.eco2pc { color: #0F3759; }
.value-amount.cte { color: #0F3759; }

.value-unit { 
  font-size: 9px; 
  color: #94a3b8; 
  font-weight: 500;
}

/* ================================ */
/* CHART SECTIONS */
/* ================================ */
.chart-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
}

.chart-section-title {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  text-align: center;
}

.chart-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.charts-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}

/* Donut Container */
.donut-container {
  position: relative;
  flex-shrink: 0;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-center-text {
  font-size: 14px;
  font-weight: 700;
  color: #0F3759;
}

.donut-center-value {
  font-size: 14px;
  font-weight: 800;
  display: block;
  line-height: 1;
}

.donut-center-label {
  font-size: 8px;
  color: #64748b;
  font-weight: 500;
}

/* Chart Legend */
.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-dot.fossil { background: #ef4444; }
.legend-dot.renewable { background: #22c55e; }

.legend-label {
  flex: 1;
  font-size: 11px;
  color: #475569;
  font-weight: 500;
}

.legend-value {
  font-size: 12px;
  font-weight: 700;
  min-width: 40px;
  text-align: right;
}

.legend-value.fossil { color: #dc2626; }
.legend-value.renewable { color: #16a34a; }

/* Energy Bars */
.energy-legend {
  gap: 4px;
}

.energy-bar-full {
  height: 5px;
  background: #fee2e2;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.energy-bar-full.renewable-track {
  background: #dcfce7;
}

.energy-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease-out;
}

.energy-bar-fill.fossil { background: #ef4444; }
.energy-bar-fill.renewable { background: #22c55e; }

/* Footer */
.card-footer { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 6px; 
  padding: 12px 18px; 
  background: #f8fafc; 
  border-top: 1px solid #f1f5f9; 
  flex-shrink: 0; 
  color: #94a3b8; 
}

.card-footer span { 
  font-size: 11px; 
}

/* Loading State */
.loading-state { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex: 1; 
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

/* Responsive */
@media (max-width: 900px) {
  .cards-wrapper {
    flex-direction: column;
  }
  
  .charts-card {
    flex: 1;
  }
}
</style>