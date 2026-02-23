<!-- src/App.vue -->
<template>
  <div id="app">
    <TitleBarComponent 
      title="Plataforma del Índice de Finanzas Sostenibles Subnacional (IFSS)"
      lastUpdate="24 de septiembre de 2025"
    />

    <DataViewToggleBar 
      v-model="currentDataView"
      :currency="currentCurrency"
      :active-filters-count="activeFiltersCount"
      @click-federal="handleFederalClick"
      @click-subnacional="handleSubnacionalClick"
      @open-filters="handleOpenFilters"
    />

    <main class="app-main">
      <router-view 
        ref="routerViewRef"
        @filters-state-change="handleFiltersStateChange"
        @available-years-change="handleAvailableYearsChange"
        @filters-count-change="handleFiltersCountChange"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue'
import TitleBarComponent from '@/modules/other/components/TitleBarComponent.vue'
import DataViewToggleBar from '@/modules/other/components/DataViewToggleBar.vue'
import { useDataToggle } from '@/composables/useDataToggle'

const { 
  updateFiltersState, 
  updateAvailableYears
} = useDataToggle()

const currentDataView = ref('subnacional')
const currentCurrency = ref('MXN')
const toggleAction = ref(null)

const routerViewRef = ref(null)
const activeFiltersCount = ref(0)

provide('toggleAction', toggleAction)

const openFiltersAction = ref(null)
provide('openFiltersAction', openFiltersAction)

// ============================================
// SISTEMA DE ESCALA GLOBAL
// ============================================
const appScale = ref(0.80)
provide('appScale', appScale)

const calculateScale = () => {
  const width = window.innerWidth
  if (width >= 2560) return 1
  if (width >= 1920) return 0.92
  if (width >= 1600) return 0.85
  if (width >= 1440) return 0.70
  if (width >= 1280) return 0.70
  if (width >= 769) return 0.70
  return 1
}

const updateScale = () => {
  const newScale = calculateScale()
  appScale.value = newScale
  document.documentElement.style.setProperty('--app-scale', newScale)
}

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})

// ============================================
// HANDLERS
// ============================================
const handleFederalClick = (filters) => {
  console.log('🔘 [App.vue] Click en Datos Regionales, filtros:', filters)
  currentDataView.value = 'regional'
  toggleAction.value = { 
    type: 'federal', 
    filters, 
    timestamp: Date.now() 
  }
}

const handleSubnacionalClick = (filters) => {
  console.log('🔘 [App.vue] Click en Datos Subnacionales, filtros:', filters)
  currentDataView.value = 'subnacional'
  toggleAction.value = { 
    type: 'subnacional', 
    filters, 
    timestamp: Date.now() 
  }
}

const handleFiltersStateChange = (state) => {
  console.log('📡 [App.vue] Recibido estado de filtros:', state)
  updateFiltersState(state)
}

const handleAvailableYearsChange = (years) => {
  console.log('📅 [App.vue] Recibido años disponibles:', years)
  updateAvailableYears(years)
}

const handleOpenFilters = () => {
  console.log('📱 [App.vue] Abriendo drawer de filtros')
  openFiltersAction.value = { timestamp: Date.now() }
}

const handleFiltersCountChange = (count) => {
  activeFiltersCount.value = count
}
</script>

<style>
/* ============================================
   🎯 SISTEMA DE ESCALADO CON ZOOM
   ============================================ */

:root {
  --app-scale: 0.80;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  overflow-x: hidden;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  min-height: 100vh;
}

/* ============================================
   ✅ USAR ZOOM EN VEZ DE TRANSFORM
   ============================================ */
#app {
  zoom: var(--app-scale);
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (min-width: 2560px) {
  :root { --app-scale: 1; }
}

@media (min-width: 1920px) and (max-width: 2559px) {
  :root { --app-scale: 0.92; }
}

@media (min-width: 1600px) and (max-width: 1919px) {
  :root { --app-scale: 0.85; }
}

/* ✅ FIX: era "max-width: px" (roto), corregido a 1599px */
@media (min-width: 1440px) and (max-width: 1599px) {
  :root { --app-scale: 0.80; }
}

@media (min-width: 900px) and (max-width: 1439px) {
  :root { --app-scale: 0.70; }
}

/* ============================================
   SCROLL HORIZONTAL PARA SCALE 0.70
   (769px - 1439px)
   ============================================ */
@media (min-width: 769px) and (max-width: 1439px) {
  html, body {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  #app {
    min-width: 1280px;
  }
}

@media (max-width: 769px) {
  :root { --app-scale: 1; }
  #app {
    zoom: 1;
  }
}

