<!-- src/modules/qualitativeIndicators/components/EconomicosView.vue -->
<!-- ✅ VERSIÓN CORREGIDA: Con IconPercentageChart para PIB -->
<template>
  <div class="ambientales-container">
    <div class="card-body">
      <!-- Left Side Container -->
      <div class="left-card-container">
        <!-- Top: Horizontal Bar Chart - Ingresos Totales -->
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
            <p>Selecciona una entidad federativa en el filtro superior para ver los datos de ingresos totales.</p>
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
        
        <!-- Bottom: Person Graph - Personas Económicamente Activas -->
        <div class="person-graphs card">
          <div class="person-bottle">
            <h2>Población económicamente activa</h2>
          </div>
          <div class="body-person">
            <!-- Loading State -->
            <div v-if="peaLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="peaError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="!selectedEntity" class="empty-state-small">
              <p>Selecciona una entidad</p>
            </div>

            <!-- Datos -->
            <template v-else>
              <div class="person-graph">
                <div class="person-number number">{{ formatNumber(peaValue) }} Personas</div>
                <PersonChart 
                  :value="peaPercentage" 
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Right Side Container -->
      <div class="right-card-container">
        <!-- Top Right Container -->
        <div class="top-right-card-container">
          <!-- ✅ PIB Chart - CON ICONO ANIMADO -->
          <div class="pib-chart card">
            <div class="title-pib-chart">
              <h3>Producto Interno Bruto Estatal (PIBE), anual en millones de pesos en 2024.</h3>
            </div>
            <div class="pib-chart-container">
              <!-- Loading State -->
              <div v-if="PIBLoading" class="loading-state-small">
                <div class="spinner-small"></div>
              </div>

              <!-- Error State -->
              <div v-else-if="PIBError" class="error-state-small">
                <p>Error cargando datos</p>
                <button @click="loadPIBData(selectedEntity, selectedYear)" class="retry-btn-small">
                  Reintentar
                </button>
              </div>

              <!-- Empty State -->
              <div v-else-if="!selectedEntity" class="empty-state-small">
                <p>Selecciona una entidad</p>
              </div>

              <!-- ✅ NUEVO: Icono PIB con porcentaje -->
               
              <div v-else class="pib-icon-wrapper">
                <div class="pib-value">${{ formatNumber(pibValue) }} MDP</div>
                 <div class="pib-icon">
                    <IconPercentageChart
                    iconPath="/public/icons/pib-icon.png"
                    :value="pibPercentage"
                    fillDirection="vertical"
                    fillOrigin="bottom"
                    width="70%"
                    height="70%"
                    iconWidth="80%"
                    iconHeight="100%"
                    :showPercentage="true"
                    fillColor="#0F3759"
                    :animated="true"
                    :animationDuration="1.5"
                    />
                </div>
              </div>
            </div>
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
import PersonChart from '../../object/component/PersonChart.vue'
import IconPercentageChart from '@/modules/object/component/IconPercentageChart.vue'
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
  if (!value) return 0
  let stringValue = String(value)
  stringValue = stringValue.replace(/\./g, '')
  stringValue = stringValue.replace(/,/g, '.')
  return parseFloat(stringValue) || 0
}

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
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      console.log('⚠️ [Ingreso Total] No se encontraron datos para', entityName)
      ingresoTotalData.value = []
      ingresoTotalLoading.value = false
      return
    }
    
    const transformedData = mapping.variables
      .sort((a, b) => a.order - b.order)
      .map(variable => ({
        key: variable.key,
        label: variable.label,
        value: parseNumericValue(entityRow[variable.column]),
        color: variable.color,
        colorClass: variable.colorClass || 'default',
        active: true
      }))
    
    ingresoTotalData.value = transformedData
    console.log('✅ [Ingreso Total] Datos cargados:', transformedData.length, 'variables')
    
  } catch (err) {
    console.error('❌ [Ingreso Total] Error:', err)
    ingresoTotalError.value = err.message
  } finally {
    ingresoTotalLoading.value = false
  }
}

// ============================================
// PERSONAS ECONÓMICAMENTE ACTIVAS (PersonChart)
// ============================================
const peaValue = ref(0)
const peaPercentage = ref(0)
const peaLoading = ref(false)
const peaError = ref(null)

