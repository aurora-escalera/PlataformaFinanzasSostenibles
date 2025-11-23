<!-- src/modules/charts/components/BulletChart.vue -->
<template>
  <div class="bullet-chart-container">
    <!-- Header -->
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
    </div>

    <!-- Chart Body con scroll -->
    <div class="chart-body" ref="chartBodyRef">
      <div 
        v-for="(item, index) in sortedData" 
        :key="item.key || index"
        class="bullet-row"
        :class="{ 'highlight': item.label === highlightState }"
      >
        <!-- State Label -->
        <div class="bullet-label">
          {{ item.label }}
        </div>

        <!-- Bullet Bar Container -->
        <div class="bullet-bar-container">
          <!-- Background zones (negative, neutral, positive) -->
          <div class="background-zones">
            <div class="zone negative-zone"></div>
            <div class="zone neutral-zone"></div>
            <div class="zone positive-zone"></div>
          </div>

          <!-- Center marker (0%) -->
          <div class="center-marker"></div>

          <!-- Value bar -->
          <div 
            class="bullet-bar"
            :class="{ 'positive': item.value >= 0, 'negative': item.value < 0 }"
            :style="getBarStyle(item.value)"
          >
          </div>
        </div>

        <!-- Value Label -->
        <div 
          class="bullet-value"
          :class="{ 'positive': item.value >= 0, 'negative': item.value < 0 }"
        >
          {{ formatValue(item.value) }}%
        </div>
      </div>
    </div>

    <!-- Legend (optional) -->
    <div v-if="showLegend" class="chart-legend">
      <div class="legend-item">
        <div class="legend-color negative"></div>
        <span>Decrecimiento</span>
      </div>
      <div class="legend-item">
        <div class="legend-color neutral"></div>
        <span>Estable</span>
      </div>
      <div class="legend-item">
        <div class="legend-color positive"></div>
        <span>Crecimiento</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  variables: {
    type: Array,
    required: true,
    default: () => []
  },
  title: {
    type: String,
    default: 'Bullet Chart'
  },
  highlightState: {
    type: String,
    default: null
  },
  showLegend: {
    type: Boolean,
    default: false
  },
  maxValue: {
    type: Number,
    default: 20 // Rango máximo por defecto ±20%
  }
})

// ✅ Ref para el contenedor del scroll
const chartBodyRef = ref(null)

// Computed: Datos ordenados de mayor a menor
const sortedData = computed(() => {
  if (!props.variables || props.variables.length === 0) return []
  
  return [...props.variables].sort((a, b) => b.value - a.value)
})

// ✅ MEJORADO: Función para hacer scroll INTERNO hasta la fila resaltada
const scrollToHighlighted = () => {
  if (!props.highlightState || !chartBodyRef.value) {
    console.log('⚠️ [BulletChart] No se puede hacer scroll: falta highlightState o chartBodyRef')
    return
  }
  
  nextTick(() => {
    // Dar tiempo extra para que el DOM se renderice completamente
    setTimeout(() => {
      const container = chartBodyRef.value
      const highlightedElement = container?.querySelector('.bullet-row.highlight')
      
      if (highlightedElement && container) {
        console.log('📍 [BulletChart] Elemento encontrado, haciendo scroll interno a:', props.highlightState)
        
        // Calcular la posición relativa al contenedor
        const containerRect = container.getBoundingClientRect()
        const elementRect = highlightedElement.getBoundingClientRect()
        
        // Posición del elemento relativo al inicio del scroll del contenedor
        const elementTop = highlightedElement.offsetTop
        const elementHeight = highlightedElement.offsetHeight
        const containerHeight = container.clientHeight
        
        // Calcular scroll para centrar el elemento en el contenedor
        const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2)
        
        console.log('📊 [BulletChart] Calculando scroll:')
        console.log('   - Posición del elemento:', elementTop)
        console.log('   - Altura del contenedor:', containerHeight)
        console.log('   - Scroll a:', scrollPosition)
        
        // Hacer scroll SOLO dentro del contenedor
        container.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth'
        })
        
        console.log('✅ [BulletChart] Scroll interno completado')
      } else {
        console.log('⚠️ [BulletChart] No se encontró el elemento resaltado en el DOM')
      }
    }, 100)
  })
}

// ✅ MEJORADO: Watch para detectar cambios en highlightState
watch(() => props.highlightState, (newState, oldState) => {
  console.log('🔄 [BulletChart] highlightState cambió')
  console.log('   - Anterior:', oldState)
  console.log('   - Nuevo:', newState)
  
  if (newState) {
    scrollToHighlighted()
  }
}, { immediate: false })

// ✅ MEJORADO: Watch para detectar cuando se cargan los datos Y hay un highlightState
watch(() => [props.variables, props.highlightState], ([newVariables, newHighlight]) => {
  if (newVariables && newVariables.length > 0 && newHighlight) {
    console.log('📊 [BulletChart] Datos cargados con highlightState, iniciando auto-scroll')
    console.log('   - Total de filas:', newVariables.length)
    console.log('   - Estado resaltado:', newHighlight)
    
    // Delay adicional para asegurar renderizado completo del DOM
    setTimeout(() => {
      scrollToHighlighted()
    }, 300)
  }
}, { immediate: true, deep: true })

