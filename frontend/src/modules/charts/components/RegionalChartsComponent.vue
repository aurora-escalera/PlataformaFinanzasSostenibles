<!-- src/modules/charts/components/RegionalChartsComponent.vue -->
<!-- ✅ ACTUALIZADO: Vinculación con RetractableFilterBar - Filtrado por variable -->
<!-- Cuando selectedEntity=null (Datos Regionales) y selectedYear=específico:
     - Variable=null (Todas) → Muestra las 4 filas (IS, IIC, PS, PIC)
     - Variable={key:'IS'} → Muestra solo fila IS
     - Variable={key:'IIC'} → Muestra solo fila IIC
     - Variable={key:'PS'} → Muestra solo fila PS
     - Variable={key:'PIC'} → Muestra solo fila PIC
-->
<template>
  <div class="regional-charts-container">
    <div class="regional-charts-grid">
      
      <!-- ============================================
           ROW 1: IS (Ingresos Sostenibles)
           Visible cuando: selectedVariable es null O selectedVariable.key === 'IS'
           ============================================ -->
      <div class="row-1" v-if="shouldShowRow('IS')">
        <!-- IS BarChart Card -->
        <div class="chart-card is-bar-card">
          <div class="chart-card-header">
            <h4 class="card-title">Financiamiento Total vs Ingresos Sostenibles - {{ selectedYear }}</h4>
          </div>
          <div class="chart-card-body">
            <BarChart 
              :data="financiamientoISData" 
              :title="'Financiamiento Total (FT) vs Ingresos Sostenibles (IS)'" 
              headerTitle="Financiamiento Total vs Ingresos Sostenibles" 
              :selectedState="'Regional'" 
              :selectedYear="selectedYear" 
              currency="USD"
              :showDownload="false"
              :hideHeader="true"
            />
          </div>
        </div>
        
        <!-- IS DonutChart Card -->
        <div class="chart-card is-donut-card">
          <div class="chart-card-header">
            <h4 class="card-title">Componentes de Ingresos Sostenibles - {{ selectedYear }}</h4>
          </div>
          <div class="chart-card-body">
            <DonutChart 
              v-if="sectoresIngresosSostenibles.length > 0"
              :key="`is-regional-${selectedYear}-${variableKey}`" 
              :data="donutIngresosSostenibles" 
              title="IS" 
              :subtitle="subtitleIngresosSostenibles" 
              :size="180" 
              :variables="variablesIngresosSostenibles" 
              :sectors="sectoresIngresosSostenibles" 
              currency="USD"
              :selectedYear="selectedYear"
            />
            <div v-else class="no-data-state green">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">No se registraron datos para <strong>Ingresos Sostenibles</strong> en {{ selectedYear }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================
           ROW 2: IIC (Ingresos Intensivos en Carbono)
           Visible cuando: selectedVariable es null O selectedVariable.key === 'IIC'
           ============================================ -->
      <div class="row-2" v-if="shouldShowRow('IIC')">
        <!-- IIC BarChart Card -->
        <div class="chart-card iic-bar-card">
          <div class="chart-card-header">
            <h4 class="card-title">Ingreso Total vs Ingresos Intensivos en Carbono - {{ selectedYear }}</h4>
          </div>
          <div class="chart-card-body">
            <BarChart 
              :data="ingresoIICData" 
              :title="'Ingreso Total (IT) vs Ingresos Intensivos en Carbono (IIC)'" 
              headerTitle="Ingreso Total vs Ingresos Intensivos en Carbono" 
              :selectedState="'Regional'" 
              :selectedYear="selectedYear" 
              currency="USD"
              :showDownload="false"
              :hideHeader="true"
            />
          </div>
        </div>
        
        <!-- IIC DonutChart Card -->
        <div class="chart-card iic-donut-card">
          <div class="chart-card-header">
            <h4 class="card-title">Componentes de Ingresos Intensivos en Carbono - {{ selectedYear }}</h4>
          </div>
          <div class="chart-card-body">
            <DonutChart 
              v-if="sectoresIngresosCarbono.length > 0"
              :key="`iic-regional-${selectedYear}-${variableKey}`" 
              :data="donutIngresosCarbono" 
              title="IIC" 
              :subtitle="subtitleIngresosCarbono" 
              :size="180" 
              :variables="variablesIngresosCarbono" 
              :sectors="sectoresIngresosCarbono" 
              currency="USD"
              :selectedYear="selectedYear"
            />
            <div v-else class="no-data-state red">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">No se registraron datos para <strong>Ingresos Intensivos en Carbono</strong> en {{ selectedYear }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================
           ROW 3: PS (Presupuestos Sostenibles)
           Visible cuando: selectedVariable es null O selectedVariable.key === 'PS'
           ============================================ -->
      <div class="row-3" v-if="shouldShowRow('PS')">
        <!-- PS BarChart Card -->
        <div class="chart-card ps-bar-card">
          <div class="chart-card-header">
            <h4 class="card-title">Gasto Total vs Presupuesto Sostenible - {{ selectedYear }}</h4>
          </div>
          <div class="chart-card-body">
            <BarChart 
              :data="gastoPSData" 
              :title="'Gasto Total (GT) vs Presupuesto Sostenible (PS)'" 
              headerTitle="Gasto Total vs Presupuesto Sostenible" 
              :selectedState="'Regional'" 
              :selectedYear="selectedYear" 
              currency="USD"
              :showDownload="false"
              :hideHeader="true"
            />
          </div>
        </div>
        
        <!-- PS DonutChart Card -->
        <div class="chart-card ps-donut-card">
          <div class="chart-card-header">
            <h4 class="card-title">Componentes de Presupuestos Sostenibles - {{ selectedYear }}</h4>
          </div>
          <div class="chart-card-body">
            <DonutChart 
              v-if="sectoresPresupuestosSostenibles.length > 0"
              :key="`ps-regional-${selectedYear}-${variableKey}`" 
              :data="donutPresupuestosSostenibles" 
              title="PS" 
              :subtitle="subtitlePresupuestosSostenibles" 
              :size="180" 
              :variables="variablesPresupuestosSostenibles" 
              :sectors="sectoresPresupuestosSostenibles" 
              currency="USD"
              :selectedYear="selectedYear"
            />
            <div v-else class="no-data-state green">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">No se registraron datos para <strong>Presupuestos Sostenibles</strong> en {{ selectedYear }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================
           ROW 4: PIC (Presupuestos Intensivos en Carbono)
           Visible cuando: selectedVariable es null O selectedVariable.key === 'PIC'
           ============================================ -->
      <div class="row-4" v-if="shouldShowRow('PIC')">
        <!-- PIC BarChart Card -->
        <div class="chart-card pic-bar-card">
          <div class="chart-card-header">
            <h4 class="card-title">Gasto Total vs Presupuestos Intensivos en Carbono - {{ selectedYear }}</h4>
          </div>
          <div class="chart-card-body">
            <BarChart 
              :data="gastoPICData" 
              :title="'Gasto Total (GT) vs Presupuestos Intensivos en Carbono (PIC)'" 
              headerTitle="Gasto Total vs Presupuestos Intensivos en Carbono" 
              :selectedState="'Regional'" 
              :selectedYear="selectedYear" 
              currency="USD"
              :showDownload="false"
              :hideHeader="true"
            />
          </div>
        </div>
        
        <!-- PIC DonutChart Card -->
        <div class="chart-card pic-donut-card">
          <div class="chart-card-header">
            <h4 class="card-title">Componentes de Presupuestos Intensivos en Carbono - {{ selectedYear }}</h4>
          </div>
          <div class="chart-card-body">
            <DonutChart 
              v-if="sectoresPresupuestosCarbono.length > 0"
              :key="`pic-regional-${selectedYear}-${variableKey}`" 
              :data="donutPresupuestosCarbono" 
              title="PIC" 
              :subtitle="subtitlePresupuestosCarbono" 
              :size="180" 
              :variables="variablesPresupuestosCarbono" 
              :sectors="sectoresPresupuestosCarbono" 
              currency="USD"
              :selectedYear="selectedYear"
            />
            <div v-else class="no-data-state red">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">No se registraron datos para <strong>Presupuestos Intensivos en Carbono</strong> en {{ selectedYear }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================
           ESTADO: Sin datos disponibles
           ============================================ -->
      <div v-if="!hasAnyVisibleRow" class="no-data-available-state">
        <div class="no-data-available-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <h3 class="no-data-available-title">Sin datos disponibles</h3>
        <p class="no-data-available-text">
          No hay datos disponibles para {{ selectedVariableLabel }} en el año {{ selectedYear }}.
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'
import { getCleanValue } from '@/composables/parseNumber'
import BarChart from './BarChart.vue'
import DonutChart from './DonutChart.vue'

