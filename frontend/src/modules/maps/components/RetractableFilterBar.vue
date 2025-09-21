<!-- src/modules/maps/components/RetractableFilterBar.vue -->
<template>
  <div class="filter-bar-container">
    <!-- Barra de filtros principal -->
    <div 
      class="filter-bar" 
      :class="{ 'expanded': isSlideUp || activeDropdown }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
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
                  <span v-if="year !== '2023'" class="year-note">(Sin datos)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtro Variable SIMPLIFICADO -->
        <div class="filter-group">
          <label class="filter-label">Variable</label>
          <div class="filter-dropdown">
            <button 
              @click="toggleDropdown('variable')"
              class="dropdown-button"
              :class="{ 'active': activeDropdown === 'variable' }"
            >
              <span class="dropdown-icon">📊</span>
              <span class="dropdown-text">IFSS Total</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de variables -->
            <div v-if="activeDropdown === 'variable'" class="dropdown-menu">
              <div class="dropdown-options">
                <div 
                  @click="selectVariable(defaultVariable)"
                  class="dropdown-option selected"
                >
                  <span>IFSS Total</span>
                  <span class="variable-description">Índice completo de finanzas sostenibles</span>
                </div>
                <!-- Futuras variables cuando tengas más datos -->
                <div class="dropdown-option disabled">
                  <span>Financiamiento Verde</span>
                  <span class="variable-description">Próximamente</span>
                </div>
                <div class="dropdown-option disabled">
                  <span>Transparencia</span>
                  <span class="variable-description">Próximamente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
const isSlideUp = ref(false) // Controla si está deslizado hacia arriba
const activeDropdown = ref(null)
const entitySearch = ref('')
const slideTimeout = ref(null)

// Filtros seleccionados
const selectedEntity = ref(null)
const selectedYear = ref('2023')
const selectedVariable = ref(null)

// Datos de configuración
const availableYears = ref([
  '2023', '2022', '2021', '2020', '2019'
])

// Variable por defecto (única disponible actualmente)
const defaultVariable = ref({
  key: 'ifss_total',
  label: 'IFSS Total',
  description: 'Índice completo de finanzas sostenibles',
  field: 'value'
})

// Computed
const filteredEntities = computed(() => {
  if (!entitySearch.value) return props.entities
  
  const search = entitySearch.value.toLowerCase()
  return props.entities.filter(entity => 
    entity.name.toLowerCase().includes(search)
  )
})

// Métodos para manejo de deslizamiento
const handleMouseEnter = () => {
  // Limpiar timeout anterior si existe
  if (slideTimeout.value) {
    clearTimeout(slideTimeout.value)
    slideTimeout.value = null
  }
  isSlideUp.value = true
}

const handleMouseLeave = () => {
  // Solo deslizar hacia abajo si no hay dropdowns activos
  if (!activeDropdown.value) {
    slideTimeout.value = setTimeout(() => {
      isSlideUp.value = false
    }, 300) // 300ms de delay
  }
}

const toggleDropdown = (dropdownName) => {
  // Asegurar que esté deslizado hacia arriba cuando se abre un dropdown
  isSlideUp.value = true
  
  // Limpiar timeout si existe
  if (slideTimeout.value) {
    clearTimeout(slideTimeout.value)
    slideTimeout.value = null
  }
  
  activeDropdown.value = activeDropdown.value === dropdownName ? null : dropdownName
}

const closeAllDropdowns = () => {
  activeDropdown.value = null
  
  // Permitir que se deslice hacia abajo después de cerrar dropdowns
  slideTimeout.value = setTimeout(() => {
    isSlideUp.value = false
  }, 300)
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
  selectedVariable.value = defaultVariable.value
  emitFiltersChange()
})
</script>

<style scoped>
.filter-bar-container {
  position: relative;
  left: 8%;
  top: 0px;
  width: 80%;
  height: 150px; /* Altura fija para el contenedor */
  overflow: hidden; /* Ocultar la parte que se desliza fuera */
  margin: 0; /* Eliminar margin-bottom para quitar el gap */
  padding: 0; /* Eliminar cualquier padding */
}

.filter-bar {
  background: linear-gradient(135deg, #2c5282 0%, #2a4d7a 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px 12px 0 0; /* Solo bordes superiores redondeados */
  box-shadow: 0 4px 20px rgba(44, 82, 130, 0.3);
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  width: 100%;
  cursor: pointer;
  transform: translateY(calc(100% - 70px)); /* Mostrar solo 70px de la barra */
  margin-top: 0;
  padding-top: 0px;
}

.filter-bar:hover,
.filter-bar.expanded {
  transform: translateY(0); /* Deslizar completamente hacia arriba */
  cursor: default;
}

.filter-content {
  display: flex;
  gap: 24px; /* Restaurar espaciado para el estado expandido */
  padding-top: 0%;
  margin-top: 0;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center; /* Centrar los elementos */
}

.filter-group {
  padding-top: 1%;
  margin-top: 0;
  position: relative;
  min-width: 200px;
  flex: 1;
  text-align: center; /* Centrar el contenido del grupo */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centrar horizontalmente */
}

/* Agregar separadores verticales */
.filter-group:not(:last-child)::after {
  content: '|';
  position: absolute;
  right: -1px; 
  top: 5px; 
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  font-weight: 300;
  padding-bottom: 100px;
  z-index: 10; /* Asegurar que esté por encima */
  transition: top 0.1s ease; /* Transición suave para el cambio de posición */
}

/* Cuando está expandida, mover los separadores al centro */
.filter-bar.expanded .filter-group:not(:last-child)::after {
  top: 35%;
  transform: translateY(0%);
}

.filter-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  font-family:Verdana, Geneva, Tahoma, sans-serif;
  padding-top: 0px; /*padding entre entidad y el dropdown*/
  margin-bottom: 25px;
  color: #e2e8f0;
  font-weight:300;
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
    margin-top: 0;
  padding-top: 0px;
  font-size: 14px;
}

.dropdown-button:hover,
.dropdown-button.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.dropdown-icon {
  font-size: 14px;
    margin-top: 0;
  padding-top: 0px;
}

.dropdown-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
    margin-top: 0;
  padding-top: 0px;
}

.dropdown-arrow {
  font-size: 1spx;
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
    margin-top: 0;
  padding-top: 0px;
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

.dropdown-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9f9f9;
}

.dropdown-option.disabled:hover {
  background: #f9f9f9;
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

.year-note {
  font-size: 10px;
  color: #999;
  font-style: italic;
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
  
  .filter-bar-container {
    height: 80px; /* Altura menor en móvil */
  }
  
  .filter-bar {
    transform: translateY(calc(100% - 60px)); /* Mostrar menos en móvil */
  }
}
</style>