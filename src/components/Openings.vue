<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="0" md="3"></v-col>
      <v-col cols="12" md="6" align="center">
        <v-btn icon="mdi-step-backward-2" @click="backToBeginning" />
        <v-btn icon="mdi-step-backward" @click="back" />
        <RepertoireUploader v-on:repertoire="updateRepertoire" />
        <RepertoireExporter :repertoire="repertoire" />
        <v-btn icon="mdi-step-forward" @click="forward" />
        <v-btn icon="mdi-step-forward-2" @click="forwardToEnd" />
      </v-col>
      <v-col sm="0" cols="3"></v-col>
    </v-row>
    <v-row no-gutters>
      <v-col sm="0" cols="1"></v-col>
      <v-col cols="12" md="2" align="center" justify="center">
        <Engine
          v-show="mode != 'test'"
          :currentPosition="currentPosition"
          v-on:make-move="makeMove"
          v-on:options="engineOptions"
        />
      </v-col>
      <v-col cols="12" md="6">
        <Board
          ref="board"
          :currentPosition="currentPosition"
          v-on:move="handleMove"
          :shapes="shapes"
          :player="color"
          :mode="mode"
          :lock="lock"
        />
      </v-col>
      <v-col cols="6" md="2">
        <v-col v-if="mode != 'test'" cols="12" align="center">
          <v-btn @click="startTest()"
            ><v-icon color="black"> mdi-human-male-board</v-icon> Test Me</v-btn
          >
        </v-col>
        <v-col v-else cols="12" align="center">
          <v-btn @click="endTesting()"
            ><v-icon color="black">mdi-file-document-check-outline</v-icon> Finish
            Test</v-btn
          >
        </v-col>
        <v-col cols="12" align="center" v-if="mode != 'test'">
          <v-btn @click="switchColors()"
            ><v-icon color="black">mdi-chess-queen</v-icon> Switch Colors</v-btn
          >
        </v-col>
        <v-col cols="6" md="12">
          <HistoryPane
            :history="history"
            :currentIndex="currentIndex"
            v-on:historyClick="historyClicked"
          />
        </v-col>
      </v-col>
      <v-col cols="6" md="12">
        <v-tabs v-model="tab" centered bg-color="primary">
          <v-tab value="repertoire"> Edit Repertoire </v-tab>
          <v-tab value="results"> Test Results </v-tab>
          <v-tab value="lichess"> Lichess Games </v-tab>
          <v-spacer></v-spacer>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item value="repertoire">
            <v-card>
              <RepertoireView
                v-if="mode != 'test'"
                ref="repertoireView"
                :repertoire="repertoire"
                v-on:deleteMove="deleteMove"
                :currentPosition="currentPosition"
                v-on:shapes="updateShapes"
                v-on:make-move="makeMove"
                v-on:selectMove="selectMove"
                v-on:addAlternative="addAlternative"
                v-on:removeAlternative="removeAlternative"
              />
            </v-card>
          </v-window-item>
          <v-window-item value="results">
            <v-card>
              <TestResultsPane
                :history="history"
                :currentIndex="currentIndex"
                :results="results"
                v-on:loadGame="loadGame"
              />
            </v-card>
          </v-window-item>
          <v-window-item :eager="true" value="lichess">
            <v-card>
              <LichessStats
                :repertoire="repertoire"
                :currentPosition="currentPosition"
                v-on:options="lichessOptions"
              />
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <pre>{{ moveSelector }}</pre>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import HistoryPane from "./HistoryPane.vue";
import Engine from "./Engine.vue";
import Board from "./Board.vue";
import RepertoireView from "./RepertoireView.vue";

import RepertoireUploader from "./RepertoireUploader.vue";
import "vue3-chessboard/style.css";
import TestResultsPane from "./TestResultsPane.vue";
import LichessStats from "./LichessStats.vue";
import { Repertoire, loadRepertoire } from "./dom/repertoire";
import { plainToInstance } from "class-transformer";
import { MoveEvent } from "./dom/moveEvent";
import { IResult, ResultsSummary } from "./dom/testResult";
import { AnnotatedHistory, Annotation } from "./dom/history";
import RepertoireExporter from "./RepertoireExporter.vue";
import { MoveSelector, OptionSet, ProbabilisticMove } from "./dom/moveSelector";

type Shape = {};

