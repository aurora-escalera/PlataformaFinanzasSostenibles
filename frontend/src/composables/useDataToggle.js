// src/composables/useDataToggle.js
import { ref, watch } from 'vue'

export const useDataToggle = () => {
  // Estados reactivos
  const dataType = ref('subnacional') // 'federal' o 'subnacional'
  const currency = ref('mxn') // 'usd' o 'mxn'

  // Método para cambiar tipo de datos
  const setDataType = (type) => {
    if (type === 'federal' || type === 'subnacional') {
      dataType.value = type
      console.log('Tipo de datos cambiado a:', type)
    } else {
      console.error('Tipo de datos inválido:', type)
    }
  }

  // Método para cambiar moneda
  const setCurrency = (curr) => {
    if (curr === 'usd' || curr === 'mxn') {
      currency.value = curr
      console.log('Moneda cambiada a:', curr.toUpperCase())
    } else {
      console.error('Moneda inválida:', curr)
    }
  }

  // Método para obtener el tipo de cambio (ejemplo)
  const getExchangeRate = () => {
    // Aquí podrías hacer una llamada a una API para obtener la tasa de cambio
    return 17.5 // Ejemplo: 1 USD = 17.5 MXN
  }

  // Método para convertir valores según la moneda seleccionada
  const convertCurrency = (value, fromCurrency = 'mxn') => {
    if (currency.value === fromCurrency) {
      return value
    }

    const rate = getExchangeRate()
    
    if (fromCurrency === 'mxn' && currency.value === 'usd') {
      return value / rate
    } else if (fromCurrency === 'usd' && currency.value === 'mxn') {
      return value * rate
    }

    return value
  }

  // Método para formatear valores monetarios
  const formatCurrency = (value) => {
    const converted = convertCurrency(value)
    const symbol = currency.value === 'usd' ? '$' : '$'
    const locale = currency.value === 'usd' ? 'en-US' : 'es-MX'
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.value.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(converted)
  }

  // Watch para reaccionar a cambios
  watch(dataType, (newType) => {
    console.log('Datos actualizados a:', newType)
    // Aquí podrías emitir un evento o actualizar otros datos
  })

  watch(currency, (newCurrency) => {
    console.log('Moneda actualizada a:', newCurrency.toUpperCase())
    // Aquí podrías recalcular valores o actualizar gráficas
  })

  // Método para obtener la configuración actual
  const getCurrentConfig = () => {
    return {
      dataType: dataType.value,
      currency: currency.value,
      currencySymbol: currency.value === 'usd' ? '$' : '$',
      currencyCode: currency.value.toUpperCase()
    }
  }

  // Método para resetear a valores por defecto
  const resetToDefaults = () => {
    dataType.value = 'subnacional'
    currency.value = 'mxn'
  }

  return {
    // Estados
    dataType,
    currency,
    
    // Métodos
    setDataType,
    setCurrency,
    getExchangeRate,
    convertCurrency,
    formatCurrency,
    getCurrentConfig,
    resetToDefaults
  }
}