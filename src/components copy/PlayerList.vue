<template>
  <span>
  <v-chip
    class="ma-2"
    v-for="player in players" :key="player"
    :color="active ? (playersWhoVoted.indexOf(player) != -1 ? 'green' : 'red') : 'gray'"
  >
  {{player}}
  </v-chip>
  </span>
</template>

<script>
import TwitchReader from './TwitchReader.vue'
import VueApexChart from 'vue-apexcharts'


export default {
  name: 'PlayerList',
  components: {
    // apexchart: VueApexChart,
    // TwitchReader
  },
  created: function () {
    this.resetChart()
  },
  props: {
    "players": {
      type: Array,
      default: () => ["itisfeathers"],
    },
    "playersWhoVoted": {
      type: Array,
      default: () => [],
    },
    "active": {
      type: Boolean,
      default: false,
    },
  },
  methods: {
  },
  watch: {
  },
};
</script>
<style>
</style>