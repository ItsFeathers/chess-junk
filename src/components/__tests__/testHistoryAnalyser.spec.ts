import { describe, it, expect } from 'vitest'
import  "reflect-metadata"
import { createEmptyRepertoire } from '../dom/repertoire.ts';
import { createMoveEvent, MoveEvent } from "../dom/moveEvent.ts";
import { AnnotatedHistory, Annotation, AnnotationType } from "../dom/history.ts";
import { DEFAULT_MAX_HISTORY, IResult, LAYER_FACTOR, loadResultSummary, PositionRecord, ResultsSummary, SCORE_FACTOR } from '../dom/testResult.ts';
import type { OptionSet } from '../dom/moveSelector.ts';

const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq";
const postE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq";
const postE4E5 = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq";
const postE4E5Nf3 = "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq";
const postE4E5Nf3Nc6 = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq";
const postE4E5Nf3Nc6Bc4 = "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq";

function createHistory(moves: string[], color: string, score: number): IResult {
    var history = new AnnotatedHistory();
    var lastMove = null;

    for (let moveIdx = 0;  moveIdx < moves.length; ++moveIdx) {
        lastMove = createMoveEvent(history.getLatestPosition().fen, moves[moveIdx]);
        history.pushMove(lastMove);
    }

    var result = new IResult(history, "player deviated", lastMove, score, color);
    return result;
}

