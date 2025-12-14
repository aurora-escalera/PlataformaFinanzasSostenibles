<!-- src/modules/charts/components/RegionalChartsComponent.vue -->
<!-- ✅ MODIFICADO: Agregado botón de exportación en cada card -->
<template>
  <div class="charts-wrapper" :class="{ 'single-card': showingSingleCard }">

    <!-- CARD 1: INGRESOS -->
    <div v-if="!selectedVariable || selectedVariable.key === 'IS' || selectedVariable.key === 'IIC'" class="chart-card">
      <div class="chart-card-header">
        <h4 class="card-title">{{ cardTitleIngresos }}</h4>
        <!-- ✅ Botón circular de exportación para toda la card -->
        <div class="export-wrapper-card" ref="exportIngresosCardRef">
          <button class="export-btn-card" @click.stop="toggleCardExportMenu('ingresos')" title="Exportar datos de Ingresos">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <transition name="dropdown-fade">
            <div v-if="activeCardExportMenu === 'ingresos'" class="export-dropdown-card">
              <button class="export-option" @click="handleCardExport('xlsx', 'ingresos')">
                <span class="option-icon xlsx">XLS</span>
                <span>Excel</span>
              </button>
              <button class="export-option" @click="handleCardExport('csv', 'ingresos')">
                <span class="option-icon csv">CSV</span>
                <span>CSV</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
      
      <div class="chart-card-body">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando datos...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <p>Error: {{ error }}</p>
        </div>
        
        <!-- BarChart -->
        <div v-else class="chart-col-bar">
          <BarChart 
            :data="ingresosData"
            :title="ingresosTitleDynamic"
            headerTitle="Análisis de Ingresos Regionales"
            :selectedState="'Regional'"
            :selectedYear="selectedYear"
            currency="USD"
          />
        </div>
        
        <!-- Donas derecha -->
        <div v-if="!loading && !error" class="chart-col-donuts" :class="{ 'single-donut': showingSingleDonutIngresos }">
          <!-- IS - Ingresos Sostenibles -->
          <div v-if="!selectedVariable || selectedVariable.key === 'IS'" class="donut-item">
            <div class="donut-header-dark">
              <div class="donut-header-icon green">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="donut-header-title">Componentes de Ingresos Sostenibles</span>
              
              <!-- ✅ Botón de exportación -->
              <div class="export-wrapper-donut" ref="exportISRef">
                <button class="export-btn-donut" @click.stop="toggleExportMenu('IS')" title="Exportar datos">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <transition name="dropdown-fade">
                  <div v-if="activeExportMenu === 'IS'" class="export-dropdown-donut">
                    <button class="export-option" @click="handleDonutExport('xlsx', 'IS')">
                      <span class="option-icon xlsx">XLS</span>
                      <span>Excel</span>
                    </button>
                    <button class="export-option" @click="handleDonutExport('csv', 'IS')">
                      <span class="option-icon csv">CSV</span>
                      <span>CSV</span>
                    </button>
                  </div>
                </transition>
              </div>
            </div>
            
            <!-- Estado sin datos para IS -->
            <div v-if="isISDataEmpty" class="no-data-state green">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">
                No se registraron ingresos en los sectores de <strong>Ingresos Sostenibles</strong> para el año <strong>{{ selectedYear || 'seleccionado' }}</strong>
              </p>
            </div>
            
            <!-- DonutChart normal cuando hay datos -->
            <DonutChart 
              v-else-if="sectoresIngresosSostenibles.length > 0"
              :key="`is-regional-${props.selectedYear}-${sectoresIngresosSostenibles.length}`"
              :data="donutIngresosSostenibles"
              title="IS"
              :subtitle="subtitleIngresosSostenibles"
              :size="220"
              :variables="variablesIngresosSostenibles"
              :sectors="sectoresIngresosSostenibles"
              currency="USD"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
          
          <!-- IIC - Ingresos Intensivos en Carbono -->
          <div v-if="!selectedVariable || selectedVariable.key === 'IIC'" class="donut-item">
            <div class="donut-header-dark red">
              <div class="donut-header-icon red">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="donut-header-title">Componentes de Ingresos Intensivos en Carbono</span>
              
              <!-- ✅ Botón de exportación -->
              <div class="export-wrapper-donut">
                <button class="export-btn-donut" @click.stop="toggleExportMenu('IIC')" title="Exportar datos">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <transition name="dropdown-fade">
                  <div v-if="activeExportMenu === 'IIC'" class="export-dropdown-donut">
                    <button class="export-option" @click="handleDonutExport('xlsx', 'IIC')">
                      <span class="option-icon xlsx">XLS</span>
                      <span>Excel</span>
                    </button>
                    <button class="export-option" @click="handleDonutExport('csv', 'IIC')">
                      <span class="option-icon csv">CSV</span>
                      <span>CSV</span>
                    </button>
                  </div>
                </transition>
              </div>
            </div>
            
            <!-- Estado sin datos para IIC -->
            <div v-if="isIICDataEmpty" class="no-data-state red">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">
                No se registraron ingresos en los sectores de <strong>Ingresos Intensivos en Carbono</strong> para el año <strong>{{ selectedYear || 'seleccionado' }}</strong>
              </p>
            </div>
            
            <!-- DonutChart normal cuando hay datos -->
            <DonutChart 
              v-else-if="sectoresIngresosCarbono.length > 0"
              :key="`iic-regional-${props.selectedYear}-${sectoresIngresosCarbono.length}`"
              :data="donutIngresosCarbono"
              title="IIC"
              :subtitle="subtitleIngresosCarbono"
              :size="220"
              :variables="variablesIngresosCarbono"
              :sectors="sectoresIngresosCarbono"
              currency="USD"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CARD 2: PRESUPUESTOS -->
    <div v-if="!selectedVariable || selectedVariable.key === 'PS' || selectedVariable.key === 'PIC'" class="chart-card">
      <div class="chart-card-header">
        <h4 class="card-title">{{ cardTitlePresupuestos }}</h4>
        <!-- ✅ Botón circular de exportación para toda la card -->
        <div class="export-wrapper-card" ref="exportPresupuestosCardRef">
          <button class="export-btn-card" @click.stop="toggleCardExportMenu('presupuestos')" title="Exportar datos de Presupuestos">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <transition name="dropdown-fade">
            <div v-if="activeCardExportMenu === 'presupuestos'" class="export-dropdown-card">
              <button class="export-option" @click="handleCardExport('xlsx', 'presupuestos')">
                <span class="option-icon xlsx">XLS</span>
                <span>Excel</span>
              </button>
              <button class="export-option" @click="handleCardExport('csv', 'presupuestos')">
                <span class="option-icon csv">CSV</span>
                <span>CSV</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
      
      <div class="chart-card-body">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando datos...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <p>Error: {{ error }}</p>
        </div>
        
        <!-- BarChart -->
        <div v-else class="chart-col-bar">
          <BarChart 
            :data="presupuestosData"
            :title="presupuestosTitleDynamic"
            headerTitle="Análisis de Presupuestos Regionales"
            :selectedState="'Regional'"
            :selectedYear="selectedYear"
            currency="USD"
          />
        </div>
        
        <!-- Donas derecha -->
        <div v-if="!loading && !error" class="chart-col-donuts" :class="{ 'single-donut': showingSingleDonutPresupuestos }">
          <!-- PS - Presupuestos Sostenibles -->
          <div v-if="!selectedVariable || selectedVariable.key === 'PS'" class="donut-item">
            <div class="donut-header-dark green">
              <div class="donut-header-icon green">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span class="donut-header-title">Componentes de Presupuestos Sostenibles</span>
              
              <!-- ✅ Botón de exportación -->
              <div class="export-wrapper-donut">
                <button class="export-btn-donut" @click.stop="toggleExportMenu('PS')" title="Exportar datos">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <transition name="dropdown-fade">
                  <div v-if="activeExportMenu === 'PS'" class="export-dropdown-donut">
                    <button class="export-option" @click="handleDonutExport('xlsx', 'PS')">
                      <span class="option-icon xlsx">XLS</span>
                      <span>Excel</span>
                    </button>
                    <button class="export-option" @click="handleDonutExport('csv', 'PS')">
                      <span class="option-icon csv">CSV</span>
                      <span>CSV</span>
                    </button>
                  </div>
                </transition>
              </div>
            </div>
            
            <!-- Estado sin datos para PS -->
            <div v-if="isPSDataEmpty" class="no-data-state green">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">
                No se registraron egresos en los sectores de <strong>Presupuestos Sostenibles</strong> para el año <strong>{{ selectedYear || 'seleccionado' }}</strong>
              </p>
            </div>
            
            <!-- DonutChart normal cuando hay datos -->
            <DonutChart 
              v-else-if="sectoresPresupuestosSostenibles.length > 0"
              :key="`ps-regional-${props.selectedYear}-${sectoresPresupuestosSostenibles.length}`"
              :data="donutPresupuestosSostenibles"
              title="PS"
              :subtitle="subtitlePresupuestosSostenibles"
              :size="220"
              :variables="variablesPresupuestosSostenibles"
              :sectors="sectoresPresupuestosSostenibles"
              currency="USD"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
          
          <!-- PIC - Presupuestos Intensivos en Carbono -->
          <div v-if="!selectedVariable || selectedVariable.key === 'PIC'" class="donut-item">
            <div class="donut-header-dark red">
              <div class="donut-header-icon red">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="donut-header-title">Componentes de Presupuestos Intensivos en Carbono</span>
              
              <!-- ✅ Botón de exportación -->
              <div class="export-wrapper-donut">
                <button class="export-btn-donut" @click.stop="toggleExportMenu('PIC')" title="Exportar datos">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <transition name="dropdown-fade">
                  <div v-if="activeExportMenu === 'PIC'" class="export-dropdown-donut">
                    <button class="export-option" @click="handleDonutExport('xlsx', 'PIC')">
                      <span class="option-icon xlsx">XLS</span>
                      <span>Excel</span>
                    </button>
                    <button class="export-option" @click="handleDonutExport('csv', 'PIC')">
                      <span class="option-icon csv">CSV</span>
                      <span>CSV</span>
                    </button>
                  </div>
                </transition>
              </div>
            </div>
            
            <!-- Estado sin datos para PIC -->
            <div v-if="isPICDataEmpty" class="no-data-state red">
              <div class="no-data-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <h3 class="no-data-title">Sin datos disponibles</h3>
              <p class="no-data-text">
                No se registraron egresos en los sectores de <strong>Presupuestos Intensivos en Carbono</strong> para el año <strong>{{ selectedYear || 'seleccionado' }}</strong>
              </p>
            </div>
            
            <!-- DonutChart normal cuando hay datos -->
            <DonutChart 
              v-else-if="sectoresPresupuestosCarbono.length > 0"
              :key="`pic-regional-${props.selectedYear}-${sectoresPresupuestosCarbono.length}`"
              :data="donutPresupuestosCarbono"
              title="PIC"
              :subtitle="subtitlePresupuestosCarbono"
              :size="220"
              :variables="variablesPresupuestosCarbono"
              :sectors="sectoresPresupuestosCarbono"
              currency="USD"
            />
            <div v-else class="no-data-message">Sin datos disponibles</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'
