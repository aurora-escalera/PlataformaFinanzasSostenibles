<!-- src/modules/qualitativeIndicators/components/subcomponents/VerticalComparisonBars.vue -->
<template>
  <div class="comparison-bars">
    <!-- Federal -->
    <div class="bar-column">
      <span class="bar-value federal-value">{{ federal }}%</span>
      <div class="bar-track">
        <div 
          class="bar-fill federal-fill" 
          :style="{ height: animatedFederal + '%' }"
        ></div>
      </div>
      <div class="bar-label">
        <span class="dot federal-dot"></span>
        <span class="label-text">Federal</span>
      </div>
    </div>

    <!-- Separador -->
    <div class="separator">
      <div class="separator-line"></div>
      <span class="separator-text">vs</span>
      <div class="separator-line"></div>
    </div>

    <!-- Estatal -->
    <div class="bar-column">
      <span class="bar-value estatal-value">{{ estatal }}%</span>
      <div class="bar-track">
        <div 
          class="bar-fill estatal-fill" 
          :style="{ height: animatedEstatal + '%' }"
        ></div>
      </div>
      <div class="bar-label">
        <span class="dot estatal-dot"></span>
        <span class="label-text">Estatal</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  federal: {
    type: Number,
    default: 0
  },
  estatal: {
    type: Number,
    default: 0
  }
})

const animatedFederal = ref(0)
const animatedEstatal = ref(0)

const animateBars = () => {
  animatedFederal.value = 0
  animatedEstatal.value = 0
  
  setTimeout(() => {
    animatedFederal.value = props.federal
  }, 200)
  
  setTimeout(() => {
    animatedEstatal.value = props.estatal
  }, 400)
}

watch([() => props.federal, () => props.estatal], () => {
  animateBars()
}, { immediate: false })

onMounted(() => {
  animateBars()
})
</script>

<style scoped>
.comparison-bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 24px;
  height: 100%;
  padding: 16px 0;
}

.bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-value {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.federal-value {
  color: #0F3759;
}

.estatal-value {
  color: #6B8FA3;
}

.bar-track {
  width: 48px;
  height: 100px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 6px;
  transition: height 1s ease-out;
}

.federal-fill {
  background: #0F3759;
}

.estatal-fill {
  background: #6B8FA3;
}

.bar-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.federal-dot {
  background: #0F3759;
}

.estatal-dot {
  background: #6B8FA3;
}

.label-text {
  font-size: 11px;
  color: #64748b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.separator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  gap: 4px;
}

.separator-line {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

.separator-text {
  font-size: 10px;
  color: #cbd5e1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>