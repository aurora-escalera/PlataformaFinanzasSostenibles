<!-- src/modules/qualitativeIndicators/components/PresupuestosView.vue -->
<template>
  <div class="presupuestos-container">
    <div class="card-body">
      <!-- ============================================ -->
      <!-- SECCIÓN 1: PRESUPUESTO TOTAL (100% ancho, arriba) -->
      <!-- ============================================ -->
      <div class="presupuesto-section card">
        <!-- Loading State -->
        <div v-if="presupuestoLoading" class="loading-state-compact">
          <div class="spinner-tiny"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="presupuestoError" class="error-state-compact">
          <p>Error</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!selectedEntity" class="empty-state-compact">
          <div class="empty-icon-tiny">💰</div>
          <p>Selecciona una entidad</p>
        </div>

        <!-- Presupuesto Total -->
        <div v-else class="presupuesto-content">
          <div class="presupuesto-left">
            <div class="presupuesto-header">
              <div class="icon-badge-compact">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                  <path d="M12 18V6"/>
                </svg>
              </div>
              <div class="presupuesto-info">
                <span class="presupuesto-label">Presupuesto Total</span>
                <div class="presupuesto-value">
                  ${{ formatCurrency(presupuestoTotal) }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="presupuesto-right">
            <div class="categorias-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span>{{ categoriasActivas }} categorías activas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- FILA INFERIOR: Financiamientos + Programas -->
      <!-- ============================================ -->
      <div class="bottom-row">
        <!-- SECCIÓN 2: FINANCIAMIENTOS (55% ancho) - BARRAS HORIZONTALES -->
        <div class="financiamientos-section card">
          <!-- Loading State -->
          <div v-if="financiamientosLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando financiamientos...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="financiamientosError" class="error-state">
            <p>Error: {{ financiamientosError }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state">
            <div class="empty-icon">📊</div>
            <p>Selecciona una entidad</p>
          </div>

          <!-- Gráfico de Barras Horizontales -->
          <div v-else class="bars-wrapper">
            <div class="bars-header">
              <h3 class="bars-title">Financiamientos por Sector</h3>
            </div>
            <HorizontalBarsList
              :data="financiamientosData"
              :showIcons="true"
            />
          </div>
        </div>

        <!-- SECCIÓN 3: PROGRAMAS (45% ancho) - RADAR CHART -->
        <div class="programas-section card">
          <!-- Loading State -->
          <div v-if="programasLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando programas...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="programasError" class="error-state">
            <p>Error: {{ programasError }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state">
            <div class="empty-icon">🗺️</div>
            <p>Selecciona una entidad</p>
          </div>

          <!-- Radar Chart de Programas -->
          <div v-else class="radar-wrapper">
            <div class="radar-header">
              <div class="radar-title-with-stats">
                <h3 class="radar-title">Programas por Sector</h3>
                <div class="stats-mini">
                  <div class="stat-item">
                    <span class="stat-value">{{ totalProgramas }}</span>
                    <span class="stat-label">Total</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ sectoresActivos }}</span>
                    <span class="stat-label">Activos</span>
                  </div>
                </div>
              </div>
            </div>
            <RadarChart
              :data="programasData"
              :width="'100%'"
              :height="'100%'"
              :maxValue="maxProgramas"
              :showLegend="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import RadarChart from '@/modules/charts/components/RadarChart.vue'
import HorizontalBarsList from '@/modules/charts/components/HorizontalBarsList.vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName, setActiveYear } from '@/dataConection/storageConfig'

// Props
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

// Composable de Google Sheets
const { fetchData } = useStorageData()

// ============================================
// FUNCIÓN: Limpiar formato numérico (MEJORADA)
// ============================================
const parseNumericValue = (value) => {
  // Si es número, retornar directamente
  if (typeof value === 'number') {
    return value
  }
  
  // Si es null, undefined o vacío, retornar 0
  if (!value || value === '' || value === null || value === undefined) {
    return 0
  }
  
  // Convertir a string y limpiar espacios
  let stringValue = String(value).trim().toUpperCase()
  
  // ✅ CRÍTICO: Manejar valores especiales 'NA' y 'ND'
  if (stringValue === 'NA' || stringValue === 'ND' || stringValue === 'N/A') {
    console.log('⚠️ [parseNumericValue] Valor especial detectado:', value, '→ 0')
    return 0
  }
  
  // Limpiar formato: remover espacios, puntos (separador de miles) y convertir coma decimal a punto
  stringValue = stringValue.replace(/\s/g, '')  // Quitar espacios
  
  // Detectar si tiene coma como decimal (formato europeo)
  const hasCommaDecimal = stringValue.includes(',') && !stringValue.includes('.')
  
  if (hasCommaDecimal) {
    // Formato europeo: 1.234.567,89 → 1234567.89
    stringValue = stringValue.replace(/\./g, '')  // Quitar puntos (miles)
    stringValue = stringValue.replace(/,/g, '.')  // Cambiar coma a punto (decimal)
  } else {
    // Formato estándar o sin decimales: 1.234.567 o 122274902
    stringValue = stringValue.replace(/\./g, '')  // Quitar todos los puntos
  }
  
  const result = parseFloat(stringValue)
  
  if (isNaN(result)) {
    console.error('❌ [parseNumericValue] No se pudo parsear:', value, '→ 0')
    return 0
  }
  
  return result
}

// ============================================
// SECCIÓN 1: PRESUPUESTO TOTAL
// ============================================
const presupuestoTotal = ref(0)
const categoriasActivas = ref(0)
const presupuestoLoading = ref(false)
const presupuestoError = ref(null)

const loadPresupuestoData = async (entityName = null, year = null) => {
  try {
    presupuestoLoading.value = true
    presupuestoError.value = null
    
    console.log('💰 [Presupuesto] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      presupuestoTotal.value = 0
      categoriasActivas.value = 0
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
      const rawValue = entityRow[mapping.variables[0].column]
      console.log('📊 [Presupuesto] Valor crudo:', rawValue)
      presupuestoTotal.value = parseNumericValue(rawValue)
      console.log('✅ [Presupuesto] Valor parseado:', presupuestoTotal.value)
    } else {
      presupuestoTotal.value = 0
      console.log('⚠️ [Presupuesto] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [Presupuesto] Error:', err)
    presupuestoError.value = err.message
  } finally {
    presupuestoLoading.value = false
  }
}

// ============================================
// SECCIÓN 2: FINANCIAMIENTOS (Barras Horizontales)
// ============================================
const financiamientosData = ref([])
const financiamientosLoading = ref(false)
const financiamientosError = ref(null)

const loadFinanciamientosData = async (entityName = null, year = null) => {
  try {
    financiamientosLoading.value = true
    financiamientosError.value = null
    
    console.log('📊 [Financiamientos] Cargando datos')
    
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
      console.log('⚠️ [Financiamientos] No se encontraron datos para', entityName)
      financiamientosData.value = []
      financiamientosLoading.value = false
      return
    }
    
    console.log('📊 [Financiamientos] Fila encontrada:', entityRow)
    
    const transformedData = mapping.variables.map(variable => {
      const rawValue = entityRow[variable.column]
      const parsedValue = parseNumericValue(rawValue)
      
      console.log(`  - ${variable.label}: "${rawValue}" → ${parsedValue}`)
      
      return {
        label: variable.label,
        value: parsedValue,
        color: variable.color
      }
    })
    
    // Ordenar por valor descendente
    transformedData.sort((a, b) => b.value - a.value)
    
    financiamientosData.value = transformedData
    
    // Calcular categorías activas (valores > 0)
    categoriasActivas.value = transformedData.filter(d => d.value > 0).length
    
    console.log('✅ [Financiamientos] Datos cargados:', transformedData.length, 'categorías')
    console.log('✅ [Financiamientos] Categorías activas:', categoriasActivas.value)
    
  } catch (err) {
    console.error('❌ [Financiamientos] Error:', err)
    financiamientosError.value = err.message
  } finally {
    financiamientosLoading.value = false
  }
}

// ============================================
// SECCIÓN 3: PROGRAMAS (Radar Chart)
// ============================================
const programasData = ref([])
const programasLoading = ref(false)
const programasError = ref(null)

const maxProgramas = computed(() => {
  if (programasData.value.length === 0) return 100
  const maxValue = Math.max(...programasData.value.map(d => d.value))
  return Math.ceil(maxValue * 1.2)
})

const totalProgramas = computed(() => {
  return programasData.value.reduce((sum, d) => sum + d.value, 0)
})

const sectoresActivos = computed(() => {
  return programasData.value.filter(d => d.value > 0).length
})

const loadProgramasData = async (entityName = null, year = null) => {
  try {
    programasLoading.value = true
    programasError.value = null
    
    console.log('🗺️ [Programas] Cargando datos')
    
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
      console.log('⚠️ [Programas] No se encontraron datos para', entityName)
      programasData.value = []
      programasLoading.value = false
      return
    }
    
    console.log('🗺️ [Programas] Fila encontrada:', entityRow)
    
    const transformedData = mapping.variables.map(variable => {
      const rawValue = entityRow[variable.column]
      const parsedValue = parseNumericValue(rawValue)
      
      console.log(`  - ${variable.label}: "${rawValue}" → ${parsedValue}`)
      
      return {
        label: variable.label,
        value: parsedValue,
        color: variable.color
      }
    })
    
    programasData.value = transformedData
    console.log('✅ [Programas] Datos cargados:', transformedData.length, 'categorías')
    console.log('✅ [Programas] Total programas:', totalProgramas.value)
    console.log('✅ [Programas] Sectores activos:', sectoresActivos.value)
    
  } catch (err) {
    console.error('❌ [Programas] Error:', err)
    programasError.value = err.message
  } finally {
    programasLoading.value = false
  }
}

