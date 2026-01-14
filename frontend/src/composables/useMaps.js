// src/composables/useMaps.js
// ✅ ACTUALIZADO: Obtiene datos de Google Sheets (misma fuente que el ranking)
// ✅ ACTUALIZADO: Nuevos rangos de IFSS (7 categorías)

import { ref, computed, onMounted } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'

export const useMaps = () => {
  // Estados reactivos
  const geoData = ref(null)
  const sustainabilityData = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const selectedState = ref(null)
  const hoveredState = ref(null)
  
  // Composable para obtener datos de Google Sheets
  const { fetchData } = useStorageData()
  
  // Configuración del mapa
  const mapConfig = ref({
    width: 470.2,
    height: 300.4,
    scale: 700,
    center: [-106, 25],
    projection: 'geoMercator'
  })

  // ============================================================================
  // COLORES BASE (7 categorías)
  // ============================================================================
  const COLORS = {
    VERDE_FUERTE: '#22c55e',
    VERDE: '#94d351',
    VERDE_BAJO: '#bddc50',
    AMARILLO: '#facc15',
    ANARANJADO: '#e6a74c',
    ROJO: '#ef4444',
    ROJO_FUERTE: '#dc2626'
  }

  // Computed para IFSS nacional
  const nationalIFSS = computed(() => {
    if (!sustainabilityData.value) return null
    
    const values = Object.values(sustainabilityData.value)
    const validValues = values.filter(item => item.value && item.value > 0)
    
    if (validValues.length === 0) return null
    
    const total = validValues.reduce((sum, item) => sum + item.value, 0)
    const average = total / validValues.length
    
    return {
      value: Math.round(average * 100) / 100,
      label: getIFSSLabel(average)
    }
  })

  // Cargar datos GeoJSON (se mantiene igual)
  const loadGeoData = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}mexicoStates.json`)
      if (!response.ok) throw new Error('Error al cargar datos geográficos')
      geoData.value = await response.json()
      console.log('✅ GeoData cargado:', geoData.value?.features?.length, 'estados')
    } catch (err) {
      console.error('❌ Error cargando GeoJSON:', err)
      error.value = err.message
    }
  }

  // ✅ Cargar datos de sustentabilidad desde Google Sheets
  // Usa la MISMA fuente que useStateRanking.js
  const loadSustainabilityData = async () => {
    try {
      console.log('📊 [useMaps] Cargando datos de Google Sheets...')
      
      // Obtener nombre de hoja dinámico (año activo)
      const sheetName = getSheetName('datosCuantitativos')
      console.log(`📅 [useMaps] Cargando desde hoja: "${sheetName}"`)
      
      // Obtener mapping (igual que en useStateRanking)
      const mapping = getMapping('rankingCuantitativo')
      const stateColumn = mapping.stateColumn  // 'Entidad Federativa'
      const valueColumn = mapping.columnsByVariable['IFSS']  // 'IFSS'
      
      console.log(`📋 [useMaps] Columnas: Estado="${stateColumn}", Valor="${valueColumn}"`)
      
      // Obtener datos de Google Sheets
      const data = await fetchData('datosCuantitativos', sheetName)
      
      if (!data || data.length === 0) {
        console.warn('⚠️ [useMaps] No se encontraron datos en el sheet')
        sustainabilityData.value = {}
        return
      }
      
      console.log(`📊 [useMaps] Datos crudos obtenidos: ${data.length} filas`)
      
      // Transformar datos al formato esperado por el mapa
      // Mismo proceso de limpieza que useStateRanking.js
      const processedData = {}
      
      data.forEach(row => {
        const stateName = row[stateColumn]
        const rawValue = row[valueColumn]
        
        if (!stateName || stateName.trim() === '') return
        
        // Limpiar valor (misma lógica que useStateRanking.js)
        let cleanValue = rawValue
        if (typeof rawValue === 'string') {
          // Eliminar comillas al inicio y final
          cleanValue = rawValue.replace(/^["']+|["']+$/g, '').trim()
          
          // Si quedó vacío o solo comillas, es 0
          if (cleanValue === '' || cleanValue === '""' || cleanValue === '"""') {
            cleanValue = '0'
          } else {
            // Manejar formato europeo vs americano
            if (cleanValue.includes(',')) {
              // Formato europeo: punto para miles, coma para decimales
              cleanValue = cleanValue.replace(/\./g, '').replace(',', '.')
            }
          }
        }
        
        const numericValue = parseFloat(cleanValue) || 0
        
        processedData[stateName] = {
          region: stateName,
          value: numericValue,
          year: parseInt(sheetName) || 2024  // Usar el año de la hoja
        }
      })
      
      sustainabilityData.value = processedData
      
      console.log(`✅ [useMaps] Datos procesados: ${Object.keys(processedData).length} estados`)
      
      // Log de ejemplo para verificar valores
      const ejemplos = Object.entries(processedData).slice(0, 3)
      console.log('📊 [useMaps] Ejemplos de datos:', ejemplos.map(([k, v]) => `${k}: ${v.value}`).join(', '))
      
    } catch (err) {
      console.error('❌ [useMaps] Error cargando datos de sustentabilidad:', err)
      error.value = err.message
      
      // Fallback: intentar cargar desde JSON local si falla Google Sheets
      console.log('🔄 [useMaps] Intentando fallback a JSON local...')
      await loadSustainabilityDataFallback()
    }
  }

  // Fallback: Cargar desde JSON local si Google Sheets falla
  const loadSustainabilityDataFallback = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}sustainabilityData.json`)
      if (!response.ok) throw new Error('Error al cargar datos de sustentabilidad (fallback)')
      const data = await response.json()
      
      sustainabilityData.value = data.reduce((acc, item) => {
        acc[item.region] = item
        return acc
      }, {})
      
      console.log('✅ [useMaps] Datos cargados desde fallback JSON:', Object.keys(sustainabilityData.value).length, 'estados')
    } catch (err) {
      console.error('❌ [useMaps] Error en fallback:', err)
      error.value = err.message
    }
  }

  // Método para recargar datos cuando cambia el año
  const reloadDataForYear = async (year) => {
    console.log(`🔄 [useMaps] Recargando datos para año: ${year}`)
    loading.value = true
    error.value = null
    
    try {
      await loadSustainabilityData()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
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

  // ============================================================================
  // ✅ ACTUALIZADO: Obtener color basado en IFSS (7 categorías)
  // Muy Alto: 3.5 – 4.0 | Alto: 2.9 – 3.4 | Medio Alto: 2.3 – 2.8
  // Medio: 1.8 – 2.2 | Medio Bajo: 1.2 – 1.7 | Bajo: 0.6 – 1.1 | Muy Bajo: 0.0 – 0.5
  // ============================================================================
  const getStateColor = (stateName) => {
    if (!sustainabilityData.value || !sustainabilityData.value[stateName]) {
      return '#e0e0e0'
    }
    
    const data = sustainabilityData.value[stateName]
    const ifssValue = data.value || 0
    
    // ✅ Nuevos rangos (7 categorías)
    if (ifssValue >= 3.5) return COLORS.VERDE_FUERTE  // Muy Alto (3.5 - 4.0)
    if (ifssValue >= 2.9) return COLORS.VERDE         // Alto (2.9 - 3.4)
    if (ifssValue >= 2.3) return COLORS.VERDE_BAJO    // Medio Alto (2.3 - 2.8)
    if (ifssValue >= 1.8) return COLORS.AMARILLO      // Medio (1.8 - 2.2)
    if (ifssValue >= 1.2) return COLORS.ANARANJADO    // Medio Bajo (1.2 - 1.7)
    if (ifssValue >= 0.6) return COLORS.ROJO          // Bajo (0.6 - 1.1)
    return COLORS.ROJO_FUERTE                         // Muy Bajo (0.0 - 0.5)
  }

  // Obtener info del estado
  const getStateInfo = (stateName) => {
    if (!sustainabilityData.value || !sustainabilityData.value[stateName]) {
      return {
        region: stateName,
        value: 0,
        year: 2024,
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
      year: Object.values(sustainabilityData.value)[0]?.year || 2024
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

  // MÉTODO PRINCIPAL: Manejar click en estado
  const handleStateClick = (stateName) => {
    console.log('🗺️ [useMaps] handleStateClick:', stateName)
    
    if (!stateName) {
      selectedState.value = null
      return
    }

    const normalizedName = stateName.trim()
    
    if (sustainabilityData.value) {
      if (sustainabilityData.value[normalizedName]) {
        selectedState.value = selectedState.value === normalizedName ? null : normalizedName
        console.log('✅ [useMaps] selectedState:', selectedState.value)
      } else {
        console.warn('⚠️ [useMaps] Estado no encontrado:', normalizedName)
        console.log('📋 [useMaps] Estados disponibles:', Object.keys(sustainabilityData.value))
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

  const filterByRange = (minValue = 0, maxValue = 5) => {
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

  // ============================================================================
  // ✅ ACTUALIZADO: Etiquetas IFSS (7 categorías)
  // Muy Alto: 3.5 – 4.0 | Alto: 2.9 – 3.4 | Medio Alto: 2.3 – 2.8
  // Medio: 1.8 – 2.2 | Medio Bajo: 1.2 – 1.7 | Bajo: 0.6 – 1.1 | Muy Bajo: 0.0 – 0.5
  // ============================================================================
  const getIFSSLabel = (ifssValue) => {
    const value = parseFloat(ifssValue) || 0
    
    if (value >= 3.5) return { label: 'Muy Alto', color: COLORS.VERDE_FUERTE }
    if (value >= 2.9) return { label: 'Alto', color: COLORS.VERDE }
    if (value >= 2.3) return { label: 'Medio Alto', color: COLORS.VERDE_BAJO }
    if (value >= 1.8) return { label: 'Medio', color: COLORS.AMARILLO }
    if (value >= 1.2) return { label: 'Medio Bajo', color: COLORS.ANARANJADO }
    if (value >= 0.6) return { label: 'Bajo', color: COLORS.ROJO }
    return { label: 'Muy Bajo', color: COLORS.ROJO_FUERTE }
  }
  
  onMounted(() => {
    initializeData()
  })

  return {
    // Estado
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
    initializeData,
    reloadDataForYear
  }
}