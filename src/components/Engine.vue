<template>
  <v-row no-gutters class="my-3">
    <v-col
      :key="index"
      v-for="engineOutput, index in engineOutputs"
      cols="12"
      v-bind:style="{ cursor: 'pointer' }"
      :class="' my-1 '"
    >
      <span v-if="engineOutput.show">
        <v-card @click="makeMove(engineOutput?.san)" :color="engineOutput.eligible ? 'primary' : ''">
          <v-card-subtitle
            >{{ engineOutput.depth }} - {{ engineOutput.san }} -
            {{ engineOutput.score }} - {{ engineOutput.scoreType }} - {{ engineOutput.eligible }}</v-card-subtitle
          >
        </v-card>
      </span>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { Chess } from "chess.js";
import { watch} from "vue";
const emit = defineEmits(["makeMove", "shapes", "options"]);

const props = defineProps({
  currentPosition: {
    type: String,
    required: true,
  },
  contempt: {
    type: Number,
    default: 20
  },
  depthThreshold: {
    type: Number,
    default: 20
  },
});

const latestMessage = ref("");
const lines = ref(3);

type Line = {
  depth: number | null;
  seldepth: null;
  multipv: 0;
  scoreType: null;
  score: null;
  nodes: null;
  nps: null;
  hashfull: null;
  time: null;
  pv: null;
  topMove: null;
  san: string | null;
  eligible: boolean;
  best: boolean;
  show: boolean;
};

const engineOutputs = ref([] as Array<Line>);

for (let i = 0; i < lines.value; i++) {
  engineOutputs.value.push({} as Line);
}

var stockfish = new Worker(new URL("/stockfish-nnue-16.js", import.meta.url), {
  type: "module",
});
stockfish.postMessage("uci");

stockfish.addEventListener("message", function (e) {
  latestMessage.value = e.data;

  const parts = e.data.split(" ");

  if (parts[0] == "info") {
    var data = {} as Line;
    var idx = 1;
    while (idx < parts.length) {
      if (parts[idx] == "depth") {
        data.depth = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "seldepth") {
        data.seldepth = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "multipv") {
        data.multipv = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "score") {
        data.scoreType = parts[idx + 1];
        data.score = parts[idx + 2];
        idx += 3;
      } else if (parts[idx] == "nodes") {
        data.nodes = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "nps") {
        data.nps = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "hashfull") {
        data.hashfull = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "time") {
        data.time = parts[idx + 1];
        idx += 2;
      } else if (parts[idx] == "pv") {
        data.topMove = parts[idx + 1];
        idx += 2;
        break;
      } else {
        break;
      }
    }
    if (data.multipv) {
      try {
        data.san = toSan(props.currentPosition, data.topMove);
        engineOutputs.value[data.multipv - 1] = data;
        data.eligible = isEligible(engineOutputs.value, data, 10)
        data.show = true
        engineOutputs.value[data.multipv - 1] = data;

        if (doneCalculating()) {
          emitOptions();
        }
      } catch {
        engineOutputs.value[data.multipv - 1].show = false
      } 
    }
  }
});

function makeMove(move: string | null) {
  emit("makeMove", move);
}

function emitOptions() {
  let validOutputs = getEligibleOutputs(engineOutputs.value, props.contempt)
  if(validOutputs == null) {
    return
  }
  let moves: ProbabilisticMove[] = []
  for (let i=0; i < validOutputs.length; ++i) {
    var san = validOutputs[i].san
    if (san == null) {
      continue
    }
    moves.push(new ProbabilisticMove(san, 100.0 / (i + 1)))
  }
  emit("options", new OptionSet(props.currentPosition, 100, moves))
}

function doneCalculating() {
  let outputs = engineOutputs.value
  for (let i=0; i< outputs.length; ++i) {
    if (outputs == null || outputs[i] == null || outputs[i].depth == null || outputs[i].depth < props.depthThreshold) {
      return false
    }
  }
  return true
}

function getEligibleOutputs(outputs: Line[], contempt: number): Line[] | null {
  let best = getBestOutput(outputs)
  if (best == null) {
    return null;
  }
  let retval: Line[] = []
  for (let i=0; i < outputs.length; ++i) {
    let comparisonResult = compareOutputs(outputs[i], best, contempt)
    if (comparisonResult != null && comparisonResult >= 0) {
      retval.push(outputs[i])
    } 
  }
  return retval;
}

function isEligible(outputs: Line[], output: Line, contempt: number): boolean {
  let best = getBestOutput(outputs)
  if (best == null) {
    return false;
  }
  let comparison = compareOutputs(output, best, props.contempt);
  if (comparison == null) {
    return false
  }
  return comparison >= 0
}

function getBestOutput(outputs: Line[]): Line | null {
  if (outputs.length == 0) {
    return null;
  }
  let best = outputs[0];
  for (let i=0; i< outputs.length; ++i) {
    let comparisonResult = compareOutputs(outputs[i], best, 0)
    if (comparisonResult && comparisonResult > 0) {
      best = outputs[i]
    }
  }
  return best
}

function compareOutputs(output1: Line, output2: Line, contempt: number): number | null {
  if (output1.score == null || output2.score == null) {
    return null
  }
  
  if (output1.scoreType == "mate" && output2.scoreType == "mate") {
    if (output1.score > 0 && output2.score > 0) {
      return 0
    }
    if (output1.score < 0 && output2.score < 0) {
      return 0
    }
    if (output1.score < 0) {
      return 1
    }
    if (output2.score < 0) {
      return -1
    }
  }

  if (output1.scoreType == "mate") {
    if (output1.score < 0) {
      return 1
    }
  }

  if (output2.scoreType == "mate") {
    if (output2.score < 0) {
      return -1
    }
  }

  // neither line leads to forced mate
  let diff = output1.score - output2.score

  if (Math.abs(diff) < contempt) {
    return 0
  }
  return output1.score - output2.score
}

function toSan(fen: string, move: string | null) {
  if (!move) {
    return null
  }
  let chess = new Chess(fen);
  chess.move(move);
  let history = chess.history();
  return history[history.length - 1];
}

watch(
  () => props.currentPosition,
  (newValue, oldValue) => {
    stockfish.postMessage("stop");
    stockfish.postMessage(`position fen ${newValue}`);
    stockfish.postMessage(`setoption name multipv value ${lines.value}`);
    stockfish.postMessage(`setoption name threads value 2`);
    stockfish.postMessage(`setoption name maxdepth value 20`);

    stockfish.postMessage("go depth 20");

    for (let i=0; i < engineOutputs.value.length; ++i) {
      engineOutputs.value[i].show = false
    }
  }
);
</script>
<script lang="ts">
import { ref } from "vue";
import { OptionSet, ProbabilisticMove } from "./dom/moveSelector";
</script>

<style lang="css" scoped></style>
