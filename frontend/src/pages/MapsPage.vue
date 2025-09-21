<!-- src/pages/MapsPage.vue -->
<template>
  <div class="maps-page">
    <MapComponent
      title="Índice de Finanzas Sostenibles Subnacionales (IFSS) - México 2023"
      :geoDataUrl="geoDataUrl"
      :dataUrl="dataUrl" 
      legendTitle="Valor IFSS"
      @region-selected="handleRegionSelect"
      @map-error="handleMapError"
    />
  </div>
</template>

<script>
import MapComponent from '@/modules/maps/components/MapComponent.vue'

export default {
  name: 'MapsPage',
  components: {
    MapComponent
  },
  data() {
    return {
      // ✅ RUTAS CORREGIDAS según tu estructura actual
      geoDataUrl: '/mexicoStates.json',
      dataUrl: '/src/modules/maps/data/sustainabilityData.json'
    }
  },
  methods: {
    handleRegionSelect(data) {
      console.log('Estado seleccionado:', data)
      // Aquí puedes agregar lógica adicional
    },
    
    handleMapError(error) {
      console.error('Error del mapa:', error)
      // Manejar errores
    }
  }
}
</script>

<style scoped>
.maps-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Estilos adicionales para el contenedor */
.maps-page h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}
</style>