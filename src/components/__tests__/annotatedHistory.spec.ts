import "reflect-metadata";

import { describe, it, expect } from 'vitest'
import { Repertoire, createEmptyRepertoire } from '../dom/repertoire.ts'
import { createMoveEvent } from "../dom/moveEvent.ts";
import { AnnotatedHistory, Annotation, AnnotationType } from "../dom/history.ts";

const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq"
const postE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq"
const postE4E5 = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq"
const postE4E5Nf3Nc6 = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq"
describe('AnnotatedHistory', () => {
  it('Creates a blank history with just a starting position', () => {
    let history = new AnnotatedHistory()
    expect(history.startPosition()).to.equal(startPosition)
  })
  it('Creates a history entry without annotation', () => {
    let history = new AnnotatedHistory()
    history.pushMove(createMoveEvent(startPosition, "e4"))
    expect(history.positionAfter(0, "w").fen).to.equal(postE4)
    let shapes = history.getAnnotations(0, "s")
    expect(shapes.length).to.equal(1)
    expect(shapes[0].from).to.equal("e2")
    expect(shapes[0].to).to.equal("e4")
  })
  it('Allows latestPositionToBeRetrieved', () => {
    let history = new AnnotatedHistory()
    history.pushMove(createMoveEvent(startPosition, "e4"))
    
    expect(history.getLatestPosition().fen).to.equal(postE4)
  })
  it('Allows annotation to be added to a move and retrieved', () => {
    let history = new AnnotatedHistory()
    history.pushMove(createMoveEvent(startPosition, "e4"))
    history.pushAnnotatedMove(createMoveEvent(history.getLatestPosition().fen, "e5"), [new Annotation(AnnotationType.EngineBlunder, "e7", "e5")])

    let currentPosition = history.getLatestPosition()
    expect(currentPosition.fen).to.equal(postE4E5)
    expect(currentPosition.annotations[0].type).to.equal(AnnotationType.EngineBlunder)
    expect(currentPosition.annotations[0].from).to.equal("e7")
    expect(currentPosition.annotations[0].to).to.equal("e5")
  })
  it('Allows a position index to be looked up', () => {
    let history = new AnnotatedHistory()
    expect(history.getPositionIndex(0, "b")).to.equal(1)
    expect(history.getPositionIndex(0, "w")).to.equal(0)
    expect(history.getPositionIndex(1, "w")).to.equal(2)
    expect(history.getPositionIndex(1, "b")).to.equal(3)
  })
  it('Allows a position to be overwritten', () => {
    let history = new AnnotatedHistory()
    history.pushMove(createMoveEvent(startPosition, "e4"))
    history.pushAnnotatedMove(createMoveEvent(history.getLatestPosition().fen, "e5"), [new Annotation(AnnotationType.EngineBlunder, "e7", "e5")])
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nf3"))
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nc6"))

    let currentPosition = history.getLatestPosition() 
    expect(currentPosition.fen).to.equal(postE4E5Nf3Nc6)

    history.pushAnnotatedMove(createMoveEvent(history.positionAt(0, "b").fen, "c5"), [], history.getPositionIndex(0, "b"))
    let newCurrentPosition = history.getLatestPosition() 
    expect(newCurrentPosition.fen).to.equal("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq")

    expect(history.positionAt(0, "b").annotations.length).to.equal(1)
    expect(history.positionAt(0, "b").annotations[0].type).to.equal(AnnotationType.Played)
    expect(history.positionAt(0, "b").annotations[0].from).to.equal("c7")
    expect(history.positionAt(0, "b").annotations[0].to).to.equal("c5")
  })

  it('Does not overwrite if repushed position is the same', () => {
    let history = new AnnotatedHistory()
    history.pushMove(createMoveEvent(startPosition, "e4"))
    history.pushAnnotatedMove(createMoveEvent(history.getLatestPosition().fen, "e5"), [new Annotation(AnnotationType.EngineBlunder, "e7", "e5")])
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nf3"))
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nc6"))

    let currentPosition = history.getLatestPosition() 
    expect(currentPosition.fen).to.equal(postE4E5Nf3Nc6)

    history.pushAnnotatedMove(createMoveEvent(history.positionAt(0, "b").fen, "e5"), [], history.getPositionIndex(0, "b"))
    let newCurrentPosition = history.getLatestPosition() 
    expect(newCurrentPosition.fen).to.equal(postE4E5Nf3Nc6)

    expect(history.positionAt(0, "b").annotations.length).to.equal(1)
    expect(history.positionAt(0, "b").annotations[0].type).to.equal(AnnotationType.Played)
    expect(history.positionAt(0, "b").annotations[0].from).to.equal("e7")
    expect(history.positionAt(0, "b").annotations[0].to).to.equal("e5")
  })

  it('Should be able to clear the history', () => {
    let history = new AnnotatedHistory()
    history.pushMove(createMoveEvent(startPosition, "e4"))
    history.pushAnnotatedMove(createMoveEvent(history.getLatestPosition().fen, "e5"), [new Annotation(AnnotationType.EngineBlunder, "e7", "e5")])
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nf3"))
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nc6"))
    history.clear()
    expect(history.getLatestPosition().fen).to.equal(startPosition)
    expect(history.getLatestPosition().annotations.length).to.equal(0)
  })
  it('Allows moves to be pushed to the end by index', () => {
    let history = new AnnotatedHistory()
    history.pushMove(createMoveEvent(startPosition, "e4"), history.length())
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "e5"), history.length())
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nf3"), history.length())
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nc6"), history.length())
  })
  it('Allows getting of player to move', () => {
    let history = new AnnotatedHistory()
    expect(history.playerToMove()).to.equal("white")
    history.pushMove(createMoveEvent(startPosition, "e4"), history.length())
    expect(history.playerToMove()).to.equal("black")
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "e5"), history.length())
    expect(history.playerToMove()).to.equal("white")
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nf3"), history.length())
    expect(history.playerToMove()).to.equal("black")
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nc6"), history.length())
    expect(history.playerToMove()).to.equal("white")

    expect(history.playerToMoveAt(0)).to.equal("white")
    expect(history.playerToMoveAt(1)).to.equal("black")
    expect(history.playerToMoveAt(2)).to.equal("white")
    expect(history.playerToMoveAt(3)).to.equal("black")
    expect(history.playerToMoveAt(4)).to.equal("white")
  })
  it('Allows getting latestPosition index', () => {
    let history = new AnnotatedHistory()
    expect(history.getLatestPositionIdx()).to.equal(0)
    history.pushMove(createMoveEvent(startPosition, "e4"), history.length())
    expect(history.getLatestPositionIdx()).to.equal(1)
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "e5"), history.length())
    expect(history.getLatestPositionIdx()).to.equal(2)
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nf3"), history.length())
    expect(history.getLatestPositionIdx()).to.equal(3)
    history.pushMove(createMoveEvent(history.getLatestPosition().fen, "Nc6"), history.length())
    expect(history.getLatestPositionIdx()).to.equal(4)
  })
})


