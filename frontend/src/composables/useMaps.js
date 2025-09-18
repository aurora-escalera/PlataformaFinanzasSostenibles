// src/composables/useMaps.js
import { ref, computed, onMounted } from 'vue'

export const useMaps = () => {
  // Estados reactivos
  const geoData = ref(null)
  const sustainabilityData = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const selectedState = ref(null)
  const hoveredState = ref(null)
  
  // Configuración del mapa
  const mapConfig = ref({
    width: 800,
    height: 600,
    scale: 2500,
    center: [-102, 23], // Centro aproximado de México
    projection: 'geoMercator'
  })

  // Cargar datos GeoJSON de México
  const loadGeoData = async () => {
    try {
      const response = await fetch('/src/modules/maps/assets/mexico-states.json')
      if (!response.ok) throw new Error('Error al cargar datos geográficos')
      geoData.value = await response.json()
    } catch (err) {
      console.error('Error cargando GeoJSON:', err)
      error.value = err.message
    }
  }

  // Cargar datos de sustentabilidad
  const loadSustainabilityData = async () => {
    try {
      const response = await fetch('/src/modules/maps/data/sustainability-data.json')
      if (!response.ok) throw new Error('Error al cargar datos de sustentabilidad')
      const data = await response.json()
      
      // Convertir array a objeto para búsqueda rápida por estado
      sustainabilityData.value = data.reduce((acc, item) => {
        acc[item.estado] = item
        return acc
      }, {})
    } catch (err) {
      console.error('Error cargando datos de sustentabilidad:', err)
      error.value = err.message
    }
  }

  // Inicializar datos
  const initializeData = async () => {
    loading.value = true
    error.value = null
    
    try {
      await Promise.all([
        loadGeoData(),
        loadSustainabilityData()
      ])
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Obtener color basado en el IFSS (Índice de Finanzas Sostenibles)
  const getStateColor = (stateName) => {
    if (!sustainabilityData.value || !sustainabilityData.value[stateName]) {
      return '#e0e0e0' // Color por defecto para estados sin datos
    }
    
    const data = sustainabilityData.value[stateName]
    const ifssValue = data.ifss || data.financiamiento_verde || 0
    
    // Escala de colores IFSS - De rojo (muy bajo) a verde (muy alto)
    if (ifssValue >= 85) return '#6ac952'       // Muy alto: Verde fuerte
    if (ifssValue >= 70) return '#94d351'       // Alto: Verde amarillento  
    if (ifssValue >= 55) return '#bddc50'       // Medio alto: Amarillo verdoso
    if (ifssValue >= 40) return '#e6d64f'       // Medio: Amarillo
    if (ifssValue >= 25) return '#e6a74c'       // Medio bajo: Naranja
    if (ifssValue >= 10) return '#e67849'       // Bajo: Naranja rojizo
    return '#e52845'                            // Muy bajo: Rojo intenso
  }

  // Obtener información del estado
  const getStateInfo = (stateName) => {
    if (!sustainabilityData.value || !sustainabilityData.value[stateName]) {
      return {
        nombre: stateName,
        ifss: 0,
        financiamiento_verde: 0,
        proyectos_activos: 0,
        inversion_total: 0,
        descripcion: 'Sin datos disponibles'
      }
    }
    
    return sustainabilityData.value[stateName]
  }

  // Computed para estadísticas generales
  const generalStats = computed(() => {
    if (!sustainabilityData.value) return null
    
    const values = Object.values(sustainabilityData.value)
    const totalStates = values.length
    const totalInvestment = values.reduce((sum, item) => sum + (item.inversion_total || 0), 0)
    const totalProjects = values.reduce((sum, item) => sum + (item.proyectos_activos || 0), 0)
    const avgIFSS = values.reduce((sum, item) => sum + (item.ifss || item.financiamiento_verde || 0), 0) / totalStates
    
    return {
      totalStates,
      totalInvestment,
      totalProjects,
      avgIFSS: Math.round(avgIFSS * 100) / 100
    }
  })

  // Encontrar estados con mejor y peor desempeño
  const topPerformingStates = computed(() => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value)
      .sort((a, b) => (b[1].ifss || b[1].financiamiento_verde || 0) - (a[1].ifss || a[1].financiamiento_verde || 0))
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }))
  })

  const worstPerformingStates = computed(() => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value)
      .sort((a, b) => (a[1].ifss || a[1].financiamiento_verde || 0) - (b[1].ifss || b[1].financiamiento_verde || 0))
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }))
  })

  // Métodos para manejo de eventos
  const handleStateClick = (stateName) => {
    selectedState.value = selectedState.value === stateName ? null : stateName
  }

  const handleStateHover = (stateName) => {
    hoveredState.value = stateName
  }

  const handleStateLeave = () => {
    hoveredState.value = null
  }

  // Resetear selección
  const resetSelection = () => {
    selectedState.value = null
    hoveredState.value = null
  }

  // Configurar tamaño del mapa
  const setMapSize = (width, height) => {
    mapConfig.value = {
      ...mapConfig.value,
      width,
      height
    }
  }

  // Buscar estado por nombre
  const searchState = (searchTerm) => {
    if (!sustainabilityData.value || !searchTerm) return []
    
    const term = searchTerm.toLowerCase()
    return Object.keys(sustainabilityData.value)
      .filter(state => state.toLowerCase().includes(term))
      .map(state => ({
        name: state,
        ...sustainabilityData.value[state]
      }))
  }

  // Filtrar por rango de valores IFSS
  const filterByRange = (minValue = 0, maxValue = 100) => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value)
      .filter(([_, data]) => {
        const value = data.ifss || data.financiamiento_verde || 0
        return value >= minValue && value <= maxValue
      })
      .map(([name, data]) => ({ name, ...data }))
  }

  // Obtener etiqueta de clasificación IFSS
  const getIFSSLabel = (ifssValue) => {
    if (ifssValue >= 85) return { label: 'Muy alto', color: '#6ac952' }
    if (ifssValue >= 70) return { label: 'Alto', color: '#94d351' }
    if (ifssValue >= 55) return { label: 'Medio alto', color: '#bddc50' }
    if (ifssValue >= 40) return { label: 'Medio', color: '#e6d64f' }
    if (ifssValue >= 25) return { label: 'Medio bajo', color: '#e6a74c' }
    if (ifssValue >= 10) return { label: 'Bajo', color: '#e67849' }
    return { label: 'Muy bajo', color: '#e52845' }
  }
  onMounted(() => {
    initializeData()
  })

  // Retornar todo lo que necesita el componente
  return {
    // Estados reactivos
    geoData,
    sustainabilityData,
    loading,
    error,
    selectedState,
    hoveredState,
    mapConfig,
    
    // Computed
    generalStats,
    topPerformingStates,
    worstPerformingStates,
    
    // Métodos
    getStateColor,
    getStateInfo,
    getIFSSLabel,
    handleStateClick,
    handleStateHover,
    handleStateLeave,
    resetSelection,
    setMapSize,
    searchState,
    filterByRange,
    initializeData
  }
}