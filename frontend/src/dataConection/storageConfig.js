// src/dataConection/storageConfig.js
// ✅ ACTUALIZADO con búsqueda en CUALITATIVOS REGIONALES en getSheetIdForFile y getSheetName

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
          chartsIngresos: '2024', 
          posicionesCuantitativos: '2024'  
        }
      },
      cuantitativosRegional: {
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
        files: {
          chartsPresupuestosRegional: 'Hoja 1', 
          chartsIngresosRegional: 'Hoja 1',
          cardIFSRegional: 'Hoja 1'
        }
      },
      cuantitativosInternacional: {
        sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_RANKING_INTERNACIONAL,
        files: {
          datosInternacionales: '2020'
        }
      },
      // ✅ CUALITATIVOS REGIONALES
      cualitativoRegional: {
        estatusDelPais: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_REGIONALES_ESTATUSDELPAIS,
          files: {
            estatusDelPais: '2024'
          }
        },
        ambientalesRegional: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_REGIONALES_AMBIENTALES,
          files: {
            ambientalesRegional: '2024'
          }
        },
        socialesRegional: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_REGIONALES_SOCIALES,
          files: {
            socialesRegional: '2024'
          }
        },
        economicosRegional: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_REGIONALES_ECONOMICOS,
          files: {
            economicosRegional: '2024'
          }
        },
        financiamientoRegional: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_REGIONALES_FINANCIAMIENTO,
          files: {
            financiamientoRegional: '2024'
          }
        }
      },
      // Configuración modular para cada componente cualitativos
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
      gobernabilidad: {
        satisfaccionFederal: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_GOB_SATISFACCION_FEDERAL,
          files: {
            satisfaccionFederal: '2024'
          }
        },
        satisfaccionEstatal: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_GOB_SATISFACCION_ESTATAL,
          files: {
            satisfaccionEstatal: '2024'
          }
        },
        IGOPP: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_GOB_IGOPP,
          files: {
            IGOPP: '2024'
          }
        },
        BIPE: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_GOB_BIPE,
          files: {
            BIPE: '2024'
          }
        },
        ITDIF: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_GOB_ITDIF,
          files: {
            ITDIF: '2024'
          }
        },
        ICI: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_GOB_ICI,
          files: {
            ICI: '2024'
          }
        },
        PBRSED: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_GOB_PBRSED,
          files: {
            PBRSED: '2024'
          }
        }
      },
      // PRESUPUESTOS
      presupuestos: {
        presupuestoEstatal: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_PRESUPUESTO_PRESUPUESTO_ESTATAL,
          files: {
            presupuestoEstatal: '2024'
          }
        },
        financiamientos: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_PRESUPUESTO_FINANCIAMIENTOS,
          files: {
            financiamientos: '2024'
          }
        },
        programas: {
          sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID_PRESUPUESTO_PROGRAMAS,
          files: {
            programas: '2024'
          }
        }
      }
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
      posicionesCuantitativos: '2024',
      incendiosForestales: '2024',
      residuosSolidos: '2024',
      emisiones: '2024',
      energia: '2024',
      areasNaturales: '2024',
      ingresoTotal: '2024',
      egresoTotal: '2024',
      pea: '2024',
      pib: '2024',
      itaee: '2024',
      satisfaccionFederal: '2024',
      satisfaccionEstatal: '2024',
      IGOPP: '2024',
      BIPE: '2024',
      ITDIF: '2024',
      ICI: '2024',
      PBRSED: '2024',
      presupuestoEstatal: '2024',
      financiamientos: '2024',
      programas: '2024',
      chartsPresupuestosRegional: 'Hoja 1',
      chartsIngresosRegional: 'Hoja 1',
      cardIFS: 'Hoja 1',
      estatusDelPais: '2024',
      ambientalesRegional: '2024',
      socialesRegional: '2024',
      economicosRegional: '2024',
      financiamientoRegional: '2024',
      datosInternacionales: '2024'
    }
  },
  
  mappings: {
    // ✅ CUALITATIVOS REGIONALES - Estatus del país
    estatusDelPais: {
      categoryColumn: 'País',
      variables: [
        {
          key: 'NDC',
          column: 'NDC',
          label: 'Contribuciones Nacionalmente Determinadas',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'TIPO_METAS',
          column: 'TIPO_METAS',
          label: 'Metas en NDC',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'METAS_ADP',
          column: 'METAS_ADP',
          label: 'Metas de adaptación',
          color: '#DC143C',
          order: 3
        },
        {
          key: 'C_NDC',
          column: 'C_NDC',
          label: 'Costo estimado de las NDC',
          color: '#0F3759',
          order: 4
        },
        {
          key: 'LEGCC',
          column: 'LEGCC',
          label: 'Legislación en Cambio Climático',
          color: '#3B5A70',
          order: 5
        },
        {
          key: 'AICC',
          column: 'AICC',
          label: 'Arreglos institucionales para Cambio Climático',
          color: '#4E6D82',
          order: 6
        },
        {
          key: 'TP',
          column: 'TP',
          label: 'Índice de transparencia presupuestaria',
          color: '#6B8FA3',
          order: 7
        },
        {
          key: 'POS_ETCO2',
          column: 'POS_ETCO2',
          label: 'Posición por emisiones de CO2',
          color: '#DC143C',
          order: 8
        },
        {
          key: 'POS_ETGEI',
          column: 'POS_ETGEI',
          label: 'Posición por emisiones de GEI',
          color: '#b71c1c',
          order: 9
        }
      ]
    },

        // ✅ CUALITATIVOS REGIONALES - Ambientales
    ambientalesRegional: {
      categoryColumn: 'País',
      variables: [
        {
          key: 'IRC',
          column: 'IRC',
          label: 'Índice de Riesgo Climático',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'TARN',
          column: 'TARN',
          label: 'Tasa de Agotamiento de los Recursos Naturales',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'GEI_EN',
          column: 'GEI_EN',
          label: 'Emisiones GEI en el sector energía',
          color: '#DC143C',
          order: 3
        },
        {
          key: 'GEI_AGUT',
          column: 'GEI_AGUT',
          label: 'Emisiones GEI en el sector agricultura, ganadería y sus de la tierra.',
          color: '#0F3759',
          order: 4
        },
        {
          key: 'GEI_PI',
          column: 'GEI_PI',
          label: 'Emisiones GEI en el sector procesos industriales',
          color: '#3B5A70',
          order: 5
        },
        {
          key: 'GEI_RE',
          column: 'GEI_RE',
          label: 'Emisiones GEI en el sector residuos',
          color: '#4E6D82',
          order: 6
        },
        {
          key: 'CTE',
          column: 'CTE',
          label: 'Consumo total de energía en MWh/per cápita',
          color: '#6B8FA3',
          order: 7
        },
        {
          key: 'CCF',
          column: 'CCF',
          label: 'Consumo de energía por combustibles fósiles',
          color: '#DC143C',
          order: 8
        },
        {
          key: 'CER',
          column: 'CER',
          label: 'Consumo de energía por energía renovable',
          color: '#b71c1c',
          order: 9
        },
        {
          key: 'ECO2',
          column: 'ECO2',
          label: 'Emisiones anuales de CO2 en toneladas',
          color: '#b71c1c',
          order: 10
        },
        {
          key: 'ECO2PC',
          column: 'ECO2PC',
          label: 'Emisiones per cápita de CO2',
          color: '#b71c1c',
          order: 11
        }
      ]
    },
    // ✅ CUALITATIVOS REGIONALES - Sociales
    socialesRegional: {
      categoryColumn: 'País',
      variables: [
        {
          key: 'POB',
          column: 'POB',
          label: 'Número de habitantes',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'TD',
          column: 'TD',
          label: 'Tasa de Desempleo',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'MCA',
          column: 'MCA',
          label: 'Mortalidad por Contaminación Atmosférica (muertes anuales por cada 100,000 habitantes) ',
          color: '#DC143C',
          order: 3
        },
        {
          key: 'IDH',
          column: 'IDH',
          label: 'Posición final en el Índice de Desarrollo Humano',
          color: '#0F3759',
          order: 4
        },
        {
          key: 'IBG',
          column: 'IBG',
          label: 'Posición final en el Índice de Brechas de Género',
          color: '#3B5A70',
          order: 5
        },
        {
          key: 'IPM',
          column: 'IPM',
          label: 'Posición final en el Índice de Pobreza Multidimensional ',
          color: '#4E6D82',
          order: 6
        }
      ]
    },
     // ✅ CUALITATIVOS REGIONALES - Economicos
    economicosRegional: {
      categoryColumn: 'País',
      variables: [
        {
          key: 'PIB',
          column: 'PIB',
          label: 'Producto Interno Bruto en dólares',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'PIBPC',
          column: 'PIBPC',
          label: 'Producto Interno Bruto per cápita en dólares',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'IT',
          column: 'IT',
          label: 'Ingreso total en dólares',
          color: '#DC143C',
          order: 3
        },
        {
          key: 'ITPC',
          column: 'ITPC',
          label: 'Ingreso per cápita en dólares',
          color: '#0F3759',
          order: 4
        },
        {
          key: 'PT',
          column: 'PT',
          label: 'Presupuesto total en dólares ',
          color: '#3B5A70',
          order: 5
        },
        {
          key: 'PTPC',
          column: 'PTPC',
          label: 'Presupuesto total per cápita en dólares ',
          color: '#4E6D82',
          order: 6
        }
      ]
    },

    // ✅ CUALITATIVOS REGIONALES - Financiamiento
    financiamientoRegional: {
      categoryColumn: 'País',
      variables: [
        {
          key: 'FVC',
          column: 'FVC',
          label: 'Fondo Verde del Clima en dólares',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'FMAM',
          column: 'FMAM',
          label: 'Facilidad para el Medio Ambiente Mundial en dólares',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'FIC',
          column: 'FIC',
          label: 'Fondo de Inversión Climática en dólares',
          color: '#DC143C',
          order: 3
        },
        {
          key: 'BID',
          column: 'BID',
          label: 'Banco Interamericano de Desarrollo en dólares',
          color: '#0F3759',
          order: 4
        }
      ]
    },

    // CUALITATIVOS - PRESUPUESTO
    presupuestoEstatal: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Presupuesto Total',
          column: 'Presupuesto Total',
          label: 'Presupuesto Total',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    financiamientos: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Agua y drenaje',
          column: 'Agua y drenaje',
          label: 'Agua y drenaje',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'Suelos',
          column: 'Suelos',
          label: 'Suelos',
          color: '#3B5A70',
          order: 2
        },
        {
          key: 'Residuos',
          column: 'Residuos',
          label: 'Residuos',
          color: '#4E6D82',
          order: 3
        },
        {
          key: 'Energía',
          column: 'Energía',
          label: 'Energía',
          color: '#6B8FA3',
          order: 4
        },
        {
          key: 'Atmósfera',
          column: 'Atmósfera',
          label: 'Atmósfera',
          color: '#0F3759',
          order: 5
        },
        {
          key: 'Bioecosistemas',
          column: 'Bioecosistemas',
          label: 'Bioecosistemas',
          color: '#3B5A70',
          order: 6
        },
        {
          key: 'Cambio Climático',
          column: 'Cambio Climático',
          label: 'Cambio Climático',
          color: '#4E6D82',
          order: 7
        },
        {
          key: 'Asentamientos',
          column: 'Asentamientos',
          label: 'Asentamientos',
          color: '#6B8FA3',
          order: 8
        },
        {
          key: 'Eduambiental',
          column: 'Eduambiental',
          label: 'Eduambiental',
          color: '#0F3759',
          order: 9
        },
        {
          key: 'Admsostenible',
          column: 'Admsostenible',
          label: 'Admsostenible',
          color: '#3B5A70',
          order: 10
        },
        {
          key: 'Transporte',
          column: 'Transporte',
          label: 'Transporte',
          color: '#4E6D82',
          order: 11
        },
        {
          key: 'Otros Programas',
          column: 'Otros Programas',
          label: 'Otros Programas',
          color: '#6B8FA3',
          order: 12
        }
      ]
    },
    programas: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Agua y drenaje',
          column: 'Agua y drenaje',
          label: 'Agua y drenaje',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'Suelos',
          column: 'Suelos',
          label: 'Suelos',
          color: '#3B5A70',
          order: 2
        },
        {
          key: 'Residuos',
          column: 'Residuos',
          label: 'Residuos',
          color: '#4E6D82',
          order: 3
        },
        {
          key: 'Energía',
          column: 'Energía',
          label: 'Energía',
          color: '#6B8FA3',
          order: 4
        },
        {
          key: 'Atmósfera',
          column: 'Atmósfera',
          label: 'Atmósfera',
          color: '#0F3759',
          order: 5
        },
        {
          key: 'Bioecosistemas',
          column: 'Bio-ecosistemas',
          label: 'Bioecosistemas',
          color: '#3B5A70',
          order: 6
        },
        {
          key: 'Cambio Climático',
          column: 'Cambio Climático',
          label: 'Cambio Climático',
          color: '#4E6D82',
          order: 7
        },
        {
          key: 'Asentamientos',
          column: 'Asentamientos',
          label: 'Asentamientos',
          color: '#6B8FA3',
          order: 8
        },
        {
          key: 'Eduambiental',
          column: 'Edu-Ambiental',
          label: 'Eduambiental',
          color: '#0F3759',
          order: 9
        },
        {
          key: 'Admsostenible',
          column: 'Admsostenible',
          label: 'Admsostenible',
          color: '#3B5A70',
          order: 10
        },
        {
          key: 'Transporte',
          column: 'Transporte',
          label: 'Transporte',
          color: '#4E6D82',
          order: 11
        },
        {
          key: 'Otros Programas',
          column: 'Otros Programas',
          label: 'Otros Programas',
          color: '#6B8FA3',
          order: 12
        }
      ]
    },

    // CUALITATIVOS - GOBERNABILIDAD
    satisfaccionFederal: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Porcentaje de satisfación',
          column: 'Porcentaje de satisfación',
          label: 'Porcentaje de satisfación',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    satisfaccionEstatal: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'Porcentaje de satisfación',
          column: 'Porcentaje de satisfación',
          label: 'Porcentaje de satisfación',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    IGOPP: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'IGOPP',
          column: 'IGOPP',
          label: 'IGOPP',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    BIPE: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'BIPE',
          column: 'BIPE',
          label: 'BIPE',
          color: '#0F3759',
          order: 1
        }
      ]
    },
    ITDIF: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'ITDIF',
          column: 'ITDIF',
          label: 'ITDIF',
          color: '#0F3759',
          order: 1
        },
      ]
    },
    ICI: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'ICI',
          column: 'ICI',
          label: 'ICI',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'Consistencia en RT',
          column: 'Consistencia en RT',
          label: 'Consistencia en RT',
          color: '#0F3759',
          order: 2
        },
        {
          key: 'Proyectos',
          column: 'Proyectos',
          label: 'Proyectos',
          color: '#0F3759',
          order: 3
        },
        {
          key: 'Indicadores',
          column: 'Indicadores',
          label: 'Indicadores',
          color: '#0F3759',
          order: 4
        }
      ]
    },
    PBRSED: {
      categoryColumn: 'Entidad Federativa',
      variables: [
        {
          key: 'PBRSED',
          column: 'PBRSED',
          label: 'PBRSED',
          color: '#0F3759',
          order: 1
        },
        {
          key: 'Diagnóstico',
          column: 'Diagnóstico',
          label: 'Diagnóstico',
          color: '#0F3759',
          order: 2
        }
      ]
    },
    // CUALITATIVOS - ECONOMICOS
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

    // CUALITATIVOS - SOCIALES
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
    // CUALITATIVOS - AMBIENTALES
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
    residuosSolidos: {
      categoryColumn: 'Entidad Federativa',
      valueColumn: 'Sólidos Urbanos',
    },
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
    energia: {
      categoryColumn: 'Entidad Federativa',
      valueColumn: 'Consumo Energía'
    },
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

    // CUANTITATIVOS
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
    posicionesCuantitativos: {
      stateColumn: 'Entidad Federativa',
      variableColumns: [
        {
          key: 'is_pos',
          column: 'POS_IS',
          label: 'Posicion Ingresos Sostenibles',
          colorClass: 'gray',
          color: '#7cb342',
          order: 1
        },
        {
          key: 'iic_pos',
          column: 'POS_IIC',
          label: 'Posición Ingresos Intensivos en Carbono',
          colorClass: 'green',
          color: '#DC143C',
          order: 2
        },
        {
          key: 'pic_pos',
          column: 'POS_PIC',
          label: 'Posición Presupuestos Intensivos en Carbono',
          colorClass: 'red',
          color: '#DC143C',
          order: 3
        },
        {
          key: 'pic_ps',
          column: 'POS_PS',
          label: 'Posición Presupuestos Sostenibles',
          colorClass: 'red',
          color: '#7cb342',
          order: 4
        }
      ]
    },
    chartsIngresos: {
      stateColumn: 'Entidad Federativa',
      variableColumns: [
        {
          key: 'ingresos_total',
          column: 'IT ($)',
          label: 'Ingreso Total',
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
        },
        {
          key: 'iic_mns',
          column: 'IIC_MNS',
          label: 'Movilidad No Sustentable',
          colorClass: 'light-red',
          color: '#ef5350'
        },
      ]
    },
