<template>
  <v-container fluid>
    <v-cols>
      <v-row cols="6" v-for="historyItem in history">
        <v-col cols=6>{{ historyItem.san }}</v-col>
      </v-row>
    </v-cols>
  </v-container>

</template>

<script setup lang="ts">

const props = defineProps(['history'])

</script>
<script lang="ts">


var stockfish = new Worker(
  new URL('/stockfish-nnue-16.js', import.meta.url),
  {type: 'module'}
);

console.log(stockfish)

stockfish.addEventListener('message', function (e) {
  console.log(e.data);
});


stockfish.postMessage('uci');
stockfish.postMessage("position rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2")
stockfish.postMessage("go")

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
.board-container {
  min-width: 100px;
}

.switch-center {
  display: flex;
  justify-content: center;
}
</style>