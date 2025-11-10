<!-- src/modules/charts/components/ChartsComponent.vue -->
<template>
  <div class="charts-wrapper">
    <!-- CARD 1: PRESUPUESTOS -->
    <div class="chart-card">
      <div class="chart-card-header">
        <h4 class="card-title">{{ selectedState ? `Presupuestos - ${selectedState}` : 'Selecciona un estado' }}</h4>
      </div>
      
      <div class="chart-card-body">
        <!-- Barra izquierda -->
        <div class="chart-col-bar">
          <BarChart 
            :data="presupuestosData"
            :title="selectedYear ? `Presupuestos Intensivos en Carbono (PIC) y Presupuestos Sostenibles (PS) con respecto del gasto total en- ${selectedYear}` : 'Presupuestos Intensivos en Carbono (PIC) y Presupuestos Sostenibles (PS) con respecto del gasto total'"
          />
        </div>
        
        <!-- Donas derecha -->
        <div class="chart-col-donuts">
          <div class="donut-item">
            <h5 class="donut-title">Análisis comparativo de los sectores que conforman Presupuestos Sostenibles (PS)</h5>
            <DonutChart 
              :data="donutPresupuestosSostenibles"
              title="PS"
              subtitle="35%"
              :size="80"
            />
          </div>
          <div class="donut-item">
            <h5 class="donut-title">Análisis comparativo de los sectores que conforman Presupuestos Intensivos en Carbono (PIC)</h5>
            <DonutChart 
              :data="donutPresupuestosCarbono"
              title="PIC"
              subtitle="40%"
              :size="80"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- CARD 2: INGRESOS -->
    <div class="chart-card">
      <div class="chart-card-header">
        <h4 class="card-title">Ingresos</h4>
      </div>
      
      <div class="chart-card-body">
        <!-- Barra izquierda -->
        <div class="chart-col-bar">
          <BarChart 
            :data="ingresosData"
            title="Proporción del gasto asignado a Ingresos"
          />
        </div>
        
        <!-- Donas derecha -->
        <div class="chart-col-donuts">
          <div class="donut-item">
            <h5 class="donut-title">Análisis comparativo de los sectores que conforman Ingresos Sostenibles (IS)</h5>
            <DonutChart 
              :data="donutIngresosSostenibles"
              title="IS"
              subtitle="45%"
              :size="80"
            />
          </div>
          <div class="donut-item">
            <h5 class="donut-title">Análisis comparativo de los sectores que conforman Ingresos Intensivos en Carbono (IIC)</h5>
            <DonutChart 
              :data="donutIngresosCarbono"
              title="IIC"
              subtitle="38%"
              :size="80"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BarChart from './BarChart.vue'
import DonutChart from './DonutChart.vue'

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

// Datos para Presupuestos (Barras)
const presupuestosData = computed(() => {
  if (!props.ifssData || !props.ifssData.is_amount) {
    return {
      is_amount: 5,
      is_percentage: 8,
      iic_amount: 10,
      iic_percentage: 0
    }
  }
  
  return {
    is_amount: props.ifssData.is_amount || 0,
    is_percentage: props.ifssData.is_percentage || 0,
    iic_amount: props.ifssData.iic_amount || 0,
    iic_percentage: props.ifssData.iic_percentage || 0
  }
})

// Datos para Ingresos (Barras)
const ingresosData = computed(() => {
  return {
    is_amount: props.ifssData?.is_amount ? props.ifssData.is_amount * 0.8 : 18,
    is_percentage: props.ifssData?.is_percentage || 0,
    iic_amount: props.ifssData?.iic_amount ? props.ifssData.iic_amount * 1.2 : 4,
    iic_percentage: props.ifssData?.iic_percentage || 0
  }
})

// Datos para Donas - Presupuestos Sostenibles
const donutPresupuestosSostenibles = computed(() => {
  const percentage = props.ifssData?.is_percentage 
    ? Math.round(props.ifssData.is_percentage * 100) 
    : 35
  
  return [
    { label: 'PS', value: percentage, color: '#7cb342' },
    { label: 'Resto', value: 100 - percentage, color: '#E8E8E8' }
  ]
})

// Datos para Donas - Presupuestos Carbono
const donutPresupuestosCarbono = computed(() => {
  const percentage = props.ifssData?.iic_percentage 
    ? Math.round(props.ifssData.iic_percentage * 100) 
    : 40
  
  return [
    { label: 'PIC', value: percentage, color: '#DC143C' },
    { label: 'Resto', value: 100 - percentage, color: '#E8E8E8' }
  ]
})

// Datos para Donas - Ingresos Sostenibles
const donutIngresosSostenibles = computed(() => {
  return [
    { label: 'IS', value: 45, color: '#7cb342' },
    { label: 'Resto', value: 55, color: '#E8E8E8' }
  ]
})

// Datos para Donas - Ingresos Carbono
const donutIngresosCarbono = computed(() => {
  return [
    { label: 'IIC', value: 38, color: '#DC143C' },
    { label: 'Resto', value: 62, color: '#E8E8E8' }
  ]
})
</script>

<style scoped>
.charts-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100%;
}

/* Card estilo ranking-panel */
.chart-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
}

/* Header estilo header-ranking-panel */
.chart-card-header {
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.card-title {
  padding: 4px 0 2px 0;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100;
  color: #535353;
  font-size: 19px;
  margin: 0;
  flex-shrink: 0;
}

/* Body de la card */
.chart-card-body {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  height: 100%;
  flex: 1;
}

.chart-col-bar {
  flex: 1;
  height: 100%;
  min-width: 0;
}

/* Container for donuts */
.chart-col-donuts {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.donut-item {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  min-height: 0;
}

.donut-title {
  font-size: 7px;
  font-weight: 400;
  color: #484d56;
  text-align: center;
  letter-spacing: -0.5px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding-bottom: 10px;
}

@media (max-width: 1000px) {
  .chart-card-body {
    flex-direction: column;
  }
  
  .chart-col-donuts {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .chart-col-donuts {
    flex-direction: column;
  }
}
</style>