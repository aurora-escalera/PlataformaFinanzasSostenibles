 <!-- src/App.vue-->
<template>
  <div id="app">
    <!-- Header opcional -->
    <header class="app-header">
      <h1>Finanzas Sostenibles Subnacionales</h1>
      <nav>
        <router-link to="/finanzas/mapas" class="nav-link">
          📊 Mapas IFSS
        </router-link>
      </nav>
    </header>

    <!-- Contenido principal -->
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.app-main {
  flex: 1;
  padding: 0;
}
</style>