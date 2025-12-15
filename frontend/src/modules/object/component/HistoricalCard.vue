<!-- src/modules/object/component/HistoricalCard.vue -->
<template>
  <div class="ifss-slider-container">
    <div class="historic-table">
      <!-- ROW 1 -->
      <div class="row-1">
        <!-- IS Stacked Area Chart Card - CON porcentaje y posición en tooltip -->
        <div class="chart-card IS-anual-linear-chart">
          <div class="chart-card-header">
            <h4 class="card-title">Análisis histórico de los Ingresos Sostenibles (IS)</h4>
          </div>
          <div class="chart-card-body">
            <StackedArea
              :data="chartDataLinear"
              :xLabels="years"
              :showCurrencySymbol="true"
              :decimalPlaces="2"
              :hideHeader="true"
              :width="950"
              :height="350"
              :positionsByYear="isPositionsByYear"
              :percentagesByYear="isPercentagesByYear"
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
              :hideHeader="true"
              :width="950"
              :height="350"
              :showCurrencySymbol="true"
              :decimalPlaces="2"
              :positionsByYear="iicPositionsByYear"
              :percentagesByYear="iicPercentagesByYear"
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
              :hideHeader="true"
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
              :hideHeader="true"
            />
          </div>
        </div>
      </div>

      <!-- ROW 3 -->
      <div class="row-3">
        <!-- PS-PIC Stacked Area Chart Card (Full Width) -->
        <div class="chart-card PS-PIC-anual-linear-chart">
          <div class="chart-card-header">
            <h4 class="card-title">Análisis histórico de los Intensivos en Carbono y Presupuestos Sostenibles (PS-PIC)</h4>
          </div>
          <div class="chart-card-body">
            <StackedArea
              :data="chartDataLinearPSPIC"
              :xLabels="years"
              :width="1900"
              :height="340"
              :hideHeader="true"
              :showCurrencySymbol="true"
              :decimalPlaces="2"
              :positionsByYear="pspicPositionsByYear"
              :percentagesByYear="pspicPercentagesByYear"
              :tooltipLabels="{
                'Presupuestos Intensivos en Carbono': 'PIC',
                'Presupuestos Sostenibles': 'PS'
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
              :hideHeader="true"
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
              :hideHeader="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

// ✅ NUEVOS: Datos para tooltip extendido de IS
const isPositionsByYear = ref({})
const isPercentagesByYear = ref({})

// ✅ NUEVOS: Datos para tooltip extendido de IIC (segunda gráfica StackedArea)
const iicPositionsByYear = ref({})
const iicPercentagesByYear = ref({})

// ✅ NUEVOS: Datos para tooltip extendido de PS-PIC (LinearChart)
const pspicPositionsByYear = ref({})
const pspicPercentagesByYear = ref({})

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
    
    // ✅ NUEVO: Extraer posiciones y porcentajes de IS
    extractISTooltipData(rawData)
    
    // ✅ NUEVO: Extraer posiciones y porcentajes de IIC
    extractIICTooltipData(rawData)
    
    // ✅ NUEVO: Extraer posiciones y porcentajes de PS-PIC
    extractPSPICTooltipData(rawData)
    
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

    // Convertir formato para LinearChart IS
    const formattedData = {}
    linearResult.data.forEach(series => {
      formattedData[series.label] = series.data
    })
    
    chartDataLinear.value = formattedData
    years.value = linearResult.labels
    
    // Transformar datos para LinearChart PS-PIC
    const mappingPSPIC = storageConfig.mappings.pspicLinearChart
    const linearResultPSPIC = transformToLinearChartData(rawData, mappingPSPIC)
    
    const formattedDataPSPIC = {}
    linearResultPSPIC.data.forEach(series => {
      formattedDataPSPIC[series.label] = series.data
    })
    
    chartDataLinearPSPIC.value = formattedDataPSPIC
    
    console.log('✅ Datos transformados')
    console.log('📍 isPositionsByYear:', isPositionsByYear.value)
    console.log('📊 isPercentagesByYear:', isPercentagesByYear.value)

  } catch (err) {
    console.error('❌ Error cargando datos:', err)
    chartDataBar.value = []
    chartDataBarIS.value = []
    chartDataBarPIC.value = []
    chartDataBarPS.value = []
    chartDataLinear.value = {}
    chartDataLinearPSPIC.value = {} 
    chartDataStackedArea.value = {}
    isPositionsByYear.value = {}
    isPercentagesByYear.value = {}
    iicPositionsByYear.value = {}
    iicPercentagesByYear.value = {}
    pspicPositionsByYear.value = {}
    pspicPercentagesByYear.value = {}
  }
}

