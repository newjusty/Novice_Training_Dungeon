<template>
  <div :class="tileClass" class="tile"></div>
</template>

<script>
// (ส่วน Script เดิม)
export default {
  props: {
    tileType: {
      type: Number,
      required: true
    }
  },
  computed: {
    tileClass() {
      return {
        'tile-wall': this.tileType === 0,
        'tile-floor': this.tileType === 1
      };
    }
  }
}
</script>

<style>
/* ใช้ @import ในแท็ก <style> ธรรมดา (ไม่ใช่ scoped)
  เพื่อดึงสไตล์จากไฟล์ภายนอก 
*/
@import './Tilee.css';
</style>