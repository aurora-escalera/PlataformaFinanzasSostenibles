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
        <!-- SVG Map -->
        <div class="map-wrapper">
          <!-- NUEVA CARD FLOTANTE CON INFO DEL ESTADO/NACIONAL -->
          <div class="map-info-card" :class="{ 'state-selected': selectedState }">
            <div class="card-content">
              <!-- Título de la posición del país-->
              <div class="card-position-title">
                Posición del país en el Índice<br/>
                de Finanzas Sostenibles<br/>
                (IFS) en 2024
              </div>
              
              <!-- FLEX 1: Dos columnas en una fila (15 | IFS + Clasificación) -->
               <!-- {{ getDisplayIFSS() }} -->
              <div class="card-top-row">
                <!-- Columna izquierda: Número de posición -->
                <div class="card-position-number">
                  15
                </div>
                <!-- Columna derecha: IFS y clasificación -->
                <div class="card-ifss-info">
                  <div class="ifss-value-text">IFS: 1.3</div>
                  <div class="ifss-classification">Medio bajo</div>
                </div>
              </div>

                  <!-- FLEX 2: Dos filas (IFS Regional + Datos federales) -->
              <div class="card-bottom-stack">
                <div class="card-label-pill" @click="handleIFSRegionalClick">IFS Regional</div>
                <div class="card-label-pill" @click="handleDatosFederalesClick">Datos federales</div>
              </div>
            </div>
          </div>

          <!-- Información de hover/nacional (tu box existente) -->
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

        <div class="retractable-view">
          <div class="expand-retractable-btn">+</div>
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
import { ref, computed, watch, nextTick } from 'vue'
import { geoPath, geoMercator } from 'd3-geo'
import { useMaps } from '@/composables/useMaps'
import { useCharts } from '@/composables/useCharts'
import ChartsComponent from '@/modules/charts/components/ChartsComponent.vue'

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

const mousePosition = ref({ x: 0, y: 0 })

// NUEVA FUNCIÓN: Obtener IFSS para mostrar en la card
const getDisplayIFSS = () => {
  if (selectedState.value) {
    const stateInfo = getStateInfo(selectedState.value)
    return stateInfo.value || 0
  }
  return nationalIFSS.value?.value || 0
}

const handleMouseHover = (stateName, event) => {
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  handleStateHover(stateName)
}

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
/* ... estilos existentes ... */

/* NUEVOS ESTILOS PARA LA CARD FLOTANTE */
.map-info-card {
  position: absolute;
  top: 21px;
  left: 410px;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.38);
  z-index: 10;
  width: 143.2px;
  height: 143.2px;
  transition: all 0.3s ease;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* FLEX 1: Dos columnas en una fila */
.card-top-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  padding:0px 15px 2px 15px;
}


/* Columna izquierda - Posición */
.card-position-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.card-position-number {
  font-size: 30px;
  font-weight: 200;
  color: #D4A574;
  line-height: 1;
  position: relative;
}

.icon-indicator {
  position: absolute;
  top: -5px;
  right: -15px;
  font-size: 16px;
  background: #2196F3;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* Columna derecha - IFS Info */
.card-ifss-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.ifss-value-text {
  font-size: 7px;
  color: #767d86;
  font-weight: 300;
  letter-spacing: 0.2ch;
  margin: 0;
}

.ifss-classification {
  font-size: 7px;
  color: #ddb891;
  font-weight: 600;
  letter-spacing: 0.15ch;
  margin: 0;
  line-height: 1;
}

/* FLEX 2: Dos filas apiladas */
.card-bottom-stack {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 10px;
  padding-top: 0px;
}

.card-label-pill {
  background: #f3f4f6;
  border-radius: 3px;
  text-align: center;
  font-size: 6px;
  color: #7a7f8f;
  font-weight: 100;
  height: 15px;
  width: 100px;
  letter-spacing: 0.06em;
  padding-top: 3px;
  cursor: pointer;  /* NUEVO */
  transition: all 0.2s ease;
}

.card-position-title{
  font-size: 6px;
  color: #6b7280;
  letter-spacing: 0.2ch;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  line-height: 1.5;
  letter-spacing: 0.02em;  /* Más sutil que 0.2ch */
  padding-bottom: 7px;
  border-bottom: 1px solid #e5e7eb;
}

.card-label-pill:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.card-label-pill:active {
  background: #d1d5db;
}

.card-ifss-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
}

.card-data-type {
  font-size: 11px;
  color: #999;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

/* Resto de estilos existentes... */
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
  align-items: flex-start;
  gap: 0px;
  padding: 19.6px;  
  background: radial-gradient(circle at bottom left, #d6d6d6 0%, white 50%);
  border-radius: 11px;
  height: 383.5px;
  width: 1242.4px;
}

.map-wrapper {
  position: relative;
  width: 591.8px; 
  height: 344.3px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 15px;
  box-shadow: 1px 1px 1px #666;
  z-index: 2;
}

/* Porcentaje dinamico left: 19.6px;*/
.hover-info-box {
  position: absolute;
  height: 50px;
  top: 180px;
  left: 70px;
  z-index: 15;
  backdrop-filter: blur(10px);
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  transition: all 0.3s ease;
}

/* Barra de colores */
.color-legend {
  position: absolute;
  top: 270px;
  left: 35px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  z-index: 10;
  backdrop-filter: blur(5px);
  width: 130px;
}

.location-label {
  font-size: 10px;
  color: #666;
  font-weight: 100;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value-display {
  font-size: 30px;
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
  height: 40px;
  width: 160px;
}

.legend-item-horizontal {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 8px;
  color: #333;
  flex: 1;
  text-align: center;
  

}

.legend-color-horizontal {
  width: 100%;
  height: 5px;
  border: none;

  padding-bottom: 10px;
}

.legend-item-horizontal:first-child .legend-color-horizontal {
  border-radius: 4px 0 0 4px;
}

.legend-item-horizontal:last-child .legend-color-horizontal {
  border-radius: 0 4px 4px 0;
}

.legend-item-horizontal span {
  
  font-size: 7px;
  line-height: 1.2;
}

.mexico-map {
  background: white;
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

.retractable-view{
  position: relative;
  width: 68.6px;
  height: 344.3px;
  background-color: #053759;
  border-radius: 15px;
  left: -55px;
  transform: translateX(calc(100% - 50px));
  z-index: 1;
}

.expand-retractable-btn{
  position: absolute;
  font-size: 14px;
  color: white;
  left: 43px;
  top: 5px;
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



@media (max-width: 1200px) {
  .map-and-charts-wrapper {
    flex-direction: column;
  }
  
  .charts-section, .map-wrapper {
    width: 100%;
  }
  
  .map-info-card {
    top: 20px;
    left: 20px;
  }
}

@media (max-width: 768px) {
  .map-container {
    padding: 10px;
  }
  
  .color-legend {
    min-width: 140px;
  }
  
  .map-info-card {
    min-width: 150px;
    padding: 16px;
  }
  
  .details-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>