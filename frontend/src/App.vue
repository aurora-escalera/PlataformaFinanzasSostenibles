<template>
  <div id="app">
    <TitleBarComponent 
      title="Plataforma del Índice de Finanzas Sostenibles Subnacional (IFSS)"
      lastUpdate="24 de septiembre de 2025"
    />

    <!-- SIN CAMBIOS en los handlers existentes, solo agregar active-filters-count y open-filters -->
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
import { ref, provide } from 'vue'
import HeaderComponent from '@modules/other/components/HeaderComponent.vue'
import TitleBarComponent from '@modules/other/components/TitleBarComponent.vue'
import DataViewToggleBar from '@modules/other/components/DataViewToggleBar.vue'
import { useDataToggle } from '@/composables/useDataToggle'

const { 
  updateFiltersState, 
  updateAvailableYears
} = useDataToggle()

const currentDataView = ref('subnacional')
const currentCurrency = ref('MXN')
const toggleAction = ref(null)

// NUEVO: Para filtros móviles
const routerViewRef = ref(null)
const activeFiltersCount = ref(0)

provide('toggleAction', toggleAction)

// NUEVO: Provide para que HomePage pueda recibir la acción de abrir filtros
const openFiltersAction = ref(null)
provide('openFiltersAction', openFiltersAction)

// --- Handlers EXISTENTES (sin cambios) ---
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

// Handler para abrir filtros
const handleOpenFilters = () => {
  console.log('📱 [App.vue] Abriendo drawer de filtros')
  openFiltersAction.value = { timestamp: Date.now() }
}

const handleFiltersCountChange = (count) => {
  activeFiltersCount.value = count
}
</script>