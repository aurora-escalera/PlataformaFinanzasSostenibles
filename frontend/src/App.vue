<!-- src/App.vue -->
<!-- ✅ ACTUALIZADO: Agregado manejo de descargas centralizadas -->
<template>
  <div id="app">
    <!-- Barra de título con botones de acción -->
    <TitleBarComponent 
      title="Plataforma del Índice de Finanzas Sostenibles Subnacional (IFSS)"
      lastUpdate="24 de septiembre de 2025"
    />

    <!-- Barra de toggle Vista + Descargas -->
    <DataViewToggleBar 
      @click-federal="handleToggleFederalClick"
      @click-subnacional="handleToggleSubnacionalClick"
      @download-request="handleDownloadRequest"
    />

    <!-- Contenido principal -->
    <main class="app-main">
      <router-view 
        @filters-state-change="handleFiltersStateChange"
        @available-years-change="handleAvailableYearsChange"
      />
    </main>

    <!-- Toast de notificación de descarga -->
    <transition name="toast-fade">
      <div v-if="downloadToast.show" class="download-toast" :class="downloadToast.type">
        <div class="toast-icon">
          <svg v-if="downloadToast.type === 'success'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="downloadToast.type === 'error'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div v-else class="spinner-toast"></div>
        </div>
        <span class="toast-message">{{ downloadToast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import TitleBarComponent from '@modules/other/components/TitleBarComponent.vue'
import DataViewToggleBar from '@modules/other/components/DataViewToggleBar.vue'
import { useDataToggle } from '@/composables/useDataToggle'
import { useDownloadCenter } from '@/composables/useDownloadCenter'

// ============================================================================
// COMPOSABLES
// ============================================================================
const { 
  updateFiltersState,
  updateAvailableYears,
  getFederalClickFilters,
  getSubnacionalClickFilters,
  filtersState
} = useDataToggle()

const {
  handleDownload,
  isExporting,
  exportError,
  exportProgress
} = useDownloadCenter()

// ============================================================================
// ESTADO
// ============================================================================

// Ref reactivo para la acción del toggle (para comunicar con HomePage)
const toggleAction = ref(null)

// Estado del toast de descarga
const downloadToast = ref({
  show: false,
  type: 'loading', // 'loading', 'success', 'error'
  message: ''
})

// ============================================================================
// HANDLERS: Recibir estado de HomePage
// ============================================================================

/**
 * Recibe cambios en el estado de los filtros desde HomePage
 */
const handleFiltersStateChange = (state) => {
  console.log('📡 [App] Recibido estado de filtros:', state)
  updateFiltersState(state)
}

/**
 * Recibe cambios en los años disponibles desde HomePage
 */
const handleAvailableYearsChange = (years) => {
  console.log('📅 [App] Años disponibles actualizados:', years)
  updateAvailableYears(years)
}

// ============================================================================
// HANDLERS: Click en toggle
// ============================================================================

/**
 * Handler para click en "Datos Regionales" (Federal)
 */
const handleToggleFederalClick = (filters) => {
  console.log('🔘 [App] Click en toggle "Datos Regionales" (Federal)')
  toggleAction.value = { 
    type: 'federal', 
    filters, 
    timestamp: Date.now() 
  }
}

/**
 * Handler para click en "Datos Subnacionales"
 */
const handleToggleSubnacionalClick = (filters) => {
  console.log('🔘 [App] Click en toggle "Datos Subnacionales"')
  toggleAction.value = { 
    type: 'subnacional', 
    filters, 
    timestamp: Date.now() 
  }
}

// ============================================================================
// HANDLERS: Descargas
// ============================================================================

/**
 * Muestra un toast de notificación
 */
const showToast = (type, message, duration = 3000) => {
  downloadToast.value = { show: true, type, message }
  
  if (type !== 'loading') {
    setTimeout(() => {
      downloadToast.value.show = false
    }, duration)
  }
}

/**
 * Handler para solicitudes de descarga desde el DataViewToggleBar
 */
const handleDownloadRequest = async ({ viewType, format }) => {
  console.log(`📥 [App] Solicitud de descarga recibida: ${viewType} - ${format}`)
  
  // Mostrar toast de carga
  const viewNames = {
    'regional': 'Datos Regionales',
    'subnacional': 'Datos Subnacionales',
    'historico': 'Serie Histórica',
    'completo': 'Reporte Completo'
  }
  showToast('loading', `Generando ${viewNames[viewType] || viewType}...`)

  // Obtener opciones adicionales del estado actual de filtros
  const options = {
    year: filtersState.value?.selectedYear || null,
    entity: filtersState.value?.selectedEntity || null
  }

  try {
    const success = await handleDownload(viewType, format, options)
    
    if (success) {
      showToast('success', '¡Archivo descargado correctamente!')
    } else {
      showToast('error', exportError.value || 'Error al generar el archivo')
    }
  } catch (err) {
    console.error('❌ [App] Error en descarga:', err)
    showToast('error', 'Error inesperado al generar el archivo')
  }
}

// ============================================================================
// PROVIDE: Pasar acciones del toggle a HomePage via provide/inject
// ============================================================================

provide('toggleAction', toggleAction)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding: 0;
}

/* ============================================================================
   TOAST DE DESCARGA
   ============================================================================ */

.download-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  font-size: 14px;
  font-weight: 500;
}

.download-toast.loading {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.download-toast.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.download-toast.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.toast-icon svg {
  width: 20px;
  height: 20px;
}

.spinner-toast {
  width: 20px;
  height: 20px;
  border: 2px solid #fcd34d;
  border-top: 2px solid #92400e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.toast-message {
  white-space: nowrap;
}

/* Transición del toast */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>