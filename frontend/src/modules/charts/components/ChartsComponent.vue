<!-- src/modules/charts/components/ChartsComponent.vue -->
<!-- ✅ REDISEÑADO: Layout 4 filas × 2 columnas -->
<!-- Fila 1: IS (BarChart + Donut) -->
<!-- Fila 2: IIC (BarChart + Donut) -->
<!-- Fila 3: PS (BarChart + Donut) -->
<!-- Fila 4: PIC (BarChart + Donut) -->
<template>
  <div class="charts-wrapper">
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>Error: {{ error }}</p>
    </div>
    
    <!-- Charts Grid -->
    <div v-else class="charts-grid">
      
      <!-- ============================================ -->
      <!-- FILA 1: INGRESOS SOSTENIBLES (IS) -->
      <!-- ============================================ -->
      <div 
        v-if="!selectedVariable || selectedVariable.key === 'IS'" 
        class="chart-row"
      >
        <!-- Columna 1: BarChart IS -->
        <div class="chart-card chart-card-no-header">
          <div class="chart-card-body">
            <BarChart 
              :data="ingresosISData"
              :title="'Ingreso Total vs Ingresos Sostenibles'"
              :headerTitle="'Ingresos Sostenibles - ' + (selectedState || 'Sin selección') + ' • ' + (selectedYear || 'Todos')"
              :selectedState="selectedState"
              :selectedYear="selectedYear"
            />
          </div>
        </div>
        
        <!-- Columna 2: DonutChart IS -->
        <div class="chart-card chart-card-no-header">
          <div class="donut-header-blue">
            <div class="donut-header-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="donut-header-text">
              <h4 class="donut-header-title">Componentes de Ingresos Sostenibles</h4>
              <span class="donut-header-subtitle">{{ selectedState || 'Sin selección' }} • {{ selectedYear || 'Todos' }}</span>
            </div>
          </div>
          <div class="chart-card-body donut-body">
            <DonutChart 
              v-if="sectoresIngresosSostenibles.length > 0"
              :key="`is-${selectedState}-${sectoresIngresosSostenibles.length}`"
              :data="donutIngresosSostenibles"
              title="IS"
              :subtitle="subtitleIngresosSostenibles"
              :size="200"
              :variables="variablesIngresosSostenibles"
              :sectors="sectoresIngresosSostenibles"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
        </div>
      </div>
      
      <!-- ============================================ -->
      <!-- FILA 2: INGRESOS INTENSIVOS EN CARBONO (IIC) -->
      <!-- ============================================ -->
      <div 
        v-if="!selectedVariable || selectedVariable.key === 'IIC'" 
        class="chart-row"
      >
        <!-- Columna 1: BarChart IIC -->
        <div class="chart-card chart-card-no-header">
          <div class="chart-card-body">
            <BarChart 
              :data="ingresosIICData"
              :title="'Ingreso Total vs Ingresos Intensivos en Carbono'"
              :headerTitle="'Ingresos Intensivos en Carbono - ' + (selectedState || 'Sin selección') + ' • ' + (selectedYear || 'Todos')"
              :selectedState="selectedState"
              :selectedYear="selectedYear"
            />
          </div>
        </div>
        
        <!-- Columna 2: DonutChart IIC -->
        <div class="chart-card chart-card-no-header">
          <div class="donut-header-blue">
            <div class="donut-header-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="donut-header-text">
              <h4 class="donut-header-title">Componentes de Ingresos Intensivos en Carbono</h4>
              <span class="donut-header-subtitle">{{ selectedState || 'Sin selección' }} • {{ selectedYear || 'Todos' }}</span>
            </div>
          </div>
          <div class="chart-card-body donut-body">
            <DonutChart 
              v-if="sectoresIngresosCarbono.length > 0"
              :key="`iic-${selectedState}-${sectoresIngresosCarbono.length}`"
              :data="donutIngresosCarbono"
              title="IIC"
              :subtitle="subtitleIngresosCarbono"
              :size="200"
              :variables="variablesIngresosCarbono"
              :sectors="sectoresIngresosCarbono"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
        </div>
      </div>
      
      <!-- ============================================ -->
      <!-- FILA 3: PRESUPUESTOS SOSTENIBLES (PS) -->
      <!-- ============================================ -->
      <div 
        v-if="!selectedVariable || selectedVariable.key === 'PS'" 
        class="chart-row"
      >
        <!-- Columna 1: BarChart PS -->
        <div class="chart-card chart-card-no-header">
          <div class="chart-card-body">
            <BarChart 
              :data="presupuestosPSData"
              :title="'Gasto Total vs Presupuestos Sostenibles'"
              :headerTitle="'Presupuestos Sostenibles - ' + (selectedState || 'Sin selección') + ' • ' + (selectedYear || 'Todos')"
              :selectedState="selectedState"
              :selectedYear="selectedYear"
            />
          </div>
        </div>
        
        <!-- Columna 2: DonutChart PS -->
        <div class="chart-card chart-card-no-header">
          <div class="donut-header-blue">
            <div class="donut-header-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="donut-header-text">
              <h4 class="donut-header-title">Componentes de Presupuestos Sostenibles</h4>
              <span class="donut-header-subtitle">{{ selectedState || 'Sin selección' }} • {{ selectedYear || 'Todos' }}</span>
            </div>
          </div>
          <div class="chart-card-body donut-body">
            <DonutChart 
              v-if="sectoresPresupuestosSostenibles.length > 0"
              :key="`ps-${selectedState}-${sectoresPresupuestosSostenibles.length}`"
              :data="donutPresupuestosSostenibles"
              title="PS"
              :subtitle="subtitlePresupuestosSostenibles"
              :size="200"
              :variables="variablesPresupuestosSostenibles"
              :sectors="sectoresPresupuestosSostenibles"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
        </div>
      </div>
      
      <!-- ============================================ -->
      <!-- FILA 4: PRESUPUESTOS INTENSIVOS EN CARBONO (PIC) -->
      <!-- ============================================ -->
      <div 
        v-if="!selectedVariable || selectedVariable.key === 'PIC'" 
        class="chart-row"
      >
        <!-- Columna 1: BarChart PIC -->
        <div class="chart-card chart-card-no-header">
          <div class="chart-card-body">
            <BarChart 
              :data="presupuestosPICData"
              :title="'Gasto Total vs Presupuestos Intensivos en Carbono'"
              :headerTitle="'Presupuestos Intensivos en Carbono - ' + (selectedState || 'Sin selección') + ' • ' + (selectedYear || 'Todos')"
              :selectedState="selectedState"
              :selectedYear="selectedYear"
            />
          </div>
        </div>
        
        <!-- Columna 2: DonutChart PIC -->
        <div class="chart-card chart-card-no-header">
          <div class="donut-header-blue">
            <div class="donut-header-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="donut-header-text">
              <h4 class="donut-header-title">Componentes de Presupuestos Intensivos en Carbono</h4>
              <span class="donut-header-subtitle">{{ selectedState || 'Sin selección' }} • {{ selectedYear || 'Todos' }}</span>
            </div>
          </div>
          <div class="chart-card-body donut-body">
            <DonutChart 
              v-if="sectoresPresupuestosCarbono.length > 0"
              :key="`pic-${selectedState}-${sectoresPresupuestosCarbono.length}`"
              :data="donutPresupuestosCarbono"
              title="PIC"
              :subtitle="subtitlePresupuestosCarbono"
              :size="200"
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

