<template>
  <v-container fluid>
    <input ref="uploader" class="d-none" type="file" @change="selectFile" />
    <v-row>
      <v-col lg="12" md="12" sm="12" cols="12">
        <v-row cols="12" class="my-2">
          <v-spacer/>
          <v-btn v-on:click="goBack">
            <v-icon>
              mdi-arrow-left
            </v-icon>
          </v-btn>
          <v-spacer/>
          <v-btn v-on:click="setStartPosition">From Here</v-btn>
          <v-spacer/>
          <v-btn v-on:click="resetPosition">reset</v-btn>
          <v-spacer/>
        </v-row>

        <v-row class="board-container center my-2" align="center" justify="center">
            <chessboard :fen="currentFen" :orientation="trainingFor" ref="openingsBoard" :shapes="shapes"  @onMove="userPlay"></chessboard>
        </v-row>
      <v-row justify="center" align="center">
        <v-col lg="2" md="2" sm="2" cols="2">
          <div class="d-flex justify-center">
            <v-switch class="switch-center" inset v-model="trainingFor" true-value="black" color="black" false-value="white" :label="`Studying: ${trainingFor}`"></v-switch>
          </div>
        </v-col>
        <v-col lg="2" md="2" sm="2" cols="2">
          <div class="d-flex justify-center">
            <v-switch inset v-model="mode" true-value="test" false-value="teach" :label="`Mode: ${mode}`" class="justify-center"></v-switch>
          </div>
        </v-col>
        <v-col lg="2" md="2" sm="2" cols="2">
          <v-btn @click="selectFileDialog">
            <v-icon left>
              mdi-cloud-upload
            </v-icon>
            Import
          </v-btn>
        </v-col>
      </v-row>
      </v-col>
    </v-row>
    <v-spacer>
    </v-spacer>
    <v-tabs
      v-model="tab"
      bg-color="deep-purple-accent-4"
      centered
      stacked
    >
      <v-tab key="recents">
        <v-icon>mdi-chess-pawn</v-icon>
        Recent Games
      </v-tab>
      <v-tab key="suggestions">
        <v-icon>mdi-heart</v-icon>
        Repertoire Moves
      </v-tab>
      <v-tab key="lichess">
        <v-icon>mdi-horse-variant</v-icon>
        Lichess Stats
      </v-tab>
      <v-tab key="notes">
        <v-icon>mdi-text</v-icon>
        Notes
      </v-tab>
      <v-tab key="results">
        <v-icon>mdi-check</v-icon>
        Test Results
      </v-tab>
      <v-tab key="options">
        <v-icon>mdi-cogs</v-icon>
        Options
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab" optional="true">
      <v-tab-item>
        <!--LichessClient :repertoire="moveSelections" @games="updateGames" @selectedGame="studyGame"/ -->      </v-tab-item>
      <v-tab-item
      >
        <MovePicker
           v-if="mode == 'teach'"
           :preferred_move="moveSelections[friendly_current_position] ? moveSelections[friendly_current_position]['selection'] : null"
           :moves="moveSelections[friendly_current_position] ? moveSelections[friendly_current_position]['options'] : []"
           v-on:selected="updateSelection($event)"
           v-on:deleted="deleteOption($event)"
           v-on:make_move="makeMove($event)">
        </MovePicker>
      </v-tab-item>
      <v-tab-item eager>
        <LichessStats v-show="mode == 'teach'" ref="lichessStats" :repertoire="moveSelections" :currentPosition="currentFen" :whitesTurn="whitesTurn"
          :trainingFor="trainingFor" :variationRandomness="variationRandomness" :movesThreshold="movesThreshold"/>
      </v-tab-item>
      <v-tab-item eager>
        <Notes :repertoire="moveSelections" :currentPosition="friendly_current_position" v-on:notesUpdate="notesUpdate($event)"/>
      </v-tab-item>
      <v-tab-item eager>
        <v-btn cols="1" v-for="result in test_results"  fab :color="result.score == 'X' ? 'purple' : result.score > 0 ? 'success': 'error'" @click="recallPosition(result)"><v-icon>{{ result.score == "X" ? "X" : result.score > 0 ? result.score : -result.score}}
           </v-icon></v-btn>
        <v-btn cols="1" large fab color="pending"><v-icon>{{current_streak}}</v-icon></v-btn>
      </v-tab-item>
      <v-tab-item>
      <v-col lg="12" md="12" sm="12" cols="12">
      <v-row justify="center" align="center">
        <v-col lg="12" md="12" sm="12" cols="12">
          <div class="d-flex justify-center">
            <v-checkbox label="Offline" v-model="offline"></v-checkbox>
          </div>
        </v-col>
        <v-col lg="12" md="12" sm="12" cols="12">
          <div class="d-flex justify-center">
            <v-switch class="switch-center" inset v-model="trainingFor" true-value="black" color="black" false-value="white" :label="`Studying: ${trainingFor}`"></v-switch>
          </div>
        </v-col>
        <v-col lg="12" md="12" sm="12" cols="12">
          <div class="d-flex justify-center">
            <v-switch inset v-model="mode" true-value="test" false-value="teach" :label="`Mode: ${mode}`" class="justify-center"></v-switch>
          </div>
        </v-col>
        <v-col lg="12" md="12" sm="12" cols="12">
          <div class="d-flex justify-center">
            <v-switch inset v-model="rollback" label="Rollback" class="justify-center"></v-switch>
          </div>
        </v-col>
        <v-col lg="12" md="12" sm="12" cols="12">
          <v-btn id="export-button" v-on:click="export_repertoire()"><v-icon>mdi-cloud-download</v-icon>Export</v-btn>
        </v-col>
        <v-col lg="12" md="12" sm="12" cols="12">
          <v-btn v-on:click="setStartPosition">From Here</v-btn>
        </v-col>
        <v-col lg="12" md="12" sm="12" cols="12">
          <v-btn @click="selectFileDialog">
            <v-icon left>
              mdi-cloud-upload
            </v-icon>
            Import
          </v-btn>
        </v-col>
        <v-col lg="12" md="12" sm="12" cols="12">
          <v-slider
            v-model="variationRandomness"
            :min="0"
            :max="1"
            :step="0.2"
            label="Variation Randomisation"
          ></v-slider>
        </v-col>
        <v-col lg="12" md="12" sm="12" cols="12">
          <v-slider
            v-model="movesThreshold"
            :min="1"
            :max="1000"
            label="Minimum Moves for Non Random Variation"
          ></v-slider>
        </v-col>

      </v-row>
      </v-col>
      </v-tab-item>
    </v-tabs-items>

  </v-container>