const props = defineProps({
  selectedYear: { type: String, default: null },
  selectedVariable: { type: Object, default: null },  // ✅ Variable seleccionada desde el filtro
  ifssData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['years-loaded'])

const { fetchData, loading, error } = useStorageData()
const dataLoaded = ref(false)
const rawRegionalData = ref([])

const presupuestosMapping = getMapping('chartsPresupuestosRegional')
const ingresosMapping = getMapping('chartsIngresosRegional')

const positionColumnMap = {
  'gasto_total_reg': null, 'presupuesto_sostenible_reg': 'POS_PS', 'presupuesto_carbono_reg': 'POS_PIC',
  'ingresos_total_reg': null, 'ingresos_sostenibles_reg': 'POS_IS', 'ingresos_carbono_reg': 'POS_IIC', 'financiamiento_total_reg': null
}

const percentageColumnMap = {
  'gasto_total_reg': null, 'presupuesto_sostenible_reg': 'PS (%)', 'presupuesto_carbono_reg': 'PIC (%)',
  'ingresos_total_reg': null, 'ingresos_sostenibles_reg': 'IS (%)', 'ingresos_carbono_reg': 'IIC (%)', 'financiamiento_total_reg': null
}

// ============================================
// COMPUTED PARA KEY DE VARIABLE (para forzar re-render)
// ============================================
const variableKey = computed(() => {
  return props.selectedVariable?.key || 'all'
})

// ============================================
// COMPUTED PARA ETIQUETA DE VARIABLE
// ============================================
const selectedVariableLabel = computed(() => {
  if (!props.selectedVariable) return 'Todas las variables'
  
  const labels = {
    'IS': 'Ingresos Sostenibles',
    'IIC': 'Ingresos Intensivos en Carbono',
    'PS': 'Presupuestos Sostenibles',
    'PIC': 'Presupuestos Intensivos en Carbono'
  }
  
  return labels[props.selectedVariable.key] || props.selectedVariable.label || 'la variable seleccionada'
})

// ============================================
// FUNCIÓN PARA DETERMINAR SI MOSTRAR UNA FILA
// ============================================
/**
 * Determina si una fila debe mostrarse basándose en:
 * - Si hay datos para el año seleccionado
 * - Si la variable seleccionada coincide con la fila O si selectedVariable es null (Todas)
 * 
 * @param {string} rowKey - Clave de la fila: 'IS', 'IIC', 'PS', 'PIC'
 * @returns {boolean}
 */
const shouldShowRow = (rowKey) => {
  // Si no hay año seleccionado, no mostrar ninguna fila
  if (!props.selectedYear) {
    console.log(`🔍 [shouldShowRow] ${rowKey}: false (no hay año)`)
    return false
  }
  
  // Si no hay datos cargados, no mostrar
  if (!dataLoaded.value || !currentRow.value) {
    console.log(`🔍 [shouldShowRow] ${rowKey}: false (no hay datos)`)
    return false
  }
  
  // Si no hay variable seleccionada (Todas las variables), mostrar todas las filas
  if (!props.selectedVariable || props.selectedVariable === null) {
    console.log(`🔍 [shouldShowRow] ${rowKey}: true (todas las variables)`)
    return true
  }
  
  // Si hay una variable seleccionada, solo mostrar la fila correspondiente
  const shouldShow = props.selectedVariable.key === rowKey
  console.log(`🔍 [shouldShowRow] ${rowKey}: ${shouldShow} (variable: ${props.selectedVariable.key})`)
  return shouldShow
}

// ============================================
// COMPUTED: ¿Hay alguna fila visible?
// ============================================
const hasAnyVisibleRow = computed(() => {
  if (!props.selectedYear || !dataLoaded.value || !currentRow.value) {
    return false
  }
  
  // Si no hay variable seleccionada, siempre hay filas visibles
  if (!props.selectedVariable) {
    return true
  }
  
  // Verificar si la variable seleccionada tiene datos
  const variableKey = props.selectedVariable.key
  return ['IS', 'IIC', 'PS', 'PIC'].includes(variableKey)
})

// ============================================
// CARGA DE DATOS
// ============================================
const extractAvailableYears = (data) => {
  if (!data || data.length === 0) return []
  const years = [...new Set(data.map(row => row['Año']).filter(y => y !== null && y !== undefined && y !== '').map(y => String(y).trim()))]
  years.sort((a, b) => Number(b) - Number(a))
  return years
}

const loadChartData = async () => {
  try {
    const sheetName = getSheetName('chartsPresupuestosRegional')
    const data = await fetchData('chartsPresupuestosRegional', sheetName)
    if (data && data.length > 0) {
      const availableYears = extractAvailableYears(data)
      if (availableYears.length > 0) emit('years-loaded', availableYears)
    }
    rawRegionalData.value = data || []
    dataLoaded.value = true
    console.log('✅ [Regional] Datos cargados:', rawRegionalData.value.length, 'filas')
  } catch (err) {
    console.error('❌ [Regional] Error:', err)
  }
}

onMounted(() => loadChartData())

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedYear, (n, o) => {
  if (n !== o) console.log('📊 [Regional] Año:', o, '->', n)
})

