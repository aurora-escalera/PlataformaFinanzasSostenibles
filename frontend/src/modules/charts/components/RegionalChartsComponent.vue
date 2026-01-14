<!-- src/modules/charts/components/RegionalChartsComponent.vue -->
<!-- ✅ ACTUALIZADO: Cards unificadas (todas las variables) o 1 card con 2 subcards (variable específica) -->
<template>
  <div class="regional-charts-wrapper">
    
    <!-- ============================================
         CASO 1: TODAS LAS VARIABLES - Cards Unificadas con 4 subcards
         ============================================ -->
    <template v-if="!selectedVariable">
      <!-- CARD UNIFICADA: INGRESOS REGIONALES -->
      <RegionalUnifiedCard
        card-type="ingresos"
        :selected-year="selectedYear"
        :loading="loading"
        :error="error"
        currency="USD"
        :total-value="ingresosTotalValue"
        :reference-value="financiamientoTotalValue"
        :sustainable-value="ingresosSosteniblesValue"
        :sustainable-percent="ingresosSosteniblesPercent"
        :sustainable-position="ingresosSosteniblesPosition"
        :sustainable-sectors="sectoresIngresosSostenibles"
        :carbon-value="ingresosCarbonoValue"
        :carbon-percent="ingresosCarbonoPercent"
        :carbon-position="ingresosCarbonoPosition"
        :carbon-sectors="sectoresIngresosCarbono"
      />

      <!-- CARD UNIFICADA: PRESUPUESTOS REGIONALES -->
      <RegionalUnifiedCard
        card-type="presupuestos"
        :selected-year="selectedYear"
        :loading="loading"
        :error="error"
        currency="USD"
        :total-value="gastoTotalValue"
        :reference-value="gastoTotalValue"
        :sustainable-value="presupuestoSostenibleValue"
        :sustainable-percent="presupuestoSosteniblePercent"
        :sustainable-position="presupuestoSosteniblePosition"
        :sustainable-sectors="sectoresPresupuestosSostenibles"
        :carbon-value="presupuestoCarbonoValue"
        :carbon-percent="presupuestoCarbonoPercent"
        :carbon-position="presupuestoCarbonoPosition"
        :carbon-sectors="sectoresPresupuestosCarbono"
      />
    </template>

    <!-- ============================================
         CASO 2: VARIABLE ESPECÍFICA - Cards Individuales
         ============================================ -->
    <template v-else>
      
      <!-- IS: Ingresos Sostenibles -->
      <div v-if="selectedVariable.key === 'IS'" class="single-variable-card">
        <div class="main-card-header">
          <h2 class="main-card-title">Ingresos Sostenibles - Regional - {{ selectedYear }}</h2>
        </div>
        <div class="main-card-content two-columns">
          <!-- Subcard Barras IS (sin header, BarChart ya tiene el suyo) -->
          <div class="sub-card-bar-only">
            <BarChart 
              :data="financiamientoISData" 
              :title="'Financiamiento Total (FT) vs Ingresos Sostenibles (IS)'" 
              headerTitle="Financiamiento Total vs Ingresos Sostenibles" 
              :selectedState="'Regional'" 
              :selectedYear="selectedYear" 
              currency="USD"
              :showDownload="false"
            />
          </div>
          <!-- Subcard Dona IS -->
          <div class="sub-card">
            <div class="donut-header green">
              <div class="donut-header-icon green">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span>Componentes de Ingresos Sostenibles</span>
            </div>
            <div class="donut-body-content">
              <DonutChart 
                v-if="sectoresIngresosSostenibles.length > 0"
                :key="`is-regional-${selectedYear}`" 
                :data="donutIngresosSostenibles" 
                title="IS" 
                :subtitle="subtitleIngresosSostenibles" 
                :size="180" 
                :variables="variablesIngresosSostenibles" 
                :sectors="sectoresIngresosSostenibles" 
                currency="USD"
              />
              <div v-else class="no-data-state green">
                <div class="no-data-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                </div>
                <h3 class="no-data-title">Sin datos disponibles</h3>
                <p class="no-data-text">No se registraron datos para <strong>Ingresos Sostenibles</strong> en {{ selectedYear }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- IIC: Ingresos Intensivos en Carbono -->
      <div v-if="selectedVariable.key === 'IIC'" class="single-variable-card">
        <div class="main-card-header">
          <h2 class="main-card-title">Ingresos Intensivos en Carbono - Regional - {{ selectedYear }}</h2>
        </div>
        <div class="main-card-content two-columns">
          <!-- Subcard Barras IIC (sin header, BarChart ya tiene el suyo) -->
          <div class="sub-card-bar-only">
            <BarChart 
              :data="ingresoIICData" 
              :title="'Ingreso Total (IT) vs Ingresos Intensivos en Carbono (IIC)'" 
              headerTitle="Ingreso Total vs Ingresos Intensivos en Carbono" 
              :selectedState="'Regional'" 
              :selectedYear="selectedYear" 
              currency="USD"
              :showDownload="false"
            />
          </div>
          <!-- Subcard Dona IIC -->
          <div class="sub-card">
            <div class="donut-header red">
              <div class="donut-header-icon red">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span>Componentes de Ingresos Intensivos en Carbono</span>
            </div>
            <div class="donut-body-content">
              <DonutChart 
                v-if="sectoresIngresosCarbono.length > 0"
                :key="`iic-regional-${selectedYear}`" 
                :data="donutIngresosCarbono" 
                title="IIC" 
                :subtitle="subtitleIngresosCarbono" 
                :size="180" 
                :variables="variablesIngresosCarbono" 
                :sectors="sectoresIngresosCarbono" 
                currency="USD"
              />
              <div v-else class="no-data-state red">
                <div class="no-data-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                </div>
                <h3 class="no-data-title">Sin datos disponibles</h3>
                <p class="no-data-text">No se registraron datos para <strong>Ingresos Intensivos en Carbono</strong> en {{ selectedYear }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PS: Presupuestos Sostenibles -->
      <div v-if="selectedVariable.key === 'PS'" class="single-variable-card">
        <div class="main-card-header">
          <h2 class="main-card-title">Presupuestos Sostenibles - Regional - {{ selectedYear }}</h2>
        </div>
        <div class="main-card-content two-columns">
          <!-- Subcard Barras PS (sin header, BarChart ya tiene el suyo) -->
          <div class="sub-card-bar-only">
            <BarChart 
              :data="gastoPSData" 
              :title="'Gasto Total (GT) vs Presupuesto Sostenible (PS)'" 
              headerTitle="Gasto Total vs Presupuesto Sostenible" 
              :selectedState="'Regional'" 
              :selectedYear="selectedYear" 
              currency="USD"
              :showDownload="false"
            />
          </div>
          <!-- Subcard Dona PS -->
          <div class="sub-card">
            <div class="donut-header green">
              <div class="donut-header-icon green">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span>Componentes de Presupuestos Sostenibles</span>
            </div>
            <div class="donut-body-content">
              <DonutChart 
                v-if="sectoresPresupuestosSostenibles.length > 0"
                :key="`ps-regional-${selectedYear}`" 
                :data="donutPresupuestosSostenibles" 
                title="PS" 
                :subtitle="subtitlePresupuestosSostenibles" 
                :size="180" 
                :variables="variablesPresupuestosSostenibles" 
                :sectors="sectoresPresupuestosSostenibles" 
                currency="USD"
              />
              <div v-else class="no-data-state green">
                <div class="no-data-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                </div>
                <h3 class="no-data-title">Sin datos disponibles</h3>
                <p class="no-data-text">No se registraron datos para <strong>Presupuestos Sostenibles</strong> en {{ selectedYear }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PIC: Presupuestos Intensivos en Carbono -->
      <div v-if="selectedVariable.key === 'PIC'" class="single-variable-card">
        <div class="main-card-header">
          <h2 class="main-card-title">Presupuestos Intensivos en Carbono - Regional - {{ selectedYear }}</h2>
        </div>
        <div class="main-card-content two-columns">
          <!-- Subcard Barras PIC (sin header, BarChart ya tiene el suyo) -->
          <div class="sub-card-bar-only">
            <BarChart 
              :data="gastoPICData" 
              :title="'Gasto Total (GT) vs Presupuestos Intensivos en Carbono (PIC)'" 
              headerTitle="Gasto Total vs Presupuestos Intensivos en Carbono" 
              :selectedState="'Regional'" 
              :selectedYear="selectedYear" 
              currency="USD"
              :showDownload="false"
            />
          </div>
          <!-- Subcard Dona PIC -->
          <div class="sub-card">
            <div class="donut-header red">
              <div class="donut-header-icon red">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span>Componentes de Presupuestos Intensivos en Carbono</span>
            </div>
            <div class="donut-body-content">
              <DonutChart 
                v-if="sectoresPresupuestosCarbono.length > 0"
                :key="`pic-regional-${selectedYear}`" 
                :data="donutPresupuestosCarbono" 
                title="PIC" 
                :subtitle="subtitlePresupuestosCarbono" 
                :size="180" 
                :variables="variablesPresupuestosCarbono" 
                :sectors="sectoresPresupuestosCarbono" 
                currency="USD"
              />
              <div v-else class="no-data-state red">
                <div class="no-data-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                </div>
                <h3 class="no-data-title">Sin datos disponibles</h3>
                <p class="no-data-text">No se registraron datos para <strong>Presupuestos Intensivos en Carbono</strong> en {{ selectedYear }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'
import { getCleanValue } from '@/composables/parseNumber'
import RegionalUnifiedCard from './RegionalUnifiedCard.vue'
import BarChart from './BarChart.vue'
import DonutChart from './DonutChart.vue'

const props = defineProps({
  selectedYear: { type: String, default: null },
  selectedVariable: { type: Object, default: null },
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
  } catch (err) {
    console.error('❌ [Regional] Error:', err)
  }
}

onMounted(() => loadChartData())

watch(() => props.selectedYear, (n, o) => {
  if (n !== o) console.log('📊 [Regional] Año:', o, '->', n)
})

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
// DATOS DE INGRESOS (para card unificada)
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
// DATOS DE PRESUPUESTOS (para card unificada)
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
// DATOS PARA BARCHART (variables individuales)
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
// DATOS PARA DONUTCHART (variables individuales)
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
.regional-charts-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 0;
}

/* ============================================
   CARD INDIVIDUAL POR VARIABLE ESPECÍFICA
   ============================================ */
.single-variable-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #1a365d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.main-card-header {
  padding: 16px 24px;
  border-bottom: 1px solid #1a365d;
}

.main-card-title {
  font-size: 17px;
  font-weight: 400;
  color: #163C5F;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
}

.main-card-content {
  padding: 16px;
}

.main-card-content.two-columns {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}

/* ============================================
   SUBCARDS (para variable específica)
   ============================================ */
.sub-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Subcard para BarChart sin header adicional (BarChart ya tiene el suyo) */
.sub-card-bar-only {
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.sub-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  color: white;
}

.sub-header-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #93c5fd;
}

.sub-header-text { flex: 1; }
.sub-header-title { font-size: 12px; font-weight: 600; }
.sub-header-subtitle { font-size: 9px; color: rgba(255, 255, 255, 0.6); }

.sub-card-body {
  padding: 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

/* ============================================
   DONUT HEADER Y BODY (para variable específica)
   ============================================ */
.donut-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: white;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
}

.donut-header-icon {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-header-icon.green { color: #86efac; }
.donut-header-icon.red { color: #fca5a5; }

.donut-body-content {
  flex: 1;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  .main-card-content.two-columns { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .regional-charts-wrapper { gap: 16px; }
  .sub-card-body, .donut-body-content { min-height: 350px; }
}
</style>