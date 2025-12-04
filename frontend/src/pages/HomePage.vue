<!-- src/modules/maps/components/HomePage.vue -->
<!-- ✅ MODIFICADO: Añadido manejo del espacio en blanco para el filtro de Año -->
<template>
  <div class="filters-toggles-row">
    <!-- Columna izquierda: Filtros -->
    <div class="filters-column">
      <RetractableFilterBar 
        :key="filterBarKey"
        :entities="entitiesData"
        :loading="entitiesLoading"
        :selectedState="selectedState"
        :isLocked="isFilterBarLocked"
        :availableYears="availableYears"
        :initialEntity="selectedEntity"
        :initialYear="selectedYear"
        :initialVariable="selectedVariable"
        @entity-change="handleEntityChange"
        @year-change="handleYearChange" 
        @variable-change="handleVariableChange"
        @filters-change="handleFiltersChange"
      />
    </div>
  </div>
  
  <div class="map-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos del mapa...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <p>Error: {{ error }}</p>
      <button @click="initializeData" class="retry-btn">
        Reintentar
      </button>
    </div>

    <!-- Map Content -->
    <div v-if="!loading && !error" class="map-content">
      <!-- Contenedor principal con mapa y charts lado a lado -->
      <div 
        class="map-and-charts-wrapper" 
        :class="{ 'no-gap': isRetractableExpanded }"
        @click="handleMapContainerClick"
      >
          <!-- Componente del Mapa SVG -->
          <MexicoMapSVG
            :geoData="geoData"
            :selectedState="selectedState"
            :hoveredState="hoveredState"
            :mapConfig="mapConfig"
            :nationalIFSS="nationalIFSS"
            :getStateColor="getStateColor"
            :getStateInfo="getStateInfo"
            :getIFSSLabel="getIFSSLabel"
            :show-info-card="!isRetractableExpanded"
            :show-navigation="!isRetractableExpanded"
            :active-view="activeView"
            @state-click="handleStateClickWithEmit"
            @state-hover="handleStateHover"
            @state-leave="handleStateLeave"
            @navigate-regional="handleIFSRegionalClick"
            @navigate-federal="handleDatosFederalesClick"
          />
          
          <!-- ✅ Overlay sobre SOLO el mapa - Usa areAllFiltersOnTodas -->
          <transition name="overlay-fade">
            <div 
              v-if="showMapOverlay" 
              class="map-overlay-filter"
              @click.stop="handleOverlayClick"
            >
              <div class="overlay-message">
                <h2 class="overlay-text">
                  Haz click en cualquier entidad del mapa para regresar a los resultados subnacionales
                </h2>
              </div>
            </div>
          </transition>
          
        <!-- ✅ COMPONENTE: Panel Cualitativo - Escucha eventos de años y cierre -->
        <QualitativePanel
          :isExpanded="isRetractableExpanded"
          :selectedEntity="selectedEntity"
          :selectedYear="selectedYear"
          @toggle="handleDatosCualitativosClick"
          @years-loaded="handleYearsLoaded"
          @panel-closed="handlePanelClosed"
        />

        <!-- RANKING CHART SECTION - Al lado del mapa -->
        <!-- ✅ Solo mostrar cuando NO está expandido -->
        <div v-if="!isRetractableExpanded" class="charts-section">
          <div class="charts-container">
            <div class="ranking-chart-section" style="height: 100%; display: flex; flex-direction: column;">
              
              <!-- ========== LINEAR CHART CON CARD - Usa areAllFiltersOnTodas ========== -->
              <!-- Loading State para LinearChart -->
              <div v-if="showStackedArea && stackedAreaLoading" class="chart-card linear-chart-card">
                <div class="chart-card-header">
                  <h4 class="card-title">Evolución IFS</h4>
                </div>
                <div class="chart-card-body">
                  <div class="ranking-loading">
                    <div class="spinner-small"></div>
                    <p>Cargando evolución IFS...</p>
                  </div>
                </div>
              </div>
              
              <!-- Error State para LinearChart -->
              <div v-else-if="showStackedArea && stackedAreaError" class="chart-card linear-chart-card">
                <div class="chart-card-header">
                  <h4 class="card-title">Evolución IFS</h4>
                </div>
                <div class="chart-card-body">
                  <div class="ranking-error">
                    <p>Error: {{ stackedAreaError }}</p>
                    <button @click="loadIFSSData" class="retry-btn-small">
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- ✅ LinearChart de IFS con card wrapper -->
              <div 
                v-else-if="showStackedArea && stackedAreaChartData && Object.keys(stackedAreaChartData).length > 0" 
                class="chart-card linear-chart-card"
              >
                <div class="chart-card-header">
                  <h4 class="card-title">{{ stackedAreaTitle }}</h4>
                </div>
                <div class="chart-card-body">
                  <LinearChart
                    :data="stackedAreaChartData"
                    :xLabels="stackedAreaYears"
                    :showCurrencySymbol="false"
                    :width="940"
                    :height="440"
                    :hideHeader="true"
                    :initialVisibleVariables="['IFS']"
                    :padding="{
                      top: 20,
                      right: 70,
                      bottom: 100,
                      left: 60
                    }"
                  />
                </div>
              </div>
              
              <!-- ========== RANKING CHART ========== -->
              <!-- Loading State para Ranking -->
              <div v-else-if="rankingLoading" class="ranking-loading">
                <div class="spinner-small"></div>
                <p>Cargando datos...</p>
              </div>
              
              <!-- Error State para Ranking -->
              <div v-else-if="rankingError" class="ranking-error">
                <p>Error: {{ rankingError }}</p>
                <button @click="loadAllStatesRanking(selectedVariable)" class="retry-btn-small">
                  Reintentar
                </button>
              </div>
              
              <!-- ✅ HorizontalRankingChart - Solo cuando NO están todos en "Todas..." -->
              <HorizontalRankingChart
                v-else-if="rankingData.length > 0"
                :variables="rankingData"
                :title="getRankingTitle"
                :showAllBars="true"
                :animationDelay="0"
                :selectedState="selectedState"
              />
              
              <!-- Empty State -->
              <div v-else class="charts-empty-state">
                <div class="empty-state-icon">📊</div>
                <h4>Ranking IFSS</h4>
                <p>No hay datos de ranking disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Charts Component - Abajo -->
      <!-- ✅ Solo mostrar cuando NO está expandido el panel retráctil -->
      <div 
        v-if="showRankingPanel && !isRetractableExpanded" 
        class="ranking-panel"
        :class="{ 
          'historical-view': showHistoricalCard,
          'variable-view': hasSpecificVariable && !showHistoricalCard
        }"
      >
        <div class="header-ranking-panel">
          <div class="ranking-hamburger-menu">
            <img src="/public/icons/hamburger.png" alt="hamburger-menu" class="hamburger-icon">
          </div>
        </div>
        
        <div class="body-ranking-panel">
          <!-- ✅ Mostrar HistoricalCard cuando NO hay estado Y filtros están en "Todas..." -->
          <HistoricalCard
            v-if="showHistoricalCard"
            :statesData="statesDataForSlider"
            :selectedStateValue="selectedStateIFSS"
            @range-change="handleRangeChange"
            @filter-change="handleFilterChange"
          />
          
          <!-- ✅ Mostrar ChartsComponent cuando hay un estado seleccionado -->
          <ChartsComponent 
            v-else
            :selectedState="selectedState"
            :selectedYear="selectedYear"
            :selectedVariable="selectedVariable"
            :ifssData="getStateInfo(selectedState)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted  } from 'vue'
