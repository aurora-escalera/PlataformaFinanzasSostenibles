<!-- src/modules/charts/components/ChartsComponent.vue -->
<template>
  <div class="charts-wrapper">
    <!-- FILA 1: PRESUPUESTOS -->
    <div class="chart-section-row">
      <h4 class="section-title">{{ selectedState ? `Presupuestos - ${selectedState}` : 'Selecciona un estado' }}</h4>
      <div class="chart-row-content">
        <!-- Barra izquierda -->
        <div class="chart-col-bar">
          <BarChart 
            :data="presupuestosData"
            :title="selectedYear ? `Proporción del gasto asignado a Presupuestos Intensivos en Carbono (PIC) y Presupuestos Sostenibles (PS) con respecto del gasto total en millones de pesos (MXN) en- ${selectedYear}` : 'Proporción del gasto asignado a Presupuestos Intensivos en Carbono (PIC) y Presupuestos Sostenibles (PS) con respecto del gasto total en millones de pesos (MXN)'"
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

    <!-- FILA 2: INGRESOS -->
    <div class="chart-section-row">
      <h4 class="section-title">Ingresos</h4>
      
      <div class="chart-row-content">
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
      is_amount: 0,
      is_percentage: 0,
      iic_amount: 0,
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
    is_amount: props.ifssData?.is_amount ? props.ifssData.is_amount * 0.8 : 0,
    is_percentage: props.ifssData?.is_percentage || 0,
    iic_amount: props.ifssData?.iic_amount ? props.ifssData.iic_amount * 1.2 : 0,
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
  gap: 10px;
  width: 100%;
}

.chart-section-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.section-title {
  margin: 0;
  padding: 0px 0 0px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  border-bottom: 1px solid #e0e0e0;
  font-size: 9px;
  font-weight: 200;
  color: #6b7280;
}

.chart-row-content {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 0px 8px 0px 8px;
  width: 100%;
  height: 127.5px;
}

.chart-col-bar {
  flex: 1;
  min-width: 0;
}

/*Container for donuts first row */
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
  .chart-row-content {
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