<!-- src/modules/qualitativeIndicators/components/QualitativePanel.vue -->
<!-- ✅ CORREGIDO: Usa fetchRegionalSheetNames para indicadores regionales -->
<template>
  <div 
    class="qualitative-panel"
    :class="{ 'expanded': isExpanded }"
  >
    <!-- Vista colapsada (solo botón +) -->
    <div v-if="!isExpanded" class="collapsed-view">
      <div 
        class="expand-btn-wrapper"
        @mouseenter="handleTooltipEnter"
        @mouseleave="handleTooltipLeave"
        ref="expandBtnRef"
      >
        <div class="expand-btn" @click="togglePanel">
          +
        </div>
      </div>
    </div>
    
    <!-- Vista expandida (contenido completo) -->
    <div v-else class="expanded-view">
      <!-- ============================================ -->
      <!-- HEADER DINÁMICO -->
      <!-- ============================================ -->
      <div class="header-panel">
        <!-- NIVEL 1: Header original con hamburguesa y título -->
        <template v-if="!selectedDataType">
          <div class="hamburger-menu">
            <img src="/public/icons/white-hamburger.png" alt="hamburger-menu" class="hamburger-icon">
          </div>
          <h1 class="header-title">Indicadores Cualitativos</h1>
        </template>

        <!-- NIVEL 2+: Header con Volver e indicador -->
        <template v-else>
          <button class="header-back-btn" @click="handleBackToDataType">
            ← Volver
          </button>
          <div class="header-data-type-indicator">
            {{ selectedDataType === 'subnacional' ? 'DATOS SUBNACIONALES' : 'DATOS REGIONALES' }}
          </div>
        </template>

        <!-- Botón cerrar (siempre visible) -->
        <div 
          class="expand-btn-wrapper expanded-wrapper"
          @mouseenter="handleCollapseTooltipEnter"
          @mouseleave="handleCollapseTooltipLeave"
          ref="collapseBtnRef"
        >
          <div class="expand-btn" @click="togglePanel">
            −
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- NIVEL 1: Selección de tipo de datos -->
      <!-- ============================================ -->
      <div v-if="!selectedDataType" class="buttons-container">
        <div class="data-type-title">Selecciona el tipo de datos</div>
        <div class="qualitative-btn data-type-btn" @click.stop="selectDataType('subnacional')">
          <span class="title-btn">Datos Subnacionales</span>
          <span class="plus-btn">+</span>
        </div>
        <div class="qualitative-btn data-type-btn" @click.stop="selectDataType('regional')">
          <span class="title-btn">Datos Regionales</span>
          <span class="plus-btn">+</span>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- NIVEL 2: Categorías SUBNACIONALES -->
      <!-- ============================================ -->
      <div v-else-if="selectedDataType === 'subnacional' && !selectedCategory" class="buttons-container">
        <div class="qualitative-btn" @click.stop="handleCategoryClick('ambientales')">
          <span class="title-btn">Ambientales</span>
          <span class="plus-btn">+</span>
        </div>
        <div class="qualitative-btn" @click.stop="handleCategoryClick('economicos')">
          <span class="title-btn">Económicos</span>
          <span class="plus-btn">+</span>
        </div>
        <div class="qualitative-btn" @click.stop="handleCategoryClick('sociales')">
          <span class="title-btn">Sociales</span>
          <span class="plus-btn">+</span>                  
        </div>
        <div class="qualitative-btn" @click.stop="handleCategoryClick('presupuestos')">
          <span class="title-btn">Presupuestos y financiamiento</span>
          <span class="plus-btn">+</span>  
        </div>
        <div class="qualitative-btn" @click.stop="handleCategoryClick('gobernabilidad')">
          <span class="title-btn">Gobernabilidad y transparencia</span>
          <span class="plus-btn">+</span>  
        </div>
      </div>

      <!-- ============================================ -->
      <!-- NIVEL 2: Categorías REGIONALES -->
      <!-- ============================================ -->
      <div v-else-if="selectedDataType === 'regional' && !selectedCategory" class="buttons-container">
        <div class="qualitative-btn" @click.stop="handleCategoryClick('estatus-pais')">
          <span class="title-btn">Estatus del país</span>
          <span class="plus-btn">+</span>
        </div>
        <div class="qualitative-btn" @click.stop="handleCategoryClick('ambientales-regional')">
          <span class="title-btn">Indicadores ambientales</span>
          <span class="plus-btn">+</span>
        </div>
        <div class="qualitative-btn" @click.stop="handleCategoryClick('sociales-regional')">
          <span class="title-btn">Indicadores sociales</span>
          <span class="plus-btn">+</span>                  
        </div>
        <div class="qualitative-btn" @click.stop="handleCategoryClick('economicos-regional')">
          <span class="title-btn">Indicadores económicos</span>
          <span class="plus-btn">+</span>  
        </div>
        <div class="qualitative-btn" @click.stop="handleCategoryClick('financiamiento-sostenible')">
          <span class="title-btn">Financiamiento sostenible internacional</span>
          <span class="plus-btn">+</span>  
        </div>
      </div>

      <!-- ============================================ -->
      <!-- NIVEL 3: Componentes SUBNACIONALES -->
      <!-- ============================================ -->
      
      <!-- Ambientales Subnacional -->
      <div v-else-if="selectedDataType === 'subnacional' && selectedCategory === 'ambientales'" class="inner-card">
        <AmbientalesView 
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories" 
        />
      </div>

      <!-- Económicos Subnacional -->
      <div v-else-if="selectedDataType === 'subnacional' && selectedCategory === 'economicos'" class="inner-card">
        <EconomicosView
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories" 
        />
      </div>

      <!-- Sociales Subnacional -->
      <div v-else-if="selectedDataType === 'subnacional' && selectedCategory === 'sociales'" class="inner-card">
        <SocialesView
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories" 
        />
      </div>

      <!-- Presupuestos Subnacional -->
      <div v-else-if="selectedDataType === 'subnacional' && selectedCategory === 'presupuestos'" class="inner-card">
        <PresupuestosView
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories" 
        />
      </div>

      <!-- Gobernabilidad Subnacional -->
      <div v-else-if="selectedDataType === 'subnacional' && selectedCategory === 'gobernabilidad'" class="inner-card">
        <GobernabilidadView
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories" 
        />
      </div>

      <!-- ============================================ -->
      <!-- NIVEL 3: Componentes REGIONALES -->
      <!-- ============================================ -->

      <!-- Estatus del país -->
      <div v-else-if="selectedDataType === 'regional' && selectedCategory === 'estatus-pais'" class="inner-card">
        <EstatusPaisView 
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories"
          @years-loaded="handleRegionalYearsLoaded"
        />
      </div>

      <!-- Indicadores ambientales Regional -->
      <div v-else-if="selectedDataType === 'regional' && selectedCategory === 'ambientales-regional'" class="inner-card">
        <AmbientalesRegionalView
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories"
          @years-loaded="handleRegionalYearsLoaded"
        />
      </div>

      <!-- Indicadores sociales Regional -->
      <div v-else-if="selectedDataType === 'regional' && selectedCategory === 'sociales-regional'" class="inner-card">
        <SocialesRegionalView
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories"
          @years-loaded="handleRegionalYearsLoaded"
        />
      </div>

      <!-- Indicadores económicos Regional -->
      <div v-else-if="selectedDataType === 'regional' && selectedCategory === 'economicos-regional'" class="inner-card">
        <EconomicosRegionalView
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories"
          @years-loaded="handleRegionalYearsLoaded"
        />
      </div>

      <!-- Financiamiento sostenible internacional -->
      <div v-else-if="selectedDataType === 'regional' && selectedCategory === 'financiamiento-sostenible'" class="inner-card">
        <FinanciamientoRegionalView
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBackToCategories"
          @years-loaded="handleRegionalYearsLoaded"
        />
      </div>

    </div>

    <!-- ✅ TELEPORT: Tooltip del botón expandir -->
    <Teleport to="body">
      <div 
        v-if="showExpandTooltip"
        class="qualitative-tooltip"
        :style="expandTooltipStyle"
      >
        {{ expandTooltipMessage }}
      </div>
    </Teleport>

    <!-- ✅ TELEPORT: Tooltip del botón colapsar -->
    <Teleport to="body">
      <div 
        v-if="showCollapseTooltip"
        class="qualitative-tooltip"
        :style="collapseTooltipStyle"
      >
        Cerrar panel de indicadores cualitativos
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'