watch(() => props.selectedVariable, (n, o) => {
  const oldKey = o?.key || 'null'
  const newKey = n?.key || 'null'
  if (oldKey !== newKey) {
    console.log('📊 [Regional] Variable:', oldKey, '->', newKey)
    console.log('📊 [Regional] Filas visibles:', {
      IS: shouldShowRow('IS'),
      IIC: shouldShowRow('IIC'),
      PS: shouldShowRow('PS'),
      PIC: shouldShowRow('PIC')
    })
  }
}, { deep: true })

// ============================================
// DATOS FILTRADOS
// ============================================
const filteredData = computed(() => {
  if (!dataLoaded.value || !rawRegionalData.value.length) return []
  if (!props.selectedYear) return rawRegionalData.value
  return rawRegionalData.value.filter(row => String(row['Año']).trim() === String(props.selectedYear).trim())
})

const currentRow = computed(() => filteredData.value.length > 0 ? filteredData.value[0] : null)

// ============================================
// FUNCIONES AUXILIARES
// ============================================
const calculateDonutData = (row, sectorsConfig, totalValue) => {
  if (!row || !sectorsConfig || !totalValue) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  let sectorsTotal = 0
  const sectors = sectorsConfig.map(sc => {
    const value = getCleanValue(row, sc.column)
    sectorsTotal += value
    return { key: sc.key, label: sc.label, value, color: sc.color, colorClass: sc.colorClass }
  })
  const percentage = totalValue > 0 ? Math.round((sectorsTotal / totalValue) * 100) : 0
  return { mainPercentage: percentage, sectors, totalSectorsValue: sectorsTotal }
}

