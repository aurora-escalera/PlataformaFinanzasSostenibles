<!-- src/modules/maps/components/RetractableFilterBar.vue -->
<!-- ✅ MODIFICADO: Agregado buscador en los 3 filtros (Entidad, Año, Variable) -->
<!-- ✅ MODIFICADO: Añadido espacio en blanco para Año -->
<!-- ✅ MODIFICADO: Cambiado 'Todas las entidades' por 'Todas las entidades (IFS Regional)' -->
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
        'has-entity-selected': selectedEntity,
        'locked-expanded': props.isLocked,
        'animating-down': isAnimatingDown
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
              <span class="dropdown-text">{{ getEntityLabel() }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de entidades -->
            <div v-if="activeDropdown === 'entidad'" class="dropdown-menu">
              <div class="dropdown-search">
                <input 
                  v-model="entitySearch"
                  placeholder="Buscar entidad..."
                  class="search-input"
                  @click.stop
                >
              </div>
              <div 
                class="dropdown-options" 
                @wheel.prevent="handleDropdownScroll"
              >
                <!-- Opción en blanco (default) -->
                <div 
                  @click="selectEntity('')"
                  class="dropdown-option"
                  :class="{ 'selected': selectedEntity === '' }"
                >
                  <span class="blank-option">-</span>
                </div>
                <!-- ✅ MODIFICADO: Cambiado texto -->
                <div 
                  @click="selectEntity(null)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedEntity === null }"
                >
                  <span>Todas las entidades (IFS Regional)</span>
                </div>
                <div 
                  v-for="entity in filteredEntities" 
                  :key="entity.name"
                  @click="selectEntity(entity.name)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedEntity === entity.name && selectedEntity !== '' && selectedEntity !== null }"
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
              :class="{ 'active': activeDropdown === 'año', 'has-selection': selectedYear !== null && selectedYear !== '' }"
              :disabled="loadingYears"
            >
              <span class="dropdown-text">
                {{ loadingYears ? 'Cargando...' : getYearLabel() }}
              </span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de años -->
            <div v-if="activeDropdown === 'año'" class="dropdown-menu">
              <!-- ✅ Buscador de años -->
              <div class="dropdown-search">
                <input 
                  v-model="yearSearch"
                  placeholder="Buscar año..."
                  class="search-input"
                  @click.stop
                >
              </div>
              <div 
                class="dropdown-options"
                @wheel.prevent="handleDropdownScroll"
              >
                <!-- ✅ NUEVO: Opción en blanco (default) - solo si no hay búsqueda -->
                <div 
                  v-if="!yearSearch"
                  @click="selectYear('')"
                  class="dropdown-option"
                  :class="{ 'selected': selectedYear === '' }"
                >
                  <span class="blank-option">-</span>
                </div>
                
                <!-- Opción "Todos los años" (solo si no hay búsqueda) -->
                <div 
                  v-if="!yearSearch"
                  @click="selectYear(null)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedYear === null }"
                >
                  <span>Todos los años</span>
                </div>
                
                <!-- Años filtrados -->
                <div 
                  v-for="year in filteredYears" 
                  :key="year"
                  @click="selectYear(year)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedYear === year && selectedYear !== '' && selectedYear !== null }"
                >
                  <span>{{ year }}</span>
                </div>
                
                <!-- Mensaje si no hay resultados -->
                <div v-if="filteredYears.length === 0 && yearSearch" class="dropdown-no-results">
                  No se encontraron años
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
              :class="{ 'active': activeDropdown === 'variable', 'has-selection': selectedVariable !== null && selectedVariable !== '' }"
            >
              <span class="dropdown-text">{{ getVariableLabel() }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de variables -->
            <div v-if="activeDropdown === 'variable'" class="dropdown-menu variable-menu">
              <!-- ✅ Buscador de variables -->
              <div class="dropdown-search">
                <input 
                  v-model="variableSearch"
                  placeholder="Buscar variable..."
                  class="search-input"
                  @click.stop
                >
              </div>
              <div 
                class="dropdown-options"
                @wheel.prevent="handleDropdownScroll"
              >
                <!-- Opción en blanco (solo si no hay búsqueda) -->
                <div 
                  v-if="!variableSearch"
                  @click="selectVariable('')"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable === '' }"
                >
                  <span class="blank-option">-</span>
                </div>
                
                <!-- Todas las variables (solo si no hay búsqueda) -->
                <div 
                  v-if="!variableSearch"
                  @click="selectVariable(null)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable === null }"
                >
                  <span>Todas las variables</span>
                </div>
                
                <!-- Variables filtradas -->
                <div 
                  v-for="variable in filteredVariables" 
                  :key="variable.key"
                  @click="selectVariable(variable)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable?.key === variable.key }"
                >
                  <span>{{ variable.label }}</span>
                </div>
                
                <!-- Mensaje si no hay resultados -->
                <div v-if="filteredVariables.length === 0 && variableSearch" class="dropdown-no-results">
                  No se encontraron variables
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
import { useYearFilter } from '@/composables/useYearFilter'
import { setActiveYear } from '@/dataConection/storageConfig'

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
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  availableYears: {
    type: Array,
    default: () => []
  },
  initialEntity: {
    type: [String, null],
    default: ''
  },
  initialYear: {
    type: [String, Number, null],
    default: null
  },
  initialVariable: {
    type: [Object, String, null],
    default: ''
  }
})

