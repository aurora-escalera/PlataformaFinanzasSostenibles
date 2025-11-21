<!-- src/modules/maps/components/HomePage.vue -->
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
            :show-info-card="true"
            @state-click="handleStateClickWithEmit"
            @state-hover="handleStateHover"
            @state-leave="handleStateLeave"
            @navigate-regional="handleIFSRegionalClick"
            @navigate-federal="handleDatosFederalesClick"
          />
          
          <!-- ✅ Overlay sobre SOLO el mapa -->
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
            <!-- ✅ ACTUALIZADO: Mostrar LinearChart dinámico (IFS) cuando todos los filtros están en "Todas" -->
            <div class="ranking-chart-section" style="height: 100%; display: flex; flex-direction: column;">
              
              <!-- Loading State para LinearChart -->
              <div v-if="showStackedArea && stackedAreaLoading" class="ranking-loading">
                <div class="spinner-small"></div>
                <p>Cargando evolución IFS...</p>
              </div>
              
              <!-- Error State para LinearChart -->
              <div v-else-if="showStackedArea && stackedAreaError" class="ranking-error">
                <p>Error: {{ stackedAreaError }}</p>
                <button @click="loadIFSSData" class="retry-btn-small">
                  Reintentar
                </button>
              </div>
              
              <!-- ✅ ACTUALIZADO: Mostrar LinearChart de IFS con datos dinámicos -->
              <LinearChart
                v-else-if="showStackedArea && stackedAreaChartData && Object.keys(stackedAreaChartData).length > 0"
                :title="stackedAreaTitle"
                :data="stackedAreaChartData"
                :xLabels="stackedAreaYears"
                :width="980"
                :height="500"
                :padding="{
                  top: 30,
                  right: 70,
                  bottom: 120,
                  left: 60
                }"
              />
              
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
              
              <!-- ✅ HorizontalRankingChart - Solo cuando hay filtros específicos -->
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
        :class="{ 'historical-view': showHistoricalCard }"
      >
        <div class="header-ranking-panel">
          <div class="ranking-hamburger-menu">
            <img src="/public/icons/hamburger.png" alt="hamburger-menu" class="hamburger-icon">
          </div>
        </div>
        
        <div class="body-ranking-panel">
          <!-- ✅ Mostrar HistoricalCard cuando NO hay estado Y filtros están en "Todas" -->
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

// ✅ NUEVO: Array de años disponibles (dinámico)
const availableYears = ref([])

// ✅ NUEVO: Guardar años iniciales de cuantitativos
const initialYears = ref([])

// ✅ NUEVO: Guardar estado inicial de filtros
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

const showStackedArea = computed(() => {
  const allFiltersDefault = selectedEntity.value === null && 
                           selectedYear.value === null && 
                           selectedVariable.value === null
  
  return allFiltersDefault
})

const showMapOverlay = computed(() => {
  return showStackedArea.value
})

const isFilterBarLocked = computed(() => {
  return showStackedArea.value
})

const shouldHidePanel = computed(() => {
  const entityIsBlank = selectedEntity.value === ''
  const variableIsBlank = selectedVariable.value === ''
  return entityIsBlank && variableIsBlank
})

const showHistoricalCard = computed(() => {
  if (shouldHidePanel.value) return false
  
  const allFiltersDefault = !selectedState.value && 
                           selectedYear.value === null && 
                           selectedVariable.value === null
  
  return allFiltersDefault
})

const showRankingPanel = computed(() => {
  if (shouldHidePanel.value) return false
  return selectedState.value || showHistoricalCard.value
})

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

const handleEntityChange = (entity) => {
  console.log('📍 handleEntityChange llamado con:', entity)
  
  selectedEntity.value = entity
  console.log('📍 selectedEntity actualizado a:', selectedEntity.value)
  
  if (entity === '') {
    resetSelection()
    return
  }
  
  if (entity) {
    handleStateClick(entity)
  } else {
    resetSelection()
    if (selectedVariable.value && selectedVariable.value !== '') {
      updateRankingByVariable(selectedVariable.value)
    } else {
      loadAllStatesRanking(null)
    }
  }
}

const handleYearChange = async (year) => {
  selectedYear.value = year
  
  // ✅ Actualizar el año activo en storageConfig
  if (year) {
    setActiveYear(year)
  }
  
  if (showStackedArea.value) {
    await loadIFSSData()
  }
}

const handleVariableChange = (variable) => {
  selectedVariable.value = variable
  
  if (variable === '') return
  
  if (!selectedState.value) {
    updateRankingByVariable(variable)
  }
}

const handleFiltersChange = (filters) => {
  console.log('🔧 Filtros aplicados:', filters)
}

const handleStateClickWithEmit = async (stateName) => {
  if (!stateName) {
    resetSelection()
    emit('region-selected', null)
    if (selectedVariable.value && selectedVariable.value !== '') {
      updateRankingByVariable(selectedVariable.value)
    } else if (!selectedVariable.value) {
      loadAllStatesRanking(null)
    }
    return
  }
  
  handleStateClick(stateName)
  await nextTick()
  if (selectedState.value === stateName) {
    const stateData = getStateInfo(stateName)
    emit('region-selected', { name: stateName, data: stateData })
  } else {
    emit('region-selected', null)
  }
}

const handleIFSRegionalClick = () => {
  if (selectedState.value) {
    resetSelection()
  }
}

const handleDatosFederalesClick = () => {
  console.log('Navegando a federales...')
}

