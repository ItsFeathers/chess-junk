<template>
  <v-row no-gutters>
    <v-col :key="index" v-for="historyItem, index in history" cols="6" v-bind:style="{cursor: 'pointer'}" :class="index == currentIndex ? 'current' : ''">
      <v-sheet @click="goBack(index)">{{ historyItem.san }}</v-sheet>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const props = defineProps(['history', 'currentIndex'])
const emit = defineEmits(['historyClick'])

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