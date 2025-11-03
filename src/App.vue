<template>
  <div id="app">
    <h1>⚔️ Novice Dungeon RPG ⚔️</h1>
    <div class="game-container">
      <div class="left-panel"> <MapGrid /> 
        <GameControl /> </div>
      <StatusPanel :current-unit-id="gameState.currentUnitId" /> 
    </div>
    <GameLog />
  </div>
</template>

<script>
import MapGrid from './components/Mapgrid.vue'
import StatusPanel from './components/StatePanel.vue' 
import GameLog from './components/GameLog.vue' 
import { gameState } from './components/Gamestate.js' 
import GameControl from './components/GameControl.vue';

export default {
  name: 'App',
  components: {
    MapGrid,
    StatusPanel,
    GameLog,
    GameControl
  },
  data() {
      return {
          gameState: gameState // ทำให้ State เข้าถึงได้ใน Template เพื่อส่งให้ StatusPanel
      }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.game-container {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}
.left-panel { 
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>