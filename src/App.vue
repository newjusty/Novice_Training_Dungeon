<template>
  <div id="app">
    <h1>⚔️ Novice Dungeon RPG ⚔️</h1>
    <MapGrid /> 
  </div>
</template>

<script>
import MapGrid from './components/Mapgrid.vue'

export default {
  name: 'App',
  components: {
    MapGrid
  }
}
</script>

<style>
/* Style ทั่วไป (Global Style) */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>