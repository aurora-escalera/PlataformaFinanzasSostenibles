// src/composables/useStateRanking.js
// ✅ ACTUALIZADO: Usa año dinámico del filtro automáticamente

import { ref } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'

export function useStateRanking() {
  const rankingData = ref([])
  const loading = ref(false)
  const error = ref(null)
  const rawData = ref([])
  const currentVariable = ref(null)
  
  const { fetchData } = useStorageData()
  
  /**
   * Determinar qué columna usar según la variable seleccionada
   * @param {Object|null} variable - Variable seleccionada del filtro
   * @returns {string} - Nombre de la columna a usar
   */
  const getColumnForVariable = (variable) => {
    const mapping = getMapping('rankingCuantitativo')
    
    // Si no hay variable seleccionada, usar IFSS por defecto
    if (!variable || !variable.key) {
      console.log('📊 Usando columna por defecto: IFSS')
      return mapping.columnsByVariable['IFSS']
    }
    
    // Buscar la columna correspondiente a la variable
    const columnName = mapping.columnsByVariable[variable.key]
    
    if (!columnName) {
      console.warn(`⚠️ No se encontró columna para variable: ${variable.key}, usando IFSS`)
      return mapping.columnsByVariable['IFSS']
    }
    
    console.log(`📊 Usando columna: ${columnName} para variable: ${variable.key}`)
    return columnName
  }
  
  /**
   * Transformar datos crudos a formato de ranking según la variable
   * @param {Array} data - Datos crudos del sheet
   * @param {string} columnName - Nombre de la columna a usar
   * @returns {Array} - Datos transformados para HorizontalRankingChart
   */
  const transformRankingData = (data, columnName) => {
    const mapping = getMapping('rankingCuantitativo')
    const stateColumn = mapping.stateColumn
    
    // Transformar cada fila a formato de ranking
    const transformed = data.map(row => {
      const stateName = row[stateColumn]
      const rawValue = row[columnName]
      
      // ✅ CORREGIDO: Limpiar el valor preservando decimales
      let cleanValue = rawValue
      if (typeof rawValue === 'string') {
        // Eliminar comillas al inicio y final
        cleanValue = rawValue.replace(/^["']+|["']+$/g, '').trim()
        
        // Si quedó vacío o solo comillas, es 0
        if (cleanValue === '' || cleanValue === '""' || cleanValue === '"""') {
          cleanValue = '0'
        } else {
          // ✅ IMPORTANTE: NO eliminar puntos si son decimales
          // Solo eliminar puntos si hay comas (formato europeo con miles)
          // Ejemplo: "1.234,56" → "1234.56"
          if (cleanValue.includes(',')) {
            // Formato europeo: punto para miles, coma para decimales
            cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
          }
          // Si solo hay punto, asumimos que es decimal (formato US)
          // Ejemplo: "2.5" → "2.5" (no tocar)
        }
      }
      
      return {
        key: stateName,
        label: stateName,
        value: parseFloat(cleanValue) || 0,
        colorClass: 'blue',
        color: null  // El color se asignará en el componente según el valor
      }
    })
    
    // Filtrar estados sin nombre y ordenar por valor descendente
    const filtered = transformed
      .filter(item => item.label && item.label.trim() !== '')
      .sort((a, b) => b.value - a.value)
    
    console.log(`✅ Ranking transformado: ${filtered.length} estados`)
    console.log(`📊 Ejemplo de valores: ${filtered.slice(0, 3).map(f => `${f.label}: ${f.value}`).join(', ')}`)
    
    return filtered
  }
  
  /**
   * Cargar ranking de todos los estados según la variable seleccionada
   * @param {Object|null} variable - Variable seleccionada del filtro
   */
  const loadAllStatesRanking = async (variable = null) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('📊 Cargando ranking de estados...')
      console.log('📊 Variable seleccionada:', variable)
      
      // ✅ MODIFICADO: Usar getSheetName para obtener el año activo dinámicamente
      const sheetName = getSheetName('datosCuantitativos')
      console.log(`📅 Cargando ranking desde hoja: "${sheetName}"`)
      
      // Obtener datos del sheet usando el año activo
      const data = await fetchData('datosCuantitativos', sheetName)
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No se encontraron datos en el sheet')
        rankingData.value = []
        return
      }
      
      rawData.value = data
      currentVariable.value = variable
      
      // Determinar qué columna usar
      const columnName = getColumnForVariable(variable)
      
      // Transformar datos al formato esperado
      const transformed = transformRankingData(data, columnName)
      
      rankingData.value = transformed
      
      console.log(`✅ Ranking cargado: ${transformed.length} estados`)
      
    } catch (err) {
      console.error('❌ Error cargando ranking:', err)
      error.value = err.message
      rankingData.value = []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Actualizar ranking cuando cambia la variable (sin recargar datos del sheet)
   * @param {Object|null} variable - Variable seleccionada del filtro
   */
  const updateRankingByVariable = (variable) => {
    if (!rawData.value || rawData.value.length === 0) {
      console.warn('⚠️ No hay datos cargados, cargando...')
      loadAllStatesRanking(variable)
      return
    }
    
    try {
      console.log('🔄 Actualizando ranking por variable:', variable)
      
      currentVariable.value = variable
      
      // Determinar qué columna usar
      const columnName = getColumnForVariable(variable)
      
      // Transformar datos con la nueva columna
      const transformed = transformRankingData(rawData.value, columnName)
      
      rankingData.value = transformed
      
      console.log(`✅ Ranking actualizado: ${transformed.length} estados`)
      
    } catch (err) {
      console.error('❌ Error actualizando ranking:', err)
      error.value = err.message
    }
  }
  
  /**
   * Reiniciar datos
   */
  const reset = () => {
    rankingData.value = []
    rawData.value = []
    currentVariable.value = null
    error.value = null
  }
  
  return {
    // Estado
    rankingData,
    loading,
    error,
    currentVariable,
    
    // Métodos
    loadAllStatesRanking,
    updateRankingByVariable,
    reset
  }
}

export default useStateRanking