const handleDatosCualitativosClick = () => {
  console.log('🔄 Toggling panel cualitativo:', !isRetractableExpanded.value)
  isRetractableExpanded.value = !isRetractableExpanded.value
}

// ✅ NUEVA FUNCIÓN: Manejar carga de años desde sheet de ambientales
const handleYearsLoaded = async (years) => {
  console.log('📅 [HomePage] Años recibidos de ambientales:', years)
  
  if (years && years.length > 0) {
    // Actualizar los años disponibles en el filtro
    availableYears.value = years
    
    console.log('✅ [HomePage] availableYears actualizado:', availableYears.value)
    
    // Establecer el primer año como seleccionado
    const firstYear = years[0]
    selectedYear.value = firstYear
    setActiveYear(firstYear)
    
    // Forzar re-render del filtro
    filterBarKey.value++
    await nextTick()
    
    console.log('✅ Filtro actualizado con años de ambientales')
  }
}

// ✅ NUEVA FUNCIÓN: Obtener años disponibles del sheet de cuantitativos
const fetchAvailableYears = async () => {
  try {
    console.log('📅 [HomePage] Obteniendo años de sheet cuantitativos...')
    
    const sheetNames = await fetchSheetNames('datosCuantitativos')
    
    // Filtrar solo los que parecen años (números de 4 dígitos)
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a) // Ordenar descendente
    
    console.log('✅ [HomePage] Años de cuantitativos:', years)
    
    // Guardar como años iniciales
    initialYears.value = [...years]
    availableYears.value = [...years]
    
    // Establecer el primer año como seleccionado
    if (years.length > 0) {
      selectedYear.value = years[0]
      setActiveYear(years[0])
    }
    
    return years
    
  } catch (err) {
    console.error('❌ [HomePage] Error obteniendo años:', err)
    return []
  }
}

// ✅ NUEVA FUNCIÓN: Resetear filtros al cerrar panel cualitativo
const handlePanelClosed = async () => {
  console.log('🔄 [HomePage] Panel cualitativo cerrado, reseteando filtros...')
  
  // Resetear filtros a estado inicial
  selectedEntity.value = initialFilters.value.entity
  selectedVariable.value = initialFilters.value.variable
  
  // ✅ Restaurar años iniciales de cuantitativos
  availableYears.value = [...initialYears.value]
  
  // Establecer el primer año de cuantitativos
  if (initialYears.value.length > 0) {
    const firstYear = initialYears.value[0]
    selectedYear.value = firstYear
    setActiveYear(firstYear)
    console.log('📅 Año restaurado:', firstYear)
  }
  
  // Forzar re-render del filtro
  filterBarKey.value++
  await nextTick()
  
  // Resetear selección del mapa
  resetSelection()
  
  // Recargar ranking con filtros iniciales
  if (selectedVariable.value && selectedVariable.value !== '') {
    updateRankingByVariable(selectedVariable.value)
  } else {
    await loadAllStatesRanking(null)
  }
  
  console.log('✅ Filtros reseteados a estado inicial')
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
  selectedEntity.value = ''
  selectedVariable.value = ''
  selectedYear.value = null
  resetSelection()
  emit('region-selected', null)
  await loadAllStatesRanking(null)
  filterBarKey.value++
  await nextTick()
}

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

watch(showStackedArea, async (newValue, oldValue) => {
  if (newValue && !oldValue) {
    await loadIFSSData()
  }
})

watch(selectedVariable, (newVariable) => {
  if (newVariable === '') return
  
  if (!selectedState.value) {
    updateRankingByVariable(newVariable)
  }
})

watch(selectedYear, async (newYear, oldYear) => {
  if (newYear !== oldYear) {
    await loadEntitiesFromSheet()
    
    if (selectedVariable.value !== '') {
      if (selectedVariable.value) {
        await updateRankingByVariable(selectedVariable.value)
      } else {
        await loadAllStatesRanking(null)
      }
    }
  }
})

watch(selectedState, (newState, oldState) => {
  if (newState && newState !== oldState) {
    const stateData = getStateInfo(newState)
    setChartData(stateData)
    emit('region-selected', {
      name: newState,
      data: stateData
    })
  } else if (!newState && oldState) {
    emit('region-selected', null)
    if (selectedVariable.value !== '') {
      if (selectedVariable.value) {
        updateRankingByVariable(selectedVariable.value)
      } else {
        loadAllStatesRanking(null)
      }
    }
  }
})

watch(error, (newError) => {
  if (newError) {
    emit('map-error', newError)
  }
})

onMounted(async () => {
  console.log('\n🚀 ===== INICIALIZANDO HomePage =====')
  
  // ✅ Cargar años iniciales de cuantitativos
  await fetchAvailableYears()
  
  await loadEntitiesFromSheet()
  await initializeSlider()
  await loadAllStatesRanking(null)
  await loadIFSSData()
  
  // ✅ Guardar estado inicial de filtros
  initialFilters.value = {
    entity: selectedEntity.value,
    year: selectedYear.value,
    variable: selectedVariable.value
  }
  console.log('💾 Estado inicial de filtros guardado:', initialFilters.value)
  console.log('💾 Años iniciales guardados:', initialYears.value)
  
  console.log('✅ HomePage inicializado\n')
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
}

.map-and-charts-wrapper.no-gap {
  gap: 0;
}

.charts-section {
  transform: translateX(-48px);
  height: 605px;
  border-radius: 8px;
  width: 980px;
  border: 1px solid #ccc;
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
  height: 1040px;
  width: 100%;
}

.ranking-panel.historical-view {
  width: 2000px;
  height: 1840px;
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