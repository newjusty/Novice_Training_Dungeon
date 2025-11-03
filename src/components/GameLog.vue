<template>
    <div class="game-log">
        <h4>บันทึกเหตุการณ์</h4>
        <div v-for="(msg, index) in log" :key="index" class="log-entry">
            {{ msg }}
        </div>
    </div>
</template>

<script>
import { gameState } from './Gamestate.js'; 

export default {
    computed: {
        log() {
            return gameState.log;
        }
    }
}
</script>

<style scoped>
.game-log {
    width: 100%;
    max-height: 200px;
    background-color: #222;
    color: #ccc;
    padding: 10px;
    overflow-y: scroll;
    text-align: left;
    border-radius: 5px;
    font-size: 0.8em;
    margin-top: 20px;
}
.log-entry {
    border-bottom: 1px dashed #444;
    padding: 2px 0;
}
</style>