<template>
  <v-virtual-scroll height="300px" :items="pairedMoves" class="my-3">
    <template v-slot:default="{ item, index }">
      <v-row no-gutters>
        <v-col cols="6" v-bind:style="{cursor: 'pointer'}" :class="(index * 2) == currentIndex ? 'current' : ''">
          <v-sheet @click="goBack((index * 2))">{{ item.whiteMove }}</v-sheet>
        </v-col>
        <v-col :key="index" cols="6" v-bind:style="{cursor: 'pointer'}" :class="(index * 2) + 1 == currentIndex ? 'current' : ''">
          <v-sheet @click="goBack((index * 2) + 1)">{{ item.blackMove }}</v-sheet>
        </v-col>
      </v-row>
    </template>
  </v-virtual-scroll>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
const props = defineProps(['history', 'currentIndex'])
const emit = defineEmits(['historyClick'])

const pairedMoves = computed(() => {
  var result = []
  for (var idx=0; idx<props.history.length; idx+=2) {
    result.push({
      moveNumber: (idx / 2) + 1,
      whiteMove: props.history[idx].san,
      blackMove: props.history[idx + 1]?.san
    })
  }
  return result
});

function goBack(index: number) {
  console.log(props.history[index])
  emit("historyClick", index)
}

</script>
<script lang="ts">


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
.current {
  border: 3px solid;
  border-color: black;
}
</style>