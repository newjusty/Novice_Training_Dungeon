// \training_novice\src\components\GameLogic.js
import { gameState } from './Gamestate.js';
import { takeTurn,isPositionOccupied } from './MonsterAI.js';

/** ฟังก์ชันเริ่มต้น/รีเซ็ตลำดับการเล่นทั้งหมด*/
export function startTurnPhase() {
    // 🌟 1. ตั้งค่าเทิร์นเริ่มต้นเป็น Novice เสมอ
    gameState.currentTurn = 'novice';
    gameState.currentUnitId = null; // ยังไม่มีใครถูกเลือก
    
    // 2. รีเซ็ตสถานะการกระทำ (hasActed) และ Block ของทุกคน
    [...gameState.novices, ...gameState.monsters].forEach(unit => {
        // ✅ รีเซ็ตสถานะเดิน
        unit.hasMoved = false;
        // ✅ รีเซ็ตสถานะใช้ Action (Skill/Pass)
        unit.hasUsedAction = false;
        // สถานะ Block หายไปเมื่อเริ่มเทิร์น
        unit.isBlocking = false;
    });
    
    // 3. กำหนดลำดับการเล่นของ Monster (เรียงตาม Speed)
    // Novice ไม่ต้องถูกรวมเพราะผู้เล่นเลือกเอง
    const monsterOrder = gameState.monsters
        .slice() // คัดลอก Array
        .sort((a, b) => b.stats.speed - a.stats.speed); // เรียงจาก Speed มากไปน้อย
        
    gameState.turnOrder = monsterOrder.map(m => m.id);
    
    addLog(`--- เริ่มเทิร์นใหม่: ฝั่ง Novice! ---`);
}

/**
 * ตรวจสอบว่าฝั่งใดสามารถกระทำต่อไปได้ และเปลี่ยนเทิร์นหากจำเป็น
 */
export async function advanceTurn() {
    // ตรวจสอบ Novice ที่ยังมีชีวิตและยังไม่ได้ใช้ Action
    const allNovicesActed = gameState.novices.every(n => n.stats.hp <= 0 || n.hasUsedAction); 
    if (gameState.gameStatus !== 'playing') {
        return; // หยุด Logic ทั้งหมดถ้าเกมจบแล้ว
    }
    
    // ------------------------------------
    // 🌟 Novice Phase Logic
    // ------------------------------------
    if (gameState.currentTurn === 'novice') {
        
        // ✅ 1. นับจำนวน Novice ที่มีชีวิตและยังมี Action เหลืออยู่
        const activeNovices = gameState.novices.filter(n => n.stats.hp > 0 && !n.hasUsedAction);

        // 2. ถ้า Novice ที่มี Action เหลืออยู่เป็น 0 (ทุกคนเล่นครบแล้วหรือตายหมดแล้ว)
        if (activeNovices.length === 0) {
            gameState.interstitial.message = "⚔️ ถึงเทิร์นของ MONSTER! 👾";
            gameState.interstitial.phase = 'monster';
            gameState.interstitial.show = true;
            
            // 2. ตั้งเวลาเพื่อซ่อนฉากคั่นและเริ่ม Phase ต่อไป
            setTimeout(() => {
                gameState.currentTurn = 'monster';
                gameState.interstitial.show = false; // ซ่อนฉากคั่น
                advanceTurn(); // เริ่ม Monster Phase
            }, 1000); // หน่วงเวลา 1 วินาทีเพื่อให้ผู้เล่นอ่านข้อความ
            
            return; 
    }
    return; 
}

    // ------------------------------------
    // 🌟 Monster Phase Logic
    // ------------------------------------
    else if (gameState.currentTurn === 'monster') {
        
        // 1. กรองหา Monster ที่ยังมีชีวิตและยังไม่เล่น (ตามลำดับ Speed)
        const remainingMonsters = gameState.turnOrder.filter(id => {
            const unit = getUnitById(id);
            // 💡 unit.stats.hp > 0 และไม่เคยใช้ Action
            return unit && unit.stats.hp > 0 && !unit.hasUsedAction; 
        });

        if (remainingMonsters.length > 0) {
            gameState.currentUnitId = remainingMonsters[0];
            const currentMonster = getUnitById(gameState.currentUnitId);
            
            if (currentMonster) {
                addLog(`🤖 เทิร์นของ Monster: [${currentMonster.name}] กำลังคิด...`);

                // 🚨 ปรับค่า 50 เป็นเวลาหน่วงที่ต้องการ (หน่วยเป็นมิลลิวินาที)
                setTimeout(() => {
                    const botUnit = getUnitById(gameState.currentUnitId);
                    if (botUnit) takeTurn(botUnit); 
                }, 500); // ✅ ตัวอย่าง: หน่วง 0.5 วินาที
                
                return;
                // await takeTurn(currentMonster);
                // advanceTurn();
                // return; 
            }
        } 
        
        if (remainingMonsters.length === 0) {
            // 🌟 1. ตั้งค่าฉากคั่น Novice
            gameState.interstitial.message = "💡 ถึงเทิร์นของ NOVICE! 🧑";
            gameState.interstitial.phase = 'novice';
            gameState.interstitial.show = true;
            
            // 2. ตั้งเวลาเพื่อซ่อนฉากคั่นและเริ่ม Phase ต่อไป
            setTimeout(() => {
                gameState.interstitial.show = false; // ซ่อนฉากคั่น
                startTurnPhase(); // รีเซ็ตสถานะและเริ่ม Novice Phase
            }, 1000);
            
            return;
        }
    }
}

