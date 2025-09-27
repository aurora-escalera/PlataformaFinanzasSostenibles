<!-- src/modules/maps/components/RetractableFilterBar.vue -->
<template>
  <div 
    class="filter-bar-container" 
    :style="{ overflow: activeDropdown !== null ? 'visible' : 'hidden' }"
  >
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
              <div 
                class="dropdown-options" 
                @wheel.prevent="handleDropdownScroll"
              >
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

// Función para manejar el scroll en el dropdown
const handleDropdownScroll = (event) => {
  const container = event.currentTarget
  const { scrollTop, scrollHeight, clientHeight } = container
  const delta = event.deltaY
  
  // Verificar si estamos en los límites del scroll
  const isAtTop = scrollTop === 0 && delta < 0
  const isAtBottom = scrollTop + clientHeight >= scrollHeight && delta > 0
  
  // Si no estamos en los límites, prevenir el scroll de la página
  if (!isAtTop && !isAtBottom) {
    event.preventDefault()
  }
  
  // Siempre detener la propagación
  event.stopPropagation()
}

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
  left: 0%;
  top: 0px;
  width: 100%;
  height: 90px; /* Altura fija para el contenedor */
  margin: 0; /* Eliminar margin-bottom para quitar el gap */
  padding: 0; /* Eliminar cualquier padding */
  z-index: 1;
}

.filter-bar {
  background: linear-gradient(135deg, #2c5282 0%, #2a4d7a 100%);
  color: white;
  padding: 5px 24px;
  border-radius: 45px 30px 0 0; /* Solo bordes superiores redondeados */
  box-shadow: 0 4px 20px rgba(44, 82, 130, 0.3);
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  width: 100%;
  cursor: pointer;
  transform: translateY(calc(100% - 50px)); /* Mostrar solo 70px de la barra */
}

.filter-bar:hover,
.filter-bar.expanded {
  transform: translateY(-22px); /* Deslizar completamente hacia arriba */
  cursor: default;
}

.filter-content {
  display: flex;
  top: 100px;
  gap: 24px; /* Restaurar espaciado para el estado expandido */
  flex-wrap: wrap;
  justify-content: center; /* Centrar los elementos */
}

.filter-group {
  position: relative;
  min-width: 100px;
  flex: 1;
  text-align: center; /* Centrar el contenido del grupo */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centrar horizontalmente */
}

/* Agregar separadores verticales */
.filter-group::after {
  content: '|';
  position: absolute;
  right: -1px;
  top: 50%; /* Centrar verticalmente con el contenido */
  transform: translateY(-100%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  font-weight: 300;
  z-index: 100;
  transition: all 0.1s ease;
}

.filter-label {
  display: block;
  font-size: 13px;
  font-weight: 400;
  margin-bottom: 8px;
  color: #e2e8f0;
  letter-spacing: 0.5px; 
}

.filter-dropdown {
  position: relative;
}

.dropdown-button {
  opacity: 80%;
  width: 120%;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: hsl(218, 23%, 23%);
  padding: 0px 3px;
  border-radius: 25px; /* Bordes muy redondeados como en la imagen 2 */
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-button:hover,
.dropdown-button.active {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-icon {
  font-size: 16px;
  width: 24px;
  height: 24px;
  background: #4a5568;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.dropdown-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4a5568; /* Color más oscuro para mejor contraste */
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
  color: #718096; /* Color más suave para la flecha */
}

.dropdown-button.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 150%; /* Mismo ancho que el botón */
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 9999; /* Aumentar z-index para que aparezca por encima del wrapper */
  margin-top: 8px;
  max-height: none; /* Quitar límite de altura del contenedor */
  overflow: visible; /* Permitir que el contenido sea visible */
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
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
}

.search-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.dropdown-options {
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain; /* Prevenir scroll en elementos padres */
}

/* Estilos personalizados para la barra de scroll */
.dropdown-options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.dropdown-options::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.dropdown-option {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #2d3748;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f7fafc;
  font-size: 12px; /* Mismo tamaño que dropdown-text */
}

.dropdown-option span:first-child {
  font-size: 12px;
  font-weight: 500;
}

.dropdown-options {
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain; /* Prevenir scroll en elementos padres */
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