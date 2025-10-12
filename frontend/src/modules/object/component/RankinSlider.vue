<!-- src/modules/maps/components/RankingSlider.vue -->
<template>
  <div class="ifss-slider-container">
    <!-- Slider de rango -->
    <div class="slider-wrapper">
      <!-- Rango activo (overlay) -->
      <div 
        class="active-range"
        :style="activeRangeStyle"
      ></div>

      <!-- Input range (izquierdo - mínimo) -->
      <input
        type="range"
        min="0"
        max="6"
        step="1"
        v-model.number="minValue"
        class="slider-input slider-min"
        @input="handleMinChange"
      >

      <!-- Input range (derecho - máximo) -->
      <input
        type="range"
        min="0"
        max="6"
        step="1"
        v-model.number="maxValue"
        class="slider-input slider-max"
        @input="handleMaxChange"
      >

      <!-- Thumbs personalizados -->
      <div 
        class="custom-thumb thumb-min"
        :style="{ left: `${(minValue / 6) * 100}%` }"
      >
        <div class="thumb-circle"></div>
        <div class="thumb-label">{{ labels[minValue] }}</div>
      </div>

      <div 
        class="custom-thumb thumb-max"
        :style="{ left: `${(maxValue / 6) * 100}%` }"
      >
        <div class="thumb-circle"></div>
        <div class="thumb-label">{{ labels[maxValue] }}</div>
      </div>
    </div>

    <!-- Gráfica de barras con TODOS los estados ordenados -->
    <div class="chart-container">
      <div class="bars-wrapper">
        <div 
          v-for="(state, index) in visibleStates" 
          :key="state.region"
          class="bar-item"
          :class="{ 
            'is-selected': state.region === selectedStateName,
            'is-dimmed': selectedStateName && state.region !== selectedStateName
          }"
          :style="{ width: barWidth }"
          @click="handleBarClick(state.region)"
          @mouseenter="handleMouseEnter(state, $event)"
          @mouseleave="handleMouseLeave"
        >
          <div 
            class="bar"
            :style="{ 
              height: `${getBarHeight(state.value)}%`,
              backgroundColor: getColorForValue(state.value)
            }"
          >
          </div>
          <span class="bar-label">{{ getStateAbbreviation(state.region) }}</span>
        </div>
      </div>
    </div>

    <!-- ✅ Tooltip con Teleport -->
    <Teleport to="body">
      <div 
        v-if="tooltip.visible"
        class="tooltip"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          <div class="tooltip-color" :style="{ backgroundColor: tooltip.color }">
            <span class="color-label">{{ tooltip.classification }}</span>
          </div>
          <div class="tooltip-info">
            <div class="tooltip-label">{{ tooltip.label }}</div>
            <div class="tooltip-value">{{ tooltip.value }}</div>
          </div>
        </div>
      </div>
    </Teleport>


    <!-- Info del estado seleccionado -->
    <div v-if="selectedStateName" class="selected-info">
      <div class="info-content">
        <span class="info-label">{{ selectedStateName }}</span>
        <span class="info-value">IFSS: {{ selectedStateIFSS }}</span>
        <span class="info-position">Posición: #{{ getStatePosition(selectedStateName) }}</span>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, watch, onMounted} from 'vue'

// Añadir ref al template
const barsWrapperRef = ref(null)
const containerWidth = ref(1200)

const props = defineProps({
  statesData: {
    type: Array,
    default: () => []
  },
  selectedStateValue: {
    type: Number,
    default: null
  },
  selectedStateName: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['range-change', 'filter-change', 'state-click'])
//Estado Reactivo del tooltip
// Estado del hover
const hoveredBarKey = ref(null)

// Estado del tooltip
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  value: '',
  color: ''
})

//Computed para el estilo del tooltip
const tooltipStyle = computed(() => {
  // Usar un offset fijo basado en la altura máxima del contenedor
  const minOffset = 100 // Distancia mínima fija desde el top de la barra
  
  return {
    left: `${tooltip.value.x}px`,
    top: `${tooltip.value.y - minOffset}px`, // Offset fijo
    transform: 'translateX(-50%)'
  }
})


