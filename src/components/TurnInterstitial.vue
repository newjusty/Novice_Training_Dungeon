<template>
  <div v-if="gameState.interstitial.show" class="interstitial-overlay">
    <div :class="['interstitial-box', gameState.interstitial.phase]">
      <h1>{{ gameState.interstitial.message }}</h1>
    </div>
  </div>
</template>

<script>
import { gameState } from './Gamestate.js'; 

export default {
    computed: {
        gameState() {
            return gameState;
        }
    }
}
</script>

<style scoped>
.interstitial-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000; /* ให้แสดงอยู่บนสุด */
}
.interstitial-box {
    padding: 20px 40px;
    border-radius: 10px;
    color: white;
    font-size: 2em;
    animation: fadeInOut 1.2s ease-in-out forwards; /* เพิ่ม Animation */
}
.novice { background-color: #388e3c; } /* สีเขียวสำหรับ Novice */
.monster { background-color: #d32f2f; } /* สีแดงสำหรับ Monster */

@keyframes fadeInOut {
    0% { opacity: 0; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.1); }
}
</style>