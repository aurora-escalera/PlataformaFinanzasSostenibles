<!-- src/modules/charts/components/SectorFinanceCard.vue -->
<!-- ✅ Componente combinado de Financiamientos y Programas - COMPACTO -->
<template>
  <div class="sector-finance-container">
    <!-- Header con totales - COMPACTO -->
    <div class="section-header">
      <h3 class="section-title">{{ title }}</h3>
      <div class="header-stats">
        <div class="stat-pill finance">
          <span class="stat-icon">💰</span>
          <span class="stat-value">{{ formatCurrency(totalFinanciamiento) }}</span>
        </div>
        <div class="stat-pill programs">
          <span class="stat-icon">📋</span>
          <span class="stat-value">{{ totalProgramas }} prog.</span>
        </div>
      </div>
    </div>

    <!-- Lista de sectores -->
    <div class="sectors-grid">
      <div 
        v-for="(sector, index) in combinedData" 
        :key="sector.key"
        class="sector-row"
        :class="{ 'has-data': sector.financiamiento > 0 || sector.programas > 0 }"
        :style="{ animationDelay: `${index * 0.03}s` }"
      >
        <!-- Icono -->
        <div 
          class="sector-icon" 
          :style="{ background: getGradient(sector.color) }"
        >
          <component :is="getIcon(sector.label)" />
        </div>

        <!-- Nombre y barra -->
        <div class="sector-main">
          <div class="sector-name-row">
            <span class="sector-name">{{ sector.label }}</span>
            <span class="sector-percentage">{{ getPercentage(sector.financiamiento) }}%</span>
          </div>
          
          <!-- Barra de financiamiento -->
          <div class="bar-track">
            <div 
              class="bar-fill"
              :style="{ 
                width: `${getBarWidth(sector.financiamiento)}%`,
                background: `linear-gradient(90deg, ${sector.color} 0%, ${lightenColor(sector.color, 20)} 100%)`
              }"
            ></div>
          </div>
        </div>

        <!-- Valores -->
        <div class="sector-values">
          <div class="value-finance">
            <span class="value-number">{{ formatCurrency(sector.financiamiento) }}</span>
            <span class="value-label">Financiamiento</span>
          </div>
          
          <div class="value-divider"></div>
          
          <div class="value-programs">
            <div 
              class="programs-circle" 
              :class="{ active: sector.programas > 0 }"
              :style="sector.programas > 0 ? { background: sector.color } : {}"
            >
              {{ sector.programas }}
            </div>
            <span class="value-label">Prog.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer COMPACTO -->
    <div class="section-footer">
      <div class="footer-stat">
        <span class="footer-value">{{ activeSectors }}/{{ combinedData.length }}</span>
        <span class="footer-label">Sectores</span>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-stat">
        <span class="footer-value">{{ formatCurrency(avgFinanciamiento) }}</span>
        <span class="footer-label">Prom/sector</span>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-stat">
        <span class="footer-value">{{ avgProgramas.toFixed(1) }}</span>
        <span class="footer-label">Prog. prom</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'

const props = defineProps({
  financiamientos: {
    type: Array,
    default: () => []
  },
  programas: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Financiamientos y Programas por Sector'
  }
})

// Combinar datos de financiamientos y programas
const combinedData = computed(() => {
  if (!props.financiamientos || props.financiamientos.length === 0) return []
  
  return props.financiamientos.map(fin => {
    const prog = props.programas.find(p => 
      p.key === fin.key || 
      p.label === fin.label ||
      p.label?.toLowerCase() === fin.label?.toLowerCase()
    )
    
    return {
      key: fin.key,
      label: fin.label,
      financiamiento: fin.value || 0,
      programas: prog ? prog.value : 0,
      color: fin.color || '#0F3759'
    }
  }).sort((a, b) => b.financiamiento - a.financiamiento)
})

// Totales
const totalFinanciamiento = computed(() => {
  return combinedData.value.reduce((sum, item) => sum + item.financiamiento, 0)
})

const totalProgramas = computed(() => {
  return combinedData.value.reduce((sum, item) => sum + item.programas, 0)
})

// Estadísticas
const activeSectors = computed(() => {
  return combinedData.value.filter(s => s.financiamiento > 0 || s.programas > 0).length
})

const avgFinanciamiento = computed(() => {
  if (activeSectors.value === 0) return 0
  return totalFinanciamiento.value / activeSectors.value
})

const avgProgramas = computed(() => {
  if (combinedData.value.length === 0) return 0
  return totalProgramas.value / combinedData.value.length
})

// Máximo para barras
const maxFinanciamiento = computed(() => {
  if (combinedData.value.length === 0) return 100
  return Math.max(...combinedData.value.map(d => d.financiamiento))
})

