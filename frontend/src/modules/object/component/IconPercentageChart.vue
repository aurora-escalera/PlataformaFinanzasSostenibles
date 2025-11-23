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
      <div v-if="showPercentage" class="percentage-label" :style="dynamicLabelStyle">
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
  // El texto está al 30% desde abajo (70% desde arriba)
  // Cuando el fill alcanza esa altura, cambiar a blanco
  const textPosition = 30 // Debe coincidir con el bottom: 30% en el CSS
  const fillReachedText = props.fillOrigin === 'bottom' 
    ? animatedPercentage.value >= textPosition
    : animatedPercentage.value >= (100 - textPosition)
  
  return {
    color: fillReachedText ? '#FFFFFF' : (props.fillColor || '#0F3759'),
    transition: 'color 0.3s ease'
  }
})

// ✅ FUNCIÓN: Animación de llenado progresivo
const animateToValue = (targetValue) => {
  if (!props.progressiveAnimation || !props.animated) {
    // Sin animación progresiva, saltar directo al valor
    animatedPercentage.value = targetValue
    displayedPercentage.value = Math.round(targetValue)
    return
  }

  isAnimating.value = true
  const startValue = animatedPercentage.value
  const duration = props.animationDuration * 1000 // Convertir a ms
  const startTime = Date.now()
  
  const animate = () => {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    
    const currentValue = startValue + (targetValue - startValue) * easeOut
    animatedPercentage.value = currentValue
    displayedPercentage.value = Math.round(currentValue)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
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
  opacity: 0.3;
  filter: grayscale(100%);
}

.icon-fill-wrapper {
  position: absolute;
  top: 0;
  left: 10;
  width: 80%;
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
  bottom: 40%;
  left: 50%;
  transform: translateX(-50%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 24px;
  font-weight: 700;
  white-space: nowrap;
  z-index: 10;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>