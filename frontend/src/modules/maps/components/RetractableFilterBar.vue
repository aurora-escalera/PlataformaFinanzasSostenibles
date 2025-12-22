<!-- src/modules/maps/components/RetractableFilterBar.vue -->
<template>
  <div class="filter-bar-container">
    <!-- Barra de filtros principal (DESKTOP) -->
    <div ref="filterBarRef" class="filter-bar" :class="{ 'expanded': isSlideUp || activeDropdown, 'has-entity-selected': selectedEntity, 'locked-expanded': props.isLocked, 'animating-down': isAnimatingDown }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <div class="filter-content">
        <!-- Filtro Entidad -->
        <div class="filter-group">
          <label class="filter-label">Entidad</label>
          <div class="filter-dropdown">
            <button @click="toggleDropdown('entidad')" class="dropdown-button" :class="{ 'active': activeDropdown === 'entidad', 'has-selection': selectedEntity }">
              <span class="dropdown-text">{{ getEntityLabel() }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            <span class="filter-tooltip">Elige una entidad específica o los 'Datos Regionales' para ver las gráficas correspondientes</span>
            <div v-if="activeDropdown === 'entidad'" class="dropdown-menu">
              <div class="dropdown-search">
                <input v-model="entitySearch" placeholder="Buscar entidad..." class="search-input" @click.stop>
              </div>
              <div class="dropdown-options">
                <div v-if="!entitySearch" @click="selectEntity(null)" class="dropdown-option" :class="{ 'selected': selectedEntity === null }">
                  <span>Datos Regionales</span>
                </div>
                <div v-for="entity in filteredEntities" :key="entity.name" @click="selectEntity(entity.name)" class="dropdown-option" :class="{ 'selected': selectedEntity === entity.name && selectedEntity !== '' && selectedEntity !== null }">
                  <span>{{ entity.name }}</span>
                </div>
                <div v-if="!entitySearch" @click="selectEntity('')" class="dropdown-option blank-option-row" :class="{ 'selected': selectedEntity === '' }">
                  <span class="blank-option">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtro Año -->
        <div class="filter-group">
          <label class="filter-label">Año</label>
          <div class="filter-dropdown">
            <button @click="toggleDropdown('año')" class="dropdown-button" :class="{ 'active': activeDropdown === 'año', 'has-selection': selectedYear !== null }" :disabled="loadingYears">
              <span class="dropdown-text">{{ loadingYears ? 'Cargando...' : getYearLabel() }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            <span class="filter-tooltip">Elige uno de los años para ver los datos</span>
            <div v-if="activeDropdown === 'año'" class="dropdown-menu">
              <div class="dropdown-search">
                <input v-model="yearSearch" placeholder="Buscar año..." class="search-input" @click.stop>
              </div>
              <div class="dropdown-options">
                <div v-if="!yearSearch && selectedEntity !== ''" @click="selectYear(null)" class="dropdown-option" :class="{ 'selected': selectedYear === null }">
                  <span>Todos los años</span>
                </div>
                <div v-for="year in filteredYears" :key="year" @click="selectYear(year)" class="dropdown-option" :class="{ 'selected': selectedYear === year }">
                  <span>{{ year }}</span>
                </div>
                <div v-if="filteredYears.length === 0 && yearSearch" class="dropdown-no-results">No se encontraron años</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtro Variable -->
        <div class="filter-group filter-group-last">
          <label class="filter-label">Variable</label>
          <div class="filter-dropdown">
            <button @click="toggleDropdown('variable')" class="dropdown-button" :class="{ 'active': activeDropdown === 'variable', 'has-selection': selectedVariable !== null }">
              <span class="dropdown-text">{{ getVariableLabel() }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            <span class="filter-tooltip">Selecciona una variable para ver los datos correspondientes</span>
            <div v-if="activeDropdown === 'variable'" class="dropdown-menu variable-menu">
              <div class="dropdown-search">
                <input v-model="variableSearch" placeholder="Buscar variable..." class="search-input" @click.stop>
              </div>
              <div class="dropdown-options">
                <div v-if="!variableSearch" class="dropdown-option-wrapper">
                  <div @click="selectVariable(null)" class="dropdown-option" :class="{ 'selected': selectedVariable === null }">
                    <span>Todas las variables</span>
                  </div>
                  <span class="option-tooltip">Vista integral de Ingresos Sostenibles, Ingresos Intensivos en Carbono, Presupuestos Sostenibles y Presupuestos Intensivos en Carbono</span>
                </div>
                <div v-for="variable in filteredVariables" :key="variable.key" class="dropdown-option-wrapper">
                  <div @click="selectVariable(variable)" class="dropdown-option" :class="{ 'selected': selectedVariable?.key === variable.key }">
                    <span>{{ variable.label }}</span>
                  </div>
                  <span class="option-tooltip">{{ tooltips.variables[variable.key] }}</span>
                </div>
                <div v-if="filteredVariables.length === 0 && variableSearch" class="dropdown-no-results">No se encontraron variables</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOBILE: Overlay -->
    <Transition name="overlay-fade">
      <div v-if="isMobileDrawerOpen" class="mobile-overlay" @click="closeMobileDrawer" />
    </Transition>

    <!-- MOBILE: Drawer -->
    <Transition name="drawer-slide">
      <div v-if="isMobileDrawerOpen" class="mobile-drawer">
        <div class="drawer-header">
          <h3 class="drawer-title">Filtros</h3>
          <button class="drawer-close" @click="closeMobileDrawer" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="drawer-content">
          <!-- Filtro Entidad Mobile -->
          <div class="drawer-filter-group">
            <label class="drawer-filter-label">Entidad</label>
            <p class="drawer-filter-hint">{{ tooltips.entity }}</p>
            <div class="drawer-filter-dropdown">
              <button @click="toggleMobileDropdown('entidad')" class="drawer-dropdown-button" :class="{ 'active': mobileActiveDropdown === 'entidad', 'has-selection': selectedEntity }">
                <span class="drawer-dropdown-text">{{ getEntityLabel() }}</span>
                <span class="drawer-dropdown-arrow" :class="{ 'rotated': mobileActiveDropdown === 'entidad' }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>
              <Transition name="dropdown-expand">
                <div v-if="mobileActiveDropdown === 'entidad'" class="drawer-dropdown-menu">
                  <div class="drawer-dropdown-search">
                    <input v-model="entitySearch" placeholder="Buscar entidad..." class="drawer-search-input" @click.stop>
                  </div>
                  <div class="drawer-dropdown-options">
                    <div v-if="!entitySearch" @click="selectEntityMobile(null)" class="drawer-dropdown-option" :class="{ 'selected': selectedEntity === null }">
                      <span>Datos Regionales</span>
                      <span v-if="selectedEntity === null" class="check-icon">✓</span>
                    </div>
                    <div v-for="entity in filteredEntities" :key="entity.name" @click="selectEntityMobile(entity.name)" class="drawer-dropdown-option" :class="{ 'selected': selectedEntity === entity.name && selectedEntity !== '' && selectedEntity !== null }">
                      <span>{{ entity.name }}</span>
                      <span v-if="selectedEntity === entity.name" class="check-icon">✓</span>
                    </div>
                    <div v-if="!entitySearch" @click="selectEntityMobile('')" class="drawer-dropdown-option blank-option-mobile" :class="{ 'selected': selectedEntity === '' }">
                      <span>Sin selección</span>
                      <span v-if="selectedEntity === ''" class="check-icon">✓</span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Filtro Año Mobile -->
          <div class="drawer-filter-group">
            <label class="drawer-filter-label">Año</label>
            <p class="drawer-filter-hint">{{ tooltips.year }}</p>
            <div class="drawer-filter-dropdown">
              <button @click="toggleMobileDropdown('año')" class="drawer-dropdown-button" :class="{ 'active': mobileActiveDropdown === 'año', 'has-selection': selectedYear !== null }" :disabled="loadingYears">
                <span class="drawer-dropdown-text">{{ loadingYears ? 'Cargando...' : getYearLabel() }}</span>
                <span class="drawer-dropdown-arrow" :class="{ 'rotated': mobileActiveDropdown === 'año' }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>
              <Transition name="dropdown-expand">
                <div v-if="mobileActiveDropdown === 'año'" class="drawer-dropdown-menu">
                  <div class="drawer-dropdown-search">
                    <input v-model="yearSearch" placeholder="Buscar año..." class="drawer-search-input" @click.stop>
                  </div>
                  <div class="drawer-dropdown-options">
                    <div v-if="!yearSearch && selectedEntity !== ''" @click="selectYearMobile(null)" class="drawer-dropdown-option" :class="{ 'selected': selectedYear === null }">
                      <span>Todos los años</span>
                      <span v-if="selectedYear === null" class="check-icon">✓</span>
                    </div>
                    <div v-for="year in filteredYears" :key="year" @click="selectYearMobile(year)" class="drawer-dropdown-option" :class="{ 'selected': selectedYear === year }">
                      <span>{{ year }}</span>
                      <span v-if="selectedYear === year" class="check-icon">✓</span>
                    </div>
                    <div v-if="filteredYears.length === 0 && yearSearch" class="drawer-dropdown-no-results">No se encontraron años</div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Filtro Variable Mobile -->
          <div class="drawer-filter-group">
            <label class="drawer-filter-label">Variable</label>
            <p class="drawer-filter-hint">{{ getVariableTooltip() }}</p>
            <div class="drawer-filter-dropdown">
              <button @click="toggleMobileDropdown('variable')" class="drawer-dropdown-button" :class="{ 'active': mobileActiveDropdown === 'variable', 'has-selection': selectedVariable !== null }">
                <span class="drawer-dropdown-text">{{ getVariableLabel() }}</span>
                <span class="drawer-dropdown-arrow" :class="{ 'rotated': mobileActiveDropdown === 'variable' }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>
              <Transition name="dropdown-expand">
                <div v-if="mobileActiveDropdown === 'variable'" class="drawer-dropdown-menu">
                  <div class="drawer-dropdown-search">
                    <input v-model="variableSearch" placeholder="Buscar variable..." class="drawer-search-input" @click.stop>
                  </div>
                  <div class="drawer-dropdown-options">
                    <div v-if="!variableSearch" @click="selectVariableMobile(null)" class="drawer-dropdown-option" :class="{ 'selected': selectedVariable === null }">
                      <div class="option-with-desc">
                        <span>Todas las variables</span>
                        <span class="option-desc">{{ tooltips.variables.all }}</span>
                      </div>
                      <span v-if="selectedVariable === null" class="check-icon">✓</span>
                    </div>
                    <div v-for="variable in filteredVariables" :key="variable.key" @click="selectVariableMobile(variable)" class="drawer-dropdown-option" :class="{ 'selected': selectedVariable?.key === variable.key }">
                      <div class="option-with-desc">
                        <span>{{ variable.label }}</span>
                        <span class="option-desc">{{ tooltips.variables[variable.key] }}</span>
                      </div>
                      <span v-if="selectedVariable?.key === variable.key" class="check-icon">✓</span>
                    </div>
                    <div v-if="filteredVariables.length === 0 && variableSearch" class="drawer-dropdown-no-results">No se encontraron variables</div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <div class="drawer-footer">
          <button class="drawer-btn-clear" @click="clearAllFilters">Limpiar filtros</button>
          <button class="drawer-btn-apply" @click="closeMobileDrawer">Aplicar</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useYearFilter } from '@/composables/useYearFilter'
import { setActiveYear } from '@/dataConection/storageConfig'

const props = defineProps({
  entities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selectedState: { type: String, default: null },
  isLocked: { type: Boolean, default: false },
  availableYears: { type: Array, default: () => [] },
  initialEntity: { type: [String, null], default: '' },
  initialYear: { type: [String, Number, null], default: null },
  initialVariable: { type: [Object, String, null], default: null }
})

const emit = defineEmits(['entity-change', 'year-change', 'variable-change', 'filters-change'])

const { selectedYear, availableYears: composableYears, loadingYears, fetchAvailableYears, setSelectedYear: setYear, activeYear } = useYearFilter()

const years = computed(() => props.availableYears?.length > 0 ? props.availableYears : composableYears.value)

// ============================================================================
// TOOLTIPS - Mensajes de descripción
// ============================================================================
const tooltips = {
  entity: "Elige una entidad específica o los 'Datos Regionales' para ver las gráficas correspondientes",
  year: "Elige uno de los años para ver los datos",
  variables: {
    all: "Vista integral de Ingresos Sostenibles, Ingresos Intensivos en Carbono, Presupuestos Sostenibles y Presupuestos Intensivos en Carbono",
    IS: "Ingresos provenientes de fuentes renovables y actividades económicas de bajo impacto ambiental",
    IIC: "Ingresos derivados de actividades con alta emisión de carbono como hidrocarburos y minería",
    PS: "Gasto público destinado a programas ambientales, energías limpias y desarrollo sustentable",
    PIC: "Gasto público asignado a sectores con alta huella de carbono"
  }
}

// Función para obtener el tooltip de la variable actual
const getVariableTooltip = () => {
  if (!selectedVariable.value) {
    return tooltips.variables.all
  }
  return tooltips.variables[selectedVariable.value.key] || ''
}

const isSlideUp = ref(false)
const activeDropdown = ref(null)
const slideTimeout = ref(null)
const filterBarRef = ref(null)
const isAnimatingDown = ref(false)
const entitySearch = ref('')
const yearSearch = ref('')
const variableSearch = ref('')
const selectedEntity = ref('')
const selectedVariable = ref(null)
const isMobileDrawerOpen = ref(false)
const mobileActiveDropdown = ref(null)

const hasActiveFilters = computed(() => selectedEntity.value !== '' || selectedYear.value !== null || selectedVariable.value !== null)
const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedEntity.value !== '' && selectedEntity.value !== null) count++
  if (selectedYear.value !== null) count++
  if (selectedVariable.value !== null) count++
  return count
})

