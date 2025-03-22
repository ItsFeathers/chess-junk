import { describe, it, expect } from 'vitest'
import { MoveSelector, OptionSet, ProbabilisticMove } from '../dom/moveSelector'
import { beforeEach } from 'node:test'

const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq"
const postE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq"

const e450Percent = new ProbabilisticMove("e4", 0.5)
const e4100Percent = new ProbabilisticMove("e4", 1)
const d450Percent = new ProbabilisticMove("d4", 0.5)
const e4d4OptionSet = new OptionSet(startPosition, 1, [e450Percent, d450Percent])

var currentRandomIdx = 0;
var currentRandomArray: number[] = [];
const originalRandom = Math.random;

function setMockRandomQueue(answers: number[]) {
    currentRandomIdx = 0
    currentRandomArray = answers
    Math.random = mockedRandom
}

function resetMockRandom() {
    Math.random = originalRandom
}

function mockedRandom(): number {
    var retVal = currentRandomArray[currentRandomIdx];
    currentRandomIdx += 1;
    return retVal;
}

describe('Random mock', () => {
    beforeEach(() => {
        resetMockRandom()
    })
    it('Returns a single random number', () => {
        setMockRandomQueue([0.33])
        expect(Math.random()).toBeCloseTo(0.33)
    })
    it('Returns a multiple random numbers', () => {
        setMockRandomQueue([0.70, 0.22, 0.12, 0.55, 0.002, 1.0])
        expect(Math.random()).toBeCloseTo(0.70)
        expect(Math.random()).toBeCloseTo(0.22)
        expect(Math.random()).toBeCloseTo(0.12)
        expect(Math.random()).toBeCloseTo(0.55)
        expect(Math.random()).toBeCloseTo(0.002)
        expect(Math.random()).toBeCloseTo(1.0)
    })
    it('allows the RNG to be reset', () => {
        resetMockRandom()
        currentRandomIdx = 1000
        expect(Math.random()).to.be.lessThan(1.0)
        expect(Math.random()).to.be.greaterThan(0)
    })
})

describe('OptionSet', () => {
    it('returns an empty list of weighted probabilities if there are no moves', () => {
        var optionSet = new OptionSet(startPosition, 1, [])
        expect(optionSet.getSupportedMoves()).toEqual([])
    })
    it('returns an empty list of weighted probabilities for one move', () => {
        var optionSet = new OptionSet(startPosition, 12, [e4100Percent])
        expect(optionSet.getSupportedMoves()).toEqual([["e4", 12]])
    })
    it('returns an empty list of weighted probabilities for two moves', () => {
        var optionSet = new OptionSet(startPosition, 100, [
            new ProbabilisticMove("e4", 0.2),
            new ProbabilisticMove("d4", 0.8)
        ])
        expect(optionSet.getSupportedMoves()).toEqual([["e4", 20], ["d4", 80]])
    })
    it('returns an empty list of weighted probabilities for incomplete total support', () => {
        var optionSet = new OptionSet(startPosition, 100, [
            new ProbabilisticMove("e4", 0.2),
            new ProbabilisticMove("d4", 0.2)
        ])
        expect(optionSet.getSupportedMoves()).toEqual([["e4", 50], ["d4", 50]])
    })
    it('Allows filtered generation of support', () => {
        var optionSet = new OptionSet(startPosition, 24, [
            new ProbabilisticMove("e4", 0.2),
            new ProbabilisticMove("d4", 0.2)
        ])
        expect(optionSet.getSupportedMoves(["e4"])).toEqual([["e4", 12]])
    })
    it('Handles situations where all options are 0 probability', () => {
        var optionSet = new OptionSet(startPosition, 24, [
            new ProbabilisticMove("e4", 0),
            new ProbabilisticMove("d4", 0)
        ])
        expect(optionSet.getSupportedMoves(["e4", "d4"])).toEqual([])
    })
})

describe('MoveSelector', () => {
    beforeEach(() => {
        resetMockRandom()
    })
    it('Reports as not ready if there is no repertoire data', () => {
        let ms = new MoveSelector()
        expect(ms.isReady(startPosition)).to.be.false
    })
    it('Reports as not ready if there is repertoire data', () => {
        let ms = new MoveSelector()
        ms.pushOptions("repertoire", e4d4OptionSet)
        expect(ms.isReady(startPosition)).to.be.true
    })
    it('Guards against old repertoire data', () => {
        let ms = new MoveSelector()
        ms.pushOptions("repertoire", e4d4OptionSet)
        expect(ms.isReady(postE4)).to.be.false
    })
    it('Waits for lichess options if needed', () => {
        let ms = new MoveSelector(["repertoire", "lichess"])
        ms.pushOptions("repertoire", e4d4OptionSet)
        expect(ms.isReady(startPosition)).to.be.false
        ms.pushOptions("lichess", e4d4OptionSet)
        expect(ms.isReady(startPosition)).to.be.true
    })
    it('Waits for multiple options if needed', () => {
        let ms = new MoveSelector(["repertoire", "lichess", "engine"])
        ms.pushOptions("repertoire", e4d4OptionSet)
        expect(ms.isReady(startPosition)).to.be.false
        ms.pushOptions("lichess", e4d4OptionSet)
        expect(ms.isReady(startPosition)).to.be.false
        ms.pushOptions("engine", e4d4OptionSet)
        expect(ms.isReady(startPosition)).to.be.true
    })
    it('returns none if there are no moves from any valid sources', () => {
        let ms = new MoveSelector(["repertoire", "lichess"])
        ms.pushOptions("repertoire", new OptionSet("startPosition", 10, []))
        ms.pushOptions("lichess", new OptionSet("startPosition", 30, []))
        
        expect(ms.getMove(startPosition)).to.equal(null)
    })
    it('Selects a move based on probabilities repertoire/lichess', () => {
        setMockRandomQueue([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
        let ms = new MoveSelector(["repertoire", "lichess"])
        ms.pushOptions("repertoire", new OptionSet("startPosition", 40, [e450Percent, d450Percent]))
        ms.pushOptions("lichess", new OptionSet("startPosition", 60, [e450Percent, d450Percent]))
        
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("d4")
        expect(ms.getMove(startPosition)).to.equal("d4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("d4")
        expect(ms.getMove(startPosition)).to.equal("d4")
        expect(ms.getMove(startPosition)).to.equal("d4")
    })
    it('Allows forcing of moves from repertoire', () => {
        setMockRandomQueue([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
        let ms = new MoveSelector(["repertoire", "lichess"])
        ms.setPrioritySource("repertoire")
        ms.pushOptions("repertoire", new OptionSet("startPosition", 40, [e4100Percent]))
        ms.pushOptions("lichess", new OptionSet("startPosition", 60, [e450Percent, d450Percent]))
        
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
        expect(ms.getMove(startPosition)).to.equal("e4")
    })

})