const transformSingleRowToBarChart = (row, variableConfigs) => {
  if (!row || !variableConfigs) return { variables: [] }
  const variables = variableConfigs.map(vc => {
    const value = getCleanValue(row, vc.column)
    const position = positionColumnMap[vc.key] ? getCleanValue(row, positionColumnMap[vc.key]) : null
    const percentage = percentageColumnMap[vc.key] ? getCleanValue(row, percentageColumnMap[vc.key]) : null
    return { key: vc.key, label: vc.label, value, color: vc.color, colorClass: vc.colorClass, order: vc.order || 0, position, percentage }
  })
  variables.sort((a, b) => a.order - b.order)
  return { variables }
}

// ============================================
// DATOS DE INGRESOS
// ============================================
const ingresosTotalValue = computed(() => currentRow.value ? getCleanValue(currentRow.value, 'IT ($)') : 0)
const financiamientoTotalValue = computed(() => currentRow.value ? getCleanValue(currentRow.value, 'FT ($)') : 0)
const ingresosSosteniblesValue = computed(() => currentRow.value ? getCleanValue(currentRow.value, 'IS ($)') : 0)
const ingresosSosteniblesPercent = computed(() => currentRow.value ? parseFloat(getCleanValue(currentRow.value, 'IS (%)').toFixed(2)) : 0)
const ingresosSosteniblesPosition = computed(() => {
  if (!currentRow.value) return null
  const pos = getCleanValue(currentRow.value, 'POS_IS')
  return pos > 0 ? pos : null
})
const ingresosCarbonoValue = computed(() => currentRow.value ? getCleanValue(currentRow.value, 'IIC ($)') : 0)
const ingresosCarbonoPercent = computed(() => currentRow.value ? parseFloat(getCleanValue(currentRow.value, 'IIC (%)').toFixed(2)) : 0)
const ingresosCarbonoPosition = computed(() => {
  if (!currentRow.value) return null
  const pos = getCleanValue(currentRow.value, 'POS_IIC')
  return pos > 0 ? pos : null
})

