<template>
  <v-virtual-scroll height="300px" :items="pairedMoves" class="my-3">
    <template v-slot:default="{ item, index }">
      <v-row no-gutters>
        <v-col cols="2" v-bind:style="{cursor: 'pointer'}">
          <v-sheet>{{ index }}</v-sheet>
        </v-col>
        <v-col cols="5" v-bind:style="{cursor: 'pointer'}" :class="(index * 2) + 1 == currentIndex ? 'current' : '' + ' '">
          <v-sheet @click="goBack((index * 2)+ 1)">{{ item.whiteMove }} <v-icon :color="item.whiteEvaluation.color">{{ item.whiteEvaluation.icon }}</v-icon></v-sheet>
        </v-col>
        <v-col :key="index" cols="5" v-bind:style="{cursor: 'pointer'}" :class="(index * 2) + 2 == currentIndex ? 'current' : ''">
          <v-sheet @click="goBack((index * 2)+ 2)">{{ item.blackMove }} <v-icon :color="item.blackEvaluation.color">{{ item.blackEvaluation.icon }}</v-icon></v-sheet>
        </v-col>
      </v-row>
    </template>
  </v-virtual-scroll>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { AnnotatedHistory, AnnotatedPosition, AnnotationType } from './dom/history';
const props = defineProps({
  'history': {
    type: AnnotatedHistory,
    required: true
  }, 
  'currentIndex': {
    type: Number,
    required: true
  }
})
const emit = defineEmits(['historyClick'])

const pairedMoves = computed(() => {
  var result = []
  for (var idx=0; idx<props.history.length() -1; idx+=2) {
    result.push({
      moveNumber: (idx / 2),
      whiteMove: props.history.getPositionByIdx(idx)?.movePlayed?.san,
      whiteEvaluation: getEvaluation(props.history.getPositionByIdx(idx + 1)),
      blackMove: props.history.getPositionByIdx(idx + 1)?.movePlayed?.san,
      blackEvaluation: getEvaluation(props.history.getPositionByIdx(idx + 2)),
    })
  }
  return result
});

// mdi-check-circle-outline

function getEvaluation(position: AnnotatedPosition | null) {
  if (!position) {
    return {color: "white", icon: "mdi-check-circle-outline"}
  }
  for (let idx = 0; idx < position.annotations.length; ++idx) {

    if (position.annotations[idx].type == AnnotationType.BreaksOpponentRepertoire) {
      return {color: "purple", icon: "mdi-cancel"}
    } else if (position.annotations[idx].type == AnnotationType.BreaksRepertoire) {
      return {color: "red", icon: "mdi-cancel"}
    } else if (position.annotations[idx].type == AnnotationType.EngineBlunder) {
      return {color: "purple", icon: "mdi-battery-charging-20"}
    } else if (position.annotations[idx].type == AnnotationType.EngineGood) {
      return {color: "purple", icon: "mdi-battery-charging-100"}
    } else if (position.annotations[idx].type == AnnotationType.EngineInaccuracy) {
      return {color: "purple", icon: "mdi-battery-charging-60"}
    } else if (position.annotations[idx].type == AnnotationType.EngineMistake) {
      return {color: "purple", icon: "mdi-battery-charging-40"}
    } else if (position.annotations[idx].type == AnnotationType.NotFound) {
      // Out of repertoire, no engine analysis
    } else if (position.annotations[idx].type == AnnotationType.Played) {
      // Not interesting
    } else if (position.annotations[idx].type == AnnotationType.RepertoireAlternative) {
      return {color: "yellow", icon: "mdi-check-circle-outline"}
    } else if (position.annotations[idx].type == AnnotationType.RepertoireMatch) {
      return {color: "green", icon: "mdi-check-circle-outline"}
    } else if (position.annotations[idx].type == AnnotationType.RepertoireOpponentMove) {
      return {color: "blue", icon: "mdi-check-circle-outline"}
    } else {
      // Unknown, continue
    }
  }
  return {color: "white", icon: "mdi-check-circle-outline"}
}

function goBack(index: number) {
  emit("historyClick", index)
}

</script>
<script lang="ts">

</script>


<style lang="css" scoped>
.current {
  border: 3px solid;
  border-color: black;
}
</style>