<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Barra de título con botones de acción -->
    <TitleBarComponent 
      title="Plataforma del Índice de Finanzas Sostenibles Subnacional (IFSS)"
      lastUpdate="24 de septiembre de 2025"
    />

    <!-- Barra de toggle Vista -->
    <DataViewToggleBar 
      @click-federal="handleToggleFederalClick"
      @click-subnacional="handleToggleSubnacionalClick"
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
import TitleBarComponent from '@modules/other/components/TitleBarComponent.vue'
import DataViewToggleBar from '@modules/other/components/DataViewToggleBar.vue'
import { useDataToggle } from '@/composables/useDataToggle'

// ============================================================================
// COMPOSABLE
// ============================================================================
const { 
  updateFiltersState,
  updateAvailableYears,
  getFederalClickFilters,
  getSubnacionalClickFilters
} = useDataToggle()

// ============================================================================
// ESTADO
// ============================================================================

// Ref reactivo para la acción del toggle (para comunicar con HomePage)
const toggleAction = ref(null)

// ============================================================================
// HANDLERS: Recibir estado de HomePage
// ============================================================================

/**
 * Recibe cambios en el estado de los filtros desde HomePage
 * Actualiza el composable para que el toggle refleje el estado correcto
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
 * Setea filtros: entity=null, year=null, variable=null
 * Resultado: LinearChart + HistoricalCard + Overlay Gris
 */
const handleToggleFederalClick = (filters) => {
  console.log('🔘 [App] Click en toggle "Datos Regionales" (Federal)')
  console.log('📤 [App] Enviando filtros a HomePage:', filters)
  
  // Emitir acción para que HomePage aplique los filtros
  toggleAction.value = { 
    type: 'federal', 
    filters, 
    timestamp: Date.now() 
  }
}

/**
 * Handler para click en "Datos Subnacionales"
 * Setea filtros: entity='', year=primerAño, variable=null
 * Resultado: DefaultInfoCard + RankingChart + No overlay
 */
const handleToggleSubnacionalClick = (filters) => {
  console.log('🔘 [App] Click en toggle "Datos Subnacionales"')
  console.log('📤 [App] Enviando filtros a HomePage:', filters)
  
  // Emitir acción para que HomePage aplique los filtros
  toggleAction.value = { 
    type: 'subnacional', 
    filters, 
    timestamp: Date.now() 
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
</style>