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

      <!-- SVG Map -->
    <div class="map-wrapper">
    <!-- Información de hover/nacional -->
        <div class="hover-info-box">
          <!-- Si hay estado en hover, mostrar información del estado -->
          <div v-if="hoveredState" class="info-content">
            <div class="location-label">{{ hoveredState }}</div>
            <div class="value-display">{{ getStateInfo(hoveredState).value || 0  }}%</div>
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
              @click="handleStateClick(feature.properties.state_name)"
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
  nationalIFSS,
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

const mousePosition = ref({ x: 0, y: 0 })
// Función local para manejar el hover con posición del mouse
const handleMouseHover = (stateName, event) => {
  // Capturar posición del mouse
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  
  // Llamar a la función original del composable
  handleStateHover(stateName)
}

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
/*const getStrokeColor = (stateName) => {
  if (selectedState.value === stateName) return '#FfFFFF'
  if (hoveredState.value === stateName) return '#000000'
  return '#555555'
}
*/
const getStrokeColor = (stateName) => {
  if (selectedState.value === stateName) return '#FfFFFF'
  if (hoveredState.value === stateName) return '#555555'
  return '#555555' // ← Mismo color que el fondo del SVG, esto hará invisible el contorno externo
}

const getStrokeWidth = (stateName) => {
  if (selectedState.value === stateName) return 3
  if (hoveredState.value === stateName) return 2
  return 1
}

// Posición del tooltip
const tooltipStyle = computed(() => {
  if (!hoveredState.value) return { display: 'none' }
  
  return {
    position: 'fixed', // Cambiar a 'fixed' para posición relativa a la ventana
    left: `${mousePosition.value.x + 20}px`, // Offset de 15px a la derecha
    top: `${mousePosition.value.y - 150}px`, // Offset de 10px arriba
    pointerEvents: 'none',
    zIndex: 1000,
    transform: 'translate(0, 0)', // Evitar transformaciones adicionales
    maxWidth: '250px' // Limitar ancho del tooltip
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

.map-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
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

.color-legend h4 {
  margin: 0 0 14px 0;
  font-size: 12px;
  color: #333;
  text-align: center;
  font-weight: 600;
}

/* Barra de colores continua */
.color-bar {
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(to left, 
    #6ac952 100%,     /* Muy bajo */
    #94d351 83.33%, /* Bajo */
    #bddc50 66.67%, /* Medio bajo */
    #e6d64f 50%,    /* Medio */
    #e6a74c 33.33% /* Medio alto */
    #e67849 16.67%, /* Alto */
    #e52845 0%    /* Muy alto */
  );
  border: 1px solid rgba(0,0,0,0.1);
  position: relative;
}

.color-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 10px;
  color: #666;
}

.color-labels span {
  flex: 1;
  text-align: center;
  padding: 0 2px;
}

/* ===== CUADRO DE INFORMACIÓN EN HOVER ===== */
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

/* Alternativa: Items individuales horizontales */
.legend-items-horizontal {
  display: flex;
  gap: 0; /* Sin espacios entre elementos */
  align-items: stretch;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden; /* Para bordes redondeados */
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
  border: none; /* Sin bordes individuales */
  margin-bottom: 4px;
}

/* Bordes redondeados solo en extremos */
.legend-item-horizontal:first-child .legend-color-horizontal {
  border-radius: 4px 0 0 4px;
}

.legend-item-horizontal:last-child .legend-color-horizontal {
  border-radius: 0 4px 4px 0;
}

/* Texto debajo de la barra */
.legend-item-horizontal span {
  padding: 2px 4px;
  font-size: 9px;
  line-height: 1.2;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #333;
}

.legend-color {
  width: 12px;
  height: 14px;
  border-radius: 2px;
  border: 1px solid rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.mexico-map {
  border: 1px solid #dee3e0;
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
  filter: brightness(1.3);
  opacity: 0.95;
  stroke-width: 0.5;
  vector-effect: non-scaling-stroke; /* Líneas consistentes */
  stroke-linejoin: round; /* Uniones redondeadas */
  stroke-linecap: round; /* Extremos redondeados */
}

/* Cuando hay hover en cualquier estado del grupo */
svg g:hover .state-path {
  opacity: 0.8; /* Todos los estados se atenúan */
}

/* El estado específico que tiene hover mantiene opacidad 1 */
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
    min-width: 140px;
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