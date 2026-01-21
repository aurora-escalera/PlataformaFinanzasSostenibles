<!-- src/modules/maps/components/HomePage.vue -->
<!-- ✅ VERSIÓN CORREGIDA: Los handlers ahora actualizan las refs PRIMERO antes de verificar condiciones -->
<template>
  <div class="filters-toggles-row">
    <!-- Columna izquierda: Filtros -->
    <div class="filters-column">
      <RetractableFilterBar 
        ref="filterBarRef"
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
            :selectedVariable="selectedVariable"
            @state-click="handleStateClickWithEmit"
            @state-hover="handleStateHover"
            @state-leave="handleStateLeave"
            @navigate-regional="handleIFSRegionalClick"
            @navigate-federal="handleDatosFederalesClick"
            @view-change="handleViewChange"
            @legend-filter-change="handleLegendFilterChange"
          />
          <!-- Overlay sobre SOLO el mapa - Aparece cuando entidad es "Datos Regionales" (null) -->
          <transition name="overlay-fade">
            <div 
              v-if="showMapOverlay" 
              class="map-overlay-filter regional-overlay"
              @click.stop="handleOverlayClick"
            >
              <div class="overlay-message">
                <h2 class="overlay-text">
                  {{ overlayMessage }}
                </h2>
              </div>
            </div>
          </transition>
          
          
        <!-- COMPONENTE: Panel Cualitativo - Escucha eventos de años y cierre -->
        <QualitativePanel
          v-if="!isMobile"
          :isExpanded="isRetractableExpanded"
          :selectedEntity="selectedEntity"
          :selectedYear="selectedYear"
          :currentDataView="currentDataView"
          @toggle="handleDatosCualitativosClick"
          @years-loaded="handleYearsLoaded"
          @panel-closed="handlePanelClosed"
        />

        <!-- RANKING CHART SECTION - Al lado del mapa -->
        <!-- Solo mostrar cuando NO está expandido -->
        <div v-if="!isRetractableExpanded" class="charts-section">
          <div class="charts-container">
            <div class="ranking-chart-section" style="height: 100%; display: flex; flex-direction: column;">
              
              <!-- ========== STACKED AREA CHART CON CARD ========== -->
              <!-- Solo cuando: Entidad=null, Año=null (Todos los años) -->
              <!-- Loading State para StackedArea -->
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
              
              <!-- Error State para StackedArea -->
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
              
              <!-- StackedArea de IFS con card wrapper -->
              <div 
                v-else-if="showStackedArea && stackedAreaChartData && Object.keys(stackedAreaChartData).length > 0" 
                class="chart-card linear-chart-card"
              >
                <div class="chart-card-header">
                  <h4 class="card-title">{{ stackedAreaTitle }}</h4>
                </div>
                <div class="chart-card-body">
                  <StackedArea
                    :data="stackedAreaChartData"
                    :xLabels="stackedAreaYears"
                    :showCurrencySymbol="false"
                    :width="940"
                    :height="440"
                    :hideHeader="true"
                    :initialVisibleVariables="['IFS']"
                    :positionsByYear="stackedAreaPositions"
                    :decimalPlaces="2"
                    :buttonLabels="{ 'IFS': 'Índice de Finanzas Sostenibles' }"
                    :hideCurrencyLegend="true"
                    />
                </div>
              </div>
              
              <!-- ========== IFS REGIONAL CARD ========== -->
              <!-- ✅ PRIORIDAD: Mostrar cuando Entidad=null, Año=específico, Variable=null -->
              <IFSRegionalCard 
                v-else-if="showRegionalCharts"
                :selectedYear="selectedYear"
                :selectedVariable="selectedVariable"
                @years-loaded="handleInternationalYearsLoaded"
              />
              
              <!-- ========== RANKING CHART ========== -->
              <!-- ✅ Solo mostrar cuando NO showRegionalCharts -->
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
              
              <!-- HorizontalRankingChart - Solo cuando hay datos y NO showRegionalCharts -->
              <HorizontalRankingChart
                v-else-if="rankingData.length > 0"
                :variables="rankingData"
                :title="getRankingTitle"
                :showAllBars="true"
                :animationDelay="0"
                :selectedState="selectedState"
                :selectedVariable="selectedVariable"
                :legendFilter="activeLegendFilter"
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

      <DefaultInfoCard 
        v-if="isDefaultState && !isRetractableExpanded"
      />
      <!-- Panel de Charts Component - Abajo -->
      <!-- Solo mostrar cuando NO está expandido el panel retráctil -->
      <div 
        v-if="showRankingPanel && !isRetractableExpanded" 
        class="ranking-panel"
        :class="{ 
          'historical-view': showHistoricalCard,
          'regional-view': showRegionalCharts,
          'variable-view': hasSpecificVariable && !showHistoricalCard && !showRegionalCharts
        }"
      >
        <div class="header-ranking-panel">
        </div>
        
        <div class="body-ranking-panel">
          <!-- Mostrar HistoricalCard cuando NO hay estado Y filtros están en "Todas..." -->
        <HistoricalCard
          v-if="showHistoricalCard"
          :statesData="statesDataForSlider"
          :selectedStateValue="selectedStateIFSS"
          :selectedEntity="selectedEntity"
          :selectedYear="selectedYear"
          :selectedVariable="selectedVariable"
          @range-change="handleRangeChange"
          @filter-change="handleFilterChange"
        />
          
          <!-- ✅ RegionalChartsComponent cuando Entidad=null, Año=específico, Variable=null -->
          <RegionalChartsComponent 
            v-else-if="showRegionalCharts"
            :selectedYear="selectedYear"
            :selectedVariable="selectedVariable"
            class="regional-charts-spacing"
            @years-loaded="handleRegionalYearsLoaded"
          />
          
          <!-- Mostrar ChartsComponent cuando hay un estado seleccionado -->
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
import { ref, watch, nextTick, computed, onMounted, inject } from 'vue'
import { useMaps } from '@/composables/useMaps'
import { useCharts } from '@/composables/useCharts'
import { useRouter } from 'vue-router'
import MexicoMapSVG from '../modules/maps/components/MexicoMapSVG.vue'
import ChartsComponent from '../modules/charts/components/ChartsComponent.vue'
import RegionalChartsComponent from '../modules/charts/components/RegionalChartsComponent.vue'
import IFSRegionalCard from '../modules/charts/components/IFSRegionalCard.vue'
import RetractableFilterBar from '@/modules/maps/components/RetractableFilterBar.vue'
import HorizontalRankingChart from '../modules/charts/components/HorizontalRankingChart.vue'
import HistoricalCard from '../modules/object/component/HistoricalCard.vue'
import StackedArea from '../modules/charts/components/StackedArea.vue'
import QualitativePanel from '../modules/qualitativeIndicators/components/QualitativePanel.vue'
import { useSlider } from '@/composables/useSlider'
import { useStateRanking } from '@/composables/useStateRanking'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName, setActiveYear } from '@/dataConection/storageConfig'
import { useStackedAreaData } from '@/composables/useStackedArea'
import DefaultInfoCard from '@/modules/maps/components/DefaultInfoCard.vue'
import { useDataToggle } from '@/composables/useDataToggle'

