<template>
  <div class="area-chart-cont">    
    <!-- ✅ DEBUG INFO REMOVIDO -->
    
    <div class="legend" v-if="showLegend">
      <div 
        v-for="(item, index) in chartData"
        :key="index"
        class="legend-item"
      >
        <div class="legend-color" :style="{ backgroundColor: colors[index % colors.length] }"></div>
        <span class="legend-label">{{ item.label }}</span>
      </div>
    </div>
    
    <div class="chart-container">
      <svg 
        width="100%" 
        height="100%" 
        :viewBox="`0 0 ${size} ${size}`"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Círculos de fondo (anillos) -->
        <circle
          v-for="ring in rings"
          :key="ring"
          :cx="centerX"
          :cy="centerY"
          :r="ring"
          fill="none"
          stroke="#f0f0f0"
          stroke-width="1"
        />
        
        <!-- Sectores de datos -->
        <path
          v-for="(segment, index) in animatedSegments"
          :key="index"
          :d="segment.path"
          :fill="segment.color"
          :class="['segment', { 'hovered': hoveredIndex === index }]"
          @mouseenter.native="handleMouseEnter(index, segment, $event)"
          @mousemove.native="handleMouseMove($event)"
          @mouseleave.native="handleMouseLeave"
        >
          <title>{{ segment.label }}: {{ segment.value }}</title>
        </path>
        
        <!-- Líneas radiales -->
        <line
          v-for="(line, index) in radialLines"
          :key="`line-${index}`"
          :x1="centerX"
          :y1="centerY"
          :x2="line.x"
          :y2="line.y"
          stroke="#ffffff"
          stroke-width="2"
          pointer-events="none"
        />
      </svg>
    </div>
    
    <Teleport to="body">
      <div 
        v-if="tooltip.visible"
        class="tooltip"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          <div class="tooltip-color" :style="{ backgroundColor: tooltip.color }"></div>
          <div class="tooltip-info">
            <div class="tooltip-label">{{ tooltip.label }}</div>
            <div class="tooltip-value">Valor: {{ tooltip.value }}</div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'

const props = defineProps({
  excelData: {
    type: Array,
    default: null
  },
  colors: {
    type: Array,
    default: () => ['#FF6B9D', '#4ECDC4', '#FFE66D', '#95A5A6', '#3498DB']
  },
  size: {
    type: Number,
    default: 400
  },
  innerRadius: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: ''
  },
  showLegend: {
    type: Boolean,
    default: true
  }
})

const hardcodedData = [
  { label: 'Red', value: 11 },
  { label: 'Green', value: 16 },
  { label: 'Yellow', value: 7 },
  { label: 'Grey', value: 3 },
  { label: 'Blue', value: 14 }
]

const chartData = computed(() => {
  return props.excelData || hardcodedData
})

const centerX = computed(() => props.size / 2)
const centerY = computed(() => props.size / 2)
const maxRadius = computed(() => (props.size / 2) - 20)
const rotationProgress = ref(0)

const hoveredIndex = ref(null)
const animationProgress = ref(0)

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  value: '',
  color: ''
})

onMounted(() => {
  setTimeout(() => {
    animateChart()
  }, 800)
})

watch(() => chartData.value, () => {
  animationProgress.value = 0
  rotationProgress.value = 0
  animateChart()
})

