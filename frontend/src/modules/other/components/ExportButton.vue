<!-- src/components/ExportButton.vue -->
<template>
  <div class="export-button-container" ref="containerRef">
    <!-- Botón principal -->
    <button 
      class="export-btn"
      :class="{ 
        'is-loading': isExporting,
        'is-disabled': disabled || !hasData,
        'btn-small': size === 'small',
        'btn-icon-only': iconOnly
      }"
      :disabled="disabled || !hasData || isExporting"
      @click="toggleDropdown"
      :title="iconOnly ? 'Exportar datos' : ''"
    >
      <span class="export-icon">
        <svg v-if="!isExporting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span v-else class="spinner-mini"></span>
      </span>
      <span v-if="!iconOnly" class="export-label">{{ buttonLabel }}</span>
      <span v-if="!iconOnly" class="dropdown-arrow" :class="{ 'is-open': showDropdown }">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </span>
    </button>

    <!-- Dropdown de opciones -->
    <transition name="dropdown-fade">
      <div v-if="showDropdown" class="export-dropdown" :class="{ 'dropdown-left': dropdownPosition === 'left' }">
        <button 
          class="dropdown-item"
          @click="handleExport('xlsx')"
        >
          <span class="format-icon xlsx-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="#107c41"/>
              <text x="6" y="16" font-size="8" fill="white" font-weight="bold">XLS</text>
            </svg>
          </span>
          <span class="format-info">
            <span class="format-name">Excel (.xlsx)</span>
            <span class="format-desc">Con múltiples hojas</span>
          </span>
        </button>
        
        <button 
          class="dropdown-item"
          @click="handleExport('csv')"
        >
          <span class="format-icon csv-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="#6366f1"/>
              <text x="5" y="16" font-size="8" fill="white" font-weight="bold">CSV</text>
            </svg>
          </span>
          <span class="format-info">
            <span class="format-name">CSV (.csv)</span>
            <span class="format-desc">Texto plano</span>
          </span>
        </button>
      </div>
    </transition>

    <!-- Toast de éxito -->
    <transition name="toast-fade">
      <div v-if="showSuccess" class="export-toast success">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>Archivo descargado</span>
      </div>
    </transition>

    <!-- Toast de error -->
    <transition name="toast-fade">
      <div v-if="errorMessage" class="export-toast error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // Si hay datos disponibles
  hasData: {
    type: Boolean,
    default: true
  },
  // Etiqueta del botón
  label: {
    type: String,
    default: 'Exportar'
  },
  // Deshabilitar el botón
  disabled: {
    type: Boolean,
    default: false
  },
  // Tamaño: 'normal' | 'small'
  size: {
    type: String,
    default: 'normal'
  },
  // Solo mostrar icono
  iconOnly: {
    type: Boolean,
    default: false
  },
  // Posición del dropdown: 'right' | 'left'
  dropdownPosition: {
    type: String,
    default: 'right'
  }
})

const emit = defineEmits(['export'])

const showDropdown = ref(false)
const containerRef = ref(null)
const isExporting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

const buttonLabel = computed(() => {
  if (isExporting.value) return 'Exportando...'
  return props.label
})

const toggleDropdown = () => {
  if (props.disabled || !props.hasData || isExporting.value) return
  showDropdown.value = !showDropdown.value
}

const closeDropdown = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

const handleExport = async (format) => {
  showDropdown.value = false
  isExporting.value = true
  errorMessage.value = ''
  
  try {
    // Emitir evento al padre para que maneje la exportación
    emit('export', format)
    
    // Mostrar toast de éxito después de un pequeño delay
    setTimeout(() => {
      isExporting.value = false
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 2000)
    }, 500)
    
  } catch (err) {
    isExporting.value = false
    errorMessage.value = err.message || 'Error al exportar'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  }
}

// Exponer método para indicar error desde el padre
const setError = (message) => {
  isExporting.value = false
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

const setLoading = (loading) => {
  isExporting.value = loading
}

defineExpose({ setError, setLoading })

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.export-button-container {
  position: relative;
  display: inline-block;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.3);
}

.export-btn:hover:not(.is-disabled):not(.is-loading) {
  background: linear-gradient(135deg, #2d5a87 0%, #3d6a97 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.4);
}

.export-btn.is-disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.export-btn.is-loading {
  cursor: wait;
}

.export-btn.btn-small {
  padding: 6px 10px;
  font-size: 12px;
}

.export-btn.btn-icon-only {
  padding: 8px;
  border-radius: 8px;
}

.export-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.spinner-mini {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.dropdown-arrow {
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  margin-left: 2px;
}

.dropdown-arrow.is-open {
  transform: rotate(180deg);
}

/* Dropdown */
.export-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 200px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  z-index: 1000;
}

.export-dropdown.dropdown-left {
  right: auto;
  left: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item:first-child {
  border-bottom: 1px solid #e5e7eb;
}

.format-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}

.format-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.format-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.format-desc {
  font-size: 11px;
  color: #6b7280;
}

/* Toast messages */
.export-toast {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.export-toast.success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.export-toast.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>