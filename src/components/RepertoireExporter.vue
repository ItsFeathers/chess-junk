<template>
  <v-btn @click="downloadRepertoire">Export</v-btn>
</template>

<script setup lang="ts">
import {saveAs} from 'file-saver';
import { Repertoire } from "./dom/repertoire";

const props = defineProps({
  repertoire: {
    type: Repertoire,
    required: true,
  }
})

function downloadRepertoire() {
  saveAs(new Blob([JSON.stringify(props.repertoire.exportToObject(), null, 4)]), "a.json")
}
</script>
