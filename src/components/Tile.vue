<template>
  <div :class="[tileClass, highlightClass]" class="tile" @click="$emit('click')">
    <div v-if="unit && unit.stats.hp > 0" :class="unitClass"> 
      {{ unitIcon }}
    </div>
  </div>
</template>

<script>
export default {
  emits: ['click'],
  props: {
    tileType: { type: Number, required: true },
    x: { type: Number, required: true }, 
    y: { type: Number, required: true }, 
    unit: { type: Object, default: null },
    isHighlighted: { type: Object, default: null }
  },
  computed: {
    tileClass() {
      return {
        'tile-wall': this.tileType === 0,
        'tile-floor': this.tileType === 1
      };
    },
    unitClass() {
      if (!this.unit) return {};
      return {
        'unit-novice': this.unit.type === 'novice',
        'unit-monster': this.unit.type === 'monster',
      };
    },
    highlightClass() {
            if (!this.isHighlighted) return '';
            
            // 🌟 คืนค่า class ตาม type ที่ส่งมา ('move' หรือ 'target')
            return {
                'highlight-move': this.isHighlighted.type === 'move',
                'highlight-target': this.isHighlighted.type === 'target'
      };
    },
    unitIcon() {
      // 🌟 Logic ใน computed นี้ควรเป็นแค่การเลือก Icon
      if (!this.unit || this.unit.stats.hp <= 0) return ''; // ควรถูกจัดการโดย v-if
      return this.unit.type === 'novice' ? '🧑' : '👾';
    }
  }
}
</script>

<style>
@import './Tile.css';

/* เพิ่มสไตล์สำหรับ Unit ในไฟล์ styles/tile.css หรือใน Tile.vue นี้ก็ได้ */
.unit-novice {
  pointer-events: none;
  font-size: 20px; /* ขนาดไอคอนตัวละคร */
  color: blue;
}
.unit-monster {
  pointer-events: none;
  font-size: 20px;
  color: red;
}
.highlight-move {
    background-color: #007bff80 !important; /* สีฟ้าอ่อนโปร่งแสง (เดิน) */
    border: 2px dashed #007bff;
}

.highlight-target {
    background-color: #dc354580 !important; /* สีแดงอ่อนโปร่งแสง (โจมตี) */
    border: 2px solid #dc3545;
}

.unit-novice, .unit-monster {
    transition: all 2s ease-in-out; 
}

.unit-novice, .unit-monster {
    /* นี่คือ div ที่แสดง Emoji */
    transition: all 3s ease-in-out; 
    /* pointer-events: none; (รักษาส่วนนี้ไว้) */
}
</style>