<!-- src/modules/charts/components/RegionalChartsComponent.vue -->
<!-- ✅ ACTUALIZADO: Filtrado por año para datos regionales -->
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
            headerTitle="Análisis de Ingresos"
            :selectedState="selectedState"
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
              :key="`is-${props.selectedYear}-${sectoresIngresosSostenibles.length}`"
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
              :key="`iic-${props.selectedYear}-${sectoresIngresosCarbono.length}`"
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
            headerTitle="Análisis de Presupuestos"
            :selectedState="selectedState"
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
              :key="`ps-${props.selectedYear}-${sectoresPresupuestosSostenibles.length}`"
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
              :key="`pic-${props.selectedYear}-${sectoresPresupuestosCarbono.length}`"
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
const presupuestosMapping = getMapping('chartsPresupuestosRegional')
const ingresosMapping = getMapping('chartsIngresosRegional')

const loadChartData = async () => {
  try {
    const presupuestosSheetName = getSheetName('chartsPresupuestosRegional')
    const ingresosSheetName = getSheetName('chartsIngresosRegional')
    
    rawPresupuestosData.value = await fetchData('chartsPresupuestosRegional', presupuestosSheetName)
    rawIngresosData.value = await fetchData('chartsIngresosRegional', ingresosSheetName)
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

// ✅ CORREGIDO: Filtrar por año, no por estado
const filteredPresupuestosData = computed(() => {
  if (!dataLoaded.value || !props.selectedYear || !rawPresupuestosData.value.length) return []
  return rawPresupuestosData.value.filter(row => 
    String(row[presupuestosMapping.stateColumn]) === String(props.selectedYear)
  )
})

// ✅ CORREGIDO: Filtrar por año, no por estado
const filteredIngresosData = computed(() => {
  if (!dataLoaded.value || !props.selectedYear || !rawIngresosData.value.length) return []
  return rawIngresosData.value.filter(row => 
    String(row[ingresosMapping.stateColumn]) === String(props.selectedYear)
  )
})

const transformSingleRowToBarChart = (row, mapping) => {
  if (!row) return { variables: [] }
  const variables = mapping.variableColumns.map(varConfig => {
    let cleanValue = row[varConfig.column]
    if (typeof cleanValue === 'string') {
      cleanValue = cleanValue.replace(/^["']+|["']+$/g, '').trim()
      if (cleanValue === '' || cleanValue === '""') cleanValue = '0'
      else cleanValue = cleanValue.replace(/\./g, '')
    }
    return {
      key: varConfig.key, 
      label: varConfig.label, 
      value: parseFloat(cleanValue) || 0,
      color: varConfig.color, 
      colorClass: varConfig.colorClass, 
      order: varConfig.order || 0
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
    let cleanValue = row[sectorConfig.column]
    if (cleanValue === null || cleanValue === undefined) cleanValue = '0'
    else if (typeof cleanValue === 'string') {
      cleanValue = cleanValue.replace(/^["']+|["']+$/g, '').trim()
      if (cleanValue === '') cleanValue = '0'
      else cleanValue = cleanValue.replace(/\./g, '')
    }
    const value = parseFloat(cleanValue) || 0
    sectorsTotal += value
    return { key: sectorConfig.key, label: sectorConfig.label, value, color: sectorConfig.color, colorClass: sectorConfig.colorClass }
  })
  return { mainPercentage: totalValue > 0 ? Math.round((sectorsTotal / totalValue) * 100) : 0, sectors }
}

const getCleanTotal = (row, column) => {
  const raw = row[column] || '0'
  if (typeof raw === 'string') return parseFloat(raw.replace(/^["']+|["']+$/g, '').trim().replace(/\./g, '')) || 0
  return parseFloat(raw) || 0
}

const donutPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length) return [{ label: 'PS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  const row = filteredPresupuestosData.value[0]
  const total = getCleanTotal(row, 'PT ($)')
  const data = calculateDonutData(row, presupuestosMapping.donutSectorsPSRegional || [], total)
  return [{ label: 'PS', value: data.mainPercentage, color: '#7cb342' }, { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }]
})

const sectoresPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length) return []
  const row = filteredPresupuestosData.value[0]
  return calculateDonutData(row, presupuestosMapping.donutSectorsPSRegional || [], getCleanTotal(row, 'PT ($)')).sectors
})

const subtitlePresupuestosSostenibles = computed(() => `${donutPresupuestosSostenibles.value[0].value}%`)

const donutPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length) return [{ label: 'PIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  const row = filteredPresupuestosData.value[0]
  const total = getCleanTotal(row, 'PT ($)')
  const data = calculateDonutData(row, presupuestosMapping.donutSectorsPICRegional || [], total)
  return [{ label: 'PIC', value: data.mainPercentage, color: '#DC143C' }, { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }]
})

const sectoresPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length) return []
  const row = filteredPresupuestosData.value[0]
  return calculateDonutData(row, presupuestosMapping.donutSectorsPICRegional || [], getCleanTotal(row, 'PT ($)')).sectors
})

const subtitlePresupuestosCarbono = computed(() => `${donutPresupuestosCarbono.value[0].value}%`)

const donutIngresosSostenibles = computed(() => {
  if (!filteredIngresosData.value.length) return [{ label: 'IS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  const row = filteredIngresosData.value[0]
  const total = getCleanTotal(row, 'IT ($)')
  const data = calculateDonutData(row, ingresosMapping.donutSectorsISRegional || [], total)
  return [{ label: 'IS', value: data.mainPercentage, color: '#7cb342' }, { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }]
})

const sectoresIngresosSostenibles = computed(() => {
  if (!filteredIngresosData.value.length) return []
  const row = filteredIngresosData.value[0]
  return calculateDonutData(row, ingresosMapping.donutSectorsISRegional || [], getCleanTotal(row, 'IT ($)')).sectors
})

const subtitleIngresosSostenibles = computed(() => `${donutIngresosSostenibles.value[0].value}%`)

const donutIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length) return [{ label: 'IIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  const row = filteredIngresosData.value[0]
  const total = getCleanTotal(row, 'IT ($)')
  const data = calculateDonutData(row, ingresosMapping.donutSectorsIICRegional || [], total)
  return [{ label: 'IIC', value: data.mainPercentage, color: '#DC143C' }, { label: 'Resto', value: 100 - data.mainPercentage, color: '#E8E8E8' }]
})

const sectoresIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length) return []
  const row = filteredIngresosData.value[0]
  return calculateDonutData(row, ingresosMapping.donutSectorsIICRegional || [], getCleanTotal(row, 'IT ($)')).sectors
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

// ✅ CORREGIDO: Títulos para datos regionales (por año)
const cardTitlePresupuestos = computed(() => {
  if (!props.selectedYear) return 'Selecciona un año'
  return `Presupuestos Regionales - ${props.selectedYear}`
})

const cardTitleIngresos = computed(() => {
  if (!props.selectedYear) return 'Selecciona un año'
  return `Ingresos Regionales - ${props.selectedYear}`
})

const variablesPresupuestosSostenibles = [
  { key: 'ps_cambio_climatico_reg', label: 'Cambio climático', colorClass: 'dark-green', active: true },
  { key: 'ps_energia_renovable_reg', label: 'Energía Renovable', colorClass: 'dark-green', active: true },
  { key: 'ps_eficiencia_energetica_reg', label: 'Eficiencia Energética', colorClass: 'dark-green', active: true },
  { key: 'ps_desastres_reg', label: 'Desastres Naturales', colorClass: 'dark-green', active: true },
]

const variablesPresupuestosCarbono = [
  { key: 'pic_combustible_reg', label: 'Combustible', colorClass: 'dark-red', active: true },
  { key: 'pic_mineria_reg', label: 'Minería', colorClass: 'red', active: true },
  { key: 'pic_transporte_reg', label: 'Transporte', colorClass: 'light-red', active: true }
]

const variablesIngresosSostenibles = [
  { key: 'is_ambiental_reg', label: 'Ambiental', colorClass: 'dark-green', active: true },
  { key: 'is_ecologico_reg', label: 'Ecológico', colorClass: 'green', active: true },
  { key: 'is_movilidad_reg', label: 'Movilidad Sustentable', colorClass: 'light-green', active: true }
]

const variablesIngresosCarbono = [
  { key: 'iic_hidrocarburos_reg', label: 'Hidrocarburos', colorClass: 'dark-red', active: true },
  { key: 'iic_mineria_reg', label: 'Minería', colorClass: 'red', active: true },
  { key: 'iic_transporte_reg', label: 'Transporte', colorClass: 'light-red', active: true }
]
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
  height: 100%;
  background: #163C5F;
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
  border-bottom: 3px solid rgba(255, 255, 255, 0.15);
}

.card-title {
  padding: 4px 0 2px 0;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100;
  color: white;
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
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
}

.chart-col-donuts {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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