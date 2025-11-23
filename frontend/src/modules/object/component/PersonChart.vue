<!-- src/modules/object/component/PersonChart.vue -->
<template>
  <div class="person-chart">
    <div class="person-container">
      <div 
        v-for="index in totalPersons" 
        :key="index"
        class="person-wrapper"
        :style="{ animationDelay: `${(index - 1) * 0.15}s` }"
      >
        <img 
          :src="getPersonImage(index)" 
          :alt="`Persona ${index}`"
          class="person-image"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  totalPersons: {
    type: Number,
    default: 7
  },
  filledPerson: {
    type: String,
    default: '/icons/person-filled.png'
  },
  emptyPerson: {
    type: String,
    default: '/icons/person-empty.png'
  }
})

// ✅ Calcular cuántos iconos llenar basado en el porcentaje
const filledPersonsCount = computed(() => {
  // Convertir el porcentaje a cantidad de personas
  // Ejemplo: 50% de 6 personas = 3 personas llenas
  const count = Math.round((props.value / 100) * props.totalPersons)
  
  console.log(`🎨 [PersonChart] Porcentaje recibido: ${props.value}%`)
  console.log(`🎨 [PersonChart] Iconos llenos: ${count} de ${props.totalPersons}`)
  
  // Asegurar que esté entre 0 y totalPersons
  return Math.max(0, Math.min(count, props.totalPersons))
})

const getPersonImage = (index) => {
  const isFilled = index <= filledPersonsCount.value
  const imagePath = isFilled ? props.filledPerson : props.emptyPerson
  
  // Log para debug (solo en el primer icono)
  if (index === 1) {
    console.log(`📍 [PersonChart] Ruta imagen llena: ${props.filledPerson}`)
    console.log(`📍 [PersonChart] Ruta imagen vacía: ${props.emptyPerson}`)
    console.log(`📍 [PersonChart] Total iconos llenos: ${filledPersonsCount.value}`)
  }
  
  return imagePath
}
</script>

<style scoped>
.person-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.person-container {
  justify-content: center;
  align-items: center;
  display: flex;
  width: 100%;
  height: 50%;
  gap: 4px;

}

.person-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 50%;
  overflow: visible;
  /* Animación de aparición */
  opacity: 0;
  transform: translateY(20px) scale(0.8);
  animation: slideInUp 0.5s ease-out forwards;
}

.person-image {
  width: 40px;
  height: 40px;
  transition: transform 0.2s ease;
  display: block;
}

/* Efecto hover */
.person-wrapper:hover .person-image {
  transform: scale(1.2);
}

/* Animación de entrada */
@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  60% {
    transform: translateY(-5px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>