const props = defineProps({
  title: {
    type: String,
    default: 'Mapa de México'
  },
  geoDataUrl: {
    type: String,
    default: () => `${import.meta.env.BASE_URL}mexicoStates.json`
  },
  dataUrl: {
    type: String,
    default: () => `${import.meta.env.BASE_URL}sustainabilityData.json`
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

// AGREGAR: Ref para el FilterBar
const filterBarRef = ref(null)

// AGREGAR: Inject para recibir la acción de abrir filtros desde App.vue
const openFiltersAction = inject('openFiltersAction', ref(null))

// AGREGAR: Watch para abrir el drawer cuando llegue la acción
watch(openFiltersAction, (action) => {
  if (action && filterBarRef.value) {
    console.log('📱 [HomePage] Abriendo drawer de filtros')
    filterBarRef.value.openMobileDrawer()
  }
})

// AGREGAR: Emitir contador de filtros activos
const emitFiltersCount = () => {
  const count = filterBarRef.value?.activeFiltersCount || 0
 
  emit('filters-count-change', count)
}

// ============================================================================
// ✅ Estado para filtro de leyenda del mapa
// ============================================================================
const activeLegendFilter = ref(null)

/**
 * Handler para cuando cambia el filtro de leyenda desde el mapa
 */
const handleLegendFilterChange = (filter) => {
  console.log('🎨 [HomePage] Filtro de leyenda cambió:', filter)
  activeLegendFilter.value = filter
  
  // Debug: mostrar estados filtrados
  if (filter && filter.states) {
    console.log('🎨 [HomePage] Estados filtrados:', filter.states)
    console.log('🎨 [HomePage] Total:', filter.states.length, 'estados')
  }
}

// ============================================================================
// EMITS - Incluyendo eventos para el toggle
// ============================================================================
const emit = defineEmits([
  'region-selected', 
  'map-error',
  'filters-state-change',
  'available-years-change',
  'filters-count-change' 
])

// ============================================================================
// INJECT - Recibir acciones del toggle desde App.vue
// ============================================================================
const toggleAction = inject('toggleAction', ref(null))

// ============================================================================
// COMPOSABLE: useDataToggle
// ============================================================================
const { updateFiltersState, updateAvailableYears } = useDataToggle()

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
  loadIFSSData,
  positionsByYear: stackedAreaPositions
} = useStackedAreaData()

const router = useRouter()
const selectedVariable = ref(null)
const selectedYear = ref(null)
const selectedEntity = ref('')
const filterBarKey = ref(0)
const { fetchData: fetchEntities, fetchSheetNames, fetchInternationalSheetNames } = useStorageData()

// Estado para controlar qué vista está activa
const activeView = ref(null)

// ✅ NUEVO: currentDataView para QualitativePanel (evita el warning)
const currentDataView = ref('subnacional')

// Array de años disponibles (dinámico)
const availableYears = ref([])

// Guardar años iniciales de cuantitativos
const initialYears = ref([])

// Guardar años regionales cuando se cargan
const regionalYears = ref([])

const internationalYears = ref([])
// ✅ NUEVO: Flag para bloquear cambios de año forzados por el FilterBar
// Cuando el usuario selecciona "Todos los años", activamos este flag
// para ignorar cualquier intento del FilterBar de forzar un año específico
const blockYearChanges = ref(false)

// Guardar estado inicial de filtros
const initialFilters = ref({
  entity: '',
  year: null,
  variable: null
})

watch(selectedEntity, (newVal, oldVal) => {
  console.log('🔍 [HomePage] selectedEntity cambió')
  console.log('  - Anterior:', oldVal)
  console.log('  - Nuevo:', newVal)
}, { immediate: true })

const entitiesData = ref([])
const entitiesLoading = ref(false)
const entitiesError = ref(null)

// Estado para controlar la expansión del panel retráctil
const isRetractableExpanded = ref(false)

/**
 * Handler para cuando IFSRegionalCard carga los años disponibles
 */
const handleInternationalYearsLoaded = async (years) => {
  console.log('🌎 [HomePage] Años internacionales recibidos:', years)
  
  if (years && years.length > 0) {
    internationalYears.value = [...years]
    availableYears.value = years
    
    // Si el año actual no está en la lista, usar el primero disponible
    if (selectedYear.value !== null && !years.includes(selectedYear.value)) {
      const firstYear = years[0]
      selectedYear.value = firstYear
      setActiveYear(firstYear)
      console.log('📅 [Internacional] Año actualizado al primero disponible:', firstYear)
    }
    
    filterBarKey.value++
    await nextTick()
    
    console.log('✅ [HomePage] Filtro actualizado con años internacionales:', years)
    
    emit('available-years-change', years)
    updateAvailableYears(years)
    emitFiltersState()
  }
}

// ============================================================================
// FUNCIÓN: Emitir estado de filtros al App.vue (para el toggle)
// ============================================================================

/**
 * Emite el estado actual de los filtros al componente padre (App.vue)
 * y actualiza el composable para que el toggle refleje el estado correcto
 */
const emitFiltersState = () => {
  const state = {
    selectedEntity: selectedEntity.value,
    selectedYear: selectedYear.value,
    selectedVariable: selectedVariable.value,
    selectedState: selectedState.value
  }
  
  console.log('📡 [HomePage] Emitiendo estado de filtros:', state)
  
  // Emitir al padre
  emit('filters-state-change', state)
  
  // También actualizar el composable directamente
  updateFiltersState(state)

  // AGREGAR: Emitir contador de filtros para el badge móvil
  nextTick(() => {
    const count = filterBarRef.value?.activeFiltersCount || 0
    emit('filters-count-change', count)
  })
}

// ============================================================================
// LÓGICA CENTRALIZADA DE FILTROS
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
 * CONDICIÓN PRINCIPAL: Los 3 filtros en "Todas..." (null)
 * Entidad = null (Todas las entidades)
 * Año = null (Todos los años)
 * Variable = null (Todas las variables)
 */
const areAllFiltersOnTodas = computed(() => {
  const entityIsTodas = selectedEntity.value === null
  const yearIsTodos = selectedYear.value === null
  const variableIsTodas = selectedVariable.value === null
  
  const result = entityIsTodas && yearIsTodos && variableIsTodas
  
  return result
})

/**
 * Detecta si algún filtro está en blanco "-" (string vacío)
 */
const hasBlankFilter = computed(() => {
  return selectedEntity.value === '' || selectedVariable.value === ''
})

/**
 * Detecta si hay una variable específica seleccionada
 */
const hasSpecificVariable = computed(() => {
  return selectedVariable.value !== null && selectedVariable.value !== ''
})

// ============================================================================
// ✅ COMPUTED PARA showRegionalCharts, showStackedArea, showMapOverlay
// ============================================================================

/**
 * ✅ Mostrar StackedArea cuando:
 * - Entidad es "Datos Regionales" (null)
 * - Año es "Todos los años" (null)
 */
const showStackedArea = computed(() => {
  if (isRetractableExpanded.value) {
    return false
  }
  
  const entityIsTodas = selectedEntity.value === null
  const yearIsTodos = selectedYear.value === null
  
  return entityIsTodas && yearIsTodos
})

/**
 * ✅ CORREGIDO: Mostrar RegionalCharts cuando:
 * - Entidad es "Datos Regionales" (null)
 * - Año es un año ESPECÍFICO (no null)
 * - Variable es "Todas las variables" (null) O una variable específica (IS, IIC, PS, PIC)
 * 
 * Solo se oculta cuando la variable está en blanco ''
 */
const showRegionalCharts = computed(() => {
  // No mostrar si entidad está en blanco
  if (selectedEntity.value === '') {
    return false
  }
  
  // No mostrar si variable está en blanco (el "-")
  if (selectedVariable.value === '') {
    return false
  }
  
  // No mostrar si hay estado seleccionado en el mapa
  if (selectedState.value) {
    return false
  }
  
  // No mostrar si panel cualitativo está expandido
  if (isRetractableExpanded.value) {
    return false
  }
  
  const entityIsRegional = selectedEntity.value === null
  const yearIsSpecific = selectedYear.value !== null
  // ✅ Variable puede ser null (Todas) O un objeto con key (IS, IIC, PS, PIC)
  const variableIsValid = selectedVariable.value === null || 
                          (selectedVariable.value && selectedVariable.value.key)
  
  const result = entityIsRegional && yearIsSpecific && variableIsValid
  
  console.log('🌎 [showRegionalCharts]:', {
    entity: selectedEntity.value, entityIsRegional,
    year: selectedYear.value, yearIsSpecific,
    variable: selectedVariable.value, variableIsValid,
    result
  })
  
  return result
})

/**
 * ✅ Mostrar overlay del mapa cuando Entidad es "Datos Regionales" (null)
 */
const showMapOverlay = computed(() => {
  if (isRetractableExpanded.value) {
    return false
  }
  
  return selectedEntity.value === null
})

/**
 * Mensaje del overlay
 */
const overlayMessage = computed(() => {
  if (selectedEntity.value === null) {
    return 'Te encuentras en la vista de resultados federales. Haz clic en cualquier sección del área azul encima del mapa para regresar a los datos subnacionales.'
  }
  return ''
})

/**
 * Bloquear barra de filtros cuando los 3 filtros están en "Todas..."
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
 * Mostrar HistoricalCard cuando Entidad=null y Año=null
 */
const showHistoricalCard = computed(() => {
  if (shouldHidePanel.value) return false
  if (selectedState.value) return false
  
  const entityIsTodas = selectedEntity.value === null
  const yearIsTodos = selectedYear.value === null
  
  return entityIsTodas && yearIsTodos
})

/**
 * Mostrar panel de ranking
 */
const showRankingPanel = computed(() => {
  if (shouldHidePanel.value) return false
  return selectedState.value || showHistoricalCard.value || showRegionalCharts.value
})

// Card de info
const isDefaultState = computed(() => {
  return selectedEntity.value === '' && 
         selectedVariable.value === null &&
         selectedYear.value !== null
})

// ============================================================================
// FUNCIONES DE CARGA DE DATOS
// ============================================================================

const loadEntitiesFromSheet = async () => {
  if (isRetractableExpanded.value) {
    console.log('⏸️ [HomePage] Panel cualitativo activo, saltando carga de entidades')
    return
  }
  
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
    
    return years
    
  } catch (err) {
    console.error('❌ [HomePage] Error obteniendo años:', err)
    return []
  }
}

// ============================================================================
// ✅ FUNCIÓN HELPER: Verificar si debe cargar ranking
// ============================================================================
const shouldLoadRanking = () => {
  // No cargar si panel cualitativo está expandido
  if (isRetractableExpanded.value) return false
  
  // No cargar si showRegionalCharts está activo
  if (showRegionalCharts.value) return false
  
  // No cargar si showStackedArea está activo
  if (showStackedArea.value) return false
  
  // No cargar si areAllFiltersOnTodas
  if (areAllFiltersOnTodas.value) return false
  
  return true
}

// ============================================================================
// HANDLERS DE CAMBIOS DE FILTROS
// ============================================================================

/**
 * ✅ CORREGIDO: handleEntityChange
 * PRIMERO actualiza selectedEntity.value, LUEGO verifica condiciones
 */
const handleEntityChange = async (entity) => {
  console.log('📍 [HomePage] handleEntityChange llamado con:', entity)
  console.log('   selectedYear actual:', selectedYear.value)
  console.log('   selectedVariable actual:', selectedVariable.value)
  
  // ✅ PASO 1: Actualizar el valor PRIMERO
  selectedEntity.value = entity
  
  // ✅ PASO 2: Esperar a que Vue recalcule los computed
  await nextTick()
  
  // ✅ PASO 3: Ahora los computed están actualizados
  console.log('🔍 [handleEntityChange] Después de actualizar:')
  console.log('   showRegionalCharts:', showRegionalCharts.value)
  console.log('   showStackedArea:', showStackedArea.value)
  console.log('   showMapOverlay:', showMapOverlay.value)
  
  if (entity === '') {
    // Entidad en blanco "-"
    resetSelection()
    restoreInitialYears()
    currentDataView.value = 'subnacional'
    emitFiltersState()
    return
  }
  
  if (entity === null) {
    // ✅ Entidad = "Datos Regionales" (null)
    console.log('🌎 [HomePage] Entidad cambiada a "Datos Regionales"')
    resetSelection()
    currentDataView.value = 'federal'
    
    // ✅ NUEVO: Cargar años del sheet internacional
    console.log('🌎 [HomePage] Cargando años de datos internacionales...')
    const intYears = await fetchInternationalSheetNames()
    
    if (intYears && intYears.length > 0) {
      internationalYears.value = [...intYears]
      availableYears.value = intYears
      
      // Establecer el primer año disponible si no hay año seleccionado
      if (selectedYear.value === null) {
        // Mantener null si el usuario quiere "Todos los años"
        console.log('📅 [Internacional] Manteniendo "Todos los años" (null)')
      } else if (!intYears.includes(selectedYear.value)) {
        // Si el año actual no existe en internacional, usar el primero
        const firstYear = intYears[0]
        selectedYear.value = firstYear
        setActiveYear(firstYear)
        console.log('📅 [Internacional] Año cambiado a:', firstYear)
      }
      
      filterBarKey.value++
      await nextTick()
      
      emit('available-years-change', intYears)
      updateAvailableYears(intYears)
    }
    
    // ✅ Solo cargar ranking si NO es showRegionalCharts ni showStackedArea
    if (shouldLoadRanking()) {
      console.log('📊 [HomePage] Cargando ranking...')
      if (selectedVariable.value && selectedVariable.value !== '' && selectedVariable.value !== null) {
        await updateRankingByVariable(selectedVariable.value)
      } else if (selectedVariable.value === null && selectedYear.value !== null) {
        await loadAllStatesRanking(null)
      }
    } else {
      console.log('⏭️ [HomePage] No cargar ranking - showRegionalCharts o showStackedArea activo')
    }
    
    emitFiltersState()
    return
  }
  
  // ✅ Entidad específica seleccionada
  currentDataView.value = 'subnacional'
  restoreInitialYears()
  handleStateClick(entity)
  console.log('🗺️ [HomePage] Mapa actualizado con:', entity)
  
  emitFiltersState()
}

/**
 * ✅ CORREGIDO: handleYearChange
 */
const handleYearChange = async (year) => {
  console.log('📅 [HomePage] handleYearChange llamado con:', year)
  console.log('   selectedEntity actual:', selectedEntity.value)
  console.log('   selectedVariable actual:', selectedVariable.value)
  console.log('   selectedYear ANTES:', selectedYear.value)
  console.log('   blockYearChanges:', blockYearChanges.value)
  
  // ✅ PROTECCIÓN 1: Si blockYearChanges está activo y se intenta forzar un año
  if (blockYearChanges.value && year !== null) {
    console.log('⚠️ [handleYearChange] BLOQUEADO por flag: ignorando año forzado:', year)
    return
  }
  
  // ✅ Si el usuario selecciona "Todos los años" (null), activar el bloqueo temporalmente
  if (year === null && selectedEntity.value === null) {
    console.log('🔒 [handleYearChange] Activando bloqueo de cambios de año')
    blockYearChanges.value = true
    
    // Desactivar el bloqueo después de un tiempo para permitir cambios futuros del usuario
    setTimeout(() => {
      console.log('🔓 [handleYearChange] Desactivando bloqueo de cambios de año')
      blockYearChanges.value = false
    }, 1000)
  } else if (year !== null) {
    // Si el usuario selecciona un año específico, desactivar el bloqueo
    blockYearChanges.value = false
  }
  
  // ✅ PASO 1: Actualizar el valor PRIMERO
  selectedYear.value = year
  
  if (year) {
    setActiveYear(year)
  }
  
  // ✅ PASO 2: Esperar a que Vue recalcule los computed
  await nextTick()
  
  // ✅ PASO 3: Ahora los computed están actualizados
  console.log('🔍 [handleYearChange] Después de actualizar:')
  console.log('   showRegionalCharts:', showRegionalCharts.value)
  console.log('   showStackedArea:', showStackedArea.value)
  console.log('   areAllFiltersOnTodas:', areAllFiltersOnTodas.value)
  
  if (!isRetractableExpanded.value) {
    if (showStackedArea.value) {
      // Entidad=null, Año=null → StackedArea
      console.log('📊 [HomePage] Cargando StackedArea...')
      await loadIFSSData()
    } else if (showRegionalCharts.value) {
      // Entidad=null, Año=específico, Variable=null → Regional
      console.log('🌎 [HomePage] showRegionalCharts activo - componentes se cargan automáticamente')
      // NO cargar ranking
    } else if (shouldLoadRanking()) {
      // Cargar ranking solo si corresponde
      console.log('📊 [HomePage] Cargando ranking...')
      if (selectedVariable.value !== '' && selectedVariable.value !== null) {
        await updateRankingByVariable(selectedVariable.value)
      } else if (selectedVariable.value === null) {
        await loadAllStatesRanking(null)
      }
    }
  }
  
  emitFiltersState()
}

/**
 * ✅ CORREGIDO: handleVariableChange
 */
const handleVariableChange = async (variable) => {
  console.log('📊 [HomePage] handleVariableChange llamado con:', variable)
  console.log('   selectedEntity actual:', selectedEntity.value)
  console.log('   selectedYear actual:', selectedYear.value)
  
  // ✅ PASO 1: Actualizar el valor PRIMERO
  selectedVariable.value = variable
  
  // ✅ PASO 2: Esperar a que Vue recalcule los computed
  await nextTick()
  
  // ✅ PASO 3: Ahora los computed están actualizados
  console.log('🔍 [handleVariableChange] Después de actualizar:')
  console.log('   showRegionalCharts:', showRegionalCharts.value)
  console.log('   areAllFiltersOnTodas:', areAllFiltersOnTodas.value)
  
  if (variable === '') {
    emitFiltersState()
    return
  }
  
  if (isRetractableExpanded.value) {
    console.log('⏸️ [HomePage] Panel cualitativo activo, saltando carga de ranking')
    emitFiltersState()
    return
  }
  
  // ✅ Solo cargar ranking si NO es showRegionalCharts
  if (showRegionalCharts.value) {
    console.log('🌎 [HomePage] showRegionalCharts activo, no cargar ranking')
    emitFiltersState()
    return
  }
  
  if (!areAllFiltersOnTodas.value && shouldLoadRanking()) {
    if (variable === null) {
      await loadAllStatesRanking(null)
    } else {
      await updateRankingByVariable(variable)
    }
  }
  
  emitFiltersState()
}

const handleFiltersChange = (filters) => {
  console.log('🔧 Filtros aplicados:', filters)
  console.log('🔧 Estado actual - showRegionalCharts:', showRegionalCharts.value)
  console.log('🔧 Estado actual - showMapOverlay:', showMapOverlay.value)
  console.log('🔧 Estado actual - showStackedArea:', showStackedArea.value)
}

// ============================================================================
// HANDLERS DE INTERACCIÓN CON EL MAPA
// ============================================================================

const handleStateClickWithEmit = async (stateName) => {
  console.log('🗺️ [HomePage] Click en estado:', stateName)
  
  // ✅ Limpiar filtro de leyenda cuando se hace click en un estado
  activeLegendFilter.value = null
  
  if (!stateName) {
    resetSelection()
    selectedEntity.value = ''
    emit('region-selected', null)
    
    restoreInitialYears()
    
    await nextTick()
    
    if (shouldLoadRanking()) {
      if (selectedVariable.value && selectedVariable.value !== '' && selectedVariable.value !== null) {
        updateRankingByVariable(selectedVariable.value)
      } else if (!areAllFiltersOnTodas.value) {
        loadAllStatesRanking(null)
      }
    }
    
    emitFiltersState()
    return
  }
  
  handleStateClick(stateName)
  selectedEntity.value = stateName
  currentDataView.value = 'subnacional'
  
  restoreInitialYears()
  
  await nextTick()
  
  if (selectedState.value === stateName) {
    const stateData = getStateInfo(stateName)
    emit('region-selected', { name: stateName, data: stateData })
    console.log('✅ [HomePage] Estado seleccionado y sincronizado:', stateName)
  } else {
    emit('region-selected', null)
  }
  
  emitFiltersState()
}

const handleViewChange = (view) => {
  console.log('👁️ [HomePage] Vista cambiada a:', view)
  activeView.value = view
}

const handleIFSRegionalClick = async () => {
  console.log('🌎 [HomePage] Cambiando a vista IFS Regional')
  
  activeView.value = 'regional'
  currentDataView.value = 'federal'
  
  // ✅ Limpiar filtro de leyenda
  activeLegendFilter.value = null
  
  if (selectedState.value) {
    resetSelection()
  }
  
  selectedEntity.value = null
  selectedYear.value = null
  selectedVariable.value = null
  
  await nextTick()
  
  await loadIFSSData()
  
  console.log('✅ [HomePage] Vista IFS Regional activada con filtros en "Todas..."')
  
  emitFiltersState()
}

const handleDatosFederalesClick = async () => {
  console.log('🏛️ [HomePage] Click en Plataforma de Finanzas Sostenibles')
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
    
    emit('available-years-change', years)
    updateAvailableYears(years)
    emitFiltersState()
  }
}

