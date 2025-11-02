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
              title="Tu título"
              :data="{
                'Variable 1': [10, 20, 30, 25, 35],
                'Variable 2': [15, 25, 20, 30, 28]
              }"
              :xLabels="['Ene', 'Feb', 'Mar', 'Abr', 'May']"
              :valueFormatter="(val) => `$${val}`"
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
        <div class="PS-PIC-anual-linear-chart"></div>
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

// Composable de Google Sheets
const { fetchData, transformToBarChartData } = useStorageData()

// Datos para gráficas
const chartDataBar = ref([])
const chartDataBarIS = ref([])
const chartDataBarPIC = ref([])
const chartDataBarPS = ref([])
const years = ref(['2020', '2021', '2022', '2023', '2024'])

// Datos temporales para LinearChart
const chartDataLinear = computed(() => {
  return {
    'IS Total': [45234.5, 52341.2, 58123.7, 61456.8, 67234.9],
    'Financ. para desarrollo': [23456.8, 48123.4, 52341.9, 54234.5, 55678.2]
  }
})

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
    
    // Extraer años
    years.value = rawData.map(row => row.Año?.toString() || '')
    
    console.log('✅ Datos transformados para IIC BarChart:', chartDataBar.value?.length || 0, 'años')
    console.log('✅ Datos transformados para IS BarChart:', chartDataBarIS.value?.length || 0, 'años')
    console.log('✅ Datos transformados para PIC BarChart:', chartDataBarPIC.value?.length || 0, 'años')
    console.log('✅ Datos transformados para PS BarChart:', chartDataBarPS.value?.length || 0, 'años')
    
  } catch (err) {
    console.error('❌ Error cargando datos:', err)
    console.error('Error completo:', err.message)
    chartDataBar.value = []
    chartDataBarIS.value = []
    chartDataBarPIC.value = []
    chartDataBarPS.value = []
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
  overflow: auto;
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
  height: 25%;
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
  overflow: hidden;
}
</style>