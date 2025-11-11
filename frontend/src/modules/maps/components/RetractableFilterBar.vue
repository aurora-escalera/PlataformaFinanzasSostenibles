<!-- src/modules/maps/components/RetractableFilterBar.vue -->
<template>
  <div 
    class="filter-bar-container" 
    :style="{ overflow: activeDropdown !== null ? 'visible' : 'hidden' }"
  >
    <!-- Barra de filtros principal -->
    <div 
      ref="filterBarRef"
      class="filter-bar" 
      :class="{ 
        'expanded': isSlideUp || activeDropdown,
        'has-entity-selected': selectedEntity
      }"
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
              :class="{ 'active': activeDropdown === 'entidad', 'has-selection': selectedEntity }"
            >
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
          
          <!-- Tooltip para seleccionar entidad -->
          <div v-if="activeDropdown === 'variable' && !selectedEntity" class="tooltip-select-entity">
            📍 Selecciona una Entidad Federativa
          </div>
        </div>

        <!-- Filtro Año -->
        <div class="filter-group">
          <label class="filter-label">Año</label>
          <div class="filter-dropdown">
            <button 
              @click="toggleDropdown('año')"
              class="dropdown-button"
              :class="{ 'active': activeDropdown === 'año', 'has-selection': selectedYear && selectedYear !== '2023' }"
            >
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

        <!-- Filtro Variable CON LAS 4 OPCIONES + TODAS -->
        <div class="filter-group">
          <label class="filter-label">Variable</label>
          <div class="filter-dropdown">
            <button 
              @click="toggleDropdown('variable')"
              class="dropdown-button"
              :class="{ 'active': activeDropdown === 'variable', 'has-selection': selectedVariable }"
            >
              <span class="dropdown-text">{{ getVariableLabel() }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de variables -->
            <div v-if="activeDropdown === 'variable'" class="dropdown-menu variable-menu">
              <div class="dropdown-options">
                <!-- Todas -->
                <div 
                  @click="selectedEntity ? selectVariable(null) : null"
                  class="dropdown-option"
                  :class="{ 
                    'selected': !selectedVariable,
                    'disabled': !selectedEntity
                  }"
                >
                  <span>Todas</span>
                </div>
                
                <!-- Presupuestos Sostenibles (PS) -->
                <div 
                  @click="selectedEntity ? selectVariable(variables.PS) : null"
                  class="dropdown-option"
                  :class="{ 
                    'selected': selectedVariable?.key === 'PS',
                    'disabled': !selectedEntity
                  }"
                >
                  <span>Presupuestos Sostenibles (PS)</span>
                </div>
                
                <!-- Ingresos Intensivos en Carbono (IIC) -->
                <div 
                  @click="selectedEntity ? selectVariable(variables.IIC) : null"
                  class="dropdown-option"
                  :class="{ 
                    'selected': selectedVariable?.key === 'IIC',
                    'disabled': !selectedEntity
                  }"
                >
                  <span>Ingresos Intensivos en Carbono (IIC)</span>
                </div>
                
                <!-- Presupuestos Intensivos en Carbono (PIC) -->
                <div 
                  @click="selectedEntity ? selectVariable(variables.PIC) : null"
                  class="dropdown-option"
                  :class="{ 
                    'selected': selectedVariable?.key === 'PIC',
                    'disabled': !selectedEntity
                  }"
                >
                  <span>Presupuestos Intensivos en Carbono (PIC)</span>
                </div>
                
                <!-- Ingresos Sostenibles (IS) -->
                <div 
                  @click="selectedEntity ? selectVariable(variables.IS) : null"
                  class="dropdown-option"
                  :class="{ 
                    'selected': selectedVariable?.key === 'IS',
                    'disabled': !selectedEntity
                  }"
                >
                  <span>Ingresos Sostenibles (IS)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'

