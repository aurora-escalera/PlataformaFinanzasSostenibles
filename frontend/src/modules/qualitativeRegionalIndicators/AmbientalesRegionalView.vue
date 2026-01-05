<template>
  <div class="ambientales-container">
    <!-- ✅ EMPTY STATE cuando no hay año seleccionado -->
    <div v-if="!selectedYear" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Selecciona un año</h2>
        <p class="empty-state-description">
          Selecciona un año en el filtro superior para visualizar los indicadores ambientales.
        </p>
      </div>
    </div>

    <!-- ✅ CONTENIDO cuando hay año seleccionado -->
    <div v-else class="card-body">
      
      <!-- Header estilo barra azul compacta -->
      <div class="header-bar">
        <div class="header-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        </div>
        <span class="header-title">Indicadores Ambientales ({{ countryData?.País || 'México' }} · {{ selectedYear }})</span>
        <div class="header-info-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
      </div>

      <!-- Grid Principal -->
      <div class="main-grid">
        
        <!-- ===== COLUMNA 1: Métricas Clave ===== -->
        <div class="metrics-column">
          
          <!-- IRC Card -->
          <div class="metric-card metric-card-blue">
            <div v-if="loading" class="loading-mini"><div class="spinner-small"></div></div>
            <template v-else>
              <div class="metric-label blue">Índice Riesgo Climático</div>
              <div class="metric-value-row">
                <span class="metric-number blue">{{ countryData?.IRC || '—' }}</span>
                <span class="metric-badge blue">#{{ countryData?.IRC_POS || '—' }}/20</span>
              </div>
              <div class="metric-source">Germanwatch, 2022</div>
            </template>
          </div>

          <!-- TARN Card -->
          <div class="metric-card metric-card-green">
            <div v-if="loading" class="loading-mini"><div class="spinner-small"></div></div>
            <template v-else>
              <div class="metric-label green">Agotamiento Recursos Naturales</div>
              <div class="metric-value-row">
                <span class="metric-number green">{{ countryData?.TARN || '—' }}</span>
                <span class="metric-unit">%</span>
                <span class="metric-badge green">#{{ countryData?.TARN_POS || '—' }}/20</span>
              </div>
              <div class="metric-source">Banco Mundial, 2021</div>
            </template>
          </div>

          <!-- CTE Card -->
          <div class="metric-card metric-card-slate">
            <div v-if="loading" class="loading-mini"><div class="spinner-small"></div></div>
            <template v-else>
              <div class="metric-label slate">Consumo Total de Energía</div>
              <div class="metric-value-row">
                <span class="metric-number slate">{{ countryData?.CTE || '—' }}</span>
                <span class="metric-unit">MWh/pc</span>
              </div>
              <div class="metric-source">IEA, 2022</div>
            </template>
          </div>
        </div>

        <!-- ===== COLUMNA 2: CO2 + GEI ===== -->
        <div class="center-column">
          
          <!-- Card Grande CO2 -->
          <div class="co2-card">
            <div class="co2-decoration"></div>
            <div v-if="loading" class="loading-state"><div class="spinner-small"></div></div>
            <template v-else>
              <div class="co2-content">
                <div class="co2-left">
                  <div class="co2-label">Emisiones CO₂ Anuales</div>
                  <div class="co2-value-row">
                    <span class="co2-number">{{ formatNumber(countryData?.ECO2) }}</span>
                    <span class="co2-unit">Mt</span>
                  </div>
                </div>
                <div class="co2-position">
                  <div class="co2-pos-label">Posición</div>
                  <div class="co2-pos-number">#{{ countryData?.ECO2_POS || '—' }}</div>
                  <div class="co2-pos-total">de 20</div>
                </div>
              </div>
              <div class="co2-divider"></div>
              <div class="co2-footer">
                <div class="co2-percapita">
                  <span class="percapita-label">CO₂ per cápita:</span>
                  <span class="percapita-value">#{{ countryData?.ECO2PC_POS || '—' }}/20</span>
                </div>
                <div class="co2-source">IEA, 2022</div>
              </div>
            </template>
          </div>

          <!-- GEI por Sector -->
          <div class="gei-card">
            <div class="gei-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span>Emisiones GEI por Sector</span>
            </div>
            <div v-if="loading" class="loading-state"><div class="spinner-small"></div></div>
            <div v-else class="gei-content">
              <div class="donut-container">
                <svg :width="donutSize" :height="donutSize" :viewBox="`0 0 ${donutSize} ${donutSize}`">
                  <circle
                    :cx="donutSize/2"
                    :cy="donutSize/2"
                    :r="donutRadius"
                    fill="none"
                    stroke="#e2e8f0"
                    :stroke-width="strokeWidth"
                  />
                  <circle
                    v-for="(segment, index) in geiSegments"
                    :key="index"
                    :cx="donutSize/2"
                    :cy="donutSize/2"
                    :r="donutRadius"
                    fill="none"
                    :stroke="segment.color"
                    :stroke-width="strokeWidth"
                    :stroke-dasharray="segment.dashArray"
                    :stroke-dashoffset="segment.dashOffset"
                    stroke-linecap="round"
                    :transform="`rotate(-90 ${donutSize/2} ${donutSize/2})`"
                  />
                </svg>
                <div class="donut-center">
                  <span class="donut-center-text">GEI</span>
                </div>
              </div>
              <div class="gei-legend">
                <div v-for="item in geiLegend" :key="item.label" class="gei-legend-item">
                  <div class="legend-color" :style="{ background: item.color }"></div>
                  <div class="legend-info">
                    <span class="legend-label">{{ item.label }}</span>
                    <span class="legend-value">{{ item.value }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== COLUMNA 3: Matriz Energética ===== -->
        <div class="energy-column">
          <div class="energy-card">
            <div class="energy-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>Matriz Energética</span>
            </div>
            
            <div v-if="loading" class="loading-state"><div class="spinner-small"></div></div>
            <template v-else>
              <!-- Donut Energía -->
              <div class="energy-donut-container">
                <svg :width="energyDonutSize" :height="energyDonutSize" :viewBox="`0 0 ${energyDonutSize} ${energyDonutSize}`">
                  <circle
                    :cx="energyDonutSize/2"
                    :cy="energyDonutSize/2"
                    :r="energyDonutRadius"
                    fill="none"
                    stroke="#e2e8f0"
                    :stroke-width="energyStrokeWidth"
                  />
                  <circle
                    v-for="(segment, index) in energySegments"
                    :key="index"
                    :cx="energyDonutSize/2"
                    :cy="energyDonutSize/2"
                    :r="energyDonutRadius"
                    fill="none"
                    :stroke="segment.color"
                    :stroke-width="energyStrokeWidth"
                    :stroke-dasharray="segment.dashArray"
                    :stroke-dashoffset="segment.dashOffset"
                    stroke-linecap="round"
                    :transform="`rotate(-90 ${energyDonutSize/2} ${energyDonutSize/2})`"
                  />
                </svg>
                <div class="energy-donut-center">
                  <span class="energy-center-value">{{ countryData?.CCF || '—' }}%</span>
                  <span class="energy-center-label">Fósil</span>
                </div>
              </div>

              <!-- Barras -->
              <div class="energy-bars">
                <!-- Fósiles -->
                <div class="energy-bar-item fossil">
                  <div class="bar-header">
                    <div class="bar-label-row">
                      <div class="bar-color fossil"></div>
                      <span class="bar-label">Combustibles fósiles</span>
                    </div>
                    <span class="bar-value fossil">{{ countryData?.CCF || '—' }}%</span>
                  </div>
                  <div class="bar-track fossil">
                    <div class="bar-fill fossil" :style="{ width: (countryData?.CCF || 0) + '%' }"></div>
                  </div>
                </div>

                <!-- Renovables -->
                <div class="energy-bar-item renewable">
                  <div class="bar-header">
                    <div class="bar-label-row">
                      <div class="bar-color renewable"></div>
                      <span class="bar-label">Energías renovables</span>
                    </div>
                    <span class="bar-value renewable">{{ countryData?.CER || '—' }}%</span>
                  </div>
                  <div class="bar-track renewable">
                    <div class="bar-fill renewable" :style="{ width: (countryData?.CER || 0) + '%' }"></div>
                  </div>
                </div>
              </div>

              <!-- Nota al pie -->
              <div class="energy-footer">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <span>Fuente: IEA, 2022</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { setActiveYear } from '@/dataConection/storageConfig'

const props = defineProps({
  selectedYear: {
    type: [String, Number],
    default: null
  },
  selectedCountry: {
    type: String,
    default: 'México'
  }
})

// ✅ CORREGIDO: Usar fetchRegionalData en lugar de fetchData
const { fetchRegionalData, fetchRegionalSheetNames } = useStorageData()
const rawData = ref([])
const loading = ref(false)
const error = ref(null)
const showInfo = ref(false)
const availableYears = ref([])

// Donut config GEI
const donutSize = 80
const strokeWidth = 12
const donutRadius = (donutSize - strokeWidth) / 2
const circumference = 2 * Math.PI * donutRadius

// Donut config Energía
const energyDonutSize = 90
const energyStrokeWidth = 14
const energyDonutRadius = (energyDonutSize - energyStrokeWidth) / 2
const energyCircumference = 2 * Math.PI * energyDonutRadius

// Paleta de azules para GEI
const blueColors = {
  energy: '#0F3759',      // Azul oscuro - Energía (mayor %)
  agriculture: '#1e5a8a', // Azul medio-oscuro - Agricultura
  industrial: '#3b82f6',  // Azul medio - Industrial
  waste: '#60a5fa'        // Azul claro - Residuos (menor %)
}

// Computed: Obtener datos del país
const countryData = computed(() => {
  if (rawData.value.length === 0) return null
  const found = rawData.value.find(row => 
    row['País']?.toLowerCase() === props.selectedCountry?.toLowerCase()
  )
  return found || rawData.value[0]
})

// Datos GEI con colores azules
const geiLegend = computed(() => [
  { label: 'Energía', value: countryData.value?.GEI_EN || 0, color: blueColors.energy },
  { label: 'Agricultura', value: countryData.value?.GEI_AGUT || 0, color: blueColors.agriculture },
  { label: 'Industrial', value: countryData.value?.GEI_PI || 0, color: blueColors.industrial },
  { label: 'Residuos', value: countryData.value?.GEI_RE || 0, color: blueColors.waste }
])

const geiSegments = computed(() => {
  const data = geiLegend.value
  const total = data.reduce((sum, item) => sum + Number(item.value), 0)
  if (total === 0) return []
  
  let currentOffset = 0
  
  return data.map(item => {
    const percentage = Number(item.value) / total
    const dashArray = `${percentage * circumference} ${circumference}`
    const dashOffset = -currentOffset * circumference
    currentOffset += percentage
    
    return {
      color: item.color,
      dashArray,
      dashOffset
    }
  })
})

// Datos Energía
const energySegments = computed(() => {
  const ccf = Number(countryData.value?.CCF) || 0
  const cer = Number(countryData.value?.CER) || 0
  const total = ccf + cer
  if (total === 0) return []
  
  let currentOffset = 0
  
  const data = [
    { value: ccf, color: '#ef4444' },  // Rojo para fósiles
    { value: cer, color: '#22c55e' }   // Verde para renovables
  ]
  
  return data.map(item => {
    const percentage = item.value / total
    const dashArray = `${percentage * energyCircumference} ${energyCircumference}`
    const dashOffset = -currentOffset * energyCircumference
    currentOffset += percentage
    
    return {
      color: item.color,
      dashArray,
      dashOffset
    }
  })
})

const formatNumber = (value) => {
  if (!value || value === '—') return '—'
  const num = Number(value)
  if (isNaN(num)) return value
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1)
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1)
  }
  return num.toLocaleString()
}

