<!-- src/modules/qualitativeIndicators/components/subcomponents/ICIRow.vue -->
<template>
  <div class="ici-row">
    <!-- Icono -->
    <div class="icon-container">
      <!-- ICI General - Gráfica de barras -->
      <svg v-if="icon === 'barChart'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="8" y1="15" x2="8" y2="9"/>
        <line x1="12" y1="15" x2="12" y2="7"/>
        <line x1="16" y1="15" x2="16" y2="11"/>
      </svg>
      
      <!-- Consistencia - Lista con checks -->
      <svg v-else-if="icon === 'listCheck'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
        <line x1="10" y1="6" x2="21" y2="6"/>
        <line x1="10" y1="12" x2="21" y2="12"/>
        <line x1="10" y1="18" x2="21" y2="18"/>
        <path d="M3 6l2 2 4-4"/>
        <path d="M3 12l2 2 4-4"/>
        <path d="M3 18l2 2 4-4"/>
      </svg>
      
      <!-- Proyectos - Carpeta -->
      <svg v-else-if="icon === 'folder'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      
      <!-- Indicadores - Target -->
      <svg v-else-if="icon === 'target'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    </div>

    <!-- Label -->
    <span class="ici-label">{{ label }}</span>

    <!-- Barra -->
    <div class="progress-container">
      <div class="progress-track">
        <div 
          class="progress-fill" 
          :style="{ width: animatedWidth + '%' }"
        >
          <span class="progress-value">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'barChart'
  },
  label: {
    type: String,
    default: ''
  },
  value: {
    type: Number,
    default: 0
  },
  delay: {
    type: Number,
    default: 0
  }
})

const animatedWidth = ref(0)

const animateBar = () => {
  animatedWidth.value = 0
  setTimeout(() => {
    animatedWidth.value = props.value
  }, props.delay)
}

watch(() => props.value, () => {
  animateBar()
}, { immediate: false })

onMounted(() => {
  animateBar()
})
</script>

<style scoped>
.ici-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-container {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ici-label {
  width: 90px;
  flex-shrink: 0;
  font-size: 13px;
  color: #64748b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-container {
  flex: 1;
  min-width: 0;
}

.progress-track {
  height: 26px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #0F3759;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  transition: width 1s ease-out;
  min-width: 50px;
}

.progress-value {
  font-size: 12px;
  font-weight: 700;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>