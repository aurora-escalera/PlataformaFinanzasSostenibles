<!-- src/modules/qualitativeIndicators/components/AmbientalesView.vue -->
<template>
  <div class="ambientales-container">
    <div class="card-body">
      <!-- Left Side Container -->
      <div class="left-card-container">
        <!-- Top: Horizontal Bar Chart -->
        <div class="bar-graph card">
          <HorizontalBarChart
            :variables="advancedData"
            width="100%"
            height="100%"
            title="Incendios forestales en hectáreas en 2024"
            :showFilters="true"
            :showLegend="true"
            barHeight="20px"
            barGap="1px"
          />
        </div>
        
        <!-- Bottom: Bottle Graph -->
        <div class="bottle-graphs card">
          <div class="title-bottle">
            <h2>Promedio diario de residuos sólidos urbanos recolectados</h2>
          </div>
          <div class="body-bottle">
            <div class="bottle-graph">
              <BottleChart :value="75" />
            </div>
            <div class="bottle-number number">3,249,683 kg</div>
          </div>
        </div>
      </div>

      <!-- Right Side Container -->
      <div class="right-card-container">
        <!-- Top Right Container -->
        <div class="top-right-card-container">
          <!-- Area Chart -->
          <div class="area-chart card">
            <div class="title-area-chart">
              <h3>Emisiones de contaminantes atmosféricos por fuente en toneladas.</h3>
            </div>
            <div class="area-chart-container">
              <AreaChart 
                :excelData="myExcelData"
                title="Datos de Excel"
              />
            </div>
          </div>
          
          <!-- Gauge Chart -->
          <div class="gauge-container card">
            <div class="title-gauge">
              <h3>Consumo de energía eléctrica</h3>
            </div>
            <div class="gauge-graph">
              <GaugeChart :value="67" />
            </div>
            <div class="gauge-number number">2,013.80 GWh</div>
          </div>
        </div>
        
        <!-- Bottom Right Container -->
        <div class="bottom-right-card-container">
          <div class="bottom-bar-graph card">
            <VerticalBarChart
              :variables="verticalData"
              width="100%"
              height="100%"
              title="Áreas naturales protegidas"
              :showFilters="true"
              :showLegend="true"
              barHeight="20px"
              barGap="1px"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import HorizontalBarChart from '@/modules/charts/components/HorizontalBarChart.vue'
import BottleChart from '@/modules/object/component/bottleChart.vue'
import AreaChart from '@/modules/charts/components/AreaChart.vue'
import GaugeChart from '@/modules/object/component/GaugeChart.vue'
import VerticalBarChart from '@/modules/charts/components/VerticalBarChart.vue'

const emit = defineEmits(['back'])

const handleBack = () => {
  emit('back')
}

// Datos para los gráficos ambientales
const myExcelData = [
  { label: 'Industria', value: 25 },
  { label: 'Transporte', value: 30 },
  { label: 'Residencial', value: 15 },
  { label: 'Comercial', value: 30 },
  { label: 'Agricultura', value: 15 }
]

const advancedData = [
  { 
    key: 'total', 
    label: 'Total (hectáreas)', 
    value: 1200, 
    color: '#0F3759', 
    active: true 
  },
  { 
    key: 'adulto', 
    label: 'Arbolado Adulto', 
    value: 3500, 
    color: '#3B5A70', 
    active: true 
  },
  { 
    key: 'renuevo', 
    label: 'Renuevo', 
    value: 850, 
    color: '#4E6D82', 
    active: false 
  },
  { 
    key: 'arbustivo', 
    label: 'Arbustivo', 
    value: 3500, 
    color: '#D6D6D6', 
    active: true 
  },
  { 
    key: 'herbaceo', 
    label: 'Herbaceo', 
    value: 250, 
    color: '#A1A1A1', 
    active: false 
  },
  { 
    key: 'hojarasca', 
    label: 'Hojarasca', 
    value: 1050, 
    color: '#B0B0B0', 
    active: false 
  }
]

const verticalData = [
  { 
    key: 'total', 
    label: 'Total', 
    value: 1200, 
    color: '#0F3759', 
    active: true 
  },
  { 
    key: 'area', 
    label: 'Área de protección de flora y fauna', 
    value: 3500, 
    color: '#3B5A70', 
    active: true 
  },
  { 
    key: 'reserva', 
    label: 'Reserva de la biosfera', 
    value: 850, 
    color: '#4E6D82', 
    active: false 
  },
  { 
    key: 'santuario', 
    label: 'Santuario', 
    value: 1050, 
    color: '#B0B0B0', 
    active: false 
  }
]
</script>

<style scoped>
.ambientales-container {
  background-color: white;
  border-radius: 15px;
  height: 100%;
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-body {
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.card {
  border: 1px solid #b0b0b0;
  border-radius: 12px;
  overflow: hidden;
}

/* ============================
   LEFT CARD CONTAINER
   ============================ */
.left-card-container {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.bar-graph {
  height: 75%;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

/* Bottle Graph */
.bottle-graphs {
  height: 25%;
  border-radius: 12px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.title-bottle {
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

h2 {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  color: #535353;
  font-size: 14px;
  margin: 0;
}

.body-bottle {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  padding: 9px;
  flex: 1;
}

.bottle-graph {
  width: 85%;
  height: 100%;
  overflow: visible;
}

.number {
  width: 35%;
  color: #58778F;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ============================
   RIGHT CARD CONTAINER
   ============================ */
.right-card-container {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  gap: 10px;
}

/* Top Right Container */
.top-right-card-container {
  display: flex;
  flex-direction: row;
  border-radius: 12px;
  height: 50%;
  gap: 10px;
}

/* Area Chart */
.area-chart {
  width: 65%;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.title-area-chart {
  padding: 15px 10px;
  width: 35%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.area-chart-container {
  width: 65%;
  padding: 10px;
}

h3 {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 300;
  color: #535353;
  font-size: 14px;
  padding-left: 15px;
  line-height: 1.3;
}

/* Gauge Container */
.gauge-container {
  width: 35%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title-gauge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 10px;
  height: 30%;
}

.gauge-graph {
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-number {
  padding: 10px;
  height: 20%;
  width: 100%;
  color: #58778F;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Bottom Right Container */
.bottom-right-card-container {
  height: 50%;
  border-radius: 12px;
}

.bottom-bar-graph {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}
</style>