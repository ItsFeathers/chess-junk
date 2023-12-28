<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="1"></v-col>
      <v-col cols="2">
        <Engine :currentPosition="currentPosition" />
      </v-col>
      <v-col cols="6">
        <TheChessboard v-on:move="handleMove"/>
      </v-col>
      <v-col cols="2">
        <HistoryPane :history="history" />
      </v-col>
      <v-col cols="1">
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted  } from 'vue'
import HistoryPane from './HistoryPane.vue'
import Engine from './Engine.vue';
import { TheChessboard } from 'vue3-chessboard'
import 'vue3-chessboard/style.css';
import { Chess } from 'chess.js';

const game = new Chess()

onMounted(() => {
  const boardConfig: Config = {
    coordinates: true,
    autoCastle: true,
    orientation: 'black',
    movable: {
      free: true
    }
  }
  
})

// let boardAPI: BoardApi;
const move = ref({})
const history = ref([])
const currentPosition = ref('')

function handleMove(moveEvent: any) {
  console.log(moveEvent)
  move.value = moveEvent
  currentPosition.value = moveEvent.after
  history.value.push(moveEvent)
}

</script>

<style lang="css" scoped>
.main-wrap{width:100%;margin-inline:auto;max-width:70vh}
</style>