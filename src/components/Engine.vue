<template>
  <v-row no-gutters>
    <v-col cols="4" md="12" v-for="engineOutput in engineOutputs" :key="engineOutput.multipv">
      <v-sheet>{{ engineOutput.topMove }} {{ engineOutput.score }} - {{ engineOutput.scoreType }}</v-sheet>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { createUnparsedSourceFile } from 'typescript';
import { defineProps, watch } from 'vue';

const props = defineProps(['currentPosition'])
const latestMessage=ref('');
const lines = ref(3)

type Line = {
  depth: null;
  seldepth: null;
  multipv: 0;
  scoreType: null;
  score: null;
  nodes: null;
  nps: null;
  hashfull: null;
  time: null;
  pv: null;
  topMove: null;
}

const engineOutputs = ref([] as Array<Line>)
for (let i=0; i<lines.value; i++) {
  engineOutputs.value.push({} as Line)
} 

var stockfish = new Worker(
  new URL('/stockfish-nnue-16.js', import.meta.url),
  {type: 'module'}
);
stockfish.postMessage('uci');


stockfish.addEventListener('message', function (e) {
  latestMessage.value = e.data
  
  const parts = e.data.split(" ");

  if(parts[0] == "info") {
    var data = {} as Line
    var idx = 1
    while(idx < parts.length) {
      if (parts[idx] == "depth") {
        data.depth = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "seldepth") {
        data.seldepth = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "multipv") {
        data.multipv = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "score") {
        data.scoreType = parts[idx + 1];
        data.score = parts[idx + 2];
        idx += 3;
      } else if (parts[idx] == "nodes") {
        data.nodes = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "nps") {
        data.nps = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "hashfull") {
        data.hashfull = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "time") {
        data.time = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "pv") {
        data.topMove = parts[idx + 1];
        idx += 2;
        break
      } else {
        break
      }
      if (data.multipv) {
        engineOutputs.value[data.multipv - 1] = data;
      }

    }

  }

});


watch(() => props.currentPosition, (newValue, oldValue) => {
  stockfish.postMessage('stop')
  stockfish.postMessage(`position fen ${newValue}`)
  stockfish.postMessage(`setoption name multipv value ${lines.value})`)
  stockfish.postMessage("go")
})

</script>
<script lang="ts">
import { ref } from 'vue';



</script>


<style lang="css" scoped>
</style>