// ============================================
// COMPONENTES SUBNACIONALES (existentes)
// ============================================
import AmbientalesView from './AmbientalesView.vue'
import EconomicosView from './EconomicosView.vue'
import SocialesView from './SocialesView.vue'
import GobernabilidadView from './GobernabilidadView.vue'
import PresupuestosView from './PresupuestosView.vue'

// ============================================
// COMPONENTES REGIONALES
// ============================================
import EstatusPaisView from '../../qualitativeRegionalIndicators/EstatusPaisView.vue'
import AmbientalesRegionalView from '../../qualitativeRegionalIndicators/AmbientalesRegionalView.vue'
import SocialesRegionalView from '../../qualitativeRegionalIndicators/SocialesRegionalView.vue'
import EconomicosRegionalView from '../../qualitativeRegionalIndicators/EconomicosRegionalView.vue'
import FinanciamientoRegionalView from '../../qualitativeRegionalIndicators/FinanciamientoRegionalView.vue'

const props = defineProps({
  isExpanded: {
    type: Boolean,
    default: false
  },
  selectedEntity: {
    type: String,
    default: null
  },
  selectedYear: {
    type: [String, Number],
    default: null
  },
  currentDataView: {
    type: String,
    default: 'subnacional'
  }
})

const emit = defineEmits(['toggle', 'category-click', 'years-loaded', 'panel-closed', 'data-type-change'])