const isMobile = computed(() => window.innerWidth <= 768)

const handleRegionalYearsLoaded = async (years) => {
  console.log('📅 [HomePage] Años recibidos de RegionalChartsComponent:', years)
  
  if (years && years.length > 0) {
    regionalYears.value = [...years]
    availableYears.value = years
    
    // ✅ CORREGIDO: Solo cambiar año si:
    // 1. El año actual NO es null (usuario NO quiere "Todos los años")
    // 2. El año actual no está en la lista de años regionales
    if (selectedYear.value !== null && !years.includes(selectedYear.value)) {
      const firstYear = years[0]
      selectedYear.value = firstYear
      setActiveYear(firstYear)
      console.log('📅 [Regional] Año actualizado al primero disponible:', firstYear)
    } else if (selectedYear.value === null) {
      console.log('📅 [Regional] Usuario tiene "Todos los años" seleccionado, respetando null')
    }
    
    filterBarKey.value++
    await nextTick()
    
    console.log('✅ [HomePage] Filtro actualizado con años regionales:', years)
    
    emit('available-years-change', years)
    updateAvailableYears(years)
    emitFiltersState()
  }
}

const restoreInitialYears = async () => {
  // Solo restaurar años cuantitativos si NO estamos en vista regional/federal
  if (selectedEntity.value === null) {
    console.log('🔄 [HomePage] En vista regional, no restaurar años cuantitativos')
    return
  }
  
  if (initialYears.value.length > 0) {
    console.log('🔄 [HomePage] Restaurando años iniciales:', initialYears.value)
    availableYears.value = [...initialYears.value]
    
    if (selectedYear.value !== null && !initialYears.value.includes(selectedYear.value)) {
      const preferredYear = initialYears.value.includes('2024') ? '2024' : initialYears.value[0]
      selectedYear.value = preferredYear
      setActiveYear(preferredYear)
      console.log('📅 Año restaurado al preferido de cuantitativos:', preferredYear)
    } else if (selectedYear.value === null) {
      console.log('📅 Usuario tiene "Todos los años" seleccionado, respetando null')
    }
    
    filterBarKey.value++
    await nextTick()
    
    emit('available-years-change', initialYears.value)
    updateAvailableYears(initialYears.value)
  }
}

