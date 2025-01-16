<template>
  <v-btn @click="selectFileDialog">Import</v-btn>
  <input ref="uploader" class="d-none" type="file" @change="selectFile" />
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue'
import { loadRepertoire } from './repertoire';

const emit = defineEmits(['repertoire']);
const uploader = ref(null)
const repertoire = ref({})

function selectFileDialog() {
  uploader.value?.click()
}

function selectFile(event: any) {
  var reader = new FileReader();

  var file = event.target.files[0]
  reader.readAsText(file);
  reader.onload = () => {
    repertoire.value = JSON.parse(reader.result);
    loadRepertoire(repertoire.value)
    emit("repertoire", repertoire.value)
  }
}

</script>

<style lang="css" scoped>
</style>