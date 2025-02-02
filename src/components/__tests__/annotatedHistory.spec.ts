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
  })

})


