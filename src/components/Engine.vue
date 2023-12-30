<template>
  <v-row no-gutters>
    <v-sheet>{{ latestMessage }}</v-sheet>
  </v-row>
</template>

<script setup lang="ts">
import { createUnparsedSourceFile } from 'typescript';
import { defineProps, watch } from 'vue';

const props = defineProps(['currentPosition'])
const latestMessage=ref('');

var stockfish = new Worker(
  new URL('/stockfish-nnue-16.js', import.meta.url),
  {type: 'module'}
);
stockfish.postMessage('uci');

console.log(stockfish)

stockfish.addEventListener('message', function (e) {
  latestMessage.value = e.data
  
  const parts = e.data.split(" ");
  console.log(parts[0])

  if(parts[0] == "info") {
    console.log(parts)
    console.log(e.data)
    var data = {}
    var idx = 1
    while(idx < parts.length) {
      if (parts[idx] == "depth") {
        data["depth"] = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "seldepth") {
        data["seldepth"] = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "multipv") {
        data["multipv"] = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "score") {
        data["scoreType"] = parts[idx + 1];
        data["score"] = parts[idx + 2];
        idx += 3;
      } else if (parts[idx] == "nodes") {
        data["nodes"] = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "nps") {
        data["nps"] = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "hashfull") {
        data["hashfull"] = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "time") {
        data["time"] = parts[idx + 1];
        idx += 2;
      } else {
        console.log(parts[idx])
        break
      }

    }

  }

});


watch(() => props.currentPosition, (newValue, oldValue) => {
  stockfish.postMessage('stop')
  stockfish.postMessage(`position fen ${newValue}`)
  stockfish.postMessage("go")
})

</script>
<script lang="ts">
import { ref } from 'vue';



</script>


<style lang="css" scoped>
</style>