//CUANTITATIVO INTERNACIONAL
datosInternacionales: {
      categoryColumn: 'País',
      variables: [
        {
          key: 'IFS',
          column: 'IFS',
          label: 'IFS',
          color: '#0F3759',
          colorClass: 'blue',
          order: 1
        }
      ]
    },
// CUANTITATIVOS REGIONALES
    chartsPresupuestosRegional: {
      stateColumn: 'Año',
      variableColumns: [
        {
          key: 'gasto_total_reg',
          column: 'GT ($)',
          label: 'Gasto Total',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'presupuesto_total_reg',
          column: 'PT ($)',
          label: 'Presupuesto Total',
          colorClass: 'gray',
          color: '#6b7280',
          order: 2
        },
        {
          key: 'presupuesto_sostenible_reg',
          column: 'PS ($)',
          label: 'Presupuesto Sostenible',
          colorClass: 'green',
          color: '#7cb342',
          order: 3
        },
        {
          key: 'presupuesto_carbono_reg',
          column: 'PIC ($)',
          label: 'Presupuestos Intensivos en Carbono',
          colorClass: 'red',
          color: '#DC143C',
          order: 4
        }
      ],
      donutSectorsPSRegional: [
        {
          key: 'ps_biodeiversidad_reg',
          column: 'PS_AM',
          label: 'Cambio climático',
          colorClass: 'dark-green',
          color: '#1b5e20'
        },
        {
          key: 'ps_cambio_climatico_reg',
          column: 'PS_CC',
          label: 'Cambio climático',
          colorClass: 'dark-green',
          color: '#2e7d32'
        },
        {
          key: 'ps_eficiencia_energetica_reg',
          column: 'PS_EE',
          label: 'Eficiencia Energética',
          colorClass: 'dark-green',
          color: '#388e3c'
        },
        {
          key: 'ps_energia_renovable_reg',
          column: 'PS_ER',
          label: 'Energía Renovable',
          colorClass: 'dark-green',
          color: '#43a047'
        },
        {
          key: 'ps_gestion_forestal_reg',
          column: 'PS_GF',
          label: 'Gestión Forestal',
          colorClass: 'dark-green',
          color: '#4caf50'
        },
        {
          key: 'ps_conser_oceanos_reg',
          column: 'PS_CO',
          label: 'Convervación de Océanos',
          colorClass: 'dark-green',
          color: '#66bb6a'
        },
        {
          key: 'ps_transporte_sostenible_reg',
          column: 'PS_TS',
          label: 'Transporte Sostenible',
          colorClass: 'dark-green',
          color: '#81c784'
        },
        {
          key: 'ps_desastres_reg',
          column: 'PS_DN',
          label: 'Desastres Naturales',
          colorClass: 'dark-green',
          color: '#a5d6a7'
        },
      ],
      donutSectorsPICRegional: [
        {
          key: 'pic_hidrocarburos_reg',
          column: 'PIC_H',
          label: 'Hidrocarburos',
          colorClass: 'light-red',
          color: '#ef5350'
        }
      ]
    },
    
    chartsIngresosRegional: {
      stateColumn: 'Año',
      variableColumns: [
        {
          key: 'ingresos_total_reg',
          column: 'IT ($)',
          label: 'Ingreso Total',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'ingresos_sostenibles_reg',
          column: 'IS ($)',
          label: 'Ingresos Sostenibles',
          colorClass: 'green',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'ingresos_carbono_reg',
          column: 'IIC ($)',
          label: 'Ingresos Intensivos en Carbono',
          colorClass: 'red',
          color: '#DC143C',
          order: 3
        }
      ],
      donutSectorsISRegional: [
        {
          key: 'is_ftdcc_reg',
          column: 'IS_FTDCC',
          label: 'Financiamiento dedicado al cambio climático',
          colorClass: 'dark-green',
          color: '#558b2f'
        }
      ],
      donutSectorsIICRegional: [
        {
          key: 'iic_hidrocarburos_reg',
          column: 'IIC_H',
          label: 'Hidrocarburos',
          colorClass: 'dark-red',
          color: '#b71c1c'
        },
        {
          key: 'iic_mineria_reg',
          column: 'IIC_M',
          label: 'Minería',
          colorClass: 'red',
          color: '#DC143C'
        },
        {
          key: 'iic_combustible_reg',
          column: 'IIC_C',
          label: 'Combustible',
          colorClass: 'light-red',
          color: '#ef5350'
        }
      ]
    },
    cardIFSRegional: {
      stateColumn: 'Año',
      variableColumns: [
        {
          key: 'ifs_val_reg',
          column: 'IFS',
          label: 'IFS Regional',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'ifs_pos_reg',
          column: 'POS_IFS',
          label: 'Posicion IFS Regional',
          colorClass: 'green',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'is_val_reg',
          column: 'IS ($)',
          label: 'IS Regional',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'is_pos_reg',
          column: 'POS_IS',
          label: 'Posicion IS Regional',
          colorClass: 'green',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'iic_val_reg',
          column: 'IIC ($)',
          label: 'IIC Regional',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'icc_pos_reg',
          column: 'POS_IIC',
          label: 'Posicion IIC Regional',
          colorClass: 'green',
          color: '#7cb342',
          order: 2
        },
        {
          key: 'pic_val_reg',
          column: 'PIC ($)',
          label: 'PIC Regional',
          colorClass: 'gray',
          color: '#9ca3af',
          order: 1
        },
        {
          key: 'pic_pos_reg',
          column: 'POS_PIC',
          label: 'Posicion PIC Regional',
          colorClass: 'green',
          color: '#7cb342',
          order: 2
        },
        {
      key: 'ps_val_reg',
      column: 'PS ($)',
      label: 'PS Regional',
      colorClass: 'green',
      color: '#7cb342',
      order: 9
    },
    {
      key: 'ps_pos_reg',
      column: 'POS_PS',
      label: 'Posicion PS Regional',
      colorClass: 'green',
      color: '#7cb342',
      order: 10
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

 //Historicos  
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
          key: 'Ingreso Total',
          column: 'IT ($)',
          label: 'Ingreso Total',
          color: '#9E9E9E'
        },
        {
          key: 'IIC Total',
          column: 'IIC ($)',
          label: 'IIC Total',
          color: '#DC143C',
          percentageColumn: 'IIC (%)',
          positionColumn: 'POS_IIC'
        },
        {
          key: 'IS Total',
          column: 'IS ($)',
          label: 'IS Total',
          color: '#7cb342',
          percentageColumn: 'IS (%)',
          positionColumn: 'POS_IS'
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
          color: '#10b981',
          positionColumn: 'POS_IFS'
        }
      ]
    },
    
    presupuestoBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'FTDCC',
          column: 'IS_FTDCC', 
          label: 'FTDCC',
          color: '#7cb342',
          order: 1
        }
      ]
    },
    
    picBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'PIC_H',
          column: 'PIC_H', 
          label: 'Hidrocarburos',
          color: '#DC143C',
          order: 1
        }
      ]
    },
    
    psBarChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'PS_AM',
          column: 'PS_AM', 
          label: 'Biodiversidad',
          color: '#1b5e20',
        },
        ,
        {
          key: 'ps_cambio_climatico_hist',
          column: 'PS_CC',
          label: 'Cambio climático',
          colorClass: 'dark-green',
        },
        {
          key: 'PS_EE',
          column: 'PS_EE', 
          label: 'Eficiencia Energética',
          color: '#388e3c',
        },
        {
          key: 'PS_ER',
          column: 'PS_ER', 
          label: 'Energías Renovables',
          color: '#43a047',
        },
        {
          key: 'ps_gestion_forestal_reg',
          column: 'PS_GF',
          label: 'Gestión Forestal',
          colorClass: 'dark-green',
          color: '#4caf50'
        },
        {
          key: 'ps_conser_oceanos_reg',
          column: 'PS_CO',
          label: 'Convervación de Océanos',
          colorClass: 'dark-green',
          color: '#66bb6a'
        },
        {
          key: 'ps_transporte_sostenible_reg',
          column: 'PS_TS',
          label: 'Transporte Sostenible',
          colorClass: 'dark-green',
          color: '#81c784'
        },
        {
          key: 'PS_DN',
          column: 'PS_DN', 
          label: 'Desastres Naturales',
          color: '#a5d6a7',
        }

      ]
    },
    
    isLinearChart: {
      yearColumn: 'Año',
      variableColumns: [
        {
          key: 'IS_Total',
          column: 'IS ($)',
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
          label: 'Gasto Total',
          tooltipLabel: 'Gasto Total',
          color: '#9E9E9E'
        },
        {
          key: 'PIC',
          column: 'PIC ($)',
          label: 'Presupuestos Intensivos en Carbono',
          tooltipLabel: 'PIC',
          color: '#DC143C',
          percentageColumn: 'PIC (%)',
          positionColumn: 'POS_PIC'
        },
        {
          key: 'PS',
          column: 'PS ($)',
          label: 'Presupuestos Sostenibles',
          tooltipLabel: 'PS',
          color: '#7cb342',
          percentageColumn: 'PS (%)',
          positionColumn: 'POS_PS'
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

// ✅ ACTUALIZADO: Ahora busca en TODAS las secciones incluyendo CUALITATIVOS REGIONALES
export function getSheetIdForFile(fileKey) {
  const config = storageConfig.googlesheets
  
  // ✅ NUEVO: Buscar en sheets de CUANTITATIVOS INTERNACIONAL
  if (config.sheets && config.sheets.cuantitativosInternacional) {
    if (config.sheets.cuantitativosInternacional.files && 
        config.sheets.cuantitativosInternacional.files[fileKey]) {
      console.log(`📄 Archivo "${fileKey}" encontrado en cuantitativosInternacional`)
      return config.sheets.cuantitativosInternacional.sheetId
    }
  }
  
  // ✅ Buscar en sheets de CUALITATIVOS REGIONALES
  if (config.sheets && config.sheets.cualitativoRegional) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.cualitativoRegional)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en cualitativoRegional.${componentKey}`)
        return componentConfig.sheetId
      }
    }
  }
  
  // Buscar en sheets modulares de PRESUPUESTOS
  if (config.sheets && config.sheets.presupuestos) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.presupuestos)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en presupuestos.${componentKey}`)
        return componentConfig.sheetId
      }
    }
  }
  
  // Buscar en sheets modulares de ECONOMICOS
  if (config.sheets && config.sheets.economicos) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.economicos)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en economicos.${componentKey}`)
        return componentConfig.sheetId
      }
    }
  }
  
  // Buscar en sheets modulares de SOCIALES
  if (config.sheets && config.sheets.sociales) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.sociales)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en sociales.${componentKey}`)
        return componentConfig.sheetId
      }
    }
  }
  
  // Buscar en sheets modulares de AMBIENTALES
  if (config.sheets && config.sheets.ambientales) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.ambientales)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en ambientales.${componentKey}`)
        return componentConfig.sheetId
      }
    }
  }
  
  // Buscar en sheets modulares de GOBERNABILIDAD
  if (config.sheets && config.sheets.gobernabilidad) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.gobernabilidad)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        console.log(`📄 Archivo "${fileKey}" encontrado en gobernabilidad.${componentKey}`)
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

// ✅ ACTUALIZADO: Retornar año dinámico para TODOS los sheets incluyendo CUALITATIVOS REGIONALES
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
    'poblacion',
    // Archivos gobernabilidad
    'satisfaccionFederal',
    'satisfaccionEstatal',
    'IGOPP',
    'BIPE',
    'ITDIF',
    'ICI',
    'PBRSED',
    // Archivos de presupuestos
    'presupuestoEstatal',
    'financiamientos',
    'programas',
    // Archivos de cualitativos regionales
    'estatusDelPais',
    'ambientalesRegional',
    'socialesRegional',
    'economicosRegional',
    'financiamientoRegional'
    // ⚠️ NOTA: datosInternacionales NO usa año dinámico por defecto
    // Si necesitas que use año dinámico, agrégalo aquí
  ]
  
  if (dynamicYearFiles.includes(fileKey)) {
    console.log(`📅 Nombre de hoja dinámico para "${fileKey}": ${currentActiveYear}`)
    return currentActiveYear
  }
  
  // ✅ NUEVO: Buscar en configuración de cuantitativosInternacional
  if (config.sheets && config.sheets.cuantitativosInternacional) {
    if (config.sheets.cuantitativosInternacional.files && 
        config.sheets.cuantitativosInternacional.files[fileKey]) {
      return config.sheets.cuantitativosInternacional.files[fileKey]
    }
  }
  
  // Buscar en configuración modular de cualitativos regionales
  if (config.sheets && config.sheets.cualitativoRegional) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.cualitativoRegional)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        return componentConfig.files[fileKey]
      }
    }
  }
  
  // Buscar en configuración modular de presupuestos
  if (config.sheets && config.sheets.presupuestos) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.presupuestos)) {
      if (componentConfig.files && componentConfig.files[fileKey]) {
        return componentConfig.files[fileKey]
      }
    }
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
  
  // Buscar en configuración de gobernabilidad
  if (config.sheets && config.sheets.gobernabilidad) {
    for (const [componentKey, componentConfig] of Object.entries(config.sheets.gobernabilidad)) {
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