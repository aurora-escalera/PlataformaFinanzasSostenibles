<!-- src/modules/charts/components/ChartsComponent.vue -->
<template>
  <div class="charts-wrapper">
    <!-- CARD 1: PRESUPUESTOS -->
    <div class="chart-card">
      <div class="chart-card-header">
        <h4 class="card-title">{{ selectedState ? `Presupuestos - ${selectedState}` : 'Selecciona un estado' }}</h4>
      </div>
      
      <div class="chart-card-body">
        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando datos...</p>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <p>Error: {{ error }}</p>
        </div>
        
        <!-- Barra izquierda -->
        <div v-else class="chart-col-bar">
          <BarChart 
            :data="presupuestosData"
            :title="selectedYear ? `Presupuestos Intensivos en Carbono (PIC) y Presupuestos Sostenibles (PS) con respecto del gasto total en ${selectedYear}` : 'Presupuestos Intensivos en Carbono (PIC) y Presupuestos Sostenibles (PS) con respecto del gasto total'"
          />
        </div>
        
        <!-- Donas derecha -->
        <div v-if="!loading && !error" class="chart-col-donuts">
          <div class="donut-item">
            <div class="donut-header">
              <h5 class="donut-title">Análisis comparativo de los sectores que conforman Presupuestos Sostenibles (PS)</h5>
            </div>
            <DonutChart 
              :data="donutPresupuestosSostenibles"
              title="PS"
              subtitle="35%"
              :size="220"
              :variables="variablesPresupuestosSostenibles"
            />
          </div>
          <div class="donut-item">
            <div class="donut-header">
              <h5 class="donut-title">Análisis comparativo de los sectores que conforman Presupuestos Intensivos en Carbono (PIC)</h5>
            </div>
            <DonutChart 
              :data="donutPresupuestosCarbono"
              title="PIC"
              subtitle="40%"
              :size="220"
              :variables="variablesPresupuestosCarbono"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- CARD 2: INGRESOS -->
    <div class="chart-card">
      <div class="chart-card-header">
        <h4 class="card-title">Ingresos</h4>
      </div>
      
      <div class="chart-card-body">
        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando datos...</p>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <p>Error: {{ error }}</p>
        </div>
        
        <!-- Barra izquierda -->
        <div v-else class="chart-col-bar">
          <BarChart 
            :data="ingresosData"
            title="Proporción del gasto asignado a Ingresos"
          />
        </div>
        
        <!-- Donas derecha -->
        <div v-if="!loading && !error" class="chart-col-donuts">
          <div class="donut-item">
            <div class="donut-header">
              <h5 class="donut-title">Análisis comparativo de los sectores que conforman Ingresos Sostenibles (IS)</h5>
            </div>
            <DonutChart 
              :data="donutIngresosSostenibles"
              title="IS"
              subtitle="45%"
              :size="220"
              :variables="variablesIngresosSostenibles"
            />
          </div>
          <div class="donut-item">
            <div class="donut-header">
              <h5 class="donut-title">Análisis comparativo de los sectores que conforman Ingresos Intensivos en Carbono (IIC)</h5>
            </div>
            <DonutChart 
              :data="donutIngresosCarbono"
              title="IIC"
              subtitle="38%"
              :size="220"
              :variables="variablesIngresosCarbono"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping } from '@/dataConection/storageConfig'
import BarChart from './BarChart.vue'
import DonutChart from './DonutChart.vue'

const props = defineProps({
  selectedState: {
    type: String,
    default: null
  },
  selectedYear: {
    type: String,
    default: null
  },
  ifssData: {
    type: Object,
    default: () => ({})
  }
})

// ✅ Composable para obtener datos de Google Sheets
const { fetchData, transform, loading, error } = useStorageData()

// ✅ Datos crudos desde Google Sheets
const rawPresupuestosData = ref([])
const rawIngresosData = ref([])

// ✅ Obtener mappings
const presupuestosMapping = getMapping('chartsPresupuestos')
const ingresosMapping = getMapping('chartsIngresos')

// ✅ Fetch de datos al montar el componente
onMounted(async () => {
  try {
    console.log('📊 ChartsComponent: Cargando datos...')
    
    // Cargar datos de Presupuestos desde Datos_Cuantitativos
    const rawPresupuestos = await fetchData('chartsPresupuestos', 'Datos_Cuantitativos')
    rawPresupuestosData.value = rawPresupuestos
    console.log('✅ Datos de Presupuestos cargados:', rawPresupuestos.length, 'filas')
    
    // Cargar datos de Ingresos desde Datos_Cuantitativos
    const rawIngresos = await fetchData('chartsIngresos', 'Datos_Cuantitativos')
    rawIngresosData.value = rawIngresos
    console.log('✅ Datos de Ingresos cargados:', rawIngresos.length, 'filas')
    
  } catch (err) {
    console.error('❌ Error cargando datos de ChartsComponent:', err)
  }
})

