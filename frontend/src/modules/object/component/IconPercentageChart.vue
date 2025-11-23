<!-- src/modules/object/component/IconPercentageChart.vue -->
<!-- ✅ VERSIÓN MEJORADA: Con animación de llenado progresivo -->
<template>
  <div class="icon-percentage-container" :style="containerStyle">
    <div class="icon-wrapper">
      <!-- Imagen de fondo (gris/desaturada) -->
      <img 
        :src="iconPath" 
        :alt="altText"
        class="icon-background"
        :style="iconStyle"
      />
      
      <!-- Imagen coloreada (se recorta según el porcentaje) -->
      <div class="icon-fill-wrapper" :style="fillWrapperStyle">
        <img 
          :src="iconPath" 
          :alt="altText"
          class="icon-fill"
          :style="iconStyle"
        />
      </div>
      
      <!-- ✅ CAMBIO: Usar dynamicLabelStyle en vez de labelStyle -->
      <div v-if="showPercentage && showLabel" class="percentage-label" :style="dynamicLabelStyle">
        {{ displayedPercentage }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  // Ruta del icono PNG
  iconPath: {
    type: String,
    required: true
  },
  // Porcentaje a mostrar (0-100)
  value: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  // Dirección del llenado: 'vertical' o 'horizontal'
  fillDirection: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal'].includes(value)
  },
  // Origen del llenado: 'bottom', 'top', 'left', 'right'
  fillOrigin: {
    type: String,
    default: 'bottom'
  },
  // Color del filtro para el icono lleno (opcional)
  fillColor: {
    type: String,
    default: null
  },
  // Ancho del contenedor
  width: {
    type: [String, Number],
    default: '100%'
  },
  // Alto del contenedor
  height: {
    type: [String, Number],
    default: '100%'
  },
  // Tamaño del icono (ancho)
  iconWidth: {
    type: [String, Number],
    default: '100%'
  },
  // Tamaño del icono (alto)
  iconHeight: {
    type: [String, Number],
    default: 'auto'
  },
  // Mostrar etiqueta de porcentaje
  showPercentage: {
    type: Boolean,
    default: false
  },
  // Texto alternativo
  altText: {
    type: String,
    default: 'Icono'
  },
  // Animación
  animated: {
    type: Boolean,
    default: true
  },
  // Duración de la animación en segundos
  animationDuration: {
    type: Number,
    default: 1.5
  },
  // ✅ NUEVO: Animación de llenado progresivo
  progressiveAnimation: {
    type: Boolean,
    default: true
  },
  // ✅ NUEVO: Retraso antes de iniciar la animación (en ms)
  startDelay: {
    type: Number,
    default: 300
  }
})

// ✅ NUEVO: Estado para el porcentaje animado
const animatedPercentage = ref(0)
const displayedPercentage = ref(0)
const isAnimating = ref(false)
const showLabel = ref(false)

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const iconStyle = computed(() => ({
  width: typeof props.iconWidth === 'number' ? `${props.iconWidth}px` : props.iconWidth,
  height: typeof props.iconHeight === 'number' ? `${props.iconHeight}px` : props.iconHeight
}))

const fillWrapperStyle = computed(() => {
  // Usar el porcentaje animado en lugar del valor directo
  const percentage = Math.max(0, Math.min(100, animatedPercentage.value))
  const transition = props.animated && !isAnimating.value 
    ? `clip-path ${props.animationDuration}s cubic-bezier(0.4, 0.0, 0.2, 1)` 
    : 'none'
  
  let clipPath = ''
  
  // Determinar el clip-path según la dirección y origen
  if (props.fillDirection === 'vertical') {
    if (props.fillOrigin === 'bottom') {
      const topPercentage = 100 - percentage
      clipPath = `inset(${topPercentage}% 0% 0% 0%)`
    } else if (props.fillOrigin === 'top') {
      const bottomPercentage = 100 - percentage
      clipPath = `inset(0% 0% ${bottomPercentage}% 0%)`
    }
  } else if (props.fillDirection === 'horizontal') {
    if (props.fillOrigin === 'left') {
      const rightPercentage = 100 - percentage
      clipPath = `inset(0% ${rightPercentage}% 0% 0%)`
    } else if (props.fillOrigin === 'right') {
      const leftPercentage = 100 - percentage
      clipPath = `inset(0% 0% 0% ${leftPercentage}%)`
    }
  }
  
  const style = {
    clipPath,
    WebkitClipPath: clipPath,
    transition
  }
  
  // Aplicar color si se proporciona
  if (props.fillColor) {
    // Convertir imagen a color usando filter
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }
    
    const rgb = hexToRgb(props.fillColor)
    if (rgb) {
      // Crear filtro CSS para colorear la imagen
      style.filter = `
        brightness(0) 
        saturate(100%) 
        invert(${rgb.r / 255}) 
        sepia(1) 
        saturate(5) 
        hue-rotate(${Math.atan2(rgb.g - 128, rgb.r - 128) * 180 / Math.PI}deg)
      `.replace(/\s+/g, ' ').trim()
    }
  }
  
  return style
})

