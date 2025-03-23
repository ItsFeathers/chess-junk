import { instanceToPlain, plainToInstance } from "class-transformer";
import type { AnnotatedHistory } from "./history";
import type { MoveEvent } from "./moveEvent";
import { OptionSet, ProbabilisticMove } from "./moveSelector";
import { PositionMap, type Repertoire } from "./repertoire";

export const DEFAULT_MAX_HISTORY=5
export const SCORE_FACTOR=0.3
export const VISITS_FACTOR= 1 - SCORE_FACTOR

export const LAYER_FACTOR=0.7
export const COMPLETE_THRESHOLD=0.99

export class IResult {
  result: string;
  streak: number;
  playerColor: string;
  history: AnnotatedHistory;
  finalMove: MoveEvent;

  constructor(history: AnnotatedHistory, result: string, finalMove: MoveEvent, streak: number, playerColor: string) {
    this.finalMove = finalMove;
    this.history = history;
    this.streak = streak;
    this.result = result;
    this.playerColor = playerColor
  }
}

function simplifyFen(fen: string) {
  var elements = fen.split(" ");
  var sanitized = elements.slice(0, 3).join(" ");
  return sanitized;
}

export function loadResultSummary(save: Record<string, any>): ResultsSummary {
  var loaded = plainToInstance(ResultsSummary, save)

  var blackMap: Record<string, PositionRecord> = loaded.positionMapBlack
  for (let key in blackMap) {
    blackMap[key] = plainToInstance(PositionRecord, blackMap[key])
  }

  var whiteMap: Record<string, PositionRecord> = loaded.positionMapWhite
  for (let key in whiteMap) {
    whiteMap[key] = plainToInstance(PositionRecord, whiteMap[key])
  }


  return loaded
}

export class ResultsSummary {
  exportToObject(): Record<string, any> {
    return instanceToPlain(this)
  }
  getTestOptionSet(fen: string, color: string, repertoire: Repertoire): OptionSet {
    var moves: ProbabilisticMove[] = [];
    var options = repertoire.getOpponentMoves(fen);
    var map = this.getPositionMap(color)

    for (let idx=0; idx<options.length; idx++) {
      var fenAfter = simplifyFen(options[idx].fen_after);

      var completeness = this.getCompleteness(fenAfter, color, repertoire, 4)
      if (isNaN(completeness)) {
        console.log("NAN score")
      }
      var probability = 0
      if (completeness < COMPLETE_THRESHOLD)
        probability = completeness
      else {
        console.log("Exhausted")
        probability = 0
      }
      moves.push(new ProbabilisticMove(options[idx].friendly_notation, probability))
    }

    var optionSet = new OptionSet(fen, 20 * 1, moves)
    return optionSet;
  }
  constructor(testHistory: IResult[], depth=4) {

  }

  resultScorePosition(fen: string, player: string) {
    const map = this.getPositionMap(player)
    if (!(fen in map)) {
      return 0;
    }
    return map[fen].correctPercentage()
  }

  visitScorePosition(fen: string, player: string): number {
    const map = this.getPositionMap(player)
    if (!(fen in map)) {
      return 0;
    }
    return map[fen].visitScore()
  }

  shallowScore(fen: string, player: string) {
    const visitScore = this.visitScorePosition(fen, player)
    if (visitScore > 1.005) {
      throw new Error("visit score too high " + visitScore)
    }
    const resultScore = this.resultScorePosition(fen, player)
    if (resultScore > 1) {
      throw new Error("result score too high")
    }
    return (visitScore * VISITS_FACTOR) + (resultScore * SCORE_FACTOR)
  }

  scoreLayer(positions: string[], player: string): number {
    var layerScore = 0.0
    for (let idx=0; idx<positions.length; idx++) {
      layerScore += this.shallowScore(positions[idx], player) / positions.length
      if (this.shallowScore(positions[idx], player) > 1) {
        throw new Error("Shallow score too high")
      }
    }
    return layerScore;
  }

  getCompleteness(fen: string, player: string, repertoire: Repertoire, depth=0) {

    var childPositions = repertoire.getChildPositions(fen, player, depth)

    var currentLayer = 0
    var score = 0
    var remaining = 1.0
    while (currentLayer <= depth && currentLayer in childPositions) {
      var layerFactor = remaining * LAYER_FACTOR
      score += this.scoreLayer(childPositions[currentLayer], player) * layerFactor
      remaining = remaining - layerFactor
      currentLayer += 1
    }
    if (remaining == 1) {
      return 0
    }
    score = score / (1 - remaining)

    if (isNaN(score)) {
      console.log ("nanscore")
    }

    console.log("Fen: ", fen, " Score ", score)

    return score
  }


  getPositionMap(color: string) {
    if (color.startsWith("w")) {
      return this.positionMapWhite
    } else {
      return this.positionMapBlack
    }
  }

  addResult(result: IResult, player: string) {
    var difference = Math.abs(result.streak) / result.streak
    var score = result.streak
    var map = this.getPositionMap(player)
    for(let idx=0; idx < result.history.length(); ++idx) {
      if (result.history.positionAt(idx, player) != null) {
        var fen = simplifyFen(result.history.positionAt(idx, player).fen)
        if (!(fen in map)) {
          map[fen] = new PositionRecord(DEFAULT_MAX_HISTORY)
        }
        map[fen].pushScore(score)
        score -= difference;
      }
    }
  }

  getResultsForPosition(fen: string, color: string): number[] {
    var positionMap = this.getPositionMap(color);
    if (!(fen in positionMap)) {
      return []
    } else {
      return positionMap[fen]._testHistory
    }
  }

  positionMapWhite: Record<string, PositionRecord> = {}
  positionMapBlack: Record<string, PositionRecord> = {}
}

export class PositionRecord {
  visitScore(): any {
    return this._testHistory.length / this.historyLength
  }
  support(): any {
    var failureCount = 0
    var count = this._testHistory.length

    if (count == 0) {
      return 0
    }

    for (let idx=0; idx<this._testHistory.length; ++idx) {
      if (this._testHistory[idx] < 0) {
        failureCount += 1
      }
    }

    return failureCount / count;
  }
  constructor(historyLength=DEFAULT_MAX_HISTORY) {
    this.historyLength = historyLength
  }
  pushScore(score: number) {
    this._testHistory.push(score);
    while(this._testHistory.length > this.historyLength) {
      this._testHistory.shift()
    }
  }
  correctPercentage(): number {
    var count = this._testHistory.length
    var failureCount = 0
    if (count == 0) {
      return 0
    }

    for (let idx=0; idx<this._testHistory.length; ++idx) {
      if (this._testHistory[idx] == -1) {
        failureCount += 1
      }
    }
    return (count - failureCount) / count
  }
  score(): number {
    var failureSum = 0.0
    var failureCount = 0
    var count = this._testHistory.length

    if (count == 0) {
      return 0
    }

    for (let idx=0; idx<this._testHistory.length; ++idx) {
      if (this._testHistory[idx] < 0) {
        failureSum += Math.abs(this._testHistory[idx])
        failureCount += 1
      }
    }

    if (failureCount == 0) {
      return 0
    }

    const failureAverage = failureSum / failureCount;
    return (1 / failureAverage) * (failureCount / count);
  }
  historyLength: number;
  _testHistory: number[] = []
}
