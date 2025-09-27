<!-- src/modules/other/components/DataToggleComponent.vue -->
<template>
  <div class="data-toggle-container">
    <!-- Toggle de Datos federales/subnacionales -->
    <div class="toggle-group">
      <button 
        :class="['toggle-btn', { 'active': dataType === 'federal' }]"
        @click="setDataType('federal')"
      >
        Datos federales
      </button>
      <button 
        :class="['toggle-btn', { 'active': dataType === 'subnacional' }]"
        @click="setDataType('subnacional')"
      >
        Datos subnacionales
      </button>
    </div>

    <!-- Toggle de Moneda -->
    <div class="toggle-group currency-group">
      <button 
        :class="['toggle-btn currency-btn', { 'active': currency === 'usd' }]"
        @click="setCurrency('usd')"
      >
        USD
      </button>
      <button 
        :class="['toggle-btn currency-btn', { 'active': currency === 'mxn' }]"
        @click="setCurrency('mxn')"
      >
        MXN
      </button>
    </div>
  </div>
</template>

<script setup>
import { useDataToggle } from '@/composables/useDataToggle'

// Usar el composable
const {
  dataType,
  currency,
  setDataType,
  setCurrency
} = useDataToggle()
</script>

<style scoped>
.data-toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
}

.toggle-group {
  display: flex;
  background: #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.currency-group {
  background: transparent;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-weight: 500;
}

.toggle-btn:hover {
  color: #333;
}

.toggle-btn.active {
  background: #5a5a5a;
  color: white;
}

.currency-btn {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  margin-left: 4px;
}

.currency-btn:first-child {
  margin-left: 0;
}

.currency-btn.active {
  background: #7cb342;
  border-color: #7cb342;
  color: white;
}

@media (max-width: 768px) {
  .data-toggle-container {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .toggle-group {
    width: 100%;
  }

  .toggle-btn {
    flex: 1;
  }
}
</style>