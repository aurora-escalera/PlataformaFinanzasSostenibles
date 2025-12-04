<!-- src/modules/maps/components/RankingView.vue -->
<template>
      <div class="filters-toggles-row">
      <!-- Columna izquierda: Filtros (600px = 3/4 de 800px) -->

      
      <!-- Columna derecha: Toggles -->
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
      <!-- State Details Panel - Siempre visible -->
      <div class="ranking-panel">
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