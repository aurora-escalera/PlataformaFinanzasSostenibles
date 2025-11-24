<!-- src/modules/qualitativeIndicators/components/GobernabilidadView.vue -->
<template>
  <div class="gobernabilidad-container">
    <div class="card-body">
      <!-- ============================================ -->
      <!-- FILA 1: 3 Secciones (33% cada una) -->
      <!-- ============================================ -->
      <div class="top-row">
        <!-- SECCIÓN 1: SATISFACCIÓN CIUDADANA (VerticalBarChart) -->
        <div class="satisfaccion-section card">
          <!-- Loading State -->
          <div v-if="satisfaccionLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando datos...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="satisfaccionError" class="error-state">
            <p>Error: {{ satisfaccionError }}</p>
            <button @click="loadSatisfaccionData(selectedEntity, selectedYear)" class="retry-btn-small">
              Reintentar
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state">
            <div class="empty-icon">📊</div>
            <h4>Selecciona una entidad</h4>
            <p>Selecciona una entidad federativa para ver la satisfacción ciudadana.</p>
          </div>

          <!-- VerticalBarChart -->
          <VerticalBarChart
            v-else
            :variables="satisfaccionData"
            :title="'Satisfacción Ciudadana'"
            :width="'100%'"
            :height="'100%'"
            :showLegend="true"
            :showTooltip="true"
          />
        </div>

        <!-- SECCIÓN 2: IGOPP -->
        <div class="igopp-section card">
          <!-- Loading State -->
          <div v-if="igoppLoading" class="loading-state-small">
            <div class="spinner-small"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="igoppError" class="error-state-small">
            <p>Error cargando datos</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state-small">
            <div class="empty-icon-small">📊</div>
            <p>Selecciona una entidad</p>
          </div>

          <!-- Datos de IGOPP -->
          <div v-else class="metric-card-content">
            <div class="metric-header">
              <div class="icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 class="metric-title">IGOPP</h3>
            </div>
            
            <div class="metric-value-large">{{ formatNumber(igoppValue) }}</div>
            
            <div class="metric-progress">
              <div class="progress-bar-horizontal">
                <div class="progress-fill" :style="{ width: `${igoppValue}%` }">
                  <span class="progress-text">{{ igoppValue.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
            
            <div class="metric-label-small">Índice de Gobierno Abierto y Participativo</div>
          </div>
        </div>

        <!-- SECCIÓN 3: BIPE -->
        <div class="bipe-section card">
          <!-- Loading State -->
          <div v-if="bipeLoading" class="loading-state-small">
            <div class="spinner-small"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="bipeError" class="error-state-small">
            <p>Error cargando datos</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state-small">
            <div class="empty-icon-small">🏛️</div>
            <p>Selecciona una entidad</p>
          </div>

          <!-- Datos de BIPE -->
          <div v-else class="metric-card-content">
            <div class="metric-header">
              <div class="icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3 class="metric-title">BIPE</h3>
            </div>
            
            <div class="metric-value-large">{{ formatNumber(bipeValue) }}</div>
            
            <div class="metric-progress">
              <div class="progress-bar-horizontal">
                <div class="progress-fill" :style="{ width: `${bipeValue}%` }">
                  <span class="progress-text">{{ bipeValue.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
            
            <div class="metric-label-small">Buenas Prácticas en Evaluación</div>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- FILA 2: 2 Secciones (50% cada una) -->
      <!-- ============================================ -->
      <div class="bottom-row">
        <!-- SECCIÓN 4: ITDIF + ICI -->
        <div class="itdif-ici-section card">
          <!-- Loading State -->
          <div v-if="itdifLoading || iciLoading" class="loading-state-small">
            <div class="spinner-small"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="itdifError || iciError" class="error-state-small">
            <p>Error cargando datos</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state-small">
            <div class="empty-icon-small">📑</div>
            <p>Selecciona una entidad</p>
          </div>

          <!-- Datos de ITDIF + ICI -->
          <div v-else class="itdif-ici-content">
            <!-- ITDIF (arriba) -->
            <div class="itdif-compact">
              <div class="metric-header-inline">
                <div class="icon-badge-small">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <span class="metric-title-inline">ITDIF</span>
                <span class="metric-value-inline">{{ formatNumber(itdifValue) }}</span>
                <div class="progress-bar-inline">
                  <div class="progress-fill-inline" :style="{ width: `${itdifValue}%` }"></div>
                </div>
                <span class="metric-percentage-inline">{{ itdifValue.toFixed(1) }}%</span>
              </div>
            </div>

            <!-- ICI VerticalBarChart (abajo) -->
            <div class="ici-chart-wrapper">
              <VerticalBarChart
                :variables="iciData"
                :title="'ICI - Índice de Información Presupuestal'"
                :width="'100%'"
                :height="'100%'"
                :showLegend="false"
                :showTooltip="true"
              />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 5: PbR-SED -->
        <div class="pbrsed-section card">
          <!-- Loading State -->
          <div v-if="pbrsedLoading" class="loading-state-small">
            <div class="spinner-small"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="pbrsedError" class="error-state-small">
            <p>Error cargando datos</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state-small">
            <div class="empty-icon-small">💰</div>
            <p>Selecciona una entidad</p>
          </div>

          <!-- Datos de PbR-SED -->
          <div v-else class="pbrsed-content">
            <div class="metric-header">
              <div class="icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 class="metric-title">PbR-SED</h3>
            </div>

            <!-- Mini-card 1: PBRSED -->
            <div class="pbrsed-mini-card">
              <div class="mini-card-header">
                <span class="mini-card-label">PBRSED</span>
                <span class="mini-card-value">{{ formatNumber(pbrsedValue) }}</span>
              </div>
              <div class="progress-bar-horizontal-mini">
                <div class="progress-fill-mini" :style="{ width: `${pbrsedValue}%` }">
                  <span class="progress-text-mini">{{ pbrsedValue.toFixed(1) }}%</span>
                </div>
              </div>
            </div>

            <!-- Mini-card 2: Diagnóstico -->
            <div class="pbrsed-mini-card">
              <div class="mini-card-header">
                <span class="mini-card-label">Diagnóstico</span>
                <span class="mini-card-value">{{ formatNumber(diagnosticoValue) }}</span>
              </div>
              <div class="progress-bar-horizontal-mini">
                <div class="progress-fill-mini" :style="{ width: `${diagnosticoValue}%` }">
                  <span class="progress-text-mini">{{ diagnosticoValue.toFixed(1) }}%</span>
                </div>
              </div>
            </div>

            <div class="metric-label-small">Presupuesto basado en Resultados - Sistema de Evaluación del Desempeño</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import VerticalBarChart from '@/modules/charts/components/VerticalBarChart.vue'
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
// FUNCIÓN: Limpiar formato numérico
// ============================================
const parseNumericValue = (value) => {
  if (typeof value === 'number') {
    return value
  }
  
  if (!value || value === '') {
    return 0
  }
  
  let stringValue = String(value).trim()
  stringValue = stringValue.replace(/\s/g, '')
  stringValue = stringValue.replace(/\./g, '')
  stringValue = stringValue.replace(/,/g, '.')
  
  const result = parseFloat(stringValue)
  
  if (isNaN(result)) {
    console.error('❌ [parseNumericValue] No se pudo parsear:', value)
    return 0
  }
  
  return result
}

// ============================================
// SECCIÓN 1: SATISFACCIÓN CIUDADANA (Federal + Estatal)
// ============================================
const satisfaccionData = ref([])
const satisfaccionLoading = ref(false)
const satisfaccionError = ref(null)

const loadSatisfaccionData = async (entityName = null, year = null) => {
  try {
    satisfaccionLoading.value = true
    satisfaccionError.value = null
    
    console.log('📊 [Satisfacción] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      satisfaccionData.value = []
      satisfaccionLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    // Cargar Satisfacción Federal
    const mappingFederal = getMapping('satisfaccionFederal')
    const sheetNameFederal = getSheetName('satisfaccionFederal')
    const rawDataFederal = await fetchData('satisfaccionFederal', sheetNameFederal)
    
    // Cargar Satisfacción Estatal
    const mappingEstatal = getMapping('satisfaccionEstatal')
    const sheetNameEstatal = getSheetName('satisfaccionEstatal')
    const rawDataEstatal = await fetchData('satisfaccionEstatal', sheetNameEstatal)
    
    if (rawDataFederal.length === 0 || rawDataEstatal.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRowFederal = rawDataFederal.find(row => row[mappingFederal.categoryColumn] === entityName)
    const entityRowEstatal = rawDataEstatal.find(row => row[mappingEstatal.categoryColumn] === entityName)
    
    if (!entityRowFederal || !entityRowEstatal) {
      console.log('⚠️ [Satisfacción] No se encontraron datos para', entityName)
      satisfaccionData.value = []
      satisfaccionLoading.value = false
      return
    }
    
    const transformedData = [
      {
        key: 'federal',
        label: 'Federal',
        value: parseNumericValue(entityRowFederal[mappingFederal.variables[0].column]),
        color: '#0F3759',
        colorClass: 'blue',
        active: true
      },
      {
        key: 'estatal',
        label: 'Estatal',
        value: parseNumericValue(entityRowEstatal[mappingEstatal.variables[0].column]),
        color: '#3B5A70',
        colorClass: 'blue',
        active: true
      }
    ]
    
    satisfaccionData.value = transformedData
    console.log('✅ [Satisfacción] Datos cargados:', transformedData)
    
  } catch (err) {
    console.error('❌ [Satisfacción] Error:', err)
    satisfaccionError.value = err.message
  } finally {
    satisfaccionLoading.value = false
  }
}

// ============================================
// SECCIÓN 2: IGOPP
// ============================================
const igoppValue = ref(0)
const igoppLoading = ref(false)
const igoppError = ref(null)

const loadIGOPPData = async (entityName = null, year = null) => {
  try {
    igoppLoading.value = true
    igoppError.value = null
    
    console.log('📊 [IGOPP] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      igoppValue.value = 0
      igoppLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('IGOPP')
    const sheetName = getSheetName('IGOPP')
    const rawData = await fetchData('IGOPP', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      igoppValue.value = parseNumericValue(entityRow[mapping.variables[0].column])
      console.log('✅ [IGOPP] Valor:', igoppValue.value)
    } else {
      igoppValue.value = 0
      console.log('⚠️ [IGOPP] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [IGOPP] Error:', err)
    igoppError.value = err.message
  } finally {
    igoppLoading.value = false
  }
}

// ============================================
// SECCIÓN 3: BIPE
// ============================================
const bipeValue = ref(0)
const bipeLoading = ref(false)
const bipeError = ref(null)

const loadBIPEData = async (entityName = null, year = null) => {
  try {
    bipeLoading.value = true
    bipeError.value = null
    
    console.log('🏛️ [BIPE] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      bipeValue.value = 0
      bipeLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('BIPE')
    const sheetName = getSheetName('BIPE')
    const rawData = await fetchData('BIPE', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      bipeValue.value = parseNumericValue(entityRow[mapping.variables[0].column])
      console.log('✅ [BIPE] Valor:', bipeValue.value)
    } else {
      bipeValue.value = 0
      console.log('⚠️ [BIPE] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [BIPE] Error:', err)
    bipeError.value = err.message
  } finally {
    bipeLoading.value = false
  }
}

// ============================================
// SECCIÓN 4: ITDIF
// ============================================
const itdifValue = ref(0)
const itdifLoading = ref(false)
const itdifError = ref(null)

const loadITDIFData = async (entityName = null, year = null) => {
  try {
    itdifLoading.value = true
    itdifError.value = null
    
    console.log('📑 [ITDIF] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      itdifValue.value = 0
      itdifLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('ITDIF')
    const sheetName = getSheetName('ITDIF')
    const rawData = await fetchData('ITDIF', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      itdifValue.value = parseNumericValue(entityRow[mapping.variables[0].column])
      console.log('✅ [ITDIF] Valor:', itdifValue.value)
    } else {
      itdifValue.value = 0
      console.log('⚠️ [ITDIF] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [ITDIF] Error:', err)
    itdifError.value = err.message
  } finally {
    itdifLoading.value = false
  }
}

// ============================================
// SECCIÓN 4: ICI (VerticalBarChart)
// ============================================
const iciData = ref([])
const iciLoading = ref(false)
const iciError = ref(null)

const loadICIData = async (entityName = null, year = null) => {
  try {
    iciLoading.value = true
    iciError.value = null
    
    console.log('📊 [ICI] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      iciData.value = []
      iciLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('ICI')
    const sheetName = getSheetName('ICI')
    const rawData = await fetchData('ICI', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      console.log('⚠️ [ICI] No se encontraron datos para', entityName)
      iciData.value = []
      iciLoading.value = false
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
    
    iciData.value = transformedData
    console.log('✅ [ICI] Datos cargados:', transformedData.length, 'variables')
    
  } catch (err) {
    console.error('❌ [ICI] Error:', err)
    iciError.value = err.message
  } finally {
    iciLoading.value = false
  }
}

// ============================================
// SECCIÓN 5: PbR-SED (PBRSED + Diagnóstico)
// ============================================
const pbrsedValue = ref(0)
const diagnosticoValue = ref(0)
const pbrsedLoading = ref(false)
const pbrsedError = ref(null)

const loadPBRSEDData = async (entityName = null, year = null) => {
  try {
    pbrsedLoading.value = true
    pbrsedError.value = null
    
    console.log('💰 [PBRSED] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      pbrsedValue.value = 0
      diagnosticoValue.value = 0
      pbrsedLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('PBRSED')
    const sheetName = getSheetName('PBRSED')
    const rawData = await fetchData('PBRSED', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      pbrsedValue.value = parseNumericValue(entityRow[mapping.variables[0].column])
      diagnosticoValue.value = parseNumericValue(entityRow[mapping.variables[1].column])
      
      console.log('✅ [PBRSED] Datos cargados')
      console.log('  - PBRSED:', pbrsedValue.value)
      console.log('  - Diagnóstico:', diagnosticoValue.value)
    } else {
      pbrsedValue.value = 0
      diagnosticoValue.value = 0
      console.log('⚠️ [PBRSED] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [PBRSED] Error:', err)
    pbrsedError.value = err.message
  } finally {
    pbrsedLoading.value = false
  }
}

// ============================================
// UTILIDADES
// ============================================
const formatNumber = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('es-MX').format(value)
}

const handleBack = () => {
  emit('back')
}

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity, oldEntity) => {
  console.log('🔄 [GobernabilidadView] Watch: entidad cambió')
  console.log('  - Anterior:', oldEntity)
  console.log('  - Nueva:', newEntity)
  
  loadSatisfaccionData(newEntity, props.selectedYear)
  loadIGOPPData(newEntity, props.selectedYear)
  loadBIPEData(newEntity, props.selectedYear)
  loadITDIFData(newEntity, props.selectedYear)
  loadICIData(newEntity, props.selectedYear)
  loadPBRSEDData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear, oldYear) => {
  console.log('🔄 [GobernabilidadView] Watch: año cambió')
  console.log('  - Anterior:', oldYear)
  console.log('  - Nuevo:', newYear)
  
  if (props.selectedEntity) {
    loadSatisfaccionData(props.selectedEntity, newYear)
    loadIGOPPData(props.selectedEntity, newYear)
    loadBIPEData(props.selectedEntity, newYear)
    loadITDIFData(props.selectedEntity, newYear)
    loadICIData(props.selectedEntity, newYear)
    loadPBRSEDData(props.selectedEntity, newYear)
  }
}, { immediate: false })

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  console.log('🚀 [GobernabilidadView] Montado')
  console.log('📍 Entidad inicial:', props.selectedEntity)
  console.log('📅 Año inicial:', props.selectedYear)
  
  await Promise.all([
    loadSatisfaccionData(props.selectedEntity, props.selectedYear),
    loadIGOPPData(props.selectedEntity, props.selectedYear),
    loadBIPEData(props.selectedEntity, props.selectedYear),
    loadITDIFData(props.selectedEntity, props.selectedYear),
    loadICIData(props.selectedEntity, props.selectedYear),
    loadPBRSEDData(props.selectedEntity, props.selectedYear)
  ])
  
  console.log('✅ [GobernabilidadView] Todos los datos iniciales cargados')
})
</script>

<style scoped>
/* Container principal */
.gobernabilidad-container {
  background-color: white;
  border-radius: 15px;
  height: 100%;
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

/* ============================================ */
/* FILA 1: 3 secciones (33% each) */
/* ============================================ */
.top-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 50%;
  width: 100%;
  min-height: 0;
}

.satisfaccion-section {
  flex: 1;
  min-width: 0;
}

.igopp-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.bipe-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ============================================ */
/* FILA 2: 2 secciones (50% each) */
/* ============================================ */
.bottom-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 50%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.itdif-ici-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pbrsed-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ============================================ */
/* LOADING, ERROR, EMPTY STATES */
/* ============================================ */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 20px;
}

.loading-state-small, .error-state-small, .empty-state-small {
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

.empty-state-small p {
  color: #999;
  font-size: 12px;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-icon-small {
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.4;
}

.empty-state h4 {
  font-size: 18px;
  font-weight: 500;
  color: #535353;
  margin: 0 0 10px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================ */
/* METRIC CARD CONTENT (IGOPP, BIPE) */
/* ============================================ */
.metric-card-content {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  width: 100%;
  padding-bottom: 6px;
  border-bottom: 2px solid #e2e8f0;
}

.icon-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.icon-badge svg {
  width: 18px;
  height: 18px;
}

.metric-title {
  font-size: 14px;
  font-weight: 600;
  color: #535353;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.metric-value-large {
  font-size: 42px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.metric-progress {
  width: 100%;
}

.progress-bar-horizontal {
  position: relative;
  width: 100%;
  height: 45px;
  background: #e2e8f0;
  border-radius: 22.5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0F3759 0%, #1a4d7a 100%);
  transition: width 0.6s ease;
  border-radius: 22.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  font-size: 16px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.metric-label-small {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.3;
}

/* ============================================ */
/* ITDIF + ICI CONTENT */
/* ============================================ */
.itdif-ici-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  gap: 10px;
}

.itdif-compact {
  flex-shrink: 0;
  padding: 8px 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.metric-header-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-badge-small {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.icon-badge-small svg {
  width: 14px;
  height: 14px;
}

.metric-title-inline {
  font-size: 13px;
  font-weight: 600;
  color: #535353;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.metric-value-inline {
  font-size: 18px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin-left: 8px;
}

.progress-bar-inline {
  flex: 1;
  height: 20px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin: 0 10px;
}

.progress-fill-inline {
  height: 100%;
  background: linear-gradient(90deg, #0F3759 0%, #1a4d7a 100%);
  transition: width 0.6s ease;
  border-radius: 10px;
}

.metric-percentage-inline {
  font-size: 13px;
  font-weight: 600;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  flex-shrink: 0;
}

.ici-chart-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ============================================ */
/* PBRSED CONTENT */
/* ============================================ */
.pbrsed-content {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pbrsed-mini-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mini-card-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mini-card-value {
  font-size: 20px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-bar-horizontal-mini {
  position: relative;
  width: 100%;
  height: 35px;
  background: #e2e8f0;
  border-radius: 17.5px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, #0F3759 0%, #1a4d7a 100%);
  transition: width 0.6s ease;
  border-radius: 17.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text-mini {
  font-size: 14px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>