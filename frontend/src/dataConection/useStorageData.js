// src/dataConection/useStorageData.js
// ✅ ACTUALIZADO con CACHÉ para evitar rate limiting de Google Sheets API
import { getCurrentConfig, getSheetIdForFile, getSheetName } from './storageConfig'

// ============================================
// ✅ SISTEMA DE CACHÉ GLOBAL
// ============================================
const dataCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en milisegundos
const pendingRequests = new Map() // Para evitar llamadas duplicadas simultáneas

/**
 * Generar clave única para el caché
 */
const getCacheKey = (fileKey, sheetName) => {
  return `${fileKey}__${sheetName}`
}

/**
 * Verificar si el caché es válido
 */
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false
  const now = Date.now()
  return (now - cacheEntry.timestamp) < CACHE_DURATION
}

/**
 * Limpiar caché expirado
 */
const cleanExpiredCache = () => {
  const now = Date.now()
  for (const [key, entry] of dataCache.entries()) {
    if ((now - entry.timestamp) >= CACHE_DURATION) {
      dataCache.delete(key)
      console.log(`🗑️ [Cache] Limpiando entrada expirada: ${key}`)
    }
  }
}

// Limpiar caché cada 2 minutos
setInterval(cleanExpiredCache, 2 * 60 * 1000)

