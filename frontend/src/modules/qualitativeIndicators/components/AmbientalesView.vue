<!-- src/modules/qualitativeIndicators/components/AmbientalesView.vue -->
<!-- ✅ ACTUALIZADO: Con logs de diagnóstico para energía -->
<template>
  <div class="ambientales-container">
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
          Selecciona una entidad federativa en el filtro superior para visualizar los indicadores ambientales.
        </p>
      </div>
    </div>

    <!-- ✅ CONTENIDO NORMAL cuando hay entidad seleccionada -->
    <div v-else class="card-body">
      <!-- Left Side Container -->
      <div class="left-card-container">
        <!-- Top: Horizontal Bar Chart - Incendios Forestales -->
        <div class="incendios-card">
          <!-- ✅ Header Incendios -->
          <div class="card-header-dark">
            <div class="card-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </div>
            <span class="card-header-title">Incendios forestales en hectáreas</span>
          </div>
          
          <!-- Body -->
          <div class="incendios-body">
            <div v-if="incendiosLoading" class="loading-state">
              <div class="spinner-small"></div>
              <p>Cargando datos...</p>
            </div>

            <div v-else-if="incendiosError" class="error-state">
              <p>Error: {{ incendiosError }}</p>
              <button @click="loadIncendiosData(selectedEntity, selectedYear)" class="retry-btn-small">
                Reintentar
              </button>
            </div>

            <HorizontalBarChart
              v-else
              :variables="incendiosData"
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
        
        <!-- ✅ Card de Residuos -->
        <div class="bottle-card">
          <div class="bottle-header">
            <div class="bottle-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>
            <span class="bottle-header-title">Promedio diario de residuos sólidos urbanos recolectados</span>
          </div>
          
          <div class="bottle-body">
            <div v-if="residuosLoading" class="loading-state-small">
              <div class="spinner-small"></div>
            </div>

            <div v-else-if="residuosError" class="error-state-small">
              <p>Error cargando datos</p>
            </div>

            <template v-else>
              <div class="bottle-graph-container">
                <BottleChart :value="residuosPercentage" />
              </div>
              
              <div class="bottle-values">
                <div class="bottle-value-item">
                  <span class="bottle-value-number">{{ formatNumber(residuosValue) }}</span>
                  <span class="bottle-value-unit">kg</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Right Side Container -->
      <div class="right-card-container">
        <!-- Top Right Container -->
        <div class="top-right-card-container">
          <!-- Area Chart - Emisiones Contaminantes -->
          <div class="emisiones-card">
            <div class="card-header-dark">
              <div class="card-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                  <path d="M22 10a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5"/>
                </svg>
              </div>
              <span class="card-header-title">Emisiones de contaminantes atmosféricos por fuente en toneladas</span>
            </div>
            
            <div class="emisiones-body">
              <div v-if="emisionesLoading" class="loading-state-small">
                <div class="spinner-small"></div>
              </div>

              <div v-else-if="emisionesError" class="error-state-small">
                <p>Error cargando datos</p>
              </div>

              <EmisionesBarChart 
                v-else
                :excelData="emisionesData"
              />  
            </div>
          </div>
          
          <!-- Gauge Chart - Consumo de Energía Eléctrica -->
          <div class="energia-card">
            <div class="card-header-dark">
              <div class="card-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <span class="card-header-title">Consumo de energía eléctrica</span>
            </div>
            
            <div class="energia-body">
              <div v-if="energiaLoading" class="loading-state-small">
                <div class="spinner-small"></div>
              </div>

              <div v-else-if="energiaError" class="error-state-small">
                <p>Error cargando datos</p>
              </div>

              <template v-else>
                <div class="gauge-graph">
                  <GaugeChart :value="energiaPercentage" />
                </div>
                <div class="gauge-number">{{ formatNumber(energiaValue) }} GWh</div>
              </template>
            </div>
          </div>
        </div>
        
        <!-- Bottom Right Container -->
        <div class="bottom-right-card-container">
          <div class="areas-card">
            <div class="card-header-dark">
              <div class="card-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/>
                  <path d="M7 16v6"/>
                  <path d="M13 19v3"/>
                  <path d="M18 10v.2A3 3 0 0 1 16.9 16v0H13v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/>
                </svg>
              </div>
              <span class="card-header-title">Áreas naturales protegidas</span>
            </div>
            
            <div class="areas-body">
              <div v-if="areasLoading" class="loading-state">
                <div class="spinner-small"></div>
                <p>Cargando datos...</p>
              </div>

              <div v-else-if="areasError" class="error-state">
                <p>Error: {{ areasError }}</p>
                <button @click="loadAreasNaturalesData(selectedEntity, selectedYear)" class="retry-btn-small">
                  Reintentar
                </button>
              </div>

              <VerticalBarChart
                v-else
                :variables="areasNaturalesData"
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
import BottleChart from '@/modules/object/component/BottleChart.vue'
import AreaChart from '@/modules/charts/components/AreaChart.vue'
import GaugeChart from '@/modules/object/component/GaugeChart.vue'
import VerticalBarChart from '@/modules/charts/components/VerticalBarChart.vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName, setActiveYear } from '@/dataConection/storageConfig'
import EmisionesBarChart from '../../charts/components/EmisionesBarChart.vue'

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
// INCENDIOS FORESTALES
// ============================================
const incendiosData = ref([])
const incendiosLoading = ref(false)
const incendiosError = ref(null)