// **********************************************
// 2. ฟังก์ชันเสริม
// **********************************************

/**
 * ค้นหา Unit จาก ID
 */
export function getUnitById(unitId, x = null, y = null) {
    const allUnits = [...gameState.novices, ...gameState.monsters];
    
    if (unitId) {
        return allUnits.find(u => u.id === unitId);
    }
    if (x !== null && y !== null) {
        return allUnits.find(u => u.position.x === x && u.position.y === y);
    }
    return null;
}

/**
 * เพิ่มข้อความลงใน Log
 */
export function addLog(message) {
    gameState.log.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
    // จำกัดจำนวน Log ไม่ให้เยอะเกินไป
    if (gameState.log.length > 20) gameState.log.pop();
}

/**
 * การเคลื่อนที่ของ Unit
 * @param {object} unit - ยูนิตที่กำลังเคลื่อนที่
 * @param {number} x - พิกัดเป้าหมาย X
 * @param {number} y - พิกัดเป้าหมาย Y
 * @returns {boolean} - เคลื่อนที่สำเร็จหรือไม่
 */
export function attemptMove(unit, x, y) {
    // 5. ตัวละครทุกตัวไม่สามารถเดินเข้าไปในกำแพงได้ (ขอบเขต 1-9)
    if (x < 1 || x > 9 || y < 1 || y > 9) {
        addLog(`[${unit.name}] ไม่สามารถเดินเข้ากำแพงได้`);
        return false; 
    }

    // 2. ไม่สามารถเดินได้หากเคยเดินแล้วในเทิร์นนี้
    if (unit.hasMoved) {
        addLog(`[${unit.name}] ได้เดินไปแล้วในเทิร์นนี้`);
        return false;
    }
    
    // 💡 การเดินไม่ถูกบล็อกด้วย hasUsedAction ทำให้สามารถเดินแล้วใช้สกิลได้

    // 1. Novice/Monster สามารถเดินได้ในระยะ 2 ช่องรอบตัว
    const distance = Math.abs(unit.position.x - x) + Math.abs(unit.position.y - y);
    // 💡 สมมติว่า unit.moveRange ของ Novice ถูกกำหนดเป็น 2
    if (distance > unit.moveRange) { 
        addLog(`[${unit.name}] เคลื่อนที่ไกลเกินระยะ ${unit.moveRange} ช่อง`);
        return false;
    }

    // ตรวจสอบว่ามี Unit อื่นยืนอยู่หรือไม่
    const targetUnit = [...gameState.novices, ...gameState.monsters].find(u => u.position.x === x && u.position.y === y);
    if (targetUnit && targetUnit.stats.hp > 0) { // ตรวจสอบไม่ให้เดินทับตัวที่ตายแล้ว
        addLog(`[${unit.name}] ไม่สามารถเดินทับ ${targetUnit.name} ได้`);
        return false;
    }

// 🌟 เคลื่อนที่สำเร็จ!
    unit.position = { x, y };
    unit.hasMoved = true; // เสร็จสิ้นการกระทำ (เดิน)
    addLog(`[${unit.name}] เคลื่อนที่ไปที่ (${x}, ${y})`);
    
    // ✅ เพิ่ม: เคลียร์ไฮไลต์หลังการเดินสำเร็จ 
    gameState.highlightedTiles = [];
    
    // หากเป็น Monster จะต้องถือว่าจบ Action ทันที
    if (unit.type === 'monster') {
        // Monster จะใช้ Action ทั้งหมดในการเดิน/โจมตี/สกิล
        unit.hasUsedAction = true;
    }
    // Novice: ไม่ต้องเรียก advanceTurn() ที่นี่ เพราะผู้เล่นอาจต้องการใช้ Skill ต่อ
    return true;
}

