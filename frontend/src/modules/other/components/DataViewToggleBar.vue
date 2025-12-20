<!-- src/modules/other/components/DataViewToggleBar.vue -->
<template>
  <div class="toggle-bar">
    <div class="toggle-bar-content">
      <!-- Toggle Vista -->
      <div class="toggle-section">
        <span class="toggle-label">Vista:</span>
        <div class="toggle-buttons">
          <button
            :class="['toggle-btn', { active: isFederalActive }]"
            @click="handleFederalClick"
          >
            <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Datos Regionales
          </button>
          
          <button
            :class="['toggle-btn', { active: isSubnacionalActive }]"
            @click="handleSubnacionalClick"
          >
            <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Datos Subnacionales
          </button>
        </div>
      </div>

      <!-- Contenedor derecho: Moneda + Descargas + Filtros (móvil) -->
      <div class="right-section">
        <!-- Indicador Moneda -->
        <div class="currency-section">
          <span class="currency-label">Moneda:</span>
          <div 
            class="currency-badge"
            :class="{ 'currency-usd': isFederalActive, 'currency-mxn': isSubnacionalActive }"
          >
            <span class="currency-name">{{ currencyName }}</span>
            <span class="currency-code">({{ currencyCode }})</span>
          </div>
        </div>

        <!-- SECCIÓN: Descargas -->
        <div class="downloads-section" ref="downloadsRef">
          <button 
            class="downloads-btn"
            :class="{ 'is-open': showDownloadsMenu }"
            @click.stop="toggleDownloadsMenu"
          >
            <svg class="downloads-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="downloads-text">Descargas</span>
            <svg class="chevron-icon" :class="{ 'rotated': showDownloadsMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu de Descargas -->
          <transition name="dropdown-fade">
            <div v-if="showDownloadsMenu" class="downloads-dropdown">
              <div class="dropdown-header">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Centro de Descargas</span>
              </div>

              <div class="dropdown-menu-items">
                <!-- 1. Datos Regionales -->
                <div 
                  class="menu-item"
                  @mouseenter="activeSubmenu = 'regional'"
                  @mouseleave="activeSubmenu = null"
                >
                  <div class="menu-item-content">
                    <svg class="menu-arrow-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <div class="menu-icon federal">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="menu-text">
                      <span class="menu-title">Datos Regionales</span>
                      <span class="menu-desc">IFS, Ingresos y Presupuestos por año</span>
                    </div>
                  </div>
                  
                  <!-- Submenú Regional -->
                  <transition name="submenu-fade">
                    <div v-if="activeSubmenu === 'regional'" class="submenu submenu-left">
                      <button 
                        class="submenu-item" 
                        @click="handleDownload('regional', 'xlsx')" 
                        :disabled="isExporting"
                      >
                        <span class="format-badge xlsx">XLS</span>
                        <span>Descargar Excel</span>
                      </button>
                      <button 
                        class="submenu-item" 
                        @click="handleDownload('regional', 'csv')" 
                        :disabled="isExporting"
                      >
                        <span class="format-badge csv">CSV</span>
                        <span>Descargar CSV</span>
                      </button>
                    </div>
                  </transition>
                </div>

                <!-- 2. Datos Subnacionales (con años dinámicos) -->
                <div 
                  class="menu-item"
                  @mouseenter="activeSubmenu = 'subnacional'"
                  @mouseleave="handleSubnacionalMouseLeave"
                >
                  <div class="menu-item-content">
                    <svg class="menu-arrow-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <div class="menu-icon subnacional">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div class="menu-text">
                      <span class="menu-title">Datos Subnacionales</span>
                      <span class="menu-desc">
                        {{ loadingYears ? 'Cargando años...' : `${availableYears.length} año(s) disponible(s)` }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Submenú Subnacional: Lista de años dinámicos -->
                  <transition name="submenu-fade">
                    <div 
                      v-if="activeSubmenu === 'subnacional'" 
                      class="submenu submenu-left submenu-years"
                      @mouseenter="keepSubnacionalOpen = true"
                      @mouseleave="keepSubnacionalOpen = false"
                    >
                      <div class="submenu-header">Seleccionar año</div>
                      
                      <!-- Loading state -->
                      <div v-if="loadingYears" class="submenu-loading">
                        <div class="spinner-tiny"></div>
                        <span>Cargando años...</span>
                      </div>
                      
                      <!-- Lista de años -->
                      <template v-else>
                        <div 
                          v-for="year in availableYears" 
                          :key="year"
                          class="year-item"
                          @mouseenter="activeYearSubmenu = year"
                          @mouseleave="activeYearSubmenu = null"
                        >
                          <div class="year-item-content">
                            <svg class="year-arrow-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <svg class="year-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{{ year }}</span>
                          </div>

                          <!-- Sub-submenú: Formatos -->
                          <transition name="submenu-fade">
                            <div v-if="activeYearSubmenu === year" class="submenu-formats submenu-formats-left">
                              <button 
                                class="submenu-item" 
                                @click="handleDownload('subnacional', 'xlsx', { year })" 
                                :disabled="isExporting"
                              >
                                <span class="format-badge xlsx">XLS</span>
                                <span>Descargar Excel</span>
                              </button>
                              <button 
                                class="submenu-item" 
                                @click="handleDownload('subnacional', 'csv', { year })" 
                                :disabled="isExporting"
                              >
                                <span class="format-badge csv">CSV</span>
                                <span>Descargar CSV</span>
                              </button>
                            </div>
                          </transition>
                        </div>
                        
                        <!-- Mensaje si no hay años -->
                        <div v-if="availableYears.length === 0" class="submenu-empty">
                          No hay años disponibles
                        </div>
                      </template>
                    </div>
                  </transition>
                </div>

                <!-- Separador -->
                <div class="menu-divider"></div>

                <!-- 3. Reporte Completo (con submenú para formato) -->
                <div 
                  class="menu-item menu-item-highlight"
                  @mouseenter="activeSubmenu = 'completo'"
                  @mouseleave="activeSubmenu = null"
                >
                  <div class="menu-item-content">
                    <svg class="menu-arrow-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <div class="menu-icon complete">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div class="menu-text">
                      <span class="menu-title">Reporte Completo</span>
                      <span class="menu-desc">Regional + Subnacional (todos los años)</span>
                    </div>
                  </div>

                  <!-- Submenú Reporte Completo -->
                  <transition name="submenu-fade">
                    <div v-if="activeSubmenu === 'completo'" class="submenu submenu-left">
                      <button 
                        class="submenu-item" 
                        @click="handleDownload('completo', 'xlsx')" 
                        :disabled="isExporting"
                      >
                        <span class="format-badge xlsx">XLS</span>
                        <span>Descargar Excel</span>
                      </button>
                      <button 
                        class="submenu-item" 
                        @click="handleDownload('completo', 'csv')" 
                        :disabled="isExporting"
                      >
                        <span class="format-badge csv">CSV</span>
                        <span>Descargar CSV</span>
                      </button>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- Loading indicator -->
              <div v-if="isExporting" class="export-loading">
                <div class="spinner-small"></div>
                <span>{{ exportProgress || 'Generando archivo...' }}</span>
              </div>

              <!-- Error indicator -->
              <div v-if="exportError" class="export-error">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ exportError }}</span>
              </div>

              <!-- Success indicator -->
              <div v-if="showSuccess" class="export-success">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>¡Descarga iniciada!</span>
              </div>
            </div>
          </transition>
        </div>

        <!-- Botón Filtros (SOLO MÓVIL) -->
        <button 
          class="filter-btn-mobile"
          @click="$emit('open-filters')"
        >
          <svg class="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span class="filter-text">Filtros</span>
          <span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDataToggle } from '@/composables/useDataToggle'
