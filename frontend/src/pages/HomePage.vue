<!-- src/modules/maps/components/HomePage.vue -->
<!-- ✅ ACTUALIZADO: Integración completa con LinearChart (en lugar de StackedArea) para mostrar evolución del IFS -->

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
      <div class="map-and-charts-wrapper" @click="handleMapContainerClick">
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
          
          <!-- ✅ NUEVO: Overlay sobre SOLO el mapa -->
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
          
        <!-- Botón retráctil -->
        <div class="retractable-view">
          <div class="expand-retractable-btn" @click="handleDatosCualitativosClick">+</div>
        </div>

        <!-- RANKING CHART SECTION - Al lado del mapa -->
        <div class="charts-section">
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
      <div 
        v-if="showRankingPanel" 
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
import DataToggleComponent from '@modules/other/components/DataToggleComponent.vue'
import HorizontalRankingChart from '../modules/charts/components/HorizontalRankingChart.vue'
import RankingSlider from '../modules/object/component/RankinSlider.vue'
import HistoricalCard from '../modules/object/component/HistoricalCard.vue'
import LinearChart from '../modules/charts/components/LinearChart.vue' // ✅ CAMBIADO de StackedArea a LinearChart
import { useSlider } from '@/composables/useSlider'
import { useStateRanking } from '@/composables/useStateRanking'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'
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

// ✅ Composable para LinearChart (usa los mismos datos de IFS)
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
const filterBarKey = ref(0) // ✅ NUEVO: Key para forzar reset del FilterBar
const { fetchData: fetchEntities } = useStorageData()

const entitiesData = ref([])
const entitiesLoading = ref(false)
const entitiesError = ref(null)

// ✅ ACTUALIZADO: Computed para detectar si todos los filtros están en "Todas"
const showStackedArea = computed(() => {
  const allFiltersDefault = selectedEntity.value === null && 
                           selectedYear.value === null && 
                           selectedVariable.value === null
  
  console.log('📊 showStackedArea check:', {
    selectedEntity: selectedEntity.value,
    selectedYear: selectedYear.value,
    selectedVariable: selectedVariable.value,
    result: allFiltersDefault
  })
  
  return allFiltersDefault
})

// ✅ NUEVO: Computed para mostrar overlay en el mapa
const showMapOverlay = computed(() => {
  return showStackedArea.value
})

// ✅ NUEVO: Computed para mantener FilterBar expandido cuando overlay está activo
const isFilterBarLocked = computed(() => {
  return showStackedArea.value
})

// Computed para detectar si se debe ocultar el panel
const shouldHidePanel = computed(() => {
  const entityIsBlank = selectedEntity.value === ''
  const variableIsBlank = selectedVariable.value === ''
  const hidePanel = entityIsBlank && variableIsBlank
  
  console.log('🚫 shouldHidePanel check:', {
    selectedEntity: selectedEntity.value,
    selectedVariable: selectedVariable.value,
    entityIsBlank,
    variableIsBlank,
    result: hidePanel
  })
  
  return hidePanel
})

// Computed para determinar si mostrar HistoricalCard
const showHistoricalCard = computed(() => {
  if (shouldHidePanel.value) {
    console.log('🚫 HistoricalCard ocultado por shouldHidePanel')
    return false
  }
  
  const allFiltersDefault = !selectedState.value && 
                           selectedYear.value === null && 
                           selectedVariable.value === null
  
  console.log('🔍 showHistoricalCard check:', {
    selectedState: selectedState.value,
    selectedYear: selectedYear.value,
    selectedVariable: selectedVariable.value,
    shouldHidePanel: shouldHidePanel.value,
    result: allFiltersDefault
  })
  
  return allFiltersDefault
})

// Computed para determinar si mostrar el ranking-panel completo
const showRankingPanel = computed(() => {
  if (shouldHidePanel.value) {
    console.log('🚫 ranking-panel ocultado por shouldHidePanel')
    return false
  }
  
  const shouldShow = selectedState.value || showHistoricalCard.value
  
  console.log('📊 showRankingPanel check:', {
    selectedState: selectedState.value,
    showHistoricalCard: showHistoricalCard.value,
    shouldHidePanel: shouldHidePanel.value,
    result: shouldShow
  })
  
  return shouldShow
})