//Manejadores de eventos del tooltip
const handleMouseEnter = (state, event) => {
  hoveredBarKey.value = state.region // Cambiar de item.key a state.region

  // Obtener la posición del elemento .bar (la barra de color interna)
  const barElement = event.currentTarget.querySelector('.bar')
  const rect = barElement.getBoundingClientRect()

  tooltip.value = {
    visible: true,
    x: rect.left + (rect.width / 2), // Centro de la barra en X
    y: rect.top, // Parte superior de la barra en Y
    label: getStateAbbreviation(state.region), // Nombre del estado
    value: `IFSS: ${state.value}`, // Valor IFSS
    color: getColorForValue(state.value), // Usar tu función existente para el color
    classification: getClassificationForValue(state.value),
    barHeight: rect.height //Guardar la altura de la barra
  }
}

const handleMouseLeave = () => {
  hoveredBarKey.value = null
  tooltip.value.visible = false
}

// Etiquetas de clasificación
const labels = [
  'Muy alto',
  'Alto', 
  'Medio alto',
  'Medio',
  'Medio bajo',
  'Bajo',
  'Muy bajo'
]

// Rangos de valores IFSS
const valueRanges = [
  { min: 2.5, max: 3.0, label: 'Muy alto' },
  { min: 2.0, max: 2.4, label: 'Alto' },
  { min: 1.7, max: 1.9, label: 'Medio alto' },
  { min: 1.3, max: 1.6, label: 'Medio' },
  { min: 1.0, max: 1.2, label: 'Medio bajo' },
  { min: 0.7, max: 0.9, label: 'Bajo' },
  { min: 0.0, max: 0.6, label: 'Muy bajo' }
]

// Colores según clasificación IFSS
const colorMap = {
  'Muy alto': '#6ac952',
  'Alto': '#94d351',
  'Medio alto': '#bddc50',
  'Medio': '#e6d64f',
  'Medio bajo': '#e6a74c',
  'Bajo': '#e67849',
  'Muy bajo': '#e52845'
}

// Valores del slider
const minValue = ref(0)
const maxValue = ref(6)

// Estados ordenados de mayor a menor IFSS
const sortedStates = computed(() => {
  return [...props.statesData].sort((a, b) => b.value - a.value)
})

// Estados visibles según el rango del slider
const visibleStates = computed(() => {
  return sortedStates.value.filter(state => isStateInCurrentRange(state))
})

onMounted(() => {
  if (barsWrapperRef.value) {
    containerWidth.value = barsWrapperRef.value.offsetWidth
  }
})

// Ancho dinámico de las barras según cantidad visible
const barWidth = computed(() => {
  const visibleCount = visibleStates.value.length
  if (visibleCount === 0) return '30px'
  
  const gapSize = 1
  const totalGaps = (visibleCount - 1) * gapSize
  const availableWidth = containerWidth.value - totalGaps
  const barWidthPx = availableWidth / visibleCount
  
  return `${barWidthPx.toFixed(3)}px` // 3 decimales de precisión
})
// Valor máximo para calcular altura de barras
const maxIFSSValue = computed(() => {
  if (props.statesData.length === 0) return 3.0
  return Math.max(...props.statesData.map(s => s.value || 0))
})

// Estilo del rango activo
const activeRangeStyle = computed(() => {
  const left = (minValue.value / 6) * 100
  const width = ((maxValue.value - minValue.value) / 6) * 100
  return {
    left: `${left}%`,
    width: `${width}%`
  }
})

// Obtener clasificación según valor IFSS
const getClassificationForValue = (value) => {
  for (let range of valueRanges) {
    if (value >= range.min && value <= range.max) {
      return range.label
    }
  }
  return value > valueRanges[0].max ? 'Muy alto' : 'Muy bajo'
}

// Obtener color según valor IFSS
const getColorForValue = (value) => {
  const classification = getClassificationForValue(value)
  return colorMap[classification] || '#e0e0e0'
}

// Calcular altura de barra (proporcional al valor IFSS)
const getBarHeight = (value) => {
  // Usar el rango completo de 0 a 3 para mejor visualización
  const percentage = (value / 3) * 100
  return Math.max(percentage, 10) // Mínimo 10% para visibilidad
}

