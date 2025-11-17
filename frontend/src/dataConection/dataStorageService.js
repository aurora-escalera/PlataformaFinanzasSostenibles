// src/dataConection/dataStorageService.js

import { getCurrentConfig } from './storageConfig'
import { GoogleSheetsAdapter } from './googleSheetsAdapter'

let serviceInstance = null

export function getDataStorageService() {
  if (serviceInstance) {
    return serviceInstance
  }
  
  try {
    const config = getCurrentConfig()
    
    console.log('🔧 Inicializando dataStorageService')
    console.log('Provider:', config.provider)
    console.log('Config completo:', config)
    
    switch (config.provider) {
      case 'googlesheets':
        serviceInstance = new GoogleSheetsAdapter({
          apiKey: config.apiKey,
          sheetId: config.sheetId,
          sheets: config.sheets || null,  // ✅ Null si no existe
          files: config.files
        })
        console.log('✅ GoogleSheetsAdapter inicializado')
        break
      
      case 'onedrive':
      case 'sharepoint':
        throw new Error(`Provider ${config.provider} no implementado todavía`)
      
      default:
        throw new Error(`Provider desconocido: ${config.provider}`)
    }
    
    return serviceInstance
    
  } catch (error) {
    console.error('❌ Error inicializando dataStorageService:', error)
    throw error
  }
}

export function resetDataStorageService() {
  console.log('🔄 Reseteando dataStorageService')
  serviceInstance = null
}

export default {
  getDataStorageService,
  resetDataStorageService
}