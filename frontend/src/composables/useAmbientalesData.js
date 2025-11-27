// src/composables/useAmbientalesData.js
import { ref, computed } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'

export function useAmbientalesData() {
  const { fetchData } = useStorageData()
  
  // Estados reactivos
  const rawData = ref([])
  const availableYears = ref([])
  const availableEntities = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentYear = ref(null)
  
  /**
   * Cargar años disponibles desde las pestañas del sheet
   */
  const loadAvailableYears = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📅 Cargando años disponibles de incendios forestales...')
      
      // El sheet tiene pestañas con nombres de años
      // Por ahora, asumimos que hay pestañas '2024', '2023', etc.
      // En una implementación real, podrías usar la API de Google Sheets para listar las pestañas
      const testYears = ['2024', '2023', '2022']
      const validYears = []
      
      for (const year of testYears) {
        try {
          const data = await fetchData('ambientalesIncendios', year)
          if (data && data.length > 0) {
            validYears.push(year)
          }
        } catch (err) {
          console.log(`ℹ️ Año ${year} no disponible`)
        }
      }
      
      availableYears.value = validYears.sort((a, b) => b - a) // Ordenar descendente
      
      if (availableYears.value.length > 0) {
        currentYear.value = availableYears.value[0]
        console.log('✅ Años disponibles:', availableYears.value)
      } else {
        console.warn('⚠️ No se encontraron años disponibles')
      }
      
    } catch (err) {
      console.error('❌ Error cargando años:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Cargar datos de incendios forestales para un año específico
   */
  const loadIncendiosData = async (year = null) => {
    try {
      loading.value = true
      error.value = null
      
      const yearToLoad = year || currentYear.value || '2024'
      console.log('🔥 Cargando datos de incendios forestales para año:', yearToLoad)
      
      const data = await fetchData('ambientalesIncendios', yearToLoad)
      
      if (!data || data.length === 0) {
        throw new Error(`No hay datos disponibles para el año ${yearToLoad}`)
      }
      
      const mapping = getMapping('ambientalesIncendios')
      
      // Extraer entidades únicas
      const entities = [...new Set(data.map(row => row[mapping.stateColumn]))]
        .filter(entity => entity && entity.trim() !== '')
        .sort()
      
      availableEntities.value = entities
      rawData.value = data
      currentYear.value = yearToLoad
      
      console.log('✅ Datos cargados:', {
        registros: data.length,
        entidades: entities.length,
        año: yearToLoad
      })
      
    } catch (err) {
      console.error('❌ Error cargando datos de incendios:', err)
      error.value = err.message
      rawData.value = []
      availableEntities.value = []
    } finally {
      loading.value = false
    }
  }

    const loadIngresoTotalData = async (year = null) => {
    try {
      loading.value = true
      error.value = null
      
      const yearToLoad = year || currentYear.value || '2024'
      console.log('🔥 Cargando datos de ingresos totales para año:', yearToLoad)
      
      const data = await fetchData('ambientalesIncendios', yearToLoad)
      
      if (!data || data.length === 0) {
        throw new Error(`No hay datos disponibles para el año ${yearToLoad}`)
      }
      
      const mapping = getMapping('ambientalesIncendios')
      
      // Extraer entidades únicas
      const entities = [...new Set(data.map(row => row[mapping.stateColumn]))]
        .filter(entity => entity && entity.trim() !== '')
        .sort()
      
      availableEntities.value = entities
      rawData.value = data
      currentYear.value = yearToLoad
      
      console.log('✅ Datos cargados:', {
        registros: data.length,
        entidades: entities.length,
        año: yearToLoad
      })
      
    } catch (err) {
      console.error('❌ Error cargando datos de incendios:', err)
      error.value = err.message
      rawData.value = []
      availableEntities.value = []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Obtener datos filtrados por entidad
   */
  const getFilteredData = (entityFilter = null) => {
    if (!rawData.value || rawData.value.length === 0) {
      console.log('ℹ️ No hay datos para filtrar')
      return []
    }
    
    const mapping = getMapping('ambientalesIncendios')
    let filteredData = rawData.value
    
    // Filtrar por entidad si se especifica
    if (entityFilter && entityFilter !== '' && entityFilter !== null) {
      filteredData = rawData.value.filter(row => 
        row[mapping.stateColumn] === entityFilter
      )
      console.log(`🔍 Filtrando por entidad "${entityFilter}":`, filteredData.length, 'registros')
    } else {
      console.log('📊 Mostrando todas las entidades:', filteredData.length, 'registros')
    }
    
    // Si no hay datos después del filtro, retornar array vacío
    if (filteredData.length === 0) {
      return []
    }
    
    // Transformar datos para HorizontalBarChart
    // Las columnas B,C,D,E,F,G son las variables
    const chartData = [
      {
        key: 'arbustivo',
        label: 'Arbustivo',
        value: 0,
        color: '#7cb342',
        active: true
      },
      {
        key: 'herbaceo',
        label: 'Herbáceo',
        value: 0,
        color: '#3b82f6',
        active: true
      },
      {
        key: 'hojarasca',
        label: 'Hojarasca',
        value: 0,
        color: '#fb923c',
        active: true
      },
      {
        key: 'arbolado',
        label: 'Arbolado Adulto',
        value: 0,
        color: '#DC143C',
        active: true
      },
      {
        key: 'renuevo',
        label: 'Renuevo',
        value: 0,
        color: '#a78bfa',
        active: false
      },
      {
        key: 'total',
        label: 'Total de Hectáreas',
        value: 0,
        color: '#0F3759',
        active: false
      }
    ]
    
    // Sumar valores de todas las filas filtradas
    filteredData.forEach(row => {
      const parseValue = (val) => {
        if (!val) return 0
        const cleaned = String(val).replace(/[^\d.-]/g, '')
        const parsed = parseFloat(cleaned)
        return isNaN(parsed) ? 0 : parsed
      }
      
      chartData[0].value += parseValue(row[mapping.arbustivoColumn])
      chartData[1].value += parseValue(row[mapping.herbaceoColumn])
      chartData[2].value += parseValue(row[mapping.hojarascaColumn])
      chartData[3].value += parseValue(row[mapping.arboladoColumn])
      chartData[4].value += parseValue(row[mapping.renuevoColumn])
      chartData[5].value += parseValue(row[mapping.totalColumn])
    })
    
    // Redondear valores
    chartData.forEach(item => {
      item.value = Math.round(item.value * 100) / 100
    })
    
    console.log('📊 Datos procesados para gráfica:', chartData)
    return chartData
  }
  
  /**
   * Título dinámico del gráfico
   */
  const chartTitle = computed(() => {
    if (!currentYear.value) return 'Incendios Forestales'
    return `Incendios Forestales - ${currentYear.value}`
  })
  
  return {
    // Estado
    rawData,
    availableYears,
    availableEntities,
    loading,
    error,
    currentYear,
    
    // Computed
    chartTitle,
    
    // Métodos
    loadAvailableYears,
    loadIncendiosData,
    getFilteredData
  }
}