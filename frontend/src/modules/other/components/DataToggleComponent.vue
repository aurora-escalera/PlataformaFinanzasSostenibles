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
    />

    <!-- Contenido principal -->
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeaderComponent from '@modules/other/components/HeaderComponent.vue'
import TitleBarComponent from '@modules/other/components/TitleBarComponent.vue'
import DataViewToggleBar from '@modules/other/components/DataViewToggleBar.vue'

// Estado del toggle de vista
const currentDataView = ref('subnacional')

// Estado de la moneda (puede venir de una API o configuración)
const currentCurrency = ref('MXN')
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