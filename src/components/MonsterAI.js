// \training_novice\src\components\MonsterAI.js
import { gameState } from './Gamestate.js';
import { getUnitById, attemptMove, useSkill, advanceTurn, addLog } from './GameLogic.js';

// **********************************************
// 1. ฟังก์ชันคำนวณระยะทาง
// **********************************************

/**
 * คำนวณระยะทางแบบแมนฮัตตัน (Manhattan Distance)
 */
function getDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * ค้นหา Novice ที่มี HP ต่ำที่สุด
 */
function findClosestNovice(monster) {
    let closestNovice = null;
    let minDistance = Infinity;

    // กรอง Novice ที่ยังมีชีวิต (HP > 0)
    const aliveNovices = gameState.novices.filter(n => n.stats.hp > 0);

    if (aliveNovices.length === 0) return null;

    for (const novice of aliveNovices) {
        const distance = getDistance(monster.position, novice.position);
        
        // ถ้า Novice อยู่ใกล้ที่สุด
        if (distance < minDistance) {
            minDistance = distance;
            closestNovice = novice;
        } 
        // ถ้าอยู่ระยะเท่ากัน ให้เลือก Novice ที่ HP น้อยที่สุด (Priority Target)
        else if (distance === minDistance && novice.stats.hp < closestNovice.stats.hp) {
            closestNovice = novice;
        }
    }
    return { unit: closestNovice, distance: minDistance };
}

// **********************************************
// 2. Logic การตัดสินใจของ Monster
// **********************************************

export function takeTurn(monster) {
    console.log(`[AI LOGIC] Monster ${monster.name} กำลังตัดสินใจ...`);
    if (monster.stats.hp <= 0) {
        addLog(`[${monster.name}] ตายแล้ว ข้ามเทิร์น`);
        advanceTurn();
        return;
    }

    const { unit: nearestNovice, distance: nearestDistance } = findClosestNovice(monster);
    if (!nearestNovice) {
        addLog(`[${monster.name}] ไม่มีเป้าหมาย, ผ่านเทิร์น`);
        advanceTurn();
        return;
    }
    
    // ------------------------------------
    // 1. Logic การรักษา (SelfHeal)
    // ------------------------------------
    // เงื่อนไข: HP < 50% และ Novice อยู่ไกลเกิน 1 ช่อง
    const healSkill = monster.skills.find(s => s.name === 'SelfHeal');
    if (monster.stats.hp < monster.stats.maxHp / 2 && nearestDistance > 1 && healSkill) {
        addLog(`[${monster.name}] กำลังรักษาตัวเอง...`);
        // Monster ใช้ Skill (Skill range = 0, target = ตัวเอง)
        useSkill(monster, monster, healSkill); 
        return;
    }

    // ------------------------------------
    // 2. Logic การโจมตี (Attack/Bite)
    // ------------------------------------
    // เงื่อนไข: Novice อยู่ในระยะโจมตี (1 ช่อง)
    const attackSkill = monster.skills.find(s => s.name === 'Bite');
    if (nearestDistance <= attackSkill.range && attackSkill) {
        addLog(`[${monster.name}] โจมตี ${nearestNovice.name}!`);
        // Monster ใช้ Skill (Attack range = 1, target = Novice ที่ใกล้ที่สุด)
        useSkill(monster, nearestNovice, attackSkill);
        return;
    }

    // ------------------------------------
    // 3. Logic การเคลื่อนที่ (Move)
    // ------------------------------------
    // เงื่อนไข: ไม่มี Novice อยู่ในระยะโจมตี
    if (nearestDistance > monster.moveRange && !monster.hasMoved) { 
        // หาช่องที่ควรจะเดินไป (Pathfinding อย่างง่าย)
        const targetPos = getMovementTarget(monster, nearestNovice, nearestDistance);
        
        if (targetPos) {
            attemptMove(monster, targetPos.x, targetPos.y);
            // ถ้าเดินได้ Monster Bot ถือว่าใช้ Action แล้ว (ตาม logic ใน attemptMove)
            return;
        }
    }

    // ------------------------------------
    // 4. Logic Pass Turn
    // ------------------------------------
    addLog(`[${monster.name}] ไม่สามารถกระทำได้, ผ่านเทิร์น.`);
    monster.hasUsedAction = true; // ตั้งสถานะว่าเล่นแล้ว
    advanceTurn();
}

// **********************************************
// 3. Logic Pathfinding อย่างง่าย
// **********************************************

/**
 * ตรวจสอบว่าตำแหน่ง (x, y) มี Unit อื่นยืนอยู่หรือไม่
 */
function isPositionOccupied(x, y) {
    // รวม Novices และ Monsters ทั้งหมด
    const allUnits = [...gameState.novices, ...gameState.monsters].filter(u => u.stats.hp > 0);

    // ตรวจสอบว่ามี Unit ใดมีตำแหน่งตรงกับ (x, y) หรือไม่
    return allUnits.some(unit => unit.position.x === x && unit.position.y === y);
}

/**
 * หาตำแหน่งที่ Bot ควรเดินไป 1 หรือ 2 ช่อง เพื่อเข้าใกล้เป้าหมายที่สุด
 */
function getMovementTarget(monster, target, currentDistance) { 
    const start = monster.position;
    const maxMove = monster.moveRange;
    let bestPos = null;
    let maxReduction = 0;

    for (let dx = -maxMove; dx <= maxMove; dx++) {
        for (let dy = -maxMove; dy <= maxMove; dy++) {
            const newX = start.x + dx;
            const newY = start.y + dy;
            
            // 🌟 ตรวจสอบว่าอยู่ในระยะเดิน (Manhattan Distance)
            if (getDistance(start, { x: newX, y: newY }) <= maxMove) {
                
                // ------------------------------------
                // ✅ เพิ่มการตรวจสอบพื้นที่ว่าง
                // ------------------------------------
                // 1. ตรวจสอบว่าตำแหน่งไม่อยู่ในกำแพง (attemptMove จะจัดการให้ แต่เราควรเลี่ยงตั้งแต่ตอนนี้)
                // 2. ตรวจสอบว่าตำแหน่งไม่ได้ถูกยูนิตอื่นยืนอยู่
                if (newX >= 1 && newX <= 9 && newY >= 1 && newY <= 9 && !isPositionOccupied(newX, newY)) {
                    
                    // คำนวณระยะทางที่ลดลงเมื่อเทียบกับ Novice
                    const newDistance = getDistance({ x: newX, y: newY }, target.position);
                    const distanceReduction = currentDistance - newDistance;
                    
                    // เลือกตำแหน่งที่ลดระยะทางได้มากที่สุด
                    // *หมายเหตุ: ถ้า distanceReduction = 0 แต่ maxReduction = 0, จะเลือก bestPos ใหม่
                    if (distanceReduction > maxReduction) {
                        maxReduction = distanceReduction;
                        bestPos = { x: newX, y: newY };
                    }
                }
            }
        }
    }
    
    // หากไม่สามารถลดระยะทางได้เลย (maxReduction = 0) แต่ยังมีช่องที่ว่างอยู่รอบตัว
    // เราจะคืนค่า null เพื่อให้ Bot Pass Turn (หรืออาจเพิ่ม Logic เดินแบบสุ่มภายหลัง)
    if (bestPos === null) {
        // Log สำหรับการ Debug: หากหาช่องเดินที่ดีที่สุดไม่ได้
        addLog(`[AI Debug] ${monster.name} หาช่องเดินที่ลดระยะทางไม่ได้`); 
    }

    return bestPos;
}