describe('HistoryParser', () => {
    it('Gives an empty set of results for an empty history', () => {
        var resultsSummary = new ResultsSummary([])
        expect(resultsSummary.getResultsForPosition(startPosition, "w")).toEqual([])
    })
    it('Allows adding of one result for one position', () => {
        var resultsSummary = new ResultsSummary([])
        expect(resultsSummary.getResultsForPosition(startPosition, "w")).toEqual([])
       
        resultsSummary.addResult(createHistory(["e4"], "w", 1), "w")
        expect(resultsSummary.getResultsForPosition(startPosition, "w")).toEqual([1])
        expect(resultsSummary.getResultsForPosition(startPosition, "b")).toEqual([])
    })
    it('Allows adding of multiple results for one position', () => {
        var resultsSummary = new ResultsSummary([])
        resultsSummary.addResult(createHistory(["e4"], "w", 1), "w")
        resultsSummary.addResult(createHistory(["c4"], "w", -1), "w")

        expect(resultsSummary.getResultsForPosition(startPosition, "w")).toEqual([1, -1])
        expect(resultsSummary.getResultsForPosition(startPosition, "b")).toEqual([])
    })
    it('Allows adding of one result for a line', () => {
        var resultsSummary = new ResultsSummary([])
        expect(resultsSummary.getResultsForPosition(startPosition, "w")).toEqual([])
       
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], "w", -3), "b")
        // expect(resultsSummary.positionMapBlack).toEqual([])
        expect(resultsSummary.getResultsForPosition(startPosition, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(startPosition, "b")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4, "b")).toEqual([-3])
        expect(resultsSummary.getResultsForPosition(postE4E5, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5, "b")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3, "b")).toEqual([-2])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6, "b")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6Bc4, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6Bc4, "b")).toEqual([-1])
    })
    it('Allows adding of multiple results for a line', () => {
        var resultsSummary = new ResultsSummary([])
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], "w", -3), "b")
        // expect(resultsSummary.positionMapBlack).toEqual([])
        expect(resultsSummary.getResultsForPosition(startPosition, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(startPosition, "b")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4, "b")).toEqual([-3])
        expect(resultsSummary.getResultsForPosition(postE4E5, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5, "b")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3, "b")).toEqual([-2])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6, "b")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6Bc4, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6Bc4, "b")).toEqual([-1])
    })
    it('Allows adding of multiple results', () => {
        var resultsSummary = new ResultsSummary([])
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], "w", -3), "b")
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], "w", -3), "b")
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nf6"], "w", -2), "b")
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"], "w", 3), "b")

        expect(resultsSummary.getResultsForPosition(postE4, "b")).toEqual([-3, -3, -2, 3])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3, "b")).toEqual([-2, -2, -1, 2])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6Bc4, "b")).toEqual([-1, -1, 1])
    })
    it('Allows scoring of position with no results', () => {
        var record = new PositionRecord();
        expect(record.score()).toBeCloseTo(0)
    })
    it('Allows scoring of position with a successful result', () => {
        var record = new PositionRecord();
        record.pushScore(3)
        expect(record.score()).toBeCloseTo(0)
    })
    it('Allows scoring of position with many successes', () => {
        var record = new PositionRecord();
        record.pushScore(12)
        record.pushScore(7)
        record.pushScore(2)
        record.pushScore(5)
        record.pushScore(2)
        expect(record.score()).toBeCloseTo(0)
    })
    it('Allows scoring of position with one failure', () => {
        var record = new PositionRecord();
        record.pushScore(-1)
        expect(record.score()).toBeCloseTo(1)
    })
    it('Allows scoring of position with multiple failures', () => {
        var record = new PositionRecord();
        record.pushScore(-1)
        record.pushScore(-3)
        expect(record.score()).toBeCloseTo(0.5)
    })
    it('Allows scoring of position with mixed success and failures', () => {
        var record = new PositionRecord();
        record.pushScore(-2)
        record.pushScore(-2)
        record.pushScore(3)
        expect(record.score()).toBeCloseTo(1/3)
    })
    it('Allows scoring of position with mixed success and failures', () => {
        var record = new PositionRecord();
        record.pushScore(-2)
        record.pushScore(1)
        record.pushScore(-2)
        record.pushScore(3)
        expect(record.score()).toBeCloseTo(1/4)
    })
    it('Allows results to fall out of the history window', () => {
        var record = new PositionRecord(10);
        record.pushScore(-2)
        record.pushScore(1)
        record.pushScore(-2)
        record.pushScore(3)
        expect(record.score()).toBeCloseTo(1/4)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        expect(record.score()).toBeCloseTo(0)
        expect(record._testHistory.length == record.historyLength)
    })
    it('Allows retrieval of visit score', () => {
        var record = new PositionRecord(10);
        expect(record.visitScore()).toBeCloseTo(0)
        record.pushScore(-2)
        expect(record.visitScore()).toBeCloseTo(0.1)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(0.2)
        record.pushScore(-2)
        expect(record.visitScore()).toBeCloseTo(0.3)
        record.pushScore(3)
        expect(record.visitScore()).toBeCloseTo(0.4)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(0.5)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(0.6)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(0.7)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(0.8)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(0.9)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(1)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(1)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(1)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(1)
        record.pushScore(1)
        expect(record.visitScore()).toBeCloseTo(1)
    })
    it('Allows measuring support from position history with all success', () => {
        var record = new PositionRecord(10);
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        record.pushScore(1)
        expect(record.support()).toBeCloseTo(0)
    })
    it('Allows measuring support from position history with all failures', () => {
        var record = new PositionRecord(10);
        record.pushScore(-1)
        record.pushScore(-1)
        record.pushScore(-1)
        record.pushScore(-1)
        record.pushScore(-1)
        record.pushScore(-1)
        record.pushScore(-1)
        record.pushScore(-1)
        record.pushScore(-1)
        record.pushScore(-1)
        expect(record.support()).toBeCloseTo(1)
    })
    it('Allows measuring support from position history with mixed results', () => {
        var record = new PositionRecord(8);
        record.pushScore(-1)
        record.pushScore(1)
        record.pushScore(-1)
        record.pushScore(1)
        record.pushScore(-1)
        record.pushScore(1)
        record.pushScore(-1)
        record.pushScore(1)
        record.pushScore(-1)
        record.pushScore(1)
        expect(record.support()).toBeCloseTo(0.5)
    })
    it('Allows measuring support from position history', () => {
        var record = new PositionRecord(10);
        expect(record.support()).toBeCloseTo(0)
    })

    it('Allows for retrieval of probabilities for moves', () => {
        let repertoire = createEmptyRepertoire()
        repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
        repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")


        var resultsSummary = new ResultsSummary([])
        resultsSummary.addResult(createHistory(["e4", "e5"], "w", -1), "b")
        resultsSummary.addResult(createHistory(["e4", "e5"], "w", -1), "b")

        var results: OptionSet = resultsSummary.getTestOptionSet(startPosition, "b", repertoire)
        expect(results.moves.length).to.equal(2)
        expect(results.moves[0].san).to.equal("e4")
        expect(results.moves[0].probability).to.be.lessThanOrEqual(1)
        expect(results.moves[0].probability).to.be.greaterThanOrEqual(0)
        expect(results.moves[0].san).to.equal("e4")
        expect(results.moves[1].probability).toEqual(0)
    })
    it('Allows for retrieval of probabilities for moves after start', () => {
        let repertoire = createEmptyRepertoire()
        repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
        repertoire.addMoveToRepertoire(postE4, createMoveEvent(postE4, "e5"), "w")
        repertoire.addMoveToRepertoire(postE4E5, createMoveEvent(postE4E5, "Nf3"), "w")
        repertoire.addMoveToRepertoire(postE4E5Nf3, createMoveEvent(postE4E5Nf3, "Nc6"), "w")
        repertoire.addMoveToRepertoire(postE4E5Nf3Nc6, createMoveEvent(postE4E5Nf3Nc6, "Bc4"), "w")

        var resultsSummary = new ResultsSummary([])
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Be2"], "w", -3), "w")
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Be2"], "w", -3), "w")

        var results: OptionSet = resultsSummary.getTestOptionSet(postE4E5Nf3, "w", repertoire)
        expect(results.moves.length).to.equal(1)
        expect(results.moves[0].san).to.equal("Nc6")
        expect(results.moves[0].probability).to.be.lessThanOrEqual(1)
        expect(results.moves[0].probability).to.be.greaterThanOrEqual(0)

    })
    it('Allows for retrieval of probabilities for moves after start for black pieces', () => {
        let repertoire = createEmptyRepertoire()
        repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "b")
        repertoire.addMoveToRepertoire(postE4, createMoveEvent(postE4, "e5"), "b")
        repertoire.addMoveToRepertoire(postE4E5, createMoveEvent(postE4E5, "Nf3"), "b")
        repertoire.addMoveToRepertoire(postE4E5Nf3, createMoveEvent(postE4E5Nf3, "Nc6"), "b")
        repertoire.addMoveToRepertoire(postE4E5Nf3Nc6, createMoveEvent(postE4E5Nf3Nc6, "Bc4"), "b")

        var resultsSummary = new ResultsSummary([])
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nc6"], "w", -2), "b")
        resultsSummary.addResult(createHistory(["e4", "e5", "Nf3", "Nc6"], "w", -2), "b")

        var results: OptionSet = resultsSummary.getTestOptionSet(postE4E5, "b", repertoire)
        expect(results.moves.length).to.equal(1)
        expect(results.moves[0].san).to.equal("Nf3")
        expect(results.moves[0].probability).to.be.lessThanOrEqual(1)
        expect(results.moves[0].probability).to.be.greaterThanOrEqual(0)
    })
    it('Allows saving and reloading of an empty test results history', () => {
        var preSave = new ResultsSummary([])
        var encoded = preSave.exportToObject()

        var resultsSummary = loadResultSummary(encoded)
        expect(resultsSummary.getResultsForPosition(startPosition, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(startPosition, "b")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3, "w")).toEqual([])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3, "b")).toEqual([])
    })
    it('Allows saving and loading of populated history', () => {
        var preSave = new ResultsSummary([])
        preSave.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], "w", -3), "b")
        preSave.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], "w", -3), "b")
        preSave.addResult(createHistory(["e4", "e5", "Nf3", "Nf6"], "w", -2), "b")
        preSave.addResult(createHistory(["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"], "w", 3), "b")
        var encoded = preSave.exportToObject()

        var resultsSummary = loadResultSummary(encoded)
        expect(resultsSummary.getResultsForPosition(postE4, "b")).toEqual([-3, -3, -2, 3])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3, "b")).toEqual([-2, -2, -1, 2])
        expect(resultsSummary.getResultsForPosition(postE4E5Nf3Nc6Bc4, "b")).toEqual([-1, -1, 1])
    })
    it('Allows deep loading and saving of populated history', () => {
        let repertoire = createEmptyRepertoire()
        repertoire.pushLine(["e4", "a5", "Nc3", "b5", "a3", "f5", "g4"], "w")

        var preSave = new ResultsSummary([])
        // fully explore one line
        for (let idx=0; idx<DEFAULT_MAX_HISTORY; idx++) {
            preSave.addResult(createHistory(["e4", "a5", "Nc3", "b5", "a3", "f5", "g4"], "w", 4), "w")
        }

        var exported = preSave.exportToObject()
        var resultsSummary = loadResultSummary(exported)
        var completeness = resultsSummary.getCompleteness(startPosition, "w", repertoire, 1)
        expect(completeness).toBeCloseTo(1)
    })
    it('Describes a position as unexplored on an empty test history and default repertoire', () => {
        let repertoire = createEmptyRepertoire()
        var resultsSummary = new ResultsSummary([])
        var completeness = resultsSummary.getCompleteness(startPosition, "w", repertoire)
        expect(completeness).toBeCloseTo(0)
    })
    it('Describes a position as 90% complete if it is a leaf with only 90% full successes', () => {
        let repertoire = createEmptyRepertoire()
        var resultsSummary = new ResultsSummary([])

        for (let idx=0; idx<DEFAULT_MAX_HISTORY - 1; idx++) {
            resultsSummary.addResult(createHistory(["e4"], "w", 1), "w")            
        }

        var completeness = resultsSummary.getCompleteness(startPosition, "w", repertoire)
        expect(completeness).toBeCloseTo(SCORE_FACTOR + ((1 - SCORE_FACTOR) * (DEFAULT_MAX_HISTORY - 1) / DEFAULT_MAX_HISTORY))
    })
    it('Describes a position as complete if it is a leaf full successes', () => {
        let repertoire = createEmptyRepertoire()
        var resultsSummary = new ResultsSummary([])

        for (let idx=0; idx<DEFAULT_MAX_HISTORY; idx++) {
            resultsSummary.addResult(createHistory(["e4"], "w", 1), "w")            
        }

        var completeness = resultsSummary.getCompleteness(startPosition, "w", repertoire)
        expect(completeness).toBeCloseTo(1)
    })
    it('Describes a position as incomplete if it is a mixture of successes and failures', () => {
        let repertoire = createEmptyRepertoire()
        var resultsSummary = new ResultsSummary([])
        for (let idx=0; idx<DEFAULT_MAX_HISTORY; idx++) {
            // alternate success and failure
            resultsSummary.addResult(createHistory(["e4"], "w", idx % 2 == 0 ? 1 : -1), "w")
        }
        var completeness = resultsSummary.getCompleteness(startPosition, "w", repertoire)

        expect(completeness).toBeCloseTo((1 - SCORE_FACTOR) + ((SCORE_FACTOR * (Math.ceil(DEFAULT_MAX_HISTORY / 2)) / DEFAULT_MAX_HISTORY)))
    })
    it('Allows scoring of a position given a depth to search', () => {
        let repertoire = createEmptyRepertoire()
        repertoire.pushLine(["e4", "a5", "Nc3", "b5", "a3", "f5", "g4"], "w")
        repertoire.pushLine(["e4", "a5", "Nc3", "b5", "a3", "f5", "g4"], "w")
        repertoire.pushLine(["e4", "a5", "Nc3", "c5", "a3", "f5", "g4"], "w")
        repertoire.pushLine(["e4", "a5", "Nc3", "c5", "a3", "f5", "g4"], "w")

        repertoire.pushLine(["e4", "h5", "Nc3", "g5", "a3", "a5", "g4"], "w")
        repertoire.pushLine(["e4", "h5", "Nc3", "g5", "a3", "b5", "g4"], "w")
        repertoire.pushLine(["e4", "h5", "Nc3", "f5", "a3", "c5", "g4"], "w")
        repertoire.pushLine(["e4", "h5", "Nc3", "f5", "a3", "d5", "g4"], "w")

        var resultsSummary = new ResultsSummary([])

        // fully explore one line
        for (let idx=0; idx<DEFAULT_MAX_HISTORY; idx++) {
            resultsSummary.addResult(createHistory(["e4", "a5", "Nc3", "b5", "a3", "f5", "g4"], "w", 4), "w")
        }

        var completeness0 = resultsSummary.getCompleteness(startPosition, "w", repertoire, 0)
        var completeness1 = resultsSummary.getCompleteness(startPosition, "w", repertoire, 1)
        var completeness2 = resultsSummary.getCompleteness(startPosition, "w", repertoire, 2)

        expect(completeness0).toBeCloseTo(1)
        expect(completeness1).toBeLessThan(completeness0)
        expect(completeness2).toBeLessThan(completeness1)

        for (let idx=0; idx<DEFAULT_MAX_HISTORY; idx++) {
            resultsSummary.addResult(createHistory(["e4", "h5", "Nc3", "b5", "a3", "f5", "g4"], "w", 4), "w")
        }

        var completeness0a = resultsSummary.getCompleteness(startPosition, "w", repertoire, 0)
        var completeness1a = resultsSummary.getCompleteness(startPosition, "w", repertoire, 1)
        var completeness2a = resultsSummary.getCompleteness(startPosition, "w", repertoire, 2)
        expect(completeness0).toBeCloseTo(completeness0a)
        expect(completeness1a).toBeGreaterThan(completeness1)
        expect(completeness2a).toBeGreaterThan(completeness2)

        expect(completeness0).toBeLessThanOrEqual(1)
        expect(completeness0a).toBeLessThanOrEqual(1)
        expect(completeness1).toBeLessThanOrEqual(1)
        expect(completeness1a).toBeLessThanOrEqual(1)
        expect(completeness2).toBeLessThanOrEqual(1)
        expect(completeness2a).toBeLessThanOrEqual(1)
    })
    it('Allows retrieving of candidate positions for a straight line repertoire', () => {
        let repertoire = createEmptyRepertoire()
        repertoire.pushLine(["e4", "a5", "Nc3", "b5", "a3", "f5", "g4"], "w")

        var resultsSummary = new ResultsSummary([])

        var oldProbability = 0

        // fully explore one line
        for (let idx=0; idx<DEFAULT_MAX_HISTORY -1; idx++) {
            resultsSummary.addResult(createHistory(["e4", "a5", "Nc3", "b5", "a3", "f5", "g4"], "w", 4), "w")
            var candidateMoves = resultsSummary.getTestOptionSet(startPosition, "w", repertoire)
            expect(candidateMoves.moves.length).to.equal(1)
            expect(candidateMoves.moves[0].probability).toBeGreaterThan(oldProbability)
            oldProbability = candidateMoves.moves[0].probability
        }
    })
    it('Does not recommend lines that have already been explored', () => {
        let repertoire = createEmptyRepertoire()
        repertoire.pushLine(["e4", "a5", "Nc3", "b5", "a3", "f5", "g4"], "w")

        var resultsSummary = new ResultsSummary([])

        var oldProbability = 0

        // fully explore one line
        for (let idx=0; idx<DEFAULT_MAX_HISTORY; idx++) {
            resultsSummary.addResult(createHistory(["e4", "a5", "Nc3", "b5", "a3", "f5", "g4"], "w", 4), "w")
        }

        var candidateMoves = resultsSummary.getTestOptionSet(startPosition, "w", repertoire)
        expect(candidateMoves.moves.length).to.equal(1)
        expect(candidateMoves.moves[0].probability).to.equal(0)
    })

})