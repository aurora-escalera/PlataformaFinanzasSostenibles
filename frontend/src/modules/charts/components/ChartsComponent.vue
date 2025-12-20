<!-- src/modules/charts/components/ChartsComponent.vue -->
<!-- ✅ Para datos ESTATALES - usa columnas PT ($) e IT ($) -->
<!-- ✅ CORREGIDO: Porcentaje en KPI cards = mismo valor que dentro de las barras -->
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
        
        <div v-else class="chart-col-bar">
          <BarChart 
            :data="ingresosData"
            :title="ingresosTitleDynamic"
            headerTitle="Análisis de Ingresos"
            :selectedState="selectedState"
            :selectedYear="selectedYear"
          />
        </div>
        
        <div v-if="!loading && !error" class="chart-col-donuts" :class="{ 'single-donut': showingSingleDonutIngresos }">
          <div v-if="!selectedVariable || selectedVariable.key === 'IS'" class="donut-item">
            <div class="donut-header-dark">
              <div class="donut-header-icon green">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="donut-header-title">Componentes de Ingresos Sostenibles</span>
            </div>
            <DonutChart 
              v-if="sectoresIngresosSostenibles.length > 0"
              :key="`is-${props.selectedState}-${sectoresIngresosSostenibles.length}`"
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
              <span class="donut-header-title">Componentes de Ingresos Intensivos en Carbono</span>
            </div>
            <DonutChart 
              v-if="sectoresIngresosCarbono.length > 0"
              :key="`iic-${props.selectedState}-${sectoresIngresosCarbono.length}`"
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
        
        <div v-else class="chart-col-bar">
          <BarChart 
            :data="presupuestosData"
            :title="presupuestosTitleDynamic"
            headerTitle="Análisis de Presupuestos"
            :selectedState="selectedState"
            :selectedYear="selectedYear"
          />
        </div>
        
        <div v-if="!loading && !error" class="chart-col-donuts" :class="{ 'single-donut': showingSingleDonutPresupuestos }">
          <div v-if="!selectedVariable || selectedVariable.key === 'PS'" class="donut-item">
            <div class="donut-header-dark">
              <div class="donut-header-icon green">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="donut-header-title">Componentes de Presupuestos Sostenibles</span>
            </div>
            <DonutChart 
              v-if="sectoresPresupuestosSostenibles.length > 0"
              :key="`ps-${props.selectedState}-${sectoresPresupuestosSostenibles.length}`"
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
              <span class="donut-header-title">Componentes de Presupuestos Intensivos en Carbono</span>
            </div>
            <DonutChart 
              v-if="sectoresPresupuestosCarbono.length > 0"
              :key="`pic-${props.selectedState}-${sectoresPresupuestosCarbono.length}`"
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
import BarChart from './BarChart.vue'
import DonutChart from './DonutChart.vue'

const props = defineProps({
  selectedState: { type: String, default: null },
  selectedYear: { type: String, default: null },
  selectedVariable: { type: Object, default: null },
  ifssData: { type: Object, default: () => ({}) }
})

const showingSingleCard = computed(() => !!props.selectedVariable)
const showingSingleDonutPresupuestos = computed(() => props.selectedVariable && (props.selectedVariable.key === 'PS' || props.selectedVariable.key === 'PIC'))
const showingSingleDonutIngresos = computed(() => props.selectedVariable && (props.selectedVariable.key === 'IS' || props.selectedVariable.key === 'IIC'))

const { fetchData, loading, error } = useStorageData()
const dataLoaded = ref(false)
const rawPresupuestosData = ref([])
const rawIngresosData = ref([])
const presupuestosMapping = getMapping('chartsPresupuestos')
const ingresosMapping = getMapping('chartsIngresos')

// ============================================================================
// MAPEO DE COLUMNAS PARA POSICIÓN (sin porcentaje de columna)
// ============================================================================

// Mapeo de columnas de posición por tipo de variable
const positionColumnMap = {
  'presupuesto_total': null,
  'presupuesto_sostenible': 'POS_PS',
  'presupuesto_carbono': 'POS_PIC',
  'ingresos_total': null,
  'ingresos_sostenibles': 'POS_IS',
  'ingresos_carbono': 'POS_IIC'
}

// ============================================================================