const getBarWidth = (value) => {
  if (maxFinanciamiento.value === 0) return 0
  return Math.round((value / maxFinanciamiento.value) * 100)
}

const getPercentage = (value) => {
  if (totalFinanciamiento.value === 0) return 0
  return Math.round((value / totalFinanciamiento.value) * 100)
}

// Formatear moneda
const formatCurrency = (value) => {
  if (!value || value === 0) return '$0'
  
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${Math.round(value).toLocaleString('es-MX')}`
}

// Gradiente para iconos
const getGradient = (color) => {
  if (!color || !color.startsWith('#')) color = '#0F3759'
  return `linear-gradient(135deg, ${color} 0%, ${darkenColor(color, 15)} 100%)`
}

// Aclarar color
const lightenColor = (color, percent) => {
  if (!color || !color.startsWith('#')) return '#4a90d9'
  const num = parseInt(color.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
  const B = Math.min(255, (num & 0x0000FF) + amt)
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
}

// Oscurecer color
const darkenColor = (color, percent) => {
  if (!color || !color.startsWith('#')) return '#0a2540'
  const num = parseInt(color.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt)
  const B = Math.max(0, (num & 0x0000FF) - amt)
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
}

// Iconos por sector
const getIcon = (label) => {
  const iconMap = {
    'Agua y drenaje': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' })
    ]),
    'Suelos': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }),
      h('path', { d: 'M3 9h18M9 21V9' })
    ]),
    'Residuos': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('polyline', { points: '3 6 5 6 21 6' }),
      h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
    ]),
    'Energía': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' })
    ]),
    'Atmósfera': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z' })
    ]),
    'Bioecosistemas': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M7 20l4-16M17 20V4M3 8h4M17 8h4M6 16h4' })
    ]),
    'Cambio Climático': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('circle', { cx: '12', cy: '12', r: '5' }),
      h('line', { x1: '12', y1: '1', x2: '12', y2: '3' }),
      h('line', { x1: '12', y1: '21', x2: '12', y2: '23' })
    ]),
    'Asentamientos': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
      h('polyline', { points: '9 22 9 12 15 12 15 22' })
    ]),
    'Eduambiental': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
      h('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' })
    ]),
    'Admsostenible': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
      h('polyline', { points: '22 4 12 14.01 9 11.01' })
    ]),
    'Transporte': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('rect', { x: '1', y: '3', width: '15', height: '13' }),
      h('polygon', { points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
      h('circle', { cx: '5.5', cy: '18.5', r: '2.5' }),
      h('circle', { cx: '18.5', cy: '18.5', r: '2.5' })
    ]),
    'Otros Programas': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('circle', { cx: '12', cy: '12', r: '1' }),
      h('circle', { cx: '19', cy: '12', r: '1' }),
      h('circle', { cx: '5', cy: '12', r: '1' })
    ])
  }
  
  return iconMap[label] || (() => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '10' })
  ]))
}
</script>

<style scoped>
.sector-finance-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* Header COMPACTO */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header-stats {
  display: flex;
  gap: 8px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.stat-pill.programs {
  background: #0F3759;
  border-color: #0F3759;
}

.stat-pill.programs .stat-value {
  color: white;
}

.stat-icon {
  font-size: 10px;
}

.stat-value {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Grid de sectores */
.sectors-grid {
  flex: 1;
  overflow-y: auto;
  padding: 6px 10px;
}

.sector-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  margin-bottom: 4px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid transparent;
  opacity: 0;
  animation: fadeSlide 0.3s ease-out forwards;
  transition: all 0.15s ease;
}

.sector-row:last-child {
  margin-bottom: 0;
}

.sector-row:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

.sector-row.has-data {
  background: white;
  border-color: #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Icono */
.sector-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Main (nombre + barra) */
.sector-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sector-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sector-name {
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sector-percentage {
  font-size: 9px;
  font-weight: 600;
  color: #94a3b8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.bar-track {
  width: 100%;
  height: 5px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Valores */
.sector-values {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.value-finance, .value-programs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.value-finance {
  min-width: 60px;
}

.value-number {
  font-size: 11px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.value-label {
  font-size: 7px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.value-divider {
  width: 1px;
  height: 22px;
  background: #e2e8f0;
}

.programs-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.2s ease;
}

.programs-circle.active {
  color: white;
  box-shadow: 0 1px 4px rgba(15, 55, 89, 0.3);
}

/* Footer COMPACTO */
.section-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  flex-shrink: 0;
}

.footer-stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-value {
  font-size: 12px;
  font-weight: 700;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.footer-label {
  font-size: 9px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.footer-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.3);
}

/* Scrollbar */
.sectors-grid::-webkit-scrollbar {
  width: 4px;
}

.sectors-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.sectors-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.sectors-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>