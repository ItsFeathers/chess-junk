<template>
  <span>
    <v-textarea label="Notes" v-model="textNotes"></v-textarea>
  </span>
</template>

<script lang="ts">

interface INotes {
  notes: string
}

export default {
  name: 'position-notes',
  props: {
    "repertoire": {
    },
    "currentPosition": {
      type: "string"
    },
  },
  created: function () {
    this.refreshNotes()
  },
  methods: {
    refreshNotes() {
      if (this.currentPosition in this.repertoire && "notes" in this.repertoire[this.currentPosition]) {
        this.positionNotes = this.repertoire[this.currentPosition].notes
        this.textNotes = this.positionNotes.notes
      }
      else {
        this.positionNotes = { notes: "" }
        this.textNotes = this.positionNotes.notes
      }
    }
  },
  data: function () {
    return {
      textNotes: "" as string,
      positionNotes: {} as INotes
    }
  },
  watch: {
    textNotes(notes: string) {
      this.positionNotes.notes = notes;
      console.log(notes)
      this.$emit('notesUpdate', this.positionNotes)
    },
    repertoire() {
      this.refreshNotes()
    },
    currentPosition() {
      this.refreshNotes()
    }
  },
}
</script>
<style>
</style>