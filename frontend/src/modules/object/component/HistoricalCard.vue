<!-- src/modules/maps/components/HistoricalCard.vue -->
<template>
  <div class="ifss-slider-container">
    <!-- Slider de rango -->
    <div class="historic-table">
      <div class="row-1">
        <div class="IS-anual-linear-chart">
            <LinearChart
              title="Análisis histórico de los Ingresos Sostenibles (IS)"
              :data="chartData"
              :xLabels="years"
           />
        </div>
        <div class="IIC-anual-linear-chart">
            <StackedArea
              title="Tu título"
              :data="{
                'Variable 1': [10, 20, 30, 25, 35],
                'Variable 2': [15, 25, 20, 30, 28]
              }"
              :xLabels="['Ene', 'Feb', 'Mar', 'Abr', 'May']"
              :valueFormatter="(val) => `$${val}`"
           />
        </div>
      </div>
      <div class="row-2">
        <div class="IIC-anual-bar-chart">
          <HistoricBarChart
            title="Ingresos de Inversión en Contribución (IIC)"
            :variables="iicBarData"
            :showFilters="false"
            :showLegend="false"
            :autoSelectCount="4"
            :animationDelay="800"
            width="100%"
            height="100%"
          />
        </div>
        <div class="IS-anual-bar-chart"></div>
      </div>
      <div class="row-3">
        <div class="PS-PIC-anual-linear-chart"></div>
      </div>
      <div class="row-4">
        <div class="PIC-anual-bar-chart"></div>
        <div class="PS-anual-bar-chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted} from 'vue'
import LinearChart from '../../charts/components/LinearChart.vue';
import StackedArea from '../../charts/components/StackedArea.vue';
import HistoricBarChart from '../../charts/components/HistoricBarChart.vue';

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

// Datos para LinearChart
const chartData = computed(() => {
  // Aquí puedes procesar tus statesData para el formato del LinearChart
  return {
    'IS Total': [45234.5, 52341.2, 58123.7, 61456.8, 67234.9],
    'Financ. para desarrollo': [23456.8, 48123.4, 52341.9, 54234.5, 55678.2]
  }
})

const years = computed(() => {
  return ['2020', '2021', '2022', '2023', '2024']
})

// Datos para HistoricBarChart - IIC
const iicBarData = ref([
  { 
    key: 'iic-federal', 
    label: 'Federal', 
    value: 45234.5, 
    color: '#0F3759'
  },
  { 
    key: 'iic-estatal', 
    label: 'Estatal', 
    value: 52341.2, 
    color: '#3B5A70'
  },
  { 
    key: 'iic-municipal', 
    label: 'Municipal', 
    value: 38123.7, 
    color: '#4E6D82'
  },
  { 
    key: 'iic-otros', 
    label: 'Otros', 
    value: 28456.8, 
    color: '#627A8E'
  }
])

// Datos adicionales (puedes usarlos para las otras gráficas)
const advancedData = [
  { 
    key: 'incendios', 
    label: 'Total (hectáreas)', 
    value: 1200, 
    color: '#0F3759', 
    active: true 
  },
  { 
    key: 'residuos', 
    label: 'Arbolado Adulto', 
    value: 3500, 
    color: '#3B5A70', 
    active: true 
  },
  { 
    key: 'emisiones', 
    label: 'Renuevo', 
    value: 850, 
    color: '#4E6D82', 
    active: false 
  },
  { 
    key: 'Arbustivo', 
    label: 'Arbustivo', 
    value: 3500, 
    color: '#D6D6D6', 
    active: true 
  },
  { 
    key: 'Herbaceo', 
    label: 'Herbaceo', 
    value: 250, 
    color: '#A1A1A1', 
    active: false 
  },
  { 
    key: 'Hojarasca', 
    label: 'Hojarasca', 
    value: 1050, 
    color: '#B0B0B0', 
    active: false 
  }
]
</script>

<style scoped>
.ifss-slider-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 10px;
  overflow: auto;
  box-sizing: border-box;
}

.historic-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 10px;
}

/* Todas las rows con mismo tamaño */
.row-1, .row-2, .row-3, .row-4 {
  display: flex;
  flex-direction: row;
  height: 25%;
  gap: 10px;
}

/* Gráficas que ocupan 50% del ancho */
.IS-anual-linear-chart,
.IIC-anual-linear-chart,
.IIC-anual-bar-chart,
.IS-anual-bar-chart,
.PIC-anual-bar-chart,
.PS-anual-bar-chart {
  width: 50%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

/* Gráfica que ocupa 100% del ancho */
.PS-PIC-anual-linear-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}
</style>