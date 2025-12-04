<!-- src/modules/qualitativeIndicators/components/subcomponents/AnimatedIconMetric.vue -->
<template>
  <div class="animated-icon-metric">
    <!-- Icono con animación de llenado -->
    <div class="icon-wrapper">
      <!-- Fondo (gris) -->
      <div class="icon-background">
        <component :is="iconComponent" class="icon-svg icon-gray" />
      </div>
      
      <!-- Llenado animado (azul) -->
      <div 
        class="icon-fill" 
        :style="{ clipPath: `inset(${100 - animatedValue}% 0 0 0)` }"
      >
        <component :is="iconComponent" class="icon-svg icon-white" />
      </div>

      <!-- Mini círculo de progreso -->
      <svg class="mini-progress" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" class="progress-bg" />
        <circle 
          cx="12" cy="12" r="7" 
          class="progress-ring"
          :stroke-dasharray="`${(animatedValue / 100) * 44} 44`"
        />
      </svg>
    </div>

    <!-- Valor -->
    <span class="metric-value">{{ displayValue }}</span>
    
    <!-- Label -->
    <span class="metric-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, h } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: ''
  },
  iconType: {
    type: String,
    default: 'chart'
  },
  delay: {
    type: Number,
    default: 0
  }
})

const animatedValue = ref(0)
const displayValue = ref(0)

// Componente de icono dinámico
const iconComponent = computed(() => {
  if (props.iconType === 'chart') {
    return {
      render() {
        return h('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        }, [
          h('line', { x1: '18', y1: '20', x2: '18', y2: '10' }),
          h('line', { x1: '12', y1: '20', x2: '12', y2: '4' }),
          h('line', { x1: '6', y1: '20', x2: '6', y2: '14' })
        ])
      }
    }
  } else {
    return {
      render() {
        return h('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        }, [
          h('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }),
          h('rect', { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' }),
          h('path', { d: 'M9 14l2 2 4-4' })
        ])
      }
    }
  }
})

const animateValue = () => {
  animatedValue.value = 0
  displayValue.value = 0
  
  setTimeout(() => {
    animatedValue.value = props.value
    
    // Animar el número
    const duration = 1000
    const steps = 30
    const increment = props.value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= props.value) {
        displayValue.value = props.value.toFixed(1)
        clearInterval(timer)
      } else {
        displayValue.value = current.toFixed(1)
      }
    }, duration / steps)
  }, props.delay)
}

watch(() => props.value, () => {
  animateValue()
}, { immediate: false })

onMounted(() => {
  animateValue()
})
</script>

<style scoped>
.animated-icon-metric {
  background: white;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  margin-bottom: 10px;
}

.icon-background {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-fill {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: clip-path 1s ease-out;
}

.icon-svg {
  width: 28px;
  height: 28px;
}

.icon-gray {
  color: #cbd5e1;
}

.icon-white {
  color: white;
}

.mini-progress {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
}

.progress-bg {
  fill: white;
  stroke: #e5e7eb;
  stroke-width: 2;
}

.progress-ring {
  fill: none;
  stroke: #0F3759;
  stroke-width: 3;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dasharray 1s ease-out;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.metric-label {
  font-size: 9px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>