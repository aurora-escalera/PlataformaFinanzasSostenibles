<!-- src/modules/qualitativeRegionalIndicators/EconomicosRegionalView.vue -->
<!-- ✅ CORREGIDO: Emite años válidos al padre y valida año seleccionado -->
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
    <div v-else class="card-body">
      <!-- HEADER PRINCIPAL -->
      <div class="main-header">
        <div class="header-icon-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <span class="header-title">Indicadores Económicos {{ selectedYear }}</span>
        <span class="header-subtitle">{{ countryData?.País || 'México' }}</span>
      </div>

      <!-- FILA SUPERIOR - 2 CARDS GRANDES -->
      <div class="top-row">
        <!-- PIB TOTAL -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M18 20V10M12 20V4M6 20v-6"/>
                </svg>
              </div>
              <span class="section-title">Producto Interno Bruto (PIB)</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content pib-content">
            <div class="pib-grid">
              <div class="pib-card total">
                <div class="pib-icon-container">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                </div>
                <div class="pib-data">
                  <span class="pib-label">PIB TOTAL</span>
                  <span class="pib-value">${{ formatLargeCurrency(countryData?.PIB) }}</span>
                  <span class="pib-unit">USD</span>
                </div>
              </div>
              <div class="pib-card percapita">
                <div class="pib-icon-container percapita">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7cb342" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div class="pib-data">
                  <span class="pib-label">PIB PER CÁPITA</span>
                  <span class="pib-value percapita">${{ formatNumber(countryData?.PIBPC) }}</span>
                  <span class="pib-unit">USD / habitante</span>
                </div>
              </div>
            </div>
            <div class="pib-bar-section">
              <div class="bar-label-row">
                <span class="bar-title">Comparativo PIB per cápita regional</span>
                <span class="bar-value" :style="{ color: getPIBPCColor(countryData?.PIBPC) }">${{ formatNumber(countryData?.PIBPC) }}</span>
              </div>
              <div class="pib-comparison-bar">
                <div class="pib-comparison-fill" :style="{ width: getPIBPCPercentage(countryData?.PIBPC) + '%', background: getPIBPCGradient(countryData?.PIBPC) }"></div>
                <div class="pib-marker" :style="{ left: getPIBPCPercentage(countryData?.PIBPC) + '%', borderColor: getPIBPCColor(countryData?.PIBPC) }"></div>
              </div>
              <div class="bar-scale"><span>$0</span><span>$25,000</span><span>$50,000</span></div>
            </div>
            <div class="section-source">Banco Mundial, 2023</div>
          </div>
        </div>

        <!-- INGRESOS -->
        <div class="section-card">
          <div class="section-header income-header">
            <div class="section-header-left">
              <div class="section-icon-badge income">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <span class="section-title">Ingresos Totales</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content income-content">
            <div class="income-grid">
              <div class="income-card total">
                <div class="income-icon-container">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC143C" stroke-width="1.5">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div class="income-data">
                  <span class="income-label">INGRESO TOTAL</span>
                  <span class="income-value">${{ formatLargeCurrency(countryData?.IT) }}</span>
                  <span class="income-unit">USD</span>
                </div>
              </div>
              <div class="income-card percapita">
                <div class="income-icon-container percapita">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div class="income-data">
                  <span class="income-label">INGRESO PER CÁPITA</span>
                  <span class="income-value percapita">${{ formatNumber(countryData?.ITPC) }}</span>
                  <span class="income-unit">USD / habitante</span>
                </div>
              </div>
            </div>
            <div class="income-bar-section">
              <div class="bar-label-row">
                <span class="bar-title">Comparativo Ingreso per cápita</span>
                <span class="bar-value" :style="{ color: getIncomeColor(countryData?.ITPC) }">${{ formatNumber(countryData?.ITPC) }}</span>
              </div>
              <div class="income-comparison-bar">
                <div class="income-comparison-fill" :style="{ width: getIncomePercentage(countryData?.ITPC) + '%', background: getIncomeGradient(countryData?.ITPC) }"></div>
              </div>
              <div class="bar-scale"><span>$0</span><span>$10,000</span><span>$20,000</span></div>
            </div>
            <div class="section-source">Banco Mundial / FMI, 2023</div>
          </div>
        </div>
      </div>

      <!-- FILA INFERIOR -->
      <div class="bottom-row">
        <!-- PRESUPUESTO -->
        <div class="section-card budget-card">
          <div class="section-header budget-header">
            <div class="section-header-left">
              <div class="section-icon-badge budget">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <span class="section-title">Presupuesto Nacional</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content budget-content">
            <div class="budget-row">
              <div class="budget-icon-badge total">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B5A70" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div class="budget-info">
                <span class="budget-title">Presupuesto Total</span>
                <div class="budget-bar-wrapper">
                  <div class="budget-bar"><div class="budget-bar-fill total" :style="{ width: getBudgetPercentage(countryData?.PT) + '%' }"></div></div>
                </div>
              </div>
              <div class="budget-value-box total">
                <span class="budget-number">${{ formatLargeCurrency(countryData?.PT) }}</span>
                <span class="budget-unit">USD</span>
              </div>
            </div>
            <div class="budget-row">
              <div class="budget-icon-badge percapita">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4E6D82" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="budget-info">
                <span class="budget-title">Presupuesto per Cápita</span>
                <div class="budget-bar-wrapper">
                  <div class="budget-bar"><div class="budget-bar-fill percapita" :style="{ width: getBudgetPCPercentage(countryData?.PTPC) + '%' }"></div></div>
                </div>
              </div>
              <div class="budget-value-box percapita">
                <span class="budget-number">${{ formatNumber(countryData?.PTPC) }}</span>
                <span class="budget-unit">USD/hab</span>
              </div>
            </div>
            <div class="budget-source">Secretaría de Hacienda / FMI, 2023</div>
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
              <span class="section-title">Resumen Económico</span>
            </div>
          </div>
          <div v-if="loading" class="section-content loading-state"><div class="spinner"></div></div>
          <div v-else class="section-content summary-content">
            <div class="summary-metrics-grid">
              <div class="metric-card pib">
                <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></div>
                <div class="metric-content"><span class="metric-value">${{ formatCompact(countryData?.PIB) }}</span><span class="metric-label">PIB Total</span></div>
              </div>
              <div class="metric-card pibpc">
                <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7cb342" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                <div class="metric-content"><span class="metric-value">${{ formatNumber(countryData?.PIBPC) }}</span><span class="metric-label">PIB per cápita</span></div>
              </div>
              <div class="metric-card income">
                <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC143C" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                <div class="metric-content"><span class="metric-value">${{ formatCompact(countryData?.IT) }}</span><span class="metric-label">Ingreso Total</span></div>
              </div>
              <div class="metric-card incomepc">
                <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg></div>
                <div class="metric-content"><span class="metric-value">${{ formatNumber(countryData?.ITPC) }}</span><span class="metric-label">Ingreso per cápita</span></div>
              </div>
              <div class="metric-card budget">
                <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B5A70" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
                <div class="metric-content"><span class="metric-value">${{ formatCompact(countryData?.PT) }}</span><span class="metric-label">Presupuesto</span></div>
              </div>
              <div class="metric-card budgetpc">
                <div class="metric-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4E6D82" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg></div>
                <div class="metric-content"><span class="metric-value">${{ formatNumber(countryData?.PTPC) }}</span><span class="metric-label">Presup. per cápita</span></div>
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
import { useStorageData } from '@/dataConection/useStorageData'

