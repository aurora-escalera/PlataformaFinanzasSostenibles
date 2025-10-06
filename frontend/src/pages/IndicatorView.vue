<!-- src/pages/QualitativePanel.vue - FILTRO 3/4 DEL MAPA -->
<template>
  <div class="maps-page">
    <!-- Contenedor de filtros y toggles en dos columnas -->
         <div class="filters-toggles-row">
      <!-- Columna izquierda: Filtros (600px = 3/4 de 800px) -->
      <div class="filters-column">
        <RetractableFilterBar 
          :entities="entitiesData"
          :loading="loading"
          @entity-change="handleEntityChange"
          @year-change="handleYearChange" 
          @variable-change="handleVariableChange"
          @filters-change="handleFiltersChange"
        />
      </div>
      
      <!-- Columna derecha: Toggles -->
      <div class="toggles-column">
        <DataToggleComponent />
      </div>
    </div>
    <div class="qualitativeIndicatorPanel">
      <!-- Columna izquierda: Filtros (600px = 3/4 de 800px) -->
      <IndicatorDetailView/>
    </div>

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
import RetractableFilterBar from '@/modules/maps/components/RetractableFilterBar.vue'
import DataToggleComponent from '@modules/other/components/DataToggleComponent.vue'
import { useFilters } from '@/composables/useFilters'
import { useMaps } from '@/composables/useMaps'
import IndicatorDetailView from '../modules/qualitativeIndicators/components/IndicatorDetailView.vue'


const showStats = ref(false)

// Crear instancia compartida de useMaps
const mapsComposable = useMaps()

const {
  selectedEntity,

  loading: filtersLoading,
  error: filtersError,
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

// Desestructurar lo necesario del composable de mapas
const {
  loading: mapsLoading,
  error: mapsError,
  selectedState,
  getStateInfo,
  getIFSSLabel,
  handleStateClick,
  resetSelection,
  initializeData: initializeMapsData
} = mapsComposable

const loading = computed(() => filtersLoading.value || mapsLoading.value)
const error = computed(() => filtersError.value || mapsError.value)

const handleRegionSelect = (data) => {
  console.log('Estado seleccionado desde mapa:', data)
}

watch(selectedState, (newState) => {
  console.log('Estado seleccionado en el mapa:', newState)
  // Sincronizar con el filtro si es necesario
  if (newState && newState !== selectedEntity.value) {
    setEntityFilter(newState)
    showStats.value = true
  } else if (!newState) {
    // Si se deselecciona en el mapa, limpiar filtro
    setEntityFilter(null)
    showStats.value = false
  }
})

const focusOnEntity = () => {
  if (selectedEntity.value) {
    console.log('Enfocando en entidad:', selectedEntity.value)
  }
}

const handleMapError = (error) => {
  console.error('Error del mapa:', error)
}

const handleEntityChange = (entityName) => {
  setEntityFilter(entityName)
  showStats.value = true
  
  // Seleccionar en el mapa
  if (entityName) {
    handleStateClick(entityName)
  } else {
    resetSelection()
  }
}

const handleYearChange = (year) => {
  setYearFilter(year)
}

const handleVariableChange = (variable) => {
  setVariableFilter(variable)
}

const handleFiltersChange = (allFilters) => {
  // Solo manejar año y variable aquí
  // La entidad ya se maneja en handleEntityChange
  if (allFilters.year !== undefined) setYearFilter(allFilters.year)
  if (allFilters.variable !== undefined) setVariableFilter(allFilters.variable)
  
  showStats.value = true
}

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
  padding: 0;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Layout en dos columnas para filtros y toggles */
.filters-toggles-row {
  display: flex;
  gap: 20px;
  height: 90px;
  max-width: 1520px;
  margin: 0 auto;
}

.filters-column {
  width: 613.5px;
  flex-shrink: 0;
  padding: 0;
}

.toggles-column {
  width: 700px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0;
}

.map-section {
  margin: 0 auto;
  padding: 0; 
  max-width: 1520px; 
}

.filter-stats-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 2rem;
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0px;
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
  margin: 20px 2rem;
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

@media (max-width: 1000px) {
  .filters-toggles-row {
    flex-direction: column;
  }

  .filters-column,
  .toggles-column {
    width: 100%;
  }

  .toggles-column {
    justify-content: center;
  }

  .map-section {
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