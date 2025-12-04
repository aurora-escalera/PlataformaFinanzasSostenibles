<!-- src/modules/maps/components/MapComponent.vue -->
<template>
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
            
            <!-- ChartsComponent cuando hay estado seleccionado -->
            <ChartsComponent 
              v-else
              :selectedState="selectedState"
              :ifssData="getStateInfo(selectedState)"
            />
          </div>
        </div>
      </div>

      <!-- State Details Panel -->
      <div v-if="selectedState" class="details-panel">
        <div class="details-header">
          <h3>{{ selectedState }}</h3>
          <button @click="resetSelection" class="close-btn">✕</button>
        </div>
        
        <div class="details-content">
          <div class="metric-card">
            <div class="metric-value">{{ getStateInfo(selectedState).value || 0 }}</div>
            <div class="metric-label">IFSS</div>
            <div class="metric-classification" :style="{ color: getIFSSLabel(getStateInfo(selectedState).value || 0).color }">
              {{ getIFSSLabel(getStateInfo(selectedState).value || 0).label }}
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-value">{{ getStateInfo(selectedState).year }}</div>
            <div class="metric-label">Año de datos</div>
          </div>
        </div>

        <div class="description">
          <p>{{ getStateInfo(selectedState).descripcion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useMaps } from '@/composables/useMaps'
import { useCharts } from '@/composables/useCharts'
import { useRouter } from 'vue-router'
import MexicoMapSVG from './MexicoMapSVG.vue'
import ChartsComponent from '@/modules/charts/components/ChartsComponent.vue'

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
  background: radial-gradient(circle at bottom left, #d6d6d6 0%, white 50%);
  border-radius: 11px;
  height: 383.5px;
  width: 1242.4px;
}

.retractable-view {
  position: relative;
  width: 68.6px;
  height: 344.3px;
  background-color: #053759;
  border-radius: 15px;
  left: -40px;
  z-index: 1;
}

.expand-retractable-btn {
  position: absolute;
  font-size: 15px;
  color: white;
  left: 43px;
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
  position: relative;
  width: 591.8px;
  height: 344.3px;
  border-radius: 15px;
  box-shadow: 1px 1px 1px #666;
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

@media (max-width: 768px) {
  .map-container {
    padding: 10px;
  }
  
  .details-content {
    grid-template-columns: 1fr;
  }
}
</style>