/**
 * ✅ NUEVA FUNCIÓN: Extrae posiciones y porcentajes de IS del rawData
 * Columnas esperadas: Año, IS ($), IS (%), POS_IS, FT ($)
 */
const extractISTooltipData = (rawData) => {
  console.log('🔧 [extractISTooltipData] Extrayendo datos de tooltip para IS...')
  
  const positions = {}
  const percentages = {}
  
  // Nombres de columnas (ajustar si son diferentes en tu sheet)
  const yearColumn = 'Año'
  const percentageColumn = 'IS (%)'
  const positionColumn = 'POS_IS'
  
  // Mapeo de variables del gráfico a columnas
  // En isLinearChart tienes: 'IS Total' (de 'IS ($)') y 'Financiamiento Total' (de 'FT ($)')
  const variableMapping = {
    'IS Total': { percentageCol: percentageColumn, positionCol: positionColumn },
    // Financiamiento Total no tiene porcentaje ni posición
  }
  
  rawData.forEach((row, index) => {
    const year = row[yearColumn]
    if (!year) return
    
    const yearStr = String(year).trim()
    positions[yearStr] = {}
    percentages[yearStr] = {}
    
    // Extraer porcentaje de IS
    const pctRaw = row[percentageColumn]
    if (pctRaw !== undefined && pctRaw !== null && pctRaw !== '') {
      // Manejar formato europeo (coma como decimal)
      const pctValue = parseFloat(String(pctRaw).replace(',', '.'))
      if (!isNaN(pctValue)) {
        percentages[yearStr]['IS Total'] = pctValue
        console.log(`📊 [DEBUG] Año ${yearStr} - IS (%): ${pctValue}`)
      }
    }
    
    // Extraer posición de IS
    const posRaw = row[positionColumn]
    if (posRaw !== undefined && posRaw !== null && posRaw !== '') {
      const posValue = parseInt(posRaw)
      if (!isNaN(posValue)) {
        positions[yearStr]['IS Total'] = posValue
        console.log(`📍 [DEBUG] Año ${yearStr} - POS_IS: ${posValue}`)
      }
    }
  })
  
  isPositionsByYear.value = positions
  isPercentagesByYear.value = percentages
  
  console.log('✅ [extractISTooltipData] Completado')
  console.log('📍 Positions:', JSON.stringify(positions, null, 2))
  console.log('📊 Percentages:', JSON.stringify(percentages, null, 2))
}

/**
 * ✅ NUEVA FUNCIÓN: Extrae posiciones y porcentajes de IIC del rawData
 * Para la gráfica "Análisis de IIC e Ingreso Total"
 * Variables: IS Total, IIC Total, Ingreso Total
 */
const extractIICTooltipData = (rawData) => {
  console.log('🔧 [extractIICTooltipData] Extrayendo datos de tooltip para IIC...')
  
  const positions = {}
  const percentages = {}
  
  const yearColumn = 'Año'
  
  rawData.forEach((row) => {
    const year = row[yearColumn]
    if (!year) return
    
    const yearStr = String(year).trim()
    positions[yearStr] = {}
    percentages[yearStr] = {}
    
    // ===== IS Total =====
    // Porcentaje IS
    const isPctRaw = row['IS (%)']
    if (isPctRaw !== undefined && isPctRaw !== null && isPctRaw !== '') {
      const pctValue = parseFloat(String(isPctRaw).replace(',', '.'))
      if (!isNaN(pctValue)) {
        percentages[yearStr]['IS Total'] = pctValue
      }
    }
    // Posición IS
    const isPosRaw = row['POS_IS']
    if (isPosRaw !== undefined && isPosRaw !== null && isPosRaw !== '') {
      const posValue = parseInt(isPosRaw)
      if (!isNaN(posValue)) {
        positions[yearStr]['IS Total'] = posValue
      }
    }
    
    // ===== IIC Total =====
    // Porcentaje IIC
    const iicPctRaw = row['IIC (%)']
    if (iicPctRaw !== undefined && iicPctRaw !== null && iicPctRaw !== '') {
      const pctValue = parseFloat(String(iicPctRaw).replace(',', '.'))
      if (!isNaN(pctValue)) {
        percentages[yearStr]['IIC Total'] = pctValue
      }
    }
    // Posición IIC
    const iicPosRaw = row['POS_IIC']
    if (iicPosRaw !== undefined && iicPosRaw !== null && iicPosRaw !== '') {
      const posValue = parseInt(iicPosRaw)
      if (!isNaN(posValue)) {
        positions[yearStr]['IIC Total'] = posValue
      }
    }
    
    // ===== Ingreso Total (IT) =====
    // No tiene porcentaje ni posición
  })
  
  iicPositionsByYear.value = positions
  iicPercentagesByYear.value = percentages
  
  console.log('✅ [extractIICTooltipData] Completado')
  console.log('📍 IIC Positions:', JSON.stringify(positions, null, 2))
  console.log('📊 IIC Percentages:', JSON.stringify(percentages, null, 2))
}