const loadEntitiesFromSheet = async () => {
  try {
    console.log('📥 Cargando entidades desde Google Sheets...')
    entitiesLoading.value = true
    entitiesError.value = null
    
    const presupuestosMapping = getMapping('chartsPresupuestos')
    const sheetName = getSheetName('chartsPresupuestos')
    console.log(`📅 Cargando entidades desde hoja: "${sheetName}"`)
    
    const rawData = await fetchEntities('chartsPresupuestos', sheetName)
    
    console.log(`✅ Datos cargados: ${rawData.length} filas`)
    
    const stateColumn = presupuestosMapping.stateColumn
    const uniqueEntities = [...new Set(rawData.map(row => row[stateColumn]))]
      .filter(entity => entity && entity.trim() !== '')
      .sort()
    
    entitiesData.value = uniqueEntities.map(entity => ({
      name: entity,
      value: null
    }))
    
    console.log('✅ entitiesData actualizado:', entitiesData.value.length, 'entidades')
    
  } catch (err) {
    console.error('❌ Error cargando entidades:', err)
    entitiesError.value = err.message
  } finally {
    entitiesLoading.value = false
  }
}

const handleEntityChange = (entity) => {
  console.log('🔍 Entidad seleccionada desde filtro:', entity)
  selectedEntity.value = entity
  
  if (entity === '') {
    console.log('🚫 Entidad es vacía, no seleccionar estado')
    resetSelection()
    return
  }
  
  if (entity) {
    handleStateClick(entity)
  } else {
    resetSelection()
    if (selectedVariable.value && selectedVariable.value !== '') {
      console.log('🔄 Recargando ranking con variable actual:', selectedVariable.value)
      updateRankingByVariable(selectedVariable.value)
    } else {
      loadAllStatesRanking(null)
    }
  }
}

const handleYearChange = async (year) => {
  console.log('📅 Año seleccionado:', year)
  selectedYear.value = year
  
  // ✅ NUEVO: Recargar datos de LinearChart cuando cambia el año
  if (showStackedArea.value) {
    console.log('🔄 Recargando LinearChart por cambio de año')
    await loadIFSSData()
  }
}

const handleVariableChange = (variable) => {
  console.log('📊 Variable seleccionada:', variable)
  selectedVariable.value = variable
  
  if (variable === '') {
    console.log('🚫 Variable es vacía, no actualizar ranking')
    return
  }
  
  if (!selectedState.value) {
    console.log('🔄 Actualizando ranking por variable (sin estado seleccionado)')
    updateRankingByVariable(variable)
  }
}

const handleFiltersChange = (filters) => {
  console.log('🔧 Filtros aplicados:', filters)
}

const handleStateClickWithEmit = async (stateName) => {
  console.log('🗺️ Estado clickeado en mapa:', stateName)
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
  console.log('Navegando a datos regionales...')
  if (selectedState.value) {
    resetSelection()
  }
}

const handleDatosFederalesClick = () => {
  console.log('Navegando a federales...')
}

const handleDatosCualitativosClick = () => {
  console.log('Navegando a cualitativos...')
  router.push('/finanzas/cualitativos')
}

const handleMapContainerClick = (event) => {
  if (event.target.classList.contains('map-svg-container') || 
      event.target.tagName === 'svg' ||
      event.target.classList.contains('map-background')) {
    resetSelection()
    emit('region-selected', null)
  }
}

// ✅ NUEVO: Función para manejar click en el overlay del mapa
const handleOverlayClick = async () => {
  console.log('🔄 Overlay clickeado - Reseteando filtros')
  
  // Resetear todos los filtros a sus valores por defecto
  selectedEntity.value = ''
  selectedVariable.value = ''
  selectedYear.value = null
  
  // Resetear el estado seleccionado en el mapa
  resetSelection()
  
  // Emitir que no hay región seleccionada
  emit('region-selected', null)
  
  // ✅ NUEVO: Recargar ranking con valores por defecto
  await loadAllStatesRanking(null)
  
  // ✅ NUEVO: Incrementar key para forzar re-render de FilterBar
  filterBarKey.value++
  
  await nextTick()
  
  console.log('✅ Filtros reseteados a estado por defecto')
}

// Computed property para el título del ranking
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

