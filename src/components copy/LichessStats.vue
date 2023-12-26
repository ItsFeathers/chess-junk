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

<script>
import axios from 'axios'
import pgnParser  from 'pgn-parser'
import { Chess } from 'chess.js'

import '../themes/theme.css'

export default({
  components: {
  },
  name: 'LichessStats',
  computed: {
  },
  props: {
    "repertoire": {
      default: () => {},
    },
    "currentPosition": {
      default: ""
    },
    "whitesTurn": {
      default: true
    },
    "trainingFor": {
      default: "white"
    },
    "variationRandomness": {
      default: 0.2
    },
    "movesThreshold": {
      default: 100
    }
  },
  methods: {
    async getWeightedRandomMove() {
      await this.getData()

      let moveNumber = Math.floor(Math.random()*this.currentPositionTotal)
      let options = this.repertoire[this.simplifyFen(this.currentPosition)].options

      let san = null
      let missing = null

      if (Math.random() > this.variationRandomness && this.currentPositionTotal > this.movesThreshold) {
        for (let rowIdx=0; rowIdx < this.tableData.length; ++rowIdx) {
          if (this.tableData[rowIdx].timesPlayed > moveNumber) {
            san = this.tableData[rowIdx].san
            break
          }
          moveNumber -= this.tableData[rowIdx].timesPlayed
        }
      }
      if (san) {
        for (let optionIdx=0; optionIdx<options.length; ++optionIdx) {
          if (options[optionIdx].friendly_notation == san) {
            return [options[optionIdx], missing]
          }
        }
      }
      if (san) {
        console.log(`Common move ${san} not in repertoire`)
        let chess = new Chess(this.currentPosition)
        chess.move(san)
        console.log(chess.history)
        let last_move = chess.history({ verbose: true })[0]
        missing = last_move
      }

      return [options[Math.floor(Math.random()*options.length)], missing]
    },
    async getData() {
      if (this.loadedFen == this.currentPosition) {
        return;
      }

      this.loading = true

      let res = await axios.get(`https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid,classical&ratings=2200,2500&fen=${this.currentPosition}`)
      this.positionData = res.data

      let whiteWins = this.positionData.white
      let blackWins = this.positionData.black
      let draws = this.positionData.draws
      this.currentPositionTotal = whiteWins + draws + blackWins
      this.tableData = []

      for (let moveIdx=0; moveIdx < res.data.moves.length; ++moveIdx) {
        let move
        move = res.data.moves[moveIdx]
        let timesPlayed
        timesPlayed = move.white + move.black + move.draws
        let playPercentage
        playPercentage = ((timesPlayed / this.currentPositionTotal) * 100).toPrecision(3)

        let whiteWinPercentage
        whiteWinPercentage = parseFloat(((move.white / timesPlayed) * 100).toPrecision(2))
        let blackWinPercentage
        blackWinPercentage = parseFloat(((move.black / timesPlayed) * 100).toPrecision(2))
        let drawPercentage
        drawPercentage = parseFloat(((move.draws / timesPlayed) * 100).toPrecision(2))
        let equity
        equity = parseFloat(((move.white + (0.5 * move.draws)) / timesPlayed ).toPrecision(2))

        let positionData
        positionData = this.repertoire[this.simplifyFen(this.currentPosition)]

        let inRepertoire
        inRepertoire = false
        if (positionData && "options" in positionData) {
          for (let optionIdx = 0; optionIdx < positionData.options.length; ++optionIdx) {
           let option = positionData.options[optionIdx]
           if (option.friendly_notation == move.san) {
             inRepertoire = true
           }
          }
        }

        let newTransposition
        newTransposition = false

        if (!inRepertoire) {
          let chess
          chess = new Chess(this.currentPosition)
          chess.move(move.san)
          let fenAfter
          fenAfter = this.simplifyFen(chess.fen())
          if (fenAfter in this.repertoire) {
            newTransposition = true
          }
        }

        let moveData
        moveData = {
          "san": move.san,
          "playPercentage": playPercentage,
          "timesPlayed": timesPlayed,
          "winPercentage": "(" + whiteWinPercentage + "/" + drawPercentage + "/" + blackWinPercentage + ")",
          "equity": equity,
          "inRepertoire": inRepertoire,
          "newTransposition": newTransposition
        }
        this.tableData.push(moveData)
      }

      this.loadedFen = this.currentFen

      this.loading = false
    },
    simplifyFen(fen) {
      var elements = fen.split(' ')
      var sanitized = elements.slice(0, 3).join(" ")
      return sanitized
    },
  },
  data: function () {
    return {
      loading: false,
      positionData: {},
      tableData: [],
      currentPositionTotal: 0,
      loadedFen: null,
      headers: [
        { text: 'San', value: 'san' },
        { text: 'Play %', value: 'playPercentage' },
        { text: 'Win %', value: 'winPercentage' },
        { text: 'Equity', value: 'equity' },
        { text: 'In Repertoire', value: 'inRepertoire' },
        { text: 'New Transposition', value: 'newTransposition' },
      ],
    }
  },
  watch: {
    currentPosition: function (currentPosition) {
      this.getData();
    },
  },
});
</script>