// Sectores Ingresos
const sectoresIngresosSostenibles = computed(() => {
  if (!currentRow.value || !ingresosMapping?.donutSectorsISRegional) return []
  return ingresosMapping.donutSectorsISRegional.map(sc => ({
    key: sc.key, label: sc.label, value: getCleanValue(currentRow.value, sc.column), color: sc.color, colorClass: sc.colorClass
  })).filter(s => s.value > 0)
})

const sectoresIngresosCarbono = computed(() => {
  if (!currentRow.value || !ingresosMapping?.donutSectorsIICRegional) return []
  return ingresosMapping.donutSectorsIICRegional.map(sc => ({
    key: sc.key, label: sc.label, value: getCleanValue(currentRow.value, sc.column), color: sc.color, colorClass: sc.colorClass
  })).filter(s => s.value > 0)
})

// ============================================
// DATOS DE PRESUPUESTOS
// ============================================
const gastoTotalValue = computed(() => currentRow.value ? getCleanValue(currentRow.value, 'GT ($)') : 0)
const presupuestoSostenibleValue = computed(() => currentRow.value ? getCleanValue(currentRow.value, 'PS ($)') : 0)
const presupuestoSosteniblePercent = computed(() => currentRow.value ? parseFloat(getCleanValue(currentRow.value, 'PS (%)').toFixed(2)) : 0)
const presupuestoSosteniblePosition = computed(() => {
  if (!currentRow.value) return null
  const pos = getCleanValue(currentRow.value, 'POS_PS')
  return pos > 0 ? pos : null
})
const presupuestoCarbonoValue = computed(() => currentRow.value ? getCleanValue(currentRow.value, 'PIC ($)') : 0)
const presupuestoCarbonoPercent = computed(() => currentRow.value ? parseFloat(getCleanValue(currentRow.value, 'PIC (%)').toFixed(2)) : 0)
const presupuestoCarbonoPosition = computed(() => {
  if (!currentRow.value) return null
  const pos = getCleanValue(currentRow.value, 'POS_PIC')
  return pos > 0 ? pos : null
})

