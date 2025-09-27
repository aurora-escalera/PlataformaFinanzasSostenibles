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
    scale: 1200,
    center: [-101, 23],
    projection: 'geoMercator'
  })

  // Computed para IFSS nacional
  const nationalIFSS = computed(() => {
    if (!sustainabilityData.value) return null
    
    const values = Object.values(sustainabilityData.value)
    const validValues = values.filter(item => item.value && item.value > 0)
    const total = validValues.reduce((sum, item) => sum + item.value, 0)
    const average = total / validValues.length
    
    return {
      value: Math.round(average * 100) / 100,
      label: getIFSSLabel(average)
    }
  })

  // Cargar datos GeoJSON
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

  // Obtener color basado en IFSS
  const getStateColor = (stateName) => {
    if (!sustainabilityData.value || !sustainabilityData.value[stateName]) {
      return '#e0e0e0'
    }
    
    const data = sustainabilityData.value[stateName]
    const ifssValue = data.value || 0
    
    if (ifssValue >= 2.5) return '#6ac952'
    if (ifssValue >= 2.0) return '#94d351'
    if (ifssValue >= 1.8) return '#bddc50'
    if (ifssValue >= 1.5) return '#e6d64f'
    if (ifssValue >= 1.0) return '#e6a74c'
    if (ifssValue >= 0.7) return '#e67849'
    return '#e52845'
  }

  // Obtener info del estado
  const getStateInfo = (stateName) => {
    if (!sustainabilityData.value || !sustainabilityData.value[stateName]) {
      return {
        region: stateName,
        value: 0,
        year: 2023,
        descripcion: 'Sin datos IFSS disponibles'
      }
    }
    
    const data = sustainabilityData.value[stateName]
    
    return {
      region: data.region,
      year: data.year,
      value: data.value,
      descripcion: `IFSS: ${data.value} - ${getIFSSLabel(data.value).label} nivel de finanzas sostenibles.`
    }
  }

  // Estadísticas generales
  const generalStats = computed(() => {
    if (!sustainabilityData.value) return null
    
    const values = Object.values(sustainabilityData.value)
    const ifssValues = values.map(item => item.value || 0).filter(v => v > 0)
    
    if (ifssValues.length === 0) return null
    
    const totalStates = ifssValues.length
    const avgIFSS = ifssValues.reduce((sum, val) => sum + val, 0) / totalStates
    const maxIFSS = Math.max(...ifssValues)
    const minIFSS = Math.min(...ifssValues)
    
    return {
      totalStates,
      avgIFSS: Math.round(avgIFSS * 100) / 100,
      maxIFSS,
      minIFSS,
      year: 2023
    }
  })

  // Top 5 estados
  const topPerformingStates = computed(() => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value)
      .sort((a, b) => (b[1].value || 0) - (a[1].value || 0))
      .slice(0, 5)
      .map(([name, data]) => ({ 
        name, 
        region: data.region,
        year: data.year,
        value: data.value
      }))
  })

  const worstPerformingStates = computed(() => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value)
      .sort((a, b) => (a[1].value || 0) - (b[1].value || 0))
      .slice(0, 5)
      .map(([name, data]) => ({ 
        name, 
        region: data.region,
        year: data.year,
        value: data.value
      }))
  })

  // MÉTODO PRINCIPAL: Manejar click en estado - CON LOGS DE DEBUG
  const handleStateClick = (stateName) => {
    console.log('=== USEMAPS: handleStateClick llamado con ===', stateName)
    console.log('=== USEMAPS: sustainabilityData disponible? ===', !!sustainabilityData.value)
    
    if (!stateName) {
      selectedState.value = null
      return
    }

    // Normalizar nombre
    const normalizedName = stateName.trim()
    console.log('=== USEMAPS: Nombre normalizado ===', normalizedName)
    
    if (sustainabilityData.value) {
      console.log('=== USEMAPS: Keys en sustainabilityData ===', Object.keys(sustainabilityData.value))
      
      if (sustainabilityData.value[normalizedName]) {
        selectedState.value = selectedState.value === normalizedName ? null : normalizedName
        console.log('=== USEMAPS: selectedState actualizado a ===', selectedState.value)
      } else {
        console.warn('=== USEMAPS: Estado NO encontrado ===', normalizedName)
      }
    }
  }

  const handleStateHover = (stateName) => {
    hoveredState.value = stateName
  }

  const handleStateLeave = () => {
    hoveredState.value = null
  }

  const resetSelection = () => {
    selectedState.value = null
    hoveredState.value = null
  }

  const setMapSize = (width, height) => {
    mapConfig.value = {
      ...mapConfig.value,
      width,
      height
    }
  }

  const searchState = (searchTerm) => {
    if (!sustainabilityData.value || !searchTerm) return []
    
    const term = searchTerm.toLowerCase()
    return Object.keys(sustainabilityData.value)
      .filter(state => state.toLowerCase().includes(term))
      .map(state => ({
        name: state,
        region: sustainabilityData.value[state].region,
        year: sustainabilityData.value[state].year,
        value: sustainabilityData.value[state].value
      }))
  }

  const filterByRange = (minValue = 0, maxValue = 3) => {
    if (!sustainabilityData.value) return []
    
    return Object.entries(sustainabilityData.value)
      .filter(([_, data]) => {
        const value = data.value || 0
        return value >= minValue && value <= maxValue
      })
      .map(([name, data]) => ({ 
        name, 
        region: data.region,
        year: data.year,
        value: data.value
      }))
  }

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

  return {
    geoData,
    sustainabilityData,
    loading,
    error,
    selectedState,
    hoveredState,
    mapConfig,
    generalStats,
    topPerformingStates,
    worstPerformingStates,
    nationalIFSS,
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