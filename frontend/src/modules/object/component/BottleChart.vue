<!-- src/modules/charts/components/BottleChart.vue -->
<template>
  <div class="bottle-chart">
    
    <div class="bottles-container">
      <div 
        v-for="index in 10" 
        :key="index"
        class="bottle-wrapper"
      >
        <img 
          :src="getBottleImage(index)" 
          :alt="`Botella ${index}`"
          class="bottle-image"
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
  title: {
    type: String,
    default: 'Indicador'
  },
  filledBottle: {
    type: String,
    default: '/icons/bottle-filled.png'
  },
  emptyBottle: {
    type: String,
    default: '/icons/bottle-empty.png'
  }
})

const percentage = computed(() => {
  return Math.round(props.value)
})

const filledBottles = computed(() => {
  return Math.floor(props.value / 10)
})

const getBottleImage = (index) => {
  return index <= filledBottles.value ? props.filledBottle : props.emptyBottle
}
</script>

<style scoped>
.bottle-chart {
  width: 100%;
  height: 100%;
    display: flex;
  flex-direction: column;
  overflow: hidden; /* Previene desbordamiento */
  background: white;
}

.bottles-container {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 1px;
}

.bottle-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0; /* Importante para que flex funcione correctamente */
  height: 100%; /* Ocupa toda la altura disponible */
  
}

.bottle-image {
  width: 100%;
  height: 1000%;
  max-width: none; /* Elimina el max-width fijo */
  object-fit: contain; /* IMPORTANTE - Mantiene aspecto sin desbordarse */
  object-position: bottom; /* Alinea la imagen al fondo */
  transition: transform 0.2s ease;
}

.bottle-wrapper:hover .bottle-image {
  transform: scale(1.1);
}

</style>