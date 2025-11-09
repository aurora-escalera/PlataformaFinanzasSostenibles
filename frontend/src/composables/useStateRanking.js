// src/composables/useStateRanking.js
import { ref, computed } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'

export function useStateRanking() {
  const rankingData = ref([])
  const sortOrder = ref('desc')
  
  const { loading, error, fetchData } = useStorageData()
  
  const loadAllStatesRanking = async () => {
    try {
      console.log('📊 Cargando ranking de estados...')
      
      const data = await fetchData('datosCuantitativos', 'Datos_Cuantitativos')
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No se encontraron datos')
        rankingData.value = []
        return
      }
      
      console.log('✅ Datos obtenidos:', data.length, 'filas')
      console.log('Primera fila:', data[0])
      console.log('Todas las filas:', data)
      
      // Nombres de columnas
      const stateColumnName = 'Entidad Federativa'
      const ifssColumnName = 'IFSS'
      
      const transformed = data.map(row => {
        const stateName = row[stateColumnName]
        const ifssValue = row[ifssColumnName]
        
        // ✅ FIX: Convertir formato europeo (coma decimal) a formato estándar
        const cleanValue = typeof ifssValue === 'string' 
          ? ifssValue.replace(/\./g, '').replace(',', '.')  // Quitar puntos de miles, cambiar coma a punto
          : ifssValue
        
        const parsedValue = parseFloat(cleanValue) || 0
        
        console.log(`Estado: ${stateName}, IFSS: ${ifssValue} → ${parsedValue}`)
        
        return {
          key: stateName?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
          label: stateName || 'Desconocido',
          value: parsedValue,
          colorClass: 'blue',
          color: getColorByValue(parsedValue)
        }
      })
      
      const filtered = transformed.filter(item => 
        item.label !== 'Desconocido' && item.value > 0
      )
      
      rankingData.value = sortRanking(filtered)
      
      console.log(`✅ Ranking cargado: ${rankingData.value.length} estados`)
      console.log('📊 RankingData completo:', rankingData.value)
      
    } catch (err) {
      console.error('❌ Error cargando ranking:', err)
      rankingData.value = []
      throw err
    }
  }
  
  const sortRanking = (data) => {
    return [...data].sort((a, b) => {
      return sortOrder.value === 'desc' ? b.value - a.value : a.value - b.value
    })
  }
  
  const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    if (rankingData.value.length > 0) {
      rankingData.value = sortRanking(rankingData.value)
    }
  }
  
  const getColorByValue = (value) => {
    // Muy Alto / Alto (Verde Fuerte)
    if (value >= 2.5) return '#16a34a'  // Verde fuerte
    
    // Medio Alto (Verde Bajo)
    if (value >= 2.3) return '#84cc16'  // Verde amarillento
    
    // Medio (Amarillo)
    if (value >= 1.9) return '#facc15'  // Amarillo
    
    // Medio Bajo (Anaranjado)
    if (value >= 1.5) return '#f97316'  // Naranja
    
    // Bajo (Rojo)
    if (value >= 0.8) return '#dc2626'  // Rojo
    
    // Muy Bajo (Rojo Fuerte)
    return '#b91c1c'  // Rojo oscuro
  }
  
  const stats = computed(() => {
    if (rankingData.value.length === 0) {
      return { total: 0, average: 0, max: 0, min: 0 }
    }
    
    const values = rankingData.value.map(item => item.value)
    const total = values.reduce((sum, val) => sum + val, 0)
    
    return {
      total: values.length,
      average: (total / values.length).toFixed(2),
      max: Math.max(...values).toFixed(2),
      min: Math.min(...values).toFixed(2)
    }
  })
  
  return {
    rankingData,
    loading,
    error,
    sortOrder,
    stats,
    loadAllStatesRanking,
    toggleSortOrder
  }
}

export default useStateRanking