const loadIncendiosData = async (entityName = null, year = null) => {
  try {
    incendiosLoading.value = true
    incendiosError.value = null
    
    if (!entityName) {
      incendiosData.value = []
      incendiosLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('incendiosForestales')
    const sheetName = getSheetName('incendiosForestales')
    const rawData = await fetchData('incendiosForestales', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      incendiosData.value = []
      incendiosLoading.value = false
      return
    }
    
    const transformedData = mapping.variables
      .sort((a, b) => a.order - b.order)
      .map(variable => ({
        key: variable.key,
        label: variable.label,
        value: parseFloat(entityRow[variable.column]) || 0,
        color: variable.color,
        colorClass: variable.colorClass || 'default',
        active: true
      }))
    
    incendiosData.value = transformedData
    
  } catch (err) {
    console.error('❌ [Incendios] Error:', err)
    incendiosError.value = err.message
  } finally {
    incendiosLoading.value = false
  }
}

// ============================================
// RESIDUOS SÓLIDOS URBANOS
// ============================================
const residuosValue = ref(0)
const residuosPercentage = ref(0)
const residuosLoading = ref(false)
const residuosError = ref(null)

const loadResiduosData = async (entityName = null, year = null) => {
  try {
    residuosLoading.value = true
    residuosError.value = null
    
    if (!entityName) {
      residuosValue.value = 0
      residuosPercentage.value = 0
      residuosLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('residuosSolidos')
    const sheetName = getSheetName('residuosSolidos')
    const rawData = await fetchData('residuosSolidos', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const maxValue = rawData.reduce((max, row) => {
      const value = parseFloat(row[mapping.valueColumn]) || 0
      return value > max ? value : max
    }, 0)
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      const entityValue = parseFloat(entityRow[mapping.valueColumn]) || 0
      residuosValue.value = entityValue
      
      if (maxValue > 0) {
        const rawPercentage = (entityValue / maxValue) * 100 * 100
        residuosPercentage.value = Math.min(rawPercentage, 100)
      } else {
        residuosPercentage.value = 0
      }
      
      console.log(`📊 [Residuos] ${entityName}: ${entityValue.toLocaleString()} kg (${residuosPercentage.value.toFixed(1)}% botellas)`)
    } else {
      residuosValue.value = 0
      residuosPercentage.value = 0
    }
    
  } catch (err) {
    console.error('❌ [Residuos] Error:', err)
    residuosError.value = err.message
  } finally {
    residuosLoading.value = false
  }
}

// ============================================
// EMISIONES CONTAMINANTES
// ============================================
const emisionesData = ref([])
const emisionesLoading = ref(false)
const emisionesError = ref(null)

const loadEmisionesData = async (entityName = null, year = null) => {
  try {
    emisionesLoading.value = true
    emisionesError.value = null
    
    if (!entityName) {
      emisionesData.value = []
      emisionesLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('emisiones')
    const sheetName = getSheetName('emisiones')
    const rawData = await fetchData('emisiones', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      emisionesData.value = mapping.variables.map(variable => ({
        label: variable.label,
        value: parseFloat(entityRow[variable.column]) || 0
      }))
    } else {
      emisionesData.value = []
    }
    
  } catch (err) {
    console.error('❌ [Emisiones] Error:', err)
    emisionesError.value = err.message
  } finally {
    emisionesLoading.value = false
  }
}

// ============================================
// CONSUMO DE ENERGÍA ELÉCTRICA (✅ CORREGIDO CON LOGS)
// ============================================
const energiaValue = ref(0)
const energiaPercentage = ref(0)
const energiaLoading = ref(false)
const energiaError = ref(null)

const loadEnergiaData = async (entityName = null, year = null) => {
  console.log('🔋 [Energía] ========== INICIANDO CARGA ==========')
  console.log('🔋 [Energía] Entity:', entityName, '| Year:', year)
  
  try {
    energiaLoading.value = true
    energiaError.value = null
    
    if (!entityName) {
      console.log('🔋 [Energía] Sin entidad, saliendo...')
      energiaValue.value = 0
      energiaPercentage.value = 0
      energiaLoading.value = false
      return
    }
    
    const mapping = getMapping('energia')
    console.log('🔋 [Energía] Mapping:', mapping)
    
    // ✅ USAR HOJA FIJA '2024' - NO año dinámico
    const sheetName = '2024'
    console.log('🔋 [Energía] Sheet name:', sheetName)
    
    const rawData = await fetchData('energia', sheetName)
    console.log('🔋 [Energía] Datos obtenidos:', rawData.length, 'filas')
    
    if (rawData.length > 0) {
      console.log('🔋 [Energía] Primera fila:', rawData[0])
      console.log('🔋 [Energía] Columnas disponibles:', Object.keys(rawData[0]))
    }
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos')
    }
    
    // Calcular valor máximo
    const maxValue = rawData.reduce((max, row) => {
      const value = parseFloat(row[mapping.valueColumn]) || 0
      return value > max ? value : max
    }, 0)
    console.log('🔋 [Energía] Valor máximo encontrado:', maxValue)
    
    // Buscar entidad
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    console.log('🔋 [Energía] Buscando entidad:', entityName)
    console.log('🔋 [Energía] Fila encontrada:', entityRow)
    
    if (entityRow) {
      const entityValue = parseFloat(entityRow[mapping.valueColumn]) || 0
      energiaValue.value = entityValue
      
      if (maxValue > 0) {
        energiaPercentage.value = (entityValue / maxValue) * 100
      } else {
        energiaPercentage.value = 0
      }
      
      console.log(`⚡ [Energía] ${entityName}: ${entityValue.toLocaleString()} GWh (${energiaPercentage.value.toFixed(1)}%)`)
    } else {
      console.log('🔋 [Energía] ⚠️ No se encontró la entidad en los datos')
      energiaValue.value = 0
      energiaPercentage.value = 0
    }
    
  } catch (err) {
    console.error('❌ [Energía] Error:', err)
    energiaError.value = err.message
  } finally {
    energiaLoading.value = false
    console.log('🔋 [Energía] ========== CARGA FINALIZADA ==========')
    console.log('🔋 [Energía] Valor final:', energiaValue.value)
    console.log('🔋 [Energía] Porcentaje final:', energiaPercentage.value)
  }
}

// ============================================
// ÁREAS NATURALES PROTEGIDAS
// ============================================
const areasNaturalesData = ref([])
const areasLoading = ref(false)
const areasError = ref(null)

const loadAreasNaturalesData = async (entityName = null, year = null) => {
  try {
    areasLoading.value = true
    areasError.value = null
    
    if (!entityName) {
      areasNaturalesData.value = []
      areasLoading.value = false
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('areasNaturales')
    const sheetName = getSheetName('areasNaturales')
    const rawData = await fetchData('areasNaturales', sheetName)
    
    if (rawData.length === 0) {
      throw new Error('No se obtuvieron datos del Google Sheet')
    }
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (!entityRow) {
      areasNaturalesData.value = []
      areasLoading.value = false
      return
    }
    
    const transformedData = mapping.variables.map(variable => ({
      key: variable.key,
      label: variable.label,
      value: parseFloat(entityRow[variable.column]) || 0,
      color: variable.color,
      colorClass: variable.colorClass || 'default',
      active: false
    }))
    
    areasNaturalesData.value = transformedData
    
  } catch (err) {
    console.error('❌ [Áreas Naturales] Error:', err)
    areasError.value = err.message
  } finally {
    areasLoading.value = false
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
  console.log('👀 [AmbientalesView] Entity cambió a:', newEntity)
  loadIncendiosData(newEntity, props.selectedYear)
  loadResiduosData(newEntity, props.selectedYear)
  loadEmisionesData(newEntity, props.selectedYear)
  loadEnergiaData(newEntity, props.selectedYear)
  loadAreasNaturalesData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear) => {
  console.log('👀 [AmbientalesView] Year cambió a:', newYear)
  if (props.selectedEntity) {
    loadIncendiosData(props.selectedEntity, newYear)
    loadResiduosData(props.selectedEntity, newYear)
    loadEmisionesData(props.selectedEntity, newYear)
    loadEnergiaData(props.selectedEntity, newYear)
    loadAreasNaturalesData(props.selectedEntity, newYear)
  }
}, { immediate: false })

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  console.log('🚀 [AmbientalesView] Montado')
  console.log('🚀 [AmbientalesView] selectedEntity:', props.selectedEntity)
  console.log('🚀 [AmbientalesView] selectedYear:', props.selectedYear)
  
  if (props.selectedEntity) {
    await Promise.all([
      loadIncendiosData(props.selectedEntity, props.selectedYear),
      loadResiduosData(props.selectedEntity, props.selectedYear),
      loadEmisionesData(props.selectedEntity, props.selectedYear),
      loadEnergiaData(props.selectedEntity, props.selectedYear),
      loadAreasNaturalesData(props.selectedEntity, props.selectedYear)
    ])
  }
})
</script>

<style scoped>
.ambientales-container {
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

/* ✅ Card Incendios Forestales */
.incendios-card {
  height: 75%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.incendios-body {
  flex: 1;
  overflow: hidden;
  background: white;
}

/* ✅ Header oscuro genérico */
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
}

.bar-graph {
  height: 75%;
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

/* Card de Residuos Sólidos */
.bottle-card {
  height: 25%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.bottle-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  border-bottom: 1px solid #3b6b8a;
  flex-shrink: 0;
}

.bottle-header-icon {
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

.bottle-header-icon svg {
  width: 12px;
  height: 12px;
}

.bottle-header-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: white;
  line-height: 1.1;
  letter-spacing: 0.1px;
}

.bottle-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  padding: 6px 10px;
  gap: 10px;
  background: white;
  align-items: center;
  min-height: 0;
}

.bottle-graph-container {
  flex: 1;
  height: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 60px;
}

.bottle-values {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 65px;
  padding: 4px 6px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.bottle-value-item {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.bottle-value-number {
  font-family: 'Segoe UI', Verdana, Geneva, Tahoma, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #1e3a5f;
}

.bottle-value-unit {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
}

.bottle-value-item.percentage .bottle-value-number {
  color: #2563eb;
}

.bottle-value-divider {
  width: 30px;
  height: 1px;
  background: #e2e8f0;
}

h2 {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  color: #535353;
  font-size: 14px;
  margin: 0;
}

.number {
  width: 35%;
  color: #58778F;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.right-card-container {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  gap: 10px;
}

.top-right-card-container {
  display: flex;
  flex-direction: row;
  border-radius: 12px;
  height: 50%;
  gap: 10px;
}

/* Card Emisiones */
.emisiones-card {
  width: 65%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.emisiones-body {
  flex: 1;
  padding: 5px;
  background: white;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card Energía */
.energia-card {
  width: 35%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.energia-body {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.gauge-graph {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.gauge-number {
  padding: 5px;
  width: 100%;
  color: #1e3a5f;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bottom-right-card-container {
  height: 50%;
  border-radius: 12px;
}

/* Card Áreas Naturales */
.areas-card {
  height: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.areas-body {
  flex: 1;
  background: white;
  overflow: hidden;
}
</style>