// Sectores Presupuestos
const sectoresPresupuestosSostenibles = computed(() => {
  if (!currentRow.value || !presupuestosMapping?.donutSectorsPSRegional) return []
  return presupuestosMapping.donutSectorsPSRegional.map(sc => ({
    key: sc.key, label: sc.label, value: getCleanValue(currentRow.value, sc.column), color: sc.color, colorClass: sc.colorClass
  })).filter(s => s.value > 0)
})

const sectoresPresupuestosCarbono = computed(() => {
  if (!currentRow.value || !presupuestosMapping?.donutSectorsPICRegional) return []
  return presupuestosMapping.donutSectorsPICRegional.map(sc => ({
    key: sc.key, label: sc.label, value: getCleanValue(currentRow.value, sc.column), color: sc.color, colorClass: sc.colorClass
  })).filter(s => s.value > 0)
})

// ============================================
// DATOS PARA BARCHART
// ============================================
const financiamientoISData = computed(() => {
  if (!currentRow.value) return { variables: [] }
  return transformSingleRowToBarChart(currentRow.value, [
    { key: 'financiamiento_total_reg', column: 'FT ($)', label: 'Financiamiento Total', colorClass: 'gray', color: '#9ca3af', order: 1 },
    { key: 'ingresos_sostenibles_reg', column: 'IS ($)', label: 'Ingresos Sostenibles', colorClass: 'green', color: '#7cb342', order: 2 }
  ])
})

const ingresoIICData = computed(() => {
  if (!currentRow.value) return { variables: [] }
  return transformSingleRowToBarChart(currentRow.value, [
    { key: 'ingresos_total_reg', column: 'IT ($)', label: 'Ingreso Total', colorClass: 'gray', color: '#9ca3af', order: 1 },
    { key: 'ingresos_carbono_reg', column: 'IIC ($)', label: 'Ingresos Intensivos en Carbono', colorClass: 'red', color: '#DC143C', order: 2 }
  ])
})

const gastoPSData = computed(() => {
  if (!currentRow.value) return { variables: [] }
  return transformSingleRowToBarChart(currentRow.value, [
    { key: 'gasto_total_reg', column: 'GT ($)', label: 'Gasto Total', colorClass: 'gray', color: '#9ca3af', order: 1 },
    { key: 'presupuesto_sostenible_reg', column: 'PS ($)', label: 'Presupuesto Sostenible', colorClass: 'green', color: '#7cb342', order: 2 }
  ])
})

const gastoPICData = computed(() => {
  if (!currentRow.value) return { variables: [] }
  return transformSingleRowToBarChart(currentRow.value, [
    { key: 'gasto_total_reg', column: 'GT ($)', label: 'Gasto Total', colorClass: 'gray', color: '#9ca3af', order: 1 },
    { key: 'presupuesto_carbono_reg', column: 'PIC ($)', label: 'Presupuestos Intensivos en Carbono', colorClass: 'red', color: '#DC143C', order: 2 }
  ])
})

// ============================================
// DATOS PARA DONUTCHART
// ============================================
const isCalculatedData = computed(() => {
  if (!currentRow.value) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const total = getCleanValue(currentRow.value, 'IT ($)')
  return calculateDonutData(currentRow.value, ingresosMapping?.donutSectorsISRegional || [], total)
})

const iicCalculatedData = computed(() => {
  if (!currentRow.value) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const total = getCleanValue(currentRow.value, 'IT ($)')
  return calculateDonutData(currentRow.value, ingresosMapping?.donutSectorsIICRegional || [], total)
})

const psCalculatedData = computed(() => {
  if (!currentRow.value) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const total = getCleanValue(currentRow.value, 'GT ($)')
  return calculateDonutData(currentRow.value, presupuestosMapping?.donutSectorsPSRegional || [], total)
})

const picCalculatedData = computed(() => {
  if (!currentRow.value) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const total = getCleanValue(currentRow.value, 'GT ($)')
  return calculateDonutData(currentRow.value, presupuestosMapping?.donutSectorsPICRegional || [], total)
})

