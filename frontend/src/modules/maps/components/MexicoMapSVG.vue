<!-- src/modules/maps/components/MexicoMapSVG.vue --> 
<!-- ✅ ACTUALIZADO: Leyenda con 6 categorías de IFSS + rangos numéricos + hover -->
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
            <div class="ifss-value-text">{{ selectedState ? 'IFSS' : 'IFS' }}: {{ getDisplayIFSS() }}</div>
            <div 
              class="ifss-classification"
              :style="{ color: getCurrentClassificationColor() }"
            >
              {{ getCurrentClassification() }}
            </div>
          </div>
        </div>

        <!-- FLEX 2: Dos filas (IFS Regional + Datos federales) -->
        <div 
          v-if="showNavigation"
          class="card-bottom-stack"
        >
          <div 
            class="card-label-pill" 
            :class="{ 'active': activeView === 'regional' }"
            @click.stop="handleIFSRegionalClick"
          >
            Datos Regionales
          </div>
          <div 
            class="card-label-pill"
            :class="{ 'active': activeView === 'federal' }"
            @click.stop="handleDatosFederalesClick"
          >
            Plataforma de Finanzas Sostenibles
          </div>
        </div>
      </div>
    </div>

    <!-- Información de hover/estado seleccionado/nacional -->
    <div class="hover-info-box">
      <div v-if="selectedState" class="info-content">
        <div class="location-label">{{ selectedState }}</div>
        <div class="value-display">IFSS: {{ getStateInfo(selectedState).value || 0 }}</div>
      </div>
      <div v-else-if="hoveredState" class="info-content">
        <div class="location-label">{{ hoveredState }}</div>
        <div class="value-display">IFSS: {{ getStateInfo(hoveredState).value || 0 }}</div>
      </div>
      <div v-else-if="nationalIFSS" class="info-content">
        <div class="location-label">México</div>
        <div class="value-display">IFS: {{ nationalIFSS.value }}</div>
      </div>
    </div>

    <!-- ✅ ACTUALIZADO: Leyenda de colores IFSS con rangos numéricos -->
    <div class="color-legend">
      <!-- Leyenda completa: solo cuando NO hay estado seleccionado NI hover -->
      <div v-if="!selectedState && !hoveredState" class="legend-items-horizontal">
        <div class="legend-item-horizontal">
          <div class="legend-color-horizontal" style="background-color: #6ac952"></div>
          <span class="legend-label">Alto</span>
          <span class="legend-range">4-3.5</span>
        </div>
        <div class="legend-item-horizontal">
          <div class="legend-color-horizontal" style="background-color: #94d351"></div>
          <span class="legend-label">Medio Alto</span>
          <span class="legend-range">3.5 - 2.3</span>
        </div>
        <div class="legend-item-horizontal">
          <div class="legend-color-horizontal" style="background-color: #bddc50"></div>
          <span class="legend-label">Medio</span>
          <span class="legend-range">2.2 - 1.9</span>
        </div>
        <div class="legend-item-horizontal">
          <div class="legend-color-horizontal" style="background-color: #e6a74c"></div>
          <span class="legend-label">Medio Bajo</span>
          <span class="legend-range">1.8 - 1.5</span>
        </div>
        <div class="legend-item-horizontal">
          <div class="legend-color-horizontal" style="background-color: #e67849"></div>
          <span class="legend-label">Bajo</span>
          <span class="legend-range">1.5 - 0.6</span>
        </div>
        <div class="legend-item-horizontal">
          <div class="legend-color-horizontal" style="background-color: #e52845"></div>
          <span class="legend-label">Muy Bajo</span>
          <span class="legend-range">0.5 - 0</span>
        </div>
      </div>
      
      <!-- Barra única: cuando hay estado seleccionado O hover -->
      <div v-else class="legend-selected-state">
        <div 
          class="selected-state-bar"
          :style="{ backgroundColor: getActiveStateColor() }"
        >
          <span class="selected-state-label">
            {{ getActiveStateClassification() }} 
            <span class="selected-state-value">({{ getActiveStateValue() }})</span>
          </span>
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

    <Teleport to="body">
      <div 
        v-if="hoveredState" 
        class="mexico-map-tooltip"
        :style="tooltipStyle"
      >
        <div 
          class="tooltip-icon-circle"
          :style="{ background: getTooltipIconGradient() }"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div class="tooltip-info">
          <div class="tooltip-state-name">{{ hoveredState }}</div>
          <div 
            class="tooltip-classification"
            :style="{ color: getTooltipColor() }"
          >
            {{ getIFSSLabel(getStateInfo(hoveredState).value || 0).label }}
          </div>
          <div class="tooltip-stats">
            <div class="tooltip-stat">
              <div class="tooltip-stat-value">{{ getStateInfo(hoveredState).value || 0 }}</div>
              <div class="tooltip-stat-label">IFSS</div>
            </div>
            <div class="tooltip-stat">
              <div class="tooltip-stat-value">{{ getStateInfo(hoveredState).year || '-' }}</div>
              <div class="tooltip-stat-label">Año</div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { geoPath, geoMercator } from 'd3-geo'

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
  showNavigation: {
    type: Boolean,
    default: true
  },
  showInfoCard: {
    type: Boolean,
    default: true
  },
  activeView: {
    type: String,
    default: null
  }
})

