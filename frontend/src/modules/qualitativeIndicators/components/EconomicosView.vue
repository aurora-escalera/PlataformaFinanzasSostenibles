<!-- src/modules/qualitativeIndicators/components/EconomicosView.vue -->
<!-- ✅ ACTUALIZADO: PIB con diseño Split Diagonal + Donut -->
<template>
  <div class="economicos-container">
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
          Selecciona una entidad federativa en el filtro superior para visualizar los indicadores económicos.
        </p>
      </div>
    </div>

    <!-- ✅ CONTENIDO NORMAL cuando hay entidad seleccionada -->
    <div v-else class="card-body">
      <!-- ========================================
           LEFT SIDE CONTAINER
           ======================================== -->
      <div class="left-card-container">
        <!-- ✅ TOP LEFT: ITAEE -->
        <div class="itaee-card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <span class="card-header-title">Indicador Trimestral de la Actividad Económica Estatal (ITAEE)</span>
            
            <div class="info-tooltip">
              <button class="info-btn" @click="showInfoITAEE = !showInfoITAEE">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <Transition name="tooltip-fade">
                <div v-if="showInfoITAEE" class="tooltip-content">
                  Indicador que mide la evolución trimestral de la actividad económica de las entidades federativas.
                </div>
              </Transition>
            </div>
          </div>

          <div class="itaee-body">
            <div v-if="itaeLoading" class="loading-state">
              <div class="spinner-small"></div>
              <p>Cargando datos...</p>
            </div>

            <div v-else-if="itaeError" class="error-state">
              <p>Error: {{ itaeError }}</p>
              <button @click="loadITAEData(selectedEntity, selectedYear)" class="retry-btn-small">
                Reintentar
              </button>
            </div>

            <BulletChart
              v-else
              :variables="itaeData"
              title=""
              :highlightState="selectedEntity"
              :showLegend="false"
              :maxValue="20"
            />
          </div>
        </div>
        
        <!-- ✅ BOTTOM LEFT: PEA -->
        <div class="pea-card">
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span class="card-header-title">Población económicamente activa</span>
            
            <div class="info-tooltip">
              <button class="info-btn" @click="showInfoPEA = !showInfoPEA">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
              <Transition name="tooltip-fade">
                <div v-if="showInfoPEA" class="tooltip-content">
                  Población de 15 años y más que trabaja o busca activamente empleo en la entidad.
                </div>
              </Transition>
            </div>
          </div>

          <div class="pea-body">
            <div v-if="peaLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="peaError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <template v-else>
              <div class="person-graph-container">
                <PersonChart :value="peaPercentage" />
              </div>
              
              <div class="person-values">
                <div class="person-value-item">
                  <span class="person-value-number">{{ formatNumber(peaValue) }}</span>
                  <span class="person-value-unit">Personas</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- ========================================
           RIGHT SIDE CONTAINER
           ======================================== -->
      <div class="right-card-container">
        <!-- ✅ TOP RIGHT: PIB con nuevo diseño Split Diagonal -->
        <div class="top-right-card-container">
          <div class="pib-card">
            <div class="card-header-dark">
              <div class="card-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <span class="card-header-title">PIB Estatal (millones de pesos)</span>
              
              <div class="info-tooltip">
                <button class="info-btn" @click="showInfoPIB = !showInfoPIB">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </button>
                <Transition name="tooltip-fade">
                  <div v-if="showInfoPIB" class="tooltip-content">
                    Producto Interno Bruto Estatal (PIBE), valor anual en millones de pesos corrientes.
                  </div>
                </Transition>
              </div>
            </div>

            <div class="pib-body">
              <div v-if="PIBLoading" class="loading-state-small">
                <div class="spinner-small"></div>
              </div>

              <div v-else-if="PIBError" class="error-state-small">
                <p>Error al cargar datos</p>
                <button @click="loadPIBData(selectedEntity, selectedYear)" class="retry-btn-small">
                  Reintentar
                </button>
              </div>

              <!-- ✅ IconPercentageChart con diseño Split Diagonal -->
              <IconPercentageChart
                v-else
                iconPath="/public/icons/pib-icon.png"
                :value="pibPercentage"
                :mainValue="pibValue"
                mainLabel="PIB Estatal"
                currencySymbol="$"
                valueUnit="MDP"
                :entity="selectedEntity"
                :period="selectedYear"
                :animated="true"
                :animationDuration="1.5"
                :startDelay="300"
                :showPercentage="true"
              />
            </div>
          </div>
        </div>
        
        <!-- ✅ BOTTOM RIGHT: INGRESOS Y EGRESOS -->
        <div class="bottom-right-card-container">
          <div class="ingresos-card">
            <div class="card-header-dark">
              <div class="card-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <span class="card-header-title">Ingresos y Egresos Totales</span>
              
              <div class="info-tooltip">
                <button class="info-btn" @click="showInfoIngresos = !showInfoIngresos">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </button>
                <Transition name="tooltip-fade">
                  <div v-if="showInfoIngresos" class="tooltip-content">
                    Comparativa de ingresos y egresos totales de la entidad federativa seleccionada en miles de pesos.
                  </div>
                </Transition>
              </div>
            </div>

            <div class="ingresos-body">
              <div v-if="ingresoTotalLoading" class="loading-state">
                <div class="spinner-small"></div>
                <p>Cargando datos...</p>
              </div>

              <div v-else-if="ingresoTotalError" class="error-state">
                <p>Error: {{ ingresoTotalError }}</p>
                <button @click="loadIngresoTotalData(selectedEntity, selectedYear)" class="retry-btn-small">
                  Reintentar
                </button>
              </div>

              <HorizontalBarChart
                v-else
                :variables="ingresoTotalData"
                width="100%"
                height="100%"
                title=""
                :showFilters="true"
                :showLegend="true"
                barHeight="20px"
                barGap="1px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import HorizontalBarChart from '@/modules/charts/components/HorizontalBarChart.vue'
