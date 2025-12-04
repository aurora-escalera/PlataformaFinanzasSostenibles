<!-- src/modules/maps/components/RetractableFilterBar.vue -->
<!-- ✅ MODIFICADO: Agregada opción "------------" en Entidad y Variable -->
<!-- ✅ ACTUALIZADO: Mantener barra expandida cuando isLocked es true -->
<!-- ✅ CORREGIDO: Usa computed para combinar props.availableYears y composable -->
<!-- ✅ NUEVO: Props initialEntity, initialYear, initialVariable para sincronizar filtros -->
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
                >
              </div>
              <div 
                class="dropdown-options" 
                @wheel.prevent="handleDropdownScroll"
              >
                <!-- ✅ NUEVO: Opción en blanco (default) -->
                <div 
                  @click="selectEntity('')"
                  class="dropdown-option"
                  :class="{ 'selected': selectedEntity === '' }"
                >
                  <span class="blank-option">-</span>
                </div>
                <div 
                  @click="selectEntity(null)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedEntity === null }"
                >
                  <span>Todas las entidades</span>
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
              :class="{ 'active': activeDropdown === 'año', 'has-selection': selectedYear !== null }"
              :disabled="loadingYears"
            >
              <span class="dropdown-text">
                {{ loadingYears ? 'Cargando...' : (selectedYear || 'Todos los años') }}
              </span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de años -->
            <div v-if="activeDropdown === 'año'" class="dropdown-menu">
              <div class="dropdown-options">
                <!-- Opción "Todos los años" -->
                <div 
                  @click="selectYear(null)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedYear === null }"
                >
                  <span>Todos los años</span>
                </div>
                
                <!-- ✅ CORREGIDO: Usa computed years que combina ambas fuentes -->
                <div 
                  v-for="year in years" 
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
              :class="{ 'active': activeDropdown === 'variable', 'has-selection': selectedVariable }"
            >
              <span class="dropdown-text">{{ getVariableLabel() }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <!-- Dropdown de variables -->
            <div v-if="activeDropdown === 'variable'" class="dropdown-menu variable-menu">
              <div class="dropdown-options">
                <!-- ✅ NUEVO: Opción en blanco (default) -->
                <div 
                  @click="selectVariable('')"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable === '' }"
                >
                  <span class="blank-option">-</span>
                </div>
                
                <!-- Todas -->
                <div 
                  @click="selectVariable(null)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable === null }"
                >
                  <span>Todas</span>
                </div>
                
                <!-- Presupuestos Sostenibles (PS) -->
                <div 
                  @click="selectVariable(variables.PS)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable?.key === 'PS' }"
                >
                  <span>Presupuestos Sostenibles (PS)</span>
                </div>
                
                <!-- Ingresos Intensivos en Carbono (IIC) -->
                <div 
                  @click="selectVariable(variables.IIC)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable?.key === 'IIC' }"
                >
                  <span>Ingresos Intensivos en Carbono (IIC)</span>
                </div>
                
                <!-- Presupuestos Intensivos en Carbono (PIC) -->
                <div 
                  @click="selectVariable(variables.PIC)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable?.key === 'PIC' }"
                >
                  <span>Presupuestos Intensivos en Carbono (PIC)</span>
                </div>
                
                <!-- Ingresos Sostenibles (IS) -->
                <div 
                  @click="selectVariable(variables.IS)"
                  class="dropdown-option"
                  :class="{ 'selected': selectedVariable?.key === 'IS' }"
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
  // ✅ NUEVAS PROPS para sincronizar filtros desde HomePage
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

// ✅ MANTENER: Composable completo para funcionalidad de carga
const {
  selectedYear,
  availableYears: composableYears,  // ← Renombrado para evitar conflicto
  loadingYears,
  fetchAvailableYears,
  setSelectedYear: setYear,
  activeYear
} = useYearFilter()

// ✅ NUEVO: Computed que da prioridad a props.availableYears, sino usa composableYears
const years = computed(() => {
  // Si props tiene años (viene de HomePage), usarlos
  if (props.availableYears && props.availableYears.length > 0) {
    console.log('📅 Usando años de props.availableYears:', props.availableYears)
    return props.availableYears
  }
  
  // Sino, usar los del composable (carga inicial)
  console.log('📅 Usando años de composable:', composableYears.value)
  return composableYears.value
})

// Estados reactivos
const isSlideUp = ref(false)
const activeDropdown = ref(null)
const entitySearch = ref('')
const slideTimeout = ref(null)
const filterBarRef = ref(null)
const isAnimatingDown = ref(false)

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

// Computed
const filteredEntities = computed(() => {
  if (!entitySearch.value) return props.entities
  
  const search = entitySearch.value.toLowerCase()
  return props.entities.filter(entity => 
    entity.name.toLowerCase().includes(search)
  )
})

const getEntityLabel = () => {
  if (selectedEntity.value === '') return '-'
  if (!selectedEntity.value || selectedEntity.value === null) return 'Todas las entidades'
  return selectedEntity.value
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
  
  activeDropdown.value = activeDropdown.value === dropdownName ? null : dropdownName
  console.log('📂 Dropdown activo:', activeDropdown.value)
}

const closeAllDropdowns = () => {
  console.log('🚪 Cerrando todos los dropdowns')
  activeDropdown.value = null
  
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
  
  // Actualizar el año activo en storageConfig
  const yearToUse = year || years.value[0] || '2024'
  setActiveYear(yearToUse)
  console.log('📅 Año activo establecido:', yearToUse)
  
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

// ✅ NUEVO: Watch para sincronizar initialEntity desde HomePage
watch(() => props.initialEntity, (newValue) => {
  console.log('🔄 [FilterBar] initialEntity cambió a:', newValue)
  if (newValue !== selectedEntity.value) {
    selectedEntity.value = newValue
    console.log('✅ [FilterBar] selectedEntity sincronizado:', selectedEntity.value)
  }
}, { immediate: true })

// ✅ NUEVO: Watch para sincronizar initialYear desde HomePage
watch(() => props.initialYear, (newValue) => {
  console.log('🔄 [FilterBar] initialYear cambió a:', newValue)
  if (newValue !== selectedYear.value) {
    setYear(newValue)
    console.log('✅ [FilterBar] selectedYear sincronizado:', selectedYear.value)
  }
}, { immediate: true })

// ✅ NUEVO: Watch para sincronizar initialVariable desde HomePage
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

// ✅ Watch de debug para ver qué años se usan
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
  
  // ✅ Sincronizar con props iniciales
  if (props.initialEntity !== undefined) {
    selectedEntity.value = props.initialEntity
  }
  if (props.initialVariable !== undefined) {
    selectedVariable.value = props.initialVariable
  }
  
  // Cargar años disponibles desde Google Sheets (para carga inicial)
  console.log('📅 Cargando años desde composable...')
  await fetchAvailableYears()
  console.log('📅 Años del composable cargados:', composableYears.value)
  
  // Establecer el primer año como default solo si no hay initialYear
  if (props.initialYear !== null && props.initialYear !== undefined) {
    setYear(props.initialYear)
    setActiveYear(props.initialYear)
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

.filter-bar.locked-expanded {
  transform: translateY(-20px) !important;
  cursor: default;
  z-index: 1;
  box-shadow: 0 6px 24px rgba(44, 82, 130, 0.4);
}

.filter-bar.animating-down {
  animation: slideDown 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
  cursor: default;
  z-index: 1;
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

.blank-option {
  color: #cbd5e0;
  font-size: 14px;
  text-align: center;
  width: 100%;
  display: block;
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