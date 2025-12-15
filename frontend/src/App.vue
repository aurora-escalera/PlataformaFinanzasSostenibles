<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Barra de título con botones de acción -->
    <TitleBarComponent 
      title="Plataforma del Índice de Finanzas Sostenibles Subnacional (IFSS)"
      lastUpdate="24 de septiembre de 2025"
    />

    <!-- Barra de toggle Vista/Moneda -->
    <DataViewToggleBar 
      v-model="currentDataView"
      :currency="currentCurrency"
      @click-federal="handleFederalClick"
      @click-subnacional="handleSubnacionalClick"
    />

    <!-- Contenido principal -->
    <main class="app-main">
      <router-view 
        @filters-state-change="handleFiltersStateChange"
        @available-years-change="handleAvailableYearsChange"
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

// Composable para el toggle
const { 
  updateFiltersState, 
  updateAvailableYears
} = useDataToggle()

// Estado del toggle de vista
const currentDataView = ref('subnacional')

// Estado de la moneda
const currentCurrency = ref('MXN')

// ✅ Acción del toggle que será inyectada en HomePage
const toggleAction = ref(null)

// ✅ Provide para que HomePage pueda recibir las acciones
provide('toggleAction', toggleAction)

/**
 * Handler cuando se hace click en "Datos Regionales" (Federal)
 */
const handleFederalClick = (filters) => {
  console.log('🔘 [App.vue] Click en Datos Regionales, filtros:', filters)
  currentDataView.value = 'regional'
  
  // Enviar acción a HomePage via inject/provide
  toggleAction.value = {
    type: 'federal',
    filters,
    timestamp: Date.now()
  }
}

/**
 * Handler cuando se hace click en "Datos Subnacionales"
 */
const handleSubnacionalClick = (filters) => {
  console.log('🔘 [App.vue] Click en Datos Subnacionales, filtros:', filters)
  currentDataView.value = 'subnacional'
  
  // Enviar acción a HomePage via inject/provide
  toggleAction.value = {
    type: 'subnacional',
    filters,
    timestamp: Date.now()
  }
}

/**
 * Recibe el estado de filtros desde HomePage
 */
const handleFiltersStateChange = (state) => {
  console.log('📡 [App.vue] Recibido estado de filtros:', state)
  updateFiltersState(state)
}

/**
 * Recibe los años disponibles desde HomePage
 */
const handleAvailableYearsChange = (years) => {
  console.log('📅 [App.vue] Recibido años disponibles:', years)
  updateAvailableYears(years)
}
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
</style>