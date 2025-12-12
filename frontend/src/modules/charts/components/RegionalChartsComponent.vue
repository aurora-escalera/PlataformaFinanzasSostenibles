<!-- src/modules/charts/components/RegionalChartsComponent.vue -->
<!-- ✅ CORREGIDO: Usa mappings chartsPresupuestosRegional y chartsIngresosRegional -->
<!-- ✅ FIX: getCleanValue ahora detecta automáticamente formato americano (comas) vs europeo (puntos) -->
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
        
        <!-- ✅ BarChart con header integrado -->
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
          <div v-if="!selectedVariable || selectedVariable.key === 'IS'" class="donut-item">
            <div class="donut-header-dark">
              <div class="donut-header-icon green">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="donut-header-title">Sectores de Ingresos Sostenibles</span>
            </div>
            <DonutChart 
              v-if="sectoresIngresosSostenibles.length > 0"
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
            <DonutChart 
              v-if="sectoresIngresosCarbono.length > 0"
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
        
        <!-- ✅ BarChart con header integrado -->
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
          <div v-if="!selectedVariable || selectedVariable.key === 'PS'" class="donut-item">
            <div class="donut-header-dark">
              <div class="donut-header-icon green">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="donut-header-title">Sectores de Presupuestos Sostenibles</span>
            </div>
            <DonutChart 
              v-if="sectoresPresupuestosSostenibles.length > 0"
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
            <DonutChart 
              v-if="sectoresPresupuestosCarbono.length > 0"
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

const showingSingleCard = computed(() => !!props.selectedVariable)
const showingSingleDonutPresupuestos = computed(() => props.selectedVariable && (props.selectedVariable.key === 'PS' || props.selectedVariable.key === 'PIC'))
const showingSingleDonutIngresos = computed(() => props.selectedVariable && (props.selectedVariable.key === 'IS' || props.selectedVariable.key === 'IIC'))

const { fetchData, loading, error } = useStorageData()
const dataLoaded = ref(false)
const rawRegionalData = ref([])

// ✅ CORREGIDO: Usar los mappings correctos
const presupuestosMapping = getMapping('chartsPresupuestosRegional')
const ingresosMapping = getMapping('chartsIngresosRegional')

