<template>
  <v-container fluid>
    <v-col cols="12">
      <engine :position="position" :moves="pawnMoves" :depth="depth" :analyseAll="false" @bestMove="pawnMove"/>
      <engine :position="position" :moves="queenMoves" :depth="depth" :analyseAll="false" @bestMove="queenMove"/>
      <engine :position="position" :moves="kingMoves" :depth="depth" :analyseAll="false" @bestMove="kingMove"/>
      <engine :position="position" :moves="bishopMoves" :depth="depth" :analyseAll="false" @bestMove="bishopMove"/>
      <engine :position="position" :moves="knightMoves" :depth="depth" :analyseAll="false" @bestMove="knightMove"/>
      <engine :position="position" :moves="rookMoves" :depth="depth" :analyseAll="false" @bestMove="rookMove"/>


      <v-btn v-if="pawnMoves.length > 0" cols="2" large fab :color="pawnFinished ? 'green' : 'white'" v-on:click="firePawn"><v-icon>P</v-icon></v-btn>
      <v-btn v-if="knightMoves.length > 0" cols="2" large fab :color="knightFinished ? 'green' : 'white'" v-on:click="fireKnight"><v-icon>N</v-icon></v-btn>
      <v-btn v-if="bishopMoves.length > 0" cols="2" large fab :color="bishopFinished ? 'green' : 'white'" v-on:click="fireBishop"><v-icon>B</v-icon></v-btn>
      <v-btn v-if="rookMoves.length > 0" cols="2" large fab :color="rookFinished ? 'green' : 'white'" v-on:click="fireRook"><v-icon>R</v-icon></v-btn>
      <v-btn v-if="queenMoves.length > 0" cols="2" large fab :color="queenFinished ? 'green' : 'white'" v-on:click="fireQueen"><v-icon>Q</v-icon></v-btn>
      <v-btn v-if="kingMoves.length > 0" cols="2" large fab :color="kingFinished ? 'green' : 'white'" v-on:click="fireKing"><v-icon>K</v-icon></v-btn>
    </v-col>

  </v-container>
</template>

<script>
import '../themes/theme.css'
import Engine from './Engine.vue'

export default({
  components: {
    Engine
  },
  name: 'MovesByPiece',
  computed: {
  },
  props: {
    "moves": {
      type: Array,
      default: () => [],
    },
    "position": {
      type: String,
      default: null,
    },
    "depth": {
      type: Number,
      default: 15,
    },
  },
  methods: {
    pawnMove(move) {
      this.pawnFinished = true
      this.bestPawnMove = move
    },
    knightMove(move) {
      this.knightFinished = true
      this.bestKnightMove = move
    },
    bishopMove(move) {
      this.bishopFinished = true
      this.bestBishopMove = move
    },
    rookMove(move) {
      this.rookFinished = true
      this.bestRookMove = move
    },
    queenMove(move) {
      this.queenFinished = true
      this.bestQueenMove = move
    },
    kingMove(move) {
      this.kingFinished = true
      this.bestKingMove = move
    },
    firePiece(piece) {
      if (piece == 'K') {
        this.fireKing()
      } else if (piece == 'Q') {
        this.fireQueen()
      } else if (piece == 'R') {
        this.fireRook()
      }  else if (piece == 'B') {
        this.fireBishop()
      }  else if (piece == 'N') {
        this.fireKnight()
      }  else if (piece == 'P') {
        this.firePawn()
      } else {
        alert("Unknown Piece " + piece)
      }
    },

    firePawn() {
      this.$emit("selectedMove", this.bestPawnMove)
    },
    fireBishop() {
      this.$emit("selectedMove", this.bestBishopMove)
    },
    fireKnight() {
      this.$emit("selectedMove", this.bestKnightMove)
    },
    fireRook() {
      this.$emit("selectedMove", this.bestRookMove)
    },
    fireQueen() {
      this.$emit("selectedMove", this.bestQueenMove)
    },
    fireKing() {
      this.$emit("selectedMove", this.bestKingMove)
    },
    updateOptions() {
      this.pawnFinished = false
      this.knightFinished = false
      this.bishopFinished = false
      this.rookFinished = false
      this.queenFinished = false
      this.kingFinished = false

      this.pawnMoves = []
      this.queenMoves = []
      this.kingMoves = []
      this.bishopMoves = []
      this.rookMoves = []
      this.knightMoves = []

      console.log(this.moves)

      for (var move of this.moves) {
        if(move.piece === 'q') { this.queenMoves.push(move.from + move.to) }
        else if(move.piece === 'k') { this.kingMoves.push(move.from + move.to) }
        else if(move.piece === 'b') { this.bishopMoves.push(move.from + move.to) }
        else if(move.piece === 'r') { this.rookMoves.push(move.from + move.to) }
        else if(move.piece === 'n') { this.knightMoves.push(move.from + move.to) }
        else{
          if(move["promotion"]) {
            this.pawnMoves.push(move.from + move.to + move.promotion)
          } else {
            this.pawnMoves.push(move.from + move.to)
          }
        }
      }

      console.log(this.pawnMoves)

      var availablePieces = []
      if (this.kingMoves.length > 0) {availablePieces.push("K")}
      if (this.queenMoves.length > 0) {availablePieces.push("Q")}
      if (this.rookMoves.length > 0) {availablePieces.push("R")}
      if (this.bishopMoves.length > 0) {availablePieces.push("B")}
      if (this.knightMoves.length > 0) {availablePieces.push("N")}
      if (this.pawnMoves.length > 0) {availablePieces.push("P")}
      this.$emit("availablePieces", availablePieces)

      this.$forceUpdate()
    },
  },
  data: function () {
    return {
      pawnMoves: [],
      queenMoves: [],
      kingMoves: [],
      bishopMoves: [],
      rookMoves: [],
      knightMoves: [],

      pawnFinished: false,
      knightFinished: false,
      bishopFinished: false,
      rookFinished: false,
      queenFinished: false,
      kingFinished: false,


      bestPawnMove: null,
      bestQueenMove: null,
      bestKingMove: null,
      bestBishopMove: null,
      bestRookMove: null,
      bestKnightMove: null,
    }
  },
  watch: {
    position: function () {
      this.updateOptions()
    },
    moves: function () {
      this.updateOptions()
    },
    depth: function () {
      this.updateOptions()
    }
  },

});
</script>