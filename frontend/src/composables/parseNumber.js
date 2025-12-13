// src/composables/parseNumber.js
// ✅ Función utilitaria centralizada para parsear números con formato mixto (europeo/americano)

/**
 * Limpia y parsea un valor numérico que puede venir en diferentes formatos:
 * - Formato americano: 1,234,567.89 (comas = miles, punto = decimal)
 * - Formato europeo: 1.234.567,89 (puntos = miles, coma = decimal)
 * - Números enteros con separadores: 2,352,556,076 o 2.352.556.076
 * 
 * @param {any} value - El valor a parsear
 * @param {boolean} debug - Si es true, muestra logs en consola
 * @returns {number} - El número parseado o 0 si no es válido
 */
export function parseNumber(value, debug = false) {
  if (value === null || value === undefined) {
    return 0
  }
  
  // Si ya es número, retornarlo directamente
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value
  }
  
  // Convertir a string y limpiar
  let str = String(value).trim()
  
  // Quitar comillas al inicio y final
  str = str.replace(/^["']+|["']+$/g, '').trim()
  
  // Si está vacío después de limpiar
  if (str === '' || str === '""' || str === "''") {
    return 0
  }
  
  // Quitar símbolos de moneda y espacios
  str = str.replace(/[$€£¥₹]/g, '').trim()
  
  // Contar ocurrencias de comas y puntos
  const commas = (str.match(/,/g) || []).length
  const dots = (str.match(/\./g) || []).length
  
  if (debug) {
    console.log(`🔢 parseNumber input: "${value}" → cleaned: "${str}"`)
    console.log(`   Comas: ${commas}, Puntos: ${dots}`)
  }
  
  let result
  
  if (commas === 0 && dots === 0) {
    // Sin separadores: "1234567"
    result = parseFloat(str) || 0
    
  } else if (commas > 0 && dots === 0) {
    // Solo comas
    if (commas === 1) {
      // Una coma: puede ser decimal europeo (3,14) o separador de miles (1,234)
      const parts = str.split(',')
      if (parts[1].length === 3 && /^\d+$/.test(parts[0]) && /^\d{3}$/.test(parts[1])) {
        // Separador de miles: "1,234" → "1234"
        result = parseFloat(str.replace(',', '')) || 0
      } else {
        // Decimal europeo: "3,14" → "3.14"
        result = parseFloat(str.replace(',', '.')) || 0
      }
    } else {
      // Múltiples comas: separadores de miles americanos "1,234,567"
      result = parseFloat(str.replace(/,/g, '')) || 0
    }
    
  } else if (dots > 0 && commas === 0) {
    // Solo puntos
    if (dots === 1) {
      // Un punto: puede ser decimal (3.14) o separador de miles europeo (1.234)
      const parts = str.split('.')
      if (parts[1].length === 3 && /^\d+$/.test(parts[0]) && /^\d{3}$/.test(parts[1])) {
        // Separador de miles europeo: "1.234" → "1234"
        result = parseFloat(str.replace('.', '')) || 0
      } else {
        // Decimal americano: "3.14" → ya está correcto
        result = parseFloat(str) || 0
      }
    } else {
      // Múltiples puntos: separadores de miles europeos "1.234.567"
      result = parseFloat(str.replace(/\./g, '')) || 0
    }
    
  } else {
    // Tiene ambos: comas Y puntos
    const lastCommaIndex = str.lastIndexOf(',')
    const lastDotIndex = str.lastIndexOf('.')
    
    if (lastCommaIndex > lastDotIndex) {
      // Formato europeo: "1.234.567,89" → la coma es el decimal
      result = parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0
    } else {
      // Formato americano: "1,234,567.89" → el punto es el decimal
      result = parseFloat(str.replace(/,/g, '')) || 0
    }
  }
  
  if (debug) {
    console.log(`   Resultado: ${result}`)
  }
  
  return result
}

/**
 * Versión de parseNumber para usar en componentes Vue
 * con logging automático en desarrollo
 */
export function getCleanValue(row, column, debug = false) {
  if (!row || !column) {
    return 0
  }
  
  const raw = row[column]
  
  if (raw === null || raw === undefined) {
    if (debug) {
      console.log(`⚠️ Columna '${column}' no existe. Disponibles:`, Object.keys(row))
    }
    return 0
  }
  
  return parseNumber(raw, debug)
}

export default parseNumber