<!-- src/modules/qualitativeRegionalIndicators/EstatusPaisView.vue -->
<!-- ✅ CORREGIDO: Validación de años antes de cargar datos -->
<template>
  <div class="estatus-pais-container">
    <!-- ✅ EMPTY STATE cuando no hay año seleccionado o año inválido -->
    <div v-if="!selectedYear || (!isYearValid && yearsLoaded)" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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

    <!-- ✅ LOADING STATE mientras carga años -->
    <div v-else-if="!yearsLoaded" class="global-empty-state">
      <div class="empty-state-content">
        <div class="spinner"></div>
        <p class="empty-state-description">Cargando información...</p>
      </div>
    </div>

    <!-- ✅ CONTENIDO cuando hay año válido seleccionado -->
    <div v-else class="card-body">
      
      <!-- ========================================== -->
      <!-- FILA 1: Emisiones CO2 + GEI + Transparencia (30%) -->
      <!-- ========================================== -->
      <div class="row-top">
        <!-- Card Emisiones CO2 -->
        <div class="emission-card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
            </div>
            <span class="card-header-title">Emisiones CO₂</span>
          </div>
          <div class="emission-body co2-bg">
            <div v-if="loading" class="loading-mini"><div class="spinner-small"></div></div>
            <template v-else>
              <span class="emission-number blue">{{ countryData?.POS_ETCO2 || '—' }}</span>
              <span class="emission-label">de 20 países</span>
              <span class="emission-source">IEA, 2022</span>
            </template>
          </div>
        </div>

        <!-- Card Emisiones GEI -->
        <div class="emission-card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v8"/>
                <circle cx="12" cy="14" r="4"/>
                <path d="M12 18v4"/>
              </svg>
            </div>
            <span class="card-header-title">Emisiones GEI</span>
          </div>
          <div class="emission-body gei-bg">
            <div v-if="loading" class="loading-mini"><div class="spinner-small"></div></div>
            <template v-else>
              <span class="emission-number red">{{ countryData?.POS_ETGEI || '—' }}</span>
              <span class="emission-label">de 20 países</span>
              <span class="emission-source">ClimateWatch, 2021</span>
            </template>
          </div>
        </div>

        <!-- Card Transparencia -->
        <div class="transparencia-card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
            </div>
            <span class="card-header-title">Índice Presupuestos Abiertos</span>
          </div>
          <div class="transparencia-body">
            <div v-if="loading" class="loading-mini"><div class="spinner-small"></div></div>
            <template v-else>
              <span class="transparencia-number">{{ countryData?.TP || '—' }}</span>
              <span class="transparencia-label">Posición Regional</span>
            </template>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- FILA 2: NDC Completo (40%) -->
      <!-- ========================================== -->
      <div class="row-middle">
        <div class="ndc-card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <span class="card-header-title">Contribuciones Nacionalmente Determinadas (NDC)</span>
            <span class="ndc-header-badge">{{ countryData?.NDC || '1a NDC sometida en 2016; NDC actualizada en 2020' }}</span>
          </div>
          <div class="ndc-body">
            <div v-if="loading" class="loading-state">
              <div class="spinner-small"></div>
            </div>
            <template v-else>
              <!-- Timeline Section -->
              <div class="ndc-timeline-section">
                <div class="timeline-point">
                  <span class="timeline-year">2016</span>
                  <span class="timeline-event">1ra NDC</span>
                </div>
                <div class="timeline-line"></div>
                <div class="timeline-point">
                  <span class="timeline-year">2022</span>
                  <span class="timeline-event">Actualizada</span>
                </div>
              </div>
              
              <!-- Details Section -->
              <div class="ndc-details-section">
                <div class="ndc-detail-item">
                  <span class="detail-label">TIPOS DE METAS</span>
                  <div class="detail-badges">
                    <span class="badge orange">Condicional</span>
                    <span class="badge blue">Incondicional</span>
                  </div>
                </div>
                <div class="ndc-detail-item">
                  <span class="detail-label">METAS DE ADAPTACIÓN</span>
                  <span class="detail-value green">✓ {{ countryData?.METAS_ADP || 'SI' }}</span>
                </div>
                <div class="ndc-detail-item">
                  <span class="detail-label">COSTO ESTIMADO</span>
                  <div class="costo-container">
                    <span class="costo-prefix">USD</span>
                    <span class="costo-value">{{ formatCurrency(countryData?.C_NDC) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- FILA 3: Marco Institucional (30%) -->
      <!-- ========================================== -->
      <div class="row-bottom">
        <!-- Card Ley de Cambio Climático -->
        <div class="marco-card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="m16 12-4 4-4-4"/>
                <path d="M12 8v8"/>
              </svg>
            </div>
            <span class="card-header-title">Ley de Cambio Climático</span>
          </div>
          <div class="marco-body">
            <div v-if="loading" class="loading-mini"><div class="spinner-small"></div></div>
            <template v-else>
              <div class="marco-icon-large">⚖️</div>
              <span class="marco-value">{{ countryData?.LEGCC || 'SI' }}</span>
            </template>
          </div>
        </div>

        <!-- Card Arreglos Institucionales -->
        <div class="marco-card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                <rect x="9" y="9" width="6" height="6"/>
              </svg>
            </div>
            <span class="card-header-title">Arreglos Institucionales para Cambio Climático</span>
          </div>
          <div class="marco-body">
            <div v-if="loading" class="loading-mini"><div class="spinner-small"></div></div>
            <template v-else>
              <div class="marco-icon-large">🏛️</div>
              <span class="marco-value">{{ countryData?.AICC || 'SI' }}</span>
            </template>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { setActiveYear } from '@/dataConection/storageConfig'

const props = defineProps({
  selectedEntity: {
    type: String,
    default: null
  },
  selectedYear: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['back'])

const { fetchData, fetchSheetNames } = useStorageData()
const rawData = ref([])
const loading = ref(false)
const error = ref(null)

// ✅ NUEVO: Años válidos del sheet
const validYears = ref([])
const yearsLoaded = ref(false)

// Computed: Obtener datos del país
const countryData = computed(() => {
  if (rawData.value.length === 0) return null
  return rawData.value[0]
})

// ✅ NUEVO: Verificar si el año seleccionado es válido
const isYearValid = computed(() => {
  if (!yearsLoaded.value) return false
  if (!props.selectedYear) return false
  return validYears.value.includes(String(props.selectedYear))
})

// Formatear número grande
const formatCurrency = (value) => {
  if (!value || value === '—') return '—'
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  if (isNaN(num)) return value
  return new Intl.NumberFormat('es-MX').format(num)
}

// ✅ Cargar años válidos del sheet
const loadValidYears = async () => {
  try {
    console.log('📅 [EstatusPaisView] Cargando años válidos del sheet...')
    const sheetNames = await fetchSheetNames('estatusDelPais')
    validYears.value = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    yearsLoaded.value = true
    console.log('📅 [EstatusPaisView] Años válidos:', validYears.value)
    return validYears.value
  } catch (err) {
    console.error('❌ [EstatusPaisView] Error obteniendo años válidos:', err)
    yearsLoaded.value = true
    return []
  }
}

// Cargar datos
const loadData = async () => {
  // ✅ VALIDACIÓN: No cargar si no hay año o si los años no se han cargado
  if (!props.selectedYear) {
    console.log('⏸️ [EstatusPaisView] Sin año seleccionado')
    return
  }
  
  // ✅ VALIDACIÓN: Esperar a que los años válidos se carguen
  if (!yearsLoaded.value) {
    console.log('⏸️ [EstatusPaisView] Esperando carga de años válidos...')
    return
  }
  
  const yearStr = String(props.selectedYear)
  
  // ✅ VALIDACIÓN: Verificar que el año existe en el sheet
  if (!validYears.value.includes(yearStr)) {
    console.warn(`⚠️ [EstatusPaisView] Año ${yearStr} NO existe. Años válidos:`, validYears.value)
    // NO limpiar rawData - mantener datos anteriores si los hay
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    console.log('📊 [EstatusPaisView] Cargando datos para año:', yearStr)
    
    setActiveYear(yearStr)
    const data = await fetchData('estatusDelPais')
    
    console.log('📊 [EstatusPaisView] Datos obtenidos:', data?.length, 'filas')
    
    if (data && data.length > 0) {
      rawData.value = data
      console.log('📊 [EstatusPaisView] Columnas:', Object.keys(data[0]))
    } else {
      console.warn('⚠️ [EstatusPaisView] No se obtuvieron datos')
      rawData.value = []
    }
    
    console.log('✅ [EstatusPaisView] Datos cargados correctamente')
  } catch (err) {
    console.error('❌ [EstatusPaisView] Error cargando datos:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// ✅ CORREGIDO: Watch sin immediate, espera a que años estén cargados
watch(() => props.selectedYear, (newYear, oldYear) => {
  console.log('👀 [EstatusPaisView] Año cambió:', oldYear, '→', newYear)
  
  if (newYear && yearsLoaded.value) {
    loadData()
  }
})

// ✅ Watch para cuando los años se cargan
watch(yearsLoaded, (loaded) => {
  if (loaded && props.selectedYear) {
    console.log('📅 [EstatusPaisView] Años cargados, intentando cargar datos...')
    loadData()
  }
})

// Lifecycle
onMounted(async () => {
  console.log('🚀 [EstatusPaisView] Montado con año:', props.selectedYear)
  
  // PRIMERO cargar años válidos
  await loadValidYears()
  
  // LUEGO intentar cargar datos si el año es válido
  if (props.selectedYear && isYearValid.value) {
    await loadData()
  } else if (props.selectedYear) {
    console.warn(`⚠️ [EstatusPaisView] Año inicial ${props.selectedYear} no es válido, esperando año correcto...`)
  }
})
</script>

<style scoped>
.estatus-pais-container {
  background-color: white;
  border-radius: 15px;
  height: 100%;
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ========== EMPTY STATE ========== */
.global-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.empty-state-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.empty-state-icon svg {
  opacity: 0.7;
}

.empty-state-title {
  font-size: 22px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.empty-state-description {
  font-size: 14px;
  color: #718096;
  margin: 0;
  line-height: 1.6;
}

/* ========== SPINNER ========== */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #1e3a5f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

/* ========== CARD BODY ========== */
.card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

/* ========== HEADER OSCURO (común) ========== */
.card-header-dark {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  border-bottom: 1px solid #3b6b8a;
  flex-shrink: 0;
}

.card-header-icon {
  width: 18px;
  height: 18px;
  min-width: 18px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-header-icon svg {
  width: 12px;
  height: 12px;
}

.card-header-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: white;
  line-height: 1.1;
}

/* ========== FILA 1: EMISIONES + TRANSPARENCIA (30%) ========== */
.row-top {
  display: flex;
  gap: 10px;
  height: 30%;
  min-height: 0;
}

.emission-card,
.transparencia-card {
  flex: 1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.emission-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  gap: 2px;
}

.emission-body.co2-bg {
  background: #eff6ff;
}

.emission-body.gei-bg {
  background: #fef2f2;
}

.emission-number {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.emission-number.blue {
  color: #2563eb;
}

.emission-number.red {
  color: #dc2626;
}

.emission-label {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.emission-source {
  font-size: 10px;
  font-style: italic;
  color: #64748b;
}

.transparencia-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  gap: 2px;
  background: #eff6ff;
}

.transparencia-number {
  font-size: 36px;
  font-weight: 700;
  color: #2563eb;
  line-height: 1;
}

.transparencia-label {
  font-size: 12px;
  font-weight: 500;
  color: #3b82f6;
}

/* ========== FILA 2: NDC (40%) ========== */
.row-middle {
  height: 40%;
  min-height: 0;
}

.ndc-card {
  height: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.ndc-card .card-header-dark {
  flex-wrap: wrap;
}

.ndc-header-badge {
  margin-left: auto;
  background: #dc2626;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
}

.ndc-body {
  flex: 1;
  display: flex;
  padding: 10px 15px;
  gap: 15px;
  background: #ffffff;
  align-items: center;
  min-height: 0;
}

.ndc-timeline-section {
  display: flex;
  align-items: center;
  flex: 0.8;
}

.timeline-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #16a34a;
}

.timeline-year {
  font-size: 20px;
  font-weight: 700;
  color: #16a34a;
}

.timeline-event {
  font-size: 9px;
  color: #64748b;
  font-weight: 500;
}

.timeline-line {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, #16a34a, #4ade80);
  margin: 0 8px;
  border-radius: 2px;
}

.ndc-details-section {
  display: flex;
  gap: 10px;
  flex: 1.2;
}

.ndc-detail-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  gap: 6px;
}

.detail-label {
  font-size: 9px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: center;
}

.detail-badges {
  display: flex;
  gap: 4px;
}

.badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 600;
}

.badge.orange {
  background: #dc2626;
  color: white;
}

.badge.blue {
  background: white;
  color: #2563eb;
  border: 1.5px solid #2563eb;
}

.detail-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.detail-value.green {
  color: #16a34a;
}

.costo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.costo-prefix {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.costo-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

/* ========== FILA 3: MARCO INSTITUCIONAL (30%) ========== */
.row-bottom {
  display: flex;
  gap: 10px;
  height: 30%;
  min-height: 0;
}

.marco-card {
  flex: 1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.marco-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  gap: 4px;
  background: #f0fdf4;
}

.marco-icon-large {
  font-size: 28px;
}

.marco-value {
  font-size: 20px;
  font-weight: 700;
  color: #16a34a;
}

/* ========== LOADING STATES ========== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.loading-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #1e3a5f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>