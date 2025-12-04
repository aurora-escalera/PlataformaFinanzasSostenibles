<!-- src/modules/maps/components/MexicoMapSVG.vue --> 
<template>
  <div class="map-wrapper" @click="handleBackgroundClick">
    <!-- CARD FLOTANTE CON INFO DEL ESTADO/NACIONAL -->
    <div 
      v-if="showInfoCard"
      class="map-info-card" 
      :class="{ 'state-selected': selectedState }"
    >
      <div class="card-content">
        <!-- Título de la posición del país-->
        <div class="card-position-title">
          {{ selectedState 
            ? `Estado: ${selectedState}` 
            : 'Posición del país en el Índice de Finanzas Sostenibles (IFS) en 2024' 
          }}
        </div>
        
        <!-- FLEX 1: Dos columnas en una fila (15 | IFS + Clasificación) -->
        <div class="card-top-row">
          <!-- Columna izquierda: Número de posición -->
          <div class="card-position-number">
            {{ getCurrentPosition() }}
          </div>
          <!-- Columna derecha: IFS y clasificación -->
          <div class="card-ifss-info">
            <div class="ifss-value-text">IFSS: {{ getDisplayIFSS() }}</div>
            <div 
              class="ifss-classification"
              :style="{ color: getCurrentClassificationColor() }"
            >
              {{ getCurrentClassification() }}
            </div>
          </div>
        </div>

        <!-- FLEX 2: Dos filas (IFS Regional + Datos federales) -->
        <!-- ✅ Solo mostrar si showNavigation es true -->
        <div 
          v-if="showNavigation"
          class="card-bottom-stack"
        >
          <div 
            class="card-label-pill" 
            :class="{ 'active': activeView === 'regional' }"
            @click.stop="handleIFSRegionalClick"
          >
            IFS Regional
          </div>
          <div 
            class="card-label-pill"
            :class="{ 'active': activeView === 'federal' }"
            @click.stop="handleDatosFederalesClick"
          >
            Datos federales
          </div>
        </div>
      </div>
    </div>

    <!-- Información de hover/estado seleccionado/nacional -->
    <div class="hover-info-box">
      <!-- Prioridad 1: Si hay estado seleccionado, mostrar su información -->
      <div v-if="selectedState" class="info-content">
        <div class="location-label">{{ selectedState }}</div>
        <div class="value-display">IFS: {{ getStateInfo(selectedState).value || 0 }}</div>
      </div>
      
      <!-- Prioridad 2: Si hay estado en hover (y no hay seleccionado), mostrar información del estado -->
      <div v-else-if="hoveredState" class="info-content">
        <div class="location-label">{{ hoveredState }}</div>
        <div class="value-display">IFS: {{ getStateInfo(hoveredState).value || 0 }}</div>
      </div>
      
      <!-- Prioridad 3: Si no hay estado en hover ni seleccionado, mostrar información nacional -->
      <div v-else-if="nationalIFSS" class="info-content">
        <div class="location-label">México</div>
        <div class="value-display">IFSS: {{ nationalIFSS.value }}</div>
      </div>
    </div>

    <!-- Leyenda de colores IFSS -->
    <div class="color-legend">
      <!-- Leyenda normal (cuando no hay estado seleccionado) -->
      <div v-if="!selectedState" class="legend-items-horizontal">
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
      
      <!-- Leyenda del estado seleccionado -->
      <div v-else class="legend-selected-state">
        <div 
          class="selected-state-bar"
          :style="{ backgroundColor: getSelectedStateColor() }"
        >
          <span class="selected-state-label">{{ getSelectedStateClassification() }}</span>
        </div>
      </div>
    </div>

    <svg 
      :width="mapConfig.width" 
      :height="mapConfig.height"
      class="mexico-map"
      viewBox="55 32 485 275"
      preserveAspectRatio="xMidYMid meet"
      @click="handleSvgClick"
    >
      <g>
        <path
          v-for="feature in geoData?.features || []"
          :key="feature.properties.state_name"
          :d="getPathData(feature)"
          :fill="getStateColor(feature.properties.state_name)"
          :stroke="getStrokeColor(feature.properties.state_name)"
          :stroke-width="getStrokeWidth(feature.properties.state_name)"
          :class="getStateClass(feature.properties.state_name)"
          @click.stop="handleStateClick(feature.properties.state_name)"
          @mouseenter="handleMouseHover(feature.properties.state_name, $event)"
          @mouseleave="handleMouseLeave"
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { geoPath, geoMercator } from 'd3-geo'

