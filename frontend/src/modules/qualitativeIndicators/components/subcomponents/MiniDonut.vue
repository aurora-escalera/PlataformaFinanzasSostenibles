<!-- src/modules/qualitativeIndicators/components/subcomponents/MiniDonut.vue -->
<template>
  <div class="mini-donut" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="donut-svg">
      <circle 
        :cx="size / 2" 
        :cy="size / 2" 
        :r="radius" 
        fill="none" 
        stroke="rgba(255,255,255,0.2)" 
        :stroke-width="strokeWidth" 
      />
      <circle 
        :cx="size / 2" 
        :cy="size / 2" 
        :r="radius" 
        fill="none" 
        stroke="white" 
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="progressOffset"
        stroke-linecap="round"
        class="progress-circle"
      />
    </svg>
    <div class="donut-value">
      <span>{{ Math.round(animatedValue) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 36
  }
})

const strokeWidth = 3
const animatedValue = ref(0)

const radius = computed(() => (props.size - strokeWidth * 2) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const progressOffset = computed(() => {
  return circumference.value - (animatedValue.value / 100) * circumference.value
})

const animateValue = (targetValue) => {
  const duration = 1000
  const steps = 30
  const increment = targetValue / steps
  let current = 0
  
  const timer = setInterval(() => {
    current += increment
    if (current >= targetValue) {
      animatedValue.value = targetValue
      clearInterval(timer)
    } else {
      animatedValue.value = current
    }
  }, duration / steps)
}

watch(() => props.value, (newVal) => {
  animatedValue.value = 0
  setTimeout(() => animateValue(newVal), 100)
}, { immediate: false })

onMounted(() => {
  setTimeout(() => animateValue(props.value), 100)
})
</script>

<style scoped>
.mini-donut {
  position: relative;
}

.donut-svg {
  transform: rotate(-90deg);
}

.progress-circle {
  transition: stroke-dashoffset 1s ease-out;
}

.donut-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-value span {
  font-size: 10px;
  font-weight: 700;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>