// Donut data arrays
const donutIngresosSostenibles = computed(() => [
  { label: 'IS', value: isCalculatedData.value.mainPercentage, color: '#7cb342' },
  { label: 'Resto', value: 100 - isCalculatedData.value.mainPercentage, color: '#E8E8E8' }
])
const subtitleIngresosSostenibles = computed(() => `${isCalculatedData.value.mainPercentage}%`)

const donutIngresosCarbono = computed(() => [
  { label: 'IIC', value: iicCalculatedData.value.mainPercentage, color: '#DC143C' },
  { label: 'Resto', value: 100 - iicCalculatedData.value.mainPercentage, color: '#E8E8E8' }
])
const subtitleIngresosCarbono = computed(() => `${iicCalculatedData.value.mainPercentage}%`)

const donutPresupuestosSostenibles = computed(() => [
  { label: 'PS', value: psCalculatedData.value.mainPercentage, color: '#7cb342' },
  { label: 'Resto', value: 100 - psCalculatedData.value.mainPercentage, color: '#E8E8E8' }
])
const subtitlePresupuestosSostenibles = computed(() => `${psCalculatedData.value.mainPercentage}%`)

const donutPresupuestosCarbono = computed(() => [
  { label: 'PIC', value: picCalculatedData.value.mainPercentage, color: '#DC143C' },
  { label: 'Resto', value: 100 - picCalculatedData.value.mainPercentage, color: '#E8E8E8' }
])
const subtitlePresupuestosCarbono = computed(() => `${picCalculatedData.value.mainPercentage}%`)

// Variables para leyenda
const variablesIngresosSostenibles = computed(() => (ingresosMapping?.donutSectorsISRegional || []).map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true })))
const variablesIngresosCarbono = computed(() => (ingresosMapping?.donutSectorsIICRegional || []).map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true })))
const variablesPresupuestosSostenibles = computed(() => (presupuestosMapping?.donutSectorsPSRegional || []).map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true })))
const variablesPresupuestosCarbono = computed(() => (presupuestosMapping?.donutSectorsPICRegional || []).map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true })))
</script>

<style scoped>
/* ============================================
   CONTENEDOR PRINCIPAL - Estilo HistoricalCard
   ============================================ */
.regional-charts-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 8px;
  overflow: visible;
  box-sizing: border-box;
}

.regional-charts-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
}

/* ============================================
   FILAS - 4 rows de 2 columnas
   ============================================ */
.row-1, .row-2, .row-3, .row-4 {
  display: flex;
  flex-direction: row;
  height: 580px;
  gap: 8px;
}

/* ============================================
   CARDS - Estilo HistoricalCard (fondo azul)
   ============================================ */
.chart-card {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  background: #163C5F;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #1a365d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
  overflow: visible;
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
  font-size: 18px;
  margin: 0;
  line-height: 1.3;
}

.chart-card-body {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  background: white;
  border-radius: 8px;
  overflow: visible;
  min-height: 0;
}

.chart-card-body > * {
  width: 100%;
  height: 100%;
}

/* ============================================
   NO DATA STATE
   ============================================ */
.no-data-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  text-align: center;
  width: 100%;
  height: 100%;
}

