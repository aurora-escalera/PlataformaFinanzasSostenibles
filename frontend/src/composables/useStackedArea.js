// src/composables/useStackedArea.js
// ✅ ACTUALIZADO: Extrae IFS y POS_IFS para el tooltip

import { ref, computed } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'

export function useStackedAreaData() {
  const chartData = ref({})
  const years = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // ✅ Posiciones por año para mostrar en tooltip
  const positionsByYear = ref({})

  const { fetchData } = useStorageData()

  /**
   * Procesa los datos crudos de Google Sheets para el formato StackedArea
   */
  const processIFSData = (rawData, mapping) => {
    console.log('🔧 [processIFSData] Iniciando procesamiento...')
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No hay datos para procesar')
    }

    const yearColumn = mapping.yearColumn
    const variableColumns = mapping.variableColumns || []

    console.log(`📋 Columna de años: "${yearColumn}"`)
    console.log(`📋 Variables:`, variableColumns)

    if (rawData.length > 0) {
      console.log('🔍 [DEBUG] Claves en primera fila:', Object.keys(rawData[0]))
      console.log('🔍 [DEBUG] Primera fila:', rawData[0])
    }

    const extractedYears = []
    const dataByVariable = {}
    const positions = {}
    
    // Inicializar estructuras
    variableColumns.forEach(varConfig => {
      dataByVariable[varConfig.label] = []
    })

    // Procesar cada fila
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i]
      const year = row[yearColumn]
      
      if (!year) {
        continue
      }

      const yearStr = String(year).trim()
      extractedYears.push(yearStr)
      positions[yearStr] = {}

      // Extraer valores y posiciones de cada variable
      variableColumns.forEach(varConfig => {
        // Valor de la variable
        const rawValue = row[varConfig.column]
        // Manejar formato europeo (coma como decimal)
        const valueStr = String(rawValue || '0').replace(',', '.')
        const parsedValue = parseFloat(valueStr)
        
        if (!isNaN(parsedValue)) {
          dataByVariable[varConfig.label].push(parsedValue)
        } else {
          dataByVariable[varConfig.label].push(0)
        }
        
        // ✅ Extraer posición si existe positionColumn
        if (varConfig.positionColumn) {
          const posRaw = row[varConfig.positionColumn]
          console.log(`📍 [DEBUG] Año ${yearStr} - Columna "${varConfig.positionColumn}" = "${posRaw}"`)
          
          if (posRaw !== undefined && posRaw !== null && posRaw !== '') {
            const parsedPos = parseInt(posRaw)
            if (!isNaN(parsedPos)) {
              positions[yearStr][varConfig.label] = parsedPos
              console.log(`✅ [DEBUG] Guardado: positions["${yearStr}"]["${varConfig.label}"] = ${parsedPos}`)
            }
          }
        }
      })
    }

    console.log('✅ Procesamiento completado')
    console.log('📅 Años:', extractedYears)
    console.log('📊 Data:', dataByVariable)
    console.log('📍 Posiciones:', JSON.stringify(positions, null, 2))

    return {
      chartData: dataByVariable,
      years: extractedYears,
      positions
    }
  }

  /**
   * Cargar datos del IFS desde Google Sheets
   */
  const loadIFSSData = async () => {
    try {
      console.log('\n📊 ===== [useStackedAreaData] CARGANDO =====')
      loading.value = true
      error.value = null

      const mapping = getMapping('ifssStackedArea')
      const sheetName = getSheetName('indicadores')
      
      console.log('📋 Mapping:', JSON.stringify(mapping, null, 2))
      console.log('📄 Sheet:', sheetName)

      const rawData = await fetchData('indicadores', sheetName)
      
      console.log(`✅ Datos recibidos: ${rawData.length} filas`)

      if (!rawData || rawData.length === 0) {
        throw new Error('No se obtuvieron datos')
      }

      const processed = processIFSData(rawData, mapping)
      
      chartData.value = processed.chartData
      years.value = processed.years
      positionsByYear.value = processed.positions

      console.log('✅ ===== CARGA COMPLETADA =====')
      console.log('📍 positionsByYear final:', positionsByYear.value)

    } catch (err) {
      console.error('❌ Error:', err)
      error.value = err.message
      
      // Fallback
      chartData.value = { 'IFS': [1.5, 1.4, 1.0, 0.7, 1.3] }
      years.value = ['2020', '2021', '2022', '2023', '2024']
      positionsByYear.value = {
        '2020': { 'IFS': 18 },
        '2021': { 'IFS': 16 },
        '2022': { 'IFS': 18 },
        '2023': { 'IFS': 18 },
        '2024': { 'IFS': 15 }
      }
      
    } finally {
      loading.value = false
    }
  }

  const hasData = computed(() => {
    return Object.keys(chartData.value).length > 0 && years.value.length > 0
  })

  const seriesCount = computed(() => Object.keys(chartData.value).length)
  const yearsCount = computed(() => years.value.length)
  const title = 'Análisis histórico del ranking de Indice de Finanzas Sostenibles (IFS)'

  return {
    chartData,
    years,
    loading,
    error,
    hasData,
    seriesCount,
    yearsCount,
    title,
    loadIFSSData,
    positionsByYear
  }
}

export default useStackedAreaData