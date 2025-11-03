// src/utils/unitSpawner.js
import { baseUnit, gameState } from './Gamestate.js';
import { NoviceSkills, MonsterSkills } from './SkillData.js';

/**
 * สุ่มตำแหน่งเกิดในช่วงคอลัมน์ [minX, maxX] และแถวคงที่ y
 * @param {number} y 
 * @param {number} minX 
 * @param {number} maxX 
 * @param {Array} currentPositions 
 * @returns {object} 
 */

function getRandomPosition(y, minX = 1, maxX = 10, currentPositions = []) {
  let position;
  let isOccupied = true;
  
  // สุ่มจนกว่าจะได้ตำแหน่งที่ว่าง
  while(isOccupied) {
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    position = { x, y };
    isOccupied = currentPositions.some(pos => pos.x === x && pos.y === y);
    if (!isOccupied) break;
  }
  return position;
}

/**
 * 1. สร้าง Novice 3 ตัว และสุ่มเกิดในแถวที่ 9 (1, 9) ถึง (10, 9)
 */
export function spawnNovices() {
    const currentPositions = [];
    
    for (let i = 0; i < 3; i++) {
        const noviceBaseSpeed = 10;
        
        // 🚨 ประกาศและกำหนดค่าตัวแปร 'position' ที่นี่!
        const position = getRandomPosition(9, 1, 9, currentPositions); 
        
        currentPositions.push(position); // เพิ่มตำแหน่งที่ถูกจองแล้ว

        const novice = {
            ...baseUnit,
            id: `N${i + 1}`,
            name: `Novice ${i + 1}`,
            type: 'novice',
            position: position, // ✅ ตอนนี้ 'position' ถูกกำหนดแล้ว
            stats: {
                hp: 20,
                maxHp: 20,
                defense: 5,
                attack: 5,
            },
            hasMoved: false,     // ✅ สถานะเริ่มต้น
            hasUsedAction: false, // ✅ สถานะเริ่มต้น
            isBlocking: false,   
            skills: NoviceSkills,
            moveRange: 2
        };
        gameState.novices.push(novice);
    }
}

/**
 * 2. สร้าง Monster 2 ตัว และสุ่มเกิดในแถวที่ 1 (1, 1) ถึง (10, 1)
 */
export function spawnMonsters() {
    const currentPositions = [];
    
    for (let i = 0; i < 2; i++) {
        const monsterBaseSpeed = 5;
        const position = getRandomPosition(1, 1, 9, currentPositions); 
        currentPositions.push(position);

        const monster = {
        ...baseUnit,
        id: `M${i + 1}`,
        name: `Slime ${i + 1}`, 
        type: 'monster',
        position: position,
        stats: {
            hp: 10,
            maxHp: 10,
            defense: 5,
            attack: 3,
            speed: monsterBaseSpeed - i, // 5, 4 ✅ ใส่คอมมา
        }, 
        skills: MonsterSkills // ✅ ย้าย skills มาที่ Object หลัก (baseUnit มี property 'skills' อยู่แล้ว)
    };
    gameState.monsters.push(monster);
}
}

export function initializeGame() {
    // ******* รีเซ็ตสถานะทั้งหมดเมื่อเริ่มเกมใหม่ *******
    gameState.novices.splice(0, gameState.novices.length); 
    gameState.monsters.splice(0, gameState.monsters.length);

    spawnNovices();
    spawnMonsters();
}