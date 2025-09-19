
// src/app/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import MapsPage from '@/pages/MapsPage.vue'

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
      title: 'Mapas - Finanzas Sostenibles'
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