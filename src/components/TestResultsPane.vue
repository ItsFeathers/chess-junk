<template>
  <v-row no-gutters class="my-3">
    <v-col :key="index" v-for="result, index in results" cols="12" v-bind:style="{cursor: 'pointer'}" :class="' my-1' + (index == currentIndex ? 'current' : '')">
      <v-card @click="loadGame(result)">
        <v-card-subtitle>{{ result.result }} - {{ result.streak }}</v-card-subtitle>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const props = defineProps(['history', 'currentIndex', 'results'])
const emit = defineEmits(['loadGame'])

function loadGame(result) {
  emit("loadGame", result)
}

</script>

<style lang="css" scoped>
.current {
  border: 3px solid;
  border-color: black;
}
</style>