// Emits
const emit = defineEmits([
  'entity-change',
  'year-change', 
  'variable-change',
  'filters-change'
])

const {
  selectedYear,
  availableYears: composableYears,
  loadingYears,
  fetchAvailableYears,
  setSelectedYear: setYear,
  activeYear
} = useYearFilter()

const years = computed(() => {
  if (props.availableYears && props.availableYears.length > 0) {
    console.log('📅 Usando años de props.availableYears:', props.availableYears)
    return props.availableYears
  }
  console.log('📅 Usando años de composable:', composableYears.value)
  return composableYears.value
})

// Estados reactivos
const isSlideUp = ref(false)
const activeDropdown = ref(null)
const slideTimeout = ref(null)
const filterBarRef = ref(null)
const isAnimatingDown = ref(false)

// ✅ Estados de búsqueda para los 3 filtros
const entitySearch = ref('')
const yearSearch = ref('')
const variableSearch = ref('')

// Filtros seleccionados
const selectedEntity = ref('')
const selectedVariable = ref('')

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

// ✅ Array de variables para facilitar el filtrado
const variablesArray = computed(() => Object.values(variables))

// ✅ Computed: Entidades filtradas
const filteredEntities = computed(() => {
  if (!entitySearch.value) return props.entities
  
  const search = entitySearch.value.toLowerCase()
  return props.entities.filter(entity => 
    entity.name.toLowerCase().includes(search)
  )
})

// ✅ Computed para años filtrados
const filteredYears = computed(() => {
  if (!yearSearch.value) return years.value
  
  const search = yearSearch.value.toLowerCase()
  return years.value.filter(year => 
    String(year).toLowerCase().includes(search)
  )
})

// ✅ Computed para variables filtradas
const filteredVariables = computed(() => {
  if (!variableSearch.value) return variablesArray.value
  
  const search = variableSearch.value.toLowerCase()
  return variablesArray.value.filter(variable => 
    variable.label.toLowerCase().includes(search) ||
    variable.key.toLowerCase().includes(search) ||
    variable.description.toLowerCase().includes(search)
  )
})

const getEntityLabel = () => {
  if (selectedEntity.value === '') return '-'
  if (!selectedEntity.value || selectedEntity.value === null) return 'Todas las entidades (IFS Regional)'
  return selectedEntity.value
}

// ✅ NUEVO: Función para obtener el label del año
const getYearLabel = () => {
  if (selectedYear.value === '') return '-'
  if (selectedYear.value === null) return 'Todos los años'
  return selectedYear.value
}

