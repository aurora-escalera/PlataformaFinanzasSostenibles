// src/dataConection/storageConfig.js

console.log('API Key:', import.meta.env.VITE_GOOGLE_SHEETS_API_KEY)
console.log('Sheet ID Principal:', import.meta.env.VITE_GOOGLE_SHEET_ID)
console.log('Sheet ID Cuantitativos:', import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS)
console.log('Provider:', import.meta.env.VITE_STORAGE_PROVIDER)

export const storageConfig = {
  provider: import.meta.env.VITE_STORAGE_PROVIDER || 'googlesheets',
  
  googlesheets: {
    apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
    
    // ✅ NUEVO: Soporte para múltiples sheets
    sheets: {
      // Sheet principal (tu sheet original)
      principal: {
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
        files: {
          datosFinancieros: 'Hoja 1',
          presupuesto: 'Hoja 1',
          indicadores: 'Indicadores',
          gastos: 'Gastos',
          estados: 'Estados'
        }
      },
      // Sheet de datos cuantitativos (tu sheet nuevo)
      cuantitativos: {
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS,
        files: {
          datosCuantitativos: 'Datos_Cuantitativos'
        }
      }
    },
    
    // ⚠️ BACKWARD COMPATIBILITY: Mantener la forma antigua
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
    files: {
      datosFinancieros: 'Hoja 1',
      presupuesto: 'Hoja 1',
      indicadores: 'Indicadores',
      gastos: 'Gastos',
      estados: 'Estados',
      datosCuantitativos: 'Datos_Cuantitativos'
    }
  },
  
  mappings: {
    rankingCuantitativo: {
      stateColumn: 'Entidad Federativa',
      variableColumns: [
        {
          key: 'IFSS',
          column: 'IFSS',
          label: 'IFSS',
          color: '#0F3759',
          colorClass: 'blue',
          order: 1
        }
      ]
    },
    
    iicBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'iic_c',
          column: 'IIC_C',
          label: 'IIC_C',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'iic_h',
          column: 'IIC_H',
          label: 'IIC_H',
          color: '#3B5A70',
          order: 2
        },
        {
          key: 'iic_m',
          column: 'IIC_M',
          label: 'IIC_M',
          color: '#6B8FA3',
          order: 3
        }
      ]
    },
    
    iicStackedArea: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'IIC Total',
          column: 'IIC ($)',
          label: 'IIC Total',
          color: '#3B5A70',
        },
        {
          key: 'Ingreso Total',
          column: 'IT ($)',
          label: 'Ingreso Total',
          color: '#0F3759'
        }
      ]
    },
    
    presupuestoBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'IS',
          column: 'IS($)', 
          label: 'IS',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    
    picBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'PIC',
          column: 'PIC ($)', 
          label: 'PIC',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    
    psBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'PS',
          column: 'PS ($)', 
          label: 'PS',
          color: '#6B8FA3',
          order: 1
        }
      ]
    },
    
    isLinearChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'IS_Total',
          column: 'IS($)',
          label: 'IS Total'
        },
        {
          key: 'Financiemiento_Total',
          column: 'FT ($)',
          label: 'Financiamiento Total'
        }
      ]
    },
    
    pspicLinearChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'GT',
          column: 'GT ($)',
          label: 'Gasto Total'
        },
        {
          key: 'PS',
          column: 'PS ($)',
          label: 'Presupuestos Sostenibles'
        },
        {
          key: 'PIC',
          column: 'PIC ($)',
          label: 'Presupuestos Intensivos en Carbono'
        }
      ]
    },
    
    presupuestoDetalleBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'asignado',
          column: 'Presupuesto Asignado',
          label: 'Asignado',
          color: '#4CAF50',
          order: 1
        },
        {
          key: 'ejecutado',
          column: 'Presupuesto Ejecutado',
          label: 'Ejecutado',
          color: '#2196F3',
          order: 2
        },
        {
          key: 'disponible',
          column: 'Presupuesto Disponible',
          label: 'Disponible',
          color: '#FF9800',
          order: 3
        }
      ]
    },
    
    roiLinearChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'roi',
          column: 'ROI (%)',
          label: 'Retorno de Inversión'
        },
        {
          key: 'benchmark',
          column: 'Benchmark Industria (%)',
          label: 'Benchmark'
        }
      ]
    },
    
    gastosStackedArea: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'personal',
          column: 'Gastos Personal',
          label: 'Personal'
        },
        {
          key: 'operacion',
          column: 'Gastos Operación',
          label: 'Operación'
        },
        {
          key: 'inversion',
          column: 'Gastos Inversión',
          label: 'Inversión'
        },
        {
          key: 'otros',
          column: 'Otros Gastos',
          label: 'Otros'
        }
      ]
    },
    
    estadosBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'cdmx',
          column: 'Ciudad de México',
          label: 'CDMX',
          color: '#FF5722',
          order: 1
        },
        {
          key: 'jalisco',
          column: 'Jalisco',
          label: 'Jalisco',
          color: '#00BCD4',
          order: 2
        },
        {
          key: 'nuevoLeon',
          column: 'Nuevo León',
          label: 'Nuevo León',
          color: '#8BC34A',
          order: 3
        }
      ]
    }
  },
  
  variablesConfig: {
    federal: { label: 'Federal', color: '#0F3759', order: 1 },
    estatal: { label: 'Estatal', color: '#3B5A70', order: 2 },
    municipal: { label: 'Municipal', color: '#6B8FA3', order: 3 },
    asignado: { label: 'Asignado', color: '#4CAF50', order: 1 },
    ejecutado: { label: 'Ejecutado', color: '#2196F3', order: 2 },
    disponible: { label: 'Disponible', color: '#FF9800', order: 3 },
    personal: { label: 'Personal', color: '#E91E63', order: 1 },
    operacion: { label: 'Operación', color: '#9C27B0', order: 2 },
    inversion: { label: 'Inversión', color: '#3F51B5', order: 3 },
    otros: { label: 'Otros', color: '#607D8B', order: 4 }
  }
}

