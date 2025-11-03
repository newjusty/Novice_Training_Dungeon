<template>
  <div :class="tileClass" class="tile" @click="$emit('click')"> 
    <div v-if="unit" :class="unitClass">
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
    unit: { type: Object, default: null } 
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
    unitIcon() {
      if (!this.unit) return '';
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
</style>