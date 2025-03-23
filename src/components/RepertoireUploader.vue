<template>
  <v-btn @click="selectFileDialog">Import</v-btn>
  <input ref="uploader" class="d-none" type="file" @change="selectFile" />
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from "vue";
import { loadRepertoire } from "./dom/repertoire";
import { loadResultSummary } from "./dom/testResult";

const emit = defineEmits(["repertoire", "testHistory"]);
const uploader = ref(null);
const repertoire = ref({});

function selectFileDialog() {
  uploader.value?.click();
}

function selectFile(event: any) {
  var reader = new FileReader();
  var file = event.target.files[0];
  reader.readAsText(file);
  reader.onload = () => {
    var uploadedRepertoire;
    var uploadedTestHistory;

    const readResult = JSON.parse(reader.result);
    if ("repertoire" in readResult) {
      uploadedRepertoire = loadRepertoire(readResult["repertoire"]);
      uploadedTestHistory = loadResultSummary(readResult["testHistory"]);
    } else {
      uploadedRepertoire = loadRepertoire(readResult);
      uploadedTestHistory = loadResultSummary({});
    }
    repertoire.value = uploadedRepertoire;
    emit("repertoire", uploadedRepertoire);
    emit("testHistory", uploadedTestHistory);
  };
}
</script>
