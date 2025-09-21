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
    width: 1200,
    height: 800,
    scale: 1600,
    center: [-101, 23], // Centro aproximado de México
    projection: 'geoMercator'
  })

  // Computed para IFSS nacional (promedio de todos los estados)
  const nationalIFSS = computed(() => {
    if (!sustainabilityData.value) return null
    
    const values = Object.values(sustainabilityData.value)
    const total = values.reduce((sum, item) => sum + (item.value || 0), 0)
    const average = total / values.length
    
    return {
      value: Math.round(average * 100) / 100,
      label: getIFSSLabel(average)
    }
  })

  // Cargar datos GeoJSON de México
  const loadGeoData = async () => {
    try {
      const response = await fetch('/mexicoStates.json')
      if (!response.ok) throw new Error('Error al cargar datos geográficos')
      geoData.value = await response.json()
      console.log('GeoData cargado:', geoData.value)
    } catch (err) {
      console.error('Error cargando GeoJSON:', err)
      error.value = err.message
    }
  }

  // Cargar datos de sustentabilidad
  const loadSustainabilityData = async () => {
    try {
      const response = await fetch('/sustainabilityData.json')
      if (!response.ok) throw new Error('Error al cargar datos de sustentabilidad')
      const data = await response.json()
      
      console.log('Datos brutos:', data)
      
      // Convertir array a objeto para búsqueda rápida por estado
      sustainabilityData.value = data.reduce((acc, item) => {
        acc[item.region] = item
        return acc
      }, {})
      
      console.log('Datos procesados:', sustainabilityData.value)
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

  // Obtener color basado en el valor IFSS - AJUSTADO PARA TUS VALORES REALES
  const getStateColor = (stateName) => {
    if (!sustainabilityData.value || !sustainabilityData.value[stateName]) {
      return '#e0e0e0' // Color por defecto para estados sin datos
    }
    
    const data = sustainabilityData.value[stateName]
    const ifssValue = data.value || 0
    
    // Escala ajustada para tus valores reales (0.5 - 2.9)
    // Invertida porque valores altos = mejor = verde
    if (ifssValue >= 2.5) return '#6ac952'       // Muy alto: Verde fuerte
    if (ifssValue >= 2.0) return '#94d351'       // Alto: Verde amarillento  
    if (ifssValue >= 1.8) return '#bddc50'       // Medio alto: Amarillo verdoso
    if (ifssValue >= 1.5) return '#e6d64f'       // Medio: Amarillo
    if (ifssValue >= 1.0) return '#e6a74c'       // Medio bajo: Naranja
    if (ifssValue >= 0.7) return '#e67849'       // Bajo: Naranja rojizo
    return '#e52845'                             // Muy bajo: Rojo intenso
  }

  // Obtener información del estado
  const getStateInfo = (stateName) => {
    if (!sustainabilityData.value || !sustainabilityData.value[stateName]) {
      return {
        region: stateName,
        value: 0,
        year: 2023,
        proyectos_activos: 0,
        inversion_total: 0,
        descripcion: 'Sin datos disponibles'
      }
    }
    
    const data = sustainabilityData.value[stateName]
    
    // Agregar campos simulados para compatibilidad con el componente
    return {
      ...data,
      proyectos_activos: Math.floor(data.value * 10), // Simulado basado en IFSS
      inversion_total: data.value * 1000000000, // Simulado: valor * 1B pesos
      descripcion: `Estado con IFSS de ${data.value}. ${getIFSSLabel(data.value).label} nivel de finanzas sostenibles.`
    }
  }

  // Computed para estadísticas generales
  const generalStats = computed(() => {
    if (!sustainabilityData.value) return null
    
    const values = Object.values(sustainabilityData.value)
    const totalStates = values.length
    
    // Simulados basados en los valores IFSS
    const totalInvestment = values.reduce((sum, item) => sum + (item.value * 1000000000), 0)
    const totalProjects = values.reduce((sum, item) => sum + Math.floor(item.value * 10), 0)
    const avgIFSS = values.reduce((sum, item) => sum + (item.value || 0), 0) / totalStates
    
    return {
      totalStates,
      totalInvestment,
      totalProjects,
      avgIFSS: Math.round(avgIFSS * 100) / 100
    }
  })

  // Encontrar estados con mejor desempeño
  const topPerformingStates = computed(() => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value)
      .sort((a, b) => (b[1].value || 0) - (a[1].value || 0))
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }))
  })

  const worstPerformingStates = computed(() => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value)
      .sort((a, b) => (a[1].value || 0) - (b[1].value || 0))
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
  const filterByRange = (minValue = 0, maxValue = 3) => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value)
      .filter(([_, data]) => {
        const value = data.value || 0
        return value >= minValue && value <= maxValue
      })
      .map(([name, data]) => ({ name, ...data }))
  }

  // Obtener etiqueta de clasificación IFSS - CORREGIDA PARA VALORES ALTOS = MEJOR
  const getIFSSLabel = (ifssValue) => {
    if (ifssValue >= 2.5) return { label: 'Muy alto', color: '#6ac952' }
    if (ifssValue >= 2.0) return { label: 'Alto', color: '#94d351' }
    if (ifssValue >= 1.8) return { label: 'Medio alto', color: '#bddc50' }
    if (ifssValue >= 1.5) return { label: 'Medio', color: '#e6d64f' }
    if (ifssValue >= 1.0) return { label: 'Medio bajo', color: '#e6a74c' }
    if (ifssValue >= 0.7) return { label: 'Bajo', color: '#e67849' }
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
    nationalIFSS,
    
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