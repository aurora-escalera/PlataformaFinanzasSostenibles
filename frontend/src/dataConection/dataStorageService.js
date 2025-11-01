// src/dataConection/dataStorageService.js

import { GoogleSheetsAdapter } from './googleSheetsAdapter'
import { getCurrentConfig } from './storageConfig'

export class DataStorageService {
  constructor() {
    this.adapter = null
    this.config = null
    this.authPromise = null
    this.init()
  }
  
  init() {
    this.config = getCurrentConfig()
    
    console.log(`📁 Inicializando DataStorageService con provider: ${this.config.provider}`)
    
    if (this.config.provider === 'googlesheets') {
      this.adapter = new GoogleSheetsAdapter(this.config)
      console.log('✅ GoogleSheetsAdapter inicializado')
    } else {
      throw new Error(`Provider no soportado: ${this.config.provider}`)
    }
  }
  
  reinit() {
    this.adapter = null
    this.config = null
    this.authPromise = null
    this.init()
  }
  
  async authenticate() {
    if (this.authPromise) {
      console.log('⏳ Esperando autenticación existente...')
      return await this.authPromise
    }
    
    this.authPromise = (async () => {
      try {
        console.log('🔐 Iniciando autenticación...')
        const result = await this.adapter.authenticate()
        console.log('✅ Autenticación exitosa')
        return result
      } catch (error) {
        console.error('❌ Error en autenticación:', error)
        throw error
      } finally {
        setTimeout(() => {
          this.authPromise = null
        }, 2000)
      }
    })()
    
    return await this.authPromise
  }
  
  async getExcelData(fileKey, sheetName) {
    try {
      const fileName = this.config.files?.[fileKey]
      
      if (!fileName) {
        throw new Error(`Archivo no configurado: ${fileKey}. Verifica storageConfig.js`)
      }
      
      console.log(`📊 Obteniendo datos: ${fileName} / ${sheetName}`)
      
      const data = await this.adapter.getExcelData(fileName, sheetName)
      
      console.log(`✅ Datos obtenidos: ${data.length} filas`)
      return data
      
    } catch (error) {
      console.error('❌ Error obteniendo datos:', error)
      throw error
    }
  }
  
  async getFiles(folderPath) {
    try {
      return []
    } catch (error) {
      console.error('Error obteniendo archivos:', error)
      throw error
    }
  }
  
  async getUserInfo() {
    return null
  }
  
  isAuthenticated() {
    return this.adapter?.isAuthenticated?.() || false
  }
  
  async logout() {
    try {
      const result = await this.adapter.logout()
      this.authPromise = null
      console.log('✅ Sesión cerrada')
      return result
    } catch (error) {
      console.error('Error cerrando sesión:', error)
      throw error
    }
  }
  
  getProvider() {
    return this.config.provider
  }
  
  getConfig() {
    return this.config
  }
}

let instance = null

export function getDataStorageService() {
  if (!instance) {
    instance = new DataStorageService()
  }
  return instance
}

export function resetDataStorageService() {
  instance = null
}

export default DataStorageService