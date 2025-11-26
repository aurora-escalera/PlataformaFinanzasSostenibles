<!-- src/modules/qualitativeIndicators/components/EconomicosView.vue -->
<!-- ✅ ACTUALIZADO: Empty state centralizado cuando no hay entidad seleccionada -->
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
      <!-- Left Side Container -->
      <div class="left-card-container">
        <!-- Top: Horizontal Bar Chart - Ingresos Totales -->
        <div class="bar-graph card">
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
            title="Ingresos y Egresos Totales"
            :showFilters="true"
            :showLegend="true"
            barHeight="20px"
            barGap="1px"
          />
        </div>
        
        <!-- Bottom: Person Graph - Personas Económicamente Activas -->
        <div class="person-graphs card">
          <div class="person-bottle">
            <h2>Población económicamente activa</h2>
          </div>
          <div class="body-person">
            <div v-if="peaLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="peaError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <template v-else>
              <div class="person-graph">
                <div class="person-number number">{{ formatNumber(peaValue) }} Personas</div>
                <PersonChart 
                  :value="peaPercentage" 
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Right Side Container -->
      <div class="right-card-container">
        <!-- Top Right Container - PIB -->
        <div class="top-right-card-container">
          <div class="pib-chart card">
            <div class="card-header">
              <div class="header-content">
                <div class="icon-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div class="header-text">
                  <h3 class="card-title">PIB Estatal</h3>
                  <p class="card-subtitle">Millones de pesos</p>
                </div>
              </div>
              
              <div class="info-tooltip">
                <button class="info-btn" @click="showInfo = !showInfo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </button>
                
                <Transition name="tooltip-fade">
                  <div v-if="showInfo" class="tooltip-content">
                    Producto Interno Bruto Estatal (PIBE), anual en millones de pesos.
                  </div>
                </Transition>
              </div>
            </div>

            <div class="card-body-pib">
              <div v-if="PIBLoading" class="state-container loading-state">
                <div class="spinner"></div>
                <p class="state-text">Cargando datos...</p>
              </div>

              <div v-else-if="PIBError" class="state-container error-state">
                <div class="error-icon">⚠️</div>
                <p class="state-text">Error al cargar datos</p>
                <button @click="loadPIBData(selectedEntity, selectedYear)" class="retry-btn">
                  Reintentar
                </button>
              </div>

              <div v-else class="pib-data-container">
                <div class="pib-main-value">
                  <span class="currency-symbol">$</span>
                  <span class="value-number">{{ formatNumber(pibValue) }}</span>
                  <span class="value-unit">MDP</span>
                </div>

                <div class="pib-content-wrapper">
                  <div class="pib-visual">
                    <IconPercentageChart
                      iconPath="/public/icons/pib-icon.png"
                      :value="pibPercentage"
                      fillDirection="vertical"
                      fillOrigin="bottom"
                      width="100%"
                      height="100%"
                      iconWidth="85%"
                      iconHeight="95%"
                      :showPercentage="true"
                      fillColor="#0F3759"
                      :animated="true"
                      :animationDuration="1.5"
                    />
                  </div>

                  <div class="pib-context">
                    <div class="context-item">
                      <span class="context-label">Entidad</span>
                      <span class="context-value">{{ selectedEntity }}</span>
                    </div>
                    <div class="context-item">
                      <span class="context-label">Periodo</span>
                      <span class="context-value">{{ selectedYear }}</span>
                    </div>
                    <div class="context-item">
                      <span class="context-label">% Nacional</span>
                      <span class="context-value">{{ pibPercentage.toFixed(2) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bottom Right Container - ITAEE -->
        <div class="bottom-right-card-container">
          <div class="bottom-bar-graph card">
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
              title="Indicador Trimestral de la Actividad Económica Estatal (ITAEE)"
              :highlightState="selectedEntity"
              :showLegend="false"
              :maxValue="20"
            />
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

const showInfo = ref(false)

const parseNumericValue = (value) => {
  if (typeof value === 'number') return value
  if (!value || value === '') return 0
  
  let stringValue = String(value).trim()
  stringValue = stringValue.replace(/\s/g, '')
  
  const hasCommaAndDot = stringValue.includes(',') && stringValue.includes('.')
  
  if (hasCommaAndDot) {
    stringValue = stringValue.replace(/\./g, '')
    stringValue = stringValue.replace(/,/g, '.')
  } else if (stringValue.includes(',')) {
    stringValue = stringValue.replace(/,/g, '.')
  }
  
  const result = parseFloat(stringValue)
  return isNaN(result) ? 0 : result
}

// ============================================
// Ingresos Totales
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
        color: value >= 0 ? '#10b981' : '#ef4444',
        colorClass: value >= 0 ? 'green' : 'red',
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

.card-body {
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.card {
  border: 1px solid #b0b0b0;
  border-radius: 12px;
  overflow: hidden;
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

.bar-graph {
  height: 60%;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
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

.person-graphs {
  height: 40%;
  border-radius: 12px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.person-bottle {
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

h2 {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 300;
  color: #535353;
  font-size: 16px;
  margin: 0;
}

.body-person {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.person-graph {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.number {
  display: flex;
  justify-content: center;
  width: 100%;
  color: #58778F;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 500;
  font-size: 16px;
  flex-shrink: 0;
  padding-top: 20px;
}

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
  flex: 5;
  gap: 10px;
  min-height: 0;
}

.pib-chart.card {
  width: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(15, 55, 89, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.pib-chart.card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 0.75rem;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.icon-badge {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.icon-badge svg {
  width: 18px;
  height: 18px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card-subtitle {
  margin: 0;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.info-tooltip {
  position: relative;
}

.info-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.info-btn svg {
  width: 16px;
  height: 16px;
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
  padding: 0.6rem 0.85rem;
  border-radius: 6px;
  font-size: 0.65rem;
  line-height: 1.3;
  max-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tooltip-content::before {
  content: '';
  position: absolute;
  bottom: 100%;
  right: 12px;
  border: 6px solid transparent;
  border-bottom-color: #1f2937;
}

.card-body-pib {
  flex: 1;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 0;
  overflow: hidden;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
  width: 100%;
}

.state-text {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #0F3759;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-icon {
  font-size: 2.5rem;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #0F3759;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.retry-btn:hover {
  background: #1a4d7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 55, 89, 0.3);
}

.pib-data-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem;
  overflow: hidden;
}

.pib-main-value {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  font-weight: 800;
  color: #0F3759;
  text-align: center;
  flex-wrap: wrap;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid #e2e8f0;
  width: 100%;
  flex-shrink: 0;
}

.currency-symbol {
  font-size: 0.9rem;
}

.value-number {
  font-size: 1.3rem;
  line-height: 1;
}

.value-unit {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.pib-content-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.pib-visual {
  flex: 1;
  max-width: 110px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pib-context {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0.75rem;
  border-left: 2px solid #e2e8f0;
  overflow: hidden;
}

.context-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-align: left;
}

.context-label {
  font-size: 0.6rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.context-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0F3759;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.bottom-right-card-container {
  flex: 5;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.bottom-bar-graph {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>