// src/composables/useDownloadCenter.js
// ✅ Composable para descargas directas de Google Sheets
// ✅ Regional: Descarga completa del spreadsheet regional
// ✅ Subnacional: Descarga por año (usa nombre de hoja)
// ✅ Completo: Descarga Regional + Subnacional (ambos archivos)

import { ref } from 'vue'

export function useDownloadCenter() {
  const isExporting = ref(false)
  const exportError = ref(null)
  const exportProgress = ref('')

  // ============================================================================
  // DESCARGA DIRECTA DE GOOGLE SHEETS
  // ============================================================================

  /**
   * Descarga un Google Sheet completo usando la URL de exportación de Google.
   */
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

  /**
   * Descarga una hoja específica de un Google Sheet usando el GID.
   */
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

    console.log(`📥 [DownloadCenter] Descargando ${format.toUpperCase()}...`)
    console.log(`  - Sheet ID: ${spreadsheetId}`)
    console.log(`  - GID: ${gid}`)

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
    console.log(`📥 [DownloadCenter] Exportando Datos Regionales en ${format.toUpperCase()}...`)
    
    isExporting.value = true
    exportError.value = null
    exportProgress.value = 'Descargando Datos Regionales...'

    try {
      const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID

      if (!spreadsheetId) {
        throw new Error('VITE_GOOGLE_SHEET_ID no está configurado')
      }

      const success = downloadGoogleSheet(
        spreadsheetId, 
        format, 
        'IFSS_Datos_Regionales'
      )

      if (!success) {
        throw new Error('No se pudo iniciar la descarga')
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
  // EXPORTAR DATOS SUBNACIONALES
  // ============================================================================

  const exportSubnacionalByYear = async (format = 'xlsx', year = '2024') => {
    console.log(`📥 [DownloadCenter] Exportando Datos Subnacionales ${year} en ${format.toUpperCase()}...`)
    
    isExporting.value = true
    exportError.value = null
    exportProgress.value = `Descargando Datos Subnacionales ${year}...`

    try {
      const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS

      if (!spreadsheetId) {
        throw new Error('VITE_GOOGLE_SHEET_ID_CUANTITATIVOS no está configurado')
      }

      if (format === 'csv') {
        const gid = await getSheetGidByName(spreadsheetId, year)
        
        const success = downloadGoogleSheetByGid(
          spreadsheetId,
          gid,
          format,
          `IFSS_Datos_Subnacionales_${year}`
        )

        if (!success) {
          throw new Error('No se pudo iniciar la descarga')
        }
      } else {
        const success = downloadGoogleSheet(
          spreadsheetId, 
          format, 
          `IFSS_Datos_Subnacionales_${year}`
        )

        if (!success) {
          throw new Error('No se pudo iniciar la descarga')
        }
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
  // EXPORTAR SUBNACIONAL COMPLETO (todas las hojas/años)
  // ============================================================================

  const exportSubnacionalComplete = async (format = 'xlsx') => {
    console.log(`📥 [DownloadCenter] Exportando Datos Subnacionales COMPLETO en ${format.toUpperCase()}...`)
    
    try {
      const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS

      if (!spreadsheetId) {
        throw new Error('VITE_GOOGLE_SHEET_ID_CUANTITATIVOS no está configurado')
      }

      // Para XLSX: descarga todo el archivo con todas las pestañas
      // Para CSV: Google solo permite una hoja, descargamos la primera (gid=0)
      const success = downloadGoogleSheet(
        spreadsheetId, 
        format, 
        'IFSS_Datos_Subnacionales_Completo'
      )

      return success
    } catch (err) {
      console.error('❌ [DownloadCenter] Error:', err)
      return false
    }
  }

  // ============================================================================
  // EXPORTAR REPORTE COMPLETO (Regional + Subnacional)
  // ============================================================================

  const exportReporteCompleto = async (format = 'xlsx') => {
    console.log(`📥 [DownloadCenter] Exportando REPORTE COMPLETO en ${format.toUpperCase()}...`)
    
    isExporting.value = true
    exportError.value = null
    exportProgress.value = 'Descargando Reporte Completo...'

    try {
      // 1. Descargar Datos Regionales
      console.log('📥 [1/2] Descargando Datos Regionales...')
      const regionalId = import.meta.env.VITE_GOOGLE_SHEET_ID
      
      if (regionalId) {
        downloadGoogleSheet(regionalId, format, 'IFSS_Datos_Regionales')
      } else {
        console.warn('⚠️ VITE_GOOGLE_SHEET_ID no configurado')
      }

      // Pequeña pausa para evitar que el navegador bloquee múltiples descargas
      await new Promise(resolve => setTimeout(resolve, 500))

      // 2. Descargar Datos Subnacionales (completo con todas las pestañas)
      console.log('📥 [2/2] Descargando Datos Subnacionales...')
      const subnacionalId = import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS
      
      if (subnacionalId) {
        downloadGoogleSheet(subnacionalId, format, 'IFSS_Datos_Subnacionales_Completo')
      } else {
        console.warn('⚠️ VITE_GOOGLE_SHEET_ID_CUANTITATIVOS no configurado')
      }

      console.log('✅ [DownloadCenter] Reporte completo iniciado (2 archivos)')
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

    switch (viewType) {
      case 'regional':
        return await exportRegionalOriginal(format)

      case 'subnacional':
        const year = options.year || '2024'
        return await exportSubnacionalByYear(format, year)

      case 'completo':
        return await exportReporteCompleto(format)

      default:
        console.warn(`⚠️ Tipo de descarga no reconocido: ${viewType}`)
        exportError.value = `Tipo de descarga no reconocido: ${viewType}`
        return false
    }
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    isExporting,
    exportError,
    exportProgress,
    
    // Handler principal
    handleDownload,
    
    // Funciones individuales
    exportRegionalOriginal,
    exportSubnacionalByYear,
    exportSubnacionalComplete,
    exportReporteCompleto,
    
    // Utilidades
    downloadGoogleSheet,
    downloadGoogleSheetByGid,
    getSheetGidByName
  }
}