// ✅ Variables para control de carga
const isDataLoaded = ref(false)
const currentLoadedYear = ref(null)

// ✅ Cargar años disponibles del sheet
const loadAvailableYears = async () => {
  try {
    console.log('📅 [AmbientalesRegional] Cargando años disponibles...')
    const sheetNames = await fetchRegionalSheetNames('ambientalesRegional')
    
    // Filtrar solo los que son años (4 dígitos)
    const years = sheetNames
      .filter(name => /^\d{4}$/.test(name))
      .sort((a, b) => Number(b) - Number(a))
    
    availableYears.value = years
    console.log('📅 [AmbientalesRegional] Años disponibles:', years)
    
    return years
  } catch (err) {
    console.error('❌ [AmbientalesRegional] Error cargando años:', err)
    return []
  }
}

// ✅ Cargar datos - USANDO fetchRegionalData
const loadData = async (forceReload = false) => {
  if (!props.selectedYear) {
    console.log('⚠️ [AmbientalesRegional] No hay año seleccionado, saltando carga')
    return
  }
  
  const yearStr = String(props.selectedYear)
  
  // ✅ Verificar si el año existe en los años disponibles
  if (availableYears.value.length > 0 && !availableYears.value.includes(yearStr)) {
    console.warn(`⚠️ [AmbientalesRegional] El año ${yearStr} no existe en el sheet. Años disponibles:`, availableYears.value)
    // No intentar cargar si el año no existe
    return
  }
  
  // Evitar recargas si ya tenemos datos para este año (a menos que sea forzado)
  if (!forceReload && isDataLoaded.value && currentLoadedYear.value === yearStr) {
    console.log('ℹ️ [AmbientalesRegional] Ya hay datos cargados para', yearStr, ', saltando recarga')
    return
  }
  
  // Evitar cargas concurrentes
  if (loading.value) {
    console.log('⏳ [AmbientalesRegional] Ya hay una carga en progreso, saltando')
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    console.log('🌍 [AmbientalesRegional] Cargando datos para año:', yearStr)
    
    // ✅ CORREGIDO: Usar fetchRegionalData con el año como nombre de hoja
    const data = await fetchRegionalData('ambientalesRegional', yearStr)
    
    console.log('📊 [AmbientalesRegional] Datos obtenidos:', data)
    console.log('📊 [AmbientalesRegional] Total filas:', data?.length)
    
    if (data && data.length > 0) {
      rawData.value = data
      isDataLoaded.value = true
      currentLoadedYear.value = yearStr
      console.log('📊 [AmbientalesRegional] Primera fila:', data[0])
      console.log('📊 [AmbientalesRegional] Columnas:', Object.keys(data[0]))
    } else {
      console.warn('⚠️ [AmbientalesRegional] No se obtuvieron datos')
      // NO limpiar rawData si ya teníamos datos válidos
      if (!isDataLoaded.value) {
        rawData.value = []
      }
    }
    
    console.log('✅ [AmbientalesRegional] Datos cargados correctamente')
  } catch (err) {
    console.error('❌ [AmbientalesRegional] Error cargando datos:', err)
    error.value = err.message
    // NO limpiar rawData en caso de error si ya teníamos datos válidos
    if (!isDataLoaded.value) {
      rawData.value = []
    }
  } finally {
    loading.value = false
  }
}

