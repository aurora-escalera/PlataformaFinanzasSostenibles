// src/composables/useTitleBar.js
import { ref, computed } from 'vue'

export const useTitleBar = (props) => {
  // Estados reactivos
  const downloadLoading = ref(false)
  const helpModalVisible = ref(false)

  // Computed para el texto de última actualización
  const lastUpdateText = computed(() => {
    return `Última actualización: ${props.lastUpdate}`
  })

  // Tooltips para los botones
  const downloadTooltip = ref('Descargar datos')
  const helpTooltip = ref('Ayuda')

  // Método para manejar descarga
  const handleDownload = async () => {
    downloadLoading.value = true
    
    try {
      // Aquí implementarías la lógica de descarga
      console.log('Iniciando descarga de datos...')
      
      // Ejemplo: descargar datos IFSS
      // await downloadIFSSData()
      
      // Simulación de descarga
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Descarga completada')
      
      // Mostrar notificación de éxito
      alert('Datos descargados exitosamente')
      
    } catch (error) {
      console.error('Error al descargar:', error)
      alert('Error al descargar los datos')
    } finally {
      downloadLoading.value = false
    }
  }

  // Método para manejar ayuda
  const handleHelp = () => {
    console.log('Abriendo ayuda...')
    helpModalVisible.value = true
    
    // Aquí podrías abrir un modal de ayuda o redirigir a documentación
    // Por ahora, mostramos un alert simple
    alert('Ayuda de la Plataforma IFSS\n\n' +
          '1. Selecciona un estado en el mapa\n' +
          '2. Visualiza las gráficas de análisis\n' +
          '3. Usa los filtros para explorar datos\n' +
          '4. Descarga los datos con el botón verde')
  }

  // Método para cerrar modal de ayuda
  const closeHelpModal = () => {
    helpModalVisible.value = false
  }

  // Método para exportar datos como CSV
  const exportToCSV = (data, filename = 'ifss_data.csv') => {
    const csvContent = convertToCSV(data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Método auxiliar para convertir a CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(obj => Object.values(obj).join(','))
    
    return [headers, ...rows].join('\n')
  }

  // Método para mostrar información de la plataforma
  const showPlatformInfo = () => {
    return {
      name: 'Plataforma IFSS',
      version: '1.0.0',
      lastUpdate: props.lastUpdate,
      description: 'Índice de Finanzas Sostenibles Subnacional'
    }
  }

  return {
    // Estados
    downloadLoading,
    helpModalVisible,
    
    // Computed
    lastUpdateText,
    downloadTooltip,
    helpTooltip,
    
    // Métodos
    handleDownload,
    handleHelp,
    closeHelpModal,
    exportToCSV,
    showPlatformInfo
  }
}