/**
 * ✅ FUNCIÓN GENÉRICA: Extrae posiciones y porcentajes desde un mapping de storageConfig
 * Lee las columnas percentageColumn y positionColumn definidas en el mapping
 */
const extractTooltipDataFromMapping = (rawData, mappingName) => {
  console.log(`🔧 [extractTooltipDataFromMapping] Extrayendo datos de tooltip para ${mappingName}...`)
  
  const mapping = storageConfig.mappings[mappingName]
  if (!mapping) {
    console.error(`❌ Mapping "${mappingName}" no encontrado en storageConfig`)
    return { positions: {}, percentages: {} }
  }
  
  const positions = {}
  const percentages = {}
  
  const yearColumn = mapping.yearColumn || 'Año'
  const variableColumns = mapping.variableColumns || []
  
  console.log(`📋 [${mappingName}] Variables configuradas:`, variableColumns.map(v => ({
    label: v.label,
    percentageColumn: v.percentageColumn,
    positionColumn: v.positionColumn
  })))
  
  rawData.forEach((row) => {
    const year = row[yearColumn]
    if (!year) return
    
    const yearStr = String(year).trim()
    positions[yearStr] = positions[yearStr] || {}
    percentages[yearStr] = percentages[yearStr] || {}
    
    // Iterar sobre cada variable del mapping
    variableColumns.forEach((varConfig) => {
      const label = varConfig.label
      
      // Extraer porcentaje si está definido
      if (varConfig.percentageColumn) {
        const pctRaw = row[varConfig.percentageColumn]
        if (pctRaw !== undefined && pctRaw !== null && pctRaw !== '') {
          const pctValue = parseFloat(String(pctRaw).replace(',', '.'))
          if (!isNaN(pctValue)) {
            percentages[yearStr][label] = pctValue
            console.log(`📊 [${mappingName}] Año ${yearStr} - ${label} porcentaje: ${pctValue}`)
          }
        }
      }
      
      // Extraer posición si está definida
      if (varConfig.positionColumn) {
        const posRaw = row[varConfig.positionColumn]
        if (posRaw !== undefined && posRaw !== null && posRaw !== '') {
          const posValue = parseInt(posRaw)
          if (!isNaN(posValue)) {
            positions[yearStr][label] = posValue
            console.log(`📍 [${mappingName}] Año ${yearStr} - ${label} posición: ${posValue}`)
          }
        }
      }
    })
  })
  
  console.log(`✅ [extractTooltipDataFromMapping] ${mappingName} completado`)
  console.log('📍 Positions:', JSON.stringify(positions, null, 2))
  console.log('📊 Percentages:', JSON.stringify(percentages, null, 2))
  
  return { positions, percentages }
}

/**
 * ✅ Extrae posiciones y porcentajes de PS-PIC usando el mapping de storageConfig
 */
const extractPSPICTooltipData = (rawData) => {
  const { positions, percentages } = extractTooltipDataFromMapping(rawData, 'pspicLinearChart')
  pspicPositionsByYear.value = positions
  pspicPercentagesByYear.value = percentages
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
  padding: 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 8px;
  overflow: visible;
  box-sizing: border-box;
}

.historic-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 8px;
}

.row-1, .row-2, .row-3, .row-4 {
  display: flex;
  flex-direction: row;
  height: 24.5%;
  gap: 8px;
}

.chart-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #163C5F;
  border-radius: 12px;
  padding: 8px;
  border: 1px solid #1a365d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
  overflow: visible;
}

.chart-card-header {
  display: flex;
  width: 100%;
  padding: 4px 8px;
  margin-bottom: 6px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.card-title {
  padding: 2px 0;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100;
  color: white;
  font-size: 14px;
  margin: 0;
  line-height: 1.2;
}

.chart-card-body {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  background: white;
  border-radius: 6px;
  overflow: visible;
  min-height: 0;
}

.chart-card-body > * {
  width: 100%;
  height: 100%;
}

.IS-anual-linear-chart,
.IIC-anual-linear-chart,
.IIC-anual-bar-chart,
.IS-anual-bar-chart,
.PIC-anual-bar-chart,
.PS-anual-bar-chart {
  width: 50%;
}

.PS-PIC-anual-linear-chart {
  width: 100%;
}
</style>