export function useStorageData() {
  const config = getCurrentConfig()
  
  /**
   * ✅ Obtener los nombres de todas las hojas de un Google Sheet
   * ✅ CON CACHÉ para evitar rate limiting
   * @param {string} fileKey - La clave del archivo (ej: 'incendiosForestales')
   * @returns {Promise<string[]>} - Array con los nombres de las hojas
   */
  const fetchSheetNames = async (fileKey) => {
    try {
      const sheetId = getSheetIdForFile(fileKey)
      const apiKey = config.apiKey
      
      if (!apiKey || !sheetId) {
        throw new Error('Falta configuración de API Key o Sheet ID')
      }
      
      // ✅ CACHÉ: Usar clave especial para nombres de hojas
      const cacheKey = `__sheetNames__${sheetId}`
      const cachedEntry = dataCache.get(cacheKey)
      
      if (isCacheValid(cachedEntry)) {
        console.log(`✅ [Cache HIT] Usando nombres de hojas en caché para: ${fileKey}`)
        return cachedEntry.data
      }
      
      // Verificar solicitud pendiente
      if (pendingRequests.has(cacheKey)) {
        console.log(`⏳ [Pending] Esperando solicitud de nombres existente para: ${fileKey}`)
        return await pendingRequests.get(cacheKey)
      }
      
      console.log(`📋 [useStorageData] Obteniendo nombres de hojas para: ${fileKey}`)
      console.log(`  - Sheet ID: ${sheetId}`)
      
      const fetchPromise = (async () => {
        // Usar la API de Google Sheets para obtener metadatos del spreadsheet
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Error HTTP ${response.status}: ${errorText}`)
        }
        
        const data = await response.json()
        
        // Extraer los nombres de las hojas
        const sheetNames = data.sheets.map(sheet => sheet.properties.title)
        
        console.log(`✅ [useStorageData] Hojas encontradas:`, sheetNames)
        
        // Guardar en caché
        dataCache.set(cacheKey, {
          data: sheetNames,
          timestamp: Date.now()
        })
        console.log(`💾 [Cache SAVE] Nombres de hojas guardados: ${cacheKey}`)
        
        return sheetNames
      })()
      
      pendingRequests.set(cacheKey, fetchPromise)
      
      try {
        return await fetchPromise
      } finally {
        pendingRequests.delete(cacheKey)
      }
      
    } catch (err) {
      console.error('❌ [useStorageData] Error obteniendo nombres de hojas:', err)
      throw err
    }
  }
  
  /**
   * Obtener datos de una hoja específica de Google Sheets
   * ✅ CON CACHÉ para evitar rate limiting
   */
  const fetchData = async (fileKey, sheetName = null) => {
    try {
      const actualSheetName = sheetName || getSheetName(fileKey)
      const sheetId = getSheetIdForFile(fileKey)
      const apiKey = config.apiKey
      
      if (!apiKey || !sheetId) {
        throw new Error('Falta configuración de API Key o Sheet ID')
      }
      
      // ✅ PASO 1: Verificar caché
      const cacheKey = getCacheKey(fileKey, actualSheetName)
      const cachedEntry = dataCache.get(cacheKey)
      
      if (isCacheValid(cachedEntry)) {
        console.log(`✅ [Cache HIT] Usando datos en caché para: ${fileKey} - ${actualSheetName}`)
        return cachedEntry.data
      }
      
      // ✅ PASO 2: Verificar si hay una solicitud pendiente para evitar duplicados
      if (pendingRequests.has(cacheKey)) {
        console.log(`⏳ [Pending] Esperando solicitud existente para: ${fileKey}`)
        return await pendingRequests.get(cacheKey)
      }
      
      console.log(`📊 [useStorageData] Obteniendo datos de: ${fileKey}`)
      console.log(`  - Hoja: ${actualSheetName}`)
      console.log(`  - Sheet ID: ${sheetId}`)
      
      // ✅ FIX: Agregar comillas simples si el nombre de hoja es un número puro (ej: "2024")
      let formattedSheetName = actualSheetName
      if (/^\d+$/.test(String(actualSheetName).trim())) {
        formattedSheetName = `'${actualSheetName}'`
        console.log(`  - Nombre formateado con comillas: ${formattedSheetName}`)
      }
      
      const range = `${formattedSheetName}!A:ZZ`
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`
      
      // ✅ PASO 3: Crear promesa y registrarla como pendiente
      const fetchPromise = (async () => {
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Error HTTP ${response.status}: ${errorText}`)
        }
        
        const data = await response.json()
        const rows = data.values || []
        
        if (rows.length === 0) {
          console.warn('⚠️ [useStorageData] No se encontraron datos')
          return []
        }
        
        // Convertir a objetos con headers
        const headers = rows[0]
        const dataRows = rows.slice(1).map(row => {
          const obj = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] || null
          })
          return obj
        })
        
        console.log(`✅ [useStorageData] Datos obtenidos: ${dataRows.length} filas`)
        
        // ✅ PASO 4: Guardar en caché
        dataCache.set(cacheKey, {
          data: dataRows,
          timestamp: Date.now()
        })
        console.log(`💾 [Cache SAVE] Datos guardados en caché: ${cacheKey}`)
        
        return dataRows
      })()
      
      // Registrar como solicitud pendiente
      pendingRequests.set(cacheKey, fetchPromise)
      
      try {
        const result = await fetchPromise
        return result
      } finally {
        // Limpiar solicitud pendiente
        pendingRequests.delete(cacheKey)
      }
      
    } catch (err) {
      console.error('❌ [useStorageData] Error obteniendo datos:', err)
      throw err
    }
  }
  
  /**
   * ✅ Parsear valor numérico (maneja formatos con puntos, comas, NA, ND)
   */
  const parseNumericValue = (value) => {
    if (typeof value === 'number') return value
    if (!value || value === '' || value === null || value === undefined) return 0
    
    let stringValue = String(value).trim().toUpperCase()
    
    // Manejar valores especiales
    if (stringValue === 'NA' || stringValue === 'ND' || stringValue === 'N/A') {
      return 0
    }
    
    // Limpiar formato
    stringValue = stringValue.replace(/\s/g, '')
    
    // Detectar formato europeo (coma como decimal)
    const hasCommaDecimal = stringValue.includes(',') && !stringValue.includes('.')
    
    if (hasCommaDecimal) {
      stringValue = stringValue.replace(/\./g, '')
      stringValue = stringValue.replace(/,/g, '.')
    } else {
      // Si tiene puntos como separadores de miles
      const dotCount = (stringValue.match(/\./g) || []).length
      if (dotCount > 1) {
        stringValue = stringValue.replace(/\./g, '')
      }
    }
    
    const result = parseFloat(stringValue)
    return isNaN(result) ? 0 : result
  }
  
  /**
   * ✅ NUEVO: Transformar datos para gráfico de barras (HistoricBarChart)
   * @param {Array} rawData - Datos crudos del sheet
   * @param {Object} mapping - Configuración de mapping
   * @returns {Array} - Datos formateados para HistoricBarChart
   */
  const transformToBarChartData = (rawData, mapping) => {
    try {
      console.log('📊 [transformToBarChartData] Transformando datos...')
      console.log('  - Mapping:', mapping)
      
      if (!rawData || rawData.length === 0) {
        console.warn('⚠️ [transformToBarChartData] No hay datos para transformar')
        return []
      }
      
      const yearColumn = mapping.yearColumn || 'Año'
      const variableColumns = mapping.variableColumns || []
      
      // Agrupar datos por año
      const dataByYear = {}
      
      rawData.forEach(row => {
        const year = row[yearColumn]
        if (!year) return
        
        if (!dataByYear[year]) {
          dataByYear[year] = { year }
        }
        
        variableColumns.forEach(variable => {
          const rawValue = row[variable.column]
          const numericValue = parseNumericValue(rawValue)
          
          if (!dataByYear[year][variable.key]) {
            dataByYear[year][variable.key] = 0
          }
          dataByYear[year][variable.key] += numericValue
        })
      })
      
      // Convertir a array ordenado por año
      // ✅ FIX: Usar 'variables' en lugar de 'segments' para compatibilidad con HistoricBarChart
      const result = Object.values(dataByYear)
        .sort((a, b) => parseInt(a.year) - parseInt(b.year))
        .map(yearData => {
          const variables = variableColumns.map(variable => ({
            key: variable.key,
            label: variable.label,
            value: yearData[variable.key] || 0,
            color: variable.color
          }))
          
          return {
            year: yearData.year,
            variables,  // ✅ Cambiado de 'segments' a 'variables'
            total: variables.reduce((sum, v) => sum + v.value, 0)
          }
        })
      
      console.log(`✅ [transformToBarChartData] Datos transformados: ${result.length} años`)
      console.log(`  - Primer año:`, result[0])
      return result
      
    } catch (err) {
      console.error('❌ [transformToBarChartData] Error:', err)
      return []
    }
  }
  
  /**
   * ✅ NUEVO: Transformar datos para gráfico lineal (LinearChart)
   * @param {Array} rawData - Datos crudos del sheet
   * @param {Object} mapping - Configuración de mapping
   * @returns {Object} - { data: [...], labels: [...] }
   */
  const transformToLinearChartData = (rawData, mapping) => {
    try {
      console.log('📈 [transformToLinearChartData] Transformando datos...')
      console.log('  - Mapping:', mapping)
      
      if (!rawData || rawData.length === 0) {
        console.warn('⚠️ [transformToLinearChartData] No hay datos para transformar')
        return { data: [], labels: [] }
      }
      
      const yearColumn = mapping.yearColumn || 'Año'
      const variableColumns = mapping.variableColumns || []
      
      // Obtener años únicos ordenados
      const years = [...new Set(rawData.map(row => row[yearColumn]))]
        .filter(year => year)
        .sort((a, b) => parseInt(a) - parseInt(b))
      
      // Crear series de datos para cada variable
      const seriesData = variableColumns.map(variable => {
        const data = years.map(year => {
          const yearRows = rawData.filter(row => row[yearColumn] === year)
          
          // Sumar valores para ese año
          const total = yearRows.reduce((sum, row) => {
            return sum + parseNumericValue(row[variable.column])
          }, 0)
          
          return total
        })
        
        return {
          key: variable.key,
          label: variable.label,
          data,
          color: variable.color || '#0F3759'
        }
      })
      
      console.log(`✅ [transformToLinearChartData] Datos transformados: ${years.length} años, ${seriesData.length} series`)
      
      return {
        data: seriesData,
        labels: years
      }
      
    } catch (err) {
      console.error('❌ [transformToLinearChartData] Error:', err)
      return { data: [], labels: [] }
    }
  }
  
  /**
   * ✅ NUEVO: Transformar datos para gráfico de área apilada (StackedArea)
   * @param {Array} rawData - Datos crudos del sheet
   * @param {Object} mapping - Configuración de mapping
   * @returns {Object} - { 'Variable 1': [...], 'Variable 2': [...] }
   */
  const transformToStackedAreaData = (rawData, mapping) => {
    try {
      console.log('📊 [transformToStackedAreaData] Transformando datos...')
      console.log('  - Mapping:', mapping)
      
      if (!rawData || rawData.length === 0) {
        console.warn('⚠️ [transformToStackedAreaData] No hay datos para transformar')
        return {}
      }
      
      const yearColumn = mapping.yearColumn || 'Año'
      const variableColumns = mapping.variableColumns || []
      
      // Obtener años únicos ordenados
      const years = [...new Set(rawData.map(row => row[yearColumn]))]
        .filter(year => year)
        .sort((a, b) => parseInt(a) - parseInt(b))
      
      // Crear objeto con datos por variable
      const result = {}
      
      variableColumns.forEach(variable => {
        result[variable.label] = years.map(year => {
          const yearRows = rawData.filter(row => row[yearColumn] === year)
          
          // Sumar valores para ese año
          const total = yearRows.reduce((sum, row) => {
            return sum + parseNumericValue(row[variable.column])
          }, 0)
          
          return total
        })
      })
      
      console.log(`✅ [transformToStackedAreaData] Datos transformados:`, Object.keys(result))
      
      return result
      
    } catch (err) {
      console.error('❌ [transformToStackedAreaData] Error:', err)
      return {}
    }
  }
  
  /**
   * Transformar datos según un mapping específico (genérico)
   */
  const transform = (rawData, mapping, chartType = 'horizontal', options = {}) => {
    try {
      console.log(`🔄 [useStorageData] Transformando datos para tipo: ${chartType}`)
      console.log(`  - Mapping:`, mapping)
      console.log(`  - Options:`, options)
      
      if (chartType === 'horizontal') {
        return transformForHorizontalChart(rawData, mapping, options)
      }
      
      if (chartType === 'bar') {
        return transformToBarChartData(rawData, mapping)
      }
      
      if (chartType === 'linear') {
        return transformToLinearChartData(rawData, mapping)
      }
      
      if (chartType === 'stackedArea') {
        return transformToStackedAreaData(rawData, mapping)
      }
      
      // Por defecto retornar datos sin transformar
      return rawData
      
    } catch (err) {
      console.error('❌ [useStorageData] Error transformando datos:', err)
      throw err
    }
  }
  
  /**
   * Transformar datos para gráfico horizontal
   */
  const transformForHorizontalChart = (rawData, mapping, options = {}) => {
    const { selectedEntity } = options
    
    if (!selectedEntity) {
      console.warn('⚠️ [useStorageData] No hay entidad seleccionada')
      return []
    }
    
    // Buscar la fila de la entidad seleccionada
    const categoryColumn = mapping.categoryColumn || mapping.stateColumn
    const entityRow = rawData.find(row => row[categoryColumn] === selectedEntity)
    
    if (!entityRow) {
      console.warn(`⚠️ [useStorageData] No se encontró entidad: ${selectedEntity}`)
      return []
    }
    
    console.log(`✅ [useStorageData] Fila encontrada para ${selectedEntity}:`, entityRow)
    
    // Transformar cada variable según el mapping
    const variables = mapping.variables || mapping.variableColumns
    
    return variables.map(variable => {
      const value = entityRow[variable.column]
      const numericValue = parseNumericValue(value)
      
      return {
        key: variable.key,
        label: variable.label,
        value: numericValue,
        color: variable.color,
        colorClass: variable.colorClass || 'default',
        active: true // Por defecto todas activas
      }
    })
  }
  
  return {
    fetchData,
    fetchSheetNames,
    transform,
    // ✅ FUNCIONES DE TRANSFORMACIÓN
    transformToBarChartData,
    transformToLinearChartData,
    transformToStackedAreaData,
    parseNumericValue,
    // ✅ FUNCIONES DE CACHÉ
    clearCache: () => {
      dataCache.clear()
      console.log('🗑️ [Cache] Caché limpiado completamente')
    },
    getCacheStats: () => ({
      size: dataCache.size,
      keys: Array.from(dataCache.keys())
    })
  }
}