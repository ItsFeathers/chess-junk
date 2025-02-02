<template>
  <TheChessboard :reactive-config="true" :board-config="boardConfig" v-on:move="handleMove" v-on:board-created="handleBoardCreated" />
</template>

<script setup lang="ts">
import { ref,  defineProps, defineEmits, watch } from 'vue'
import { BoardApi, TheChessboard, type BoardConfig } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const props = defineProps(['currentPosition', 'shapes', 'mode', 'player']);
const emit = defineEmits(['move']);
const boardAPI = ref<BoardApi>(undefined)
const currentPosition = ref(props.currentPosition.value)

const boardConfig = ref({
  coordinates: true,
  autoCastle: true,
  orientation: props.player,
  movable: {
    color: props.mode == "teach" ? 'both' : props.player
  }
})


function handleBoardCreated(boardApi: BoardApi) {
  boardAPI.value = boardApi;
}

function playMove(move) {
  return boardAPI.value?.move(move)
}

watch (() => props.shapes, (newValue, oldValue) => {drawShapes()})
function drawShapes() {
  boardAPI.value?.setShapes(props.shapes)
}

watch (() => props.player, (newValue, oldValue) => {updateBoard()})
function updateBoard() {
  boardConfig.value = {
    coordinates: true,
    autoCastle: true,
    orientation: props.player,
    movable: {
      color: props.mode == "teach" ? 'both' : props.player
    }
  } 
  boardAPI.value.setConfig(boardConfig.value)
}

watch (() => props.currentPosition, (newValue, oldValue) => {
  setPosition(newValue)
})
function setPosition(position:string) {
  if(position != boardAPI.value.getFen()) {
    boardAPI.value?.setPosition(position)
  }
  drawShapes()
}

function refreshPosition(position: string) {
  setPosition(position)
}


const move = ref({})

function handleMove(moveEvent: any) {
  move.value = moveEvent;
  currentPosition.value = moveEvent.after
  emit('move', moveEvent);
}

defineExpose({playMove, refreshPosition, })

</script>
