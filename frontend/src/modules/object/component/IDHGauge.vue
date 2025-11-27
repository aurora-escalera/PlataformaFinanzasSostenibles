<!-- IDHGauge.vue - Árbol de Desarrollo con animación -->
<template>
  <div class="idh-tree-container">
    <svg viewBox="0 0 100 100" class="tree-svg">
      <defs>
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0F3759" />
          <stop offset="100%" stop-color="#1a4d7a" />
        </linearGradient>
        
        <linearGradient id="leavesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1a4d7a" />
          <stop offset="100%" stop-color="#2d5f8d" />
        </linearGradient>
      </defs>
      
      <!-- Raíces (opcional, sutil) -->
      <g class="roots" opacity="0.3">
        <path d="M 50 85 Q 42 90 38 95" stroke="#0F3759" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M 50 85 Q 58 90 62 95" stroke="#0F3759" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </g>
      
      <!-- Tronco -->
      <rect 
        x="45" 
        y="60" 
        width="10" 
        height="25" 
        rx="1"
        fill="url(#trunkGradient)"
        class="trunk"
      />
      
      <!-- Copa del árbol - 3 niveles -->
      <g class="leaves">
        <!-- Nivel inferior (más grande) -->
        <ellipse 
          cx="50" 
          cy="60" 
          rx="24" 
          ry="16" 
          fill="url(#leavesGradient)"
          class="leaf-layer leaf-bottom"
        />
        
        <!-- Nivel medio -->
        <ellipse 
          cx="50" 
          cy="50" 
          rx="20" 
          ry="14" 
          fill="url(#leavesGradient)"
          class="leaf-layer leaf-middle"
          opacity="0.9"
        />
        
        <!-- Nivel superior (más pequeño) -->
        <ellipse 
          cx="50" 
          cy="42" 
          rx="15" 
          ry="12" 
          fill="url(#leavesGradient)"
          class="leaf-layer leaf-top"
          opacity="0.85"
        />
      </g>
      
      <!-- Detalles decorativos (hojas individuales) -->
      <g class="detail-leaves">
        <circle cx="38" cy="56" r="2.5" fill="#3B5A70" opacity="0.6" class="detail-leaf detail-1"/>
        <circle cx="62" cy="54" r="2" fill="#3B5A70" opacity="0.6" class="detail-leaf detail-2"/>
        <circle cx="46" cy="46" r="2" fill="#3B5A70" opacity="0.6" class="detail-leaf detail-3"/>
        <circle cx="54" cy="48" r="2.5" fill="#3B5A70" opacity="0.6" class="detail-leaf detail-4"/>
      </g>
      
      <!-- Estrella/Brillo en la punta -->
      <g class="star-top">
        <circle cx="50" cy="34" r="3.5" fill="#4E6D82" opacity="0.8" class="star-glow"/>
        <path d="M 50 30 L 50.5 33 L 53.5 33 L 51 35 L 52 38 L 50 36 L 48 38 L 49 35 L 46.5 33 L 49.5 33 Z" 
              fill="white" 
              opacity="0.9"
              class="star-shape"/>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  value: { type: Number, default: 0 },
  maxValue: { type: Number, default: 1 }
})
</script>

<style scoped>
.idh-tree-container {
  width: 100%;
  max-width: 70px;
  height: 70px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  overflow: hidden;
}

.tree-svg {
  width: 100%;
  height: 100%;
}

/* Animación del tronco - crecimiento sutil */
.trunk {
  animation: grow 2s ease-out;
  transform-origin: center bottom;
}

@keyframes grow {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Animación de las hojas - aparición escalonada */
.leaf-bottom {
  animation: leafAppear 1.5s ease-out 0.3s both;
  transform-origin: center;
}

.leaf-middle {
  animation: leafAppear 1.5s ease-out 0.5s both;
  transform-origin: center;
}

.leaf-top {
  animation: leafAppear 1.5s ease-out 0.7s both;
  transform-origin: center;
}

@keyframes leafAppear {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Animación de hojas individuales - flotación */
.detail-leaf {
  animation: float 3s ease-in-out infinite;
}

.detail-1 {
  animation-delay: 0s;
}

.detail-2 {
  animation-delay: 0.5s;
}

.detail-3 {
  animation-delay: 1s;
}

.detail-4 {
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* Animación de la estrella - brillo pulsante */
.star-glow {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

.star-shape {
  animation: sparkle 2s ease-in-out infinite;
  transform-origin: center;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.7;
    transform: rotate(0deg) scale(1);
  }
  50% {
    opacity: 1;
    transform: rotate(180deg) scale(1.1);
  }
}

/* Animación continua sutil de respiración para todo el árbol */
.leaves {
  animation: breathe 4s ease-in-out infinite;
  transform-origin: center;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

/* Raíces con animación de aparición */
.roots {
  animation: rootsGrow 1.5s ease-out;
}

@keyframes rootsGrow {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
}
</style>