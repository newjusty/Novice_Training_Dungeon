<template>
  <div class="status-panel">
    <h3>ข้อมูลยูนิต 🛡️</h3>
    
    <h4>Novices (ผู้เล่น)</h4>
    <div v-for="unit in novices" :key="unit.id" :class="['unit-status', { 'current-turn': currentUnitId === unit.id }]">
      <p><strong>{{ unit.name }}</strong> ({{ unit.position.x }}, {{ unit.position.y }})</p>
      <p>HP: {{ unit.stats.hp }} / {{ unit.stats.maxHp }} | ATK: {{ unit.stats.attack }} | DEF: {{ unit.stats.defense }} | SPD: {{ unit.stats.speed }}</p>
      <p v-if="unit.isBlocking" class="status-effect">**🛡️ Blocking**</p>
    </div>

    <h4>Monsters (ศัตรู)</h4>
    <div v-for="unit in monsters" :key="unit.id" class="unit-status monster-unit">
      <p><strong>{{ unit.name }}</strong> ({{ unit.position.x }}, {{ unit.position.y }})</p>
      <p>HP: {{ unit.stats.hp }} / {{ unit.stats.maxHp }} | ATK: {{ unit.stats.attack }} | DEF: {{ unit.stats.defense }} | SPD: {{ unit.stats.speed }}</p>
    </div>
  </div>
</template>

<script>
// นำเข้า State
import { gameState } from './Gamestate.js'; 

export default {
    // props นี้จะใช้สำหรับบอกว่าใครคือยูนิตที่กำลังเล่นเทิร์น
    props: {
        currentUnitId: { type: String, default: null } 
    },
    computed: {
        novices() {
            return gameState.novices;
        },
        monsters() {
            return gameState.monsters;
        }
    }
}
</script>

<style scoped>
.status-panel {
    width: 300px; /* กำหนดความกว้างของ Panel */
    padding: 15px;
    background-color: #333;
    color: #fff;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    /* จัดการให้ Scroll ได้ถ้ามีข้อมูลเยอะ */
    overflow-y: auto; 
}

.unit-status {
    border-bottom: 1px solid #555;
    padding: 5px 0;
    margin-bottom: 10px;
    font-size: 0.9em;
}

.monster-unit {
    color: #ff9999;
}

.current-turn {
    background-color: #6a0dad; /* สีม่วงสำหรับยูนิตที่กำลังเล่นเทิร์น */
    padding: 5px;
    border-radius: 3px;
    border: 2px solid yellow;
}
.status-effect {
    color: #4CAF50; /* สีเขียวสำหรับสถานะป้องกัน */
    font-weight: bold;
}
</style>