// Verificar si estado está en rango actual
const isStateInCurrentRange = (state) => {
  const classification = getClassificationForValue(state.value)
  const classIndex = labels.indexOf(classification)
  return classIndex >= minValue.value && classIndex <= maxValue.value
}

// Obtener abreviación del estado
const getStateAbbreviation = (stateName) => {
  const abbreviations = {
    'Aguascalientes': 'AGS',
    'Baja California': 'BC',
    'Baja California Sur': 'BCS',
    'Campeche': 'CAMP',
    'Chiapas': 'CHIS',
    'Chihuahua': 'CHIH',
    'Ciudad de México': 'CDMX',
    'Coahuila': 'COAH',
    'Colima': 'COL',
    'Durango': 'DGO',
    'Estado de México': 'MEX',
    'Guanajuato': 'GTO',
    'Guerrero': 'GRO',
    'Hidalgo': 'HGO',
    'Jalisco': 'JAL',
    'Michoacán': 'MICH',
    'Morelos': 'MOR',
    'Nayarit': 'NAY',
    'Nuevo León': 'NL',
    'Oaxaca': 'OAX',
    'Puebla': 'PUE',
    'Querétaro': 'QRO',
    'Quintana Roo': 'QROO',
    'San Luis Potosí': 'SLP',
    'Sinaloa': 'SIN',
    'Sonora': 'SON',
    'Tabasco': 'TAB',
    'Tamaulipas': 'TAMPS',
    'Tlaxcala': 'TLAX',
    'Veracruz': 'VER',
    'Yucatán': 'YUC',
    'Zacatecas': 'ZAC'
  }
  return abbreviations[stateName] || stateName.substring(0, 3).toUpperCase()
}

// Obtener posición del estado en el ranking
const getStatePosition = (stateName) => {
  const index = sortedStates.value.findIndex(s => s.region === stateName)
  return index !== -1 ? index + 1 : '-'
}

// Obtener posición dentro de los estados visibles
const getVisibleStatePosition = (stateName) => {
  const index = visibleStates.value.findIndex(s => s.region === stateName)
  return index !== -1 ? index + 1 : '-'
}

// Handlers
const handleMinChange = () => {
  if (minValue.value > maxValue.value) {
    minValue.value = maxValue.value
  }
  emitChanges()
}

const handleMaxChange = () => {
  if (maxValue.value < minValue.value) {
    maxValue.value = minValue.value
  }
  emitChanges()
}

const handleBarClick = (stateName) => {
  emit('state-click', stateName)
}

const emitChanges = () => {
  const range = {
    min: valueRanges[minValue.value].min,
    max: valueRanges[maxValue.value].max,
    minLabel: labels[minValue.value],
    maxLabel: labels[maxValue.value],
    minIndex: minValue.value,
    maxIndex: maxValue.value
  }
  
  emit('range-change', range)
  
  const filteredStates = props.statesData.filter(state => {
    const value = state.value || 0
    return value >= range.min && value <= range.max
  })
  
  emit('filter-change', filteredStates)
}

// Emitir estado inicial
watch(() => props.statesData, () => {
  if (props.statesData.length > 0) {
    emitChanges()
  }
}, { immediate: true })
</script>

<style scoped>
.ifss-slider-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-height: 100%; /* Evitar crecimiento excesivo */
  padding: 15px 15px 5px 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Evitar desbordamiento */
}

/* Contenedor del slider */
.slider-wrapper {
  position: relative;
  width: 100%;
  height: 45px; 
  z-index: 10;
  flex-shrink: 0; /* No permitir encogimiento */
}

/* Rango activo */
.active-range {
  position: absolute;
  top: 24px;
  height: 12px;
  background: rgba(33, 150, 243, 0.2);
  border: 2px solid #2196F3;
  border-radius: 6px;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 1;
}

/* Inputs de rango */
.slider-input {
  position: absolute;
  width: calc(100% - 20px);
  height: 8px;
  top: 24px;
  left: 10px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: none;
  z-index: 2;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  border-radius: 50%;
}

.slider-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  border: none;
  border-radius: 50%;
}

/* Thumbs personalizados */
.custom-thumb {
  position: absolute;
  top: 16px;
  transform: translateX(-50%);
  pointer-events: none;
  transition: left 0.15s ease;
  z-index: 3;
}

