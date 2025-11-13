// src/data/gameState.js

import { reactive } from 'vue';

export const baseUnit = {
  stats: {
    hp: 0,
    maxHp: 0,
    defense: 0,
    attack: 0,
  },
  hasMoved: false,     
  hasUsedAction: false, 
  isBlocking: false,   
  skills: [],          
  moveRange: 2         
};

// Array สำหรับเก็บข้อมูล Novice และ Monster
export const gameState = reactive({
  novices: [],
  monsters: [],
  currentTurn: 'novice',
  turnOrder: [],         
  currentUnitId: null,   
  currentAction: null, 
  currentSkill: null,
  gameStatus: 'playing',
  highlightedTiles: [], 
  log: [],
  interstitial: {
        show: false,         // แสดงฉากคั่นหรือไม่
        message: '',         // ข้อความที่แสดง
        phase: '' 
  }               
});