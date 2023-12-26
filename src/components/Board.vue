<template>
  <v-container fluid>
    <TheChessboard :board-config="boardConfig" />
  </v-container>
</template>

<script setup lang="ts">
import { TheChessboard, type BoardConfig } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const boardConfig: BoardConfig = {
  coordinates: true,
  autoCastle: true,
  orientation: 'black',
};

</script>

<style lang="css" scoped>
.board-container {
  min-width: 100px;
}

.switch-center {
  display: flex;
  justify-content: center;
}
</style>

<script lang="ts">
import { Chess } from 'chess.js'
import {Chessground} from 'chessground'
import { SQUARES } from 'chess.js';

export default {
  name: 'chess-board',
  data: function () {
    return {
      game: null,
    }
  },
  props: {
    fen: {
      type: String,
      default: '',
    },
    free: {
      type: Boolean,
      default: false,
    },
    showThreats: {
      type: Boolean,
      default: false,
    },
    onPromotion: {
      type: Function,
      default: () => 'r',
    },
    orientation: {
      type: String,
      default: 'white',
    },
    shapes: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    fen: function (newFen) {
      this.loadPosition()
    },
    orientation: function (orientation) {
      this.orientation = orientation
      this.board.set({ orientation: orientation })
      this.loadPosition()
    },
    shapes: function (shapes) {
      this.shapes = shapes
      this.paintBoard()
    },
  },
  methods: {
    getPossibleMoves () {
      const dests = {}
      this.game._board.forEach(s => {
        const ms = this.game.moves({square: s, verbose: true})
        if (ms.length) dests[s] = ms.map(m => m.to)
      })
      return dests
    },
    getResult () {
      if( this.game.in_draw() || this.game.in_threefold_repetition() ) {
        return "draw"
      } else if (this.game.in_checkmate() ) {
        return this.game.turn() == 'b'? "w" : "b"
      }
      return null
    },
    reset () {
      this.game.reset()
      this.afterMove()
    },
    opponentMoves () {
      let originalPGN = this.game.pgn()
      let tokens = this.game.fen().split(' ')
      tokens[1] = tokens[1] === 'w' ? 'b' : 'w'
      tokens = tokens.join(' ')
      let valid = this.game.load(tokens)
      if (valid) {
        let moves = this.game.moves({verbose: true})
        this.game.load_pgn(originalPGN)
        return moves
      } else {
        return []
      }
    },
    toColor () {
      return (this.game.turn() === 'w') ? 'white' : 'black'
    },
    paintBoard () {
      var shapes = []
      if (this.showThreats) {
        let moves = this.game.moves({verbose: true})
        let threats = []
        moves.forEach(function (move) {
          threats.push({orig: move.to, brush: 'yellow'})

          if (move['captured']) {
            threats.push({orig: move.from, dest: move.to, brush: 'red'})
          }
          if (move['san'].includes('+')) {
            threats.push({orig: move.from, dest: move.to, brush: 'blue'})
          }
        })
        shapes = shapes.concat(threats)
      }
      shapes = shapes.concat(this.shapes)
      this.board.setShapes(shapes)
    },
    calculatePromotions () {
      let moves = this.game.moves({verbose: true})
      this.promotions = []
      for (let move of moves) {
        if (move.promotion) {
          this.promotions.push(move)
        }
      }
    },
    isPromotion   (orig, dest) {
      let filteredPromotions = this.promotions.filter(move => move.from === orig && move.to === dest)
      return filteredPromotions.length > 0 // The current movement is a promotion
    },
    movePlayed () {
      return (orig, dest, metadata) => {
        if (this.isPromotion(orig, dest)) {
          this.promoteTo = this.onPromotion()
        }

        let last_move = {from: orig, to: dest, promotion: this.promoteTo, notation: this.game.history()}


        this.game.move(`${orig}${dest}`, { sloppy: true }) // promote to queen for simplicity

        this.calculatePromotions()
        last_move["friendly_notation"] = this.game.history()[this.game.history().length -1]
        last_move["fen_after"] = this.game.fen()
        last_move["turn"] = this.game.turn() == 'b' ? 'white' : 'black'
        this.afterMove(last_move)
        this.$emit("onMove", last_move)
      }
    },
    possibleMoves() {
      const dests = new Map();
      SQUARES.forEach((s) => {
        const ms = this.game.moves({ square: s, verbose: true });

        if (ms.length) {
          dests.set(
            ms[0].from,
            ms.map((m) => m.to)
          );
        }
      });

      return dests;
    },
    playOtherSide(cg, chess) {
      return (orig, dest) => {
        chess.move({from: orig, to: dest});
        this.board.set({
          turnColor: this.toColor(),
          movable: {
            color: this.toColor(),
            dests: this.possibleMoves(),
          },
        });
      };
    },
    afterMove (last_move) {
      var shapes = []
      this.board.set({
        fen: this.game.fen(),
        turnColor: this.toColor(),
        movable: {
          color: this.toColor(),
          dests: this.possibleMoves(),
        }
      });

      shapes = shapes.concat(this.shapes)
      this.board.setShapes(shapes)
    },
    loadPosition () { // set a default value for the configuration object itself to allow call to loadPosition()
      this.game.load(this.fen)
      this.afterMove()
    },
    playMove (move) {
      this.game.move(move)

      this.board.set({
        fen: this.game.fen(),
        turnColor: this.toColor(),
        movable: {
          color: this.toColor(),
          dests: this.possibleMoves(),
        }
      });
      this.afterMove()
    },
  },
  mounted () {
    this.board = Chessground(this.$refs.boardElement, defaultBoardConfig)
    this.board.set({
      fen: this.game.fen(),
      turnColor: this.toColor(this.game),
      movable: {
        color: this.toColor(this.game),
        dests: this.possibleMoves(this.game),
        events: { after: this.movePlayed() }
      },
    });
    this.loadPosition()
    this.$forceUpdate();
  },
  created () {
    this.game = new Chess();
    this.game.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

    this.promotions = []
    this.promoteTo = 'r'
  },
}
</script>
<style>