// ✅ Filtrar datos por estado seleccionado
const filteredPresupuestosData = computed(() => {
  if (!props.selectedState || !rawPresupuestosData.value.length) {
    console.log('⚠️ No hay estado seleccionado o no hay datos de presupuestos')
    return []
  }
  
  console.log(`🔍 Filtrando presupuestos para estado: "${props.selectedState}"`)
  console.log(`📊 Total de filas en rawPresupuestosData: ${rawPresupuestosData.value.length}`)
  console.log(`📋 Columna de estado: "${presupuestosMapping.stateColumn}"`)
  
  const filtered = rawPresupuestosData.value.filter(row => {
    const rowState = row[presupuestosMapping.stateColumn]
    const matches = rowState === props.selectedState
    if (matches) {
      console.log(`✅ Fila coincidente encontrada:`, row)
    }
    return matches
  })
  
  console.log(`✅ Filas filtradas de presupuestos: ${filtered.length}`)
  
  return filtered
})

const filteredIngresosData = computed(() => {
  if (!props.selectedState || !rawIngresosData.value.length) {
    console.log('⚠️ No hay estado seleccionado o no hay datos de ingresos')
    return []
  }
  
  console.log(`🔍 Filtrando ingresos para estado: "${props.selectedState}"`)
  console.log(`📊 Total de filas en rawIngresosData: ${rawIngresosData.value.length}`)
  
  const filtered = rawIngresosData.value.filter(row => 
    row[ingresosMapping.stateColumn] === props.selectedState
  )
  
  console.log(`✅ Filas filtradas de ingresos: ${filtered.length}`)
  
  return filtered
})

// ✅ NUEVO: Función para transformar datos sin años a formato BarChart
const transformSingleRowToBarChart = (row, mapping) => {
  if (!row) {
    console.warn('⚠️ transformSingleRowToBarChart: No hay fila para transformar')
    return { variables: [] }
  }
  
  console.log('🔄 Transformando fila:', row)
  console.log('📋 Mapping:', mapping.variableColumns.map(v => ({ key: v.key, column: v.column })))
  
  const variables = mapping.variableColumns.map(varConfig => {
    const rawValue = row[varConfig.column]
    
    console.log(`  - ${varConfig.key} (columna: ${varConfig.column}):`, rawValue)
    
    // Limpiar comas y puntos si el valor es un string
    const cleanValue = typeof rawValue === 'string' 
      ? rawValue.replace(/[,.]/g, '')
      : rawValue
    
    const parsedValue = parseFloat(cleanValue) || 0
    
    console.log(`    → Valor limpio: ${cleanValue} → Parseado: ${parsedValue}`)
    
    return {
      key: varConfig.key,
      label: varConfig.label,
      value: parsedValue,
      color: varConfig.color,
      colorClass: varConfig.colorClass,
      order: varConfig.order || 0
    }
  })
  
  // Ordenar por orden
  variables.sort((a, b) => a.order - b.order)
  
  console.log('✅ Variables transformadas:', variables.map(v => ({ key: v.key, value: v.value })))
  
  return { variables }
}

// ✅ Transformar datos para BarChart
const presupuestosData = computed(() => {
  console.log('🔄 Calculando presupuestosData...')
  
  if (!filteredPresupuestosData.value.length) {
    console.log('⚠️ No hay datos filtrados de presupuestos')
    return { variables: [] }
  }
  
  // Tomar la primera fila (ya está filtrada por estado)
  const row = filteredPresupuestosData.value[0]
  console.log('📊 Fila de presupuestos a transformar:', row)
  
  const result = transformSingleRowToBarChart(row, presupuestosMapping)
  console.log('✅ presupuestosData transformado:', result)
  
  return result
})

const ingresosData = computed(() => {
  console.log('🔄 Calculando ingresosData...')
  
  if (!filteredIngresosData.value.length) {
    console.log('⚠️ No hay datos filtrados de ingresos')
    return { variables: [] }
  }
  
  // Tomar la primera fila (ya está filtrada por estado)
  const row = filteredIngresosData.value[0]
  console.log('📊 Fila de ingresos a transformar:', row)
  
  const result = transformSingleRowToBarChart(row, ingresosMapping)
  console.log('✅ ingresosData transformado:', result)
  
  return result
})

