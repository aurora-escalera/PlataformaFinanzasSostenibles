<!-- src/modules/maps/components/MexicoMapSVG.vue -->
<!-- ✅ ACTUALIZADO: Tooltip rediseñado estilo Figura 2 con información de Figura 1 -->
<template>
  <div class="map-wrapper" @click="handleBackgroundClick">
    <!-- CARD FLOTANTE CON INFO DEL ESTADO/NACIONAL -->
    <div 
      v-if="showInfoCard"
      class="map-info-card" 
      :class="{ 'state-selected': selectedState }"
    >
      <div class="card-content">
        <div class="card-position-title">
          {{ selectedState 
            ? `Estado: ${selectedState}` 
            : 'Posición del país en el Índice de Finanzas Sostenibles (IFS) en 2024' 
          }}
        </div>
        
        <div class="card-top-row">
          <div v-if="!selectedState" class="card-position-number">
            {{ getCurrentPosition() }}
          </div>
          <div class="card-ifss-info" :class="{ 'state-view': selectedState }">
            <template v-if="selectedState">
              <div class="ifss-label-full">Índice de Finanzas Sostenibles Subnacional</div>
              <div 
                class="ifss-value-large"
                :style="{ color: getCurrentClassificationColor() }"
              >
                {{ getDisplayIFSS() }}
              </div>
            </template>
            <template v-else>
              <div class="ifss-value-text">IFS: {{ getDisplayIFSS() }}</div>
            </template>
            <div 
              class="ifss-classification"
              :style="{ color: getCurrentClassificationColor() }"
            >
              {{ getCurrentClassification() }}
            </div>
          </div>
        </div>

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
      <div v-if="activeLegendFilter" class="info-content legend-filter-info">
        <div class="location-label">{{ activeLegendFilter.label }} (IFSS)</div>
        <div class="value-display">{{ activeLegendFilter.states?.length || 0 }} estados</div>
      </div>
      <div v-else-if="selectedState" class="info-content">
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

    <!-- Leyenda de colores IFSS (siempre basada en IFSS) -->
    <div class="color-legend">
      <div v-if="!selectedState && !hoveredState" class="legend-items-horizontal">
        <div 
          v-for="item in legendItems" 
          :key="item.level"
          class="legend-item-horizontal"
          :class="{ 
            'legend-item-active': activeLegendFilter?.level === item.level,
            'legend-item-dimmed': activeLegendFilter && activeLegendFilter.level !== item.level
          }"
          @click.stop="handleLegendClick(item)"
        >
          <div 
            class="legend-color-horizontal" 
            :style="{ backgroundColor: item.color }"
          ></div>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-range">{{ item.range }}</span>
        </div>
      </div>
      
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

    <!-- ✅ TOOLTIP REDISEÑADO - Estilo Figura 2 con información de Figura 1 -->
    <Teleport to="body">
      <transition name="tooltip-fade">
        <div 
          v-if="hoveredState && !selectedState" 
          class="map-tooltip-compact"
          :style="tooltipStyle"
        >
          <div class="tooltip-compact-content">
            <!-- Cuadrito de color (sin ícono) -->
            <div 
              class="tooltip-color-box"
              :style="{ backgroundColor: getTooltipColor() }"
            ></div>
            
            <!-- Información -->
            <div class="tooltip-compact-info">
              <!-- Nombre del estado -->
              <div class="tooltip-state-name">{{ hoveredState }}</div>
              
              <!-- Valor IFSS -->
              <div class="tooltip-ifss-row">
                <span class="tooltip-ifss-value">{{ formatIFSSValue(getStateInfo(hoveredState).value) }}</span>
                <span class="tooltip-ifss-label">IFSS</span>
              </div>
              
              <!-- Año -->
              <div class="tooltip-year-row">
                <span class="tooltip-year-value">{{ getStateInfo(hoveredState).year || '2024' }}</span>
                <span class="tooltip-year-label">Año</span>
              </div>
            </div>
          </div>
          
          <!-- Clasificación en la parte inferior -->
          <div 
            class="tooltip-classification-bar"
            :style="{ color: getTooltipColor() }"
          >
            {{ getIFSSLabel(getStateInfo(hoveredState).value || 0).label }}
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { geoPath, geoMercator } from 'd3-geo'

