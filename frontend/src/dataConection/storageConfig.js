// src/dataConection/storageConfig.js
// ✅ ACTUALIZADO con configuración para Ambientales - VERSIÓN CORREGIDA

console.log('API Key:', import.meta.env.VITE_GOOGLE_SHEETS_API_KEY)
console.log('Sheet ID Principal:', import.meta.env.VITE_GOOGLE_SHEET_ID)
console.log('Sheet ID Cuantitativos:', import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS)
console.log('Sheet ID Ambientales:', import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_INCENDIOS_FORESTALES)
console.log('Provider:', import.meta.env.VITE_STORAGE_PROVIDER)

// ✅ Variable global para el año activo
let currentActiveYear = '2024'

export const storageConfig = {
  provider: import.meta.env.VITE_STORAGE_PROVIDER || 'googlesheets',
  
  googlesheets: {
    apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
    
    sheets: {
      principal: {
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
        files: {
          datosFinancieros: 'Hoja 1',
          presupuesto: 'Hoja 1',
          indicadores: 'Hoja 1',
          gastos: 'Gastos',
          estados: 'Estados'
        }
      },
      cuantitativos: {
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS,
        files: {
          datosCuantitativos: '2024',
          chartsPresupuestos: '2024', 
          chartsIngresos: '2024'  
        }
      },
      ambientales: {
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_INCENDIOS_FORESTALES,
        files: {
          incendiosForestales: '2024'
        }
      }
    },
    
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
    files: {
      datosFinancieros: 'Hoja 1',
      presupuesto: 'Hoja 1',
      indicadores: 'Indicadores',
      gastos: 'Gastos',
      estados: 'Estados',
      datosCuantitativos: '2024',
      chartsPresupuestos: '2024',
      chartsIngresos: '2024',
      incendiosForestales: '2024'
    }
  },
  
  mappings: {
    // ✅ CORREGIDO: Mapping con nombres EXACTOS según los headers del Google Sheet
    incendiosForestales: {
      categoryColumn: 'Entidad Federativa',  // ← Primera columna con nombres de estados
      variables: [
        {
          key: 'arbolado',
          column: 'Arbolado Adulto',  // ← EXACTO del header
          label: 'Arbolado Adulto',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'renuevo',
          column: 'Renuevo',  // ← EXACTO del header
          label: 'Renuevo',
          color: '#3B5A70',
          order: 2
        },
        {
          key: 'arbustivo',
          column: 'Arbustivo',  // ← EXACTO del header
          label: 'Arbustivo',
          color: '#4E6D82',
          order: 3
        },
        {
          key: 'herbaceo',
          column: 'Herbaceo',  // ← EXACTO del header
          label: 'Herbaceo',
          color: '#D6D6D6',
          order: 4
        },
        {
          key: 'hojarasca',
          column: 'Hojarasca',  // ← EXACTO del header
          label: 'Hojarasca',
          color: '#A1A1A1',
          order: 5
        },
        {
          key: 'total',
          column: 'Total de Hectáreas',  // ← EXACTO del header (nota: con acento en "Héctareas")
          label: 'Total de Hectáreas',
          color: '#B0B0B0',
          order: 6
        }
      ]
    },

    // ... resto de mappings existentes
    chartsPresupuestos: {
      stateColumn: 'Entidad Federativa',
      variableColumns: [
        {
          key: 'presupuesto_total',
          column: 'PT ($)',
          label: 'Presupuesto Total',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'presupuesto_sostenible',
          column: 'PS ($)',
          label: 'Presupuesto Sostenible',
          colorClass: 'green',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'presupuesto_carbono',
          column: 'PIC ($)',
          label: 'Presupuestos Intensivos en Carbono',
          colorClass: 'red',
          color: '#DC143C',
          order: 3
        }
      ],
      donutSectorsPS: [
        {
          key: 'ps_desastres',
          column: 'PS_DN',
          label: 'Desastres Naturales',
          colorClass: 'dark-green',
          color: '#558b2f'
        },
        {
          key: 'ps_proteccion',
          column: 'PS_PA',
          label: 'Protección Ambiental',
          colorClass: 'green',
          color: '#7cb342'
        }
      ],
      donutSectorsPIC: [
        {
          key: 'pic_combustible',
          column: 'PIC_C',
          label: 'Combustible',
          colorClass: 'dark-red',
          color: '#b71c1c'
        },
        {
          key: 'pic_mineria',
          column: 'PIC_M',
          label: 'Minería',
          colorClass: 'red',
          color: '#DC143C'
        },
        {
          key: 'pic_transporte',
          column: 'PIC_T',
          label: 'Transporte',
          colorClass: 'light-red',
          color: '#ef5350'
        }
      ]
    },
    
    chartsIngresos: {
      stateColumn: 'Entidad Federativa',
      variableColumns: [
        {
          key: 'ingresos_total',
          column: 'IT ($)',
          label: 'Ingresos Total',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'ingresos_sostenibles',
          column: 'IS ($)',
          label: 'Ingresos Sostenibles',
          colorClass: 'green',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'ingresos_carbono',
          column: 'IIC ($)',
          label: 'Ingresos Intensivos en Carbono',
          colorClass: 'red',
          color: '#DC143C',
          order: 3
        }
      ],
      donutSectorsIS: [
        {
          key: 'is_ambiental',
          column: 'IS_A',
          label: 'Ambiental',
          colorClass: 'dark-green',
          color: '#558b2f'
        },
        {
          key: 'is_ecologico',
          column: 'IS_E',
          label: 'Ecológico',
          colorClass: 'green',
          color: '#7cb342'
        },
        {
          key: 'is_movilidad',
          column: 'IS_MS',
          label: 'Movilidad Sustentable',
          colorClass: 'light-green',
          color: '#9ccc65'
        }
      ],
      donutSectorsIIC: [
        {
          key: 'iic_hidrocarburos',
          column: 'IIC_H',
          label: 'Hidrocarburos',
          colorClass: 'dark-red',
          color: '#b71c1c'
        },
        {
          key: 'iic_mineria',
          column: 'IIC_M',
          label: 'Minería',
          colorClass: 'red',
          color: '#DC143C'
        },
        {
          key: 'iic_transporte',
          column: 'IIC_T',
          label: 'Transporte',
          colorClass: 'light-red',
          color: '#ef5350'
        }
      ]
    },
    
    rankingCuantitativo: {
      stateColumn: 'Entidad Federativa',
      columnsByVariable: {
        'IFSS': 'IFSS',
        'PS': 'PS (%)',
        'IIC': 'IIC (%)',
        'PIC': 'PIC (%)',
        'IS': 'IS (%)'
      },
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

    ifssStackedArea: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'IFS',
          column: 'IFS',
          label: 'IFS',
          color: '#10b981'
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

export function setActiveYear(year) {
  console.log('📅 [storageConfig] Estableciendo año activo:', year)
  currentActiveYear = year || '2024'
}

export function getActiveYear() {
  return currentActiveYear
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

export function getSheetIdForFile(fileKey) {
  const config = storageConfig.googlesheets
  
  if (config.sheets) {
    for (const [sheetKey, sheetConfig] of Object.entries(config.sheets)) {
      if (sheetConfig.files && sheetConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en sheet "${sheetKey}"`)
        
        if (sheetKey === 'cuantitativos') {
          console.log(`📅 Usando año activo para cuantitativos: ${currentActiveYear}`)
          return sheetConfig.sheetId
        }
        
        return sheetConfig.sheetId
      }
    }
  }
  
  console.log(`📄 Usando sheet principal para "${fileKey}"`)
  return config.sheetId
}

export function getSheetName(fileKey) {
  const config = storageConfig.googlesheets
  
  // ✅ ACTUALIZADO: Ahora incendiosForestales también usa año dinámico
  if (fileKey === 'datosCuantitativos' || 
      fileKey === 'chartsPresupuestos' || 
      fileKey === 'chartsIngresos' ||
      fileKey === 'incendiosForestales') {  // ← NUEVO
    console.log(`📅 Nombre de hoja dinámico para "${fileKey}": ${currentActiveYear}`)
    return currentActiveYear
  }
  
  if (config.sheets) {
    for (const [sheetKey, sheetConfig] of Object.entries(config.sheets)) {
      if (sheetConfig.files && sheetConfig.files[fileKey]) {
        return sheetConfig.files[fileKey]
      }
    }
  }
  
  return config.files[fileKey] || fileKey
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