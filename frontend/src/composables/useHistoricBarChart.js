// src/config/chartVariablesConfig.js

/**
 * Configuración centralizada de variables para gráficos
 * Permite definir colores, etiquetas y orden de visualización
 */

// ✅ CONFIGURACIÓN FINANCIERA
export const financialVariablesConfig = {
  ingresos: {
    label: 'Ingresos',
    color: '#10b981', // Verde
    order: 1
  },
  gastos: {
    label: 'Gastos',
    color: '#ef4444', // Rojo
    order: 2
  },
  utilidad: {
    label: 'Utilidad Neta',
    color: '#3b82f6', // Azul
    order: 3
  },
  ebitda: {
    label: 'EBITDA',
    color: '#f59e0b', // Amarillo/Naranja
    order: 4
  },
  activos: {
    label: 'Activos Totales',
    color: '#8b5cf6', // Morado
    order: 5
  },
  pasivos: {
    label: 'Pasivos Totales',
    color: '#ec4899', // Rosa
    order: 6
  }
}

// ✅ CONFIGURACIÓN DE VENTAS
export const salesVariablesConfig = {
  ventasNetas: {
    label: 'Ventas Netas',
    color: '#10b981',
    order: 1
  },
  ventasBrutas: {
    label: 'Ventas Brutas',
    color: '#3b82f6',
    order: 2
  },
  devoluciones: {
    label: 'Devoluciones',
    color: '#ef4444',
    order: 3
  },
  descuentos: {
    label: 'Descuentos',
    color: '#f59e0b',
    order: 4
  }
}

// ✅ CONFIGURACIÓN DE RECURSOS HUMANOS
export const hrVariablesConfig = {
  empleados: {
    label: 'Número de Empleados',
    color: '#3b82f6',
    order: 1
  },
  contrataciones: {
    label: 'Contrataciones',
    color: '#10b981',
    order: 2
  },
  bajas: {
    label: 'Bajas',
    color: '#ef4444',
    order: 3
  },
  rotacion: {
    label: 'Tasa de Rotación (%)',
    color: '#f59e0b',
    order: 4
  }
}

// ✅ CONFIGURACIÓN DE MARKETING
export const marketingVariablesConfig = {
  leads: {
    label: 'Leads Generados',
    color: '#3b82f6',
    order: 1
  },
  conversiones: {
    label: 'Conversiones',
    color: '#10b981',
    order: 2
  },
  inversionMarketing: {
    label: 'Inversión en Marketing',
    color: '#f59e0b',
    order: 3
  },
  roi: {
    label: 'ROI (%)',
    color: '#8b5cf6',
    order: 4
  }
}

// ✅ CONFIGURACIÓN DE PRODUCCIÓN
export const productionVariablesConfig = {
  unidadesProducidas: {
    label: 'Unidades Producidas',
    color: '#3b82f6',
    order: 1
  },
  defectos: {
    label: 'Productos Defectuosos',
    color: '#ef4444',
    order: 2
  },
  eficiencia: {
    label: 'Eficiencia (%)',
    color: '#10b981',
    order: 3
  },
  tiempoProduccion: {
    label: 'Tiempo Promedio (hrs)',
    color: '#f59e0b',
    order: 4
  }
}

// ✅ FUNCIÓN HELPER PARA CREAR CONFIGURACIONES PERSONALIZADAS
export const createCustomConfig = (variables) => {
  const config = {}
  variables.forEach((variable, index) => {
    config[variable.key] = {
      label: variable.label,
      color: variable.color,
      order: variable.order || index + 1
    }
  })
  return config
}

// ✅ PALETA DE COLORES PREDEFINIDOS
export const colorPalette = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  indigo: '#6366f1',
  orange: '#fb923c',
  cyan: '#06b6d4'
}