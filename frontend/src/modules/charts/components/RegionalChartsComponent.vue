<!-- src/modules/charts/components/RegionalChartsComponent.vue -->
<!-- ✅ CORREGIDO: Usa mappings chartsPresupuestosRegional y chartsIngresosRegional -->
<!-- ✅ NUEVO: Diseño "sin datos" cuando todos los sectores son 0 -->
<template>
  <div class="charts-wrapper" :class="{ 'single-card': showingSingleCard }">

    <!-- CARD 1: INGRESOS -->
    <div v-if="!selectedVariable || selectedVariable.key === 'IS' || selectedVariable.key === 'IIC'" class="chart-card">
      <div class="chart-card-header">
        <h4 class="card-title">{{ cardTitleIngresos }}</h4>
      </div>
      
      <div class="chart-card-body">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando datos...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <p>Error: {{ error }}</p>
        </div>
        
        <!-- BarChart -->
        <div v-else class="chart-col-bar">
          <BarChart 
            :data="ingresosData"
            :title="ingresosTitleDynamic"
            headerTitle="Análisis de Ingresos Regionales"
            :selectedState="'Regional'"
            :selectedYear="selectedYear"
          />
        </div>
        
        <!-- Donas derecha -->
        <div v-if="!loading && !error" class="chart-col-donuts" :class="{ 'single-donut': showingSingleDonutIngresos }">
          <!-- IS - Ingresos Sostenibles -->
          <div v-if="!selectedVariable || selectedVariable.key === 'IS'" class="donut-item">
            <div class="donut-header-dark">
              <div class="donut-header-icon green">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="donut-header-title">Sectores de Ingresos Sostenibles</span>
            </div>
            
            <!-- Estado sin datos para IS -->
            <div v-if="isISDataEmpty" class="no-data-state green">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">
                No se registraron ingresos en los sectores de <strong>Ingresos Sostenibles</strong> para el año <strong>{{ selectedYear || 'seleccionado' }}</strong>
              </p>
            </div>
            
            <!-- DonutChart normal cuando hay datos -->
            <DonutChart 
              v-else-if="sectoresIngresosSostenibles.length > 0"
              :key="`is-regional-${props.selectedYear}-${sectoresIngresosSostenibles.length}`"
              :data="donutIngresosSostenibles"
              title="IS"
              :subtitle="subtitleIngresosSostenibles"
              :size="220"
              :variables="variablesIngresosSostenibles"
              :sectors="sectoresIngresosSostenibles"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
          
          <!-- IIC - Ingresos Intensivos en Carbono -->
          <div v-if="!selectedVariable || selectedVariable.key === 'IIC'" class="donut-item">
            <div class="donut-header-dark">
              <div class="donut-header-icon red">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="donut-header-title">Sectores de Ingresos Int. en Carbono</span>
            </div>
            
            <!-- Estado sin datos para IIC -->
            <div v-if="isIICDataEmpty" class="no-data-state red">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">
                No se registraron ingresos en los sectores de <strong>Ingresos Intensivos en Carbono</strong> para el año <strong>{{ selectedYear || 'seleccionado' }}</strong>
              </p>
            </div>
            
            <!-- DonutChart normal cuando hay datos -->
            <DonutChart 
              v-else-if="sectoresIngresosCarbono.length > 0"
              :key="`iic-regional-${props.selectedYear}-${sectoresIngresosCarbono.length}`"
              :data="donutIngresosCarbono"
              title="IIC"
              :subtitle="subtitleIngresosCarbono"
              :size="220"
              :variables="variablesIngresosCarbono"
              :sectors="sectoresIngresosCarbono"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CARD 2: PRESUPUESTOS -->
    <div v-if="!selectedVariable || selectedVariable.key === 'PS' || selectedVariable.key === 'PIC'" class="chart-card">
      <div class="chart-card-header">
        <h4 class="card-title">{{ cardTitlePresupuestos }}</h4>
      </div>
      
      <div class="chart-card-body">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando datos...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <p>Error: {{ error }}</p>
        </div>
        
        <!-- BarChart -->
        <div v-else class="chart-col-bar">
          <BarChart 
            :data="presupuestosData"
            :title="presupuestosTitleDynamic"
            headerTitle="Análisis de Presupuestos Regionales"
            :selectedState="'Regional'"
            :selectedYear="selectedYear"
          />
        </div>
        
        <!-- Donas derecha -->
        <div v-if="!loading && !error" class="chart-col-donuts" :class="{ 'single-donut': showingSingleDonutPresupuestos }">
          <!-- PS - Presupuestos Sostenibles -->
          <div v-if="!selectedVariable || selectedVariable.key === 'PS'" class="donut-item">
            <div class="donut-header-dark">
              <div class="donut-header-icon green">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="donut-header-title">Sectores de Presupuestos Sostenibles</span>
            </div>
            
            <!-- Estado sin datos para PS -->
            <div v-if="isPSDataEmpty" class="no-data-state green">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">
                No se registraron egresos en los sectores de <strong>Presupuestos Sostenibles</strong> para el año <strong>{{ selectedYear || 'seleccionado' }}</strong>
              </p>
            </div>
            
            <!-- DonutChart normal cuando hay datos -->
            <DonutChart 
              v-else-if="sectoresPresupuestosSostenibles.length > 0"
              :key="`ps-regional-${props.selectedYear}-${sectoresPresupuestosSostenibles.length}`"
              :data="donutPresupuestosSostenibles"
              title="PS"
              :subtitle="subtitlePresupuestosSostenibles"
              :size="220"
              :variables="variablesPresupuestosSostenibles"
              :sectors="sectoresPresupuestosSostenibles"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
          
          <!-- PIC - Presupuestos Intensivos en Carbono -->
          <div v-if="!selectedVariable || selectedVariable.key === 'PIC'" class="donut-item">
            <div class="donut-header-dark">
              <div class="donut-header-icon red">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="donut-header-title">Sectores de Presupuestos Int. en Carbono</span>
            </div>
            
            <!-- Estado sin datos para PIC -->
            <div v-if="isPICDataEmpty" class="no-data-state red">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">
                No se registraron egresos en los sectores de <strong>Presupuestos Intensivos en Carbono</strong> para el año <strong>{{ selectedYear || 'seleccionado' }}</strong>
              </p>
            </div>
            
            <!-- DonutChart normal cuando hay datos -->
            <DonutChart 
              v-else-if="sectoresPresupuestosCarbono.length > 0"
              :key="`pic-regional-${props.selectedYear}-${sectoresPresupuestosCarbono.length}`"
              :data="donutPresupuestosCarbono"
              title="PIC"
              :subtitle="subtitlePresupuestosCarbono"
              :size="220"
              :variables="variablesPresupuestosCarbono"
              :sectors="sectoresPresupuestosCarbono"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
        </div>
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
  selectedVariable: { type: Object, default: null },
  ifssData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['years-loaded'])