const loadChartData = async () => {
  try {
    const presupuestosSheetName = getSheetName('chartsPresupuestos')
    const ingresosSheetName = getSheetName('chartsIngresos')
    
    rawPresupuestosData.value = await fetchData('chartsPresupuestos', presupuestosSheetName)
    rawIngresosData.value = await fetchData('chartsIngresos', ingresosSheetName)
    dataLoaded.value = true
  } catch (err) {
    console.error('Error cargando datos:', err)
  }
}

onMounted(() => loadChartData())

watch(() => props.selectedYear, async (newYear, oldYear) => {
  if (newYear !== oldYear) {
    dataLoaded.value = false
    await loadChartData()
  }
})

const filteredPresupuestosData = computed(() => {
  if (!dataLoaded.value || !props.selectedState || !rawPresupuestosData.value.length) return []
  return rawPresupuestosData.value.filter(row => row[presupuestosMapping.stateColumn] === props.selectedState)
})

const filteredIngresosData = computed(() => {
  if (!dataLoaded.value || !props.selectedState || !rawIngresosData.value.length) return []
  return rawIngresosData.value.filter(row => row[ingresosMapping.stateColumn] === props.selectedState)
})

// ✅ Función para limpiar valores numéricos
const getCleanValue = (row, column) => {
  if (!row || !column) return 0
  const raw = row[column]
  if (raw === null || raw === undefined) return 0
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') {
    let cleanValue = raw.replace(/^["']+|["']+$/g, '').trim()
    if (cleanValue === '' || cleanValue === '""') return 0
    cleanValue = cleanValue.replace(/\./g, '')
    cleanValue = cleanValue.replace(',', '.')
    return parseFloat(cleanValue) || 0
  }
  return parseFloat(raw) || 0
}

// ✅ CORREGIDO: Función para calcular porcentaje respecto al total (igual que BarChart)
const calculatePercentageOfTotal = (value, totalValue) => {
  if (!totalValue || totalValue === 0) return null
  return ((value / totalValue) * 100).toFixed(2)
}

// ✅ CORREGIDO: Función para transformar datos con porcentaje CALCULADO (no de columna)
const transformSingleRowToBarChart = (row, mapping) => {
  if (!row) return { variables: [] }
  
  // Primero, obtener el valor total (primera variable)
  const totalColumn = mapping.variableColumns[0]?.column
  const totalValue = totalColumn ? getCleanValue(row, totalColumn) : 0
  
  const variables = mapping.variableColumns.map((varConfig, index) => {
    const value = getCleanValue(row, varConfig.column)
    
    // Obtener posición de la columna correspondiente
    const positionColumn = positionColumnMap[varConfig.key]
    const position = positionColumn ? getCleanValue(row, positionColumn) : null
    
    // ✅ CORREGIDO: Calcular porcentaje igual que BarChart (value / total * 100)
    // Para el total (index 0), el porcentaje es null (no se muestra)
    let percentage = null
    if (index > 0 && totalValue > 0) {
      percentage = calculatePercentageOfTotal(value, totalValue)
    }
    
    return {
      key: varConfig.key, 
      label: varConfig.label, 
      value,
      color: varConfig.color, 
      colorClass: varConfig.colorClass, 
      order: varConfig.order || 0,
      position: position || null,
      percentage: percentage
    }
  })
  
  variables.sort((a, b) => a.order - b.order)
  return { variables }
}

const presupuestosData = computed(() => {
  if (!filteredPresupuestosData.value.length) return { variables: [] }
  const result = transformSingleRowToBarChart(filteredPresupuestosData.value[0], presupuestosMapping)
  if (props.selectedVariable && result.variables.length >= 3) {
    if (props.selectedVariable.key === 'PS') result.variables = [result.variables[0], result.variables[1]].filter(v => v)
    else if (props.selectedVariable.key === 'PIC') result.variables = [result.variables[0], result.variables[2]].filter(v => v)
  }
  return result
})

const ingresosData = computed(() => {
  if (!filteredIngresosData.value.length) return { variables: [] }
  const result = transformSingleRowToBarChart(filteredIngresosData.value[0], ingresosMapping)
  if (props.selectedVariable && result.variables.length >= 3) {
    if (props.selectedVariable.key === 'IS') result.variables = [result.variables[0], result.variables[1]].filter(v => v)
    else if (props.selectedVariable.key === 'IIC') result.variables = [result.variables[0], result.variables[2]].filter(v => v)
  }
  return result
})

const calculateDonutData = (row, sectorsConfig, totalValue) => {
  if (!row || !sectorsConfig || !totalValue) return { mainPercentage: 0, sectors: [] }
  let sectorsTotal = 0
  const sectors = sectorsConfig.map(sectorConfig => {
    const value = getCleanValue(row, sectorConfig.column)
    sectorsTotal += value
    return { key: sectorConfig.key, label: sectorConfig.label, value, color: sectorConfig.color, colorClass: sectorConfig.colorClass }
  })
  return { mainPercentage: totalValue > 0 ? Math.round((sectorsTotal / totalValue) * 100) : 0, sectors }
}

// ✅ ESTATALES: Columna PT ($) para presupuestos
const donutPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length) return [{ label: 'PS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  const row = filteredPresupuestosData.value[0]
  const total = getCleanValue(row, 'PT ($)')
  const data = calculateDonutData(row, presupuestosMapping.donutSectorsPS || [], total)
  return [{ label: 'PS', value: data.mainPercentage, color: '#7cb342' }, { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }]
})

const sectoresPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length) return []
  const row = filteredPresupuestosData.value[0]
  return calculateDonutData(row, presupuestosMapping.donutSectorsPS || [], getCleanValue(row, 'PT ($)')).sectors
})

const subtitlePresupuestosSostenibles = computed(() => `${donutPresupuestosSostenibles.value[0].value}%`)

const donutPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length) return [{ label: 'PIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  const row = filteredPresupuestosData.value[0]
  const total = getCleanValue(row, 'PT ($)')
  const data = calculateDonutData(row, presupuestosMapping.donutSectorsPIC || [], total)
  return [{ label: 'PIC', value: data.mainPercentage, color: '#DC143C' }, { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }]
})

const sectoresPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length) return []
  const row = filteredPresupuestosData.value[0]
  return calculateDonutData(row, presupuestosMapping.donutSectorsPIC || [], getCleanValue(row, 'PT ($)')).sectors
})

const subtitlePresupuestosCarbono = computed(() => `${donutPresupuestosCarbono.value[0].value}%`)

// ✅ ESTATALES: Columna IT ($) para ingresos
const donutIngresosSostenibles = computed(() => {
  if (!filteredIngresosData.value.length) return [{ label: 'IS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, 'IT ($)')
  const data = calculateDonutData(row, ingresosMapping.donutSectorsIS || [], total)
  return [{ label: 'IS', value: data.mainPercentage, color: '#7cb342' }, { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }]
})

const sectoresIngresosSostenibles = computed(() => {
  if (!filteredIngresosData.value.length) return []
  const row = filteredIngresosData.value[0]
  return calculateDonutData(row, ingresosMapping.donutSectorsIS || [], getCleanValue(row, 'IT ($)')).sectors
})

const subtitleIngresosSostenibles = computed(() => `${donutIngresosSostenibles.value[0].value}%`)

const donutIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length) return [{ label: 'IIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, 'IT ($)')
  const data = calculateDonutData(row, ingresosMapping.donutSectorsIIC || [], total)
  return [{ label: 'IIC', value: data.mainPercentage, color: '#DC143C' }, { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }]
})

const sectoresIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length) return []
  const row = filteredIngresosData.value[0]
  return calculateDonutData(row, ingresosMapping.donutSectorsIIC || [], getCleanValue(row, 'IT ($)')).sectors
})

const subtitleIngresosCarbono = computed(() => `${donutIngresosCarbono.value[0].value}%`)

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
  if (!props.selectedState) return 'Selecciona un estado'
  return `Presupuestos - ${props.selectedState}${props.selectedYear ? ` - ${props.selectedYear}` : ''}`
})

const cardTitleIngresos = computed(() => {
  if (!props.selectedState) return 'Selecciona un estado'
  return `Ingresos - ${props.selectedState}${props.selectedYear ? ` - ${props.selectedYear}` : ''}`
})

// Variables para leyenda de donas
const variablesPresupuestosSostenibles = computed(() => {
  const sectors = presupuestosMapping?.donutSectorsPS || []
  return sectors.map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true }))
})

const variablesPresupuestosCarbono = computed(() => {
  const sectors = presupuestosMapping?.donutSectorsPIC || []
  return sectors.map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true }))
})

const variablesIngresosSostenibles = computed(() => {
  const sectors = ingresosMapping?.donutSectorsIS || []
  return sectors.map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true }))
})

