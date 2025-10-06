// src/app/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import MapsPage from '@/pages/MapsPage.vue'
import QualitativePanel from '../../pages/QualitativePanel.vue'
import IndicatorView from '../../pages/IndicatorView.vue'

const routes = [
  // Ruta por defecto (opcional)
  {
    path: '/',
    redirect: '/finanzas/mapas'
  },
  // Tu ruta de mapas
  {
    path: '/finanzas/mapas',
    name: 'FinanzasMapas',
    component: MapsPage,
    meta: {
      title: 'Fderales - Finanzas Sostenibles'
    }
  },
    // Tu ruta de cualitativos
  {
    path: '/finanzas/cualitativos',
    name: 'FinanzasCualitativos',
    component: QualitativePanel,
    meta: {
      title: 'Cualitativos - Finanzas Sostenibles'
    }
  },
    {
    path: '/finanzas/cualitativos/item',
    name: 'FinanzasCualitativosItem',
    component: IndicatorView,
    meta: {
      title: 'Cualitativos - Finanzas Sostenibles'
    }
  }
]

// Crear el router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Opcional: Cambiar título de página automáticamente
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

// IMPORTANTE: Exportar el router
export default router