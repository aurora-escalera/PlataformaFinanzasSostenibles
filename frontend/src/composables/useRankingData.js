// src/composables/useRankingData.js

import { ref, computed } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping } from '@/dataConection/storageConfig'

export function useRankingData() {
  const rankingVariables = ref([])
  const rawData = ref([])
  const currentState = ref(null)
  
  const {
    loading,
    error,
    fetchData,
    transformToRankingData
  } = useStorageData()
  
  /**
   * Cargar datos de ranking desde Google Sheets
   * @param {string} stateFilter - Nombre del estado para filtrar (opcional)
   */
  const loadRankingData = async (stateFilter = null) => {
    try {
      console.log('📊 Cargando datos de ranking cuantitativo...')
      
      // Obtener datos del sheet "Datos_Cuantitativos"
      const data = await fetchData('datosCuantitativos', '2024')
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No se encontraron datos en el sheet')
        rankingVariables.value = []
        return
      }
      
      rawData.value = data
      currentState.value = stateFilter
      
      // Obtener el mapping configurado
      const mapping = getMapping('rankingCuantitativo')
      
      // Transformar datos al formato esperado por HorizontalRankingChart
      const transformed = transformToRankingData(data, mapping, stateFilter)
      
      rankingVariables.value = transformed
      
      console.log(`✅ Ranking cargado: ${transformed.length} variables`)
      
    } catch (err) {
      console.error('❌ Error cargando datos de ranking:', err)
      rankingVariables.value = []
      throw err
    }
  }
  
  /**
   * Actualizar datos para un estado específico
   * @param {string} stateName - Nombre del estado
   */
  const updateStateData = async (stateName) => {
    if (!rawData.value || rawData.value.length === 0) {
      // Si no hay datos cargados, cargarlos primero
      await loadRankingData(stateName)
      return
    }
    
    try {
      const mapping = getMapping('rankingCuantitativo')
      const transformed = transformToRankingData(rawData.value, mapping, stateName)
      
      rankingVariables.value = transformed
      currentState.value = stateName
      
      console.log(`✅ Ranking actualizado para estado: ${stateName}`)
      
    } catch (err) {
      console.error('❌ Error actualizando datos de estado:', err)
      throw err
    }
  }
  
  /**
   * Obtener el total de todos los valores
   */
  const totalValue = computed(() => {
    return rankingVariables.value.reduce((sum, v) => sum + (v.value || 0), 0)
  })
  
  /**
   * Obtener la variable con mayor valor
   */
  const topVariable = computed(() => {
    if (rankingVariables.value.length === 0) return null
    
    return rankingVariables.value.reduce((max, v) => 
      (v.value > max.value) ? v : max
    , rankingVariables.value[0])
  })
  
  /**
   * Reiniciar datos
   */
  const reset = () => {
    rankingVariables.value = []
    rawData.value = []
    currentState.value = null
  }
  
  return {
    // Estado
    rankingVariables,
    loading,
    error,
    currentState,
    
    // Computed
    totalValue,
    topVariable,
    
    // Métodos
    loadRankingData,
    updateStateData,
    reset
  }
}

export default useRankingData