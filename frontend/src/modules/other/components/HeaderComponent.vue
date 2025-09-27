<!-- src/modules/other/components/HeaderComponent.vue -->
<template>
  <header class="platform-header">
    <div class="header-container">
      <!-- Logo Section -->
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <img 
            :src="logoUrl" 
            :alt="logoAlt" 
            class="logo-image"
            @error="handleLogoError"
          />
        </router-link>
      </div>

      <!-- Navigation Section -->
      <nav class="header-nav">
        <a 
          v-for="(link, index) in navigationLinks" 
          :key="link.id"
          :href="link.url"
          :class="['nav-link', { 'active': activeLink === link.id }]"
          @click.prevent="handleNavClick(link)"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useHeader } from '@/composables/useHeader'

// Usar el composable del header
const {
  logoUrl,
  logoAlt,
  navigationLinks,
  activeLink,
  handleNavClick,
  handleLogoError
} = useHeader()
</script>

<style scoped>
.platform-header {
  background: #e8e8e8;
  padding: 1rem 2rem;
  border-bottom: 1px solid #d0d0d0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-container {
  max-width: 2500px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-link {
  display: block;
  line-height: 0;
}

.logo-image {
  height: 55px;
  width: auto;
  object-fit: contain;
  transition: opacity 0.2s;
}

.logo-image:hover {
  opacity: 0.85;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  padding: 0.5rem 0.75rem;
  transition: color 0.2s;
  position: relative;
}

.nav-link::after {
  content: '|';
  position: absolute;
  right: -4px;
  color: #999;
}

.nav-link:last-child::after {
  content: '';
}

.nav-link:hover {
  color: #333;
}

.nav-link.active {
  color: #e91e63;
  font-weight: 500;
}

@media (max-width: 768px) {
  .platform-header {
    padding: 1rem;
  }

  .header-container {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-nav {
    width: 100%;
    justify-content: center;
  }

  .logo-image {
    height: 45px;
  }
}
</style>