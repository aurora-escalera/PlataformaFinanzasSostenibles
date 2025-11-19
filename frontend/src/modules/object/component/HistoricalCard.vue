<!-- src/modules/object/component/HistoricalCard.vue -->
<template>
  <div class="ifss-slider-container">
    <div class="historic-table">
      <div class="row-1">
        <div class="IS-anual-linear-chart">
            <LinearChart
              title="Análisis histórico de los Ingresos Sostenibles (IS)"
              :data="chartDataLinear"
              :xLabels="years"
           />
        </div>
        <div class="IIC-anual-linear-chart">
            <StackedArea
              title="Análisis de IIC e Ingreso Total"
              :data="chartDataStackedArea"
              :xLabels="years"
           />
        </div>
      </div>
      <div class="row-2">
        <div class="IIC-anual-bar-chart">
          <HistoricBarChart
            title="Ingresos de Inversión en Contribución (IIC)"
            :data="chartDataBar"
            :showFilters="true"
            :showLegend="true"
          />
          </div>
          <div class="IS-anual-bar-chart">
          <HistoricBarChart
            title="Ingresos Sostenibles (IS) por Año"
            :data="chartDataBarIS"
            :showFilters="true"
            :showLegend="true"
          />
        </div>
      </div>
      <div class="row-3">
        <div class="PS-PIC-anual-linear-chart">
          <LinearChart
            title="Análisis histórico de los Intensivos en Carbono y Presupuestos Sostenibles (PS-PIC)"
            :data="chartDataLinearPSPIC"
            :xLabels="years"
          />
        </div>
      </div>
      <div class="row-4">
        <div class="PIC-anual-bar-chart">
            <HistoricBarChart
            title="Presupuestos Intensivos en Carbono (PIC)"
            :data="chartDataBarPIC"
            :showFilters="true"
            :showLegend="true"
          />
        </div>
        <div class="PS-anual-bar-chart">
            <HistoricBarChart
            title="Presupuestos Sostenibles (PS)"
            :data="chartDataBarPS"
            :showFilters="true"
            :showLegend="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import LinearChart from '../../charts/components/LinearChart.vue'
import StackedArea from '../../charts/components/StackedArea.vue'
import HistoricBarChart from '../../charts/components/HistoricBarChart.vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { storageConfig } from '@/dataConection/storageConfig'

const props = defineProps({
  statesData: {
    type: Array,
    default: () => []
  },
  selectedStateValue: {
    type: Number,
    default: null
  }
})

// Composable de Google Sheets - Importar transformToLinearChartData
const { fetchData, transformToBarChartData, transformToLinearChartData, transformToStackedAreaData } = useStorageData()
// Datos para gráficas
const chartDataBar = ref([])
const chartDataBarIS = ref([])
const chartDataBarPIC = ref([])
const chartDataBarPS = ref([])
const chartDataLinear = ref({})
const chartDataLinearPSPIC = ref({}) 
const chartDataStackedArea = ref({})
const years = ref(['2020', '2021', '2022', '2023', '2024'])

