<!-- src/modules/qualitativeIndicators/components/PresupuestosView.vue -->
<!-- ✅ ACTUALIZADO: Empty state centralizado cuando no hay entidad seleccionada -->
<template>
  <div class="presupuestos-container">
    <!-- ✅ EMPTY STATE CENTRALIZADO cuando no hay entidad seleccionada -->
    <div v-if="!selectedEntity" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Selecciona una entidad</h2>
        <p class="empty-state-description">
          Selecciona una entidad federativa en el filtro superior para visualizar los indicadores de presupuesto y programas.
        </p>
      </div>
    </div>

    <!-- ✅ CONTENIDO NORMAL cuando hay entidad seleccionada -->
    <div v-else class="card-body">
      <!-- Sección Superior: Presupuesto Total -->
      <div class="top-section card">
        <div v-if="presupuestoLoading" class="loading-state-small">
          <div class="spinner-small"></div>
        </div>

        <div v-else-if="presupuestoError" class="error-state-small">
          <p>Error cargando datos</p>
        </div>

        <div v-else class="presupuesto-total-content">
          <div class="presupuesto-header">
            <div class="icon-badge-large">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="header-text">
              <h2 class="presupuesto-title">Presupuesto Estatal {{ selectedYear }}</h2>
              <p class="presupuesto-subtitle">{{ selectedEntity }}</p>
            </div>
          </div>
          
          <div class="presupuesto-value-container">
            <span class="currency-symbol">$</span>
            <span class="presupuesto-value">{{ formatNumberLarge(presupuestoTotal) }}</span>
            <span class="currency-unit">MDP</span>
          </div>

          <div class="categories-badge-container">
            <div class="categories-badge">
              <span class="badge-label">Sectores activos:</span>
              <span class="badge-count">{{ activeSectorsCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Inferior: Financiamientos y Programas -->
      <div class="bottom-section">
        <!-- Financiamientos -->
        <div class="financiamientos-section card">
          <div v-if="financiamientosLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando datos...</p>
          </div>

          <div v-else-if="financiamientosError" class="error-state">
            <p>Error: {{ financiamientosError }}</p>
            <button @click="loadFinanciamientosData(selectedEntity, selectedYear)" class="retry-btn-small">
              Reintentar
            </button>
          </div>

          <HorizontalBarsList
            v-else
            :data="financiamientosData"
            :title="'Financiamientos por Sector'"
            :width="'100%'"
            :height="'100%'"
            :showLegend="false"
          />
        </div>

        <!-- Programas -->
        <div class="programas-section card">
          <div v-if="programasLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando datos...</p>
          </div>

          <div v-else-if="programasError" class="error-state">
            <p>Error: {{ programasError }}</p>
            <button @click="loadProgramasData(selectedEntity, selectedYear)" class="retry-btn-small">
              Reintentar
            </button>
          </div>

          <div v-else class="programas-content">
            <div class="programas-header">
              <h3 class="section-title">Programas por Sector</h3>
            </div>
            <div class="radar-container">
              <RadarChart
                :data="programasData"
                :width="'100%'"
                :height="'100%'"
              />
            </div>
            <div class="programas-stats">
              <div class="stat-item">
                <span class="stat-value">{{ totalProgramas }}</span>
                <span class="stat-label">Total Programas</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ avgProgramas.toFixed(1) }}</span>
                <span class="stat-label">Promedio/Sector</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import HorizontalBarsList from '@/modules/charts/components/HorizontalBarsList.vue'
import RadarChart from '@/modules/charts/components/RadarChart.vue'
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
  stringValue = stringValue.replace(/\./g, '')
  stringValue = stringValue.replace(/,/g, '.')
  
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
    console.error('❌ [Presupuesto] Error:', err)
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
      throw new Error('No se obtuvieron datos del Google Sheet')
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
    console.error('❌ [Financiamientos] Error:', err)
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
      throw new Error('No se obtuvieron datos del Google Sheet')
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
    console.error('❌ [Programas] Error:', err)
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

const avgProgramas = computed(() => {
  if (programasData.value.length === 0) return 0
  return totalProgramas.value / programasData.value.length
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
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ✅ GLOBAL EMPTY STATE */
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
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
}

.empty-state-icon svg {
  opacity: 0.7;
}

.empty-state-title {
  font-size: 22px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.empty-state-description {
  font-size: 14px;
  color: #718096;
  margin: 0;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.card {
  border: 1px solid #b0b0b0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

/* TOP SECTION - Presupuesto Total */
.top-section {
  height: 25%;
  min-height: 100px;
  flex-shrink: 0;
}

.presupuesto-total-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 25px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  gap: 20px;
}

.presupuesto-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-badge-large {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.icon-badge-large svg {
  width: 28px;
  height: 28px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.presupuesto-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.presupuesto-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.presupuesto-value-container {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.currency-symbol {
  font-size: 24px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.presupuesto-value {
  font-size: 42px;
  font-weight: 800;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.currency-unit {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.categories-badge-container {
  display: flex;
  align-items: center;
}

.categories-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  padding: 10px 16px;
  border-radius: 20px;
}

.badge-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.badge-count {
  font-size: 18px;
  font-weight: 700;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* BOTTOM SECTION */
.bottom-section {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 10px;
  min-height: 0;
  overflow: hidden;
}

.financiamientos-section, .programas-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
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

.loading-state-small, .error-state-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 10px;
  text-align: center;
}

.spinner-small {
  width: 30px;
  height: 30px;
  border: 3px solid rgb(203, 199, 199);
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn-small {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 10px;
}

.retry-btn-small:hover {
  background: #d32f2f;
}

.error-state p, .error-state-small p {
  color: #666;
  font-size: 14px;
  margin: 0 0 10px 0;
}

/* PROGRAMAS */
.programas-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}

.programas-header {
  flex-shrink: 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #535353;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.radar-container {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.programas-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>