import PersonChart from '../../object/component/PersonChart.vue'
import IconPercentageChart from '@/modules/object/component/IconPercentageChart.vue'
import BulletChart from '@/modules/charts/components/BulletChart.vue'
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

// Estados para tooltips
const showInfoIngresos = ref(false)
const showInfoPEA = ref(false)
const showInfoPIB = ref(false)
const showInfoITAEE = ref(false)

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
// INGRESOS TOTALES
// ============================================
const ingresoTotalData = ref([])
const ingresoTotalLoading = ref(false)
const ingresoTotalError = ref(null)

const loadIngresoTotalData = async (entityName = null, year = null) => {
  try {
    ingresoTotalLoading.value = true
    ingresoTotalError.value = null
    
    if (!entityName) {
      ingresoTotalData.value = []
      ingresoTotalLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('ingresoTotal')
    const sheetName = getSheetName('ingresoTotal')
    const rawData = await fetchData('ingresoTotal', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      ingresoTotalData.value = []
      ingresoTotalLoading.value = false
      return
    }
    
    const transformedData = mapping.variables
      .sort((a, b) => a.order - b.order)
      .map(variable => ({
        key: variable.key,
        label: variable.label,
        value: parseNumericValue(entityRow[variable.column]),
        color: variable.color,
        colorClass: variable.colorClass || 'default',
        active: true
      }))
    
    ingresoTotalData.value = transformedData
    
  } catch (err) {
    console.error('❌ [Ingreso Total] Error:', err)
    ingresoTotalError.value = err.message
  } finally {
    ingresoTotalLoading.value = false
  }
}

// ============================================
// PERSONAS ECONÓMICAMENTE ACTIVAS
// ============================================
const peaValue = ref(0)
const peaPercentage = ref(0)
const peaLoading = ref(false)
const peaError = ref(null)

const loadPersonasData = async (entityName = null, year = null) => {
  try {
    peaLoading.value = true
    peaError.value = null
    
    if (!entityName) {
      peaValue.value = 0
      peaPercentage.value = 0
      peaLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('pea')
    const sheetName = getSheetName('pea')
    const rawData = await fetchData('pea', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      peaValue.value = parseNumericValue(entityRow[mapping.valueColumn])
      
      const allValues = rawData
        .map(row => parseNumericValue(row[mapping.valueColumn]))
        .filter(val => val > 0)
      
      const maxValue = Math.max(...allValues)
      peaPercentage.value = maxValue > 0 ? (peaValue.value / maxValue) * 100 : 0
    } else {
      peaValue.value = 0
      peaPercentage.value = 0
    }
    
  } catch (err) {
    console.error('❌ [PEA] Error:', err)
    peaError.value = err.message
  } finally {
    peaLoading.value = false
  }
}

// ============================================
// PRODUCTO INTERNO BRUTO (PIB)
// ============================================
const pibValue = ref(0)
const pibPercentage = ref(0)
const PIBLoading = ref(false)
const PIBError = ref(null)

const loadPIBData = async (entityName = null, year = null) => {
  try {
    PIBLoading.value = true
    PIBError.value = null
    
    if (!entityName) {
      pibValue.value = 0
      pibPercentage.value = 0
      PIBLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('pib')
    const sheetName = getSheetName('pib')
    const rawData = await fetchData('pib', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      pibValue.value = parseNumericValue(entityRow[mapping.valueColumn])
      
      const allValues = rawData
        .map(row => parseNumericValue(row[mapping.valueColumn]))
        .filter(val => val > 0)
      
      const totalSum = allValues.reduce((sum, val) => sum + val, 0)
      pibPercentage.value = totalSum > 0 ? (pibValue.value / totalSum) * 100 : 0
    } else {
      pibValue.value = 0
      pibPercentage.value = 0
    }
    
  } catch (err) {
    console.error('❌ [PIB] Error:', err)
    PIBError.value = err.message
  } finally {
    PIBLoading.value = false
  }
}

// ============================================
// ITAEE
// ============================================
const itaeData = ref([])
const itaeLoading = ref(false)
const itaeError = ref(null)

const loadITAEData = async (entityName = null, year = null) => {
  try {
    itaeLoading.value = true
    itaeError.value = null
    
    if (!entityName) {
      itaeData.value = []
      itaeLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('itaee')
    const sheetName = getSheetName('itaee')
    const rawData = await fetchData('itaee', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const variableConfig = mapping.variables[0]
    
    const transformedData = rawData.map(row => {
      const entityName = row[mapping.categoryColumn]
      const rawValue = row[variableConfig.column]
      const value = parseNumericValue(rawValue)
      
      return {
        key: entityName,
        label: entityName,
        value: value,
        active: true
      }
    }).filter(item => item.label && item.label.trim() !== '')
    
    itaeData.value = transformedData
    
  } catch (err) {
    console.error('❌ [ITAEE] Error:', err)
    itaeError.value = err.message
  } finally {
    itaeLoading.value = false
  }
}

// ============================================
// UTILIDADES
// ============================================
const formatNumber = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('es-MX').format(value)
}

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity) => {
  loadIngresoTotalData(newEntity, props.selectedYear)
  loadPersonasData(newEntity, props.selectedYear)
  loadPIBData(newEntity, props.selectedYear)
  if (newEntity) {
    loadITAEData(newEntity, props.selectedYear)
  } else {
    itaeData.value = []
  }
}, { immediate: false })

watch(() => props.selectedYear, (newYear) => {
  if (props.selectedEntity) {
    loadIngresoTotalData(props.selectedEntity, newYear)
    loadPersonasData(props.selectedEntity, newYear)
    loadPIBData(props.selectedEntity, newYear)
    loadITAEData(props.selectedEntity, newYear)
  }
}, { immediate: false })

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  await Promise.all([
    loadIngresoTotalData(props.selectedEntity, props.selectedYear),
    loadPersonasData(props.selectedEntity, props.selectedYear),
    loadPIBData(props.selectedEntity, props.selectedYear),
    loadITAEData(props.selectedEntity, props.selectedYear)
  ])
})
</script>