const props = defineProps({
  geoData: { type: Object, required: true },
  selectedState: { type: String, default: null },
  hoveredState: { type: String, default: null },
  mapConfig: { type: Object, required: true },
  nationalIFSS: { type: Object, default: null },
  getStateColor: { type: Function, required: true },
  getStateInfo: { type: Function, required: true },
  getIFSSLabel: { type: Function, required: true },
  showNavigation: { type: Boolean, default: true },
  showInfoCard: { type: Boolean, default: true },
  activeView: { type: String, default: null },
  selectedVariable: { type: [Object, String, null], default: null }
})

const emit = defineEmits([
  'state-click',
  'state-hover',
  'state-leave',
  'navigate-regional',
  'view-change',
  'legend-filter-change'
])

const mousePosition = ref({ x: 0, y: 0 })

// ============================================================================
// ESTADO PARA FILTRO DE LEYENDA
// ============================================================================
const activeLegendFilter = ref(null)

// ============================================================================
// LEYENDA IFSS (7 categorías) - SIEMPRE BASADA EN IFSS
// ============================================================================
const legendItems = [
  { level: 'muy-alto', label: 'Muy Alto', range: '3.5-4.0', color: '#22c55e', min: 3.5, max: 4.0 },
  { level: 'alto', label: 'Alto', range: '2.9-3.4', color: '#94d351', min: 2.9, max: 3.49 },
  { level: 'medio-alto', label: 'Medio Alto', range: '2.3-2.8', color: '#bddc50', min: 2.3, max: 2.89 },
  { level: 'medio', label: 'Medio', range: '1.8-2.2', color: '#facc15', min: 1.8, max: 2.29 },
  { level: 'medio-bajo', label: 'Medio Bajo', range: '1.2-1.7', color: '#e6a74c', min: 1.2, max: 1.79 },
  { level: 'bajo', label: 'Bajo', range: '0.6-1.1', color: '#ef4444', min: 0.6, max: 1.19 },
  { level: 'muy-bajo', label: 'Muy Bajo', range: '0.0-0.5', color: '#dc2626', min: 0, max: 0.59 }
]

// ============================================================================
// FUNCIÓN: Obtener nivel IFSS de un estado (SIEMPRE basado en IFSS)
// ============================================================================
const getStateLevelIFSS = (stateName) => {
  const stateInfo = props.getStateInfo(stateName)
  const value = stateInfo?.value || 0
  
  if (value >= 3.5) return 'muy-alto'
  if (value >= 2.9) return 'alto'
  if (value >= 2.3) return 'medio-alto'
  if (value >= 1.8) return 'medio'
  if (value >= 1.2) return 'medio-bajo'
  if (value >= 0.6) return 'bajo'
  return 'muy-bajo'
}

// ============================================================================
// FUNCIÓN: Obtener todos los estados de un nivel IFSS
// ============================================================================
const getStatesByLevel = (level) => {
  if (!props.geoData?.features) return []
  
  return props.geoData.features
    .filter(feature => getStateLevelIFSS(feature.properties.state_name) === level)
    .map(feature => feature.properties.state_name)
}

// ============================================================================
// FUNCIÓN: Verificar si un estado está en el filtro activo
// ============================================================================
const stateMatchesFilter = (stateName) => {
  if (!activeLegendFilter.value?.states) return true
  return activeLegendFilter.value.states.includes(stateName)
}

// ============================================================================
// HANDLER: Click en item de leyenda
// ============================================================================
const handleLegendClick = (item) => {
  if (activeLegendFilter.value?.level === item.level) {
    activeLegendFilter.value = null
    emit('legend-filter-change', null)
    return
  }
  
  const statesInLevel = getStatesByLevel(item.level)
  
  console.log(`🎨 [MexicoMapSVG] Nivel "${item.label}" seleccionado`)
  console.log(`🎨 [MexicoMapSVG] Estados:`, statesInLevel)
  
  activeLegendFilter.value = {
    ...item,
    states: statesInLevel
  }
  
  emit('legend-filter-change', {
    level: item.level,
    label: item.label,
    color: item.color,
    states: statesInLevel
  })
}

