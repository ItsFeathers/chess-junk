<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from 'vue';

</script>
<script lang="ts">
const drawer = ref(false)

function toggleDrawer() {
  drawer.value = ! drawer.value
}
</script>

<template>
  <v-app>
    <v-app-bar
        app
        color="indigo"
        dark
    >
    <v-toolbar-title>Chess Junk</v-toolbar-title>
  </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<style>
.v-application {
  width: 100vw;
  margin: 0;
}
#app {
  margin: 0;
  padding: 0;
  width: 100vw !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.v-main {
  margin: 0;
}

</style>
