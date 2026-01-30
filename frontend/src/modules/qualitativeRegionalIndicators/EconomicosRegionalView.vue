<!-- src/modules/qualitativeRegionalIndicators/EconomicosRegionalView.vue -->
<!-- ✅ REDISEÑADO: Estilo limpio como FinanciamientoRegionalView -->
<template>
  <div class="economicos-container">
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
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <h2 class="empty-state-title">
          {{ !selectedYear ? 'Selecciona un año' : 'Año no disponible' }}
        </h2>
        <p class="empty-state-description">
          {{ !selectedYear 
            ? 'Selecciona un año en el filtro superior para visualizar los indicadores económicos.' 
            : `El año ${selectedYear} no tiene datos disponibles. Años disponibles: ${validYears.join(', ')}` 
          }}
        </p>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div v-else class="cards-wrapper" :class="{ 'animate-in': isAnimating }">
      
      <!-- ================================ -->
      <!-- CARD 1: PIB E INGRESOS -->
      <!-- ================================ -->
      <div class="main-card">
        <!-- HEADER -->
        <div class="card-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <span class="header-title">PIB e Ingresos</span>
        </div>

        <!-- BODY -->
        <div v-if="loading" class="card-body loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else class="card-body">
          <!-- PIB -->
          <div class="indicator-row">
            <div class="indicator-icon-box pib">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Producto Interno Bruto (PIB)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill pib" :style="{ width: isAnimating ? getBarWidth(countryData?.PIB, maxPIB) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount">${{ formatLargeCurrency(countryData?.PIB) }}</span>
              <span class="value-unit">USD</span>
            </div>
          </div>

          <!-- PIBPC -->
          <div class="indicator-row">
            <div class="indicator-icon-box pibpc">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">PIB per Cápita (PIBPC)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill pibpc" :style="{ width: isAnimating ? getPerCapitaBarWidth(countryData?.PIBPC, 50000) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount pibpc">${{ formatNumber(countryData?.PIBPC) }}</span>
              <span class="value-unit">USD/hab</span>
            </div>
          </div>

          <!-- IT -->
          <div class="indicator-row">
            <div class="indicator-icon-box it">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Ingresos Totales (IT)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill it" :style="{ width: isAnimating ? getBarWidth(countryData?.IT, maxIT) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount it">${{ formatLargeCurrency(countryData?.IT) }}</span>
              <span class="value-unit">USD</span>
            </div>
          </div>

          <!-- ITPC -->
          <div class="indicator-row">
            <div class="indicator-icon-box itpc">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Ingresos per Cápita (ITPC)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill itpc" :style="{ width: isAnimating ? getPerCapitaBarWidth(countryData?.ITPC, 20000) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount itpc">${{ formatNumber(countryData?.ITPC) }}</span>
              <span class="value-unit">USD/hab</span>
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
          <span>Fuente: Banco Mundial {{ selectedYear }} | Valores en USD</span>
        </div>
      </div>

      <!-- ================================ -->
      <!-- CARD 2: PRESUPUESTO -->
      <!-- ================================ -->
      <div class="main-card">
        <!-- HEADER -->
        <div class="card-header presupuesto-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <span class="header-title">Presupuesto Nacional</span>
        </div>

        <!-- BODY -->
        <div v-if="loading" class="card-body loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else class="card-body presupuesto-body">
          <!-- PT -->
          <div class="indicator-row">
            <div class="indicator-icon-box pt">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Presupuesto Total (PT)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill pt" :style="{ width: isAnimating ? getBarWidth(countryData?.PT, maxPT) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount pt">${{ formatLargeCurrency(countryData?.PT) }}</span>
              <span class="value-unit">USD</span>
            </div>
          </div>

          <!-- PTPC -->
          <div class="indicator-row">
            <div class="indicator-icon-box ptpc">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Presupuesto per Cápita (PTPC)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill ptpc" :style="{ width: isAnimating ? getPerCapitaBarWidth(countryData?.PTPC, 15000) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount ptpc">${{ formatNumber(countryData?.PTPC) }}</span>
              <span class="value-unit">USD/hab</span>
            </div>
          </div>

          <!-- RESUMEN VISUAL -->
          <div class="summary-section">
            <div class="summary-title">Resumen Económico</div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">PIB Total</span>
                <span class="summary-value">${{ formatCompact(countryData?.PIB) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Ingresos</span>
                <span class="summary-value">${{ formatCompact(countryData?.IT) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Presupuesto</span>
                <span class="summary-value">${{ formatCompact(countryData?.PT) }}</span>
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
          <span>{{ countryData?.País || 'México' }} {{ selectedYear }} | Fuente: Banco Mundial | USD</span>
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

// Valores máximos para las barras (calculados dinámicamente)
const maxPIB = computed(() => {
  if (!countryData.value?.PIB) return 1
  return parseNumericValue(countryData.value.PIB) * 1.2
})

const maxIT = computed(() => {
  if (!countryData.value?.IT) return 1
  return parseNumericValue(countryData.value.IT) * 1.2
})

const maxPT = computed(() => {
  if (!countryData.value?.PT) return 1
  return parseNumericValue(countryData.value.PT) * 1.2
})

// ============================================
// FUNCIONES DE FORMATO Y CÁLCULO
// ============================================

const parseNumericValue = (value) => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value
  if (!value || value === '' || value === null || value === undefined) return 0
  let str = String(value).trim().toUpperCase()
  if (str === 'NA' || str === 'ND' || str === 'N/A' || str === '-') return 0
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

const formatCompact = (value) => {
  if (!value) return '—'
  const num = parseNumericValue(value)
  if (isNaN(num) || num === 0) return '—'
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toLocaleString('es-MX')
}

const formatNumber = (value) => {
  if (!value) return '—'
  const num = parseNumericValue(value)
  if (isNaN(num) || num === 0) return '—'
  return num.toLocaleString('es-MX', { maximumFractionDigits: 0 })
}

const getBarWidth = (value, max) => {
  const num = parseNumericValue(value)
  const maxVal = max || 1
  if (num === 0 || maxVal === 0) return 5
  return Math.max((num / maxVal) * 100, 5)
}

const getPerCapitaBarWidth = (value, maxScale) => {
  const num = parseNumericValue(value)
  if (num === 0) return 5
  return Math.min((num / maxScale) * 100, 100)
}

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
    console.log('📅 [EconomicosRegionalView] Cargando años válidos...')
    const sheetNames = await fetchRegionalSheetNames('economicosRegional')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => Number(b) - Number(a))
    
    validYears.value = years
    yearsLoaded.value = true
    
    console.log('📅 [EconomicosRegionalView] Años válidos:', years)
    
    if (years.length > 0) {
      console.log('📤 [EconomicosRegionalView] Emitiendo años al padre:', years)
      emit('years-loaded', years)
    }
    
    return years
  } catch (err) {
    console.error('❌ [EconomicosRegionalView] Error cargando años:', err)
    yearsLoaded.value = true
    return []
  }
}

const loadData = async () => {
  if (!props.selectedYear) return
  if (!yearsLoaded.value) return
  
  const yearStr = String(props.selectedYear)
  
  if (!validYears.value.some(y => String(y) === yearStr)) {
    console.warn(`⚠️ [EconomicosRegionalView] Año ${yearStr} no disponible`)
    return
  }
  
  loading.value = true
  isAnimating.value = false
  
  try {
    console.log(`📊 [EconomicosRegionalView] Cargando datos para año: ${yearStr}`)
    const data = await fetchRegionalData('economicosRegional', yearStr)
    if (data && data.length > 0) {
      rawData.value = data
      console.log(`✅ [EconomicosRegionalView] Datos cargados: ${data.length} registros`)
      triggerAnimation()
    }
  } catch (err) {
    console.error('❌ [EconomicosRegionalView] Error:', err)
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
  console.log('🚀 [EconomicosRegionalView] Montado con año:', props.selectedYear)
  await loadValidYears()
  if (props.selectedYear && isYearValid.value) {
    await loadData()
  }
})
</script>

<style scoped>
.economicos-container {
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

/* Header */
.card-header { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 14px 18px; 
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); 
  flex-shrink: 0; 
}

.presupuesto-header {
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

.presupuesto-body {
  justify-content: flex-start;
  gap: 12px;
}

/* ================================ */
/* INDICATOR ROW */
/* ================================ */
.indicator-row { 
  display: flex; 
  align-items: center; 
  gap: 14px; 
  padding: 14px 16px; 
  background: #f8fafc; 
  border-radius: 12px; 
}

.indicator-icon-box { 
  width: 42px; 
  height: 42px; 
  border-radius: 10px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
}

.indicator-icon-box.pib { background: linear-gradient(135deg, #0F3759 0%, #1a5a8a 100%); }
.indicator-icon-box.pibpc { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); }
.indicator-icon-box.it { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
.indicator-icon-box.itpc { background: linear-gradient(135deg, #3B5A70 0%, #4a7090 100%); }
.indicator-icon-box.pt { background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); }
.indicator-icon-box.ptpc { background: linear-gradient(135deg, #4E6D82 0%, #5d8098 100%); }

.indicator-info { 
  flex: 1; 
  min-width: 0; 
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
}

.indicator-name { 
  font-size: 12px; 
  font-weight: 600; 
  color: #1e293b; 
  line-height: 1.3; 
}

.indicator-bar { 
  height: 6px; 
  background: #e2e8f0; 
  border-radius: 3px; 
  overflow: hidden; 
  max-width: 160px; 
}

.indicator-bar-fill { 
  height: 100%; 
  border-radius: 3px; 
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); 
}

.indicator-bar-fill.pib { background: linear-gradient(90deg, #0F3759 0%, #1a6d9a 100%); }
.indicator-bar-fill.pibpc { background: linear-gradient(90deg, #bbf7d0 0%, #22c55e 100%); }
.indicator-bar-fill.it { background: linear-gradient(90deg, #fecaca 0%, #ef4444 100%); }
.indicator-bar-fill.itpc { background: linear-gradient(90deg, #cbd5e1 0%, #3B5A70 100%); }
.indicator-bar-fill.pt { background: linear-gradient(90deg, #ddd6fe 0%, #8b5cf6 100%); }
.indicator-bar-fill.ptpc { background: linear-gradient(90deg, #e2e8f0 0%, #4E6D82 100%); }

.indicator-value { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-end; 
  min-width: 90px; 
}

.value-amount { 
  font-size: 20px; 
  font-weight: 800; 
  color: #0F3759; 
  line-height: 1; 
}

.value-amount.pibpc { color: #16a34a; }
.value-amount.it { color: #dc2626; }
.value-amount.itpc { color: #3B5A70; }
.value-amount.pt { color: #7c3aed; }
.value-amount.ptpc { color: #4E6D82; }

.value-unit { 
  font-size: 10px; 
  color: #94a3b8; 
  font-weight: 500;
}

/* Summary Section */
.summary-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: auto;
}

.summary-title {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  text-align: center;
}

.summary-grid {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.summary-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 500;
}

.summary-value {
  font-size: 16px;
  font-weight: 800;
  color: #0F3759;
}

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
}
</style>