<!-- src/modules/qualitativeIndicators/components/AmbientalesView.vue -->
<!-- ✅ ACTUALIZADO: Empty state centralizado cuando no hay entidad seleccionada -->
<template>
  <div class="ambientales-container">
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
          Selecciona una entidad federativa en el filtro superior para visualizar los indicadores ambientales.
        </p>
      </div>
    </div>

    <!-- ✅ CONTENIDO NORMAL cuando hay entidad seleccionada -->
    <div v-else class="card-body">
      <!-- Left Side Container -->
      <div class="left-card-container">
        <!-- Top: Horizontal Bar Chart - Incendios Forestales -->
        <div class="bar-graph card">
          <div v-if="incendiosLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando datos...</p>
          </div>

          <div v-else-if="incendiosError" class="error-state">
            <p>Error: {{ incendiosError }}</p>
            <button @click="loadIncendiosData(selectedEntity, selectedYear)" class="retry-btn-small">
              Reintentar
            </button>
          </div>

          <HorizontalBarChart
            v-else
            :variables="incendiosData"
            width="100%"
            height="100%"
            title="Incendios forestales en hectáreas"
            :showFilters="true"
            :showLegend="true"
            barHeight="20px"
            barGap="1px"
          />
        </div>
        
        <!-- Bottom: Bottle Graph - Residuos Sólidos Urbanos -->
        <div class="bottle-graphs card">
          <div class="title-bottle">
            <h2>Promedio diario de residuos sólidos urbanos recolectados</h2>
          </div>
          <div class="body-bottle">
            <div v-if="residuosLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="residuosError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <template v-else>
              <div class="bottle-graph">
                <BottleChart :value="residuosPercentage" />
              </div>
              <div class="bottle-number number">{{ formatNumber(residuosValue) }} kg</div>
            </template>
          </div>
        </div>
      </div>

      <!-- Right Side Container -->
      <div class="right-card-container">
        <!-- Top Right Container -->
        <div class="top-right-card-container">
          <!-- Area Chart - Emisiones Contaminantes -->
          <div class="area-chart card">
            <div class="title-area-chart">
              <h3>Emisiones de contaminantes atmosféricos por fuente en toneladas.</h3>
            </div>
            <div class="area-chart-container">
              <div v-if="emisionesLoading" class="loading-state-small">
                <div class="spinner-small"></div>
              </div>

              <div v-else-if="emisionesError" class="error-state-small">
                <p>Error cargando datos</p>
              </div>

              <AreaChart 
                v-else
                :excelData="emisionesData"
                title="Emisiones por fuente"
              />
            </div>
          </div>
          
          <!-- Gauge Chart - Consumo de Energía Eléctrica -->
          <div class="gauge-container card">
            <div class="title-gauge">
              <h3>Consumo de energía eléctrica</h3>
            </div>
            
            <div v-if="energiaLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="energiaError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <template v-else>
              <div class="gauge-graph">
                <GaugeChart :value="energiaPercentage" />
              </div>
              <div class="gauge-number number">{{ formatNumber(energiaValue) }} GWh</div>
            </template>
          </div>
        </div>
        
        <!-- Bottom Right Container -->
        <div class="bottom-right-card-container">
          <div class="bottom-bar-graph card">
            <div v-if="areasLoading" class="loading-state">
              <div class="spinner-small"></div>
              <p>Cargando datos...</p>
            </div>

            <div v-else-if="areasError" class="error-state">
              <p>Error: {{ areasError }}</p>
              <button @click="loadAreasNaturalesData(selectedEntity, selectedYear)" class="retry-btn-small">
                Reintentar
              </button>
            </div>

            <VerticalBarChart
              v-else
              :variables="areasNaturalesData"
              width="100%"
              height="100%"
              title="Áreas naturales protegidas"
              :showFilters="true"
              :showLegend="true"
              barHeight="20px"
              barGap="1px"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import HorizontalBarChart from '@/modules/charts/components/HorizontalBarChart.vue'
