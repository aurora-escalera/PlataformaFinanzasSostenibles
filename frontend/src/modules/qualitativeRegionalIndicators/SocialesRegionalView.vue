<!-- src/modules/qualitativeRegionalIndicators/SocialesRegionalView.vue -->
<template>
  <div class="sociales-container">
    <!-- EMPTY STATE -->
    <div v-if="!selectedYear" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Selecciona un año</h2>
        <p class="empty-state-description">Selecciona un año en el filtro superior para visualizar los indicadores sociales.</p>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div v-else class="card-body">
      <!-- HEADER PRINCIPAL -->
      <div class="main-header">
        <div class="header-icon-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <span class="header-title">Indicadores Sociales {{ selectedYear }}</span>
        <span class="header-subtitle">{{ countryData?.País || 'México' }}</span>
      </div>

      <!-- FILA SUPERIOR - 3 CARDS COMPACTAS -->
      <div class="top-row">
        <!-- POBLACIÓN -->
        <div class="section-card compact-card">
          <div class="section-header compact-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span class="section-title">Población</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content population-content">
            <div class="population-main">
              <div class="population-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="population-value-container">
                <span class="population-big-value">{{ formatPopulationFull(countryData?.POB) }}</span>
                <span class="population-label">HABITANTES</span>
              </div>
            </div>
            <div class="population-source">Banco Mundial, 2023</div>
          </div>
        </div>

        <!-- TASA DE DESEMPLEO -->
        <div class="section-card compact-card">
          <div class="section-header compact-header unemployment-header">
            <div class="section-header-left">
              <div class="section-icon-badge unemployment">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M20 7h-9M14 17H5"/>
                  <circle cx="17" cy="17" r="3"/>
                  <circle cx="7" cy="7" r="3"/>
                </svg>
              </div>
              <span class="section-title">Tasa de Desempleo</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content unemployment-content">
            <div class="unemployment-main">
              <span class="unemployment-value" :style="{ color: getUnemploymentColor(countryData?.TD) }">{{ countryData?.TD || '—' }}%</span>
              <span class="unemployment-label">Desempleo</span>
            </div>
            <div class="unemployment-bar-container">
              <div class="unemployment-bar">
                <div 
                  class="unemployment-bar-fill" 
                  :style="{ 
                    width: Math.min((countryData?.TD || 0) / 30 * 100, 100) + '%',
                    background: getUnemploymentGradient(countryData?.TD)
                  }"
                ></div>
                <div 
                  class="unemployment-marker" 
                  :style="{ 
                    left: Math.min((countryData?.TD || 0) / 30 * 100, 100) + '%',
                    borderColor: getUnemploymentColor(countryData?.TD)
                  }"
                ></div>
              </div>
              <div class="unemployment-scale">
                <span>0%</span>
                <span>15%</span>
                <span>30%</span>
              </div>
            </div>
            <div class="unemployment-source">OIT / Banco Mundial, 2023</div>
          </div>
        </div>

        <!-- MORTALIDAD POR CONTAMINACIÓN -->
        <div class="section-card compact-card">
          <div class="section-header compact-header mortality-header">
            <div class="section-header-left">
              <div class="section-icon-badge mortality">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span class="section-title">Mortalidad Atmosférica</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content mortality-content">
            <div class="mortality-main">
              <div class="mortality-icon-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC143C" stroke-width="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div class="mortality-data">
                <span class="mortality-value">{{ countryData?.MCA || '—' }}</span>
                <span class="mortality-unit">muertes / 100,000 hab.</span>
              </div>
            </div>
            <div class="mortality-bar-container">
              <div class="mortality-bar">
                <div class="mortality-bar-fill" :style="{ width: Math.min((countryData?.MCA || 0) / 150 * 100, 100) + '%' }"></div>
              </div>
              <div class="mortality-scale">
                <span>0</span>
                <span>75</span>
                <span>150</span>
              </div>
            </div>
            <div class="mortality-source">OMS, 2021</div>
          </div>
        </div>
      </div>

      <!-- FILA INFERIOR - ÍNDICES Y RESUMEN -->
      <div class="bottom-row">
        <!-- ÍNDICES DE DESARROLLO -->
        <div class="section-card indices-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M18 20V10M12 20V4M6 20v-6"/>
                </svg>
              </div>
              <span class="section-title">Índices de Desarrollo y Bienestar</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content indices-content">
            <!-- IDH -->
            <div class="index-row">
              <div class="index-icon-badge idh">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="index-info">
                <span class="index-title">Índice de Desarrollo Humano (IDH)</span>
                <div class="index-bar-wrapper">
                  <div class="index-bar">
                    <div class="index-bar-fill idh" :style="{ width: getPositionPercentage(countryData?.IDH, 193) + '%' }"></div>
                  </div>
                  <div class="index-scale-mini">
                    <span>1º</span>
                    <span>193º</span>
                  </div>
                </div>
              </div>
              <div class="index-position-box idh">
                <span class="position-number">{{ countryData?.IDH || '—' }}</span>
                <span class="position-label">Posición</span>
              </div>
            </div>

            <!-- IBG -->
            <div class="index-row">
              <div class="index-icon-badge ibg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5A70" stroke-width="2">
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                  <circle cx="17" cy="11" r="3"/>
                  <path d="M17 14a3 3 0 0 1 3 3v4"/>
                </svg>
              </div>
              <div class="index-info">
                <span class="index-title">Índice de Brechas de Género (IBG)</span>
                <div class="index-bar-wrapper">
                  <div class="index-bar">
                    <div class="index-bar-fill ibg" :style="{ width: getPositionPercentage(countryData?.IBG, 146) + '%' }"></div>
                  </div>
                  <div class="index-scale-mini">
                    <span>1º</span>
                    <span>146º</span>
                  </div>
                </div>
              </div>
              <div class="index-position-box ibg">
                <span class="position-number">{{ countryData?.IBG || '—' }}</span>
                <span class="position-label">Posición</span>
              </div>
            </div>

            <!-- IPM -->
            <div class="index-row">
              <div class="index-icon-badge ipm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E6D82" stroke-width="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
              </div>
              <div class="index-info">
                <span class="index-title">Índice de Pobreza Multidimensional (IPM)</span>
                <div class="index-bar-wrapper">
                  <div class="index-bar">
                    <div class="index-bar-fill ipm" :style="{ width: getPositionPercentage(countryData?.IPM, 110) + '%' }"></div>
                  </div>
                  <div class="index-scale-mini">
                    <span>1º</span>
                    <span>110º</span>
                  </div>
                </div>
              </div>
              <div class="index-position-box ipm">
                <span class="position-number">{{ countryData?.IPM || '—' }}</span>
                <span class="position-label">Posición</span>
              </div>
            </div>
            
            <div class="indices-source">PNUD / WEF / OPHI, 2023</div>
          </div>
        </div>

        <!-- RESUMEN COMPARATIVO -->
        <div class="section-card summary-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <span class="section-title">Resumen de Posiciones</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content summary-content">
            <div class="summary-chart-area">
              <div class="summary-radar-container">
                <svg :width="radarSize" :height="radarSize" :viewBox="`0 0 ${radarSize} ${radarSize}`">
                  <!-- Círculos de fondo -->
                  <circle 
                    v-for="i in 4" 
                    :key="'circle-'+i" 
                    :cx="radarSize/2" 
                    :cy="radarSize/2" 
                    :r="(radarSize/2 - 30) * (i/4)" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    stroke-width="1"
                  />
                  <!-- Líneas radiales -->
                  <line 
                    v-for="(item, idx) in radarData" 
                    :key="'line-'+idx"
                    :x1="radarSize/2"
                    :y1="radarSize/2"
                    :x2="getRadarPoint(idx, 1).x"
                    :y2="getRadarPoint(idx, 1).y"
                    stroke="#e2e8f0"
                    stroke-width="1"
                  />
                  <!-- Polígono de datos -->
                  <polygon 
                    :points="radarPolygonPoints"
                    fill="rgba(15, 55, 89, 0.15)"
                    stroke="#0F3759"
                    stroke-width="2"
                  />
                  <!-- Puntos de datos -->
                  <circle 
                    v-for="(item, idx) in radarData" 
                    :key="'point-'+idx"
                    :cx="getRadarPoint(idx, item.normalizedValue).x"
                    :cy="getRadarPoint(idx, item.normalizedValue).y"
                    r="6"
                    :fill="item.color"
                    stroke="white"
                    stroke-width="2"
                  />
                  <!-- Labels -->
                  <text 
                    v-for="(item, idx) in radarData" 
                    :key="'label-'+idx"
                    :x="getRadarLabelPoint(idx).x"
                    :y="getRadarLabelPoint(idx).y"
                    text-anchor="middle"
                    font-size="11"
                    font-weight="600"
                    :fill="item.color"
                  >
                    {{ item.label }}
                  </text>
                </svg>
              </div>
            </div>
            <div class="summary-legend">
              <div v-for="item in radarData" :key="item.key" class="legend-item">
                <div class="legend-dot" :style="{ background: item.color }"></div>
                <span class="legend-label">{{ item.fullLabel }}</span>
                <span class="legend-value" :style="{ color: item.color }">{{ item.value }}º</span>
              </div>
            </div>
            <div class="summary-note">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Mejor posición = más cerca del centro</span>
            </div>
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