const { fetchData, loading, error } = useStorageData()
const dataLoaded = ref(false)
const rawPresupuestosData = ref([])
const rawIngresosData = ref([])
const presupuestosMapping = getMapping('chartsPresupuestos')
const ingresosMapping = getMapping('chartsIngresos')

// ============================================================================
// CARGA DE DATOS
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

// ============================================================================
// FILTRADO DE DATOS
// ============================================================================

const filteredPresupuestosData = computed(() => {
  if (!dataLoaded.value || !props.selectedState || !rawPresupuestosData.value.length) return []
  return rawPresupuestosData.value.filter(row => row[presupuestosMapping.stateColumn] === props.selectedState)
})

const filteredIngresosData = computed(() => {
  if (!dataLoaded.value || !props.selectedState || !rawIngresosData.value.length) return []
  return rawIngresosData.value.filter(row => row[ingresosMapping.stateColumn] === props.selectedState)
})

// ============================================================================
// UTILIDADES
// ============================================================================

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

const calculatePercentageOfTotal = (value, totalValue) => {
  if (!totalValue || totalValue === 0) return null
  return ((value / totalValue) * 100).toFixed(2)
}

// ============================================================================
// DATOS PARA BARCHARTS - INGRESOS
// ============================================================================

// IS: Ingreso Total vs Ingresos Sostenibles
const ingresosISData = computed(() => {
  if (!filteredIngresosData.value.length) return { variables: [] }
  const row = filteredIngresosData.value[0]
  
  const itValue = getCleanValue(row, 'IT ($)')
  const isValue = getCleanValue(row, 'IS ($)')
  const isPercentage = calculatePercentageOfTotal(isValue, itValue)
  const isPosition = getCleanValue(row, 'POS_IS')
  
  return {
    variables: [
      {
        key: 'ingresos_total',
        label: 'Ingreso Total',
        value: itValue,
        color: '#9ca3af',
        colorClass: 'gray',
        order: 1,
        position: null,
        percentage: null
      },
      {
        key: 'ingresos_sostenibles',
        label: 'Ingresos Sostenibles',
        value: isValue,
        color: '#7cb342',
        colorClass: 'green',
        order: 2,
        position: isPosition || null,
        percentage: isPercentage
      }
    ]
  }
})