// Watchers - Solo recargar si el año realmente cambió
watch(() => props.selectedYear, async (newYear, oldYear) => {
  console.log('👀 [AmbientalesRegional] Watch selectedYear:', { newYear, oldYear, currentLoadedYear: currentLoadedYear.value })
  
  if (newYear) {
    const yearStr = String(newYear)
    
    if (yearStr !== currentLoadedYear.value) {
      // Limpiar datos solo cuando realmente cambia el año
      rawData.value = []
      isDataLoaded.value = false
      
      // Cargar años disponibles si no los tenemos
      if (availableYears.value.length === 0) {
        await loadAvailableYears()
      }
      
      await loadData()
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  console.log('🚀 [AmbientalesRegional] Mounted con año:', props.selectedYear)
  
  // Cargar años disponibles al montar
  await loadAvailableYears()
  
  // Cargar datos si hay año
  if (props.selectedYear) {
    await loadData()
  }
})
</script>

<style scoped>
/* ========== VARIABLES ========== */
.ambientales-container {
  --primary-900: #0F3759;
  --primary-800: #163C5F;
  --primary-700: #1e4a6f;
  --primary-600: #2563eb;
  --primary-500: #3b82f6;
  --primary-400: #60a5fa;
  --primary-100: #dbeafe;
  --primary-50: #eff6ff;
  
  --green-700: #15803d;
  --green-600: #16a34a;
  --green-500: #22c55e;
  --green-400: #4ade80;
  --green-100: #dcfce7;
  --green-50: #f0fdf4;
  
  --red-700: #b91c1c;
  --red-600: #dc2626;
  --red-500: #ef4444;
  --red-400: #f87171;
  --red-200: #fecaca;
  --red-100: #fee2e2;
  --red-50: #fef2f2;
  
  --slate-900: #0f172a;
  --slate-800: #1e293b;
  --slate-700: #334155;
  --slate-600: #475569;
  --slate-500: #64748b;
  --slate-400: #94a3b8;
  --slate-300: #cbd5e1;
  --slate-200: #e2e8f0;
  --slate-100: #f1f5f9;
  --slate-50: #f8fafc;
  
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  box-sizing: border-box;
  overflow: hidden;
}

/* ========== HEADER BAR (estilo ITAEE) ========== */
.header-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--primary-800) 0%, var(--primary-900) 100%);
  padding: 10px 14px;
  border-radius: 8px;
  flex-shrink: 0;
}

