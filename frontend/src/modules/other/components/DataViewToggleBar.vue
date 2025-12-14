<!-- src/modules/other/components/DataViewToggleBar.vue -->
<!-- ✅ ACTUALIZADO: Dropdown con submenús en hover -->
<template>
  <div class="toggle-bar">
    <div class="toggle-bar-content">
      <!-- Toggle Vista -->
      <div class="toggle-section">
        <span class="toggle-label">Vista:</span>
        <div class="toggle-buttons">
          <!-- Botón Datos Regionales (Federal) -->
          <button
            :class="['toggle-btn', { active: isFederalActive }]"
            @click="handleFederalClick"
          >
            <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Datos Regionales
          </button>
          
          <!-- Botón Datos Subnacionales -->
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

      <!-- Contenedor derecho: Descargas + Moneda -->
      <div class="right-section">
        <!-- SECCIÓN: Descargas con submenús -->
        <div class="downloads-section" ref="downloadsRef">
        <button 
          class="downloads-btn"
          :class="{ 'is-open': showDownloadsMenu }"
          @click.stop="toggleDownloadsMenu"
        >
          <svg class="downloads-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Descargas</span>
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
                  <div class="menu-icon federal">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="menu-text">
                    <span class="menu-title">Datos Regionales</span>
                    <span class="menu-desc">IFS, Ingresos y Presupuestos por año</span>
                  </div>
                  <svg class="menu-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <!-- Submenú -->
                <transition name="submenu-fade">
                  <div v-if="activeSubmenu === 'regional'" class="submenu">
                    <button class="submenu-item" @click="handleDownload('regional', 'xlsx')" :disabled="isExporting">
                      <span class="format-badge xlsx">XLS</span>
                      <span>Descargar Excel</span>
                    </button>
                    <button class="submenu-item" @click="handleDownload('regional', 'csv')" :disabled="isExporting">
                      <span class="format-badge csv">CSV</span>
                      <span>Descargar CSV</span>
                    </button>
                  </div>
                </transition>
              </div>

              <!-- 2. Datos Subnacionales -->
              <div 
                class="menu-item"
                @mouseenter="activeSubmenu = 'subnacional'"
                @mouseleave="activeSubmenu = null"
              >
                <div class="menu-item-content">
                  <div class="menu-icon subnacional">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div class="menu-text">
                    <span class="menu-title">Datos Subnacionales</span>
                    <span class="menu-desc">IFS, Ingresos y Presupuestos por año</span>
                  </div>
                  <svg class="menu-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <!-- Submenú -->
                <transition name="submenu-fade">
                  <div v-if="activeSubmenu === 'subnacional'" class="submenu">
                    <button class="submenu-item" @click="handleDownload('subnacional', 'xlsx')" :disabled="isExporting">
                      <span class="format-badge xlsx">XLS</span>
                      <span>Descargar Excel</span>
                    </button>
                    <button class="submenu-item" @click="handleDownload('subnacional', 'csv')" :disabled="isExporting">
                      <span class="format-badge csv">CSV</span>
                      <span>Descargar CSV</span>
                    </button>
                  </div>
                </transition>
              </div>

              <!-- 3. Serie Histórica -->
              <div 
                class="menu-item"
                @mouseenter="activeSubmenu = 'historico'"
                @mouseleave="activeSubmenu = null"
              >
                <div class="menu-item-content">
                  <div class="menu-icon historico">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div class="menu-text">
                    <span class="menu-title">Serie Histórica</span>
                    <span class="menu-desc">Evolución histórica del IFS, IS, IT, IIC, PS, PIC</span>
                  </div>
                  <svg class="menu-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <!-- Submenú -->
                <transition name="submenu-fade">
                  <div v-if="activeSubmenu === 'historico'" class="submenu">
                    <button class="submenu-item" @click="handleDownload('historico', 'xlsx')" :disabled="isExporting">
                      <span class="format-badge xlsx">XLS</span>
                      <span>Descargar Excel</span>
                    </button>
                    <button class="submenu-item" @click="handleDownload('historico', 'csv')" :disabled="isExporting">
                      <span class="format-badge csv">CSV</span>
                      <span>Descargar CSV</span>
                    </button>
                  </div>
                </transition>
              </div>

              <!-- 4. Cualitativos Estatales -->
              <div 
                class="menu-item"
                @mouseenter="activeSubmenu = 'cualitativos'"
                @mouseleave="activeSubmenu = null"
              >
                <div class="menu-item-content">
                  <div class="menu-icon cualitativos">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div class="menu-text">
                    <span class="menu-title">Cualitativos Estatales</span>
                    <span class="menu-desc">Ambientales, económicos y sociales</span>
                  </div>
                  <svg class="menu-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <!-- Submenú -->
                <transition name="submenu-fade">
                  <div v-if="activeSubmenu === 'cualitativos'" class="submenu">
                    <button class="submenu-item" @click="handleDownload('cualitativos', 'xlsx')" :disabled="isExporting">
                      <span class="format-badge xlsx">XLS</span>
                      <span>Descargar Excel</span>
                    </button>
                    <button class="submenu-item" @click="handleDownload('cualitativos', 'csv')" :disabled="isExporting">
                      <span class="format-badge csv">CSV</span>
                      <span>Descargar CSV</span>
                    </button>
                  </div>
                </transition>
              </div>

              <!-- Separador -->
              <div class="menu-divider"></div>

              <!-- 5. Reporte Completo (sin submenú, acción directa) -->
              <div 
                class="menu-item menu-item-highlight"
                @click="handleDownload('completo', 'xlsx')"
              >
                <div class="menu-item-content">
                  <div class="menu-icon complete">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div class="menu-text">
                    <span class="menu-title">Reporte Completo</span>
                    <span class="menu-desc">Todos los datos en Excel (múltiples hojas)</span>
                  </div>
                  <span class="format-badge xlsx menu-badge">XLS</span>
                </div>
              </div>
            </div>

            <!-- Loading indicator -->
            <div v-if="isExporting" class="export-loading">
              <div class="spinner-small"></div>
              <span>Generando archivo...</span>
            </div>
          </div>
        </transition>
      </div>

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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDataToggle } from '@/composables/useDataToggle'

