<!-- \training_novice\src\components\GameSummary.vue -->
<template>
  <div v-if="isGameOver" class="game-overlay">
    <div :class="['summary-box', { 'win': isNoviceWin, 'lose': isMonsterWin }]">
      <h2>เกมจบแล้ว!</h2>
      <h1 v-if="isNoviceWin">🏆 Novice Win! ยินดีด้วย!</h1>
      <h1 v-else-if="isMonsterWin">💔 Novice Lose! Dungeon Overlord ชนะ!</h1>
      <button @click="$emit('restart-game')" class="btn-restart">เริ่มเกมใหม่</button> 
      </div>
  </div>
</template>

<script>
import { gameState } from './Gamestate.js'; 

export default {
    // 💡 ต้องประกาศ emits: ['restart-game']
    emits: ['restart-game'],
    computed: {
        isGameOver() {
            return gameState.gameStatus !== 'playing';
        },
        isNoviceWin() {
            return gameState.gameStatus === 'novice_win';
        },
        isMonsterWin() {
            return gameState.gameStatus === 'monster_win';
        }
    }
}
</script>

<style scoped>
.game-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.summary-box h1 {
    margin: 15px 0;
    font-size: 2.2em;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
.summary-box {
    padding: 40px;
    border-radius: 10px;
    text-align: center;
    color: white;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}
.win { background-color: #28a745; }
.lose { background-color: #dc3545; }
.btn-restart {
    padding: 10px 20px;
    font-size: 1.2em;
    margin-top: 20px;
    cursor: pointer;
}
</style>