const getVariableLabel = () => {
  if (selectedVariable.value === '') return '-'
  if (!selectedVariable.value || selectedVariable.value === null) return 'Todas las variables'
  return selectedVariable.value.key
}

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

const handleMouseEnter = () => {
  if (slideTimeout.value) {
    clearTimeout(slideTimeout.value)
    slideTimeout.value = null
  }
  isSlideUp.value = true
}

const handleMouseLeave = () => {
  if (props.isLocked) {
    console.log('🔒 Barra bloqueada, no se contrae al salir del mouse')
    return
  }
  
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
  
  // ✅ Limpiar búsquedas al cambiar de dropdown
  if (activeDropdown.value !== dropdownName) {
    entitySearch.value = ''
    yearSearch.value = ''
    variableSearch.value = ''
  }
  
  activeDropdown.value = activeDropdown.value === dropdownName ? null : dropdownName
  console.log('📂 Dropdown activo:', activeDropdown.value)
}

const closeAllDropdowns = () => {
  console.log('🚪 Cerrando todos los dropdowns')
  activeDropdown.value = null
  
  // ✅ Limpiar todas las búsquedas al cerrar
  entitySearch.value = ''
  yearSearch.value = ''
  variableSearch.value = ''
  
  if (props.isLocked) {
    console.log('🔒 Barra bloqueada, permanece expandida')
    return
  }
  
  slideTimeout.value = setTimeout(() => {
    isSlideUp.value = false
  }, 300)
}

const handleClickOutside = (event) => {
  if (!filterBarRef.value) return
  
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
  setYear(year)
  
  // ✅ MODIFICADO: Solo establecer activeYear si no es string vacío
  if (year !== '' && year !== null) {
    setActiveYear(year)
    console.log('📅 Año activo establecido:', year)
  } else if (year === null) {
    const yearToUse = years.value[0] || '2024'
    setActiveYear(yearToUse)
    console.log('📅 Año activo establecido (fallback):', yearToUse)
  }
  // Si year === '', no establecemos activeYear (se mantiene el anterior o ninguno)
  
  emit('year-change', year)
  emitFiltersChange()
  yearSearch.value = ''
  closeAllDropdowns()
}

