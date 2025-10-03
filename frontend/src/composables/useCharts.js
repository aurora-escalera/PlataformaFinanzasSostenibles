// src/composables/useCharts.js
import { ref, computed } from 'vue'

export const useCharts = () => {
  // Estados reactivos
  const selectedChartType = ref('donut')
  const chartData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Configuración de tipos de gráficas disponibles
  const availableChartTypes = ref([
    {
      id: 'donut',
      name: 'Gráficas de Dona',
      description: 'Visualización circular de porcentajes'
    },
    {
      id: 'bar',
      name: 'Gráficas de Barras',
      description: 'Comparación visual de valores'
    },
    {
      id: 'line',
      name: 'Gráficas de Línea',
      description: 'Tendencias temporales'
    },
    {
      id: 'area',
      name: 'Gráficas de Área',
      description: 'Evolución de datos en el tiempo'
    }
  ])

  // Generar datos para gráficas de dona basados en datos IFSS
  const generateDonutData = (ifssValue, stateName = '') => {
    // Convertir valor IFSS (0.5-2.9) a porcentaje para visualización
    const percentage = Math.round((ifssValue / 2.9) * 100)
    
    return [
      {
        label: `IFSS ${stateName}`,
        value: percentage,
        color: '#DC143C', // Rojo
        rawValue: ifssValue
      },
      {
        label: 'Restante',
        value: 100 - percentage,
        color: '#e8e8e8ff', // Gris claro
        rawValue: 2.9 - ifssValue
      }
    ]
  }

  // Generar datos para gráficas de barras
  const generateBarData = (value, maxValue = 8, label = 'Indicador') => {
    return [
      {
        label,
        value,
        maxValue,
        percentage: (value / maxValue) * 100
      }
    ]
  }

  // Configuración de datos para las 8 gráficas por estado
  const getStateChartsData = (stateData) => {
    if (!stateData || !stateData.value) {
      return getDefaultChartsData()
    }

    const ifssValue = stateData.value
    const stateName = stateData.region

    return {
      // 4 gráficas de dona (Q1, Q2, Q3, Q4)
      donuts: [
        {
          id: 'q1',
          title: 'Q1',
          subtitle: `${Math.round((ifssValue * 0.9) * 10) / 10}`,
          data: generateDonutData(ifssValue * 0.9, 'Q1')
        },
        {
          id: 'q2', 
          title: 'Q2',
          subtitle: `${Math.round((ifssValue * 0.8) * 10) / 10}`,
          data: generateDonutData(ifssValue * 0.8, 'Q2')
        },
        {
          id: 'q3',
          title: 'Q3', 
          subtitle: `${Math.round((ifssValue * 1.1) * 10) / 10}`,
          data: generateDonutData(ifssValue * 1.1, 'Q3')
        },
        {
          id: 'q4',
          title: 'Q4',
          subtitle: `${Math.round((ifssValue * 0.7) * 10) / 10}`,
          data: generateDonutData(ifssValue * 0.7, 'Q4')
        }
      ],
      // 4 gráficas de barras
      bars: [
        {
          id: 'indicator1',
          title: 'Transparencia',
          color: '#9ACD32', // Verde
          data: generateBarData(Math.min(8, Math.round(ifssValue * 2.8)), 8, 'Transparencia')
        },
        {
          id: 'indicator2', 
          title: 'Participación',
          color: '#DC143C', // Rojo
          data: generateBarData(Math.min(8, Math.round(ifssValue * 2.5)), 8, 'Participación')
        },
        {
          id: 'indicator3',
          title: 'Sostenibilidad',
          color: '#9ACD32', // Verde
          data: generateBarData(Math.min(8, Math.round(ifssValue * 3.0)), 8, 'Sostenibilidad')
        },
        {
          id: 'indicator4',
          title: 'Innovación',
          color: '#DC143C', // Rojo  
          data: generateBarData(Math.min(8, Math.round(ifssValue * 2.2)), 8, 'Innovación')
        }
      ]
    }
  }

  // Datos por defecto cuando no hay estado seleccionado
  const getDefaultChartsData = () => {
    return {
      donuts: [
        {
          id: 'q1',
          title: 'Q1',
          subtitle: '35%',
          data: generateDonutData(1.0, 'Nacional')
        },
        {
          id: 'q2',
          title: 'Q2', 
          subtitle: '30%',
          data: generateDonutData(0.9, 'Nacional')
        },
        {
          id: 'q3',
          title: 'Q3',
          subtitle: '35%',
          data: generateDonutData(1.0, 'Nacional')
        },
        {
          id: 'q4',
          title: 'Q4',
          subtitle: '30%', 
          data: generateDonutData(0.9, 'Nacional')
        }
      ],
      bars: [
        {
          id: 'indicator1',
          title: 'Transparencia',
          color: '#9ACD32',
          data: generateBarData(6, 8, 'Transparencia')
        },
        {
          id: 'indicator2',
          title: 'Participación', 
          color: '#DC143C',
          data: generateBarData(5, 8, 'Participación')
        },
        {
          id: 'indicator3',
          title: 'Sostenibilidad',
          color: '#9ACD32',
          data: generateBarData(7, 8, 'Sostenibilidad')
        },
        {
          id: 'indicator4',
          title: 'Innovación',
          color: '#DC143C',
          data: generateBarData(4, 8, 'Innovación')
        }
      ]
    }
  }

  // Computed para datos de gráficas actuales
  const currentChartsData = computed(() => {
    return chartData.value || getDefaultChartsData()
  })

  // Métodos
  const setChartData = (data) => {
    chartData.value = getStateChartsData(data)
  }

  const setChartType = (type) => {
    selectedChartType.value = type
  }

  const resetCharts = () => {
    chartData.value = null
    selectedChartType.value = 'donut'
    error.value = null
  }

  // Exportar datos de gráficas a CSV
  const exportChartsData = (stateName = 'Mexico') => {
    const data = currentChartsData.value
    
    // Crear CSV con datos de ambos tipos de gráficas
    const headers = ['Tipo', 'Indicador', 'Valor', 'Estado']
    const rows = []
    
    // Agregar datos de donas
    data.donuts.forEach(donut => {
      rows.push(['Dona', donut.title, donut.subtitle, stateName])
    })
    
    // Agregar datos de barras
    data.bars.forEach(bar => {
      const value = bar.data[0]?.value || 0
      rows.push(['Barra', bar.title, value, stateName])
    })
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `IFSS_Charts_${stateName}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Obtener color según valor IFSS para gráficas de dona
  const getIFSSColor = (ifssValue) => {
    if (ifssValue >= 2.4) return '#6ac952'
    if (ifssValue >= 2.0) return '#94d351' 
    if (ifssValue >= 1.8) return '#bddc50'
    if (ifssValue >= 1.6) return '#e6d64f'
    if (ifssValue >= 1.2) return '#e6a74c'
    if (ifssValue >= 0.8) return '#e67849'
    return '#e52845'
  }

  return {
    // Estados reactivos
    selectedChartType,
    chartData,
    loading,
    error,
    
    // Configuración
    availableChartTypes,
    
    // Computed
    currentChartsData,
    
    // Métodos
    setChartData,
    setChartType,
    resetCharts,
    generateDonutData,
    generateBarData,
    getStateChartsData,
    getDefaultChartsData,
    exportChartsData,
    getIFSSColor
  }
}