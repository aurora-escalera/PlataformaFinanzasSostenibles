<!-- src/modules/qualitativeIndicators/components/SocialesView.vue -->
<!-- ✅ ACTUALIZADO: Paleta azules, animaciones y diseño mejorado -->
<!-- ✅ MODIFICADO: Card de Población sin barra ni posición -->
<!-- ✅ CORREGIDO: Error states estandarizados sin botones de retry -->
<template>
  <div class="sociales-container">
    <!-- ✅ EMPTY STATE CENTRALIZADO cuando no hay entidad seleccionada -->
    <div v-if="!selectedEntity" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Selecciona una entidad</h2>
        <p class="empty-state-description">
          Selecciona una entidad federativa en el filtro superior para visualizar los indicadores sociales.
        </p>
      </div>
    </div>

    <!-- ✅ CONTENIDO NORMAL cuando hay entidad seleccionada -->
    <div v-else class="card-body">
      <!-- FILA 1: 3 Secciones -->
      <div class="top-row">
        <!-- SECCIÓN 1: MARGINACIÓN -->
        <div class="marginacion-section card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <span class="card-header-title">Índice de Marginación</span>
            
            <div class="info-tooltip">
              <button class="info-btn" @click="showInfoMarginacion = !showInfoMarginacion">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <Transition name="tooltip-fade">
                <div v-if="showInfoMarginacion" class="tooltip-content">
                  Medida de déficit y carencias que padece la población en educación, vivienda e ingresos.
                </div>
              </Transition>
            </div>
          </div>

          <div class="card-body-content">
            <div v-if="marginacionLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="marginacionError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <div v-else class="indicator-content">
              <!-- Fila 1: Índice e Índice Normalizado -->
              <div class="indicator-stats-row">
                <div class="indicator-stat-card">
                  <div class="stat-icon-wrapper blue-gradient">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">ÍNDICE</span>
                    <span class="stat-value">{{ formatNumber(marginacionIndice) }}</span>
                  </div>
                </div>
                
                <div class="indicator-stat-card">
                  <div class="stat-info full-width">
                    <span class="stat-label">ÍNDICE NORMALIZADO</span>
                    <span class="stat-value">{{ marginacionNormalizado.toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Fila 2: Grado (ancho completo) -->
              <div class="indicator-stats-row-full">
                <div class="indicator-stat-card">
                  <div class="stat-info full-width">
                    <span class="stat-label">GRADO</span>
                    <div 
                      class="stat-badge"
                      :class="getBlueBadgeClass(marginacionGrado)"
                    >
                      {{ marginacionGrado || 'Sin datos' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- SECCIÓN 2: REZAGO SOCIAL -->
        <div class="rezago-section card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span class="card-header-title">Rezago Social</span>
            
            <div class="info-tooltip">
              <button class="info-btn" @click="showInfoRezago = !showInfoRezago">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <Transition name="tooltip-fade">
                <div v-if="showInfoRezago" class="tooltip-content">
                  Índice que mide carencias sociales como educación, salud, servicios básicos y vivienda.
                </div>
              </Transition>
            </div>
          </div>

          <div class="card-body-content">
            <div v-if="rezagoLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="rezagoError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <div v-else class="indicator-content">
              <!-- Fila 1: Índice -->
              <div class="indicator-stats-row-full">
                <div class="indicator-stat-card" style="flex-direction: row; justify-content: space-between; padding: 4px 12px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="stat-icon-wrapper blue-gradient">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    </div>
                    <span class="stat-label" style="padding-bottom: 0;">ÍNDICE</span>
                  </div>
                  <span class="stat-value" style="font-size: 18px;">{{ formatNumber(rezagoIndice) }}</span>
                </div>
              </div>

              <!-- Fila 2: Grado -->
              <div class="indicator-stats-row-full">
                <div class="indicator-stat-card">
                  <div class="stat-info full-width">
                    <span class="stat-label">GRADO</span>
                    <div 
                      class="stat-badge"
                      :class="getBlueBadgeClass(rezagoGrado)"
                    >
                      {{ rezagoGrado || 'Sin datos' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: ÍNDICE GINI -->
        <div class="gini-section card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
                <path d="M2 20h20"></path>
              </svg>
            </div>
            <span class="card-header-title">Índice de Gini (Desigualdad)</span>
            
            <div class="info-tooltip">
              <button class="info-btn" @click="showInfoGini = !showInfoGini">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <Transition name="tooltip-fade">
                <div v-if="showInfoGini" class="tooltip-content">
                  Mide la desigualdad en la distribución del ingreso. 0 = igualdad perfecta, 1 = desigualdad máxima.
                </div>
              </Transition>
            </div>
          </div>

          <div class="card-body-content">
            <div v-if="giniLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="giniError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <HorizontalBarsList
              v-else
              :data="giniData"
              :showIcons="true"
            />
          </div>
        </div>
      </div>

      <!-- FILA 2: 3 Secciones (Desocupación 50%, IDH 25%, Población 25%) -->
      <div class="bottom-row">
        <!-- SECCIÓN 4: DESOCUPACIÓN -->
        <div class="desocupacion-section card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
                <line x1="8" y1="11" x2="16" y2="11"></line>
              </svg>
            </div>
            <span class="card-header-title">Tasas de Desocupación y Participación</span>
            
            <div class="info-tooltip">
              <button class="info-btn" @click="showInfoDesocupacion = !showInfoDesocupacion">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <Transition name="tooltip-fade">
                <div v-if="showInfoDesocupacion" class="tooltip-content">
                  Indicadores de empleo que muestran la tasa de desocupación y participación laboral en la entidad.
                </div>
              </Transition>
            </div>
          </div>

          <div class="card-body-content">
            <div v-if="desocupacionLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="desocupacionError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <HorizontalBarsList
              v-else
              :data="desocupacionData"
              :showIcons="true"
            />
          </div>
        </div>

        <!-- SECCIÓN 5: IDH -->
        <div class="idh-section card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <span class="card-header-title">Índice de Desarrollo Humano (IDH)</span>
            
            <div class="info-tooltip">
              <button class="info-btn" @click="showInfoIDH = !showInfoIDH">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <Transition name="tooltip-fade">
                <div v-if="showInfoIDH" class="tooltip-content">
                  Indicador que mide el desarrollo humano considerando salud, educación y nivel de vida.
                </div>
              </Transition>
            </div>
          </div>

          <div class="card-body-content">
            <div v-if="idhLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="idhError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <div v-else class="idh-content">
              <div class="idh-main-content">
                <div class="idh-value-display">
                  <span class="idh-big-value">{{ idhValue.toFixed(3) }}</span>
                  <span class="idh-label">Índice de Desarrollo Humano</span>
                </div>
                <div class="idh-gauge-container">
                  <IDHGauge
                    :value="idhValue"
                    :maxValue="1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 6: POBLACIÓN -->
        <div class="poblacion-section card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span class="card-header-title">Población Total</span>
            
            <div class="info-tooltip">
              <button class="info-btn" @click="showInfoPoblacion = !showInfoPoblacion">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <Transition name="tooltip-fade">
                <div v-if="showInfoPoblacion" class="tooltip-content">
                  Número total de habitantes en la entidad federativa según el último censo.
                </div>
              </Transition>
            </div>
          </div>

          <div class="card-body-content">
            <div v-if="poblacionLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="poblacionError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <div v-else class="poblacion-content-new">
              <div class="poblacion-header">
                <span class="poblacion-value-large">{{ formatNumberCompact(poblacionValue) }}</span>
                <span class="poblacion-subtitle">Personas</span>
              </div>
              
              <div class="poblacion-visual">
                <ScalablePerson :value="poblacionValue" />
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
import HorizontalBarsList from '@/modules/charts/components/HorizontalBarsList.vue'
import ScalablePerson from '../../object/component/ScalablePerson.vue'
import IDHGauge from '../../object/component/IDHGauge.vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName, setActiveYear } from '@/dataConection/storageConfig'

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

const { fetchData } = useStorageData()

// ============================================
// ESTADOS PARA TOOLTIPS
// ============================================
const showInfoDesocupacion = ref(false)
const showInfoRezago = ref(false)
const showInfoGini = ref(false)
const showInfoMarginacion = ref(false)
const showInfoIDH = ref(false)
const showInfoPoblacion = ref(false)

const parseNumericValue = (value) => {
  if (typeof value === 'number') return value
  if (!value || value === '') return 0
  
  let stringValue = String(value).trim()
  stringValue = stringValue.replace(/\s/g, '')
  stringValue = stringValue.replace(/,/g, '')
  
  const result = parseFloat(stringValue)
  return isNaN(result) ? 0 : result
}

// ============================================
// FUNCIÓN PARA BADGES AZULES
// ============================================
const getBlueBadgeClass = (grado) => {
  if (!grado) return 'badge-blue-default'
  const gradoLower = grado.toLowerCase()
  if (gradoLower.includes('muy bajo')) return 'badge-blue-lightest'
  if (gradoLower.includes('bajo')) return 'badge-blue-light'
  if (gradoLower.includes('medio')) return 'badge-blue-medium'
  if (gradoLower.includes('alto') && !gradoLower.includes('muy')) return 'badge-blue-dark'
  if (gradoLower.includes('muy alto')) return 'badge-blue-darkest'
  return 'badge-blue-default'
}

// ============================================
// DESOCUPACIÓN
// ============================================
const desocupacionData = ref([])
const desocupacionLoading = ref(false)
const desocupacionError = ref(null)

const loadDesocupacionData = async (entityName = null, year = null) => {
  try {
    desocupacionLoading.value = true
    desocupacionError.value = null
    
    if (!entityName) {
      desocupacionData.value = []
      desocupacionLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('desocupacion')
    const sheetName = getSheetName('desocupacion')
    const rawData = await fetchData('desocupacion', sheetName)
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
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
        color: variable.color || '#0F3759',
        colorClass: variable.colorClass || 'blue',
        active: true
      }))
    
    desocupacionData.value = transformedData
    
  } catch (err) {
    console.error('❌ [Desocupación] Error:', err)
    desocupacionError.value = err.message
  } finally {
    desocupacionLoading.value = false
  }
}

// ============================================
// MARGINACIÓN
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
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      marginacionIndice.value = parseNumericValue(entityRow[mapping.variables[0].column])
      marginacionGrado.value = entityRow[mapping.variables[1].column] || ''
      marginacionNormalizado.value = parseNumericValue(entityRow[mapping.variables[2].column])
    } else {
      marginacionIndice.value = 0
      marginacionGrado.value = ''
      marginacionNormalizado.value = 0
    }
    
  } catch (err) {
    console.error('❌ [Marginación] Error:', err)
    marginacionError.value = err.message
  } finally {
    marginacionLoading.value = false
  }
}

// ============================================
// IDH
// ============================================
const idhValue = ref(0)
const idhLoading = ref(false)
const idhError = ref(null)

const loadIDHData = async (entityName = null, year = null) => {
  try {
    idhLoading.value = true
    idhError.value = null
    
    if (!entityName) {
      idhValue.value = 0
      idhLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('idh')
    const sheetName = getSheetName('idh')
    const rawData = await fetchData('idh', sheetName)
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      idhValue.value = parseNumericValue(entityRow[mapping.variables[0].column])
    } else {
      idhValue.value = 0
    }
    
  } catch (err) {
    console.error('❌ [IDH] Error:', err)
    idhError.value = err.message
  } finally {
    idhLoading.value = false
  }
}

// ============================================
// POBLACIÓN
// ============================================
const poblacionValue = ref(0)
const poblacionPercentage = ref(0)
const poblacionLoading = ref(false)
const poblacionError = ref(null)

const loadPoblacionData = async (entityName = null, year = null) => {
  try {
    poblacionLoading.value = true
    poblacionError.value = null
    
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
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      poblacionValue.value = parseNumericValue(entityRow[mapping.variables[0].column])
      
      const allValues = rawData
        .map(row => parseNumericValue(row[mapping.variables[0].column]))
        .filter(val => val > 0)
      
      const maxValue = Math.max(...allValues)
      poblacionPercentage.value = maxValue > 0 ? (poblacionValue.value / maxValue) * 100 : 0
    } else {
      poblacionValue.value = 0
      poblacionPercentage.value = 0
    }
    
  } catch (err) {
    console.error('❌ [Población] Error:', err)
    poblacionError.value = err.message
  } finally {
    poblacionLoading.value = false
  }
}

