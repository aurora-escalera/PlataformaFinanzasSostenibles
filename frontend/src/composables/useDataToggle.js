// src/composables/useDataToggle.js
import { ref, computed } from 'vue'

// ============================================================================
// ESTADO GLOBAL COMPARTIDO (Singleton)
// Estas variables están FUERA del composable para que todas las instancias
// compartan el mismo estado
// ============================================================================

const dataType = ref('subnacional') // 'federal' o 'subnacional'
const currency = ref('mxn') // 'usd' o 'mxn'

// Estado de filtros actual (recibido de HomePage)
const currentFiltersState = ref({
  selectedEntity: '',
  selectedYear: null,
  selectedVariable: null,
  selectedState: null
})

// Años disponibles (recibidos de HomePage)
const availableYears = ref([])

// ============================================================================
// CONSTANTES
// ============================================================================

const VIEW_TYPES = {
  FEDERAL: 'federal',
  SUBNACIONAL: 'subnacional'
}

// ============================================================================
// COMPOSABLE
// ============================================================================

export const useDataToggle = () => {
  
  // ============================================================================
  // MÉTODOS: TIPO DE DATOS
  // ============================================================================

  const setDataType = (type) => {
    if (type === 'federal' || type === 'subnacional') {
      dataType.value = type
      console.log('🔘 [useDataToggle] Tipo de datos cambiado a:', type)
    } else {
      console.error('❌ [useDataToggle] Tipo de datos inválido:', type)
    }
  }

  // ============================================================================
  // MÉTODOS: MONEDA
  // ============================================================================

  const setCurrency = (curr) => {
    if (curr === 'usd' || curr === 'mxn') {
      currency.value = curr
      console.log('💰 [useDataToggle] Moneda cambiada a:', curr.toUpperCase())
    } else {
      console.error('❌ [useDataToggle] Moneda inválida:', curr)
    }
  }

  const getExchangeRate = () => {
    return 17.5 // Ejemplo: 1 USD = 17.5 MXN
  }

  const convertCurrency = (value, fromCurrency = 'mxn') => {
    if (currency.value === fromCurrency) {
      return value
    }

    const rate = getExchangeRate()
    
    if (fromCurrency === 'mxn' && currency.value === 'usd') {
      return value / rate
    } else if (fromCurrency === 'usd' && currency.value === 'mxn') {
      return value * rate
    }

    return value
  }

  const formatCurrency = (value) => {
    const converted = convertCurrency(value)
    const locale = currency.value === 'usd' ? 'en-US' : 'es-MX'
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.value.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(converted)
  }

  // ============================================================================
  // LÓGICA DEL TOGGLE DE VISTA
  // ============================================================================

  /**
   * Actualiza el estado de filtros actual
   * @param {Object} state - Estado de filtros desde HomePage
   */
  const updateFiltersState = (state) => {
    console.log('📡 [useDataToggle] Actualizando estado de filtros:', state)
    currentFiltersState.value = { ...state }
    
    // Actualizar dataType basado en las condiciones
    const activeToggle = getActiveToggleFromFilters(state)
    if (activeToggle) {
      dataType.value = activeToggle
      console.log('🔄 [useDataToggle] dataType actualizado automáticamente a:', activeToggle)
    }
  }

  /**
   * Actualiza los años disponibles
   * @param {Array} years - Lista de años disponibles
   */
  const updateAvailableYears = (years) => {
    console.log('📅 [useDataToggle] Actualizando años disponibles:', years)
    availableYears.value = [...years]
  }

  /**
   * Determina qué toggle debe estar ACTIVO basado en el estado de filtros
   * @param {Object} state - Estado de filtros
   * @returns {'federal'|'subnacional'|null}
   */
  const getActiveToggleFromFilters = (state) => {
    const { selectedEntity, selectedYear, selectedVariable, selectedState } = state
    
    // Condición: isDefaultState (entity='', year=específico, variable=null)
    const isDefaultState = selectedEntity === '' && 
                           selectedYear !== null && 
                           selectedVariable === null
    
    // Condición: areAllFiltersOnTodas (entity=null, year=null, variable=null)
    const areAllFiltersOnTodas = selectedEntity === null && 
                                  selectedYear === null && 
                                  selectedVariable === null
    
    // Condición: showRegionalCharts (entity=null, year=específico)
    const showRegionalCharts = selectedEntity === null && 
                               selectedYear !== null && 
                               !areAllFiltersOnTodas
    
    // Condición: hasSelectedState (hay un estado seleccionado en el mapa)
    const hasSelectedState = selectedState !== null && selectedState !== ''
    
    console.log('🔍 [useDataToggle] Evaluando condiciones:', {
      isDefaultState,
      areAllFiltersOnTodas,
      showRegionalCharts,
      hasSelectedState,
      state
    })
    
    // ========================================================================
    // MAPEO DE CONDICIONES A TOGGLE ACTIVO
    // ========================================================================
    
    // CASO 1: DefaultInfoCard + RankingChart → "Datos Subnacionales" activo
    if (isDefaultState && !hasSelectedState) {
      console.log('📌 [useDataToggle] Caso 1: isDefaultState → SUBNACIONAL')
      return VIEW_TYPES.SUBNACIONAL
    }
    
    // CASO 2: HistoricalCard + LinearChart + Overlay Gris → "Datos Federales" activo
    if (areAllFiltersOnTodas && !hasSelectedState) {
      console.log('📌 [useDataToggle] Caso 2: areAllFiltersOnTodas → FEDERAL')
      return VIEW_TYPES.FEDERAL
    }
    
    // CASO 3: RegionalCharts + IFSRegionalCard + Overlay Azul → "Datos Federales" activo
    if (showRegionalCharts && !hasSelectedState) {
      console.log('📌 [useDataToggle] Caso 3: showRegionalCharts → FEDERAL')
      return VIEW_TYPES.FEDERAL
    }
    
    // CASO 4: ChartsComponent + RankingChart (estado seleccionado) → "Datos Subnacionales" activo
    if (hasSelectedState) {
      console.log('📌 [useDataToggle] Caso 4: hasSelectedState → SUBNACIONAL')
      return VIEW_TYPES.SUBNACIONAL
    }
    
    // Default: subnacional
    console.log('📌 [useDataToggle] Default → SUBNACIONAL')
    return VIEW_TYPES.SUBNACIONAL
  }

  /**
   * Computed: Toggle activo basado en el dataType actual
   */
  const activeToggle = computed(() => {
    return dataType.value
  })

  /**
   * Computed: ¿Está activo "Datos Subnacionales"?
   */
  const isSubnacionalActive = computed(() => {
    const result = dataType.value === VIEW_TYPES.SUBNACIONAL
    console.log('🔵 [useDataToggle] isSubnacionalActive:', result, '(dataType:', dataType.value, ')')
    return result
  })

  /**
   * Computed: ¿Está activo "Datos Federales"?
   */
  const isFederalActive = computed(() => {
    const result = dataType.value === VIEW_TYPES.FEDERAL
    console.log('🟢 [useDataToggle] isFederalActive:', result, '(dataType:', dataType.value, ')')
    return result
  })

  // ============================================================================
  // FILTROS PARA CLICK EN TOGGLE
  // ============================================================================

  /**
   * Obtiene los filtros para cuando se hace click en "Datos Subnacionales"
   * Resultado: DefaultInfoCard + RankingChart + No overlay
   * @returns {Object} - Valores de filtros a setear
   */
  const getSubnacionalClickFilters = () => {
    const firstYear = availableYears.value.length > 0 ? availableYears.value[0] : null
    
    return {
      entity: '',           // Guión "-"
      year: firstYear,      // Primer año disponible
      variable: null        // IFSS (todas)
    }
  }

  /**
   * Obtiene los filtros para cuando se hace click en "Datos Federales"
   * Resultado: LinearChart + HistoricalCard + Overlay Gris
   * @returns {Object} - Valores de filtros a setear
   */
  const getFederalClickFilters = () => {
    return {
      entity: null,         // "Datos Regionales" (todas las entidades)
      year: null,           // "Todos los años"
      variable: null        // IFSS (todas)
    }
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  const getCurrentConfig = () => {
    return {
      dataType: dataType.value,
      currency: currency.value,
      currencySymbol: currency.value === 'usd' ? '$' : '$',
      currencyCode: currency.value.toUpperCase(),
      activeToggle: activeToggle.value,
      filtersState: currentFiltersState.value
    }
  }

  const resetToDefaults = () => {
    dataType.value = 'subnacional'
    currency.value = 'mxn'
    currentFiltersState.value = {
      selectedEntity: '',
      selectedYear: null,
      selectedVariable: null,
      selectedState: null
    }
    console.log('🔄 [useDataToggle] Reseteado a valores por defecto')
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estados (compartidos globalmente)
    dataType,
    currency,
    currentFiltersState,
    availableYears,
    
    // Constantes
    VIEW_TYPES,
    
    // Computed
    activeToggle,
    isSubnacionalActive,
    isFederalActive,
    
    // Métodos de tipo de datos
    setDataType,
    
    // Métodos de moneda
    setCurrency,
    getExchangeRate,
    convertCurrency,
    formatCurrency,
    
    // Métodos del toggle de vista
    updateFiltersState,
    updateAvailableYears,
    getActiveToggleFromFilters,
    getSubnacionalClickFilters,
    getFederalClickFilters,
    
    // Utilidades
    getCurrentConfig,
    resetToDefaults
  }
}