const animateChart = () => {
  const duration = 1500
  const startTime = Date.now()

  const animate = () => {
    const now = Date.now()
    const progress = Math.min((now - startTime) / duration, 1)
    
    rotationProgress.value = 1 - Math.pow(1 - progress, 6)
    const scaleProgress = Math.max(0, (progress - 0.1) / 0.8)
    animationProgress.value = 1 - Math.pow(1 - progress, 5)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

const maxValue = computed(() => {
  return Math.max(...chartData.value.map(item => item.value))
})

const rings = computed(() => {
  const ringCount = 4
  const step = (maxRadius.value - props.innerRadius) / ringCount
  return Array.from({ length: ringCount }, (_, i) => 
    props.innerRadius + (step * (i + 1))
  )
})

const anglePerSegment = computed(() => (2 * Math.PI) / chartData.value.length)

const segments = computed(() => {
  return chartData.value.map((item, index) => {
    const startAngle = index * anglePerSegment.value - Math.PI / 2
    const endAngle = startAngle + anglePerSegment.value
    
    const radius = props.innerRadius + 
      ((maxRadius.value - props.innerRadius) * (item.value / maxValue.value))
    
    return {
      startAngle,
      endAngle,
      radius,
      color: props.colors[index % props.colors.length],
      label: item.label,
      value: item.value
    }
  })
})

const animatedSegments = computed(() => {
  const rotationAngle = -Math.PI * (1 - rotationProgress.value)
  
  return segments.value.map(segment => {
    const animatedRadius = props.innerRadius + 
      ((segment.radius - props.innerRadius) * animationProgress.value)
    
    const rotatedStartAngle = segment.startAngle + rotationAngle
    const rotatedEndAngle = segment.endAngle + rotationAngle
    
    const startX = centerX.value + props.innerRadius * Math.cos(rotatedStartAngle)
    const startY = centerY.value + props.innerRadius * Math.sin(rotatedStartAngle)
    
    const endX = centerX.value + props.innerRadius * Math.cos(rotatedEndAngle)
    const endY = centerY.value + props.innerRadius * Math.sin(rotatedEndAngle)
    
    const outerStartX = centerX.value + animatedRadius * Math.cos(rotatedStartAngle)
    const outerStartY = centerY.value + animatedRadius * Math.sin(rotatedStartAngle)
    
    const outerEndX = centerX.value + animatedRadius * Math.cos(rotatedEndAngle)
    const outerEndY = centerY.value + animatedRadius * Math.sin(rotatedEndAngle)
    
    const largeArcFlag = 0
    const path = `
      M ${startX} ${startY}
      L ${outerStartX} ${outerStartY}
      A ${animatedRadius} ${animatedRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
      L ${endX} ${endY}
      A ${props.innerRadius} ${props.innerRadius} 0 ${largeArcFlag} 0 ${startX} ${startY}
      Z
    `
    
    return {
      path,
      color: segment.color,
      label: segment.label,
      value: segment.value
    }
  })
})

const radialLines = computed(() => {
  const rotationAngle = -Math.PI * (1 - rotationProgress.value)
  
  return chartData.value.map((_, index) => {
    const angle = index * anglePerSegment.value - Math.PI / 2 + rotationAngle
    return {
      x: centerX.value + maxRadius.value * Math.cos(angle),
      y: centerY.value + maxRadius.value * Math.sin(angle)
    }
  })
})

const handleMouseEnter = (index, segment, event) => {
  hoveredIndex.value = index
  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    label: segment.label,
    value: segment.value,
    color: segment.color
  }
}

const handleMouseMove = (event) => {
  if (tooltip.value.visible) {
    tooltip.value.x = event.clientX
    tooltip.value.y = event.clientY
  }
}

const handleMouseLeave = () => {
  hoveredIndex.value = null
  tooltip.value.visible = false
}

const tooltipStyle = computed(() => {
  return {
    left: `${tooltip.value.x + 15}px`,
    top: `${tooltip.value.y - 50}px`
  }
})
</script>

<style scoped>
.area-chart-cont {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chart-container {
  position: relative;
  flex: 1;
  min-height: 0;
}

.legend {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  padding: 10px 5px 0px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1px;
  font-size: 10px;
  color: #666;
  padding-left: 8px;
}

.legend-color {
  width: 12px;
  height: 4px;
}

.legend-label {
  padding-top: 0px;
  font-weight: 100;
}

.segment {
  cursor: pointer;
  transition: opacity 0.2s ease;
  stroke: transparent;
  stroke-width: 5;
}

.segment:hover {
  opacity: 0.8;
  stroke: rgba(255, 255, 255, 0.3);
}

.segment.hovered {
  filter: brightness(1.1);
}

.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 4px 6px; 
  border-radius: 4px; 
  font-size: 8px; 
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 999999;
}

.tooltip-content {
  display: flex;
  align-items: center;
  gap: 5px; 
}

.tooltip-color {
  width: 8px; 
  height: 8px; 
  border-radius: 2px;
}

.tooltip-info {
  display: flex;
  flex-direction: column;
  gap: 1px; 
}

.tooltip-label {
  font-weight: 600;
  font-size: 7px; 
}

.tooltip-value {
  font-size: 6px; 
  opacity: 0.9;
}
</style>