// ============================================
// REZAGO SOCIAL
// ============================================
const rezagoIndice = ref(0)
const rezagoGrado = ref('')
const rezagoLoading = ref(false)
const rezagoError = ref(null)

const loadRezagoData = async (entityName = null, year = null) => {
  try {
    rezagoLoading.value = true
    rezagoError.value = null
    
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
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      rezagoIndice.value = parseNumericValue(entityRow[mapping.variables[0].column])
      rezagoGrado.value = entityRow[mapping.variables[1].column] || ''
    } else {
      rezagoIndice.value = 0
      rezagoGrado.value = ''
    }
    
  } catch (err) {
    console.error('❌ [Rezago Social] Error:', err)
    rezagoError.value = err.message
  } finally {
    rezagoLoading.value = false
  }
}

const getRezagoPercentage = (value) => {
  const maxNegative = -1300000
  const maxPositive = 2700000
  
  if (value === 0) return 50
  
  if (value < 0) {
    const percentage = 50 - ((Math.abs(value) / Math.abs(maxNegative)) * 50)
    return Math.max(0, percentage)
  } else {
    const percentage = 50 + ((value / maxPositive) * 50)
    return Math.min(100, percentage)
  }
}

// ============================================
// ÍNDICE GINI
// ============================================
const giniData = ref([])
const giniLoading = ref(false)
const giniError = ref(null)