// Props
const props = defineProps({
  geoData: {
    type: Object,
    required: true
  },
  selectedState: {
    type: String,
    default: null
  },
  hoveredState: {
    type: String,
    default: null
  },
  mapConfig: {
    type: Object,
    required: true
  },
  nationalIFSS: {
    type: Object,
    default: null
  },
  getStateColor: {
    type: Function,
    required: true
  },
  getStateInfo: {
    type: Function,
    required: true
  },
  getIFSSLabel: {
    type: Function,
    required: true
  },
  // Prop para controlar la visibilidad del card-bottom-stack
  showNavigation: {
    type: Boolean,
    default: true
  },
  // Prop para controlar la visibilidad de todo el map-info-card
  showInfoCard: {
    type: Boolean,
    default: true
  },
  // Prop para controlar qué vista está activa ('federal' o 'regional')
  activeView: {
    type: String,
    default: 'federal'
  }
})

// Emits
const emit = defineEmits([
  'state-click',
  'state-hover',
  'state-leave',
  'navigate-regional',
  'navigate-federal'
])

// Estado local
const mousePosition = ref({ x: 0, y: 0 })

// Proyección del mapa
const projection = computed(() => {
  return geoMercator()
    .scale(props.mapConfig.scale)
    .center(props.mapConfig.center)
    .translate([props.mapConfig.width / 2, props.mapConfig.height / 2])
})

const pathGenerator = computed(() => {
  return geoPath().projection(projection.value)
})

// Funciones de visualización
const getPathData = (feature) => {
  return pathGenerator.value(feature)
}

// Nueva función para obtener las clases CSS del estado
const getStateClass = (stateName) => {
  const classes = ['state-path']
  
  if (props.selectedState === stateName) {
    classes.push('state-selected')
  } else if (props.hoveredState === stateName) {
    classes.push('state-hovered')
  }
  
  if (props.selectedState && props.selectedState !== stateName) {
    classes.push('state-dimmed')
  }
  
  return classes.join(' ')
}

const getStrokeColor = (stateName) => {
  if (props.selectedState === stateName) return '#1a202c'
  if (props.hoveredState === stateName) return '#555555'
  return '#555555'
}

const getStrokeWidth = (stateName) => {
  if (props.selectedState === stateName) return 3
  if (props.hoveredState === stateName) return 2
  return 1
}

// Funciones para la card
const getDisplayIFSS = () => {
  if (props.selectedState) {
    const stateInfo = props.getStateInfo(props.selectedState)
    return stateInfo.value || 0
  }
  return props.nationalIFSS?.value || 0
}

const getCurrentClassification = () => {
  const value = getDisplayIFSS()
  return props.getIFSSLabel(value).label
}

const getCurrentClassificationColor = () => {
  const value = getDisplayIFSS()
  return props.getIFSSLabel(value).color || '#ddb891'
}

const getCurrentPosition = () => {
  if (props.selectedState) {
    return '--'
  }
  return '15'
}

// Funciones para la leyenda del estado seleccionado
const getSelectedStateColor = () => {
  if (!props.selectedState) return '#cccccc'
  return props.getStateColor(props.selectedState)
}

const getSelectedStateClassification = () => {
  if (!props.selectedState) return ''
  const stateInfo = props.getStateInfo(props.selectedState)
  const value = stateInfo.value || 0
  return props.getIFSSLabel(value).label
}

// Handlers de eventos
const handleMouseHover = (stateName, event) => {
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  emit('state-hover', stateName)
}

const handleMouseLeave = () => {
  emit('state-leave')
}

const handleStateClick = (stateName) => {
  emit('state-click', stateName)
}

const handleBackgroundClick = (event) => {
  // Si el click es en el wrapper (no en SVG o estados)
  if (event.target.classList.contains('map-wrapper')) {
    emit('state-click', null)
  }
}

const handleSvgClick = (event) => {
  // Si el click es directamente en el SVG (no en un path)
  if (event.target.tagName === 'svg' || event.target.tagName === 'g') {
    emit('state-click', null)
  }
}

const handleIFSRegionalClick = () => {
  emit('navigate-regional')
}

const handleDatosFederalesClick = () => {
  emit('navigate-federal')
}

