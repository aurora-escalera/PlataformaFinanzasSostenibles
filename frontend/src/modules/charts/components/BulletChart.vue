<!-- src/modules/charts/components/BulletChart.vue -->
<!-- ✅ DISEÑO C: Minimalista con líneas, puntos y animaciones -->
<template>
  <div class="bullet-chart-container">
    <!-- Header (opcional) -->
    <div class="chart-header" v-if="title">
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
          <!-- Línea de fondo -->
          <div class="background-line"></div>
          
          <!-- Center marker (0%) -->
          <div class="center-marker"></div>

          <!-- Línea de valor animada -->
          <div 
            class="value-line"
            :class="{ 'positive': item.value >= 0, 'negative': item.value < 0 }"
            :style="getLineStyle(item.value, index)"
          ></div>

          <!-- Punto al final de la línea -->
          <div 
            class="value-dot"
            :class="{ 'positive': item.value >= 0, 'negative': item.value < 0 }"
            :style="getDotStyle(item.value, index)"
          ></div>
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

    <!-- Legend (opcional) -->
    <div v-if="showLegend" class="chart-legend">
      <div class="legend-item">
        <div class="legend-dot negative"></div>
        <span>Decrecimiento</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot positive"></div>
        <span>Crecimiento</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  variables: {
    type: Array,
    required: true,
    default: () => []
  },
  title: {
    type: String,
    default: ''
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
    default: 20
  }
})

const chartBodyRef = ref(null)
const animationStarted = ref(false)

// Datos ordenados de mayor a menor
const sortedData = computed(() => {
  if (!props.variables || props.variables.length === 0) return []
  return [...props.variables].sort((a, b) => b.value - a.value)
})

// ✅ Función para scroll automático al elemento destacado
// Retorna una promesa que se resuelve cuando termina el scroll
const scrollToHighlighted = () => {
  return new Promise((resolve) => {
    if (!props.highlightState || !chartBodyRef.value) {
      resolve()
      return
    }
    
    nextTick(() => {
      setTimeout(() => {
        const container = chartBodyRef.value
        const highlightedElement = container?.querySelector('.bullet-row.highlight')
        
        if (highlightedElement && container) {
          const elementTop = highlightedElement.offsetTop
          const elementHeight = highlightedElement.offsetHeight
          const containerHeight = container.clientHeight
          const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2)
          
          container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: 'smooth'
          })
          
          // Esperar a que termine el scroll (aprox 400ms)
          setTimeout(() => {
            resolve()
          }, 500)
        } else {
          resolve()
        }
      }, 100)
    })
  })
}

// ✅ Función para iniciar la animación de las bolitas
const startAnimation = () => {
  animationStarted.value = true
}

// Watch para cambio de estado destacado
watch(() => props.highlightState, async (newState) => {
  if (newState) {
    animationStarted.value = false
    await scrollToHighlighted()
    startAnimation()
  }
}, { immediate: false })

// Watch para cuando se cargan los datos
watch(() => [props.variables, props.highlightState], async ([newVariables, newHighlight]) => {
  if (newVariables && newVariables.length > 0) {
    // Resetear animación
    animationStarted.value = false
    
    await nextTick()
    
    if (newHighlight) {
      // Primero scroll, luego animación
      await scrollToHighlighted()
      startAnimation()
    } else {
      // Si no hay highlight, animar después de un pequeño delay
      setTimeout(() => {
        startAnimation()
      }, 200)
    }
  }
}, { immediate: true, deep: true })

// ✅ Estilo de la línea con animación
const getLineStyle = (value, index) => {
  const maxValue = props.maxValue
  const percentage = Math.min(Math.abs(value) / maxValue * 50, 50)
  
  // Delay escalonado para animación secuencial
  const delay = index * 0.05
  
  if (!animationStarted.value) {
    // Estado inicial: línea en el centro (width 0)
    return {
      left: '50%',
      width: '0%',
      transitionDelay: `${delay}s`
    }
  }
  
  if (value >= 0) {
    return {
      left: '50%',
      width: `${percentage}%`,
      transitionDelay: `${delay}s`
    }
  } else {
    return {
      right: '50%',
      width: `${percentage}%`,
      transitionDelay: `${delay}s`
    }
  }
}