const loadGiniData = async (entityName = null, year = null) => {
  try {
    giniLoading.value = true
    giniError.value = null
    
    if (!entityName) {
      giniData.value = []
      giniLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('indiceGini')
    const sheetName = getSheetName('indiceGini')
    const rawData = await fetchData('indiceGini', sheetName)
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
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
        color: variable.color || '#0F3759',
        colorClass: variable.colorClass || 'blue',
        active: true
      }))
    
    giniData.value = transformedData
    
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

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity) => {
  loadDesocupacionData(newEntity, props.selectedYear)
  loadMarginacionData(newEntity, props.selectedYear)
  loadIDHData(newEntity, props.selectedYear)
  loadPoblacionData(newEntity, props.selectedYear)
  loadRezagoData(newEntity, props.selectedYear)
  loadGiniData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear) => {
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
  await Promise.all([
    loadDesocupacionData(props.selectedEntity, props.selectedYear),
    loadMarginacionData(props.selectedEntity, props.selectedYear),
    loadIDHData(props.selectedEntity, props.selectedYear),
    loadPoblacionData(props.selectedEntity, props.selectedYear),
    loadRezagoData(props.selectedEntity, props.selectedYear),
    loadGiniData(props.selectedEntity, props.selectedYear)
  ])
})
</script>

