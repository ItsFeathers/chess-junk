<template>
  <v-card class="scrollable">
  <v-container fluid>
    <v-data-iterator
      :items="moves"
      items-per-page.sync="100"
      hide-default-footer
    >
      <template v-slot:header>
        <v-toolbar
          class="mb-2"
          color="primary"
          dark
          flat
        >
        <v-toolbar-title>Moves</v-toolbar-title>
        <v-spacer/>
        <v-btn
          v-on:click="flip_show()"
          color="primary"
        >
          <v-icon>
            {{ show ? "mdi-plus" : "mdi-minus" }}
          </v-icon>
        </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:default="props">
        <v-row v-if="show">
          <v-col
            v-for="item in moves"
            :key="item.move"
            cols="12"
          >
            <v-card :class="(preferred_move && preferred_move.friendly_notation == item.friendly_notation) ? 'green' : 'blue'">
              <v-container>
                <v-row justify="space-between">

                  <v-col cols="6" class="text-center">
                    <h3>{{ item.friendly_notation }}</h3>
                  </v-col>
                  <v-col
                    cols="1"
                    class="text-center pl-0"
                  >
                  <v-btn x-small fab v-on:click="make_move(item)"><v-icon>mdi-magnify</v-icon></v-btn>
                  </v-col>
                  <v-col
                    cols="1"
                    class="text-center pl-0"
                  >
                  <v-btn x-small fab v-on:click="selectMove(item)"><v-icon>mdi-check-circle-outline</v-icon></v-btn>
                  </v-col>
                  <v-col
                    cols="1"
                    class="text-center pl-0"
                  >
                    <v-btn x-small fab v-on:click="deleteMove(item)"><v-icon>mdi-delete</v-icon></v-btn>
                  </v-col>
                  <v-col
                    cols="1"
                    class="text-center pl-0"
                  >
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-else justify="center" align="center">
          hidden
        </v-row>
      </template>
    </v-data-iterator>
  </v-container>
  </v-card>
</template>

<script lang="ts">
interface IMove {
  friendly_notation: string,
  move: string,
  from: string,
  to: string
}

export default({
  components: {
  },
  name: 'MovePicker',
  props: {
    "moves": {
      type: Array<IMove>,
      default: () => [],
    },
    "preferred_move": {
      type: Object,
      default: () => null,
    },
  },
  methods: {
    unselectMove() {
      this.$emit('selected', null)
    },
    selectMove(move: string) {
      this.$emit('selected', (this.preferred_move && this.preferred_move.friendly_notation == move.friendly_notation) ? null : move)
    },
    deleteMove(move: string) {
      this.$emit('deleted', move)
    },
    make_move(move: string) {
      this.$emit('make_move', move)
    },
    flip_show() {
      this.show = !this.show
    },
  },
  data () {
    return {
      show: true
    }
  },
  watch: {
    moves: function (newMoves) {
      this.moves = newMoves
    },
  },
})
</script>
<style>
</style>