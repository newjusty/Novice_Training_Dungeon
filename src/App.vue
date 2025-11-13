<!-- \training_novice\src\App.vue -->
<template>
  <div id="app">
    <h1>⚔️ Novice Dungeon RPG ⚔️</h1>
    <div class="game-container">
      <div class="left-panel"> <MapGrid /> 
        <GameControl /> </div>
      <StatusPanel :current-unit-id="gameState.currentUnitId" /> 
    </div>
    <GameLog />
    <GameSummary @restart-game="resetGame" /> 
    <TurnInterstitial />
  </div>
</template>

<script>
import MapGrid from './components/Mapgrid.vue'
import StatusPanel from './components/StatePanel.vue' 
import GameLog from './components/GameLog.vue' 
import { gameState } from './components/Gamestate.js' 
import GameControl from './components/GameControl.vue';
import GameSummary from './components/GameSummary.vue';
import { initializeGame } from './components/UnitSpawner.js';
import { startTurnPhase, addLog} from './components/GameLogic.js'; 
import TurnInterstitial from './components/TurnInterstitial.vue';

export default {
  name: 'App',
  components: {
    MapGrid,
    StatusPanel,
    GameLog,
    GameControl,
    GameSummary,
    TurnInterstitial
  },
  methods: {
        resetGame() {
            // 1. รีเซ็ตสถานะการจบเกม
            gameState.gameStatus = 'playing';
            
            // 2. เรียกฟังก์ชันสร้าง Unit ใหม่ (ลบตัวเก่า, สุ่มตัวใหม่)
            initializeGame();
            
            // 3. เริ่มต้น Turn Phase (รีเซ็ต hasMoved/hasUsedAction และลำดับเทิร์น)
            startTurnPhase();
            
            // 4. (ทางเลือก) รีเซ็ต Log
            gameState.log.length = 0;
            addLog("เกมถูกรีเซ็ต: เริ่มการผจญภัยครั้งใหม่!");
        }
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