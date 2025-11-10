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
          <div class="donut-item">
            <div class="donut-header">
              <h5 class="donut-title">Análisis comparativo de los sectores que conforman Presupuestos Intensivos en Carbono (PIC)</h5>
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
          <div class="donut-item">
            <div class="donut-header">
              <h5 class="donut-title">Análisis comparativo de los sectores que conforman Ingresos Intensivos en Carbono (IIC)</h5>
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

// ✅ Flag para saber si los datos ya se cargaron
const dataLoaded = ref(false)

// ✅ Datos crudos desde Google Sheets
const rawPresupuestosData = ref([])
const rawIngresosData = ref([])

// ✅ Obtener mappings
const presupuestosMapping = getMapping('chartsPresupuestos')
const ingresosMapping = getMapping('chartsIngresos')

// ✅ Fetch de datos al montar el componente
onMounted(async () => {
  try {
    console.log('\n🚀 ===== CARGANDO DATOS EN ChartsComponent =====')
    
    // Cargar datos de Presupuestos desde Datos_Cuantitativos
    console.log('📥 Cargando datos de Presupuestos...')
    const rawPresupuestos = await fetchData('chartsPresupuestos', 'Datos_Cuantitativos')
    rawPresupuestosData.value = rawPresupuestos
    console.log(`✅ Presupuestos cargados: ${rawPresupuestos.length} filas`)
    
    if (rawPresupuestos.length > 0) {
      console.log('📋 Columnas disponibles en Presupuestos:', Object.keys(rawPresupuestos[0]))
      console.log('📋 Primera fila:', rawPresupuestos[0])
    }
    
    // Cargar datos de Ingresos desde Datos_Cuantitativos
    console.log('\n📥 Cargando datos de Ingresos...')
    const rawIngresos = await fetchData('chartsIngresos', 'Datos_Cuantitativos')
    rawIngresosData.value = rawIngresos
    console.log(`✅ Ingresos cargados: ${rawIngresos.length} filas`)
    
    if (rawIngresos.length > 0) {
      console.log('📋 Columnas disponibles en Ingresos:', Object.keys(rawIngresos[0]))
      console.log('📋 Primera fila:', rawIngresos[0])
      console.log('📋 Estados disponibles:', rawIngresos.map(r => r[ingresosMapping.stateColumn]))
    }
    
    // ✅ Marcar que los datos ya están cargados
    dataLoaded.value = true
    console.log('✅ dataLoaded establecido a true')
    console.log('===== FIN CARGA DE DATOS =====\n')
    
  } catch (err) {
    console.error('❌ Error cargando datos de ChartsComponent:', err)
  }
})

// ✅ Filtrar datos por estado seleccionado
const filteredPresupuestosData = computed(() => {
  // ✅ Esperar a que los datos estén cargados
  if (!dataLoaded.value) {
    console.log('⏳ filteredPresupuestosData: Esperando a que los datos se carguen...')
    return []
  }
  
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
  console.log('\n🔍 ===== FILTRANDO DATOS DE INGRESOS =====')
  console.log('📊 dataLoaded.value:', dataLoaded.value)
  console.log('📊 props.selectedState:', props.selectedState)
  console.log('📊 rawIngresosData.value.length:', rawIngresosData.value.length)
  console.log('📊 ingresosMapping.stateColumn:', ingresosMapping.stateColumn)
  
  // ✅ NUEVO: Esperar a que los datos estén cargados
  if (!dataLoaded.value) {
    console.log('⏳ Esperando a que los datos se carguen...')
    return []
  }
  
  if (!props.selectedState) {
    console.log('⚠️ No hay estado seleccionado')
    return []
  }
  
  if (!rawIngresosData.value.length) {
    console.log('⚠️ rawIngresosData está vacío')
    return []
  }
  
  // Mostrar algunos datos de ejemplo
  console.log('📋 Primeras 3 filas de rawIngresosData:')
  rawIngresosData.value.slice(0, 3).forEach((row, idx) => {
    console.log(`  Fila ${idx}:`, {
      estado: row[ingresosMapping.stateColumn],
      'IT ($)': row['IT ($)'],
      'IS ($)': row['IS ($)']
    })
  })
  
  console.log(`\n🔍 Buscando filas donde "${ingresosMapping.stateColumn}" === "${props.selectedState}"`)
  
  const filtered = rawIngresosData.value.filter(row => {
    const rowState = row[ingresosMapping.stateColumn]
    const matches = rowState === props.selectedState
    
    if (matches) {
      console.log('✅ COINCIDENCIA ENCONTRADA:', row)
    }
    
    return matches
  })
  
  console.log(`✅ Total de filas filtradas: ${filtered.length}`)
  console.log('===== FIN FILTRO INGRESOS =====\n')
  
  return filtered
})