// IIC: Ingreso Total vs Ingresos Intensivos en Carbono
const ingresosIICData = computed(() => {
  if (!filteredIngresosData.value.length) return { variables: [] }
  const row = filteredIngresosData.value[0]
  
  const itValue = getCleanValue(row, 'IT ($)')
  const iicValue = getCleanValue(row, 'IIC ($)')
  const iicPercentage = calculatePercentageOfTotal(iicValue, itValue)
  const iicPosition = getCleanValue(row, 'POS_IIC')
  
  return {
    variables: [
      {
        key: 'ingresos_total',
        label: 'Ingreso Total',
        value: itValue,
        color: '#9ca3af',
        colorClass: 'gray',
        order: 1,
        position: null,
        percentage: null
      },
      {
        key: 'ingresos_carbono',
        label: 'Ingresos Intensivos en Carbono',
        value: iicValue,
        color: '#DC143C',
        colorClass: 'red',
        order: 2,
        position: iicPosition || null,
        percentage: iicPercentage
      }
    ]
  }
})

// ============================================================================
// DATOS PARA BARCHARTS - PRESUPUESTOS
// ============================================================================

// PS: Gasto Total vs Presupuestos Sostenibles
const presupuestosPSData = computed(() => {
  if (!filteredPresupuestosData.value.length) return { variables: [] }
  const row = filteredPresupuestosData.value[0]
  
  const ptValue = getCleanValue(row, 'PT ($)')
  const psValue = getCleanValue(row, 'PS ($)')
  const psPercentage = calculatePercentageOfTotal(psValue, ptValue)
  const psPosition = getCleanValue(row, 'POS_PS')
  
  return {
    variables: [
      {
        key: 'presupuesto_total',
        label: 'Gasto Total',
        value: ptValue,
        color: '#9ca3af',
        colorClass: 'gray',
        order: 1,
        position: null,
        percentage: null
      },
      {
        key: 'presupuesto_sostenible',
        label: 'Presupuestos Sostenibles',
        value: psValue,
        color: '#7cb342',
        colorClass: 'green',
        order: 2,
        position: psPosition || null,
        percentage: psPercentage
      }
    ]
  }
})

// PIC: Gasto Total vs Presupuestos Intensivos en Carbono
const presupuestosPICData = computed(() => {
  if (!filteredPresupuestosData.value.length) return { variables: [] }
  const row = filteredPresupuestosData.value[0]
  
  const ptValue = getCleanValue(row, 'PT ($)')
  const picValue = getCleanValue(row, 'PIC ($)')
  const picPercentage = calculatePercentageOfTotal(picValue, ptValue)
  const picPosition = getCleanValue(row, 'POS_PIC')
  
  return {
    variables: [
      {
        key: 'presupuesto_total',
        label: 'Gasto Total',
        value: ptValue,
        color: '#9ca3af',
        colorClass: 'gray',
        order: 1,
        position: null,
        percentage: null
      },
      {
        key: 'presupuesto_carbono',
        label: 'Presupuestos Intensivos en Carbono',
        value: picValue,
        color: '#DC143C',
        colorClass: 'red',
        order: 2,
        position: picPosition || null,
        percentage: picPercentage
      }
    ]
  }
})

// ============================================================================
// DATOS PARA DONUTS - CÁLCULO COMÚN
// ============================================================================

const calculateDonutData = (row, sectorsConfig, totalValue) => {
  if (!row || !sectorsConfig || !totalValue) return { mainPercentage: 0, sectors: [] }
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
  return { 
    mainPercentage: totalValue > 0 ? Math.round((sectorsTotal / totalValue) * 100) : 0, 
    sectors 
  }
}

// ============================================================================
// DONUTS - INGRESOS SOSTENIBLES (IS)
// ============================================================================

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

const variablesIngresosSostenibles = computed(() => {
  const sectors = ingresosMapping?.donutSectorsIS || []
  return sectors.map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true }))
})

// ============================================================================
// DONUTS - INGRESOS INTENSIVOS EN CARBONO (IIC)
// ============================================================================

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

const variablesIngresosCarbono = computed(() => {
  const sectors = ingresosMapping?.donutSectorsIIC || []
  return sectors.map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true }))
})

// ============================================================================
// DONUTS - PRESUPUESTOS SOSTENIBLES (PS)
// ============================================================================

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

const variablesPresupuestosSostenibles = computed(() => {
  const sectors = presupuestosMapping?.donutSectorsPS || []
  return sectors.map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true }))
})

// ============================================================================
// DONUTS - PRESUPUESTOS INTENSIVOS EN CARBONO (PIC)
// ============================================================================

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

