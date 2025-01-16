<template>
  <v-row class="ma-2">
    <v-col v-for="option in options" :key="option.friendly_notation" cols="12">
      <v-card
        :class="
          selection?.friendly_notation == option.friendly_notation ? 'selected' : 'option'
        "
      >
        <v-card-title>{{ option.friendly_notation }}</v-card-title>
        <v-card-actions>
          <v-btn>
            <v-btn
              density="compact"
              icon="mdi-magnify"
              v-on:click="makeMove(option.friendly_notation)"
            />
            <v-btn
              density="compact"
              icon="mdi-check-circle-outline"
              v-on:click="selectMove(option.friendly_notation)"
            />
            <v-btn
              density="compact"
              icon="mdi-delete"
              v-on:click="deleteMove(option.friendly_notation)"
            />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { watch, defineProps, defineEmits, computed } from "vue";

const props = defineProps(["repertoire", "currentPosition"]);
const emit = defineEmits(["makeMove", "selectMove", "deleteMove", "shapes"]);

watch(
  () => props.currentPosition,
  (newValue, oldValue) => {
    emitShapes();
  }
);

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

function makeMove(san: string) {
  emit("makeMove", san);
}

function selectMove(san: string) {
  emit("selectMove", san == selection.value?.san ? null : san);
}

function deleteMove(san: string) {
  emit("deleteMove", san);
}

type shape = {
  orig: string;
  dest: string;
  brush: string;
  type: string;
};

function emitShapes() {
  var shapes = [] as shape[];
  if (!options.value) {
    return;
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

defineExpose({ emitShapes });
</script>

<style lang="css" scoped>
.selected {
  background-color: #66ff66;
}
.option {
  background-color: #6666ff;
}
</style>
