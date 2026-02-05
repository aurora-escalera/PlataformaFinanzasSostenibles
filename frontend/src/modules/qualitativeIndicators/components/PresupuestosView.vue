<!-- src/modules/qualitativeIndicators/components/PresupuestosView.vue -->
<!-- ✅ VERSIÓN COMPACTA - Header de presupuesto más delgado -->
<template>
  <div class="presupuestos-container">
    <!-- ✅ EMPTY STATE cuando no hay entidad seleccionada -->
    <div v-if="!selectedEntity" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Selecciona una entidad</h2>
        <p class="empty-state-description">
          Selecciona una entidad federativa para ver los indicadores de presupuesto.
        </p>
      </div>
    </div>

    <!-- ✅ CONTENIDO cuando hay entidad seleccionada -->
    <div v-else class="card-body">
      <!-- Sección Superior: Presupuesto Total - COMPACTA -->
      <div class="top-section">
        <div v-if="presupuestoLoading" class="loading-state-inline">
          <div class="spinner-mini"></div>
        </div>

        <div v-else-if="presupuestoError" class="error-state-inline">
          <span>Error cargando datos</span>
        </div>

        <div v-else class="presupuesto-compact">
          <!-- Izquierda: Info -->
          <div class="presupuesto-left">
            <div class="icon-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="presupuesto-info">
              <span class="presupuesto-label">Presupuesto Estatal {{ selectedYear }}</span>
              <span class="presupuesto-entity">{{ selectedEntity }}</span>
            </div>
          </div>
          
          <!-- Centro: Valor principal -->
          <div class="presupuesto-center">
            <span class="currency">$</span>
            <span class="presupuesto-value">{{ formatNumberLarge(presupuestoTotal) }}</span>
            <span class="currency-unit">MDP</span>
          </div>

          <!-- Derecha: Quick stats -->
          <div class="presupuesto-right">
            <div class="mini-stat">
              <span class="mini-stat-value">{{ activeSectorsCount }}</span>
              <span class="mini-stat-label">Sectores</span>
            </div>
            <div class="mini-stat">
              <span class="mini-stat-value">{{ totalProgramas }}</span>
              <span class="mini-stat-label">Programas</span>
            </div>
            <div class="mini-stat">
              <span class="mini-stat-value">{{ formatCurrencyShort(totalFinanciamientos) }}</span>
              <span class="mini-stat-label">Financ.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Inferior: Financiamientos y Programas -->
      <div class="bottom-section">
        <div class="combined-section">
          <div v-if="financiamientosLoading || programasLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando datos...</p>
          </div>

          <div v-else-if="financiamientosError || programasError" class="error-state">
            <p>Error: {{ financiamientosError || programasError }}</p>
            <button @click="reloadAllData" class="retry-btn">Reintentar</button>
          </div>

          <SectorFinanceCard
            v-else
            :financiamientos="financiamientosData"
            :programas="programasData"
            :title="'Financiamientos y Programas por Sector'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import SectorFinanceCard from '@/modules/charts/components/SectorFinanceCard.vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName, setActiveYear } from '@/dataConection/storageConfig'

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

const { fetchData } = useStorageData()

const parseNumericValue = (value) => {
  if (typeof value === 'number') return value
  if (!value || value === '' || value === 'NA' || value === 'ND' || value === 'N/A') return 0
  
  let stringValue = String(value).trim()
  stringValue = stringValue.replace(/\s/g, '')
  stringValue = stringValue.replace(/,/g, '')
  
  const result = parseFloat(stringValue)
  return isNaN(result) ? 0 : result
}

// ============================================
// PRESUPUESTO TOTAL
// ============================================
const presupuestoTotal = ref(0)
const presupuestoLoading = ref(false)
const presupuestoError = ref(null)

