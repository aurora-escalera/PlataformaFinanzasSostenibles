<!-- IFSRegionalCard.vue - Componente dual: Ranking Internacional o Card Individual -->
<!-- Muestra ranking cuando variable es "Todas" o "IFS", card individual para otras -->
<template>
  <div class="ifs-regional-card" :class="{ 'mode-ranking': isRankingMode, 'mode-card': !isRankingMode }">
    
    <!-- MODO RANKING (Todas las variables / IFS) -->
    <template v-if="isRankingMode">
      <div class="card-header ranking-header">
        <div class="header-content">
          <h3 class="card-title">Ranking Internacional IFS</h3>
          <span class="card-subtitle">{{ selectedYear || 'Todos los años' }}</span>
        </div>
        <div class="header-badge">
          <span class="badge-count">{{ activeVariables.length }}</span>
          <span class="badge-label">países</span>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando datos internacionales...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadRankingData" class="retry-btn">Reintentar</button>
      </div>

      <div v-else class="card-content">
        <div class="bars-container" :class="{ 'has-hover': hoveredBarKey !== null }">
          <div 
            v-for="(country, index) in activeVariables" 
            :key="country.key"
            class="bar-row"
            :class="{ 
              'is-hovered': hoveredBarKey === country.key,
              'is-dimmed': hoveredBarKey !== null && hoveredBarKey !== country.key,
              'is-no-data': isNoData(country.value),
              'is-mexico': isHighlightedCountry(country.key),
              'is-not-mexico': !isHighlightedCountry(country.key)
            }"
            :style="{ animationDelay: index * 30 + 'ms' }"
            @mouseenter="handleMouseEnter(country, $event)"
            @mousemove="handleMouseMove($event)"
            @mouseleave="handleMouseLeave"
          >
            <div class="rank-position" :style="{ backgroundColor: country.color }">
              <span class="rank-number">{{ index + 1 }}</span>
            </div>
            <div class="country-label" :class="{ 'highlighted-label': hoveredBarKey === country.key }">
              {{ country.label }}
            </div>
            <div class="bar-chart-area">
              <div class="grid-lines">
                <div v-for="tick in xAxisTicks" :key="tick.value" class="grid-line" :style="{ left: tick.position + '%' }"></div>
              </div>
              <div class="bar-wrapper-horizontal">
                <div v-if="!isNoData(country.value)" class="bar-horizontal" :style="{ width: getBarWidth(country.value) + '%', background: country.color }">
                  <span class="bar-value">{{ formatValue(country.value) }}</span>
                </div>
                <span v-else class="no-data-text">Sin datos</span>
              </div>
            </div>
            <div class="classification-badge" :style="{ backgroundColor: country.color + '20', color: country.color }">
              {{ country.classification }}
            </div>
          </div>
          <div v-if="activeVariables.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">🌎</div>
            <p>No hay datos internacionales disponibles</p>
          </div>
        </div>

        <div class="color-legend-strip">
          <div class="legend-bar-container">
            <div class="legend-items">
              <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
                <div class="legend-color-block" :style="{ backgroundColor: item.color }">
                  <span class="legend-indicator">{{ item.label }}</span>
                </div>
                <span class="legend-range-value">{{ item.range }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Teleport to="body">
        <div v-if="tooltip.visible" class="tooltip-international" :style="tooltipStyle">
          <div class="tooltip-content">
            <div class="tooltip-flag" :style="{ backgroundColor: tooltip.color }">🌐</div>
            <div class="tooltip-info">
              <div class="tooltip-country">{{ tooltip.label }}</div>
              <div class="tooltip-value">{{ tooltip.isNoData ? 'Sin datos disponibles' : 'IFS: ' + formatValue(tooltip.value) }}</div>
              <div class="tooltip-classification" :style="{ color: tooltip.color }">{{ tooltip.classification }}</div>
            </div>
          </div>
        </div>
      </Teleport>
    </template>

    <!-- MODO CARD (PS, IS, PIC, IIC) - Dashboard Moderno -->
    <template v-else>
      <div class="card-modern">
        <!-- Header con gradiente -->
        <div class="modern-header" :class="currentConfig.colorTheme">
          <div class="header-left">
            <div class="header-icon-modern" :class="currentConfig.colorTheme">
              <svg v-if="currentConfig.colorTheme === 'green'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="header-text-modern">
              <h3 class="header-title-modern">{{ currentConfig.headerTitle }}</h3>
              <span class="header-subtitle-modern">Datos Federales {{ selectedYear || '' }}</span>
            </div>
          </div>
          <div class="header-right">
            <div class="year-badge-modern" :class="currentConfig.colorTheme">
              <span class="year-value">{{ selectedYear || '—' }}</span>
            </div>
            <button class="export-btn-modern" @click.stop="toggleExportMenu" title="Exportar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <transition name="dropdown-fade">
              <div v-if="showExportMenu" class="export-dropdown-modern">
                <button class="export-option-modern" @click="handleExport('xlsx')">
                  <span class="option-icon-modern xlsx">XLS</span>Excel
                </button>
                <button class="export-option-modern" @click="handleExport('csv')">
                  <span class="option-icon-modern csv">CSV</span>CSV
                </button>
              </div>
            </transition>
          </div>
        </div>

        <!-- Body -->
        <div class="modern-body">
          <div v-if="loading" class="loading-state-modern">
            <div class="spinner-modern" :class="currentConfig.colorTheme"></div>
            <p>Cargando datos...</p>
          </div>

          <div v-else-if="error" class="error-state-modern">
            <p>{{ error }}</p>
          </div>

          <div v-else class="content-modern">
            <!-- Métricas principales -->
            <div class="metrics-grid">
              <!-- Card Valor Principal -->
              <div class="metric-card-modern main-metric" :class="currentConfig.colorTheme">
                <div class="metric-icon-bg" :class="currentConfig.colorTheme">
                  <svg v-if="currentConfig.colorTheme === 'green'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/><path d="M16 8l-4 4-4-4"/><path d="M8 16l4-4 4 4"/>
                  </svg>
                </div>
                <div class="metric-content">
                  <span class="metric-label-modern">{{ currentConfig.title }}</span>
                  <div class="metric-value-modern" :class="currentConfig.colorTheme">
                    <span class="currency-symbol">$</span>
                    <span class="value-number">{{ formattedMonetaryValue }}</span>
                  </div>
                  <span class="metric-unit-modern">{{ monetaryUnitText }}</span>
                </div>
                <div class="metric-decoration" :class="currentConfig.colorTheme"></div>
              </div>

              <!-- Card Posición -->
              <div class="metric-card-modern position-metric" :class="currentConfig.colorTheme">
                <div class="metric-icon-bg" :class="currentConfig.colorTheme">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                </div>
                <div class="metric-content">
                  <span class="metric-label-modern">Posición Internacional</span>
                  <div class="position-value-modern" :class="currentConfig.colorTheme">
                    <span class="position-hash">#</span>
                    <span class="position-number">{{ positionValue || '—' }}</span>
                  </div>
                  <span class="metric-unit-modern">de 20 países</span>
                </div>
                <div class="metric-decoration" :class="currentConfig.colorTheme"></div>
              </div>
            </div>

            <!-- Indicador visual de progreso -->
            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-title">Nivel de {{ currentConfig.colorTheme === 'green' ? 'Sostenibilidad' : 'Intensidad de Carbono' }}</span>
                <span class="progress-percentage" :class="currentConfig.colorTheme">{{ getProgressPercentage }}%</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" :class="currentConfig.colorTheme" :style="{ width: getProgressPercentage + '%' }"></div>
                </div>
                <div class="progress-markers">
                  <span>Bajo</span>
                  <span>Medio</span>
                  <span>Alto</span>
                </div>
              </div>
            </div>

            <!-- Info Section -->
            <div class="info-section-modern">
              <div class="info-icon" :class="currentConfig.colorTheme">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <div class="info-content">
                <span class="info-title">{{ currentConfig.legendTitle }}</span>
                <p class="info-description" v-html="currentConfig.legendDescription"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'
import { getCleanValue } from '@/composables/parseNumber'
import { useExportData } from '@/composables/useExportData'

const props = defineProps({
  selectedYear: { type: [String, Number, null], default: null },
  selectedVariable: { type: [Object, String, null], default: null },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' }
})

const emit = defineEmits(['data-loaded', 'error', 'years-loaded'])

const { fetchData, parseNumericValue, fetchInternationalSheetNames } = useStorageData()
const { exportIFSRegionalData } = useExportData()
const loading = ref(false)
const error = ref(null)

// Estado Ranking
const countriesData = ref([])
const availableYears = ref([])
const hoveredBarKey = ref(null)
const tooltip = ref({ visible: false, x: 0, y: 0, label: '', value: '', color: '', classification: '', isNoData: false })
const isAnimated = ref(false)
const HIGHLIGHTED_COUNTRY = 'México'

// Estado Card
const metricValue = ref(0)
const positionValue = ref(null)
const showExportMenu = ref(false)
const exportWrapperRef = ref(null)

// Modo actual
const currentVariableKey = computed(() => {
  if (!props.selectedVariable) return 'ALL'
  if (typeof props.selectedVariable === 'string') {
    const lower = props.selectedVariable.toLowerCase()
    if (lower.includes('todas') || lower.includes('all')) return 'ALL'
    return props.selectedVariable
  }
  const key = props.selectedVariable?.key || 'ALL'
  if (key.toLowerCase().includes('todas') || key.toLowerCase().includes('all')) return 'ALL'
  return key
})

const isRankingMode = computed(() => {
  const key = currentVariableKey.value
  return key === 'ALL' || key === 'IFS' || key === 'todas' || key === 'TODAS'
})

// Colores
const COLORS = {
  VERDE_FUERTE: '#22c55e', VERDE: '#94d351', VERDE_BAJO: '#bddc50',
  AMARILLO: '#facc15', ANARANJADO: '#e6a74c', ROJO: '#ef4444',
  ROJO_FUERTE: '#dc2626', GRIS: '#9ca3af'
}

const legendItems = [
  { color: COLORS.VERDE_FUERTE, range: '3.5-4.0', label: 'Muy Alto' },
  { color: COLORS.VERDE, range: '2.9-3.4', label: 'Alto' },
  { color: COLORS.VERDE_BAJO, range: '2.3-2.8', label: 'M. Alto' },
  { color: COLORS.AMARILLO, range: '1.8-2.2', label: 'Medio' },
  { color: COLORS.ANARANJADO, range: '1.2-1.7', label: 'M. Bajo' },
  { color: COLORS.ROJO, range: '0.6-1.1', label: 'Bajo' },
  { color: COLORS.ROJO_FUERTE, range: '0.0-0.5', label: 'Muy Bajo' }
]

const variableConfigs = {
  PS: { key: 'PS', headerTitle: 'Presupuestos Sostenibles', title: 'Valor Total PS', legendTitle: '¿Qué son los Presupuestos Sostenibles?', legendDescription: 'Los <strong>Presupuestos Sostenibles (PS)</strong> representan el monto del presupuesto federal destinado a actividades que promueven la sostenibilidad ambiental.', valueColumn: 'PS ($)', positionColumn: 'POS_PS', headerClass: 'header-green', colorTheme: 'green' },
  IS: { key: 'IS', headerTitle: 'Ingresos Sostenibles', title: 'Valor Total IS', legendTitle: '¿Qué son los Ingresos Sostenibles?', legendDescription: 'Los <strong>Ingresos Sostenibles (IS)</strong> representan el monto de los ingresos federales provenientes de fuentes que promueven la sostenibilidad ambiental.', valueColumn: 'IS ($)', positionColumn: 'POS_IS', headerClass: 'header-green', colorTheme: 'green' },
  PIC: { key: 'PIC', headerTitle: 'Presupuestos Intensivos en Carbono', title: 'Valor Total PIC', legendTitle: '¿Qué son los PIC?', legendDescription: 'Los <strong>Presupuestos Intensivos en Carbono (PIC)</strong> representan el monto destinado a actividades con alta generación de emisiones de carbono.', valueColumn: 'PIC ($)', positionColumn: 'POS_PIC', headerClass: 'header-red', colorTheme: 'red' },
  IIC: { key: 'IIC', headerTitle: 'Ingresos Intensivos en Carbono', title: 'Valor Total IIC', legendTitle: '¿Qué son los IIC?', legendDescription: 'Los <strong>Ingresos Intensivos en Carbono (IIC)</strong> representan el monto de los ingresos provenientes de actividades relacionadas con combustibles fósiles.', valueColumn: 'IIC ($)', positionColumn: 'POS_IIC', headerClass: 'header-red', colorTheme: 'red' }
}

const currentConfig = computed(() => variableConfigs[currentVariableKey.value] || variableConfigs.PS)

// Funciones compartidas
const isNoData = (value) => {
  if (value === null || value === undefined || value === '') return true
  const numValue = parseFloat(value)
  return isNaN(numValue) || numValue === 0 || Math.abs(numValue) < 0.005
}

const getIFSColor = (value) => {
  if (isNoData(value)) return { color: COLORS.GRIS, label: 'Sin datos' }
  const numValue = parseFloat(value) || 0
  if (numValue >= 3.5) return { color: COLORS.VERDE_FUERTE, label: 'Muy Alto' }
  if (numValue >= 2.9) return { color: COLORS.VERDE, label: 'Alto' }
  if (numValue >= 2.3) return { color: COLORS.VERDE_BAJO, label: 'Medio Alto' }
  if (numValue >= 1.8) return { color: COLORS.AMARILLO, label: 'Medio' }
  if (numValue >= 1.2) return { color: COLORS.ANARANJADO, label: 'Medio Bajo' }
  if (numValue >= 0.6) return { color: COLORS.ROJO, label: 'Bajo' }
  return { color: COLORS.ROJO_FUERTE, label: 'Muy Bajo' }
}

const formatValue = (value) => typeof value === 'number' ? Math.floor(value * 100) / 100 : value

const isHighlightedCountry = (countryKey) => {
  if (!countryKey) return false
  const normalizedKey = countryKey.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return normalizedKey === 'mexico' || normalizedKey.includes('mexico')
}

// Ranking functions
const activeVariables = computed(() => countriesData.value)
const maxValue = computed(() => Math.max(...activeVariables.value.map(v => v.value || 0), 4))

const xAxisTicks = computed(() => {
  const max = maxValue.value
  const step = max / 4
  return Array.from({ length: 5 }, (_, i) => ({ value: step * i, position: (step * i / max) * 100 }))
})

const tooltipStyle = computed(() => ({ left: (tooltip.value.x + 15) + 'px', top: (tooltip.value.y - 70) + 'px' }))

const getBarWidth = (value) => {
  if (!isAnimated.value || isNoData(value)) return 0
  return Math.min(8 + ((parseFloat(value) || 0) / maxValue.value) * 100 * 0.88, 100)
}

const handleMouseEnter = (country, event) => {
  hoveredBarKey.value = country.key
  tooltip.value = { visible: true, x: event.clientX, y: event.clientY, label: country.label, value: country.value, color: country.color, classification: country.classification, isNoData: isNoData(country.value) }
}
const handleMouseMove = (event) => { if (tooltip.value.visible) { tooltip.value.x = event.clientX; tooltip.value.y = event.clientY } }
const handleMouseLeave = () => { hoveredBarKey.value = null; tooltip.value.visible = false }

const loadAvailableYears = async () => {
  try {
    const years = await fetchInternationalSheetNames()
    if (years?.length) { availableYears.value = years; emit('years-loaded', years) }
    return years
  } catch (err) { console.error('Error:', err); return [] }
}

const loadRankingData = async () => {
  try {
    loading.value = true; error.value = null
    const mapping = getMapping('datosInternacionales')
    const rawData = await fetchData('datosInternacionales', props.selectedYear || '2020')
    if (!rawData?.length) { countriesData.value = []; return }
    const categoryColumn = mapping.categoryColumn || 'País'
    const ifsVariable = mapping.variables?.find(v => v.key === 'IFS') || { column: 'IFS' }
    countriesData.value = rawData.map(row => {
      const countryName = row[categoryColumn]
      const ifsValue = parseNumericValue(row[ifsVariable.column])
      const colorInfo = getIFSColor(ifsValue)
      return { key: countryName, label: countryName, value: ifsValue, color: colorInfo.color, classification: colorInfo.label }
    }).filter(c => c.label).sort((a, b) => {
      if (isNoData(a.value) && !isNoData(b.value)) return 1
      if (!isNoData(a.value) && isNoData(b.value)) return -1
      return (b.value || 0) - (a.value || 0)
    })
    setTimeout(() => { isAnimated.value = true }, 100)
    emit('data-loaded', countriesData.value)
  } catch (err) { error.value = err.message; emit('error', err) }
  finally { loading.value = false }
}

// Card functions
const formattedMonetaryValue = computed(() => {
  if (metricValue.value == null) return '—'
  const v = metricValue.value
  if (v >= 1e12) return (v / 1e12).toFixed(2)
  if (v >= 1e9) return (v / 1e9).toFixed(2)
  if (v >= 1e6) return (v / 1e6).toFixed(2)
  if (v >= 1e3) return (v / 1e3).toFixed(2)
  return v.toFixed(2)
})

const monetaryUnitText = computed(() => {
  const v = metricValue.value
  if (v >= 1e9) return 'Billones de dólares (USD)'
  if (v >= 1e6) return 'Millones de dólares (USD)'
  if (v >= 1e3) return 'Miles de dólares (USD)'
  return 'Dólares (USD)'
})

const getProgressPercentage = computed(() => {
  if (!positionValue.value) return 50
  // Invertir: posición 1 = 100%, posición 20 = 5%
  const percentage = Math.max(5, Math.round((21 - positionValue.value) / 20 * 100))
  return percentage
})

const toggleExportMenu = () => { showExportMenu.value = !showExportMenu.value }
const handleClickOutside = (event) => { if (exportWrapperRef.value && !exportWrapperRef.value.contains(event.target)) showExportMenu.value = false }
const handleExport = (format) => {
  showExportMenu.value = false
  exportIFSRegionalData({ indicador: currentConfig.value.headerTitle, valor: metricValue.value, posicion: positionValue.value, tipo: 'Monetario (USD)' }, format, { year: props.selectedYear, variable: props.selectedVariable })
}

const loadCardData = async () => {
  try {
    loading.value = true; error.value = null
    const data = await fetchData('chartsPresupuestosRegional', getSheetName('chartsPresupuestosRegional'))
    if (!data?.length) return
    let row = data[0]
    if (props.selectedYear) { const f = data.find(r => String(r['Año']).trim() === String(props.selectedYear).trim()); if (f) row = f }
    const config = currentConfig.value
    if (row.hasOwnProperty(config.valueColumn)) metricValue.value = getCleanValue(row, config.valueColumn)
    if (row.hasOwnProperty(config.positionColumn)) positionValue.value = Math.round(getCleanValue(row, config.positionColumn))
  } catch (err) { error.value = err.message }
  finally { loading.value = false }
}

const loadData = async () => { if (isRankingMode.value) await loadRankingData(); else await loadCardData() }

watch([() => props.selectedYear, () => props.selectedVariable], () => { isAnimated.value = false; loadData() }, { immediate: false })
watch(isRankingMode, () => { loadData() })

onMounted(async () => { document.addEventListener('click', handleClickOutside); await loadAvailableYears(); await loadData() })
onBeforeUnmount(() => { document.removeEventListener('click', handleClickOutside) })
</script>

<style scoped>
.ifs-regional-card { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); }
.ifs-regional-card.mode-ranking { background: #163C5F; border-radius: 12px; padding: 12px; box-sizing: border-box; }
.ifs-regional-card.mode-card { background: white; border-radius: 12px; }

/* HEADER RANKING */
.ranking-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 2px solid rgba(255, 255, 255, 0.15); flex-shrink: 0; }
.ranking-header .header-content { display: flex; flex-direction: column; gap: 1px; }
.ranking-header .card-title { margin: 0; font-size: 15px; font-weight: 300; color: white; letter-spacing: 0.5px; }
.ranking-header .card-subtitle { font-size: 11px; color: rgba(255, 255, 255, 0.6); font-weight: 400; }
.header-badge { display: flex; flex-direction: column; align-items: center; background: rgba(255, 255, 255, 0.1); padding: 6px 12px; border-radius: 6px; }
.badge-count { font-size: 18px; font-weight: 600; color: white; line-height: 1; }
.badge-label { font-size: 8px; color: rgba(255, 255, 255, 0.7); text-transform: uppercase; letter-spacing: 0.5px; }