import { useYearFilter } from '@/composables/useYearFilter'
import { useDownloadCenter } from '@/composables/useDownloadCenter'

// ============================================================================
// COMPOSABLES
// ============================================================================
const { 
  isSubnacionalActive, 
  isFederalActive,
  setDataType,
  setCurrency,
  getSubnacionalClickFilters,
  getFederalClickFilters
} = useDataToggle()

const {
  availableYears: yearsFromComposable,
  loadingYears,
  fetchAvailableYears
} = useYearFilter()

const {
  handleDownload: executeDownload,
  isExporting: downloadExporting,
  exportError: downloadError,
  exportProgress: downloadProgress
} = useDownloadCenter()

// ============================================================================
// COMPUTED: Años disponibles
// ============================================================================
const availableYears = computed(() => {
  const years = yearsFromComposable.value || []
  return [...years].sort((a, b) => Number(b) - Number(a))
})

// ============================================================================
// PROPS & EMITS
// ============================================================================
defineProps({
  modelValue: {
    type: String,
    default: 'subnacional',
    validator: (value) => ['regional', 'subnacional', 'federal'].includes(value)
  },
  activeFiltersCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:modelValue',
  'click-federal',
  'click-subnacional',
  'download-request',
  'open-filters'
])

// ============================================================================
// STATE
// ============================================================================
const showDownloadsMenu = ref(false)
const activeSubmenu = ref(null)
const activeYearSubmenu = ref(null)
const keepSubnacionalOpen = ref(false)
const downloadsRef = ref(null)
const isExporting = ref(false)
const exportError = ref(null)
const exportProgress = ref('')
const showSuccess = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================
const currencyCode = computed(() => isFederalActive.value ? 'USD' : 'MXN')
const currencyName = computed(() => isFederalActive.value ? 'Dólares estadounidenses' : 'Pesos mexicanos')