.no-data-state .no-data-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.no-data-state.green .no-data-icon {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.no-data-state.green .no-data-icon svg { stroke: #22c55e; }
.no-data-state.green .no-data-text strong { color: #166534; }

.no-data-state.red .no-data-icon {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
}

.no-data-state.red .no-data-icon svg { stroke: #dc2626; }
.no-data-state.red .no-data-text strong { color: #991b1b; }

.no-data-state .no-data-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e3a5f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.no-data-state .no-data-text {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================
   NO DATA AVAILABLE STATE (cuando no hay filas)
   ============================================ */
.no-data-available-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  min-height: 400px;
}

.no-data-available-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.no-data-available-icon svg {
  stroke: #f59e0b;
}

.no-data-available-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e3a5f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.no-data-available-text {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================
   RESPONSIVE - Tablets
   ============================================ */
@media (max-width: 1200px) {
  .row-1, .row-2, .row-3, .row-4 {
    height: 450px;
  }
}

/* ============================================
   RESPONSIVE - Móviles
   ============================================ */
@media (max-width: 768px) {
  .regional-charts-container {
    padding: 8px;
    border-radius: 10px;
    gap: 6px;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }

  .regional-charts-grid {
    gap: 6px;
    width: 100%;
    max-width: 100%;
  }

  .row-1, .row-2, .row-3, .row-4 {
    flex-direction: column;
    height: auto;
    min-height: auto;
    gap: 6px;
    width: 100%;
  }

  .chart-card {
    width: 100%;
    max-width: 100%;
    min-height: 280px;
    padding: 6px;
    border-radius: 10px;
    overflow: hidden;
    box-sizing: border-box;
  }

  .chart-card-header {
    padding: 3px 6px;
    margin-bottom: 4px;
  }

  .card-title {
    font-size: 11px;
    line-height: 1.3;
  }

  .chart-card-body {
    border-radius: 5px;
    min-height: 220px;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .no-data-state {
    padding: 20px 15px;
  }

  .no-data-state .no-data-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 12px;
  }

  .no-data-state .no-data-icon svg {
    width: 30px;
    height: 30px;
  }

  .no-data-state .no-data-title {
    font-size: 13px;
  }

  .no-data-state .no-data-text {
    font-size: 11px;
  }

  .no-data-available-state {
    padding: 40px 20px;
    min-height: 300px;
  }

  .no-data-available-icon {
    width: 60px;
    height: 60px;
  }

  .no-data-available-icon svg {
    width: 36px;
    height: 36px;
  }

  .no-data-available-title {
    font-size: 16px;
  }

  .no-data-available-text {
    font-size: 12px;
  }
}

/* ============================================
   RESPONSIVE - Móviles pequeños
   ============================================ */
@media (max-width: 480px) {
  .regional-charts-container {
    padding: 6px;
    border-radius: 8px;
    gap: 5px;
  }

  .regional-charts-grid {
    gap: 5px;
  }

  .row-1, .row-2, .row-3, .row-4 {
    gap: 5px;
  }

  .chart-card {
    min-height: 250px;
    padding: 5px;
    border-radius: 8px;
  }

  .chart-card-header {
    padding: 2px 5px;
    margin-bottom: 3px;
    border-bottom-width: 1px;
  }

  .card-title {
    font-size: 10px;
    line-height: 1.2;
  }

  .chart-card-body {
    border-radius: 4px;
    min-height: 200px;
  }

  .no-data-state {
    padding: 15px 10px;
  }

  .no-data-state .no-data-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 10px;
  }

  .no-data-state .no-data-icon svg {
    width: 24px;
    height: 24px;
  }

  .no-data-state .no-data-title {
    font-size: 12px;
  }

  .no-data-state .no-data-text {
    font-size: 10px;
  }

  .no-data-available-state {
    padding: 30px 15px;
    min-height: 250px;
  }

  .no-data-available-icon {
    width: 50px;
    height: 50px;
  }

  .no-data-available-icon svg {
    width: 30px;
    height: 30px;
  }

  .no-data-available-title {
    font-size: 14px;
  }

  .no-data-available-text {
    font-size: 11px;
  }
}

/* ============================================
   RESPONSIVE - Landscape en móviles
   ============================================ */
@media (max-width: 768px) and (orientation: landscape) {
  .regional-charts-container {
    padding: 5px;
  }

  .regional-charts-grid {
    gap: 4px;
  }

  .row-1, .row-2, .row-3, .row-4 {
    flex-direction: row;
    min-height: 200px;
    gap: 4px;
  }

  .chart-card {
    width: 50%;
    min-height: 200px;
    padding: 4px;
  }

  .card-title {
    font-size: 9px;
  }

  .chart-card-body {
    min-height: 160px;
  }

  .no-data-available-state {
    min-height: 200px;
    padding: 20px;
  }
}
</style>