const loadPersonasData = async (entityName = null, year = null) => {
  try {
    peaLoading.value = true
    peaError.value = null
    
    console.log('👥 [PEA] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      peaValue.value = 0
      peaPercentage.value = 0
      peaLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('pea')
    const sheetName = getSheetName('pea')
    
    const rawData = await fetchData('pea', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      peaValue.value = parseNumericValue(entityRow[mapping.valueColumn])
      
      const allValues = rawData
        .map(row => parseNumericValue(row[mapping.valueColumn]))
        .filter(val => val > 0)
      
      const maxValue = Math.max(...allValues)
      peaPercentage.value = maxValue > 0 ? (peaValue.value / maxValue) * 100 : 0
      
      console.log('✅ [PEA] Datos cargados:', peaValue.value, 'Personas')
      console.log('📊 [PEA] Porcentaje calculado:', peaPercentage.value.toFixed(2), '%')
    } else {
      peaValue.value = 0
      peaPercentage.value = 0
      console.log('⚠️ [PEA] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [PEA] Error:', err)
    peaError.value = err.message
  } finally {
    peaLoading.value = false
  }
}

// ============================================
// ✅ PRODUCTO INTERNO BRUTO (PIB) - CORREGIDO
// ============================================
const pibValue = ref(0)
const pibPercentage = ref(0)
const PIBLoading = ref(false)
const PIBError = ref(null)

const loadPIBData = async (entityName = null, year = null) => {
  try {
    PIBLoading.value = true
    PIBError.value = null
    
    console.log('🏭 [PIB] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      pibValue.value = 0
      pibPercentage.value = 0
      PIBLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('pib')
    const sheetName = getSheetName('pib')
    
    const rawData = await fetchData('pib', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      console.log('🔍 [PIB DEBUG] Fila encontrada:', entityRow)
      
      pibValue.value = parseNumericValue(entityRow[mapping.valueColumn])
      
      console.log('🔍 [PIB DEBUG] Valor parseado:', pibValue.value)
      
      // Obtener todos los valores y calcular la suma total
      const allValues = rawData
        .map(row => {
          const val = parseNumericValue(row[mapping.valueColumn])
          return val
        })
        .filter(val => val > 0)
      const totalSum = allValues.reduce((sum, val) => sum + val, 0)
      pibPercentage.value = totalSum > 0 ? (pibValue.value / totalSum) * 100 : 0
      
      console.log('✅ [PIB] Valor:', pibValue.value, 'Millones De Pesos')
      console.log('📊 [PIB] Porcentaje del total:', pibPercentage.value.toFixed(2), '%')
      console.log('📊 [PIB] Suma total:', totalSum)
    } else {
      pibValue.value = 0
      pibPercentage.value = 0
      console.log('⚠️ [PIB] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [PIB] Error:', err)
    PIBError.value = err.message
  } finally {
    PIBLoading.value = false
  }
}

// ============================================
// ÁREAS NATURALES PROTEGIDAS (VerticalBarChart)
// ============================================
const areasNaturalesData = ref([])
const areasLoading = ref(false)
const areasError = ref(null)
const pibPercentageReal = ref(0)

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
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      console.log('⚠️ [Áreas Naturales] No se encontraron datos para', entityName)
      areasNaturalesData.value = []
      areasLoading.value = false
      return
    }
    
    const transformedData = mapping.variables.map(variable => ({
      key: variable.key,
      label: variable.label,
      value: parseNumericValue(entityRow[variable.column]),
      color: variable.color,
      colorClass: variable.colorClass || 'default',
      active: false
    }))
    
    areasNaturalesData.value = transformedData
    console.log('✅ [Áreas Naturales] Datos cargados:', transformedData.length, 'variables')
    
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
  console.log('🔄 [EconomicosView] Watch: entidad cambió')
  console.log('  - Anterior:', oldEntity)
  console.log('  - Nueva:', newEntity)
  
  loadIngresoTotalData(newEntity, props.selectedYear)
  loadPersonasData(newEntity, props.selectedYear)
  loadPIBData(newEntity, props.selectedYear)
  loadAreasNaturalesData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear, oldYear) => {
  console.log('🔄 [EconomicosView] Watch: año cambió')
  console.log('  - Anterior:', oldYear)
  console.log('  - Nuevo:', newYear)
  
  if (props.selectedEntity) {
    loadIngresoTotalData(props.selectedEntity, newYear)
    loadPersonasData(props.selectedEntity, newYear)
    loadPIBData(props.selectedEntity, newYear)
    loadAreasNaturalesData(props.selectedEntity, newYear)
  }
}, { immediate: false })

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  console.log('🚀 [EconomicosView] Montado')
  console.log('📍 Entidad inicial:', props.selectedEntity)
  console.log('📅 Año inicial:', props.selectedYear)
  
  await Promise.all([
    loadIngresoTotalData(props.selectedEntity, props.selectedYear),
    loadPersonasData(props.selectedEntity, props.selectedYear),
    loadPIBData(props.selectedEntity, props.selectedYear),
    loadAreasNaturalesData(props.selectedEntity, props.selectedYear)
  ])
  
  console.log('✅ [EconomicosView] Todos los datos iniciales cargados')
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
  height: 60%;
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

.person-graphs {
  height: 40%;
  border-radius: 12px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.person-bottle {
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

h2 {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 300;
  color: #535353;
  font-size: 16px;
  margin: 0;
}

.body-person {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.person-graph {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.number {
  display: flex;
  justify-content: center;
  width: 100%;
  color: #58778F;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 500;
  font-size: 16px;
  flex-shrink: 0;
  padding-top: 20px;
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
  border-radius: 12px;
  flex:5;
  gap: 10px;
}

.pib-chart {
  width: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

}

.title-pib-chart {
  padding: 10px 10px 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e0e0e0;
}

.pib-chart-container {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ✅ NUEVO: Estilos para el icono PIB */
.pib-icon-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  height: 100%;
  width: 100%;
}

.pib-value {
  position: relative;
  left: 20px;
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  color: #0F3759;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.pib-icon{
      position: relative;
      left: -40px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

h3 {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 300;
  color: #535353;
  font-size: 16px;
  padding-left: 15px;
  line-height: 1.3;
}

.bottom-right-card-container {
  flex: 5;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.bottom-bar-graph {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}
</style>