const handlePanelClosed = async () => {
  console.log('🔄 [HomePage] Panel cualitativo cerrado, reseteando filtros a DEFAULT...')
  
  selectedEntity.value = ''
  selectedVariable.value = null
  currentDataView.value = 'subnacional'
  
  activeLegendFilter.value = null
  
  availableYears.value = [...initialYears.value]
  
  if (initialYears.value.length > 0) {
    // ✅ CORREGIDO: Preferir 2024 si está disponible
    const preferredYear = initialYears.value.includes('2024') ? '2024' : initialYears.value[0]
    selectedYear.value = preferredYear
    setActiveYear(preferredYear)
    console.log('📅 Año restaurado a DEFAULT:', preferredYear)
  }
  
  filterBarKey.value++
  await nextTick()
  
  resetSelection()
  
  await loadAllStatesRanking(null)
  
  activeView.value = null
  
  console.log('✅ Filtros reseteados a DEFAULT')
  
  emitFiltersState()
}

const handleMapContainerClick = (event) => {
  if (event.target.classList.contains('map-svg-container') || 
      event.target.tagName === 'svg' ||
      event.target.classList.contains('map-background')) {
    resetSelection()
    emit('region-selected', null)
    emitFiltersState()
  }
}

const handleOverlayClick = async () => {
  console.log('🔲 [HomePage] Click en overlay, cambiando a DEFAULT...')
  
  selectedEntity.value = ''
  selectedVariable.value = null
  currentDataView.value = 'subnacional'
  
  activeLegendFilter.value = null
  
  restoreInitialYears()
  
  if (availableYears.value.length > 0) {
    // ✅ CORREGIDO: Preferir 2024 si está disponible
    const preferredYear = availableYears.value.includes('2024') ? '2024' : availableYears.value[0]
    selectedYear.value = preferredYear
    setActiveYear(preferredYear)
  }
  
  resetSelection()
  emit('region-selected', null)
  
  await loadAllStatesRanking(null)
  
  activeView.value = null
  
  filterBarKey.value++
  await nextTick()
  
  console.log('✅ Cambiado a DEFAULT')
  
  emitFiltersState()
}

