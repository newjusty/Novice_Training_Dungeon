<template>
  <div class="map-grid">
    <div v-for="(row, rowIndex) in mapData" :key="rowIndex" class="map-row">
      <Tile 
        v-for="(tileType, colIndex) in row" 
        :key="colIndex"
        :tile-type="tileType"
      />
    </div>
  </div>
</template>

<script>
import Tile from './Tile.vue';
import { initialMap } from '@/components/Mapdata'; 

export default {
  components: {
    Tile
  },
  data() {
    return {
      mapData: initialMap 
    }
  }
}
</script>

<style scoped>
/* Map Grid Container */
.map-grid {
  display: flex;
  flex-direction: column; /* จัดให้แถวเรียงซ้อนกันในแนวตั้ง */
  border: 2px solid #000; /* ขอบเขตของแผนที่ */
  margin: 0 auto;
  width: min-content;
}
/*  */
/* Row Container */
.map-row {
  display: flex; /* จัดให้ Tile เรียงกันในแนวนอน */
}
</style>