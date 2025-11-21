<!-- src/modules/qualitativeIndicators/components/AmbientalesView.vue -->
<template>
  <div class="ambientales-container">
    <div class="card-body">
      <!-- Left Side Container -->
      <div class="left-card-container">
        <!-- Top: Horizontal Bar Chart -->
        <div class="bar-graph card">
          <!-- Loading State -->
          <div v-if="incendiosLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando datos...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="incendiosError" class="error-state">
            <p>Error: {{ incendiosError }}</p>
            <button @click="loadIncendiosData(selectedEntity, selectedYear)" class="retry-btn-small">
              Reintentar
            </button>
          </div>

          <!-- ✅ NUEVO: Mensaje cuando no hay entidad seleccionada -->
          <div v-else-if="!selectedEntity" class="empty-state">
            <div class="empty-icon">🗺️</div>
            <h4>Selecciona una entidad</h4>
            <p>Selecciona una entidad federativa en el filtro superior para ver los datos de incendios forestales.</p>
          </div>

          <!-- ✅ HorizontalBarChart con datos de Google Sheets -->
          <HorizontalBarChart
            v-else
            :variables="incendiosData"
            width="100%"
            height="100%"
            title="Incendios forestales en hectáreas en 2024"
            :showFilters="true"
            :showLegend="true"
            barHeight="20px"
            barGap="1px"
          />
        </div>
        
        <!-- Bottom: Bottle Graph -->
        <div class="bottle-graphs card">
          <div class="title-bottle">
            <h2>Promedio diario de residuos sólidos urbanos recolectados</h2>
          </div>
          <div class="body-bottle">
            <div class="bottle-graph">
              <BottleChart :value="75" />
            </div>
            <div class="bottle-number number">3,249,683 kg</div>
          </div>
        </div>
      </div>

      <!-- Right Side Container -->
      <div class="right-card-container">
        <!-- Top Right Container -->
        <div class="top-right-card-container">
          <!-- Area Chart -->
          <div class="area-chart card">
            <div class="title-area-chart">
              <h3>Emisiones de contaminantes atmosféricos por fuente en toneladas.</h3>
            </div>
            <div class="area-chart-container">
              <AreaChart 
                :excelData="myExcelData"
                title="Datos de Excel"
              />
            </div>
          </div>
          
          <!-- Gauge Chart -->
          <div class="gauge-container card">
            <div class="title-gauge">
              <h3>Consumo de energía eléctrica</h3>
            </div>
            <div class="gauge-graph">
              <GaugeChart :value="67" />
            </div>
            <div class="gauge-number number">2,013.80 GWh</div>
          </div>
        </div>
        
        <!-- Bottom Right Container -->
        <div class="bottom-right-card-container">
          <div class="bottom-bar-graph card">
            <VerticalBarChart
              :variables="verticalData"
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

// ✅ NUEVO: Recibir la entidad seleccionada como prop
const props = defineProps({
  selectedEntity: {
    type: String,
    default: null
  },
  // ✅ NUEVO: Recibir el año seleccionado
  selectedYear: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['back'])

const handleBack = () => {
  emit('back')
}

// ✅ Estado para datos de incendios forestales
const incendiosData = ref([])
const incendiosLoading = ref(false)
const incendiosError = ref(null)

// ✅ Composable de Google Sheets
const { fetchData, transform } = useStorageData()

// ✅ Función para cargar datos de incendios forestales
const loadIncendiosData = async (entityName = null, year = null) => {
  try {
    incendiosLoading.value = true
    incendiosError.value = null
    
    console.log('📊 Cargando datos de incendios forestales')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    // Si no hay entidad seleccionada, mostrar mensaje
    if (!entityName) {
      console.log('⚠️ No hay entidad seleccionada, mostrando datos vacíos')
      incendiosData.value = []
      incendiosLoading.value = false
      return
    }
    
    // ✅ NUEVO: Establecer el año activo antes de cargar datos
    if (year) {
      console.log('📅 Estableciendo año activo:', year)
      setActiveYear(year)
    }
    
    // Obtener el mapping y nombre de la hoja
    const mapping = getMapping('incendiosForestales')
    const sheetName = getSheetName('incendiosForestales')  // ← Ahora retorna el año dinámico
    
    console.log('📄 Mapping:', mapping)
    console.log('📄 Sheet name:', sheetName)
    
    // Obtener datos raw de Google Sheets
    const rawData = await fetchData('incendiosForestales', sheetName)
    console.log('📊 Datos raw obtenidos:', rawData.length, 'filas')
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    // Transformar datos usando el mapping y la entidad seleccionada
    const transformedData = transform(rawData, mapping, 'horizontal', {
      selectedEntity: entityName
    })
    console.log('✅ Datos transformados:', transformedData)
    
    incendiosData.value = transformedData
    
  } catch (err) {
    console.error('❌ Error cargando datos de incendios:', err)
    incendiosError.value = err.message
  } finally {
    incendiosLoading.value = false
  }
}

// Datos para los otros gráficos (estáticos por ahora)
const myExcelData = [
  { label: 'Industria', value: 25 },
  { label: 'Transporte', value: 30 },
  { label: 'Residencial', value: 15 },
  { label: 'Comercial', value: 30 },
  { label: 'Agricultura', value: 15 }
]

const verticalData = [
  { 
    key: 'total', 
    label: 'Total', 
    value: 1200, 
    color: '#0F3759', 
    active: true 
  },
  { 
    key: 'area', 
    label: 'Área de protección de flora y fauna', 
    value: 3500, 
    color: '#3B5A70', 
    active: true 
  },
  { 
    key: 'reserva', 
    label: 'Reserva de la biosfera', 
    value: 850, 
    color: '#4E6D82', 
    active: false 
  },
  { 
    key: 'santuario', 
    label: 'Santuario', 
    value: 1050, 
    color: '#B0B0B0', 
    active: false 
  }
]

// ✅ Watch para recargar datos cuando cambia la entidad seleccionada
watch(() => props.selectedEntity, (newEntity, oldEntity) => {
  console.log('🔄 [AmbientalesView] Watch detectó cambio de entidad')
  console.log('  - Entidad anterior:', oldEntity)
  console.log('  - Entidad nueva:', newEntity)
  loadIncendiosData(newEntity, props.selectedYear)
}, { immediate: false })

// ✅ NUEVO: Watch para recargar datos cuando cambia el año seleccionado
watch(() => props.selectedYear, (newYear, oldYear) => {
  console.log('🔄 [AmbientalesView] Watch detectó cambio de año')
  console.log('  - Año anterior:', oldYear)
  console.log('  - Año nuevo:', newYear)
  // Solo recargar si hay una entidad seleccionada
  if (props.selectedEntity) {
    loadIncendiosData(props.selectedEntity, newYear)
  }
}, { immediate: false })

// ✅ Cargar datos al montar el componente con la entidad y año inicial
onMounted(async () => {
  console.log('🚀 [AmbientalesView] Montado')
  console.log('📍 Entidad inicial recibida:', props.selectedEntity)
  console.log('📅 Año inicial recibido:', props.selectedYear)
  await loadIncendiosData(props.selectedEntity, props.selectedYear)
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

.error-state p {
  color: #666;
  font-size: 14px;
  margin: 0 0 10px 0;
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