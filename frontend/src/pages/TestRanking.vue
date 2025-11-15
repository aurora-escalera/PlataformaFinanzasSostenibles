<!-- DebugSimple.vue - Ejecuta esto para ver qué está pasando -->
<template>
  <div style="padding: 40px; font-family: monospace;">
    <h1>🔍 Debug Ranking IFSS</h1>
    
    <button 
      @click="runDebug" 
      style="padding: 15px 30px; background: #0F3759; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 20px 0;"
    >
      🧪 Ejecutar Debug
    </button>
    
    <!-- PASO 1: Variables de entorno -->
    <div style="border: 2px solid #ddd; padding: 20px; margin: 20px 0; background: #f9f9f9;">
      <h2>📋 PASO 1: Variables de Entorno</h2>
      <div v-if="step1">
        <pre style="background: white; padding: 15px; border-radius: 5px; overflow-x: auto;">{{ step1 }}</pre>
        <p v-if="!step1.apiKeyExists" style="color: red; font-weight: bold;">
          ❌ FALTA API KEY - Revisa tu archivo .env
        </p>
        <p v-if="!step1.sheetIdExists" style="color: red; font-weight: bold;">
          ❌ FALTA SHEET ID - Revisa tu archivo .env
        </p>
      </div>
    </div>
    
    <!-- PASO 2: Datos crudos -->
    <div style="border: 2px solid #ddd; padding: 20px; margin: 20px 0; background: #f9f9f9;">
      <h2>📊 PASO 2: Datos del Google Sheet</h2>
      <div v-if="loading" style="color: orange;">⏳ Cargando...</div>
      <div v-if="errorMsg" style="color: red; padding: 15px; background: #fee; border-radius: 5px;">
        <strong>❌ ERROR:</strong> {{ errorMsg }}
      </div>
      <div v-if="step2">
        <p><strong>Filas obtenidas:</strong> {{ step2.rowCount }}</p>
        <p><strong>Columnas detectadas:</strong></p>
        <pre style="background: white; padding: 15px; border-radius: 5px;">{{ step2.columns }}</pre>
        <p><strong>Primera fila:</strong></p>
        <pre style="background: white; padding: 15px; border-radius: 5px; overflow-x: auto;">{{ step2.firstRow }}</pre>
      </div>
    </div>
    
    <!-- PASO 3: Transformación -->
    <div style="border: 2px solid #ddd; padding: 20px; margin: 20px 0; background: #f9f9f9;">
      <h2>🔄 PASO 3: Datos Transformados</h2>
      <div v-if="step3">
        <p><strong>Estados transformados:</strong> {{ step3.count }}</p>
        <div v-if="step3.count === 0" style="color: red; padding: 15px; background: #fee; border-radius: 5px;">
          <strong>⚠️ PROBLEMA:</strong> Los datos se transformaron pero resultaron en 0 estados.
          <br>Esto significa que los nombres de columnas no coinciden.
          <br><br>
          <strong>Columnas que estamos buscando:</strong>
          <ul>
            <li>Entidad Federativa</li>
            <li>IFSS</li>
          </ul>
          <strong>Columnas que encontramos:</strong>
          <pre style="background: white; padding: 10px;">{{ step2?.columns }}</pre>
        </div>
        <div v-if="step3.count > 0">
          <p><strong>✅ Top 5 estados:</strong></p>
          <pre style="background: white; padding: 15px; border-radius: 5px;">{{ step3.top5 }}</pre>
        </div>
      </div>
    </div>
    
    <!-- PASO 4: Visualización -->
    <div v-if="step3 && step3.count > 0" style="border: 2px solid #28a745; padding: 20px; margin: 20px 0; background: #d4edda;">
      <h2>✅ PASO 4: Gráfica</h2>
      <p>Los datos están listos. Usa el componente así:</p>
      <pre style="background: white; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px;">
&lt;script setup&gt;
import { useStateRanking } from '@/composables/useStateRanking'
import HorizontalRankingChart from '@/modules/charts/components/HorizontalRankingChart.vue'

const { rankingData, loadAllStatesRanking } = useStateRanking()
onMounted(() => loadAllStatesRanking())
&lt;/script&gt;

&lt;template&gt;
  &lt;HorizontalRankingChart
    :variables="rankingData"
    :showLabels="true"
    :showValues="true"
    :showAllBars="true"
    :valueFormatter="(v) => v.toFixed(1)"
  /&gt;
&lt;/template&gt;</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'

const step1 = ref(null)
const step2 = ref(null)
const step3 = ref(null)
const loading = ref(false)
const errorMsg = ref(null)

const { fetchData } = useStorageData()

const runDebug = async () => {
  loading.value = true
  errorMsg.value = null
  step1.value = null
  step2.value = null
  step3.value = null
  
  try {
    // PASO 1: Verificar variables de entorno
    console.log('=== PASO 1: Variables de entorno ===')
    step1.value = {
      provider: import.meta.env.VITE_STORAGE_PROVIDER || 'NO DEFINIDO',
      apiKeyExists: !!import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
      sheetIdExists: !!import.meta.env.VITE_GOOGLE_SHEET_ID
    }
    console.log('Variables:', step1.value)
    
    if (!step1.value.apiKeyExists || !step1.value.sheetIdExists) {
      errorMsg.value = 'Faltan variables de entorno en el archivo .env'
      loading.value = false
      return
    }
    
    // PASO 2: Obtener datos del sheet
    console.log('=== PASO 2: Obteniendo datos ===')
    const data = await fetchData('datosCuantitativos', '2024')
    
    if (!data || data.length === 0) {
      errorMsg.value = 'El sheet está vacío o no se pudo conectar'
      loading.value = false
      return
    }
    
    step2.value = {
      rowCount: data.length,
      columns: Object.keys(data[0]),
      firstRow: data[0]
    }
    console.log('Datos obtenidos:', step2.value)
    
    // PASO 3: Transformar datos
    console.log('=== PASO 3: Transformando datos ===')
    
    const stateColumnName = 'Entidad Federativa'
    const ifssColumnName = 'IFSS'
    
    console.log(`Buscando columnas: "${stateColumnName}" y "${ifssColumnName}"`)
    
    const transformed = data.map(row => {
      const stateName = row[stateColumnName]
      const ifssValue = row[ifssColumnName]
      
      console.log(`Fila: ${stateName} = ${ifssValue}`)
      
      const cleanValue = typeof ifssValue === 'string' 
        ? ifssValue.replace(/[,.]/g, '')
        : ifssValue
      
      const parsedValue = parseFloat(cleanValue) || 0
      
      return {
        key: stateName?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
        label: stateName || 'Desconocido',
        value: parsedValue,
        color: parsedValue >= 2.0 ? '#22c55e' : parsedValue >= 1.5 ? '#fb923c' : '#ef4444'
      }
    })
    
    const filtered = transformed.filter(item => 
      item.label !== 'Desconocido' && item.value > 0
    )
    
    const sorted = filtered.sort((a, b) => b.value - a.value)
    
    step3.value = {
      count: sorted.length,
      top5: sorted.slice(0, 5).map(item => ({
        estado: item.label,
        ifss: item.value
      }))
    }
    
    console.log('Transformación completa:', step3.value)
    
  } catch (err) {
    console.error('Error en debug:', err)
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>