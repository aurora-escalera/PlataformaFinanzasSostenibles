<!-- src/modules/qualitativeRegionalIndicators/FinanciamientoRegionalView.vue -->
<template>
  <div class="financiamiento-container">
    <!-- EMPTY STATE -->
    <div v-if="!selectedYear" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Selecciona un año</h2>
        <p class="empty-state-description">Selecciona un año en el filtro superior para visualizar el financiamiento sostenible internacional.</p>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div v-else class="card-body">
      <!-- HEADER PRINCIPAL -->
      <div class="main-header">
        <div class="header-icon-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <span class="header-title">Financiamiento Sostenible Internacional {{ selectedYear }}</span>
        <span class="header-subtitle">{{ countryData?.País || 'México' }}</span>
      </div>

      <!-- FILA SUPERIOR - 2 CARDS GRANDES -->
      <div class="top-row">
        <!-- FONDO VERDE DEL CLIMA -->
        <div class="section-card">
          <div class="section-header fvc-header">
            <div class="section-header-left">
              <div class="section-icon-badge fvc">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="section-title">Fondo Verde del Clima (FVC)</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content fund-content fvc-content">
            <div class="fund-main">
              <div class="fund-icon-container fvc">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <div class="fund-data">
                <span class="fund-label">MONTO TOTAL</span>
                <span class="fund-value fvc">${{ formatLargeCurrency(countryData?.FVC) }}</span>
                <span class="fund-unit">USD</span>
              </div>
            </div>
            <div class="fund-description">
              <p>Principal mecanismo financiero multilateral para apoyar acciones climáticas en países en desarrollo.</p>
            </div>
            <div class="fund-bar-section">
              <div class="bar-label-row">
                <span class="bar-title">Proporción del financiamiento total</span>
                <span class="bar-value" :style="{ color: '#22c55e' }">{{ getFundPercentage('FVC') }}%</span>
              </div>
              <div class="fund-comparison-bar">
                <div class="fund-comparison-fill fvc" :style="{ width: getFundPercentage('FVC') + '%' }"></div>
              </div>
            </div>
            <div class="section-source">Green Climate Fund, 2023</div>
          </div>
        </div>

        <!-- FMAM -->
        <div class="section-card">
          <div class="section-header fmam-header">
            <div class="section-header-left">
              <div class="section-icon-badge fmam">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/>
                </svg>
              </div>
              <span class="section-title">Fondo para el Medio Ambiente Mundial (FMAM)</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content fund-content fmam-content">
            <div class="fund-main">
              <div class="fund-icon-container fmam">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7cb342" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div class="fund-data">
                <span class="fund-label">MONTO TOTAL</span>
                <span class="fund-value fmam">${{ formatLargeCurrency(countryData?.FMAM) }}</span>
                <span class="fund-unit">USD</span>
              </div>
            </div>
            <div class="fund-description">
              <p>Financiamiento para proyectos ambientales en biodiversidad, cambio climático y aguas internacionales.</p>
            </div>
            <div class="fund-bar-section">
              <div class="bar-label-row">
                <span class="bar-title">Proporción del financiamiento total</span>
                <span class="bar-value" :style="{ color: '#7cb342' }">{{ getFundPercentage('FMAM') }}%</span>
              </div>
              <div class="fund-comparison-bar">
                <div class="fund-comparison-fill fmam" :style="{ width: getFundPercentage('FMAM') + '%' }"></div>
              </div>
            </div>
            <div class="section-source">Global Environment Facility, 2023</div>
          </div>
        </div>
      </div>

      <!-- FILA INFERIOR -->
      <div class="bottom-row">
        <!-- FIC -->
        <div class="section-card fic-card">
          <div class="section-header fic-header">
            <div class="section-header-left">
              <div class="section-icon-badge fic">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <span class="section-title">Fondo de Inversión Climática (FIC)</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content fic-content">
            <div class="fic-row">
              <div class="fic-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC143C" stroke-width="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="fic-info">
                <span class="fic-title">Monto Total FIC</span>
                <div class="fic-bar-wrapper">
                  <div class="fic-bar"><div class="fic-bar-fill" :style="{ width: getFundPercentage('FIC') + '%' }"></div></div>
                </div>
              </div>
              <div class="fic-value-box">
                <span class="fic-number">${{ formatLargeCurrency(countryData?.FIC) }}</span>
                <span class="fic-unit">USD</span>
              </div>
            </div>
            <div class="fic-description">
              <p>Financiamiento para proyectos de energía limpia, eficiencia energética y resiliencia climática en países en desarrollo.</p>
            </div>
            <div class="fic-source">Climate Investment Funds, 2023</div>
          </div>
        </div>

        <!-- BID -->
        <div class="section-card bid-card">
          <div class="section-header bid-header">
            <div class="section-header-left">
              <div class="section-icon-badge bid">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <span class="section-title">Banco Interamericano de Desarrollo (BID)</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content bid-content">
            <div class="bid-row">
              <div class="bid-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <div class="bid-info">
                <span class="bid-title">Monto Total BID</span>
                <div class="bid-bar-wrapper">
                  <div class="bid-bar"><div class="bid-bar-fill" :style="{ width: getFundPercentage('BID') + '%' }"></div></div>
                </div>
              </div>
              <div class="bid-value-box">
                <span class="bid-number">${{ formatLargeCurrency(countryData?.BID) }}</span>
                <span class="bid-unit">USD</span>
              </div>
            </div>
            <div class="bid-description">
              <p>Principal fuente de financiamiento multilateral para el desarrollo sostenible en América Latina y el Caribe.</p>
            </div>
            <div class="bid-source">Banco Interamericano de Desarrollo, 2023</div>
          </div>
        </div>

        <!-- RESUMEN -->
        <div class="section-card summary-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <span class="section-title">Resumen de Financiamiento</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content summary-content">
            <!-- Total -->
            <div class="summary-total">
              <div class="total-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div class="total-data">
                <span class="total-label">FINANCIAMIENTO TOTAL</span>
                <span class="total-value">${{ formatLargeCurrency(totalFinancing) }}</span>
                <span class="total-unit">USD</span>
              </div>
            </div>
            
            <!-- Distribución -->
            <div class="summary-distribution">
              <div class="distribution-title">Distribución por Fuente</div>
              <div class="distribution-bars">
                <div class="dist-item" v-for="fund in fundDistribution" :key="fund.key">
                  <div class="dist-label-row">
                    <span class="dist-name">{{ fund.label }}</span>
                    <span class="dist-percent" :style="{ color: fund.color }">{{ fund.percentage }}%</span>
                  </div>
                  <div class="dist-bar">
                    <div class="dist-bar-fill" :style="{ width: fund.percentage + '%', background: fund.color }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="summary-note">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Todos los valores en dólares americanos (USD)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStorageData } from '../../dataConection/useStorageData'

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