// Estilo del tooltip
const tooltipStyle = computed(() => {
  if (!props.hoveredState) return { display: 'none' }
  
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
</script>

<style scoped>
/* Mismo estilo que IS-anual-linear-chart en HistoricalCard */
.map-wrapper {
  position: relative;
  width: 48%;
  height: 100%;
  flex-shrink: 0;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ccc;
  overflow: visible;
  z-index: 2;
}

/* CARD FLOTANTE */
.map-info-card {
  position: absolute;
  top: 100px;
  right: 120px;
  background: white;
  border-radius: 15px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.38);
  z-index: 10;
  width: 183.2px;
  height: 203.2px;
  transition: all 0.3s ease;
}

.map-info-card.state-selected {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
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
  padding: 0px 15px 2px 15px;
}

.card-position-number {
  font-size: 45px;
  font-weight: 200;
  color: #D4A574;
  line-height: 1;
  position: relative;
}

.ifss-value-text {
  font-size: 12px;
  color: #767d86;
  font-weight: 300;
  letter-spacing: 0.1ch;
  margin: 0;
}

.ifss-classification {
  font-size: 11px;
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
  gap: 10px;
  padding-left: 10px;
  padding-top: 0px;
}

.card-label-pill {
  background: #f3f4f6;
  border-radius: 3px;
  text-align: center;
  font-size: 10px;
  color: #7a7f8f;
  font-weight: 100;
  height: 20px;
  width: 130px;
  letter-spacing: 0.06em;
  padding-top: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-position-title {
  font-size: 12px;
  color: #6b7280;
  letter-spacing: 0.2ch;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  line-height: 1.5;
  letter-spacing: 0.02em;
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

.card-label-pill.active {
  background: #053759;
  color: white;
}

/* Porcentaje dinamico */
.hover-info-box {
  position: absolute;
  height: 70px;
  width: 280px;
  top: 65%;
  left: 8%;
  z-index: 15;
  backdrop-filter: blur(10px);
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  transition: all 0.3s ease;
}

/* Barra de colores */
.color-legend {
  position: absolute;
  bottom: 60px;
  left: 16%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  z-index: 10;
  backdrop-filter: blur(5px);
  width: 230px;
  min-height: 30px;
  transition: all 0.3s ease;
}

.legend-selected-state {
  display: flex;
  gap: 0;
  align-items: stretch;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  border: 0px solid rgba(0,0,0,0.1);
  height: 30px;
  width: 360px;
  animation: legendFadeIn 0.4s ease;
}

.selected-state-bar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.selected-state-label {
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

@keyframes legendFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.location-label {
  font-size: 15px;
  color: #666;
  font-weight: 100;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value-display {
  font-size: 40px;
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
  height: 30px;
  width: 360px;
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
  height: 100%;
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
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 10px 0px 0px 10px;
}

/* Estilos base del path */
.state-path {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  stroke-width: .5;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
  stroke-linecap: round;
}

/* Estado seleccionado - mantiene el estilo visual */
.state-path.state-selected {
  opacity: 1;
  filter: saturate(1.8) contrast(1.3);
  stroke-width: 0.5;  /* ✅ Borde delgado */
  filter: drop-shadow(0 0 6px rgba(10, 10, 10, 0.8));
  transform-origin: center;
}

/* Estado en hover (solo si no está seleccionado) */
.state-path.state-hovered:not(.state-selected) {
  filter: brightness(1.3);
  opacity: 0.95;
  stroke-width: 2;
}

/* Estados atenuados cuando hay uno seleccionado */
.state-path.state-dimmed {
  opacity: 0.5;
  filter: brightness(0.8);
}

/* Hover sobre estados atenuados */
.state-path.state-dimmed:hover {
  opacity: 0.7;
  filter: brightness(1);
}

/* Asegurar que hover funcione sobre estado seleccionado */
.state-path.state-selected:hover {
  opacity: 1;
  filter: saturate(1.8) contrast(1.3);
  stroke-width: 0.4;  /* ✅ Borde muy delgado */
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

@media (max-width: 1200px) {
  .map-wrapper {
    width: 100%;
  }
  
  .map-info-card {
    top: 20px;
    right: 20px;
  }
}

@media (max-width: 768px) {
  .color-legend {
    min-width: 140px;
  }
  
  .map-info-card {
    min-width: 150px;
    padding: 16px;
  }
}
</style>