// ============================================
// ESTADO LOCAL
// ============================================
const selectedDataType = ref(null) // 'subnacional' | 'regional' | null
const selectedCategory = ref(null)

// ✅ Composable para obtener datos
const { fetchSheetNames, fetchRegionalSheetNames } = useStorageData()

// ============================================
// TOOLTIP CON TELEPORT
// ============================================
const expandBtnRef = ref(null)
const collapseBtnRef = ref(null)
const showExpandTooltip = ref(false)
const showCollapseTooltip = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const collapseTooltipPosition = ref({ x: 0, y: 0 })

const handleTooltipEnter = () => {
  if (expandBtnRef.value) {
    const rect = expandBtnRef.value.getBoundingClientRect()
    tooltipPosition.value = {
      x: rect.right + 12,
      y: rect.top + rect.height / 2
    }
  }
  showExpandTooltip.value = true
}

const handleTooltipLeave = () => {
  showExpandTooltip.value = false
}

const handleCollapseTooltipEnter = () => {
  if (collapseBtnRef.value) {
    const rect = collapseBtnRef.value.getBoundingClientRect()
    collapseTooltipPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 12
    }
  }
  showCollapseTooltip.value = true
}

const handleCollapseTooltipLeave = () => {
  showCollapseTooltip.value = false
}

