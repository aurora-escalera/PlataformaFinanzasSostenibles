<!-- src/modules/qualitativeIndicators/components/QualitativePanel.vue -->
<!-- ✅ ACTUALIZADO: Emite eventos 'years-loaded' y 'panel-closed' correctamente -->
<template>
  <div 
    class="qualitative-panel"
    :class="{ 'expanded': isExpanded }"
  >
    <!-- Vista colapsada (solo botón +) -->
    <div v-if="!isExpanded" class="collapsed-view">
      <div class="expand-btn" @click="togglePanel">
        +
      </div>
    </div>
    
    <!-- Vista expandida (contenido completo) -->
    <div v-else class="expanded-view">
      <div class="header-panel">
        <div class="hamburger-menu">
          <img src="/public/icons/white-hamburger.png" alt="hamburger-menu" class="hamburger-icon">
        </div>
        <h1 class="header-title">Indicadores Cualitativos</h1>
        <div class="expand-btn" @click="togglePanel">
          −
        </div>
      </div>

      <!-- Mostrar botones solo si no hay categoría seleccionada -->
      <div v-if="!selectedCategory" class="buttons-container">
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

      <!-- ✅ Mostrar componente EconomicosView cuando se selecciona "Ambientales" -->
      <div v-else-if="selectedCategory === 'ambientales'" class="inner-card">
        <AmbientalesView 
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBack" 
        />
      </div>

      <!-- ✅ Mostrar componente AmbientalesView cuando se selecciona "Ambientales" -->
      <div v-else-if="selectedCategory === 'economicos'" class="inner-card">
        <EconomicosView
          :selectedEntity="props.selectedEntity"
          :selectedYear="props.selectedYear"
          @back="handleBack" 
        />
      </div>

      <!-- Mensaje para otras categorías -->
      <div v-else class="inner-card">
        <div class="card-header">
          <button class="back-btn" @click="handleBack">← Volver</button>
          <h1 class="card-header-title">{{ getCategoryTitle(selectedCategory) }}</h1>
        </div>
        
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>Próximamente</h3>
          <p>Los indicadores de {{ getCategoryTitle(selectedCategory).toLowerCase() }} estarán disponibles pronto.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AmbientalesView from './AmbientalesView.vue'
import { useStorageData } from '@/dataConection/useStorageData'
import EconomicosView from './EconomicosView.vue'

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
  }
})

const emit = defineEmits(['toggle', 'category-click', 'years-loaded', 'panel-closed'])

// Estado local para categoría seleccionada
const selectedCategory = ref(null)

// ✅ Composable para obtener datos
const { fetchSheetNames } = useStorageData()

// ✅ Función para cargar años desde el sheet de ambientales
const loadAmbientalesYears = async () => {
  try {
    console.log('📅 [QualitativePanel] Cargando años de sheet ambientales...')
    
    // Obtener los nombres de las hojas del sheet de ambientales
    const sheetNames = await fetchSheetNames('incendiosForestales')
    
    // Filtrar solo los que parecen años (números de 4 dígitos)
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => b - a) // Ordenar descendente
    
    console.log('✅ [QualitativePanel] Años encontrados:', years)
    
    // Emitir los años al HomePage
    emit('years-loaded', years)
    
  } catch (err) {
    console.error('❌ [QualitativePanel] Error cargando años:', err)
  }
}

// ✅ Watch para debugging de entidad
watch(() => props.selectedEntity, (newEntity, oldEntity) => {
  console.log('🔄 [QualitativePanel] Entidad cambió')
  console.log('  - Anterior:', oldEntity)
  console.log('  - Nueva:', newEntity)
  console.log('  - Categoría activa:', selectedCategory.value)
}, { immediate: true })

// ✅ Watch para debugging de año
watch(() => props.selectedYear, (newYear, oldYear) => {
  console.log('🔄 [QualitativePanel] Año cambió')
  console.log('  - Anterior:', oldYear)
  console.log('  - Nuevo:', newYear)
  console.log('  - Categoría activa:', selectedCategory.value)
}, { immediate: true })

// ✅ Toggle del panel con manejo de cierre
const togglePanel = () => {
  console.log('🔄 [QualitativePanel] Toggle panel')
  console.log('  - isExpanded:', props.isExpanded)
  console.log('  - selectedCategory:', selectedCategory.value)
  
  if (props.isExpanded && selectedCategory.value) {
    // Si está expandido y hay categoría, primero volver a botones
    console.log('📂 Volviendo a menú de categorías...')
    selectedCategory.value = null
    // ✅ CRÍTICO: Emitir panel-closed para restaurar años
    emit('panel-closed')
  } else if (props.isExpanded && !selectedCategory.value) {
    // Si está en el menú principal, cerrar completamente
    console.log('❌ Cerrando panel completamente...')
    emit('toggle')
    // ✅ CRÍTICO: Emitir panel-closed para restaurar años
    emit('panel-closed')
  } else {
    // Si está cerrado, solo abrir
    console.log('✅ Abriendo panel...')
    emit('toggle')
  }
}

// ✅ Manejar click en categoría con carga de años
const handleCategoryClick = async (category) => {
  console.log('📂 [QualitativePanel] Categoría seleccionada:', category)
  console.log('📍 Entidad actual:', props.selectedEntity)
  console.log('📅 Año actual:', props.selectedYear)
  
  selectedCategory.value = category
  
  // ✅ Si es ambientales, cargar años dinámicos
  if (category === 'ambientales') {
    console.log('🌿 Cargando años de ambientales...')
    await loadAmbientalesYears()
  }
}

// ✅ Manejar botón "Volver" con restauración
const handleBack = () => {
  console.log('⬅️ [QualitativePanel] Volviendo al menú principal...')
  selectedCategory.value = null
  // ✅ CRÍTICO: Emitir panel-closed para restaurar años
  emit('panel-closed')
}

const getCategoryTitle = (category) => {
  const titles = {
    'ambientales': 'Ambientales',
    'economicos': 'Económicos',
    'sociales': 'Sociales',
    'presupuestos': 'Presupuestos y financiamiento',
    'gobernabilidad': 'Gobernabilidad y transparencia'
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

/* Header elements */
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

.hamburger-icon {
  color: white;
  width: 20.9px;
  height: 20.9px;
}

.expand-btn {
  position: absolute;
  font-size: 20px;
  color: white;
  left: 42px;
  top: 2px;
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
  z-index: 10;
}

.qualitative-panel.expanded .expand-btn {
  left: 990px;
  top: 3px;
}

.expand-btn:hover {
  box-shadow: 
    inset 0 4px 8px rgba(0, 0, 0, 0.5),
    inset 0 -2px 4px rgba(255, 255, 255, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

/* Buttons Container (cuando no hay categoría seleccionada) */
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