// ✅ Estilo del punto con animación
const getDotStyle = (value, index) => {
  const maxValue = props.maxValue
  const percentage = Math.min(Math.abs(value) / maxValue * 50, 50)
  
  // Delay escalonado para animación secuencial
  const delay = index * 0.05
  
  if (!animationStarted.value) {
    // Estado inicial: punto en el centro
    return {
      left: '50%',
      transform: 'translateX(-50%)',
      transitionDelay: `${delay}s`
    }
  }
  
  if (value >= 0) {
    return {
      left: `${50 + percentage}%`,
      transform: 'translateX(-50%)',
      transitionDelay: `${delay}s`
    }
  } else {
    return {
      left: `${50 - percentage}%`,
      transform: 'translateX(-50%)',
      transitionDelay: `${delay}s`
    }
  }
}

// Formatear valor
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
  border-radius: 12px;
}

.chart-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  background: white;
  z-index: 10;
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
  position: relative;
}

/* Scrollbar minimalista */
.chart-body::-webkit-scrollbar {
  width: 6px;
}

.chart-body::-webkit-scrollbar-track {
  background: transparent;
}

.chart-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chart-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.chart-body {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

/* ============================================
   FILAS
   ============================================ */
.bullet-row {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  margin-right: 4px;
}

.bullet-row:last-child {
  border-bottom: none;
}

.bullet-row:hover {
  background-color: #f8fafc;
}

.bullet-row.highlight {
  background-color: #f0f7ff;
  border-bottom: 1px solid #f1f5f9;
  border-radius: 8px;
  box-shadow: 
    0 2px 8px rgba(30, 58, 95, 0.15),
    0 4px 16px rgba(30, 58, 95, 0.1),
    inset 0 0 0 1px rgba(30, 58, 95, 0.08);
}

.bullet-row.highlight .bullet-label {
  color: #1e3a5f;
  font-weight: 700;
}

/* ============================================
   LABELS
   ============================================ */
.bullet-label {
  width: 130px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  padding-right: 15px;
  text-align: right;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

/* ============================================
   CONTENEDOR DE BARRA
   ============================================ */
.bullet-bar-container {
  flex: 1;
  height: 20px;
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 10px;
}

/* Línea de fondo gris */
.background-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #e5e7eb;
  transform: translateY(-50%);
}

/* Marcador central (0%) */
.center-marker {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1px;
  height: 16px;
  background: #94a3b8;
  z-index: 2;
}

/* ============================================
   LÍNEA DE VALOR (ANIMADA)
   ============================================ */
.value-line {
  position: absolute;
  height: 3px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 2px;
  z-index: 3;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.value-line.positive {
  background: #1e3a5f;
}

.value-line.negative {
  background: #94a3b8;
}

/* Línea más gruesa en fila destacada */
.bullet-row.highlight .value-line {
  height: 4px;
}

.bullet-row.highlight .value-line.positive {
  background: #1e3a5f;
  box-shadow: 0 1px 3px rgba(30, 58, 95, 0.3);
}

/* ============================================
   PUNTO AL FINAL (ANIMADO)
   ============================================ */
.value-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  top: 50%;
  margin-top: -6px;
  z-index: 4;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.value-dot.positive {
  background: #1e3a5f;
}

.value-dot.negative {
  background: #94a3b8;
}

/* Punto más grande en fila destacada */
.bullet-row.highlight .value-dot {
  width: 14px;
  height: 14px;
  margin-top: -7px;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.4);
}

.bullet-row.highlight .value-dot.positive {
  background: #1e3a5f;
  animation: pulseDot 2s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(30, 58, 95, 0.4);
  }
  50% {
    box-shadow: 0 2px 16px rgba(30, 58, 95, 0.6);
  }
}

/* ============================================
   VALORES
   ============================================ */
.bullet-value {
  width: 55px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.bullet-value.positive {
  color: #1e3a5f;
}

.bullet-value.negative {
  color: #64748b;
}

.bullet-row.highlight .bullet-value {
  font-size: 13px;
  font-weight: 700;
}

.bullet-row.highlight .bullet-value.positive {
  color: #1e3a5f;
}

/* ============================================
   LEYENDA
   ============================================ */
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 25px;
  padding: 12px 15px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
  background: #fafafa;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #6b7280;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.positive {
  background: #1e3a5f;
}

.legend-dot.negative {
  background: #94a3b8;
}

/* Estado vacío */
.chart-body:empty::after {
  content: 'No hay datos disponibles';
  display: block;
  text-align: center;
  color: #9ca3af;
  padding: 40px;
  font-size: 14px;
}
</style>