// Función: Calcular estilo de la barra
const getBarStyle = (value) => {
  const maxValue = props.maxValue
  const percentage = Math.min(Math.abs(value) / maxValue * 50, 50) // 50% = mitad del contenedor
  
  if (value >= 0) {
    // Positivo: crece hacia la derecha desde el centro
    return {
      left: '50%',
      width: `${percentage}%`
    }
  } else {
    // Negativo: crece hacia la izquierda desde el centro
    return {
      right: '50%',
      width: `${percentage}%`
    }
  }
}

// Función: Formatear valor
const formatValue = (value) => {
  if (!value && value !== 0) return '0.0'
  return value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
}
</script>

<style scoped>
.bullet-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}

.chart-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.chart-title {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 300;
  color: #535353;
  font-size: 16px;
  margin: 0;
  line-height: 1.3;
}

.chart-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 15px 10px;
  scroll-behavior: smooth;
}

/* ✅ Estilos del scrollbar - MÁS VISIBLE */
.chart-body::-webkit-scrollbar {
  width: 10px; /* Más ancho para mejor visibilidad */
}

.chart-body::-webkit-scrollbar-track {
  background: #e5e7eb; /* Más visible */
  border-radius: 5px;
  margin: 5px 0;
  border: 1px solid #d1d5db;
}

.chart-body::-webkit-scrollbar-thumb {
  background: #94a3b8; /* Más oscuro por defecto */
  border-radius: 5px;
  transition: background 0.2s ease;
  border: 2px solid #e5e7eb; /* Borde para contraste */
}

.chart-body::-webkit-scrollbar-thumb:hover {
  background: #64748b; /* Aún más oscuro en hover */
}

.chart-body::-webkit-scrollbar-thumb:active {
  background: #475569; /* Más oscuro al hacer clic */
}

/* ✅ Scrollbar para Firefox - MÁS VISIBLE */
.chart-body {
  scrollbar-width: auto; /* 'auto' en lugar de 'thin' para que sea más ancho */
  scrollbar-color: #94a3b8 #e5e7eb; /* thumb más oscuro, track más visible */
}

.bullet-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.bullet-row:hover {
  background-color: #f9fafb;
  transform: translateX(2px);
}

.bullet-row.highlight {
  background-color: #dbeafe;
  border-left: 4px solid #0F3759;
  padding-left: 4px;
  box-shadow: 0 2px 8px rgba(15, 55, 89, 0.15);
  animation: highlightPulse 2s ease-in-out;
}

/* Animación de pulso para elemento resaltado */
@keyframes highlightPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(15, 55, 89, 0.15);
  }
  50% {
    box-shadow: 0 4px 16px rgba(15, 55, 89, 0.25);
  }
}

.bullet-label {
  width: 140px;
  font-size: 12px;
  color: #4a5568;
  font-weight: 500;
  padding-right: 10px;
  text-align: right;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Resaltar el label de la fila seleccionada */
.bullet-row.highlight .bullet-label {
  color: #0F3759;
  font-weight: 600;
}

.bullet-bar-container {
  flex: 1;
  height: 24px;
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.background-zones {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  border-radius: 4px;
  overflow: hidden;
}

.zone {
  flex: 1;
  opacity: 0.3;
}

.negative-zone {
  background: linear-gradient(90deg, #fee2e2 0%, #fecaca 100%);
}

.neutral-zone {
  background: #f5f5f5;
}

.positive-zone {
  background: linear-gradient(90deg, #d1fae5 0%, #a7f3d0 100%);
}

.center-marker {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #94a3b8;
  z-index: 2;
  transform: translateX(-50%);
}

.bullet-bar {
  position: absolute;
  height: 16px;
  border-radius: 3px;
  z-index: 3;
  transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  animation: growBar 0.8s ease-out;
}

@keyframes growBar {
  from {
    width: 0 !important;
  }
}

.bullet-bar.positive {
  background: linear-gradient(90deg, #10b981, #059669);
  box-shadow: 2px 0 4px rgba(16, 185, 129, 0.3);
}

.bullet-bar.negative {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  box-shadow: -2px 0 4px rgba(239, 68, 68, 0.3);
}

/* Barra más destacada en fila resaltada */
.bullet-row.highlight .bullet-bar.positive {
  box-shadow: 2px 0 6px rgba(16, 185, 129, 0.5);
}

.bullet-row.highlight .bullet-bar.negative {
  box-shadow: -2px 0 6px rgba(239, 68, 68, 0.5);
}

.bullet-value {
  width: 55px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  flex-shrink: 0;
}

.bullet-value.positive {
  color: #059669;
}

.bullet-value.negative {
  color: #dc2626;
}

/* Valor más destacado en fila resaltada */
.bullet-row.highlight .bullet-value {
  font-size: 13px;
  font-weight: 700;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 12px 15px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #6b7280;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.negative {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.legend-color.neutral {
  background: #f5f5f5;
  border: 1px solid #e5e7eb;
}

.legend-color.positive {
  background: linear-gradient(90deg, #10b981, #059669);
}

/* Estados vacíos */
.chart-body:empty::after {
  content: 'No hay datos disponibles';
  display: block;
  text-align: center;
  color: #9ca3af;
  padding: 40px;
  font-size: 14px;
}
</style>