// Cargar datos de Google Sheets
const loadData = async () => {
  try {
    console.log('📊 Cargando datos de Google Sheets...')
    
    const rawData = await fetchData('datosFinancieros', 'Hoja 1')
    
    console.log('✅ Datos raw obtenidos:', {
      numFilas: rawData?.length || 0,
      primeraFila: rawData?.[0] || 'No hay datos',
      columnas: rawData?.[0] ? Object.keys(rawData[0]) : []
    })
    
    if (!rawData || rawData.length === 0) {
      console.error('❌ No se obtuvieron datos del Google Sheet')
      return
    }
    
    // Transformar datos para IIC
    const mappingIIC = storageConfig.mappings.iicBarChart
    chartDataBar.value = transformToBarChartData(rawData, mappingIIC)
    
    // Transformar datos para IS
    const mappingIS = storageConfig.mappings.presupuestoBarChart
    chartDataBarIS.value = transformToBarChartData(rawData, mappingIS)
    
    // Transformar datos para PIC
    const mappingPIC = storageConfig.mappings.picBarChart
    chartDataBarPIC.value = transformToBarChartData(rawData, mappingPIC)
    
    // Transformar datos para PS
    const mappingPS = storageConfig.mappings.psBarChart
    chartDataBarPS.value = transformToBarChartData(rawData, mappingPS)
    
    // Transformar datos para LinearChart IS
    const mappingLinear = storageConfig.mappings.isLinearChart
    const linearResult = transformToLinearChartData(rawData, mappingLinear)
    
    const mappingStackedArea = storageConfig.mappings.iicStackedArea
    chartDataStackedArea.value = transformToStackedAreaData(rawData, mappingStackedArea)

    // Convertir formato: { data: [...], labels: [...] } → { 'Variable 1': [...], 'Variable 2': [...] }
    const formattedData = {}
    linearResult.data.forEach(series => {
      formattedData[series.label] = series.data
    })
    
    chartDataLinear.value = formattedData
    years.value = linearResult.labels
    
    // ✅ NUEVO: Transformar datos para LinearChart PS-PIC
    const mappingPSPIC = storageConfig.mappings.pspicLinearChart
    console.log('🔍 mappingPSPIC:', mappingPSPIC)
    console.log('🔍 Valor de GT ($) en primera fila:', rawData[0]['GT ($)'])
    console.log('🔍 Tipo de GT ($):', typeof rawData[0]['GT ($)'])
    
    const linearResultPSPIC = transformToLinearChartData(rawData, mappingPSPIC)
    console.log('🔍 linearResultPSPIC:', linearResultPSPIC)
    
    const formattedDataPSPIC = {}
    linearResultPSPIC.data.forEach(series => {
      formattedDataPSPIC[series.label] = series.data
      console.log(`🔍 Serie "${series.label}":`, series.data)
    })
    
    chartDataLinearPSPIC.value = formattedDataPSPIC
    
    console.log('✅ Datos transformados para IIC BarChart:', chartDataBar.value?.length || 0, 'años')
    console.log('✅ Datos transformados para IS BarChart:', chartDataBarIS.value?.length || 0, 'años')
    console.log('✅ Datos transformados para PIC BarChart:', chartDataBarPIC.value?.length || 0, 'años')
    console.log('✅ Datos transformados para PS BarChart:', chartDataBarPS.value?.length || 0, 'años')
    console.log('✅ Datos transformados para LinearChart IS:', chartDataLinear.value)
    console.log('✅ Datos transformados para LinearChart PS-PIC:', chartDataLinearPSPIC.value) // ✅ NUEVO

  } catch (err) {
    console.error('❌ Error cargando datos:', err)
    console.error('Error completo:', err.message)
    chartDataBar.value = []
    chartDataBarIS.value = []
    chartDataBarPIC.value = []
    chartDataBarPS.value = []
    chartDataLinear.value = {}
    chartDataLinearPSPIC.value = {} 
    chartDataStackedArea.value = {}
  }
}

// Cargar datos al montar (con delay de 2 segundos)
onMounted(async () => {
  console.log('🎬 Componente HistoricalCard montado')
  
  setTimeout(async () => {
    console.log('⏰ Iniciando carga después de 2 segundos...')
    await loadData()
  }, 2000)
})
</script>

<style scoped>
.ifss-slider-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 10px;
  overflow: visible;
  box-sizing: border-box;
}

.historic-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 10px;
}

/* Todas las rows con mismo tamaño */
.row-1, .row-2, .row-3, .row-4 {
  display: flex;
  flex-direction: row;
  height: 24.5%;
  gap: 10px;
}

/* Gráficas que ocupan 50% del ancho */
.IS-anual-linear-chart,
.IIC-anual-linear-chart,
.IIC-anual-bar-chart,
.IS-anual-bar-chart,
.PIC-anual-bar-chart,
.PS-anual-bar-chart {
  width: 50%;
  height: 100%;
  border-radius: 8px;
  overflow: visible;
  border: 1px solid #ccc;
}

/* Gráfica que ocupa 100% del ancho */
.PS-PIC-anual-linear-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: visible;
  border: 1px solid #ccc;
}
</style>