const labelStyle = computed(() => ({
  color: props.fillColor || '#0F3759'
}))

// ✅ NUEVO: Cambiar color del texto según el nivel de llenado
const dynamicLabelStyle = computed(() => {
  const textPosition = 40
  const fillReachedText = props.fillOrigin === 'bottom' 
    ? animatedPercentage.value >= textPosition
    : animatedPercentage.value >= (100 - textPosition)
  
  return {
    color: showLabel.value ? '#0F3759' : (fillReachedText ? '#FFFFFF' : (props.fillColor || '#0F3759')),
    backgroundColor: showLabel.value ? 'rgba(255, 255, 255, 0.9)' : 'transparent', // ✅ Fondo con 90% opacidad
    borderRadius: showLabel.value ? '50%' : '0',
    padding: showLabel.value ? '0' : '0',
    width: showLabel.value ? '50px' : 'auto', // ✅ Más pequeño: 50px
    height: showLabel.value ? '50px' : 'auto', // ✅ Más pequeño: 50px
    display: showLabel.value ? 'flex' : 'block',
    alignItems: showLabel.value ? 'center' : 'normal',
    justifyContent: showLabel.value ? 'center' : 'normal',
    border: showLabel.value ? `1px solid ${props.fillColor || '#0F3759'}` : 'none', // ✅ Borde más delgado
    boxShadow: showLabel.value ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none', // ✅ Sombra más suave
    fontSize: showLabel.value ? '16px' : '24px', // ✅ Letra más pequeña
    fontWeight: showLabel.value ? '600' : '700',
    transition: 'all 0.3s ease',
  }
})

// ✅ FUNCIÓN: Animación de llenado progresivo
const animateToValue = (targetValue) => {
  if (!props.progressiveAnimation || !props.animated) {
    animatedPercentage.value = targetValue
    displayedPercentage.value = Math.round(targetValue)
    showLabel.value = true
    return
  }

  isAnimating.value = true
  showLabel.value = false
  const totalDuration = props.animationDuration * 1000
  const phase1Duration = totalDuration * 0.33 // 33% - Llenar a 100
  const phase2Duration = totalDuration * 0.33 // 33% - Vaciar a 0
  const phase3Duration = totalDuration * 0.34 // 34% - Llenar al valor real
  const startTime = Date.now()
  
  const animate = () => {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    
    if (elapsed < phase1Duration) {
      // FASE 1: Llenar de 0 a 100
      const progress = elapsed / phase1Duration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      animatedPercentage.value = easeOut * 100
      requestAnimationFrame(animate)
    } else if (elapsed < phase1Duration + phase2Duration) {
      // FASE 2: Vaciar de 100 a 0
      const phase2Elapsed = elapsed - phase1Duration
      const progress = phase2Elapsed / phase2Duration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      animatedPercentage.value = 100 - (easeOut * 100)
      requestAnimationFrame(animate)
    } else if (elapsed < totalDuration) {
      // FASE 3: Llenar de 0 al valor real Y mostrar número creciendo
      if (!showLabel.value) {
        showLabel.value = true // ✅ Mostrar número al inicio de fase 3
      }
      const phase3Elapsed = elapsed - phase1Duration - phase2Duration
      const progress = phase3Elapsed / phase3Duration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      animatedPercentage.value = easeOut * targetValue
      displayedPercentage.value = Math.round(easeOut * targetValue) // ✅ Número crece junto con el fill
      requestAnimationFrame(animate)
    } else {
      // Finalizar
      animatedPercentage.value = targetValue
      displayedPercentage.value = Math.round(targetValue)
      showLabel.value = true
      isAnimating.value = false
    }
  }
  
  requestAnimationFrame(animate)
}

// ✅ Watch para cambios en el valor
watch(() => props.value, (newValue) => {
  if (props.startDelay > 0) {
    setTimeout(() => {
      animateToValue(newValue)
    }, props.startDelay)
  } else {
    animateToValue(newValue)
  }
})

// ✅ Iniciar animación al montar el componente
onMounted(() => {
  if (props.startDelay > 0) {
    setTimeout(() => {
      animateToValue(props.value)
    }, props.startDelay)
  } else {
    animateToValue(props.value)
  }
})
</script>

<style scoped>
.icon-percentage-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon-background { 
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.4;
  filter: grayscale(100%);
}

.icon-fill-wrapper {
  position: absolute;
  top: 0;
  left: 8px;
  width: 90%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;


}

.icon-fill {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 100%;
}

.percentage-label {
  position: absolute;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 24px;
  font-weight: 700;
  white-space: nowrap;
  z-index: 10;

}
</style>