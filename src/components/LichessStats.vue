<template>
  <v-card>
    <v-progress-circular
      :width="3"
      color="red"
      indeterminate
      v-if="loading"
    ></v-progress-circular>
    <v-container fluid v-if="!loading">
      <v-data-table
        :headers="headers"
        :items="tableData"
        :items-per-page="5"
        class="elevation-1"
      >
      </v-data-table>
    </v-container>
  </v-card>
</template>

<script setup lang="ts">
import axios from "axios";
import { defineProps, watch, ref } from "vue";
import { Chess } from "chess.js";
import { Repertoire } from "./dom/repertoire";
import { OptionSet, ProbabilisticMove } from "./dom/moveSelector";

const props = defineProps({
  repertoire: {
    type: Repertoire,
    required: true,
  },
  currentPosition: {
    type: String,
    required: true,
  },
  trainingFor: {
    default: "white",
  },
  variationRandomness: {
    default: 0.2,
  },
  movesThreshold: {
    default: 100,
  },
  percentageThreshold: {
    default: 5,
  },
});

const LICHESS_FACTOR = 0.01
const loading = ref(false);
const positionData = ref({});
const tableData = ref([]);
const currentPositionTotal = ref(0);
const loadedFen = ref(null);
const headers = ref([
  { title: "San", key: "san" },
  { title: "Play %", key: "playPercentage" },
  { title: "Win %", key: "winPercentage" },
  { title: "Equity", key: "equity" },
  { title: "In Repertoire", key: "inRepertoire" },
  { title: "New Transposition", key: "newTransposition" },
]);

const emit = defineEmits(["options"]);

async function emitOptions() {
  await getData();

  if (currentPositionTotal.value < props.movesThreshold) {
    emit("options", new OptionSet(props.currentPosition, Math.log(currentPositionTotal.value), []))  
    return []
  }

  let moves: ProbabilisticMove[] = []
  let totalEligiblePercent = 0
  for (let rowIdx = 0; rowIdx < tableData.value.length; ++rowIdx) {
    let probability
    probability = tableData.value[rowIdx].timesPlayed / currentPositionTotal.value
    if (probability * 100 > props.percentageThreshold) {
      totalEligiblePercent += probability
    }
    moves.push(new ProbabilisticMove(tableData.value[rowIdx].san, probability))
  }

  emit("options", new OptionSet(props.currentPosition, Math.log(currentPositionTotal.value) * LICHESS_FACTOR, moves))  
}

async function getData() {
  if (loadedFen?.value == props.currentPosition) {
    return;
  }

  loading.value = true;

  let res = await axios.get(
    `https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid,classical&ratings=2200,2500&fen=${props.currentPosition}`
  );
  positionData.value = res.data;

  let whiteWins = positionData.value.white;
  let blackWins = positionData.value.black;
  let draws = positionData.value.draws;
  tableData.value = [];
  currentPositionTotal.value = whiteWins + blackWins + draws;

  for (let moveIdx = 0; moveIdx < res.data.moves.length; ++moveIdx) {
    let move;
    move = res.data.moves[moveIdx];
    let timesPlayed = move.white + move.black + move.draws;
    let playPercentage = ((timesPlayed / currentPositionTotal.value) * 100).toPrecision(
      3
    );

    let whiteWinPercentage;
    whiteWinPercentage = parseFloat(((move.white / timesPlayed) * 100).toPrecision(2));
    let blackWinPercentage;
    blackWinPercentage = parseFloat(((move.black / timesPlayed) * 100).toPrecision(2));
    let drawPercentage;
    drawPercentage = parseFloat(((move.draws / timesPlayed) * 100).toPrecision(2));
    let equity;
    equity = parseFloat(((move.white + 0.5 * move.draws) / timesPlayed).toPrecision(2));

    let positionData;
    positionData = props.repertoire.getPosition(simplifyFen(props.currentPosition));

    let inRepertoire;
    inRepertoire = false;
    if (positionData && "options" in positionData) {
      for (let optionIdx = 0; optionIdx < positionData.options.length; ++optionIdx) {
        let option = positionData.options[optionIdx];
        if (option.friendly_notation == move.san) {
          inRepertoire = true;
        }
      }
    }

    let newTransposition;
    newTransposition = false;

    if (!inRepertoire) {
      let chess;
      chess = new Chess(props.currentPosition);
      chess.move(move.san);
      let fenAfter;
      fenAfter = simplifyFen(chess.fen());
      if (fenAfter in props.repertoire) {
        newTransposition = true;
      }
    }

    let moveData;
    moveData = {
      san: move.san,
      playPercentage: playPercentage,
      timesPlayed: timesPlayed,
      winPercentage:
        "(" + whiteWinPercentage + "/" + drawPercentage + "/" + blackWinPercentage + ")",
      equity: equity,
      inRepertoire: inRepertoire,
      newTransposition: newTransposition,
    };
    tableData.value.push(moveData);
  }

  loadedFen.value = props.currentPosition;

  emitOptions()

  loading.value = false;
}

function simplifyFen(fen: string) {
  var elements = fen.split(" ");
  var sanitized = elements.slice(0, 3).join(" ");
  return sanitized;
}

watch(
  () => props.currentPosition,
  (newValue, oldValue) => {
    getData();
  }
);
</script>
