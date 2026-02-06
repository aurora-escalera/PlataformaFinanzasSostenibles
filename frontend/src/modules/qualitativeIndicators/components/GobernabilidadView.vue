<!-- src/modules/qualitativeIndicators/components/GobernabilidadView.vue -->
<!-- ✅ VERSIÓN COMPACTA - Todo ajustado al espacio disponible -->
<template>
  <div class="gobernabilidad-container">
    <!-- ✅ EMPTY STATE -->
    <div v-if="!selectedEntity" class="global-empty-state">
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#718096" stroke-width="1.5">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
        </div>
        <h2 class="empty-state-title">Selecciona una entidad</h2>
        <p class="empty-state-description">
          Selecciona una entidad federativa para ver los indicadores de gobernabilidad.
        </p>
      </div>
    </div>

    <!-- ✅ CONTENIDO -->
    <div v-else class="card-body">
      
      <!-- HEADER PRINCIPAL -->
      <div class="main-header">
        <div class="header-left">
          <div class="header-icon-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="header-info">
            <span class="header-title">Gobernabilidad y Transparencia {{ selectedYear }}</span>
            <span class="header-subtitle">{{ selectedEntity }}</span>
          </div>
        </div>

        <div class="header-right">
          <div v-for="(item, idx) in headerIndicators" :key="idx" class="mini-donut-container">
            <div class="mini-donut">
              <svg width="32" height="32" class="donut-svg">
                <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5" />
                <circle 
                  cx="16" cy="16" r="12" 
                  fill="none" 
                  stroke="white" 
                  stroke-width="2.5"
                  :stroke-dasharray="75.4"
                  :stroke-dashoffset="75.4 - (item.value / 100) * 75.4"
                  stroke-linecap="round"
                  class="progress-ring"
                />
              </svg>
              <span class="donut-value">{{ Math.round(item.value) }}</span>
            </div>
            <span class="mini-donut-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- FILA SUPERIOR (3 Secciones) -->
      <div class="top-row">
        
        <!-- SATISFACCIÓN CIUDADANA -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span class="section-title">Satisfacción Ciudadana</span>
            </div>
            <span class="section-value">{{ avgSatisfaccion }}%</span>
          </div>

          <div v-if="satisfaccionLoading" class="section-content loading-state">
            <div class="spinner"></div>
          </div>

          <div v-else class="section-content satisfaccion-content">
            <div class="bars-container">
              <div class="bar-column">
                <span class="bar-value-text federal-color">{{ satisfaccionFederal }}%</span>
                <div class="bar-track">
                  <div class="bar-fill federal-fill" :style="{ height: satisfaccionFederal + '%' }"></div>
                </div>
                <div class="bar-label">
                  <span class="dot federal-dot"></span>
                  <span>Federal</span>
                </div>
              </div>

              <div class="separator">
                <div class="sep-line"></div>
                <span class="sep-text">vs</span>
                <div class="sep-line"></div>
              </div>

              <div class="bar-column">
                <span class="bar-value-text estatal-color">{{ satisfaccionEstatal }}%</span>
                <div class="bar-track">
                  <div class="bar-fill estatal-fill" :style="{ height: satisfaccionEstatal + '%' }"></div>
                </div>
                <div class="bar-label">
                  <span class="dot estatal-dot"></span>
                  <span>Estatal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ÍNDICES DE GOBIERNO -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <span class="section-title">Índices de Gobierno</span>
            </div>
          </div>

          <div v-if="indicesLoading" class="section-content loading-state">
            <div class="spinner"></div>
          </div>

          <div v-else class="section-content indices-content">
            <!-- IGOPP -->
            <div class="indice-row">
              <div class="indice-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>
                </svg>
              </div>
              <div class="indice-content">
                <div class="indice-header">
                  <span class="indice-label">IGOPP</span>
                  <span class="indice-value">{{ igoppValue }}</span>
                </div>
                <div class="indice-bar">
                  <div class="indice-bar-fill" :style="{ width: igoppValue + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- BIPE -->
            <div class="indice-row">
              <div class="indice-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div class="indice-content">
                <div class="indice-header">
                  <span class="indice-label">BIPE</span>
                  <span class="indice-value">{{ bipeValue }}</span>
                </div>
                <div class="indice-bar">
                  <div class="indice-bar-fill" :style="{ width: bipeValue + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- ITDIF -->
            <div class="indice-row">
              <div class="indice-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div class="indice-content">
                <div class="indice-header">
                  <span class="indice-label">ITDIF</span>
                  <span class="indice-value">{{ itdifValue }}</span>
                </div>
                <div class="indice-bar">
                  <div class="indice-bar-fill" :style="{ width: Math.min(itdifValue, 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PbR-SED -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <span class="section-title">PbR-SED</span>
            </div>
          </div>

          <div v-if="pbrsedLoading" class="section-content loading-state">
            <div class="spinner"></div>
          </div>

          <div v-else class="section-content pbrsed-content">
            <div class="pbrsed-grid">
              <!-- PBRSED -->
              <div class="pbrsed-card">
                <div class="pbrsed-icon-wrapper">
                  <div class="pbrsed-icon-bg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="2">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </div>
                  <div class="pbrsed-mini-ring">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <circle cx="8" cy="8" r="6" fill="white" stroke="#e5e7eb" stroke-width="1.5"/>
                      <circle 
                        cx="8" cy="8" r="5" 
                        fill="none" stroke="#0F3759" stroke-width="1.5"
                        :stroke-dasharray="31.4"
                        :stroke-dashoffset="31.4 - (pbrsedValue / 100) * 31.4"
                        stroke-linecap="round"
                        transform="rotate(-90 8 8)"
                      />
                    </svg>
                  </div>
                </div>
                <span class="pbrsed-value">{{ pbrsedValue }}</span>
                <span class="pbrsed-label">PBRSED</span>
              </div>

              <!-- DIAGNÓSTICO -->
              <div class="pbrsed-card">
                <div class="pbrsed-icon-wrapper">
                  <div class="pbrsed-icon-bg" :class="diagnosticoBgClass">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="diagnosticoIconColor" stroke-width="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1"/>
                      <path d="M9 14l2 2 4-4"/>
                    </svg>
                  </div>
                </div>
                <span class="pbrsed-value diagnostico-text" :class="diagnosticoClass">{{ diagnosticoValue }}</span>
                <span class="pbrsed-label">DIAGNÓSTICO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FILA INFERIOR - ICI -->
      <div class="bottom-row">
        <div class="section-card ici-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <span class="section-title">ICI</span>
            </div>
            <span class="section-value">{{ iciGeneral }}</span>
          </div>

          <div v-if="iciLoading" class="section-content loading-state">
            <div class="spinner"></div>
          </div>

          <div v-else class="section-content ici-content">
            <!-- ICI General -->
            <div class="ici-row">
              <div class="ici-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="8" y1="15" x2="8" y2="9"/><line x1="12" y1="15" x2="12" y2="7"/><line x1="16" y1="15" x2="16" y2="11"/>
                </svg>
              </div>
              <span class="ici-label">ICI General</span>
              <div class="ici-bar-container">
                <div class="ici-bar">
                  <div class="ici-bar-fill" :style="{ width: Math.min(iciGeneral, 100) + '%' }">
                    <span class="ici-bar-value">{{ iciGeneral }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Consistencia -->
            <div class="ici-row">
              <div class="ici-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
                  <path d="M3 6l2 2 4-4"/><path d="M3 12l2 2 4-4"/><path d="M3 18l2 2 4-4"/>
                </svg>
              </div>
              <span class="ici-label">Consistencia</span>
              <div class="ici-bar-container">
                <div class="ici-bar">
                  <div class="ici-bar-fill" :style="{ width: Math.min(iciConsistencia, 100) + '%' }">
                    <span class="ici-bar-value">{{ iciConsistencia }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Proyectos -->
            <div class="ici-row">
              <div class="ici-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span class="ici-label">Proyectos</span>
              <div class="ici-bar-container">
                <div class="ici-bar">
                  <div class="ici-bar-fill" :style="{ width: Math.min(iciProyectos, 100) + '%' }">
                    <span class="ici-bar-value">{{ iciProyectos }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Indicadores -->
            <div class="ici-row">
              <div class="ici-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F3759" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <span class="ici-label">Indicadores</span>
              <div class="ici-bar-container">
                <div class="ici-bar">
                  <div class="ici-bar-fill" :style="{ width: Math.min(iciIndicadores, 100) + '%' }">
                    <span class="ici-bar-value">{{ iciIndicadores }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
// UTILIDADES
// ============================================
const parseNumericValue = (value) => {
  if (typeof value === 'number') return value
  if (!value || value === '' || value === 'NA' || value === 'ND') return 0
  
  let stringValue = String(value).trim()
  stringValue = stringValue.replace(/\s/g, '')
  stringValue = stringValue.replace(/,/g, '')
  
  const result = parseFloat(stringValue)
  return isNaN(result) ? 0 : result
}

// ============================================
// SATISFACCIÓN CIUDADANA
// ============================================
const satisfaccionFederal = ref(0)
const satisfaccionEstatal = ref(0)
const satisfaccionLoading = ref(false)

const avgSatisfaccion = computed(() => {
  return ((satisfaccionFederal.value + satisfaccionEstatal.value) / 2).toFixed(1)
})

const loadSatisfaccionData = async (entityName, year) => {
  try {
    satisfaccionLoading.value = true
    
    if (!entityName) {
      satisfaccionFederal.value = 0
      satisfaccionEstatal.value = 0
      return
    }
    
    if (year) setActiveYear(year)
    
    const mappingFederal = getMapping('satisfaccionFederal')
    const sheetNameFederal = getSheetName('satisfaccionFederal')
    const rawDataFederal = await fetchData('satisfaccionFederal', sheetNameFederal)
    
    const mappingEstatal = getMapping('satisfaccionEstatal')
    const sheetNameEstatal = getSheetName('satisfaccionEstatal')
    const rawDataEstatal = await fetchData('satisfaccionEstatal', sheetNameEstatal)
    
    const entityRowFederal = rawDataFederal.find(row => row[mappingFederal.categoryColumn] === entityName)
    const entityRowEstatal = rawDataEstatal.find(row => row[mappingEstatal.categoryColumn] === entityName)
    
    satisfaccionFederal.value = entityRowFederal ? parseNumericValue(entityRowFederal[mappingFederal.variables[0].column]) : 0
    satisfaccionEstatal.value = entityRowEstatal ? parseNumericValue(entityRowEstatal[mappingEstatal.variables[0].column]) : 0
    
  } catch (err) {
    console.error('❌ [Satisfacción] Error:', err)
  } finally {
    satisfaccionLoading.value = false
  }
}

// ============================================
// ÍNDICES DE GOBIERNO
// ============================================
const igoppValue = ref(0)
const bipeValue = ref(0)
const itdifValue = ref(0)
const indicesLoading = ref(false)

const headerIndicators = computed(() => [
  { label: 'IGOPP', value: igoppValue.value },
  { label: 'BIPE', value: bipeValue.value },
  { label: 'ITDIF', value: itdifValue.value }
])

const loadIndicesData = async (entityName, year) => {
  try {
    indicesLoading.value = true
    
    if (!entityName) {
      igoppValue.value = 0
      bipeValue.value = 0
      itdifValue.value = 0
      return
    }
    
    if (year) setActiveYear(year)
    
    const mappingIGOPP = getMapping('IGOPP')
    const sheetNameIGOPP = getSheetName('IGOPP')
    const rawDataIGOPP = await fetchData('IGOPP', sheetNameIGOPP)
    const entityRowIGOPP = rawDataIGOPP.find(row => row[mappingIGOPP.categoryColumn] === entityName)
    igoppValue.value = entityRowIGOPP ? parseNumericValue(entityRowIGOPP[mappingIGOPP.variables[0].column]) : 0
    
    const mappingBIPE = getMapping('BIPE')
    const sheetNameBIPE = getSheetName('BIPE')
    const rawDataBIPE = await fetchData('BIPE', sheetNameBIPE)
    const entityRowBIPE = rawDataBIPE.find(row => row[mappingBIPE.categoryColumn] === entityName)
    bipeValue.value = entityRowBIPE ? parseNumericValue(entityRowBIPE[mappingBIPE.variables[0].column]) : 0
    
    const mappingITDIF = getMapping('ITDIF')
    const sheetNameITDIF = getSheetName('ITDIF')
    const rawDataITDIF = await fetchData('ITDIF', sheetNameITDIF)
    const entityRowITDIF = rawDataITDIF.find(row => row[mappingITDIF.categoryColumn] === entityName)
    itdifValue.value = entityRowITDIF ? parseNumericValue(entityRowITDIF[mappingITDIF.variables[0].column]) : 0
    
  } catch (err) {
    console.error('❌ [Índices] Error:', err)
  } finally {
    indicesLoading.value = false
  }
}

// ============================================
// ICI
// ============================================
const iciGeneral = ref(0)
const iciConsistencia = ref(0)
const iciProyectos = ref(0)
const iciIndicadores = ref(0)
const iciLoading = ref(false)

const loadICIData = async (entityName, year) => {
  try {
    iciLoading.value = true
    
    if (!entityName) {
      iciGeneral.value = 0
      iciConsistencia.value = 0
      iciProyectos.value = 0
      iciIndicadores.value = 0
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('ICI')
    const sheetName = getSheetName('ICI')
    const rawData = await fetchData('ICI', sheetName)
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      iciGeneral.value = parseNumericValue(entityRow[mapping.variables[0].column])
      iciConsistencia.value = parseNumericValue(entityRow[mapping.variables[1].column])
      iciProyectos.value = parseNumericValue(entityRow[mapping.variables[2].column])
      iciIndicadores.value = parseNumericValue(entityRow[mapping.variables[3].column])
    }
    
  } catch (err) {
    console.error('❌ [ICI] Error:', err)
  } finally {
    iciLoading.value = false
  }
}

// ============================================
// PbR-SED
// ============================================
const pbrsedValue = ref(0)
const diagnosticoValue = ref('N/A')
const pbrsedLoading = ref(false)

const diagnosticoClass = computed(() => {
  const value = diagnosticoValue.value.toLowerCase()
  if (value.includes('alto') && !value.includes('medio')) return 'diagnostico-alto'
  if (value.includes('medio')) return 'diagnostico-medio'
  if (value.includes('bajo')) return 'diagnostico-bajo'
  return ''
})

const diagnosticoBgClass = computed(() => {
  const value = diagnosticoValue.value.toLowerCase()
  if (value.includes('alto') && !value.includes('medio')) return 'diagnostico-bg-alto'
  if (value.includes('medio')) return 'diagnostico-bg-medio'
  if (value.includes('bajo')) return 'diagnostico-bg-bajo'
  return 'diagnostico-bg-default'
})

const diagnosticoIconColor = computed(() => {
  const value = diagnosticoValue.value.toLowerCase()
  if (value.includes('alto') && !value.includes('medio')) return '#059669'
  if (value.includes('medio')) return '#d97706'
  if (value.includes('bajo')) return '#dc2626'
  return '#0F3759'
})

const loadPBRSEDData = async (entityName, year) => {
  try {
    pbrsedLoading.value = true
    
    if (!entityName) {
      pbrsedValue.value = 0
      diagnosticoValue.value = 'N/A'
      return
    }
    
    if (year) setActiveYear(year)
    
    const mapping = getMapping('PBRSED')
    const sheetName = getSheetName('PBRSED')
    const rawData = await fetchData('PBRSED', sheetName)
    
    const entityRow = rawData.find(row => row[mapping.categoryColumn] === entityName)
    
    if (entityRow) {
      pbrsedValue.value = parseNumericValue(entityRow[mapping.variables[0].column])
      diagnosticoValue.value = entityRow[mapping.variables[1].column] || 'N/A'
    }
    
  } catch (err) {
    console.error('❌ [PBRSED] Error:', err)
  } finally {
    pbrsedLoading.value = false
  }
}

// ============================================
// LOAD ALL DATA
// ============================================
const loadAllData = async (entityName, year) => {
  await Promise.all([
    loadSatisfaccionData(entityName, year),
    loadIndicesData(entityName, year),
    loadICIData(entityName, year),
    loadPBRSEDData(entityName, year)
  ])
}

// ============================================
// WATCHERS
// ============================================
watch(() => props.selectedEntity, (newEntity) => {
  loadAllData(newEntity, props.selectedYear)
}, { immediate: false })

watch(() => props.selectedYear, (newYear) => {
  if (props.selectedEntity) {
    loadAllData(props.selectedEntity, newYear)
  }
}, { immediate: false })

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  loadAllData(props.selectedEntity, props.selectedYear)
})
</script>

<style scoped>
.gobernabilidad-container {
  background-color: white;
  border-radius: 15px;
  height: 100%;
  width: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* EMPTY STATE */
.global-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 250px;
}

.empty-state-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 50%;
}

.empty-state-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.empty-state-description {
  font-size: 11px;
  color: #718096;
  margin: 0;
  line-height: 1.4;
}

/* CARD BODY */
.card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

/* MAIN HEADER */
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.header-subtitle {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.header-right {
  display: flex;
  gap: 10px;
}

.mini-donut-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.mini-donut {
  position: relative;
  width: 32px;
  height: 32px;
}

.donut-svg {
  transform: rotate(-90deg);
}

.progress-ring {
  transition: stroke-dashoffset 0.8s ease-out;
}

.donut-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  color: white;
}

.mini-donut-label {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

/* ROWS */
.top-row {
  display: flex;
  gap: 6px;
  height: 36%;
  min-height: 0;
}

.bottom-row {
  flex: 1;
  min-height: 0;
}

/* SECTION CARD */
.section-card {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ici-card {
  flex: none;
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: linear-gradient(135deg, #0F3759 0%, #1a4d7a 100%);
  flex-shrink: 0;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.section-icon-badge {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 10px;
  font-weight: 600;
  color: white;
}

.section-value {
  font-size: 11px;
  font-weight: 700;
  color: white;
}

.section-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* SATISFACCIÓN CIUDADANA */
.satisfaccion-content {
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  height: 100%;
  padding: 4px 0;
}

.bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-value-text {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 2px;
}

.federal-color { color: #0F3759; }
.estatal-color { color: #6B8FA3; }

.bar-track {
  width: 28px;
  flex: 1;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  min-height: 40px;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 3px;
  transition: height 0.8s ease-out;
}

.federal-fill { background: #0F3759; }
.estatal-fill { background: #6B8FA3; }

.bar-label {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.federal-dot { background: #0F3759; }
.estatal-dot { background: #6B8FA3; }

.separator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40px;
  gap: 2px;
}

.sep-line {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
}

.sep-text {
  font-size: 7px;
  color: #cbd5e1;
}

/* ÍNDICES DE GOBIERNO */
.indices-content {
  background: #f8fafc;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.indice-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border-radius: 5px;
  padding: 5px 8px;
  border: 1px solid #f1f5f9;
}

.indice-icon {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.indice-content {
  flex: 1;
  min-width: 0;
}

.indice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
}

.indice-label {
  font-size: 11px;
  font-weight: 600;
  color: #0F3759;
}

.indice-value {
  font-size: 12px;
  font-weight: 700;
  color: #0F3759;
}

.indice-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.indice-bar-fill {
  height: 100%;
  background: #0F3759;
  border-radius: 2px;
  transition: width 0.8s ease-out;
}

/* PbR-SED */
.pbrsed-content {
  background: #f8fafc;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pbrsed-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  width: 100%;
  height: 100%;
}

.pbrsed-card {
  background: white;
  border-radius: 8px;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.pbrsed-icon-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
}

.pbrsed-icon-bg {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(135deg, #e8f4fc 0%, #d1e9f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.diagnostico-bg-default {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
}

.diagnostico-bg-alto {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.diagnostico-bg-medio {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.diagnostico-bg-bajo {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.pbrsed-mini-ring {
  position: absolute;
  top: -3px;
  right: -3px;
}

.pbrsed-value {
  font-size: 16px;
  font-weight: 700;
  color: #0F3759;
}

.diagnostico-text {
  font-size: 12px;
  font-weight: 600;
}

.diagnostico-alto { color: #059669; }
.diagnostico-medio { color: #d97706; }
.diagnostico-bajo { color: #dc2626; }

.pbrsed-label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* ICI */
.ici-content {
  background: white;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 6px;
  height: 100%;
}

.ici-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ici-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ici-label {
  width: 75px;
  flex-shrink: 0;
  font-size: 12px;
  color: #64748b;
}

.ici-bar-container {
  flex: 1;
  min-width: 0;
}

.ici-bar {
  height: 22px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.ici-bar-fill {
  height: 100%;
  background: #0F3759;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: width 0.8s ease-out;
  min-width: 40px;
}

.ici-bar-value {
  font-size: 10px;
  font-weight: 700;
  color: white;
}

/* LOADING STATE */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #0F3759;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>