const loadChartData = async () => {
  try {
    console.log('📊 [Regional] Cargando datos regionales...')
    
    // Usar el fileKey correcto para datos regionales
    const sheetName = getSheetName('chartsPresupuestosRegional')
    console.log('📊 [Regional] Sheet name:', sheetName)
    
    // Fetch data - usa 'chartsPresupuestosRegional' que apunta a 'Hoja 1' del sheet principal
    const data = await fetchData('chartsPresupuestosRegional', sheetName)
    console.log('📊 [Regional] Datos cargados:', data?.length, 'filas')
    
    if (data && data.length > 0) {
      console.log('📊 [Regional] Primera fila:', data[0])
      console.log('📊 [Regional] Columnas disponibles:', Object.keys(data[0]))
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

// ✅ Filtrar por año usando la columna 'Año'
const filteredData = computed(() => {
  if (!dataLoaded.value || !rawRegionalData.value.length) {
    console.log('📊 [Regional] No hay datos cargados')
    return []
  }
  
  const yearColumn = 'Año'
  console.log('📊 [Regional] Año seleccionado:', props.selectedYear)
  
  if (!props.selectedYear) {
    console.log('📊 [Regional] Sin año seleccionado, usando todos los datos')
    return rawRegionalData.value
  }
  
  const filtered = rawRegionalData.value.filter(row => {
    const rowYear = String(row[yearColumn]).trim()
    const selectedYear = String(props.selectedYear).trim()
    return rowYear === selectedYear
  })
  
  console.log('📊 [Regional] Datos filtrados:', filtered.length, 'filas')
  if (filtered.length > 0) {
    console.log('📊 [Regional] Fila filtrada:', filtered[0])
  }
  
  return filtered
})

// Alias para compatibilidad
const filteredPresupuestosData = computed(() => filteredData.value)
const filteredIngresosData = computed(() => filteredData.value)

// ✅ Calcular datos para donas usando sectores del mapping
const calculateDonutData = (row, sectorsConfig, totalValue) => {
  if (!row || !sectorsConfig || !totalValue) {
    return { mainPercentage: 0, sectors: [] }
  }
  
  let sectorsTotal = 0
  const sectors = sectorsConfig.map(sectorConfig => {
    const value = getCleanValue(row, sectorConfig.column)
    sectorsTotal += value
    console.log(`📊 [Regional] Sector '${sectorConfig.label}' (${sectorConfig.column}):`, value)
    return { 
      key: sectorConfig.key, 
      label: sectorConfig.label, 
      value, 
      color: sectorConfig.color, 
      colorClass: sectorConfig.colorClass 
    }
  })
  
  const percentage = totalValue > 0 ? Math.round((sectorsTotal / totalValue) * 100) : 0
  console.log('📊 [Regional] Total sectores:', sectorsTotal, '/ Total:', totalValue, '=', percentage + '%')
  
  return { mainPercentage: percentage, sectors }
}

// ✅ Transformar datos para BarChart
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

// ✅ Datos para BarChart de presupuestos
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

// ✅ Datos para BarChart de ingresos
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

// ✅ PRESUPUESTOS SOSTENIBLES - columna PT del mapping
const presupuestoTotalColumn = computed(() => {
  const ptConfig = presupuestosMapping?.variableColumns?.find(v => 
    v.key === 'presupuesto_total_reg' || v.column === 'PT' || v.column === 'PT ($)'
  )
  return ptConfig?.column || 'PT'
})

const donutPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length) {
    return [{ label: 'PS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  
  const row = filteredPresupuestosData.value[0]
  const totalColumn = presupuestoTotalColumn.value
  const total = getCleanValue(row, totalColumn)
  
  console.log('📊 [Regional] donutPS - Total column:', totalColumn, 'Total:', total)
  
  // ✅ USAR donutSectorsPSRegional del mapping
  const sectorsConfig = presupuestosMapping?.donutSectorsPSRegional || []
  console.log('📊 [Regional] Sectores PS config:', sectorsConfig.map(s => s.column))
  
  const data = calculateDonutData(row, sectorsConfig, total)
  
  return [
    { label: 'PS', value: data.mainPercentage, color: '#7cb342' }, 
    { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length) return []
  const row = filteredPresupuestosData.value[0]
  const total = getCleanValue(row, presupuestoTotalColumn.value)
  const sectorsConfig = presupuestosMapping?.donutSectorsPSRegional || []
  return calculateDonutData(row, sectorsConfig, total).sectors
})

const subtitlePresupuestosSostenibles = computed(() => `${donutPresupuestosSostenibles.value[0].value}%`)

// ✅ PRESUPUESTOS INTENSIVOS EN CARBONO
const donutPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length) {
    return [{ label: 'PIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  
  const row = filteredPresupuestosData.value[0]
  const total = getCleanValue(row, presupuestoTotalColumn.value)
  
  console.log('📊 [Regional] donutPIC - Total:', total)
  
  // ✅ USAR donutSectorsPICRegional del mapping
  const sectorsConfig = presupuestosMapping?.donutSectorsPICRegional || []
  console.log('📊 [Regional] Sectores PIC config:', sectorsConfig.map(s => s.column))
  
  const data = calculateDonutData(row, sectorsConfig, total)
  
  return [
    { label: 'PIC', value: data.mainPercentage, color: '#DC143C' }, 
    { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length) return []
  const row = filteredPresupuestosData.value[0]
  const total = getCleanValue(row, presupuestoTotalColumn.value)
  const sectorsConfig = presupuestosMapping?.donutSectorsPICRegional || []
  return calculateDonutData(row, sectorsConfig, total).sectors
})

const subtitlePresupuestosCarbono = computed(() => `${donutPresupuestosCarbono.value[0].value}%`)

// ✅ INGRESOS - columna IT del mapping
const ingresoTotalColumn = computed(() => {
  const itConfig = ingresosMapping?.variableColumns?.find(v => 
    v.key === 'ingresos_total_reg' || v.column === 'IT' || v.column === 'IT ($)'
  )
  return itConfig?.column || 'IT ($)'
})

const donutIngresosSostenibles = computed(() => {
  if (!filteredIngresosData.value.length) {
    return [{ label: 'IS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, ingresoTotalColumn.value)
  
  // ✅ USAR donutSectorsISRegional del mapping
  const sectorsConfig = ingresosMapping?.donutSectorsISRegional || []
  const data = calculateDonutData(row, sectorsConfig, total)
  
  return [
    { label: 'IS', value: data.mainPercentage, color: '#7cb342' }, 
    { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresIngresosSostenibles = computed(() => {
  if (!filteredIngresosData.value.length) return []
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, ingresoTotalColumn.value)
  const sectorsConfig = ingresosMapping?.donutSectorsISRegional || []
  return calculateDonutData(row, sectorsConfig, total).sectors
})

const subtitleIngresosSostenibles = computed(() => `${donutIngresosSostenibles.value[0].value}%`)

const donutIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length) {
    return [{ label: 'IIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, ingresoTotalColumn.value)
  
  // ✅ USAR donutSectorsIICRegional del mapping
  const sectorsConfig = ingresosMapping?.donutSectorsIICRegional || []
  const data = calculateDonutData(row, sectorsConfig, total)
  
  return [
    { label: 'IIC', value: data.mainPercentage, color: '#DC143C' }, 
    { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length) return []
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, ingresoTotalColumn.value)
  const sectorsConfig = ingresosMapping?.donutSectorsIICRegional || []
  return calculateDonutData(row, sectorsConfig, total).sectors
})

const subtitleIngresosCarbono = computed(() => `${donutIngresosCarbono.value[0].value}%`)

// ✅ Títulos dinámicos
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

// ✅ Variables para leyenda de donas - dinámicas desde el mapping
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
}

.chart-card-header {
  display: flex;
  width: 100%;
  padding: 10px;
  border-bottom: 1px solid #163C5F;
  margin-bottom: 10px;
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
  height: 100%;
  flex: 1;
}

.chart-col-bar {
  flex: 1;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 5px;
  border-radius: 12px;
  background: white;
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
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

@media (max-width: 1200px) {
  .chart-card-body { flex-direction: column; }
  .chart-col-donuts { flex-direction: row; flex: 1; }
}

@media (max-width: 768px) {
  .chart-col-donuts { flex-direction: column; }
  .donut-item { min-height: 300px; }
}
</style>