.header-icon-wrapper {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.header-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: white;
  letter-spacing: -0.01em;
}

.header-info-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s;
  border-radius: 50%;
}

.header-info-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* ========== MAIN GRID ========== */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr 1fr;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

/* ========== COLUMNA 1: MÉTRICAS ========== */
.metrics-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-card {
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: white;
}

.metric-card-blue {
  border-left: 3px solid var(--primary-600);
}

.metric-card-green {
  border-left: 3px solid var(--green-500);
}

.metric-card-slate {
  border-left: 3px solid var(--slate-400);
}

.metric-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.metric-label.blue { color: var(--primary-600); }
.metric-label.green { color: var(--green-600); }
.metric-label.slate { color: var(--slate-600); }

.metric-value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.metric-number {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.metric-number.blue { color: var(--primary-900); }
.metric-number.green { color: var(--green-700); }
.metric-number.slate { color: var(--slate-800); }

.metric-unit {
  font-size: 12px;
  color: var(--slate-500);
}

.metric-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  margin-left: 4px;
}

.metric-badge.blue { background: var(--primary-600); }
.metric-badge.green { background: var(--green-500); }

.metric-source {
  font-size: 9px;
  color: var(--slate-400);
  margin-top: auto;
  padding-top: 6px;
}

/* ========== COLUMNA 2: CO2 + GEI ========== */
.center-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* CO2 Card */
.co2-card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  border-left: 3px solid var(--red-500);
  position: relative;
  overflow: hidden;
}

