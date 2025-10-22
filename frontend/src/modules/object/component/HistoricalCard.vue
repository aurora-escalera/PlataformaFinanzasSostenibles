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
        <div class="IIC-anual-bar-chart"></div>
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

//HorizontalBarChart
// Datos avanzados con más opciones
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
  max-height: 100%; /* Evitar crecimiento excesivo */
  padding: 15px 15px 5px 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 40px;
  overflow: visible; /* Evitar desbordamiento */
}

.historic-table{
  display: flex;
  flex-direction: column;
  background-color: red;
  height: 100%;
}
.row-1{
    display: flex;
  flex-direction: row;
  height: 25%;

}
.row-2, .row-3, .row-4 {
  display: flex;
  flex-direction: row;
  height: 25%;
  flex: 1;
}

.IS-anual-linear-chart{
  width: 50%;
  height: 100%; 
}
</style>