// Props
const props = defineProps({
  entities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedState: {
    type: String,
    default: null
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
const isSlideUp = ref(false)
const activeDropdown = ref(null)
const entitySearch = ref('')
const slideTimeout = ref(null)
const filterBarRef = ref(null)

// Filtros seleccionados
const selectedEntity = ref(null)
const selectedYear = ref('2023')
const selectedVariable = ref(null)

// Datos de configuración
const availableYears = ref([
  '2023', '2022', '2021', '2020', '2019'
])

// Definición de las 4 variables
const variables = {
  PS: {
    key: 'PS',
    label: 'Presupuestos Sostenibles (PS)',
    description: 'Presupuestos Sostenibles',
    category: 'presupuestos',
    barVariables: ['PS', 'PT'],
    donutType: 'PS'
  },
  IIC: {
    key: 'IIC',
    label: 'Ingresos Intensivos en Carbono (IIC)',
    description: 'Ingresos Intensivos en Carbono',
    category: 'ingresos',
    barVariables: ['IIC', 'IT'],
    donutType: 'IIC'
  },
  PIC: {
    key: 'PIC',
    label: 'Presupuestos Intensivos en Carbono (PIC)',
    description: 'Presupuestos Intensivos en Carbono',
    category: 'presupuestos',
    barVariables: ['PIC', 'PT'],
    donutType: 'PIC'
  },
  IS: {
    key: 'IS',
    label: 'Ingresos Sostenibles (IS)',
    description: 'Ingresos Sostenibles',
    category: 'ingresos',
    barVariables: ['IS', 'IT'],
    donutType: 'IS'
  }
}

// Computed
const filteredEntities = computed(() => {
  if (!entitySearch.value) return props.entities
  
  const search = entitySearch.value.toLowerCase()
  return props.entities.filter(entity => 
    entity.name.toLowerCase().includes(search)
  )
})

// Función para obtener el label de la variable seleccionada
const getVariableLabel = () => {
  if (!selectedVariable.value) return 'Todas'
  return selectedVariable.value.key  // Mostrar solo la abreviatura (PS, IIC, PIC, IS)
}

// Función para manejar el scroll en el dropdown
const handleDropdownScroll = (event) => {
  const container = event.currentTarget
  const { scrollTop, scrollHeight, clientHeight } = container
  const delta = event.deltaY
  
  const isAtTop = scrollTop === 0 && delta < 0
  const isAtBottom = scrollTop + clientHeight >= scrollHeight && delta > 0
  
  if (!isAtTop && !isAtBottom) {
    event.preventDefault()
  }
  
  event.stopPropagation()
}

// Métodos para manejo de deslizamiento
const handleMouseEnter = () => {
  if (slideTimeout.value) {
    clearTimeout(slideTimeout.value)
    slideTimeout.value = null
  }
  isSlideUp.value = true
}

const handleMouseLeave = () => {
  // No contraer si hay una entidad seleccionada o si hay un dropdown activo
  if (!activeDropdown.value && !selectedEntity.value) {
    slideTimeout.value = setTimeout(() => {
      isSlideUp.value = false
    }, 300)
  }
}

const toggleDropdown = (dropdownName) => {
  console.log('📂 Toggle dropdown:', dropdownName)
  isSlideUp.value = true
  
  if (slideTimeout.value) {
    clearTimeout(slideTimeout.value)
    slideTimeout.value = null
  }
  
  activeDropdown.value = activeDropdown.value === dropdownName ? null : dropdownName
  console.log('📂 Dropdown activo:', activeDropdown.value)
}

const closeAllDropdowns = () => {
  console.log('🚪 Cerrando todos los dropdowns')
  activeDropdown.value = null
  
  slideTimeout.value = setTimeout(() => {
    isSlideUp.value = false
  }, 300)
}

// ✅ Función para manejar click fuera del dropdown
const handleClickOutside = (event) => {
  if (!filterBarRef.value) return
  
  // Si el click es fuera del componente de filtros
  if (!filterBarRef.value.contains(event.target)) {
    if (activeDropdown.value) {
      console.log('👆 Click fuera detectado, cerrando dropdown')
      closeAllDropdowns()
    }
  }
}

const selectEntity = (entityName) => {
  console.log('=== FILTRO: Entidad seleccionada ===', entityName)
  selectedEntity.value = entityName
  emit('entity-change', entityName)
  emitFiltersChange()
  entitySearch.value = ''
  closeAllDropdowns()
}

const selectYear = (year) => {
  console.log('=== FILTRO: Año seleccionado ===', year)
  selectedYear.value = year
  emit('year-change', year)
  emitFiltersChange()
  closeAllDropdowns()
}

const selectVariable = (variable) => {
  console.log('=== FILTRO: Variable seleccionada ===', variable)
  selectedVariable.value = variable
  emit('variable-change', variable)
  emitFiltersChange()
  closeAllDropdowns()
}

const emitFiltersChange = () => {
  const filters = {
    entity: selectedEntity.value,
    year: selectedYear.value,
    variable: selectedVariable.value
  }
  console.log('=== FILTRO: Emitiendo filters-change ===', filters)
  emit('filters-change', filters)
}

// ✅ Watch para sincronizar estado seleccionado desde el mapa
watch(() => props.selectedState, (newState) => {
  console.log('🔄 Sincronizando filtro con mapa. Estado:', newState)
  selectedEntity.value = newState
}, { immediate: true })

// Inicialización
onMounted(() => {
  console.log('✅ RetractableFilterBar montado')
  console.log('✅ Entidades recibidas:', props.entities.length)
  emitFiltersChange()
  
  // ✅ Agregar listener para detectar clicks fuera
  document.addEventListener('click', handleClickOutside)
})

// ✅ Limpieza al desmontar
onBeforeUnmount(() => {
  console.log('👋 RetractableFilterBar desmontándose')
  // Remover listener de clicks
  document.removeEventListener('click', handleClickOutside)
  
  // Limpiar timeout si existe
  if (slideTimeout.value) {
    clearTimeout(slideTimeout.value)
  }
})
</script>

<style scoped>
.filter-bar-container {
  position: relative;
  left: 19.6px;
  top: 0px;
  width: 100%;
  height: 110px;
  margin: 0;
  padding: 0;
  z-index: 99;
}

.filter-bar {
  background: #053759;
  color: white;
  padding: 15px 0px;
  border-radius: 15px 15px 0px 0px;
  box-shadow: 0 4px 20px rgba(44, 82, 130, 0.3);
  transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  width: 100%;
  cursor: pointer;
  transform: translateY(calc(100% - 65px));
}

.filter-bar:hover,
.filter-bar.expanded,
.filter-bar.has-entity-selected {
  transform: translateY(-20px);
  cursor: default;
  z-index: 1;
}

.filter-content {
  display: flex;
  top: 100px;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-group {
  position: relative;
  min-width: 140px;
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.filter-group::after {
  content: '|';
  position: absolute;
  right: -32px;
  top: 50%; 
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 300;
  z-index: 100;
  transition: all 0.1s ease;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 200;
  margin-bottom: 10px;
  color: #e2e8f0;
  letter-spacing: 0.5px; 
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  width: 100%; 
  text-align: center;
  height: 20px; 
  line-height: 20px;
}

.filter-dropdown {
  position: relative;
  display: flex; 
  justify-content: center; 
  width: 100%; 
}

.dropdown-button {
  opacity: 80%;
  width: 180px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: hsl(218, 23%, 23%);
  padding: 8px 16px;
  border-radius: 25px;
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
.dropdown-button.active,
.dropdown-button.has-selection {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-text {
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4a5568;
  font-weight: 200;
  font-size: 13px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
  color: #718096;
}

.dropdown-button.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  max-height: none;
  overflow: visible;
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
  outline: none;
  font-size: 14px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 200;
}

.search-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.dropdown-options {
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

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
  font-size: 13px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 200;
}


.dropdown-option:hover {
  background: #d0d2d4;
}

.dropdown-option.selected {
  background: #f1f2f3;

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

.year-note {
  font-size: 10px;
  color: #999;
  font-style: italic;
}

.tooltip-select-entity {
  position: absolute;
  bottom: -45px;
  left: 50%;
  transform: translateX(-50%);
  background: #fbbf24;
  color: #78350f;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  animation: tooltipBounce 0.5s ease;
  z-index: 100;
}

.tooltip-select-entity::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #fbbf24;
}

@keyframes tooltipBounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .filter-bar-container {
    height: 100px;
  }
  
  .filter-bar {
    transform: translateY(calc(100% - 60px));
  }
  
  .variable-menu {
    width: 180%;
    left: -40%;
  }
  
  .tooltip-select-entity {
    bottom: -50px;
    font-size: 11px;
    padding: 6px 12px;
  }
}
</style>