const openMobileDrawer = () => { isMobileDrawerOpen.value = true; document.body.style.overflow = 'hidden' }
const closeMobileDrawer = () => { isMobileDrawerOpen.value = false; mobileActiveDropdown.value = null; document.body.style.overflow = ''; entitySearch.value = ''; yearSearch.value = ''; variableSearch.value = '' }
const toggleMobileDropdown = (name) => { mobileActiveDropdown.value = mobileActiveDropdown.value === name ? null : name; entitySearch.value = ''; yearSearch.value = ''; variableSearch.value = '' }

const selectEntityMobile = (entityName) => {
  const prev = selectedEntity.value
  selectedEntity.value = entityName
  emit('entity-change', entityName)
  if (prev === null && entityName !== null && entityName !== '' && selectedYear.value === null && years.value.length > 0) {
    const fy = years.value[0]; setYear(fy); setActiveYear(fy); emit('year-change', fy)
  }
  emitFiltersChange(); entitySearch.value = ''; mobileActiveDropdown.value = null
}

const selectYearMobile = (year) => { setYear(year); setActiveYear(year !== null ? year : (years.value[0] || '2024')); emit('year-change', year); emitFiltersChange(); yearSearch.value = ''; mobileActiveDropdown.value = null }
const selectVariableMobile = (variable) => { selectedVariable.value = variable; emit('variable-change', variable); emitFiltersChange(); variableSearch.value = ''; mobileActiveDropdown.value = null }
const clearAllFilters = () => { selectedEntity.value = ''; setYear(null); selectedVariable.value = null; emit('entity-change', ''); emit('year-change', null); emit('variable-change', null); emitFiltersChange() }

