<template>
  <div class="maps-page">
    <!-- Barra de filtros retráctil -->
    <RetractableFilterBar 
      @entity-change="handleEntityChange"
      @year-change="handleYearChange" 
      @variable-change="handleVariableChange"
      @filters-change="handleFiltersChange"
    />
    
    <!-- Componente del mapa -->
    <MapComponent
      title="Índice de Finanzas Sostenibles Subnacionales (IFSS) - México 2023"
      :geoDataUrl="geoDataUrl"
      :dataUrl="dataUrl" 
      legendTitle="Valor IFSS"
      @region-selected="handleRegionSelect"
      @map-error="handleMapError"
    />

    <!-- Panel de estadísticas de filtros -->
    <div v-if="showStats" class="filter-stats-panel">
      <h3>Estadísticas - IFSS</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span>Entidades:</span>
          <span>32</span>
        </div>
        <div class="stat-item">
          <span>Promedio:</span>
          <span>1.73%</span>
        </div>
        <div class="stat-item">
          <span>Máximo:</span>
          <span>2.8%</span>
        </div>
        <div class="stat-item">
          <span>Mínimo:</span>
          <span>0.5%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MapComponent from '@/modules/maps/components/MapComponent.vue'
import RetractableFilterBar from '@/modules/maps/components/RetractableFilterBar.vue'

export default {
  name: 'MapsPage',
  components: {
    MapComponent,
    RetractableFilterBar
  },
  data() {
    return {
      geoDataUrl: '/mexicoStates.json',
      dataUrl: '/sustainabilityData.json',
      showStats: false,
      currentFilters: {
        entity: null,
        year: '2023',
        variable: null
      }
    }
  },
  methods: {
    handleRegionSelect(data) {
      console.log('Estado seleccionado:', data)
    },
    
    handleMapError(error) {
      console.error('Error del mapa:', error)
    },

    handleEntityChange(entityName) {
      console.log('Entidad seleccionada:', entityName)
      this.currentFilters.entity = entityName
      this.showStats = true
    },
    
    handleYearChange(year) {
      console.log('Año seleccionado:', year)
      this.currentFilters.year = year
    },
    
    handleVariableChange(variable) {
      console.log('Variable seleccionada:', variable)
      this.currentFilters.variable = variable
    },
    
    handleFiltersChange(allFilters) {
      console.log('Todos los filtros:', allFilters)
      this.currentFilters = { ...allFilters }
      this.showStats = true
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

.filter-stats-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filter-stats-panel h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item span:first-child {
  color: #666;
}

.stat-item span:last-child {
  font-weight: bold;
  color: #4CAF50;
}
</style>