// ============================================================================
// PROYECCIÓN Y PATH
// ============================================================================
const projection = computed(() => {
  return geoMercator()
    .scale(props.mapConfig.scale)
    .center(props.mapConfig.center)
    .translate([props.mapConfig.width / 2, props.mapConfig.height / 2])
})

const pathGenerator = computed(() => geoPath().projection(projection.value))

const getPathData = (feature) => pathGenerator.value(feature)

// ============================================================================
// CLASES Y ESTILOS DE ESTADO
// ============================================================================
const getStateClass = (stateName) => {
  const classes = ['state-path']
  
  if (activeLegendFilter.value) {
    if (stateMatchesFilter(stateName)) {
      classes.push('state-legend-highlighted')
    } else {
      classes.push('state-legend-dimmed')
    }
  } else {
    if (props.selectedState === stateName) {
      classes.push('state-selected')
    } else if (props.hoveredState === stateName) {
      classes.push('state-hovered')
    }
    if (props.selectedState && props.selectedState !== stateName) {
      classes.push('state-dimmed')
    }
  }
  
  return classes.join(' ')
}

const getStrokeColor = (stateName) => {
  if (activeLegendFilter.value && stateMatchesFilter(stateName)) return '#1a202c'
  if (props.selectedState === stateName) return '#1a202c'
  if (props.hoveredState === stateName) return '#555555'
  return '#555555'
}

const getStrokeWidth = (stateName) => {
  if (activeLegendFilter.value && stateMatchesFilter(stateName)) return 2
  if (props.selectedState === stateName) return 3
  if (props.hoveredState === stateName) return 2
  return 1
}

// ============================================================================
// FUNCIONES DE DISPLAY
// ============================================================================
const getDisplayIFSS = () => {
  if (props.selectedState) {
    return props.getStateInfo(props.selectedState).value || 0
  }
  return props.nationalIFSS?.value || 0
}

const getCurrentClassification = () => props.getIFSSLabel(getDisplayIFSS()).label
const getCurrentClassificationColor = () => props.getIFSSLabel(getDisplayIFSS()).color || '#ddb891'
const getCurrentPosition = () => props.selectedState ? '--' : '15'

const getActiveStateColor = () => {
  const activeState = props.selectedState || props.hoveredState
  return activeState ? props.getStateColor(activeState) : '#cccccc'
}

const getActiveStateClassification = () => {
  const activeState = props.selectedState || props.hoveredState
  if (!activeState) return ''
  return props.getIFSSLabel(props.getStateInfo(activeState).value || 0).label
}

const getActiveStateValue = () => {
  const activeState = props.selectedState || props.hoveredState
  return activeState ? props.getStateInfo(activeState).value || 0 : '0'
}

const getTooltipColor = () => {
  if (!props.hoveredState) return '#718096'
  return props.getIFSSLabel(props.getStateInfo(props.hoveredState).value || 0).color || '#718096'
}