const emit = defineEmits([
  'state-click',
  'state-hover',
  'state-leave',
  'navigate-regional',
  'view-change'
])

const mousePosition = ref({ x: 0, y: 0 })

const projection = computed(() => {
  return geoMercator()
    .scale(props.mapConfig.scale)
    .center(props.mapConfig.center)
    .translate([props.mapConfig.width / 2, props.mapConfig.height / 2])
})

const pathGenerator = computed(() => {
  return geoPath().projection(projection.value)
})

const getPathData = (feature) => {
  return pathGenerator.value(feature)
}

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

// ✅ NUEVAS FUNCIONES para estado activo (seleccionado o hover)
const getActiveStateColor = () => {
  const activeState = props.selectedState || props.hoveredState
  if (!activeState) return '#cccccc'
  return props.getStateColor(activeState)
}

const getActiveStateClassification = () => {
  const activeState = props.selectedState || props.hoveredState
  if (!activeState) return ''
  const stateInfo = props.getStateInfo(activeState)
  const value = stateInfo.value || 0
  return props.getIFSSLabel(value).label
}

const getActiveStateValue = () => {
  const activeState = props.selectedState || props.hoveredState
  if (!activeState) return '0'
  const stateInfo = props.getStateInfo(activeState)
  return stateInfo.value || 0
}

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

const getTooltipColor = () => {
  if (!props.hoveredState) return '#718096'
  const stateInfo = props.getStateInfo(props.hoveredState)
  const value = stateInfo.value || 0
  return props.getIFSSLabel(value).color || '#718096'
}

const getTooltipIconGradient = () => {
  const color = getTooltipColor()
  return `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`
}

const adjustColor = (color, amount) => {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount))
  return `rgb(${r}, ${g}, ${b})`
}

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
  if (event.target.classList.contains('map-wrapper')) {
    emit('state-click', null)
  }
}

const handleSvgClick = (event) => {
  if (event.target.tagName === 'svg' || event.target.tagName === 'g') {
    emit('state-click', null)
  }
}

const handleIFSRegionalClick = () => {
  emit('view-change', 'regional')
  emit('navigate-regional')
}

const handleDatosFederalesClick = () => {
  emit('view-change', 'federal')
  window.open('https://plataformafinanzassostenibles.gflac.org/ranking', '_blank')
}

const tooltipStyle = computed(() => {
  if (!props.hoveredState) return { display: 'none' }
  return {
    position: 'fixed',
    left: `${mousePosition.value.x + 28}px`,
    top: `${mousePosition.value.y - 75}px`,
    pointerEvents: 'none',
    zIndex: 99999,
    transform: 'translate(0, 0)'
  }
})
</script>

<style scoped>
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

.map-info-card {
  position: absolute;
  top: 80px;
  right: 120px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 200px;
  transition: all 0.3s ease;
}

