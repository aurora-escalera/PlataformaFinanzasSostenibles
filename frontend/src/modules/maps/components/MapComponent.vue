<!-- src/modules/maps/components/MapComponent.vue - CHARTS AL LADO DERECHO -->
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
        <!-- SVG Map -->
        <div class="map-wrapper">
          <!-- Información de hover/nacional -->
          <div class="hover-info-box">
            <!-- Si hay estado en hover, mostrar información del estado -->
            <div v-if="hoveredState" class="info-content">
              <div class="location-label">{{ hoveredState }}</div>
              <div class="value-display">{{ getStateInfo(hoveredState).value || 0 }}%</div>
            </div>
            
            <!-- Si no hay estado en hover, mostrar información nacional -->
            <div v-else-if="nationalIFSS" class="info-content">
              <div class="location-label">México</div>
              <div class="value-display">{{ nationalIFSS.value }}%</div>
            </div>
          </div>

          <!-- Leyenda de colores IFSS -->
          <div class="color-legend">
            <div class="legend-items-horizontal">
              <div class="legend-item-horizontal">
                <div class="legend-color-horizontal" style="background-color: #6ac952"></div>
                <span>Muy Alto</span>
              </div>
              <div class="legend-item-horizontal">
                <div class="legend-color-horizontal" style="background-color: #94d351"></div>
                <span>Alto</span>
              </div>
              <div class="legend-item-horizontal">
                <div class="legend-color-horizontal" style="background-color: #bddc50"></div>
                <span>Medio Alto</span>
              </div>
              <div class="legend-item-horizontal">
                <div class="legend-color-horizontal" style="background-color: #e6d64f"></div>
                <span>Medio</span>
              </div>
              <div class="legend-item-horizontal">
                <div class="legend-color-horizontal" style="background-color: #e6a74c"></div>
                <span>Medio Bajo</span>
              </div>
              <div class="legend-item-horizontal">
                <div class="legend-color-horizontal" style="background-color: #e67849"></div>
                <span>Bajo</span>
              </div>
              <div class="legend-item-horizontal">
                <div class="legend-color-horizontal" style="background-color: #e52845"></div>
                <span>Muy Bajo</span>
              </div>
            </div>
          </div>

          <svg 
            :width="mapConfig.width" 
            :height="mapConfig.height"
            class="mexico-map"
          >
            <g>
              <path
                v-for="feature in geoData?.features || []"
                :key="feature.properties.state_name"
                :d="getPathData(feature)"
                :fill="getStateColor(feature.properties.state_name)"
                :stroke="getStrokeColor(feature.properties.state_name)"
                :stroke-width="getStrokeWidth(feature.properties.state_name)"
                class="state-path"
                @click="handleStateClickWithEmit(feature.properties.state_name)"
                @mouseenter="handleMouseHover(feature.properties.state_name, $event)"
                @mouseleave="handleStateLeave"
              />
            </g>
          </svg>

          <!-- Tooltip -->
          <div 
            v-if="hoveredState" 
            class="tooltip"
            :style="tooltipStyle"
          >
            <div class="tooltip-content">
              <h4>{{ hoveredState }}</h4>
              <div class="tooltip-data">
                <p>IFSS: {{ getStateInfo(hoveredState).value || 0 }}</p>
                <p>Clasificación: {{ getIFSSLabel(getStateInfo(hoveredState).value || 0).label }}</p>
                <p>Año: {{ getStateInfo(hoveredState).year }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CHARTS SECTION - SIEMPRE VISIBLE -->
        <!-- CHARTS SECTION - SIEMPRE VISIBLE -->
        <div class="charts-section">
          <div class="charts-container">
            <div class="charts-header">
              <h3>{{ selectedState ? `Análisis Detallado - ${selectedState}` : 'Selecciona un estado' }}</h3>
              <button v-if="selectedState" @click="resetSelection" class="charts-close-btn">✕</button>
            </div>
            
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

      <!-- Statistics Summary -->
      <div v-if="generalStats" class="stats-summary">
        <h3>Resumen Nacional IFSS</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ generalStats.totalStates }}</span>
            <span class="stat-label">Estados</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ generalStats.avgIFSS }}%</span>
            <span class="stat-label">Promedio IFSS</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ generalStats.maxIFSS }}%</span>
            <span class="stat-label">IFSS Máximo</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ generalStats.minIFSS }}%</span>
            <span class="stat-label">IFSS Mínimo</span>
          </div>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="rankings">
        <div class="top-performers">
          <h4>Top 5 Estados IFSS</h4>
          <div class="ranking-list">
            <div 
              v-for="(state, index) in topPerformingStates" 
              :key="state.name"
              class="ranking-item"
              @click="handleStateClickWithEmit(state.name)"
            >
              <span class="rank">{{ index + 1 }}</span>
              <span class="name">{{ state.name }}</span>
              <span class="value">{{ state.value || 0 }}</span>
              <span class="classification" :style="{ color: getIFSSLabel(state.value || 0).color }">
                {{ getIFSSLabel(state.value || 0).label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { geoPath, geoMercator } from 'd3-geo'
import { useMaps } from '@/composables/useMaps'
import { useCharts } from '@/composables/useCharts'
import ChartsComponent from '@/modules/charts/components/ChartsComponent.vue'
import DonutChart from '@/modules/charts/components/DonutChart.vue'
import BarChart from '@/modules/charts/components/BarChart.vue'

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
  // NUEVO: Recibir el composable compartido
  mapsComposable: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['region-selected', 'map-error'])

// Usar el composable recibido o crear uno nuevo (fallback)
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

const mousePosition = ref({ x: 0, y: 0 })

const handleMouseHover = (stateName, event) => {
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  handleStateHover(stateName)
}

const handleStateClickWithEmit = (stateName) => {
  handleStateClick(stateName)
  
  setTimeout(() => {
    if (selectedState.value === stateName) {
      const stateData = getStateInfo(stateName)
      emit('region-selected', {
        name: stateName,
        data: stateData
      })
    } else {
      emit('region-selected', null)
    }
  }, 50)
}

const projection = computed(() => {
  return geoMercator()
    .scale(mapConfig.value.scale)
    .center(mapConfig.value.center)
    .translate([mapConfig.value.width / 2, mapConfig.value.height / 2])
})

const pathGenerator = computed(() => {
  return geoPath().projection(projection.value)
})

const getPathData = (feature) => {
  return pathGenerator.value(feature)
}

const getStrokeColor = (stateName) => {
  if (selectedState.value === stateName) return '#FfFFFF'
  if (hoveredState.value === stateName) return '#555555'
  return '#555555'
}

const getStrokeWidth = (stateName) => {
  if (selectedState.value === stateName) return 3
  if (hoveredState.value === stateName) return 2
  return 1
}

const tooltipStyle = computed(() => {
  if (!hoveredState.value) return { display: 'none' }
  
  return {
    position: 'fixed',
    left: `${mousePosition.value.x + 20}px`,
    top: `${mousePosition.value.y - 150}px`,
    pointerEvents: 'none',
    zIndex: 1000,
    transform: 'translate(0, 0)',
    maxWidth: '250px'
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

.map-and-charts-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 0; 
}

.map-wrapper {
  width: 800px; 
  flex-shrink: 0;
  position: relative;
}

.color-legend {
  position: absolute;
  bottom: 100px;
  left: 25%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  padding: 12px;
  z-index: 10;
  backdrop-filter: blur(5px);
  min-width: 450px;
  max-width: 450px;
}

.hover-info-box {
  position: absolute;
  top: 59%;
  left: 10%;
  z-index: 15;
  backdrop-filter: blur(10px);
  font-family: Arial, Helvetica, sans-serif;
  min-width: 350px;
  text-align: center;
  transition: all 0.3s ease;
}

.location-label {
  font-size: 20px;
  color: #666;
  font-weight: 500;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value-display {
  font-size: 70px;
  font-weight: 300;
  color: #2c3e50;
  line-height: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-bottom: 2px solid #bfbdbd; 
  padding-bottom: 14px;
}

.legend-items-horizontal {
  display: flex;
  gap: 0;
  align-items: stretch;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  border: 0px solid rgba(0,0,0,0.1);
}

.legend-item-horizontal {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
  color: #333;
  flex: 1;
  text-align: center;
}

.legend-color-horizontal {
  width: 160%;
  height: 30px;
  border: none;
  margin-bottom: 4px;
}

.legend-item-horizontal:first-child .legend-color-horizontal {
  border-radius: 4px 0 0 4px;
}

.legend-item-horizontal:last-child .legend-color-horizontal {
  border-radius: 0 4px 4px 0;
}

.legend-item-horizontal span {
  padding: 2px 4px;
  font-size: 9px;
  line-height: 1.2;
}

.mexico-map {
  border: 1px solid #dee3e0;
  border-radius: 8px;
  background: #f8f9fa;
}

.state-path {
  cursor: pointer;
  transition: all 0.05s ease;
  opacity: 1;
  stroke-width: .5;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.state-path:hover {
  filter: brightness(1.3);
  opacity: 0.95;
  stroke-width: 0.5;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
  stroke-linecap: round;
}

svg g:hover .state-path {
  opacity: 0.8;
}

svg g:hover .state-path:hover  {
  opacity: 1;
  filter: saturate(1.8) contrast(1.3);
  stroke-width: 0.4;
  filter: drop-shadow(0 0 6px rgba(10, 10, 10, 0.8));
  transform-origin: center;
}

.tooltip {
  background: #f8f8f8;
  color: rgb(12, 12, 12);
  padding: 20px;
  border-radius: 6px;
  font-size: 12px;
  max-width: 200px;
  box-shadow: 0 8px 14px rgba(0, 0, 0, 0.3);
}

.tooltip h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #2f2e2e;
}

.tooltip-data p {
  margin: 0px 0;
  font-weight: normal;
  color: #3a3a3a;
  line-height: 1.2;
  font-size: 12px;
}

.charts-section {
  width: 700px;
  flex-shrink: 0;
  height: 800px;
  overflow-y: auto;
}

.charts-container {
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.charts-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.charts-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.charts-close-btn:hover {
  background: #f0f0f0;
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

.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.chart-container {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 140px;
  transition: box-shadow 0.2s;
}

.chart-container:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.details-panel {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.details-header h3 {
  margin: 0;
  color: #2196F3;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.details-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
}

.metric-label {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.metric-classification {
  font-size: 11px;
  font-weight: bold;
  margin-top: 3px;
}

.description {
  padding: 10px;
  background: #f0f0f0;
  border-radius: 4px;
}

.stats-summary {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.stats-summary h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #4CAF50;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.rankings {
  margin: 20px 0;
}

.top-performers {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.top-performers h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.ranking-item:hover {
  background: #e3f2fd;
}

.rank {
  font-weight: bold;
  color: #FF9800;
  min-width: 20px;
}

.name {
  flex: 1;
}

.value {
  font-weight: bold;
  color: #4CAF50;
  margin-right: 8px;
}

.classification {
  font-size: 10px;
  font-weight: bold;
}

@media (max-width: 1200px) {
  .map-and-charts-wrapper {
    flex-direction: column;
  }
  
  .charts-section, .map-wrapper {
    width: 100%;
  }
  
  .charts-row {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .map-container {
    padding: 10px;
  }
  
  .charts-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .color-legend {
    min-width: 140px;
  }
  
  .details-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>