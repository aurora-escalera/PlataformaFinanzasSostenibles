// src/composables/useQualitativeIndicators.js
import { ref, computed } from 'vue'

export const useQualitativeIndicators = () => {
  const isPanelOpen = ref(false)
  const selectedCategory = ref(null)
  const selectedState = ref(null)

  // Categorías de indicadores cualitativos
  const categories = ref([
    {
      id: 'ambientales',
      label: 'Ambientales',
      icon: '🌱',
      color: '#4CAF50',
      indicators: [
        {
          id: 'incendios',
          title: 'Incendios forestales en hectáreas en 2024',
          type: 'bar-chart',
          description: 'Superficie afectada por incendios forestales',
          data: null // Aquí irían los datos reales
        },
        {
          id: 'emisiones',
          title: 'Emisiones de gases de efecto atmosféricos por fuente',
          type: 'donut-chart',
          description: 'Distribución de emisiones por sector',
          data: null
        },
        {
          id: 'residuos',
          title: 'Promedio diario de residuos sólidos urbanos recolectados',
          type: 'bar-chart',
          description: 'Toneladas de residuos recolectados diariamente',
          data: null
        },
        {
          id: 'areas-naturales',
          title: 'Superficie estimada de Áreas Naturales Protegidas',
          type: 'bar-chart',
          description: 'Hectáreas bajo protección ambiental',
          data: null
        }
      ]
    },
    {
      id: 'economicos',
      label: 'Económicos',
      icon: '💰',
      color: '#2196F3',
      indicators: [
        {
          id: 'pib',
          title: 'PIB per cápita',
          type: 'line-chart',
          description: 'Producto Interno Bruto por habitante',
          data: null
        },
        {
          id: 'inversion',
          title: 'Inversión en infraestructura verde',
          type: 'bar-chart',
          description: 'Monto invertido en proyectos sostenibles',
          data: null
        }
      ]
    },
    {
      id: 'sociales',
      label: 'Sociales',
      icon: '👥',
      color: '#FF9800',
      indicators: [
        {
          id: 'empleo-verde',
          title: 'Empleos verdes generados',
          type: 'bar-chart',
          description: 'Número de empleos en sectores sostenibles',
          data: null
        },
        {
          id: 'educacion',
          title: 'Programas de educación ambiental',
          type: 'bar-chart',
          description: 'Número de programas implementados',
          data: null
        }
      ]
    },
    {
      id: 'presupuesto',
      label: 'Presupuesto y financiamiento',
      icon: '📊',
      color: '#9C27B0',
      indicators: [
        {
          id: 'presupuesto-verde',
          title: 'Presupuesto asignado a proyectos verdes',
          type: 'bar-chart',
          description: 'Monto del presupuesto destinado a sostenibilidad',
          data: null
        }
      ]
    },
    {
      id: 'gobernabilidad',
      label: 'Gobernabilidad y transparencia',
      icon: '🏛️',
      color: '#607D8B',
      indicators: [
        {
          id: 'transparencia',
          title: 'Índice de transparencia presupuestaria',
          type: 'gauge',
          description: 'Nivel de transparencia en la gestión pública',
          data: null
        }
      ]
    }
  ])

  // Computed: Categoría seleccionada actual
  const currentCategory = computed(() => {
    if (!selectedCategory.value) return null
    return categories.value.find(cat => cat.id === selectedCategory.value)
  })

  // Métodos
  const openPanel = (stateName = null) => {
    isPanelOpen.value = true
    selectedState.value = stateName
    console.log('Panel abierto para estado:', stateName)
  }

  const closePanel = () => {
    isPanelOpen.value = false
    selectedCategory.value = null
    console.log('Panel cerrado')
  }

  const selectCategory = (categoryId) => {
    selectedCategory.value = categoryId
    console.log('Categoría seleccionada:', categoryId)
  }

  const goBack = () => {
    selectedCategory.value = null
    console.log('Regresando a vista de categorías')
  }

  return {
    // Estados
    isPanelOpen,
    selectedCategory,
    selectedState,
    categories,
    
    // Computed
    currentCategory,
    
    // Métodos
    openPanel,
    closePanel,
    selectCategory,
    goBack
  }
}