import BottleChart from '@/modules/object/component/bottleChart.vue'
import AreaChart from '@/modules/charts/components/AreaChart.vue'
import GaugeChart from '@/modules/object/component/GaugeChart.vue'
import VerticalBarChart from '@/modules/charts/components/VerticalBarChart.vue'
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

const { fetchData, transform } = useStorageData()

// ============================================
// INCENDIOS FORESTALES
// ============================================
const incendiosData = ref([])
const incendiosLoading = ref(false)
const incendiosError = ref(null)

const loadIncendiosData = async (entityName = null, year = null) => {
  try {
    incendiosLoading.value = true
    incendiosError.value = null
    
    if (!entityName) {
      incendiosData.value = []
      incendiosLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('incendiosForestales')
    const sheetName = getSheetName('incendiosForestales')
    const rawData = await fetchData('incendiosForestales', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      incendiosData.value = []
      incendiosLoading.value = false
      return
    }
    
    const transformedData = mapping.variables
      .sort((a, b) => a.order - b.order)
      .map(variable => ({
        key: variable.key,
        label: variable.label,
        value: parseFloat(entityRow[variable.column]) || 0,
        color: variable.color,
        colorClass: variable.colorClass || 'default',
        active: true
      }))
    
    incendiosData.value = transformedData
    
  } catch (err) {
    console.error('❌ [Incendios] Error:', err)
    incendiosError.value = err.message
  } finally {
    incendiosLoading.value = false
  }
}

// ============================================
// RESIDUOS SÓLIDOS URBANOS
// ============================================
const residuosValue = ref(0)
const residuosPercentage = ref(0)
const residuosLoading = ref(false)
const residuosError = ref(null)

const loadResiduosData = async (entityName = null, year = null) => {
  try {
    residuosLoading.value = true
    residuosError.value = null
    
    if (!entityName) {
      residuosValue.value = 0
      residuosPercentage.value = 0
      residuosLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('residuosSolidos')
    const sheetName = getSheetName('residuosSolidos')
    const rawData = await fetchData('residuosSolidos', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      residuosValue.value = parseFloat(entityRow[mapping.valueColumn]) || 0
      residuosPercentage.value = parseFloat(entityRow[mapping.percentageColumn]) || 0
    } else {
      residuosValue.value = 0
      residuosPercentage.value = 0
    }
    
  } catch (err) {
    console.error('❌ [Residuos] Error:', err)
    residuosError.value = err.message
  } finally {
    residuosLoading.value = false
  }
}

// ============================================
// EMISIONES CONTAMINANTES
// ============================================
const emisionesData = ref([])
const emisionesLoading = ref(false)
const emisionesError = ref(null)

const loadEmisionesData = async (entityName = null, year = null) => {
  try {
    emisionesLoading.value = true
    emisionesError.value = null
    
    if (!entityName) {
      emisionesData.value = []
      emisionesLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('emisiones')
    const sheetName = getSheetName('emisiones')
    const rawData = await fetchData('emisiones', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      emisionesData.value = mapping.variables.map(variable => ({
        label: variable.label,
        value: parseFloat(entityRow[variable.column]) || 0
      }))
    } else {
      emisionesData.value = []
    }
    
  } catch (err) {
    console.error('❌ [Emisiones] Error:', err)
    emisionesError.value = err.message
  } finally {
    emisionesLoading.value = false
  }
}

// ============================================
// CONSUMO DE ENERGÍA ELÉCTRICA
// ============================================
const energiaValue = ref(0)
const energiaPercentage = ref(0)
const energiaLoading = ref(false)
const energiaError = ref(null)

const loadEnergiaData = async (entityName = null, year = null) => {
  try {
    energiaLoading.value = true
    energiaError.value = null
    
    if (!entityName) {
      energiaValue.value = 0
      energiaPercentage.value = 0
      energiaLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('energia')
    const sheetName = getSheetName('energia')
    const rawData = await fetchData('energia', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      energiaValue.value = parseFloat(entityRow[mapping.valueColumn]) || 0
      energiaPercentage.value = parseFloat(entityRow[mapping.percentageColumn]) || 0
    } else {
      energiaValue.value = 0
      energiaPercentage.value = 0
    }
    
  } catch (err) {
    console.error('❌ [Energía] Error:', err)
    energiaError.value = err.message
  } finally {
    energiaLoading.value = false
  }
}

// ============================================
// ÁREAS NATURALES PROTEGIDAS
// ============================================
const areasNaturalesData = ref([])
const areasLoading = ref(false)
const areasError = ref(null)

const loadAreasNaturalesData = async (entityName = null, year = null) => {
  try {
    areasLoading.value = true
    areasError.value = null
    
    if (!entityName) {
      areasNaturalesData.value = []
      areasLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('areasNaturales')
    const sheetName = getSheetName('areasNaturales')
    const rawData = await fetchData('areasNaturales', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      areasNaturalesData.value = []
      areasLoading.value = false
      return
    }
    
    const transformedData = mapping.variables.map(variable => ({
      key: variable.key,
      label: variable.label,
      value: parseFloat(entityRow[variable.column]) || 0,
      color: variable.color,
      colorClass: variable.colorClass || 'default',
      active: false
    }))
    
    areasNaturalesData.value = transformedData
    
  } catch (err) {
    console.error('❌ [Áreas Naturales] Error:', err)
    areasError.value = err.message
  } finally {
    areasLoading.value = false
  }
}

// ============================================
// UTILIDADES
// ============================================
const formatNumber = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('es-MX').format(value)
}

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity) => {
  loadIncendiosData(newEntity, props.selectedYear)
  loadResiduosData(newEntity, props.selectedYear)
  loadEmisionesData(newEntity, props.selectedYear)
  loadEnergiaData(newEntity, props.selectedYear)
  loadAreasNaturalesData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear) => {
  if (props.selectedEntity) {
    loadIncendiosData(props.selectedEntity, newYear)
    loadResiduosData(props.selectedEntity, newYear)
    loadEmisionesData(props.selectedEntity, newYear)
    loadEnergiaData(props.selectedEntity, newYear)
    loadAreasNaturalesData(props.selectedEntity, newYear)
  }
}, { immediate: false })

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  await Promise.all([
    loadIncendiosData(props.selectedEntity, props.selectedYear),
    loadResiduosData(props.selectedEntity, props.selectedYear),
    loadEmisionesData(props.selectedEntity, props.selectedYear),
    loadEnergiaData(props.selectedEntity, props.selectedYear),
    loadAreasNaturalesData(props.selectedEntity, props.selectedYear)
  ])
})
</script>