// Datos para Donas - Presupuestos Sostenibles
const donutPresupuestosSostenibles = computed(() => {
  const percentage = props.ifssData?.is_percentage 
    ? Math.round(props.ifssData.is_percentage * 100) 
    : 35
  
  return [
    { label: 'PS', value: percentage, color: '#7cb342' },
    { label: 'Resto', value: 100 - percentage, color: '#E8E8E8' }
  ]
})

// Datos para Donas - Presupuestos Carbono
const donutPresupuestosCarbono = computed(() => {
  const percentage = props.ifssData?.iic_percentage 
    ? Math.round(props.ifssData.iic_percentage * 100) 
    : 40
  
  return [
    { label: 'PIC', value: percentage, color: '#DC143C' },
    { label: 'Resto', value: 100 - percentage, color: '#E8E8E8' }
  ]
})

// Datos para Donas - Ingresos Sostenibles
const donutIngresosSostenibles = computed(() => {
  return [
    { label: 'IS', value: 45, color: '#7cb342' },
    { label: 'Resto', value: 55, color: '#E8E8E8' }
  ]
})

// Datos para Donas - Ingresos Carbono
const donutIngresosCarbono = computed(() => {
  return [
    { label: 'IIC', value: 38, color: '#DC143C' },
    { label: 'Resto', value: 62, color: '#E8E8E8' }
  ]
})

// Variables para filtros de Presupuestos Sostenibles
const variablesPresupuestosSostenibles = [
  {
    key: 'ambiental',
    label: 'Ambiental',
    colorClass: 'dark-green',
    active: true
  },
  {
    key: 'ecologico',
    label: 'Ecológico',
    colorClass: 'green',
    active: true
  },
  {
    key: 'movilidad_sustentable',
    label: 'Movilidad sustentable',
    colorClass: 'light-green',
    active: true
  }
]

// Variables para filtros de Presupuestos Intensivos en Carbono
const variablesPresupuestosCarbono = [
  {
    key: 'hidrocarburos',
    label: 'Hidrocarburos',
    colorClass: 'dark-red',
    active: true
  },
  {
    key: 'transporte',
    label: 'Transporte',
    colorClass: 'red',
    active: true
  },
  {
    key: 'movilidad_no_sustentable',
    label: 'Movilidad no sustentable',
    colorClass: 'light-red',
    active: true
  }
]

// Variables para filtros de Ingresos Sostenibles
const variablesIngresosSostenibles = [
  {
    key: 'energia_renovable',
    label: 'Energía renovable',
    colorClass: 'dark-green',
    active: true
  },
  {
    key: 'economia_circular',
    label: 'Economía circular',
    colorClass: 'green',
    active: true
  },
  {
    key: 'turismo_sustentable',
    label: 'Turismo sustentable',
    colorClass: 'light-green',
    active: true
  }
]

// Variables para filtros de Ingresos Intensivos en Carbono
const variablesIngresosCarbono = [
  {
    key: 'petroleo',
    label: 'Petróleo',
    colorClass: 'dark-red',
    active: true
  },
  {
    key: 'gas',
    label: 'Gas',
    colorClass: 'red',
    active: true
  },
  {
    key: 'mineria',
    label: 'Minería',
    colorClass: 'light-red',
    active: true
  }
]
</script>

<style scoped>
.charts-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100%;
}

/* Card estilo ranking-panel */
.chart-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
}

/* Header estilo header-ranking-panel */
.chart-card-header {
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.card-title {
  padding: 4px 0 2px 0;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100;
  color: #535353;
  font-size: 19px;
  margin: 0;
  flex-shrink: 0;
}

/* Body de la card */
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
}

/* Container for donuts - Ajustado para dar más espacio y agregar borde */
.chart-col-donuts {
  flex: 1.2;
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.donut-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  background: transparent;
  border-radius: 0;
  min-height: 0;
  flex: 1;
  padding: 20px;
}

.donut-item:first-child {
  border-right: 1px solid #e5e7eb;
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

.error-container {
  color: #DC143C;
}

.donut-header {
  width: 100%;
  margin-bottom: 10px;
  flex-shrink: 0;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-title {
  font-size: 17px;
  font-weight: 600;
  color: #484d56;
  text-align: center;
  letter-spacing: -0.5px;
  line-height: 1.3;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
}

@media (max-width: 1200px) {
  .chart-card-body {
    flex-direction: column;
  }
  
  .chart-col-donuts {
    flex-direction: row;
    flex: 1;
  }
  
  .donut-item:first-child {
    border-right: 1px solid #e5e7eb;
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .chart-col-donuts {
    flex-direction: column;
  }
  
  .donut-item {
    min-height: 300px;
  }
  
  .donut-item:first-child {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
}
</style>