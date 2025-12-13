<template>
  <div class="default-info-card">
    <div class="card-container">
      <!-- Sidebar de color -->
      <div class="card-sidebar"></div>
      
      <!-- Contenido principal -->
      <div class="card-content">
        <!-- Sección 1: Acerca de la Plataforma -->
        <div class="section-row">
          <div class="icon-wrapper">
            <div class="icon-box icon-info">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="timeline-connector"></div>
          </div>
          <div class="text-section">
            <h4 class="section-title">Acerca de la Plataforma</h4>
            <p class="section-text">
              La Plataforma permite visualizar los resultados del 
              <span class="highlight-primary">Índice de Finanzas Sostenibles (IFS)</span> 
              a partir del año 2020, con datos del ejercicio fiscal previo. Para explorar los resultados, 
              te invitamos a hacer una búsqueda personalizada usando el 
              <span class="highlight-link">filtro</span> o seleccionando una 
              <span class="highlight-link">entidad específica</span> dentro del mapa.
            </p>
          </div>
        </div>
        
        <!-- Sección 2: ¿Por qué el IFS? -->
        <div class="section-row">
          <div class="icon-wrapper">
            <div class="icon-box icon-question">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="timeline-connector"></div>
          </div>
          <div class="text-section">
            <h4 class="section-title">¿Por qué dar seguimiento a la alineación de flujos financieros con objetivos climáticos?</h4>
            <p class="section-text">
              Con el fin de identificar brechas, retos y oportunidades de transformación de las finanzas públicas 
              en países en desarrollo, surge el <span class="highlight-primary">Índice de Finanzas Sostenibles (IFS)</span>. 
              Esta es una herramienta desarrollada en el marco de la campaña 
              <span class="highlight-primary">"Finanzas Sostenibles para el Futuro"</span> del Grupo de Financiamiento 
              Climático para Latinoamérica y el Caribe (<span class="highlight-primary">GFLAC</span>), la cual permite 
              monitorear ingresos y gastos nacionales e internacionales que contribuyen o bloquean el progreso en la 
              acción climática y los Objetivos de Desarrollo Sostenible (ODS) asociados.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No requiere props ni lógica adicional
// La visibilidad se controla desde HomePage.vue
</script>

<style scoped>
.default-info-card {
  width: 100%;
  max-width: 2000px;
  margin: 24px auto 60px auto;
  padding: 0;
}

.card-container {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  overflow: hidden;
}

.card-sidebar {
  width: 6px;
  background: #163C5F;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  padding: 36px 44px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Cada sección como fila */
.section-row {
  display: flex;
  align-items: flex-start;
  gap: 28px;
}

/* Wrapper del icono con timeline */
.icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-box svg {
  width: 24px;
  height: 24px;
}

.icon-info {
  background: #e8f4fc;
}

.icon-info svg {
  color: #163C5F;
}

.icon-question {
  background: #fef3c7;
}

.icon-question svg {
  color: #d97706;
}

.timeline-connector {
  width: 3px;
  flex: 1;
  min-height: 80px;
  background: #e2e8f0;
  margin-top: 8px;
}

/* Sección de texto */
.text-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 32px;
}

.section-row:last-child .text-section {
  padding-bottom: 0;
}

.section-title {
  font-size: 17px;
  font-weight: 400;
  color: #1e3a5f;
  margin: 0;
  letter-spacing: 0.2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.4;
  padding-top: 12px;
}

.section-text {
  font-size: 16px;
  font-weight: 300;
  color: #64748b;
  line-height: 1.8;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-align: justify;
}

/* Highlights - sin negrita, color del título */
.highlight-primary {
  font-weight: 400;
  color: #1e3a5f;
}

.highlight-link {
  font-weight: 400;
  color: #1e3a5f;
}

/* Responsive */
@media (max-width: 768px) {
  .default-info-card {
    padding: 0 12px;
    margin-bottom: 40px;
  }
  
  .card-content {
    padding: 28px 24px;
  }
  
  .section-row {
    gap: 20px;
  }
  
  .icon-box {
    width: 40px;
    height: 40px;
  }
  
  .icon-box svg {
    width: 20px;
    height: 20px;
  }
  
  .text-section {
    gap: 12px;
    padding-bottom: 24px;
  }
  
  .section-title {
    font-size: 15px;
    padding-top: 8px;
  }
  
  .section-text {
    font-size: 15px;
  }
}
</style>