const showingSingleCard = computed(() => !!props.selectedVariable)
const showingSingleDonutPresupuestos = computed(() => props.selectedVariable && (props.selectedVariable.key === 'PS' || props.selectedVariable.key === 'PIC'))
const showingSingleDonutIngresos = computed(() => props.selectedVariable && (props.selectedVariable.key === 'IS' || props.selectedVariable.key === 'IIC'))

const { fetchData, loading, error } = useStorageData()
const dataLoaded = ref(false)
const rawRegionalData = ref([])

const presupuestosMapping = getMapping('chartsPresupuestosRegional')
const ingresosMapping = getMapping('chartsIngresosRegional')

const extractAvailableYears = (data) => {
  if (!data || data.length === 0) return []
  
  const yearColumn = 'Año'
  const years = [...new Set(
    data
      .map(row => row[yearColumn])
      .filter(year => year !== null && year !== undefined && year !== '')
      .map(year => String(year).trim())
  )]
  
  years.sort((a, b) => Number(b) - Number(a))
  console.log('📅 [Regional] Años extraídos:', years)
  return years
}

const loadChartData = async () => {
  try {
    console.log('📊 [Regional] Cargando datos regionales...')
    
    const sheetName = getSheetName('chartsPresupuestosRegional')
    const data = await fetchData('chartsPresupuestosRegional', sheetName)
    console.log('📊 [Regional] Datos cargados:', data?.length, 'filas')
    
    if (data && data.length > 0) {
      const availableYears = extractAvailableYears(data)
      if (availableYears.length > 0) {
        emit('years-loaded', availableYears)
      }
    }
    
    rawRegionalData.value = data || []
    dataLoaded.value = true
  } catch (err) {
    console.error('❌ [Regional] Error cargando datos:', err)
  }
}

onMounted(() => loadChartData())

watch(() => props.selectedYear, async (newYear, oldYear) => {
  if (newYear !== oldYear) {
    console.log('📊 [Regional] Año cambió:', oldYear, '->', newYear)
  }
})

