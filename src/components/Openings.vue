<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="0" md="3"></v-col>
      <v-col cols="12" md="6">
        <RepertoireUploader v-on:repertoire="updateRepertoire"/>
      </v-col>
      <v-col sm="0" cols="3"></v-col>
    </v-row>
    <v-row no-gutters>
      <v-col sm="0" cols="1"></v-col>
      <v-col cols="12" md="2">
        <Engine :currentPosition="currentPosition" />
      </v-col>
      <v-col cols="12" md="6">
        <Board :currentPosition="currentPosition" v-on:move="handleMove" :shapes="shapes"/>
      </v-col>
      <v-col cols="6" md="1">
        <HistoryPane :history="history" :currentIndex="currentIndex" v-on:historyClick="historyClicked" />
      </v-col>
      <v-col cols="6" md="1">
        <Repertoire :repertoire="repertoire" :currentPosition="currentPosition" v-on:shapes="updateShapes"/>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted  } from 'vue'
import HistoryPane from './HistoryPane.vue'
import Engine from './Engine.vue';
import Board from './Board.vue'
import Repertoire from './Repertoire.vue'
import RepertoireUploader from './RepertoireUploader.vue';
import 'vue3-chessboard/style.css';


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

type Position = {

}

type Shape = {}

const repertoire = ref({} as Map<string, Position>)
const move = ref({})
const history = ref([])
const currentPosition = ref('')
const shapes = ref([] as Shape[])
const currentIndex = ref(-1)

function handleMove(moveEvent: any) {
  var newIdx = currentIndex.value + 1

  move.value = moveEvent
  currentPosition.value = moveEvent.after

  if(history.value.length == newIdx) {
    history.value.push(moveEvent)
  } else {
    console.log(history.value[currentIndex.value], moveEvent)
    if(history.value[currentIndex.value].san != moveEvent.san) {
      history.value = history.value.slice(0, newIdx)
      history.value.push(moveEvent)
    }
  }
  currentIndex.value += 1
}

function updateRepertoire(newRepertoire: Map<string, Position>) {
  repertoire.value = newRepertoire
}

function updateShapes(newShapes: Shape[]) {
  shapes.value = newShapes
}

function historyClicked(index: number) {
  currentPosition.value = history.value[index].after
  currentIndex.value = index
}

</script>

<style lang="css" scoped>
.main-wrap{width:100%;margin-inline:auto;max-width:70vh}
</style>