// ✅ Formatear valor IFSS con 2 decimales
const formatIFSSValue = (value) => {
  if (value === null || value === undefined) return '0.00'
  const numValue = parseFloat(value) || 0
  return numValue.toFixed(2)
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================
const handleMouseHover = (stateName, event) => {
  mousePosition.value = { x: event.clientX, y: event.clientY }
  emit('state-hover', stateName)
}

const handleMouseLeave = () => emit('state-leave')

const handleStateClick = (stateName) => {
  if (activeLegendFilter.value) {
    activeLegendFilter.value = null
    emit('legend-filter-change', null)
  }
  emit('state-click', stateName)
}

const handleBackgroundClick = (event) => {
  if (event.target.classList.contains('map-wrapper')) {
    if (activeLegendFilter.value) {
      activeLegendFilter.value = null
      emit('legend-filter-change', null)
    }
    emit('state-click', null)
  }
}

const handleSvgClick = (event) => {
  if (event.target.tagName === 'svg' || event.target.tagName === 'g') {
    if (activeLegendFilter.value) {
      activeLegendFilter.value = null
      emit('legend-filter-change', null)
    }
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

// ✅ TOOLTIP STYLE - Posición optimizada
const tooltipStyle = computed(() => {
  if (!props.hoveredState) return { display: 'none' }
  return {
    position: 'fixed',
    left: `${mousePosition.value.x + 15}px`,
    top: `${mousePosition.value.y - 20}px`,
    pointerEvents: 'none',
    zIndex: 99999
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
  background: rgba(255, 255, 255, 0.9);
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

.card-ifss-info.state-view {
  text-align: center;
  width: 100%;
}

.ifss-label-full {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.3;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}

.ifss-value-large {
  font-size: 36px;
  font-weight: 300;
  line-height: 1;
  margin-bottom: 4px;
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

.card-ifss-info.state-view .ifss-classification {
  font-size: 14px;
  margin-top: 2px;
}

.card-bottom-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

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

.legend-filter-info {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px;
}

.variable-indicator {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
  font-style: italic;
}

/* ✅ LEYENDA INTERACTIVA - 7 CATEGORÍAS */
.color-legend {
  position: absolute;
  bottom: 40px;
  left: 28%;
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
  padding-top: 5px;
  align-items: stretch;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  border: 0px solid rgba(0,0,0,0.1);
  width: 455px;
}

.legend-item-horizontal {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
  flex: 1;
  text-align: center;
  min-width: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.legend-item-horizontal:hover {
  transform: translateY(-2px);
}

.legend-item-horizontal:hover .legend-color-horizontal {
  filter: brightness(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.legend-item-horizontal.legend-item-active {
  transform: translateY(-3px);
}

.legend-item-horizontal.legend-item-active .legend-color-horizontal {
  filter: brightness(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid #1a202c;
}

.legend-item-horizontal.legend-item-active .legend-label,
.legend-item-horizontal.legend-item-active .legend-range {
  font-weight: 700;
  color: #1a202c;
}

.legend-item-horizontal.legend-item-dimmed {
  opacity: 0.4;
}

.legend-item-horizontal.legend-item-dimmed:hover {
  opacity: 0.7;
}

.legend-color-horizontal {
  width: 100%;
  height: 22px;
  border: none;
  transition: all 0.3s ease;
}

.legend-item-horizontal:first-child .legend-color-horizontal {
  border-radius: 4px 0 0 4px;
}

.legend-item-horizontal:last-child .legend-color-horizontal {
  border-radius: 0 4px 4px 0;
}

.legend-label {
  font-size: 10px;
  font-weight: 500;
  color: #374151;
  margin-top: 4px;
  line-height: 1.2;
  transition: all 0.3s ease;
}

.legend-range {
  font-size: 10px;
  font-weight: 200;
  color: #6b7280;
  margin-top: 1px;
  line-height: 1.2;
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
  width: 455px;
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

.state-path.state-legend-highlighted {
  opacity: 1;
  filter: saturate(1) contrast(1.2);
  stroke-width: 0.5;
}

.state-path.state-legend-dimmed {
  opacity: 0.25;
  filter: grayscale(60%) brightness(0.9);
}

.state-path.state-legend-dimmed:hover {
  opacity: 0.5;
  filter: grayscale(30%) brightness(1);
}

/* ============================================================================
   ✅ TOOLTIP COMPACTO - Estilo Figura 2 con info de Figura 1
   ============================================================================ */

.map-tooltip-compact {
  position: fixed;
  background: rgba(30, 30, 35, 0.95);
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  z-index: 99999;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-width: 120px;
}

.tooltip-compact-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

/* Cuadrito de color (reemplaza el ícono de ubicación) */
.tooltip-color-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
  margin-top: 2px;
}

.tooltip-compact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Nombre del estado */
.tooltip-state-name {
  font-weight: 600;
  font-size: 15px;
  color: white;
  line-height: 1.2;
}

/* Fila de IFSS y Año */
.tooltip-ifss-row,
.tooltip-year-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.tooltip-ifss-value,
.tooltip-year-value {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}

.tooltip-ifss-label,
.tooltip-year-label {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Clasificación en la parte inferior */
.tooltip-classification-bar {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

/* Animación de entrada/salida */
.tooltip-fade-enter-active {
  animation: tooltipFadeIn 0.15s ease-out;
}

.tooltip-fade-leave-active {
  animation: tooltipFadeOut 0.1s ease-in;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes tooltipFadeOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
  }
}

/* ============================================
   RESPONSIVE - Media Queries MexicoMapSVG
   ============================================ */

@media (max-width: 768px) {
  .map-wrapper {
    width: 100% !important;
    max-width: 100% !important;
    min-height: 280px;
    max-height: 320px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
    overflow: hidden;
  }
  
  .mexico-map {
    border-radius: 12px;
    width: 100%;
    height: 100%;
  }
  
  /* ✅ OCULTAR map-info-card en móvil */
  .map-info-card {
    display: none !important;
  }
  
  /* ✅ hover-info-box a la IZQUIERDA */
  .hover-info-box {
    top: 60%;
    left: 8px;
    bottom: auto;
    transform: translateY(-70%);
    transform: translateX(90%);
    width: 75px;
    height: auto;
  }
  
  .location-label {
    font-size: 8px;
    margin-bottom: 3px;
  }
  
  .value-display {
    font-size: 18px;
    padding-bottom: 6px;
  }
  
  .color-legend {
    bottom: 10px;
    left: 35%;
    transform: translateX(-35%);
  }
  
  .legend-items-horizontal {
    width: 260px;
  }
  
  .legend-selected-state {
    width: 260px;
    height: 20px;
  }
  
  .legend-item-horizontal {
    min-width: 30px;
  }
  
  .legend-label {
    font-size: 5px;
  }
  
  .legend-range {
    font-size: 5px;
  }
  
  .legend-color-horizontal {
    height: 11px;
  }
  
  .selected-state-label {
    font-size: 7px;
  }

  /* ✅ Tooltip compacto en móvil */
  .map-tooltip-compact {
    padding: 10px 12px;
    border-radius: 10px;
    min-width: 100px;
  }

  .tooltip-color-box {
    width: 20px;
    height: 20px;
    border-radius: 5px;
  }

  .tooltip-compact-content {
    gap: 10px;
  }

  .tooltip-state-name {
    font-size: 13px;
  }

  .tooltip-ifss-value,
  .tooltip-year-value {
    font-size: 12px;
  }

  .tooltip-ifss-label,
  .tooltip-year-label {
    font-size: 10px;
  }

  .tooltip-classification-bar {
    font-size: 11px;
    margin-top: 6px;
    padding-top: 6px;
  }
}

@media (max-width: 480px) {
  .map-wrapper {
    min-height: 240px;
    max-height: 280px;
    border-radius: 10px;
  }
  
  .mexico-map {
    border-radius: 10px;
  }
  
  .map-info-card {
    display: none !important;
  }
  
  .hover-info-box {
    left: 6px;
    width: 65px;
  }
  
  .location-label {
    font-size: 7px;
    margin-bottom: 2px;
  }
  
  .value-display {
    font-size: 15px;
    padding-bottom: 5px;
  }
  
  .legend-items-horizontal {
    width: 220px;
  }
  
  .legend-selected-state {
    width: 220px;
    height: 18px;
  }
  
  .legend-item-horizontal {
    min-width: 26px;
  }
  
  .legend-label {
    font-size: 4px;
  }
  
  .legend-range {
    font-size: 4px;
  }
  
  .legend-color-horizontal {
    height: 9px;
  }
  
  .selected-state-label {
    font-size: 6px;
  }

  /* Tooltip más compacto */
  .map-tooltip-compact {
    padding: 8px 10px;
    border-radius: 8px;
    min-width: 90px;
  }

  .tooltip-color-box {
    width: 18px;
    height: 18px;
    border-radius: 4px;
  }

  .tooltip-compact-content {
    gap: 8px;
  }

  .tooltip-state-name {
    font-size: 12px;
  }

  .tooltip-ifss-value,
  .tooltip-year-value {
    font-size: 11px;
  }

  .tooltip-ifss-label,
  .tooltip-year-label {
    font-size: 9px;
  }

  .tooltip-classification-bar {
    font-size: 10px;
    margin-top: 5px;
    padding-top: 5px;
  }
}

@media (max-width: 360px) {
  .map-wrapper {
    min-height: 200px;
    max-height: 240px;
    border-radius: 8px;
  }
  
  .mexico-map {
    border-radius: 8px;
  }
  
  .map-info-card {
    display: none !important;
  }
  
  .hover-info-box {
    left: 5px;
    width: 55px;
  }
  
  .location-label {
    font-size: 6px;
    margin-bottom: 2px;
  }
  
  .value-display {
    font-size: 12px;
    padding-bottom: 4px;
  }
  
  .legend-items-horizontal {
    width: 190px;
  }
  
  .legend-selected-state {
    width: 190px;
    height: 16px;
  }
  
  .legend-item-horizontal {
    min-width: 22px;
  }
  
  .legend-label {
    font-size: 4px;
  }
  
  .legend-range {
    font-size: 3px;
  }
  
  .legend-color-horizontal {
    height: 8px;
  }
  
  .selected-state-label {
    font-size: 5px;
  }

  /* Tooltip mínimo */
  .map-tooltip-compact {
    padding: 6px 8px;
    border-radius: 6px;
    min-width: 80px;
  }

  .tooltip-color-box {
    width: 16px;
    height: 16px;
    border-radius: 3px;
  }

  .tooltip-compact-content {
    gap: 6px;
  }

  .tooltip-state-name {
    font-size: 11px;
  }

  .tooltip-ifss-value,
  .tooltip-year-value {
    font-size: 10px;
  }

  .tooltip-ifss-label,
  .tooltip-year-label {
    font-size: 8px;
  }

  .tooltip-classification-bar {
    font-size: 9px;
    margin-top: 4px;
    padding-top: 4px;
  }
}

@media (max-width: 320px) {
  .map-wrapper {
    min-height: 180px;
    max-height: 220px;
    border-radius: 6px;
  }
  
  .mexico-map {
    border-radius: 6px;
  }
  
  .map-info-card {
    display: none !important;
  }
  
  .hover-info-box {
    left: 4px;
    width: 48px;
  }
  
  .location-label {
    font-size: 5px;
    margin-bottom: 1px;
  }
  
  .value-display {
    font-size: 10px;
    padding-bottom: 3px;
  }
  
  .legend-items-horizontal {
    width: 160px;
  }
  
  .legend-selected-state {
    width: 160px;
    height: 14px;
  }
  
  .legend-item-horizontal {
    min-width: 18px;
  }
  
  .legend-label {
    display: none;
  }
  
  .legend-range {
    font-size: 3px;
    margin-top: 1px;
  }
  
  .legend-color-horizontal {
    height: 6px;
  }
  
  .selected-state-label {
    font-size: 5px;
  }

  /* Tooltip ultra compacto */
  .map-tooltip-compact {
    padding: 5px 7px;
    border-radius: 5px;
    min-width: 70px;
  }

  .tooltip-color-box {
    width: 14px;
    height: 14px;
    border-radius: 3px;
  }

  .tooltip-compact-content {
    gap: 5px;
  }

  .tooltip-state-name {
    font-size: 10px;
  }

  .tooltip-ifss-value,
  .tooltip-year-value {
    font-size: 9px;
  }

  .tooltip-ifss-label,
  .tooltip-year-label {
    font-size: 7px;
  }

  .tooltip-classification-bar {
    font-size: 8px;
    margin-top: 3px;
    padding-top: 3px;
  }
}

/* Landscape en móviles */
@media (max-width: 768px) and (orientation: landscape) {
  .map-wrapper {
    min-height: 220px;
    max-height: 260px;
  }
  
  .map-info-card {
    display: none !important;
  }
  
  .hover-info-box {
    left: 5px;
    width: 60px;
  }
  
  .location-label {
    font-size: 6px;
  }
  
  .value-display {
    font-size: 13px;
    padding-bottom: 4px;
  }
  
  .legend-items-horizontal {
    width: 200px;
  }
  
  .legend-selected-state {
    width: 200px;
    height: 14px;
  }
  
  .legend-label {
    font-size: 4px;
  }
  
  .legend-range {
    font-size: 3px;
  }
  
  .legend-color-horizontal {
    height: 7px;
  }
  
  .selected-state-label {
    font-size: 5px;
  }

  /* Tooltip en landscape */
  .map-tooltip-compact {
    padding: 8px 10px;
    border-radius: 8px;
  }

  .tooltip-color-box {
    width: 18px;
    height: 18px;
  }

  .tooltip-state-name {
    font-size: 12px;
  }

  .tooltip-ifss-value,
  .tooltip-year-value {
    font-size: 11px;
  }

  .tooltip-classification-bar {
    font-size: 10px;
  }
}
</style>