// ============================================
// UTILIDADES
// ============================================
const formatCurrency = (value) => {
  if (!value) return '0'
  
  // Formatear en millones si es muy grande
  if (value >= 1000000) {
    const millions = (value / 1000000).toFixed(1)
    return `${millions}M`
  }
  
  // Formatear en miles
  if (value >= 1000) {
    const thousands = (value / 1000).toFixed(0)
    return `${thousands}K`
  }
  
  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 0
  }).format(value)
}

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity, oldEntity) => {
  console.log('🔄 [PresupuestosView] Watch: entidad cambió')
  console.log('  - Anterior:', oldEntity)
  console.log('  - Nueva:', newEntity)
  
  loadPresupuestoData(newEntity, props.selectedYear)
  loadFinanciamientosData(newEntity, props.selectedYear)
  loadProgramasData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear, oldYear) => {
  console.log('🔄 [PresupuestosView] Watch: año cambió')
  console.log('  - Anterior:', oldYear)
  console.log('  - Nuevo:', newYear)
  
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
  console.log('🚀 [PresupuestosView] Montado')
  console.log('📍 Entidad inicial:', props.selectedEntity)
  console.log('📅 Año inicial:', props.selectedYear)
  
  await Promise.all([
    loadPresupuestoData(props.selectedEntity, props.selectedYear),
    loadFinanciamientosData(props.selectedEntity, props.selectedYear),
    loadProgramasData(props.selectedEntity, props.selectedYear)
  ])
  
  console.log('✅ [PresupuestosView] Todos los datos iniciales cargados')
})
</script>