import { getCleanValue } from '@/composables/parseNumber'  
import { useExportData } from '@/composables/useExportData'
import BarChart from './BarChart.vue'
import DonutChart from './DonutChart.vue'

const props = defineProps({
  selectedYear: { type: String, default: null },
  selectedVariable: { type: Object, default: null },
  ifssData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['years-loaded'])

// ✅ NUEVO: Composable de exportación
const { exportRegionalChartsData } = useExportData()

const showingSingleCard = computed(() => !!props.selectedVariable)
const showingSingleDonutPresupuestos = computed(() => props.selectedVariable && (props.selectedVariable.key === 'PS' || props.selectedVariable.key === 'PIC'))
const showingSingleDonutIngresos = computed(() => props.selectedVariable && (props.selectedVariable.key === 'IS' || props.selectedVariable.key === 'IIC'))

const { fetchData, loading, error } = useStorageData()
const dataLoaded = ref(false)
const rawRegionalData = ref([])

const presupuestosMapping = getMapping('chartsPresupuestosRegional')
const ingresosMapping = getMapping('chartsIngresosRegional')

// Mapping para obtener posiciones y porcentajes
const cardIFSMapping = getMapping('cardIFSRegional')

// ============================================================================
// ✅ NUEVO: HANDLERS DE EXPORTACIÓN
// ============================================================================

const handleExportIngresos = (format) => {
  console.log('📥 [RegionalCharts] Exportando Ingresos en formato:', format)
  
  const sectoresData = {
    is: sectoresIngresosSostenibles.value,
    iic: sectoresIngresosCarbono.value
  }
  
  const success = exportRegionalChartsData(
    { variables: [] }, // No exportamos presupuestos aquí
    ingresosData.value,
    sectoresData,
    format,
    { year: props.selectedYear, variable: props.selectedVariable }
  )
  
  if (!success && exportIngresosRef.value) {
    exportIngresosRef.value.setError('Error al exportar los datos')
  }
}

const handleExportPresupuestos = (format) => {
  console.log('📥 [RegionalCharts] Exportando Presupuestos en formato:', format)
  
  const sectoresData = {
    ps: sectoresPresupuestosSostenibles.value,
    pic: sectoresPresupuestosCarbono.value
  }
  
  const success = exportRegionalChartsData(
    presupuestosData.value,
    { variables: [] }, // No exportamos ingresos aquí
    sectoresData,
    format,
    { year: props.selectedYear, variable: props.selectedVariable }
  )
  
  if (!success && exportPresupuestosRef.value) {
    exportPresupuestosRef.value.setError('Error al exportar los datos')
  }
}

// ============================================================================
// ✅ EXPORTACIÓN DE DONAS INDIVIDUALES
// ============================================================================

const activeExportMenu = ref(null)

const toggleExportMenu = (menuId) => {
  activeExportMenu.value = activeExportMenu.value === menuId ? null : menuId
}

// Click outside handler para cerrar menús (donut y card)
const handleClickOutside = (event) => {
  // Cerrar menús de donut
  if (activeExportMenu.value && !event.target.closest('.export-wrapper-donut')) {
    activeExportMenu.value = null
  }
  // Cerrar menús de card
  if (activeCardExportMenu.value && !event.target.closest('.export-wrapper-card')) {
    activeCardExportMenu.value = null
  }
}

// Variable para exportación de cards
const activeCardExportMenu = ref(null)

const toggleCardExportMenu = (menuId) => {
  activeCardExportMenu.value = activeCardExportMenu.value === menuId ? null : menuId
}

// Registrar evento de click outside (único para ambos tipos)
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleDonutExport = (format, chartType) => {
  console.log(`📥 [RegionalCharts] Exportando ${chartType} en formato:`, format)
  activeExportMenu.value = null
  
  let sectores = []
  let title = ''
  
  switch(chartType) {
    case 'IS':
      sectores = sectoresIngresosSostenibles.value
      title = 'Ingresos_Sostenibles'
      break
    case 'IIC':
      sectores = sectoresIngresosCarbono.value
      title = 'Ingresos_Intensivos_Carbono'
      break
    case 'PS':
      sectores = sectoresPresupuestosSostenibles.value
      title = 'Presupuestos_Sostenibles'
      break
    case 'PIC':
      sectores = sectoresPresupuestosCarbono.value
      title = 'Presupuestos_Intensivos_Carbono'
      break
  }
  
  if (!sectores || sectores.length === 0) {
    console.warn(`⚠️ No hay datos para exportar en ${chartType}`)
    return
  }
  
  // Preparar datos para exportación
  const exportData = sectores.map(sector => ({
    Sector: sector.label || sector.name || 'Sin nombre',
    Valor: sector.value || 0,
    Porcentaje: sector.percentage ? `${sector.percentage.toFixed(2)}%` : '0%'
  }))
  
  const fileName = `${title}_${props.selectedYear || 'todos'}`
  
  if (format === 'xlsx') {
    exportToExcel(exportData, fileName)
  } else {
    exportToCSV(exportData, fileName)
  }
}

// Funciones auxiliares de exportación
const exportToExcel = async (data, fileName) => {
  try {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Datos')
    XLSX.writeFile(wb, `${fileName}.xlsx`)
    console.log('✅ Excel exportado:', fileName)
  } catch (err) {
    console.error('❌ Error al exportar Excel:', err)
  }
}

const exportToCSV = (data, fileName) => {
  try {
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}.csv`
    link.click()
    console.log('✅ CSV exportado:', fileName)
  } catch (err) {
    console.error('❌ Error al exportar CSV:', err)
  }
}

// ============================================================================
// ✅ EXPORTACIÓN DE CARDS COMPLETAS (Botón en header)
// ============================================================================

const handleCardExport = (format, cardType) => {
  console.log(`📥 [RegionalCharts] Exportando card ${cardType} en formato:`, format)
  activeCardExportMenu.value = null
  
  let exportData = []
  let fileName = ''
  
  if (cardType === 'ingresos') {
    // Combinar datos de IS e IIC
    const isData = (sectoresIngresosSostenibles.value || []).map(s => ({
      Categoría: 'Ingresos Sostenibles',
      Sector: s.label || s.name || 'Sin nombre',
      Valor: s.value || 0,
      Porcentaje: s.percentage ? `${s.percentage.toFixed(2)}%` : '0%'
    }))
    
    const iicData = (sectoresIngresosCarbono.value || []).map(s => ({
      Categoría: 'Ingresos Intensivos en Carbono',
      Sector: s.label || s.name || 'Sin nombre',
      Valor: s.value || 0,
      Porcentaje: s.percentage ? `${s.percentage.toFixed(2)}%` : '0%'
    }))
    
    exportData = [...isData, ...iicData]
    fileName = `Ingresos_Regional_${props.selectedYear || 'todos'}`
  } else if (cardType === 'presupuestos') {
    // Combinar datos de PS y PIC
    const psData = (sectoresPresupuestosSostenibles.value || []).map(s => ({
      Categoría: 'Presupuestos Sostenibles',
      Sector: s.label || s.name || 'Sin nombre',
      Valor: s.value || 0,
      Porcentaje: s.percentage ? `${s.percentage.toFixed(2)}%` : '0%'
    }))
    
    const picData = (sectoresPresupuestosCarbono.value || []).map(s => ({
      Categoría: 'Presupuestos Intensivos en Carbono',
      Sector: s.label || s.name || 'Sin nombre',
      Valor: s.value || 0,
      Porcentaje: s.percentage ? `${s.percentage.toFixed(2)}%` : '0%'
    }))
    
    exportData = [...psData, ...picData]
    fileName = `Presupuestos_Regional_${props.selectedYear || 'todos'}`
  }
  
  if (exportData.length === 0) {
    console.warn(`⚠️ No hay datos para exportar en ${cardType}`)
    return
  }
  
  if (format === 'xlsx') {
    exportToExcel(exportData, fileName)
  } else {
    exportToCSV(exportData, fileName)
  }
}

// ============================================================================
// MAPEO DE COLUMNAS PARA POSICIÓN Y PORCENTAJE
// ============================================================================

const positionColumnMap = {
  'presupuesto_total_reg': null,
  'presupuesto_sostenible_reg': 'POS_PS',
  'presupuesto_carbono_reg': 'POS_PIC',
  'ingresos_total_reg': null,
  'ingresos_sostenibles_reg': 'POS_IS',
  'ingresos_carbono_reg': 'POS_IIC'
}

const percentageColumnMap = {
  'presupuesto_total_reg': null,
  'presupuesto_sostenible_reg': 'PS (%)',
  'presupuesto_carbono_reg': 'PIC (%)',
  'ingresos_total_reg': null,
  'ingresos_sostenibles_reg': 'IS (%)',
  'ingresos_carbono_reg': 'IIC (%)'
}

const extractAvailableYears = (data) => {
  if (!data || data.length === 0) return []
  
  const yearColumn = 'Año'
  const years = [...new Set(
    data
      .map(row => row[yearColumn])
      .filter(year => year !== null && year !== undefined && year !== '')
      .map(year => String(year).trim())
  )]
  
  years.sort((a, b) => Number(b) - Number(a))
  console.log('📅 [Regional] Años extraídos:', years)
  return years
}

const loadChartData = async () => {
  try {
    console.log('📊 [Regional] Cargando datos regionales...')
    
    const sheetName = getSheetName('chartsPresupuestosRegional')
    const data = await fetchData('chartsPresupuestosRegional', sheetName)
    console.log('📊 [Regional] Datos cargados:', data?.length, 'filas')
    
    if (data && data.length > 0) {
      const availableYears = extractAvailableYears(data)
      if (availableYears.length > 0) {
        emit('years-loaded', availableYears)
      }
    }
    
    rawRegionalData.value = data || []
    dataLoaded.value = true
  } catch (err) {
    console.error('❌ [Regional] Error cargando datos:', err)
  }
}

onMounted(() => loadChartData())

watch(() => props.selectedYear, async (newYear, oldYear) => {
  if (newYear !== oldYear) {
    console.log('📊 [Regional] Año cambió:', oldYear, '->', newYear)
  }
})

const filteredData = computed(() => {
  if (!dataLoaded.value || !rawRegionalData.value.length) return []
  
  const yearColumn = 'Año'
  
  if (!props.selectedYear) {
    return rawRegionalData.value
  }
  
  return rawRegionalData.value.filter(row => {
    const rowYear = String(row[yearColumn]).trim()
    const selectedYear = String(props.selectedYear).trim()
    return rowYear === selectedYear
  })
})

const filteredPresupuestosData = computed(() => filteredData.value)
const filteredIngresosData = computed(() => filteredData.value)

// Calcular datos para donas
const calculateDonutData = (row, sectorsConfig, totalValue) => {
  if (!row || !sectorsConfig || !totalValue) {
    return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  }
  
  let sectorsTotal = 0
  const sectors = sectorsConfig.map(sectorConfig => {
    const value = getCleanValue(row, sectorConfig.column)
    sectorsTotal += value
    return { 
      key: sectorConfig.key, 
      label: sectorConfig.label, 
      value, 
      color: sectorConfig.color, 
      colorClass: sectorConfig.colorClass 
    }
  })
  
  const percentage = totalValue > 0 ? Math.round((sectorsTotal / totalValue) * 100) : 0
  
  return { mainPercentage: percentage, sectors, totalSectorsValue: sectorsTotal }
}

// Función para transformar datos con posición y porcentaje
const transformSingleRowToBarChart = (row, mapping, isPresupuestos = true) => {
  if (!row || !mapping?.variableColumns) return { variables: [] }
  
  const variables = mapping.variableColumns.map(varConfig => {
    const value = getCleanValue(row, varConfig.column)
    
    const positionColumn = positionColumnMap[varConfig.key]
    const position = positionColumn ? getCleanValue(row, positionColumn) : null
    
    const percentageColumn = percentageColumnMap[varConfig.key]
    const percentage = percentageColumn ? getCleanValue(row, percentageColumn) : null
    
    return {
      key: varConfig.key, 
      label: varConfig.label, 
      value,
      color: varConfig.color, 
      colorClass: varConfig.colorClass, 
      order: varConfig.order || 0,
      position: position || null,
      percentage: percentage || null
    }
  })
  
  variables.sort((a, b) => a.order - b.order)
  return { variables }
}

// Datos para BarChart - PRESUPUESTOS
const presupuestosData = computed(() => {
  if (!filteredPresupuestosData.value.length) return { variables: [] }
  const result = transformSingleRowToBarChart(filteredPresupuestosData.value[0], presupuestosMapping, true)
  
  if (props.selectedVariable && result.variables.length >= 3) {
    if (props.selectedVariable.key === 'PS') {
      result.variables = [result.variables[0], result.variables[1]].filter(v => v)
    } else if (props.selectedVariable.key === 'PIC') {
      result.variables = [result.variables[0], result.variables[2]].filter(v => v)
    }
  }
  return result
})

// Datos para BarChart - INGRESOS
const ingresosData = computed(() => {
  if (!filteredIngresosData.value.length) return { variables: [] }
  const result = transformSingleRowToBarChart(filteredIngresosData.value[0], ingresosMapping, false)
  
  if (props.selectedVariable && result.variables.length >= 3) {
    if (props.selectedVariable.key === 'IS') {
      result.variables = [result.variables[0], result.variables[1]].filter(v => v)
    } else if (props.selectedVariable.key === 'IIC') {
      result.variables = [result.variables[0], result.variables[2]].filter(v => v)
    }
  }
  return result
})

// Columnas de totales
const presupuestoTotalColumn = computed(() => {
  const ptConfig = presupuestosMapping?.variableColumns?.find(v => 
    v.key === 'presupuesto_total_reg' || v.column === 'PT' || v.column === 'PT ($)'
  )
  return ptConfig?.column || 'PT'
})

const ingresoTotalColumn = computed(() => {
  const itConfig = ingresosMapping?.variableColumns?.find(v => 
    v.key === 'ingresos_total_reg' || v.column === 'IT' || v.column === 'IT ($)'
  )
  return itConfig?.column || 'IT ($)'
})

// ============================================================================
// COMPUTED PARA DETECTAR SI LOS DATOS ESTÁN VACÍOS
// ============================================================================

// PS - Presupuestos Sostenibles
const psCalculatedData = computed(() => {
  if (!filteredPresupuestosData.value.length) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const row = filteredPresupuestosData.value[0]
  const total = getCleanValue(row, presupuestoTotalColumn.value)
  const sectorsConfig = presupuestosMapping?.donutSectorsPSRegional || []
  return calculateDonutData(row, sectorsConfig, total)
})

const isPSDataEmpty = computed(() => {
  return psCalculatedData.value.totalSectorsValue === 0
})

// PIC - Presupuestos Intensivos en Carbono
const picCalculatedData = computed(() => {
  if (!filteredPresupuestosData.value.length) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const row = filteredPresupuestosData.value[0]
  const total = getCleanValue(row, presupuestoTotalColumn.value)
  const sectorsConfig = presupuestosMapping?.donutSectorsPICRegional || []
  return calculateDonutData(row, sectorsConfig, total)
})

const isPICDataEmpty = computed(() => {
  return picCalculatedData.value.totalSectorsValue === 0
})

// IS - Ingresos Sostenibles
const isCalculatedData = computed(() => {
  if (!filteredIngresosData.value.length) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, ingresoTotalColumn.value)
  const sectorsConfig = ingresosMapping?.donutSectorsISRegional || []
  return calculateDonutData(row, sectorsConfig, total)
})

const isISDataEmpty = computed(() => {
  return isCalculatedData.value.totalSectorsValue === 0
})

// IIC - Ingresos Intensivos en Carbono
const iicCalculatedData = computed(() => {
  if (!filteredIngresosData.value.length) return { mainPercentage: 0, sectors: [], totalSectorsValue: 0 }
  const row = filteredIngresosData.value[0]
  const total = getCleanValue(row, ingresoTotalColumn.value)
  const sectorsConfig = ingresosMapping?.donutSectorsIICRegional || []
  return calculateDonutData(row, sectorsConfig, total)
})

const isIICDataEmpty = computed(() => {
  return iicCalculatedData.value.totalSectorsValue === 0
})

// ============================================================================
// DATOS PARA DONUT CHARTS
// ============================================================================

const donutPresupuestosSostenibles = computed(() => {
  if (!filteredPresupuestosData.value.length || isPSDataEmpty.value) {
    return [{ label: 'PS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  return [
    { label: 'PS', value: psCalculatedData.value.mainPercentage, color: '#7cb342' }, 
    { label: 'Resto', value: 100 - psCalculatedData.value.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresPresupuestosSostenibles = computed(() => {
  if (isPSDataEmpty.value) return []
  return psCalculatedData.value.sectors
})

const subtitlePresupuestosSostenibles = computed(() => `${donutPresupuestosSostenibles.value[0].value}%`)

const donutPresupuestosCarbono = computed(() => {
  if (!filteredPresupuestosData.value.length || isPICDataEmpty.value) {
    return [{ label: 'PIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  return [
    { label: 'PIC', value: picCalculatedData.value.mainPercentage, color: '#DC143C' }, 
    { label: 'Resto', value: 100 - picCalculatedData.value.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresPresupuestosCarbono = computed(() => {
  if (isPICDataEmpty.value) return []
  return picCalculatedData.value.sectors
})

const subtitlePresupuestosCarbono = computed(() => `${donutPresupuestosCarbono.value[0].value}%`)

const donutIngresosSostenibles = computed(() => {
  if (!filteredIngresosData.value.length || isISDataEmpty.value) {
    return [{ label: 'IS', value: 0, color: '#7cb342' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  return [
    { label: 'IS', value: isCalculatedData.value.mainPercentage, color: '#7cb342' }, 
    { label: 'Resto', value: 100 - isCalculatedData.value.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresIngresosSostenibles = computed(() => {
  if (isISDataEmpty.value) return []
  return isCalculatedData.value.sectors
})

const subtitleIngresosSostenibles = computed(() => `${donutIngresosSostenibles.value[0].value}%`)

const donutIngresosCarbono = computed(() => {
  if (!filteredIngresosData.value.length || isIICDataEmpty.value) {
    return [{ label: 'IIC', value: 0, color: '#DC143C' }, { label: 'Resto', value: 100, color: '#E8E8E8' }]
  }
  return [
    { label: 'IIC', value: iicCalculatedData.value.mainPercentage, color: '#DC143C' }, 
    { label: 'Resto', value: 100 - iicCalculatedData.value.mainPercentage, color: '#E8E8E8' }
  ]
})

const sectoresIngresosCarbono = computed(() => {
  if (isIICDataEmpty.value) return []
  return iicCalculatedData.value.sectors
})

const subtitleIngresosCarbono = computed(() => `${donutIngresosCarbono.value[0].value}%`)

// ============================================================================
// TÍTULOS DINÁMICOS
// ============================================================================

const presupuestosTitleDynamic = computed(() => {
  const yearSuffix = props.selectedYear ? ` en ${props.selectedYear}` : ''
  if (props.selectedVariable?.key === 'PS') return `Presupuestos Sostenibles (PS) con respecto al Presupuesto Total (PT)${yearSuffix}`
  if (props.selectedVariable?.key === 'PIC') return `Presupuestos Intensivos en Carbono (PIC) con respecto al Presupuesto Total (PT)${yearSuffix}`
  return `Presupuestos Intensivos en Carbono (PIC) y Presupuestos Sostenibles (PS) con respecto del gasto total${yearSuffix}`
})

const ingresosTitleDynamic = computed(() => {
  const yearSuffix = props.selectedYear ? ` en ${props.selectedYear}` : ''
  if (props.selectedVariable?.key === 'IS') return `Ingresos Sostenibles (IS) con respecto al Ingreso Total (IT)${yearSuffix}`
  if (props.selectedVariable?.key === 'IIC') return `Ingresos Intensivos en Carbono (IIC) con respecto al Ingreso Total (IT)${yearSuffix}`
  return `Proporción del gasto asignado a Ingresos${yearSuffix}`
})

const cardTitlePresupuestos = computed(() => {
  return `Presupuestos - Regional${props.selectedYear ? ` - ${props.selectedYear}` : ''}`
})

const cardTitleIngresos = computed(() => {
  return `Ingresos - Regional${props.selectedYear ? ` - ${props.selectedYear}` : ''}`
})

// ============================================================================
// VARIABLES PARA LEYENDA DE DONAS
// ============================================================================

const variablesPresupuestosSostenibles = computed(() => {
  const sectors = presupuestosMapping?.donutSectorsPSRegional || []
  return sectors.map(s => ({
    key: s.key,
    label: s.label,
    colorClass: s.colorClass,
    active: true
  }))
})

const variablesPresupuestosCarbono = computed(() => {
  const sectors = presupuestosMapping?.donutSectorsPICRegional || []
  return sectors.map(s => ({
    key: s.key,
    label: s.label,
    colorClass: s.colorClass,
    active: true
  }))
})

const variablesIngresosSostenibles = computed(() => {
  const sectors = ingresosMapping?.donutSectorsISRegional || []
  return sectors.map(s => ({
    key: s.key,
    label: s.label,
    colorClass: s.colorClass,
    active: true
  }))
})

const variablesIngresosCarbono = computed(() => {
  const sectors = ingresosMapping?.donutSectorsIICRegional || []
  return sectors.map(s => ({
    key: s.key,
    label: s.label,
    colorClass: s.colorClass,
    active: true
  }))
})
</script>

<style scoped>
.charts-wrapper {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100%;
}

.charts-wrapper.single-card { align-items: center; }
.charts-wrapper.single-card .chart-card { height: 50%; max-height: 50%; }

.chart-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #1a365d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.182);
  box-sizing: border-box;
  min-height: 625px;
}

.chart-card-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  border-bottom: 1px solid #163C5F;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.card-title {
  flex: 1;
  padding: 4px 0px 0px 0;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 200;
  color: #163C5F;
  font-size: 19px;
  margin: 0;
}

.chart-card-body {
  display: flex;
  flex-direction: row;
  gap: 15px;
  width: 100%;
  flex: 1;
  min-height: 440px;
}

.chart-col-bar {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 5px;
  border-radius: 12px;
  background: white;
  min-height: 440px;
}

.chart-col-donuts {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding: 5px;
  border-radius: 12px;
  background: white;
  min-height: 440px;
}

.chart-col-donuts.single-donut { justify-content: center; }
.chart-col-donuts.single-donut .donut-item { max-width: 100%; }

.donut-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: 12px;
  min-height: 0;
  flex: 1;
  padding: 0 0 15px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.donut-item:first-child:last-child { max-width: 100%; }

.donut-header-dark {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #1e3a5f 0%, #153d5e 100%);
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
  width: 100%;
}

.donut-header-icon {
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.donut-header-icon.green { color: #86efac; }
.donut-header-icon.red { color: #fca5a5; }
.donut-header-icon svg { width: 12px; height: 12px; }

.donut-header-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: white;
  line-height: 1.2;
  letter-spacing: 0.2px;
  flex: 1;
}

/* ============================================================================
   ESTILOS PARA BOTÓN DE EXPORTACIÓN EN DONUT HEADER
   ============================================================================ */

.export-wrapper-donut {
  position: relative;
  margin-left: auto;
}

.export-btn-donut {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn-donut:hover {
  background: rgba(255, 255, 255, 0.22);
  color: white;
  transform: scale(1.08);
}

.export-btn-donut.is-open {
  background: rgba(255, 255, 255, 0.28);
  color: white;
}

.export-btn-donut svg { width: 12px; height: 12px; }

.export-dropdown-donut {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  z-index: 1000;
  min-width: 100px;
}

.export-dropdown-donut .export-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  font-size: 12px;
  color: #374151;
}

.export-dropdown-donut .export-option:hover { background: #f3f4f6; }
.export-dropdown-donut .export-option:first-child { border-bottom: 1px solid #e5e7eb; }

.export-dropdown-donut .option-icon {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 5px;
  border-radius: 3px;
  color: white;
}

.export-dropdown-donut .option-icon.xlsx { background: #107c41; }
.export-dropdown-donut .option-icon.csv { background: #6366f1; }

/* ============================================================================
   ESTILOS PARA BOTÓN DE EXPORTACIÓN EN CARD HEADER
   ============================================================================ */

.export-wrapper-card {
  position: relative;
  margin-left: 12px;
}

.export-btn-card {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #163C5F 0%, #1e4a73 100%);
  border: 2px solid #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(22, 60, 95, 0.3);
}

.export-btn-card:hover {
  background: linear-gradient(135deg, #1e4a73 0%, #2563eb 100%);
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.export-btn-card svg { width: 14px; height: 14px; }

.export-dropdown-card {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  z-index: 1000;
  min-width: 120px;
}

.export-dropdown-card .export-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  font-size: 13px;
  color: #374151;
}

.export-dropdown-card .export-option:hover { background: #f3f4f6; }
.export-dropdown-card .export-option:first-child { border-bottom: 1px solid #e5e7eb; }

.export-dropdown-card .option-icon {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 6px;
  border-radius: 4px;
  color: white;
}

.export-dropdown-card .option-icon.xlsx { background: #107c41; }
.export-dropdown-card .option-icon.csv { background: #6366f1; }

.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-enter-from, .dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ============================================================================
   ESTILOS PARA ESTADO "SIN DATOS"
   ============================================================================ */

.no-data-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

.no-data-state .no-data-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

/* Variante verde (sostenibles) */
.no-data-state.green .no-data-icon {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.no-data-state.green .no-data-icon svg {
  stroke: #22c55e;
}

.no-data-state.green .no-data-text strong {
  color: #166534;
}

/* Variante roja (intensivos en carbono) */
.no-data-state.red .no-data-icon {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
}

.no-data-state.red .no-data-icon svg {
  stroke: #dc2626;
}

.no-data-state.red .no-data-text strong {
  color: #991b1b;
}

.no-data-state .no-data-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e3a5f;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.no-data-state .no-data-text {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============================================================================ */

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #7cb342;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container { color: #DC143C; }

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  color: rgba(100, 100, 100, 0.6);
  font-size: 14px;
}

@media (max-width: 1200px) {
  .chart-card-body { flex-direction: column; }
  .chart-col-donuts { flex-direction: row; flex: 1; }
  .chart-col-bar { min-height: 350px; }
}

@media (max-width: 768px) {
  .chart-col-donuts { flex-direction: column; }
  .donut-item { min-height: 300px; }
  .chart-col-bar { min-height: 300px; }
}
</style>