const variables = {
  PS: { key: 'PS', label: 'Presupuestos Sostenibles (PS)', description: 'Presupuestos Sostenibles', category: 'presupuestos', barVariables: ['PS', 'PT'], donutType: 'PS' },
  IIC: { key: 'IIC', label: 'Ingresos Intensivos en Carbono (IIC)', description: 'Ingresos Intensivos en Carbono', category: 'ingresos', barVariables: ['IIC', 'IT'], donutType: 'IIC' },
  PIC: { key: 'PIC', label: 'Presupuestos Intensivos en Carbono (PIC)', description: 'Presupuestos Intensivos en Carbono', category: 'presupuestos', barVariables: ['PIC', 'PT'], donutType: 'PIC' },
  IS: { key: 'IS', label: 'Ingresos Sostenibles (IS)', description: 'Ingresos Sostenibles', category: 'ingresos', barVariables: ['IS', 'IT'], donutType: 'IS' }
}
const variablesArray = computed(() => Object.values(variables))

const filteredEntities = computed(() => !entitySearch.value ? props.entities : props.entities.filter(e => e.name.toLowerCase().includes(entitySearch.value.toLowerCase())))
const filteredYears = computed(() => !yearSearch.value ? years.value : years.value.filter(y => String(y).toLowerCase().includes(yearSearch.value.toLowerCase())))
const filteredVariables = computed(() => { if (!variableSearch.value) return variablesArray.value; const s = variableSearch.value.toLowerCase(); return variablesArray.value.filter(v => v.label.toLowerCase().includes(s) || v.key.toLowerCase().includes(s)) })

