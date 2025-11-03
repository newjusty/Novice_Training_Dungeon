// \training_novice\src\components\SkillData.js

/**
 * โครงสร้างพื้นฐานของ Skill
 */
const baseSkill = {
    name: '',
    description: '',
    range: 0, // ระยะการใช้งาน (ช่อง)
    isHealing: false, // เป็น Skill รักษาหรือไม่
    isBlock: false, // เป็น Skill ป้องกันหรือไม่
    logic: null // ฟังก์ชันที่จะถูกเรียกใช้เมื่อ Skill ถูกใช้งาน
};

// --- Novice Skills ---
export const NoviceSkills = [
    {
        ...baseSkill,
        name: 'Attack',
        description: 'ทำความเสียหายตามค่า Attack',
        range: 1,
        logic: (source, target) => {
            // โค้ดนี้จะถูกเรียกใช้ใน Game Logic
            return {
                damage: source.stats.attack, // ส่งค่า Attack กลับไปคำนวณ
                isAttack: true
            };
        }
    },
    {
        ...baseSkill,
        name: 'Block',
        description: 'เพิ่มสถานะป้องกัน ลดดาเมจที่ได้รับลงครึ่งหนึ่ง',
        range: 0,
        isBlock: true,
        logic: (source) => {
            // ในที่นี้ เราแค่ตั้งสถานะ "Blocking" ให้กับ source unit
            source.isBlocking = true;
            return { message: `${source.name} เข้าสู่โหมดป้องกัน!` };
        }
    },
    {
        ...baseSkill,
        name: 'Heal',
        description: 'ฮิล HP ที่เสียไป 5 หน่วย',
        range: 0,
        isHealing: true,
        logic: (source) => {
            const healAmount = 5;
            const maxHp = source.stats.maxHp;
            // คำนวณ HP ใหม่ ไม่ให้เกิน Max HP
            const newHp = Math.min(source.stats.hp + healAmount, maxHp);
            const actualHealed = newHp - source.stats.hp;
            
            source.stats.hp = newHp; // อัปเดต HP
            return { message: `${source.name} ได้รับการรักษา ${actualHealed} หน่วย` };
        }
    }
];

// --- Monster Skills ---
export const MonsterSkills = [
    {
        ...baseSkill,
        name: 'Bite',
        description: 'ทำความเสียหายตามค่า Attack',
        range: 1,
        logic: (source, target) => {
            return {
                damage: source.stats.attack,
                isAttack: true
            };
        }
    },
    {
        ...baseSkill,
        name: 'SelfHeal',
        description: 'ฮิล HP ที่เสียไป 3 หน่วย',
        range: 0,
        isHealing: true,
        logic: (source) => {
            const healAmount = 3;
            const maxHp = source.stats.maxHp;
            const newHp = Math.min(source.stats.hp + healAmount, maxHp);
            const actualHealed = newHp - source.stats.hp;
            
            source.stats.hp = newHp;
            return { message: `${source.name} รักษาตัวเอง ${actualHealed} หน่วย` };
        }
    }
];