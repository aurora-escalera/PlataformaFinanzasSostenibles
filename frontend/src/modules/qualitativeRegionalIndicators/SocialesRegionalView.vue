<!-- src/modules/qualitativeRegionalIndicators/SocialesRegionalView.vue -->
<!-- ✅ REDISEÑADO: Estilo limpio como FinanciamientoRegionalView -->
<template>
  <div class="sociales-container">
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 class="empty-state-title">
          {{ !selectedYear ? 'Selecciona un año' : 'Año no disponible' }}
        </h2>
        <p class="empty-state-description">
          {{ !selectedYear 
            ? 'Selecciona un año en el filtro superior para visualizar los indicadores sociales.' 
            : `El año ${selectedYear} no tiene datos disponibles. Años disponibles: ${validYears.join(', ')}` 
          }}
        </p>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div v-else class="cards-wrapper" :class="{ 'animate-in': isAnimating }">
      
      <!-- ================================ -->
      <!-- CARD 1: ÍNDICES (IDH, IBG, IPM) -->
      <!-- ================================ -->
      <div class="main-card indices-card">
        <!-- HEADER -->
        <div class="card-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <span class="header-title">Índices de Desarrollo</span>
        </div>

        <!-- BODY -->
        <div v-if="loading" class="card-body loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else class="card-body">
          <!-- IDH -->
          <div class="index-row">
            <div class="index-icon-box idh">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="index-info">
              <span class="index-name">Índice de Desarrollo Humano (IDH)</span>
              <div class="index-bar">
                <div class="index-bar-fill idh" :style="{ width: isAnimating ? getIndexBarWidth(countryData?.IDH) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="index-value">
              <span class="value-position">{{ countryData?.IDH || '—' }}</span>
            </div>
          </div>

          <!-- IBG -->
          <div class="index-row">
            <div class="index-icon-box ibg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <circle cx="9" cy="7" r="4"/>
                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                <circle cx="17" cy="7" r="4"/>
              </svg>
            </div>
            <div class="index-info">
              <span class="index-name">Índice de Brechas de Género (IBG)</span>
              <div class="index-bar">
                <div class="index-bar-fill ibg" :style="{ width: isAnimating ? getIndexBarWidth(countryData?.IBG) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="index-value">
              <span class="value-position">{{ countryData?.IBG || '—' }}</span>
            </div>
          </div>

          <!-- IPM -->
          <div class="index-row">
            <div class="index-icon-box ipm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
            </div>
            <div class="index-info">
              <span class="index-name">Índice de Pobreza Multidimensional (IPM)</span>
              <div class="index-bar">
                <div class="index-bar-fill ipm" :style="{ width: isAnimating ? getIndexBarWidth(countryData?.IPM) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="index-value">
              <span class="value-position">{{ countryData?.IPM || '—' }}</span>
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
          <span>Fuentes: PNUD, WEF, OPHI {{ selectedYear }}</span>
        </div>
      </div>

      <!-- ================================ -->
      <!-- CARD 2: INDICADORES (POB, TD, MCA) -->
      <!-- ================================ -->
      <div class="main-card indicators-card">
        <!-- HEADER -->
        <div class="card-header indicators-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span class="header-title">Indicadores Sociales</span>
        </div>

        <!-- BODY -->
        <div v-if="loading" class="card-body loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else class="card-body">
          <!-- POB - Población -->
          <div class="indicator-row">
            <div class="indicator-icon-box pob">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Población (POB)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill pob" :style="{ width: isAnimating ? '85%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount">{{ formatPopulation(countryData?.POB) }}</span>
              <span class="value-unit">habitantes</span>
            </div>
          </div>

          <!-- TD - Tasa de Desempleo -->
          <div class="indicator-row">
            <div class="indicator-icon-box td">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M20 7h-9M14 17H5"/>
                <circle cx="17" cy="17" r="3"/>
                <circle cx="7" cy="7" r="3"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Tasa de Desempleo (TD)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill td" :style="{ width: isAnimating ? getUnemploymentBarWidth(countryData?.TD) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount" :class="getUnemploymentClass(countryData?.TD)">{{ countryData?.TD || '—' }}%</span>
              <span class="value-unit">desempleo</span>
            </div>
          </div>

          <!-- MCA - Mortalidad por Contaminación Atmosférica -->
          <div class="indicator-row">
            <div class="indicator-icon-box mca">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Mortalidad por Contaminación Atmosférica (MCA)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill mca" :style="{ width: isAnimating ? getMortalityBarWidth(countryData?.MCA) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount mca">{{ countryData?.MCA || '—' }}</span>
              <span class="value-unit">por 100k hab.</span>
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
          <span>{{ countryData?.País || 'México' }} {{ selectedYear }} | Fuentes: Banco Mundial, OIT, OMS</span>
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

// ============================================
// FUNCIONES DE FORMATO Y CÁLCULO
// ============================================

const formatPopulation = (value) => {
  if (!value) return '—'
  const num = Number(String(value).replace(/,/g, ''))
  if (isNaN(num)) return value
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toLocaleString('es-MX')
}

const getIndexBarWidth = (value) => {
  const num = Number(value) || 0
  if (num === 0) return 0
  // Máximo es 1, así que multiplicamos por 100 para el porcentaje
  return Math.min(num * 100, 100)
}

const getUnemploymentBarWidth = (value) => {
  const num = Number(value) || 0
  // Max 30% para la escala
  return Math.min((num / 30) * 100, 100)
}

const getMortalityBarWidth = (value) => {
  const num = Number(value) || 0
  // Max 150 para la escala
  return Math.min((num / 150) * 100, 100)
}

const getUnemploymentClass = (value) => {
  const num = Number(value) || 0
  if (num <= 5) return 'low'
  if (num <= 10) return 'medium'
  return 'high'
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
    console.log('📅 [SocialesRegionalView] Cargando años válidos...')
    const sheetNames = await fetchRegionalSheetNames('socialesRegional')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => Number(b) - Number(a))
    
    validYears.value = years
    yearsLoaded.value = true
    
    console.log('📅 [SocialesRegionalView] Años válidos:', years)
    
    if (years.length > 0) {
      console.log('📤 [SocialesRegionalView] Emitiendo años al padre:', years)
      emit('years-loaded', years)
    }
    
    return years
  } catch (err) {
    console.error('❌ [SocialesRegionalView] Error cargando años:', err)
    yearsLoaded.value = true
    return []
  }
}

const loadData = async () => {
  if (!props.selectedYear) return
  if (!yearsLoaded.value) return
  
  const yearStr = String(props.selectedYear)
  
  if (!validYears.value.some(y => String(y) === yearStr)) {
    console.warn(`⚠️ [SocialesRegionalView] Año ${yearStr} no disponible`)
    return
  }
  
  loading.value = true
  isAnimating.value = false
  
  try {
    console.log(`📊 [SocialesRegionalView] Cargando datos para año: ${yearStr}`)
    const data = await fetchRegionalData('socialesRegional', yearStr)
    if (data && data.length > 0) {
      rawData.value = data
      console.log(`✅ [SocialesRegionalView] Datos cargados: ${data.length} registros`)
      triggerAnimation()
    }
  } catch (err) {
    console.error('❌ [SocialesRegionalView] Error:', err)
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
  console.log('🚀 [SocialesRegionalView] Montado con año:', props.selectedYear)
  await loadValidYears()
  if (props.selectedYear && isYearValid.value) {
    await loadData()
  }
})
</script>

<style scoped>
.sociales-container {
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

.indicators-header {
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

/* ================================ */
/* INDEX ROW (IDH, IBG, IPM) */
/* ================================ */
.index-row { 
  display: flex; 
  align-items: center; 
  gap: 14px; 
  padding: 14px 16px; 
  background: #f8fafc; 
  border-radius: 12px; 
}

.index-icon-box { 
  width: 42px; 
  height: 42px; 
  border-radius: 10px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
}

.index-icon-box.idh { background: linear-gradient(135deg, #0F3759 0%, #1a5a8a 100%); }
.index-icon-box.ibg { background: linear-gradient(135deg, #3B5A70 0%, #4a7090 100%); }
.index-icon-box.ipm { background: linear-gradient(135deg, #4E6D82 0%, #5d8098 100%); }

.index-info { 
  flex: 1; 
  min-width: 0; 
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
}

.index-name { 
  font-size: 12px; 
  font-weight: 600; 
  color: #1e293b; 
  line-height: 1.3; 
}

.index-bar { 
  height: 6px; 
  background: #e2e8f0; 
  border-radius: 3px; 
  overflow: hidden; 
  max-width: 160px; 
}

.index-bar-fill { 
  height: 100%; 
  border-radius: 3px; 
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); 
}

.index-bar-fill.idh { background: linear-gradient(90deg, #22c55e 0%, #f59e0b 50%, #ef4444 100%); }
.index-bar-fill.ibg { background: linear-gradient(90deg, #22c55e 0%, #3B5A70 100%); }
.index-bar-fill.ipm { background: linear-gradient(90deg, #22c55e 0%, #4E6D82 100%); }

.index-value { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-end; 
  min-width: 65px; 
}

.value-position { 
  font-size: 22px; 
  font-weight: 800; 
  color: #0F3759; 
  line-height: 1; 
}

/* ================================ */
/* INDICATOR ROW (POB, TD, MCA) */
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

.indicator-icon-box.pob { background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%); }
.indicator-icon-box.td { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); }
.indicator-icon-box.mca { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }

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

.indicator-bar-fill.pob { background: linear-gradient(90deg, #0F3759 0%, #1a6d9a 100%); }
.indicator-bar-fill.td { background: linear-gradient(90deg, #bbf7d0 0%, #22c55e 50%, #f59e0b 100%); }
.indicator-bar-fill.mca { background: linear-gradient(90deg, #fecaca 0%, #ef4444 100%); }

.indicator-value { 
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

.value-amount.low { color: #16a34a; }
.value-amount.medium { color: #f59e0b; }
.value-amount.high { color: #dc2626; }
.value-amount.mca { color: #dc2626; }

.value-unit { 
  font-size: 10px; 
  color: #94a3b8; 
  font-weight: 500;
  text-transform: lowercase;
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