const filteredData = computed(() => {
  if (!dataLoaded.value || !rawRegionalData.value.length) return []
  
  const yearColumn = 'Año'
  
  if (!props.selectedYear) {
    return rawRegionalData.value
  }
  
  return rawRegionalData.value.filter(row => {
    const rowYear = String(row[yearColumn]).trim()
    const selectedYear = String(props.selectedYear).trim()
    return rowYear === selectedYear
  })
})

const filteredPresupuestosData = computed(() => filteredData.value)
const filteredIngresosData = computed(() => filteredData.value)

// ✅ Calcular datos para donas - ahora retorna también totalSectorsValue
const calculateDonutData = (row, sectorsConfig, totalValue) => {
  if (!row || !sectorsConfig || !totalValue) {
    return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  }
  
  let sectorsTotal = 0
  const sectors = sectorsConfig.map(sectorConfig => {
    const value = getCleanValue(row, sectorConfig.column)
    sectorsTotal += value
    return { 
      key: sectorConfig.key, 
      label: sectorConfig.label, 
      value, 
      color: sectorConfig.color, 
      colorClass: sectorConfig.colorClass 
    }
  })
  
  const percentage = totalValue > 0 ? Math.round((sectorsTotal / totalValue) * 100) : 0
  
  return { mainPercentage: percentage, sectors, totalSectorsValue: sectorsTotal }
}

const transformSingleRowToBarChart = (row, mapping) => {
  if (!row || !mapping?.variableColumns) return { variables: [] }
  
  const variables = mapping.variableColumns.map(varConfig => {
    const value = getCleanValue(row, varConfig.column)
    return {
      key: varConfig.key, 
      label: varConfig.label, 
      value,
      color: varConfig.color, 
      colorClass: varConfig.colorClass, 
      order: varConfig.order || 0
    }
  })
  
  variables.sort((a, b) => a.order - b.order)
  return { variables }
}

// ✅ Datos para BarChart
const presupuestosData = computed(() => {
  if (!filteredPresupuestosData.value.length) return { variables: [] }
  const result = transformSingleRowToBarChart(filteredPresupuestosData.value[0], presupuestosMapping)
  
  if (props.selectedVariable && result.variables.length >= 3) {
    if (props.selectedVariable.key === 'PS') {
      result.variables = [result.variables[0], result.variables[1]].filter(v => v)
    } else if (props.selectedVariable.key === 'PIC') {
      result.variables = [result.variables[0], result.variables[2]].filter(v => v)
    }
  }
  return result
})

const ingresosData = computed(() => {
  if (!filteredIngresosData.value.length) return { variables: [] }
  const result = transformSingleRowToBarChart(filteredIngresosData.value[0], ingresosMapping)
  
  if (props.selectedVariable && result.variables.length >= 3) {
    if (props.selectedVariable.key === 'IS') {
      result.variables = [result.variables[0], result.variables[1]].filter(v => v)
    } else if (props.selectedVariable.key === 'IIC') {
      result.variables = [result.variables[0], result.variables[2]].filter(v => v)
    }
  }
  return result
})

// ✅ Columnas de totales
const presupuestoTotalColumn = computed(() => {
  const ptConfig = presupuestosMapping?.variableColumns?.find(v => 
    v.key === 'presupuesto_total_reg' || v.column === 'PT' || v.column === 'PT ($)'
  )
  return ptConfig?.column || 'PT'
})

const ingresoTotalColumn = computed(() => {
  const itConfig = ingresosMapping?.variableColumns?.find(v => 
    v.key === 'ingresos_total_reg' || v.column === 'IT' || v.column === 'IT ($)'
  )
  return itConfig?.column || 'IT ($)'
})

// ============================================================================
// ✅ COMPUTED PARA DETECTAR SI LOS DATOS ESTÁN VACÍOS (todos los sectores = 0)
// ============================================================================

// PS - Presupuestos Sostenibles
const psCalculatedData = computed(() => {
  if (!filteredPresupuestosData.value.length) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const row = filteredPresupuestosData.value[0]
  const total = getCleanValue(row, presupuestoTotalColumn.value)
  const sectorsConfig = presupuestosMapping?.donutSectorsPSRegional || []
  return calculateDonutData(row, sectorsConfig, total)
})

const isPSDataEmpty = computed(() => {
  return psCalculatedData.value.totalSectorsValue === 0
})

