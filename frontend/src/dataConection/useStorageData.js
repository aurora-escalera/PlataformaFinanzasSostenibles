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
  
  // ✅ CORREGIDO: Transformar a formato de gráfica de barras (limpia puntos y comillas)
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
        
        // ✅ FIX: Limpiar comillas triples, puntos y comas
        let cleanValue = rawValue
        
        if (typeof rawValue === 'string') {
          // Eliminar comillas al inicio y final
          cleanValue = rawValue.replace(/^["']+|["']+$/g, '').trim()
          
          // Si quedó vacío o solo comillas, es 0
          if (cleanValue === '' || cleanValue === '""' || cleanValue === '"""') {
            cleanValue = '0'
          } else {
            // Limpiar PUNTOS (separadores de miles)
            cleanValue = cleanValue.replace(/\./g, '')
          }
        }
        
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
  
  // ✅ CORREGIDO: Transformar a formato de gráfica lineal (limpia puntos y comillas)
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
        
        // ✅ FIX: Limpiar comillas triples, puntos
        let cleanValue = rawValue
        
        if (typeof rawValue === 'string') {
          cleanValue = rawValue.replace(/^["']+|["']+$/g, '').trim()
          if (cleanValue === '' || cleanValue === '""' || cleanValue === '"""') {
            cleanValue = '0'
          } else {
            cleanValue = cleanValue.replace(/\./g, '')
          }
        }
        
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
        
        // ✅ FIX: Limpiar comillas triples, puntos
        let cleanValue = rawValue
        
        if (typeof rawValue === 'string') {
          cleanValue = rawValue.replace(/^["']+|["']+$/g, '').trim()
          if (cleanValue === '' || cleanValue === '""' || cleanValue === '"""') {
            cleanValue = '0'
          } else {
            cleanValue = cleanValue.replace(/\./g, '')
          }
        }
        
        transformed[varConfig.label].push(parseFloat(cleanValue) || 0)
      })
    })
    
    console.log('✅ Datos transformados para StackedArea:', Object.keys(transformed).length, 'series')
    return transformed
  }
  
  // ✅ CORREGIDO: Transformar a formato de gráfica de ranking horizontal
  const transformToRankingData = (rawData, mapping, stateFilter = null) => {
    if (!rawData || rawData.length === 0) {
      console.warn('⚠️ No hay datos para transformar')
      return []
    }
    
    const stateColumn = mapping.stateColumn
    const variableColumns = mapping.variableColumns
    
    // Filtrar por estado si se proporciona
    let dataToProcess = rawData
    if (stateFilter) {
      dataToProcess = rawData.filter(row => row[stateColumn] === stateFilter)
    }
    
    if (dataToProcess.length === 0) {
      console.warn(`⚠️ No hay datos para el estado: ${stateFilter}`)
      return []
    }
    
    // Tomar la primera fila (o última, dependiendo de tu estructura)
    const dataRow = dataToProcess[0]
    
    // Transformar cada variable a formato de HorizontalRankingChart
    const transformed = variableColumns.map(varConfig => {
      const rawValue = dataRow[varConfig.column]
      
      // ✅ FIX: Limpiar comillas triples, puntos
      let cleanValue = rawValue
      
      if (typeof rawValue === 'string') {
        cleanValue = rawValue.replace(/^["']+|["']+$/g, '').trim()
        if (cleanValue === '' || cleanValue === '""' || cleanValue === '"""') {
          cleanValue = '0'
        } else {
          cleanValue = cleanValue.replace(/\./g, '')
        }
      }
      
      return {
        key: varConfig.key,
        label: varConfig.label,
        value: parseFloat(cleanValue) || 0,
        colorClass: varConfig.colorClass || 'default',
        color: varConfig.color || null
      }
    })
    
    // Ordenar por orden si existe
    transformed.sort((a, b) => {
      const orderA = variableColumns.find(v => v.key === a.key)?.order || 999
      const orderB = variableColumns.find(v => v.key === b.key)?.order || 999
      return orderA - orderB
    })
    
    console.log(`✅ Datos transformados para Ranking: ${transformed.length} variables`)
    return transformed
  }

  // ✅ NUEVO: Transformar a formato de HorizontalBarChart
  const transformToHorizontalBarData = (rawData, mapping, options = {}) => {
    if (!rawData || rawData.length === 0) {
      console.warn('⚠️ No hay datos para transformar')
      return []
    }
    
    const categoryColumn = mapping.categoryColumn // 'Entidad Federativa'
    const variables = mapping.variables
    const selectedEntity = options.selectedEntity // Entidad federativa seleccionada
    
    console.log('📊 Transformando datos para entidad:', selectedEntity)
    
    // ✅ NUEVO: Mostrar todas las entidades disponibles para debugging
    const availableEntities = rawData.map(row => row[categoryColumn]?.toString().trim()).filter(Boolean)
    console.log('📋 Entidades disponibles en el sheet:', availableEntities)
    
    // Buscar la fila correspondiente a la entidad seleccionada
    let dataRow = null
    
    if (selectedEntity) {
      // ✅ MEJORADO: Búsqueda más tolerante (case-insensitive y sin espacios extra)
      const normalizedSelectedEntity = selectedEntity.toLowerCase().trim()
      
      dataRow = rawData.find(row => {
        const entityName = row[categoryColumn]?.toString().trim()
        const normalizedEntityName = entityName?.toLowerCase()
        
        console.log(`  Comparando: "${entityName}" vs "${selectedEntity}"`)
        console.log(`    Normalizado: "${normalizedEntityName}" vs "${normalizedSelectedEntity}"`)
        
        return normalizedEntityName === normalizedSelectedEntity
      })
      
      if (!dataRow) {
        console.warn(`⚠️ No se encontraron datos para la entidad: ${selectedEntity}`)
        console.warn('💡 Verifica que el nombre coincida exactamente con alguno de estos:', availableEntities)
        return []
      }
      
      console.log('✅ Fila encontrada:', dataRow)
    } else {
      // Si no hay entidad seleccionada, usar la primera fila (o retornar vacío)
      console.warn('⚠️ No hay entidad seleccionada')
      return []
    }
    
    console.log('📊 Fila de datos encontrada:', dataRow)
    
    // Mapear las variables configuradas con sus valores
    const transformed = variables.map(varConfig => {
      const rawValue = dataRow[varConfig.column]
      
      // Limpiar valor
      let cleanValue = rawValue
      if (typeof rawValue === 'string') {
        cleanValue = rawValue.replace(/^["']+|["']+$/g, '').trim()
        if (cleanValue === '' || cleanValue === '""' || cleanValue === '"""') {
          cleanValue = '0'
        } else {
          // Limpiar puntos (separadores de miles) y comas
          cleanValue = cleanValue.replace(/\./g, '').replace(/,/g, '.')
        }
      }
      
      const value = parseFloat(cleanValue) || 0
      
      console.log(`  ${varConfig.label}: ${rawValue} → ${cleanValue} → ${value}`)
      
      return {
        key: varConfig.key,
        label: varConfig.label,
        value: value,
        color: varConfig.color,
        active: false  // Inicialmente false, se activarán con animación
      }
    })
    
    // Ordenar por orden
    transformed.sort((a, b) => {
      const orderA = variables.find(v => v.key === a.key)?.order || 999
      const orderB = variables.find(v => v.key === b.key)?.order || 999
      return orderA - orderB
    })
    
    console.log(`✅ Datos transformados para HorizontalBarChart: ${transformed.length} variables`)
    return transformed
  }
  
  const transform = (rawData, mapping, chartType = 'bar', options = {}) => {
    switch (chartType) {
      case 'bar':
        return transformToBarChartData(rawData, mapping)
      case 'linear':
        return transformToLinearChartData(rawData, mapping)
      case 'stacked':
        return transformToStackedAreaData(rawData, mapping)
      case 'ranking':
        return transformToRankingData(rawData, mapping, options.stateFilter)
      case 'horizontal':
        return transformToHorizontalBarData(rawData, mapping, options)
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
    transformToRankingData,
    transformToHorizontalBarData,
    transform,
    clearError,
    getProvider,
    config
  }
}

export default useStorageData