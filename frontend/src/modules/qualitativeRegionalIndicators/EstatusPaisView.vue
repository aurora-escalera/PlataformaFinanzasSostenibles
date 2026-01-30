<!-- src/modules/qualitativeRegionalIndicators/EstatusPaisView.vue -->
<!-- ✅ REDISEÑADO: Estilo limpio con dos cards -->
<template>
  <div class="estatus-container">
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
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <h2 class="empty-state-title">
          {{ !selectedYear ? 'Selecciona un año' : 'Año no disponible' }}
        </h2>
        <p class="empty-state-description">
          {{ !selectedYear 
            ? 'Selecciona un año en el filtro superior para visualizar el estatus del país.' 
            : `El año ${selectedYear} no tiene datos disponibles. Años disponibles: ${validYears.join(', ')}` 
          }}
        </p>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div v-else class="cards-wrapper" :class="{ 'animate-in': isAnimating }">
      
      <!-- ================================ -->
      <!-- CARD 1: INDICADORES DE POSICIÓN -->
      <!-- ================================ -->
      <div class="main-card">
        <!-- HEADER -->
        <div class="card-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <span class="header-title">Indicadores de Posición</span>
        </div>

        <!-- BODY -->
        <div v-if="loading" class="card-body loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else class="card-body">
          <!-- POS_ETCO2 -->
          <div class="indicator-row">
            <div class="indicator-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Posición Emisiones CO₂ (POS_ETCO2)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill" :style="{ width: isAnimating ? getPositionBarWidth(countryData?.POS_ETCO2) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount">{{ countryData?.POS_ETCO2 || '—' }}</span>
              <span class="value-unit">de 20 países</span>
            </div>
          </div>

          <!-- POS_ETGEI -->
          <div class="indicator-row">
            <div class="indicator-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 2v8"/>
                <circle cx="12" cy="14" r="4"/>
                <path d="M12 18v4"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Posición Emisiones GEI (POS_ETGEI)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill" :style="{ width: isAnimating ? getPositionBarWidth(countryData?.POS_ETGEI) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount">{{ countryData?.POS_ETGEI || '—' }}</span>
              <span class="value-unit">de 20 países</span>
            </div>
          </div>

          <!-- TP - Índice Presupuestos Abiertos -->
          <div class="indicator-row">
            <div class="indicator-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Índice Presupuestos Abiertos (TP)</span>
              <div class="indicator-bar">
                <div class="indicator-bar-fill" :style="{ width: isAnimating ? getPositionBarWidth(countryData?.TP) + '%' : '0%' }"></div>
              </div>
            </div>
            <div class="indicator-value">
              <span class="value-amount">{{ countryData?.TP || '—' }}</span>
              <span class="value-unit">posición</span>
            </div>
          </div>

          <!-- LEGCC - Ley de Cambio Climático -->
          <div class="indicator-row">
            <div class="indicator-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Ley de Cambio Climático (LEGCC)</span>
              <div class="indicator-status">
                <span class="status-badge" :class="countryData?.LEGCC === 'SI' ? 'active' : 'inactive'">
                  {{ countryData?.LEGCC || '—' }}
                </span>
              </div>
            </div>
            <div class="indicator-value status-value">
              <span class="value-icon">{{ countryData?.LEGCC === 'SI' ? '✓' : '✗' }}</span>
            </div>
          </div>

          <!-- AICC - Arreglos Institucionales -->
          <div class="indicator-row">
            <div class="indicator-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                <rect x="9" y="9" width="6" height="6"/>
              </svg>
            </div>
            <div class="indicator-info">
              <span class="indicator-name">Arreglos Institucionales CC (AICC)</span>
              <div class="indicator-status">
                <span class="status-badge" :class="countryData?.AICC === 'SI' ? 'active' : 'inactive'">
                  {{ countryData?.AICC || '—' }}
                </span>
              </div>
            </div>
            <div class="indicator-value status-value">
              <span class="value-icon">{{ countryData?.AICC === 'SI' ? '✓' : '✗' }}</span>
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
          <span>Fuentes: ClimateWatch, IEA, IBP {{ selectedYear }}</span>
        </div>
      </div>

      <!-- ================================ -->
      <!-- CARD 2: NDC (Contribuciones Nacionalmente Determinadas) -->
      <!-- ================================ -->
      <div class="main-card ndc-card">
        <!-- HEADER -->
        <div class="card-header ndc-header">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <span class="header-title">Contribuciones Nacionalmente Determinadas (NDC)</span>
        </div>

        <!-- BODY -->
        <div v-if="loading" class="card-body loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else class="card-body ndc-body">
          
          <!-- NDC Status -->
          <div class="ndc-status-section">
            <div class="ndc-status-label">Estado NDC</div>
            <div class="ndc-status-text">{{ countryData?.NDC || '—' }}</div>
          </div>

          <!-- NDC Indicators -->
          <div class="ndc-indicators">
            <!-- TIPO_METAS -->
            <div class="indicator-row">
              <div class="indicator-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div class="indicator-info">
                <span class="indicator-name">Tipos de Metas (TIPO_METAS)</span>
                <div class="metas-badges">
                  <span v-for="meta in parseTipoMetas(countryData?.TIPO_METAS)" :key="meta" class="meta-badge">
                    {{ meta }}
                  </span>
                </div>
              </div>
            </div>

            <!-- METAS_ADP -->
            <div class="indicator-row">
              <div class="indicator-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div class="indicator-info">
                <span class="indicator-name">Metas de Adaptación (METAS_ADP)</span>
                <div class="indicator-status">
                  <span class="status-badge" :class="countryData?.METAS_ADP === 'SI' ? 'active' : 'inactive'">
                    {{ countryData?.METAS_ADP || '—' }}
                  </span>
                </div>
              </div>
              <div class="indicator-value status-value">
                <span class="value-icon">{{ countryData?.METAS_ADP === 'SI' ? '✓' : '✗' }}</span>
              </div>
            </div>

            <!-- C_NDC - Costo Estimado -->
            <div class="indicator-row">
              <div class="indicator-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="indicator-info">
                <span class="indicator-name">Costo Estimado NDC (C_NDC)</span>
                <div class="indicator-bar">
                  <div class="indicator-bar-fill" :style="{ width: isAnimating ? '70%' : '0%' }"></div>
                </div>
              </div>
              <div class="indicator-value">
                <span class="value-amount">${{ formatCurrency(countryData?.C_NDC) }}</span>
                <span class="value-unit">USD</span>
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
          <span>{{ countryData?.País || 'México' }} {{ selectedYear }} | Fuente: LGCC, CICC</span>
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
  selectedEntity: { type: String, default: null }
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
  return rawData.value[0]
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

const formatCurrency = (value) => {
  if (!value || value === '—') return '—'
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  if (isNaN(num)) return value
  // Convertir a billones si es muy grande
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  return new Intl.NumberFormat('es-MX').format(num)
}

const getPositionBarWidth = (value) => {
  const num = Number(value) || 0
  if (num === 0) return 0
  // Posición de 20 países, invertido (1 = mejor = barra más corta)
  return Math.min((num / 20) * 100, 100)
}

const parseTipoMetas = (value) => {
  if (!value) return ['—']
  // Separar por "/" o "," 
  const metas = String(value).split(/[\/,]/).map(m => m.trim()).filter(m => m)
  return metas.length > 0 ? metas : ['—']
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
    console.log('📅 [EstatusPaisView] Cargando años válidos...')
    const sheetNames = await fetchRegionalSheetNames('estatusDelPais')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => Number(b) - Number(a))
    
    validYears.value = years
    yearsLoaded.value = true
    
    console.log('📅 [EstatusPaisView] Años válidos:', years)
    
    if (years.length > 0) {
      console.log('📤 [EstatusPaisView] Emitiendo años al padre:', years)
      emit('years-loaded', years)
    }
    
    return years
  } catch (err) {
    console.error('❌ [EstatusPaisView] Error cargando años:', err)
    yearsLoaded.value = true
    return []
  }
}