const countryData = computed(() => {
  if (rawData.value.length === 0) return null
  const found = rawData.value.find(row => row['País']?.toLowerCase() === props.selectedCountry?.toLowerCase())
  return found || rawData.value[0]
})

// Total de financiamiento
const totalFinancing = computed(() => {
  if (!countryData.value) return 0
  const fvc = parseNumericValue(countryData.value?.FVC)
  const fmam = parseNumericValue(countryData.value?.FMAM)
  const fic = parseNumericValue(countryData.value?.FIC)
  const bid = parseNumericValue(countryData.value?.BID)
  return fvc + fmam + fic + bid
})

// Distribución de fondos
const fundDistribution = computed(() => {
  const total = totalFinancing.value
  if (total === 0) return []
  
  return [
    {
      key: 'FVC',
      label: 'Fondo Verde del Clima',
      value: parseNumericValue(countryData.value?.FVC),
      percentage: ((parseNumericValue(countryData.value?.FVC) / total) * 100).toFixed(1),
      color: '#22c55e'
    },
    {
      key: 'FMAM',
      label: 'FMAM',
      value: parseNumericValue(countryData.value?.FMAM),
      percentage: ((parseNumericValue(countryData.value?.FMAM) / total) * 100).toFixed(1),
      color: '#7cb342'
    },
    {
      key: 'FIC',
      label: 'Fondo de Inversión Climática',
      value: parseNumericValue(countryData.value?.FIC),
      percentage: ((parseNumericValue(countryData.value?.FIC) / total) * 100).toFixed(1),
      color: '#DC143C'
    },
    {
      key: 'BID',
      label: 'BID',
      value: parseNumericValue(countryData.value?.BID),
      percentage: ((parseNumericValue(countryData.value?.BID) / total) * 100).toFixed(1),
      color: '#0F3759'
    }
  ].sort((a, b) => b.value - a.value)
})

