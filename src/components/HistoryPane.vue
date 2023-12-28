<template>
  <v-row no-gutters>
    <v-col :key="index" v-for="historyItem, index in history" cols=6>
      <v-sheet>{{ historyItem.san }}</v-sheet>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
const props = defineProps(['history'])

</script>
<script lang="ts">


// var stockfish = new Worker(
//   new URL('/stockfish-nnue-16.js', import.meta.url),
//   {type: 'module'}
// );

// console.log(stockfish)

// stockfish.addEventListener('message', function (e) {
//   console.log(e.data);
// });


// stockfish.postMessage('uci');
// stockfish.postMessage("position rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2")
// stockfish.postMessage("go")

interface IMove { 
  "color": string, 
  "piece": string,
  "from": string, 
  "to": string,
  "san": string,
  "flags": string,
  "lan": string,
  "before": string,
  "after": string, 
  "captured": string 
}

</script>


<style lang="css" scoped>
</style>