.map-info-card.state-selected {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(5, 55, 89, 0.15);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-position-title {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
  letter-spacing: 0.01em;
  margin-bottom: 0;
}

.card-top-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.card-position-number {
  font-size: 48px;
  font-weight: 300;
  color: #D4A574;
  line-height: 1;
}

.card-ifss-info {
  text-align: left;
}

.ifss-value-text {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  margin: 0;
}

.ifss-classification {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.card-bottom-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* BOTONES - Se ajustan al texto */
.card-label-pill {
  background: rgba(5, 55, 89, 0.06);
  border: 1px solid rgba(5, 55, 89, 0.12);
  border-radius: 8px;
  text-align: center;
  font-size: 10px;
  color: #475569;
  font-weight: 500;
  padding: 8px 12px;
  min-height: 42px; 
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.3;
  letter-spacing: 0.01em;
}

.card-label-pill:hover {
  background: rgba(5, 55, 89, 0.12);
  border-color: rgba(5, 55, 89, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(5, 55, 89, 0.1);
}

.card-label-pill:active {
  background: rgba(5, 55, 89, 0.18);
  transform: translateY(0);
  box-shadow: none;
}

.card-label-pill.active {
  background: #053759;
  border-color: #053759;
  color: white;
  box-shadow: 0 2px 8px rgba(5, 55, 89, 0.25);
}

.card-label-pill.active:hover {
  background: #064a75;
  border-color: #064a75;
}

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

/* ✅ LEYENDA - Posición original mantenida */
.color-legend {
  position: absolute;
  bottom: 60px;
  left: 24%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  z-index: 10;
  backdrop-filter: blur(5px);
  min-height: 30px;
  transition: all 0.3s ease;
}

.legend-items-horizontal {
  display: flex;
  gap: 0;
  align-items: stretch;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  border: 0px solid rgba(0,0,0,0.1);
  width: 390px;
}

.legend-item-horizontal {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
  flex: 1;
  text-align: center;
  min-width: 60px;
}

.legend-color-horizontal {
  width: 100%;
  height: 22px;
  border: none;
}

.legend-item-horizontal:first-child .legend-color-horizontal {
  border-radius: 4px 0 0 4px;
}

.legend-item-horizontal:last-child .legend-color-horizontal {
  border-radius: 0 4px 4px 0;
}

/* ✅ Etiquetas con letra más grande */
.legend-label {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  margin-top: 4px;
  line-height: 1.2;
}

/* ✅ Rangos numéricos */
.legend-range {
  font-size: 11px;
  font-weight: 200;
  color: #6b7280;
  margin-top: 1px;
  line-height: 1.2;
}

/* Barra única para estado seleccionado o hover */
.legend-selected-state {
  display: flex;
  gap: 0;
  align-items: stretch;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  border: 0px solid rgba(0,0,0,0.1);
  height: 30px;
  width: 390px;
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

.selected-state-value {
  font-weight: 500;
  margin-left: 4px;
  opacity: 0.9;
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

.mexico-map {
  background: white;
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 10px 0px 0px 10px;
}

.state-path {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  stroke-width: .5;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.state-path.state-selected {
  opacity: 1;
  filter: saturate(1.8) contrast(1.3);
  stroke-width: 0.5;
  filter: drop-shadow(0 0 6px rgba(10, 10, 10, 0.8));
  transform-origin: center;
}

.state-path.state-hovered:not(.state-selected) {
  filter: brightness(1.3);
  opacity: 0.95;
  stroke-width: 2;
}

.state-path.state-dimmed {
  opacity: 0.5;
  filter: brightness(0.8);
}

.state-path.state-dimmed:hover {
  opacity: 0.7;
  filter: brightness(1);
}

.state-path.state-selected:hover {
  opacity: 1;
  filter: saturate(1.8) contrast(1.3);
  stroke-width: 0.4;
  filter: drop-shadow(0 0 6px rgba(10, 10, 10, 0.8));
  transform-origin: center;
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
  
  .legend-items-horizontal {
    width: 300px;
  }
  
  .legend-selected-state {
    width: 300px;
  }
  
  .map-info-card {
    min-width: 180px;
    padding: 18px;
  }
}
</style>

<style>
.mexico-map-tooltip {
  background: white;
  color: #1a202c;
  padding: 8px 10px;
  border-radius: 8px;
  min-width: 130px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 8px;
  align-items: flex-start;
  position: fixed;
  pointer-events: none;
  z-index: 99999;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: tooltipFadeIn 0.15s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: background 0.3s ease;
}

.tooltip-icon-circle svg {
  width: 14px;
  height: 14px;
  fill: white;
}

.tooltip-info {
  flex: 1;
  min-width: 0;
}

.tooltip-state-name {
  font-size: 11px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltip-classification {
  font-size: 9px;
  font-weight: 600;
  margin-bottom: 5px;
  transition: color 0.3s ease;
}

.tooltip-stats {
  display: flex;
  gap: 12px;
}

.tooltip-stat {
  text-align: left;
}

.tooltip-stat-value {
  font-size: 12px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.2;
}

.tooltip-stat-label {
  font-size: 7px;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 500;
}
</style>