<!-- src/modules/qualitativeIndicators/components/SocialesView.vue -->
<template>
  <div class="sociales-container">
    <div class="card-body">
      <!-- ============================================ -->
      <!-- FILA 1: 3 Secciones -->
      <!-- ============================================ -->
      <div class="top-row">
        <!-- SECCIÓN 1: DESOCUPACIÓN (VerticalBarChart) -->
        <div class="desocupacion-section card">
          <!-- Loading State -->
          <div v-if="desocupacionLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando datos...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="desocupacionError" class="error-state">
            <p>Error: {{ desocupacionError }}</p>
            <button @click="loadDesocupacionData(selectedEntity, selectedYear)" class="retry-btn-small">
              Reintentar
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state">
            <div class="empty-icon">📊</div>
            <h4>Selecciona una entidad</h4>
            <p>Selecciona una entidad federativa para ver las tasas de desocupación.</p>
          </div>

          <!-- VerticalBarChart -->
          <VerticalBarChart
            v-else
            :variables="desocupacionData"
            :title="'Tasas de Desocupación y Participación'"
            :width="'100%'"
            :height="'100%'"
            :showLegend="true"
            :showTooltip="true"
          />
        </div>

        <!-- SECCIÓN 2: REZAGO SOCIAL (Movido desde bottom) -->
        <div class="rezago-section card">
          <!-- Loading State -->
          <div v-if="rezagoLoading" class="loading-state-small">
            <div class="spinner-small"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="rezagoError" class="error-state-small">
            <p>Error cargando datos</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state-small">
            <div class="empty-icon-small">🗺️</div>
            <p>Selecciona una entidad</p>
          </div>

          <!-- Datos de Rezago Social -->
          <div v-else class="rezago-content">
            <div class="metric-header">
              <div class="icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3 class="metric-title">Rezago Social</h3>
            </div>
            
            <!-- Dos cards horizontales: Índice y Grado -->
            <div class="rezago-cards-row">
              <!-- Card de Índice -->
              <div class="rezago-mini-card">
                <div class="mini-card-label">ÍNDICE</div>
                <div class="mini-card-value">{{ formatNumber(rezagoIndice) }}</div>
              </div>
              
              <!-- Card de Grado -->
              <div class="rezago-mini-card">
                <div class="mini-card-label">GRADO</div>
                <div 
                  class="mini-card-badge"
                  :class="getRezagoBadgeClass(rezagoGrado)"
                >
                  {{ rezagoGrado || 'Sin datos' }}
                </div>
              </div>
            </div>
            
            <!-- Barra de progreso normalizada -->
            <div class="rezago-progress-section">
              <div class="progress-label">NORMALIZADO</div>
              <div class="rezago-progress-bar-horizontal">
                <div class="progress-track-horizontal">
                  <!-- Zona negativa (izquierda - verde) -->
                  <div class="progress-zone zone-negative"></div>
                  
                  <!-- Línea central (0) -->
                  <div class="center-line-horizontal"></div>
                  
                  <!-- Zona positiva (derecha - rojo) -->
                  <div class="progress-zone zone-positive"></div>
                  
                  <!-- Barra de relleno animada -->
                  <div 
                    class="progress-fill-horizontal"
                    :style="{ 
                      width: getRezagoPercentage(rezagoIndice) + '%'
                    }"
                  >
                    <span class="progress-percentage">{{ getRezagoPercentage(rezagoIndice).toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: ÍNDICE GINI (VerticalBarChart) -->
        <div class="gini-section card">
          <!-- Loading -->
          <div v-if="giniLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>Cargando datos...</p>
          </div>

          <!-- Error -->
          <div v-else-if="giniError" class="error-state">
            <p>Error: {{ giniError }}</p>
            <button @click="loadGiniData(selectedEntity, selectedYear)" class="retry-btn-small">
              Reintentar
            </button>
          </div>

          <!-- Empty -->
          <div v-else-if="!selectedEntity" class="empty-state">
            <div class="empty-icon">📈</div>
            <h4>Selecciona una entidad</h4>
            <p>Selecciona una entidad para ver el Índice de Gini.</p>
          </div>

          <!-- VerticalBarChart -->
          <VerticalBarChart
            v-else
            :variables="giniData"
            :title="'Índice de Gini (Desigualdad)'"
            :width="'100%'"
            :height="'100%'"
            :showLegend="true"
            :showTooltip="true"
          />
        </div>
      </div>

      <!-- ============================================ -->
      <!-- FILA 2: 2 Secciones -->
      <!-- ============================================ -->
      <div class="bottom-row">
        <!-- SECCIÓN 4: MARGINACIÓN (Movido desde top) -->
        <div class="marginacion-section card">
          <!-- Loading State -->
          <div v-if="marginacionLoading" class="loading-state-small">
            <div class="spinner-small"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="marginacionError" class="error-state-small">
            <p>Error cargando datos</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state-small">
            <div class="empty-icon-small">🗺️</div>
            <p>Selecciona una entidad</p>
          </div>

          <!-- Datos de Marginación -->
          <div v-else class="marginacion-content">
            <div class="metric-header">
              <div class="icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 class="metric-title">Índice de Marginación</h3>
            </div>
            
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-label">Índice</span>
                <span class="metric-value">{{ formatNumber(marginacionIndice) }}</span>
              </div>

              <div class="metric-item">
                <span class="metric-label">Grado</span>
                <span 
                  class="metric-badge" 
                  :class="getMarginacionBadgeClass(marginacionGrado)"
                >
                  {{ marginacionGrado }}
                </span>
              </div>

              <div class="metric-item full-width">
                <span class="metric-label">Normalizado</span>
                <div class="progress-container">
                  <div class="progress-bar" :style="{ width: `${marginacionNormalizado * 100}%` }"></div>
                  <span class="progress-text">{{ (marginacionNormalizado * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 5: IDH + POBLACIÓN (Side by Side, movido desde top) -->
        <div class="idh-poblacion-section card">
          <!-- Loading State -->
          <div v-if="idhLoading || poblacionLoading" class="loading-state-small">
            <div class="spinner-small"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="idhError || poblacionError" class="error-state-small">
            <p>Error cargando datos</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!selectedEntity" class="empty-state-small">
            <div class="empty-icon-small">📈</div>
            <p>Selecciona una entidad</p>
          </div>

          <!-- IDH + Población Side by Side -->
          <div v-else class="dual-metrics-container">
            <!-- IDH Card -->
            <div class="metric-card idh-card">
              <div class="metric-card-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <span class="metric-card-title">IDH</span>
              </div>
              <div class="metric-card-value">{{ idhValue.toFixed(3) }}</div>
              <div class="metric-card-label">Índice de Desarrollo Humano</div>
              <div class="idh-gauge-mini">
                <IDHGauge
                  :value="idhValue"
                  :maxValue="1"
                />
              </div>
            </div>

            <!-- Población Card -->
            <div class="metric-card poblacion-card">
              <div class="metric-card-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span class="metric-card-title">Población</span>
              </div>
              <div class="metric-card-value">{{ formatNumberCompact(poblacionValue) }}</div>
              <div class="metric-card-label">Personas</div>
              <div class="poblacion-chart-mini">
                <ScalablePerson 
                  :value="poblacionValue" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import VerticalBarChart from '@/modules/charts/components/VerticalBarChart.vue'
import PersonChart from '../../object/component/PersonChart.vue'
import ScalablePerson from '../../object/component/ScalablePerson.vue'
import IDHGauge from '../../object/component/IDHGauge.vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName, setActiveYear } from '@/dataConection/storageConfig'

// Props
const props = defineProps({
  selectedEntity: {
    type: String,
    default: null
  },
  selectedYear: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['back'])

// Composable de Google Sheets
const { fetchData } = useStorageData()

// ============================================
// FUNCIÓN: Limpiar formato numérico
// Formato mexicano/europeo: puntos = miles, comas = decimales
// Ejemplo: 1.520.604,50 → 1520604.50
// ============================================
const parseNumericValue = (value) => {
  console.log('🔍 [parseNumericValue] Input:', value, 'Type:', typeof value)
  
  if (typeof value === 'number') {
    return value
  }
  
  if (!value || value === '') {
    return 0
  }
  
  let stringValue = String(value).trim()
  
  // Eliminar espacios
  stringValue = stringValue.replace(/\s/g, '')
  
  // FORMATO MEXICANO/EUROPEO:
  // Puntos (.) = separadores de miles
  // Comas (,) = separador decimal
  
  // Paso 1: Eliminar TODOS los puntos (separadores de miles)
  stringValue = stringValue.replace(/\./g, '')
  
  // Paso 2: Reemplazar coma por punto (para JavaScript)
  stringValue = stringValue.replace(/,/g, '.')
  
  const result = parseFloat(stringValue)
  
  if (isNaN(result)) {
    console.error('❌ [parseNumericValue] No se pudo parsear:', value)
    return 0
  }
  
  console.log('✅ [parseNumericValue] Output:', result)
  return result
}

// ============================================
// SECCIÓN 1: DESOCUPACIÓN
// ============================================
const desocupacionData = ref([])
const desocupacionLoading = ref(false)
const desocupacionError = ref(null)

const loadDesocupacionData = async (entityName = null, year = null) => {
  try {
    desocupacionLoading.value = true
    desocupacionError.value = null
    
    console.log('💼 [Desocupación] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      desocupacionData.value = []
      desocupacionLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('desocupacion')
    const sheetName = getSheetName('desocupacion')
    
    const rawData = await fetchData('desocupacion', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      console.log('⚠️ [Desocupación] No se encontraron datos para', entityName)
      desocupacionData.value = []
      desocupacionLoading.value = false
      return
    }
    
    const transformedData = mapping.variables
      .sort((a, b) => a.order - b.order)
      .map(variable => ({
        key: variable.key,
        label: variable.label,
        value: parseNumericValue(entityRow[variable.column]),
        color: variable.color,
        colorClass: variable.colorClass || 'blue',
        active: true
      }))
    
    desocupacionData.value = transformedData
    console.log('✅ [Desocupación] Datos cargados:', transformedData.length, 'variables')
    
  } catch (err) {
    console.error('❌ [Desocupación] Error:', err)
    desocupacionError.value = err.message
  } finally {
    desocupacionLoading.value = false
  }
}

// ============================================
// SECCIÓN 2: MARGINACIÓN
// ============================================
const marginacionIndice = ref(0)
const marginacionGrado = ref('')
const marginacionNormalizado = ref(0)
const marginacionLoading = ref(false)
const marginacionError = ref(null)

const loadMarginacionData = async (entityName = null, year = null) => {
  try {
    marginacionLoading.value = true
    marginacionError.value = null
    
    console.log('📍 [Marginación] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      marginacionIndice.value = 0
      marginacionGrado.value = ''
      marginacionNormalizado.value = 0
      marginacionLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('marginacion')
    const sheetName = getSheetName('marginacion')
    
    const rawData = await fetchData('marginacion', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      marginacionIndice.value = parseNumericValue(entityRow[mapping.variables[0].column])
      marginacionGrado.value = entityRow[mapping.variables[1].column] || ''
      marginacionNormalizado.value = parseNumericValue(entityRow[mapping.variables[2].column])
      
      console.log('✅ [Marginación] Datos cargados')
      console.log('  - Índice:', marginacionIndice.value)
      console.log('  - Grado:', marginacionGrado.value)
      console.log('  - Normalizado:', marginacionNormalizado.value)
    } else {
      marginacionIndice.value = 0
      marginacionGrado.value = ''
      marginacionNormalizado.value = 0
      console.log('⚠️ [Marginación] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [Marginación] Error:', err)
    marginacionError.value = err.message
  } finally {
    marginacionLoading.value = false
  }
}

const getMarginacionBadgeClass = (grado) => {
  const gradoLower = grado.toLowerCase()
  if (gradoLower.includes('muy bajo')) return 'badge-success'
  if (gradoLower.includes('bajo')) return 'badge-info'
  if (gradoLower.includes('medio')) return 'badge-warning'
  if (gradoLower.includes('alto') && !gradoLower.includes('muy')) return 'badge-danger'
  if (gradoLower.includes('muy alto')) return 'badge-critical'
  return 'badge-default'
}

// ============================================
// SECCIÓN 3: IDH Y POBLACIÓN (Side by Side)
// ============================================

// IDH
const idhValue = ref(0)
const idhLoading = ref(false)
const idhError = ref(null)

const loadIDHData = async (entityName = null, year = null) => {
  try {
    idhLoading.value = true
    idhError.value = null
    
    console.log('📊 [IDH] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      idhValue.value = 0
      idhLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('idh')
    const sheetName = getSheetName('idh')
    
    const rawData = await fetchData('idh', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      idhValue.value = parseNumericValue(entityRow[mapping.variables[0].column])
      console.log('✅ [IDH] Valor:', idhValue.value)
    } else {
      idhValue.value = 0
      console.log('⚠️ [IDH] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [IDH] Error:', err)
    idhError.value = err.message
  } finally {
    idhLoading.value = false
  }
}

// Población
const poblacionValue = ref(0)
const poblacionPercentage = ref(0)
const poblacionLoading = ref(false)
const poblacionError = ref(null)

const loadPoblacionData = async (entityName = null, year = null) => {
  try {
    poblacionLoading.value = true
    poblacionError.value = null
    
    console.log('👥 [Población] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      poblacionValue.value = 0
      poblacionPercentage.value = 0
      poblacionLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('poblacion')
    const sheetName = getSheetName('poblacion')
    
    const rawData = await fetchData('poblacion', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      poblacionValue.value = parseNumericValue(entityRow[mapping.variables[0].column])
      
      // Calcular porcentaje respecto al máximo
      const allValues = rawData
        .map(row => parseNumericValue(row[mapping.variables[0].column]))
        .filter(val => val > 0)
      
      const maxValue = Math.max(...allValues)
      poblacionPercentage.value = maxValue > 0 ? (poblacionValue.value / maxValue) * 100 : 0
      
      console.log('✅ [Población] Valor:', poblacionValue.value)
      console.log('  - Porcentaje:', poblacionPercentage.value.toFixed(2), '%')
    } else {
      poblacionValue.value = 0
      poblacionPercentage.value = 0
      console.log('⚠️ [Población] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [Población] Error:', err)
    poblacionError.value = err.message
  } finally {
    poblacionLoading.value = false
  }
}

// ============================================
// SECCIÓN 4: REZAGO SOCIAL
// ============================================
const rezagoIndice = ref(0)
const rezagoGrado = ref('')
const rezagoLoading = ref(false)
const rezagoError = ref(null)

const loadRezagoData = async (entityName = null, year = null) => {
  try {
    rezagoLoading.value = true
    rezagoError.value = null
    
    console.log('🏠 [Rezago Social] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      rezagoIndice.value = 0
      rezagoGrado.value = ''
      rezagoLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('rezagoSocial')
    const sheetName = getSheetName('rezagoSocial')
    
    const rawData = await fetchData('rezagoSocial', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      rezagoIndice.value = parseNumericValue(entityRow[mapping.variables[0].column])
      rezagoGrado.value = entityRow[mapping.variables[1].column] || ''
      
      console.log('✅ [Rezago Social] Datos cargados')
      console.log('  - Índice:', rezagoIndice.value)
      console.log('  - Grado:', rezagoGrado.value)
    } else {
      rezagoIndice.value = 0
      rezagoGrado.value = ''
      console.log('⚠️ [Rezago Social] No se encontraron datos para', entityName)
    }
    
  } catch (err) {
    console.error('❌ [Rezago Social] Error:', err)
    rezagoError.value = err.message
  } finally {
    rezagoLoading.value = false
  }
}

const getRezagoBadgeClass = (grado) => {
  const gradoLower = grado.toLowerCase()
  if (gradoLower.includes('muy bajo')) return 'badge-success'
  if (gradoLower.includes('bajo')) return 'badge-info'
  if (gradoLower.includes('medio')) return 'badge-warning'
  if (gradoLower.includes('alto') && !gradoLower.includes('muy')) return 'badge-danger'
  if (gradoLower.includes('muy alto')) return 'badge-critical'
  return 'badge-default'
}

// Calcular porcentaje de posición en la barra de rezago
// 0 = centro (50%), negativo = izquierda (0-50%), positivo = derecha (50-100%)
const getRezagoPercentage = (value) => {
  // Rangos aproximados según los datos
  const maxNegative = -1300000 // Extremo izquierdo
  const maxPositive = 2700000  // Extremo derecho
  
  if (value === 0) return 50 // Centro exacto
  
  if (value < 0) {
    // Negativo: mapear de maxNegative (-1.3M) a 0 → 0% a 50%
    const percentage = 50 - ((Math.abs(value) / Math.abs(maxNegative)) * 50)
    return Math.max(0, percentage)
  } else {
    // Positivo: mapear de 0 a maxPositive (2.7M) → 50% a 100%
    const percentage = 50 + ((value / maxPositive) * 50)
    return Math.min(100, percentage)
  }
}

// ============================================
// SECCIÓN 5: ÍNDICE GINI
// ============================================
const giniData = ref([])
const giniLoading = ref(false)
const giniError = ref(null)

const loadGiniData = async (entityName = null, year = null) => {
  try {
    giniLoading.value = true
    giniError.value = null
    
    console.log('📈 [Índice Gini] Cargando datos')
    console.log('  - Entidad:', entityName)
    console.log('  - Año:', year)
    
    if (!entityName) {
      giniData.value = []
      giniLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('indiceGini')
    const sheetName = getSheetName('indiceGini')
    
    const rawData = await fetchData('indiceGini', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      console.log('⚠️ [Índice Gini] No se encontraron datos para', entityName)
      giniData.value = []
      giniLoading.value = false
      return
    }
    
    const transformedData = mapping.variables
      .sort((a, b) => a.order - b.order)
      .map(variable => ({
        key: variable.key,
        label: variable.label,
        value: parseNumericValue(entityRow[variable.column]),
        color: variable.color,
        colorClass: variable.colorClass || 'blue',
        active: true
      }))
    
    giniData.value = transformedData
    console.log('✅ [Índice Gini] Datos cargados:', transformedData.length, 'variables')
    
  } catch (err) {
    console.error('❌ [Índice Gini] Error:', err)
    giniError.value = err.message
  } finally {
    giniLoading.value = false
  }
}

// ============================================
// UTILIDADES
// ============================================
const formatNumber = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('es-MX').format(value)
}

const formatNumberCompact = (value) => {
  if (!value) return '0'
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K'
  }
  
  return new Intl.NumberFormat('es-MX').format(value)
}

const handleBack = () => {
  emit('back')
}

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity, oldEntity) => {
  console.log('🔄 [SocialesView] Watch: entidad cambió')
  console.log('  - Anterior:', oldEntity)
  console.log('  - Nueva:', newEntity)
  
  loadDesocupacionData(newEntity, props.selectedYear)
  loadMarginacionData(newEntity, props.selectedYear)
  loadIDHData(newEntity, props.selectedYear)
  loadPoblacionData(newEntity, props.selectedYear)
  loadRezagoData(newEntity, props.selectedYear)
  loadGiniData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear, oldYear) => {
  console.log('🔄 [SocialesView] Watch: año cambió')
  console.log('  - Anterior:', oldYear)
  console.log('  - Nuevo:', newYear)
  
  if (props.selectedEntity) {
    loadDesocupacionData(props.selectedEntity, newYear)
    loadMarginacionData(props.selectedEntity, newYear)
    loadIDHData(props.selectedEntity, newYear)
    loadPoblacionData(props.selectedEntity, newYear)
    loadRezagoData(props.selectedEntity, newYear)
    loadGiniData(props.selectedEntity, newYear)
  }
}, { immediate: false })

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  console.log('🚀 [SocialesView] Montado')
  console.log('📍 Entidad inicial:', props.selectedEntity)
  console.log('📅 Año inicial:', props.selectedYear)
  
  await Promise.all([
    loadDesocupacionData(props.selectedEntity, props.selectedYear),
    loadMarginacionData(props.selectedEntity, props.selectedYear),
    loadIDHData(props.selectedEntity, props.selectedYear),
    loadPoblacionData(props.selectedEntity, props.selectedYear),
    loadRezagoData(props.selectedEntity, props.selectedYear),
    loadGiniData(props.selectedEntity, props.selectedYear)
  ])
  
  console.log('✅ [SocialesView] Todos los datos iniciales cargados')
})
</script>

<style scoped>
/* Container principal */
.sociales-container {
  background-color: white;
  border-radius: 15px;
  height: 100%;
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.card {
  border: 1px solid #b0b0b0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

/* ============================================ */
/* FILA 1: 3 secciones (33% each) */
/* ============================================ */
.top-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 50%;
  width: 100%;
  min-height: 0;
}

.desocupacion-section {
  flex: 1;
  min-width: 0;
}

.rezago-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.gini-section {
  flex: 1;
  min-width: 0;
}

.idh-poblacion-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ============================================ */
/* FILA 2: 2 secciones (50% each) */
/* ============================================ */
.bottom-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 50%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.bottom-row .marginacion-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bottom-row .idh-poblacion-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ============================================ */
/* LOADING, ERROR, EMPTY STATES */
/* ============================================ */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 20px;
}

.loading-state-small, .error-state-small, .empty-state-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 10px;
  text-align: center;
}

.spinner-small {
  width: 30px;
  height: 30px;
  border: 3px solid rgb(203, 199, 199);
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn-small {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 10px;
}

.retry-btn-small:hover {
  background: #d32f2f;
}

.error-state p, .error-state-small p {
  color: #666;
  font-size: 14px;
  margin: 0 0 10px 0;
}

.empty-state-small p {
  color: #999;
  font-size: 12px;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-icon-small {
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.4;
}

.empty-state h4 {
  font-size: 18px;
  font-weight: 500;
  color: #535353;
  margin: 0 0 10px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================ */
/* MARGINACIÓN CONTENT */
/* ============================================ */
.marginacion-content {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  box-sizing: border-box;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 2px solid #e2e8f0;
  flex-shrink: 0;
  min-height: 0;
}

.icon-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.icon-badge svg {
  width: 16px;
  height: 16px;
}

.metric-title {
  font-size: 14px;
  font-weight: 600;
  color: #535353;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 8px;
  flex: 1;
  align-content: start;
  overflow: hidden;
  min-height: 0;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  min-height: 0;
  overflow: hidden;
}

.metric-item.full-width {
  grid-column: 1 / -1;
}

.metric-label {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.metric-value {
  font-size: 16px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.2;
}

.metric-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.2;
}

.metric-badge.badge-success {
  background: #d4edda;
  color: #155724;
}

.metric-badge.badge-info {
  background: #d1ecf1;
  color: #0c5460;
}

.metric-badge.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.metric-badge.badge-danger {
  background: #f8d7da;
  color: #721c24;
}

.metric-badge.badge-critical {
  background: #dc3545;
  color: white;
}

.metric-badge.badge-default {
  background: #e2e8f0;
  color: #475569;
}

.progress-container {
  position: relative;
  width: 100%;
  height: 60px;
  background: #e2e8f0;
  border-radius: 30px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0F3759 0%, #1a4d7a 100%);
  transition: width 0.6s ease;
  border-radius: 30px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================ */
/* IDH/POBLACIÓN DUAL LAYOUT (Side by Side) */
/* ============================================ */
.dual-metrics-container {
  display: flex;
  gap: 10px;
  height: 100%;
  padding: 10px;
}

.metric-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: #0F3759;
  box-shadow: 0 4px 12px rgba(15, 55, 89, 0.1);
  transform: translateY(-2px);
}

.metric-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0F3759;
}

.metric-card-header svg {
  flex-shrink: 0;
}

.metric-card-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.metric-card-value {
  font-size: 28px;
  font-weight: 800;
  color: #0F3759;
  line-height: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.metric-card-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.idh-gauge-mini {
  width: 100%;
  max-width: 70px;
  height: 70px;
  margin: 5px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.poblacion-chart-mini {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
}

/* ============================================ */
/* REZAGO SOCIAL CONTENT */
/* ============================================ */
.rezago-content {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Dos cards horizontales */
.rezago-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.rezago-mini-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mini-card-label {
  font-size: 9px;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mini-card-value {
  font-size: 18px;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.mini-card-badge {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Colores del badge */
.mini-card-badge.badge-success {
  background: #22c55e;
  color: white;
}

.mini-card-badge.badge-info {
  background: #3b82f6;
  color: white;
}

.mini-card-badge.badge-warning {
  background: #fbbf24;
  color: #78350f;
}

.mini-card-badge.badge-danger {
  background: #f97316;
  color: white;
}

.mini-card-badge.badge-critical {
  background: #ef4444;
  color: white;
}

.mini-card-badge.badge-default {
  background: #e2e8f0;
  color: #475569;
}

/* Sección de progreso normalizado */
.rezago-progress-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-label {
  font-size: 9px;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.rezago-progress-bar-horizontal {
  width: 100%;
}

.progress-track-horizontal {
  position: relative;
  width: 100%;
  height: 45px;
  border-radius: 22.5px;
  overflow: hidden;
  display: flex;
  background: #e2e8f0;
}

.progress-fill-horizontal {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #0F3759;
  border-radius: 22.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
  min-width: 45px;
}

.progress-percentage {
  font-size: 15px;
  font-weight: 700;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.center-line-horizontal {
  position: absolute;
  left: 50%;
  top: 0;
  width: 1px;
  height: 100%;
  background: rgba(15, 55, 89, 0.2);
  transform: translateX(-50%);
  z-index: 1;
}


</style>