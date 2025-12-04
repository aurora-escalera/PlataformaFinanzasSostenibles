<!-- src/modules/object/component/PersonChart.vue -->
<!-- ✅ ACTUALIZADO: Iconos más pequeños, centrados y animación más lenta -->
<template>
  <div class="person-chart">
    <div class="persons-container">
      <div 
        v-for="index in 10" 
        :key="index"
        class="person-wrapper"
      >
        <svg 
          class="person-svg"
          viewBox="0 0 32 44" 
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <!-- Gradiente para persona vacía -->
            <linearGradient :id="'emptyPersonGradient-' + index" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#e8eaed"/>
              <stop offset="50%" stop-color="#d4d7dc"/>
              <stop offset="100%" stop-color="#c8cbd0"/>
            </linearGradient>
            
            <!-- Gradiente para persona llena - Azul oscuro como el header -->
            <linearGradient :id="'filledPersonGradient-' + index" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#2a5478"/>
              <stop offset="50%" stop-color="#1e3a5f"/>
              <stop offset="100%" stop-color="#153d5e"/>
            </linearGradient>
            
            <!-- Clip path para toda la persona -->
            <clipPath :id="'personClip-' + index">
              <!-- Cabeza -->
              <circle cx="16" cy="10" r="8"/>
              <!-- Cuerpo (torso con hombros redondeados) -->
              <path d="M4 44 L4 34 C4 26 10 22 16 22 C22 22 28 26 28 34 L28 44 Z"/>
            </clipPath>
          </defs>
          
          <!-- ===== PERSONA VACÍA (FONDO) ===== -->
          <!-- Cabeza vacía -->
          <circle 
            cx="16" cy="10" r="8"
            :fill="'url(#emptyPersonGradient-' + index + ')'"
            stroke="#bfc3c9"
            stroke-width="1.5"
          />
          
          <!-- Cuerpo vacío -->
          <path 
            d="M4 44 L4 34 C4 26 10 22 16 22 C22 22 28 26 28 34 L28 44 Z"
            :fill="'url(#emptyPersonGradient-' + index + ')'"
            stroke="#bfc3c9"
            stroke-width="1.5"
          />
          
          <!-- ===== PERSONA LLENA (ANIMADA) ===== -->
          <g :clip-path="'url(#personClip-' + index + ')'">
            <!-- Rectángulo que sube para llenar -->
            <rect 
              x="0" 
              :y="44 - (animatedFillLevels[index - 1] / 100 * 44)"
              width="32" 
              :height="animatedFillLevels[index - 1] / 100 * 44"
              :fill="'url(#filledPersonGradient-' + index + ')'"
              class="fill-rect"
            />
          </g>
          
          <!-- Brillo en la cabeza cuando está llena -->
          <circle 
            v-if="animatedFillLevels[index - 1] >= 90"
            cx="13" cy="7" r="2"
            fill="rgba(255,255,255,0.35)"
            class="shine"
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

// Array de niveles de llenado animados para cada persona (0-100 cada una)
const animatedFillLevels = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

// Calcular el nivel objetivo para cada persona
const calculateTargetLevels = (percentage) => {
  const targets = []
  const totalPersons = 10
  const percentPerPerson = 100 / totalPersons // 10% cada persona
  
  for (let i = 0; i < totalPersons; i++) {
    const personStartPercent = i * percentPerPerson
    const personEndPercent = (i + 1) * percentPerPerson
    
    if (percentage <= personStartPercent) {
      targets.push(0)
    } else if (percentage >= personEndPercent) {
      targets.push(100)
    } else {
      const fillPercent = ((percentage - personStartPercent) / percentPerPerson) * 100
      targets.push(fillPercent)
    }
  }
  
  return targets
}

// ✅ Animar el llenado secuencial persona por persona (MÁS LENTO)
const animateFillSequential = (targetLevels) => {
  // Resetear todas las personas a 0
  animatedFillLevels.value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  
  // ✅ Delay entre cada persona aumentado (más lento)
  const delayPerPerson = 120
  
  // Animar cada persona secuencialmente
  targetLevels.forEach((targetLevel, index) => {
    if (targetLevel > 0) {
      setTimeout(() => {
        animatePersonFill(index, targetLevel)
      }, delayPerPerson * (index + 1))
    }
  })
}

// ✅ Animar el llenado gradual de una persona individual (MÁS LENTO)
const animatePersonFill = (personIndex, targetLevel) => {
  const duration = 350 // ✅ Aumentado de 200 a 350ms
  const startTime = Date.now()
  const startLevel = animatedFillLevels.value[personIndex]
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    
    animatedFillLevels.value[personIndex] = startLevel + (targetLevel - startLevel) * easeOut
    animatedFillLevels.value = [...animatedFillLevels.value]
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

// Watch para cambios en el valor
watch(() => props.value, (newValue) => {
  const targets = calculateTargetLevels(newValue)
  animateFillSequential(targets)
}, { immediate: false })

// Al montar, inicializar con animación secuencial
onMounted(() => {
  setTimeout(() => {
    const targets = calculateTargetLevels(props.value)
    animateFillSequential(targets)
  }, 200)
})
</script>

<style scoped>
.person-chart {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.persons-container {
  display: flex;
  align-items: center; /* ✅ Centrado vertical */
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 3px; /* ✅ Reducido gap */
  padding: 2px;
}

.person-wrapper {
  display: flex;
  align-items: center; /* ✅ Centrado vertical */
  justify-content: center;
  height: 100%;
  flex: 1;
  max-width: 28px; /* ✅ Más pequeño */
  min-width: 16px;
}

.person-svg {
  width: 100%;
  height: 100%;
  max-height: 45px; /* ✅ Más pequeño */
  overflow: visible;
  transition: transform 0.2s ease;
}

.person-wrapper:hover .person-svg {
  transform: scale(1.08);
}

/* Animación del llenado - MÁS LENTA */
.fill-rect {
  transition: y 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.shine {
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.6; }
}
</style>