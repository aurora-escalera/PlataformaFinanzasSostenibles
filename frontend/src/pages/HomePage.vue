<!-- src/modules/maps/components/HomePage.vue -->
<template>
  <div class="filters-toggles-row">
    <!-- Columna izquierda: Filtros -->
    <div class="filters-column">
      <RetractableFilterBar 
        :entities="entitiesData"
        :loading="entitiesLoading"
        :selectedState="selectedState"
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
        <!-- Botón retráctil -->
        <div class="retractable-view">
          <div class="expand-retractable-btn" @click="handleDatosCualitativosClick">+</div>
        </div>

        <!-- RANKING CHART SECTION - Al lado del mapa -->
        <div class="charts-section">
          <div class="charts-container">
            <!-- Gráfica de Ranking Horizontal con datos de Google Sheets -->
            <div class="ranking-chart-section" style="height: 100%; display: flex; flex-direction: column;">
              <div v-if="rankingLoading" class="ranking-loading">
                <div class="spinner-small"></div>
                <p>Cargando ranking IFSS...</p>
              </div>
              
              <div v-else-if="rankingError" class="ranking-error">
                <p>Error: {{ rankingError }}</p>
                <button @click="loadStateRankingData" class="retry-btn-small">
                  Reintentar
                </button>
              </div>
              
              <HorizontalRankingChart
                v-else-if="rankingData.length > 0"
                :variables="rankingData"
                title="Ranking IFSS por Estado"
                :showAllBars="true"
                :animationDelay="0"
                :selectedState="selectedState"
              />
              
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
      <div v-if="selectedState" class="ranking-panel">
        <div class="header-ranking-panel">
          <div class="ranking-hamburger-menu">
            <img src="/public/icons/hamburger.png" alt="hamburger-menu" class="hamburger-icon">
          </div>
        </div>
        
        <div class="body-ranking-panel">
          <!-- ChartsComponent con gráficas del estado seleccionado -->
          <ChartsComponent 
            :selectedState="selectedState"
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
import { useSlider } from '@/composables/useSlider'
import { useStateRanking } from '@/composables/useStateRanking'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping } from '@/dataConection/storageConfig'

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
  loadAllStatesRanking
} = useStateRanking()

const router = useRouter()
const selectedVariable = ref(null)
const { fetchData: fetchEntities } = useStorageData()

const entitiesData = ref([])
const entitiesLoading = ref(false)
const entitiesError = ref(null)

const loadEntitiesFromSheet = async () => {
  try {
    console.log('📥 Cargando entidades desde Google Sheets...')
    entitiesLoading.value = true
    entitiesError.value = null
    
    const presupuestosMapping = getMapping('chartsPresupuestos')
    const rawData = await fetchEntities('chartsPresupuestos', 'Datos_Cuantitativos')
    
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
  if (entity) {
    handleStateClick(entity)
  } else {
    resetSelection()
  }
}

const handleYearChange = (year) => {
  console.log('📅 Año seleccionado:', year)
}

const handleVariableChange = (variable) => {
  console.log('📊 Variable seleccionada:', variable)
  selectedVariable.value = variable
}

const handleFiltersChange = (filters) => {
  console.log('🔧 Filtros aplicados:', filters)
}

const handleStateClickWithEmit = async (stateName) => {
  console.log('🗺️ Estado clickeado en mapa:', stateName)
  if (!stateName) {
    resetSelection()
    emit('region-selected', null)
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
  await loadAllStatesRanking()
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
  align-items: flex-start;
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
  flex: 1;
  height: 605px;
  border-radius: 15px;
  min-width: 0;
}

.charts-container {
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  width: 100%;
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
  
  h2 {
    font-size: 14px;
  }
}
</style>