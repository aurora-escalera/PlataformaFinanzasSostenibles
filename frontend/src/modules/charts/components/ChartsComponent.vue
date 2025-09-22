<!-- src/modules/charts/components/ChartsComponent.vue -->
<template>
  <div class="charts-section">
    <!-- Header de la sección -->
    <div class="charts-header">
      <h3>Análisis Detallado - {{ selectedState || 'México' }}</h3>
      <button @click="$emit('close')" class="close-btn">✕</button>
    </div>

    <!-- Grid de gráficas -->
    <div class="charts-grid">
      <!-- Primera fila: 4 gráficas de dona -->
      <div class="charts-row">
        <div 
          v-for="donut in chartsData.donuts" 
          :key="donut.id"
          class="chart-container"
        >
          <DonutChart 
            :data="donut.data"
            :title="donut.title"
            :subtitle="donut.subtitle"
          />
        </div>
      </div>

      <!-- Segunda fila: 4 gráficas de barras -->
      <div class="charts-row">
        <div 
          v-for="bar in chartsData.bars" 
          :key="bar.id"
          class="chart-container"
        >
          <BarChart 
            :data="bar.data"
            :title="bar.title"
            :color="bar.color"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DonutChart from './DonutChart.vue'
import BarChart from './BarChart.vue'
import { useCharts } from '@/composables/useCharts'

// Props
const props = defineProps({
  selectedState: {
    type: String,
    default: null
  },
  ifssData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['close'])

// Usar el composable de gráficas
const {
  currentChartsData,
  setChartData,
  exportChartsData
} = useCharts()

// Establecer datos cuando cambie el estado seleccionado
if (props.ifssData && props.ifssData.value) {
  setChartData(props.ifssData)
}

// Computed para obtener los datos actuales
const chartsData = computed(() => currentChartsData.value)
</script>

<style scoped>
.charts-section {
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.charts-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.chart-container {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 200px;
  transition: box-shadow 0.2s;
}

.chart-container:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1200px) {
  .charts-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .charts-section {
    padding: 16px;
  }
  
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .charts-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    text-align: center;
  }
}
</style>