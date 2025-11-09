<template>
  <div class="map-grid">
    <div v-for="(row, rowIndex) in mapData" :key="rowIndex" class="map-row">
      <Tile 
        v-for="(tileType, colIndex) in row" 
        :key="colIndex"
        :tile-type="tileType"
        :x="colIndex"
        :y="rowIndex"
        :unit="getUnitAt(colIndex, rowIndex)"
        @click="clickTile(colIndex, rowIndex)" /> </div>
  </div>
</template>

<script>
import Tile from './Tile.vue';
import { initialMap } from './Mapdata.js'; 
import { gameState } from './Gamestate.js';
import { initializeGame } from './UnitSpawner.js';
import { startTurnPhase, getUnitById, addLog, attemptMove, useSkill } from './GameLogic.js'; 

export default {
    components: {
        Tile
    },
    data() {
        initializeGame(); 
        startTurnPhase(); 
        return {
            mapData: initialMap, 
            gameState: gameState,
        }
    },
    computed: {
        allUnits() {
            return [...gameState.novices, ...gameState.monsters]; 
        }
    },
    methods: {
        getUnitAt(x, y) {
            return this.allUnits.find(unit => 
                unit && unit.position && unit.position.x === x && unit.position.y === y && unit.stats.hp > 0
            );
        },
        clickTile(x, y) {
            const clickedUnit = this.getUnitAt(x, y);
            const isNoviceTurn = this.gameState.currentTurn === 'novice';
            const currentUnitId = this.gameState.currentUnitId;
            const currentAction = this.gameState.currentAction;
            
            // ------------------------------------
            // 1. Logic การเลือกตัวละคร (Novice Selection)
            // ------------------------------------
            if (isNoviceTurn && clickedUnit && clickedUnit.type === 'novice') {
                if (!clickedUnit.hasUsedAction) {
                    // คลิก Novice ที่ยังไม่ได้เล่น -> เลือกตัวนี้
                    this.selectNovice(clickedUnit.id);
                    this.gameState.currentAction = null; // รีเซ็ตโหมดการกระทำเมื่อเลือกตัวใหม่
                    return;
                } else if (clickedUnit.id === currentUnitId) {
                    // คลิกซ้ำที่ Novice ที่กำลังถูกเลือกอยู่ -> ยกเลิกการเลือก
                    this.gameState.currentUnitId = null;
                    this.gameState.currentAction = null;
                    addLog("ยกเลิกการเลือก Novice");
                    return;
                }
            }
            
            // ------------------------------------
            // 2. Logic การกระทำ (Walk/Targeting)
            // ------------------------------------
            if (currentUnitId && isNoviceTurn) {
                const currentUnit = getUnitById(currentUnitId);
                const skill = this.gameState.currentSkill;
                
                // 2a. โหมดเดิน (Walk)
                if (currentAction === 'walk') {
                    // พยายามเดินไปยังตำแหน่ง (x, y)
                    attemptMove(currentUnit, x, y);
                    // ไม่ต้องทำอะไรต่อ หากเดินสำเร็จ Logic ใน attemptMove จะจัดการ hasActed ให้
                    return; 
                } 
                
                // 2b. โหมด Skill Targeting (เช่น Attack)
                else if (currentAction === 'targeting' && skill) {
                    
                    // 🚨 ตรวจสอบเป้าหมาย: ต้องคลิกที่ Unit ที่มีชีวิต และต้องเป็นเป้าหมายที่ถูกต้อง
                    if (!clickedUnit || clickedUnit.stats.hp <= 0) {
                        addLog(`ไม่พบเป้าหมายที่ถูกต้องที่ (${x}, ${y})`);
                        return;
                    }
                    
                    // 🚨 ตรวจสอบระยะ: คำนวณระยะทาง
                    const distance = Math.abs(currentUnit.position.x - x) + Math.abs(currentUnit.position.y - y);
                    
                    if (distance <= skill.range) {
                        // **🌟 ใช้ Skill โจมตีสำเร็จ!**
                        
                        // 1. ใช้ Skill (GameControl ไม่ต้องจัดการ Skill โจมตีระยะไกล)
                        useSkill(currentUnit, clickedUnit, skill); 
                        
                        // 2. ล้างสถานะ Targeting 
                        this.gameState.currentAction = null; 
                        this.gameState.currentSkill = null;
                        this.gameState.currentUnitId = null; 
                        
                        // 3. useSkill จะเรียก advanceTurn() ให้เราแล้ว
                        return;
                    } else {
                        addLog(`เป้าหมาย ${clickedUnit.name} อยู่นอกระยะ ${skill.range} ช่อง`);
                    }
                }
            }
            
            // ------------------------------------
            // 3. Logic การยกเลิก (ถ้าคลิกพื้นที่ว่าง)
            // ------------------------------------
            if (!clickedUnit && currentUnitId) {
                this.gameState.currentUnitId = null;
                this.gameState.currentAction = null;
                this.gameState.currentSkill = null;
                addLog("ยกเลิกการเลือก Novice");
            }
        },
        
        selectNovice(unitId) {
            const unit = getUnitById(unitId);
            if (unit.type === 'novice' && !unit.hasUsedAction) { 
                this.gameState.currentUnitId = unitId;
                addLog(`Novice: ${unit.name} ถูกเลือก`);
            }
        },
    }
}
</script>

<style scoped>

.map-grid {
  display: flex;
  flex-direction: column;
  border: 2px solid #000;
  margin: 0 auto;
  width: min-content;
}

.map-row {
  display: flex; 
}
</style>