<style scoped>
.ambientales-container {
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

/* CARD BODY */
.card-body {
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.card {
  border: 1px solid #b0b0b0;
  border-radius: 12px;
  overflow: hidden;
}

.left-card-container {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.bar-graph {
  height: 75%;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
}

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

.bottle-graphs {
  height: 25%;
  border-radius: 12px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.title-bottle {
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

h2 {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  color: #535353;
  font-size: 14px;
  margin: 0;
}

.body-bottle {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  padding: 9px;
  flex: 1;
}

.bottle-graph {
  width: 85%;
  height: 100%;
  overflow: visible;
}

.number {
  width: 35%;
  color: #58778F;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.right-card-container {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  gap: 10px;
}

.top-right-card-container {
  display: flex;
  flex-direction: row;
  border-radius: 12px;
  height: 50%;
  gap: 10px;
}

.area-chart {
  width: 65%;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.title-area-chart {
  padding: 15px 10px;
  width: 35%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.area-chart-container {
  width: 65%;
  padding: 10px;
}

h3 {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 300;
  color: #535353;
  font-size: 14px;
  padding-left: 15px;
  line-height: 1.3;
}

.gauge-container {
  width: 35%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title-gauge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 10px;
  height: 30%;
}

.gauge-graph {
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-number {
  padding: 10px;
  height: 20%;
  width: 100%;
  color: #58778F;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-right-card-container {
  height: 50%;
  border-radius: 12px;
}

.bottom-bar-graph {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}
</style>