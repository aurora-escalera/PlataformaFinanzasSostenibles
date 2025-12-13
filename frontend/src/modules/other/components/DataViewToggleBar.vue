<template>
  <div class="toggle-bar">
    <div class="toggle-bar-content">
      <!-- Toggle Vista -->
      <div class="toggle-section">
        <span class="toggle-label">Vista:</span>
        <div class="toggle-buttons">
          <button
            :class="['toggle-btn', { active: modelValue === 'regional' }]"
            @click="$emit('update:modelValue', 'regional')"
          >
            <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Datos Regionales
          </button>
          <button
            :class="['toggle-btn', { active: modelValue === 'subnacional' }]"
            @click="$emit('update:modelValue', 'subnacional')"
          >
            <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Datos Subnacionales
          </button>
        </div>
      </div>

      <!-- Indicador Moneda -->
      <div class="currency-section">
        <span class="currency-label">Moneda:</span>
        <div class="currency-badge">
          <span class="currency-code">{{ currency }}</span>
          <span class="currency-name">({{ currencyName }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'subnacional',
    validator: (value) => ['regional', 'subnacional'].includes(value)
  },
  currency: {
    type: String,
    default: 'MXN'
  }
})

defineEmits(['update:modelValue'])

const currencyName = computed(() => {
  return props.currency === 'MXN' ? 'Pesos Mexicanos' : 'Dólares USD'
})
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
  background-color: #fef3c7;
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #fcd34d;
}

.currency-code {
  font-size: 15px;
  font-weight: 600;
  color: #b45309;
}

.currency-name {
  font-size: 15px;
  color: #d97706;
}
</style>