// ✅ CORREGIDO: Función para transformar datos sin años a formato BarChart
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
    
    // ✅ FIX: Limpiar comillas triples, puntos y comas
    let cleanValue = rawValue
    
    if (typeof rawValue === 'string') {
      // Eliminar comillas al inicio y final
      cleanValue = rawValue.replace(/^["']+|["']+$/g, '').trim()
      
      // Si quedó vacío o solo comillas, es 0
      if (cleanValue === '' || cleanValue === '""' || cleanValue === '"""') {
        cleanValue = '0'
      } else {
        // Limpiar PUNTOS (separadores de miles)
        cleanValue = cleanValue.replace(/\./g, '')
      }
    }
    
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

// ✅ FUNCIÓN DE DIAGNÓSTICO CON LOGGING MEJORADO
// ✅ FUNCIÓN DE DIAGNÓSTICO CON LOGGING MEJORADO
const calculateDonutData = (row, sectorsConfig, totalValue, debugLabel = '') => {
  console.log(`\n🔍 ===== CALCULANDO DONA ${debugLabel} =====`)
  console.log('📊 Row:', row)
  console.log('📊 Columnas disponibles:', row ? Object.keys(row) : 'NO HAY ROW')
  console.log('📊 Total Value:', totalValue)
  console.log('📊 Sectors Config:', sectorsConfig)
  
  if (!row || !sectorsConfig || !totalValue) {
    console.warn('⚠️ calculateDonutData: Faltan datos', {
      hasRow: !!row,
      hasSectorsConfig: !!sectorsConfig,
      hasTotalValue: !!totalValue
    })
    return {
      mainPercentage: 0,
      sectorsTotal: 0,
      sectors: []
    }
  }
  
  console.log('📋 Procesando sectores:')
  let sectorsTotal = 0
  const sectors = sectorsConfig.map(sectorConfig => {
    console.log(`\n  🔸 Sector: ${sectorConfig.label}`)
    console.log(`     - Buscando columna: "${sectorConfig.column}"`)
    
    const rawValue = row[sectorConfig.column]
    console.log(`     - Valor RAW: "${rawValue}" (tipo: ${typeof rawValue})`)
    
    // ✅ FIX: Limpiar comillas triples, puntos y comas
    let cleanValue = rawValue
    
    if (rawValue === null || rawValue === undefined) {
      console.log(`     ⚠️ Valor es null/undefined`)
      cleanValue = '0'
    } else if (typeof rawValue === 'string') {
      console.log(`     - Es string, limpiando...`)
      // Eliminar comillas al inicio y final
      cleanValue = rawValue.replace(/^["']+|["']+$/g, '').trim()
      console.log(`     - Después de quitar comillas: "${cleanValue}"`)
      
      // Si quedó vacío o solo comillas, es 0
      if (cleanValue === '' || cleanValue === '""' || cleanValue === '"""') {
        console.log(`     - String vacío, asignando 0`)
        cleanValue = '0'
      } else {
        // Limpiar PUNTOS (separadores de miles)
        cleanValue = cleanValue.replace(/\./g, '')
        console.log(`     - Después de quitar puntos: "${cleanValue}"`)
      }
    }
    
    const value = parseFloat(cleanValue) || 0
    console.log(`     ✅ Valor FINAL: ${value}`)
    
    sectorsTotal += value
    
    return {
      key: sectorConfig.key,
      label: sectorConfig.label,
      value: value,
      color: sectorConfig.color,
      colorClass: sectorConfig.colorClass
    }
  })
  
  
  // Calcular porcentaje principal (total de sectores / total general)
  const mainPercentage = totalValue > 0 ? Math.round((sectorsTotal / totalValue) * 100) : 0
  
  console.log(`\n📊 RESUMEN ${debugLabel}:`)
  console.log(`  📊 Total sectores: ${sectorsTotal} / Total general: ${totalValue}`)
  console.log(`  📊 Porcentaje principal: ${mainPercentage}%`)
  console.log(`  📊 Sectores resultantes:`, sectors)
  console.log(`===== FIN CÁLCULO ${debugLabel} =====\n`)
  
  return {
    mainPercentage,
    sectorsTotal,
    sectors
  }
}

// Datos para Donas - Presupuestos Sostenibles
const donutPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length) {
    return [
      { label: 'PS', value: 35, color: '#7cb342' },
      { label: 'Resto', value: 65, color: '#E8E8E8' }
    ]
  }
  
  const row = filteredPresupuestosData.value[0]
  
  // Limpiar el valor del presupuesto total
  let totalPresupuesto = 0
  const rawPT = row['PT ($)'] || '0'
  if (typeof rawPT === 'string') {
    const cleanPT = rawPT.replace(/^["']+|["']+$/g, '').trim().replace(/\./g, '')
    totalPresupuesto = parseFloat(cleanPT) || 0
  } else {
    totalPresupuesto = parseFloat(rawPT) || 0
  }
  
  const donutData = calculateDonutData(
    row,
    presupuestosMapping.donutSectorsPS || [],
    totalPresupuesto,
    'PS (Presupuestos Sostenibles)'
  )
  
  return [
    { label: 'PS', value: donutData.mainPercentage, color: '#7cb342' },
    { label: 'Resto', value: 100 - donutData.mainPercentage, color: '#E8E8E8' }
  ]
})

// Sectores de dona PS con valores en $
const sectoresPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length) {
    return []
  }
  
  const row = filteredPresupuestosData.value[0]
  
  // Limpiar el valor del presupuesto total
  let totalPresupuesto = 0
  const rawPT = row['PT ($)'] || '0'
  if (typeof rawPT === 'string') {
    const cleanPT = rawPT.replace(/^["']+|["']+$/g, '').trim().replace(/\./g, '')
    totalPresupuesto = parseFloat(cleanPT) || 0
  } else {
    totalPresupuesto = parseFloat(rawPT) || 0
  }
  
  const donutData = calculateDonutData(
    row,
    presupuestosMapping.donutSectorsPS || [],
    totalPresupuesto,
    'PS (Sectores)'
  )
  
  console.log('🎯 sectoresPresupuestosSostenibles FINAL que se pasa a DonutChart:', donutData.sectors)
  
  return donutData.sectors
})

// Subtitle dinámico para dona PS
const subtitlePresupuestosSostenibles = computed(() => {
  return `${donutPresupuestosSostenibles.value[0].value}%`
})

// Datos para Donas - Presupuestos Carbono
const donutPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length) {
    return [
      { label: 'PIC', value: 40, color: '#DC143C' },
      { label: 'Resto', value: 60, color: '#E8E8E8' }
    ]
  }
  
  const row = filteredPresupuestosData.value[0]
  
  // Limpiar el valor del presupuesto total
  let totalPresupuesto = 0
  const rawPT = row['PT ($)'] || '0'
  if (typeof rawPT === 'string') {
    const cleanPT = rawPT.replace(/^["']+|["']+$/g, '').trim().replace(/\./g, '')
    totalPresupuesto = parseFloat(cleanPT) || 0
  } else {
    totalPresupuesto = parseFloat(rawPT) || 0
  }
  
  const donutData = calculateDonutData(
    row,
    presupuestosMapping.donutSectorsPIC || [],
    totalPresupuesto,
    'PIC (Presupuestos Intensivos en Carbono)'
  )
  
  return [
    { label: 'PIC', value: donutData.mainPercentage, color: '#DC143C' },
    { label: 'Resto', value: 100 - donutData.mainPercentage, color: '#E8E8E8' }
  ]
})

// Sectores de dona PIC con valores en $
const sectoresPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length) {
    return []
  }
  
  const row = filteredPresupuestosData.value[0]
  
  // Limpiar el valor del presupuesto total
  let totalPresupuesto = 0
  const rawPT = row['PT ($)'] || '0'
  if (typeof rawPT === 'string') {
    const cleanPT = rawPT.replace(/^["']+|["']+$/g, '').trim().replace(/\./g, '')
    totalPresupuesto = parseFloat(cleanPT) || 0
  } else {
    totalPresupuesto = parseFloat(rawPT) || 0
  }
  
  const donutData = calculateDonutData(
    row,
    presupuestosMapping.donutSectorsPIC || [],
    totalPresupuesto,
    'PIC (Sectores)'
  )
  
  console.log('🎯 sectoresPresupuestosCarbono FINAL que se pasa a DonutChart:', donutData.sectors)
  
  return donutData.sectors
})

