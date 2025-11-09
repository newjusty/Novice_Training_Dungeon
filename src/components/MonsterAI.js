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
    if (nearestDistance > attackSkill.range && !monster.hasMoved) { 
    
        const targetPos = getMovementTarget(monster, nearestNovice, nearestDistance);
        if (targetPos) {
            const moveSuccessful = attemptMove(monster, targetPos.x, targetPos.y);
            if (moveSuccessful) {
                return; // ถ้าสำเร็จ advanceTurn ถูกเรียกแล้ว
            }
        }
    }

    // ------------------------------------
    // 4. Logic Pass Turn
    // ------------------------------------
    addLog(`[${monster.name}] ไม่สามารถกระทำได้, ผ่านเทิร์น.`);
    monster.hasUsedAction = true; 
    advanceTurn();
}

// **********************************************
// 3. Logic Pathfinding อย่างง่าย
// **********************************************

/**
 * ตรวจสอบว่าตำแหน่ง (x, y) มี Unit อื่นยืนอยู่หรือไม่
 */
function getMovementTarget(monster, target, currentDistance) { 
    const start = monster.position;
    const maxMove = monster.moveRange;
    const monsterId = monster.id;
    let candidates = []; // เก็บช่องเดินที่เป็นไปได้ทั้งหมดที่ลดระยะทาง
    let maxReduction = 0;

    // 1. วนลูปตรวจสอบช่องรอบตัว Monster ในระยะ 2 ช่อง
    for (let dx = -maxMove; dx <= maxMove; dx++) {
        for (let dy = -maxMove; dy <= maxMove; dy++) {
            const newX = start.x + dx;
            const newY = start.y + dy;
            
            // ใช้ Manhattan Distance เพื่อตรวจสอบว่าอยู่ในระยะเดินหรือไม่
            if (getDistance(start, { x: newX, y: newY }) <= maxMove) {
                
                // คำนวณระยะทางที่ลดลงเมื่อเทียบกับ Novice
                const newDistance = getDistance({ x: newX, y: newY }, target.position);
                const distanceReduction = currentDistance - newDistance;
                
                if (distanceReduction >= maxReduction) { // 🌟 เก็บทุกช่องที่ลดระยะทางเท่ากันหรือมากกว่า
                    maxReduction = distanceReduction;
                    candidates.push({ x: newX, y: newY, reduction: distanceReduction });
                }
            }
        }
    }
    
    // 2. กรองเฉพาะตำแหน่งที่ลดระยะทางได้มากที่สุด (maxReduction)
    const bestCandidates = candidates.filter(c => c.reduction === maxReduction);

    if (bestCandidates.length === 0) {
        addLog(`[AI Debug] ${monster.name} หาช่องเดินที่ลดระยะทางไม่ได้`);
        return null;
    }
    
    // 3. สุ่มเลือกตำแหน่งที่ดีที่สุด 1 ตำแหน่ง
    const chosenPos = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
    
    // 4. ตรวจสอบว่าสามารถเดินไปตำแหน่งนั้นได้จริงหรือไม่ โดยใช้ attemptMove Logic
    // เราไม่สามารถใช้ attemptMove ตรง ๆ ที่นี่ได้ เพราะ attemptMove จะทำการย้าย Unit ทันที
    // เราต้องเรียกใช้ Logic ตรวจสอบพื้นที่ว่างด้วยตนเอง (หรือใช้ฟังก์ชัน isPositionOccupied ที่สร้างไว้)

    // 🚨 NOTE: เพื่อให้ง่ายและถูกต้อง: เราจะให้ attemptMove ตรวจสอบทุกอย่าง
    // แต่เราต้องมั่นใจว่าตำแหน่งที่เลือกนั้นเป็นตำแหน่งที่ว่าง (isPositionOccupied)

    // **เราจะใช้ isPositionOccupied ที่สร้างไว้ก่อนหน้า**
    if (isPositionOccupied(chosenPos.x, chosenPos.y, monsterId) || chosenPos.x < 1 || chosenPos.x > 9 || chosenPos.y < 1 || chosenPos.y > 9) {
        addLog(`[AI Debug] ${monster.name} ตำแหน่ง ${chosenPos.x}, ${chosenPos.y} ถูกบล็อก`);
        return null; // ✅ ถ้าถูกบล็อก ให้คืนค่า null (แล้วจะไหลลงไป Pass Turn)
    }

    return chosenPos;
}

/**
 * ตรวจสอบว่าตำแหน่ง (x, y) มี Unit อื่นยืนอยู่หรือไม่
 * (นำเข้าจาก MonsterAI.js ที่เราเคยสร้างไว้)
 */
function isPositionOccupied(x, y, currentUnitId = null) {
    // รวม Novices และ Monsters ทั้งหมด
    const allUnits = [...gameState.novices, ...gameState.monsters]
        // ✅ กรอง Unit ที่ตายแล้ว
        .filter(u => u.stats.hp > 0) 
        // ✅ กรอง Unit ตัวเองออกไป
        .filter(u => u.id !== currentUnitId); 

    // ตรวจสอบว่ามี Unit ใดมีตำแหน่งตรงกับ (x, y) หรือไม่
    return allUnits.some(unit => unit.position.x === x && unit.position.y === y);
}