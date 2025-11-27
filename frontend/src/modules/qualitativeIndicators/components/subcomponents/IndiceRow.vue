<!-- src/modules/qualitativeIndicators/components/subcomponents/IndiceRow.vue -->
<template>
  <div class="indice-row">
    <!-- Icono -->
    <div class="icon-container">
      <!-- IGOPP - Edificio gobierno -->
      <svg v-if="icon === 'government'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
        <path d="M3 21h18"/>
        <path d="M5 21V7l7-4 7 4v14"/>
        <path d="M9 21v-6h6v6"/>
      </svg>
      
      <!-- BIPE - Checkbox -->
      <svg v-else-if="icon === 'checkbox'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
      
      <!-- ITDIF - Documento con búsqueda -->
      <svg v-else-if="icon === 'search'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <circle cx="11" cy="14" r="3"/>
        <path d="m14 17-1.5-1.5"/>
      </svg>
    </div>

    <!-- Label y Barra -->
    <div class="content">
      <div class="content-header">
        <span class="indice-label">{{ label }}</span>
        <span class="indice-value">{{ value }}</span>
      </div>
      <div class="progress-track">
        <div 
          class="progress-fill" 
          :style="{ width: animatedWidth + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'government'
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
.indice-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid #f1f5f9;
  transition: box-shadow 0.2s ease;
}

.indice-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.icon-container {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.indice-label {
  font-size: 13px;
  font-weight: 600;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.indice-value {
  font-size: 16px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-track {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #0F3759;
  border-radius: 3px;
  transition: width 1s ease-out;
}
</style>