.thumb-circle {
  width: 20px;
  height: 20px;
  background: white;
  border: 3px solid #2196F3;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.thumb-label {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #2196F3;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  font-weight: 600;
}

.thumb-label::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #2196F3;
}

/* Gráfica de barras */
.chart-container {
  flex: 1;
  background: transparent;
  padding: 0;
  position: relative;
  overflow-x: hidden;
  overflow-y: hidden;
  min-height: 100px; /* Reducido para evitar desbordamiento */
  max-height: 220px; /* Límite máximo */
  width: 100%;
}

.bars-wrapper {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start; 
  height: 100%;
  width: 100%; 
  padding-bottom: 5px 0 25px 0;
  box-sizing: border-box;
  gap: 3px;
}

.bar-item {
  flex: 1; /* ← SIMPLE: cada barra toma 1 fracción igual */
  min-width: 0; /* Permitir encogimiento */
  max-width: none; /* Sin límite */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end; /* Alinear al fondo */
  gap: 4px;
  transition: all 0.3s ease;
  opacity: 1;
  height: 100%; /* Altura completa del contenedor */
}

/* Estado seleccionado - opacidad completa */
.bar-item.is-selected {
  opacity: 1;
  z-index: 10;
}

/* Estado seleccionado - opacidad completa */
.bar-item:hover {
  opacity: 1;
  filter: saturate(150%);
}

/* Cuando alguna barra tiene hover, las demás se atenúan */
.bars-wrapper:hover .bar-item:not(:hover) {
  opacity: 0.4;
  transform: none;
}

/* Estados no seleccionados - opacidad reducida */
.bar-item.is-dimmed {
  opacity: 0.1;
}

/* Estados fuera del rango del slider - REMOVIDO ya que no se muestran */
.bar-item:hover:not(.is-dimmed) {
  opacity: 1;
  z-index: 5;
}

.bar {
  width: 100%;
  min-height: 15px; /* Reducido de 20px */
  max-height: 100%; /* Permitir crecer hasta el máximo */
  border-radius: 2px 2px 0 0;
  position: relative;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px; /* Reducido de 8px */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar-label {
  font-size: 8px; /* Reducido de 9px */
  color: #666;
  text-align: center;
  line-height: 1.2;
  font-weight: 500;
  writing-mode: horizontal-tb;
  margin-top: 2px;
}

.bar-item.is-selected .bar-label {
  color: #2196F3;
  font-weight: 700;
}

/* Info del estado seleccionado */
.selected-info {
  margin-top: 10px; /* Reducido de 15px */
  padding: 10px; /* Reducido de 12px */
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196F3;
  flex-shrink: 0; /* No permitir encogimiento */
}

.info-content {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #1976D2;
}

.info-value,
.info-position {
  font-size: 12px;
  color: #424242;
}

/* Scrollbar personalizado */
.chart-container::-webkit-scrollbar {
  height: 6px;
}

.chart-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chart-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.chart-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Estilos del tooltip */
.tooltip {
  position: fixed;
  background: rgba(30, 30, 30, 0.95); /* Fondo más oscuro */
  color: white;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 999999;
}


/* Triangulo apuntando hacia abajo */
.tooltip::after {
  content: '';
  position: absolute;
  top: 100%; /* Posicionar debajo del tooltip */
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent; 
  border-top-color: rgba(30, 30, 30, 0.95); 
}

.tooltip-content {
  display: flex;
  flex-direction: column; /* Cambiar a vertical */
  align-items: center; /* Centrar contenido */
  gap: 6px;
}

.tooltip-color {
  width: 100%;
  min-height: 18px; /* ✅ Altura mínima */
  height: auto; /* ✅ Altura automática según contenido */
  padding: 5px 8px; /* ✅ Padding para dar espacio */
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tooltip-info {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centrar texto */
  gap: 2px;
}

.tooltip-label {
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.tooltip-value {
  font-size: 10px;
  opacity: 0.95;
  font-weight: 500;
}

.color-label{
  color: black;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
  z-index: 1;
  line-height: 1.2; /* ✅ Altura de línea ajustada */
  text-align: center;
  white-space: nowrap; /* ✅ Evitar saltos de línea */
}
</style>