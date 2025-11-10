<!-- src/modules/maps/components/RankingView.vue -->
<template>
      <div class="filters-toggles-row">
      <!-- Columna izquierda: Filtros (600px = 3/4 de 800px) -->
      <div class="filters-column">
        <RetractableFilterBar 
          :entities="entitiesData"
          :loading="loading"
          @entity-change="handleEntityChange"
          @year-change="handleYearChange" 
          @variable-change="handleVariableChange"
          @filters-change="handleFiltersChange"
        />
      </div>
      
      <!-- Columna derecha: Toggles -->
      <div class="toggles-column">
        <DataToggleComponent />
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
      <div class="map-and-charts-wrapper">
        
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
          :show-info-card="false"
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

        <!-- CHARTS SECTION - SIEMPRE VISIBLE -->
        <div class="charts-section">
          <div class="charts-container">
            <!-- Mensaje cuando no hay estado seleccionado -->
            <div v-if="!selectedState" class="charts-empty-state">
              <div class="empty-state-icon">📊</div>
              <h4>Análisis de Estado</h4>
              <p>Haz clic en cualquier estado del mapa para ver sus gráficas detalladas</p>
            </div>
          
          </div>
        </div>
      </div>

      <!-- State Details Panel -->
      <div v-if="selectedState" class="ranking-panel">
        <div class="header-ranking-panel">
          <h2>Ingresos</h2>
          <div class="ranking-hamburger-menu">
            <img src="/public/icons/hamburger.png" alt="hamburger-menu" class="hamburger-icon">
          </div>
        </div>
        <div class="body-ranking-panel">
            <div class="slider-ranking-panel">
              <HistoricalCard
                :statesData="statesDataForSlider"
                :selectedStateValue="selectedStateIFSS"
                @range-change="handleRangeChange"
                @filter-change="handleFilterChange"
              />
            </div>
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
import RankingSlider from '../modules/object/component/RankinSlider.vue'
import HistoricalCard from '../modules/object/component/HistoricalCard.vue'
import { useSlider } from '@/composables/useSlider'

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

const router = useRouter()

const handleStateClickWithEmit = async (stateName) => {
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
  // Mantener en la misma página o hacer algo específico
  if (selectedState.value) {
    resetSelection()
  }
}

const handleDatosFederalesClick = () => {
  console.log('Navegando a federales...')
  // router.push('/finanzas/federales')
}

const handleDatosCualitativosClick = () => {
  console.log('Navegando a cualitativos...')
  router.push('/finanzas/cualitativos')
}

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
  }
})

watch(error, (newError) => {
  if (newError) {
    emit('map-error', newError)
  }
})

onMounted(async () => {
  await initializeSlider()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  max-width: 1520px;
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
  gap: 0px;
  padding: 19.6px;  
  border-radius: 11px;
  height: 383.5px;
  background-color: white;
  width: 1225.4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
}

.retractable-view {
  position: relative;
  width: 68.6px;
  height: 344.3px;
  background-color: #053759;
  border-radius: 15px;
  left: -10px;
  z-index: 1;
}

.expand-retractable-btn {
  position: absolute;
  font-size: 15px;
  color: white;
  left: 10px;
  top: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 3px 6px rgba(0, 0, 0, 0.4),  /* Sombra interior superior (efecto hundido) */
    inset 0 -2px 4px rgba(255, 255, 255, 0.1), /* Luz interior inferior */
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
  width: 1400px;
  height: 344.3px;
  border-radius: 15px;
  transform: translateX(0px);
}

.charts-container {
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
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

.details-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.details-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.details-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.metric-value {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.metric-classification {
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}

.description {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .map-and-charts-wrapper {
    flex-direction: column;
  }
  
  .charts-section {
    width: 100%;
  }
}

.filters-toggles-row {
  display: flex;
  gap: 20px;
  height: 90px;
  max-width: 1520px;
  margin: 0 auto;
}

.filters-column {
  width: 613.5px;
  flex-shrink: 0;
  padding: 0;
}

.toggles-column {
  width: 700px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0;
}

.map-section {
  margin: 0 auto;
  padding: 0; 
  max-width: 1520px; 
}

.filter-stats-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stats-header h3 {
  margin: 0;
  color: #2c3e50;
}

.export-btn, .charts-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  margin-top: 10px;
}

.export-btn:hover, .charts-btn:hover {
  background: #45a049;
}

.charts-btn {
 
  margin-left: 10px;
}

.charts-btn:hover {

}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item span:first-child {
  color: #666;
}

.stat-item span:last-child {
  font-weight: bold;
  color: #4CAF50;
}

.current-filter {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
 
}

.current-filter h4 {
  margin: 0 0 8px 0;
  color: #1976D2;
}

.current-filter p {
  margin: 4px 0;
  color: #424242;
}

.error-panel {
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 2rem;
  text-align: center;
}

.error-panel h3 {
  color: #d32f2f;
  margin-bottom: 10px;
}

.error-panel p {
  color: #666;
  margin-bottom: 15px;
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

/* Ranking panel */
.ranking-panel{
 display: flex;
 flex-direction: column;
 height: 1540px;
 width: 1225.6px;
 background: white;
 border: 1px solid #ddd;
 border-radius: 12px;
 padding: 12px;
 box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
}

/* Ranking panel: Header */
.header-ranking-panel{
 display: flex;
 flex-direction: row; 
 height: 3%;
 width: 100%;
 padding: 10px;
 margin-bottom: 10px;
}

h2{
  padding: 4px 0 2px 0;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100;
  color: #535353;
  font-size: 12px;
  margin: 0;  
  flex-shrink: 0;
  justify-content: space-between; 
  margin-right: auto; 
}

.ranking-hamburger-menu{
  margin-left: auto;
}

.hamburger-icon{
  height: 80%;
}

/* Ranking panel: Body */
.body-ranking-panel{
 height: 97%;
}

.slider-ranking-panel{
 height: 100%;
 width: 100%;
}
</style>