<style scoped>
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

/* ✅ GLOBAL EMPTY STATE */
.global-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.empty-state-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 50%;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
}

.empty-state-icon svg {
  opacity: 0.7;
}

.empty-state-title {
  font-size: 22px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.empty-state-description {
  font-size: 14px;
  color: #718096;
  margin: 0;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 50%;
  width: 100%;
  min-height: 0;
}

.marginacion-section, .rezago-section, .gini-section {
  flex: 1;
  min-width: 0;
}

.bottom-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 50%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.desocupacion-section {
  flex: 0 0 50%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.idh-section,
.poblacion-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* HEADER OSCURO */
.card-header-dark {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  border-bottom: 1px solid #3b6b8a;
  flex-shrink: 0;
}

.card-header-icon {
  width: 18px;
  height: 18px;
  min-width: 18px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-header-icon svg {
  width: 12px;
  height: 12px;
}

.card-header-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: white;
  line-height: 1.1;
  letter-spacing: 0.1px;
  flex: 1;
}

/* TOOLTIP */
.info-tooltip {
  position: relative;
  margin-left: auto;
}

.info-btn {
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.info-btn svg {
  width: 12px;
  height: 12px;
}

.info-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.tooltip-content {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #1f2937;
  color: white;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 10px;
  line-height: 1.4;
  max-width: 200px;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tooltip-content::before {
  content: '';
  position: absolute;
  bottom: 100%;
  right: 6px;
  border: 5px solid transparent;
  border-bottom-color: #1f2937;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* CARD BODY CONTENT */
.card-body-content {
  flex: 1;
  overflow: hidden;
  background: white;
  padding: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.card-body-content > .indicator-content {
  flex: 1;
  min-height: 0;
}

.card-body-content > :deep(.horizontal-bars-container) {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-body-content > :deep(.horizontal-bars-container .bars-list) {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-body-content > :deep(.horizontal-bars-container .bar-item) {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 20px;
}

.loading-state-small, .error-state-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 10px;
  text-align: center;
  background: #f8fafc;
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

.error-state p, .error-state-small p {
  color: #666;
  font-size: 12px;
  margin: 0;
}

/* INDICATOR CONTENT */
.indicator-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  padding: 3px;
  min-height: 0;
}

.indicator-stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  flex: 1;
  min-height: 0;
}

.indicator-stats-row > * {
  min-height: 0;
}

.indicator-stats-row-full {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  flex: 1;
  min-height: 0;
}

.indicator-stats-row-full > * {
  min-height: 0;
}

.indicator-stats-row.single-row-fill {
  flex: 1;
  height: 100%;
}

.indicator-stats-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.indicator-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 4px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  text-align: center;
  min-height: 0;
  overflow: hidden;
}

.indicator-stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.indicator-stat-card .stat-icon-wrapper {
  margin-bottom: 5px;
  flex-shrink: 0;
  width: 40px;
  height: 28px;
  border-radius: 6px;
}

.indicator-stat-card .stat-icon-wrapper svg {
  width: 12px;
  height: 12px;
}

.indicator-stat-card .stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-width: 0;
  width: 100%;
  flex: 1;
}

.indicator-stat-card .stat-value {
  font-size: 15px;
  font-weight: 800;
  color: #0F3759;
  line-height: 1;
}

.indicator-stat-card .stat-label {
  font-size: 10px;
  padding-bottom: 5px;
}

.indicator-stat-card .stat-badge {
  width: 100%;
  padding: 3px 8px;
  font-size: 14px;
  font-weight: 300;
  flex: 1;
}

.stat-icon-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon-wrapper.blue-gradient {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.stat-info.full-width {
  width: 100%;
}

.stat-label {
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1;
}

.stat-value.large {
  font-size: 28px;
}

/* BADGES AZULES */
.stat-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.2s ease;
}

.stat-badge.large {
  padding: 8px 16px;
  font-size: 15px;
}

.stat-badge.badge-blue-lightest {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0c4a6e;
  border: 1px solid #7dd3fc;
}

.stat-badge.badge-blue-light {
  background: linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%);
  color: #0c4a6e;
  border: 1px solid #38bdf8;
}

.stat-badge.badge-blue-medium {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color: white;
  border: 1px solid #0284c7;
}

.stat-badge.badge-blue-dark {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: white;
  border: 1px solid #075985;
}

.stat-badge.badge-blue-darkest {
  background: linear-gradient(135deg, #075985 0%, #0c4a6e 100%);
  color: white;
  border: 1px solid #0c4a6e;
}

.stat-badge.badge-blue-default {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #475569;
  border: 1px solid #94a3b8;
}

/* BARRA DE PROGRESO ANIMADA */
.indicator-progress-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-title {
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-value-text {
  font-size: 14px;
  font-weight: 800;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.animated-progress-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.progress-track {
  position: relative;
  width: 100%;
  height: 28px;
  background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 100%);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #1e3a5f 0%, #2d5a87 50%, #3b82f6 100%);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.3);
}

.progress-fill.animated {
  width: 0;
  animation: fillProgress 1.5s ease-out forwards;
  animation-delay: 0.3s;
}

@keyframes fillProgress {
  from { width: 0; }
  to { width: var(--target-width); }
}

.progress-markers {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding-top: 4px;
}

.progress-markers .marker {
  position: absolute;
  transform: translateX(-50%);
  font-size: 8px;
  color: #94a3b8;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.progress-markers .marker.center {
  color: #64748b;
  font-weight: 700;
}

/* IDH SECTION */
.idh-content {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  box-sizing: border-box;
}

.idh-main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 10px;
  min-height: 0;
}

.idh-value-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.idh-big-value {
  font-size: 32px;
  font-weight: 800;
  color: #0F3759;
  line-height: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.idh-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.idh-gauge-container {
  width: 100%;
  max-width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* POBLACIÓN SECTION */
.poblacion-content-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 8px;
  gap: 4px;
}

.poblacion-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.poblacion-value-large {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.poblacion-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.poblacion-visual {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
}

@media (max-height: 700px) {
  .poblacion-value-large {
    font-size: 26px;
  }
  
  .poblacion-content-new {
    padding: 4px;
    gap: 2px;
  }
}
</style>