<style scoped>
.economicos-container {
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

/* CARD BODY */
.card-body {
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.left-card-container {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

/* ============================================
   ✅ HEADER OSCURO
   ============================================ */
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

/* ============================================
   ✅ TOOLTIP E INFO BUTTON
   ============================================ */
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

/* ============================================
   ✅ CARD ITAEE (LEFT TOP - 75%)
   ============================================ */
.itaee-card {
  height: 75%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.itaee-body {
  flex: 1;
  background: white;
  overflow: hidden;
}

/* ============================================
   ✅ CARD PEA (LEFT BOTTOM - 25%)
   ============================================ */
.pea-card {
  height: 25%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.pea-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  padding: 6px 10px;
  gap: 10px;
  background: white;
  align-items: center;
  min-height: 0;
}

.person-graph-container {
  flex: 1;
  height: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 55px;
}

.person-values {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 80px;
  padding: 4px 6px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.person-value-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.person-value-number {
  font-family: 'Segoe UI', Verdana, Geneva, Tahoma, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #1e3a5f;
}

.person-value-unit {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 9px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
}

/* ============================================
   ✅ RIGHT SIDE
   ============================================ */
.right-card-container {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  gap: 10px;
  overflow: hidden;
}

.top-right-card-container {
  display: flex;
  border-radius: 12px;
  flex: 1;
  gap: 10px;
  min-height: 0;
}

.bottom-right-card-container {
  flex: 1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* ============================================
   ✅ CARD PIB (RIGHT TOP) - NUEVO DISEÑO
   ============================================ */
.pib-card {
  width: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.pib-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.pib-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
  background: white;
}

/* ============================================
   ✅ CARD INGRESOS (RIGHT BOTTOM)
   ============================================ */
.ingresos-card {
  height: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.ingresos-body {
  flex: 1;
  overflow: hidden;
  background: white;
}

/* ============================================
   ✅ LOADING & ERROR STATES
   ============================================ */
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
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid rgb(203, 199, 199);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
</style>