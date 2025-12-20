<!-- src/modules/charts/components/IFSRegionalCard.vue -->
<!-- ✅ ACTUALIZADO: Nuevos rangos IFS (escala 0-4 con 6 niveles) -->
<template>
  <div class="ifs-regional-card">
    <!-- Header -->
    <div class="card-header" :class="headerColorClass">
      <div class="header-icon">
        <svg v-if="isIFSMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        <span v-else class="icon-dollar">$</span>
      </div>
      <div class="header-text">
        <h3 class="header-title">{{ currentConfig.headerTitle }}</h3>
        <p class="header-subtitle">Datos Federales Consolidados</p>
      </div>
      <span class="year-badge">{{ selectedYear || '—' }}</span>
      
      <!-- ✅ Botón de exportación circular -->
      <div class="export-wrapper" ref="exportWrapperRef">
        <button 
          class="export-btn-circle"
          :class="{ 'is-open': showExportMenu }"
          @click.stop="toggleExportMenu"
          title="Exportar datos"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        
        <!-- Dropdown menu -->
        <transition name="dropdown-fade">
          <div v-if="showExportMenu" class="export-dropdown">
            <button class="export-option" @click="handleExport('xlsx')">
              <span class="option-icon xlsx">XLS</span>
              <span>Excel</span>
            </button>
            <button class="export-option" @click="handleExport('csv')">
              <span class="option-icon csv">CSV</span>
              <span>CSV</span>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Body -->
    <div class="card-body">
      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>

      <!-- ==================== CONTENT IFS (con gauge) ==================== -->
      <div v-else-if="isIFSMode" class="content-wrapper content-ifs">
        <div class="metrics-section">
          <div class="metrics-title">
            <span class="title-main">{{ currentConfig.title }}</span>
            <span class="title-sub">{{ currentConfig.subtitle }}</span>
          </div>
          
          <div class="metrics-row">
            <!-- Gauge IFS -->
            <div class="metric-card ifs-metric">
              <div class="metric-gauge">
                <svg viewBox="0 0 140 140" class="gauge-svg">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#e5e7eb" stroke-width="10" />
                  <circle 
                    cx="70" cy="70" r="58" 
                    fill="none" 
                    :stroke="currentLevelColor"
                    stroke-width="10"
                    stroke-linecap="round"
                    :stroke-dasharray="`${gaugeProgress} 365`"
                    class="gauge-progress"
                  />
                </svg>
                <div class="gauge-center">
                  <span class="gauge-value">{{ formattedIFSValue }}</span>
                  <span class="gauge-label" :style="{ color: currentLevelColor }">{{ currentLevelLabel }}</span>
                </div>
              </div>
            </div>

            <div class="metrics-divider"></div>

            <!-- Posición IFS -->
            <div class="metric-card position-metric">
              <div class="position-badge position-green">
                <span class="position-label">Posición Internacional</span>
                <div class="position-value-wrapper">
                  <span class="position-hash">#</span>
                  <span class="position-value">{{ positionValue || '—' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Leyenda IFS con escala de 6 niveles -->
        <div class="legend-section">
          <div class="legend-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span>{{ currentConfig.legendTitle }}</span>
          </div>
          <p class="legend-description" v-html="currentConfig.legendDescription"></p>
          
          <div class="legend-scale">
            <div class="scale-bar">
              <div 
                v-for="(level, index) in ifsLevels" 
                :key="index"
                class="scale-segment"
                :style="{ background: level.color }"
              ></div>
            </div>
            <div class="scale-labels scale-labels-6">
              <div 
                v-for="(level, index) in ifsLevels" 
                :key="index"
                class="scale-label"
                :class="{ 'active': isCurrentLevel(index) }"
              >
                <div class="label-indicator" :style="{ background: level.color }"></div>
                <div class="label-text">
                  <span class="label-name">{{ level.label }}</span>
                  <span class="label-range">{{ level.range }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== CONTENT MONETARIO (PS, IS, PIC, IIC) ==================== -->
      <div v-else class="content-wrapper content-monetary">
        <div class="content-center">
          <!-- Row con dos cards -->
          <div class="monetary-row">
            <!-- Valor Principal -->
            <div class="monetary-main" :class="currentConfig.colorTheme">
              <div class="monetary-label">{{ currentConfig.title }}</div>
              <div class="monetary-value-row">
                <span class="monetary-currency">$</span>
                <span class="monetary-amount">{{ formattedMonetaryValue }}</span>
              </div>
              <div class="monetary-unit">{{ monetaryUnitText }}</div>
            </div>
            
            <!-- Posición -->
            <div class="position-card" :class="currentConfig.colorTheme">
              <div class="position-label-monetary">Posición Internacional</div>
              <div class="position-value-monetary">
                <span class="position-hash-monetary" :class="currentConfig.colorTheme">#</span>{{ positionValue || '—' }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Leyenda -->
        <div class="legend-section">
          <div class="legend-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span>{{ currentConfig.legendTitle }}</span>
          </div>
          <p class="legend-description" v-html="currentConfig.legendDescription"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'
import { getCleanValue } from '@/composables/parseNumber'
import { useExportData } from '@/composables/useExportData'

const props = defineProps({
  selectedYear: {
    type: String,
    default: null
  },
  selectedVariable: {
    type: [Object, String],
    default: null
  }
})

const { fetchData, loading, error } = useStorageData()
const { exportIFSRegionalData } = useExportData()

const metricValue = ref(0)
const positionValue = ref(null)

// ✅ Estado del menú de exportación
const showExportMenu = ref(false)
const exportWrapperRef = ref(null)

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
}

// Cerrar menú al hacer clic fuera
const handleClickOutside = (event) => {
  if (exportWrapperRef.value && !exportWrapperRef.value.contains(event.target)) {
    showExportMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadData()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// ✅ Handler de exportación
const handleExport = (format) => {
  console.log('📥 [IFSRegionalCard] Exportando en formato:', format)
  showExportMenu.value = false
  
  const exportData = {
    indicador: currentConfig.value.headerTitle,
    valor: isIFSMode.value ? formattedIFSValue.value : metricValue.value,
    posicion: positionValue.value,
    tipo: isIFSMode.value ? 'Índice' : 'Monetario (USD)'
  }
  
  exportIFSRegionalData(exportData, format, {
    year: props.selectedYear,
    variable: props.selectedVariable
  })
}

// Configuración por variable
const variableConfigs = {
  IFS: {
    key: 'IFS',
    headerTitle: 'Índice de Finanzas Sostenibles',
    title: 'Valor IFS',
    subtitle: 'Índice de Finanzas Sostenibles',
    legendTitle: '¿Qué es el IFS?',
    legendDescription: 'El <strong>Índice de Finanzas Sostenibles (IFS)</strong> mide el grado de sostenibilidad fiscal de México, considerando la proporción de ingresos y egresos destinados a actividades ambientalmente sostenibles versus aquellas intensivas en carbono.',
    valueColumn: 'IFS',
    positionColumn: 'POS_IFS',
    isMonetary: false,
    headerClass: 'header-default',
    colorTheme: 'green'
  },
  PS: {
    key: 'PS',
    headerTitle: 'Presupuestos Sostenibles',
    title: 'Valor Total PS',
    subtitle: 'Presupuestos Sostenibles',
    legendTitle: '¿Qué son los Presupuestos Sostenibles?',
    legendDescription: 'Los <strong>Presupuestos Sostenibles (PS)</strong> representan el monto del presupuesto federal destinado a actividades que promueven la sostenibilidad ambiental.',
    valueColumn: 'PS ($)',
    positionColumn: 'POS_PS',
    isMonetary: true,
    headerClass: 'header-green',
    colorTheme: 'green'
  },
  IS: {
    key: 'IS',
    headerTitle: 'Ingresos Sostenibles',
    title: 'Valor Total IS',
    subtitle: 'Ingresos Sostenibles',
    legendTitle: '¿Qué son los Ingresos Sostenibles?',
    legendDescription: 'Los <strong>Ingresos Sostenibles (IS)</strong> representan el monto de los ingresos federales provenientes de fuentes que promueven la sostenibilidad ambiental.',
    valueColumn: 'IS ($)',
    positionColumn: 'POS_IS',
    isMonetary: true,
    headerClass: 'header-green',
    colorTheme: 'green'
  },
  PIC: {
    key: 'PIC',
    headerTitle: 'Presupuestos Intensivos en Carbono',
    title: 'Valor Total PIC',
    subtitle: 'Presupuestos Intensivos en Carbono',
    legendTitle: '¿Qué son los PIC?',
    legendDescription: 'Los <strong>Presupuestos Intensivos en Carbono (PIC)</strong> representan el monto destinado a actividades con alta generación de emisiones de carbono.',
    valueColumn: 'PIC ($)',
    positionColumn: 'POS_PIC',
    isMonetary: true,
    headerClass: 'header-red',
    colorTheme: 'red'
  },
  IIC: {
    key: 'IIC',
    headerTitle: 'Ingresos Intensivos en Carbono',
    title: 'Valor Total IIC',
    subtitle: 'Ingresos Intensivos en Carbono',
    legendTitle: '¿Qué son los IIC?',
    legendDescription: 'Los <strong>Ingresos Intensivos en Carbono (IIC)</strong> representan el monto de los ingresos provenientes de actividades relacionadas con combustibles fósiles.',
    valueColumn: 'IIC ($)',
    positionColumn: 'POS_IIC',
    isMonetary: true,
    headerClass: 'header-red',
    colorTheme: 'red'
  }
}

// ✅ ACTUALIZADO: Niveles del IFS (escala 0-4 con 6 niveles)
// Orden: Alto → Muy Bajo (izquierda a derecha, como en la imagen de referencia)
const ifsLevels = [
  { range: '3.5 - 4', label: 'Alto', color: '#22c55e' },
  { range: '2.3 - 3.5', label: 'Medio Alto', color: '#84cc16' },
  { range: '1.9 - 2.2', label: 'Medio', color: '#eab308' },
  { range: '1.5 - 1.8', label: 'Medio Bajo', color: '#f97316' },
  { range: '0.6 - 1.5', label: 'Bajo', color: '#ef4444' },
  { range: '0 - 0.5', label: 'Muy Bajo', color: '#dc2626' }
]

// Computed - Obtener key de variable actual
const currentVariableKey = computed(() => {
  if (!props.selectedVariable) return 'IFS'
  if (typeof props.selectedVariable === 'string') return props.selectedVariable
  return props.selectedVariable?.key || 'IFS'
})

// Computed - Configuración actual
const currentConfig = computed(() => {
  return variableConfigs[currentVariableKey.value] || variableConfigs.IFS
})

// Computed - Es modo IFS (gauge) o monetario
const isIFSMode = computed(() => currentVariableKey.value === 'IFS')

// Computed - Clase del header
const headerColorClass = computed(() => currentConfig.value.headerClass)

// Computed - Valor formateado para IFS
const formattedIFSValue = computed(() => {
  if (metricValue.value === null || metricValue.value === undefined) return '—'
  return metricValue.value.toFixed(2)
})

// Computed - Valor formateado para monetario
const formattedMonetaryValue = computed(() => {
  if (metricValue.value === null || metricValue.value === undefined) return '—'
  
  const value = metricValue.value
  
  if (value >= 1e12) {
    return (value / 1e12).toFixed(2)
  } else if (value >= 1e9) {
    return (value / 1e9).toFixed(2)
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(2)
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(2)
  }
  
  return value.toFixed(2)
})

// Texto completo de unidad monetaria en dólares
const monetaryUnitText = computed(() => {
  const value = metricValue.value
  
  if (value >= 1e12) return 'Billones de dólares (USD)'
  if (value >= 1e9) return 'Billones de dólares (USD)'
  if (value >= 1e6) return 'Millones de dólares (USD)'
  if (value >= 1e3) return 'Miles de dólares (USD)'
  return 'Dólares (USD)'
})

// ✅ ACTUALIZADO: Progreso del gauge (escala 0-4)
const gaugeProgress = computed(() => {
  // Normalizar valor de 0-4 a 0-1, luego multiplicar por circunferencia
  const normalizedValue = Math.min(metricValue.value, 4) / 4
  return normalizedValue * 365
})

// ✅ ACTUALIZADO: Nivel actual IFS (6 niveles, orden Alto → Muy Bajo)
const currentLevelIndex = computed(() => {
  const val = metricValue.value
  if (val >= 3.5) return 0      // Alto
  if (val >= 2.3) return 1      // Medio Alto
  if (val >= 1.9) return 2      // Medio
  if (val >= 1.5) return 3      // Medio Bajo
  if (val >= 0.6) return 4      // Bajo
  return 5                       // Muy Bajo
})

const currentLevelColor = computed(() => {
  return ifsLevels[currentLevelIndex.value]?.color || '#94a3b8'
})

const currentLevelLabel = computed(() => {
  return ifsLevels[currentLevelIndex.value]?.label || ''
})

const isCurrentLevel = (index) => {
  return currentLevelIndex.value === index
}

// Cargar datos
const loadData = async () => {
  try {
    console.log('📊 [IFSRegionalCard] Cargando datos para:', currentVariableKey.value, 'año:', props.selectedYear)
    
    const sheetName = getSheetName('chartsPresupuestosRegional')
    const data = await fetchData('chartsPresupuestosRegional', sheetName)
    console.log('DATOS:' +data)
    if (!data || data.length === 0) {
      console.warn('⚠️ [IFSRegionalCard] No hay datos')
      return
    }
    
    let row = data[0]
    
    if (props.selectedYear) {
      const filtered = data.find(r => String(r['Año']).trim() === String(props.selectedYear).trim())
      if (filtered) {
        row = filtered
      }
    }
    
    console.log('📊 [IFSRegionalCard] Fila encontrada:', row)
    
    const config = currentConfig.value
    const valueCol = config.valueColumn
    const posCol = config.positionColumn
    
    console.log('📊 [IFSRegionalCard] Columnas - Valor:', valueCol, 'Posición:', posCol)
    
    if (row.hasOwnProperty(valueCol)) {
      metricValue.value = getCleanValue(row, valueCol)
    } else {
      console.warn('⚠️ [IFSRegionalCard] Columna no encontrada:', valueCol)
      metricValue.value = 0
    }
    
    if (row.hasOwnProperty(posCol)) {
      positionValue.value = Math.round(getCleanValue(row, posCol))
    } else {
      console.warn('⚠️ [IFSRegionalCard] Columna no encontrada:', posCol)
      positionValue.value = null
    }
    
    console.log('✅ [IFSRegionalCard] Valor:', metricValue.value, 'Posición:', positionValue.value)
    
  } catch (err) {
    console.error('❌ [IFSRegionalCard] Error:', err)
  }
}

watch([() => props.selectedYear, () => props.selectedVariable], () => {
  loadData()
}, { immediate: false })
</script>

<style scoped>
.ifs-regional-card {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* ==================== HEADER ==================== */
.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  transition: background 0.3s ease;
  flex-shrink: 0;
}

.card-header.header-green {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
}

.card-header.header-red {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.icon-dollar {
  font-size: 20px;
  font-weight: 600;
}

.header-text {
  flex: 1;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.header-subtitle {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.year-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

/* ==================== BOTÓN DE EXPORTACIÓN CIRCULAR ==================== */
.export-wrapper {
  position: relative;
  margin-left: 8px;
}

.export-btn-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn-circle:hover {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  transform: scale(1.08);
}

.export-btn-circle.is-open {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.export-btn-circle svg {
  width: 14px;
  height: 14px;
}

/* Dropdown */
.export-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  z-index: 1000;
  min-width: 120px;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  font-size: 13px;
  color: #374151;
}

.export-option:hover {
  background: #f3f4f6;
}

.export-option:first-child {
  border-bottom: 1px solid #e5e7eb;
}

.option-icon {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 4px;
  color: white;
}

.option-icon.xlsx {
  background: #107c41;
}

.option-icon.csv {
  background: #6366f1;
}

/* Animación dropdown */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ==================== BODY ==================== */
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.loading-state,
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #7cb342;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ==================== IFS MODE (GAUGE) ==================== */
.content-ifs {
  padding: 24px;
  gap: 24px;
}

.metrics-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.metrics-title {
  text-align: center;
}

.title-main {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #1e3a5f;
}

.title-sub {
  display: block;
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
}

.metrics-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-gauge {
  position: relative;
  width: 160px;
  height: 160px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-progress {
  transition: stroke-dasharray 0.8s ease;
}

.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-value {
  font-size: 30px;
  font-weight: 700;
  color: #1e3a5f;
  line-height: 1;
}

.gauge-label {
  font-size: 13px;
  font-weight: 600;
  margin-top: 4px;
}

.metrics-divider {
  width: 1px;
  height: 140px;
  background: linear-gradient(180deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%);
}

.position-metric {
  min-width: 200px;
}

.position-badge {
  border-radius: 16px;
  padding: 20px 32px;
  text-align: center;
  border: 2px solid;
}

.position-badge.position-green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.position-badge.position-green .position-label {
  color: #166534;
}

.position-badge.position-green .position-hash {
  color: #22c55e;
}

.position-badge.position-green .position-value {
  color: #166534;
}

.position-label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.position-value-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}

.position-hash {
  font-size: 28px;
  font-weight: 400;
  line-height: 1;
}

.position-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

/* ==================== MONETARY MODE ==================== */
.content-monetary {
  padding: 40px 60px 30px 60px;
}

.content-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
  padding-bottom: 30px;
}

.monetary-row {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 30px;
}

.monetary-main {
  text-align: center;
  padding: 30px 40px;
  border-radius: 16px;
  border: 2px solid;
  width: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.monetary-main.green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.monetary-main.red {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-color: #fca5a5;
}

.monetary-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
  color: #64748b;
}

.monetary-value-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 3px;
}

.monetary-currency {
  font-size: 20px;
  font-weight: 500;
}

.monetary-main.green .monetary-currency {
  color: #16a34a;
}

.monetary-main.red .monetary-currency {
  color: #dc2626;
}

.monetary-amount {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  color: #1e293b;
}

.monetary-unit {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-top: 8px;
}

/* Position Card - Monetario */
.position-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 30px 40px;
  text-align: center;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 280px;
}

.position-card.green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.position-card.red {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-color: #fca5a5;
}

.position-label-monetary {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.position-value-monetary {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.position-hash-monetary {
  font-weight: 400;
}

.position-hash-monetary.green {
  color: #16a34a;
}

.position-hash-monetary.red {
  color: #dc2626;
}

/* ==================== LEGEND ==================== */
.legend-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px 24px;
  margin-top: auto;
  flex-shrink: 0;
}

.legend-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.legend-header svg {
  color: #94a3b8;
}

.legend-description {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.legend-description :deep(strong) {
  color: #334155;
}

/* Scale - Solo para IFS */
.legend-scale {
  margin-top: 16px;
}

.scale-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.scale-segment {
  flex: 1;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

/* ✅ NUEVO: Grid de 6 columnas para los 6 niveles */
.scale-labels-6 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.scale-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.scale-label.active {
  border-color: currentColor;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.label-indicator {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.label-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.label-name {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.label-range {
  font-size: 9px;
  color: #94a3b8;
}
/* ============================================
   RESPONSIVE - Media Queries para IFSRegionalCard.vue
   (Reemplazar las media queries existentes)
   ============================================ */

/* Tablets */
@media (max-width: 768px) {
  .card-header {
    padding: 10px 14px;
    gap: 8px;
  }
  
  .header-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }
  
  .header-icon svg {
    width: 16px;
    height: 16px;
  }
  
  .icon-dollar {
    font-size: 16px;
  }
  
  .header-title {
    font-size: 13px;
  }
  
  .header-subtitle {
    font-size: 0px;
  }
  
  .year-badge {
    padding: 4px 10px;
    font-size: 11px;
    border-radius: 14px;
  }
  
  .export-btn-circle {
    width: 26px;
    height: 26px;
  }
  
  .export-btn-circle svg {
    width: 11px;
    height: 11px;
  }
  
  .export-dropdown {
    min-width: 100px;
  }
  
  .export-option {
    padding: 10px 12px;
    font-size: 11px;
    gap: 8px;
  }
  
  .option-icon {
    font-size: 8px;
    padding: 2px 5px;
  }
  
  /* IFS Mode - Gauge */
  .content-ifs {
    padding: 0px;
    gap: 6px;
  }
  
  .metrics-section {
    gap: 14px;
    padding: 14px 0;
  }
  
  .title-main {
    font-size: 14px;
  }
  
  .title-sub {
    font-size: 11px;
  }
  
  /* ✅ Metrics en 2 columnas con divider vertical */
  .metrics-row {
    flex-direction: row;
    gap: 20px;
    justify-content: center;
    align-items: center;
  }
  
  .metrics-divider {
    width: 1px;
    height: 100px;
  }
  
  .metric-gauge {
    width: 110px;
    height: 110px;
  }
  
  .gauge-value {
    font-size: 20px;
  }
  
  .gauge-label {
    font-size: 10px;
  }
  
  .position-metric {
    min-width: auto;
  }
  
  .position-badge {
    padding: 12px 20px;
    border-radius: 12px;
  }
  
  .position-label {
    font-size: 9px;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
  }
  
  .position-hash {
    font-size: 20px;
  }
  
  .position-value {
    font-size: 20px;
  }
  
  /* Monetary Mode */
  .content-monetary {
    padding: 20px 16px 16px 16px;
  }
  
  .content-center {
    padding-bottom: 16px;
  }
  
  .monetary-row {
    flex-direction: row;
    gap: 14px;
    justify-content: center;
    align-items: stretch;
  }
  
  .monetary-main {
    padding: 16px 20px;
    border-radius: 12px;
    width: auto;
    flex: 1;
    max-width: 180px;
  }
  
  .monetary-label {
    font-size: 9px;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  
  .monetary-currency {
    font-size: 14px;
  }
  
  .monetary-amount {
    font-size: 22px;
  }
  
  .monetary-unit {
    font-size: 9px;
    margin-top: 6px;
  }
  
  .position-card {
    padding: 16px 20px;
    border-radius: 12px;
    width: auto;
    flex: 1;
    max-width: 180px;
  }
  
  .position-label-monetary {
    font-size: 9px;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  
  .position-value-monetary {
    font-size: 22px;
  }
  
  /* Legend */
  .legend-section {
    padding: 12px 16px;
    border-radius: 10px;
  }
  
  .legend-header {
    font-size: 12px;
    gap: 8px;
    margin-bottom: 6px;
  }
  
  .legend-header svg {
    width: 14px;
    height: 14px;
  }
  
  .legend-description {
    font-size: 11px;
    line-height: 1.4;
  }
  
  .legend-scale {
    margin-top: 12px;
  }
  
  .scale-bar {
    height: 6px;
    margin-bottom: 10px;
  }
  
  .scale-labels-6 {
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
  }
  
  .scale-label {
    padding: 5px 6px;
    gap: 5px;
    border-radius: 6px;
  }
  
  .label-indicator {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
  
  .label-name {
    font-size: 9px;
  }
  
  .label-range {
    font-size: 8px;
  }
  
  /* Loading/Error */
  .spinner {
    width: 26px;
    height: 26px;
    border-width: 2px;
    margin-bottom: 10px;
  }
  
  .loading-state p,
  .error-state p {
    font-size: 12px;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .card-header {
    padding: 8px 12px;
    gap: 6px;
  }
  
  .header-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }
  
  .header-icon svg {
    width: 14px;
    height: 14px;
  }
  
  .icon-dollar {
    font-size: 14px;
  }
  
  .header-title {
    font-size: 11px;
  }
  
  .header-subtitle {
    font-size: 9px;
  }
  
  .year-badge {
    padding: 3px 8px;
    font-size: 10px;
    border-radius: 12px;
  }
  
  .export-btn-circle {
    width: 22px;
    height: 22px;
  }
  
  .export-btn-circle svg {
    width: 10px;
    height: 10px;
  }
  
  /* IFS Mode - Gauge */
  .metrics-section {
    gap: 5px;
    padding: 10px 0 0 0 ;
  }
  
  .title-main {
    font-size: 12px;
  }
  
  .title-sub {
    font-size: 10px;
  }
  
  /* ✅ Metrics en 2 columnas con divider vertical */
  .metrics-row {
    flex-direction: row;
    gap: 12px;
    justify-content: center;
    align-items: center;
  }
  
  .metrics-divider {
    width: 1px;
    height: 80px;
  }
  
  .metric-gauge {
    width: 90px;
    height: 90px;
  }
  
  .gauge-value {
    font-size: 16px;
  }
  
  .gauge-label {
    font-size: 8px;
  }
  
  .position-metric {
    min-width: auto;
  }
  
  .position-badge {
    padding: 10px 14px;
    border-radius: 10px;
  }
  
  .position-label {
    font-size: 7px;
    margin-bottom: 4px;
  }
  
  .position-hash {
    font-size: 16px;
  }
  
  .position-value {
    font-size: 16px;
  }
  
  /* Monetary Mode */
  .content-monetary {
    padding: 14px 12px 12px 12px;
  }
  
  .content-center {
    padding-bottom: 12px;
  }
  
  .monetary-row {
    flex-direction: row;
    gap: 10px;
    justify-content: center;
    align-items: stretch;
  }
  
  .monetary-main {
    padding: 12px 14px;
    border-radius: 10px;
    flex: 1;
    max-width: 150px;
  }
  
  .monetary-label {
    font-size: 8px;
    margin-bottom: 6px;
  }
  
  .monetary-currency {
    font-size: 12px;
  }
  
  .monetary-amount {
    font-size: 18px;
  }
  
  .monetary-unit {
    font-size: 8px;
    margin-top: 4px;
  }
  
  .position-card {
    padding: 12px 14px;
    border-radius: 10px;
    flex: 1;
    max-width: 150px;
  }
  
  .position-label-monetary {
    font-size: 8px;
    margin-bottom: 6px;
  }
  
  .position-value-monetary {
    font-size: 18px;
  }
  
  /* Legend */
  .legend-section {
    padding: 10px 12px;
    border-radius: 8px;
  }
  
  .legend-header {
    font-size: 11px;
    gap: 6px;
    margin-bottom: 5px;
  }
  
  .legend-header svg {
    width: 12px;
    height: 12px;
  }
  
  .legend-description {
    font-size: 10px;
  }
  
  .legend-scale {
    margin-top: 10px;
  }
  
  .scale-bar {
    height: 5px;
    margin-bottom: 8px;
  }
  
  .scale-labels-6 {
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
  }
  
  .scale-label {
    padding: 4px 5px;
    gap: 4px;
    border-radius: 5px;
  }
  
  .label-indicator {
    width: 6px;
    height: 6px;
  }
  
  .label-name {
    font-size: 8px;
  }
  
  .label-range {
    font-size: 7px;
  }
  
  .spinner {
    width: 22px;
    height: 22px;
  }
  
  .loading-state p,
  .error-state p {
    font-size: 11px;
  }
}

/* Landscape en móviles */
@media (max-width: 768px) and (orientation: landscape) {
  .card-header {
    padding: 8px 12px;
  }
  
  .content-ifs {
    padding: 1px 16px;
    gap: 10px;
    flex-direction: row;
  }
  
  .metrics-section {
    flex: 1;
    padding: 8px 0;
  }
  
  .metrics-row {
    flex-direction: row;
    gap: 16px;
  }
  
  .metrics-divider {
    width: 1px;
    height: 70px;
  }
  
  .metric-gauge {
    width: 80px;
    height: 80px;
  }
  
  .gauge-value {
    font-size: 14px;
  }
  
  .gauge-label {
    font-size: 7px;
  }
  
  .position-badge {
    padding: 8px 12px;
  }
  
  .position-hash,
  .position-value {
    font-size: 14px;
  }
  
  .position-label {
    font-size: 6px;
  }
  
  .legend-section {
    flex: 1;
    margin-top: 0;
  }
  
  .scale-labels-6 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  /* Monetary landscape */
  .content-monetary {
    padding: 10px 16px;
    flex-direction: row;
  }
  
  .content-center {
    flex: 1;
    padding-bottom: 0;
  }
  
  .monetary-row {
    flex-direction: row;
    gap: 12px;
  }
  
  .monetary-main,
  .position-card {
    padding: 10px 16px;
    max-width: 160px;
  }
  
  .monetary-amount,
  .position-value-monetary {
    font-size: 16px;
  }
  
  .monetary-currency {
    font-size: 12px;
  }
  
  .monetary-unit {
    font-size: 7px;
  }
}
</style>