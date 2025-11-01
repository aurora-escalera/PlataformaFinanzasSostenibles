// src/config/storageConfig.js

console.log('API Key:', import.meta.env.VITE_GOOGLE_SHEETS_API_KEY)
console.log('Sheet ID:', import.meta.env.VITE_GOOGLE_SHEET_ID)
console.log('Provider:', import.meta.env.VITE_STORAGE_PROVIDER)
export const storageConfig = {
  // ============================================
  // PROVIDER ACTUAL - CAMBIAR AQUÍ PARA MIGRAR
  // ============================================
  provider: import.meta.env.VITE_STORAGE_PROVIDER || 'googlesheets',
  
  // ============================================
  // CONFIGURACIÓN ONEDRIVE PERSONAL
  // ============================================
  onedrive: {
    clientId: 'b8163dbb-5949-4a16-bc94-d54d2be24c53',
    authority: 'https://login.microsoftonline.com/0c3a17d5-cb62-48bf-98cf-fb7255fe9c3e',
    redirectUri: 'http://localhost:3000',
    scopes: ['Files.Read', 'Files.ReadWrite', 'User.Read'],
    
    files: {
      datosFinancieros: '/IFS/IFS_Regional.xlsx',
      presupuesto: '/Presupuesto.xlsx',
      indicadores: '/Indicadores.xlsx',
      gastos: '/Gastos.xlsx',
      estados: '/Estados.xlsx'
    }
  },
  
  // ============================================
  // CONFIGURACIÓN SHAREPOINT
  // ============================================
  sharepoint: {
    siteUrl: import.meta.env.VITE_SHAREPOINT_SITE_URL,
    clientId: import.meta.env.VITE_SHAREPOINT_CLIENT_ID,
    clientSecret: import.meta.env.VITE_SHAREPOINT_CLIENT_SECRET,
    tenantId: import.meta.env.VITE_SHAREPOINT_TENANT_ID,
    documentLibrary: 'Documentos Compartidos/Datos',
    
    files: {
      datosFinancieros: 'DatosFinancieros.xlsx',
      presupuesto: 'Presupuesto.xlsx',
      indicadores: 'Indicadores.xlsx',
      gastos: 'Gastos.xlsx',
      estados: 'Estados.xlsx'
    }
  },
  
  // ============================================
  // CONFIGURACIÓN GOOGLE SHEETS
  // ============================================
  googlesheets: {
    apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
    
    // Mapeo de "archivos" a nombres de hojas (tabs)
    files: {
      datosFinancieros: 'Hoja 1', // ✅ Ajusta al nombre real de tu hoja
      presupuesto: 'Presupuesto',
      indicadores: 'Indicadores',
      gastos: 'Gastos',
      estados: 'Estados'
    }
  },
  
  // ============================================
  // MAPEOS DE COLUMNAS (Iguales para ambos)
  // ============================================
  mappings: {
    // Gráfica de Barras IIC
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
    
    // Gráfica Lineal IS
    isLinearChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'isTotal',
          column: 'IS Total',
          label: 'IS Total'
        },
        {
          key: 'financDesarrollo',
          column: 'Financiamiento Desarrollo',
          label: 'Financ. para desarrollo'
        },
        {
          key: 'otrasFuentes',
          column: 'Otras Fuentes',
          label: 'Otras fuentes'
        }
      ]
    },
    
    // Gráfica de Barras Presupuesto
    presupuestoBarChart: {
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
    
    // Gráfica Lineal ROI
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
    
    // Área Apilada Gastos
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
    
    // Gráfica de Barras Estados
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
  
  // ============================================
  // CONFIGURACIÓN DE VARIABLES (Colores/Orden Globales)
  // ============================================
  variablesConfig: {
    // Ingresos
    federal: { label: 'Federal', color: '#0F3759', order: 1 },
    estatal: { label: 'Estatal', color: '#3B5A70', order: 2 },
    municipal: { label: 'Municipal', color: '#6B8FA3', order: 3 },
    
    // Presupuesto
    asignado: { label: 'Asignado', color: '#4CAF50', order: 1 },
    ejecutado: { label: 'Ejecutado', color: '#2196F3', order: 2 },
    disponible: { label: 'Disponible', color: '#FF9800', order: 3 },
    
    // Gastos
    personal: { label: 'Personal', color: '#E91E63', order: 1 },
    operacion: { label: 'Operación', color: '#9C27B0', order: 2 },
    inversion: { label: 'Inversión', color: '#3F51B5', order: 3 },
    otros: { label: 'Otros', color: '#607D8B', order: 4 }
  }
}

// ============================================
// HELPERS
// ============================================

export function getCurrentConfig() {
  const provider = storageConfig.provider
  
  if (!provider) {
    throw new Error('Provider no configurado en storageConfig.js')
  }
  
  const providerConfig = storageConfig[provider]
  
  if (!providerConfig) {
    throw new Error(`Configuración no encontrada para provider: ${provider}`)
  }
  
  return {
    provider,
    ...providerConfig,
    mappings: storageConfig.mappings,
    variablesConfig: storageConfig.variablesConfig
  }
}

export function getMapping(mappingName) {
  const mapping = storageConfig.mappings[mappingName]
  
  if (!mapping) {
    throw new Error(`Mapeo no encontrado: ${mappingName}`)
  }
  
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
  
  if (!provider) {
    return { valid: false, error: 'Provider no configurado' }
  }
  
  if (!['onedrive', 'sharepoint', 'googlesheets'].includes(provider)) {
    return { valid: false, error: `Provider inválido: ${provider}` }
  }
  
  const config = storageConfig[provider]
  
  if (!config) {
    return { valid: false, error: `Configuración no encontrada para ${provider}` }
  }
  
  if (provider === 'onedrive') {
    if (!config.clientId) {
      return { valid: false, error: 'OneDrive clientId no configurado' }
    }
  } else if (provider === 'sharepoint') {
    if (!config.siteUrl || !config.clientId || !config.clientSecret || !config.tenantId) {
      return { valid: false, error: 'SharePoint: faltan credenciales' }
    }
  } else if (provider === 'googlesheets') {
    if (!config.apiKey || !config.sheetId) {
      return { valid: false, error: 'Google Sheets: faltan apiKey o sheetId' }
    }
  }
  
  return { valid: true }
}

export default storageConfig