/**
 * คำนวณความเสียหายสุทธิที่เป้าหมายได้รับ
 * @param {object} source - ยูนิตผู้โจมตี
 * @param {object} target - ยูนิตเป้าหมาย
 * @param {number} baseDamage - ค่าความเสียหายพื้นฐาน (จาก Skill.attack)
 */

export function calculateDamage(source, target, baseDamage) {
    if (target.stats.hp <= 0) return 0;
    
    // 🚨 1. Safety Check: ตรวจสอบว่า baseDamage เป็นตัวเลขหรือไม่
    if (typeof baseDamage !== 'number' || isNaN(baseDamage)) {
        addLog(`[ERROR] Damage Calculation Failed: Base Damage (${baseDamage}) is not a valid number.`);
        return 0; 
    }

    let finalDamage = baseDamage;

    // 2. ลดความเสียหายด้วยค่า Defense ของเป้าหมาย (ใช้ || 0 เพื่อป้องกัน NaN)
    finalDamage -= (target.stats.defense || 0); 

    // 3. ปรับลดตามสถานะ Block
    if (target.isBlocking === true) { 
        finalDamage = Math.floor(finalDamage / 2);
        addLog(`[${target.name}] ใช้ Block ลดความเสียหาย`);
    }

    // 4. ดาเมจขั้นต่ำต้องเป็น 0 เสมอ
    finalDamage = Math.max(0, finalDamage);
    
    // 5. อัปเดต HP ของเป้าหมาย
    target.stats.hp -= finalDamage;
    target.stats.hp = Math.max(0, target.stats.hp); 

    console.log(`[DEBUG: Calc] Damage: ${finalDamage}, Target HP after: ${target.stats.hp}`);

    // 6. 🌟 ตรวจสอบการตายและจัดการ Unit
    if (target.stats.hp <= 0) {
        // ✅ เพิ่ม Log การตาย
        addLog(`💀 [${target.name}] (${target.type}) ถูกกำจัดแล้ว!`);
        // 🚨 สำคัญ: เรียกฟังก์ชันจัดการ Unit ที่ตายแล้ว
        handleUnitDeath(target); 
    }
    
    return finalDamage;
}

// **********************************************
// 3. ฟังก์ชันการกระทำ (Action Logic)
// **********************************************

/**
 * ฟังก์ชันจบเทิร์นของ Unit (Pass Turn หรือหลังจากใช้ Skill)
 * @param {object} unit - ยูนิตที่กำลังเล่น
 */
export function passTurn(unit) {
    if (!unit.hasUsedAction) {
        unit.hasUsedAction = true;
        addLog(`[${unit.name}] ผ่านเทิร์น (Action)`);
    }
    // 💡 การผ่านเทิร์นของ Novice หมายถึงการใช้ Action จบแล้ว ต้องตรวจสอบการเปลี่ยน Phase
    if (unit.type === 'novice') {
        advanceTurn();
    }
    // Monster ไม่ควรถูกเรียก passTurn แต่ถ้าถูกเรียกก็ควรจบเทิร์นตัวนั้นๆ
}


/**
 * ฟังก์ชันสำหรับ Unit ในการใช้ Skill
 */
export function handleUnitDeath(unit) {
    // 1. ลบ Unit ที่ตายแล้วออกจาก turnOrder
    const index = gameState.turnOrder.indexOf(unit.id);
    if (index > -1) {
        gameState.turnOrder.splice(index, 1);
        addLog(`[System] ลบ [${unit.name}] ออกจากลำดับการเล่น`); // ล็อกเพื่อยืนยันการลบ
    }
    
    // 2. ถ้า Unit ที่ตายคือ Unit ที่กำลังถูกเลือก ให้ยกเลิกการเลือก
    if (gameState.currentUnitId === unit.id) {
        gameState.currentUnitId = null;
    }
    
    // 💡 NOTE: การทำให้ไอคอนหายไปจะถูกจัดการโดย Component (Vue/React) ที่ตรวจสอบ
    // ว่า unit.stats.hp <= 0
    checkWinCondition();
}