// ✅ NUEVO: Watch para recargar LinearChart cuando cambian los filtros
watch(showStackedArea, async (newValue, oldValue) => {
  console.log('👀 Watch showStackedArea - De:', oldValue, '→ A:', newValue)
  
  if (newValue && !oldValue) {
    console.log('🔄 LinearChart activado - Cargando datos IFS')
    await loadIFSSData()
  }
})

watch(selectedVariable, (newVariable, oldVariable) => {
  console.log('👀 Watch selectedVariable - De:', oldVariable, '→ A:', newVariable)
  
  if (newVariable === '') return
  
  if (!selectedState.value) {
    console.log('🔄 Actualizando ranking desde watch')
    updateRankingByVariable(newVariable)
  }
})

watch(selectedYear, async (newYear, oldYear) => {
  console.log('👀 Watch selectedYear - De:', oldYear, '→ A:', newYear)
  
  if (newYear !== oldYear) {
    console.log('🔄 Recargando entidades por cambio de año')
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
  console.log('👀 Watch selectedState - De:', oldState, '→ A:', newState)
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
  await loadEntitiesFromSheet()
  await initializeSlider()
  await loadAllStatesRanking(null)
  
  // ✅ NUEVO: Cargar datos de IFS LinearChart al iniciar
  console.log('📊 Cargando datos iniciales de IFS LinearChart...')
  await loadIFSSData()
  
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
  height: 383.5px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
  z-index: 2;
  position: relative; /* ✅ Para que el overlay se posicione relativo a este contenedor */
}

.retractable-view {
  position: relative;
  width: 70px;
  height: 600px;
  background-color: #053759;
  border-radius: 15px;
  flex-shrink: 0;
  z-index: 1;
  transform: translateX(-50px);
  top: 1px;

}

.expand-retractable-btn {
  position: absolute;
  font-size: 20px;
  color: white;
  left: 42px;
  top: 2px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 3px 6px rgba(0, 0, 0, 0.4),
    inset 0 -2px 4px rgba(255, 255, 255, 0.1),
    0 1px 2px rgba(242, 241, 241, 0.369); 
  transition: all 0.1s ease;
}

.expand-retractable-btn:hover {
  box-shadow: 
    inset 0 4px 8px rgba(0, 0, 0, 0.5),
    inset 0 -2px 4px rgba(255, 255, 255, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

.charts-section {
  transform: translateX(-48PX);
  height: 605px;
  border-radius: 8px;
  width:980px;
  border: 1px solid #ccc;

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

.hamburger-icon {
  height: 80%;
}

.body-ranking-panel {
  height: 100%;
  width: 100%;
}

/* ✅ NUEVO: Overlay que cubre SOLO el área del mapa SVG */
.map-overlay-filter {
  position: absolute;
  top: 19.6px;
  left: 19.6px;
  width: calc(50% - 60px); /* Aproximadamente el ancho del mapa */
  height: calc(100% - 40px);
  background: rgba(180, 180, 180, 0.92); /* ✅ Fondo gris más oscuro */
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
  background: rgba(160, 160, 160, 0.94); /* ✅ Gris más oscuro al hover */
}

.overlay-message {
  text-align: center;
  padding: 30px;
  max-width: 450px;
}

.overlay-text {
  font-size: 18px;
  font-weight: 300;
  color: #2d3748; /* ✅ Color más oscuro para contraste con fondo gris */
  margin: 0;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Animación del overlay */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1400px) {
  .map-and-charts-wrapper {
    flex-direction: column;
    height: auto;
  }
  
  .retractable-view {
    width: 100%;
    height: 60px;
  }
  
  .charts-section {
    width: 100%;
    height: auto;
    min-height: 400px;
  }
}

@media (max-width: 992px) {
  .filters-toggles-row {
    flex-direction: column;
    height: auto;
  }
  
  .filters-column {
    width: 100%;
    max-width: 100%;
    justify-content: center;
  }
  
  .ranking-panel.historical-view {
    width: 100%;
    height: auto;
    min-height: 1400px;
  }
  
  h2 {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .map-container {
    width: 98%;
  }
  
  .filters-toggles-row {
    width: 98%;
  }
  
  .map-and-charts-wrapper {
    padding: 15px;
  }
  
  .ranking-panel {
    padding: 15px;
  }
  
  .ranking-panel.historical-view {
    width: 100%;
    height: auto;
    min-height: 1200px;
  }
  
  h2 {
    font-size: 14px;
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
</style>