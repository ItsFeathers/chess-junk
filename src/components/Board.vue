<template>
  <TheChessboard :board-config="boardConfig" v-on:move="handleMove" v-on:board-created="handleBoardCreated" />
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue'
import { BoardApi, TheChessboard, type BoardConfig } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
import { Chess } from 'chess.js';

const props = defineProps(['currentPosition', 'shapes', 'orientation']);
const emit = defineEmits(['move']);
const boardAPI = ref<BoardApi>(undefined)
const game = new Chess()

onMounted(() => {
  const boardConfig: BoardConfig = {
    coordinates: true,
    autoCastle: true,
    orientation: 'black',
    movable: {
      free: true
    }
  }
})

function handleBoardCreated(boardApi: BoardApi) {
  boardAPI.value = boardApi;
}

watch (() => props.shapes, (newValue, oldValue) => {drawShapes()})
function drawShapes() {
  console.log(props.shapes)
  boardAPI.value?.setShapes(props.shapes)
}

watch (() => props.currentPosition, (newValue, oldValue) => {setPosition(newValue)})
function setPosition(position) {
  boardAPI.value?.setPosition(position)
  drawShapes()
}


const move = ref({})

function handleMove(moveEvent: any) {
  console.log(moveEvent);
  move.value = moveEvent;
  emit('move', moveEvent);
}

const boardConfig: BoardConfig = {
  coordinates: true,
  autoCastle: true,
  orientation: 'black',
};
</script>

<script lang="ts">
import { SQUARES } from "chess.js";
import { emit } from 'process';

// export default {
//   name: "chess-board",
//   data: function () {
//     return {
//       game: null,
//     };
//   },
//   watch: {
//     fen: function (newFen) {
//       this.loadPosition();
//     },
//     orientation: function (orientation) {
//       this.orientation = orientation;
//       this.board.set({ orientation: orientation });
//       this.loadPosition();
//     },
//     shapes: function (shapes) {
//       this.shapes = shapes;
//       this.paintBoard();
//     },
//   },
//   methods: {
//     getPossibleMoves() {
//       const dests = {};
//       this.game._board.forEach((s) => {
//         const ms = this.game.moves({ square: s, verbose: true });
//         if (ms.length) dests[s] = ms.map((m) => m.to);
//       });
//       return dests;
//     },
//     getResult() {
//       if (this.game.in_draw() || this.game.in_threefold_repetition()) {
//         return "draw";
//       } else if (this.game.in_checkmate()) {
//         return this.game.turn() == "b" ? "w" : "b";
//       }
//       return null;
//     },
//     reset() {
//       this.game.reset();
//       this.afterMove();
//     },
//     opponentMoves() {
//       let originalPGN = this.game.pgn();
//       let tokens = this.game.fen().split(" ");
//       tokens[1] = tokens[1] === "w" ? "b" : "w";
//       tokens = tokens.join(" ");
//       let valid = this.game.load(tokens);
//       if (valid) {
//         let moves = this.game.moves({ verbose: true });
//         this.game.load_pgn(originalPGN);
//         return moves;
//       } else {
//         return [];
//       }
//     },
//     toColor() {
//       return this.game.turn() === "w" ? "white" : "black";
//     },
//     paintBoard() {
//       var shapes = [];
//       if (this.showThreats) {
//         let moves = this.game.moves({ verbose: true });
//         let threats = [];
//         moves.forEach(function (move) {
//           threats.push({ orig: move.to, brush: "yellow" });

//           if (move["captured"]) {
//             threats.push({ orig: move.from, dest: move.to, brush: "red" });
//           }
//           if (move["san"].includes("+")) {
//             threats.push({ orig: move.from, dest: move.to, brush: "blue" });
//           }
//         });
//         shapes = shapes.concat(threats);
//       }
//       shapes = shapes.concat(this.shapes);
//       this.board.setShapes(shapes);
//     },
//     calculatePromotions() {
//       let moves = this.game.moves({ verbose: true });
//       this.promotions = [];
//       for (let move of moves) {
//         if (move.promotion) {
//           this.promotions.push(move);
//         }
//       }
//     },
//     possibleMoves() {
//       const dests = new Map();
//       SQUARES.forEach((s) => {
//         const ms = this.game.moves({ square: s, verbose: true });

//         if (ms.length) {
//           dests.set(
//             ms[0].from,
//             ms.map((m) => m.to)
//           );
//         }
//       });

//       return dests;
//     },
//     playOtherSide(cg, chess) {
//       return (orig, dest) => {
//         chess.move({ from: orig, to: dest });
//         this.board.set({
//           turnColor: this.toColor(),
//           movable: {
//             color: this.toColor(),
//             dests: this.possibleMoves(),
//           },
//         });
//       };
//     },
//     afterMove(last_move) {
//       var shapes = [];
//       this.board.set({
//         fen: this.game.fen(),
//         turnColor: this.toColor(),
//         movable: {
//           color: this.toColor(),
//           dests: this.possibleMoves(),
//         },
//       });

//       shapes = shapes.concat(this.shapes);
//       this.board.setShapes(shapes);
//     },
//     loadPosition() {
//       // set a default value for the configuration object itself to allow call to loadPosition()
//       this.game.load(this.fen);
//       this.afterMove();
//     },
//     playMove(move) {
//       this.game.move(move);

//       this.board.set({
//         fen: this.game.fen(),
//         turnColor: this.toColor(),
//         movable: {
//           color: this.toColor(),
//           dests: this.possibleMoves(),
//         },
//       });
//       this.afterMove();
//     },
//   },
//   mounted() {
//     this.board = Chessground(this.$refs.boardElement, defaultBoardConfig);
//     this.board.set({
//       fen: this.game.fen(),
//       turnColor: this.toColor(this.game),
//       movable: {
//         color: this.toColor(this.game),
//         dests: this.possibleMoves(this.game),
//         events: { after: this.movePlayed() },
//       },
//     });
//     this.loadPosition();
//     this.$forceUpdate();
//   },
  // created () {
  //   this.game = new Chess();
  //   this.game.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

  //   this.promotions = []
  //   this.promoteTo = 'r'
  // },
</script>
