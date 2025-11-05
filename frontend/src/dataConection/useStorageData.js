// src/dataConection/useStorageData.js

import { ref, computed } from 'vue'
import { getDataStorageService } from './dataStorageService'
import { getCurrentConfig } from './storageConfig'

export function useStorageData() {
  const loading = ref(false)
  const error = ref(null)
  const isAuthenticated = ref(false)
  
  const service = getDataStorageService()
  const config = getCurrentConfig()
  
  const provider = computed(() => service.getProvider())
  
  // Google Sheets no necesita login
  const needsLogin = computed(() => {
    return provider.value === 'onedrive' && !isAuthenticated.value
  })
  
  const checkAuth = () => {
    try {
      isAuthenticated.value = service.isAuthenticated()
      return isAuthenticated.value
    } catch (err) {
      console.error('Error verificando auth:', err)
      return false
    }
  }
  
  const authenticate = async () => {
    loading.value = true
    error.value = null
    
    try {
      await service.authenticate()
      isAuthenticated.value = true
      console.log('✅ Autenticación exitosa en composable')
      return true
    } catch (err) {
      error.value = err.message
      console.error('❌ Error autenticación:', err)
      return false
    } finally {
      loading.value = false
    }
  }
  
  const fetchData = async (fileKey, sheetName) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('📊 fetchData llamado:', { fileKey, sheetName, provider: provider.value })
      
      // Solo autenticar si es OneDrive y necesita login
      if (needsLogin.value) {
        console.log('🔐 Requiere autenticación...')
        const authSuccess = await authenticate()
        if (!authSuccess) {
          throw new Error('Autenticación requerida')
        }
      }
      
      const data = await service.getExcelData(fileKey, sheetName)
      
      console.log(`✅ Datos obtenidos en composable: ${data.length} filas`)
      return data
      
    } catch (err) {
      error.value = err.message
      console.error('❌ Error obteniendo datos:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const fetchFiles = async (folderPath) => {
    loading.value = true
    error.value = null
    
    try {
      if (needsLogin.value) {
        await authenticate()
      }
      
      const files = await service.getFiles(folderPath)
      return files
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo archivos:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const fetchUserInfo = async () => {
    if (provider.value !== 'onedrive') {
      return null
    }
    
    try {
      return await service.getUserInfo()
    } catch (err) {
      console.error('Error obteniendo info de usuario:', err)
      return null
    }
  }
  
  // ✅ CORREGIDO: Transformar a formato de gráfica de barras (limpia comas de strings)
  const transformToBarChartData = (rawData, mapping) => {
    if (!rawData || rawData.length === 0) {
      console.warn('⚠️ No hay datos para transformar')
      return []
    }
    
    const yearColumn = mapping.yearColumn
    const variableColumns = mapping.variableColumns
    
    const transformed = rawData.map(row => {
      const year = row[yearColumn]?.toString() || ''
      
      const variables = variableColumns.map(varConfig => {
        const rawValue = row[varConfig.column]
        
        // ✅ FIX: Limpiar comas Y puntos si el valor es un string
        // Google Sheets puede devolver números con diferentes formatos:
        // - Con comas: '3,680,000,000' (formato US)
        // - Con puntos: '301.611.481.578' (formato ES/MX)
        const cleanValue = typeof rawValue === 'string' 
          ? rawValue.replace(/[,.]/g, '')  // ✅ Quita comas Y puntos
          : rawValue
        
        return {
          key: varConfig.key,
          label: varConfig.label,
          value: parseFloat(cleanValue) || 0,
          color: varConfig.color,
          order: varConfig.order || 0
        }
      })
      
      return { year, variables }
    })
    
    console.log('✅ Datos transformados para BarChart:', transformed.length, 'años')
    return transformed
  }
  
  // ✅ CORREGIDO: Transformar a formato de gráfica lineal (limpia comas de strings)
  const transformToLinearChartData = (rawData, mapping) => {
    if (!rawData || rawData.length === 0) {
      console.warn('⚠️ No hay datos para transformar')
      return { data: [], labels: [] }
    }
    
    const yearColumn = mapping.yearColumn
    const variableColumns = mapping.variableColumns
    
    const labels = rawData.map(row => row[yearColumn]?.toString() || '')
    
    const data = variableColumns.map(varConfig => {
      const values = rawData.map(row => {
        const rawValue = row[varConfig.column]
        
        // ✅ FIX: Limpiar comas Y puntos si el valor es un string
        // Google Sheets puede devolver números con diferentes formatos:
        // - Con comas: '3,680,000,000' (formato US)
        // - Con puntos: '301.611.481.578' (formato ES/MX)
        // parseFloat se detiene en el primer separador, por eso limpiamos todo
        const cleanValue = typeof rawValue === 'string' 
          ? rawValue.replace(/[,.]/g, '')  // ✅ Quita comas Y puntos
          : rawValue
        
        return parseFloat(cleanValue) || 0
      })
      
      return {
        key: varConfig.key,
        label: varConfig.label,
        data: values,
        color: varConfig.color
      }
    })
    
    console.log('✅ Datos transformados para LinearChart:', data.length, 'series')
    return { data, labels }
  }
  
const transformToStackedAreaData = (rawData, mapping) => {
  if (!rawData || rawData.length === 0) {
    console.warn('⚠️ No hay datos para transformar')
    return {}
  }
  
  const yearColumn = mapping.yearColumn
  const variableColumns = mapping.variableColumns
  
  const transformed = {}
  
  // Inicializar arrays para cada variable
  variableColumns.forEach(varConfig => {
    transformed[varConfig.label] = []
  })
  
  // Llenar datos para cada año
  rawData.forEach(row => {
    variableColumns.forEach(varConfig => {
      const rawValue = row[varConfig.column]
      
      // Limpiar comas Y puntos si el valor es un string
      const cleanValue = typeof rawValue === 'string' 
        ? rawValue.replace(/[,.]/g, '')
        : rawValue
      
      transformed[varConfig.label].push(parseFloat(cleanValue) || 0)
    })
  })
  
  console.log('✅ Datos transformados para StackedArea:', Object.keys(transformed).length, 'series')
  return transformed
}
  
  const transform = (rawData, mapping, chartType = 'bar') => {
    switch (chartType) {
      case 'bar':
        return transformToBarChartData(rawData, mapping)
      case 'linear':
        return transformToLinearChartData(rawData, mapping)
      case 'stacked':
        return transformToStackedAreaData(rawData, mapping)
      default:
        console.warn(`Tipo de gráfica no reconocido: ${chartType}`)
        return rawData
    }
  }
  
  const logout = async () => {
    loading.value = true
    error.value = null
    
    try {
      await service.logout()
      isAuthenticated.value = false
      console.log('✅ Sesión cerrada en composable')
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error cerrando sesión:', err)
      return false
    } finally {
      loading.value = false
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  const getProvider = () => service.getProvider()
  
  // Verificar auth solo si es OneDrive
  if (provider.value === 'onedrive') {
    checkAuth()
  }
  
  return {
    loading,
    error,
    isAuthenticated,
    needsLogin,
    provider,
    authenticate,
    logout,
    checkAuth,
    fetchData,
    fetchFiles,
    fetchUserInfo,
    transformToBarChartData,
    transformToLinearChartData,
    transformToStackedAreaData,
    transform,
    clearError,
    getProvider,
    config
  }
}

export default useStorageData