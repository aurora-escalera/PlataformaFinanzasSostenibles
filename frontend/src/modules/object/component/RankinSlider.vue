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

    <!-- Gráfica de barras filtrada -->
    <div class="chart-container">
      <div class="bars-wrapper">
        <div 
          v-for="(item, index) in filteredChartData" 
          :key="index"
          class="bar-item"
        >
          <div 
            class="bar"
            :style="{ 
              height: `${(item.count / maxCount) * 100}%`,
              backgroundColor: item.color
            }"
          >
            <span class="bar-value">{{ item.count }}</span>
          </div>
          <span class="bar-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  statesData: {
    type: Array,
    default: () => []
  },
  selectedStateValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['range-change', 'filter-change'])

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

// Rangos de valores IFSS basados en los datos reales (0.5 a 2.9)
// Ordenados de mayor a menor para coincidir con las imágenes
const valueRanges = [
  { min: 2.5, max: 3.0, label: 'Muy alto' },    // 0 - Verde oscuro
  { min: 2.0, max: 2.4, label: 'Alto' },        // 1 - Verde medio
  { min: 1.7, max: 1.9, label: 'Medio alto' },  // 2 - Verde claro
  { min: 1.3, max: 1.6, label: 'Medio' },       // 3 - Amarillo
  { min: 1.0, max: 1.2, label: 'Medio bajo' },  // 4 - Naranja claro
  { min: 0.7, max: 0.9, label: 'Bajo' },        // 5 - Naranja
  { min: 0.0, max: 0.6, label: 'Muy bajo' }     // 6 - Rojo
]

// Colores exactos de tu leyenda (de mejor a peor)
const colorSegments = [
  { color: '#6ac952' }, // Muy alto
  { color: '#94d351' }, // Alto
  { color: '#bddc50' }, // Medio alto
  { color: '#e6d64f' }, // Medio
  { color: '#e6a74c' }, // Medio bajo
  { color: '#e67849' }, // Bajo
  { color: '#e52845' }  // Muy bajo
]

// Valores del slider (índices de 0 a 6)
const minValue = ref(0)
const maxValue = ref(6)

// Estilo del rango activo
const activeRangeStyle = computed(() => {
  const left = (minValue.value / 6) * 100
  const width = ((maxValue.value - minValue.value) / 6) * 100
  return {
    left: `${left}%`,
    width: `${width}%`
  }
})

// Verificar si un índice está en el rango
const isInRange = (index) => {
  return index >= minValue.value && index <= maxValue.value
}

const isSegmentInRange = (index) => {
  return index >= minValue.value && index <= maxValue.value
}

// Handlers para evitar que los sliders se crucen
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

// Función para obtener el índice de clasificación según el valor IFSS
const getClassificationIndex = (value) => {
  for (let i = 0; i < valueRanges.length; i++) {
    if (value >= valueRanges[i].min && value <= valueRanges[i].max) {
      return i
    }
  }
  // Si el valor está fuera de rango, asignar al más cercano
  if (value > valueRanges[0].max) return 0
  return 6
}

// Datos de la gráfica filtrados
const chartData = computed(() => {
  const data = Array(7).fill(0).map((_, index) => ({
    label: labels[index],
    count: 0,
    color: colorSegments[index].color
  }))

  // Contar estados por clasificación
  props.statesData.forEach(state => {
    const index = getClassificationIndex(state.value || 0)
    data[index].count++
  })

  return data
})

const filteredChartData = computed(() => {
  return chartData.value.filter((_, index) => isInRange(index))
})

const maxCount = computed(() => {
  return Math.max(...chartData.value.map(d => d.count), 1)
})

const filteredStatesCount = computed(() => {
  return filteredChartData.value.reduce((sum, item) => sum + item.count, 0)
})

const totalStates = computed(() => {
  return props.statesData.length
})

// Emitir cambios
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
  
  // Filtrar estados en el rango
  const filteredStates = props.statesData.filter(state => {
    const value = state.value || 0
    return value >= range.min && value <= range.max
  })
  
  emit('filter-change', filteredStates)
}

// Watch para cambios externos
watch(() => props.selectedStateValue, (newValue) => {
  if (newValue !== null) {
    const index = getClassificationIndex(newValue)
    console.log(`Estado seleccionado con valor ${newValue} está en: ${labels[index]}`)
  }
})

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
  padding: 30px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Contenedor del slider */
.slider-wrapper {
  position: relative;
  width: 100%;
  height: 60px;
  padding: 0 10px;
  margin-bottom: -20px; /* Superpone con las barras */
  z-index: 10; /* Encima de las barras */
}

/* Rango activo (overlay) */
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

/* Inputs de rango (invisibles) */
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
  z-index: 0;
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
  cursor: pointer;
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
  background: transparent; /* CAMBIADO */
  border-radius: 0; /* CAMBIADO */
  padding: 0; /* CAMBIADO */
  position: relative; /* NUEVO */
  z-index: 1;
}

.bars-wrapper {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%; /* CAMBIADO */
  gap: 8px;
  padding-top: 40px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 100%;
  min-height: 20px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 5px;
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.bar-label {
  font-size: 10px;
  color: #666;
  text-align: center;
  line-height: 1.2;
}

</style>