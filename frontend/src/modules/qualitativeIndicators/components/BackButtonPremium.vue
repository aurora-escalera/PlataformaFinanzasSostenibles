<!-- src/modules/qualitativeIndicators/components/BackButtonPremium.vue -->
<!-- ✅ Versión Premium - Botón de retorno con múltiples estilos elegantes -->
<template>
  <button 
    class="back-btn-premium"
    :class="[
      `back-btn-premium--${variant}`,
      `back-btn-premium--${size}`,
      { 'back-btn-premium--with-glow': withGlow }
    ]"
    @click="$emit('click')"
    :title="tooltip"
  >
    <!-- Efecto de brillo -->
    <div v-if="withGlow" class="glow-effect"></div>
    
    <!-- Contenedor del icono con animación -->
    <div class="icon-container">
      <!-- Opción 1: Flecha simple -->
      <svg 
        v-if="iconStyle === 'arrow'"
        class="icon-svg"
        :width="iconSize" 
        :height="iconSize" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M19 12H5"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      
      <!-- Opción 2: Flecha con círculo -->
      <svg 
        v-else-if="iconStyle === 'circle'"
        class="icon-svg"
        :width="iconSize" 
        :height="iconSize" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 8 8 12 12 16"/>
        <line x1="16" y1="12" x2="8" y2="12"/>
      </svg>
      
      <!-- Opción 3: Chevron doble -->
      <svg 
        v-else-if="iconStyle === 'chevron'"
        class="icon-svg"
        :width="iconSize" 
        :height="iconSize" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <polyline points="11 17 6 12 11 7"/>
        <polyline points="18 17 13 12 18 7"/>
      </svg>
      
      <!-- Opción 4: Flecha curva -->
      <svg 
        v-else-if="iconStyle === 'curved'"
        class="icon-svg"
        :width="iconSize" 
        :height="iconSize" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M9 14L4 9l5-5"/>
        <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
      </svg>
      
      <!-- Opción 5: Home/Casa -->
      <svg 
        v-else-if="iconStyle === 'home'"
        class="icon-svg"
        :width="iconSize" 
        :height="iconSize" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
    
    <!-- Label opcional -->
    <span v-if="showLabel" class="label-text">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'glass', // 'glass', 'solid', 'outline', 'gradient', 'minimal', 'neon'
    validator: (v) => ['glass', 'solid', 'outline', 'gradient', 'minimal', 'neon'].includes(v)
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  iconStyle: {
    type: String,
    default: 'arrow', // 'arrow', 'circle', 'chevron', 'curved', 'home'
    validator: (v) => ['arrow', 'circle', 'chevron', 'curved', 'home'].includes(v)
  },
  label: {
    type: String,
    default: 'Volver'
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  tooltip: {
    type: String,
    default: 'Volver'
  },
  iconSize: {
    type: [String, Number],
    default: 18
  },
  withGlow: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.back-btn-premium {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.back-btn-premium:active {
  transform: scale(0.95);
}

/* ============================================
   TAMAÑOS
   ============================================ */
.back-btn-premium--sm {
  padding: 6px 10px;
  font-size: 11px;
}

.back-btn-premium--md {
  padding: 8px 14px;
  font-size: 12px;
}

.back-btn-premium--lg {
  padding: 10px 18px;
  font-size: 14px;
}

/* ============================================
   CONTENEDOR DEL ICONO
   ============================================ */
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-btn-premium:hover .icon-container {
  transform: translateX(-4px);
}

.icon-svg {
  transition: all 0.3s ease;
}

.label-text {
  transition: opacity 0.2s ease;
}

/* ============================================
   VARIANTE GLASS (Glassmorphism)
   ============================================ */
.back-btn-premium--glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.back-btn-premium--glass:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 6px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

/* ============================================
   VARIANTE SOLID
   ============================================ */
.back-btn-premium--solid {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  color: white;
  border: none;
  box-shadow: 
    0 4px 12px rgba(30, 58, 95, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.back-btn-premium--solid:hover {
  background: linear-gradient(135deg, #2d5a87 0%, #3b82f6 100%);
  box-shadow: 
    0 6px 20px rgba(30, 58, 95, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* ============================================
   VARIANTE OUTLINE
   ============================================ */
.back-btn-premium--outline {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
}

.back-btn-premium--outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

/* ============================================
   VARIANTE GRADIENT
   ============================================ */
.back-btn-premium--gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.back-btn-premium--gradient:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

/* ============================================
   VARIANTE MINIMAL
   ============================================ */
.back-btn-premium--minimal {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  padding: 6px 8px;
}

.back-btn-premium--minimal:hover {
  color: white;
  background: rgba(255, 255, 255, 0.08);
}

/* ============================================
   VARIANTE NEON
   ============================================ */
.back-btn-premium--neon {
  background: transparent;
  border: 2px solid #00d4ff;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  box-shadow: 
    0 0 10px rgba(0, 212, 255, 0.3),
    inset 0 0 10px rgba(0, 212, 255, 0.1);
}

.back-btn-premium--neon:hover {
  background: rgba(0, 212, 255, 0.1);
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.5),
    0 0 40px rgba(0, 212, 255, 0.3),
    inset 0 0 15px rgba(0, 212, 255, 0.2);
  text-shadow: 0 0 15px rgba(0, 212, 255, 0.8);
}

/* ============================================
   EFECTO GLOW
   ============================================ */
.glow-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.back-btn-premium--with-glow:hover .glow-effect {
  opacity: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
}

/* ============================================
   ANIMACIÓN DE ENTRADA
   ============================================ */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.back-btn-premium {
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================
   RIPPLE EFFECT
   ============================================ */
.back-btn-premium::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.back-btn-premium:active::after {
  transform: scale(2);
  opacity: 1;
  transition: transform 0s, opacity 0s;
}
</style>