const emit = defineEmits(['back'])

const { fetchRegionalData, fetchRegionalSheetNames } = useStorageData()
const rawData = ref([])
const loading = ref(false)
const error = ref(null)
const availableYears = ref([])

// Radar config
const radarSize = 150

// Computed: datos del país seleccionado
const countryData = computed(() => {
  if (rawData.value.length === 0) return null
  const found = rawData.value.find(row => row['País']?.toLowerCase() === props.selectedCountry?.toLowerCase())
  return found || rawData.value[0]
})

// Computed: datos para el radar chart
const radarData = computed(() => {
  const idh = Number(countryData.value?.IDH) || 0
  const ibg = Number(countryData.value?.IBG) || 0
  const ipm = Number(countryData.value?.IPM) || 0
  
  return [
    { 
      key: 'IDH', 
      label: 'IDH', 
      fullLabel: 'Desarrollo Humano',
      value: idh, 
      maxValue: 193,
      normalizedValue: idh > 0 ? 1 - (idh / 193) : 0,
      color: '#0F3759' 
    },
    { 
      key: 'IBG', 
      label: 'IBG', 
      fullLabel: 'Brechas de Género',
      value: ibg, 
      maxValue: 146,
      normalizedValue: ibg > 0 ? 1 - (ibg / 146) : 0,
      color: '#3B5A70' 
    },
    { 
      key: 'IPM', 
      label: 'IPM', 
      fullLabel: 'Pobreza Multidimensional',
      value: ipm, 
      maxValue: 110,
      normalizedValue: ipm > 0 ? 1 - (ipm / 110) : 0,
      color: '#4E6D82' 
    }
  ]
})