const loadPresupuestoData = async (entityName = null, year = null) => {
  try {
    presupuestoLoading.value = true
    presupuestoError.value = null
    
    if (!entityName) {
      presupuestoTotal.value = 0
      presupuestoLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('presupuestoEstatal')
    const sheetName = getSheetName('presupuestoEstatal')
    const rawData = await fetchData('presupuestoEstatal', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      presupuestoTotal.value = parseNumericValue(entityRow[mapping.variables[0].column])
    } else {
      presupuestoTotal.value = 0
    }
    
  } catch (err) {
    presupuestoError.value = err.message
  } finally {
    presupuestoLoading.value = false
  }
}

// ============================================
// FINANCIAMIENTOS
// ============================================
const financiamientosData = ref([])
const financiamientosLoading = ref(false)
const financiamientosError = ref(null)

const loadFinanciamientosData = async (entityName = null, year = null) => {
  try {
    financiamientosLoading.value = true
    financiamientosError.value = null
    
    if (!entityName) {
      financiamientosData.value = []
      financiamientosLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('financiamientos')
    const sheetName = getSheetName('financiamientos')
    const rawData = await fetchData('financiamientos', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      financiamientosData.value = []
      financiamientosLoading.value = false
      return
    }
    
    const transformedData = mapping.variables
      .sort((a, b) => a.order - b.order)
      .map(variable => ({
        key: variable.key,
        label: variable.label,
        value: parseNumericValue(entityRow[variable.column]),
        color: variable.color,
        colorClass: variable.colorClass || 'blue',
        active: true
      }))
    
    financiamientosData.value = transformedData
    
  } catch (err) {
    financiamientosError.value = err.message
  } finally {
    financiamientosLoading.value = false
  }
}

// ============================================
// PROGRAMAS
// ============================================
const programasData = ref([])
const programasLoading = ref(false)
const programasError = ref(null)

const loadProgramasData = async (entityName = null, year = null) => {
  try {
    programasLoading.value = true
    programasError.value = null
    
    if (!entityName) {
      programasData.value = []
      programasLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('programas')
    const sheetName = getSheetName('programas')
    const rawData = await fetchData('programas', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      programasData.value = []
      programasLoading.value = false
      return
    }
    
    const transformedData = mapping.variables
      .sort((a, b) => a.order - b.order)
      .map(variable => ({
        key: variable.key,
        label: variable.label,
        value: parseNumericValue(entityRow[variable.column]),
        color: variable.color,
        colorClass: variable.colorClass || 'blue',
        active: true
      }))
    
    programasData.value = transformedData
    
  } catch (err) {
    programasError.value = err.message
  } finally {
    programasLoading.value = false
  }
}

// ============================================
// COMPUTED
// ============================================
const activeSectorsCount = computed(() => {
  return financiamientosData.value.filter(item => item.value > 0).length
})

const totalProgramas = computed(() => {
  return programasData.value.reduce((sum, item) => sum + item.value, 0)
})

const totalFinanciamientos = computed(() => {
  return financiamientosData.value.reduce((sum, item) => sum + item.value, 0)
})

// ============================================
// UTILIDADES
// ============================================
const formatNumberLarge = (value) => {
  if (!value) return '0'
  
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + ' B'
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + ' M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + ' K'
  }
  
  return new Intl.NumberFormat('es-MX').format(value)
}

const formatCurrencyShort = (value) => {
  if (!value || value === 0) return '$0'
  
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${Math.round(value)}`
}

const reloadAllData = () => {
  loadPresupuestoData(props.selectedEntity, props.selectedYear)
  loadFinanciamientosData(props.selectedEntity, props.selectedYear)
  loadProgramasData(props.selectedEntity, props.selectedYear)
}

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity) => {
  loadPresupuestoData(newEntity, props.selectedYear)
  loadFinanciamientosData(newEntity, props.selectedYear)
  loadProgramasData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear) => {
  if (props.selectedEntity) {
    loadPresupuestoData(props.selectedEntity, newYear)
    loadFinanciamientosData(props.selectedEntity, newYear)
    loadProgramasData(props.selectedEntity, newYear)
  }
}, { immediate: false })

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  await Promise.all([
    loadPresupuestoData(props.selectedEntity, props.selectedYear),
    loadFinanciamientosData(props.selectedEntity, props.selectedYear),
    loadProgramasData(props.selectedEntity, props.selectedYear)
  ])
})
</script>

<style scoped>
.presupuestos-container {
  background-color: white;
  border-radius: 15px;
  height: 100%;
  width: 100%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* EMPTY STATE */
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
  text-align: center;
  max-width: 300px;
  padding: 30px;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 50%;
}

.empty-state-icon svg {
  opacity: 0.6;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
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
  gap: 10px;
  overflow: hidden;
}

/* ============================================
   TOP SECTION - PRESUPUESTO COMPACTO
   ============================================ */
.top-section {
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.presupuesto-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  gap: 16px;
}

.presupuesto-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-badge {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.presupuesto-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.presupuesto-label {
  font-size: 12px;
  font-weight: 600;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.presupuesto-entity {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.presupuesto-center {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.currency {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.presupuesto-value {
  font-size: 28px;
  font-weight: 800;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.currency-unit {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.presupuesto-right {
  display: flex;
  gap: 12px;
}

.mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  min-width: 55px;
}

.mini-stat-value {
  font-size: 14px;
  font-weight: 700;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mini-stat-label {
  font-size: 8px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Loading inline */
.loading-state-inline, .error-state-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  color: white;
}

.spinner-mini {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ============================================
   BOTTOM SECTION
   ============================================ */
.bottom-section {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.combined-section {
  height: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

/* Loading & Error States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 20px;
}

.spinner-small {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #0F3759;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p, .error-state p {
  color: #666;
  font-size: 12px;
  margin: 0;
}

.retry-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
}

.retry-btn:hover {
  background: #dc2626;
}
</style>