// ============================================================================
// HANDLERS - Toggle
// ============================================================================
const handleFederalClick = () => {
  console.log('🔘 [Toggle] Click en "Datos Regionales"')
  const filters = getFederalClickFilters()
  setDataType('federal')
  setCurrency('usd')
  emit('update:modelValue', 'regional')
  emit('click-federal', filters)
}

const handleSubnacionalClick = () => {
  console.log('🔘 [Toggle] Click en "Datos Subnacionales"')
  const filters = getSubnacionalClickFilters()
  setDataType('subnacional')
  setCurrency('mxn')
  emit('update:modelValue', 'subnacional')
  emit('click-subnacional', filters)
}

// ============================================================================
// HANDLERS - Descargas
// ============================================================================
const toggleDownloadsMenu = async () => {
  showDownloadsMenu.value = !showDownloadsMenu.value
  
  if (showDownloadsMenu.value) {
    if (availableYears.value.length === 0 && !loadingYears.value) {
      console.log('📥 [Downloads] Cargando años disponibles...')
      await fetchAvailableYears()
      console.log('📥 [Downloads] Años cargados:', availableYears.value)
    }
  } else {
    activeSubmenu.value = null
    activeYearSubmenu.value = null
  }
}

const handleClickOutside = (event) => {
  if (downloadsRef.value && !downloadsRef.value.contains(event.target)) {
    showDownloadsMenu.value = false
    activeSubmenu.value = null
    activeYearSubmenu.value = null
  }
}

const handleSubnacionalMouseLeave = () => {
  setTimeout(() => {
    if (!keepSubnacionalOpen.value) {
      activeSubmenu.value = null
      activeYearSubmenu.value = null
    }
  }, 100)
}

