<!-- src/modules/qualitativeIndicators/components/QualitativeIndicatorsPanel.vue -->
<template>
  <!-- Barra retráctil siempre visible -->
  <div class="retractable-view" :class="{ 'expanded': isOpen }">
    <div 
      class="expand-retractable-btn"
      @click="togglePanel"
      :title="isOpen ? 'Cerrar panel' : 'Abrir indicadores cualitativos'"
    >
      {{ isOpen ? '−' : '+' }}
    </div>
  </div>

  <!-- Panel deslizante -->
<!-- 
  <transition name="slide">
    <div v-if="isOpen" class="qualitative-panel">

      <div class="panel-header">
        <button 
          v-if="selectedCategory"
          @click="goBack"
          class="back-btn"
        >
          ← Regresar
        </button>
        <h3 class="panel-title">
          {{ selectedCategory ? currentCategory?.label : 'Indicadores cualitativos' }}
        </h3>
        <button @click="closePanel" class="close-btn">✕</button>
      </div>
-->
      <!-- Contenido -->
<!-- 
      <div class="panel-content">
        <div v-if="!selectedCategory" class="categories-view">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category.id)"
            class="category-btn"
            :style="{ borderColor: category.color }"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-label">{{ category.label }}</span>
            <span class="category-arrow">→</span>
          </button>
        </div>
-->

        <!-- Vista de detalles (imagen 3) -->
<!--          
        <IndicatorDetailView
          v-else
          :category="currentCategory"
          :stateName="stateName"
        />
      </div>
    </div>
  </transition>
-->
</template>

<script setup>
import { useQualitativeIndicators } from '@/composables/useQualitativeIndicators'
import IndicatorDetailView from './IndicatorDetailView.vue'

const props = defineProps({
  stateName: {
    type: String,
    default: null
  }
})

const {
  isPanelOpen: isOpen,
  selectedCategory,
  categories,
  currentCategory,
  openPanel,
  closePanel,
  selectCategory,
  goBack
} = useQualitativeIndicators()

const togglePanel = () => {
  if (isOpen.value) {
    closePanel()
  } else {
    openPanel(props.stateName)
  }
}
</script>

<style scoped>
/* === BARRA RETRÁCTIL === */
.retractable-view {
  position: absolute;
  width: 68.6px;
  height: 344.3px;
  background-color: #053759;
  border-radius: 15px;
  left: -55px;
  transform: translateX(calc(100% - 50px));
  z-index: 1;
  transition: transform 0.3s ease;
}

.retractable-view.expanded {
  z-index: 99;
}

.expand-retractable-btn {
  position: absolute;
  font-size: 14px;
  color: white;
  left: 43px;
  top: 5px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 3px 6px rgba(0, 0, 0, 0.4),
    inset 0 -2px 4px rgba(255, 255, 255, 0.1),
    0 1px 2px rgba(242, 241, 241, 0.369);
  transition: all 0.1s ease;
}

.expand-retractable-btn:hover {
  box-shadow: 
    inset 0 4px 8px rgba(0, 0, 0, 0.5),
    inset 0 -2px 4px rgba(255, 255, 255, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

/* === PANEL PRINCIPAL === */
.qualitative-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 591.8px;
  height: 344.3px;
  background: #1a3a52;
  border-radius: 15px;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  flex: 1;
  text-align: center;
}

.back-btn,
.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.back-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* === VISTA DE CATEGORÍAS === */
.categories-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.category-btn:hover {
  transform: translateX(5px);
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}

.category-label {
  flex: 1;
  text-align: left;
}

.category-arrow {
  font-size: 20px;
  opacity: 0.5;
}

/* === ANIMACIONES === */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* === SCROLLBAR === */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .qualitative-panel {
    width: 100%;
    height: 100%;
  }
  
  .categories-view {
    gap: 8px;
  }
  
  .category-btn {
    padding: 12px 16px;
    font-size: 13px;
  }
}
</style>