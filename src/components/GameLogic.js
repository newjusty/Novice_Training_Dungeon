// \training_novice\src\components\GameLogic.js
import { gameState } from './Gamestate.js';
import { takeTurn } from './MonsterAI.js';

/** ฟังก์ชันเริ่มต้น/รีเซ็ตลำดับการเล่นทั้งหมด*/

export function startTurnPhase() {
    // 🌟 1. ตั้งค่าเทิร์นเริ่มต้นเป็น Novice เสมอ
    gameState.currentTurn = 'novice';
    gameState.currentUnitId = null; // ยังไม่มีใครถูกเลือก
    
    // 2. รีเซ็ตสถานะการกระทำ (hasActed) และ Block ของทุกคน
    [...gameState.novices, ...gameState.monsters].forEach(unit => {
        unit.hasMoved = false;        // ✅ รีเซ็ตสถานะเดิน
        unit.hasUsedAction = false;   // ✅ รีเซ็ตสถานะใช้ Action (Skill/Pass)
        unit.isBlocking = false; // สถานะ Block หายไปเมื่อเริ่มเทิร์น
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
export function advanceTurn() {
    const allNovicesActed = gameState.novices.every(n => n.hasUsedAction); 
    const allMonstersActed = gameState.monsters.every(m => m.hasUsedAction); 
    
    // ------------------------------------
    // 🌟 Novice Phase Logic
    // ------------------------------------
    if (gameState.currentTurn === 'novice') {
        if (allNovicesActed) {
            // Novice ทุกคนเล่นแล้ว, เปลี่ยนเป็นเทิร์น Monster
            gameState.currentTurn = 'monster';
            
            // 🚨 สั่งให้ Logic เดินต่อ: ต้องเรียก advanceTurn() ซ้ำอีกครั้ง 
            // เพื่อเข้าสู่ Monster Phase Logic ในฟังก์ชันเดียวกันนี้
            advanceTurn(); 
            return; // 🚨 สำคัญ: หยุดการทำงานของ Call Stack นี้ทันที!
        }
        // ถ้า Novice ยังเล่นไม่ครบ ให้ทำแค่ return (รอผู้เล่น action)
        return;
    }
    // ------------------------------------
    // 🌟 Monster Phase Logic
    // ------------------------------------
    else if (gameState.currentTurn === 'monster') {
        const remainingMonsters = gameState.turnOrder.filter(id => {
            const unit = getUnitById(id);
            // 💡 เราต้องตรวจสอบว่า Unit มีชีวิต (HP > 0) ด้วย
            return unit && unit.stats.hp > 0 && !unit.hasUsedAction; 
        });

        if (remainingMonsters.length > 0) {
            gameState.currentUnitId = remainingMonsters[0];
            const currentMonster = getUnitById(gameState.currentUnitId);
            
            if (currentMonster) {
                addLog(`--- เทิร์น Monster: ${currentMonster.name} เริ่มเล่น ---`);
                console.log(`[DEBUG] เตรียมเรียก takeTurn ให้: ${currentMonster.name}`);
                
                // 🌟 หน่วงเวลาแล้วเรียก Bot Logic
                setTimeout(() => {
                    takeTurn(currentMonster); 
                }, 800); 
                return; // หน่วง 0.8 วินาที
                
            } else { // 🌟 ถ้าไม่มี remainingMonsters หรือ allMonstersActed เป็นจริง (ไม่จำเป็นต้องใช้ else if อีก)
                // Monster ทุกตัวเล่นแล้ว/ตายหมด, เริ่มเทิร์นใหม่
                startTurnPhase();
                return;
            }

        } else if (allMonstersActed) {
            startTurnPhase();
        }
    }
}

// **********************************************
// 2. ฟังก์ชันเสริม
// **********************************************

/**
 * ค้นหา Unit จาก ID
 */
export function getUnitById(unitId) {
    return [...gameState.novices, ...gameState.monsters].find(u => u.id === unitId);
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
    // 5. ตัวละครทุกตัวไม่สามารถเดินเข้าไปในกำแพงได้
    // (เราจะใช้ MapData เพื่อตรวจสอบภายหลัง แต่ตอนนี้ใช้ขอบเขต 1-9 ไปก่อน)
    if (x < 1 || x > 9 || y < 1 || y > 9) {
        addLog(`[${unit.name}] ไม่สามารถเดินเข้ากำแพงได้`);
        return false; 
    }

    // 2. และ 3. ไม่สามารถเดินได้หากเคยกระทำแล้วในเทิร์นนี้
    if (unit.hasMoved) {
        addLog(`[${unit.name}] ได้กระทำไปแล้วในเทิร์นนี้`);
        return false;
    }

    // 1. และ 3. Novice/Monster สามารถเดินได้ในระยะ 2 ช่องรอบตัว
    const distance = Math.abs(unit.position.x - x) + Math.abs(unit.position.y - y);
    if (distance > unit.moveRange) {
        addLog(`[${unit.name}] เคลื่อนที่ไกลเกินระยะ ${unit.moveRange} ช่อง`);
        return false;
    }

    // ตรวจสอบว่ามี Unit อื่นยืนอยู่หรือไม่
    const targetUnit = [...gameState.novices, ...gameState.monsters].find(u => u.position.x === x && u.position.y === y);
    if (targetUnit) {
        addLog(`[${unit.name}] ไม่สามารถเดินทับ ${targetUnit.name} ได้`);
        return false;
    }

// 🌟 เคลื่อนที่สำเร็จ!
    unit.position = { x, y };
    unit.hasMoved = true; // เสร็จสิ้นการกระทำ (เดิน)
    addLog(`[${unit.name}] เคลื่อนที่ไปที่ (${x}, ${y})`);
    
    // หากเป็น Monster จะต้องเรียก advanceTurn ทันที
    if (unit.type === 'monster') {
        unit.hasUsedAction = true;
        advanceTurn(); 
    }
    // Novice ไม่ต้องเรียก advanceTurn() ที่นี่ แต่จะเรียกเมื่อกดปุ่ม Pass Turn หรือใช้ Skill
    return true;
}

/**
 * คำนวณความเสียหายสุทธิที่เป้าหมายได้รับ
 * @param {object} source - ยูนิตผู้โจมตี
 * @param {object} target - ยูนิตเป้าหมาย
 * @param {number} baseDamage - ค่าความเสียหายพื้นฐาน (จาก Skill.attack)
 */
export function calculateDamage(source, target, baseDamage) {
    if (target.stats.hp <= 0) return 0; // ไม่ทำความเสียหายถ้าเป้าหมายตายแล้ว

    let finalDamage = baseDamage;

    // 1. ลดความเสียหายด้วยค่า Defense ของเป้าหมาย
    finalDamage -= target.stats.defense;

    // 2. ปรับลดตามสถานะ Block (ดาเมจที่ได้รับ = ความเสียหายที่ได้รับ / 2)
    if (target.isBlocking) {
        finalDamage = Math.floor(finalDamage / 2);
        addLog(`[${target.name}] ใช้ Block ลดความเสียหาย`);
    }

    // 3. ดาเมจขั้นต่ำต้องเป็น 0 เสมอ
    finalDamage = Math.max(0, finalDamage);
    
    // 4. อัปเดต HP ของเป้าหมาย
    target.stats.hp -= finalDamage;
    target.stats.hp = Math.max(0, target.stats.hp); // HP ไม่ติดลบ

    addLog(`[${target.name}] ได้รับความเสียหาย ${finalDamage} หน่วย (HP เหลือ: ${target.stats.hp})`);

    // 5. ตรวจสอบการตาย
    if (target.stats.hp <= 0) {
        addLog(`🔥 [${target.name}] ถูกกำจัดแล้ว!`);
    }

    // 6. สถานะ Block หายไปหลังจากการโจมตี
    target.isBlocking = false;
    
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
        addLog(`[${unit.name}] ผ่านเทิร์น`);
    }
    // Novice ผ่านเทิร์น ไม่ต้องเรียก advanceTurn เพราะผู้เล่นเลือกตัวอื่นได้
}


/**
 * ฟังก์ชันสำหรับ Unit ในการใช้ Skill
 */
export function useSkill(source, target, skill) {
    // 1. กำหนดสถานะ Blocking ให้หายไปก่อน (ถ้าเป็น Skill ใหม่ของ Unit นี้)
    // NOTE: สถานะ Block ถูกรีเซ็ตตอนเริ่มเทิร์นแล้ว
    
    // 2. รัน Logic ของ Skill เพื่อดูว่าเป็นการโจมตี/รักษา
    const skillEffect = skill.logic(source, target); 
    
    // 3. จัดการผลกระทบตามประเภท Skill
    if (skillEffect.isAttack) {
        // **🌟 Logic การโจมตี/ทำความเสียหาย**
        calculateDamage(source, target, skillEffect.baseDamage);
    } else if (skill.isHealing) {
        // **🌟 Logic การรักษา (Heal/SelfHeal)**
        // Logic การคำนวณ HP ใหม่ถูกจัดการแล้วใน SkillData.js
        addLog(skillEffect.message);
    } else if (skill.isBlock) {
        // **🌟 Logic การป้องกัน (Block)**
        // Logic การตั้งค่า source.isBlocking = true ถูกจัดการแล้วใน SkillData.js
        addLog(skillEffect.message);
    }

    // 4. จัดการสถานะและจบเทิร์น
    source.hasUsedAction = true;
    gameState.currentUnitId = null; 
    addLog(`[${source.name}] ใช้ Skill: ${skill.name}`);
    
    // 5. จัดการ Advance Turn
    if (source.type === 'monster') {
        advanceTurn(); 
    } else if (source.type === 'novice') {
        advanceTurn(); 
    }
    
    return skillEffect;
}
// export function useSkill(source, target, skill) {
//     // 2. Novice เมื่อใช้งานskillจะจบเทิร์นของตัวนั้นๆทันที
    
//     // 1. กำหนดสถานะ Blocking ให้หายไปก่อน (ป้องกันไม่ให้ Block ติดค้าง)
//     [...gameState.novices, ...gameState.monsters].forEach(u => u.isBlocking = false);
    
//     // 2. รัน Logic ของ Skill (SkillData.js จะทำการคำนวณ)
//     const result = skill.logic(source, target);
    
//     // 3. จัดการสถานะและจบเทิร์น
//     source.hasUsedAction = true;
//     gameState.currentUnitId = null; // ปลดล็อค Novice ตัวนี้ออกจากเทิร์นปัจจุบัน
//     addLog(`[${source.name}] ใช้ Skill: ${skill.name}`);
    
//     // 4. หากเป็น Monster ต้องเรียก advanceTurn ทันที
//     if (source.type === 'monster') {
//         advanceTurn(); 
//     }
    
//     // 5. หากเป็น Novice ต้องเรียก advanceTurn เพื่อตรวจสอบว่า Novice ครบทุกคนหรือยัง
//     if (source.type === 'novice') {
//         advanceTurn(); 
//     }
    
//     return result;
// }