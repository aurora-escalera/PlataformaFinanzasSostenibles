// src/composables/useYearFilter.js
import { ref, computed } from 'vue'

// Estado global compartido para el año seleccionado
const selectedYear = ref(null) // null = "Todos los años"
const availableYears = ref([])
const loadingYears = ref(false)
const yearsError = ref(null)

export function useYearFilter() {
  /**
   * Obtener los nombres de las hojas del Google Sheet de cuantitativos
   */
  const fetchAvailableYears = async () => {
    try {
      console.log('📅 Obteniendo años disponibles desde Google Sheets...')
      loadingYears.value = true
      yearsError.value = null

      const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS

      if (!apiKey || !sheetId) {
        throw new Error('Falta API Key o Sheet ID para cuantitativos')
      }

      // Obtener metadatos del spreadsheet
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error al obtener metadatos: ${response.status}`)
      }

      const data = await response.json()
      
      // Extraer nombres de las hojas
      const sheetNames = data.sheets
        .map(sheet => sheet.properties.title)
        .filter(name => {
          // Filtrar solo nombres que parezcan años (4 dígitos)
          return /^\d{4}$/.test(name)
        })
        .sort((a, b) => b.localeCompare(a)) // Ordenar descendente (más reciente primero)

      availableYears.value = sheetNames
      
      console.log('✅ Años disponibles:', sheetNames)
      
      return sheetNames
    } catch (error) {
      console.error('❌ Error obteniendo años:', error)
      yearsError.value = error.message
      // Fallback a años por defecto
      availableYears.value = ['2024', '2023', '2022', '2021', '2020']
      return availableYears.value
    } finally {
      loadingYears.value = false
    }
  }

  /**
   * Establecer el año seleccionado
   */
  const setSelectedYear = (year) => {
    console.log('📅 Estableciendo año seleccionado:', year)
    selectedYear.value = year
  }

  /**
   * Obtener el año activo (el seleccionado o el más reciente si es null)
   */
  const activeYear = computed(() => {
    if (selectedYear.value !== null) {
      return selectedYear.value
    }
    // Si no hay año seleccionado, usar el más reciente
    return availableYears.value[0] || '2024'
  })

  /**
   * Resetear año a null (Todos los años)
   */
  const resetYear = () => {
    selectedYear.value = null
  }

  return {
    // State
    selectedYear,
    availableYears,
    loadingYears,
    yearsError,
    
    // Computed
    activeYear,
    
    // Methods
    fetchAvailableYears,
    setSelectedYear,
    resetYear
  }
}