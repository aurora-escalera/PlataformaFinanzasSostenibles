// src/dataConection/googleSheetsAdapter.js

import axios from 'axios'

export class GoogleSheetsAdapter {
  constructor(config) {
    this.config = config
    this.apiKey = config.apiKey
    this.sheetId = config.sheetId
  }
  
  async authenticate() {
    // No requiere autenticación (sheet público)
    return true
  }
  
  async getExcelSheet(fileName, sheetName) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${sheetName}?key=${this.apiKey}`
      
      const response = await axios.get(url)
      
      return {
        values: response.data.values
      }
    } catch (error) {
      console.error('Error leyendo Google Sheet:', error)
      throw new Error(`Error leyendo sheet: ${error.message}`)
    }
  }
  
  async getExcelData(fileName, sheetName) {
    try {
      const rangeData = await this.getExcelSheet(fileName, sheetName)
      
      const rows = rangeData.values
      if (!rows || rows.length === 0) {
        console.warn('No hay datos en la hoja')
        return []
      }
      
      // Primera fila son los headers
      const headers = rows[0]
      
      // Resto son los datos
      const data = rows.slice(1).map(row => {
        const obj = {}
        headers.forEach((header, index) => {
          obj[header] = row[index]
        })
        return obj
      })
      
      return data
    } catch (error) {
      console.error('Error obteniendo datos de Google Sheet:', error)
      throw error
    }
  }
  
  isAuthenticated() {
    return true
  }
  
  async logout() {
    return true
  }
}

export default GoogleSheetsAdapter