import { useMaps } from '@/composables/useMaps'
import { useCharts } from '@/composables/useCharts'
import { useRouter } from 'vue-router'
import MexicoMapSVG from '../modules/maps/components/MexicoMapSVG.vue'
import ChartsComponent from '../modules/charts/components/ChartsComponent.vue'
import RetractableFilterBar from '@/modules/maps/components/RetractableFilterBar.vue'
import HorizontalRankingChart from '../modules/charts/components/HorizontalRankingChart.vue'
import HistoricalCard from '../modules/object/component/HistoricalCard.vue'
import LinearChart from '../modules/charts/components/LinearChart.vue'
import QualitativePanel from '../modules/qualitativeIndicators/components/QualitativePanel.vue'
import { useSlider } from '@/composables/useSlider'
import { useStateRanking } from '@/composables/useStateRanking'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName, setActiveYear } from '@/dataConection/storageConfig'
import { useStackedAreaData } from '@/composables/useStackedArea'

const props = defineProps({
  title: {
    type: String,
    default: 'Mapa de México'
  },
  geoDataUrl: {
    type: String,
    default: '/mexicoStates.json'
  },
  dataUrl: {
    type: String,
    default: '/sustainabilityData.json'
  },
  legendTitle: {
    type: String,
    default: 'Valor IFSS'
  },
  mapsComposable: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['region-selected', 'map-error'])

const {
  geoData,
  loading,
  error,
  selectedState,
  hoveredState,
  mapConfig,
  generalStats,
  topPerformingStates,
  nationalIFSS,
  getStateColor,
  getStateInfo,
  getIFSSLabel,
  handleStateClick,
  handleStateHover,
  handleStateLeave,
  resetSelection,
  initializeData
} = props.mapsComposable || useMaps()

const {
  currentChartsData,
  setChartData
} = useCharts()

const {
  statesDataForSlider,
  selectedStateIFSS,
  handleRangeChange,
  handleFilterChange,
  initialize: initializeSlider
} = useSlider(props.mapsComposable || useMaps())

const {
  rankingData,
  loading: rankingLoading,
  error: rankingError,
  loadAllStatesRanking,
  updateRankingByVariable
} = useStateRanking()

const {
  chartData: stackedAreaChartData,
  years: stackedAreaYears,
  loading: stackedAreaLoading,
  error: stackedAreaError,
  title: stackedAreaTitle,
  loadIFSSData
} = useStackedAreaData()

const router = useRouter()
const selectedVariable = ref('')
const selectedYear = ref(null)
const selectedEntity = ref('')
const filterBarKey = ref(0)
const { fetchData: fetchEntities, fetchSheetNames } = useStorageData()

// ✅ Estado para controlar qué vista está activa ('federal' o 'regional')
const activeView = ref('federal')

// ✅ Array de años disponibles (dinámico)
const availableYears = ref([])

// ✅ Guardar años iniciales de cuantitativos
const initialYears = ref([])

// ✅ Guardar estado inicial de filtros
const initialFilters = ref({
  entity: '',
  year: null,
  variable: ''
})

watch(selectedEntity, (newVal, oldVal) => {
  console.log('🔍 [HomePage] selectedEntity cambió')
  console.log('  - Anterior:', oldVal)
  console.log('  - Nuevo:', newVal)
}, { immediate: true })

const entitiesData = ref([])
const entitiesLoading = ref(false)
const entitiesError = ref(null)

// ✅ Estado para controlar la expansión del panel retráctil
const isRetractableExpanded = ref(false)

// ============================================================================
// ✅ LÓGICA CENTRALIZADA DE FILTROS
// ============================================================================

/**
 * Obtiene el primer año válido de la lista de años disponibles
 */
const defaultYear = computed(() => {
  if (!availableYears.value || availableYears.value.length === 0) {
    return null
  }
  return availableYears.value.find(year => 
    year !== null && year !== undefined && year !== ''
  ) || null
})

/**
 * ✅ CONDICIÓN PRINCIPAL: Los 3 filtros en "Todas..." (null)
 * 
 * Cuando esto es TRUE, se muestra:
 * - Overlay en el mapa
 * - LinearChart (Análisis histórico del ranking de IFS)
 * - HistoricalCard en el panel inferior
 * - Filtro bloqueado
 */
const areAllFiltersOnTodas = computed(() => {
  const entityIsTodas = selectedEntity.value === null
  const yearIsTodos = selectedYear.value === null
  const variableIsTodas = selectedVariable.value === null
  
  const result = entityIsTodas && yearIsTodos && variableIsTodas
  
  console.log('🎯 [areAllFiltersOnTodas]:', {
    entity: selectedEntity.value, entityIsTodas,
    year: selectedYear.value, yearIsTodos,
    variable: selectedVariable.value, variableIsTodas,
    result
  })
  
  return result
})

/**
 * ✅ CONDICIÓN DE DEFAULT INICIAL:
 * - Entidad: '' (espacio en blanco "-")
 * - Año: primer año válido de la lista
 * - Variable: '' (espacio en blanco "-")
 * 
 * Se usa para detectar el estado inicial y activar vista 'federal'
 */
const areAllFiltersDefault = computed(() => {
  const entityIsDefault = selectedEntity.value === ''
  const yearIsDefault = selectedYear.value === defaultYear.value
  const variableIsDefault = selectedVariable.value === ''
  
  const result = entityIsDefault && yearIsDefault && variableIsDefault
  
  console.log('🎯 [areAllFiltersDefault]:', {
    entity: selectedEntity.value, entityIsDefault,
    year: selectedYear.value, defaultYear: defaultYear.value, yearIsDefault,
    variable: selectedVariable.value, variableIsDefault,
    result
  })
  
  return result
})

/**
 * ✅ MODIFICADO: Detecta si algún filtro está en blanco "-" (string vacío)
 * Ahora incluye también el filtro de Año
 */
const hasBlankFilter = computed(() => {
  return selectedEntity.value === '' || selectedYear.value === '' || selectedVariable.value === ''
})

/**
 * Detecta si hay una variable específica seleccionada
 */
const hasSpecificVariable = computed(() => {
  return selectedVariable.value !== null && selectedVariable.value !== ''
})

// ============================================================================
// ✅ COMPUTED QUE USAN areAllFiltersOnTodas
// ============================================================================

/**
 * ✅ Mostrar StackedArea/LinearChart cuando los 3 filtros están en "Todas..."
 */
const showStackedArea = computed(() => {
  if (isRetractableExpanded.value) {
    return false
  }
  return areAllFiltersOnTodas.value
})

/**
 * ✅ Mostrar overlay del mapa cuando los 3 filtros están en "Todas..."
 */
const showMapOverlay = computed(() => {
  if (isRetractableExpanded.value) {
    return false
  }
  return areAllFiltersOnTodas.value
})

/**
 * ✅ Bloquear barra de filtros cuando los 3 filtros están en "Todas..."
 */
const isFilterBarLocked = computed(() => {
  if (isRetractableExpanded.value) {
    return false
  }
  return areAllFiltersOnTodas.value
})

/**
 * Ocultar panel cuando hay filtros en blanco "-"
 */
const shouldHidePanel = computed(() => {
  return hasBlankFilter.value
})

/**
 * ✅ Mostrar HistoricalCard cuando:
 * - No hay filtros en blanco
 * - No hay estado seleccionado en el mapa
 * - Los 3 filtros están en "Todas..." (null)
 */
const showHistoricalCard = computed(() => {
  if (shouldHidePanel.value) return false
  return !selectedState.value && areAllFiltersOnTodas.value
})

/**
 * Mostrar panel de ranking cuando:
 * - No hay filtros en blanco
 * - Hay estado seleccionado O se debe mostrar HistoricalCard
 */
const showRankingPanel = computed(() => {
  if (shouldHidePanel.value) return false
  return selectedState.value || showHistoricalCard.value
})

// ============================================================================
// ✅ FUNCIONES DE CARGA DE DATOS
// ============================================================================

const loadEntitiesFromSheet = async () => {
  try {
    entitiesLoading.value = true
    entitiesError.value = null
    
    const presupuestosMapping = getMapping('chartsPresupuestos')
    const sheetName = getSheetName('chartsPresupuestos')
    const rawData = await fetchEntities('chartsPresupuestos', sheetName)
    
    const stateColumn = presupuestosMapping.stateColumn
    const uniqueEntities = [...new Set(rawData.map(row => row[stateColumn]))]
      .filter(entity => entity && entity.trim() !== '')
      .sort()
    
    entitiesData.value = uniqueEntities.map(entity => ({
      name: entity,
      value: null
    }))
    
  } catch (err) {
    console.error('❌ Error cargando entidades:', err)
    entitiesError.value = err.message
  } finally {
    entitiesLoading.value = false
  }
}

const fetchAvailableYears = async () => {
  try {
    console.log('📅 [HomePage] Obteniendo años de sheet cuantitativos...')
    
    const sheetNames = await fetchSheetNames('datosCuantitativos')
    
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    
    console.log('✅ [HomePage] Años de cuantitativos:', years)
    
    initialYears.value = [...years]
    availableYears.value = [...years]
    
    // ✅ NO establecer año aquí - dejar en null para que areAllFiltersOnTodas funcione
    // El año se establecerá solo cuando el usuario lo seleccione o cuando se vaya a default
    
    return years
    
  } catch (err) {
    console.error('❌ [HomePage] Error obteniendo años:', err)
    return []
  }
}

// ============================================================================
// ✅ HANDLERS DE CAMBIOS DE FILTROS
// ============================================================================

const handleEntityChange = (entity) => {
  console.log('📍 [HomePage] handleEntityChange llamado con:', entity)
  
  selectedEntity.value = entity
  
  if (entity === '') {
    resetSelection()
    return
  }
  
  if (entity === null) {
    // "Todas las entidades (IFS Regional)" seleccionado
    resetSelection()
    if (!isRetractableExpanded.value && !areAllFiltersOnTodas.value) {
      if (selectedVariable.value && selectedVariable.value !== '' && selectedVariable.value !== null) {
        updateRankingByVariable(selectedVariable.value)
      } else if (selectedVariable.value === null && selectedYear.value !== null && selectedYear.value !== '') {
        loadAllStatesRanking(null)
      }
    }
    return
  }
  
  // Entidad específica seleccionada
  handleStateClick(entity)
  
  // ✅ Cambiar variable a "Todas las variables" (null) cuando se selecciona una entidad
  selectedVariable.value = null
  console.log('📊 [HomePage] Variable cambiada a "Todas las variables"')
  
  console.log('🗺️ [HomePage] Mapa actualizado con:', entity)
}

const handleYearChange = async (year) => {
  console.log('📅 [HomePage] handleYearChange llamado con:', year)
  
  selectedYear.value = year
  
  // ✅ MODIFICADO: Solo establecer activeYear si no es string vacío ni null
  if (year && year !== '') {
    setActiveYear(year)
  }
  
  // Si ahora todos están en "Todas...", cargar datos del LinearChart
  if (areAllFiltersOnTodas.value) {
    await loadIFSSData()
  }
}

const handleVariableChange = (variable) => {
  console.log('📊 [HomePage] handleVariableChange llamado con:', variable)
  
  selectedVariable.value = variable
  
  if (variable === '') return
  
  // Si no hay estado seleccionado y no estamos en "Todas...", actualizar ranking
  if (!selectedState.value && !areAllFiltersOnTodas.value) {
    if (variable === null) {
      loadAllStatesRanking(null)
    } else {
      updateRankingByVariable(variable)
    }
  }
}

const handleFiltersChange = (filters) => {
  console.log('🔧 Filtros aplicados:', filters)
}

// ============================================================================
// ✅ HANDLERS DE INTERACCIÓN CON EL MAPA
// ============================================================================

const handleStateClickWithEmit = async (stateName) => {
  console.log('🗺️ [HomePage] Click en estado:', stateName)
  
  if (!stateName) {
    resetSelection()
    selectedEntity.value = ''
    emit('region-selected', null)
    
    if (!isRetractableExpanded.value) {
      if (selectedVariable.value && selectedVariable.value !== '' && selectedVariable.value !== null) {
        updateRankingByVariable(selectedVariable.value)
      } else if (!areAllFiltersOnTodas.value) {
        loadAllStatesRanking(null)
      }
    }
    return
  }
  
  handleStateClick(stateName)
  selectedEntity.value = stateName
  
  // ✅ Cambiar variable a "Todas las variables" (null) cuando se selecciona una entidad
  selectedVariable.value = null
  console.log('📊 [HomePage] Variable cambiada a "Todas las variables"')
  
  await nextTick()
  
  if (selectedState.value === stateName) {
    const stateData = getStateInfo(stateName)
    emit('region-selected', { name: stateName, data: stateData })
    console.log('✅ [HomePage] Estado seleccionado y sincronizado:', stateName)
  } else {
    emit('region-selected', null)
  }
}

const handleIFSRegionalClick = async () => {
  console.log('🌎 [HomePage] Cambiando a vista IFS Regional')
  
  activeView.value = 'regional'
  
  if (selectedState.value) {
    resetSelection()
  }
  
  // ✅ Establecer filtros a "Todas..." (null = Todas)
  selectedEntity.value = null
  selectedYear.value = null
  selectedVariable.value = null
  
  await nextTick()
  
  // Cargar datos del LinearChart
  await loadIFSSData()
  
  console.log('✅ [HomePage] Vista IFS Regional activada con filtros en "Todas..."')
}

const handleDatosFederalesClick = async () => {
  console.log('🏛️ [HomePage] Cambiando a vista Datos Federales (DEFAULT)')
  
  activeView.value = 'federal'
  
  // ✅ Cambiar filtros a DEFAULT ('', primerAño, '')
  selectedEntity.value = ''
  selectedVariable.value = ''
  
  if (availableYears.value.length > 0) {
    const firstYear = availableYears.value[0]
    selectedYear.value = firstYear
    setActiveYear(firstYear)
  }
  
  // Resetear mapa si hay estado seleccionado
  if (selectedState.value) {
    resetSelection()
  }
  
  filterBarKey.value++
  await nextTick()
  
  console.log('✅ Vista Datos Federales activada (DEFAULT)')
}

const handleDatosCualitativosClick = () => {
  console.log('🔄 Toggling panel cualitativo:', !isRetractableExpanded.value)
  isRetractableExpanded.value = !isRetractableExpanded.value
}

const handleYearsLoaded = async (years) => {
  console.log('📅 [HomePage] Años recibidos de ambientales:', years)
  
  if (years && years.length > 0) {
    availableYears.value = years
    
    const firstYear = years[0]
    selectedYear.value = firstYear
    setActiveYear(firstYear)
    
    filterBarKey.value++
    await nextTick()
    
    console.log('✅ Filtro actualizado con años de ambientales')
  }
}

const handlePanelClosed = async () => {
  console.log('🔄 [HomePage] Panel cualitativo cerrado, reseteando filtros a DEFAULT...')
  
  // ✅ Restaurar a DEFAULT ('', primerAño, '')
  selectedEntity.value = ''
  selectedVariable.value = ''
  
  // Restaurar años iniciales de cuantitativos
  availableYears.value = [...initialYears.value]
  
  // Establecer el primer año de cuantitativos (parte del DEFAULT)
  if (initialYears.value.length > 0) {
    const firstYear = initialYears.value[0]
    selectedYear.value = firstYear
    setActiveYear(firstYear)
    console.log('📅 Año restaurado a DEFAULT:', firstYear)
  }
  
  // Forzar re-render del filtro
  filterBarKey.value++
  await nextTick()
  
  // Resetear selección del mapa
  resetSelection()
  
  // Activar vista "Datos Federales"
  activeView.value = 'federal'
  
  console.log('✅ Filtros reseteados a DEFAULT, vista: Datos Federales')
}

const handleMapContainerClick = (event) => {
  if (event.target.classList.contains('map-svg-container') || 
      event.target.tagName === 'svg' ||
      event.target.classList.contains('map-background')) {
    resetSelection()
    emit('region-selected', null)
  }
}

const handleOverlayClick = async () => {
  console.log('🔲 [HomePage] Click en overlay, cambiando a DEFAULT...')
  
  // ✅ Cambiar a DEFAULT ('', primerAño, '') para salir de "Todas..."
  selectedEntity.value = ''
  selectedVariable.value = ''
  
  if (availableYears.value.length > 0) {
    const firstYear = availableYears.value[0]
    selectedYear.value = firstYear
    setActiveYear(firstYear)
  }
  
  resetSelection()
  emit('region-selected', null)
  
  // Activar vista "Datos Federales"
  activeView.value = 'federal'
  
  filterBarKey.value++
  await nextTick()
  
  console.log('✅ Cambiado a DEFAULT, vista: Datos Federales')
}

// ============================================================================
// ✅ COMPUTED ADICIONALES
// ============================================================================

const useLargePanelSize = computed(() => {
  return !selectedState.value
})

const getRankingTitle = computed(() => {
  const yearSuffix = selectedYear.value && selectedYear.value !== '' ? ` - ${selectedYear.value}` : ''
  
  if (!selectedVariable.value || !selectedVariable.value.key) {
    return `Ranking IFSS por Estado${yearSuffix}`
  }
  
  const variableLabels = {
    'PS': 'Presupuestos Sostenibles (PS)',
    'IIC': 'Ingresos Intensivos en Carbono (IIC)',
    'PIC': 'Presupuestos Intensivos en Carbono (PIC)',
    'IS': 'Ingresos Sostenibles (IS)'
  }
  
  return `Ranking ${variableLabels[selectedVariable.value.key] || 'IFSS'} por Estado${yearSuffix}`
})

// ============================================================================
// ✅ WATCHERS
// ============================================================================

/**
 * Watch para cargar datos del LinearChart y activar vista 'regional' cuando areAllFiltersOnTodas
 */
watch(areAllFiltersOnTodas, async (newValue, oldValue) => {
  console.log('👀 [areAllFiltersOnTodas] cambió de', oldValue, 'a', newValue)
  if (newValue && !oldValue) {
    // Activar vista "IFS Regional" cuando los 3 filtros están en "Todas..."
    activeView.value = 'regional'
    console.log('🌎 [HomePage] Filtros en "Todas...", activando vista IFS Regional')
    await loadIFSSData()
  }
})

/**
 * Watch para activar vista federal cuando los filtros vuelven a default
 */
watch(
  areAllFiltersDefault,
  (isDefault) => {
    if (isDefault && activeView.value !== 'federal') {
      console.log('🏛️ [HomePage] Filtros en default, activando vista Datos Federales')
      activeView.value = 'federal'
    }
  },
  { immediate: true }
)

/**
 * Watch para actualizar ranking cuando cambia la variable (y no estamos en "Todas...")
 */
watch(selectedVariable, (newVariable) => {
  if (newVariable === '') return
  if (areAllFiltersOnTodas.value) return // No actualizar ranking si estamos en "Todas..."
  
  if (!selectedState.value) {
    if (newVariable === null) {
      loadAllStatesRanking(null)
    } else {
      updateRankingByVariable(newVariable)
    }
  }
})

/**
 * Watch para recargar datos cuando cambia el año
 */
watch(selectedYear, async (newYear, oldYear) => {
  // ✅ MODIFICADO: Ignorar si el año es string vacío
  if (newYear === '') return
  
  if (newYear !== oldYear) {
    await loadEntitiesFromSheet()
    
    // Solo actualizar ranking si NO estamos en "Todas..."
    if (!areAllFiltersOnTodas.value) {
      if (selectedVariable.value !== '' && selectedVariable.value !== null) {
        await updateRankingByVariable(selectedVariable.value)
      } else if (selectedVariable.value === null) {
        await loadAllStatesRanking(null)
      }
    }
  }
})

/**
 * Watch para sincronizar selectedEntity cuando selectedState cambia desde el mapa
 */
watch(selectedState, (newState, oldState) => {
  console.log('👀 [HomePage] Watch selectedState:', { newState, oldState })
  
  if (newState && newState !== oldState) {
    if (selectedEntity.value !== newState) {
      selectedEntity.value = newState
      console.log('🔄 [HomePage] selectedEntity sincronizado con mapa:', newState)
    }
    
    const stateData = getStateInfo(newState)
    setChartData(stateData)
    emit('region-selected', {
      name: newState,
      data: stateData
    })
  } else if (!newState && oldState) {
    // ✅ Cuando se deselecciona, volver a '' (espacio en blanco)
    if (!isRetractableExpanded.value) {
      selectedEntity.value = ''
    }
    
    emit('region-selected', null)
  }
})

watch(error, (newError) => {
  if (newError) {
    emit('map-error', newError)
  }
})

// ============================================================================
// ✅ INICIALIZACIÓN
// ============================================================================

onMounted(async () => {
  console.log('\n🚀 ===== INICIALIZANDO HomePage =====')
  
  // Cargar años disponibles
  await fetchAvailableYears()
  
  await loadEntitiesFromSheet()
  await initializeSlider()
  
  // ✅ Establecer filtros iniciales en DEFAULT ('', primerAño, '')
  // Entidad y Variable en blanco "-", Año con el primer valor
  selectedEntity.value = ''
  selectedVariable.value = ''
  
  // Establecer el primer año válido (parte del DEFAULT)
  if (availableYears.value.length > 0) {
    const firstYear = availableYears.value[0]
    selectedYear.value = firstYear
    setActiveYear(firstYear)
    console.log('📅 Año inicial establecido:', firstYear)
  }
  
  // Guardar estado inicial de filtros (DEFAULT)
  initialFilters.value = {
    entity: '',
    year: selectedYear.value,
    variable: ''
  }
  console.log('💾 Estado inicial de filtros (DEFAULT):', initialFilters.value)
  console.log('💾 Años iniciales guardados:', initialYears.value)
  
  // ✅ Vista por defecto es 'federal' (cuando está en DEFAULT)
  activeView.value = 'federal'
  console.log('🏛️ Vista inicial: Datos Federales (DEFAULT)')
  
  console.log('✅ HomePage inicializado')
  console.log('   areAllFiltersDefault:', areAllFiltersDefault.value)
  console.log('   areAllFiltersOnTodas:', areAllFiltersOnTodas.value)
  console.log('\n')
})
</script>

<style scoped>
.map-container {
  width: 95%;
  max-width: 2000px;
  margin: 0 auto;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgb(203, 199, 199);
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background: #d32f2f;
}

.map-and-charts-wrapper {
  display: flex;
  gap: 10px;
  padding: 19.6px;  
  border-radius: 15px;
  height: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
  z-index: 2;
  position: relative;
  transition: gap 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  height: 100%;
}

.map-and-charts-wrapper.no-gap {
  gap: 0;
}

.charts-section {
  transform: translateX(-48px);
  height: 605px;
  border-radius: 8px;
  width: 980px;
  transition: all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.charts-container {
  height: 100%;
  width: 985px;
}

.ranking-loading, .ranking-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.spinner-small {
  width: 30px;
  height: 30px;
  border: 3px solid rgb(203, 199, 199);
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.retry-btn-small {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 10px;
}

.retry-btn-small:hover {
  background: #d32f2f;
}

.charts-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
  padding: 40px;
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.charts-empty-state h4 {
  margin: 0 0 10px 0;
  color: #666;
}

.charts-empty-state p {
  margin: 0;
  font-size: 14px;
}

.filters-toggles-row {
  display: flex;
  gap: 20px;
  height: 110px;
  width: 95%;
  max-width: 2000px;
  margin: 0 auto 0px auto;
  align-items: center;
}

.filters-column {
  flex: 1;
  min-width: 600px;
  max-width: 850px;
}

.ranking-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 1040px;
  transition: height 0.3s ease;
}

.ranking-panel.historical-view {
  width: 2000px;
  height: 2040px;
  padding-bottom: 70px;
  transition: all 0.3s ease;
}

.ranking-panel.variable-view {
  width: 2000px;
  height: 1350px; 
  padding-bottom: 70px;
  transition: all 0.3s ease;
}

.header-ranking-panel {
  display: flex;
  flex-direction: row; 
  height: 1%;
  width: 100%;
  padding: 0px;
  margin-bottom: 0px;
}

h2 {
  padding: 4px 0 2px 0;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 200;
  color: #535353;
  font-size: 20px;
  margin: 0;  
  flex-shrink: 0;
  justify-content: space-between; 
  margin-right: auto; 
}

.ranking-hamburger-menu {
  margin-left: auto;
}

.body-ranking-panel {
  height: 100%;
  width: 100%;
}

.map-overlay-filter {
  position: absolute;
  top: 19.6px;
  left: 19.6px;
  width: calc(50% - 60px);
  height: calc(100% - 40px);
  background: rgba(180, 180, 180, 0.92);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  cursor: pointer;
  transition: background 0.3s ease;
  border-radius: 8px;
}

.map-overlay-filter:hover {
  background: rgba(160, 160, 160, 0.94);
}

.overlay-message {
  text-align: center;
  padding: 30px;
  max-width: 450px;
}

.overlay-text {
  font-size: 18px;
  font-weight: 300;
  color: #2d3748;
  margin: 0;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.chart-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #163C5F;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #1a365d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
  overflow: hidden;
}

.chart-card-header {
  display: flex;
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 8px;
  border-bottom: 3px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.card-title {
  padding: 4px 0 2px 0;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100;
  color: white;
  font-size: 18px;
  margin: 0;
  line-height: 1.3;
}

.chart-card-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
}

.linear-chart-card {
  height: 100%;
}

.chart-card .ranking-loading,
.chart-card .ranking-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}
</style>

<style>
body {
  zoom: 0.92;
  overflow-x: visible;
}

#app {
  zoom: 0.92;
  overflow-x: visible;
}
</style>