export function useSkill(source, target, skill) {
    console.log(`[DEBUG: UseSkill] Source: ${source.name}, Target HP before: ${target.stats.hp}`);
    const skillEffect = skill.logic(source, target);  

    if (!skillEffect) {
        addLog(`[ERROR] Skill logic failed to return an effect object for ${skill.name}.`);
        return; 
    }
    
    // 3. จัดการผลกระทบตามประเภท Skill
    if (skillEffect.isAttack) {
        // **🌟 Logic การโจมตี/ทำความเสียหาย**
        calculateDamage(source, target, skillEffect.baseDamage);
    } else if (skill.isHealing) {
        // **🌟 Logic การรักษา (Heal/SelfHeal)**
        addLog(skillEffect.message);
    } else if (skill.isBlock) {
        // **🌟 Logic การป้องกัน (Block)**
        addLog(skillEffect.message);
    }

    // 4. จัดการสถานะและจบเทิร์น
    source.hasUsedAction = true; // ใช้ Action (Skill) แล้ว
    gameState.currentUnitId = null; 
    addLog(`[${source.name}] ใช้ Skill: ${skill.name}`);
    gameState.highlightedTiles = [];

    // 5. จัดการ Advance Turn
    // 💡 Logic นี้ถูกต้องแล้ว: useSkill จะเซ็ต hasUsedAction = true และ advanceTurn() จะตรวจสอบว่า Novice ครบทุกคนหรือยัง
    if (source.type === 'monster' || source.type === 'novice') {
        advanceTurn(); 
    }

    return skillEffect;
}

export function checkWinCondition() {
    // กรอง Unit ที่ยังมีชีวิต
    const aliveNovices = gameState.novices.filter(n => n.stats.hp > 0);
    const aliveMonsters = gameState.monsters.filter(m => m.stats.hp > 0);

    if (aliveNovices.length === 0) {
        gameState.gameStatus = 'monster_win';
        addLog("💔 Monster Win! Novices ถูกกำจัดหมดแล้ว");
        return true;
    }

    if (aliveMonsters.length === 0) {
        gameState.gameStatus = 'novice_win';
        addLog("🏆 Novice Win! Monsters ถูกกำจัดหมดแล้ว");
        return true;
    }
    
    return false;
}

// ฟังก์ชันสำหรับใช้คำนวณระยะทาง (ต้องแน่ใจว่ามีอยู่ในไฟล์ที่ถูก import หรือสร้างใหม่)
function getDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * คำนวณและคืนค่าลิสต์ของพิกัดที่สามารถไฮไลต์ได้
 * @param {object} unit - ยูนิตที่กำลังกระทำ
 * @param {string} mode - 'move' หรือ 'target'
 * @returns {Array<{x: number, y: number, type: string}>}
 */
export function getAvailableTiles(unit, mode) {
    if (!unit) return [];
    
    const startPos = unit.position;
    const maxRange = (mode === 'move' ? unit.moveRange : unit.skills.find(s => s.name === 'Attack')?.range) || 0;
    const tiles = [];
    
    // วนลูปทั่วแผนที่ (1x1 ถึง 9x9)
    for (let x = 1; x <= 9; x++) {
        for (let y = 1; y <= 9; y++) {
            const distance = getDistance(startPos, { x, y });
            
            // 1. ตรวจสอบระยะทางที่กำหนด
            if (distance > 0 && distance <= maxRange) {
                
                // 2. ตรวจสอบว่ามี Unit อื่นยืนอยู่หรือไม่ (สำคัญสำหรับ Move)
                const targetUnit = getUnitById(null, x, y); // ต้องปรับ getUnitById ให้รับ x, y 
                
                if (mode === 'move') {
                    // โหมดเดิน: ต้องว่างเปล่า
                    if (!isPositionOccupied(x, y)) { // 💡 ฟังก์ชันนี้ถูกสร้างไว้ใน MonsterAI.js ต้อง import/สร้างใหม่
                        tiles.push({ x, y, type: 'move' });
                    }
                } 
                else if (mode === 'target') {
                    const skill = unit.skills.find(s => s.name === 'Attack');
                    if (targetUnit && targetUnit.stats.hp > 0 && targetUnit.type !== unit.type) { 
                        // โหมดโจมตี: ต้องมี Unit ศัตรูที่มีชีวิต
                        if (skill && distance <= skill.range) {
                            tiles.push({ x, y, type: 'target' });
                        }
                    }
                }
            }
        }
    }
    return tiles;
}