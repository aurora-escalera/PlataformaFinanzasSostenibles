<!-- src/modules/other/components/DataViewToggleBar.vue -->
<template>
  <div class="toggle-bar">
    <div class="toggle-bar-content">
      <!-- Toggle Vista -->
      <div class="toggle-section">
        <span class="toggle-label">Vista:</span>
        <div class="toggle-buttons">
          <!-- Botón Datos Regionales (Federal) -->
          <button
            :class="['toggle-btn', { active: isFederalActive }]"
            @click="handleFederalClick"
          >
            <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Datos Regionales
          </button>
          
          <!-- Botón Datos Subnacionales -->
          <button
            :class="['toggle-btn', { active: isSubnacionalActive }]"
            @click="handleSubnacionalClick"
          >
            <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Datos Subnacionales
          </button>
        </div>
      </div>

      <!-- Indicador Moneda - Cambia según el toggle -->
      <div class="currency-section">
        <span class="currency-label">Moneda:</span>
        <div 
          class="currency-badge"
          :class="{ 'currency-usd': isFederalActive, 'currency-mxn': isSubnacionalActive }"
        >
          <span class="currency-name">{{ currencyName }}</span>
          <span class="currency-code">({{ currencyCode }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataToggle } from '@/composables/useDataToggle'

// ============================================================================
// COMPOSABLE
// ============================================================================
const { 
  isSubnacionalActive, 
  isFederalActive,
  setDataType,
  setCurrency,
  getSubnacionalClickFilters,
  getFederalClickFilters
} = useDataToggle()

// ============================================================================
// PROPS (para compatibilidad con v-model si se necesita)
// ============================================================================
const props = defineProps({
  modelValue: {
    type: String,
    default: 'subnacional',
    validator: (value) => ['regional', 'subnacional', 'federal'].includes(value)
  }
})

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits([
  'update:modelValue',
  'click-federal',
  'click-subnacional'
])

// ============================================================================
// COMPUTED - Moneda basada en el toggle
// ============================================================================

/**
 * Código de moneda según el toggle activo
 * Federal (Regionales) → USD
 * Subnacional → MXN
 */
const currencyCode = computed(() => {
  return isFederalActive.value ? 'USD' : 'MXN'
})

/**
 * Nombre de moneda según el toggle activo
 */
const currencyName = computed(() => {
  return isFederalActive.value ? 'Dólares estadounidenses' : 'Pesos mexicanos'
})

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * Handler para click en "Datos Regionales" (Federal)
 * Setea: entity=null, year=null, variable=null
 * Moneda: USD
 * Resultado: HistoricalCard + LinearChart + Overlay Gris
 */
const handleFederalClick = () => {
  console.log('🔘 [Toggle] Click en "Datos Regionales"')
  
  const filters = getFederalClickFilters()
  console.log('📤 [Toggle] Filtros para federal:', filters)
  
  // Actualizar el estado global del toggle
  setDataType('federal')
  
  // Actualizar moneda a USD
  setCurrency('usd')
  
  // Emitir para v-model (compatibilidad)
  emit('update:modelValue', 'regional')
  
  // Emitir evento con filtros para HomePage
  emit('click-federal', filters)
}

/**
 * Handler para click en "Datos Subnacionales"
 * Setea: entity='', year=primerAño, variable=null
 * Moneda: MXN
 * Resultado: DefaultInfoCard + RankingChart + No overlay
 */
const handleSubnacionalClick = () => {
  console.log('🔘 [Toggle] Click en "Datos Subnacionales"')
  
  const filters = getSubnacionalClickFilters()
  console.log('📤 [Toggle] Filtros para subnacional:', filters)
  
  // Actualizar el estado global del toggle
  setDataType('subnacional')
  
  // Actualizar moneda a MXN
  setCurrency('mxn')
  
  // Emitir para v-model (compatibilidad)
  emit('update:modelValue', 'subnacional')
  
  // Emitir evento con filtros para HomePage
  emit('click-subnacional', filters)
}
</script>

<style scoped>
.toggle-bar {
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 24px;
}

.toggle-bar-content {
  max-width: 2000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-label {
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
}

.toggle-buttons {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
  color: #374151;
}

.toggle-btn:hover:not(.active) {
  background-color: #f9fafb;
}

.toggle-btn.active {
  background-color: #1e3a5f;
  color: #ffffff;
}

.toggle-btn:first-child {
  border-right: 1px solid #d1d5db;
}

.toggle-btn.active + .toggle-btn {
  border-left-color: #1e3a5f;
}

.toggle-btn.active:first-child {
  border-right-color: #1e3a5f;
}

.toggle-icon {
  width: 18px;
  height: 18px;
}

.currency-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.currency-label {
  font-size: 15px;
  color: #6b7280;
}

.currency-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

/* Estilo MXN (Pesos mexicanos) - Amarillo/Dorado */
.currency-badge.currency-mxn {
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
}

.currency-badge.currency-mxn .currency-name {
  font-size: 15px;
  font-weight: 600;
  color: #b45309;
}

.currency-badge.currency-mxn .currency-code {
  font-size: 15px;
  color: #d97706;
}

/* Estilo USD (Dólares estadounidenses) - Verde */
.currency-badge.currency-usd {
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
}

.currency-badge.currency-usd .currency-name {
  font-size: 15px;
  font-weight: 600;
  color: #047857;
}

.currency-badge.currency-usd .currency-code {
  font-size: 15px;
  color: #059669;
}

/* Responsive */
@media (max-width: 768px) {
  .toggle-bar-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .toggle-buttons {
    width: 100%;
  }
  
  .toggle-btn {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>