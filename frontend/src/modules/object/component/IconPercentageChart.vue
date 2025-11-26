<!-- src/modules/object/component/IconPercentageChart.vue -->
<!-- ✅ REDISEÑADO: Sin fondo azul, icono visible, textos grandes -->
<template>
  <div class="icon-percentage-container" :style="containerStyle">
    <!-- Panel Izquierdo - Donut con icono -->
    <div class="left-panel">
      <div class="donut-container">
        <!-- Anillo del Donut SVG -->
        <svg class="donut-svg" viewBox="0 0 100 100">
          <!-- Fondo del anillo (gris claro) -->
          <circle
            class="donut-bg"
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#e2e8f0"
            stroke-width="5"
          />
          <!-- Anillo de progreso animado -->
          <circle
            class="donut-progress"
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#1e3a5f"
            stroke-width="5"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        <!-- Icono centrado que abarca todo el espacio -->
        <div class="donut-inner">
          <img 
            v-if="iconPath && !iconError" 
            :src="iconPath" 
            :alt="altText"
            class="donut-icon"
            @error="iconError = true"
          />
          <div v-else class="donut-icon-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
        </div>
      </div>
      <!-- Porcentaje debajo del donut -->
      <div class="donut-percent">{{ displayedPercentage }}%</div>

    </div>

    <!-- Panel Derecho - Datos -->
    <div class="right-panel">
      <!-- Valor Principal -->
      <div class="main-value-section">
        <span class="main-label">{{ mainLabel }}</span>
        <div class="main-value-row">
          <span v-if="currencySymbol" class="currency-symbol">{{ currencySymbol }}</span>
          <span class="main-value">{{ formattedMainValue }}</span>
          <span v-if="valueUnit" class="value-unit">{{ valueUnit }}</span>
        </div>
      </div>

      <!-- Grid de información -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Entidad</span>
          <span class="info-value">{{ entity }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Periodo</span>
          <span class="info-value">{{ period }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  // ============================================
  // PROPS ORIGINALES (compatibilidad)
  // ============================================
  iconPath: {
    type: String,
    default: ''
  },
  value: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  fillColor: {
    type: String,
    default: '#1e3a5f'
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '100%'
  },
  showPercentage: {
    type: Boolean,
    default: true
  },
  altText: {
    type: String,
    default: 'Icono'
  },
  animated: {
    type: Boolean,
    default: true
  },
  animationDuration: {
    type: Number,
    default: 1.5
  },
  progressiveAnimation: {
    type: Boolean,
    default: true
  },
  startDelay: {
    type: Number,
    default: 300
  },

  // ============================================
  // NUEVAS PROPS PARA SPLIT CARD
  // ============================================
  mainValue: {
    type: Number,
    default: 0
  },
  mainLabel: {
    type: String,
    default: 'PIB Estatal'
  },
  currencySymbol: {
    type: String,
    default: '$'
  },
  valueUnit: {
    type: String,
    default: 'MDP'
  },
  entity: {
    type: String,
    default: ''
  },
  period: {
    type: [String, Number],
    default: ''
  }
})

// Estados para animación
const animatedPercentage = ref(0)
const displayedPercentage = ref(0)
const isAnimating = ref(false)
const iconError = ref(false)

// Circunferencia del círculo (2 * PI * radio)
const circumference = computed(() => 2 * Math.PI * 46)

// Offset para el progreso del donut
const progressOffset = computed(() => {
  const progress = animatedPercentage.value / 100
  return circumference.value * (1 - progress)
})

// Estilos del contenedor
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

// Valor principal formateado
const formattedMainValue = computed(() => {
  if (!props.mainValue) return '0'
  return new Intl.NumberFormat('es-MX').format(props.mainValue)
})

