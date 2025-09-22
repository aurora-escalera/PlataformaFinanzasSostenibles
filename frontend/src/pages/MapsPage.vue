<!-- src/pages/MapsPage.vue - LIMPIO Y CHARTS DEBAJO DEL MAPA -->
<template>
  <div class="maps-page">
    <!-- Barra de filtros retráctil -->
    <RetractableFilterBar 
      :entities="entitiesData"
      :loading="loading"
      @entity-change="handleEntityChange"
      @year-change="handleYearChange" 
      @variable-change="handleVariableChange"
      @filters-change="handleFiltersChange"
    />
    
    <!-- Componente del mapa -->
    <div class="map-section">
      <MapComponent 
        title="Índice de Finanzas Sostenibles Subnacionales (IFSS) - México 2023"
        :geoDataUrl="geoDataUrl"
        :dataUrl="dataUrl" 
        legendTitle="Valor IFSS"
        @region-selected="handleRegionSelect"
        @map-error="handleMapError"
      />
    </div>
    
    <!-- Panel de estadísticas de filtros -->
    <div v-if="showStats && filterStats" class="filter-stats-panel">
      <div class="stats-header">
        <h3>Estadísticas - {{ filterStats.selectedVariable }}</h3>
        <button @click="exportData" class="export-btn">
          Exportar Datos
        </button>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <span>Entidades:</span>
          <span>{{ filterStats.total }}</span>
        </div>
        <div class="stat-item">
          <span>Promedio:</span>
          <span>{{ filterStats.average }}%</span>
        </div>
        <div class="stat-item">
          <span>Máximo:</span>
          <span>{{ filterStats.max }}%</span>
        </div>
        <div class="stat-item">
          <span>Mínimo:</span>
          <span>{{ filterStats.min }}%</span>
        </div>
      </div>
      
      <!-- Información del filtro actual -->
      <div v-if="selectedEntity" class="current-filter">
        <h4>{{ selectedEntity }}</h4>
        <p>Valor IFSS: {{ getCurrentEntityValue() }}%</p>
        <p>Clasificación: {{ getCurrentEntityClassification() }}</p>
        
        <button @click="focusOnEntity" class="charts-btn">
          Ver Análisis Detallado
        </button>
      </div>
    </div>

    <!-- Panel de error si hay problemas -->
    <div v-if="error" class="error-panel">
      <h3>Error en el sistema</h3>
      <p>{{ error }}</p>
      <button @click="retry" class="retry-btn">
        Reintentar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MapComponent from '@/modules/maps/components/MapComponent.vue'
import RetractableFilterBar from '@/modules/maps/components/RetractableFilterBar.vue'
import { useFilters } from '@/composables/useFilters'
import { useMaps } from '@/composables/useMaps'

// URLs de datos
const geoDataUrl = ref('/mexicoStates.json')
const dataUrl = ref('/sustainabilityData.json')

// Estados locales
const showStats = ref(false)

// Usar composables
const {
  selectedEntity,
  selectedYear, 
  selectedVariable,
  loading: filtersLoading,
  error: filtersError,
  entitiesData,
  filteredData,
  filterStats,
  loadFilterData,
  setEntityFilter,
  setYearFilter,
  setVariableFilter,
  exportFilteredData,
  getCurrentVariableValue,
  initializeFilters
} = useFilters()

const {
  loading: mapsLoading,
  error: mapsError,
  selectedState,
  getStateInfo,
  getIFSSLabel,
  initializeData: initializeMapsData
} = useMaps()

// Estados computados combinados
const loading = computed(() => filtersLoading.value || mapsLoading.value)
const error = computed(() => filtersError.value || mapsError.value)

// Manejar selección desde el mapa - simplificado
const handleRegionSelect = (data) => {
  // Por ahora solo log, la funcionalidad de charts está dentro del MapComponent
  console.log('Estado seleccionado desde mapa:', data)
}

// Watch simplificado
watch(selectedState, (newState) => {
  console.log('Estado seleccionado en el mapa:', newState)
})

// Método para enfocar en una entidad específica
const focusOnEntity = () => {
  if (selectedEntity.value) {
    // Aquí podrías hacer scroll al mapa o alguna otra acción
    console.log('Enfocando en entidad:', selectedEntity.value)
  }
}

const handleMapError = (error) => {
  console.error('Error del mapa:', error)
}

const handleEntityChange = (entityName) => {
  setEntityFilter(entityName)
  showStats.value = true
}

const handleYearChange = (year) => {
  setYearFilter(year)
}

const handleVariableChange = (variable) => {
  setVariableFilter(variable)
}

const handleFiltersChange = (allFilters) => {
  if (allFilters.entity !== undefined) setEntityFilter(allFilters.entity)
  if (allFilters.year !== undefined) setYearFilter(allFilters.year)
  if (allFilters.variable !== undefined) setVariableFilter(allFilters.variable)
  
  showStats.value = true
}

// Métodos auxiliares
const getCurrentEntityValue = () => {
  if (!selectedEntity.value || !filteredData.value[selectedEntity.value]) return 0
  const data = filteredData.value[selectedEntity.value]
  return getCurrentVariableValue(data)
}

const getCurrentEntityClassification = () => {
  const value = getCurrentEntityValue()
  return getIFSSLabel(value).label
}

const exportData = () => {
  exportFilteredData()
}

const retry = () => {
  initializeFilters()
  initializeMapsData()
  loadFilterData()
}

// Inicialización
onMounted(async () => {
  try {
    initializeFilters()
    await loadFilterData()
  } catch (err) {
    console.error('Error inicializando MapsPage:', err)
  }
})
</script>

<style scoped>
.maps-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.map-section {
  margin-bottom: 0;
}

.charts-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.filter-stats-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stats-header h3 {
  margin: 0;
  color: #2c3e50;
}

.export-btn, .charts-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  margin-top: 10px;
}

.export-btn:hover, .charts-btn:hover {
  background: #45a049;
}

.charts-btn {
  background: #2196F3;
  margin-left: 10px;
}

.charts-btn:hover {
  background: #1976D2;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
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

.current-filter {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #2196F3;
}

.current-filter h4 {
  margin: 0 0 8px 0;
  color: #1976D2;
}

.current-filter p {
  margin: 4px 0;
  color: #424242;
}

.error-panel {
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  text-align: center;
}

.error-panel h3 {
  color: #d32f2f;
  margin-bottom: 10px;
}

.error-panel p {
  color: #666;
  margin-bottom: 15px;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background: #d32f2f;
}

@media (max-width: 768px) {
  .maps-page {
    padding: 1rem;
  }
  
  .stats-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>