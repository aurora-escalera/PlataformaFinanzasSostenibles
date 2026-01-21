<!-- src/modules/qualitativeRegionalIndicators/FinanciamientoRegionalView.vue -->
<!-- ✅ REDISEÑO v5: Iconos azul oscuro uniforme, sin total -->
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

    <!-- CONTENIDO - UNA SOLA CARD -->
    <div v-else class="main-card" :class="{ 'animate-in': isAnimating }">
      <!-- HEADER -->
      <div class="card-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <span class="header-title">Financiamiento Sostenible Internacional</span>
        <div class="header-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
      </div>

      <!-- BODY - LISTA DE FONDOS -->
      <div v-if="loading" class="card-body loading-state">
        <div class="spinner"></div>
      </div>
      <div v-else class="card-body">
        <!-- FVC -->
        <div class="fund-row">
          <div class="fund-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="fund-info">
            <span class="fund-name">Fondo Verde del Clima (FVC)</span>
            <div class="fund-bar">
              <div 
                class="fund-bar-fill" 
                :style="{ width: isAnimating ? getBarWidth('FVC') + '%' : '0%' }"
              ></div>
            </div>
          </div>
          <div class="fund-value">
            <span class="value-amount">${{ formatLargeCurrency(countryData?.FVC) }}</span>
          </div>
        </div>

        <div class="row-divider"></div>

        <!-- FMAM -->
        <div class="fund-row">
          <div class="fund-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div class="fund-info">
            <span class="fund-name">Fondo para el Medio Ambiente Mundial (FMAM)</span>
            <div class="fund-bar">
              <div 
                class="fund-bar-fill" 
                :style="{ width: isAnimating ? getBarWidth('FMAM') + '%' : '0%' }"
              ></div>
            </div>
          </div>
          <div class="fund-value">
            <span class="value-amount">${{ formatLargeCurrency(countryData?.FMAM) }}</span>
          </div>
        </div>

        <div class="row-divider"></div>

        <!-- FIC -->
        <div class="fund-row">
          <div class="fund-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="fund-info">
            <span class="fund-name">Fondo de Inversión Climática (FIC)</span>
            <div class="fund-bar">
              <div 
                class="fund-bar-fill" 
                :style="{ width: isAnimating ? getBarWidth('FIC') + '%' : '0%' }"
              ></div>
            </div>
          </div>
          <div class="fund-value">
            <span class="value-amount">${{ formatLargeCurrency(countryData?.FIC) }}</span>
          </div>
        </div>

        <div class="row-divider"></div>

        <!-- BID -->
        <div class="fund-row">
          <div class="fund-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <div class="fund-info">
            <span class="fund-name">Banco Interamericano de Desarrollo (BID)</span>
            <div class="fund-bar">
              <div 
                class="fund-bar-fill" 
                :style="{ width: isAnimating ? getBarWidth('BID') + '%' : '0%' }"
              ></div>
            </div>
          </div>
          <div class="fund-value">
            <span class="value-amount">${{ formatLargeCurrency(countryData?.BID) }}</span>
          </div>
        </div>
      </div>

      <!-- FOOTER - Solo fuente -->
      <div class="card-footer">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>{{ countryData?.País || 'México' }} {{ selectedYear }} | Fuentes: Climate Investment Funds, GEF, BID</span>
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

const emit = defineEmits(['back'])

const { fetchRegionalData, fetchRegionalSheetNames } = useStorageData()
const rawData = ref([])
const loading = ref(false)
const error = ref(null)
const availableYears = ref([])
const isAnimating = ref(false)

const countryData = computed(() => {
  if (rawData.value.length === 0) return null
  const found = rawData.value.find(row => row['País']?.toLowerCase() === props.selectedCountry?.toLowerCase())
  return found || rawData.value[0]
})

const maxFundValue = computed(() => {
  if (!countryData.value) return 1
  const values = [
    parseNumericValue(countryData.value?.FVC),
    parseNumericValue(countryData.value?.FMAM),
    parseNumericValue(countryData.value?.FIC),
    parseNumericValue(countryData.value?.BID)
  ]
  return Math.max(...values, 1)
})

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

const getBarWidth = (fundKey) => {
  const fundValue = parseNumericValue(countryData.value?.[fundKey])
  const max = maxFundValue.value
  if (max === 0) return 0
  return Math.max((fundValue / max) * 100, 5)
}

const triggerAnimation = () => {
  isAnimating.value = false
  nextTick(() => {
    setTimeout(() => {
      isAnimating.value = true
    }, 150)
  })
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
  isAnimating.value = false
  
  try {
    console.log(`📊 [FinanciamientoRegionalView] Cargando datos para año: ${yearStr}`)
    const data = await fetchRegionalData('financiamientoRegional', yearStr)
    if (data && data.length > 0) {
      rawData.value = data
      isDataLoaded.value = true
      currentLoadedYear.value = yearStr
      console.log(`✅ [FinanciamientoRegionalView] Datos cargados: ${data.length} registros`)
      triggerAnimation()
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

/* ========== MAIN CARD ========== */
.main-card {
  background: white;
  border-radius: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* ========== CARD HEADER ========== */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  flex-shrink: 0;
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

.header-info {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s;
}

.header-info:hover {
  opacity: 1;
}

/* ========== CARD BODY ========== */
.card-body {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
}

/* ========== FUND ROW ========== */
.fund-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin: 4px 0;
}

.row-divider {
  display: none;
}

/* ========== ICON BOX - AZUL OSCURO UNIFORME ========== */
.fund-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #0F3759;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fund-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fund-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

/* ========== FUND BAR - AZUL OSCURO ========== */
.fund-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  max-width: 180px;
}

.fund-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: #0F3759;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.fund-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 85px;
}

.value-amount {
  font-size: 22px;
  font-weight: 800;
  color: #0F3759;
  line-height: 1;
}

/* ========== CARD FOOTER ========== */
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
.spinner { 
  width: 32px; 
  height: 32px; 
  border: 3px solid #e2e8f0; 
  border-top-color: #0F3759; 
  border-radius: 50%; 
  animation: spin 0.8s linear infinite; 
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>