<!-- src/modules/object/component/HistoricalCard.vue -->
<template>
  <div class="ifss-slider-container">
    <div class="historic-table">
      <!-- ROW 1 - Solo visible si: Todas las variables, IS o IIC -->
      <div v-if="shouldShowRow('row1')" class="row-1">
        <!-- IS Stacked Area Chart Card -->
        <div v-if="shouldShowCard('IS')" class="chart-card IS-anual-linear-chart" :class="{ 'full-width': isOnlyCardInRow('IS', 'row1') }">
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
              :width="getChartWidth('IS', 'row1')"
              :height="350"
              :positionsByYear="isPositionsByYear"
              :percentagesByYear="isPercentagesByYear"
            />
          </div>
        </div>
        
        <!-- IIC Stacked Area Card -->
        <div v-if="shouldShowCard('IIC')" class="chart-card IIC-anual-linear-chart" :class="{ 'full-width': isOnlyCardInRow('IIC', 'row1') }">
          <div class="chart-card-header">
            <h4 class="card-title">Análisis de IIC e Ingreso Total</h4>
          </div>
          <div class="chart-card-body">
            <StackedArea
              :data="chartDataStackedArea"
              :xLabels="years"
              :hideHeader="true"
              :width="getChartWidth('IIC', 'row1')"
              :height="350"
              :showCurrencySymbol="true"
              :decimalPlaces="2"
              :positionsByYear="iicPositionsByYear"
              :percentagesByYear="iicPercentagesByYear"
            />
          </div>
        </div>
      </div>

      <!-- ROW 2 - Solo visible si: Todas las variables, IS o IIC -->
      <div v-if="shouldShowRow('row2')" class="row-2">
        <!-- IIC Bar Chart Card -->
        <div v-if="shouldShowCard('IIC')" class="chart-card IIC-anual-bar-chart" :class="{ 'full-width': isOnlyCardInRow('IIC', 'row2') }">
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
        <div v-if="shouldShowCard('IS')" class="chart-card IS-anual-bar-chart" :class="{ 'full-width': isOnlyCardInRow('IS', 'row2') }">
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

      <!-- ROW 3 - Solo visible si: Todas las variables, PS o PIC -->
      <div v-if="shouldShowRow('row3')" class="row-3">
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
              :initialVisibleVariables="getInitialVariablesForPSPIC()"
            />
          </div>
        </div>
      </div>

      <!-- ROW 4 - Solo visible si: Todas las variables, PS o PIC -->
      <div v-if="shouldShowRow('row4')" class="row-4">
        <!-- PIC Bar Chart Card -->
        <div v-if="shouldShowCard('PIC')" class="chart-card PIC-anual-bar-chart" :class="{ 'full-width': isOnlyCardInRow('PIC', 'row4') }">
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
        <div v-if="shouldShowCard('PS')" class="chart-card PS-anual-bar-chart" :class="{ 'full-width': isOnlyCardInRow('PS', 'row4') }">
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
import { ref, onMounted, computed, watch } from 'vue'
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
  },
  // ✅ NUEVAS PROPS: Recibir los 3 filtros desde HomePage
  selectedEntity: {
    type: [String, null],
    default: null
  },
  selectedYear: {
    type: [String, Number, null],
    default: null
  },
  selectedVariable: {
    type: [Object, null],
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

// Datos para tooltip extendido
const isPositionsByYear = ref({})
const isPercentagesByYear = ref({})
const iicPositionsByYear = ref({})
const iicPercentagesByYear = ref({})
const pspicPositionsByYear = ref({})
const pspicPercentagesByYear = ref({})

// ============================================================================
// LÓGICA DE FILTRADO BASADA EN LOS 3 FILTROS
// ============================================================================

/**
 * Verifica si estamos en el contexto correcto para aplicar filtrado de cards:
 * - Entidad = "Datos Regionales" (null)
 * - Año = "Todos los años" (null)
 */
const isInFilterableContext = computed(() => {
  const entityIsTodas = props.selectedEntity === null
  const yearIsTodos = props.selectedYear === null
  
  console.log('🔍 [HistoricalCard] isInFilterableContext:', {
    entity: props.selectedEntity,
    entityIsTodas,
    year: props.selectedYear,
    yearIsTodos,
    result: entityIsTodas && yearIsTodos
  })
  
  return entityIsTodas && yearIsTodos
})

/**
 * Obtiene la key de la variable seleccionada (PS, IIC, PIC, IS o null)
 */
const selectedVariableKey = computed(() => {
  if (!props.selectedVariable) return null
  return props.selectedVariable.key || null
})

/**
 * Mapeo de qué variables están en cada row
 */
const rowVariables = {
  row1: ['IS', 'IIC'],    // Row 1 tiene IS StackedArea e IIC StackedArea
  row2: ['IIC', 'IS'],    // Row 2 tiene IIC Bar e IS Bar
  row3: ['PS', 'PIC'],    // Row 3 tiene PS-PIC StackedArea (ambas)
  row4: ['PIC', 'PS']     // Row 4 tiene PIC Bar y PS Bar
}

/**
 * Determina si una row debe mostrarse
 * Solo aplica filtrado si estamos en el contexto correcto (Entidad=null, Año=null)
 */
const shouldShowRow = (rowName) => {
  // Si NO estamos en contexto filtrable, mostrar todas las rows
  if (!isInFilterableContext.value) return true
  
  // Si no hay variable seleccionada ("Todas las variables"), mostrar todas las rows
  if (!selectedVariableKey.value) return true
  
  // Mostrar la row si contiene la variable seleccionada
  const variablesInRow = rowVariables[rowName] || []
  return variablesInRow.includes(selectedVariableKey.value)
}

/**
 * Determina si una card específica debe mostrarse
 * Solo aplica filtrado si estamos en el contexto correcto
 */
const shouldShowCard = (cardVariable) => {
  // Si NO estamos en contexto filtrable, mostrar todas las cards
  if (!isInFilterableContext.value) return true
  
  // Si no hay variable seleccionada ("Todas las variables"), mostrar todas las cards
  if (!selectedVariableKey.value) return true
  
  // Mostrar solo si coincide con la variable seleccionada
  return selectedVariableKey.value === cardVariable
}

/**
 * Determina si una card es la única visible en su row (para aplicar full-width)
 */
const isOnlyCardInRow = (cardVariable, rowName) => {
  // Si NO estamos en contexto filtrable, hay 2 cards por row
  if (!isInFilterableContext.value) return false
  
  // Si no hay variable seleccionada, hay 2 cards por row
  if (!selectedVariableKey.value) return false
  
  // Si hay variable seleccionada, la card es la única en su row
  return selectedVariableKey.value === cardVariable
}

/**
 * Obtiene el ancho del chart según si está solo o acompañado
 */
const getChartWidth = (cardVariable, rowName) => {
  if (isOnlyCardInRow(cardVariable, rowName)) {
    return 1900 // Ancho completo
  }
  return 950 // Mitad del ancho
}

/**
 * Obtiene las variables iniciales para el gráfico PS-PIC según el filtro
 */
const getInitialVariablesForPSPIC = () => {
  // Si NO estamos en contexto filtrable, mostrar ambas
  if (!isInFilterableContext.value) {
    return ['Presupuestos Intensivos en Carbono', 'Presupuestos Sostenibles']
  }
  
  if (selectedVariableKey.value === 'PS') {
    return ['Presupuestos Sostenibles']
  }
  if (selectedVariableKey.value === 'PIC') {
    return ['Presupuestos Intensivos en Carbono']
  }
  
  // Por defecto (Todas las variables), mostrar ambas
  return ['Presupuestos Intensivos en Carbono', 'Presupuestos Sostenibles']
}

// ============================================================================
// WATCH para debug
// ============================================================================

watch([() => props.selectedEntity, () => props.selectedYear, () => props.selectedVariable], 
  ([entity, year, variable]) => {
    console.log('🔄 [HistoricalCard] Filtros cambiaron:', {
      entity: entity === null ? 'Datos Regionales' : entity,
      year: year === null ? 'Todos los años' : year,
      variable: variable?.key || 'Todas las variables',
      isInFilterableContext: props.selectedEntity === null && props.selectedYear === null
    })
  }, 
  { immediate: true }
)

// ============================================================================
// CARGA DE DATOS (sin cambios)
// ============================================================================

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
    
    // Extraer posiciones y porcentajes
    extractISTooltipData(rawData)
    extractIICTooltipData(rawData)
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

const extractISTooltipData = (rawData) => {
  const positions = {}
  const percentages = {}
  const yearColumn = 'Año'
  const percentageColumn = 'IS (%)'
  const positionColumn = 'POS_IS'
  
  rawData.forEach((row) => {
    const year = row[yearColumn]
    if (!year) return
    
    const yearStr = String(year).trim()
    positions[yearStr] = {}
    percentages[yearStr] = {}
    
    const pctRaw = row[percentageColumn]
    if (pctRaw !== undefined && pctRaw !== null && pctRaw !== '') {
      const pctValue = parseFloat(String(pctRaw).replace(',', '.'))
      if (!isNaN(pctValue)) {
        percentages[yearStr]['IS Total'] = pctValue
      }
    }
    
    const posRaw = row[positionColumn]
    if (posRaw !== undefined && posRaw !== null && posRaw !== '') {
      const posValue = parseInt(posRaw)
      if (!isNaN(posValue)) {
        positions[yearStr]['IS Total'] = posValue
      }
    }
  })
  
  isPositionsByYear.value = positions
  isPercentagesByYear.value = percentages
}

const extractIICTooltipData = (rawData) => {
  const positions = {}
  const percentages = {}
  const yearColumn = 'Año'
  
  rawData.forEach((row) => {
    const year = row[yearColumn]
    if (!year) return
    
    const yearStr = String(year).trim()
    positions[yearStr] = {}
    percentages[yearStr] = {}
    
    // IS Total
    const isPctRaw = row['IS (%)']
    if (isPctRaw !== undefined && isPctRaw !== null && isPctRaw !== '') {
      const pctValue = parseFloat(String(isPctRaw).replace(',', '.'))
      if (!isNaN(pctValue)) {
        percentages[yearStr]['IS Total'] = pctValue
      }
    }
    const isPosRaw = row['POS_IS']
    if (isPosRaw !== undefined && isPosRaw !== null && isPosRaw !== '') {
      const posValue = parseInt(isPosRaw)
      if (!isNaN(posValue)) {
        positions[yearStr]['IS Total'] = posValue
      }
    }
    
    // IIC Total
    const iicPctRaw = row['IIC (%)']
    if (iicPctRaw !== undefined && iicPctRaw !== null && iicPctRaw !== '') {
      const pctValue = parseFloat(String(iicPctRaw).replace(',', '.'))
      if (!isNaN(pctValue)) {
        percentages[yearStr]['IIC Total'] = pctValue
      }
    }
    const iicPosRaw = row['POS_IIC']
    if (iicPosRaw !== undefined && iicPosRaw !== null && iicPosRaw !== '') {
      const posValue = parseInt(iicPosRaw)
      if (!isNaN(posValue)) {
        positions[yearStr]['IIC Total'] = posValue
      }
    }
  })
  
  iicPositionsByYear.value = positions
  iicPercentagesByYear.value = percentages
}

const extractTooltipDataFromMapping = (rawData, mappingName) => {
  const mapping = storageConfig.mappings[mappingName]
  if (!mapping) {
    return { positions: {}, percentages: {} }
  }
  
  const positions = {}
  const percentages = {}
  const yearColumn = mapping.yearColumn || 'Año'
  const variableColumns = mapping.variableColumns || []
  
  rawData.forEach((row) => {
    const year = row[yearColumn]
    if (!year) return
    
    const yearStr = String(year).trim()
    positions[yearStr] = positions[yearStr] || {}
    percentages[yearStr] = percentages[yearStr] || {}
    
    variableColumns.forEach((varConfig) => {
      const label = varConfig.label
      
      if (varConfig.percentageColumn) {
        const pctRaw = row[varConfig.percentageColumn]
        if (pctRaw !== undefined && pctRaw !== null && pctRaw !== '') {
          const pctValue = parseFloat(String(pctRaw).replace(',', '.'))
          if (!isNaN(pctValue)) {
            percentages[yearStr][label] = pctValue
          }
        }
      }
      
      if (varConfig.positionColumn) {
        const posRaw = row[varConfig.positionColumn]
        if (posRaw !== undefined && posRaw !== null && posRaw !== '') {
          const posValue = parseInt(posRaw)
          if (!isNaN(posValue)) {
            positions[yearStr][label] = posValue
          }
        }
      }
    })
  })
  
  return { positions, percentages }
}

const extractPSPICTooltipData = (rawData) => {
  const { positions, percentages } = extractTooltipDataFromMapping(rawData, 'pspicLinearChart')
  pspicPositionsByYear.value = positions
  pspicPercentagesByYear.value = percentages
}

// Cargar datos al montar
onMounted(async () => {
  console.log('🎬 Componente HistoricalCard montado')
  console.log('📊 Filtros iniciales:', {
    entity: props.selectedEntity,
    year: props.selectedYear,
    variable: props.selectedVariable?.key || 'Todas'
  })
  
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

/* Anchos por defecto (50% cada card) */
.IS-anual-linear-chart,
.IIC-anual-linear-chart,
.IIC-anual-bar-chart,
.IS-anual-bar-chart,
.PIC-anual-bar-chart,
.PS-anual-bar-chart {
  width: 50%;
}

/* Ancho completo para row 3 */
.PS-PIC-anual-linear-chart {
  width: 100%;
}

/* ✅ Clase para cuando una card está sola en su row */
.chart-card.full-width {
  width: 100% !important;
}
</style>