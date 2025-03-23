<template>
  <v-btn @click="downloadRepertoire">Export</v-btn>
</template>

<script setup lang="ts">
import {saveAs} from 'file-saver';
import { Repertoire } from "./dom/repertoire";
import { ResultsSummary } from './dom/testResult';

const props = defineProps({
  repertoire: {
    type: Repertoire,
    required: true,
  },
  testResultSummary: {
    type: ResultsSummary,
    required: true
  }
})

function downloadRepertoire() {
  saveAs(new Blob([JSON.stringify({
    repertoire: props.repertoire.exportToObject(),
    testHistory: props.testResultSummary.exportToObject()
  }, null, 4),
  ]), "a-with-history.json")
}
</script>
