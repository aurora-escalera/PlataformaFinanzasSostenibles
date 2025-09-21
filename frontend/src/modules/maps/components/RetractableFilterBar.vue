<template>
  <div class="filter-bar-container">
    <!-- Barra de filtros principal -->
    <div class="filter-bar" :class="{ 'expanded': isExpanded }">
      <div class="filter-content">
        <!-- Filtro Entidad -->
        <div class="filter-group">
          <label class="filter-label">Entidad</label>
          <div class="filter-dropdown">
            <button 
              @click="toggleDropdown('entidad')"
              class="dropdown-button"
              :class="{ 'active': activeDropdown === 'entidad' }"
            >
              <span class="dropdown-icon">🗺️</span>
              <span class="dropdown-text">{{ selectedEntity || 'Todas' }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de entidades -->
            <div v-if="activeDropdown === 'entidad'" class="dropdown-menu">
              <div class="dropdown-search">
                <input 
                  v-model="entitySearch"
                  placeholder="Buscar entidad..."
                  class="search-input"
                >
              </div>
              <div class="dropdown-options">
                <div 
                  @click="selectEntity(null)"
                  class="dropdown-option"
                  :class="{ 'selected': !selectedEntity }"
                >
                  <span>Todas las entidades</span>
                </div>
                <div 
                  v-for="entity in filteredEntities" 
                  :key="entity.name"
                  @click="selectEntity(entity.name)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedEntity === entity.name }"
                >
                  <span>{{ entity.name }}</span>
                  <span class="entity-value">{{ entity.value }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtro Año -->
        <div class="filter-group">
          <label class="filter-label">Año</label>
          <div class="filter-dropdown">
            <button 
              @click="toggleDropdown('año')"
              class="dropdown-button"
              :class="{ 'active': activeDropdown === 'año' }"
            >
              <span class="dropdown-icon">📅</span>
              <span class="dropdown-text">{{ selectedYear || '2023' }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de años -->
            <div v-if="activeDropdown === 'año'" class="dropdown-menu">
              <div class="dropdown-options">
                <div 
                  v-for="year in availableYears" 
                  :key="year"
                  @click="selectYear(year)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedYear === year }"
                >
                  <span>{{ year }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtro Variable -->
        <div class="filter-group">
          <label class="filter-label">Variable</label>
          <div class="filter-dropdown">
            <button 
              @click="toggleDropdown('variable')"
              class="dropdown-button"
              :class="{ 'active': activeDropdown === 'variable' }"
            >
              <span class="dropdown-icon">📊</span>
              <span class="dropdown-text">{{ selectedVariable?.label || 'IFSS Total' }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de variables -->
            <div v-if="activeDropdown === 'variable'" class="dropdown-menu">
              <div class="dropdown-options">
                <div 
                  v-for="variable in availableVariables" 
                  :key="variable.key"
                  @click="selectVariable(variable)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable?.key === variable.key }"
                >
                  <span>{{ variable.label }}</span>
                  <span class="variable-description">{{ variable.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón para expandir/contraer -->
      <button 
        @click="toggleExpanded"
        class="expand-button"
        :class="{ 'expanded': isExpanded }"
      >
        {{ isExpanded ? '▲' : '▼' }}
      </button>
    </div>

    <!-- Overlay para cerrar dropdowns -->
    <div 
      v-if="activeDropdown"
      @click="closeAllDropdowns"
      class="dropdown-overlay"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  entities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'entity-change',
  'year-change', 
  'variable-change',
  'filters-change'
])

// Estados reactivos
const isExpanded = ref(true)
const activeDropdown = ref(null)
const entitySearch = ref('')

// Filtros seleccionados
const selectedEntity = ref(null)
const selectedYear = ref('2023')
const selectedVariable = ref(null)

// Datos de configuración
const availableYears = ref([
  '2023', '2022', '2021', '2020', '2019'
])

const availableVariables = ref([
  {
    key: 'ifss_total',
    label: 'IFSS Total',
    description: 'Índice completo de finanzas sostenibles'
  },
  {
    key: 'financiamiento_verde',
    label: 'Financiamiento Verde',
    description: 'Recursos destinados a proyectos ambientales'
  },
  {
    key: 'transparencia',
    label: 'Transparencia',
    description: 'Nivel de transparencia en información financiera'
  },
  {
    key: 'gestion_riesgo',
    label: 'Gestión de Riesgo',
    description: 'Capacidad de gestión de riesgos climáticos'
  },
  {
    key: 'innovacion',
    label: 'Innovación',
    description: 'Adopción de tecnologías e instrumentos innovadores'
  },
  {
    key: 'participacion_social',
    label: 'Participación Social',
    description: 'Nivel de participación ciudadana en decisiones'
  }
])

// Computed
const filteredEntities = computed(() => {
  if (!entitySearch.value) return props.entities
  
  const search = entitySearch.value.toLowerCase()
  return props.entities.filter(entity => 
    entity.name.toLowerCase().includes(search)
  )
})

// Métodos
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) {
    closeAllDropdowns()
  }
}

const toggleDropdown = (dropdownName) => {
  if (!isExpanded.value) {
    isExpanded.value = true
  }
  
  activeDropdown.value = activeDropdown.value === dropdownName ? null : dropdownName
}

const closeAllDropdowns = () => {
  activeDropdown.value = null
}

const selectEntity = (entityName) => {
  selectedEntity.value = entityName
  emit('entity-change', entityName)
  emitFiltersChange()
  closeAllDropdowns()
}

const selectYear = (year) => {
  selectedYear.value = year
  emit('year-change', year)
  emitFiltersChange()
  closeAllDropdowns()
}

const selectVariable = (variable) => {
  selectedVariable.value = variable
  emit('variable-change', variable)
  emitFiltersChange()
  closeAllDropdowns()
}

const emitFiltersChange = () => {
  emit('filters-change', {
    entity: selectedEntity.value,
    year: selectedYear.value,
    variable: selectedVariable.value
  })
}

// Inicialización
onMounted(() => {
  selectedVariable.value = availableVariables.value[0]
  emitFiltersChange()
})
</script>

<style scoped>
.filter-bar-container {
  position: relative;
  width: 100%;
  z-index: 100;
}

.filter-bar {
  background: linear-gradient(135deg, #2c5282 0%, #2a4d7a 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(44, 82, 130, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.filter-bar.expanded {
  padding: 24px;
}

.filter-content {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.filter-group {
  position: relative;
  min-width: 200px;
  flex: 1;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-dropdown {
  position: relative;
}

.dropdown-button {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.dropdown-button:hover,
.dropdown-button.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.dropdown-icon {
  font-size: 16px;
}

.dropdown-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.dropdown-button.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 8px;
  max-height: 300px;
  overflow: hidden;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-search {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.dropdown-options {
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-option {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #2d3748;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f7fafc;
}

.dropdown-option:hover {
  background: #f7fafc;
}

.dropdown-option.selected {
  background: #ebf8ff;
  color: #2b6cb0;
  font-weight: 600;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.entity-value {
  font-size: 12px;
  color: #4caf50;
  font-weight: 600;
}

.variable-description {
  font-size: 11px;
  color: #718096;
  max-width: 150px;
  text-align: right;
}

.expand-button {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.expand-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .expand-button {
    position: relative;
    right: auto;
    top: auto;
    transform: none;
    margin-top: 16px;
    align-self: center;
  }
}

/* Estados colapsado */
.filter-bar:not(.expanded) .filter-content {
  display: none;
}

.filter-bar:not(.expanded) {
  padding: 12px 24px;
  cursor: pointer;
}

.filter-bar:not(.expanded) .expand-button {
  position: static;
  transform: none;
  margin: 0;
}
</style>