const props = defineProps({
  selectedYear: { type: [String, Number], default: null },
  selectedCountry: { type: String, default: 'México' }
})

// ✅ IMPORTANTE: Agregar emit para years-loaded
const emit = defineEmits(['back', 'years-loaded'])

const { fetchRegionalData, fetchRegionalSheetNames } = useStorageData()
const rawData = ref([])
const loading = ref(false)
const error = ref(null)

// ✅ NUEVO: Estado de años válidos
const validYears = ref([])
const yearsLoaded = ref(false)

const countryData = computed(() => {
  if (rawData.value.length === 0) return null
  const found = rawData.value.find(row => row['País']?.toLowerCase() === props.selectedCountry?.toLowerCase())
  return found || rawData.value[0]
})

// ✅ NUEVO: Computed para validar año
const isYearValid = computed(() => {
  if (!yearsLoaded.value) return false
  if (!props.selectedYear) return false
  const yearStr = String(props.selectedYear)
  return validYears.value.some(y => String(y) === yearStr)
})

const formatLargeCurrency = (value) => {
  if (!value) return '—'
  const num = Number(String(value).replace(/,/g, ''))
  if (isNaN(num)) return value
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  return num.toLocaleString('es-MX')
}

const formatCompact = (value) => {
  if (!value) return '—'
  const num = Number(String(value).replace(/,/g, ''))
  if (isNaN(num)) return value
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toLocaleString('es-MX')
}