const variablesIngresosCarbono = computed(() => {
  const sectors = ingresosMapping?.donutSectorsIIC || []
  return sectors.map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true }))
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
.charts-wrapper.single-card .chart-card { height: 55%; max-height: 100%; }

.chart-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
  margin-bottom: 10px;
  border-bottom: 1px solid #163C5F;
}

.card-title {
  padding: 4px 0 2px 0;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100;
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
  padding: 15px;
  border-radius: 12px;
  background: white;
}

.chart-col-donuts {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding: 15px;
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

/* ============================================
   RESPONSIVE - Media Queries
   ============================================ */

@media (max-width: 1200px) {
  .chart-card-body { flex-direction: column; }
  .chart-col-donuts { flex-direction: row; flex: 1; }
}

/* Tablets */
@media (max-width: 768px) {
  .charts-wrapper {
    gap: 16px;
    margin-top: 8px;
  }
  
  .chart-card {
    padding: 10px;
    border-radius: 10px;
  }
  
  .chart-card-header {
    padding: 8px;
    margin-bottom: 8px;
  }
  
  .card-title {
    font-size: 14px;
    padding: 2px 0;
  }
  
  .chart-card-body {
    flex-direction: column;
    gap: 12px;
  }
  
  .chart-col-bar {
    padding: 10px;
    min-height: 300px;
  }
  
  .chart-col-donuts {
    flex-direction: column;
    gap: 12px;
    padding: 10px;
  }
  
  .donut-item {
    min-height: 280px;
    border-radius: 10px;
  }
  
  .donut-header-dark {
    padding: 8px 10px;
    gap: 6px;
  }
  
  .donut-header-icon {
    width: 18px;
    height: 18px;
    min-width: 18px;
  }
  
  .donut-header-icon svg {
    width: 10px;
    height: 10px;
  }
  
  .donut-header-title {
    font-size: 11px;
  }
  
  .loading-container,
  .error-container {
    min-height: 150px;
  }
  
  .spinner {
    width: 30px;
    height: 30px;
    border-width: 3px;
  }
  
  .no-data-message {
    min-height: 150px;
    font-size: 12px;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .charts-wrapper {
    gap: 12px;
    margin-top: 6px;
  }
  
  .chart-card {
    padding: 8px;
    border-radius: 8px;
  }
  
  .chart-card-header {
    padding: 6px;
    margin-bottom: 6px;
  }
  
  .card-title {
    font-size: 12px;
  }
  
  .chart-card-body {
    gap: 10px;
  }
  
  .chart-col-bar {
    padding: 8px;
    min-height: 260px;
  }
  
  .chart-col-donuts {
    gap: 10px;
    padding: 8px;
  }
  
  .donut-item {
    min-height: 250px;
    border-radius: 8px;
    padding: 0 0 10px 0;
  }
  
  .donut-header-dark {
    padding: 6px 8px;
    gap: 5px;
    border-radius: 8px 8px 0 0;
  }
  
  .donut-header-icon {
    width: 16px;
    height: 16px;
    min-width: 16px;
    border-radius: 3px;
  }
  
  .donut-header-icon svg {
    width: 9px;
    height: 9px;
  }
  
  .donut-header-title {
    font-size: 10px;
    letter-spacing: 0.1px;
  }
  
  .loading-container,
  .error-container {
    min-height: 120px;
    font-size: 12px;
  }
  
  .spinner {
    width: 24px;
    height: 24px;
    border-width: 2px;
    margin-bottom: 8px;
  }
  
  .no-data-message {
    min-height: 120px;
    font-size: 11px;
  }
}

/* Landscape en móviles */
@media (max-width: 768px) and (orientation: landscape) {
  .charts-wrapper {
    gap: 10px;
  }
  
  .chart-card {
    padding: 8px;
  }
  
  .chart-card-header {
    padding: 6px;
    margin-bottom: 6px;
  }
  
  .card-title {
    font-size: 12px;
  }
  
  .chart-card-body {
    flex-direction: row;
    gap: 10px;
  }
  
  .chart-col-bar {
    flex: 1;
    min-height: 200px;
    padding: 8px;
  }
  
  .chart-col-donuts {
    flex: 1;
    flex-direction: row;
    gap: 8px;
    padding: 8px;
  }
  
  .donut-item {
    min-height: 180px;
  }
  
  .donut-header-title {
    font-size: 9px;
  }
}
</style>