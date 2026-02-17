// src/composables/useDownloadCenter.js
// ✅ Composable para descargas directas de Google Sheets
// ✅ Regional: Descarga completa del spreadsheet regional
// ✅ Subnacional: Descarga por año (usa nombre de hoja)
// ✅ Cualitativos Subnacionales: 4 categorías con archivos individuales
// ✅ Cualitativos Regionales: 5 categorías con archivos individuales
// ✅ Completo: Descarga Regional + Subnacional (ambos archivos)

import { ref } from 'vue'

export function useDownloadCenter() {
  const isExporting = ref(false)
  const exportError = ref(null)
  const exportProgress = ref('')

  // ============================================================================
  // MAPEO DE SPREADSHEET IDs POR CATEGORÍA CUALITATIVA
  // ============================================================================

  /**
   * Cada categoría cualitativa apunta a su propia variable de entorno.
   * En tu .env debes tener:
   * 
   * # Cualitativos Subnacionales
   * VITE_CUAL_SUB_AMBIENTALES=id_del_spreadsheet
   * VITE_CUAL_SUB_ECONOMICOS=id_del_spreadsheet
   * VITE_CUAL_SUB_PRESUPUESTO=id_del_spreadsheet
   * VITE_CUAL_SUB_GOBERNABILIDAD=id_del_spreadsheet
   * 
   * # Cualitativos Regionales
   * VITE_CUAL_REG_ESTATUS_PAIS=id_del_spreadsheet
   * VITE_CUAL_REG_AMBIENTALES=id_del_spreadsheet
   * VITE_CUAL_REG_SOCIALES=id_del_spreadsheet
   * VITE_CUAL_REG_ECONOMICOS=id_del_spreadsheet
   * VITE_CUAL_REG_FINANCIAMIENTO=id_del_spreadsheet
   */

  const CUAL_SUB_SHEETS = {
    'ambientales': {
      envKey: 'VITE_CUAL_SUB_AMBIENTALES',
      fileName: 'IFSS_Cual_Subnacional_Ambientales',
      label: 'Ambientales'
    },
    'sociales': {
      envKey: 'VITE_CUAL_SUB_SOCIALES',
      fileName: 'IFSS_Cual_Subnacional_Sociales',
      label: 'Sociales'
    },
    'economicos': {
      envKey: 'VITE_CUAL_SUB_ECONOMICOS',
      fileName: 'IFSS_Cual_Subnacional_Economicos',
      label: 'Económicos'
    },
    'presupuesto': {
      envKey: 'VITE_CUAL_SUB_PRESUPUESTO',
      fileName: 'IFSS_Cual_Subnacional_Presupuesto_Financiamiento',
      label: 'Presupuesto y financiamiento'
    },
    'gobernabilidad': {
      envKey: 'VITE_CUAL_SUB_GOBERNABILIDAD',
      fileName: 'IFSS_Cual_Subnacional_Gobernabilidad_Transparencia',
      label: 'Gobernabilidad y transparencia'
    }
  }

  const CUAL_REG_SHEETS = {
    'estatus-pais': {
      envKey: 'VITE_CUAL_REG_ESTATUS_PAIS',
      fileName: 'IFSS_Cual_Regional_Estatus_Pais',
      label: 'Estatus del país'
    },
    'ambientales': {
      envKey: 'VITE_CUAL_REG_AMBIENTALES',
      fileName: 'IFSS_Cual_Regional_Ambientales',
      label: 'Ambientales'
    },
    'sociales': {
      envKey: 'VITE_CUAL_REG_SOCIALES',
      fileName: 'IFSS_Cual_Regional_Sociales',
      label: 'Sociales'
    },
    'economicos': {
      envKey: 'VITE_CUAL_REG_ECONOMICOS',
      fileName: 'IFSS_Cual_Regional_Economicos',
      label: 'Económicos'
    },
    'financiamiento': {
      envKey: 'VITE_CUAL_REG_FINANCIAMIENTO',
      fileName: 'IFSS_Cual_Regional_Financiamiento_Sostenible',
      label: 'Financiamiento Sostenible internacional'
    }
  }

  // ============================================================================
  // DESCARGA DIRECTA DE GOOGLE SHEETS
  // ============================================================================

  const downloadGoogleSheet = (spreadsheetId, format = 'xlsx', fileName = 'datos') => {
    if (!spreadsheetId) {
      console.error('❌ [DownloadCenter] No se proporcionó spreadsheetId')
      exportError.value = 'No se encontró el ID del documento'
      return false
    }

    const exportFormat = format === 'csv' ? 'csv' : 'xlsx'
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=${exportFormat}`

    console.log(`📥 [DownloadCenter] Descargando ${format.toUpperCase()}...`)
    console.log(`  - Sheet ID: ${spreadsheetId}`)
    console.log(`  - URL: ${exportUrl}`)

    const link = document.createElement('a')
    link.href = exportUrl
    link.download = `${fileName}.${format}`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('✅ [DownloadCenter] Descarga iniciada')
    return true
  }

  const downloadGoogleSheetByGid = (spreadsheetId, gid, format = 'xlsx', fileName = 'datos') => {
    if (!spreadsheetId) {
      console.error('❌ [DownloadCenter] No se proporcionó spreadsheetId')
      exportError.value = 'No se encontró el ID del documento'
      return false
    }

    let exportUrl

    if (format === 'csv' && gid !== undefined) {
      exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`
    } else {
      exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`
    }

    const link = document.createElement('a')
    link.href = exportUrl
    link.download = `${fileName}.${format}`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return true
  }

  // ============================================================================
  // OBTENER GID DE UNA HOJA POR NOMBRE
  // ============================================================================

  const getSheetGidByName = async (spreadsheetId, sheetName) => {
    const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
    
    if (!apiKey) {
      console.warn('⚠️ [DownloadCenter] No hay API Key configurada')
      return 0
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`
      const response = await fetch(url)
      
      if (!response.ok) {
        console.warn(`⚠️ [DownloadCenter] Error obteniendo info del spreadsheet: ${response.status}`)
        return 0
      }
      
      const data = await response.json()
      const sheet = data.sheets.find(s => s.properties.title === sheetName)
      
      if (sheet) {
        const gid = sheet.properties.sheetId
        console.log(`✅ [DownloadCenter] GID encontrado para "${sheetName}": ${gid}`)
        return gid
      }
      
      console.warn(`⚠️ [DownloadCenter] Hoja "${sheetName}" no encontrada, usando GID 0`)
      return 0
    } catch (err) {
      console.error('❌ [DownloadCenter] Error obteniendo GID:', err)
      return 0
    }
  }

  // ============================================================================
  // EXPORTAR DATOS REGIONALES
  // ============================================================================

  const exportRegionalOriginal = async (format = 'xlsx') => {
    isExporting.value = true
    exportError.value = null
    exportProgress.value = 'Descargando Datos Regionales...'

    try {
      const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
      if (!spreadsheetId) throw new Error('VITE_GOOGLE_SHEET_ID no está configurado')

      const success = downloadGoogleSheet(spreadsheetId, format, 'IFSS_Datos_Regionales')
      if (!success) throw new Error('No se pudo iniciar la descarga')

      return true
    } catch (err) {
      console.error('❌ [DownloadCenter] Error:', err)
      exportError.value = err.message
      return false
    } finally {
      isExporting.value = false
      exportProgress.value = ''
    }
  }

  // ============================================================================
  // EXPORTAR DATOS SUBNACIONALES
  // ============================================================================

  const exportSubnacionalByYear = async (format = 'xlsx', year = '2024') => {
    isExporting.value = true
    exportError.value = null
    exportProgress.value = `Descargando Datos Subnacionales ${year}...`

    try {
      const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS
      if (!spreadsheetId) throw new Error('VITE_GOOGLE_SHEET_ID_CUANTITATIVOS no está configurado')

      if (format === 'csv') {
        const gid = await getSheetGidByName(spreadsheetId, year)
        const success = downloadGoogleSheetByGid(spreadsheetId, gid, format, `IFSS_Datos_Subnacionales_${year}`)
        if (!success) throw new Error('No se pudo iniciar la descarga')
      } else {
        const success = downloadGoogleSheet(spreadsheetId, format, `IFSS_Datos_Subnacionales_${year}`)
        if (!success) throw new Error('No se pudo iniciar la descarga')
      }

      return true
    } catch (err) {
      console.error('❌ [DownloadCenter] Error:', err)
      exportError.value = err.message
      return false
    } finally {
      isExporting.value = false
      exportProgress.value = ''
    }
  }

  const exportSubnacionalComplete = async (format = 'xlsx') => {
    try {
      const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS
      if (!spreadsheetId) throw new Error('VITE_GOOGLE_SHEET_ID_CUANTITATIVOS no está configurado')
      return downloadGoogleSheet(spreadsheetId, format, 'IFSS_Datos_Subnacionales_Completo')
    } catch (err) {
      console.error('❌ [DownloadCenter] Error:', err)
      return false
    }
  }

  // ============================================================================
  // ✅ EXPORTAR CUALITATIVO INDIVIDUAL (una categoría)
  // ============================================================================

  const exportCualitativoCategoria = async (sheetsMap, categoryKey, format = 'xlsx') => {
    const config = sheetsMap[categoryKey]
    
    if (!config) {
      exportError.value = `Categoría no reconocida: ${categoryKey}`
      return false
    }

    const spreadsheetId = import.meta.env[config.envKey]

    if (!spreadsheetId) {
      throw new Error(`${config.envKey} no está configurado. Agrega esta variable en tu archivo .env`)
    }

    console.log(`📥 [DownloadCenter] Descargando ${config.label} en ${format.toUpperCase()}...`)

    const success = downloadGoogleSheet(spreadsheetId, format, config.fileName)
    if (!success) throw new Error(`No se pudo iniciar la descarga de ${config.label}`)

    return true
  }

  // ============================================================================
  // ✅ EXPORTAR TODOS LOS CUALITATIVOS DE UNA SECCIÓN
  // ============================================================================

  const exportCualitativoTodos = async (sheetsMap, format = 'xlsx') => {
    const categories = Object.keys(sheetsMap)
    let downloadedCount = 0
    let errors = []

    for (let i = 0; i < categories.length; i++) {
      const key = categories[i]
      const config = sheetsMap[key]
      
      exportProgress.value = `Descargando ${config.label} (${i + 1}/${categories.length})...`

      try {
        const spreadsheetId = import.meta.env[config.envKey]
        
        if (!spreadsheetId) {
          console.warn(`⚠️ ${config.envKey} no configurado, saltando ${config.label}`)
          errors.push(`${config.label}: variable de entorno no configurada`)
          continue
        }

        downloadGoogleSheet(spreadsheetId, format, config.fileName)
        downloadedCount++

        // Pausa entre descargas para evitar bloqueo del navegador
        if (i < categories.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600))
        }
      } catch (err) {
        console.error(`❌ Error descargando ${config.label}:`, err)
        errors.push(`${config.label}: ${err.message}`)
      }
    }

    if (downloadedCount === 0) {
      throw new Error('No se pudo descargar ningún archivo. Verifica las variables de entorno.')
    }

    if (errors.length > 0) {
      console.warn(`⚠️ [DownloadCenter] ${errors.length} error(es):`, errors)
    }

    console.log(`✅ [DownloadCenter] ${downloadedCount}/${categories.length} archivos descargados`)
    return true
  }

  // ============================================================================
  // EXPORTAR REPORTE COMPLETO (Regional + Subnacional)
  // ============================================================================

  const exportReporteCompleto = async (format = 'xlsx') => {
    isExporting.value = true
    exportError.value = null
    exportProgress.value = 'Descargando Reporte Completo...'

    try {
      const regionalId = import.meta.env.VITE_GOOGLE_SHEET_ID
      if (regionalId) {
        downloadGoogleSheet(regionalId, format, 'IFSS_Datos_Regionales')
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      const subnacionalId = import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS
      if (subnacionalId) {
        downloadGoogleSheet(subnacionalId, format, 'IFSS_Datos_Subnacionales_Completo')
      }

      return true
    } catch (err) {
      console.error('❌ [DownloadCenter] Error:', err)
      exportError.value = err.message
      return false
    } finally {
      isExporting.value = false
      exportProgress.value = ''
    }
  }

  // ============================================================================
  // HANDLER PRINCIPAL
  // ============================================================================

  const handleDownload = async (viewType, format, options = {}) => {
    console.log(`📥 [DownloadCenter] handleDownload: ${viewType} - ${format}`, options)

    isExporting.value = true
    exportError.value = null
    exportProgress.value = 'Preparando descarga...'

    try {
      let result = false

      switch (viewType) {
        case 'regional':
          result = await exportRegionalOriginal(format)
          break

        case 'subnacional': {
          const year = options.year || '2024'
          result = await exportSubnacionalByYear(format, year)
          break
        }

        // ✅ Cualitativo Subnacional - categoría individual
        case 'cual-sub': {
          const category = options.category
          if (!category) throw new Error('No se especificó la categoría')
          exportProgress.value = `Descargando ${CUAL_SUB_SHEETS[category]?.label || category}...`
          result = await exportCualitativoCategoria(CUAL_SUB_SHEETS, category, format)
          break
        }

        // ✅ Cualitativo Subnacional - TODOS
        case 'cual-sub-todos':
          exportProgress.value = 'Descargando todos los cualitativos subnacionales...'
          result = await exportCualitativoTodos(CUAL_SUB_SHEETS, format)
          break

        // ✅ Cualitativo Regional - categoría individual
        case 'cual-reg': {
          const category = options.category
          if (!category) throw new Error('No se especificó la categoría')
          exportProgress.value = `Descargando ${CUAL_REG_SHEETS[category]?.label || category}...`
          result = await exportCualitativoCategoria(CUAL_REG_SHEETS, category, format)
          break
        }

        // ✅ Cualitativo Regional - TODOS
        case 'cual-reg-todos':
          exportProgress.value = 'Descargando todos los cualitativos regionales...'
          result = await exportCualitativoTodos(CUAL_REG_SHEETS, format)
          break

        case 'completo':
          result = await exportReporteCompleto(format)
          break

        default:
          console.warn(`⚠️ Tipo de descarga no reconocido: ${viewType}`)
          exportError.value = `Tipo de descarga no reconocido: ${viewType}`
          return false
      }

      return result
    } catch (err) {
      console.error('❌ [DownloadCenter] Error:', err)
      exportError.value = err.message
      return false
    } finally {
      isExporting.value = false
      exportProgress.value = ''
    }
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    isExporting,
    exportError,
    exportProgress,
    handleDownload,
    exportRegionalOriginal,
    exportSubnacionalByYear,
    exportSubnacionalComplete,
    exportReporteCompleto,
    exportCualitativoCategoria,
    exportCualitativoTodos,
    CUAL_SUB_SHEETS,
    CUAL_REG_SHEETS,
    downloadGoogleSheet,
    downloadGoogleSheetByGid,
    getSheetGidByName
  }
}