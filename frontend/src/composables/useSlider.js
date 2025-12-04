// src/composables/useSlider.js
import { ref, computed } from 'vue'
import { useFilters } from './useFilters'

export function useSlider(mapsComposable) {
  // Obtener datos de filtros
  const {
    entitiesData,
    loading: filtersLoading,
    loadFilterData,
    initializeFilters
  } = useFilters()

  // Estados reactivos del slider
  const selectedRange = ref({
    min: 0,
    max: 3.0,
    minLabel: 'Muy bajo',
    maxLabel: 'Muy alto'
  })

  const filteredStates = ref([])
  const isSliderActive = ref(false)

  // Preparar datos para el slider
  const statesDataForSlider = computed(() => {
    return entitiesData.value.map(entity => ({
      region: entity.name,
      value: entity.value || 0,
      year: entity.year || 2023,
      ...entity // Incluir el resto de propiedades por si las necesitas
    }))
  })

  // Valor IFSS del estado seleccionado
  const selectedStateIFSS = computed(() => {
    if (!mapsComposable) return null
    
    const { selectedState, getStateInfo } = mapsComposable
    
    if (!selectedState.value) return null
    return getStateInfo(selectedState.value).value || 0
  })

  // Obtener el nombre del estado seleccionado
  const selectedStateName = computed(() => {
    if (!mapsComposable) return null
    return mapsComposable.selectedState.value
  })

  // Handler cuando cambia el rango del slider
  const handleRangeChange = (range) => {
    selectedRange.value = range
    isSliderActive.value = true
    
    console.log('📊 Rango IFSS seleccionado:', {
      min: range.min,
      max: range.max,
      minLabel: range.minLabel,
      maxLabel: range.maxLabel
    })

    // Emitir evento personalizado si lo necesitas
    return range
  }

  // Handler cuando se filtran los estados
  const handleFilterChange = (states) => {
    filteredStates.value = states
    
    console.log('🗺️ Estados filtrados por rango IFSS:', {
      total: states.length,
      estados: states.map(s => `${s.region}: ${s.value}`)
    })

    return states
  }

  // Resetear el slider a valores por defecto
  const resetSlider = () => {
    selectedRange.value = {
      min: 0,
      max: 3.0,
      minLabel: 'Muy bajo',
      maxLabel: 'Muy alto'
    }
    filteredStates.value = []
    isSliderActive.value = false
  }

  // Obtener clasificación de un estado específico
  const getStateClassification = (stateName) => {
    const state = statesDataForSlider.value.find(s => s.region === stateName)
    if (!state) return null

    const value = state.value
    
    // Rangos de clasificación
    if (value >= 2.5) return { label: 'Muy alto', color: '#6ac952' }
    if (value >= 2.0) return { label: 'Alto', color: '#94d351' }
    if (value >= 1.7) return { label: 'Medio alto', color: '#bddc50' }
    if (value >= 1.3) return { label: 'Medio', color: '#e6d64f' }
    if (value >= 1.0) return { label: 'Medio bajo', color: '#e6a74c' }
    if (value >= 0.7) return { label: 'Bajo', color: '#e67849' }
    return { label: 'Muy bajo', color: '#e52845' }
  }

  // Obtener estadísticas del rango actual
  const getRangeStats = computed(() => {
    if (!isSliderActive.value || filteredStates.value.length === 0) {
      return {
        count: statesDataForSlider.value.length,
        average: 0,
        min: 0,
        max: 0
      }
    }

    const values = filteredStates.value.map(s => s.value)
    const sum = values.reduce((a, b) => a + b, 0)
    
    return {
      count: values.length,
      average: (sum / values.length).toFixed(2),
      min: Math.min(...values).toFixed(1),
      max: Math.max(...values).toFixed(1)
    }
  })

  // Verificar si un estado está en el rango seleccionado
  const isStateInRange = (stateName) => {
    return filteredStates.value.some(s => s.region === stateName)
  }

  // Obtener ranking de estados ordenados por valor IFSS
  const getStatesRanking = computed(() => {
    const states = [...statesDataForSlider.value]
    return states
      .sort((a, b) => b.value - a.value)
      .map((state, index) => ({
        ...state,
        position: index + 1,
        classification: getStateClassification(state.region)
      }))
  })

  // Obtener posición de un estado específico
  const getStatePosition = (stateName) => {
    const ranking = getStatesRanking.value
    const state = ranking.find(s => s.region === stateName)
    return state ? state.position : null
  }

  // Inicializar datos
  const initialize = async () => {
    try {
      initializeFilters()
      await loadFilterData()
      console.log('✅ Slider inicializado con', statesDataForSlider.value.length, 'estados')
    } catch (error) {
      console.error('❌ Error inicializando slider:', error)
    }
  }

  return {
    // Estados reactivos
    entitiesData,
    statesDataForSlider,
    selectedStateIFSS,
    selectedStateName,
    selectedRange,
    filteredStates,
    isSliderActive,
    filtersLoading,
    
    // Computed
    getRangeStats,
    getStatesRanking,
    
    // Métodos
    handleRangeChange,
    handleFilterChange,
    resetSlider,
    getStateClassification,
    isStateInRange,
    getStatePosition,
    initialize,
    
    // Métodos de filtros (por si los necesitas)
    loadFilterData,
    initializeFilters
  }
}