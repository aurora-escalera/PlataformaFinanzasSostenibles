<!-- src/modules/object/component/BottleChart.vue -->
<!-- ✅ MEJORADO: Animación secuencial botella por botella -->
<template>
  <div class="bottle-chart">
    <div class="bottles-container">
      <div 
        v-for="index in 10" 
        :key="index"
        class="bottle-wrapper"
      >
        <svg 
          class="bottle-svg"
          viewBox="0 0 24 55" 
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <!-- Gradiente para botella vacía -->
            <linearGradient :id="'emptyGradient-' + index" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#e8eaed"/>
              <stop offset="50%" stop-color="#d4d7dc"/>
              <stop offset="100%" stop-color="#c8cbd0"/>
            </linearGradient>
            
            <!-- Gradiente para el líquido -->
            <linearGradient :id="'liquidGradient-' + index" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#60a5fa"/>
              <stop offset="50%" stop-color="#3b82f6"/>
              <stop offset="100%" stop-color="#2563eb"/>
            </linearGradient>
            
            <!-- Clip path para el cuerpo de la botella -->
            <clipPath :id="'bodyClip-' + index">
              <rect x="3" y="22" width="18" height="30" rx="2"/>
            </clipPath>
            
            <!-- Sombra sutil -->
            <filter :id="'shadow-' + index" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0.5" dy="1" stdDeviation="1" flood-opacity="0.12"/>
            </filter>
          </defs>
          
          <!-- Tapa de la botella -->
          <rect 
            x="7" y="0" width="10" height="7" rx="3" 
            :fill="'url(#emptyGradient-' + index + ')'"
          />
          
          <!-- Cuello y hombros -->
          <path 
            d="M6 9 Q6 7 7 7 L17 7 Q18 7 18 9 L18 13 Q18 16 21 19 L21 21 L3 21 L3 19 Q6 16 6 13 Z"
            :fill="'url(#emptyGradient-' + index + ')'"
          />
          
          <!-- Cuerpo de la botella (contenedor vacío) -->
          <rect 
            x="3" y="22" width="18" height="30" rx="2"
            :fill="'url(#emptyGradient-' + index + ')'"
            :filter="'url(#shadow-' + index + ')'"
          />
          
          <!-- Línea divisoria -->
          <rect x="3" y="20" width="18" height="2" fill="#bfc3c9"/>
          
          <!-- Líquido con animación -->
          <rect 
            x="3" 
            :y="52 - animatedFillHeights[index - 1]"
            width="18" 
            :height="animatedFillHeights[index - 1]"
            :fill="'url(#liquidGradient-' + index + ')'"
            :clip-path="'url(#bodyClip-' + index + ')'"
            class="liquid-fill"
          />
          
          <!-- Brillo del líquido -->
          <rect 
            v-if="animatedFillHeights[index - 1] > 4"
            x="5" 
            :y="53 - animatedFillHeights[index - 1]"
            width="2" 
            :height="Math.max(0, animatedFillHeights[index - 1] - 3)"
            rx="1"
            fill="rgba(255,255,255,0.4)"
            :clip-path="'url(#bodyClip-' + index + ')'"
            class="liquid-shine"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  }
})

// Altura máxima del líquido en el cuerpo de la botella
const maxFillHeight = 30

// Array de alturas animadas para cada botella
const animatedFillHeights = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

// Calcular la altura objetivo para cada botella
const calculateTargetHeights = (percentage) => {
  const targets = []
  const totalBottles = 10
  const percentPerBottle = 100 / totalBottles
  
  for (let i = 0; i < totalBottles; i++) {
    const bottleStartPercent = i * percentPerBottle
    const bottleEndPercent = (i + 1) * percentPerBottle
    
    if (percentage <= bottleStartPercent) {
      targets.push(0)
    } else if (percentage >= bottleEndPercent) {
      targets.push(maxFillHeight)
    } else {
      const fillPercent = (percentage - bottleStartPercent) / percentPerBottle
      targets.push(fillPercent * maxFillHeight)
    }
  }
  
  return targets
}

// ✅ Animar el llenado secuencial botella por botella
const animateFillSequential = (targetHeights) => {
  // Resetear todas las botellas a 0
  animatedFillHeights.value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  
  // Delay entre cada botella (en ms)
  const delayPerBottle = 80
  
  // Animar cada botella secuencialmente
  targetHeights.forEach((targetHeight, index) => {
    if (targetHeight > 0) {
      setTimeout(() => {
        animatedFillHeights.value[index] = targetHeight
        // Forzar reactividad
        animatedFillHeights.value = [...animatedFillHeights.value]
      }, delayPerBottle * (index + 1))
    }
  })
}

// Watch para cambios en el valor
watch(() => props.value, (newValue) => {
  const targets = calculateTargetHeights(newValue)
  animateFillSequential(targets)
}, { immediate: false })

// Al montar, inicializar con animación secuencial
onMounted(() => {
  setTimeout(() => {
    const targets = calculateTargetHeights(props.value)
    animateFillSequential(targets)
  }, 150)
})
</script>

<style scoped>
.bottle-chart {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.bottles-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 3px;
  padding: 2px;
}

.bottle-wrapper {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
  flex: 1;
  max-width: 30px;
  min-width: 18px;
}

.bottle-svg {
  width: 100%;
  height: 100%;
  max-height: 55px;
  overflow: visible;
  transition: transform 0.2s ease;
}

.bottle-wrapper:hover .bottle-svg {
  transform: scale(1.08);
}

/* Animación del líquido - más lenta para cada botella */
.liquid-fill {
  transition: y 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
              height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.liquid-shine {
  transition: y 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
              height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.9;
}
</style>