/*
 * Chessground base css properties.
 *
 * You need to include the css files in themes folder in order to have the
 * board and pieces displayed!
 */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.main-wrap {
  margin-inline: auto;
  max-width: 1200px;
}

.main-board {
  position: relative;
  display: block;
  height: 0;
  padding-bottom: 100%;
  width: 100%;
  cursor: pointer;
}


.cg-wrap {
  width: 320px;
  height: 320px;
  position: relative;
  display: block;
}

cg-helper {
  position: absolute;
  width: 12.5%;
  padding-bottom: 12.5%;
  display: table; /* hack: round to full pixel size in chrome */
  bottom: 0;
}

cg-container {
  position: absolute;
  width: 800%;
  height: 800%;
  display: block;
  bottom: 0;
}

cg-board {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  line-height: 0;
  background-size: cover;
  cursor: pointer;
}
cg-board square {
  position: absolute;
  top: 0;
  left: 0;
  width: 12.5%;
  height: 12.5%;
  pointer-events: none;
}
cg-board square.move-dest {
  background: radial-gradient(rgba(20, 85, 30, 0.5) 22%, #208530 0, rgba(0, 0, 0, 0.3) 0, rgba(0, 0, 0, 0) 0);
  pointer-events: auto;
}
cg-board square.premove-dest {
  background: radial-gradient(rgba(20, 30, 85, 0.5) 22%, #203085 0, rgba(0, 0, 0, 0.3) 0, rgba(0, 0, 0, 0) 0);
}
cg-board square.oc.move-dest {
  background: radial-gradient(transparent 0%, transparent 80%, rgba(20, 85, 0, 0.3) 80%);
}
cg-board square.oc.premove-dest {
  background: radial-gradient(transparent 0%, transparent 80%, rgba(20, 30, 85, 0.2) 80%);
}
cg-board square.move-dest:hover {
  background: rgba(20, 85, 30, 0.3);
}
cg-board square.premove-dest:hover {
  background: rgba(20, 30, 85, 0.2);
}
cg-board square.last-move {
  will-change: transform;
  background-color: rgba(155, 199, 0, 0.41);
}
cg-board square.selected {
  background-color: rgba(20, 85, 30, 0.5);
}
cg-board square.check {
  background: radial-gradient(ellipse at center, rgba(255, 0, 0, 1) 0%, rgba(231, 0, 0, 1) 25%, rgba(169, 0, 0, 0) 89%, rgba(158, 0, 0, 0) 100%);
}
cg-board square.current-premove {
  background-color: rgba(20, 30, 85, 0.5);
}
.cg-wrap piece {
  position: absolute;
  top: 0;
  left: 0;
  width: 12.5%;
  height: 12.5%;
  background-size: cover;
  z-index: 2;
  will-change: transform;
  pointer-events: none;
}
cg-board piece.dragging {
  cursor: move;
  z-index: 10;
}
cg-board piece.anim {
  z-index: 8;
}
cg-board piece.fading {
  z-index: 1;
  opacity: 0.5;
}
.cg-wrap square.move-dest:hover {
  background-color: rgba(20, 85, 30, 0.3);
}
.cg-wrap piece.ghost {
  opacity: 0.3;
}
.cg-wrap .cg-shapes, .cg-wrap .cg-custom-svgs {
  overflow: hidden;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.cg-wrap .cg-shapes {
  opacity: 0.6;
  z-index: 2;
}
.cg-wrap .cg-custom-svgs {
  /* over piece.anim = 8, but under piece.dragging = 10 */
  z-index: 9;
}
.cg-wrap coords {
  position: absolute;
  display: flex;
  pointer-events: none;
  opacity: 0.8;
  font-size: 9px;
}
.cg-wrap coords.ranks {
  right: -15px;
  top: 0;
  flex-flow: column-reverse;
  height: 100%;
  width: 12px;
}
.cg-wrap coords.ranks.black {
  flex-flow: column;
}
.cg-wrap coords.files {
  bottom: -16px;
  left: 0;
  flex-flow: row;
  width: 100%;
  height: 16px;
  text-transform: uppercase;
  text-align: center;
}
.cg-wrap coords.files.black {
  flex-flow: row-reverse;
}
.cg-wrap coords coord {
  flex: 1 1 auto;
}
.cg-wrap coords.ranks coord {
  transform: translateY(39%);
}

cg-board {
  background-color: #f0d9b5;
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4PSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIgogICAgIHZpZXdCb3g9IjAgMCA4IDgiIHNoYXBlLXJlbmRlcmluZz0iY3Jpc3BFZGdlcyI+CjxnIGlkPSJhIj4KICA8ZyBpZD0iYiI+CiAgICA8ZyBpZD0iYyI+CiAgICAgIDxnIGlkPSJkIj4KICAgICAgICA8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBpZD0iZSIgb3BhY2l0eT0iMCIvPgogICAgICAgIDx1c2UgeD0iMSIgeT0iMSIgaHJlZj0iI2UiIHg6aHJlZj0iI2UiLz4KICAgICAgICA8cmVjdCB5PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBpZD0iZiIgb3BhY2l0eT0iMC4yIi8+CiAgICAgICAgPHVzZSB4PSIxIiB5PSItMSIgaHJlZj0iI2YiIHg6aHJlZj0iI2YiLz4KICAgICAgPC9nPgogICAgICA8dXNlIHg9IjIiIGhyZWY9IiNkIiB4OmhyZWY9IiNkIi8+CiAgICA8L2c+CiAgICA8dXNlIHg9IjQiIGhyZWY9IiNjIiB4OmhyZWY9IiNjIi8+CiAgPC9nPgogIDx1c2UgeT0iMiIgaHJlZj0iI2IiIHg6aHJlZj0iI2IiLz4KPC9nPgo8dXNlIHk9IjQiIGhyZWY9IiNhIiB4OmhyZWY9IiNhIi8+Cjwvc3ZnPg==');
}

/** Interactive board square colors */
cg-board square.move-dest {
  background: radial-gradient(rgba(20, 85, 30, 0.5) 22%, #208530 0, rgba(0, 0, 0, 0.3) 0, rgba(0, 0, 0, 0) 0);
}
cg-board square.premove-dest {
  background: radial-gradient(rgba(20, 30, 85, 0.5) 22%, #203085 0, rgba(0, 0, 0, 0.3) 0, rgba(0, 0, 0, 0) 0);
}
cg-board square.oc.move-dest {
  background: radial-gradient(transparent 0%, transparent 80%, rgba(20, 85, 0, 0.3) 80%);
}
cg-board square.oc.premove-dest {
  background: radial-gradient(transparent 0%, transparent 80%, rgba(20, 30, 85, 0.2) 80%);
}
cg-board square.move-dest:hover {
  background: rgba(20, 85, 30, 0.3);
}
cg-board square.premove-dest:hover {
  background: rgba(20, 30, 85, 0.2);
}
cg-board square.last-move {
  background-color: rgba(155, 199, 0, 0.41);
}
cg-board square.selected {
  background-color: rgba(20, 85, 30, 0.5);
}
cg-board square.check {
  background: radial-gradient(
    ellipse at center,
    rgba(255, 0, 0, 1) 0%,
    rgba(231, 0, 0, 1) 25%,
    rgba(169, 0, 0, 0) 89%,
    rgba(158, 0, 0, 0) 100%
  );
}
cg-board square.current-premove {
  background-color: rgba(20, 30, 85, 0.5);
}

/** Alternating colors in rank/file labels */
.cg-wrap.orientation-white coords.ranks coord:nth-child(2n),
.cg-wrap.orientation-white coords.files coord:nth-child(2n),
.cg-wrap.orientation-black coords.ranks coord:nth-child(2n + 1),
.cg-wrap.orientation-black coords.files coord:nth-child(2n + 1) {
  color: rgba(0, 0, 0, 0.8);
  background-color: unset !important;
}

.cg-wrap.orientation-black coords.ranks coord:nth-child(2n),
.cg-wrap.orientation-black coords.files coord:nth-child(2n),
.cg-wrap.orientation-white coords.ranks coord:nth-child(2n + 1),
.cg-wrap.orientation-white coords.files coord:nth-child(2n + 1) {
  color: rgba(0, 0, 0, 0.8);

}

.cg-board-wrap coords.ranks.black {
  background-color: unset !important;
}

.cg-board-wrap coords.files.black {
  background-color: unset !important;
}

/** Embedded SVGs for all chess pieces */
.cg-wrap piece.pawn.white {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PHBhdGggZD0iTTIyLjUgOWMtMi4yMSAwLTQgMS43OS00IDQgMCAuODkuMjkgMS43MS43OCAyLjM4QzE3LjMzIDE2LjUgMTYgMTguNTkgMTYgMjFjMCAyLjAzLjk0IDMuODQgMi40MSA1LjAzLTMgMS4wNi03LjQxIDUuNTUtNy40MSAxMy40N2gyM2MwLTcuOTItNC40MS0xMi40MS03LjQxLTEzLjQ3IDEuNDctMS4xOSAyLjQxLTMgMi40MS01LjAzIDAtMi40MS0xLjMzLTQuNS0zLjI4LTUuNjIuNDktLjY3Ljc4LTEuNDkuNzgtMi4zOCAwLTIuMjEtMS43OS00LTQtNHoiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==');
  background-color: unset !important;
}
.cg-wrap piece.bishop.white {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxnIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJidXR0Ij48cGF0aCBkPSJNOSAzNmMzLjM5LS45NyAxMC4xMS40MyAxMy41LTIgMy4zOSAyLjQzIDEwLjExIDEuMDMgMTMuNSAyIDAgMCAxLjY1LjU0IDMgMi0uNjguOTctMS42NS45OS0zIC41LTMuMzktLjk3LTEwLjExLjQ2LTEzLjUtMS0zLjM5IDEuNDYtMTAuMTEuMDMtMTMuNSAxLTEuMzU0LjQ5LTIuMzIzLjQ3LTMtLjUgMS4zNTQtMS45NCAzLTIgMy0yeiIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAxIDEgNSAweiIvPjwvZz48cGF0aCBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PC9nPjwvc3ZnPg==');
  background-color: unset !important;
}
.cg-wrap piece.knight.white {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMiAxMGMxMC41IDEgMTYuNSA4IDE2IDI5SDE1YzAtOSAxMC02LjUgOC0yMSIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yNCAxOGMuMzggMi45MS01LjU1IDcuMzctOCA5LTMgMi0yLjgyIDQuMzQtNSA0LTEuMDQyLS45NCAxLjQxLTMuMDQgMC0zLTEgMCAuMTkgMS4yMy0xIDItMSAwLTQuMDAzIDEtNC00IDAtMiA2LTEyIDYtMTJzMS44OS0xLjkgMi0zLjVjLS43My0uOTk0LS41LTItLjUtMyAxLTEgMyAyLjUgMyAyLjVoMnMuNzgtMS45OTIgMi41LTNjMSAwIDEgMyAxIDMiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNOS41IDI1LjVhLjUuNSAwIDEgMS0xIDAgLjUuNSAwIDEgMSAxIDB6bTUuNDMzLTkuNzVhLjUgMS41IDMwIDEgMS0uODY2LS41LjUgMS41IDMwIDEgMSAuODY2LjV6IiBmaWxsPSIjMDAwIi8+PC9nPjwvc3ZnPg==');
  background-color: unset !important;
}
.cg-wrap piece.rook.white {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik05IDM5aDI3di0zSDl2M3ptMy0zdi00aDIxdjRIMTJ6bS0xLTIyVjloNHYyaDVWOWg1djJoNVY5aDR2NSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMzQgMTRsLTMgM0gxNGwtMy0zIi8+PHBhdGggZD0iTTMxIDE3djEyLjVIMTRWMTciIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PHBhdGggZD0iTTMxIDI5LjVsMS41IDIuNWgtMjBsMS41LTIuNSIvPjxwYXRoIGQ9Ik0xMSAxNGgyMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIvPjwvZz48L3N2Zz4=');
  background-color: unset !important;
}
.cg-wrap piece.queen.white {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik04IDEyYTIgMiAwIDEgMS00IDAgMiAyIDAgMSAxIDQgMHptMTYuNS00LjVhMiAyIDAgMSAxLTQgMCAyIDIgMCAxIDEgNCAwek00MSAxMmEyIDIgMCAxIDEtNCAwIDIgMiAwIDEgMSA0IDB6TTE2IDguNWEyIDIgMCAxIDEtNCAwIDIgMiAwIDEgMSA0IDB6TTMzIDlhMiAyIDAgMSAxLTQgMCAyIDIgMCAxIDEgNCAweiIvPjxwYXRoIGQ9Ik05IDI2YzguNS0xLjUgMjEtMS41IDI3IDBsMi0xMi03IDExVjExbC01LjUgMTMuNS0zLTE1LTMgMTUtNS41LTE0VjI1TDcgMTRsMiAxMnoiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTkgMjZjMCAyIDEuNSAyIDIuNSA0IDEgMS41IDEgMSAuNSAzLjUtMS41IDEtMS41IDIuNS0xLjUgMi41LTEuNSAxLjUuNSAyLjUuNSAyLjUgNi41IDEgMTYuNSAxIDIzIDAgMCAwIDEuNS0xIDAtMi41IDAgMCAuNS0xLjUtMS0yLjUtLjUtMi41LS41LTIgLjUtMy41IDEtMiAyLjUtMiAyLjUtNC04LjUtMS41LTE4LjUtMS41LTI3IDB6IiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjxwYXRoIGQ9Ik0xMS41IDMwYzMuNS0xIDE4LjUtMSAyMiAwTTEyIDMzLjVjNi0xIDE1LTEgMjEgMCIgZmlsbD0ibm9uZSIvPjwvZz48L3N2Zz4=');
  background-color: unset !important;
}
.cg-wrap piece.king.white {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMi41IDExLjYzVjZNMjAgOGg1IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PHBhdGggZD0iTTIyLjUgMjVzNC41LTcuNSAzLTEwLjVjMCAwLTEtMi41LTMtMi41cy0zIDIuNS0zIDIuNWMtMS41IDMgMyAxMC41IDMgMTAuNSIgZmlsbD0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiLz48cGF0aCBkPSJNMTEuNSAzN2M1LjUgMy41IDE1LjUgMy41IDIxIDB2LTdzOS00LjUgNi0xMC41Yy00LTYuNS0xMy41LTMuNS0xNiA0VjI3di0zLjVjLTMuNS03LjUtMTMtMTAuNS0xNi00LTMgNiA1IDEwIDUgMTBWMzd6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTExLjUgMzBjNS41LTMgMTUuNS0zIDIxIDBtLTIxIDMuNWM1LjUtMyAxNS41LTMgMjEgMG0tMjEgMy41YzUuNS0zIDE1LjUtMyAyMSAwIi8+PC9nPjwvc3ZnPg==');
  background-color: unset !important;
}
.cg-wrap piece.pawn.black {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PHBhdGggZD0iTTIyLjUgOWMtMi4yMSAwLTQgMS43OS00IDQgMCAuODkuMjkgMS43MS43OCAyLjM4QzE3LjMzIDE2LjUgMTYgMTguNTkgMTYgMjFjMCAyLjAzLjk0IDMuODQgMi40MSA1LjAzLTMgMS4wNi03LjQxIDUuNTUtNy40MSAxMy40N2gyM2MwLTcuOTItNC40MS0xMi40MS03LjQxLTEzLjQ3IDEuNDctMS4xOSAyLjQxLTMgMi40MS01LjAzIDAtMi40MS0xLjMzLTQuNS0zLjI4LTUuNjIuNDktLjY3Ljc4LTEuNDkuNzgtMi4zOCAwLTIuMjEtMS43OS00LTQtNHoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==');
  background-color: unset !important;
}
.cg-wrap piece.bishop.black {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxnIGZpbGw9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJidXR0Ij48cGF0aCBkPSJNOSAzNmMzLjM5LS45NyAxMC4xMS40MyAxMy41LTIgMy4zOSAyLjQzIDEwLjExIDEuMDMgMTMuNSAyIDAgMCAxLjY1LjU0IDMgMi0uNjguOTctMS42NS45OS0zIC41LTMuMzktLjk3LTEwLjExLjQ2LTEzLjUtMS0zLjM5IDEuNDYtMTAuMTEuMDMtMTMuNSAxLTEuMzU0LjQ5LTIuMzIzLjQ3LTMtLjUgMS4zNTQtMS45NCAzLTIgMy0yeiIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAxIDEgNSAweiIvPjwvZz48cGF0aCBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1IiBzdHJva2U9IiNlY2VjZWMiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiLz48L2c+PC9zdmc+');
  background-color: unset !important;
}
.cg-wrap piece.knight.black {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMiAxMGMxMC41IDEgMTYuNSA4IDE2IDI5SDE1YzAtOSAxMC02LjUgOC0yMSIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0yNCAxOGMuMzggMi45MS01LjU1IDcuMzctOCA5LTMgMi0yLjgyIDQuMzQtNSA0LTEuMDQyLS45NCAxLjQxLTMuMDQgMC0zLTEgMCAuMTkgMS4yMy0xIDItMSAwLTQuMDAzIDEtNC00IDAtMiA2LTEyIDYtMTJzMS44OS0xLjkgMi0zLjVjLS43My0uOTk0LS41LTItLjUtMyAxLTEgMyAyLjUgMyAyLjVoMnMuNzgtMS45OTIgMi41LTNjMSAwIDEgMyAxIDMiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNOS41IDI1LjVhLjUuNSAwIDEgMS0xIDAgLjUuNSAwIDEgMSAxIDB6bTUuNDMzLTkuNzVhLjUgMS41IDMwIDEgMS0uODY2LS41LjUgMS41IDMwIDEgMSAuODY2LjV6IiBmaWxsPSIjZWNlY2VjIiBzdHJva2U9IiNlY2VjZWMiLz48cGF0aCBkPSJNMjQuNTUgMTAuNGwtLjQ1IDEuNDUuNS4xNWMzLjE1IDEgNS42NSAyLjQ5IDcuOSA2Ljc1UzM1Ljc1IDI5LjA2IDM1LjI1IDM5bC0uMDUuNWgyLjI1bC4wNS0uNWMuNS0xMC4wNi0uODgtMTYuODUtMy4yNS0yMS4zNC0yLjM3LTQuNDktNS43OS02LjY0LTkuMTktNy4xNmwtLjUxLS4xeiIgZmlsbD0iI2VjZWNlYyIgc3Ryb2tlPSJub25lIi8+PC9nPjwvc3ZnPg==');
  background-color: unset !important;
}
.cg-wrap piece.rook.black {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik05IDM5aDI3di0zSDl2M3ptMy41LTdsMS41LTIuNWgxN2wxLjUgMi41aC0yMHptLS41IDR2LTRoMjF2NEgxMnoiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTE0IDI5LjV2LTEzaDE3djEzSDE0eiIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiLz48cGF0aCBkPSJNMTQgMTYuNUwxMSAxNGgyM2wtMyAyLjVIMTR6TTExIDE0VjloNHYyaDVWOWg1djJoNVY5aDR2NUgxMXoiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTEyIDM1LjVoMjFtLTIwLTRoMTltLTE4LTJoMTdtLTE3LTEzaDE3TTExIDE0aDIzIiBmaWxsPSJub25lIiBzdHJva2U9IiNlY2VjZWMiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIvPjwvZz48L3N2Zz4=');
  background-color: unset !important;
}
.cg-wrap piece.queen.black {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxnIHN0cm9rZT0ibm9uZSI+PGNpcmNsZSBjeD0iNiIgY3k9IjEyIiByPSIyLjc1Ii8+PGNpcmNsZSBjeD0iMTQiIGN5PSI5IiByPSIyLjc1Ii8+PGNpcmNsZSBjeD0iMjIuNSIgY3k9IjgiIHI9IjIuNzUiLz48Y2lyY2xlIGN4PSIzMSIgY3k9IjkiIHI9IjIuNzUiLz48Y2lyY2xlIGN4PSIzOSIgY3k9IjEyIiByPSIyLjc1Ii8+PC9nPjxwYXRoIGQ9Ik05IDI2YzguNS0xLjUgMjEtMS41IDI3IDBsMi41LTEyLjVMMzEgMjVsLS4zLTE0LjEtNS4yIDEzLjYtMy0xNC41LTMgMTQuNS01LjItMTMuNkwxNCAyNSA2LjUgMTMuNSA5IDI2eiIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNOSAyNmMwIDIgMS41IDIgMi41IDQgMSAxLjUgMSAxIC41IDMuNS0xLjUgMS0xLjUgMi41LTEuNSAyLjUtMS41IDEuNS41IDIuNS41IDIuNSA2LjUgMSAxNi41IDEgMjMgMCAwIDAgMS41LTEgMC0yLjUgMCAwIC41LTEuNS0xLTIuNS0uNS0yLjUtLjUtMiAuNS0zLjUgMS0yIDIuNS0yIDIuNS00LTguNS0xLjUtMTguNS0xLjUtMjcgMHoiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTExIDM4LjVhMzUgMzUgMSAwIDAgMjMgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMTEgMjlhMzUgMzUgMSAwIDEgMjMgMG0tMjEuNSAyLjVoMjBtLTIxIDNhMzUgMzUgMSAwIDAgMjIgMG0tMjMgM2EzNSAzNSAxIDAgMCAyNCAwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlY2VjZWMiLz48L2c+PC9zdmc+');
  background-color: unset !important;
}
.cg-wrap piece.king.black {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMi41IDExLjYzVjYiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiLz48cGF0aCBkPSJNMjIuNSAyNXM0LjUtNy41IDMtMTAuNWMwIDAtMS0yLjUtMy0yLjVzLTMgMi41LTMgMi41Yy0xLjUgMyAzIDEwLjUgMyAxMC41IiBmaWxsPSIjMDAwIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIvPjxwYXRoIGQ9Ik0xMS41IDM3YzUuNSAzLjUgMTUuNSAzLjUgMjEgMHYtN3M5LTQuNSA2LTEwLjVjLTQtNi41LTEzLjUtMy41LTE2IDRWMjd2LTMuNWMtMy41LTcuNS0xMy0xMC41LTE2LTQtMyA2IDUgMTAgNSAxMFYzN3oiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNMjAgOGg1IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIi8+PHBhdGggZD0iTTMyIDI5LjVzOC41LTQgNi4wMy05LjY1QzM0LjE1IDE0IDI1IDE4IDIyLjUgMjQuNWwuMDEgMi4xLS4wMS0yLjFDMjAgMTggOS45MDYgMTQgNi45OTcgMTkuODVjLTIuNDk3IDUuNjUgNC44NTMgOSA0Ljg1MyA5IiBzdHJva2U9IiNlY2VjZWMiLz48cGF0aCBkPSJNMTEuNSAzMGM1LjUtMyAxNS41LTMgMjEgMG0tMjEgMy41YzUuNS0zIDE1LjUtMyAyMSAwbS0yMSAzLjVjNS41LTMgMTUuNS0zIDIxIDAiIHN0cm9rZT0iI2VjZWNlYyIvPjwvZz48L3N2Zz4=');
  background-color: unset !important;
}

.disabledBoard {
  pointer-events: none;
}

dialog {
  padding: 0.8rem;
  position: relative;
  background-color: #f0d9b5;
  top: 40%;
  left: 0%;
  width: 60%;
  z-index: 100;
  height: 15%;
  min-height: 60px;
  display: flex;
  border: 2px solid #333;
}

.promotion-container {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: 100%;
}

.promotion-container button {
  pointer-events: all;
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  width: 100%;
  height: 100%;
  z-index: 201;
}

.promotion-container div {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 200;
  pointer-events: none;
}

.dialog-container {
  position: relative;
  min-height: 10%;
}

@media (orientation: landscape) {
  .main-wrap {
    width: 90vh;
    margin-inline: auto;
    max-width: 1200px;
  }
}

@media (orientation: portrait) {
  .main-wrap {
    width: 90vw;
    margin-inline: auto;
    max-width: 1200px;
  }
}

.cg-board-wrap coords.ranks {
  right: -5px;
  top: -3%;
  flex-flow: column-reverse;
  height: 100%;
  width: 12px;
}

.center {
  display: flex;
  justify-content: center;
}

</style>