const handleDownload = async (viewType, format, options = {}) => {
  console.log(`📥 [Toggle] Iniciando descarga: ${viewType} - ${format}`, options)
  
  isExporting.value = true
  exportError.value = null
  exportProgress.value = 'Preparando descarga...'
  showSuccess.value = false
  
  try {
    const success = await executeDownload(viewType, format, options)
    
    if (success) {
      console.log('✅ [Toggle] Descarga iniciada correctamente')
      showSuccess.value = true
      
      setTimeout(() => {
        showSuccess.value = false
      }, 2000)
    } else {
      console.error('❌ [Toggle] Error en la descarga:', downloadError.value)
      exportError.value = downloadError.value || 'Error al iniciar la descarga'
      
      setTimeout(() => {
        exportError.value = null
      }, 4000)
    }
    
    emit('download-request', { viewType, format, options, success })
    
  } catch (err) {
    console.error('❌ [Toggle] Error inesperado:', err)
    exportError.value = err.message || 'Error inesperado'
    
    setTimeout(() => {
      exportError.value = null
    }, 4000)
  } finally {
    isExporting.value = false
    exportProgress.value = ''
    
    setTimeout(() => {
      showDownloadsMenu.value = false
      activeSubmenu.value = null
      activeYearSubmenu.value = null
    }, 1500)
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  console.log('📅 [DataViewToggleBar] Cargando años disponibles...')
  await fetchAvailableYears()
  console.log('📅 [DataViewToggleBar] Años cargados:', availableYears.value)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ============================================
   ESTILOS BASE - DESKTOP
   ============================================ */
.toggle-bar {
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 24px;
}

.toggle-bar-content {
  max-width: 2000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.toggle-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-label {
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
}

.toggle-buttons {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
  color: #374151;
}

.toggle-btn:hover:not(.active) {
  background-color: #f9fafb;
}

.toggle-btn.active {
  background-color: #1e3a5f;
  color: #ffffff;
}

.toggle-btn:first-child {
  border-right: 1px solid #d1d5db;
}

.toggle-icon {
  width: 18px;
  height: 18px;
}

/* Right Section */
.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

/* Currency */
.currency-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.currency-label {
  font-size: 15px;
  color: #6b7280;
}

.currency-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.currency-badge.currency-mxn {
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
}

.currency-badge.currency-mxn .currency-name {
  font-size: 15px;
  font-weight: 600;
  color: #b45309;
}

.currency-badge.currency-mxn .currency-code {
  font-size: 15px;
  color: #d97706;
}

.currency-badge.currency-usd {
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
}

.currency-badge.currency-usd .currency-name {
  font-size: 15px;
  font-weight: 600;
  color: #047857;
}

.currency-badge.currency-usd .currency-code {
  font-size: 15px;
  color: #059669;
}

/* Downloads Section */
.downloads-section {
  position: relative;
}

.downloads-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.downloads-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.downloads-btn.is-open {
  background-color: #1e3a5f;
  color: white;
  border-color: #1e3a5f;
}

.downloads-icon {
  width: 18px;
  height: 18px;
}

.chevron-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* ============================================
   BOTÓN FILTROS MÓVIL - OCULTO POR DEFECTO
   ============================================ */
.filter-btn-mobile {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
}

.filter-btn-mobile:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.filter-btn-mobile:active {
  background-color: #f3f4f6;
}

.filter-icon {
  width: 18px;
  height: 18px;
}

.filter-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* Dropdown */
.downloads-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 340px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: visible;
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px 12px 0 0;
}

.dropdown-header svg {
  width: 18px;
  height: 18px;
}

.dropdown-menu-items {
  padding: 8px 0;
}

/* Menu Items */
.menu-item {
  position: relative;
  cursor: pointer;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  transition: background-color 0.15s ease;
}

.menu-item:hover .menu-item-content {
  background-color: #f9fafb;
}

.menu-item-highlight .menu-item-content {
  background-color: #f0fdf4;
}

.menu-item-highlight:hover .menu-item-content {
  background-color: #dcfce7;
}

.menu-arrow-left {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.15s ease, color 0.15s ease;
}

.menu-item:hover .menu-arrow-left {
  color: #6b7280;
  transform: translateX(-2px);
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon svg {
  width: 18px;
  height: 18px;
}

.menu-icon.federal { background: #dbeafe; color: #2563eb; }
.menu-icon.subnacional { background: #fef3c7; color: #d97706; }
.menu-icon.complete { background: #d1fae5; color: #059669; }

.menu-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.menu-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.menu-desc {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 16px;
}

/* Submenu */
.submenu {
  position: absolute;
  top: 0;
  width: 180px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
  padding: 6px 0;
  z-index: 1001;
}

.submenu-left {
  right: 100%;
  left: auto;
  margin-right: 4px;
}

.submenu-years {
  width: 200px;
}

.submenu-header {
  padding: 8px 14px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 4px;
}

.submenu-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #6b7280;
  font-size: 12px;
}

.submenu-empty {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
}

.spinner-tiny {
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6b7280;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
  background: transparent;
  color: #374151;
  text-align: left;
}

.submenu-item:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.submenu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Year Items */
.year-item {
  position: relative;
}

.year-item-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  transition: background-color 0.15s ease;
}

.year-item:hover .year-item-content {
  background-color: #f3f4f6;
}

.year-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.year-arrow-left {
  width: 14px;
  height: 14px;
  color: #9ca3af;
  transition: transform 0.15s ease;
}

.year-item:hover .year-arrow-left {
  transform: translateX(-2px);
}

/* Sub-submenu for formats */
.submenu-formats {
  position: absolute;
  top: 0;
  width: 170px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
  padding: 6px 0;
  z-index: 1002;
}

.submenu-formats-left {
  right: 100%;
  left: auto;
  margin-right: 4px;
}

/* Format Badges */
.format-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 3px;
  color: white;
  flex-shrink: 0;
}

.format-badge.xlsx { background: #107c41; }
.format-badge.csv { background: #6366f1; }

/* Export States */
.export-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: #fef3c7;
  color: #92400e;
  font-size: 13px;
  font-weight: 500;
  border-radius: 0 0 12px 12px;
}

.export-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  border-radius: 0 0 12px 12px;
}

.export-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: #ecfdf5;
  color: #059669;
  font-size: 13px;
  font-weight: 500;
  border-radius: 0 0 12px 12px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #fcd34d;
  border-top: 2px solid #92400e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.submenu-fade-enter-active,
.submenu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.submenu-fade-enter-from,
.submenu-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

/* ============================================
   RESPONSIVE: LAPTOPS PEQUEÑAS (≤1200px)
   ============================================ */
@media (max-width: 1200px) {
  .toggle-bar-content {
    flex-wrap: wrap;
  }
  
  .right-section {
    margin-left: 0;
  }
  
  .toggle-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .currency-name {
    font-size: 14px;
  }
  
  .currency-code {
    font-size: 14px;
  }
  
  .downloads-btn {
    padding: 8px 14px;
    font-size: 14px;
  }
}

/* ============================================
   RESPONSIVE: TABLETS LANDSCAPE (≤1024px)
   ============================================ */
@media (max-width: 1024px) {
  .toggle-bar {
    padding: 10px 20px;
  }
  
  .toggle-bar-content {
    gap: 16px;
  }
  
  .toggle-label,
  .currency-label {
    font-size: 14px;
  }
  
  .toggle-btn {
    padding: 8px 14px;
    font-size: 13px;
    gap: 6px;
  }
  
  .toggle-icon {
    width: 16px;
    height: 16px;
  }
  
  .currency-badge {
    padding: 6px 12px;
  }
  
  .currency-name {
    font-size: 13px;
  }
  
  .currency-code {
    font-size: 13px;
  }
  
  .downloads-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .downloads-icon {
    width: 16px;
    height: 16px;
  }
}

/* ============================================
   RESPONSIVE: TABLETS PORTRAIT (≤768px)
   ============================================ */
@media (max-width: 768px) {
  .toggle-bar {
    padding: 12px 16px;
  }
  
  .toggle-bar-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .toggle-section {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .toggle-label {
    font-size: 13px;
  }
  
  .toggle-buttons {
    width: 100%;
  }
  
  .toggle-btn {
    flex: 1;
    justify-content: center;
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .right-section {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .currency-section {
    flex: 1;
    min-width: 0;
  }
  
  .currency-label {
    display: none;
  }
  
  .currency-badge {
    padding: 8px 12px;
    width: 100%;
    justify-content: center;
  }
  
  .currency-name {
    font-size: 12px;
  }
  
  .currency-code {
    font-size: 12px;
  }
  
  .downloads-section {
    flex: 1;
  }
  
  .downloads-btn {
    width: 100%;
    justify-content: center;
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .downloads-text {
    display: none;
  }
  
  .downloads-dropdown {
    width: calc(100vw - 32px);
    right: -8px;
  }
  
  .submenu,
  .submenu-formats {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin-right: 0;
    right: auto;
    width: 200px;
  }
  
  /* MOSTRAR BOTÓN DE FILTROS EN MÓVIL */
  .filter-btn-mobile {
    display: flex;
    flex: 1;
    justify-content: center;
  }
}

/* ============================================
   RESPONSIVE: MÓVILES GRANDES (≤480px)
   ============================================ */
@media (max-width: 480px) {
  .toggle-bar {
    padding: 10px 12px;
  }
  
  .toggle-bar-content {
    gap: 10px;
  }
  
  .toggle-section {
    gap: 6px;
  }
  
  .toggle-label {
    font-size: 12px;
  }
  
  .toggle-btn {
    padding: 8px 10px;
    font-size: 12px;
    gap: 5px;
  }
  
  .toggle-icon {
    width: 14px;
    height: 14px;
  }
  
  .right-section {
    gap: 8px;
  }
  
  .currency-badge {
    padding: 6px 10px;
  }
  
  .currency-name {
    font-size: 11px;
  }
  
  .currency-code {
    font-size: 11px;
  }
  
  .downloads-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .downloads-icon {
    width: 18px;
    height: 18px;
  }
  
  .chevron-icon {
    display: none;
  }
  
  .downloads-dropdown {
    width: calc(100vw - 24px);
    right: -6px;
  }
  
  .dropdown-header {
    padding: 12px 14px;
    font-size: 13px;
  }
  
  .menu-item-content {
    padding: 10px 14px;
  }
  
  .menu-icon {
    width: 32px;
    height: 32px;
  }
  
  .menu-title {
    font-size: 13px;
  }
  
  .menu-desc {
    font-size: 10px;
  }
  
  /* Filtros móvil */
  .filter-btn-mobile {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .filter-text {
    display: none;
  }
  
  .filter-icon {
    width: 18px;
    height: 18px;
  }
  
  .filter-badge {
    top: -4px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    font-size: 10px;
  }
}

/* ============================================
   RESPONSIVE: MÓVILES MEDIANOS (≤400px)
   ============================================ */
@media (max-width: 400px) {
  .toggle-bar {
    padding: 8px 10px;
  }
  
  .toggle-btn {
    padding: 7px 8px;
    font-size: 11px;
  }
  
  .toggle-icon {
    width: 13px;
    height: 13px;
  }
  
  .currency-badge {
    padding: 5px 8px;
    gap: 4px;
  }
  
  .currency-name {
    font-size: 10px;
  }
  
  .currency-code {
    font-size: 10px;
  }
  
  .downloads-btn {
    padding: 7px 10px;
  }
  
  .downloads-icon {
    width: 16px;
    height: 16px;
  }
  
  .downloads-dropdown {
    width: calc(100vw - 20px);
  }
  
  .submenu,
  .submenu-formats {
    width: 180px;
  }
  
  .filter-btn-mobile {
    padding: 7px 10px;
  }
  
  .filter-icon {
    width: 16px;
    height: 16px;
  }
}

/* ============================================
   RESPONSIVE: MÓVILES PEQUEÑOS (≤360px)
   ============================================ */
@media (max-width: 360px) {
  .toggle-bar {
    padding: 8px;
  }
  
  .toggle-bar-content {
    gap: 8px;
  }
  
  .toggle-btn {
    padding: 6px 6px;
    font-size: 10px;
    gap: 4px;
  }
  
  .toggle-icon {
    width: 12px;
    height: 12px;
  }
  
  .right-section {
    gap: 6px;
  }
  
  .currency-badge {
    padding: 5px 6px;
  }
  
  .currency-name {
    font-size: 9px;
  }
  
  .currency-code {
    display: none;
  }
  
  .downloads-btn {
    padding: 6px 8px;
  }
  
  .downloads-dropdown {
    width: calc(100vw - 16px);
    right: -4px;
  }
  
  .dropdown-header {
    padding: 10px 12px;
    font-size: 12px;
  }
  
  .menu-item-content {
    padding: 8px 12px;
    gap: 10px;
  }
  
  .menu-icon {
    width: 28px;
    height: 28px;
  }
  
  .menu-icon svg {
    width: 14px;
    height: 14px;
  }
  
  .menu-title {
    font-size: 12px;
  }
  
  .menu-desc {
    font-size: 9px;
  }
  
  .filter-btn-mobile {
    padding: 6px 8px;
  }
  
  .filter-icon {
    width: 14px;
    height: 14px;
  }
}

/* ============================================
   RESPONSIVE: MÓVILES MUY PEQUEÑOS (≤320px)
   ============================================ */
@media (max-width: 320px) {
  .toggle-bar {
    padding: 6px;
  }
  
  .toggle-btn {
    padding: 5px 5px;
    font-size: 9px;
  }
  
  .toggle-icon {
    width: 11px;
    height: 11px;
  }
  
  .currency-badge {
    padding: 4px 5px;
  }
  
  .currency-name {
    font-size: 8px;
  }
  
  .downloads-btn {
    padding: 5px 6px;
  }
  
  .downloads-icon {
    width: 14px;
    height: 14px;
  }
  
  .downloads-dropdown {
    width: calc(100vw - 12px);
  }
  
  .submenu,
  .submenu-formats {
    width: 160px;
  }
  
  .submenu-item {
    padding: 8px 10px;
    font-size: 11px;
  }
  
  .filter-btn-mobile {
    padding: 5px 6px;
  }
  
  .filter-icon {
    width: 12px;
    height: 12px;
  }
}
</style>