// Parsear valor numérico
const parseNumericValue = (value) => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value
  if (!value || value === '' || value === null || value === undefined) return 0
  let str = String(value).trim().toUpperCase()
  if (str === 'NA' || str === 'ND' || str === 'N/A' || str === '-') return 0
  str = str.replace(/^["']+|["']+$/g, '').trim()
  if (str === '' || str === '""' || str === "''") return 0
  str = str.replace(/[$€£¥₹\s]/g, '')
  const num = parseFloat(str.replace(/,/g, ''))
  return isNaN(num) ? 0 : num
}

const formatLargeCurrency = (value) => {
  if (!value) return '—'
  const num = parseNumericValue(value)
  if (isNaN(num) || num === 0) return '—'
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toLocaleString('es-MX')
}

const getFundPercentage = (fundKey) => {
  const total = totalFinancing.value
  if (total === 0) return 0
  const fundValue = parseNumericValue(countryData.value?.[fundKey])
  return ((fundValue / total) * 100).toFixed(1)
}

const isDataLoaded = ref(false)
const currentLoadedYear = ref(null)

const loadAvailableYears = async () => {
  try {
    const sheetNames = await fetchRegionalSheetNames('financiamientoRegional')
    const years = sheetNames.filter(name => /^\d{4}$/.test(name)).sort((a, b) => Number(b) - Number(a))
    availableYears.value = years
    return years
  } catch (err) { console.error('Error cargando años:', err); return [] }
}

const loadData = async (forceReload = false) => {
  if (!props.selectedYear) return
  const yearStr = String(props.selectedYear)
  if (availableYears.value.length > 0 && !availableYears.value.includes(yearStr)) {
    console.warn(`Año ${yearStr} no disponible para financiamientoRegional`)
    return
  }
  if (!forceReload && isDataLoaded.value && currentLoadedYear.value === yearStr) return
  if (loading.value) return
  
  loading.value = true
  try {
    console.log(`📊 [FinanciamientoRegionalView] Cargando datos para año: ${yearStr}`)
    const data = await fetchRegionalData('financiamientoRegional', yearStr)
    if (data && data.length > 0) {
      rawData.value = data
      isDataLoaded.value = true
      currentLoadedYear.value = yearStr
      console.log(`✅ [FinanciamientoRegionalView] Datos cargados: ${data.length} registros`)
    }
  } catch (err) { console.error('❌ [FinanciamientoRegionalView] Error:', err); error.value = err.message }
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
.financiamiento-container { 
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
  height: 42%; 
  min-height: 160px; 
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

.fic-card { 
  flex: 0.8; 
}

.bid-card { 
  flex: 0.8; 
}

.summary-card { 
  flex: 1.4; 
}

.section-header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 8px 12px; 
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); 
  flex-shrink: 0; 
}

.fvc-header { 
  background: linear-gradient(135deg, #166534 0%, #22c55e 100%); 
}

.fmam-header { 
  background: linear-gradient(135deg, #558b2f 0%, #7cb342 100%); 
}

.fic-header { 
  background: linear-gradient(135deg, #7f1d1d 0%, #DC143C 100%); 
}

.bid-header { 
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); 
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

.section-icon-badge.fvc { 
  background: rgba(255, 255, 255, 0.25); 
}

.section-icon-badge.fmam { 
  background: rgba(255, 255, 255, 0.25); 
}

.section-icon-badge.fic { 
  background: rgba(255, 255, 255, 0.25); 
}

.section-icon-badge.bid { 
  background: rgba(255, 255, 255, 0.25); 
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

.section-source { 
  font-size: 10px; 
  color: #94a3b8; 
  text-align: center; 
  padding-top: 4px; 
}

/* FUND CONTENT (FVC & FMAM) */
.fund-content { 
  background: #f8fafc; 
  padding: 10px 12px; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  height: 100%; 
}

.fvc-content { 
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
}

.fmam-content { 
  background: linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%); 
}

.fund-main { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}

.fund-icon-container { 
  width: 50px; 
  height: 50px; 
  border-radius: 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
}

.fund-icon-container.fvc { 
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%); 
}

.fund-icon-container.fmam { 
  background: linear-gradient(135deg, #d9f99d 0%, #bef264 100%); 
}

.fund-data { 
  display: flex; 
  flex-direction: column; 
  min-width: 0; 
}

.fund-label { 
  font-size: 9px; 
  color: #64748b; 
  text-transform: uppercase; 
  letter-spacing: 0.5px; 
  font-weight: 600; 
}

.fund-value { 
  font-size: 22px; 
  font-weight: 800; 
  line-height: 1.1; 
}

.fund-value.fvc { 
  color: #16a34a; 
}

.fund-value.fmam { 
  color: #65a30d; 
}

.fund-unit { 
  font-size: 10px; 
  color: #94a3b8; 
}

.fund-description { 
  background: white; 
  border-radius: 6px; 
  padding: 8px 10px; 
  border: 1px solid rgba(0, 0, 0, 0.05); 
}

.fund-description p { 
  font-size: 11px; 
  color: #475569; 
  margin: 0; 
  line-height: 1.4; 
}

.fund-bar-section { 
  background: white; 
  border-radius: 6px; 
  padding: 8px 10px; 
  border: 1px solid rgba(0, 0, 0, 0.05); 
}

.bar-label-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 6px; 
}

.bar-title { 
  font-size: 11px; 
  color: #475569; 
  font-weight: 500; 
}

.bar-value { 
  font-size: 12px; 
  font-weight: 700; 
}

.fund-comparison-bar { 
  height: 8px; 
  background: #e2e8f0; 
  border-radius: 4px; 
  overflow: hidden; 
}

.fund-comparison-fill { 
  height: 100%; 
  border-radius: 4px; 
  transition: width 0.8s ease-out; 
}

.fund-comparison-fill.fvc { 
  background: linear-gradient(90deg, #86efac 0%, #22c55e 100%); 
}

.fund-comparison-fill.fmam { 
  background: linear-gradient(90deg, #bef264 0%, #7cb342 100%); 
}

/* FIC CONTENT */
.fic-content { 
  background: white; 
  padding: 10px 12px; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  height: 100%; 
}

.fic-row { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
  border-radius: 8px; 
  padding: 12px; 
}

.fic-icon-badge { 
  width: 40px; 
  height: 40px; 
  border-radius: 8px; 
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
}

.fic-info { 
  flex: 1; 
  min-width: 0; 
}

.fic-title { 
  font-size: 12px; 
  font-weight: 600; 
  color: #475569; 
  display: block; 
  margin-bottom: 6px; 
}

.fic-bar-wrapper { 
  width: 100%; 
}

.fic-bar { 
  height: 8px; 
  background: #e2e8f0; 
  border-radius: 4px; 
  overflow: hidden; 
}

.fic-bar-fill { 
  height: 100%; 
  border-radius: 4px; 
  background: linear-gradient(90deg, #fca5a5 0%, #DC143C 100%); 
  transition: width 0.8s ease-out; 
}

.fic-value-box { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  min-width: 70px; 
  padding: 8px 12px; 
  border-radius: 8px; 
  background: linear-gradient(135deg, #DC143C 0%, #b91c1c 100%); 
  flex-shrink: 0; 
}

.fic-value-box .fic-number { 
  font-size: 14px; 
  font-weight: 700; 
  color: white; 
  line-height: 1; 
}

.fic-value-box .fic-unit { 
  font-size: 9px; 
  color: rgba(255, 255, 255, 0.7); 
  margin-top: 2px; 
}

.fic-description { 
  background: #f8fafc; 
  border-radius: 6px; 
  padding: 8px 10px; 
  flex: 1; 
}

.fic-description p { 
  font-size: 10px; 
  color: #64748b; 
  margin: 0; 
  line-height: 1.4; 
}

.fic-source { 
  font-size: 10px; 
  color: #94a3b8; 
  text-align: center; 
  margin-top: auto; 
}

/* BID CONTENT */
.bid-content { 
  background: white; 
  padding: 10px 12px; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  height: 100%; 
}

.bid-row { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  background: linear-gradient(135deg, #e8f4fc 0%, #d1e9f6 100%); 
  border-radius: 8px; 
  padding: 12px; 
}

.bid-icon-badge { 
  width: 40px; 
  height: 40px; 
  border-radius: 8px; 
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
}

.bid-info { 
  flex: 1; 
  min-width: 0; 
}

.bid-title { 
  font-size: 12px; 
  font-weight: 600; 
  color: #475569; 
  display: block; 
  margin-bottom: 6px; 
}

.bid-bar-wrapper { 
  width: 100%; 
}

.bid-bar { 
  height: 8px; 
  background: #e2e8f0; 
  border-radius: 4px; 
  overflow: hidden; 
}

.bid-bar-fill { 
  height: 100%; 
  border-radius: 4px; 
  background: linear-gradient(90deg, #93c5fd 0%, #0F3759 100%); 
  transition: width 0.8s ease-out; 
}

.bid-value-box { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  min-width: 70px; 
  padding: 8px 12px; 
  border-radius: 8px; 
  background: linear-gradient(135deg, #0F3759 0%, #1e3a5f 100%); 
  flex-shrink: 0; 
}

.bid-value-box .bid-number { 
  font-size: 14px; 
  font-weight: 700; 
  color: white; 
  line-height: 1; 
}

.bid-value-box .bid-unit { 
  font-size: 9px; 
  color: rgba(255, 255, 255, 0.7); 
  margin-top: 2px; 
}

.bid-description { 
  background: #f8fafc; 
  border-radius: 6px; 
  padding: 8px 10px; 
  flex: 1; 
}

.bid-description p { 
  font-size: 10px; 
  color: #64748b; 
  margin: 0; 
  line-height: 1.4; 
}

.bid-source { 
  font-size: 10px; 
  color: #94a3b8; 
  text-align: center; 
  margin-top: auto; 
}

/* SUMMARY CONTENT */
.summary-content { 
  background: white; 
  padding: 10px; 
  display: flex; 
  flex-direction: column; 
  height: 100%; 
  overflow: hidden; 
  gap: 8px; 
}

.summary-total { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
  border-radius: 10px; 
  padding: 12px 16px; 
  border: 1px solid #bae6fd; 
}

.total-icon { 
  width: 44px; 
  height: 44px; 
  border-radius: 10px; 
  background: linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
}

.total-data { 
  display: flex; 
  flex-direction: column; 
}

.total-label { 
  font-size: 9px; 
  color: #64748b; 
  text-transform: uppercase; 
  letter-spacing: 0.5px; 
  font-weight: 600; 
}

.total-value { 
  font-size: 24px; 
  font-weight: 800; 
  color: #0F3759; 
  line-height: 1.1; 
}

.total-unit { 
  font-size: 10px; 
  color: #94a3b8; 
}

.summary-distribution { 
  flex: 1; 
  background: #f8fafc; 
  border-radius: 8px; 
  padding: 10px; 
  overflow-y: auto; 
}

.distribution-title { 
  font-size: 11px; 
  font-weight: 600; 
  color: #475569; 
  margin-bottom: 8px; 
}

.distribution-bars { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}

.dist-item { 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
}

.dist-label-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.dist-name { 
  font-size: 10px; 
  color: #64748b; 
  font-weight: 500; 
}

.dist-percent { 
  font-size: 11px; 
  font-weight: 700; 
}

.dist-bar { 
  height: 6px; 
  background: #e2e8f0; 
  border-radius: 3px; 
  overflow: hidden; 
}

.dist-bar-fill { 
  height: 100%; 
  border-radius: 3px; 
  transition: width 0.8s ease-out; 
}

.summary-note { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 6px; 
  padding: 6px; 
  background: #f8fafc; 
  border-radius: 6px; 
}

.summary-note span { 
  font-size: 10px; 
  color: #94a3b8; 
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