.co2-decoration {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 60px;
  height: 60px;
  background: var(--red-100);
  border-radius: 50%;
  opacity: 0.5;
}

.co2-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.co2-label {
  font-size: 10px;
  color: var(--red-600);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.co2-value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.co2-number {
  font-size: 30px;
  font-weight: 800;
  color: var(--red-700);
  line-height: 1;
}

.co2-unit {
  font-size: 12px;
  color: var(--red-500);
  font-weight: 500;
}

.co2-position {
  text-align: center;
  background: var(--red-50);
  padding: 8px 12px;
  border-radius: 8px;
}

.co2-pos-label {
  font-size: 8px;
  color: var(--slate-500);
  margin-bottom: 2px;
}

.co2-pos-number {
  font-size: 22px;
  font-weight: 800;
  color: var(--red-600);
  line-height: 1;
}

.co2-pos-total {
  font-size: 8px;
  color: var(--slate-400);
}

.co2-divider {
  height: 1px;
  background: var(--slate-200);
  margin: 10px 0;
}

.co2-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.co2-percapita {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 6px 10px;
  border-radius: 6px;
}

.percapita-label {
  font-size: 10px;
  color: var(--slate-600);
}

.percapita-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--red-600);
}

.co2-source {
  font-size: 9px;
  color: var(--slate-400);
}

/* GEI Card */
.gei-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.gei-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--slate-800);
  margin-bottom: 12px;
}

.gei-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.donut-container {
  position: relative;
  flex-shrink: 0;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-center-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--slate-700);
}

.gei-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  flex: 1;
}

.gei-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--slate-50);
  padding: 6px 8px;
  border-radius: 6px;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.legend-label {
  font-size: 9px;
  color: var(--slate-500);
}

.legend-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--slate-800);
}

/* ========== COLUMNA 3: ENERGÍA ========== */
.energy-column {
  display: flex;
}

.energy-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.energy-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--slate-800);
  margin-bottom: 14px;
}

.energy-donut-container {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  position: relative;
}

.energy-donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.energy-center-value {
  font-size: 13px;
  font-weight: 800;
  color: var(--red-600);
  display: block;
  line-height: 1.1;
}

.energy-center-label {
  font-size: 8px;
  color: var(--slate-500);
}

.energy-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.energy-bar-item {
  border-radius: 6px;
  padding: 8px 10px;
}

.energy-bar-item.fossil {
  background: var(--red-50);
}

.energy-bar-item.renewable {
  background: var(--green-50);
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.bar-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-color {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.bar-color.fossil { background: var(--red-500); }
.bar-color.renewable { background: var(--green-500); }

.bar-label {
  font-size: 10px;
  color: var(--slate-700);
  font-weight: 500;
}

.bar-value {
  font-size: 14px;
  font-weight: 800;
}

.bar-value.fossil { color: var(--red-600); }
.bar-value.renewable { color: var(--green-600); }

.bar-track {
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.bar-track.fossil { background: var(--red-100); }
.bar-track.renewable { background: var(--green-100); }

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-fill.fossil { 
  background: linear-gradient(90deg, var(--red-500) 0%, var(--red-400) 100%); 
}
.bar-fill.renewable { 
  background: linear-gradient(90deg, var(--green-500) 0%, var(--green-400) 100%); 
}

.energy-footer {
  margin-top: auto;
  padding: 6px 8px;
  background: var(--slate-50);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.energy-footer span {
  font-size: 8px;
  color: var(--slate-500);
}

/* ========== EMPTY STATE ========== */
.global-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: white;
  border-radius: 8px;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 350px;
  padding: 30px;
}

.empty-state-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.empty-state-icon svg {
  opacity: 0.7;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 10px 0;
}

.empty-state-description {
  font-size: 13px;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

/* ========== CARD BODY ========== */
.card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

/* ========== LOADING STATES ========== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex: 1;
}

.loading-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid var(--slate-200);
  border-top: 2px solid var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>