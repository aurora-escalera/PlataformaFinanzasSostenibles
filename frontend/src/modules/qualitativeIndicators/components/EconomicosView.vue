<!-- src/modules/qualitativeIndicators/components/EconomicosView.vue -->
<!-- ✅ ACTUALIZADO: Todos los componentes vinculados con filtros y Google Sheets -->
<template>
  <div class="ambientales-container">
    <div class="card-body">
      <!-- Left Side Container -->
      <div class="left-card-container">
        <!-- Top: Horizontal Bar Chart - Incendios Forestales -->
        <div class="bar-graph card">
          <!-- Loading State -->
          <div v-if="ingresoTotalLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando datos...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="ingresoTotalError" class="error-state">
            <p>Error: {{ ingresoTotalError }}</p>
            <button @click="loadIngresoTotalData(selectedEntity, selectedYear)" class="retry-btn-small">
              Reintentar
            </button>
          </div>

          <!-- Empty State cuando no hay entidad seleccionada -->
          <div v-else-if="!selectedEntity" class="empty-state">
            <div class="empty-icon">🗺️</div>
            <h4>Selecciona una entidad</h4>
            <p>Selecciona una entidad federativa en el filtro superior para ver los datos de incendios forestales.</p>
          </div>

          <!-- HorizontalBarChart con datos dinámicos -->
          <HorizontalBarChart
            v-else
            :variables="ingresoTotalData"
            width="100%"
            height="100%"
            title="Ingresos Totales en 2024"
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
            <!-- Loading State -->
            <div v-if="residuosLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="residuosError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="!selectedEntity" class="empty-state-small">
              <p>Selecciona una entidad</p>
            </div>

            <!-- Datos -->
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
              <!-- Loading State -->
              <div v-if="emisionesLoading" class="loading-state-small">
                <div class="spinner-small"></div>
              </div>

              <!-- Error State -->
              <div v-else-if="emisionesError" class="error-state-small">
                <p>Error cargando datos</p>
              </div>

              <!-- Empty State -->
              <div v-else-if="!selectedEntity" class="empty-state-small">
                <p>Selecciona una entidad</p>
              </div>

              <!-- Datos -->
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
            
            <!-- Loading State -->
            <div v-if="energiaLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="energiaError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="!selectedEntity" class="empty-state-small">
              <p>Selecciona una entidad</p>
            </div>

            <!-- Datos -->
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
            <!-- Loading State -->
            <div v-if="areasLoading" class="loading-state">
              <div class="spinner-small"></div>
              <p>Cargando datos...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="areasError" class="error-state">
              <p>Error: {{ areasError }}</p>
              <button @click="loadAreasNaturalesData(selectedEntity, selectedYear)" class="retry-btn-small">
                Reintentar
              </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="!selectedEntity" class="empty-state">
              <div class="empty-icon">🗺️</div>
              <h4>Selecciona una entidad</h4>
              <p>Selecciona una entidad federativa para ver las áreas naturales protegidas.</p>
            </div>

            <!-- Datos -->
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
const { fetchData, transform } = useStorageData()

// ============================================
// Ingresos Totales (HorizontalBarChart)
// ============================================
const ingresoTotalData = ref([])
const ingresoTotalLoading = ref(false)
const ingresoTotalError = ref(null)

