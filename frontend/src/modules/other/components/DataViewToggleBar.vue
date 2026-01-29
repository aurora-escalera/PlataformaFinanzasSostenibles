<!-- src/modules/other/components/DataViewToggleBar.vue -->
<!-- ✅ CORREGIDO: Submenús funcionan con click en móvil + currency-badge ajustado -->
<template>
  <div class="toggle-bar">
    <div class="toggle-bar-content">
      <!-- Fila superior: Toggle Vista + Moneda -->
      <div class="top-row">
        <!-- Toggle Vista -->
        <div class="toggle-section">
          <span class="toggle-label">Vista:</span>
          <div class="toggle-buttons">
            <div class="toggle-btn-wrapper">
              <button
                :class="['toggle-btn', { active: isFederalActive }]"
                @click="handleFederalClick"
              >
                <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="btn-text-full">Datos Regionales</span>
                <span class="btn-text-short">Regionales</span>
              </button>
              <span class="custom-tooltip">Da clic aquí para ver la vista de datos regionales</span>
            </div>
            
            <div class="toggle-btn-wrapper">
              <button
                :class="['toggle-btn', { active: isSubnacionalActive }]"
                @click="handleSubnacionalClick"
              >
                <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span class="btn-text-full">Datos Subnacionales</span>
                <span class="btn-text-short">Subnacionales</span>
              </button>
              <span class="custom-tooltip">Da clic aquí para ver la vista de datos subnacionales</span>
            </div>
          </div>
        </div>

        <!-- Indicador Moneda -->
        <div class="currency-section">
          <span class="currency-label">Moneda:</span>
          <span class="currency-label-mobile">Currency:</span>
          <div 
            class="currency-badge"
            :class="{ 'currency-usd': isFederalActive, 'currency-mxn': isSubnacionalActive }"
          >
            <span class="currency-name">{{ currencyName }}</span>
            <span class="currency-code">({{ currencyCode }})</span>
          </div>
        </div>
      </div>

      <!-- Fila inferior: Descargas + Filtros -->
      <div class="bottom-row">
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
                  :class="{ 'menu-item-expanded': activeSubmenu === 'regional' }"
                  @mouseenter="!isMobile && (activeSubmenu = 'regional')" 
                  @mouseleave="!isMobile && (activeSubmenu = null)"
                  @click="isMobile && toggleSubmenu('regional')"
                >
                  <div class="menu-item-content">
                    <svg class="menu-arrow" :class="{ 'rotated': activeSubmenu === 'regional' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
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
                  
                  <!-- Submenu inline para móvil, absoluto para desktop -->
                  <transition name="submenu-expand">
                    <div v-if="activeSubmenu === 'regional'" class="submenu">
                      <button class="submenu-item" @click.stop="handleDownload('regional', 'xlsx')" :disabled="isExporting">
                        <span class="format-badge xlsx">XLS</span>
                        <span>Descargar Excel</span>
                      </button>
                      <button class="submenu-item" @click.stop="handleDownload('regional', 'csv')" :disabled="isExporting">
                        <span class="format-badge csv">CSV</span>
                        <span>Descargar CSV</span>
                      </button>
                    </div>
                  </transition>
                </div>

                <!-- 2. Datos Subnacionales -->
                <div 
                  class="menu-item"
                  :class="{ 'menu-item-expanded': activeSubmenu === 'subnacional' }"
                  @mouseenter="!isMobile && (activeSubmenu = 'subnacional')" 
                  @mouseleave="!isMobile && handleSubnacionalMouseLeave()"
                  @click="isMobile && toggleSubmenu('subnacional')"
                >
                  <div class="menu-item-content">
                    <svg class="menu-arrow" :class="{ 'rotated': activeSubmenu === 'subnacional' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <div class="menu-icon subnacional">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div class="menu-text">
                      <span class="menu-title">Datos Subnacionales</span>
                      <span class="menu-desc">{{ loadingYears ? 'Cargando años...' : `${availableYears.length} año(s) disponible(s)` }}</span>
                    </div>
                  </div>
                  
                  <transition name="submenu-expand">
                    <div v-if="activeSubmenu === 'subnacional'" class="submenu submenu-years" @mouseenter="!isMobile && (keepSubnacionalOpen = true)" @mouseleave="!isMobile && (keepSubnacionalOpen = false)">
                      <div class="submenu-header">Seleccionar año</div>
                      <div v-if="loadingYears" class="submenu-loading">
                        <div class="spinner-tiny"></div>
                        <span>Cargando años...</span>
                      </div>
                      <template v-else>
                        <div 
                          v-for="year in availableYears" 
                          :key="year" 
                          class="year-item"
                          :class="{ 'year-item-expanded': activeYearSubmenu === year }"
                          @mouseenter="!isMobile && (activeYearSubmenu = year)" 
                          @mouseleave="!isMobile && (activeYearSubmenu = null)"
                          @click.stop="isMobile && toggleYearSubmenu(year)"
                        >
                          <div class="year-item-content">
                            <svg class="year-arrow" :class="{ 'rotated': activeYearSubmenu === year }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <svg class="year-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{{ year }}</span>
                          </div>
                          <transition name="submenu-expand">
                            <div v-if="activeYearSubmenu === year" class="submenu-formats">
                              <button class="submenu-item" @click.stop="handleDownload('subnacional', 'xlsx', { year })" :disabled="isExporting">
                                <span class="format-badge xlsx">XLS</span>
                                <span>Descargar Excel</span>
                              </button>
                              <button class="submenu-item" @click.stop="handleDownload('subnacional', 'csv', { year })" :disabled="isExporting">
                                <span class="format-badge csv">CSV</span>
                                <span>Descargar CSV</span>
                              </button>
                            </div>
                          </transition>
                        </div>
                        <div v-if="availableYears.length === 0" class="submenu-empty">No hay años disponibles</div>
                      </template>
                    </div>
                  </transition>
                </div>

                <div class="menu-divider"></div>

                <!-- 3. Reporte Completo -->
                <div 
                  class="menu-item menu-item-highlight"
                  :class="{ 'menu-item-expanded': activeSubmenu === 'completo' }"
                  @mouseenter="!isMobile && (activeSubmenu = 'completo')" 
                  @mouseleave="!isMobile && (activeSubmenu = null)"
                  @click="isMobile && toggleSubmenu('completo')"
                >
                  <div class="menu-item-content">
                    <svg class="menu-arrow" :class="{ 'rotated': activeSubmenu === 'completo' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
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
                  
                  <transition name="submenu-expand">
                    <div v-if="activeSubmenu === 'completo'" class="submenu">
                      <button class="submenu-item" @click.stop="handleDownload('completo', 'xlsx')" :disabled="isExporting">
                        <span class="format-badge xlsx">XLS</span>
                        <span>Descargar Excel</span>
                      </button>
                      <button class="submenu-item" @click.stop="handleDownload('completo', 'csv')" :disabled="isExporting">
                        <span class="format-badge csv">CSV</span>
                        <span>Descargar CSV</span>
                      </button>
                    </div>
                  </transition>
                </div>
              </div>

              <div v-if="isExporting" class="export-loading">
                <div class="spinner-small"></div>
                <span>{{ exportProgress || 'Generando archivo...' }}</span>
              </div>
              <div v-if="exportError" class="export-error">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ exportError }}</span>
              </div>
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
        <button class="filter-btn-mobile" @click="$emit('open-filters')">
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