</template>

<script>
import chessboard from './Board.vue'

import '../themes/theme.css'
import MovePicker from './MovePicker.vue'
import LichessStats from './LichessStats.vue'
import Notes from './Notes.vue'
import Engine from './Engine.vue'

export default({
  components: {
    chessboard,
    MovePicker,
    Engine,
    LichessStats,
    Notes,
  },
  name: 'openings-component',
  computed: {
    friendly_current_position: function () {
       var elements = this.currentFen.split(' ')
       var sanitized = elements.slice(0, 3).join(" ")
       return sanitized
    }
  },
  props: {
  },
  methods: {
    moveIsInOptions(move, options) {
      for (var option of options) {
        if(this.options_equal(option, move)) {
          return true
        }
      }
      return false
    },
    boardLoaded() {
    },
    options_equal(option1, option2) {
      return option1.from == option2.from && option1.to == option2.to && option1.promotion == option2.promotion
    },
    deleteOption(option_to_delete) {
      var options = this.moveSelections[this.friendly_current_position].options
      var new_options = []

      for (var option of options) {
        if (!this.options_equal(option, option_to_delete)) {
          new_options.push(option)
        }
      }

      this.moveSelections[this.friendly_current_position].options = new_options
      this.updateShapes()
      this.$forceUpdate()
    },
    getPreviousPosition() {
      return this.fenHistory[this.fenHistory.length - 1]
    },
    getPreviousPositionD(distance) {
      return this.fenHistory[this.fenHistory.length - (distance + 1)]
    },
    recallPosition(result) {
      this.mode = "teach"
      this.currentFen = result.position
      this.fenHistory = result.fenHistory
      if (result.move) {
        this.badMove = result.move
      }
      this.updateShapes()
    },
    notesUpdate(update) {
      console.log(this.moveSelections)
      if (!this.moveSelections[this.friendly_current_position]) {
        this.moveSelections[this.friendly_current_position] = { "options": [], "selection": null}
      }
      this.moveSelections[this.friendly_current_position].notes = update;
    },
    userPlay(params) {

      if (this.mode == "test") {
        this.fenHistory.push(this.friendly_current_position)
        this.currentFen = this.fenHistory[this.fenHistory.length -1] + " - 0 1"
        this.updateShapes()
        this.$forceUpdate()

        if(this.moveSelections[this.friendly_current_position] && this.moveSelections[this.friendly_current_position]["options"].length > 0) {
          setTimeout(this.playOut, 1, params);
        } else {
          this.endStreak("win", this.currentFen, this.fenHistory, params)
          setTimeout(this.resetPosition, 1)
        }
      }

      var newMove = false
      if (this.moveSelections[this.friendly_current_position]) {
        if (!this.moveIsInOptions(params, this.moveSelections[this.friendly_current_position].options) && this.mode == "teach") {
          this.moveSelections[this.friendly_current_position]["options"].push(params)
          newMove = true
        }
      } else {
        this.moveSelections[this.friendly_current_position] = { "options": [params], "selection": params.turn == this.trainingFor ? params : null}
        newMove = true
      }

      if (!this.moveSelections[this.friendly_current_position]["selection"] &&  params.turn == this.trainingFor) {
        this.moveSelections[this.friendly_current_position]["selection"] = params
      }

      this.update_move(params, params.fen_after)
      if (this.mode == "teach" && params.turn != this.trainingFor && newMove && this.rollback) {
        setTimeout(this.goBack, 1);
      }

      this.whitesTurn = params.turn == 'white'
      this.updateShapes()
      this.$forceUpdate()
    },
    studyGame(game) {
      this.mode = "teach"
      this.currentFen = game.final_position + " - 0 1"
      this.fenHistory = game.game
      this.trainingFor = game.playing_as == "White" ? "white" : "black"
      this.badMove = game.deviating_move_obj
      this.updateShapes()
    },
    setStartPosition() {
      this.startingFen = this.currentFen
      this.startingHistory = this.fenHistory.filter(() => true);
    },
    updateGames(games) {
    },
    async playOut(params) {
      if (!params) {
        if(this.moveSelections[this.friendly_current_position]) {
          var item = this.moveSelections[this.friendly_current_position]["options"][Math.floor(Math.random() * this.moveSelections[this.friendly_current_position]["options"].length)];
          this.makeMove(item)
        }
      }
      else if(this.moveSelections[this.getPreviousPositionD(1)] && this.options_equal(params, this.moveSelections[this.getPreviousPositionD(1)]["selection"])) {
        this.current_streak++
        if(this.moveSelections[this.friendly_current_position] && this.moveSelections[this.friendly_current_position]["options"].length > 0) {
          let move;
          let error;
          if (!this.offline) {
            [move, error] = await this.$refs.lichessStats.getWeightedRandomMove();
          } else {
            move = this.moveSelections[this.friendly_current_position]["options"][Math.floor(Math.random() * this.moveSelections[this.friendly_current_position]["options"].length)];
            error = null;
          }

          if (error) {
            this.addMissingMoveResult(this.currentFen, this.fenHistory, error)
          }

          this.makeMove(move)
        } else {
          this.endStreak("win", this.currentFen, this.fenHistory, params)
          this.resetPosition()
        }
      } else {
        this.endStreak("lose", this.currentFen, this.fenHistory, params)
        this.showAnswer(params, this.moveSelections[this.getPreviousPositionD(1)]["selection"])
      }
    },
    update_move(last_move, new_fen) {
      this.currentFen = new_fen

      if (last_move) {
        this.fenHistory.push(this.simplifyFen(new_fen))
      }

      this.updateShapes()
      this.$forceUpdate()
    },
    addMissingMoveResult(position, history, move) {
        this.test_results.push({score: "X", position: history[history.length - 1] + " - 0 1", fenHistory: history, move: move})
    },
    endStreak(result, position, history, move) {
      if(result == "win") {
        this.test_results.push({score: this.current_streak, position: position, fenHistory: history})
      } else {
        history.pop()
        history.pop()
        this.test_results.push({score: -this.current_streak, position: history[history.length - 1] + " - 0 1", fenHistory: history, move: move})
      }
      this.current_streak = 0
    },
    updateShapes() {
      let shapes = []

      if(this.mode=="teach") {
        if (this.moveSelections[this.friendly_current_position]) {
          for (var option of this.moveSelections[this.friendly_current_position].options) {
            shapes.push({orig: option.from, dest: option.to, brush: "blue"})
          }
          if(this.moveSelections[this.friendly_current_position]["selection"]) {
          let selection = this.moveSelections[this.friendly_current_position]["selection"]
            shapes.push({orig: selection.from, dest: selection.to, brush: "green"})
          }
          if (this.badMove) {
            shapes.push({orig: this.badMove.from, dest: this.badMove.to, brush: "red"})
            this.badMove = null
          }
        }
      }
      this.shapes = shapes
    },
    playMoves(moveObject) {
      this.$refs.childComponent.playMove(moveObject)
    },
    showAnswer(moveMade, correctMove) {
      let shapes = []
      var lastResult = this.test_results[this.test_results.length - 1]
      var correctMove = this.moveSelections[this.getPreviousPositionD(0)]["selection"]

      shapes.push({orig: moveMade.from, dest: moveMade.to, brush: lastResult == 'win' ? 'green' : 'red'})
      if (lastResult != 'win') {
        shapes.push({orig: correctMove.from, dest: correctMove.to, brush: 'green'})
      }
      this.shapes = shapes
    },
    backButton() {
      this.goBack()
      this.updateShapes()
      this.$forceUpdate()
    },
    goBack() {
      if (this.fenHistory.length > 1) {
        this.fenHistory.pop()
      }
      this.whitesTurn = !this.whitesTurn
      this.currentFen = this.fenHistory[this.fenHistory.length -1] + " - 0 1"
      this.updateShapes()
      this.$forceUpdate()
    },
    updateSelection(value) {
      this.moveSelections[this.friendly_current_position]["selection"] = value
      this.updateShapes()
      this.$forceUpdate()
    },
    export_repertoire() {
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.moveSelections))
      var downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", "a.json")
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    makeMove(move) {
      this.update_move(move, move.fen_after)
    },
    getCurrentTurn() {
      return this.currentFen.split(" ")[1] == "w" ? "white" : "black"
    },
    resetPosition() {
      this.currentFen = this.startingFen
      this.fenHistory = this.startingHistory.filter(() => true);
      if (this.trainingFor != this.getCurrentTurn() && this.mode == "test") {
        this.playOut(null)
      }
      this.updateShapes()
      this.$forceUpdate()
    },
    selectMove() {
    },
    selectFile(event) {
      var reader = new FileReader();

      var file = event.target.files[0]
      reader.readAsText(file);
      reader.onload = () => {
        this.moveSelections = JSON.parse(reader.result);
        this.currentFen = this.startingFen
        this.updateShapes()
        this.$forceUpdate()
      }
    },
    selectFileDialog() {
      this.$refs.uploader.click()
    },
    simplifyFen(fen) {
      var elements = fen.split(' ')
      var sanitized = elements.slice(0, 3).join(" ")
      return sanitized
    },
    bestMove(val) {
      this.best = val
    },
    setEvaluation(val) {
      let maxBarEval = 400

      this.evaluation = parseInt(val.evaluation)

      if (!this.whitesTurn) {
        this.evaluation = -this.evaluation
      }

      this.barPercentage = (this.evaluation + maxBarEval) / (2 * maxBarEval) * 100
    }
  },
  data: function () {
    return {
      barPercentage: 50,
      badMove: null,
      evaluation: 0,
      absoluteEvaluation: 0,
      whitesTurn: true,
      filedata: "None here",
      rollback: false,
      startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      startingHistory: ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq'],
      currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      currentSideWhite: true,
      fenHistory: ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq'],
      mode: "teach",
      moveSelections: {},
      shapes: [],
      tab: "",
      trainingFor: "white",
      testDepth: 10,
      offline: false,
      modes: ["teach", "test"],
      test_results: [],
      current_streak: 0,
      best: "",
      variationRandomness: 0.2,
      movesThreshold: 1000
    }
  },
  mounted() {
  }
});
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