const expandTooltipStyle = computed(() => ({
  position: 'fixed',
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`,
  transform: 'translateY(-50%)',
  zIndex: 99999
}))

const collapseTooltipStyle = computed(() => ({
  position: 'fixed',
  left: `${collapseTooltipPosition.value.x}px`,
  top: `${collapseTooltipPosition.value.y}px`,
  transform: 'translateX(-50%)',
  zIndex: 99999
}))

// ============================================
// COMPUTED: Mensaje dinámico del tooltip
// ============================================
const expandTooltipMessage = computed(() => {
  return 'Da clic aquí para ver los indicadores cualitativos'
})

// ============================================
// ✅ HANDLER PARA AÑOS CARGADOS DESDE COMPONENTES REGIONALES
// ============================================
const handleRegionalYearsLoaded = (years) => {
  console.log('📅 [QualitativePanel] Años recibidos de componente regional:', years)
  if (years && years.length > 0) {
    emit('years-loaded', years)
  }
}

// ============================================
// FUNCIONES DE CARGA DE AÑOS - SUBNACIONALES
// (Usan fetchSheetNames porque están en estructura plana)
// ============================================
const loadAmbientalesYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet AMBIENTALES...')
    const sheetNames = await fetchSheetNames('incendiosForestales')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años AMBIENTALES encontrados:', years)
    emit('years-loaded', years)
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años ambientales:', err)
  }
}

const loadEconomicosYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet ECONÓMICOS...')
    const sheetNames = await fetchSheetNames('ingresoTotal')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años ECONÓMICOS encontrados:', years)
    emit('years-loaded', years)
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años económicos:', err)
  }
}

const loadSocialesYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet SOCIALES...')
    const sheetNames = await fetchSheetNames('desocupacion')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años SOCIALES encontrados:', years)
    emit('years-loaded', years)
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años sociales:', err)
  }
}

const loadPresupuestosYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet PRESUPUESTOS...')
    const sheetNames = await fetchSheetNames('presupuestoEstatal')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años PRESUPUESTOS encontrados:', years)
    emit('years-loaded', years)
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años presupuestos:', err)
  }
}

const loadGobernabilidadYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet GOBERNABILIDAD...')
    const sheetNames = await fetchSheetNames('satisfaccionFederal')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años GOBERNABILIDAD encontrados:', years)
    emit('years-loaded', years)
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años gobernabilidad:', err)
  }
}

// ============================================
// ✅ FUNCIONES DE CARGA DE AÑOS - REGIONALES
// (Usan fetchRegionalSheetNames porque están en estructura anidada)
// ============================================
const loadEstatusPaisYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet ESTATUS DEL PAÍS (regional)...')
    // ✅ CORRECCIÓN: Usar fetchRegionalSheetNames con la clave correcta
    const sheetNames = await fetchRegionalSheetNames('estatusDelPais')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años ESTATUS DEL PAÍS encontrados:', years)
    if (years.length > 0) {
      emit('years-loaded', years)
    }
    return years
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años estatus del país:', err)
    return []
  }
}

const loadAmbientalesRegionalYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet AMBIENTALES REGIONAL...')
    // ✅ CORRECCIÓN: Usar fetchRegionalSheetNames
    const sheetNames = await fetchRegionalSheetNames('ambientalesRegional')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años AMBIENTALES REGIONAL encontrados:', years)
    if (years.length > 0) {
      emit('years-loaded', years)
    }
    return years
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años ambientales regional:', err)
    return []
  }
}

const loadSocialesRegionalYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet SOCIALES REGIONAL...')
    // ✅ CORRECCIÓN: Usar fetchRegionalSheetNames
    const sheetNames = await fetchRegionalSheetNames('socialesRegional')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años SOCIALES REGIONAL encontrados:', years)
    if (years.length > 0) {
      emit('years-loaded', years)
    }
    return years
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años sociales regional:', err)
    return []
  }
}

const loadEconomicosRegionalYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet ECONÓMICOS REGIONAL...')
    // ✅ CORRECCIÓN: Usar fetchRegionalSheetNames
    const sheetNames = await fetchRegionalSheetNames('economicosRegional')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años ECONÓMICOS REGIONAL encontrados:', years)
    if (years.length > 0) {
      emit('years-loaded', years)
    }
    return years
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años económicos regional:', err)
    return []
  }
}

const loadFinanciamientoSostenibleYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet FINANCIAMIENTO SOSTENIBLE...')
    // ✅ CORRECCIÓN: Usar fetchRegionalSheetNames
    const sheetNames = await fetchRegionalSheetNames('financiamientoRegional')
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a)
    console.log('✅ [QualitativePanel] Años FINANCIAMIENTO SOSTENIBLE encontrados:', years)
    if (years.length > 0) {
      emit('years-loaded', years)
    }
    return years
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años financiamiento sostenible:', err)
    return []
  }
}

// ============================================
// MAPEO DE CATEGORÍAS A FUNCIONES DE CARGA
// ============================================

// Mapeo SUBNACIONALES
const subnacionalYearLoaders = {
  'ambientales': loadAmbientalesYears,
  'economicos': loadEconomicosYears,
  'sociales': loadSocialesYears,
  'presupuestos': loadPresupuestosYears,
  'gobernabilidad': loadGobernabilidadYears
}

// Mapeo REGIONALES
const regionalYearLoaders = {
  'estatus-pais': loadEstatusPaisYears,
  'ambientales-regional': loadAmbientalesRegionalYears,
  'sociales-regional': loadSocialesRegionalYears,
  'economicos-regional': loadEconomicosRegionalYears,
  'financiamiento-sostenible': loadFinanciamientoSostenibleYears
}

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity, oldEntity) => {
  console.log('🔄 [QualitativePanel] Entidad cambió:', oldEntity, '→', newEntity)
}, { immediate: true })

watch(() => props.selectedYear, (newYear, oldYear) => {
  console.log('🔄 [QualitativePanel] Año cambió:', oldYear, '→', newYear)
}, { immediate: true })

// ============================================
// HANDLERS
// ============================================

// Seleccionar tipo de datos (Nivel 1)
const selectDataType = (type) => {
  console.log('📊 [QualitativePanel] Tipo de datos seleccionado:', type)
  selectedDataType.value = type
  emit('data-type-change', type)
}

// Volver al nivel 1 (selección de tipo de datos)
const handleBackToDataType = () => {
  console.log('⬅️ [QualitativePanel] Volviendo a selección de tipo de datos...')
  selectedDataType.value = null
  selectedCategory.value = null
  emit('panel-closed')
}

// Volver al nivel 2 (categorías)
const handleBackToCategories = () => {
  console.log('⬅️ [QualitativePanel] Volviendo a categorías...')
  selectedCategory.value = null
  emit('panel-closed')
}

// Toggle del panel
const togglePanel = () => {
  showExpandTooltip.value = false
  showCollapseTooltip.value = false
  
  console.log('🔄 [QualitativePanel] Toggle panel')
  
  if (props.isExpanded && selectedCategory.value) {
    // Si hay categoría seleccionada, volver a categorías
    handleBackToCategories()
  } else if (props.isExpanded && selectedDataType.value) {
    // Si hay tipo de datos seleccionado, volver a tipo de datos
    handleBackToDataType()
  } else if (props.isExpanded) {
    // Si está expandido sin selección, cerrar
    console.log('❌ Cerrando panel completamente...')
    emit('toggle')
    emit('panel-closed')
  } else {
    // Si está cerrado, abrir
    console.log('✅ Abriendo panel...')
    emit('toggle')
  }
}

// Manejar click en categoría (Nivel 2 → Nivel 3)
const handleCategoryClick = async (category) => {
  console.log('📂 [QualitativePanel] Categoría seleccionada:', category)
  console.log('📊 Tipo de datos:', selectedDataType.value)
  
  selectedCategory.value = category
  
  // Cargar años dinámicos según la categoría y tipo de datos
  const yearLoaders = selectedDataType.value === 'subnacional' 
    ? subnacionalYearLoaders 
    : regionalYearLoaders
  
  const yearLoader = yearLoaders[category]
  if (yearLoader) {
    console.log(`🔄 Ejecutando cargador de años para: ${category}`)
    await yearLoader()
  } else {
    console.warn(`⚠️ No hay cargador de años definido para: ${category}`)
  }
}

const getCategoryTitle = (category) => {
  const titles = {
    // Subnacionales
    'ambientales': 'Ambientales',
    'economicos': 'Económicos',
    'sociales': 'Sociales',
    'presupuestos': 'Presupuestos y financiamiento',
    'gobernabilidad': 'Gobernabilidad y transparencia',
    // Regionales
    'estatus-pais': 'Estatus del país',
    'ambientales-regional': 'Indicadores ambientales',
    'sociales-regional': 'Indicadores sociales',
    'economicos-regional': 'Indicadores económicos',
    'financiamiento-sostenible': 'Financiamiento sostenible internacional'
  }
  return titles[category] || category
}
</script>

<style scoped>
/* Panel retráctil */
.qualitative-panel {
  position: relative;
  width: 68.6px;
  height: 600px;
  background-color: #053759;
  border-radius: 15px;
  left: -45px;
  top: 1px;
  flex-shrink: 0;
  z-index: 1;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.qualitative-panel.expanded {
  width: 1020px;
  left: 0px;
  border-radius: 0px 15px 15px 0px;
  overflow: hidden;
}

.collapsed-view {
  width: 100%;
  height: 100%;
}

.expanded-view {
  width: 100%;
  height: 100%;
  padding: 30px 15px 15px 25px;
  color: white;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ============================================ */
/* HEADER DINÁMICO */
/* ============================================ */
.header-panel { 
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 13px;
  border-bottom: 3px solid rgba(255, 255, 255, 0.15);
  padding: 5px 0 10px 10px;
  margin-bottom: 0px;
}

.header-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 20px;
  font-weight: 100;
  color: white;
  margin: 0;
}

.hamburger-menu {
  display: flex;
  align-items: center;
}

.hamburger-icon {
  color: white;
  width: 20.9px;
  height: 20.9px;
}

/* Botón Volver en el header */
.header-back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  white-space: nowrap;
}

.header-back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Indicador de tipo de datos en el header */
.header-data-type-indicator {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
}

/* ========== WRAPPER PARA BOTÓN EXPAND ========== */
.expand-btn-wrapper {
  position: absolute;
  left: 42px;
  top: 2px;
  z-index: 10;
}

.expand-btn-wrapper.expanded-wrapper {
  position: relative;
  left: auto;
  top: auto;
  margin-left: auto;
}

.expand-btn {
  font-size: 20px;
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 3px 6px rgba(0, 0, 0, 0.4),
    inset 0 -2px 4px rgba(255, 255, 255, 0.1),
    0 1px 2px rgba(242, 241, 241, 0.369); 
  transition: all 0.3s ease;
}

.expand-btn:hover {
  box-shadow: 
    inset 0 4px 8px rgba(0, 0, 0, 0.5),
    inset 0 -2px 4px rgba(255, 255, 255, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

/* ========== NIVEL 1: Tipo de datos ========== */
.data-type-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 10px;
}

.data-type-btn {
  height: 80px !important;
  background: rgba(255, 255, 255, 0.15) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
}

.data-type-btn:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

/* Buttons Container */
.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 700px;
  padding: 30px 10px;
}

.qualitative-btn {
  width: 100%;
  height: 70px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
}

.qualitative-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(5px);
}

.qualitative-btn:active {
  background: rgba(255, 255, 255, 0.2);
}

.title-btn {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100; 
  font-size: 16px;
  text-align: left;
}

.plus-btn {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 100;
  font-size: 20px;
  flex-shrink: 0;
}

/* Inner Card Container */
.inner-card {
  background-color: white;
  border-radius: 15px;
  height: calc(100% - 20px);
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Empty State para otras categorías */
.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #d1cfcf;
  padding: 15px 15px 10px 15px;
  margin-bottom: 0;
  background: white;
}

.back-btn {
  background: none;
  border: none;
  color: #535353;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.back-btn:hover {
  background: #f0f0f0;
}

.card-header-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #535353;
  margin: 0;
  letter-spacing: -0.2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 40px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 400;
  color: #535353;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>

<!-- ✅ ESTILOS GLOBALES PARA TOOLTIP CON TELEPORT -->
<style>
.qualitative-tooltip {
  background: #1e3a5f;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 400;
  white-space: normal;
  width: 220px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.4);
  pointer-events: none;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: qualitativeTooltipFadeIn 0.15s ease-out;
}

@keyframes qualitativeTooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
}
</style>