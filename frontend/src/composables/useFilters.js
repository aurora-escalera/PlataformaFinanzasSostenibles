// src/composables/useFilters.js
import { ref, computed, watch } from 'vue'

export const useFilters = () => {
  // Estados reactivos para filtros
  const selectedEntity = ref(null)
  const selectedYear = ref('2023')
  const selectedVariable = ref(null)
  const sustainabilityData = ref(null)
  
  // Estados de carga
  const loading = ref(false)
  const error = ref(null)

  // Configuración de años disponibles
  const availableYears = ref([
    '2023', '2022', '2021', '2020', '2019'
  ])

  // Configuración de variables IFSS - SIMPLIFICADA PARA TUS DATOS
  const availableVariables = ref([
    {
      key: 'ifss_total',
      label: 'IFSS Total',
      description: 'Índice completo de finanzas sostenibles',
      field: 'value' // Tu único campo disponible
    }
    // Como solo tienes 'value', solo ofrecemos una variable por ahora
    // Puedes agregar más cuando tengas datos adicionales
  ])

  // Cargar datos de sustentabilidad para filtros
  const loadFilterData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}sustainabilityData.json`)
      if (!response.ok) throw new Error('Error al cargar datos de filtros')
      const data = await response.json()
      
      // Convertir array a objeto para búsqueda rápida
      sustainabilityData.value = data.reduce((acc, item) => {
        acc[item.region] = item
        return acc
      }, {})
      
      console.log('Datos de filtros cargados:', sustainabilityData.value)
    } catch (err) {
      console.error('Error cargando datos de filtros:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Computed: Lista de entidades para el filtro
  const entitiesData = computed(() => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value).map(([name, data]) => ({
      name,
      value: getCurrentVariableValue(data),
      region: data.region,
      year: data.year
    })).sort((a, b) => a.name.localeCompare(b.name))
  })

  // Computed: Datos filtrados según selecciones actuales
  const filteredData = computed(() => {
    if (!sustainabilityData.value) return {}
    
    let filtered = { ...sustainabilityData.value }
    
    // Filtrar por entidad
    if (selectedEntity.value) {
      filtered = {
        [selectedEntity.value]: sustainabilityData.value[selectedEntity.value]
      }
    }
    
    // Filtrar por año (cuando tengas datos multi-año)
    if (selectedYear.value !== '2023') {
      // Aquí cargarías datos del año específico
      console.log('Filtrando por año:', selectedYear.value)
    }
    
    return filtered
  })

  // Computed: Estadísticas de los datos filtrados
  const filterStats = computed(() => {
    const data = Object.values(filteredData.value)
    if (data.length === 0) return null
    
    const values = data.map(item => getCurrentVariableValue(item)).filter(v => v > 0)
    const total = values.length
    const average = values.reduce((sum, val) => sum + val, 0) / total
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    return {
      total,
      average: Math.round(average * 100) / 100,
      max,
      min,
      selectedVariable: selectedVariable.value?.label || 'IFSS Total'
    }
  })

  // Obtener valor de la variable actual
  const getCurrentVariableValue = (dataItem) => {
    if (!selectedVariable.value) return dataItem.value || 0
    
    const field = selectedVariable.value.field
    return dataItem[field] || dataItem.value || 0
  }

  // Métodos para cambiar filtros
  const setEntityFilter = (entityName) => {
    selectedEntity.value = entityName
    console.log('Filtro de entidad aplicado:', entityName)
  }

  const setYearFilter = (year) => {
    selectedYear.value = year
    console.log('Filtro de año aplicado:', year)
    // Aquí podrías cargar datos específicos del año
  }

  const setVariableFilter = (variable) => {
    selectedVariable.value = variable
    console.log('Filtro de variable aplicado:', variable)
  }

  // Aplicar todos los filtros
  const applyFilters = (filters) => {
    if (filters.entity !== undefined) selectedEntity.value = filters.entity
    if (filters.year !== undefined) selectedYear.value = filters.year
    if (filters.variable !== undefined) selectedVariable.value = filters.variable
  }

  // Resetear filtros
  const resetFilters = () => {
    selectedEntity.value = null
    selectedYear.value = '2023'
    selectedVariable.value = availableVariables.value[0]
  }

  // Búsqueda de entidades
  const searchEntities = (searchTerm) => {
    if (!searchTerm || !sustainabilityData.value) return []
    
    const term = searchTerm.toLowerCase()
    return entitiesData.value
      .filter(entity => entity.name.toLowerCase().includes(term))
      .slice(0, 10) // Limitar resultados
  }

  // Exportar datos filtrados
  const exportFilteredData = () => {
    const data = filteredData.value
    const variable = selectedVariable.value?.label || 'IFSS Total'
    
    // Crear CSV
    const headers = ['Entidad', variable, 'Año']
    const rows = Object.entries(data).map(([name, item]) => [
      name,
      getCurrentVariableValue(item),
      selectedYear.value
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `IFSS_${variable}_${selectedYear.value}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Obtener configuración de colores para la variable actual
  const getVariableColorConfig = () => {
    // Configuración basada en tus valores reales (0.5 - 2.9)
    const configs = {
      'ifss_total': {
        scale: [0.5, 2.9],
        colors: ['#e52845', '#e67849', '#e6a74c', '#e6d64f', '#bddc50', '#94d351', '#6ac952']
      }
      // Solo tienes una variable por ahora
    }
    
    const variableKey = selectedVariable.value?.key || 'ifss_total'
    return configs[variableKey] || configs['ifss_total']
  }

  // Watchers para reactividad
  watch([selectedEntity, selectedYear, selectedVariable], () => {
    console.log('Filtros cambiados:', {
      entity: selectedEntity.value,
      year: selectedYear.value,
      variable: selectedVariable.value?.label
    })
  })

  // Inicializar variable por defecto
  const initializeFilters = () => {
    if (availableVariables.value.length > 0) {
      selectedVariable.value = availableVariables.value[0]
    }
  }

  return {
    // Estados reactivos
    selectedEntity,
    selectedYear,
    selectedVariable,
    loading,
    error,
    
    // Configuración
    availableYears,
    availableVariables,
    
    // Datos computados
    entitiesData,
    filteredData,
    filterStats,
    
    // Métodos
    loadFilterData,
    setEntityFilter,
    setYearFilter,
    setVariableFilter,
    applyFilters,
    resetFilters,
    searchEntities,
    exportFilteredData,
    getCurrentVariableValue,
    getVariableColorConfig,
    initializeFilters
  }
}