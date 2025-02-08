<template>
  <v-virtual-scroll height="300px" :items="pairedMoves" class="my-3">
    <template v-slot:default="{ item, index }">
      <v-row no-gutters>
        <v-col cols="6" v-bind:style="{cursor: 'pointer'}" :class="(index * 2) + 1 == currentIndex ? 'current' : ''">
          <v-sheet @click="goBack((index * 2)+ 1)">{{ item.whiteMove }}</v-sheet>
        </v-col>
        <v-col :key="index" cols="6" v-bind:style="{cursor: 'pointer'}" :class="(index * 2) + 2 == currentIndex ? 'current' : ''">
          <v-sheet @click="goBack((index * 2)+ 2)">{{ item.blackMove }}</v-sheet>
        </v-col>
      </v-row>
    </template>
  </v-virtual-scroll>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { AnnotatedHistory } from './dom/history';
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
  for (var idx=0; idx<props.history.length(); idx+=2) {
    result.push({
      moveNumber: (idx / 2),
      whiteMove: props.history.getPositionByIdx(idx)?.movePlayed?.san,
      blackMove: props.history.getPositionByIdx(idx + 1)?.movePlayed?.san
    })
  }
  return result
});

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