// Funciones del radar chart
const getRadarPoint = (index, value) => {
  const totalPoints = radarData.value.length
  const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2
  const maxRadius = radarSize / 2 - 30
  const radius = maxRadius * Math.max(value, 0.1)
  
  return {
    x: radarSize / 2 + radius * Math.cos(angle),
    y: radarSize / 2 + radius * Math.sin(angle)
  }
}

const getRadarLabelPoint = (index) => {
  const totalPoints = radarData.value.length
  const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2
  const labelRadius = radarSize / 2 - 10
  
  return {
    x: radarSize / 2 + labelRadius * Math.cos(angle),
    y: radarSize / 2 + labelRadius * Math.sin(angle) + 4
  }
}

const radarPolygonPoints = computed(() => {
  return radarData.value.map((item, idx) => {
    const point = getRadarPoint(idx, item.normalizedValue)
    return `${point.x},${point.y}`
  }).join(' ')
})

// Funciones de formato
const formatPopulationFull = (value) => {
  if (!value) return '—'
  const num = Number(String(value).replace(/,/g, ''))
  if (isNaN(num)) return value
  return num.toLocaleString('es-MX')
}

const getUnemploymentColor = (value) => {
  const num = Number(value) || 0
  if (num <= 5) return '#22c55e'
  if (num <= 10) return '#f59e0b'
  return '#ef4444'
}

