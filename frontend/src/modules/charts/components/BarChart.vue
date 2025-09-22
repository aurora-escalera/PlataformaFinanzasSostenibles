<!-- src/modules/charts/components/BarChart.vue -->
<template>
  <div class="bar-chart">
    <!-- Contenedor de las barras -->
    <div class="bars-container">
      <!-- Barra principal (colored) -->
      <div class="bar-wrapper">
        <div 
          class="bar bar-colored"
          :style="{ 
            backgroundColor: color,
            height: getBarHeight(primaryValue) + 'px'
          }"
        ></div>
        <div class="bar-value">{{ primaryValue }}</div>
      </div>
      
      <!-- Barra de referencia (gris) -->
      <div class="bar-wrapper">
        <div 
          class="bar bar-gray"
          :style="{ 
            backgroundColor: '#E0E0E0',
            height: getBarHeight(maxValue) + 'px'
          }"
        ></div>
        <div class="bar-value">{{ maxValue }}</div>
      </div>
    </div>
    
    <!-- Título inferior -->
    <div class="chart-title">{{ title }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#9ACD32'  // Verde por defecto
  }
})

// Valor principal de los datos
const primaryValue = computed(() => {
  return props.data.length > 0 ? props.data[0].value : 0
})

// Valor máximo
const maxValue = computed(() => {
  return props.data.length > 0 ? props.data[0].maxValue : 8
})

// Función para calcular altura proporcional de las barras
const getBarHeight = (value) => {
  const maxHeight = 80
  const minHeight = 10
  const proportion = value / maxValue.value
  return Math.max(minHeight, maxHeight * proportion)
}
</script>

<style scoped>
.bar-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 100%;
}

.bars-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
  flex: 1;
  width: 100%;
  padding: 20px 0;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 24px;
  border-radius: 4px 4px 0 0;
  transition: all 0.6s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 10px;
}

.bar-colored {
  /* Color se aplica desde el template */
}

.bar-gray {
  background-color: #E0E0E0;
}

.bar-value {
  font-size: 12px;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  text-align: center;
  margin-top: auto;
}

/* Animaciones y hover */
.bar-chart:hover .bar {
  transform: scaleY(1.05);
}

.bar-wrapper:hover .bar {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Animación de entrada */
.bar {
  animation: growUp 0.8s ease-out;
}

@keyframes growUp {
  from {
    height: 0 !important;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>