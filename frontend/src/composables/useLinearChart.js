// src/composables/useLinearChart.js
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'

export function useLinearChart() {
  const rawData = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Lee un archivo Excel y extrae los datos para gráficas lineales
   * @param {File} file - Archivo Excel
   * @param {Object} config - Configuración de lectura
   * @returns {Promise<Object>} Datos procesados
   */
  const readExcelFile = async (file, config = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      })

      // Obtener la primera hoja o la especificada
      const sheetName = config.sheetName || workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // Convertir a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Usar arrays en lugar de objetos
        defval: null,
        blankrows: false
      })

      rawData.value = jsonData
      return jsonData
    } catch (err) {
      error.value = `Error al leer el archivo: ${err.message}`
      console.error('Error reading Excel:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Procesa los datos en formato para gráficas lineales
   * Asume que la primera fila son encabezados y la primera columna son años
   * 
   * Ejemplo de estructura esperada en Excel:
   * | Año  | IS Total | Financ. para desarrollo total |
   * | 2020 | 1234.5   | 5678.9                        |
   * | 2021 | 2345.6   | 6789.0                        |
   * 
   * @param {Array} data - Datos crudos del Excel
   * @param {Object} options - Opciones de procesamiento
   * @returns {Object} Datos formateados para el componente
   */
  const processLinearData = (data, options = {}) => {
    if (!data || data.length < 2) {
      return {
        years: [],
        series: [],
        variables: []
      }
    }

    const {
      yearColumn = 0,        // Índice de la columna de años
      startRow = 1,          // Fila donde empiezan los datos (después de encabezados)
      valueColumns = null    // Array de índices de columnas a incluir, null = todas
    } = options

    // Extraer encabezados (primera fila)
    const headers = data[0]
    
    // Extraer años
    const years = []
    const seriesData = {}

    // Inicializar series para cada variable (columna)
    const columnCount = headers.length
    const columnsToProcess = valueColumns || 
      Array.from({ length: columnCount }, (_, i) => i).filter(i => i !== yearColumn)

    columnsToProcess.forEach(colIndex => {
      const varName = headers[colIndex] || `Variable ${colIndex}`
      seriesData[varName] = []
    })

    // Procesar datos fila por fila
    for (let i = startRow; i < data.length; i++) {
      const row = data[i]
      const year = row[yearColumn]
      
      if (year) {
        years.push(year.toString())

        // Extraer valores para cada variable
        columnsToProcess.forEach(colIndex => {
          const varName = headers[colIndex] || `Variable ${colIndex}`
          const value = parseFloat(row[colIndex])
          seriesData[varName].push(isNaN(value) ? null : value)
        })
      }
    }

    // Convertir a formato de variables para el menú
    const variables = columnsToProcess.map(colIndex => ({
      name: headers[colIndex] || `Variable ${colIndex}`,
      index: colIndex,
      visible: true
    }))

    return {
      years,
      series: seriesData,
      variables,
      headers
    }
  }

  /**
   * Procesa datos en formato "año como columna"
   * 
   * Ejemplo de estructura esperada:
   * | Variable | 2020   | 2021   | 2022   | 2023   | 2024   |
   * | IS Total | 1234.5 | 2345.6 | 3456.7 | 4567.8 | 5678.9 |
   * | Financ.  | 5678.9 | 6789.0 | 7890.1 | 8901.2 | 9012.3 |
   * 
   * @param {Array} data - Datos crudos del Excel
   * @param {Object} options - Opciones de procesamiento
   * @returns {Object} Datos formateados
   */
  const processLinearDataTransposed = (data, options = {}) => {
    if (!data || data.length < 2) {
      return {
        years: [],
        series: {},
        variables: []
      }
    }

    const {
      variableColumn = 0,  // Índice de la columna con nombres de variables
      startColumn = 1,     // Columna donde empiezan los años
      startRow = 1         // Fila donde empiezan los datos
    } = options

    // Extraer años de la primera fila
    const years = data[0].slice(startColumn).map(year => year?.toString() || '')

    const seriesData = {}
    const variables = []

    // Procesar cada fila (cada variable)
    for (let i = startRow; i < data.length; i++) {
      const row = data[i]
      const varName = row[variableColumn]

      if (varName) {
        const values = row.slice(startColumn).map(val => {
          const parsed = parseFloat(val)
          return isNaN(parsed) ? null : parsed
        })

        seriesData[varName] = values
        variables.push({
          name: varName,
          index: i,
          visible: true
        })
      }
    }

    return {
      years,
      series: seriesData,
      variables
    }
  }

  /**
   * Formatea los datos para el componente LinearChart
   * @param {Object} processedData - Datos procesados
   * @param {Array} visibleVariables - Variables a mostrar
   * @returns {Object} Datos formateados para el componente
   */
  const formatForChart = (processedData, visibleVariables = null) => {
    if (!processedData || !processedData.series) {
      return {
        chartData: {},
        xLabels: []
      }
    }

    const { years, series, variables } = processedData

    // Si no se especifican variables visibles, usar todas
    const varsToShow = visibleVariables || variables.map(v => v.name)

    // Crear estructura de datos para el componente
    // Formato: { 'Variable 1': [val1, val2, ...], 'Variable 2': [...] }
    const chartData = {}
    
    varsToShow.forEach(varName => {
      if (series[varName]) {
        chartData[varName] = series[varName]
      }
    })

    return {
      chartData,
      xLabels: years
    }
  }

  /**
   * Lee y procesa un archivo Excel en un solo paso
   * @param {File} file - Archivo Excel
   * @param {Object} config - Configuración completa
   * @returns {Promise<Object>} Datos listos para el componente
   */
  const loadChartData = async (file, config = {}) => {
    const {
      sheetName = null,
      isTransposed = false,  // true si los años están en columnas
      ...processOptions
    } = config

    const rawData = await readExcelFile(file, { sheetName })
    
    if (!rawData) {
      return null
    }

    const processedData = isTransposed
      ? processLinearDataTransposed(rawData, processOptions)
      : processLinearData(rawData, processOptions)

    return processedData
  }

  /**
   * Utilidad para detectar automáticamente el formato
   * @param {Array} data - Datos crudos
   * @returns {String} 'standard' o 'transposed'
   */
  const detectFormat = (data) => {
    if (!data || data.length < 2) return 'standard'

    const firstRow = data[0]
    const secondRow = data[1]

    // Si la primera columna del segundo row es un número (año), es formato standard
    // Si es texto (nombre de variable), probablemente es transposed
    const firstValue = secondRow[0]
    
    if (typeof firstValue === 'number' || !isNaN(parseInt(firstValue))) {
      return 'standard'
    }
    
    return 'transposed'
  }

  // Computed properties
  const hasData = computed(() => rawData.value !== null && rawData.value.length > 0)

  return {
    // State
    rawData,
    isLoading,
    error,
    hasData,

    // Methods
    readExcelFile,
    processLinearData,
    processLinearDataTransposed,
    formatForChart,
    loadChartData,
    detectFormat
  }
}

/**
 * Composable específico para datos históricos con múltiples variables
 * @returns {Object} Funciones y estado para manejar datos históricos
 */
export function useHistoricalData() {
  const { loadChartData, formatForChart, ...rest } = useLinearChart()
  
  const chartData = ref(null)
  const selectedVariables = ref([])

  /**
   * Carga datos históricos de un archivo Excel
   * @param {File} file - Archivo Excel
   * @param {String} sheetName - Nombre de la hoja (opcional)
   */
  const loadHistoricalData = async (file, sheetName = null) => {
    const data = await loadChartData(file, {
      sheetName,
      isTransposed: false,  // Años en filas
      yearColumn: 0,
      startRow: 1
    })

    if (data) {
      chartData.value = data
      // Seleccionar todas las variables por defecto
      selectedVariables.value = data.variables.map(v => v.name)
    }

    return data
  }

  /**
   * Actualiza las variables visibles
   * @param {Array} variables - Array de nombres de variables
   */
  const updateSelectedVariables = (variables) => {
    selectedVariables.value = variables
  }

  /**
   * Obtiene los datos formateados para el gráfico actual
   */
  const currentChartData = computed(() => {
    if (!chartData.value) return { chartData: {}, xLabels: [] }
    return formatForChart(chartData.value, selectedVariables.value)
  })

  return {
    ...rest,
    chartData,
    selectedVariables,
    currentChartData,
    loadHistoricalData,
    updateSelectedVariables
  }
}