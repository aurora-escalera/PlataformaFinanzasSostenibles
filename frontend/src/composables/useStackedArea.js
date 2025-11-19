// src/composables/useStackedArea.js
// ✅ Composable para cargar datos de StackedArea del IFS desde Google Sheets
// ✅ Procesamiento manual de datos siguiendo patrón de useLinearChart
// ✅ CORREGIDO: Ahora carga del sheet principal (VITE_GOOGLE_SHEET_ID)

import { ref, computed } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'

export function useStackedAreaData() {
  const chartData = ref({})
  const years = ref([])
  const loading = ref(false)
  const error = ref(null)

  const { fetchData } = useStorageData()

  /**
   * Procesa los datos crudos de Google Sheets para el formato StackedArea
   * @param {Array} rawData - Datos crudos del sheet
   * @param {Object} mapping - Configuración del mapping
   * @returns {Object} Datos procesados { chartData, years }
   */
  const processIFSData = (rawData, mapping) => {
    console.log('🔧 [processIFSData] Iniciando procesamiento manual...')
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No hay datos para procesar')
    }

    const yearColumn = mapping.yearColumn // 'Año'
    const ifsConfig = mapping.variableColumns[0] // { key: 'IFS', column: 'IFS', ... }
    const ifsColumnName = ifsConfig.column // 'IFS'
    const ifsLabel = ifsConfig.label // 'IFS'

    console.log(`📋 Buscando columna de años: "${yearColumn}"`)
    console.log(`📋 Buscando columna de IFS: "${ifsColumnName}"`)

    const extractedYears = []
    const ifsValues = []

    // ✅ NUEVO: Mostrar TODAS las claves disponibles en la primera fila
    if (rawData.length > 0) {
      console.log('🔍 [DEBUG] Claves disponibles en primera fila:', Object.keys(rawData[0]))
      console.log('🔍 [DEBUG] Primera fila completa:', JSON.stringify(rawData[0], null, 2))
    }

    // Procesar cada fila
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i]
      
      // ✅ NUEVO: Mostrar contenido completo de las primeras 3 filas
      if (i < 3) {
        console.log(`🔍 [DEBUG] Fila ${i} completa:`, JSON.stringify(row, null, 2))
        console.log(`🔍 [DEBUG] Fila ${i} - Claves:`, Object.keys(row))
      }
      
      // Extraer año
      const year = row[yearColumn]
      
      // ✅ NUEVO: Log detallado de qué está buscando y qué encuentra
      console.log(`🔍 [DEBUG] Fila ${i} - Buscando key "${yearColumn}", encontrado:`, year, `(tipo: ${typeof year})`)
      
      if (!year) {
        console.warn(`⚠️ Fila ${i} no tiene año, saltando...`)
        continue
      }

      // Extraer valor IFS
      const ifsValue = row[ifsColumnName]
      
      console.log(`📊 Fila ${i}: Año=${year}, IFS=${ifsValue}`)

      if (ifsValue !== undefined && ifsValue !== null && ifsValue !== '') {
        const parsedValue = parseFloat(ifsValue)
        
        if (!isNaN(parsedValue)) {
          extractedYears.push(year.toString())
          ifsValues.push(parsedValue)
        } else {
          console.warn(`⚠️ Valor IFS inválido en año ${year}: "${ifsValue}"`)
        }
      } else {
        console.warn(`⚠️ Año ${year} no tiene valor IFS`)
      }
    }

    console.log('✅ Procesamiento completado:')
    console.log('📅 Años extraídos:', extractedYears)
    console.log('📊 Valores IFS:', ifsValues)

    // Validar que tenemos datos
    if (extractedYears.length === 0 || ifsValues.length === 0) {
      throw new Error('No se encontraron datos válidos en las columnas especificadas')
    }

    // Crear estructura para el gráfico
    const processedData = {
      [ifsLabel]: ifsValues
    }

    return {
      chartData: processedData,
      years: extractedYears
    }
  }

  /**
   * Cargar datos del IFS StackedArea desde Google Sheets
   * Usa el mapping 'ifssStackedArea' y la columna 'IFS'
   * ✅ CORREGIDO: Ahora carga del sheet principal (VITE_GOOGLE_SHEET_ID) usando 'indicadores'
   */
  const loadIFSSData = async () => {
    try {
      console.log('\n📊 ===== [useStackedAreaData] INICIANDO CARGA =====')
      loading.value = true
      error.value = null

      // ✅ CORREGIDO: Usar 'indicadores' para cargar del sheet principal
      const mapping = getMapping('ifssStackedArea')
      const sheetName = getSheetName('indicadores')
      
      console.log('📋 Mapping ifssStackedArea:', JSON.stringify(mapping, null, 2))
      console.log('📄 Nombre de hoja (sheet principal):', sheetName)
      console.log('🔑 Sheet ID que se usará: VITE_GOOGLE_SHEET_ID (principal)')

      // Obtener datos crudos de Google Sheets
      console.log('📥 Solicitando datos desde sheet principal...')
      const rawData = await fetchData('indicadores', sheetName)
      
      console.log(`✅ Datos crudos recibidos: ${rawData.length} filas`)
      
      if (rawData.length > 0) {
        console.log('📊 Encabezados disponibles:', Object.keys(rawData[0]))
        console.log('📊 Primera fila completa:', rawData[0])
        console.log('📊 Segunda fila completa:', rawData[1])
      }

      if (!rawData || rawData.length === 0) {
        throw new Error('No se obtuvieron datos de Google Sheets')
      }

      // Procesar datos manualmente
      const processed = processIFSData(rawData, mapping)
      
      console.log('✅ Datos procesados exitosamente')
      console.log('📊 Chart Data final:', processed.chartData)
      console.log('📅 Years final:', processed.years)

      // Actualizar refs
      chartData.value = processed.chartData
      years.value = processed.years

      console.log('✅ ===== CARGA COMPLETADA EXITOSAMENTE =====\n')

    } catch (err) {
      console.error('❌ ===== ERROR EN CARGA =====')
      console.error('Error completo:', err)
      console.error('Stack:', err.stack)
      error.value = err.message
      
      // Datos de fallback en caso de error
      console.warn('⚠️ Usando datos de fallback para IFS')
      chartData.value = {
        'IFS': [45.2, 48.7, 52.1, 55.8, 59.3]
      }
      years.value = ['2020', '2021', '2022', '2023', '2024']
      
    } finally {
      loading.value = false
    }
  }

  /**
   * Verificar si hay datos cargados
   */
  const hasData = computed(() => {
    return Object.keys(chartData.value).length > 0 && years.value.length > 0
  })

  /**
   * Obtener el número de series de datos
   */
  const seriesCount = computed(() => {
    return Object.keys(chartData.value).length
  })

  /**
   * Obtener el número de años
   */
  const yearsCount = computed(() => {
    return years.value.length
  })

  /**
   * Obtener el título del gráfico
   */
  const title = 'Evolución del IFS'

  return {
    chartData,
    years,
    loading,
    error,
    hasData,
    seriesCount,
    yearsCount,
    title,
    loadIFSSData
  }
}

export default useStackedAreaData