const getEntityLabel = () => { if (selectedEntity.value === '') return '-'; if (!selectedEntity.value || selectedEntity.value === null) return 'Datos regionales'; return selectedEntity.value }
const getYearLabel = () => selectedYear.value === null ? 'Todos los años' : selectedYear.value
const getVariableLabel = () => !selectedVariable.value ? 'Todas las variables' : selectedVariable.value.key

const handleMouseEnter = () => { if (slideTimeout.value) { clearTimeout(slideTimeout.value); slideTimeout.value = null }; isSlideUp.value = true }
const handleMouseLeave = () => { if (props.isLocked) return; if (!activeDropdown.value && !selectedEntity.value) slideTimeout.value = setTimeout(() => { isSlideUp.value = false }, 300) }

const toggleDropdown = (name) => { isSlideUp.value = true; if (slideTimeout.value) { clearTimeout(slideTimeout.value); slideTimeout.value = null }; if (activeDropdown.value !== name) { entitySearch.value = ''; yearSearch.value = ''; variableSearch.value = '' }; activeDropdown.value = activeDropdown.value === name ? null : name }
const closeAllDropdowns = () => { activeDropdown.value = null; entitySearch.value = ''; yearSearch.value = ''; variableSearch.value = ''; if (props.isLocked) return; slideTimeout.value = setTimeout(() => { isSlideUp.value = false }, 300) }
const handleClickOutside = (e) => { if (filterBarRef.value && !filterBarRef.value.contains(e.target) && activeDropdown.value) closeAllDropdowns() }

