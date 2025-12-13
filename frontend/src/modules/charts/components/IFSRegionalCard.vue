<!-- src/modules/charts/components/IFSRegionalCard.vue -->
<!-- Card que muestra métricas federales de México - cambia según la variable seleccionada -->
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

        <!-- Leyenda IFS con escala -->
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
            <div class="scale-labels">
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
                <span class="monetary-unit">{{ monetaryUnit }}</span>
              </div>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'
import { getCleanValue } from '@/composables/parseNumber'

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
const metricValue = ref(0)
const positionValue = ref(null)

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

// Niveles del IFS
const ifsLevels = [
  { range: '0.00 - 0.25', label: 'Bajo', color: '#ef4444' },
  { range: '0.26 - 0.50', label: 'Medio', color: '#f59e0b' },
  { range: '0.51 - 0.75', label: 'Alto', color: '#7cb342' },
  { range: '0.76 - 1.00', label: 'Óptimo', color: '#22c55e' }
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

// Computed - Unidad monetaria
const monetaryUnit = computed(() => {
  const value = metricValue.value
  
  if (value >= 1e12) return 'Billones'
  if (value >= 1e9) return 'MMP'
  if (value >= 1e6) return 'MDP'
  if (value >= 1e3) return 'Miles'
  return 'Pesos'
})

// Computed - Progreso del gauge (solo IFS)
const gaugeProgress = computed(() => {
  return Math.min(metricValue.value, 1) * 365
})

// Computed - Nivel actual IFS
const currentLevelIndex = computed(() => {
  const val = metricValue.value
  if (val <= 0.25) return 0
  if (val <= 0.50) return 1
  if (val <= 0.75) return 2
  return 3
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

onMounted(() => {
  loadData()
})
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
  font-size: 42px;
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
  font-size: 48px;
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
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-left: 4px;
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

.scale-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
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
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.label-text {
  display: flex;
  flex-direction: column;
}

.label-name {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.label-range {
  font-size: 10px;
  color: #94a3b8;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 768px) {
  .metrics-row {
    flex-direction: column;
    gap: 24px;
  }
  
  .metrics-divider {
    width: 80%;
    height: 1px;
  }
  
  .scale-labels {
    flex-wrap: wrap;
  }
  
  .scale-label {
    flex: 1 1 45%;
  }
  
  .content-monetary {
    padding: 30px 30px 20px 30px;
  }
  
  .monetary-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .monetary-amount {
    font-size: 48px;
  }
  
  .position-value-monetary {
    font-size: 40px;
  }
}
</style>