const REPERTOIRE_FACTOR = 0.05
const STARTING_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const repertoire = ref(
  loadRepertoire({
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq": {
      options: [],
      selection: null,
    },
  })
);
const history = ref(new AnnotatedHistory());
const currentPosition = ref("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
const shapes = ref([] as Shape[]);
const results = ref([] as IResult[]);
const testResultSummary = ref(new ResultsSummary([]));
const streak = ref(0 as number);
const lock = ref(false);

const currentIndex = ref(0);
const board = ref();
const repertoireView = ref();
const mode = ref("teach");
const color = ref("white");
const annotations = ref([] as MoveEvent[]);

const tab = ref("");
const moveSelector = ref(new MoveSelector(["repertoire", "lichess", "history"]));
moveSelector.value.setPrioritySource("repertoire");

const friendly_current_position = computed(() => {
  if (currentPosition.value && repertoire.value) {
    return toFriendlyNotation(currentPosition.value);
  }
  return "";
});

function switchColors() {
  color.value = color.value == "white" ? "black" : "white";
}

function handleMove(moveEvent: MoveEvent) {
  if (mode.value == "teach") {
    repertoire.value.addMoveToRepertoire(
      friendly_current_position.value,
      moveEvent,
      color.value
    );
    acceptMove(moveEvent);
  } else if (mode.value == "test") {
    if (!isFromPlayer(moveEvent)) {
      acceptMove(moveEvent);
      if (isEndOfLine(moveEvent)) {
        lock.value = true;
        setTimeout(() => {
          endTest(moveEvent, "End of Line");
          lock.value = false;
        }, 2000);
      }
    } else if (
      repertoire.value.isRepertoireMove(friendly_current_position.value, moveEvent.san)
    ) {
      streak.value += 1;
      acceptMove(moveEvent);
      if (isEndOfLine(moveEvent)) {
        lock.value = true;
        setTimeout(() => {
          endTest(moveEvent, "End of Line");
          lock.value = false;
        }, 2000);
      } else {
        getComputerReply();
      }
    } else {
      rejectMove(moveEvent);
      setTimeout(() => {
        endTest(moveEvent, "Player Deviated");
      }, 2000);
    }
  }
}

function startTest() {
  mode.value = "test";
}

function endTesting() {
  mode.value = "teach";
}

function rejectMove(moveEvent: MoveEvent) {
  addMoveToHistory(moveEvent);
  setTimeout(() => {
    board.value.refreshPosition(moveEvent.before);
  }, 0);
  shapes.value = [{ brush: "red", orig: moveEvent.from, dest: moveEvent.to }];

  const validMoves = repertoire.value.getPlayerMoves(moveEvent.before);
  for (let validMoveIndex in validMoves) {
    shapes.value.push({
      brush: "green",
      orig: validMoves[validMoveIndex].from,
      dest: validMoves[validMoveIndex].to,
    });
  }
}

function isEndOfLine(moveEvent: MoveEvent) {
  const positionAfter = toFriendlyNotation(moveEvent.after);
  if (!repertoire.value.containsPosition(positionAfter)) {
    return true;
  }

  // remember the player on move now is the opposite color so this is checking for engine having a move
  if (color.value.startsWith(moveEvent.color)) {
    return !repertoire.value.hasOpponentMove(positionAfter);
  } else {
    return !repertoire.value.hasPlayerMove(positionAfter);
  }
}

function loadGame(result: IResult) {
  history.value = result.history;
  if (result.history.length() == 1) {
    currentPosition.value = STARTING_POSITION;
  } else {
    currentPosition.value = history.value.getPositionByIdx(
      history.value.getLatestPositionIdx() - 1
    )?.fen;
  }
  currentIndex.value = history.value.getLatestPositionIdx() - 1;
  annotations.value = [result.finalMove];
}

function acceptMove(moveEvent: MoveEvent) {
  currentPosition.value = moveEvent.after;
  addMoveToHistory(moveEvent);
}

function isFromPlayer(moveEvent: MoveEvent) {
  return color.value.startsWith(moveEvent.color);
}

function moveSourcesFull(): Boolean {
  return moveSelector.value.isReady(currentPosition.value);
}

function waitForMoveSelection(callback: () => void) {
  if (playerToMove()) {
    return;
  }
  if (!moveSourcesFull()) {
    window.setTimeout(waitForMoveSelection, 100, callback);
  } else {
    callback();
  }
}

function getComputerReply() {
  waitForMoveSelection(playComputerMove);
}

function playComputerMove() {
  let nextMove = moveSelector.value.getMove(currentPosition.value);

  board.value.refreshPosition(currentPosition.value);
  board.value.playMove(nextMove);
}

function endTest(finalMove: MoveEvent, result: string) {
  const resultObject = plainToInstance(IResult, {
    history: history.value,
    streak: result == "End of Line" ? streak.value : -streak.value,
    finalMove: finalMove,
    result: result,
    playerColor: color.value,
  });
  results.value.push(resultObject);
  testResultSummary.value.addResult(resultObject, color.value);

  streak.value = 0;
  clearHistory();
  updateShapes([]);
  if (!playerToMove()) {
    getComputerReply();
  }
}

function clearHistory() {
  history.value = new AnnotatedHistory();
  currentIndex.value = history.value.getLatestPositionIdx();
  backToBeginning();
}

function addMoveToHistory(moveEvent: MoveEvent) {
  let annotation = new Annotation(
    repertoire.value.evaluate(moveEvent.before, moveEvent.san, color.value),
    moveEvent.from,
    moveEvent.to
  );
  history.value.pushAnnotatedMove(moveEvent, [annotation], currentIndex.value);
  currentIndex.value += 1;
}

watch(
  () => mode.value,
  (newValue, oldValue) => {
    updateMode(newValue, oldValue);
  }
);
function updateMode(_newValue: string, _oldValue: string) {
  clearHistory();
  updateShapes(shapes.value);
  if (!playerToMove() && mode.value == "test") {
    getComputerReply();
  }
}

function playerToMove() {
  return color.value.startsWith(history.value.playerToMove());
}

function updateRepertoire(newRepertoire: Repertoire) {
  repertoire.value = newRepertoire;
  repertoireView.value.emitShapes();
}

function updateShapes(newShapes: Shape[]) {
  if (mode.value == "teach") {
    for (let idx = 0; idx < annotations.value.length; ++idx) {
      if (
        toFriendlyNotation(annotations.value[idx].before) ==
        friendly_current_position.value
      ) {
        newShapes.push({
          brush: "red",
          orig: annotations.value[idx].from,
          dest: annotations.value[idx].to,
        });
      }
    }
    shapes.value = newShapes;
  } else {
    shapes.value = [];
  }
}

function toFriendlyNotation(fullFen: string) {
  var elements = fullFen.split(" ");
  var sanitized = elements.slice(0, 3).join(" ");
  return sanitized;
}

function historyClicked(index: number) {
  currentIndex.value = index;

  let newPos = history.value.getPositionByIdx(currentIndex.value);
  if (newPos) {
    currentPosition.value = newPos.fen;
  }
}

function backToBeginning() {
  currentIndex.value = 0;
  currentPosition.value = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
}

function back() {
  if (currentIndex.value <= 0) {
    backToBeginning();
    return;
  }

  currentIndex.value -= 1;
  let newPos = history.value.getPositionByIdx(currentIndex.value);
  if (newPos) {
    currentPosition.value = newPos.fen;
  }
}

function forward() {
  if (currentIndex.value >= history.value.length() - 1) {
    forwardToEnd();
    return;
  }
  currentIndex.value += 1;

  let newPos = history.value.getPositionByIdx(currentIndex.value);
  if (newPos) {
    currentPosition.value = newPos.fen;
  }
}

function forwardToEnd() {
  currentIndex.value = history.value.getLatestPositionIdx();
  currentPosition.value = history.value.getLatestPosition().fen;
}

function deleteMove(san: string) {
  repertoire.value.deleteMove(friendly_current_position.value, san);
  repertoireView.value.emitShapes();
}

function makeMove(san: string) {
  board.value?.playMove(san);
  repertoireView.value.emitShapes();
}

function engineOptions(options: OptionSet) {
  moveSelector.value.pushOptions("engine", options);
}

function lichessOptions(options: OptionSet) {
  moveSelector.value.pushOptions("lichess", options);
}

function selectMove(san: string) {
  repertoire.value.setMainMove(friendly_current_position.value, san);
  repertoireView.value.emitShapes();
}

function addAlternative(san: string) {
  repertoire.value.addAlternative(friendly_current_position.value, san);
  repertoireView.value.emitShapes();
}

function removeAlternative(san: string) {
  repertoire.value.removeAlternative(friendly_current_position.value, san);
  repertoireView.value.emitShapes();
}

watch(
  () => currentPosition.value,
  (newValue, oldValue) => {
    let moves = repertoire.value.getOpponentMoves(newValue);
    moveSelector.value.pushOptions(
      "repertoire",
      new OptionSet(
        currentPosition.value,
        20 * REPERTOIRE_FACTOR,
        moves.map(function (x) {
          return new ProbabilisticMove(x.friendly_notation, 20);
        })
      )
    );
    moveSelector.value.pushOptions(
      "history",
      testResultSummary.value.getTestOptionSet(newValue, color.value, repertoire.value)
    );
  }
);
</script>

<style lang="css" scoped>
.main-wrap {
  width: 100%;
  margin-inline: auto;
  max-width: 70vh;
}
</style>