const selectEntity = (entityName) => { const prev = selectedEntity.value; selectedEntity.value = entityName; emit('entity-change', entityName); if (prev === null && entityName !== null && entityName !== '' && selectedYear.value === null && years.value.length > 0) { const fy = years.value[0]; setYear(fy); setActiveYear(fy); emit('year-change', fy) }; emitFiltersChange(); entitySearch.value = ''; closeAllDropdowns() }
const selectYear = (year) => { setYear(year); setActiveYear(year !== null ? year : (years.value[0] || '2024')); emit('year-change', year); emitFiltersChange(); yearSearch.value = ''; closeAllDropdowns() }
const selectVariable = (variable) => { selectedVariable.value = variable; emit('variable-change', variable); emitFiltersChange(); variableSearch.value = ''; closeAllDropdowns() }
const emitFiltersChange = () => { emit('filters-change', { entity: selectedEntity.value, year: selectedYear.value, variable: selectedVariable.value }) }

watch(() => props.initialEntity, (v) => { if (v !== selectedEntity.value) selectedEntity.value = v }, { immediate: true })
watch(() => props.initialYear, (v) => { if (v !== selectedYear.value) setYear(v) }, { immediate: true })
watch(() => props.initialVariable, (v) => { if (v !== selectedVariable.value) selectedVariable.value = v }, { immediate: true })
watch(() => props.isLocked, (n, o) => { if (n) { isSlideUp.value = true; isAnimatingDown.value = false; if (slideTimeout.value) { clearTimeout(slideTimeout.value); slideTimeout.value = null } } else if (o === true && n === false) { isAnimatingDown.value = true; setTimeout(() => { isAnimatingDown.value = false; if (!selectedEntity.value && !activeDropdown.value) isSlideUp.value = false }, 600) } })
watch(() => props.selectedState, (s) => { if (s !== null && s !== undefined) selectedEntity.value = s; else if (s === null && selectedEntity.value !== '') selectedEntity.value = s })

defineExpose({ openMobileDrawer, closeMobileDrawer, isMobileDrawerOpen, hasActiveFilters, activeFiltersCount })

