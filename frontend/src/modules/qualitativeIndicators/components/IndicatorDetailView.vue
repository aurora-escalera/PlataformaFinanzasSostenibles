<!-- src/modules/qualitativeIndicators/components/IndicatorDetailView.vue -->
<template>
  <div class="indicator-detail">
    <!-- Información del estado -->
    <div class="state-info">
      <h4>{{ stateName || 'México' }}</h4>
      <p class="state-subtitle">Indicadores {{ category.label }}</p>
    </div>

    <!-- Grid de indicadores -->
    <div class="indicators-grid">
      <div
        v-for="indicator in category.indicators"
        :key="indicator.id"
        class="indicator-card"
      >
        <h5 class="indicator-title">{{ indicator.title }}</h5>
        
        <!-- Placeholder para gráficas -->
        <div class="indicator-chart">
          <div v-if="indicator.type === 'bar-chart'" class="chart-placeholder">
            <div class="placeholder-icon">📊</div>
            <p class="placeholder-text">Gráfica de barras</p>
          </div>
          <div v-else-if="indicator.type === 'donut-chart'" class="chart-placeholder">
            <div class="placeholder-icon">🍩</div>
            <p class="placeholder-text">Gráfica de dona</p>
          </div>
          <div v-else-if="indicator.type === 'line-chart'" class="chart-placeholder">
            <div class="placeholder-icon">📈</div>
            <p class="placeholder-text">Gráfica de línea</p>
          </div>
          <div v-else class="chart-placeholder">
            <div class="placeholder-icon">📉</div>
            <p class="placeholder-text">Gráfica</p>
          </div>
        </div>

        <!-- Descripción -->
        <p class="indicator-description">{{ indicator.description }}</p>

        <!-- Botón para ver detalles -->
        <button class="details-btn">
          Ver detalles completos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  stateName: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.indicator-detail {
  color: white;
}

/* === INFORMACIÓN DEL ESTADO === */
.state-info {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.state-info h4 {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: white;
  font-weight: 600;
}

.state-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* === GRID DE INDICADORES === */
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.indicator-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.indicator-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.indicator-title {
  font-size: 12px;
  font-weight: 500;
  color: white;
  margin: 0 0 12px 0;
  line-height: 1.4;
  min-height: 36px;
}

/* === PLACEHOLDER DE GRÁFICAS === */
.indicator-chart {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.6;
}

.placeholder-icon {
  font-size: 32px;
}

.placeholder-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.indicator-description {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px 0;
  line-height: 1.4;
  min-height: 32px;
}

/* === BOTÓN DE DETALLES === */
.details-btn {
  width: 100%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.details-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .indicators-grid {
    grid-template-columns: 1fr;
  }
  
  .indicator-chart {
    height: 100px;
  }
  
  .state-info h4 {
    font-size: 18px;
  }
}
</style>