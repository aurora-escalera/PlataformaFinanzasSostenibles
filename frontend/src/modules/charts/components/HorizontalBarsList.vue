<!-- src/modules/charts/components/HorizontalBarsList.vue -->
<template>
  <div class="horizontal-bars-container" ref="containerRef">
    <div class="bars-list">
      <div 
        v-for="(item, index) in sortedData" 
        :key="index"
        class="bar-item"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <!-- Icono y Label -->
        <div class="bar-left">
          <div class="bar-icon" :style="{ background: getGradient(item.color) }">
            <component :is="getIcon(item.label)" />
          </div>
          <span class="bar-label">{{ item.label }}</span>
        </div>

        <!-- Barra de progreso -->
        <div class="bar-center">
          <div class="bar-background">
            <div 
              class="bar-fill" 
              :style="{ 
                width: `${getBarWidth(item.value)}%`,
                background: item.color 
              }"
            ></div>
          </div>
        </div>

        <!-- Valor y Porcentaje -->
        <div class="bar-right">
          <span class="bar-money">{{ formatCurrency(item.value) }}</span>
          <span class="bar-percentage">{{ getPercentage(item.value) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  showIcons: {
    type: Boolean,
    default: true
  }
})

const containerRef = ref(null)

// Datos ordenados por valor descendente
const sortedData = computed(() => {
  if (!props.data || props.data.length === 0) return []
  return [...props.data].sort((a, b) => b.value - a.value)
})

// Calcular la SUMA TOTAL de todos los presupuestos
const totalSum = computed(() => {
  if (sortedData.value.length === 0) return 0
  return sortedData.value.reduce((sum, item) => sum + item.value, 0)
})

// Calcular el valor máximo para el ancho de las barras
const maxValue = computed(() => {
  if (sortedData.value.length === 0) return 100
  return Math.max(...sortedData.value.map(d => d.value))
})

// Obtener porcentaje respecto al TOTAL (no al máximo)
const getPercentage = (value) => {
  if (totalSum.value === 0) return 0
  return Math.round((value / totalSum.value) * 100)
}

// Obtener ancho de barra (respecto al máximo para visualización)
const getBarWidth = (value) => {
  if (maxValue.value === 0) return 0
  return Math.round((value / maxValue.value) * 100)
}

// Formatear valor como moneda
const formatCurrency = (value) => {
  if (!value) return '$0'
  
  // Si es mayor a 1 millón, mostrar en millones
  if (value >= 1000000) {
    const millions = (value / 1000000).toFixed(1)
    return `$${millions}M`
  }
  
  // Si es mayor a 1000, mostrar en miles
  if (value >= 1000) {
    const thousands = (value / 1000).toFixed(0)
    return `$${thousands}K`
  }
  
  return `$${Math.round(value)}`
}

// Obtener gradiente basado en color
const getGradient = (color) => {
  // Convertir hex a rgb y crear gradiente
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  
  // Color más oscuro para el gradiente
  const darkerR = Math.max(0, r - 30)
  const darkerG = Math.max(0, g - 30)
  const darkerB = Math.max(0, b - 30)
  
  return `linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${darkerR}, ${darkerG}, ${darkerB}) 100%)`
}

// Mapear iconos según la categoría
const getIcon = (label) => {
  const iconMap = {
    'Agua y drenaje': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })
    ]),
    'Suelos': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' })
    ]),
    'Residuos': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('polyline', { points: '3 6 5 6 21 6' }),
      h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
    ]),
    'Energía': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' })
    ]),
    'Atmósfera': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z' })
    ]),
    'Bioecosistemas': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M12 2v20M2 12h20M7.5 7.5l9 9M16.5 7.5l-9 9' })
    ]),
    'Cambio Climático': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' })
    ]),
    'Asentamientos': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
      h('polyline', { points: '9 22 9 12 15 12 15 22' })
    ]),
    'Eduambiental': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
      h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' })
    ]),
    'Admsostenible': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
      h('path', { d: 'M9 9h6v6H9z' })
    ]),
    'Transporte': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('rect', { x: '1', y: '3', width: '15', height: '13' }),
      h('polygon', { points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
      h('circle', { cx: '5.5', cy: '18.5', r: '2.5' }),
      h('circle', { cx: '18.5', cy: '18.5', r: '2.5' })
    ]),
    'Otros Programas': () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('line', { x1: '8', y1: '6', x2: '21', y2: '6' }),
      h('line', { x1: '8', y1: '12', x2: '21', y2: '12' }),
      h('line', { x1: '8', y1: '18', x2: '21', y2: '18' }),
      h('line', { x1: '3', y1: '6', x2: '3.01', y2: '6' }),
      h('line', { x1: '3', y1: '12', x2: '3.01', y2: '12' }),
      h('line', { x1: '3', y1: '18', x2: '3.01', y2: '18' })
    ])
  }
  
  return iconMap[label] || (() => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '16',
    height: '16',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2'
  }, [
    h('circle', { cx: '12', cy: '12', r: '10' })
  ]))
}
</script>

<style scoped>
.horizontal-bars-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.bars-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 8px;
  min-height: 36px;
  opacity: 0;
  animation: slideInBar 0.5s ease-out forwards;
  transition: all 0.2s ease;
}

.bar-item:hover {
  background: #f1f5f9;
  transform: translateX(3px);
}

@keyframes slideInBar {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  min-width: 110px;
}

.bar-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.bar-label {
  font-size: 10px;
  font-weight: 600;
  color: #475569;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.2;
}

.bar-center {
  flex: 1;
  min-width: 0;
}

.bar-background {
  position: relative;
  width: 100%;
  height: 10px;
  background: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 1s ease-out;
  position: relative;
}

.bar-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  flex-shrink: 0;
  min-width: 50px;
}

.bar-money {
  font-size: 13px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.bar-percentage {
  font-size: 9px;
  font-weight: 600;
  color: #64748b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Scrollbar styling */
.horizontal-bars-container::-webkit-scrollbar {
  width: 4px;
}

.horizontal-bars-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.horizontal-bars-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.horizontal-bars-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>