// src/dataConection/storageConfig.js
// ✅ ACTUALIZADO con configuración correcta para ITAEE y SOCIALES

console.log('API Key:', import.meta.env.VITE_GOOGLE_SHEETS_API_KEY)
console.log('Sheet ID Principal:', import.meta.env.VITE_GOOGLE_SHEET_ID)
console.log('Sheet ID Cuantitativos:', import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS)
console.log('Sheet ID Incendios Forestales:', import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_INCENDIOS_FORESTALES)
console.log('Sheet ID Residuos Sólidos:', import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_RESIDUOS_SOLIDOS)
console.log('Sheet ID Emisiones:', import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_EMISIONES)
console.log('Sheet ID Energía:', import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_ENERGIA)
console.log('Sheet ID Áreas Naturales:', import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_AREAS_NATURALES)
console.log('Provider:', import.meta.env.VITE_STORAGE_PROVIDER)

// ✅ Variable global para el año activo
let currentActiveYear = '2024'

export const storageConfig = {
  provider: import.meta.env.VITE_STORAGE_PROVIDER || 'googlesheets',
  
  googlesheets: {
    apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
    
    sheets: {
      principal: {
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
        files: {
          datosFinancieros: 'Hoja 1',
          presupuesto: 'Hoja 1',
          indicadores: 'Hoja 1',
          gastos: 'Gastos',
          estados: 'Estados'
        }
      },
      cuantitativos: {
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_CUANTITATIVOS,
        files: {
          datosCuantitativos: '2024',
          chartsPresupuestos: '2024', 
          chartsIngresos: '2024'  
        }
      },
      // Configuración modular para cada componente ambiental
      ambientales: {
        incendiosForestales: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_INCENDIOS_FORESTALES,
          files: {
            incendiosForestales: '2024'
          }
        },
        residuosSolidos: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_RESIDUOS_SOLIDOS,
          files: {
            residuosSolidos: '2024'
          }
        },
        emisiones: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_EMISIONES,
          files: {
            emisiones: '2024'
          }
        },
        energia: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_ENERGIA,
          files: {
            energia: '2024'
          }
        },
        areasNaturales: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_AMBIENTALES_AREAS_NATURALES,
          files: {
            areasNaturales: '2024'
          }
        }
      },
      economicos: {
        ingresoTotal: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_ECONOMICOS_INGRESO_TOTAL,
          files: {
            ingresoTotal: '2024'
          }
        },
        egresoTotal: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_ECONOMICOS_EGRESO_TOTAL,
          files: {
            egresoTotal: '2024'
          }
        },
        pea: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_ECONOMICOS_PEA,
          files: {
            pea: '2024'
          }
        },
        pib: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_ECONOMICOS_PIBE,
          files: {
            pib: '2024'
          }
        },
        itaee: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_ECONOMICOS_ITAEE,
          files: {
            itaee: '2024'
          }
        }
      },
      sociales: {
        desocupacion: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_SOCIALES_DESOCUPACION,
          files: {
            desocupacion: '2024'
          }
        },
        marginacion: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_SOCIALES_MARGINACION,
          files: {
            marginacion: '2024'
          }
        },
        idh: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_SOCIALES_IDH,
          files: {
            idh: '2024'
          }
        },
        rezagoSocial: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_SOCIALES_REZAGO_SOCIAL,
          files: {
            rezagoSocial: '2024'
          }
        },
        indiceGini: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_SOCIALES_INDICE_GINI,
          files: {
            indiceGini: '2024'
          }
        },
        poblacion: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_SOCIALES_POBLACION,
          files: {
            poblacion: '2024'
          }
        }
      },
    },
    
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
    files: {
      datosFinancieros: 'Hoja 1',
      presupuesto: 'Hoja 1',
      indicadores: 'Indicadores',
      gastos: 'Gastos',
      estados: 'Estados',
      datosCuantitativos: '2024',
      chartsPresupuestos: '2024',
      chartsIngresos: '2024',
      incendiosForestales: '2024',
      residuosSolidos: '2024',
      emisiones: '2024',
      energia: '2024',
      areasNaturales: '2024',
      ingresoTotal: '2024',
      egresoTotal: '2024',
      pea: '2024',
      pib: '2024',
      itaee: '2024'
    }
  },
  
  mappings: {
    //CUALITATIVOS - ECONOMICOS
    ingresoTotal: {
      categoryColumn: 'Entidad Federativa',
            variables: [
        {
          key: 'Ingresos',
          column: 'Ingresos',
          label: 'Ingresos',
          color: '#0F3759',
          colorClass: 'blue',
          order: 1
        },
        {
          key: 'Egresos',
          column: 'Egresos',
          label: 'Egresos',
          color: '#3B5A70',
          colorClass: 'blue',
          order: 1
        },
      ]
    },
    egresoTotal: {
      categoryColumn: 'Entidad Federativa',
      valueColumn: 'Egresos',
    },
    pea: {
      categoryColumn: 'Entidad Federativa',
      valueColumn: 'Personas',
    },
    pib: {
      categoryColumn: 'Entidad Federativa',
      valueColumn: 'PIBE',
      variables: [
        {
          key: 'PIBE',
          column: 'PIBE',
          label: 'PIB Estatal',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    // ✅ CORREGIDO: ITAEE con estructura de variables para VerticalBarChart
    itaee: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'variacion',
          column: 'Variación porcentual anual',
          label: 'Variación %',
          color: '#0F3759',
          colorClass: 'blue',
          order: 1
        }
      ]
    },

    //CUALITATIVOS - SOCIALES
    desocupacion: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Tasa de desocupación',
          column: 'Tasa de desocupación',
          label: 'Tasa de desocupación',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'Tasa de informalidad laboral',
          column: 'Tasa de informalidad laboral',
          label: 'Tasa de informalidad laboral',
          color: '#3B5A70',
          order: 2
        },
        {
          key: 'Tasa de participación',
          column: 'Tasa de participación',
          label: 'Tasa de participación',
          color: '#4E6D82',
          order: 3
        }
      ]
    },
    marginacion: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Índice de Marginación',
          column: 'Índice de Marginación',
          label: 'Índice de Marginación',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'Grado de marginación',
          column: 'Grado de marginación',
          label: 'Grado de marginación',
          color: '#3B5A70',
          order: 2
        },
        {
          key: 'Índice de marginación normalizado',
          column: 'Índice de marginación normalizado',
          label: 'Índice de marginación normalizado',
          color: '#4E6D82',
          order: 3
        }
      ]
    },
    idh: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Índice de Desarrollo Humano',
          column: 'Índice de Desarrollo Humano',
          label: 'Índice de Desarrollo Humano',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    rezagoSocial: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Índice de Rezago Social',
          column: 'Índice de Rezago Social',
          label: 'Índice de Rezago Social',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'Grado de Rezago Social',
          column: 'Grado de Rezago Social',
          label: 'Grado de Rezago Social',
          color: '#0F3759',
          order: 2
        }
      ]
    },
    indiceGini: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'CONEVAL 2020',
          column: 'CONEVAL 2020',
          label: 'CONEVAL 2020',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'PNUD 2022',
          column: 'PNUD 2022',
          label: 'PNUD 2022',
          color: '#0F3759',
          order: 2
        }
      ]
    },
    poblacion: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Personas',
          column: 'Personas',
          label: 'Personas',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    //CUALITATIVOS - AMBIENTALES
    // Mapping para Incendios Forestales (HorizontalBarChart)
    incendiosForestales: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'arbolado',
          column: 'Arbolado Adulto',
          label: 'Arbolado Adulto',
          color: '#0F3759',
          colorClass: 'blue',
          order: 1
        },
        {
          key: 'renuevo',
          column: 'Renuevo',
          label: 'Renuevo',
          color: '#3B5A70',
          colorClass: 'blue',
          order: 2
        },
        {
          key: 'arbustivo',
          column: 'Arbustivo',
          label: 'Arbustivo',
          color: '#4E6D82',
          colorClass: 'blue',
          order: 3
        },
        {
          key: 'herbaceo',
          column: 'Herbaceo',
          label: 'Herbaceo',
          color: '#D6D6D6',
          colorClass: 'gray',
          order: 4
        },
        {
          key: 'hojarasca',
          column: 'Hojarasca',
          label: 'Hojarasca',
          color: '#A1A1A1',
          colorClass: 'gray',
          order: 5
        },
        {
          key: 'total',
          column: 'Total de Hectáreas',
          label: 'Total de Hectáreas',
          color: '#B0B0B0',
          colorClass: 'gray',
          order: 6
        }
      ]
    },

    // Mapping para Residuos Sólidos Urbanos (BottleChart)
    residuosSolidos: {
      categoryColumn: 'Entidad Federativa',
      valueColumn: 'Sólidos Urbanos',
    },

    // Mapping para Emisiones Contaminantes (AreaChart)
    emisiones: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Fuentes Fijas',
          column: 'Fuentes Fijas',
          label: 'Fuentes Fijas',
          color: '#DC143C',
          order: 1
        },
        {
          key: 'Fuente Áerea',
          column: 'Fuente Áerea',
          label: 'Fuente Áerea',
          color: '#0F3759',
          order: 2
        },
        {
          key: 'Carreteros',
          column: 'Carreteros',
          label: 'Carreteros',
          color: '#7cb342',
          order: 3
        },
        {
          key: 'No Carreteros',
          column: 'No Carreteros',
          label: 'No Carreteros',
          color: '#FF9800',
          order: 4
        },
        {
          key: 'Naturales',
          column: 'Naturales',
          label: 'Naturales',
          color: '#9C27B0',
          order: 5
        }
      ]
    },

    // ✅ NUEVO: Mapping para Consumo de Energía Eléctrica (GaugeChart)
    energia: {
      categoryColumn: 'Entidad Federativa',
      valueColumn: 'Consumo Energía'
    },

    // ✅ NUEVO: Mapping para Áreas Naturales Protegidas (VerticalBarChart)
    areasNaturales: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Flora y fauna',
          column: 'Flora y fauna',
          label: 'Flora y fauna',
          color: '#0F3759',
          colorClass: 'blue',
          order: 1
        },
        {
          key: 'Recursos naturales',
          column: 'Recursos naturales',
          label: 'Recursos naturales',
          color: '#3B5A70',
          colorClass: 'blue',
          order: 2
        },
        {
          key: 'Monumento Natural',
          column: 'Monumento Natural',
          label: 'Monumento Natural',
          color: '#4E6D82',
          colorClass: 'blue',
          order: 3
        },
        {
          key: 'Parque Nacional',
          column: 'Parque Nacional',
          label: 'Parque Nacional',
          color: '#B0B0B0',
          colorClass: 'gray',
          order: 4
        },
        {
          key: 'Reserva de la biósfera',
          column: 'Reserva de la biósfera',
          label: 'Reserva de la biósfera',
          color: '#0F3759',
          colorClass: 'blue',
          order: 5
        },
        {
          key: 'Santuario',
          column: 'Santuario',
          label: 'Santuario',
          color: '#3B5A70',
          colorClass: 'gray',
          order: 6
        }
      ]
    },

    // ... resto de mappings existentes
    chartsPresupuestos: {
      stateColumn: 'Entidad Federativa',
      variableColumns: [
        {
          key: 'presupuesto_total',
          column: 'PT ($)',
          label: 'Presupuesto Total',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'presupuesto_sostenible',
          column: 'PS ($)',
          label: 'Presupuesto Sostenible',
          colorClass: 'green',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'presupuesto_carbono',
          column: 'PIC ($)',
          label: 'Presupuestos Intensivos en Carbono',
          colorClass: 'red',
          color: '#DC143C',
          order: 3
        }
      ],
      donutSectorsPS: [
        {
          key: 'ps_desastres',
          column: 'PS_DN',
          label: 'Desastres Naturales',
          colorClass: 'dark-green',
          color: '#558b2f'
        },
        {
          key: 'ps_proteccion',
          column: 'PS_PA',
          label: 'Protección Ambiental',
          colorClass: 'green',
          color: '#7cb342'
        }
      ],
      donutSectorsPIC: [
        {
          key: 'pic_combustible',
          column: 'PIC_C',
          label: 'Combustible',
          colorClass: 'dark-red',
          color: '#b71c1c'
        },
        {
          key: 'pic_mineria',
          column: 'PIC_M',
          label: 'Minería',
          colorClass: 'red',
          color: '#DC143C'
        },
        {
          key: 'pic_transporte',
          column: 'PIC_T',
          label: 'Transporte',
          colorClass: 'light-red',
          color: '#ef5350'
        }
      ]
    },
    
    chartsIngresos: {
      stateColumn: 'Entidad Federativa',
      variableColumns: [
        {
          key: 'ingresos_total',
          column: 'IT ($)',
          label: 'Ingresos Total',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'ingresos_sostenibles',
          column: 'IS ($)',
          label: 'Ingresos Sostenibles',
          colorClass: 'green',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'ingresos_carbono',
          column: 'IIC ($)',
          label: 'Ingresos Intensivos en Carbono',
          colorClass: 'red',
          color: '#DC143C',
          order: 3
        }
      ],
      donutSectorsIS: [
        {
          key: 'is_ambiental',
          column: 'IS_A',
          label: 'Ambiental',
          colorClass: 'dark-green',
          color: '#558b2f'
        },
        {
          key: 'is_ecologico',
          column: 'IS_E',
          label: 'Ecológico',
          colorClass: 'green',
          color: '#7cb342'
        },
        {
          key: 'is_movilidad',
          column: 'IS_MS',
          label: 'Movilidad Sustentable',
          colorClass: 'light-green',
          color: '#9ccc65'
        }
      ],
      donutSectorsIIC: [
        {
          key: 'iic_hidrocarburos',
          column: 'IIC_H',
          label: 'Hidrocarburos',
          colorClass: 'dark-red',
          color: '#b71c1c'
        },
        {
          key: 'iic_mineria',
          column: 'IIC_M',
          label: 'Minería',
          colorClass: 'red',
          color: '#DC143C'
        },
        {
          key: 'iic_transporte',
          column: 'IIC_T',
          label: 'Transporte',
          colorClass: 'light-red',
          color: '#ef5350'
        }
      ]
    },
    
    rankingCuantitativo: {
      stateColumn: 'Entidad Federativa',
      columnsByVariable: {
        'IFSS': 'IFSS',
        'PS': 'PS (%)',
        'IIC': 'IIC (%)',
        'PIC': 'PIC (%)',
        'IS': 'IS (%)'
      },
      variableColumns: [
        {
          key: 'IFSS',
          column: 'IFSS',
          label: 'IFSS',
          color: '#0F3759',
          colorClass: 'blue',
          order: 1
        }
      ]
    },
    
    iicBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'iic_c',
          column: 'IIC_C',
          label: 'IIC_C',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'iic_h',
          column: 'IIC_H',
          label: 'IIC_H',
          color: '#3B5A70',
          order: 2
        },
        {
          key: 'iic_m',
          column: 'IIC_M',
          label: 'IIC_M',
          color: '#6B8FA3',
          order: 3
        }
      ]
    },
    
    iicStackedArea: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'IIC Total',
          column: 'IIC ($)',
          label: 'IIC Total',
          color: '#3B5A70',
        },
        {
          key: 'Ingreso Total',
          column: 'IT ($)',
          label: 'Ingreso Total',
          color: '#0F3759'
        }
      ]
    },

    ifssStackedArea: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'IFS',
          column: 'IFS',
          label: 'IFS',
          color: '#10b981'
        }
      ]
    },
    
    presupuestoBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'IS',
          column: 'IS($)', 
          label: 'IS',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    
    picBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'PIC',
          column: 'PIC ($)', 
          label: 'PIC',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    
    psBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'PS',
          column: 'PS ($)', 
          label: 'PS',
          color: '#6B8FA3',
          order: 1
        }
      ]
    },
    
    isLinearChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'IS_Total',
          column: 'IS($)',
          label: 'IS Total'
        },
        {
          key: 'Financiemiento_Total',
          column: 'FT ($)',
          label: 'Financiamiento Total'
        }
      ]
    },
    
    pspicLinearChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'GT',
          column: 'GT ($)',
          label: 'Gasto Total'
        },
        {
          key: 'PS',
          column: 'PS ($)',
          label: 'Presupuestos Sostenibles'
        },
        {
          key: 'PIC',
          column: 'PIC ($)',
          label: 'Presupuestos Intensivos en Carbono'
        }
      ]
    },
    
    presupuestoDetalleBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'asignado',
          column: 'Presupuesto Asignado',
          label: 'Asignado',
          color: '#4CAF50',
          order: 1
        },
        {
          key: 'ejecutado',
          column: 'Presupuesto Ejecutado',
          label: 'Ejecutado',
          color: '#2196F3',
          order: 2
        },
        {
          key: 'disponible',
          column: 'Presupuesto Disponible',
          label: 'Disponible',
          color: '#FF9800',
          order: 3
        }
      ]
    },
    
    roiLinearChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'roi',
          column: 'ROI (%)',
          label: 'Retorno de Inversión'
        },
        {
          key: 'benchmark',
          column: 'Benchmark Industria (%)',
          label: 'Benchmark'
        }
      ]
    },
    
    gastosStackedArea: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'personal',
          column: 'Gastos Personal',
          label: 'Personal'
        },
        {
          key: 'operacion',
          column: 'Gastos Operación',
          label: 'Operación'
        },
        {
          key: 'inversion',
          column: 'Gastos Inversión',
          label: 'Inversión'
        },
        {
          key: 'otros',
          column: 'Otros Gastos',
          label: 'Otros'
        }
      ]
    },
    
    estadosBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'cdmx',
          column: 'Ciudad de México',
          label: 'CDMX',
          color: '#FF5722',
          order: 1
        },
        {
          key: 'jalisco',
          column: 'Jalisco',
          label: 'Jalisco',
          color: '#00BCD4',
          order: 2
        },
        {
          key: 'nuevoLeon',
          column: 'Nuevo León',
          label: 'Nuevo León',
          color: '#8BC34A',
          order: 3
        }
      ]
    }
  },
  
  variablesConfig: {
    federal: { label: 'Federal', color: '#0F3759', order: 1 },
    estatal: { label: 'Estatal', color: '#3B5A70', order: 2 },
    municipal: { label: 'Municipal', color: '#6B8FA3', order: 3 },
    asignado: { label: 'Asignado', color: '#4CAF50', order: 1 },
    ejecutado: { label: 'Ejecutado', color: '#2196F3', order: 2 },
    disponible: { label: 'Disponible', color: '#FF9800', order: 3 },
    personal: { label: 'Personal', color: '#E91E63', order: 1 },
    operacion: { label: 'Operación', color: '#9C27B0', order: 2 },
    inversion: { label: 'Inversión', color: '#3F51B5', order: 3 },
    otros: { label: 'Otros', color: '#607D8B', order: 4 }
  }
}

