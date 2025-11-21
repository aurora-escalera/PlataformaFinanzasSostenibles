// src/dataConection/useStorageData.js
import { getCurrentConfig, getSheetIdForFile, getSheetName } from './storageConfig'

export function useStorageData() {
  const config = getCurrentConfig()
  
  /**
   * ✅ NUEVA FUNCIÓN: Obtener los nombres de todas las hojas de un Google Sheet
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
      
      console.log(`📋 [useStorageData] Obteniendo nombres de hojas para: ${fileKey}`)
      console.log(`  - Sheet ID: ${sheetId}`)
      
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
      return sheetNames
      
    } catch (err) {
      console.error('❌ [useStorageData] Error obteniendo nombres de hojas:', err)
      throw err
    }
  }
  
  /**
   * Obtener datos de una hoja específica de Google Sheets
   */
  const fetchData = async (fileKey, sheetName = null) => {
    try {
      const actualSheetName = sheetName || getSheetName(fileKey)
      const sheetId = getSheetIdForFile(fileKey)
      const apiKey = config.apiKey
      
      if (!apiKey || !sheetId) {
        throw new Error('Falta configuración de API Key o Sheet ID')
      }
      
      console.log(`📊 [useStorageData] Obteniendo datos de: ${fileKey}`)
      console.log(`  - Hoja: ${actualSheetName}`)
      console.log(`  - Sheet ID: ${sheetId}`)
      
      const range = `${actualSheetName}!A:ZZ`
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`
      
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
      return dataRows
      
    } catch (err) {
      console.error('❌ [useStorageData] Error obteniendo datos:', err)
      throw err
    }
  }
  
  /**
   * Transformar datos según un mapping específico
   */
  const transform = (rawData, mapping, chartType = 'horizontal', options = {}) => {
    try {
      console.log(`🔄 [useStorageData] Transformando datos para tipo: ${chartType}`)
      console.log(`  - Mapping:`, mapping)
      console.log(`  - Options:`, options)
      
      if (chartType === 'horizontal') {
        return transformForHorizontalChart(rawData, mapping, options)
      }
      
      // Otros tipos de transformación...
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
      const numericValue = parseFloat(value) || 0
      
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
    fetchSheetNames, // ✅ NUEVA FUNCIÓN EXPORTADA
    transform
  }
}