const variablesPresupuestosCarbono = computed(() => {
  const sectors = presupuestosMapping?.donutSectorsPIC || []
  return sectors.map(s => ({ key: s.key, label: s.label, colorClass: s.colorClass, active: true }))
})
</script>

<style scoped>
/* ============================================
   CONTENEDOR PRINCIPAL
   ============================================ */
.charts-wrapper {
  width: 100%;
  padding: 10px;
}

/* ============================================
   GRID DE CHARTS - 4 FILAS
   ============================================ */
.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* ============================================
   FILA - 2 COLUMNAS
   ============================================ */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
}

/* ============================================
   CARD DE CHART
   ============================================ */
.chart-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 320px;
}

/* Card sin header externo - para BarCharts que tienen su propio header azul */
.chart-card-no-header {
  padding: 0;
  overflow: hidden;
}

.chart-card-no-header .chart-card-body {
  padding: 0;
  margin: 0;
}

.chart-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.card-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.chart-card-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;
}

.chart-card-body.donut-body {
  padding: 10px;
}

/* ============================================
   HEADER AZUL PARA DONUTS (igual que BarChart)
   ============================================ */
.donut-header-blue {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 12px 13px 14px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
}

.donut-header-icon-blue {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #93c5fd;
}

.donut-header-icon-blue svg {
  width: 12px;
  height: 12px;
}

.donut-header-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.donut-header-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: white;
  margin: 0;
  line-height: 1.2;
}

.donut-header-subtitle {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 10px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.2;
}

/* ============================================
   ESTADOS DE CARGA Y ERROR
   ============================================ */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 400px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #7cb342;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  color: #DC143C;
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
}

/* ============================================
   RESPONSIVE - TABLETS
   ============================================ */
@media (max-width: 1024px) {
  .chart-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .chart-card {
    min-height: 300px;
  }
  
  .donut-header-blue {
    padding: 8px 10px;
    gap: 6px;
  }
  
  .donut-header-icon-blue {
    width: 24px;
    height: 24px;
    min-width: 24px;
    border-radius: 5px;
  }
  
  .donut-header-icon-blue svg {
    width: 10px;
    height: 10px;
  }
  
  .donut-header-title {
    font-size: 11px;
  }
  
  .donut-header-subtitle {
    font-size: 9px;
  }
}

/* ============================================
   RESPONSIVE - MÓVILES
   ============================================ */
@media (max-width: 768px) {
  .charts-wrapper {
    padding: 8px;
  }
  
  .charts-grid {
    gap: 16px;
  }
  
  .chart-row {
    gap: 12px;
  }
  
  .chart-card {
    padding: 12px;
    border-radius: 10px;
    min-height: 280px;
  }
  
  .chart-card-no-header {
    padding: 0;
  }
  
  .chart-card-header {
    padding-bottom: 10px;
    margin-bottom: 10px;
    gap: 8px;
  }
  
  .card-title {
    font-size: 12px;
  }
  
  .donut-header-blue {
    padding: 8px 10px;
    gap: 6px;
  }
  
  .donut-header-icon-blue {
    width: 24px;
    height: 24px;
    min-width: 24px;
    border-radius: 5px;
  }
  
  .donut-header-icon-blue svg {
    width: 10px;
    height: 10px;
  }
  
  .donut-header-title {
    font-size: 11px;
  }
  
  .donut-header-subtitle {
    font-size: 9px;
  }
  
  .chart-card-body {
    min-height: 220px;
  }
}

/* ============================================
   RESPONSIVE - MÓVILES PEQUEÑOS
   ============================================ */
@media (max-width: 480px) {
  .charts-wrapper {
    padding: 6px;
  }
  
  .charts-grid {
    gap: 12px;
  }
  
  .chart-card {
    padding: 10px;
    border-radius: 8px;
    min-height: 260px;
  }
  
  .chart-card-no-header {
    padding: 0;
  }
  
  .chart-card-header {
    padding-bottom: 8px;
    margin-bottom: 8px;
    gap: 6px;
  }
  
  .card-title {
    font-size: 11px;
  }
  
  .donut-header-blue {
    padding: 6px 8px;
    gap: 5px;
  }
  
  .donut-header-icon-blue {
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: 4px;
  }
  
  .donut-header-icon-blue svg {
    width: 9px;
    height: 9px;
  }
  
  .donut-header-title {
    font-size: 10px;
  }
  
  .donut-header-subtitle {
    font-size: 8px;
  }
  
  .chart-card-body {
    min-height: 200px;
  }
  
  .no-data-message {
    font-size: 12px;
    min-height: 150px;
  }
}

/* ============================================
   RESPONSIVE - LANDSCAPE MÓVIL
   ============================================ */
@media (max-width: 768px) and (orientation: landscape) {
  .chart-row {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .chart-card {
    min-height: 240px;
  }
  
  .chart-card-body {
    min-height: 180px;
  }
}
</style>