/* ============================================
   FIREFOX: No soporta zoom, usar transform
   ============================================ */
@-moz-document url-prefix() {
  #app {
    transform: scale(var(--app-scale));
    transform-origin: top left;
    width: calc(100% / var(--app-scale));
    min-height: calc(100vh / var(--app-scale));
  }
  
  @media (max-width: 1023px) {
    #app {
      transform: none;
      width: 100%;
      min-height: 100vh;
    }
  }
}

/* ============================================
   TELEPORTS - SIN ESCALA
   ============================================ */

body > .map-tooltip-compact,
body > [class*="tooltip"],
body > [class*="Tooltip"],
body > [role="tooltip"] {
  zoom: 1 !important;
}

body > .downloads-dropdown,
body > .dropdown-menu,
body > [class*="dropdown"],
body > [role="menu"] {
  zoom: 1 !important;
}

body > .mobile-overlay,
body > .mobile-drawer,
body > .modal,
body > [role="dialog"],
body > [class*="modal"],
body > [class*="overlay"] {
  zoom: 1 !important;
  position: fixed !important;
  width: 100vw !important;
  height: 100vh !important;
  top: 0 !important;
  left: 0 !important;
}

body > .popover,
body > [class*="popover"] {
  zoom: 1 !important;
}

body > .toast,
body > .notification,
body > [role="alert"] {
  zoom: 1 !important;
}

/* ============================================
   FIX: Tooltip del mapa - Más pequeño
   ============================================ */
body > .map-tooltip-compact {
  font-size: 11px;
  padding: 8px 10px;
  min-width: 90px;
  border-radius: 8px;
}

body > .map-tooltip-compact .tooltip-color-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

body > .map-tooltip-compact .tooltip-state-name {
  font-size: 12px;
}

body > .map-tooltip-compact .tooltip-ifss-value,
body > .map-tooltip-compact .tooltip-year-value {
  font-size: 11px;
}

body > .map-tooltip-compact .tooltip-ifss-label,
body > .map-tooltip-compact .tooltip-year-label {
  font-size: 9px;
}

body > .map-tooltip-compact .tooltip-classification-bar {
  font-size: 10px;
  margin-top: 6px;
  padding-top: 6px;
}

/* ============================================
   FIX: Tooltips de gráficas - DESKTOP
   ============================================ */

.linear-chart-container,
.area-chart-container {
  overflow: visible !important;
}

.linear-chart-container .chart-wrapper,
.area-chart-container .chart-wrapper {
  overflow: visible !important;
}

.linear-chart-container .tooltip-container,
.area-chart-container .tooltip-container {
  padding: 12px 16px !important;
  min-width: 180px !important;
  max-width: 280px !important;
  width: max-content !important;
  border-radius: 10px !important;
  white-space: nowrap !important;
  overflow: visible !important;
}

.linear-chart-container .tooltip-header,
.area-chart-container .tooltip-header {
  margin-bottom: 8px !important;
  padding-bottom: 6px !important;
}

.linear-chart-container .tooltip-year-label,
.area-chart-container .tooltip-year-label {
  font-size: 14px !important;
}

.linear-chart-container .tooltip-content,
.area-chart-container .tooltip-content {
  gap: 6px !important;
}

.linear-chart-container .tooltip-item,
.area-chart-container .tooltip-item {
  font-size: 13px !important;
  gap: 8px !important;
}

.linear-chart-container .tooltip-color-indicator,
.area-chart-container .tooltip-color-indicator {
  width: 10px !important;
  height: 10px !important;
  border-radius: 3px !important;
}

.linear-chart-container .tooltip-variable-name,
.area-chart-container .tooltip-variable-name {
  font-size: 12px !important;
  white-space: nowrap !important;
}

.linear-chart-container .tooltip-variable-value,
.area-chart-container .tooltip-variable-value {
  font-size: 13px !important;
}

.linear-chart-container .tooltip-sub-item,
.area-chart-container .tooltip-sub-item {
  padding-left: 18px !important;
}

.linear-chart-container .tooltip-sub-item .tooltip-variable-name,
.area-chart-container .tooltip-sub-item .tooltip-variable-name {
  font-size: 11px !important;
}

.linear-chart-container .tooltip-sub-item .tooltip-variable-value,
.area-chart-container .tooltip-sub-item .tooltip-variable-value {
  font-size: 12px !important;
}

.linear-chart-container .tooltip-separator,
.area-chart-container .tooltip-separator {
  margin: 5px 0 !important;
}


</style>

<style scoped>
.app-main {
  width: 100%;
  min-height: calc(100vh - 200px);
}
</style>