onMounted(async () => {
  if (props.initialEntity !== undefined) selectedEntity.value = props.initialEntity
  if (props.initialVariable !== undefined) selectedVariable.value = props.initialVariable
  await fetchAvailableYears()
  if (props.initialYear !== null && props.initialYear !== undefined) { setYear(props.initialYear); if (props.initialYear !== '') setActiveYear(props.initialYear) }
  else if (years.value.length > 0) { const fy = years.value[0]; setYear(fy); setActiveYear(fy); emit('year-change', fy) }
  else { setActiveYear(activeYear.value) }
  emitFiltersChange()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => { document.removeEventListener('click', handleClickOutside); document.body.style.overflow = ''; if (slideTimeout.value) clearTimeout(slideTimeout.value) })
</script>

<style scoped>
/* ========== DESKTOP STYLES ========== */
.filter-bar-container { position: relative; left: 19.6px; top: 0; width: 100%; height: 110px; margin: 0; padding: 0; z-index: 50; }
.filter-bar { background: #053759; color: white; padding: 15px 0; border-radius: 15px 15px 0 0; box-shadow: 0 4px 20px rgba(44,82,130,0.3); transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); position: absolute; bottom: -20px; left: 0; right: 0; width: 100%; cursor: pointer; transform: translateY(calc(100% - 65px)); z-index: 50; }
.filter-bar:hover, .filter-bar.expanded, .filter-bar.has-entity-selected { transform: translateY(-20px); cursor: default; z-index: 51; }
.filter-bar.locked-expanded { transform: translateY(-20px) !important; cursor: default; z-index: 51; box-shadow: 0 6px 24px rgba(44,82,130,0.4); }
.filter-bar.animating-down { animation: slideDown 0.6s cubic-bezier(0.4,0,0.2,1) forwards; cursor: default; z-index: 51; }
@keyframes slideDown { 0% { transform: translateY(-20px); box-shadow: 0 6px 24px rgba(44,82,130,0.4); } 100% { transform: translateY(calc(100% - 65px)); box-shadow: 0 4px 20px rgba(44,82,130,0.3); } }
.filter-content { display: flex; top: 100px; gap: 32px; flex-wrap: wrap; justify-content: center; }
.filter-group { position: relative; min-width: 140px; flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; }
.filter-group::after { content: '|'; position: absolute; right: -32px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 300; z-index: 100; }
.filter-group-last::after { display: none; }
.filter-label { display: block; font-size: 14px; font-weight: 200; margin-bottom: 10px; color: #e2e8f0; letter-spacing: 0.5px; font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; width: 100%; text-align: center; height: 20px; line-height: 20px; }
.filter-dropdown { position: relative; display: flex; justify-content: center; width: 100%; flex-direction: column; align-items: center; }

/* ========== TOOLTIP PERSONALIZADO ========== */
.filter-tooltip {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: #1e3a5f;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 400;
  white-space: normal;
  width: 220px;
  text-align: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.4);
  pointer-events: none;
  line-height: 1.4;
}

/* Flecha apuntando hacia arriba */
.filter-tooltip::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: #1e3a5f;
}

/* Mostrar tooltip en hover del dropdown-button */
.dropdown-button:hover + .filter-tooltip {
  opacity: 1;
  visibility: visible;
}

/* Ocultar tooltip cuando el dropdown está abierto */
.dropdown-button.active + .filter-tooltip {
  opacity: 0 !important;
  visibility: hidden !important;
}

.dropdown-button { opacity: 80%; width: 180px; background: rgba(255,255,255,0.95); border: 2px solid rgba(255,255,255,0.3); color: hsl(218,23%,23%); padding: 8px 16px; border-radius: 25px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s ease; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.dropdown-button:disabled { opacity: 0.5; cursor: not-allowed; }
.dropdown-button:hover:not(:disabled), .dropdown-button.active, .dropdown-button.has-selection { background: rgba(255,255,255,1); border-color: rgba(255,255,255,0.6); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.dropdown-text { flex: 1; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #4a5568; font-weight: 200; font-size: 13px; font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
.dropdown-arrow { font-size: 12px; transition: transform 0.2s ease; color: #718096; }
.dropdown-button.active .dropdown-arrow { transform: rotate(180deg); }
.dropdown-menu { position: absolute; top: 100%; left: 0; width: 100%; background: white; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); margin-top: 8px; overflow: hidden; animation: dropdownFadeIn 0.2s ease; z-index: 1000; }
@keyframes dropdownFadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.dropdown-search { padding: 8px; border-bottom: 1px solid #e2e8f0; }
.search-input { width: 100%; padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; font-size: 14px; font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-weight: 200; box-sizing: border-box; }
.search-input:focus { border-color: #4299e1; box-shadow: 0 0 0 3px rgba(66,153,225,0.1); }
.dropdown-options { max-height: 200px; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
.dropdown-options::-webkit-scrollbar { width: 6px; }
.dropdown-options::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.dropdown-options::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
.dropdown-option { padding: 8px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: #2d3748; transition: background 0.2s ease; border-bottom: 1px solid #f7fafc; font-size: 13px; font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-weight: 200; }
.dropdown-option:hover { background: #d0d2d4; }
.dropdown-option.selected { background: #f1f2f3; font-weight: 600; }
.dropdown-option:last-child { border-bottom: none; }
.blank-option { color: #cbd5e0; font-size: 14px; text-align: center; width: 100%; display: block; }
.blank-option-row { border-top: 1px solid #e2e8f0; margin-top: 4px; padding-top: 10px; border-bottom: none; }

/* ========== WRAPPER Y TOOLTIP PARA OPCIONES DEL DROPDOWN ========== */
.dropdown-option-wrapper {
  position: relative;
}

.option-tooltip {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: #1e3a5f;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 400;
  white-space: normal;
  width: 200px;
  text-align: left;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.4);
  pointer-events: none;
  line-height: 1.4;
}

.option-tooltip::after {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: #1e3a5f;
}

.dropdown-option-wrapper:hover .option-tooltip {
  opacity: 1;
  visibility: visible;
}

.dropdown-no-results { padding: 12px; text-align: center; color: #a0aec0; font-size: 13px; font-style: italic; }
.variable-menu { width: 280px; left: 50%; transform: translateX(-50%); }

/* ========== MOBILE OVERLAY ========== */
.mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 1001; }

/* ========== MOBILE DRAWER ========== */
.mobile-drawer { display: none; position: fixed; top: 0; right: 0; width: 120vw; height: 100%; height: 100dvh; background: #fff; box-shadow: -8px 0 32px rgba(0,0,0,0.15); z-index: 1002; flex-direction: column; overflow: hidden; overflow-y: auto; overscroll-behavior: contain; }
.drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: linear-gradient(135deg,#053759 0%,#0a4d7a 100%); color: white; flex-shrink: 0; }
.drawer-title { margin: 0; font-size: 18px; font-weight: 600; font-family: system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
.drawer-close { background: rgba(255,255,255,0.15); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0; }
.drawer-close:hover { background: rgba(255,255,255,0.25); }
.drawer-content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 24px; display: flex; flex-direction: column; gap: 20px; -webkit-overflow-scrolling: touch; }
.drawer-filter-group { display: flex; flex-direction: column; gap: 8px; }
.drawer-filter-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

/* NUEVO: Hint/descripción en móvil */
.drawer-filter-hint {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.drawer-dropdown-button { width: 100%; padding: 14px 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s ease; box-sizing: border-box; }
.drawer-dropdown-button:hover { border-color: #cbd5e0; background: #f1f5f9; }
.drawer-dropdown-button.active, .drawer-dropdown-button.has-selection { border-color: #053759; background: #f0f9ff; }
.drawer-dropdown-text { font-size: 14px; font-weight: 500; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; text-align: left; }
.drawer-dropdown-arrow { color: #64748b; transition: transform 0.3s ease; display: flex; flex-shrink: 0; }
.drawer-dropdown-arrow.rotated { transform: rotate(180deg); }
.drawer-dropdown-menu { margin-top: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); max-width: 100%; }
.drawer-dropdown-search { padding: 12px; border-bottom: 1px solid #e2e8f0; }
.drawer-search-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.drawer-search-input:focus { border-color: #053759; box-shadow: 0 0 0 3px rgba(5,55,89,0.1); }
.drawer-dropdown-options { max-height: 200px; overflow-y: auto; overflow-x: hidden; }
.drawer-dropdown-option { padding: 14px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; color: #334155; font-size: 14px; transition: background 0.15s ease; border-bottom: 1px solid #f1f5f9; word-break: break-word; }
.drawer-dropdown-option:last-child { border-bottom: none; }
.drawer-dropdown-option:hover { background: #f8fafc; }
.drawer-dropdown-option.selected { background: #f0f9ff; color: #053759; font-weight: 600; }
.check-icon { color: #053759; font-weight: 700; flex-shrink: 0; }
.drawer-dropdown-no-results { padding: 16px; text-align: center; color: #94a3b8; font-size: 13px; }
.blank-option-mobile { border-top: 1px solid #e2e8f0; margin-top: 4px; }

/* NUEVO: Opción con descripción en móvil */
.option-with-desc {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.option-desc {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 400;
  line-height: 1.3;
}

.drawer-footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; flex-shrink: 0; }
.drawer-btn-clear { flex: 1; padding: 14px 20px; background: transparent; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.2s ease; }
.drawer-btn-clear:hover { border-color: #cbd5e0; background: #f1f5f9; }
.drawer-btn-apply { flex: 1; padding: 14px 20px; background: linear-gradient(135deg,#053759 0%,#0a4d7a 100%); border: none; border-radius: 10px; font-size: 14px; font-weight: 600; color: white; cursor: pointer; transition: all 0.2s ease; }
.drawer-btn-apply:hover { box-shadow: 0 4px 12px rgba(5,55,89,0.3); }

/* ========== VUE TRANSITIONS ========== */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.3s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }
.drawer-slide-enter-active, .drawer-slide-leave-active { transition: transform 0.35s cubic-bezier(0.4,0,0.2,1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
.dropdown-expand-enter-active, .dropdown-expand-leave-active { transition: all 0.25s ease; }
.dropdown-expand-enter-from, .dropdown-expand-leave-to { opacity: 0; max-height: 0; }

/* ========== RESPONSIVE ========== */
@media (max-width: 1200px) { .filter-content { gap: 24px; } .dropdown-button { width: 160px; padding: 7px 14px; } .filter-group::after { right: -24px; } }
@media (max-width: 1024px) { .filter-content { gap: 20px; } .dropdown-button { width: 150px; padding: 6px 12px; font-size: 11px; } .dropdown-text { font-size: 12px; } .filter-group::after { right: -20px; font-size: 11px; } .filter-label { font-size: 13px; margin-bottom: 8px; } .variable-menu { width: 240px; } .filter-tooltip { font-size: 11px; width: 200px; padding: 8px 12px; } }
@media (max-width: 768px) { .filter-bar-container { height: 0; overflow: hidden !important; left: 0; width: 100%; } .filter-bar { display: none; } .mobile-overlay { display: block; } .mobile-drawer { display: flex; width: 105vw; height: 278vw;} }
@media (max-width: 480px) { .drawer-header { padding: 18px 20px; } .drawer-title { font-size: 17px; } .drawer-content { padding: 20px; gap: 18px; } .drawer-dropdown-button { padding: 12px 14px; } .drawer-dropdown-text { font-size: 13px; } .drawer-footer { padding: 14px 20px; } .drawer-btn-clear, .drawer-btn-apply { padding: 12px 16px; font-size: 13px; } }
@media (max-width: 400px) { .drawer-header { padding: 16px 18px; } .drawer-title { font-size: 16px; } .drawer-close { width: 32px; height: 32px; } .drawer-content { padding: 18px; gap: 16px; } .drawer-filter-label { font-size: 11px; } .drawer-dropdown-button { padding: 11px 12px; border-radius: 10px; } .drawer-dropdown-text { font-size: 12px; } .drawer-dropdown-option { padding: 12px 14px; font-size: 13px; } .drawer-footer { padding: 12px 18px; gap: 10px; } .drawer-btn-clear, .drawer-btn-apply { padding: 11px 14px; font-size: 12px; } }
@media (max-width: 360px) { .drawer-header { padding: 14px 16px; } .drawer-title { font-size: 15px; } .drawer-content { padding: 16px; gap: 14px; } .drawer-search-input { padding: 8px 12px; font-size: 13px; } .drawer-dropdown-options { max-height: 180px; } .drawer-footer { padding: 10px 16px; } }
@media (max-width: 320px) { .drawer-header { padding: 12px 14px; } .drawer-title { font-size: 14px; } .drawer-close { width: 30px; height: 30px; } .drawer-content { padding: 14px; gap: 12px; } .drawer-filter-label { font-size: 10px; } .drawer-dropdown-button { padding: 10px 11px; } .drawer-dropdown-text { font-size: 11px; } .drawer-dropdown-option { padding: 10px 12px; font-size: 12px; } .drawer-dropdown-options { max-height: 160px; } .drawer-footer { flex-direction: column; gap: 8px; } .drawer-btn-clear, .drawer-btn-apply { width: 100%; padding: 12px; } }
@media (max-height: 500px) and (max-width: 768px) { .drawer-content { padding: 12px 16px; gap: 10px; } .drawer-filter-group { gap: 4px; } .drawer-dropdown-button { padding: 8px 12px; } .drawer-dropdown-options { max-height: 120px; } .drawer-footer { padding: 8px 16px; } }
</style>