const loadIngresoTotalData = async (entityName = null, year = null) => {
  try {
    ingresoTotalLoading.value = true
    ingresoTotalError.value = null
    
    console.log('💰 [Ingreso Total] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      ingresoTotalData.value = []
      ingresoTotalLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('ingresoTotal')
    const sheetName = getSheetName('ingresoTotal')
    
    const rawData = await fetchData('ingresoTotal', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    // Buscar la fila de la entidad
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      console.log('⚠️ [Ingreso Total] No se encontraron datos para', entityName)
      ingresoTotalData.value = []
      ingresoTotalLoading.value = false
      return
    }
    
    // ✅ Crear un array con UN SOLO elemento
    const transformedData = [{
      key: 'ingresoTotal',
      label: 'Ingreso Total',
      value: parseFloat(entityRow[mapping.valueColumn]) || 0,
      color: '#0F3759',
      colorClass: 'blue',
      active: true
    }]
    
    ingresoTotalData.value = transformedData
    console.log('✅ [Ingreso Total] Datos cargados:', transformedData)
    
  } catch (err) {
    console.error('❌ [Ingreso Total] Error:', err)
    ingresoTotalError.value = err.message
  } finally {
    ingresoTotalLoading.value = false
  }
}

// ============================================
// RESIDUOS SÓLIDOS URBANOS (BottleChart)
// ============================================
const residuosValue = ref(0)
const residuosPercentage = ref(0)
const residuosLoading = ref(false)
const residuosError = ref(null)

const loadResiduosData = async (entityName = null, year = null) => {
  try {
    residuosLoading.value = true
    residuosError.value = null
    
    console.log('🗑️ [Residuos] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
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
    
    // Buscar la fila de la entidad
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      residuosValue.value = parseFloat(entityRow[mapping.valueColumn]) || 0
      residuosPercentage.value = parseFloat(entityRow[mapping.percentageColumn]) || 0
      console.log('✅ [Residuos] Datos cargados:', residuosValue.value, 'kg')
    } else {
      residuosValue.value = 0
      residuosPercentage.value = 0
      console.log('⚠️ [Residuos] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [Residuos] Error:', err)
    residuosError.value = err.message
  } finally {
    residuosLoading.value = false
  }
}

// ============================================
// EMISIONES CONTAMINANTES (AreaChart)
// ============================================
const emisionesData = ref([])
const emisionesLoading = ref(false)
const emisionesError = ref(null)

const loadEmisionesData = async (entityName = null, year = null) => {
  try {
    emisionesLoading.value = true
    emisionesError.value = null
    
    console.log('🏭 [Emisiones] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
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
    
    // Buscar la fila de la entidad
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      // Transformar a formato de AreaChart
      emisionesData.value = mapping.variables.map(variable => ({
        label: variable.label,
        value: parseFloat(entityRow[variable.column]) || 0
      }))
      console.log('✅ [Emisiones] Datos cargados:', emisionesData.value.length, 'fuentes')
    } else {
      emisionesData.value = []
      console.log('⚠️ [Emisiones] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [Emisiones] Error:', err)
    emisionesError.value = err.message
  } finally {
    emisionesLoading.value = false
  }
}

// ============================================
// CONSUMO DE ENERGÍA ELÉCTRICA (GaugeChart)
// ============================================
const energiaValue = ref(0)
const energiaPercentage = ref(0)
const energiaLoading = ref(false)
const energiaError = ref(null)

const loadEnergiaData = async (entityName = null, year = null) => {
  try {
    energiaLoading.value = true
    energiaError.value = null
    
    console.log('⚡ [Energía] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
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
    
    // Buscar la fila de la entidad
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      energiaValue.value = parseFloat(entityRow[mapping.valueColumn]) || 0
      energiaPercentage.value = parseFloat(entityRow[mapping.percentageColumn]) || 0
      console.log('✅ [Energía] Datos cargados:', energiaValue.value, 'GWh')
    } else {
      energiaValue.value = 0
      energiaPercentage.value = 0
      console.log('⚠️ [Energía] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [Energía] Error:', err)
    energiaError.value = err.message
  } finally {
    energiaLoading.value = false
  }
}

// ============================================
// ÁREAS NATURALES PROTEGIDAS (VerticalBarChart)
// ============================================
const areasNaturalesData = ref([])
const areasLoading = ref(false)
const areasError = ref(null)

const loadAreasNaturalesData = async (entityName = null, year = null) => {
  try {
    areasLoading.value = true
    areasError.value = null
    
    console.log('🌳 [Áreas Naturales] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
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
    
    // ✅ CORREGIDO: Buscar la fila de la entidad
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      console.log('⚠️ [Áreas Naturales] No se encontraron datos para', entityName)
      areasNaturalesData.value = []
      areasLoading.value = false
      return
    }
    
    // ✅ CORREGIDO: Transformar solo las variables definidas en el mapping
    const transformedData = mapping.variables.map(variable => ({
      key: variable.key,
      label: variable.label,
      value: parseFloat(entityRow[variable.column]) || 0,
      color: variable.color,
      colorClass: variable.colorClass || 'default',
      active: false  // ← Inicialmente todas inactivas
    }))
    
    areasNaturalesData.value = transformedData
    console.log('✅ [Áreas Naturales] Datos cargados:', transformedData.length, 'variables')
    console.log('📊 [Áreas Naturales] Datos:', transformedData)
    
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

const handleBack = () => {
  emit('back')
}

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity, oldEntity) => {
  console.log('🔄 [AmbientalesView] Watch: entidad cambió')
  console.log('  - Anterior:', oldEntity)
  console.log('  - Nueva:', newEntity)
  
  // Cargar datos de todos los componentes
  loadIngresoTotalData(newEntity, props.selectedYear)
  loadResiduosData(newEntity, props.selectedYear)
  loadEmisionesData(newEntity, props.selectedYear)
  loadEnergiaData(newEntity, props.selectedYear)
  loadAreasNaturalesData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear, oldYear) => {
  console.log('🔄 [AmbientalesView] Watch: año cambió')
  console.log('  - Anterior:', oldYear)
  console.log('  - Nuevo:', newYear)
  
  // Solo recargar si hay una entidad seleccionada
  if (props.selectedEntity) {
    loadIngresoTotalData(props.selectedEntity, newYear)
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
  console.log('🚀 [AmbientalesView] Montado')
  console.log('📍 Entidad inicial:', props.selectedEntity)
  console.log('📅 Año inicial:', props.selectedYear)
  
  // Cargar datos iniciales de todos los componentes
  await Promise.all([
    loadIngresoTotalData(props.selectedEntity, props.selectedYear),
    loadResiduosData(props.selectedEntity, props.selectedYear),
    loadEmisionesData(props.selectedEntity, props.selectedYear),
    loadEnergiaData(props.selectedEntity, props.selectedYear),
    loadAreasNaturalesData(props.selectedEntity, props.selectedYear)
  ])
  
  console.log('✅ [AmbientalesView] Todos los datos iniciales cargados')
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

/* ============================
   LEFT CARD CONTAINER
   ============================ */
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

/* Empty State */
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

/* Bottle Graph */
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

/* ============================
   RIGHT CARD CONTAINER
   ============================ */
.right-card-container {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  gap: 10px;
}

/* Top Right Container */
.top-right-card-container {
  display: flex;
  flex-direction: row;
  border-radius: 12px;
  height: 50%;
  gap: 10px;
}

/* Area Chart */
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

/* Gauge Container */
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

/* Bottom Right Container */
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