// ============================================
// ANIMACIÓN PROGRESIVA (3 FASES)
// ============================================
const animateToValue = (targetValue) => {
  if (!props.progressiveAnimation || !props.animated) {
    animatedPercentage.value = targetValue
    displayedPercentage.value = Math.round(targetValue * 100) / 100
    return
  }

  isAnimating.value = true
  const totalDuration = props.animationDuration * 1000
  const phase1Duration = totalDuration * 0.33 // Llenar a 100
  const phase2Duration = totalDuration * 0.33 // Vaciar a 0
  const phase3Duration = totalDuration * 0.34 // Llenar al valor real
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime

    if (elapsed < phase1Duration) {
      // FASE 1: Llenar de 0 a 100
      const progress = elapsed / phase1Duration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      animatedPercentage.value = easeOut * 100
      displayedPercentage.value = Math.round(easeOut * 100 * 100) / 100
      requestAnimationFrame(animate)
    } else if (elapsed < phase1Duration + phase2Duration) {
      // FASE 2: Vaciar de 100 a 0
      const phase2Elapsed = elapsed - phase1Duration
      const progress = phase2Elapsed / phase2Duration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      animatedPercentage.value = 100 - (easeOut * 100)
      displayedPercentage.value = Math.round((100 - (easeOut * 100)) * 100) / 100
      requestAnimationFrame(animate)
    } else if (elapsed < totalDuration) {
      // FASE 3: Llenar de 0 al valor real
      const phase3Elapsed = elapsed - phase1Duration - phase2Duration
      const progress = phase3Elapsed / phase3Duration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      animatedPercentage.value = easeOut * targetValue
      displayedPercentage.value = Math.round((easeOut * targetValue) * 100) / 100
      requestAnimationFrame(animate)
    } else {
      // Finalizar
      animatedPercentage.value = targetValue
      displayedPercentage.value = Math.round(targetValue * 100) / 100
      isAnimating.value = false
    }
  }

  requestAnimationFrame(animate)
}

// Watch para cambios en el valor
watch(() => props.value, (newValue) => {
  if (props.startDelay > 0) {
    setTimeout(() => animateToValue(newValue), props.startDelay)
  } else {
    animateToValue(newValue)
  }
})

// Watch para resetear error del icono cuando cambia
watch(() => props.iconPath, () => {
  iconError.value = false
})

// Iniciar animación al montar
onMounted(() => {
  if (props.startDelay > 0) {
    setTimeout(() => animateToValue(props.value), props.startDelay)
  } else {
    animateToValue(props.value)
  }
})
</script>

<style scoped>
.icon-percentage-container {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 120px;
  overflow: hidden;
  background: white;
}

/* ============================================
   PANEL IZQUIERDO - DONUT SIN FONDO AZUL
   ============================================ */
.left-panel {
  width: 45%;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
}

/* Contenedor del Donut - MÁS GRANDE */
.donut-container {
  position: relative;
  width: 130px;
  height: 130px;
}

.donut-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.1));
}

.donut-bg {
  opacity: 1;
}

.donut-progress {
  transition: stroke-dashoffset 0.1s ease-out;
}

/* Interior del Donut - ICONO GRANDE */
.donut-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 85%;
  height: 85%;
}

.donut-icon {
  width: 70%;
  height: 70%;
  object-fit: contain;
  opacity: 1;
}

.donut-icon-placeholder {
  width: 70%;
  height: 70%;
  color: #1e3a5f;
  opacity: 1;
}

.donut-icon-placeholder svg {
  width: 100%;
  height: 100%;
}

/* Porcentaje DEBAJO del donut */
.donut-percent {
  font-size: 24px;
  font-weight: 800;
  color: #1e3a5f;
  line-height: 1;
  margin-top: 8px;
}

.donut-label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
  font-weight: 600;
}

/* ============================================
   PANEL DERECHO - DATOS
   ============================================ */
.right-panel {
  flex: 1;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  background: white;
}

/* Valor Principal */
.main-value-section {
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.main-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: block;
  margin-bottom: 6px;
}

.main-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
}

.currency-symbol {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a5f;
}

.main-value {
  font-size: 28px;
  font-weight: 800;
  color: #1e3a5f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.value-unit {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-left: 4px;
}

/* Grid de información */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.info-value {
  font-size: 17px;
  font-weight: 700;
  color: #1e3a5f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 350px) {
  .left-panel {
    width: 42%;
    padding: 10px 8px;
  }
  
  .donut-container {
    width: 100px;
    height: 100px;
  }
  
  .donut-icon {
    width: 65%;
    height: 65%;
  }
  
  .donut-percent {
    font-size: 18px;
  }
  
  .donut-label {
    font-size: 8px;
  }
  
  .main-value {
    font-size: 22px;
  }
  
  .currency-symbol {
    font-size: 16px;
  }
  
  .info-value {
    font-size: 14px;
  }
  
  .info-label {
    font-size: 9px;
  }
}
</style>