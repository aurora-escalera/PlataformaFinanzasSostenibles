// src/dataConection/googleSheetsAdapter.js

import axios from 'axios'

export class GoogleSheetsAdapter {
  constructor(config) {
    this.config = config
    this.apiKey = config.apiKey
    this.sheetId = config.sheetId // Sheet ID por defecto
    this.sheets = config.sheets // Configuración de múltiples sheets (opcional)
    this.files = config.files
    
    console.log('📊 GoogleSheetsAdapter configurado:')
    console.log('  - API Key:', this.apiKey ? '✅' : '❌')
    console.log('  - Sheet ID principal:', this.sheetId ? '✅' : '❌')
    console.log('  - Múltiples sheets:', this.sheets ? '✅' : '❌')
  }
  
  async authenticate() {
    return true
  }
  
  // ✅ Determina qué Sheet ID usar según el archivo
  getSheetIdForFile(fileName) {
    console.log(`🔍 Buscando Sheet ID para archivo: "${fileName}"`)
    
    // Si hay configuración de múltiples sheets, buscar el correcto
    if (this.sheets) {
      for (const [sheetKey, sheetConfig] of Object.entries(this.sheets)) {
        if (sheetConfig.files && sheetConfig.files[fileName]) {
          console.log(`✅ Archivo "${fileName}" → Sheet "${sheetKey}" (ID: ${sheetConfig.sheetId})`)
          return sheetConfig.sheetId
        }
      }
    }
    
    // Fallback: usar Sheet ID principal
    console.log(`📄 Usando Sheet ID principal para "${fileName}": ${this.sheetId}`)
    return this.sheetId
  }
  
  async getExcelSheet(fileName, sheetName) {
    try {
      // ✅ Obtener el Sheet ID correcto
      const sheetId = this.getSheetIdForFile(fileName)
      
      if (!sheetId) {
        throw new Error(`No se encontró Sheet ID para el archivo: ${fileName}`)
      }
      
      if (!this.apiKey) {
        throw new Error('API Key no configurada')
      }
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${this.apiKey}`
      
      console.log(`📊 Obteniendo: ${fileName} / ${sheetName}`)
      console.log(`🔗 Sheet ID: ${sheetId}`)
      console.log(`🔗 URL: ${url.substring(0, 100)}...`)
      
      const response = await axios.get(url)
      
      console.log('✅ Datos obtenidos exitosamente')
      
      return {
        values: response.data.values
      }
    } catch (error) {
      console.error('❌ Error leyendo Google Sheet:', {
        fileName,
        sheetName,
        status: error.response?.status,
        message: error.response?.data?.error?.message || error.message
      })
      throw new Error(`Error leyendo sheet: ${error.message}`)
    }
  }
  
  async getExcelData(fileName, sheetName) {
    try {
      const rangeData = await this.getExcelSheet(fileName, sheetName)
      
      const rows = rangeData.values
      if (!rows || rows.length === 0) {
        console.warn('⚠️ No hay datos en la hoja')
        return []
      }
      
      // Primera fila son los headers
      const headers = rows[0]
      console.log('📋 Headers encontrados:', headers)
      
      // Resto son los datos
      const data = rows.slice(1).map(row => {
        const obj = {}
        headers.forEach((header, index) => {
          obj[header] = row[index]
        })
        return obj
      })
      
      console.log(`✅ ${data.length} filas procesadas`)
      
      return data
    } catch (error) {
      console.error('❌ Error obteniendo datos de Google Sheet:', error)
      throw error
    }
  }
  
  isAuthenticated() {
    return true
  }
  
  async logout() {
    return true
  }
  
  getProvider() {
    return 'googlesheets'
  }
}

export default GoogleSheetsAdapter