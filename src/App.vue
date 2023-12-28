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
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>Chess Junk</v-toolbar-title>
  </v-app-bar>
  <v-navigation-drawer
      @click="toggleDrawer()"
      v-model="drawer"
    >
      <v-list dense>
        <v-list-item to="openings" link>
          <template v-slot:prepend>
            <v-icon icon="mdi-home"></v-icon>
          </template>
          <v-list-item-title>Openings</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view/>
    </v-main>
    <v-footer
      color="indigo"
      app
    >
    <span class="white--text">&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
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
