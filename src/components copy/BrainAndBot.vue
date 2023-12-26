<template>
  <v-container fluid >
    <v-row>
      <v-col cols="12">
        <PlayerList :players="teamB" :playersWhoVoted="teamBVoted" :active="!teamAsTurn"></PlayerList>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <!--chessboard ref="childComponent" :fen="currentFen" orientation="white" @onMove="userPlay" :shapes="shapes"></chessboard-->
      </v-col>
      <v-col cols="6">
        <MovesByPiece ref="movesEngine" :position="currentFen" :moves="availableMoves" @selectedMove="playMove" @availablePieces="updateAvailablePieces"/>
        <VoteBot :time="45" :options="availablePieces" @selection="selectedPiece" :teamA="teamA" :teamB="teamB" :teamAVoted="teamAVoted" :teamBVoted="teamBVoted"
         :teamAActive="teamAsTurn" @newPlayer="registerPlayer" @addVote="addVote"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <PlayerList :players="teamA" :playersWhoVoted="teamAVoted" :active="teamAsTurn"></PlayerList>
      </v-col>
    </v-row>

  </v-container>

</template>

<script>
// import {chessboard} from 'vue-chessboard'

import '../themes/theme.css'
import VoteBot from './VoteBot.vue'
import MovePicker from './MovePicker.vue'
import MovesByPiece from './MovesByPiece.vue'
import TwitchReader from './TwitchReader.vue'
import PlayerList from './PlayerList.vue'

export default({
  components: {
    // chessboard,
    MovePicker,
    MovesByPiece,
    TwitchReader,
    VoteBot,
    PlayerList
  },
  name: 'Board',
  computed: {
  },
  props: {
  },
  methods: {
    getEval(message) {
      this.engineOutput = message.data;
    },
    userPlay(message) {
      this.currentFen = message.fen
      this.availableMoves = message.moves
      console.log(this.$refs.childComponent.getResult())
    },
    selectedPiece(piece) {
      this.$refs.movesEngine.firePiece(piece)
    },
    playMove(move) {
      console.log(move)

      var moveObject = {
        from: move[0] + move[1],
        to: move[2] + move[3]
      }

      this.shapes = [{orig: moveObject.from, dest: moveObject.to, brush: "blue"}]

      if (move.length > 4) {
        moveObject["promotion"] = move[4]
      }

      this.$refs.childComponent.playMove(moveObject)
      this.teamAsTurn = !this.teamAsTurn
      this.teamAVoted = []
      this.teamBVoted = []
    },
    updateAvailablePieces(pieces) {
      console.log(pieces)
      this.availablePieces = pieces
    },
    registerPlayer(playerName) {
      if (this.teamA.indexOf(playerName) == -1 && this.teamB.indexOf(playerName) == -1) {
        if (this.teamA.length > this.teamB.length) {
          this.teamB.push(playerName)
        } else {
          this.teamA.push(playerName)
        }
      }
    },
    addVote(vote) {
      if (this.teamAsTurn) {
        this.teamAVoted.push(vote)
      } else {
        this.teamBVoted.push(vote)
      }
    }
  },
  data: function () {
    return {
      startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      currentSideWhite: true,
      fenHistory: ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq'],
      testDepth: 10,
      availablePieces: [],
      availableMoves: [],
      teamA: [],
      teamAVoted: [],
      teamB: [],
      teamBVoted: [],
      teamAsTurn: true,
      shapes: [],
    }
  }
});
</script>

<style scoped>
div /deep/ .black {
  background-color: unset !important;
}

div /deep/ .white {
  background-color: unset !important;
}

div /deep/ .blue {
  background-color: unset !important;
}
</style>