const loadData = async () => {
  if (!props.selectedYear) return
  if (!yearsLoaded.value) return
  
  const yearStr = String(props.selectedYear)
  
  if (!validYears.value.some(y => String(y) === yearStr)) {
    console.warn(`⚠️ [EstatusPaisView] Año ${yearStr} no disponible`)
    return
  }
  
  loading.value = true
  isAnimating.value = false
  
  try {
    console.log(`📊 [EstatusPaisView] Cargando datos para año: ${yearStr}`)
    const data = await fetchRegionalData('estatusDelPais', yearStr)
    if (data && data.length > 0) {
      rawData.value = data
      console.log(`✅ [EstatusPaisView] Datos cargados: ${data.length} registros`)
      triggerAnimation()
    }
  } catch (err) {
    console.error('❌ [EstatusPaisView] Error:', err)
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
  console.log('🚀 [EstatusPaisView] Montado con año:', props.selectedYear)
  await loadValidYears()
  if (props.selectedYear && isYearValid.value) {
    await loadData()
  }
})
</script>

<style scoped>
.estatus-container {
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

.ndc-header {
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

.ndc-body {
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
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0; 
}

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
  background: #0F3759;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); 
}

.indicator-value { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-end; 
  min-width: 70px; 
}

.value-amount { 
  font-size: 20px; 
  font-weight: 800; 
  color: #0F3759; 
  line-height: 1; 
}

.value-unit { 
  font-size: 9px; 
  color: #94a3b8; 
  font-weight: 500;
}

/* Status Badge */
.indicator-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.status-value {
  min-width: 40px;
}

.value-icon {
  font-size: 20px;
  color: #16a34a;
}

/* ================================ */
/* NDC SECTION */
/* ================================ */
.ndc-status-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 16px;
}

.ndc-status-label {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.ndc-status-text {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
}

.ndc-indicators {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Metas Badges */
.metas-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-badge {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 10px;
  font-weight: 600;
  background: #0F3759;
  color: white;
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