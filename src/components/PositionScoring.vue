<template>
    <v-card
    >
        <v-card-title>AAAAAAA</v-card-title>
        <v-progress-circular
            :model-value="score * 100"

            :size="100"
            :width="15"
            color="red"
            >
            {{ Math.round(score * 100) }}%
        </v-progress-circular>
        <v-card-actions>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Repertoire } from "./dom/repertoire";
import { ResultsSummary } from "./dom/testResult";
import { getPlayerToMove, simplifyFen } from "./dom/fenUtils";
  
const props = defineProps({
    repertoire: {
        type: Repertoire,
        required: true,
    },
    resultsSummary: {
        type: ResultsSummary,
        required: true,
    },
    currentPosition: {
        type: String,
        required: true
    },
    player: {
        type: String,
        required: true
    }
});

const score = computed(() => {
    console.log("recompute")
    // if (getPlayerToMove(props.currentPosition) == props.player) {
    return props.resultsSummary.getCompleteness(simplifyFen(props.currentPosition), props.player, props.repertoire, 4);
});



  
  
</script>
  
  <style lang="css" scoped>
  .selected {
    background-color: #66ff66;
  }
  .alternative {
    background-color: #FFff66;
  }
  .option {
    background-color: #6666ff;
  }
  </style>
  