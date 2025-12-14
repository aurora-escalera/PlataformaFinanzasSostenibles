// src/composables/useDownloadCenter.js
// ✅ Composable para centralizar todas las descargas de la plataforma

import { ref } from 'vue'
import { useStorageData } from '@/dataConection/useStorageData'
import { getMapping, getSheetName } from '@/dataConection/storageConfig'

export function useDownloadCenter() {
  const isExporting = ref(false)
  const exportError = ref(null)
  const exportProgress = ref('')

  // ============================================================================
  // UTILIDADES DE FORMATO
  // ============================================================================

  /**
   * Formatea números sin notación científica (formato americano)
   */
  const formatNumber = (value) => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'string') return value
    const num = Number(value)
    if (isNaN(num)) return value
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  /**
   * Formatea números para Excel (mantiene como número)
   */
  const formatNumberForExcel = (value) => {
    if (value === null || value === undefined) return 0
    const num = Number(value)
    if (isNaN(num)) return value
    return Math.round(num * 100) / 100
  }

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN BASE
  // ============================================================================

  /**
   * Exporta datos a Excel con múltiples hojas
   */
  const exportToExcel = async (sheets, fileName) => {
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.utils.book_new()

      sheets.forEach(({ data, name }) => {
        if (!data || data.length === 0) {
          data = [{ 'Info': 'Sin datos disponibles' }]
        }

        // Formatear números
        const formattedData = data.map(row => {
          const newRow = {}
          Object.keys(row).forEach(key => {
            const value = row[key]
            if (typeof value === 'number') {
              newRow[key] = formatNumberForExcel(value)
            } else {
              newRow[key] = value
            }
          })
          return newRow
        })

        const ws = XLSX.utils.json_to_sheet(formattedData)

        // Configurar formato de columnas numéricas
        const range = XLSX.utils.decode_range(ws['!ref'])
        for (let C = range.s.c; C <= range.e.c; ++C) {
          for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
            const cell = ws[cellAddress]
            if (cell && typeof cell.v === 'number') {
              cell.t = 'n'
              cell.z = '#,##0.00'
            }
          }
        }

        // Ajustar ancho de columnas
        const colWidths = Object.keys(formattedData[0] || {}).map(() => ({ wch: 20 }))
        ws['!cols'] = colWidths

        XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31))
      })

      XLSX.writeFile(wb, `${fileName}.xlsx`)
      console.log('✅ Excel exportado:', fileName)
      return true
    } catch (err) {
      console.error('❌ Error al exportar Excel:', err)
      exportError.value = err.message
      return false
    }
  }

  /**
   * Exporta datos a CSV
   */
  const exportToCSV = (data, fileName) => {
    try {
      if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar')
      }

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
          let value = row[h]
          if (typeof value === 'number') {
            value = formatNumber(value)
          }
          // Escapar comillas y envolver en comillas
          if (typeof value === 'string') {
            value = value.replace(/"/g, '""')
          }
          return `"${value}"`
        }).join(','))
      ].join('\n')

      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}.csv`
      link.click()
      URL.revokeObjectURL(link.href)

      console.log('✅ CSV exportado:', fileName)
      return true
    } catch (err) {
      console.error('❌ Error al exportar CSV:', err)
      exportError.value = err.message
      return false
    }
  }

  // ============================================================================
  // VISTA 1: DATOS REGIONALES (FEDERAL)
  // ============================================================================

  /**
   * Obtiene y exporta datos regionales (IFS + Ingresos + Presupuestos)
   */
  const exportRegionalData = async (format, options = {}) => {
    console.log('📥 [DownloadCenter] Exportando datos regionales...')
    isExporting.value = true
    exportError.value = null
    exportProgress.value = 'Cargando datos regionales...'

    try {
      const { fetchData } = useStorageData()
      const sheetName = getSheetName('chartsPresupuestosRegional')
      const rawData = await fetchData('chartsPresupuestosRegional', sheetName)

      if (!rawData || rawData.length === 0) {
        throw new Error('No se encontraron datos regionales')
      }

      const year = options.year || 'Todos'
      const entidad = 'Regional'

      // Filtrar por año si se especifica
      let filteredData = rawData
      if (options.year) {
        filteredData = rawData.filter(row => String(row['Año']).trim() === String(options.year).trim())
      }

      // Preparar hojas de datos
      const sheets = []

      // Hoja 1: Resumen IFS
      const ifsData = filteredData.map(row => ({
        'Entidad': entidad,
        'Año': row['Año'] || year,
        'IFS': row['IFS'] || row['IFS ($)'] || 0,
        'Posición IFS': row['POS_IFS'] || 'N/A'
      }))
      sheets.push({ data: ifsData, name: 'IFS' })

      // Hoja 2: Presupuestos
      const presupuestosData = filteredData.map(row => ({
        'Entidad': entidad,
        'Año': row['Año'] || year,
        'Presupuesto Total (PT)': row['PT'] || row['PT ($)'] || 0,
        'Presupuestos Sostenibles (PS)': row['PS'] || row['PS ($)'] || 0,
        'PS (%)': row['PS (%)'] || 0,
        'Posición PS': row['POS_PS'] || 'N/A',
        'Presupuestos Int. Carbono (PIC)': row['PIC'] || row['PIC ($)'] || 0,
        'PIC (%)': row['PIC (%)'] || 0,
        'Posición PIC': row['POS_PIC'] || 'N/A'
      }))
      sheets.push({ data: presupuestosData, name: 'Presupuestos' })

      // Hoja 3: Ingresos
      const ingresosData = filteredData.map(row => ({
        'Entidad': entidad,
        'Año': row['Año'] || year,
        'Ingreso Total (IT)': row['IT'] || row['IT ($)'] || 0,
        'Ingresos Sostenibles (IS)': row['IS'] || row['IS ($)'] || 0,
        'IS (%)': row['IS (%)'] || 0,
        'Posición IS': row['POS_IS'] || 'N/A',
        'Ingresos Int. Carbono (IIC)': row['IIC'] || row['IIC ($)'] || 0,
        'IIC (%)': row['IIC (%)'] || 0,
        'Posición IIC': row['POS_IIC'] || 'N/A'
      }))
      sheets.push({ data: ingresosData, name: 'Ingresos' })

      const fileName = `Datos_Regionales_${year}`

      if (format === 'xlsx') {
        await exportToExcel(sheets, fileName)
      } else {
        // Para CSV, combinar todas las hojas
        const allData = [
          ...ifsData.map(d => ({ ...d, 'Categoría': 'IFS' })),
          ...presupuestosData.map(d => ({ ...d, 'Categoría': 'Presupuestos' })),
          ...ingresosData.map(d => ({ ...d, 'Categoría': 'Ingresos' }))
        ]
        exportToCSV(allData, fileName)
      }

      return true
    } catch (err) {
      console.error('❌ Error exportando datos regionales:', err)
      exportError.value = err.message
      return false
    } finally {
      isExporting.value = false
      exportProgress.value = ''
    }
  }

  // ============================================================================
  // VISTA 2: DATOS SUBNACIONALES
  // ============================================================================

  /**
   * Obtiene y exporta datos subnacionales (ranking por entidad)
   */
  const exportSubnacionalData = async (format, options = {}) => {
    console.log('📥 [DownloadCenter] Exportando datos subnacionales...')
    isExporting.value = true
    exportError.value = null
    exportProgress.value = 'Cargando datos subnacionales...'

    try {
      const { fetchData } = useStorageData()
      const sheetName = getSheetName('chartsPresupuestos')
      const rawData = await fetchData('chartsPresupuestos', sheetName)

      if (!rawData || rawData.length === 0) {
        throw new Error('No se encontraron datos subnacionales')
      }

      const year = options.year || 'Todos'
      const mapping = getMapping('chartsPresupuestos')
      const stateColumn = mapping?.stateColumn || 'ENTIDAD'

      // Filtrar por año si se especifica
      let filteredData = rawData
      if (options.year) {
        filteredData = rawData.filter(row => String(row['Año']).trim() === String(options.year).trim())
      }

      // Preparar hojas de datos
      const sheets = []

      // Hoja 1: Ranking IFS
      const rankingData = filteredData.map(row => ({
        'Entidad': row[stateColumn] || 'N/A',
        'Año': row['Año'] || year,
        'IFS': row['IFS'] || row['IFS ($)'] || 0,
        'Posición': row['POS_IFS'] || row['Posición'] || 'N/A'
      })).sort((a, b) => (a['Posición'] || 999) - (b['Posición'] || 999))
      sheets.push({ data: rankingData, name: 'Ranking IFS' })

      // Hoja 2: Detalle por Entidad
      const detalleData = filteredData.map(row => ({
        'Entidad': row[stateColumn] || 'N/A',
        'Año': row['Año'] || year,
        'IFS': row['IFS'] || 0,
        'Presupuesto Total': row['PT'] || row['PT ($)'] || 0,
        'Presupuestos Sostenibles': row['PS'] || row['PS ($)'] || 0,
        'PS (%)': row['PS (%)'] || 0,
        'Presupuestos Int. Carbono': row['PIC'] || row['PIC ($)'] || 0,
        'PIC (%)': row['PIC (%)'] || 0,
        'Ingreso Total': row['IT'] || row['IT ($)'] || 0,
        'Ingresos Sostenibles': row['IS'] || row['IS ($)'] || 0,
        'IS (%)': row['IS (%)'] || 0,
        'Ingresos Int. Carbono': row['IIC'] || row['IIC ($)'] || 0,
        'IIC (%)': row['IIC (%)'] || 0
      }))
      sheets.push({ data: detalleData, name: 'Detalle Entidades' })

      const fileName = `Datos_Subnacionales_${year}`

      if (format === 'xlsx') {
        await exportToExcel(sheets, fileName)
      } else {
        exportToCSV(detalleData, fileName)
      }

      return true
    } catch (err) {
      console.error('❌ Error exportando datos subnacionales:', err)
      exportError.value = err.message
      return false
    } finally {
      isExporting.value = false
      exportProgress.value = ''
    }
  }

  // ============================================================================
  // VISTA 3: SERIE HISTÓRICA
  // ============================================================================

  /**
   * Obtiene y exporta datos históricos (evolución IFS)
   */
  const exportHistoricoData = async (format, options = {}) => {
    console.log('📥 [DownloadCenter] Exportando datos históricos...')
    isExporting.value = true
    exportError.value = null
    exportProgress.value = 'Cargando serie histórica...'

    try {
      const { fetchData, fetchSheetNames } = useStorageData()
      
      // Obtener todos los años disponibles
      const sheetNames = await fetchSheetNames('datosCuantitativos')
      const years = sheetNames.filter(name => /^\d{4}$/.test(name)).sort((a, b) => a - b)

      if (years.length === 0) {
        throw new Error('No se encontraron años disponibles')
      }

      const allData = []

      // Cargar datos de cada año
      for (const year of years) {
        exportProgress.value = `Cargando año ${year}...`
        try {
          const sheetName = getSheetName('chartsPresupuestos')
          const yearData = await fetchData('chartsPresupuestos', sheetName)
          
          if (yearData && yearData.length > 0) {
            const mapping = getMapping('chartsPresupuestos')
            const stateColumn = mapping?.stateColumn || 'ENTIDAD'
            
            yearData.forEach(row => {
              allData.push({
                'Año': row['Año'] || year,
                'Entidad': row[stateColumn] || 'N/A',
                'IFS': row['IFS'] || 0,
                'Posición IFS': row['POS_IFS'] || 'N/A',
                'PS (%)': row['PS (%)'] || 0,
                'PIC (%)': row['PIC (%)'] || 0,
                'IS (%)': row['IS (%)'] || 0,
                'IIC (%)': row['IIC (%)'] || 0
              })
            })
          }
        } catch (err) {
          console.warn(`⚠️ No se pudo cargar año ${year}:`, err)
        }
      }

      if (allData.length === 0) {
        throw new Error('No se encontraron datos históricos')
      }

      // Ordenar por año y entidad
      allData.sort((a, b) => {
        if (a['Año'] !== b['Año']) return a['Año'] - b['Año']
        return (a['Entidad'] || '').localeCompare(b['Entidad'] || '')
      })

      const sheets = [{ data: allData, name: 'Serie Histórica' }]
      const fileName = `Serie_Historica_IFS_${years[0]}_${years[years.length - 1]}`

      if (format === 'xlsx') {
        await exportToExcel(sheets, fileName)
      } else {
        exportToCSV(allData, fileName)
      }

      return true
    } catch (err) {
      console.error('❌ Error exportando datos históricos:', err)
      exportError.value = err.message
      return false
    } finally {
      isExporting.value = false
      exportProgress.value = ''
    }
  }

  // ============================================================================
  // REPORTE COMPLETO
  // ============================================================================

  /**
   * Exporta todos los datos de la plataforma en un solo archivo
   */
  const exportReporteCompleto = async (format, options = {}) => {
    console.log('📥 [DownloadCenter] Exportando reporte completo...')
    isExporting.value = true
    exportError.value = null
    exportProgress.value = 'Generando reporte completo...'

    try {
      const { fetchData } = useStorageData()
      const sheets = []

      // 1. Datos Regionales
      exportProgress.value = 'Cargando datos regionales...'
      try {
        const regionalSheetName = getSheetName('chartsPresupuestosRegional')
        const regionalData = await fetchData('chartsPresupuestosRegional', regionalSheetName)
        
        if (regionalData && regionalData.length > 0) {
          const regionalFormatted = regionalData.map(row => ({
            'Entidad': 'Regional',
            'Año': row['Año'] || 'N/A',
            'IFS': row['IFS'] || 0,
            'PT': row['PT'] || row['PT ($)'] || 0,
            'PS': row['PS'] || row['PS ($)'] || 0,
            'PS (%)': row['PS (%)'] || 0,
            'PIC': row['PIC'] || row['PIC ($)'] || 0,
            'PIC (%)': row['PIC (%)'] || 0,
            'IT': row['IT'] || row['IT ($)'] || 0,
            'IS': row['IS'] || row['IS ($)'] || 0,
            'IS (%)': row['IS (%)'] || 0,
            'IIC': row['IIC'] || row['IIC ($)'] || 0,
            'IIC (%)': row['IIC (%)'] || 0
          }))
          sheets.push({ data: regionalFormatted, name: 'Datos Regionales' })
        }
      } catch (err) {
        console.warn('⚠️ No se pudieron cargar datos regionales:', err)
      }

      // 2. Datos Subnacionales
      exportProgress.value = 'Cargando datos subnacionales...'
      try {
        const subnacionalSheetName = getSheetName('chartsPresupuestos')
        const subnacionalData = await fetchData('chartsPresupuestos', subnacionalSheetName)
        
        if (subnacionalData && subnacionalData.length > 0) {
          const mapping = getMapping('chartsPresupuestos')
          const stateColumn = mapping?.stateColumn || 'ENTIDAD'
          
          const subnacionalFormatted = subnacionalData.map(row => ({
            'Entidad': row[stateColumn] || 'N/A',
            'Año': row['Año'] || 'N/A',
            'IFS': row['IFS'] || 0,
            'Posición IFS': row['POS_IFS'] || 'N/A',
            'PT': row['PT'] || row['PT ($)'] || 0,
            'PS': row['PS'] || row['PS ($)'] || 0,
            'PS (%)': row['PS (%)'] || 0,
            'PIC': row['PIC'] || row['PIC ($)'] || 0,
            'PIC (%)': row['PIC (%)'] || 0,
            'IT': row['IT'] || row['IT ($)'] || 0,
            'IS': row['IS'] || row['IS ($)'] || 0,
            'IS (%)': row['IS (%)'] || 0,
            'IIC': row['IIC'] || row['IIC ($)'] || 0,
            'IIC (%)': row['IIC (%)'] || 0
          }))
          sheets.push({ data: subnacionalFormatted, name: 'Datos Subnacionales' })
        }
      } catch (err) {
        console.warn('⚠️ No se pudieron cargar datos subnacionales:', err)
      }

      if (sheets.length === 0) {
        throw new Error('No se encontraron datos para exportar')
      }

      const today = new Date().toISOString().split('T')[0]
      const fileName = `Reporte_Completo_IFSS_${today}`

      await exportToExcel(sheets, fileName)

      return true
    } catch (err) {
      console.error('❌ Error exportando reporte completo:', err)
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

  /**
   * Manejador principal de descargas
   * @param {string} viewType - Tipo de vista: 'regional', 'subnacional', 'historico', 'completo'
   * @param {string} format - Formato: 'xlsx' o 'csv'
   * @param {object} options - Opciones adicionales (year, entity, etc.)
   */
  const handleDownload = async (viewType, format, options = {}) => {
    console.log(`📥 [DownloadCenter] Iniciando descarga: ${viewType} - ${format}`)

    switch (viewType) {
      case 'regional':
        return await exportRegionalData(format, options)
      case 'subnacional':
        return await exportSubnacionalData(format, options)
      case 'historico':
        return await exportHistoricoData(format, options)
      case 'completo':
        return await exportReporteCompleto(format, options)
      default:
        console.warn(`⚠️ Tipo de vista no reconocido: ${viewType}`)
        return false
    }
  }

  return {
    isExporting,
    exportError,
    exportProgress,
    handleDownload,
    exportRegionalData,
    exportSubnacionalData,
    exportHistoricoData,
    exportReporteCompleto,
    exportToExcel,
    exportToCSV
  }
}