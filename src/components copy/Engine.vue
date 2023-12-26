<template>
  <span />
</template>
<script>
import { Stockfish } from 'ffish-es6'
export default({
  components: {
  },
  name: 'Engine',
  data: function () {
    return {
      "engineOutput": "",
      "ready": false
    }
  },
  created: function () {
  },
  props: {
    "moves": {
      type: Array,
      default: () => [],
    },
    "position": {
      type: String,
      default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    },
    "depth": {
      type: Number,
      default: 15,
    },
    "analyseAll": {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    handleMessage(message) {
      if (!this.ready) {
        if (message.data == 'uciok') {
          console.log(message)
          this.ready = true;
          this.engine.postMessage('setoption name Threads value 160000');

        }
        return
      }
      console.log(message)
      if(!message.data.startsWith("best")) {
        let depth = message.data.split(" ")[2]
        let evalType = message.data.split(" ")[8]
        let evaluation = message.data.split(" ")[9]

        if (depth == this.depth) {
          console.log(message.data.split(" "))
          this.$emit('bestMove', message.data.split(" ")[19])
          this.$emit('evaluation', {
            'bestMove': message.data.split(" ")[19],
            'evaluation': evaluation,
            'evaluationType': evalType,
          })
        }
      }
    },
    evaluate() {
      if (!this.ready) {
        return
      }
      this.engine.postMessage("stop")

      this.engine.onmessage = this.handleMessage
      this.engine.postMessage("position fen " + this.position);
      if(this.moves.length > 0) {
        this.engine.postMessage("go depth " + this.depth + " searchmoves " + this.moves.join(" "));
      } else if(this.analyseAll) {
        this.engine.postMessage("go depth " + this.depth);
      } else {
        this.$emit('bestMove', null)
      }
    },
  },
  watch: {
    position: function (position) {
      this.evaluate()
    },
    moves: function (position) {
      this.evaluate()
    },
  },
})
</script>