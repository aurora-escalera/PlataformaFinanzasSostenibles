<!-- src/modules/object/components/GaugeChart.vue -->
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

      <!-- Centro de la aguja (punto más pequeño encima) -->
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
    required: true,
    validator: (value) => value >= 0 && value <= 100
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

// Usa un tamaño fijo para viewBox (coordenadas internas del SVG)
const viewBoxSize = 150
const baseCircleRadius = computed(() => 7) // Radio del círculo base

// Valor animado
const animatedValue = ref(0)

const centerX = computed(() => (viewBoxSize / 2))
const centerY = computed(() => viewBoxSize * 0.6)
const radius = computed(() => (viewBoxSize / 2) - (props.strokeWidth / 2) - 10)

const startAngle = -90
const endAngle = 90

// Animar al montar el componente
onMounted(() => {
  setTimeout(() => {
    animateNeedle()
  }, 800)
})

// Animar cuando cambie el valor
watch(() => props.value, () => {
  animateNeedle()
})

const animateNeedle = () => {
  const duration = 3000 // 1.5 segundos
  const startValue = animatedValue.value
  const endValue = props.value
  const startTime = Date.now()

  const animate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / duration, 1)
    
    // Ease-out cubic para suavidad
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    animatedValue.value = startValue + (endValue - startValue) * easeProgress

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}


//Diseño del medidor
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
  const progressAngle = startAngle + ((endAngle - startAngle) * (animatedValue.value / 100))
  const start = polarToCartesian(startAngle)
  const end = polarToCartesian(progressAngle)
  
  const largeArcFlag = Math.abs(progressAngle - startAngle) > 180 ? 1 : 0
  
  return `M ${start.x} ${start.y} A ${radius.value} ${radius.value} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
})

const needleAngle = computed(() => {
  return startAngle + ((endAngle - startAngle) * (animatedValue.value / 100))
})

const needleX = computed(() => {
  const angleInRadians = (needleAngle.value - 90) * Math.PI / 180
  return centerX.value + ((radius.value - 10) * Math.cos(angleInRadians))
})

const needleY = computed(() => {
  const angleInRadians = (needleAngle.value - 90) * Math.PI / 180
  return centerY.value + ((radius.value - 10) * Math.sin(angleInRadians))
})

const needlePath = computed(() => {
  const angle = needleAngle.value
  const angleRad = (angle - 90) * Math.PI / 180
  
  // Punto de la punta de la aguja
  const tipX = centerX.value + ((radius.value - 10) * Math.cos(angleRad))
  const tipY = centerY.value + ((radius.value - 10) * Math.sin(angleRad))
  
  // Ancho de la base en el borde del círculo
  const perpAngle = angleRad + Math.PI / 2
  const circleRadius = baseCircleRadius.value
  
  const baseX1 = centerX.value + circleRadius * Math.cos(perpAngle)
  const baseY1 = centerY.value + circleRadius * Math.sin(perpAngle)
  const baseX2 = centerX.value - circleRadius * Math.cos(perpAngle)
  const baseY2 = centerY.value - circleRadius * Math.sin(perpAngle)
  
  // Radio de curvatura para la punta
  const curveRadius = -1
  
  // Puntos de control para la curva en la punta
  const curvePoint1X = tipX - curveRadius * Math.cos(perpAngle) - curveRadius * 0.3 * Math.cos(angleRad)
  const curvePoint1Y = tipY - curveRadius * Math.sin(perpAngle) - curveRadius * 0.3 * Math.sin(angleRad)
  
  const curvePoint2X = tipX + curveRadius * Math.cos(perpAngle) - curveRadius * 0.3 * Math.cos(angleRad)
  const curvePoint2Y = tipY + curveRadius * Math.sin(perpAngle) - curveRadius * 0.3 * Math.sin(angleRad)
  
  // Crear path con curva suave en la punta
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