/* HEADER CARD */
.mode-card .card-header { display: flex; align-items: center; gap: 14px; padding: 14px 24px; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); flex-shrink: 0; }
.mode-card .card-header.header-green { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); }
.mode-card .card-header.header-red { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
.header-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
.icon-dollar { font-size: 20px; font-weight: 600; }
.header-text { flex: 1; }
.header-title { margin: 0; font-size: 18px; font-weight: 600; color: white; }
.mode-card .header-subtitle { margin: 2px 0 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.8); }
.year-badge { background: rgba(255, 255, 255, 0.2); color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }

/* EXPORT */
.export-wrapper { position: relative; margin-left: 8px; }
.export-btn-circle { width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); color: rgba(255, 255, 255, 0.9); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
.export-btn-circle:hover { background: rgba(255, 255, 255, 0.25); color: white; transform: scale(1.08); }
.export-btn-circle.is-open { background: rgba(255, 255, 255, 0.3); }
.export-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: white; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border: 1px solid #e5e7eb; overflow: hidden; z-index: 1000; min-width: 120px; }
.export-option { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; background: none; border: none; cursor: pointer; font-size: 13px; color: #374151; }
.export-option:hover { background: #f3f4f6; }
.export-option:first-child { border-bottom: 1px solid #e5e7eb; }
.option-icon { font-size: 9px; font-weight: 700; padding: 3px 6px; border-radius: 4px; color: white; }
.option-icon.xlsx { background: #107c41; }
.option-icon.csv { background: #6366f1; }
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* LOADING/ERROR */
.loading-state, .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 12px; }
.mode-ranking .loading-state, .mode-ranking .error-state { color: rgba(255, 255, 255, 0.7); }
.mode-card .loading-state, .mode-card .error-state { color: #64748b; }
.spinner { width: 36px; height: 36px; border: 3px solid rgba(255, 255, 255, 0.2); border-top-color: #22c55e; border-radius: 50%; animation: spin 1s linear infinite; }
.mode-card .spinner { border-color: #e2e8f0; border-top-color: #7cb342; }
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn { background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); color: white; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; }

/* RANKING CONTENT */
.mode-ranking .card-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-height: 0; background: white; border-radius: 6px; padding: 14px; }
.bars-container { display: flex; flex-direction: column; gap: 7px; flex: 1; width: 100%; overflow-y: auto; overflow-x: hidden; min-height: 0; padding: 10px; }
.bar-row { display: grid; grid-template-columns: 18px 100px 1fr 65px; gap: 6px; align-items: center; flex: 1; min-height: 12px; max-height: 28px; padding: 0; transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease; cursor: pointer; border-radius: 4px; animation: slideIn 0.4s ease-out backwards; }
@keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
.bar-row:hover { background: rgba(22, 60, 95, 0.05); }
.bar-row.is-hovered { opacity: 1; transform: scale(1.01); z-index: 10; background: rgba(22, 60, 95, 0.08); }
.bar-row.is-dimmed { opacity: 0.3; filter: grayscale(30%); }
.bar-row.is-no-data { opacity: 0.6; }

/* MEXICO HIGHLIGHT */
.bar-row.is-not-mexico { opacity: 0.7; filter: saturate(0.95); }
.bar-row.is-mexico { opacity: 1; background: linear-gradient(135deg, rgba(0, 104, 71, 0.08) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(206, 17, 38, 0.08) 100%), repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0, 104, 71, 0.03) 4px, rgba(0, 104, 71, 0.03) 8px); box-shadow: 0 0 15px rgba(0, 104, 71, 0.4), 0 0 30px rgba(0, 104, 71, 0.2), 0 0 45px rgba(0, 104, 71, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.5); border-left: 4px solid; border-image: linear-gradient(180deg, #006847 0%, #fff 50%, #ce1126 100%) 1; border-radius: 0 6px 6px 0; position: relative; z-index: 5; padding: 3px 6px 3px 8px; margin: 1px 0; }
.bar-row.is-mexico .country-label { font-weight: 700; font-size: 14px; color: #1a202c; }
.bar-row.is-mexico .rank-position { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); }
.bar-row.is-mexico .bar-horizontal { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); }
.bar-row.is-mexico .classification-badge { font-weight: 700; }
.bar-row.is-not-mexico:hover { opacity: 1; filter: saturate(1); }
.bars-container.has-hover .bar-row.is-not-mexico:not(.is-hovered) { opacity: 0.4; filter: saturate(0.6); }
.bars-container.has-hover .bar-row.is-mexico:not(.is-hovered) { opacity: 0.9; }

/* BAR ELEMENTS */
.rank-position { display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15); }
.bar-row:hover .rank-position { transform: scale(1.05); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); }
.rank-number { font-size: 10px; font-weight: 700; color: white; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3); }
.country-label { font-size: 12px; font-weight: 500; color: #374151; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
.country-label.highlighted-label { font-weight: 600; color: #1a202c; }
.bar-chart-area { position: relative; width: 100%; height: 100%; min-height: 0; }
.grid-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
.grid-line { position: absolute; top: 0; bottom: 0; width: 1px; background: #e5e7eb; }
.bar-wrapper-horizontal { position: relative; width: 100%; height: 100%; background: #f3f4f6; overflow: visible; border-radius: 3px; min-height: 0; }
.bar-horizontal { height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); position: relative; border-radius: 3px; display: flex; align-items: center; justify-content: flex-end; padding-right: 6px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12); min-width: 32px; box-sizing: border-box; }
.bar-row.is-hovered .bar-horizontal { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); }
.bar-value { font-size: 12px; font-weight: 700; color: white; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3); white-space: nowrap; }
.no-data-text { display: flex; align-items: center; height: 100%; padding-left: 8px; font-size: 9px; color: #9ca3af; font-style: italic; }
.classification-badge { font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2px; padding: 4px 0px; border-radius: 3px; text-align: center; white-space: nowrap; line-height: 1.2; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; color: #9ca3af; gap: 8px; padding: 40px; }
.empty-icon { font-size: 48px; }

/* LEGEND RANKING */
.color-legend-strip { flex-shrink: 0; padding-top: 8px; margin-top: 6px; border-top: 1px solid #e5e7eb; }
.legend-bar-container { width: 100%; }
.legend-items { display: flex; width: 100%; border-radius: 3px; overflow: hidden; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }
.legend-item { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 0; }
.legend-color-block { width: 100%; height: 14px; display: flex; align-items: center; justify-content: center; }
.legend-item:first-child .legend-color-block { border-radius: 3px 0 0 3px; }
.legend-item:last-child .legend-color-block { border-radius: 0 3px 3px 0; }
.legend-indicator { font-size: 11px; font-weight: 600; color: white; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; letter-spacing: 0.1px; }
.legend-range-value { font-size: 12px; font-weight: 500; color: #6b7280; margin-top: 1px; white-space: nowrap; }

/* TOOLTIP */
.tooltip-international { position: fixed; background: rgba(22, 60, 95, 0.96); color: white; padding: 14px 18px; border-radius: 10px; font-size: 12px; white-space: nowrap; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); pointer-events: none; z-index: 999999; backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); }
.tooltip-content { display: flex; align-items: center; gap: 14px; }
.tooltip-flag { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.tooltip-info { display: flex; flex-direction: column; gap: 4px; }
.tooltip-country { font-weight: 600; font-size: 14px; color: white; }
.tooltip-value { font-size: 13px; opacity: 0.9; }
.tooltip-classification { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

/* CARD MONETARY - DASHBOARD MODERNO */
.card-modern { display: flex; flex-direction: column; height: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }

/* Header Moderno */
.modern-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-bottom: 1px solid rgba(255,255,255,0.1); }
.modern-header.green { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); }
.modern-header.red { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
.header-left { display: flex; align-items: center; gap: 14px; }
.header-icon-modern { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); color: white; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.header-icon-modern.green { background: rgba(255,255,255,0.25); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
.header-icon-modern.red { background: rgba(255,255,255,0.25); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
.header-icon-modern:hover { transform: scale(1.05); }
.header-text-modern { display: flex; flex-direction: column; gap: 2px; }
.header-title-modern { margin: 0; font-size: 16px; font-weight: 600; color: white; }
.header-subtitle-modern { font-size: 12px; color: rgba(255,255,255,0.7); }
.header-right { display: flex; align-items: center; gap: 12px; position: relative; }
.year-badge-modern { padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; color: white; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); }
.year-badge-modern.green { background: rgba(255,255,255,0.25); }
.year-badge-modern.red { background: rgba(255,255,255,0.25); }
.export-btn-modern { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
.export-btn-modern:hover { background: rgba(255,255,255,0.25); color: white; transform: scale(1.05); }
.export-dropdown-modern { position: absolute; top: calc(100% + 8px); right: 0; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; overflow: hidden; z-index: 1000; min-width: 130px; }
.export-option-modern { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; background: none; border: none; cursor: pointer; font-size: 13px; color: #374151; transition: all 0.2s ease; }
.export-option-modern:hover { background: #f3f4f6; color: #1e293b; }
.export-option-modern:first-child { border-bottom: 1px solid #e2e8f0; }
.option-icon-modern { font-size: 9px; font-weight: 700; padding: 4px 8px; border-radius: 4px; color: white; }
.option-icon-modern.xlsx { background: #22c55e; }
.option-icon-modern.csv { background: #6366f1; }

/* Body Moderno */
.modern-body { flex: 1; display: flex; flex-direction: column; padding: 20px; overflow: auto; background: #ffffff; }
.loading-state-modern, .error-state-modern { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 12px; color: #64748b; }
.spinner-modern { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-radius: 50%; animation: spin 1s linear infinite; }
.spinner-modern.green { border-top-color: #22c55e; }
.spinner-modern.red { border-top-color: #ef4444; }
.content-modern { display: flex; flex-direction: column; gap: 20px; height: 100%; }

/* Metrics Grid */
.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.metric-card-modern { position: relative; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.metric-card-modern:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
.metric-card-modern.green { border-color: rgba(34, 197, 94, 0.3); background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
.metric-card-modern.green:hover { box-shadow: 0 12px 40px rgba(34, 197, 94, 0.2); }
.metric-card-modern.red { border-color: rgba(239, 68, 68, 0.3); background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
.metric-card-modern.red:hover { box-shadow: 0 12px 40px rgba(239, 68, 68, 0.2); }
.metric-icon-bg { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; transition: transform 0.3s ease; }
.metric-icon-bg.green { background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%); color: #16a34a; }
.metric-icon-bg.red { background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%); color: #dc2626; }
.metric-card-modern:hover .metric-icon-bg { transform: scale(1.1); }
.metric-content { position: relative; z-index: 1; }
.metric-label-modern { display: block; font-size: 12px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.metric-value-modern { display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px; }
.metric-value-modern .currency-symbol { font-size: 24px; font-weight: 500; }
.metric-value-modern.green .currency-symbol { color: #16a34a; }
.metric-value-modern.red .currency-symbol { color: #dc2626; }
.metric-value-modern .value-number { font-size: 36px; font-weight: 700; color: #1e293b; line-height: 1; }
.metric-unit-modern { font-size: 11px; color: #94a3b8; }
.position-value-modern { display: flex; align-items: baseline; gap: 2px; margin-bottom: 6px; }
.position-value-modern .position-hash { font-size: 24px; font-weight: 400; }
.position-value-modern.green .position-hash { color: #16a34a; }
.position-value-modern.red .position-hash { color: #dc2626; }
.position-value-modern .position-number { font-size: 42px; font-weight: 700; color: #1e293b; line-height: 1; }
.metric-decoration { position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; border-radius: 50%; opacity: 0.15; transition: transform 0.5s ease, opacity 0.3s ease; }
.metric-decoration.green { background: radial-gradient(circle, #22c55e 0%, transparent 70%); }
.metric-decoration.red { background: radial-gradient(circle, #ef4444 0%, transparent 70%); }
.metric-card-modern:hover .metric-decoration { transform: scale(1.5); opacity: 0.2; }

/* Progress Section */
.progress-section { background: #f8fafc; border-radius: 12px; padding: 16px 20px; border: 1px solid #e2e8f0; }
.progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.progress-title { font-size: 13px; font-weight: 500; color: #475569; }
.progress-percentage { font-size: 18px; font-weight: 700; }
.progress-percentage.green { color: #16a34a; }
.progress-percentage.red { color: #dc2626; }
.progress-bar-container { display: flex; flex-direction: column; gap: 8px; }
.progress-bar-bg { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 5px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
.progress-bar-fill.green { background: linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #4ade80 100%); box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
.progress-bar-fill.red { background: linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #f87171 100%); box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
.progress-bar-fill::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%); animation: shimmer 2s infinite; }
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
.progress-markers { display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

/* Info Section */
.info-section-modern { display: flex; gap: 14px; background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin-top: auto; }
.info-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.info-icon.green { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
.info-icon.red { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
.info-content { flex: 1; }
.info-title { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
.info-description { font-size: 12px; color: #64748b; line-height: 1.5; margin: 0; }
.info-description :deep(strong) { color: #1e293b; }

/* RESPONSIVE CARD MODERN */
@media (max-width: 768px) {
  .modern-header { padding: 12px 16px; }
  .header-icon-modern { width: 36px; height: 36px; border-radius: 10px; }
  .header-icon-modern svg { width: 18px; height: 18px; }
  .header-title-modern { font-size: 14px; }
  .header-subtitle-modern { font-size: 10px; }
  .year-badge-modern { padding: 6px 12px; font-size: 12px; }
  .export-btn-modern { width: 32px; height: 32px; }
  .modern-body { padding: 16px; }
  .metrics-grid { grid-template-columns: 1fr; gap: 12px; }
  .metric-card-modern { padding: 16px; }
  .metric-icon-bg { width: 40px; height: 40px; margin-bottom: 12px; }
  .metric-icon-bg svg { width: 24px; height: 24px; }
  .metric-value-modern .currency-symbol { font-size: 20px; }
  .metric-value-modern .value-number { font-size: 28px; }
  .position-value-modern .position-hash { font-size: 20px; }
  .position-value-modern .position-number { font-size: 32px; }
  .progress-section { padding: 14px 16px; }
  .progress-title { font-size: 12px; }
  .progress-percentage { font-size: 16px; }
  .info-section-modern { padding: 14px; gap: 12px; }
  .info-icon { width: 32px; height: 32px; }
  .info-title { font-size: 12px; }
  .info-description { font-size: 11px; }
}

@media (max-width: 480px) {
  .modern-header { padding: 10px 12px; }
  .header-icon-modern { width: 32px; height: 32px; }
  .header-title-modern { font-size: 12px; }
  .year-badge-modern { padding: 4px 10px; font-size: 11px; }
  .modern-body { padding: 12px; }
  .content-modern { gap: 14px; }
  .metric-card-modern { padding: 14px; border-radius: 12px; }
  .metric-icon-bg { width: 36px; height: 36px; margin-bottom: 10px; }
  .metric-value-modern .currency-symbol { font-size: 18px; }
  .metric-value-modern .value-number { font-size: 24px; }
  .position-value-modern .position-hash { font-size: 18px; }
  .position-value-modern .position-number { font-size: 28px; }
  .metric-label-modern { font-size: 10px; }
  .metric-unit-modern { font-size: 10px; }
  .progress-section { padding: 12px; border-radius: 10px; }
  .progress-bar-bg { height: 8px; }
  .info-section-modern { padding: 12px; border-radius: 10px; flex-direction: column; align-items: flex-start; }
  .info-icon { width: 28px; height: 28px; }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .mode-ranking { padding: 10px; border-radius: 10px; }
  .ranking-header { padding-bottom: 6px; margin-bottom: 6px; }
  .ranking-header .card-title { font-size: 13px; }
  .ranking-header .card-subtitle { font-size: 10px; }
  .header-badge { padding: 4px 10px; }
  .badge-count { font-size: 14px; }
  .badge-label { font-size: 7px; }
  .mode-ranking .card-content { padding: 6px; }
  .bar-row { grid-template-columns: 20px 80px 1fr 50px; gap: 4px; }
  .bar-row.is-mexico { padding: 2px 4px 2px 6px; border-left-width: 3px; }
  .rank-position { width: 18px; height: 18px; }
  .rank-number { font-size: 8px; }
  .country-label { font-size: 9px; }
  .bar-value { font-size: 8px; }
  .classification-badge { font-size: 6px; padding: 2px 3px; }
  .legend-color-block { height: 12px; }
  .legend-indicator { font-size: 6px; }
  .legend-range-value { font-size: 7px; }
  .tooltip-international { display: none !important; }
}

@media (max-width: 480px) {
  .mode-ranking { padding: 8px; }
  .ranking-header .card-title { font-size: 12px; }
  .bar-row { grid-template-columns: 18px 60px 1fr 40px; gap: 3px; }
  .bar-row.is-mexico { padding: 1px 3px 1px 5px; border-left-width: 3px; }
  .rank-position { width: 16px; height: 16px; }
  .rank-number { font-size: 7px; }
  .country-label { font-size: 8px; }
  .bar-value { font-size: 7px; }
  .classification-badge { font-size: 5px; padding: 1px 2px; }
  .legend-color-block { height: 10px; }
  .legend-indicator { font-size: 5px; }
  .legend-range-value { font-size: 6px; }
}
</style>