const formatNumber = (value) => {
  if (!value) return '—'
  const num = Number(String(value).replace(/,/g, ''))
  if (isNaN(num)) return value
  return num.toLocaleString('es-MX', { maximumFractionDigits: 0 })
}

const getPIBPCPercentage = (value) => {
  const num = Number(String(value).replace(/,/g, '')) || 0
  return Math.min((num / 50000) * 100, 100)
}

const getPIBPCColor = (value) => {
  const num = Number(String(value).replace(/,/g, '')) || 0
  if (num >= 30000) return '#22c55e'
  if (num >= 15000) return '#f59e0b'
  return '#ef4444'
}

const getPIBPCGradient = (value) => {
  const num = Number(String(value).replace(/,/g, '')) || 0
  if (num >= 30000) return 'linear-gradient(90deg, #bbf7d0 0%, #22c55e 100%)'
  if (num >= 15000) return 'linear-gradient(90deg, #bbf7d0 0%, #22c55e 40%, #fef08a 70%, #f59e0b 100%)'
  return 'linear-gradient(90deg, #fef08a 0%, #f59e0b 60%, #ef4444 100%)'
}

const getIncomePercentage = (value) => {
  const num = Number(String(value).replace(/,/g, '')) || 0
  return Math.min((num / 20000) * 100, 100)
}

const getIncomeColor = (value) => {
  const num = Number(String(value).replace(/,/g, '')) || 0
  if (num >= 12000) return '#22c55e'
  if (num >= 6000) return '#f59e0b'
  return '#ef4444'
}

const getIncomeGradient = (value) => {
  const num = Number(String(value).replace(/,/g, '')) || 0
  if (num >= 12000) return 'linear-gradient(90deg, #bbf7d0 0%, #22c55e 100%)'
  if (num >= 6000) return 'linear-gradient(90deg, #bbf7d0 0%, #22c55e 40%, #fef08a 70%, #f59e0b 100%)'
  return 'linear-gradient(90deg, #fef08a 0%, #f59e0b 60%, #ef4444 100%)'
}

const getBudgetPercentage = (value) => {
  const num = Number(String(value).replace(/,/g, '')) || 0
  const maxBudget = 1e12
  if (num <= 0) return 0
  return Math.min((Math.log10(num + 1) / Math.log10(maxBudget)) * 100, 100)
}

const getBudgetPCPercentage = (value) => {
  const num = Number(String(value).replace(/,/g, '')) || 0
  return Math.min((num / 10000) * 100, 100)
}

// ✅ CORREGIDO: Cargar años válidos y EMITIR AL PADRE
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
    
    // ✅ IMPORTANTE: Emitir años al padre
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