const { isSubnacionalActive, isFederalActive, setDataType, setCurrency, getSubnacionalClickFilters, getFederalClickFilters } = useDataToggle()
const { availableYears: yearsFromComposable, loadingYears, fetchAvailableYears } = useYearFilter()
const { handleDownload: executeDownload, isExporting: downloadExporting, exportError: downloadError, exportProgress: downloadProgress } = useDownloadCenter()

const availableYears = computed(() => {
  const years = yearsFromComposable.value || []
  return [...years].sort((a, b) => Number(b) - Number(a))
})

defineProps({
  modelValue: { type: String, default: 'subnacional', validator: (value) => ['regional', 'subnacional', 'federal'].includes(value) },
  activeFiltersCount: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue', 'click-federal', 'click-subnacional', 'download-request', 'open-filters'])

const showDownloadsMenu = ref(false)
const activeSubmenu = ref(null)
const activeYearSubmenu = ref(null)
const keepSubnacionalOpen = ref(false)
const downloadsRef = ref(null)
const isExporting = ref(false)
const exportError = ref(null)
const exportProgress = ref('')
const showSuccess = ref(false)

// ✅ NUEVO: Detectar si es móvil
const isMobile = ref(false)

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const currencyCode = computed(() => isFederalActive.value ? 'USD' : 'MXN')
const currencyName = computed(() => isFederalActive.value ? 'Dólares estadounidenses' : 'Pesos mexicanos')

const handleFederalClick = () => {
  const filters = getFederalClickFilters()
  setDataType('federal')
  setCurrency('usd')
  emit('update:modelValue', 'regional')
  emit('click-federal', filters)
}

const handleSubnacionalClick = () => {
  const filters = getSubnacionalClickFilters()
  setDataType('subnacional')
  setCurrency('mxn')
  emit('update:modelValue', 'subnacional')
  emit('click-subnacional', filters)
}

const toggleDownloadsMenu = async () => {
  showDownloadsMenu.value = !showDownloadsMenu.value
  if (showDownloadsMenu.value) {
    if (availableYears.value.length === 0 && !loadingYears.value) {
      await fetchAvailableYears()
    }
  } else {
    activeSubmenu.value = null
    activeYearSubmenu.value = null
  }
}

// ✅ NUEVO: Toggle para submenús en móvil
const toggleSubmenu = (name) => {
  if (activeSubmenu.value === name) {
    activeSubmenu.value = null
    activeYearSubmenu.value = null
  } else {
    activeSubmenu.value = name
    activeYearSubmenu.value = null
  }
}

// ✅ NUEVO: Toggle para años en móvil
const toggleYearSubmenu = (year) => {
  if (activeYearSubmenu.value === year) {
    activeYearSubmenu.value = null
  } else {
    activeYearSubmenu.value = year
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
  isExporting.value = true
  exportError.value = null
  exportProgress.value = 'Preparando descarga...'
  showSuccess.value = false
  
  try {
    const success = await executeDownload(viewType, format, options)
    if (success) {
      showSuccess.value = true
      setTimeout(() => { showSuccess.value = false }, 2000)
    } else {
      exportError.value = downloadError.value || 'Error al iniciar la descarga'
      setTimeout(() => { exportError.value = null }, 4000)
    }
    emit('download-request', { viewType, format, options, success })
  } catch (err) {
    exportError.value = err.message || 'Error inesperado'
    setTimeout(() => { exportError.value = null }, 4000)
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

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', checkIsMobile)
  checkIsMobile()
  await fetchAvailableYears()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkIsMobile)
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
  box-sizing: border-box;
}

.toggle-bar-content {
  max-width: 2000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex: 1;
}

.bottom-row {
  display: flex;
  align-items: center;
  gap: 16px;
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
  overflow: visible;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toggle-btn-wrapper {
  position: relative;
  display: inline-flex;
}

.toggle-btn-wrapper:first-child .toggle-btn {
  border-right: 1px solid #d1d5db;
  border-radius: 8px 0 0 8px;
}

.toggle-btn-wrapper:last-child .toggle-btn {
  border-radius: 0 8px 8px 0;
}

.custom-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: #1e3a5f;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.3);
  pointer-events: none;
}

.custom-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1e3a5f;
}

.toggle-btn-wrapper:hover .custom-tooltip {
  opacity: 1;
  visibility: visible;
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

.toggle-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-text-short {
  display: none;
}

.currency-label-mobile {
  display: none;
}

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
  white-space: nowrap;
}

.currency-badge.currency-mxn {
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
}

.currency-badge.currency-mxn .currency-name,
.currency-badge.currency-mxn .currency-code {
  font-size: 15px;
  color: #b45309;
}

.currency-badge.currency-mxn .currency-name {
  font-weight: 600;
}

.currency-badge.currency-usd {
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
}

.currency-badge.currency-usd .currency-name,
.currency-badge.currency-usd .currency-code {
  font-size: 15px;
  color: #047857;
}

.currency-badge.currency-usd .currency-name {
  font-weight: 600;
}

/* Downloads */
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

/* Filter Button */
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
  overflow: hidden;
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
}

.dropdown-header svg {
  width: 18px;
  height: 18px;
}

.dropdown-menu-items {
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;
}

.menu-item {
  cursor: pointer;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  transition: background-color 0.15s ease;
}

.menu-item:hover > .menu-item-content {
  background-color: #f9fafb;
}

.menu-item-highlight > .menu-item-content {
  background-color: #f0fdf4;
}

.menu-item-highlight:hover > .menu-item-content {
  background-color: #dcfce7;
}

/* ✅ Flecha que rota */
.menu-arrow {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.2s ease, color 0.2s ease;
}

.menu-arrow.rotated {
  transform: rotate(90deg);
  color: #1e3a5f;
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
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 16px;
}

/* ============================================
   SUBMENUS - DESKTOP (absoluto a la izquierda)
   ============================================ */
.submenu {
  position: absolute;
  top: 0;
  right: 100%;
  margin-right: 4px;
  width: 180px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
  padding: 6px 0;
  z-index: 1001;
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

.year-item:hover > .year-item-content {
  background-color: #f3f4f6;
}

.year-arrow {
  width: 14px;
  height: 14px;
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.year-arrow.rotated {
  transform: rotate(90deg);
  color: #1e3a5f;
}

.year-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.submenu-formats {
  position: absolute;
  top: 0;
  right: 100%;
  margin-right: 4px;
  width: 170px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
  padding: 6px 0;
  z-index: 1002;
}

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

.submenu-expand-enter-active,
.submenu-expand-leave-active {
  transition: all 0.2s ease;
}

.submenu-expand-enter-from,
.submenu-expand-leave-to {
  opacity: 0;
}

/* ============================================
   RESPONSIVE: TABLETS (≤1024px)
   ============================================ */
@media (max-width: 1024px) {
  .toggle-bar {
    padding: 10px 20px;
  }
  
  .toggle-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
  
  .toggle-icon {
    width: 16px;
    height: 16px;
  }
  
  .currency-badge {
    padding: 6px 12px;
  }
  
  .currency-name, .currency-code {
    font-size: 13px;
  }
  
  .downloads-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .custom-tooltip {
    display: none;
  }
   .currency-badge.currency-mxn .currency-code,
  .currency-badge.currency-usd .currency-code {
    font-size: 11px;
  }
}

/* ============================================
   ✅ MÓVIL (≤768px) - SUBMENÚS INLINE + CURRENCY AJUSTADO
   ============================================ */
@media (max-width: 768px) {
  .toggle-bar {
    padding: 10px 16px;
  }
  
  .toggle-bar-content {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .top-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
  }
  
  .toggle-section {
    flex: none;
    gap: 8px;
  }
  
  .toggle-label {
    font-size: 12px;
  }
  
  .toggle-btn {
    padding: 8px 10px;
    font-size: 12px;
    gap: 4px;
  }
  
  .toggle-icon {
    width: 14px;
    height: 14px;
  }
  
  .btn-text-full {
    display: none;
  }
  
  .btn-text-short {
    display: inline;
    font-size: 11px;
  }
  
  .currency-section {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
  }
  
  .currency-label {
    display: none;
  }
  
  .currency-label-mobile {
    display: inline;
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
  }
    .currency-badge.currency-mxn .currency-code,
  .currency-badge.currency-usd .currency-code {
    font-size: 10px;
  }
  
  /* ✅ AJUSTE: currency-badge del tamaño del label */
  .currency-badge {
    padding: 2px 4px;
    border-radius: 3px;
  }
  
  .currency-name {
    display: none;
  }
  
  .currency-code {
    font-size: 11px;
    font-weight: 500;
  }
  
  .bottom-row {
    display: flex;
    flex-direction: row;
    gap: 10px;
    width: 100%;
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
    display: inline;
  }
  
  /* ✅ Dropdown ocupa todo el ancho */
  .downloads-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 70vh;
    border-radius: 16px 16px 0 0;
    z-index: 1001;
  }
  
  .dropdown-menu-items {
    max-height: 50vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* ✅ SUBMENÚS INLINE (no absolutos) */
  .submenu {
    position: relative;
    top: auto;
    right: auto;
    left: auto;
    margin: 0;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    border: none;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 0;
  }
  
  .submenu-years {
    width: 100%;
  }
  
  .submenu-item {
    padding: 12px 20px 12px 48px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .submenu-item:last-child {
    border-bottom: none;
  }
  
  .submenu-header {
    padding: 10px 20px 10px 48px;
    background: #f3f4f6;
  }
  
  /* Year items inline */
  .year-item {
    position: relative;
  }
  
  .year-item-content {
    padding: 12px 20px 12px 48px;
  }
  
  .submenu-formats {
    position: relative;
    top: auto;
    right: auto;
    left: auto;
    margin: 0;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    border: none;
    border-top: 1px solid #e5e7eb;
    background: #f0f0f0;
    padding: 0;
  }
  
  .submenu-formats .submenu-item {
    padding: 12px 20px 12px 72px;
  }
  
  /* Flecha apunta hacia abajo cuando está expandido */
  .menu-arrow {
    transition: transform 0.2s ease;
  }
  
  .menu-arrow.rotated {
    transform: rotate(90deg);
  }
  
  .year-arrow.rotated {
    transform: rotate(90deg);
  }
  
  /* Filtros móvil */
  .filter-btn-mobile {
    display: flex;
    flex: 1;
    justify-content: center;
  }
}

/* ============================================
   ✅ iPhone 14 Pro Max (430px)
   ============================================ */
@media (max-width: 430px) {
  .toggle-bar {
    padding: 10px 14px;
  }
  
  .top-row {
    gap: 8px;
  }
  
  .toggle-section {
    gap: 6px;
  }
  
  .toggle-label {
    font-size: 11px;
  }
  
  .toggle-btn {
    padding: 8px 9px;
    font-size: 11px;
  }
  
  .toggle-icon {
    width: 13px;
    height: 13px;
  }
  
  .btn-text-short {
    font-size: 10px;
  }
  
  .currency-label-mobile {
    font-size: 10px;
  }
  
  /* ✅ AJUSTE: currency-badge */
  .currency-badge {
    padding: 2px 3px;
    border-radius: 3px;
  }
  
  .currency-code {
    font-size: 10px;
  }
  
  .bottom-row {
    gap: 8px;
  }
  
  .downloads-btn {
    padding: 9px 12px;
    font-size: 12px;
  }
  
  .filter-btn-mobile {
    padding: 9px 12px;
    font-size: 12px;
  }

    .currency-badge.currency-mxn .currency-code,
  .currency-badge.currency-usd .currency-code {
    font-size: 10px;
  }
}

/* ============================================
   ✅ Samsung Galaxy S20 Ultra (412px)
   ============================================ */
@media (max-width: 412px) {
  .toggle-bar {
    padding: 9px 12px;
  }
  
  .toggle-label {
    font-size: 10px;
  }
  
  .toggle-btn {
    padding: 7px 8px;
    font-size: 10px;
  }
  
  .toggle-icon {
    width: 12px;
    height: 12px;
  }
  
  .btn-text-short {
    font-size: 10px;
  }
  
  .currency-label-mobile {
    font-size: 10px;
  }
  
  /* ✅ AJUSTE: currency-badge */
  .currency-badge {
    padding: 1px 3px;
    border-radius: 2px;
  }
  
  .currency-code {
    font-size: 10px;
  }
  
  .downloads-btn {
    padding: 8px 10px;
    font-size: 11px;
  }
  
  .downloads-text {
    display: none;
  }
  
  .chevron-icon {
    display: none;
  }
  
  .filter-btn-mobile {
    padding: 8px 10px;
    font-size: 11px;
  }
  
  .filter-text {
    display: none;
  }
  
  .menu-item-content {
    padding: 10px 14px;
    gap: 10px;
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
  
  .submenu-item {
    padding: 10px 16px 10px 42px;
    font-size: 12px;
  }
  
  .year-item-content {
    padding: 10px 16px 10px 42px;
  }
  
  .submenu-formats .submenu-item {
    padding: 10px 16px 10px 60px;
  }
}

/* ============================================
   ✅ iPhone 12 Pro (390px)
   ============================================ */
@media (max-width: 390px) {
  .toggle-bar {
    padding: 8px 10px;
  }
  
  .toggle-bar-content {
    gap: 8px;
  }
  
  .toggle-label {
    font-size: 10px;
  }
  
  .toggle-btn {
    padding: 6px 7px;
    font-size: 10px;
    gap: 3px;
  }
  
  .toggle-icon {
    width: 11px;
    height: 11px;
  }
  
  .btn-text-short {
    font-size: 9px;
  }
  
  .currency-label-mobile {
    font-size: 9px;
  }
  
  /* ✅ AJUSTE: currency-badge */
  .currency-badge {
    padding: 1px 2px;
    border-radius: 2px;
  }
  
  .currency-code {
    font-size: 9px;
  }
  
  .bottom-row {
    gap: 6px;
  }
  
  .downloads-btn {
    padding: 7px 8px;
    border-radius: 6px;
  }
  
  .downloads-icon {
    width: 15px;
    height: 15px;
  }
  
  .filter-btn-mobile {
    padding: 7px 8px;
    border-radius: 6px;
  }
  
  .filter-icon {
    width: 15px;
    height: 15px;
  }
  
  .downloads-dropdown {
    border-radius: 12px 12px 0 0;
  }
  
  .dropdown-header {
    padding: 12px 14px;
    font-size: 13px;
  }
  
  .menu-item-content {
    padding: 9px 12px;
    gap: 8px;
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
  
  .submenu-item {
    padding: 9px 14px 9px 36px;
    font-size: 11px;
  }
  
  .year-item-content {
    padding: 9px 14px 9px 36px;
    font-size: 12px;
  }
  
  .submenu-formats .submenu-item {
    padding: 9px 14px 9px 52px;
  }
}

/* ============================================
   ✅ Samsung Galaxy S8+ (360px)
   ============================================ */
@media (max-width: 360px) {
  .toggle-bar {
    padding: 7px 8px;
  }
  
  .toggle-bar-content {
    gap: 6px;
  }
  
  .toggle-label {
    font-size: 9px;
  }
  
  .toggle-btn {
    padding: 5px 6px;
    font-size: 9px;
    gap: 2px;
  }
  
  .toggle-icon {
    width: 10px;
    height: 10px;
  }
  
  .btn-text-short {
    font-size: 8px;
  }
  
  .currency-label-mobile {
    font-size: 8px;
  }
  
  /* ✅ AJUSTE: currency-badge */
  .currency-badge {
    padding: 1px 2px;
    border-radius: 2px;
  }
  
  .currency-code {
    font-size: 8px;
  }
  
  .bottom-row {
    gap: 5px;
  }
  
  .downloads-btn {
    padding: 6px 7px;
    border-radius: 5px;
  }
  
  .downloads-icon {
    width: 14px;
    height: 14px;
  }
  
  .filter-btn-mobile {
    padding: 6px 7px;
    border-radius: 5px;
  }
  
  .filter-icon {
    width: 14px;
    height: 14px;
  }
  
  .filter-badge {
    top: -3px;
    right: -3px;
    min-width: 14px;
    height: 14px;
    font-size: 8px;
  }
  
  .downloads-dropdown {
    max-height: 65vh;
    border-radius: 10px 10px 0 0;
  }
  
  .dropdown-header {
    padding: 10px 12px;
    font-size: 12px;
  }
  
  .menu-item-content {
    padding: 8px 10px;
    gap: 6px;
  }
  
  .menu-arrow {
    width: 14px;
    height: 14px;
  }
  
  .menu-icon {
    width: 26px;
    height: 26px;
  }
  
  .menu-icon svg {
    width: 13px;
    height: 13px;
  }
  
  .menu-title {
    font-size: 11px;
  }
  
  .menu-desc {
    font-size: 8px;
  }
  
  .submenu-item {
    padding: 8px 12px 8px 32px;
    font-size: 10px;
  }
  
  .submenu-header {
    padding: 8px 12px 8px 32px;
    font-size: 9px;
  }
  
  .year-item-content {
    padding: 8px 12px 8px 32px;
    font-size: 11px;
  }
  
  .year-arrow {
    width: 12px;
    height: 12px;
  }
  
  .year-icon {
    width: 14px;
    height: 14px;
  }
  
  .submenu-formats .submenu-item {
    padding: 8px 12px 8px 48px;
  }
  
  .format-badge {
    font-size: 8px;
    padding: 2px 4px;
  }
}

/* ============================================
   ✅ Muy pequeños (320px)
   ============================================ */
@media (max-width: 320px) {
  .toggle-bar {
    padding: 6px;
  }
  
  .toggle-bar-content {
    gap: 5px;
  }
  
  .toggle-label {
    font-size: 8px;
  }
  
  .toggle-btn {
    padding: 4px 5px;
    font-size: 8px;
  }
  
  .toggle-icon {
    width: 9px;
    height: 9px;
  }
  
  .btn-text-short {
    font-size: 7px;
  }
  
  .currency-label-mobile {
    font-size: 7px;
  }
  
  /* ✅ AJUSTE: currency-badge */
  .currency-badge {
    padding: 1px 2px;
    border-radius: 2px;
  }
  
  .currency-code {
    font-size: 7px;
  }
  
  .downloads-btn {
    padding: 5px 6px;
    border-radius: 4px;
  }
  
  .downloads-icon {
    width: 12px;
    height: 12px;
  }
  
  .filter-btn-mobile {
    padding: 5px 6px;
    border-radius: 4px;
  }
  
  .filter-icon {
    width: 12px;
    height: 12px;
  }
  
  .downloads-dropdown {
    max-height: 60vh;
    border-radius: 8px 8px 0 0;
  }
  
  .dropdown-header {
    padding: 8px 10px;
    font-size: 11px;
  }
  
  .menu-item-content {
    padding: 7px 8px;
    gap: 5px;
  }
  
  .menu-icon {
    width: 22px;
    height: 22px;
  }
  
  .menu-icon svg {
    width: 11px;
    height: 11px;
  }
  
  .menu-title {
    font-size: 10px;
  }
  
  .menu-desc {
    font-size: 7px;
  }
  
  .submenu-item {
    padding: 7px 10px 7px 28px;
    font-size: 9px;
  }
  
  .year-item-content {
    padding: 7px 10px 7px 28px;
    font-size: 10px;
  }
  
  .submenu-formats .submenu-item {
    padding: 7px 10px 7px 42px;
  }
}

/* ============================================
   ✅ Evitar scroll horizontal
   ============================================ */
@media (max-width: 768px) {
  .toggle-bar,
  .toggle-bar-content,
  .top-row,
  .bottom-row,
  .toggle-section,
  .downloads-section {
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
  }
}
</style>