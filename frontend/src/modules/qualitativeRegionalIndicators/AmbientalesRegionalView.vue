<!-- src/modules/qualitativeIndicators/components/AmbientalesRegionalView.vue -->
<template>
  <div class="ambientales-container">
    <!-- EMPTY STATE -->
    <div v-if="!selectedYear" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Selecciona un año</h2>
        <p class="empty-state-description">Selecciona un año en el filtro superior para visualizar los indicadores ambientales.</p>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div v-else class="card-body">
      <!-- HEADER PRINCIPAL -->
      <div class="main-header">
        <div class="header-icon-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <span class="header-title">Indicadores Ambientales {{ selectedYear }}</span>
        <span class="header-subtitle">{{ countryData?.País || 'México' }}</span>
      </div>

      <!-- FILA SUPERIOR -->
      <div class="top-row">
        <!-- RIESGO CLIMÁTICO -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <span class="section-title">Riesgo Climático</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content irc-content">
            <div class="irc-main">
              <div class="irc-value-container">
                <span class="irc-big-value">{{ countryData?.IRC || '—' }}</span>
                <span class="irc-label">Índice IRC</span>
              </div>
            </div>
            <div class="irc-source">Germanwatch, 2022</div>
          </div>
        </div>

        <!-- RECURSOS NATURALES -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="section-title">Recursos Naturales</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content recursos-content">
            <div class="recursos-row">
              <div class="recursos-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div class="recursos-data">
                <div class="recursos-header">
                  <span class="recursos-label">TARN</span>
                  <span class="recursos-value">{{ countryData?.TARN || '—' }}%</span>
                </div>
                <div class="recursos-bar"><div class="recursos-bar-fill" :style="{ width: Math.min(countryData?.TARN || 0, 100) + '%' }"></div></div>
              </div>
            </div>
            <div class="recursos-row">
              <div class="recursos-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div class="recursos-data">
                <div class="recursos-header">
                  <span class="recursos-label">CTE</span>
                  <span class="recursos-value">{{ countryData?.CTE || '—' }} MWh</span>
                </div>
                <div class="recursos-bar"><div class="recursos-bar-fill cte" :style="{ width: Math.min((countryData?.CTE || 0) / 10, 100) + '%' }"></div></div>
              </div>
            </div>
            <div class="recursos-source">Banco Mundial / IEA, 2021-2022</div>
          </div>
        </div>

        <!-- EMISIONES CO2 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M8 12h8M12 8v8"/>
                </svg>
              </div>
              <span class="section-title">Emisiones CO₂</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content co2-content">
            <div class="co2-grid">
              <div class="co2-card">
                <div class="co2-icon-bg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="2">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                </div>
                <span class="co2-value">{{ formatNumber(countryData?.ECO2) }}</span>
                <span class="co2-unit">Mt CO₂</span>
              </div>
              <div class="co2-card">
                <div class="co2-icon-bg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <span class="co2-value">{{ countryData?.ECO2PC || '—' }}</span>
                <span class="co2-unit">t CO₂/hab</span>
              </div>
            </div>
            <div class="co2-source">IEA, 2022</div>
          </div>
        </div>
      </div>

      <!-- FILA INFERIOR -->
      <div class="bottom-row">
        <!-- GEI POR SECTOR -->
        <div class="section-card gei-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <span class="section-title">Emisiones GEI por Sector</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content gei-content">
            <div class="gei-donut-container">
              <svg :width="donutSize" :height="donutSize" :viewBox="`0 0 ${donutSize} ${donutSize}`">
                <circle :cx="donutSize/2" :cy="donutSize/2" :r="donutRadius" fill="none" stroke="#e2e8f0" :stroke-width="strokeWidth"/>
                <path v-for="(segment, index) in geiArcs" :key="index" :d="segment.path" fill="none" :stroke="segment.color" :stroke-width="strokeWidth"/>
              </svg>
              <div class="gei-donut-center"><span class="gei-center-text">GEI</span></div>
            </div>
            <div class="gei-bars">
              <div v-for="item in geiLegend" :key="item.label" class="gei-bar-row">
                <div class="gei-bar-icon" :style="{ background: item.color }"></div>
                <span class="gei-bar-label">{{ item.label }}</span>
                <div class="gei-bar-track">
                  <div class="gei-bar-fill" :style="{ width: item.value + '%', background: item.color }"></div>
                </div>
                <span class="gei-bar-value">{{ item.value }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- MATRIZ ENERGÉTICA -->
        <div class="section-card energy-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <span class="section-title">Matriz Energética</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content energy-content">
            <div class="energy-donut-wrapper">
              <svg :width="energyDonutSize" :height="energyDonutSize" :viewBox="`0 0 ${energyDonutSize} ${energyDonutSize}`">
                <circle :cx="energyDonutSize/2" :cy="energyDonutSize/2" :r="energyDonutRadius" fill="none" stroke="#e2e8f0" :stroke-width="energyStrokeWidth"/>
                <path v-for="(segment, index) in energyArcs" :key="index" :d="segment.path" fill="none" :stroke="segment.color" :stroke-width="energyStrokeWidth"/>
              </svg>
              <div class="energy-donut-center">
                <span class="energy-center-value">{{ countryData?.CCF || '—' }}%</span>
                <span class="energy-center-label">Fósil</span>
              </div>
            </div>
            <div class="energy-bars-container">
              <div class="energy-bar-row">
                <div class="energy-bar-dot fossil"></div>
                <span class="energy-bar-label">Combustibles fósiles</span>
                <span class="energy-bar-value fossil">{{ countryData?.CCF || '—' }}%</span>
              </div>
              <div class="energy-bar-track-full fossil">
                <div class="energy-bar-fill-full fossil" :style="{ width: (countryData?.CCF || 0) + '%' }"></div>
              </div>
              <div class="energy-bar-row">
                <div class="energy-bar-dot renewable"></div>
                <span class="energy-bar-label">Energías renovables</span>
                <span class="energy-bar-value renewable">{{ countryData?.CER || '—' }}%</span>
              </div>
              <div class="energy-bar-track-full renewable">
                <div class="energy-bar-fill-full renewable" :style="{ width: (countryData?.CER || 0) + '%' }"></div>
              </div>
            </div>
            <div class="energy-source">IEA, 2022</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'

const props = defineProps({
  selectedYear: { type: [String, Number], default: null },
  selectedCountry: { type: String, default: 'México' }
})

const { fetchRegionalData, fetchRegionalSheetNames } = useStorageData()
const rawData = ref([])
const loading = ref(false)
const error = ref(null)
const availableYears = ref([])

// Donut config GEI
const donutSize = 100
const strokeWidth = 14
const donutRadius = (donutSize - strokeWidth) / 2

// Donut config Energía
const energyDonutSize = 80
const energyStrokeWidth = 12
const energyDonutRadius = (energyDonutSize - energyStrokeWidth) / 2

// Colores GEI - VARIACIONES DE AZUL
const geiColors = {
  energy: '#0F3759',      // Azul muy oscuro
  agriculture: '#2563eb', // Azul medio
  industrial: '#60a5fa',  // Azul claro
  waste: '#93c5fd'        // Azul muy claro
}

const countryData = computed(() => {
  if (rawData.value.length === 0) return null
  const found = rawData.value.find(row => row['País']?.toLowerCase() === props.selectedCountry?.toLowerCase())
  return found || rawData.value[0]
})

const geiLegend = computed(() => [
  { label: 'Energía', value: countryData.value?.GEI_EN || 0, color: geiColors.energy },
  { label: 'Agricultura', value: countryData.value?.GEI_AGUT || 0, color: geiColors.agriculture },
  { label: 'Industrial', value: countryData.value?.GEI_PI || 0, color: geiColors.industrial },
  { label: 'Residuos', value: countryData.value?.GEI_RE || 0, color: geiColors.waste }
])

// Función para crear arcos SVG
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

const formatNumber = (value) => {
  if (!value || value === '—') return '—'
  const num = Number(value)
  if (isNaN(num)) return value
  if (num >= 1000000000) return (num / 1000000000).toFixed(1)
  if (num >= 1000000) return (num / 1000000).toFixed(1)
  return num.toLocaleString()
}

const isDataLoaded = ref(false)
const currentLoadedYear = ref(null)

const loadAvailableYears = async () => {
  try {
    const sheetNames = await fetchRegionalSheetNames('ambientalesRegional')
    const years = sheetNames.filter(name => /^\d{4}$/.test(name)).sort((a, b) => Number(b) - Number(a))
    availableYears.value = years
    return years
  } catch (err) { return [] }
}

const loadData = async (forceReload = false) => {
  if (!props.selectedYear) return
  const yearStr = String(props.selectedYear)
  if (availableYears.value.length > 0 && !availableYears.value.includes(yearStr)) return
  if (!forceReload && isDataLoaded.value && currentLoadedYear.value === yearStr) return
  if (loading.value) return
  loading.value = true
  try {
    const data = await fetchRegionalData('ambientalesRegional', yearStr)
    if (data && data.length > 0) {
      rawData.value = data
      isDataLoaded.value = true
      currentLoadedYear.value = yearStr
    }
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

watch(() => props.selectedYear, async (newYear) => {
  if (newYear) {
    const yearStr = String(newYear)
    if (yearStr !== currentLoadedYear.value) {
      rawData.value = []
      isDataLoaded.value = false
      if (availableYears.value.length === 0) await loadAvailableYears()
      await loadData()
    }
  }
}, { immediate: true })

onMounted(async () => {
  await loadAvailableYears()
  if (props.selectedYear) await loadData()
})
</script>

<style scoped>
.ambientales-container {
  background-color: white;
  border-radius: 15px;
  height: 100%;
  width: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.global-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 280px;
}

.empty-state-icon {
  width: 70px;
  height: 70px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 50%;
}

.empty-state-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 6px 0;
}

.empty-state-description {
  font-size: 13px;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.main-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  flex-shrink: 0;
}

.header-icon-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-title {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.header-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: auto;
}

.top-row {
  display: flex;
  gap: 6px;
  height: 36%;
  min-height: 0;
}

.bottom-row {
  display: flex;
  gap: 6px;
  flex: 1;
  min-height: 0;
}

.section-card {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.gei-card {
  flex: 1.2;
}

.energy-card {
  flex: 0.8;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  flex-shrink: 0;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon-badge {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.section-value {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.section-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.irc-content {
  background: #f8fafc;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.irc-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.irc-value-container {
  text-align: center;
}

.irc-big-value {
  font-size: 36px;
  font-weight: 800;
  color: #0F3759;
  display: block;
  line-height: 1;
}

.irc-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 500;
}

.irc-source {
  font-size: 10px;
  color: #94a3b8;
}

.recursos-content {
  background: #f8fafc;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recursos-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 6px;
  padding: 8px 10px;
  border: 1px solid #f1f5f9;
}

.recursos-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.recursos-data {
  flex: 1;
  min-width: 0;
}

.recursos-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.recursos-label {
  font-size: 12px;
  font-weight: 600;
  color: #0F3759;
}

.recursos-value {
  font-size: 13px;
  font-weight: 700;
  color: #0F3759;
}

.recursos-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.recursos-bar-fill {
  height: 100%;
  background: #0F3759;
  border-radius: 3px;
  transition: width 0.8s ease-out;
}

.recursos-bar-fill.cte {
  background: #2563eb;
}

.recursos-source {
  font-size: 9px;
  color: #94a3b8;
  text-align: center;
  margin-top: auto;
}

.co2-content {
  background: #f8fafc;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.co2-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  flex: 1;
}

.co2-card {
  background: white;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.co2-icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e8f4fc 0%, #d1e9f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.co2-value {
  font-size: 20px;
  font-weight: 700;
  color: #0F3759;
}

.co2-unit {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 500;
}

.co2-source {
  font-size: 9px;
  color: #94a3b8;
  margin-top: 4px;
}

.gei-content {
  background: white;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.gei-donut-container {
  position: relative;
  flex-shrink: 0;
}

.gei-donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.gei-center-text {
  font-size: 16px;
  font-weight: 700;
  color: #0F3759;
}

.gei-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.gei-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gei-bar-icon {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.gei-bar-label {
  width: 80px;
  font-size: 12px;
  color: #475569;
  flex-shrink: 0;
  font-weight: 500;
}

.gei-bar-track {
  flex: 1;
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
}

.gei-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.8s ease-out;
}

.gei-bar-value {
  width: 45px;
  font-size: 13px;
  font-weight: 700;
  color: #0F3759;
  text-align: right;
}

.energy-content {
  background: white;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
  overflow: hidden;
}

.energy-donut-wrapper {
  position: relative;
  flex-shrink: 0;
}

.energy-donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.energy-center-value {
  font-size: 14px;
  font-weight: 800;
  color: #dc2626;
  display: block;
  line-height: 1;
}

.energy-center-label {
  font-size: 9px;
  color: #64748b;
  font-weight: 500;
}

.energy-bars-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.energy-bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.energy-bar-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.energy-bar-dot.fossil {
  background: #ef4444;
}

.energy-bar-dot.renewable {
  background: #22c55e;
}

.energy-bar-label {
  flex: 1;
  font-size: 11px;
  color: #475569;
  font-weight: 500;
}

.energy-bar-value {
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.energy-bar-value.fossil { color: #dc2626; }
.energy-bar-value.renewable { color: #16a34a; }

.energy-bar-track-full {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.energy-bar-track-full.fossil { background: #fee2e2; }
.energy-bar-track-full.renewable { background: #dcfce7; }

.energy-bar-fill-full {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease-out;
}

.energy-bar-fill-full.fossil { background: #ef4444; }
.energy-bar-fill-full.renewable { background: #22c55e; }

.energy-source {
  font-size: 8px;
  color: #94a3b8;
  margin-top: auto;
  flex-shrink: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: #0F3759;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>