// ============================================================================
// COMPOSABLE
// ============================================================================
const { 
  isSubnacionalActive, 
  isFederalActive,
  setDataType,
  setCurrency,
  getSubnacionalClickFilters,
  getFederalClickFilters
} = useDataToggle()

// ============================================================================
// PROPS
// ============================================================================
const props = defineProps({
  modelValue: {
    type: String,
    default: 'subnacional',
    validator: (value) => ['regional', 'subnacional', 'federal'].includes(value)
  }
})

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits([
  'update:modelValue',
  'click-federal',
  'click-subnacional',
  'download-request'
])

// ============================================================================
// STATE - Descargas
// ============================================================================
const showDownloadsMenu = ref(false)
const activeSubmenu = ref(null)
const downloadsRef = ref(null)
const isExporting = ref(false)

// ============================================================================
// COMPUTED - Moneda
// ============================================================================
const currencyCode = computed(() => {
  return isFederalActive.value ? 'USD' : 'MXN'
})

const currencyName = computed(() => {
  return isFederalActive.value ? 'Dólares estadounidenses' : 'Pesos mexicanos'
})

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
const toggleDownloadsMenu = () => {
  showDownloadsMenu.value = !showDownloadsMenu.value
  if (!showDownloadsMenu.value) {
    activeSubmenu.value = null
  }
}

const handleClickOutside = (event) => {
  if (downloadsRef.value && !downloadsRef.value.contains(event.target)) {
    showDownloadsMenu.value = false
    activeSubmenu.value = null
  }
}

const handleDownload = async (viewType, format) => {
  console.log(`📥 [Toggle] Solicitud de descarga: ${viewType} en formato ${format}`)
  
  isExporting.value = true
  
  // Emitir evento para que el componente padre maneje la descarga
  emit('download-request', { viewType, format })
  
  // Simular delay y cerrar menú
  setTimeout(() => {
    isExporting.value = false
    showDownloadsMenu.value = false
    activeSubmenu.value = null
  }, 1500)
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
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

/* ============================================================================
   CONTENEDOR DERECHO (Descargas + Moneda)
   ============================================================================ */

.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

/* ============================================================================
   SECCIÓN DE DESCARGAS
   ============================================================================ */

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

/* ============================================================================
   DROPDOWN MENU
   ============================================================================ */

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

/* ============================================================================
   MENU ITEMS
   ============================================================================ */

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

.menu-icon.federal {
  background: #dbeafe;
  color: #2563eb;
}

.menu-icon.subnacional {
  background: #fef3c7;
  color: #d97706;
}

.menu-icon.historico {
  background: #ede9fe;
  color: #7c3aed;
}

.menu-icon.cualitativos {
  background: #fce7f3;
  color: #db2777;
}

.menu-icon.complete {
  background: #d1fae5;
  color: #059669;
}

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

.menu-arrow {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.15s ease, color 0.15s ease;
}

.menu-item:hover .menu-arrow {
  color: #6b7280;
  transform: translateX(2px);
}

.menu-badge {
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 16px;
}

/* ============================================================================
   SUBMENU
   ============================================================================ */

.submenu {
  position: absolute;
  left: 100%;
  top: 0;
  width: 180px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
  padding: 6px 0;
  margin-left: 4px;
  z-index: 1001;
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

/* ============================================================================
   FORMAT BADGES
   ============================================================================ */

.format-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 3px;
  color: white;
  flex-shrink: 0;
}

.format-badge.xlsx {
  background: #107c41;
}

.format-badge.csv {
  background: #6366f1;
}

/* ============================================================================
   EXPORT LOADING
   ============================================================================ */

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

/* ============================================================================
   TRANSITIONS
   ============================================================================ */

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
  transform: translateX(-8px);
}

/* ============================================================================
   RESPONSIVE
   ============================================================================ */

@media (max-width: 1200px) {
  .toggle-bar-content {
    flex-wrap: wrap;
  }
  
  .right-section {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .toggle-bar-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .toggle-buttons {
    width: 100%;
  }
  
  .toggle-btn {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .right-section {
    width: 100%;
    justify-content: space-between;
  }
  
  .downloads-dropdown {
    width: calc(100vw - 48px);
    right: -12px;
  }
  
  .submenu {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin-left: 0;
    width: 200px;
  }
}
</style>