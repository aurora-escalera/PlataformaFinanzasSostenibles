<template>
  <div class="map-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos del mapa...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <p>❌ Error: {{ error }}</p>
      <button @click="initializeData" class="retry-btn">
        Reintentar
      </button>
    </div>

    <!-- Map Content -->
    <div v-if="!loading && !error" class="map-content">
      <!-- Controles -->
      <div class="map-controls">
        <div class="search-box">
          <input 
            v-model="searchTerm" 
            placeholder="Buscar estado..."
            @input="onSearch"
            class="search-input"
          >
        </div>
        
        <div class="filter-controls">
          <label>
            IFSS mínimo:
            <input 
              v-model.number="minFilter" 
              type="range" 
              min="0" 
              max="100"
              @input="applyFilter"
            >
            {{ minFilter }}%
          </label>
        </div>

        <button @click="resetSelection" class="reset-btn">
          Resetear Selección
        </button>
      </div>

      <!-- SVG Map -->
      <div class="map-wrapper">
        <!-- Leyenda de colores IFSS -->
        <div class="color-legend">
  <h4>Escala IFSS</h4>
  <div class="legend-items">
    <div class="legend-item">
      <div class="legend-color" style="background-color: #e52845"></div>
      <span>Muy alto (2.5+)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #e67849"></div>
      <span>Alto (2.0-2.4)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #e6a74c"></div>
      <span>Medio alto (1.5-1.9)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #e6d64f"></div>
      <span>Medio (1.0-1.4)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #bddc50"></div>
      <span>Medio bajo (0.8-0.9)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #94d351"></div>
      <span>Bajo (0.6-0.7)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #6ac952"></div>
      <span>Muy bajo (0.5)</span>
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
              @click="handleStateClick(feature.properties.state_name)"
              @mouseenter="handleStateHover(feature.properties.state_name)"
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
              <p><strong>IFSS:</strong> {{ getStateInfo(hoveredState).value || 0 }}</p>
              <p><strong>Clasificación:</strong> {{ getIFSSLabel(getStateInfo(hoveredState).value || 0).label }}</p>
              <p><strong>Proyectos Activos:</strong> {{ getStateInfo(hoveredState).proyectos_activos }}</p>
              <p><strong>Inversión Total:</strong> ${{ formatCurrency(getStateInfo(hoveredState).inversion_total) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- State Details Panel -->
      <div v-if="selectedState" class="details-panel">
        <div class="details-header">
          <h3>{{ selectedState }}</h3>
          <button @click="selectedState = null" class="close-btn">✕</button>
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
            <div class="metric-value">{{ getStateInfo(selectedState).proyectos_activos }}</div>
            <div class="metric-label">Proyectos Activos</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-value">${{ formatCurrency(getStateInfo(selectedState).inversion_total) }}</div>
            <div class="metric-label">Inversión Total</div>
          </div>
        </div>

        <div class="description">
          <p>{{ getStateInfo(selectedState).descripcion }}</p>
        </div>
      </div>

      <!-- Statistics Summary -->
      <div v-if="generalStats" class="stats-summary">
        <h3>Resumen Nacional</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ generalStats.totalStates }}</span>
            <span class="stat-label">Estados</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${{ formatCurrency(generalStats.totalInvestment) }}</span>
            <span class="stat-label">Inversión Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ generalStats.totalProjects }}</span>
            <span class="stat-label">Proyectos Totales</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ generalStats.avgIFSS }}%</span>
            <span class="stat-label">Promedio IFSS</span>
          </div>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="rankings">
        <div class="top-performers">
          <h4>🏆 Top 5 Estados</h4>
          <div class="ranking-list">
            <div 
              v-for="(state, index) in topPerformingStates" 
              :key="state.name"
              class="ranking-item"
              @click="handleStateClick(state.name)"
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
import { ref, computed } from 'vue'
import { geoPath, geoMercator } from 'd3-geo'
import { useMaps } from '@/composables/useMaps'

// Usar el composable
const {
  geoData,
  loading,
  error,
  selectedState,
  hoveredState,
  mapConfig,
  generalStats,
  topPerformingStates,
  getStateColor,
  getStateInfo,
  getIFSSLabel,
  handleStateClick,
  handleStateHover,
  handleStateLeave,
  resetSelection,
  searchState,
  filterByRange,
  initializeData
} = useMaps()

// Estados locales del componente
const searchTerm = ref('')
const minFilter = ref(0)
const searchResults = ref([])

// Configurar proyección D3
const projection = computed(() => {
  return geoMercator()
    .scale(mapConfig.value.scale)
    .center(mapConfig.value.center)
    .translate([mapConfig.value.width / 2, mapConfig.value.height / 2])
})

const pathGenerator = computed(() => {
  return geoPath().projection(projection.value)
})

// Generar path data para cada estado
const getPathData = (feature) => {
  return pathGenerator.value(feature)
}

// Estilos dinámicos para los estados -------------------------------------->#FF8600. #FF5510. FF9800
const getStrokeColor = (stateName) => {
  if (selectedState.value === stateName) return '#FfFFFF'
  if (hoveredState.value === stateName) return '#000000'
  return '#555555'
}

const getStrokeWidth = (stateName) => {
  if (selectedState.value === stateName) return 3
  if (hoveredState.value === stateName) return 2
  return 1
}

// Posición del tooltip
const tooltipStyle = computed(() => {
  return {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 1000
  }
})

// Formatear moneda
const formatCurrency = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('MX$', '')
}

// Búsqueda de estados
const onSearch = () => {
  searchResults.value = searchState(searchTerm.value)
}

// Aplicar filtro
const applyFilter = () => {
  const filtered = filterByRange(minFilter.value, 100)
  console.log('Estados filtrados:', filtered)
}
</script>

<style scoped>
.map-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-controls label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.reset-btn, .retry-btn {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.reset-btn:hover, .retry-btn:hover {
  background: #1976D2;
}

.map-wrapper {
  position: relative;
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
}

.color-legend {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  min-width: 200px;
  height: fit-content;
}

.color-legend h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
  text-align: center;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(0,0,0,0.1);
}

.mexico-map {
  border: 1px solid #13ca65;
  border-radius: 8px;
  background: #f8f9fa;
}
/*--------------estado*/
.state-path {
  cursor: pointer;
  transition: all 0.05s ease;
  opacity: 1;
  stroke-width: .5;
  vector-effect: non-scaling-stroke; /* Líneas consistentes */
  stroke-linejoin: round; /* Uniones redondeadas */
  stroke-linecap: round; /* Extremos redondeados */
}
/*Cuando hay transicion, lo que pasa en el mapa cuando se hoverea un estado*/
.state-path:hover {
  filter: brightness(1.1);
  opacity: 0.9;
  stroke-width: 0.8;
  vector-effect: non-scaling-stroke; /* Líneas consistentes */
  stroke-linejoin: round; /* Uniones redondeadas */
  stroke-linecap: round; /* Extremos redondeados */
}

.tooltip {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  max-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tooltip h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #4CAF50;
}

.tooltip-data p {
  margin: 4px 0;
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

/**/
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

@media (max-width: 768px) {
  .map-container {
    padding: 10px;
  }
  
  .map-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .map-wrapper {
    flex-direction: column;
    align-items: center;
  }
  
  .color-legend {
    order: -1;
    min-width: auto;
    width: 100%;
  }
  
  .legend-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
  }
  
  .details-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>