const selectVariable = (variable) => {
  console.log('=== FILTRO: Variable seleccionada ===', variable)
  selectedVariable.value = variable
  emit('variable-change', variable)
  emitFiltersChange()
  variableSearch.value = ''
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

// Watches para sincronizar props
watch(() => props.initialEntity, (newValue) => {
  console.log('🔄 [FilterBar] initialEntity cambió a:', newValue)
  if (newValue !== selectedEntity.value) {
    selectedEntity.value = newValue
    console.log('✅ [FilterBar] selectedEntity sincronizado:', selectedEntity.value)
  }
}, { immediate: true })

watch(() => props.initialYear, (newValue) => {
  console.log('🔄 [FilterBar] initialYear cambió a:', newValue)
  if (newValue !== selectedYear.value) {
    setYear(newValue)
    console.log('✅ [FilterBar] selectedYear sincronizado:', selectedYear.value)
  }
}, { immediate: true })

watch(() => props.initialVariable, (newValue) => {
  console.log('🔄 [FilterBar] initialVariable cambió a:', newValue)
  if (newValue !== selectedVariable.value) {
    selectedVariable.value = newValue
    console.log('✅ [FilterBar] selectedVariable sincronizado:', selectedVariable.value)
  }
}, { immediate: true })

watch(() => props.isLocked, (newLocked, oldLocked) => {
  console.log('🔒 isLocked cambió de', oldLocked, 'a', newLocked)
  
  if (newLocked) {
    isSlideUp.value = true
    isAnimatingDown.value = false
    if (slideTimeout.value) {
      clearTimeout(slideTimeout.value)
      slideTimeout.value = null
    }
  } else if (oldLocked === true && newLocked === false) {
    console.log('📉 Iniciando animación de bajada...')
    isAnimatingDown.value = true
    
    setTimeout(() => {
      isAnimatingDown.value = false
      if (!selectedEntity.value && !activeDropdown.value) {
        isSlideUp.value = false
      }
      console.log('✅ Animación de bajada completada')
    }, 600)
  }
})

watch(() => props.selectedState, (newState) => {
  console.log('🔄 Sincronizando filtro con mapa. Estado:', newState)
  if (newState !== null && newState !== undefined) {
    selectedEntity.value = newState
  } else if (newState === null && selectedEntity.value !== '') {
    selectedEntity.value = newState
  }
})

watch(years, (newYears) => {
  console.log('🔄 [RetractableFilterBar] Computed years cambió a:', newYears)
}, { immediate: true })

watch(() => props.availableYears, (newYears, oldYears) => {
  console.log('🔄 [RetractableFilterBar] props.availableYears cambió')
  console.log('  - Anterior:', oldYears)
  console.log('  - Nuevo:', newYears)
}, { deep: true })

onMounted(async () => {
  console.log('✅ RetractableFilterBar montado')
  console.log('✅ Entidades recibidas:', props.entities.length)
  console.log('✅ Años en props:', props.availableYears)
  console.log('✅ initialEntity:', props.initialEntity)
  console.log('✅ initialYear:', props.initialYear)
  console.log('✅ initialVariable:', props.initialVariable)
  
  if (props.initialEntity !== undefined) {
    selectedEntity.value = props.initialEntity
  }
  if (props.initialVariable !== undefined) {
    selectedVariable.value = props.initialVariable
  }
  
  console.log('📅 Cargando años desde composable...')
  await fetchAvailableYears()
  console.log('📅 Años del composable cargados:', composableYears.value)
  
  if (props.initialYear !== null && props.initialYear !== undefined) {
    setYear(props.initialYear)
    if (props.initialYear !== '') {
      setActiveYear(props.initialYear)
    }
    console.log('📅 Usando año de props:', props.initialYear)
  } else if (years.value.length > 0) {
    const firstYear = years.value[0]
    setYear(firstYear)
    setActiveYear(firstYear)
    console.log('📅 Año por defecto establecido:', firstYear)
    
    emit('year-change', firstYear)
  } else {
    setActiveYear(activeYear.value)
    console.log('📅 Año activo inicial (fallback):', activeYear.value)
  }
  
  emitFiltersChange()
  
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  console.log('👋 RetractableFilterBar desmontándose')
  document.removeEventListener('click', handleClickOutside)
  
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
  z-index: 50;
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
  z-index: 50;
}

.filter-bar:hover,
.filter-bar.expanded,
.filter-bar.has-entity-selected {
  transform: translateY(-20px);
  cursor: default;
  z-index: 51;
}

.filter-bar.locked-expanded {
  transform: translateY(-20px) !important;
  cursor: default;
  z-index: 51;
  box-shadow: 0 6px 24px rgba(44, 82, 130, 0.4);
}

.filter-bar.animating-down {
  animation: slideDown 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
  cursor: default;
  z-index: 51;
}

@keyframes slideDown {
  0% {
    transform: translateY(-20px);
    box-shadow: 0 6px 24px rgba(44, 82, 130, 0.4);
  }
  100% {
    transform: translateY(calc(100% - 65px));
    box-shadow: 0 4px 20px rgba(44, 82, 130, 0.3);
  }
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

.dropdown-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-button:hover:not(:disabled),
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
  z-index: 1000;
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
  box-sizing: border-box;
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

.blank-option {
  color: #cbd5e0;
  font-size: 14px;
  text-align: center;
  width: 100%;
  display: block;
}

/* ✅ Mensaje cuando no hay resultados */
.dropdown-no-results {
  padding: 12px;
  text-align: center;
  color: #a0aec0;
  font-size: 13px;
  font-style: italic;
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

/* ✅ Variable menu más ancho para mostrar nombres completos */
.variable-menu {
  width: 280px;
  left: 50%;
  transform: translateX(-50%);
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
    transform: none;
  }
  
  .tooltip-select-entity {
    bottom: -50px;
    font-size: 11px;
    padding: 6px 12px;
  }
}
</style>