// PIC - Presupuestos Intensivos en Carbono
const picCalculatedData = computed(() => {
  if (!filteredPresupuestosData.value.length) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const row = filteredPresupuestosData.value[0]
  const total = getCleanValue(row, presupuestoTotalColumn.value)
  const sectorsConfig = presupuestosMapping?.donutSectorsPICRegional || []
  return calculateDonutData(row, sectorsConfig, total)
})

const isPICDataEmpty = computed(() => {
  return picCalculatedData.value.totalSectorsValue === 0
})

// IS - Ingresos Sostenibles
const isCalculatedData = computed(() => {
  if (!filteredIngresosData.value.length) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, ingresoTotalColumn.value)
  const sectorsConfig = ingresosMapping?.donutSectorsISRegional || []
  return calculateDonutData(row, sectorsConfig, total)
})

const isISDataEmpty = computed(() => {
  return isCalculatedData.value.totalSectorsValue === 0
})

// IIC - Ingresos Intensivos en Carbono
const iicCalculatedData = computed(() => {
  if (!filteredIngresosData.value.length) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, ingresoTotalColumn.value)
  const sectorsConfig = ingresosMapping?.donutSectorsIICRegional || []
  return calculateDonutData(row, sectorsConfig, total)
})

const isIICDataEmpty = computed(() => {
  return iicCalculatedData.value.totalSectorsValue === 0
})

// ============================================================================
// DATOS PARA DONUT CHARTS
// ============================================================================

const donutPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length || isPSDataEmpty.value) {
    return [{ label: 'PS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  return [
    { label: 'PS', value: psCalculatedData.value.mainPercentage, color: '#7cb342' }, 
    { label: 'Resto', value: 100 - psCalculatedData.value.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresPresupuestosSostenibles = computed(() => {
  if (isPSDataEmpty.value) return []
  return psCalculatedData.value.sectors
})

const subtitlePresupuestosSostenibles = computed(() => `${donutPresupuestosSostenibles.value[0].value}%`)

const donutPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length || isPICDataEmpty.value) {
    return [{ label: 'PIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  return [
    { label: 'PIC', value: picCalculatedData.value.mainPercentage, color: '#DC143C' }, 
    { label: 'Resto', value: 100 - picCalculatedData.value.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresPresupuestosCarbono = computed(() => {
  if (isPICDataEmpty.value) return []
  return picCalculatedData.value.sectors
})

const subtitlePresupuestosCarbono = computed(() => `${donutPresupuestosCarbono.value[0].value}%`)

const donutIngresosSostenibles = computed(() => {
  if (!filteredIngresosData.value.length || isISDataEmpty.value) {
    return [{ label: 'IS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  return [
    { label: 'IS', value: isCalculatedData.value.mainPercentage, color: '#7cb342' }, 
    { label: 'Resto', value: 100 - isCalculatedData.value.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresIngresosSostenibles = computed(() => {
  if (isISDataEmpty.value) return []
  return isCalculatedData.value.sectors
})

const subtitleIngresosSostenibles = computed(() => `${donutIngresosSostenibles.value[0].value}%`)

const donutIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length || isIICDataEmpty.value) {
    return [{ label: 'IIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  return [
    { label: 'IIC', value: iicCalculatedData.value.mainPercentage, color: '#DC143C' }, 
    { label: 'Resto', value: 100 - iicCalculatedData.value.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresIngresosCarbono = computed(() => {
  if (isIICDataEmpty.value) return []
  return iicCalculatedData.value.sectors
})

const subtitleIngresosCarbono = computed(() => `${donutIngresosCarbono.value[0].value}%`)

// ============================================================================
// TÍTULOS DINÁMICOS
// ============================================================================

const presupuestosTitleDynamic = computed(() => {
  const yearSuffix = props.selectedYear ? ` en ${props.selectedYear}` : ''
  if (props.selectedVariable?.key === 'PS') return `Presupuestos Sostenibles (PS) con respecto al Presupuesto Total (PT)${yearSuffix}`
  if (props.selectedVariable?.key === 'PIC') return `Presupuestos Intensivos en Carbono (PIC) con respecto al Presupuesto Total (PT)${yearSuffix}`
  return `Presupuestos Intensivos en Carbono (PIC) y Presupuestos Sostenibles (PS) con respecto del gasto total${yearSuffix}`
})

const ingresosTitleDynamic = computed(() => {
  const yearSuffix = props.selectedYear ? ` en ${props.selectedYear}` : ''
  if (props.selectedVariable?.key === 'IS') return `Ingresos Sostenibles (IS) con respecto al Ingreso Total (IT)${yearSuffix}`
  if (props.selectedVariable?.key === 'IIC') return `Ingresos Intensivos en Carbono (IIC) con respecto al Ingreso Total (IT)${yearSuffix}`
  return `Proporción del gasto asignado a Ingresos${yearSuffix}`
})

const cardTitlePresupuestos = computed(() => {
  return `Presupuestos - Regional${props.selectedYear ? ` - ${props.selectedYear}` : ''}`
})

const cardTitleIngresos = computed(() => {
  return `Ingresos - Regional${props.selectedYear ? ` - ${props.selectedYear}` : ''}`
})

// ============================================================================
// VARIABLES PARA LEYENDA DE DONAS
// ============================================================================

const variablesPresupuestosSostenibles = computed(() => {
  const sectors = presupuestosMapping?.donutSectorsPSRegional || []
  return sectors.map(s => ({
    key: s.key,
    label: s.label,
    colorClass: s.colorClass,
    active: true
  }))
})

const variablesPresupuestosCarbono = computed(() => {
  const sectors = presupuestosMapping?.donutSectorsPICRegional || []
  return sectors.map(s => ({
    key: s.key,
    label: s.label,
    colorClass: s.colorClass,
    active: true
  }))
})

const variablesIngresosSostenibles = computed(() => {
  const sectors = ingresosMapping?.donutSectorsISRegional || []
  return sectors.map(s => ({
    key: s.key,
    label: s.label,
    colorClass: s.colorClass,
    active: true
  }))
})

const variablesIngresosCarbono = computed(() => {
  const sectors = ingresosMapping?.donutSectorsIICRegional || []
  return sectors.map(s => ({
    key: s.key,
    label: s.label,
    colorClass: s.colorClass,
    active: true
  }))
})
</script>

<style scoped>
.charts-wrapper {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100%;
}

.charts-wrapper.single-card { align-items: center; }
.charts-wrapper.single-card .chart-card { height: 50%; max-height: 50%; }

.chart-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #1a365d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
  min-height: 625px;
}

.chart-card-header {
  display: flex;
  width: 100%;
  padding: 10px;
  border-bottom: 1px solid #163C5F;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.card-title {
  padding: 4px 0px 0px 0;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 200;
  color: #163C5F;
  font-size: 19px;
  margin: 0;
}

.chart-card-body {
  display: flex;
  flex-direction: row;
  gap: 15px;
  width: 100%;
  flex: 1;
  min-height: 440px;
}

.chart-col-bar {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 5px;
  border-radius: 12px;
  background: white;
  min-height: 440px;
}

.chart-col-donuts {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding: 5px;
  border-radius: 12px;
  background: white;
  min-height: 440px;
}

.chart-col-donuts.single-donut { justify-content: center; }
.chart-col-donuts.single-donut .donut-item { max-width: 100%; }

.donut-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: 12px;
  min-height: 0;
  flex: 1;
  padding: 0 0 15px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.donut-item:first-child:last-child { max-width: 100%; }

.donut-header-dark {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
  width: 100%;
}

.donut-header-icon {
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.donut-header-icon.green { color: #86efac; }
.donut-header-icon.red { color: #fca5a5; }
.donut-header-icon svg { width: 12px; height: 12px; }

.donut-header-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: white;
  line-height: 1.2;
  letter-spacing: 0.2px;
}

/* ============================================================================
   ✅ ESTILOS PARA ESTADO "SIN DATOS"
   ============================================================================ */

.no-data-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

.no-data-state .no-data-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

/* Variante verde (sostenibles) */
.no-data-state.green .no-data-icon {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.no-data-state.green .no-data-icon svg {
  stroke: #22c55e;
}

.no-data-state.green .no-data-text strong {
  color: #166534;
}

/* Variante roja (intensivos en carbono) */
.no-data-state.red .no-data-icon {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
}

.no-data-state.red .no-data-icon svg {
  stroke: #dc2626;
}

.no-data-state.red .no-data-text strong {
  color: #991b1b;
}

.no-data-state .no-data-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e3a5f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.no-data-state .no-data-text {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================================================ */

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #7cb342;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container { color: #DC143C; }

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  color: rgba(100, 100, 100, 0.6);
  font-size: 14px;
}

@media (max-width: 1200px) {
  .chart-card-body { flex-direction: column; }
  .chart-col-donuts { flex-direction: row; flex: 1; }
  .chart-col-bar { min-height: 350px; }
}

@media (max-width: 768px) {
  .chart-col-donuts { flex-direction: column; }
  .donut-item { min-height: 300px; }
  .chart-col-bar { min-height: 300px; }
}
</style>