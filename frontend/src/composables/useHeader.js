// src/composables/useHeader.js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useHeader = () => {
  // Router para navegación
  const router = useRouter()

  // Estados reactivos
  const activeLink = ref('plataforma')
  const logoError = ref(false)

  // Configuración del logo
  const logoUrl = computed(() => {
    // Si hay error, usar un placeholder o logo alternativo
    if (logoError.value) {
      return '/logo-placeholder.png'
    }
    return '/logo-ofcm.png'
  })

  const logoAlt = ref('Observatorio de Financiamiento Climático en México')

  // Enlaces de navegación
  const navigationLinks = ref([
    {
      id: 'inicio',
      label: 'Inicio',
      url: '/',
      external: false
    },
    {
      id: 'acerca',
      label: 'Acerca de',
      url: '/acerca',
      external: false
    },
    {
      id: 'plataforma',
      label: 'Plataforma',
      url: '/finanzas/mapas',
      external: false
    }
  ])

  // Métodos
  const handleNavClick = (link) => {
    // Actualizar link activo
    activeLink.value = link.id

    // Navegar según el tipo de enlace
    if (link.external) {
      window.open(link.url, '_blank')
    } else {
      router.push(link.url)
    }

    // Emitir evento personalizado si es necesario
    console.log('Navegando a:', link.label)
  }

  const handleLogoError = () => {
    console.warn('Error al cargar el logo')
    logoError.value = true
  }

  // Método para cambiar el link activo desde fuera
  const setActiveLink = (linkId) => {
    activeLink.value = linkId
  }

  // Método para agregar un nuevo link de navegación
  const addNavigationLink = (link) => {
    if (!link.id || !link.label || !link.url) {
      console.error('Link inválido: debe tener id, label y url')
      return
    }
    navigationLinks.value.push(link)
  }

  // Método para remover un link de navegación
  const removeNavigationLink = (linkId) => {
    const index = navigationLinks.value.findIndex(link => link.id === linkId)
    if (index > -1) {
      navigationLinks.value.splice(index, 1)
    }
  }

  // Computed para obtener el link activo actual
  const currentLink = computed(() => {
    return navigationLinks.value.find(link => link.id === activeLink.value)
  })

  return {
    // Estados
    logoUrl,
    logoAlt,
    navigationLinks,
    activeLink,
    currentLink,
    
    // Métodos
    handleNavClick,
    handleLogoError,
    setActiveLink,
    addNavigationLink,
    removeNavigationLink
  }
}