// ============================================================================
// COMPUTED ADICIONALES
// ============================================================================

const useLargePanelSize = computed(() => {
  return !selectedState.value
})

const getRankingTitle = computed(() => {
  const yearSuffix = selectedYear.value ? ` - ${selectedYear.value}` : ''
  
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
// WATCHERS
// ============================================================================

/**
 * Watch para recibir acciones del toggle desde App.vue
 */
watch(toggleAction, async (newAction) => {
  if (!newAction) return
  
  console.log('🔘 [HomePage] Recibida acción de toggle:', newAction)
  
  const { type, filters } = newAction
  
  activeLegendFilter.value = null
  
  if (type === 'federal') {
    console.log('🔘 [HomePage] Aplicando filtros para "Datos Regionales" (Federal)')
    
    selectedEntity.value = filters.entity
    selectedYear.value = filters.year
    selectedVariable.value = filters.variable
    currentDataView.value = 'federal'
    
    resetSelection()
    
    await loadIFSSData()
    
    filterBarKey.value++
    await nextTick()
    
    console.log('✅ [HomePage] Filtros aplicados para "Datos Regionales"')
    
  } else if (type === 'subnacional') {
    console.log('🔘 [HomePage] Aplicando filtros para "Datos Subnacionales"')
    
    selectedEntity.value = filters.entity
    selectedYear.value = filters.year
    selectedVariable.value = filters.variable
    currentDataView.value = 'subnacional'
    
    if (filters.year) {
      setActiveYear(filters.year)
    }
    
    await restoreInitialYears()
    
    resetSelection()
    
    await loadAllStatesRanking(null)
    
    filterBarKey.value++
    await nextTick()
    
    console.log('✅ [HomePage] Filtros aplicados para "Datos Subnacionales"')
  }
  
  emitFiltersState()
  
}, { deep: true })

/**
 * Watch para cargar datos del StackedArea cuando areAllFiltersOnTodas
 */
watch(areAllFiltersOnTodas, async (newValue, oldValue) => {
  console.log('👀 [areAllFiltersOnTodas] cambió de', oldValue, 'a', newValue)
  
  if (isRetractableExpanded.value) {
    console.log('⏸️ [HomePage] Panel cualitativo activo, saltando carga de StackedArea')
    return
  }
  
  if (newValue && !oldValue) {
    console.log('🌎 [HomePage] Filtros en "Todas...", cargando StackedArea')
    await loadIFSSData()
  }
})

/**
 * Watch para detectar cambios en showRegionalCharts
 * ✅ CORREGIDO: Ya NO restauramos años automáticamente aquí
 * La restauración de años se maneja en los handlers específicos cuando es necesario
 */
watch(showRegionalCharts, async (newValue, oldValue) => {
  console.log('👀 [showRegionalCharts] cambió de', oldValue, 'a', newValue)
  
  if (newValue) {
    console.log('🌎 [HomePage] showRegionalCharts activado - mostrando IFSRegionalCard y RegionalChartsComponent')
  }
  
  // ✅ REMOVIDO: Ya no restauramos años aquí porque causaba que se forzara
  // un año específico cuando el usuario seleccionaba "Todos los años"
  // La restauración se hace ahora solo cuando el usuario cambia a un estado
  // que realmente lo requiere (ej: seleccionar un estado del mapa)
})

/**
 * Watch para sincronizar cuando selectedState cambia desde el mapa
 */
watch(selectedState, async (newState, oldState) => {
  console.log('👀 [HomePage] Watch selectedState:', { newState, oldState })
  
  if (newState && newState !== oldState) {
    if (selectedEntity.value !== newState) {
      selectedEntity.value = newState
      console.log('🔄 [HomePage] selectedEntity sincronizado con mapa:', newState)
    }
    
    currentDataView.value = 'subnacional'
    
    const stateData = getStateInfo(newState)
    setChartData(stateData)
    emit('region-selected', {
      name: newState,
      data: stateData
    })
    
    emitFiltersState()
    
  } else if (!newState && oldState) {
    if (!isRetractableExpanded.value && selectedEntity.value !== null) {
      selectedEntity.value = ''
    }
    emit('region-selected', null)
    
    await nextTick()
    
    if (shouldLoadRanking()) {
      if (selectedVariable.value && selectedVariable.value !== '' && selectedVariable.value !== null) {
        updateRankingByVariable(selectedVariable.value)
      } else {
        loadAllStatesRanking(null)
      }
    }
    
    emitFiltersState()
  }
})

watch(error, (newError) => {
  if (newError) {
    emit('map-error', newError)
  }
})

watch(availableYears, (newYears) => {
  emit('available-years-change', newYears)
  updateAvailableYears(newYears)
}, { deep: true })

watch(isRetractableExpanded, async (isExpanded, wasExpanded) => {
  console.log('👀 [HomePage] isRetractableExpanded cambió:', { isExpanded, wasExpanded })
  
  if (isExpanded) {
    console.log('⏸️ [HomePage] Panel cualitativo abierto, ranking y datos cuantitativos pausados')
  } else if (!isExpanded && wasExpanded) {
    console.log('▶️ [HomePage] Panel cualitativo cerrado, handlePanelClosed manejará la recarga')
  }
})

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

onMounted(async () => {
  console.log('\n🚀 ===== INICIALIZANDO HomePage =====')
  
  await fetchAvailableYears()
  
  await loadEntitiesFromSheet()
  await initializeSlider()
  
  selectedEntity.value = ''
  selectedVariable.value = null
  currentDataView.value = 'subnacional'
  
  if (availableYears.value.length > 0) {
    // ✅ CORREGIDO: Preferir 2024 si está disponible, ya que 2025 puede no tener datos completos
    const preferredYear = availableYears.value.includes('2024') ? '2024' : availableYears.value[0]
    selectedYear.value = preferredYear
    setActiveYear(preferredYear)
    console.log('📅 Año inicial establecido:', preferredYear)
  }
  
  await loadAllStatesRanking(null)
  
  initialFilters.value = {
    entity: '',
    year: selectedYear.value,
    variable: null
  }
  console.log('💾 Estado inicial de filtros (DEFAULT):', initialFilters.value)
  console.log('💾 Años iniciales guardados:', initialYears.value)
  
  console.log('👁️ Vista inicial: ninguna activa (null)')
  
  console.log('✅ HomePage inicializado')
  console.log('   areAllFiltersOnTodas:', areAllFiltersOnTodas.value)
  
  emit('available-years-change', availableYears.value)
  updateAvailableYears(availableYears.value)
  emitFiltersState()
  
  console.log('\n')
})
</script>

<style scoped>
.map-container {
  width: 95%;
  max-width: 2000px;
  margin: 0 auto;
  padding: 0 0 8px 0;
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

/* ✅ MEJORADO: map-and-charts-wrapper con más altura */
.map-and-charts-wrapper {
  display: flex;
  gap: 10px;
  padding: 19.6px;  
  border-radius: 15px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
  z-index: 2;
  position: relative;
  transition: gap 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: visible;
  height: 640px;

}

.map-and-charts-wrapper.no-gap {
  gap: 0;
}

/* ✅ MEJORADO: charts-section ajustado para la nueva altura */
.charts-section {
  transform: translateX(-48px);
  height: 100%;
  min-height: unset;
  max-height: 100%;
  border-radius: 8px;
  width: 980px;
  transition: all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
}

.charts-container {
  height: 100%;
  max-height: 100%;
  width: 985px;
  overflow: hidden;
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

.ranking-panel.regional-view {
  width: 2000px;
  height: 1150px;
  padding-bottom: 15px;
  margin-bottom: 150px;
  transition: all 0.3s ease;
}

.ranking-panel.variable-view {
  width: 2000px;
  height: 1350px; 
  padding-bottom: 70px;
  transition: all 0.3s ease;
}

.header-ranking-panel {
  display: none;
}

.body-ranking-panel {
  height: 100%;
  width: 100%;
  padding-bottom: 5px;
}

.regional-charts-spacing {
  margin-bottom: 10px;
  padding-bottom: 5px;
}

/* ✅ MEJORADO: Overlay ajustado para nueva altura */
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

.map-overlay-filter.regional-overlay {
  background: rgba(22, 60, 95, 0.85);
  cursor: pointer;
}

.map-overlay-filter.regional-overlay:hover {
  background: rgba(22, 60, 95, 0.88);
}

.map-overlay-filter.regional-overlay .overlay-text {
  color: white;
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

/* ============================================
   RESPONSIVE - Media Queries
   ============================================ */

@media (max-width: 768px) {
  .map-and-charts-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    height: auto;
    min-height: unset;
  }
  
  .charts-section {
    transform: translateX(0);
    width: 100% !important;
    min-width: unset !important;
    height: auto;
    min-height: 500px;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
    background: white;
    padding: 10px;
  }
  
  .charts-container {
    width: 100% !important;
    min-width: unset !important;
  }
  
  .chart-card {
    border-radius: 10px;
  }
  
  .ranking-chart-section {
    min-height: 380px;
  }
  
  .filters-toggles-row {
    height: auto;
    padding: 10px 0;
  }
  
  .filters-column {
    min-width: unset;
    width: 100%;
  }
  
  .map-container {
    width: 100%;
    padding: 0 10px 8px 10px;
  }
  
  .map-overlay-filter {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 16 / 9;
    height: 330px;
    border-radius: 15px;
    z-index: 200;
  }
  
  .overlay-message {
    padding: 10px;
    max-width: 90%;
  }
  
  .overlay-text {
    font-size: 11px;
  }
  
  .ranking-panel {
    width: 100%;
    height: auto;
  }
  
  .ranking-panel.historical-view,
  .ranking-panel.regional-view,
  .ranking-panel.variable-view {
    width: 100%;
    height: auto;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }

  .qualitative-panel,
  .qualitative-panel-wrapper {
    display: none !important;
  }

  :deep(.qualitative-panel),
  :deep(.qualitative-panel-container) {
    display: none !important;
  }
}

@media (max-width: 480px) {
  .map-and-charts-wrapper {
    gap: 12px;
  }
  
  .charts-section {
    min-height: 350px;
    padding: 8px;
    border-radius: 12px;
  }
  
  .chart-card {
    padding: 8px;
    border-radius: 8px;
  }
  
  .card-title {
    font-size: 14px;
  }

  .map-overlay-filter {
    max-height: 400px;
    border-radius: 12px;
  }
  
  .overlay-message {
    padding: 12px;
  }
  
  .overlay-text {
    font-size: 11px;
    line-height: 1.4;
  }
  
  .ranking-chart-section {
    min-height: 320px;
  }
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
</style>1