<template>
  <div class="game-control">
    <button 
        @click="endNovicePhase" 
        :disabled="gameState.currentTurn !== 'novice'"
        class="btn-main"
    >
        ผ่านเทิร์น Novice ทั้งหมด ({{ NovicesRemaining }})
    </button>

    <div v-if="currentUnit && currentUnit.type === 'novice'" class="novice-actions">
        <h4>คำสั่ง: {{ currentUnit.name }}</h4>
        
        <button 
            @click="setAction('walk')" 
            :disabled="currentUnit.hasMoved"
            class="btn-action"
        >
            🚶 Walk ({{ currentUnit.moveRange }} ช่อง)
        </button>
        
        <button 
            @click="setAction('skill')" 
            :disabled="currentUnit.hasUsedAction"
            class="btn-action"
        >
            ✨ Skill
        </button>
        
        <button 
            @click="passUnitTurn" 
            :disabled="currentUnit.hasMoved"
            class="btn-action btn-pass"
        >
            ⏩ Pass Turn
        </button>
        
        <div v-if="actionState === 'skill'" class="skill-list">
            <h5>เลือก Skill:</h5>
            <button 
                v-for="skill in currentUnit.skills" 
                :key="skill.name"
                @click="selectSkill(skill)"
                class="btn-skill"
            >
                {{ skill.name }} (R: {{ skill.range }})
            </button>
        </div>
    </div>
  </div>
</template>

<script>
import { gameState } from './Gamestate.js';
import { advanceTurn, getUnitById, addLog, passTurn, useSkill, getAvailableTiles } from './GameLogic.js'; 

export default {
    data() {
        return {
            gameState,
        };
    },
    computed: {
        currentUnit() {
            return getUnitById(gameState.currentUnitId);
        },
        actionState: { 
            get() { return gameState.currentAction; },
            set(value) { gameState.currentAction = value; }
        },
        NovicesRemaining() {
            return gameState.novices.filter(n => !n.hasUsedAction).length;
        }
    },
    methods: {
        endNovicePhase() {
            gameState.novices.forEach(n => {
                if (!n.hasUsedAction) { 
                    n.hasUsedAction = true;
                    addLog(`[${n.name}] ถูกบังคับผ่านเทิร์น`);
                }
            });
            gameState.currentUnitId = null;
            this.actionState = null;
            advanceTurn();
        },
        passUnitTurn() {
            if (this.currentUnit) {
                passTurn(this.currentUnit);
                this.actionState = null;
                gameState.currentUnitId = null;
                advanceTurn();
            }
        },
        setAction(action) {
            this.actionState = action; 
            this.selectedSkill = null;
            gameState.highlightedTiles = []; // รีเซ็ตทุกครั้งที่เปลี่ยนโหมด

            if (action === 'walk') {
                const currentUnit = this.currentUnit;
                if (currentUnit) {
                    gameState.highlightedTiles = getAvailableTiles(currentUnit, 'move');
                }
            }
        },
        
        // 🌟 ฟังก์ชันใหม่สำหรับใช้ Skill
        executeSkill(target, skill = this.selectedSkill) {
            if (!this.currentUnit || !skill) return;

            // 💡 เรียกใช้ Logic การใช้ Skill จริง ๆ จาก GameLogic.js
            useSkill(this.currentUnit, target, skill); 
            
            // รีเซ็ตสถานะ UI
            this.actionState = null; 
            gameState.currentUnitId = null; 
            
            // หมายเหตุ: useSkill จะเรียก advanceTurn() เองแล้ว
        },
        
        selectSkill(skill) {
            gameState.currentSkill = skill; 
            this.actionState = 'targeting'; 
            addLog(`เลือก Skill: ${skill.name} (R: ${skill.range})`);
            
            // ถ้าเป็น Skill ที่ไม่ต้องการเป้าหมาย (Block, Heal)
            if (skill.range > 0) {
                this.actionState = 'targeting';
                // 🌟 คำนวณช่องโจมตี (ศัตรู) และอัปเดต State
                gameState.highlightedTiles = getAvailableTiles(this.currentUnit, 'target');
            }
        },
    }
}
</script>

<style scoped>
/* ... (จัด Style ตามชอบ) ... */
.game-control {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
.btn-main {
    padding: 10px 20px;
    font-size: 1.1em;
    background-color: #d63333;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
.novice-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
}
.btn-action { padding: 8px 12px; }
.btn-pass { background-color: #ffc107; }
.skill-list { margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 10px; }
.btn-skill { margin-right: 5px; padding: 5px 10px; background-color: #3f51b5; color: white; border: none; }
</style>