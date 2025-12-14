// src/composables/useExportData.js
import { ref } from 'vue'
import * as XLSX from 'xlsx'

export function useExportData() {
  const exporting = ref(false)
  const exportError = ref(null)

  /**
   * Genera nombre de archivo basado en la vista actual
   */
  const generateFileName = (viewType, filters = {}) => {
    const timestamp = new Date().toISOString().split('T')[0]
    const { year, variable } = filters
    
    let nameParts = ['IFSS', 'Federal']
    
    if (viewType) nameParts.push(viewType)
    if (year) nameParts.push(year)
    if (variable?.key) nameParts.push(variable.key)
    
    nameParts.push(timestamp)
    
    return nameParts.join('_')
  }

  /**
   * Exporta datos a CSV
   */
  const exportToCSV = (data, fileName) => {
    try {
      exporting.value = true
      exportError.value = null
      
      if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar')
      }
      
      const headers = Object.keys(data[0])
      
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            let cell = row[header] ?? ''
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
              cell = `"${cell.replace(/"/g, '""')}"`
            }
            return cell
          }).join(',')
        )
      ].join('\n')
      
      // BOM para soporte de caracteres especiales en Excel
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      
      downloadBlob(blob, `${fileName}.csv`)
      
      console.log('✅ CSV exportado:', fileName)
      return true
      
    } catch (err) {
      console.error('❌ Error exportando CSV:', err)
      exportError.value = err.message
      return false
    } finally {
      exporting.value = false
    }
  }

  /**
   * Exporta datos a Excel (.xlsx)
   */
  const exportToExcel = (data, fileName, options = {}) => {
    try {
      exporting.value = true
      exportError.value = null
      
      if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar')
      }
      
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      
      // Ancho automático de columnas
      const headers = Object.keys(data[0])
      const colWidths = headers.map(header => {
        const maxLength = Math.max(
          header.length,
          ...data.map(row => String(row[header] ?? '').length)
        )
        return { wch: Math.min(maxLength + 2, 50) }
      })
      ws['!cols'] = colWidths
      
      const sheetName = options.sheetName || 'Datos'
      XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31))
      
      // Si hay hojas adicionales
      if (options.additionalSheets) {
        options.additionalSheets.forEach(({ data: sheetData, name }) => {
          if (sheetData && sheetData.length > 0) {
            const additionalWs = XLSX.utils.json_to_sheet(sheetData)
            XLSX.utils.book_append_sheet(wb, additionalWs, name.substring(0, 31))
          }
        })
      }
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      downloadBlob(blob, `${fileName}.xlsx`)
      
      console.log('✅ Excel exportado:', fileName)
      return true
      
    } catch (err) {
      console.error('❌ Error exportando Excel:', err)
      exportError.value = err.message
      return false
    } finally {
      exporting.value = false
    }
  }

  /**
   * Exporta datos de IFSRegionalCard
   */
  const exportIFSRegionalData = (metricData, format, filters = {}) => {
    const fileName = generateFileName('IFS_Regional', filters)
    
    const data = [{
      'Año': filters.year || 'N/A',
      'Indicador': metricData.indicador || 'IFS',
      'Valor': metricData.valor,
      'Posición Internacional': metricData.posicion || 'N/A',
      'Tipo': metricData.tipo || 'Federal'
    }]
    
    if (format === 'csv') {
      return exportToCSV(data, fileName)
    } else {
      return exportToExcel(data, fileName, { sheetName: 'IFS Regional' })
    }
  }

  /**
   * Exporta datos de RegionalChartsComponent (Presupuestos e Ingresos)
   */
  const exportRegionalChartsData = (presupuestosData, ingresosData, sectoresData, format, filters = {}) => {
    const fileName = generateFileName('Regional_Charts', filters)
    const year = filters.year || 'N/A'
    
    // Hoja 1: Presupuestos
    const presupuestosSheet = presupuestosData.variables?.map(v => ({
      'Año': year,
      'Categoría': 'Presupuestos',
      'Indicador': v.label,
      'Valor (USD)': v.value,
      'Posición': v.position || 'N/A',
      'Porcentaje': v.percentage ? `${v.percentage}%` : 'N/A'
    })) || []
    
    // Hoja 2: Ingresos
    const ingresosSheet = ingresosData.variables?.map(v => ({
      'Año': year,
      'Categoría': 'Ingresos',
      'Indicador': v.label,
      'Valor (USD)': v.value,
      'Posición': v.position || 'N/A',
      'Porcentaje': v.percentage ? `${v.percentage}%` : 'N/A'
    })) || []
    
    // Hoja 3: Sectores (donas)
    const sectoresSheet = []
    
    if (sectoresData.ps && sectoresData.ps.length > 0) {
      sectoresData.ps.forEach(s => {
        sectoresSheet.push({
          'Año': year,
          'Tipo': 'Presupuestos Sostenibles (PS)',
          'Sector': s.label,
          'Valor (USD)': s.value
        })
      })
    }
    
    if (sectoresData.pic && sectoresData.pic.length > 0) {
      sectoresData.pic.forEach(s => {
        sectoresSheet.push({
          'Año': year,
          'Tipo': 'Presupuestos Int. Carbono (PIC)',
          'Sector': s.label,
          'Valor (USD)': s.value
        })
      })
    }
    
    if (sectoresData.is && sectoresData.is.length > 0) {
      sectoresData.is.forEach(s => {
        sectoresSheet.push({
          'Año': year,
          'Tipo': 'Ingresos Sostenibles (IS)',
          'Sector': s.label,
          'Valor (USD)': s.value
        })
      })
    }
    
    if (sectoresData.iic && sectoresData.iic.length > 0) {
      sectoresData.iic.forEach(s => {
        sectoresSheet.push({
          'Año': year,
          'Tipo': 'Ingresos Int. Carbono (IIC)',
          'Sector': s.label,
          'Valor (USD)': s.value
        })
      })
    }
    
    // Combinar todo para CSV
    const allData = [
      ...presupuestosSheet,
      ...ingresosSheet
    ]
    
    if (format === 'csv') {
      return exportToCSV(allData, fileName)
    } else {
      // Excel con múltiples hojas
      return exportToExcel(presupuestosSheet.length > 0 ? presupuestosSheet : [{ 'Info': 'Sin datos' }], fileName, {
        sheetName: 'Presupuestos',
        additionalSheets: [
          { data: ingresosSheet, name: 'Ingresos' },
          { data: sectoresSheet, name: 'Sectores' }
        ]
      })
    }
  }

  /**
   * Helper para descargar blob
   */
  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    exporting,
    exportError,
    exportToCSV,
    exportToExcel,
    exportIFSRegionalData,
    exportRegionalChartsData,
    generateFileName
  }
}