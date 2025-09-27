<!-- src/modules/other/components/TitleBarComponent.vue -->
<template>
  <div class="title-bar">
    <div class="title-container">
      <div class="title-content">
        <h1 class="page-title">{{ title }}</h1>
        <p class="last-update">Última actualización: {{ lastUpdate }}</p>
      </div>

      <div class="action-buttons">
        <button 
          class="action-btn download-btn" 
          @click="handleDownload"
          title="Descargar datos"
        >
          <span class="btn-icon">💾</span>
        </button>
        <button 
          class="action-btn help-btn" 
          @click="handleHelp"
          title="Ayuda"
        >
          <span class="btn-icon">?</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Plataforma del Índice de Finanzas Sostenibles Subnacional (IFSS)'
  },
  lastUpdate: {
    type: String,
    default: '24 de septiembre de 2025'
  }
})

const handleDownload = () => {
  console.log('Descargando datos...')
  alert('Función de descarga')
}

const handleHelp = () => {
  console.log('Mostrando ayuda...')
  alert('Ayuda de la plataforma IFSS')
}
</script>

<style scoped>
.title-bar {
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.title-container {
  max-width: 2500px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.title-content {
  flex: 1;
}

.page-title {
  font-size: 28px;
  color: #1e3a5f;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.last-update {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.download-btn {
  background: #7cb342;
  color: white;
}

.download-btn:hover {
  background: #689f38;
}

.help-btn {
  background: #e91e63;
  color: white;
}

.help-btn:hover {
  background: #c2185b;
}

.btn-icon {
  font-size: 20px;
  line-height: 1;
}

@media (max-width: 768px) {
  .title-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 22px;
  }

  .action-buttons {
    align-self: flex-end;
  }
}
</style>