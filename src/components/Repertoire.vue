<template>
  <v-row class="ma-2">
    <v-col v-if="selection" class="selected ma-1" cols="12">
      <v-row justify="space-between">
        {{ selection.friendly_notation }}
        <v-btn density="compact" icon="mdi-magnify" v-on:click="make_move(item)" />
        <v-btn
          density="compact"
          icon="mdi-check-circle-outline"
          v-on:click="select_move(item)"
        />
        <v-btn density="compact" icon="mdi-delete" v-on:click="deleteMove(item)" />
      </v-row>
    </v-col>
    <v-col
      class="option ma-1"
      v-for="option in options"
      :key="option.friendly_notation"
      cols="12"
    >
      <v-row justify="space-between">
        {{ option.friendly_notation }}
        <v-btn density="compact" icon="mdi-magnify" v-on:click="make_move(item)" />
        <v-btn
          density="compact"
          icon="mdi-check-circle-outline"
          v-on:click="select_move(item)"
        />
        <v-btn density="compact" icon="mdi-delete" v-on:click="deleteMove(item)" />
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { watch, defineProps, defineEmits, computed } from "vue";

const props = defineProps(["repertoire", "currentPosition"]);
const emit = defineEmits(["move", "shapes"]);

const friendly_current_position = computed(() => {
  if (props.currentPosition && props.repertoire) {
    var elements = props.currentPosition.split(" ");
    var sanitized = elements.slice(0, 3).join(" ");
    return sanitized;
  }
  return "null";
});

const options = computed(() => {
  if (
    props.repertoire &&
    friendly_current_position &&
    friendly_current_position.value in props.repertoire
  ) {
    return props.repertoire[friendly_current_position.value].options;
  }
  return null;
});

const selection = computed(() => {
  if (
    props.repertoire &&
    friendly_current_position &&
    friendly_current_position.value in props.repertoire &&
    props.repertoire[friendly_current_position.value]
  ) {
    return props.repertoire[friendly_current_position.value].selection;
  }
  return null;
});

watch(() => options, (newValue, oldValue) => {emitShapes()})
watch(() => props.currentPosition, (newValue, oldValue) => {emitShapes()})


type shape = {
  orig: string;
  dest: string;
  brush: string;
  type: string;
};

function emitShapes() {
  var shapes = [] as shape[];
  if(!options.value) {
    return
  }
  for (const option of options.value) {
    var optionShape = {} as shape;
    if (option.friendly_notation == selection.value?.friendly_notation) {
      optionShape.brush = "green";
    } else {
      optionShape.brush = "blue";
    }
    optionShape.orig = option.from;
    optionShape.dest = option.to;
    shapes.push(optionShape);
  }
  emit("shapes", shapes);
}
</script>

<style lang="css" scoped>
.selected {
  background-color: #00ff00;
}
.option {
  background-color: #ffff00;
}
</style>
