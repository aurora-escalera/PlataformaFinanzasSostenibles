<!-- src/modules/object/component/HistoricalCard.vue -->
<template>
  <div class="ifss-slider-container">
    <div class="historic-table">
      <!-- ROW 1 -->
      <div class="row-1">
        <!-- IS Linear Chart Card - SIN símbolo $ y CON decimales -->
        <div class="chart-card IS-anual-linear-chart">
          <div class="chart-card-header">
            <h4 class="card-title">Análisis histórico de los Ingresos Sostenibles (IS)</h4>
          </div>
          <div class="chart-card-body">
            <LinearChart
              :data="chartDataLinear"
              :xLabels="years"
              :width="900"
              :height="340"
              :showCurrencySymbol="false"
              :decimalPlaces="1"
              :hideHeader="true"
              :padding="{
                top: 20,
                right: 0,
                bottom: 100,
                left: 80
              }"
            />
          </div>
        </div>
        
        <!-- IIC Stacked Area Card -->
        <div class="chart-card IIC-anual-linear-chart">
          <div class="chart-card-header">
            <h4 class="card-title">Análisis de IIC e Ingreso Total</h4>
          </div>
          <div class="chart-card-body">
            <StackedArea
              :data="chartDataStackedArea"
              :xLabels="years"
            />
          </div>
        </div>
      </div>

      <!-- ROW 2 -->
      <div class="row-2">
        <!-- IIC Bar Chart Card -->
        <div class="chart-card IIC-anual-bar-chart">
          <div class="chart-card-header">
            <h4 class="card-title">Ingresos de Inversión en Contribución (IIC)</h4>
          </div>
          <div class="chart-card-body">
            <HistoricBarChart
              :data="chartDataBar"
              :showFilters="true"
              :showLegend="true"
            />
          </div>
        </div>
        
        <!-- IS Bar Chart Card -->
        <div class="chart-card IS-anual-bar-chart">
          <div class="chart-card-header">
            <h4 class="card-title">Ingresos Sostenibles (IS) por Año</h4>
          </div>
          <div class="chart-card-body">
            <HistoricBarChart
              :data="chartDataBarIS"
              :showFilters="true"
              :showLegend="true"
            />
          </div>
        </div>
      </div>

      <!-- ROW 3 -->
      <div class="row-3">
        <!-- PS-PIC Linear Chart Card (Full Width) - CON símbolo $ (default) -->
        <div class="chart-card PS-PIC-anual-linear-chart">
          <div class="chart-card-header">
            <h4 class="card-title">Análisis histórico de los Intensivos en Carbono y Presupuestos Sostenibles (PS-PIC)</h4>
          </div>
          <div class="chart-card-body">
            <LinearChart
              :data="chartDataLinearPSPIC"
              :xLabels="years"
              :width="1900"
              :height="340"
              :hideHeader="true"
              :padding="{
                top: 20,
                right: 0,
                bottom: 100,
                left: 100
              }"
            />
          </div>
        </div>
      </div>

      <!-- ROW 4 -->
      <div class="row-4">
        <!-- PIC Bar Chart Card -->
        <div class="chart-card PIC-anual-bar-chart">
          <div class="chart-card-header">
            <h4 class="card-title">Presupuestos Intensivos en Carbono (PIC)</h4>
          </div>
          <div class="chart-card-body">
            <HistoricBarChart
              :data="chartDataBarPIC"
              :showFilters="true"
              :showLegend="true"
            />
          </div>
        </div>
        
        <!-- PS Bar Chart Card -->
        <div class="chart-card PS-anual-bar-chart">
          <div class="chart-card-header">
            <h4 class="card-title">Presupuestos Sostenibles (PS)</h4>
          </div>
          <div class="chart-card-body">
            <HistoricBarChart
              :data="chartDataBarPS"
              :showFilters="true"
              :showLegend="true"
            />
          </div>
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
    
    // Transformar datos para LinearChart PS-PIC
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
    console.log('✅ Datos transformados para LinearChart PS-PIC:', chartDataLinearPSPIC.value)

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

/* ===== ESTILOS DE CARD (igual que ChartsComponent) ===== */
.chart-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #163C5F;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #1a365d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
  overflow: hidden;
}

.chart-card-header {
  display: flex;
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 8px;
  border-bottom: 3px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.card-title {
  padding: 4px 0 2px 0;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100;
  color: white;
  font-size: 17px;
  margin: 0;
  line-height: 1.3;
}

.chart-card-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
}

/* ===== TAMAÑOS ESPECÍFICOS DE CARDS ===== */

/* Cards de 50% del ancho (row-1, row-2, row-4) */
.IS-anual-linear-chart,
.IIC-anual-linear-chart,
.IIC-anual-bar-chart,
.IS-anual-bar-chart,
.PIC-anual-bar-chart,
.PS-anual-bar-chart {
  width: 50%;
}

/* Card de 100% del ancho (row-3) */
.PS-PIC-anual-linear-chart {
  width: 100%;
}
</style>