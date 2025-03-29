<template>
  <v-row class="ma-2">
    <v-col v-for="option in options" :key="option.friendly_notation" cols="2">
      <v-card
        :class="repertoire.isMainMove(currentPosition, option.friendly_notation) ? 'selected' : repertoire.isRepertoireMove(currentPosition, option.friendly_notation) ? 'alternative' : 'option'"
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
            <v-btn
              density="compact"
              icon="mdi-call-split"
              v-on:click="addAlternative(option.friendly_notation)"
            />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { watch, computed } from "vue";
import { Repertoire } from "./dom/repertoire";

const props = defineProps({
  repertoire: {
    type: Repertoire,
    required: true,
  },
  currentPosition: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["makeMove", "selectMove", "deleteMove", "shapes", "addAlternative", "removeAlternative"]);

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
  if (props.repertoire.containsPosition(friendly_current_position.value)) {
    return props.repertoire.getOpponentMoves(friendly_current_position.value);
  }
  return null;
});

const selection = computed(() => {
  if (props.repertoire.containsPosition(friendly_current_position.value)) {
    return props.repertoire.getPlayerMoves(friendly_current_position.value);
  }
  return null;
});

function makeMove(san: string) {
  emit("makeMove", san);
}

function selectMove(san: string) {
  if (!props.repertoire.isMainMove(friendly_current_position.value, san)) {
    emit("selectMove", san);
  } else {
    emit("selectMove", null);
  }
}

function deleteMove(san: string) {
  emit("deleteMove", san);
}

function addAlternative(san: string) {
  if (!props.repertoire.isRepertoireMove(friendly_current_position.value, san)) {
    emit("addAlternative", san);
  } else {
    emit("removeAlternative", san);
  }
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
    if (props.repertoire.isMainMove(props.currentPosition, option.friendly_notation)) {
      optionShape.brush = "green";
    } else if (props.repertoire.isRepertoireMove(props.currentPosition, option.friendly_notation)) {
      optionShape.brush = "yellow";
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
.alternative {
  background-color: #FFff66;
}
.option {
  background-color: #6666ff;
}
</style>