// Subtitle dinámico para dona PIC
const subtitlePresupuestosCarbono = computed(() => {
  return `${donutPresupuestosCarbono.value[0].value}%`
})

// Datos para Donas - Ingresos Sostenibles
const donutIngresosSostenibles = computed(() => {
  if (!filteredIngresosData.value.length) {
    return [
      { label: 'IS', value: 45, color: '#7cb342' },
      { label: 'Resto', value: 55, color: '#E8E8E8' }
    ]
  }
  
  const row = filteredIngresosData.value[0]
  
  // Limpiar el valor de ingresos total
  let totalIngresos = 0
  const rawIT = row['IT ($)'] || '0'
  if (typeof rawIT === 'string') {
    const cleanIT = rawIT.replace(/^["']+|["']+$/g, '').trim().replace(/\./g, '')
    totalIngresos = parseFloat(cleanIT) || 0
  } else {
    totalIngresos = parseFloat(rawIT) || 0
  }
  
  const donutData = calculateDonutData(
    row,
    ingresosMapping.donutSectorsIS || [],
    totalIngresos,
    'IS (Ingresos Sostenibles)'
  )
  
  return [
    { label: 'IS', value: donutData.mainPercentage, color: '#7cb342' },
    { label: 'Resto', value: 100 - donutData.mainPercentage, color: '#E8E8E8' }
  ]
})

// Sectores de dona IS con valores en $
const sectoresIngresosSostenibles = computed(() => {
  console.log('🎯 COMPUTED sectoresIngresosSostenibles ejecutándose...')
  console.log('  📊 filteredIngresosData.value.length:', filteredIngresosData.value.length)
  
  if (!filteredIngresosData.value.length) {
    console.log('  ⚠️ No hay datos filtrados, retornando array vacío')
    return []
  }
  
  const row = filteredIngresosData.value[0]
  console.log('  📊 Row para IS:', row)
  
  // Limpiar el valor de ingresos total
  let totalIngresos = 0
  const rawIT = row['IT ($)'] || '0'
  if (typeof rawIT === 'string') {
    const cleanIT = rawIT.replace(/^["']+|["']+$/g, '').trim().replace(/\./g, '')
    totalIngresos = parseFloat(cleanIT) || 0
  } else {
    totalIngresos = parseFloat(rawIT) || 0
  }
  
  console.log('  📊 Total Ingresos calculado:', totalIngresos)
  console.log('  📊 ingresosMapping.donutSectorsIS:', ingresosMapping.donutSectorsIS)
  
  const donutData = calculateDonutData(
    row,
    ingresosMapping.donutSectorsIS || [],
    totalIngresos,
    'IS (Sectores)'
  )
  
  console.log('🎯 sectoresIngresosSostenibles FINAL que se pasa a DonutChart:', donutData.sectors)
  console.log('  📊 Cantidad de sectores:', donutData.sectors?.length || 0)
  
  return donutData.sectors
})

// Subtitle dinámico para dona IS
const subtitleIngresosSostenibles = computed(() => {
  return `${donutIngresosSostenibles.value[0].value}%`
})

// Datos para Donas - Ingresos Carbono
const donutIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length) {
    return [
      { label: 'IIC', value: 38, color: '#DC143C' },
      { label: 'Resto', value: 62, color: '#E8E8E8' }
    ]
  }
  
  const row = filteredIngresosData.value[0]
  
  // Limpiar el valor de ingresos total
  let totalIngresos = 0
  const rawIT = row['IT ($)'] || '0'
  if (typeof rawIT === 'string') {
    const cleanIT = rawIT.replace(/^["']+|["']+$/g, '').trim().replace(/\./g, '')
    totalIngresos = parseFloat(cleanIT) || 0
  } else {
    totalIngresos = parseFloat(rawIT) || 0
  }
  
  const donutData = calculateDonutData(
    row,
    ingresosMapping.donutSectorsIIC || [],
    totalIngresos,
    'IIC (Ingresos Intensivos en Carbono)'
  )
  
  return [
    { label: 'IIC', value: donutData.mainPercentage, color: '#DC143C' },
    { label: 'Resto', value: 100 - donutData.mainPercentage, color: '#E8E8E8' }
  ]
})

// Sectores de dona IIC con valores en $
const sectoresIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length) {
    return []
  }
  
  const row = filteredIngresosData.value[0]
  
  // Limpiar el valor de ingresos total
  let totalIngresos = 0
  const rawIT = row['IT ($)'] || '0'
  if (typeof rawIT === 'string') {
    const cleanIT = rawIT.replace(/^["']+|["']+$/g, '').trim().replace(/\./g, '')
    totalIngresos = parseFloat(cleanIT) || 0
  } else {
    totalIngresos = parseFloat(rawIT) || 0
  }
  
  const donutData = calculateDonutData(
    row,
    ingresosMapping.donutSectorsIIC || [],
    totalIngresos,
    'IIC (Sectores)'
  )
  
  console.log('🎯 sectoresIngresosCarbono FINAL que se pasa a DonutChart:', donutData.sectors)
  
  return donutData.sectors
})

// Subtitle dinámico para dona IIC
const subtitleIngresosCarbono = computed(() => {
  return `${donutIngresosCarbono.value[0].value}%`
})

// Variables para filtros de Presupuestos Sostenibles
const variablesPresupuestosSostenibles = [
  {
    key: 'ps_desastres',
    label: 'Desastres Naturales',
    colorClass: 'dark-green',
    active: true
  },
  {
    key: 'ps_proteccion',
    label: 'Protección Ambiental',
    colorClass: 'green',
    active: true
  }
]

// Variables para filtros de Presupuestos Intensivos en Carbono
const variablesPresupuestosCarbono = [
  {
    key: 'pic_combustible',
    label: 'Combustible',
    colorClass: 'dark-red',
    active: true
  },
  {
    key: 'pic_mineria',
    label: 'Minería',
    colorClass: 'red',
    active: true
  },
  {
    key: 'pic_transporte',
    label: 'Transporte',
    colorClass: 'light-red',
    active: true
  }
]

// Variables para filtros de Ingresos Sostenibles
const variablesIngresosSostenibles = [
  {
    key: 'is_ambiental',
    label: 'Ambiental',
    colorClass: 'dark-green',
    active: true
  },
  {
    key: 'is_ecologico',
    label: 'Ecológico',
    colorClass: 'green',
    active: true
  },
  {
    key: 'is_movilidad',
    label: 'Movilidad Sustentable',
    colorClass: 'light-green',
    active: true
  }
]

// ✅ Watch para debugging
watch(() => sectoresIngresosSostenibles.value, (newVal) => {
  console.log('🔔 sectoresIngresosSostenibles CAMBIÓ:', newVal)
  console.log('   📊 Cantidad:', newVal?.length || 0)
  console.log('   📊 Valores:', newVal?.map(s => ({ key: s.key, value: s.value })))
}, { immediate: true, deep: true })

// ✅ Watch para ver cuando cambia el estado seleccionado
watch(() => props.selectedState, (newState, oldState) => {
  console.log(`\n🔔 ===== ESTADO CAMBIÓ =====`)
  console.log(`   De: "${oldState}" → A: "${newState}"`)
  console.log(`===========================\n`)
}, { immediate: true })

// Variables para filtros de Ingresos Intensivos en Carbono
const variablesIngresosCarbono = [
  {
    key: 'iic_hidrocarburos',
    label: 'Hidrocarburos',
    colorClass: 'dark-red',
    active: true
  },
  {
    key: 'iic_mineria',
    label: 'Minería',
    colorClass: 'red',
    active: true
  },
  {
    key: 'iic_transporte',
    label: 'Transporte',
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

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  color: #999;
  font-size: 14px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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