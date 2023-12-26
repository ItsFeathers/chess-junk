<template>
  <v-container fluid>
    <TheChessboard 
      :board-config="boardConfig"
      @move="handleMove"
    />
  </v-container>
  <HistoryPane :history="history" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TheChessboard, type BoardConfig } from 'vue3-chessboard';
import HistoryPane from './HistoryPane.vue'
import 'vue3-chessboard/style.css';
import type { BoardApi } from 'vue3-chessboard';

let boardAPI: BoardApi;
const move = ref({})
const history = ref([])

const boardConfig: BoardConfig = {
  coordinates: true,
  autoCastle: true,
  orientation: 'black',
};

function handleMove(moveEvent: any) {
  move.value = moveEvent
  history.value.push(moveEvent)
}

</script>

<style lang="css" scoped>
.board-container {
  min-width: 100px;
}

.switch-center {
  display: flex;
  justify-content: center;
}
</style>