export function getCurrentConfig() {
  const provider = storageConfig.provider
  if (!provider) throw new Error('Provider no configurado en storageConfig.js')
  const providerConfig = storageConfig[provider]
  if (!providerConfig) throw new Error(`Configuración no encontrada para provider: ${provider}`)
  return {
    provider,
    ...providerConfig,
    mappings: storageConfig.mappings,
    variablesConfig: storageConfig.variablesConfig
  }
}

// ✅ NUEVA FUNCIÓN: Obtener Sheet ID específico según el archivo
export function getSheetIdForFile(fileKey) {
  const config = storageConfig.googlesheets
  
  // Si hay configuración de múltiples sheets
  if (config.sheets) {
    // Buscar en qué sheet está el archivo
    for (const [sheetKey, sheetConfig] of Object.entries(config.sheets)) {
      if (sheetConfig.files && sheetConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en sheet "${sheetKey}"`)
        return sheetConfig.sheetId
      }
    }
  }
  
  // Fallback: usar el sheet principal
  console.log(`📄 Usando sheet principal para "${fileKey}"`)
  return config.sheetId
}

export function getMapping(mappingName) {
  const mapping = storageConfig.mappings[mappingName]
  if (!mapping) throw new Error(`Mapeo no encontrado: ${mappingName}`)
  return mapping
}

export function getVariableConfig(variableKey) {
  return storageConfig.variablesConfig[variableKey] || null
}

export function getAllFileKeys() {
  const config = getCurrentConfig()
  return Object.keys(config.files)
}

export function getAllMappings() {
  return Object.keys(storageConfig.mappings)
}

export function validateConfig() {
  const provider = storageConfig.provider
  if (!provider) return { valid: false, error: 'Provider no configurado' }
  if (!['onedrive', 'sharepoint', 'googlesheets'].includes(provider)) {
    return { valid: false, error: `Provider inválido: ${provider}` }
  }
  const config = storageConfig[provider]
  if (!config) return { valid: false, error: `Configuración no encontrada para ${provider}` }
  if (provider === 'googlesheets') {
    if (!config.apiKey) {
      return { valid: false, error: 'Google Sheets: falta apiKey' }
    }
    if (!config.sheetId && !config.sheets) {
      return { valid: false, error: 'Google Sheets: falta sheetId o sheets' }
    }
  }
  return { valid: true }
}

export default storageConfig