<style scoped>
/* Container principal */
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

.card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  box-sizing: border-box;
}

.card {
  border: 1px solid #b0b0b0;
  border-radius: 10px;
  overflow: hidden;
  background: white;
}

/* ============================================ */
/* SECCIÓN 1: PRESUPUESTO TOTAL (arriba, 100%) */
/* ============================================ */
.presupuesto-section {
  flex: 0 0 auto;
  height: 80px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
}

.presupuesto-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
}

.presupuesto-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.presupuesto-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-badge-compact {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.presupuesto-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.presupuesto-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.presupuesto-value {
  font-size: 24px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.presupuesto-right {
  display: flex;
  align-items: center;
}

.categorias-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.categorias-badge svg {
  color: #0F3759;
  flex-shrink: 0;
}

/* ============================================ */
/* FILA INFERIOR: Financiamientos + Programas */
/* ============================================ */
.bottom-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* SECCIÓN 2: FINANCIAMIENTOS (55% ancho) */
.financiamientos-section {
  flex: 0 0 55%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* SECCIÓN 3: PROGRAMAS (45% ancho) */
.programas-section {
  flex: 0 0 45%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ============================================ */
/* BARRAS HORIZONTALES WRAPPER */
/* ============================================ */
.bars-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}

.bars-header {
  margin-bottom: 8px;
  flex-shrink: 0;
}

.bars-title {
  font-size: 14px;
  font-weight: 600;
  color: #535353;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================ */
/* RADAR CHARTS WRAPPER */
/* ============================================ */
.radar-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}

.radar-header {
  margin-bottom: 8px;
  flex-shrink: 0;
}

.radar-title {
  font-size: 14px;
  font-weight: 600;
  color: #535353;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.radar-title-with-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-mini {
  display: flex;
  gap: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.stat-label {
  font-size: 9px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================ */
/* LOADING, ERROR, EMPTY STATES */
/* ============================================ */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 15px;
  text-align: center;
}

.loading-state-compact, .error-state-compact, .empty-state-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 8px;
  text-align: center;
}

.spinner-small {
  width: 28px;
  height: 28px;
  border: 3px solid rgb(203, 199, 199);
  border-top: 3px solid #0F3759;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.spinner-tiny {
  width: 20px;
  height: 20px;
  border: 2px solid rgb(203, 199, 199);
  border-top: 2px solid #0F3759;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-icon-tiny {
  font-size: 24px;
  margin-bottom: 6px;
  opacity: 0.4;
}

.empty-state p, .empty-state-compact p {
  font-size: 11px;
  color: #999;
  margin: 0;
  line-height: 1.3;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.error-state p {
  font-size: 12px;
  color: #ef4444;
  margin: 0;
}

.error-state-compact p {
  font-size: 10px;
  color: #ef4444;
  margin: 0;
}
</style>