const getUnemploymentGradient = (value) => {
  const num = Number(value) || 0
  if (num <= 5) return 'linear-gradient(90deg, #bbf7d0 0%, #22c55e 100%)'
  if (num <= 10) return 'linear-gradient(90deg, #bbf7d0 0%, #22c55e 33%, #fef08a 66%, #f59e0b 100%)'
  return 'linear-gradient(90deg, #bbf7d0 0%, #22c55e 25%, #fef08a 50%, #f59e0b 75%, #ef4444 100%)'
}

const getPositionPercentage = (position, total) => {
  const pos = Number(position) || 0
  if (pos === 0) return 0
  return Math.min((pos / total) * 100, 100)
}

// Estado de carga
const isDataLoaded = ref(false)
const currentLoadedYear = ref(null)

// Cargar años disponibles
const loadAvailableYears = async () => {
  try {
    const sheetNames = await fetchRegionalSheetNames('socialesRegional')
    const years = sheetNames.filter(name => /^\d{4}$/.test(name)).sort((a, b) => Number(b) - Number(a))
    availableYears.value = years
    return years
  } catch (err) { 
    console.error('Error cargando años:', err)
    return [] 
  }
}

// Cargar datos
const loadData = async (forceReload = false) => {
  if (!props.selectedYear) return
  const yearStr = String(props.selectedYear)
  
  if (availableYears.value.length > 0 && !availableYears.value.includes(yearStr)) {
    console.warn(`Año ${yearStr} no disponible para socialesRegional`)
    return
  }
  
  if (!forceReload && isDataLoaded.value && currentLoadedYear.value === yearStr) return
  if (loading.value) return
  
  loading.value = true
  try {
    console.log(`📊 [SocialesRegionalView] Cargando datos para año: ${yearStr}`)
    const data = await fetchRegionalData('socialesRegional', yearStr)
    if (data && data.length > 0) {
      rawData.value = data
      isDataLoaded.value = true
      currentLoadedYear.value = yearStr
      console.log(`✅ [SocialesRegionalView] Datos cargados: ${data.length} registros`)
    }
  } catch (err) { 
    console.error('❌ [SocialesRegionalView] Error:', err)
    error.value = err.message 
  }
  finally { loading.value = false }
}

// Watchers
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

// Montaje
onMounted(async () => {
  await loadAvailableYears()
  if (props.selectedYear) await loadData()
})
</script>