export function setActiveYear(year) {
  console.log('📅 [storageConfig] Estableciendo año activo:', year)
  currentActiveYear = year || '2024'
}

export function getActiveYear() {
  return currentActiveYear
}

export function getCurrentConfig() {
  const provider = storageConfig.provider
  if (!provider) throw new Error('Provider no configurado en storageConfig.js')
  const providerConfig = storageConfig[provider]
  if (!providerConfig) throw new Error(`Configuración no encontrada para provider: ${provider}`)
  return {
    provider,
    ...providerConfig,
    mappings: storageConfig.mappings,
    variablesConfig: storageConfig.variablesConfig
  }
}

// ✅ ACTUALIZADO: Ahora busca en economicos, sociales y ambientales
export function getSheetIdForFile(fileKey) {
  const config = storageConfig.googlesheets
  
  // ✅ PRIMERO: Buscar en sheets modulares de ECONOMICOS
  if (config.sheets && config.sheets.economicos) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.economicos)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en economicos.${componentKey}`)
        return componentConfig.sheetId
      }
    }
  }
  
  // ✅ SEGUNDO: Buscar en sheets modulares de SOCIALES
  if (config.sheets && config.sheets.sociales) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.sociales)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en sociales.${componentKey}`)
        return componentConfig.sheetId
      }
    }
  }
  
  // ✅ TERCERO: Buscar en sheets modulares de AMBIENTALES
  if (config.sheets && config.sheets.ambientales) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.ambientales)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en ambientales.${componentKey}`)
        return componentConfig.sheetId
      }
    }
  }
  
  // Buscar en sheets de cuantitativos
  if (config.sheets && config.sheets.cuantitativos) {
    if (config.sheets.cuantitativos.files && config.sheets.cuantitativos.files[fileKey]) {
      console.log(`📄 Archivo "${fileKey}" encontrado en cuantitativos`)
      console.log(`📅 Usando año activo: ${currentActiveYear}`)
      return config.sheets.cuantitativos.sheetId
    }
  }
  
  // Buscar en sheets principales
  if (config.sheets && config.sheets.principal) {
    if (config.sheets.principal.files && config.sheets.principal.files[fileKey]) {
      console.log(`📄 Archivo "${fileKey}" encontrado en principal`)
      return config.sheets.principal.sheetId
    }
  }
  
  console.log(`📄 Usando sheet principal para "${fileKey}"`)
  return config.sheetId
}

// ✅ ACTUALIZADO: Retornar año dinámico para TODOS los sheets de ambientales, economicos y sociales
export function getSheetName(fileKey) {
  const config = storageConfig.googlesheets
  
  // Lista de archivos que usan año dinámico
  const dynamicYearFiles = [
    'datosCuantitativos',
    'chartsPresupuestos',
    'chartsIngresos',
    // Archivos ambientales
    'incendiosForestales',
    'residuosSolidos',
    'emisiones',
    'energia',
    'areasNaturales',
    // Archivos económicos
    'ingresoTotal',
    'egresoTotal',
    'pea',
    'pibe',
    'itaee',
    // Archivos sociales
    'desocupacion',
    'marginacion',
    'idh',
    'rezagoSocial',
    'indiceGini',
    'poblacion'
  ]
  
  if (dynamicYearFiles.includes(fileKey)) {
    console.log(`📅 Nombre de hoja dinámico para "${fileKey}": ${currentActiveYear}`)
    return currentActiveYear
  }
  
  // Buscar en configuración modular de sociales
  if (config.sheets && config.sheets.sociales) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.sociales)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        return componentConfig.files[fileKey]
      }
    }
  }
  
  // Buscar en configuración modular de economicos
  if (config.sheets && config.sheets.economicos) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.economicos)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        return componentConfig.files[fileKey]
      }
    }
  }

  // Buscar en configuración modular de ambientales
  if (config.sheets && config.sheets.ambientales) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.ambientales)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        return componentConfig.files[fileKey]
      }
    }
  }
  
  // Buscar en configuración de cuantitativos
  if (config.sheets && config.sheets.cuantitativos) {
    if (config.sheets.cuantitativos.files && config.sheets.cuantitativos.files[fileKey]) {
      return config.sheets.cuantitativos.files[fileKey]
    }
  }
  
  // Buscar en configuración principal
  if (config.sheets && config.sheets.principal) {
    if (config.sheets.principal.files && config.sheets.principal.files[fileKey]) {
      return config.sheets.principal.files[fileKey]
    }
  }
  
  return config.files[fileKey] || fileKey
}

export function getMapping(mappingName) {
  const mapping = storageConfig.mappings[mappingName]
  if (!mapping) throw new Error(`Mapeo no encontrado: ${mappingName}`)
  return mapping
}

export function getVariableConfig(variableKey) {
  return storageConfig.variablesConfig[variableKey] || null
}

export function getAllFileKeys() {
  const config = getCurrentConfig()
  return Object.keys(config.files)
}

export function getAllMappings() {
  return Object.keys(storageConfig.mappings)
}

export function validateConfig() {
  const provider = storageConfig.provider
  if (!provider) return { valid: false, error: 'Provider no configurado' }
  if (!['onedrive', 'sharepoint', 'googlesheets'].includes(provider)) {
    return { valid: false, error: `Provider inválido: ${provider}` }
  }
  const config = storageConfig[provider]
  if (!config) return { valid: false, error: `Configuración no encontrada para ${provider}` }
  if (provider === 'googlesheets') {
    if (!config.apiKey) {
      return { valid: false, error: 'Google Sheets: falta apiKey' }
    }
    if (!config.sheetId && !config.sheets) {
      return { valid: false, error: 'Google Sheets: falta sheetId o sheets' }
    }
  }
  return { valid: true }
}

export default storageConfig