// ✅ CORREGIDO: Cargar datos solo si el año es válido
const loadData = async () => {
  if (!props.selectedYear) return
  if (!yearsLoaded.value) return
  
  const yearStr = String(props.selectedYear)
  
  // Validar que el año existe
  if (!validYears.value.some(y => String(y) === yearStr)) {
    console.warn(`⚠️ [EconomicosRegionalView] Año ${yearStr} no disponible`)
    return
  }
  
  loading.value = true
  try {
    console.log(`📊 [EconomicosRegionalView] Cargando datos para año: ${yearStr}`)
    const data = await fetchRegionalData('economicosRegional', yearStr)
    if (data && data.length > 0) {
      rawData.value = data
      console.log(`✅ [EconomicosRegionalView] Datos cargados: ${data.length} registros`)
    }
  } catch (err) {
    console.error('❌ [EconomicosRegionalView] Error:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Watch para cambios de año
watch(() => props.selectedYear, async (newYear) => {
  if (newYear && yearsLoaded.value) {
    rawData.value = []
    await loadData()
  }
}, { immediate: false })

// Watch para cuando los años se cargan
watch(yearsLoaded, (loaded) => {
  if (loaded && props.selectedYear && isYearValid.value) {
    loadData()
  }
})

// Lifecycle
onMounted(async () => {
  console.log('🚀 [EconomicosRegionalView] Montado con año:', props.selectedYear)
  await loadValidYears()
  if (props.selectedYear && isYearValid.value) {
    await loadData()
  }
})
</script>

<style scoped>
.economicos-container { background-color: white; border-radius: 15px; height: 100%; width: 100%; padding: 8px; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
.global-empty-state { display: flex; align-items: center; justify-content: center; height: 100%; }
.empty-state-content { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 280px; }
.empty-state-icon { width: 70px; height: 70px; margin-bottom: 14px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%); border-radius: 50%; }
.empty-state-title { font-size: 16px; font-weight: 600; color: #2d3748; margin: 0 0 6px 0; }
.empty-state-description { font-size: 13px; color: #718096; margin: 0; line-height: 1.5; }
.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #0F3759; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px; }
.card-body { height: 100%; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
.main-header { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); flex-shrink: 0; }
.header-icon-badge { width: 24px; height: 24px; border-radius: 6px; background: rgba(255, 255, 255, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.header-title { font-size: 12px; font-weight: 600; color: white; }
.header-subtitle { font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-left: auto; }
.top-row { display: flex; gap: 6px; height: 42%; min-height: 160px; }
.bottom-row { display: flex; gap: 6px; flex: 1; min-height: 0; }
.section-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
.budget-card { flex: 0.9; }
.summary-card { flex: 1.1; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); flex-shrink: 0; }
.income-header { background: linear-gradient(135deg, #0F3759 0%, #5a1a2a 100%); }
.budget-header { background: linear-gradient(135deg, #0F3759 0%, #1a3a5a 100%); }
.section-header-left { display: flex; align-items: center; gap: 6px; }
.section-icon-badge { width: 20px; height: 20px; border-radius: 4px; background: rgba(255, 255, 255, 0.15); display: flex; align-items: center; justify-content: center; }
.section-icon-badge.income { background: rgba(220, 20, 60, 0.3); }
.section-icon-badge.budget { background: rgba(59, 90, 112, 0.3); }
.section-title { font-size: 11px; font-weight: 600; color: white; }
.section-content { flex: 1; min-height: 0; overflow: hidden; }
.section-source { font-size: 10px; color: #94a3b8; text-align: center; padding-top: 4px; }
.pib-content { background: #f8fafc; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; height: 100%; }
.pib-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pib-card { background: white; border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 10px; border: 1px solid #e2e8f0; }
.pib-icon-container { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #e8f4fc 0%, #d1e9f6 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pib-icon-container.percapita { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); }
.pib-data { display: flex; flex-direction: column; min-width: 0; }
.pib-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.pib-value { font-size: 18px; font-weight: 800; color: #0F3759; line-height: 1.1; }
.pib-value.percapita { color: #16a34a; }
.pib-unit { font-size: 10px; color: #94a3b8; }
.pib-bar-section { background: white; border-radius: 6px; padding: 8px 10px; border: 1px solid #e2e8f0; }
.bar-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.bar-title { font-size: 11px; color: #475569; font-weight: 500; }
.bar-value { font-size: 12px; font-weight: 700; }
.pib-comparison-bar { height: 8px; background: #e2e8f0; border-radius: 4px; position: relative; overflow: visible; }
.pib-comparison-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease-out; }
.pib-marker { position: absolute; top: -4px; width: 16px; height: 16px; border-radius: 50%; background: white; border: 3px solid; box-shadow: 0 2px 4px rgba(0,0,0,0.15); transform: translateX(-50%); transition: left 0.8s ease-out; }
.bar-scale { display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; margin-top: 4px; }
.income-content { background: #f8fafc; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; height: 100%; }
.income-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.income-card { background: white; border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 10px; border: 1px solid #e2e8f0; }
.income-icon-container { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.income-icon-container.percapita { background: linear-gradient(135deg, #e8f4fc 0%, #d1e9f6 100%); }
.income-data { display: flex; flex-direction: column; min-width: 0; }
.income-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.income-value { font-size: 18px; font-weight: 800; color: #DC143C; line-height: 1.1; }
.income-value.percapita { color: #0F3759; }
.income-unit { font-size: 10px; color: #94a3b8; }
.income-bar-section { background: white; border-radius: 6px; padding: 8px 10px; border: 1px solid #e2e8f0; }
.income-comparison-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.income-comparison-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease-out; }
.budget-content { background: white; padding: 10px 12px; display: flex; flex-direction: column; gap: 10px; height: 100%; overflow-y: auto; }
.budget-row { display: flex; align-items: center; gap: 12px; background: #f8fafc; border-radius: 8px; padding: 12px; flex: 1; min-height: 0; }
.budget-icon-badge { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.budget-icon-badge.total { background: linear-gradient(135deg, #e8f0f5 0%, #d4e3ed 100%); }
.budget-icon-badge.percapita { background: linear-gradient(135deg, #eef2f5 0%, #dde5eb 100%); }
.budget-info { flex: 1; min-width: 0; }
.budget-title { font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
.budget-bar-wrapper { width: 100%; }
.budget-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.budget-bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease-out; }
.budget-bar-fill.total { background: linear-gradient(90deg, #94a3b8 0%, #3B5A70 100%); }
.budget-bar-fill.percapita { background: linear-gradient(90deg, #cbd5e1 0%, #4E6D82 100%); }
.budget-value-box { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 80px; padding: 8px 12px; border-radius: 8px; flex-shrink: 0; }
.budget-value-box.total { background: linear-gradient(135deg, #3B5A70 0%, #2a4355 100%); }
.budget-value-box.percapita { background: linear-gradient(135deg, #4E6D82 0%, #3d5566 100%); }
.budget-value-box .budget-number { font-size: 14px; font-weight: 700; color: white; line-height: 1; }
.budget-value-box .budget-unit { font-size: 9px; color: rgba(255, 255, 255, 0.7); margin-top: 2px; }
.budget-source { font-size: 10px; color: #94a3b8; text-align: center; margin-top: auto; }
.summary-content { background: white; padding: 10px; display: flex; flex-direction: column; height: 100%; overflow: hidden; gap: 8px; }
.summary-metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; flex: 1; }
.metric-card { background: #f8fafc; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 1px solid #e2e8f0; }
.metric-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.metric-card.pib .metric-icon { background: linear-gradient(135deg, #e8f4fc 0%, #d1e9f6 100%); }
.metric-card.pibpc .metric-icon { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); }
.metric-card.income .metric-icon { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
.metric-card.incomepc .metric-icon { background: linear-gradient(135deg, #e8f4fc 0%, #d1e9f6 100%); }
.metric-card.budget .metric-icon { background: linear-gradient(135deg, #e8f0f5 0%, #d4e3ed 100%); }
.metric-card.budgetpc .metric-icon { background: linear-gradient(135deg, #eef2f5 0%, #dde5eb 100%); }
.metric-content { text-align: center; }
.metric-value { font-size: 14px; font-weight: 800; color: #0F3759; display: block; line-height: 1; }
.metric-label { font-size: 9px; color: #64748b; font-weight: 500; margin-top: 2px; display: block; }
.summary-note { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px; background: #f8fafc; border-radius: 6px; }
.summary-note span { font-size: 10px; color: #94a3b8; }
.loading-state { display: flex; align-items: center; justify-content: center; background: #f8fafc; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>