<style scoped>
.sociales-container {
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
  height: 28%;
  min-height: 110px;
  max-height: 140px;
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

.compact-card {
  flex: 1;
}

.indices-card {
  flex: 1.1;
}

.summary-card {
  flex: 0.9;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  flex-shrink: 0;
}

.compact-header {
  padding: 6px 10px;
}

.unemployment-header {
  background: linear-gradient(135deg, #0F3759 0%, #1a5a3a 100%);
}

.mortality-header {
  background: linear-gradient(135deg, #0F3759 0%, #5a1a1a 100%);
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon-badge {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon-badge.unemployment {
  background: rgba(124, 179, 66, 0.3);
}

.section-icon-badge.mortality {
  background: rgba(220, 20, 60, 0.3);
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.section-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* POBLACIÓN */
.population-content {
  background: #f8fafc;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  height: 100%;
}

.population-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.population-icon-container {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e8f4fc 0%, #d1e9f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.population-value-container {
  display: flex;
  flex-direction: column;
}

.population-big-value {
  font-size: 22px;
  font-weight: 800;
  color: #0F3759;
  line-height: 1;
  letter-spacing: -0.5px;
}

.population-label {
  font-size: 9px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-top: 2px;
}

.population-source {
  font-size: 10px;
  color: #94a3b8;
  text-align: left;
}

/* DESEMPLEO */
.unemployment-content {
  background: #f8fafc;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  height: 100%;
}

.unemployment-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.unemployment-value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.unemployment-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.unemployment-bar-container {
  width: 100%;
}

.unemployment-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  position: relative;
  overflow: visible;
}

.unemployment-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease-out;
}

.unemployment-marker {
  position: absolute;
  top: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 3px solid;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transform: translateX(-50%);
  transition: left 0.8s ease-out;
}

.unemployment-scale {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
}

.unemployment-source {
  font-size: 10px;
  color: #94a3b8;
}

/* MORTALIDAD */
.mortality-content {
  background: #f8fafc;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  height: 100%;
}

.mortality-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mortality-icon-bg {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mortality-data {
  display: flex;
  flex-direction: column;
}

.mortality-value {
  font-size: 24px;
  font-weight: 800;
  color: #DC143C;
  line-height: 1;
}

.mortality-unit {
  font-size: 11px;
  color: #64748b;
  line-height: 1.2;
}

.mortality-bar-container {
  width: 100%;
}

.mortality-bar {
  height: 6px;
  background: #fee2e2;
  border-radius: 3px;
  overflow: hidden;
}

.mortality-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #fca5a5 0%, #DC143C 100%);
  border-radius: 3px;
  transition: width 0.8s ease-out;
}

.mortality-scale {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
}

.mortality-source {
  font-size: 10px;
  color: #94a3b8;
}

/* ÍNDICES */
.indices-content {
  background: white;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow-y: auto;
}

.index-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px 12px;
  flex: 1;
  min-height: 0;
}

.index-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.index-icon-badge.idh {
  background: linear-gradient(135deg, #e8f4fc 0%, #d1e9f6 100%);
}

.index-icon-badge.ibg {
  background: linear-gradient(135deg, #eef2f5 0%, #dde5eb 100%);
}

.index-icon-badge.ipm {
  background: linear-gradient(135deg, #f0f4f7 0%, #e1e8ed 100%);
}

.index-info {
  flex: 1;
  min-width: 0;
}

.index-title {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  display: block;
  margin-bottom: 6px;
}

.index-bar-wrapper {
  width: 100%;
}

.index-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.index-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease-out;
}

.index-bar-fill.idh {
  background: linear-gradient(90deg, #22c55e 0%, #f59e0b 50%, #ef4444 100%);
}

.index-bar-fill.ibg {
  background: linear-gradient(90deg, #22c55e 0%, #3B5A70 100%);
}

.index-bar-fill.ipm {
  background: linear-gradient(90deg, #22c55e 0%, #4E6D82 100%);
}

.index-scale-mini {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: #94a3b8;
  margin-top: 2px;
}

.index-position-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 6px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}

.index-position-box.idh {
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
}

.index-position-box.ibg {
  background: linear-gradient(135deg, #3B5A70 0%, #4a6d85 100%);
}

.index-position-box.ipm {
  background: linear-gradient(135deg, #4E6D82 0%, #5d7f96 100%);
}

.index-position-box .position-number {
  font-size: 20px;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.index-position-box .position-label {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.indices-source {
  font-size: 10px;
  color: #94a3b8;
  text-align: center;
  margin-top: auto;
}

/* RESUMEN / RADAR */
.summary-content {
  background: white;
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.summary-chart-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.summary-radar-container {
  position: relative;
  padding-top: 30px;
  padding-bottom: 10px;
}

.summary-legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 11px;
  color: #475569;
  font-weight: 500;
}

.legend-value {
  font-size: 13px;
  font-weight: 700;
}

.summary-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px;
  background: #f8fafc;
  border-radius: 6px;
}

.summary-note span {
  font-size: 10px;
  color: #94a3b8;
}

/* LOADING */
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