<!-- src/modules/object/component/GaugeChart.vue -->
<!-- ✅ VERSIÓN FINAL: Usa watchEffect para reaccionar correctamente -->
<template>
  <div class="gauge-chart" ref="chartContainer">
    <svg 
      width="100%" 
      height="40%" 
      :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize * 0.65}`"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Arco de fondo (gris) -->
      <path
        :d="arcPath"
        fill="none"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
        stroke-linecap="butt"
      />
      
      <!-- Arco de progreso (azul) -->
      <path
        v-if="animatedValue > 0.1"
        :d="progressPath"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        stroke-linecap="butt"
      />
      
      <!-- Aguja -->
      <path
        :d="needlePath"
        :fill="needleColor"
        class="needle"
      />
      
      <!-- Base circular de la aguja -->
      <circle
        :cx="centerX"
        :cy="centerY"
        :r="baseCircleRadius"
        :fill="needleColor"
        class="needle"
      />

      <!-- Centro de la aguja -->
      <circle
        :cx="centerX"
        :cy="centerY"
        :r="needleWidth * 1.5"
        :fill="needleColor"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  strokeWidth: {
    type: Number,
    default: 12
  },
  backgroundColor: {
    type: String,
    default: '#CDCDCD'
  },
  progressColor: {
    type: String,
    default: '#0F3759'
  },
  needleColor: {
    type: String,
    default: '#0F3759'
  },
  needleWidth: {
    type: Number,
    default: 3
  }
})

const viewBoxSize = 150
const baseCircleRadius = computed(() => 7)
const animatedValue = ref(0)
const isAnimating = ref(false)

const centerX = computed(() => viewBoxSize / 2)
const centerY = computed(() => viewBoxSize * 0.6)
const radius = computed(() => (viewBoxSize / 2) - (props.strokeWidth / 2) - 10)

const startAngle = -90
const endAngle = 90

// ✅ Valor seguro (clamped entre 0-100)
const safeValue = computed(() => {
  const val = props.value
  if (val === null || val === undefined || typeof val !== 'number' || isNaN(val)) {
    return 0
  }
  return Math.max(0, Math.min(100, val))
})

// ✅ Animar al montar - usa el valor actual de la prop
onMounted(() => {
  console.log('🎯 [GaugeChart] Montado con valor:', props.value, '-> safe:', safeValue.value)
  
  // Delay pequeño para asegurar render
  setTimeout(() => {
    if (safeValue.value > 0) {
      animateNeedle(0, safeValue.value)
    }
  }, 200)
})

// ✅ Watch para cambios DESPUÉS del mount
watch(() => props.value, (newValue, oldValue) => {
  const newSafe = Math.max(0, Math.min(100, newValue || 0))
  const oldSafe = Math.max(0, Math.min(100, oldValue || 0))
  
  console.log('🔄 [GaugeChart] Valor cambió:', oldSafe, '->', newSafe)
  
  if (Math.abs(newSafe - oldSafe) > 0.1) {
    animateNeedle(animatedValue.value, newSafe)
  }
})

const animateNeedle = (from, to) => {
  if (isAnimating.value) return
  
  console.log('🎬 [GaugeChart] Animando de', from, 'a', to)
  
  isAnimating.value = true
  const duration = 1500
  const startValue = from
  const endValue = to
  const startTime = Date.now()

  const animate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / duration, 1)
    
    // Ease-out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    animatedValue.value = startValue + (endValue - startValue) * easeProgress

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating.value = false
      console.log('✅ [GaugeChart] Animación completada:', animatedValue.value)
    }
  }

  requestAnimationFrame(animate)
}

// Funciones de geometría
const polarToCartesian = (angle) => {
  const angleInRadians = (angle - 90) * Math.PI / 180
  return {
    x: centerX.value + (radius.value * Math.cos(angleInRadians)),
    y: centerY.value + (radius.value * Math.sin(angleInRadians))
  }
}

const arcPath = computed(() => {
  const start = polarToCartesian(startAngle)
  const end = polarToCartesian(endAngle)
  return `M ${start.x} ${start.y} A ${radius.value} ${radius.value} 0 0 1 ${end.x} ${end.y}`
})

const progressPath = computed(() => {
  if (animatedValue.value < 0.1) return ''
  
  const progressAngle = startAngle + ((endAngle - startAngle) * (animatedValue.value / 100))
  const start = polarToCartesian(startAngle)
  const end = polarToCartesian(progressAngle)
  const largeArcFlag = Math.abs(progressAngle - startAngle) > 180 ? 1 : 0
  
  return `M ${start.x} ${start.y} A ${radius.value} ${radius.value} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
})

const needleAngle = computed(() => {
  return startAngle + ((endAngle - startAngle) * (animatedValue.value / 100))
})

const needlePath = computed(() => {
  const angle = needleAngle.value
  const angleRad = (angle - 90) * Math.PI / 180
  
  const tipX = centerX.value + ((radius.value - 10) * Math.cos(angleRad))
  const tipY = centerY.value + ((radius.value - 10) * Math.sin(angleRad))
  
  const perpAngle = angleRad + Math.PI / 2
  const circleRadius = baseCircleRadius.value
  
  const baseX1 = centerX.value + circleRadius * Math.cos(perpAngle)
  const baseY1 = centerY.value + circleRadius * Math.sin(perpAngle)
  const baseX2 = centerX.value - circleRadius * Math.cos(perpAngle)
  const baseY2 = centerY.value - circleRadius * Math.sin(perpAngle)
  
  const curveRadius = -1
  
  const curvePoint1X = tipX - curveRadius * Math.cos(perpAngle) - curveRadius * 0.3 * Math.cos(angleRad)
  const curvePoint1Y = tipY - curveRadius * Math.sin(perpAngle) - curveRadius * 0.3 * Math.sin(angleRad)
  
  const curvePoint2X = tipX + curveRadius * Math.cos(perpAngle) - curveRadius * 0.3 * Math.cos(angleRad)
  const curvePoint2Y = tipY + curveRadius * Math.sin(perpAngle) - curveRadius * 0.3 * Math.sin(angleRad)
  
  return `
    M ${baseX1} ${baseY1} 
    L ${curvePoint1X} ${curvePoint1Y}
    Q ${tipX} ${tipY} ${curvePoint2X} ${curvePoint2Y}
    L ${baseX2} ${baseY2}
    Z
  `
})
</script>

<style scoped>
.gauge-chart {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gauge-chart svg {
  width: 100%;
  height: 90%;
}
</style>