import "reflect-metadata";

import { describe, it, expect } from 'vitest'
import { createEmptyRepertoire, loadRepertoire } from '../dom/repertoire.ts'
import { createMoveEvent } from "../dom/moveEvent.ts";
import { AnnotationType } from "../dom/history.ts";
import { Chess } from "chess.js";
import { simplifyFen } from "../dom/fenUtils.ts";

const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq"
const postE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq"
const postD4 = "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq"
const postC4 = "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq"

function positionAfter(moves: string[]) {
    let chess = new Chess()
    for (let idx=0; idx<moves.length; idx++) {
      chess.move(moves[idx])
    }
    return simplifyFen(chess.fen())
}

describe('Repertoire', () => {
  it('Creates a default repertoire with only the starting position', () => {
    let repertoire = createEmptyRepertoire()
    expect(repertoire.getPositions()).toEqual([startPosition])

    expect(repertoire.hasPlayerMove(startPosition)).false
    expect(repertoire.getPlayerMoves(startPosition)).empty

    expect(repertoire.hasOpponentMove(startPosition)).false
    expect(repertoire.getOpponentMoves(startPosition)).empty
  })
  it('Creates a default repertoire with only the starting position and can push moves', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")

    expect(repertoire.hasPlayerMove(startPosition)).true
    expect(repertoire.getPlayerMoves(startPosition).length).to.equal(1)

    expect(repertoire.getPlayerMoves(startPosition)[0].fen_after).to.equal("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq")
    expect(repertoire.getPlayerMoves(startPosition)[0].friendly_notation).to.equal("e4")
    expect(repertoire.getPlayerMoves(startPosition)[0].from).to.equal("e2")
    expect(repertoire.getPlayerMoves(startPosition)[0].to).to.equal("e4")
    expect(repertoire.getPlayerMoves(startPosition)[0].notation).to.equal("e2e4")
    expect(repertoire.getPlayerMoves(startPosition)[0].promotion).to.equal("")
    expect(repertoire.getPlayerMoves(startPosition)[0].turn).to.equal("w")


    expect(repertoire.hasOpponentMove(startPosition)).true
    expect(repertoire.getOpponentMoves(startPosition).length).to.equal(1)
    expect(repertoire.getOpponentMoves(startPosition)[0].friendly_notation).to.equal("e4")
    expect(repertoire.getOpponentMoves(startPosition)[0].from).to.equal("e2")
    expect(repertoire.getOpponentMoves(startPosition)[0].to).to.equal("e4")
    expect(repertoire.getOpponentMoves(startPosition)[0].notation).to.equal("e2e4")
    expect(repertoire.getOpponentMoves(startPosition)[0].promotion).to.equal("")
    expect(repertoire.getOpponentMoves(startPosition)[0].turn).to.equal("w")


    expect(repertoire.getPositions().length).toEqual(2)
    expect(repertoire.getPositions()).toContain(startPosition)
    expect(repertoire.getPositions()).toContain(postE4)
  })
  it('allows players to set and unset moves', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")

    expect(repertoire.hasPlayerMove(startPosition)).true
    expect(repertoire.getPlayerMoves(startPosition).length).to.equal(1)
    expect(repertoire.getPlayerMoves(startPosition)[0].friendly_notation).to.equal("e4")
    expect(repertoire.isRepertoireMove(startPosition, "e4"))

    repertoire.setMainMove(startPosition, null)
    expect(repertoire.hasPlayerMove(startPosition)).false

    expect(repertoire.hasOpponentMove(startPosition)).true
    expect(repertoire.getOpponentMoves(startPosition).length).to.equal(3)
    expect(repertoire.getOpponentMoves(startPosition)[0].friendly_notation).to.equal("e4")

    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "g3"), "w")

    expect(repertoire.hasPlayerMove(startPosition))
    expect(repertoire.getPlayerMoves(startPosition).length).to.equal(1)
    expect(repertoire.getPlayerMoves(startPosition)[0].friendly_notation).to.equal("g3")
    expect(repertoire.isRepertoireMove(startPosition, "g3"))
    expect(repertoire.isRepertoireMove(startPosition, "e4")).false
  })
  it('allows players to set and delete moves', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")

    expect(repertoire.hasPlayerMove(startPosition)).true
    expect(repertoire.getPlayerMoves(startPosition).length).to.equal(1)
    repertoire.deleteMove(startPosition, "e4")

    expect(repertoire.hasPlayerMove(startPosition)).false
    expect(repertoire.getPlayerMoves(startPosition).length).to.equal(0)
  })
  it('allows players to push duplicates', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")

    expect(repertoire.hasPlayerMove(startPosition)).true
    expect(repertoire.getPlayerMoves(startPosition).length).to.equal(1)
    expect(repertoire.getOpponentMoves(startPosition).length).to.equal(1)
    repertoire.deleteMove(startPosition, "e4")

    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "b")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "b")
    expect(repertoire.getPlayerMoves(startPosition).length).to.equal(0)
    expect(repertoire.getOpponentMoves(startPosition).length).to.equal(1)

    expect(repertoire.hasPlayerMove(startPosition)).false
    expect(repertoire.getPlayerMoves(startPosition).length).to.equal(0)
  })
  it('Allows pushing of a line', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.pushLine(["e4", "e5", "Nf3", "Nc6"], "b")

    expect(repertoire.getPlayerMoves(startPosition).length).to.equal(0)
    expect(repertoire.getOpponentMoves(startPosition).length).to.equal(1)

    expect(repertoire.getPlayerMoves(postE4).length).to.equal(1)
    expect(repertoire.getOpponentMoves(postE4).length).to.equal(1)
  })
  it('allows testing of player an opponent move', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")

    expect(repertoire.isOpponentMove(startPosition, "e4"))
    expect(repertoire.isRepertoireMove(startPosition, "e4"))

    repertoire.deleteMove(startPosition, "e4")

    expect(repertoire.isOpponentMove(startPosition, "e4")).false
    expect(repertoire.isRepertoireMove(startPosition, "e4")).false
  })
  it('allows assigning as alternative move', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")

    expect(repertoire.isRepertoireMove(startPosition, "e4")).true
    expect(repertoire.isRepertoireMove(startPosition, "c4")).false
    repertoire.addAlternative(startPosition, "c4")
    expect(repertoire.isRepertoireMove(startPosition, "e4")).true
    expect(repertoire.isRepertoireMove(startPosition, "c4")).true

    expect(repertoire.isRepertoireMove(startPosition, "c4")).true
    expect(repertoire.isMainMove(startPosition, "e4")).true
    expect(repertoire.isMainMove(startPosition, "c4")).false
  })  
  it('Allows deletion of alternative', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")

    expect(repertoire.isRepertoireMove(startPosition, "e4")).true
    expect(repertoire.isRepertoireMove(startPosition, "c4")).false
    repertoire.deleteMove(startPosition, "c4")

    expect(repertoire.isRepertoireMove(startPosition, "e4")).true
    expect(repertoire.isRepertoireMove(startPosition, "c4")).false

    expect(repertoire.isMainMove(startPosition, "e4")).true
    expect(repertoire.isMainMove(startPosition, "c4")).false
  })
  it('Allows deletion of main move when alternative present', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")
    repertoire.addAlternative(startPosition, "c4")
    repertoire.deleteMove(startPosition, "e4")

    expect(repertoire.isRepertoireMove(startPosition, "e4")).false
    expect(repertoire.isRepertoireMove(startPosition, "c4")).true
    expect(repertoire.isMainMove(startPosition, "e4")).false
    expect(repertoire.isMainMove(startPosition, "c4")).true
  })
  it('Allows removal of an alternative move', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")
    repertoire.addAlternative(startPosition, "c4")

    expect(repertoire.isRepertoireMove(startPosition, "c4")).true
    expect(repertoire.isMainMove(startPosition, "e4")).true

    repertoire.removeAlternative(startPosition, "c4")
    
    expect(repertoire.isRepertoireMove(startPosition, "c4")).false
    expect(repertoire.isOpponentMove(startPosition, "c4")).true
  })
  it('Setting alternative when there is no main move makes it main move', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "b")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "b")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "b")

    repertoire.addAlternative(startPosition, "c4")
    expect(repertoire.isRepertoireMove(startPosition, "c4")).true
    expect(repertoire.isMainMove(startPosition, "c4")).true
  })
  it('Unsetting main move leaves another move as alternative', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")

    repertoire.addAlternative(startPosition, "c4")

    repertoire.setMainMove(startPosition, null)
    repertoire.setMainMove(startPosition, "e4")
    repertoire.setMainMove(startPosition, null)

    expect(repertoire.isRepertoireMove(startPosition, "e4")).true
  })
  it('allows evaluation of a move', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(postE4, createMoveEvent(postE4, "e5"), "w")

    expect(repertoire.evaluate(startPosition, "e4", "w")).to.equal(AnnotationType.RepertoireMatch)
    expect(repertoire.evaluate(startPosition, "c4", "w")).to.equal(AnnotationType.BreaksRepertoire)
    expect(repertoire.evaluate("noposition, w", "c4", "w")).to.equal(AnnotationType.NotFound)

    expect(repertoire.evaluate(startPosition, "e4", "b")).to.equal(AnnotationType.RepertoireOpponentMove)
    expect(repertoire.evaluate(startPosition, "c4", "b")).to.equal(AnnotationType.BreaksOpponentRepertoire)
    expect(repertoire.evaluate("noposition, w", "c4", "b")).to.equal(AnnotationType.NotFound)

    expect(repertoire.evaluate(postE4, "e5", "w")).to.equal(AnnotationType.RepertoireOpponentMove)
    expect(repertoire.evaluate(postE4, "d5", "w")).to.equal(AnnotationType.BreaksOpponentRepertoire)
  })
  it('allows evaluation of a move with alternatives', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    repertoire.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")

    repertoire.addAlternative(startPosition, "c4")
    expect(repertoire.evaluate(startPosition, "c4", "w")).to.equal(AnnotationType.RepertoireAlternative)
    expect(repertoire.evaluate(startPosition, "c4", "b")).to.equal(AnnotationType.RepertoireOpponentMove)
  })
  it('saving and opening of an empty repertoire', () => {
    let repertoire = createEmptyRepertoire()
    let exported = repertoire.exportToObject()

    let imported = loadRepertoire(exported)
    expect(imported.getPositions().length).to.equal(1)
  })
  it('Allows retrieval of child positions for an empty repertoire', () => {
    let repertoire = createEmptyRepertoire()
    expect(repertoire.getChildPositions(startPosition, "w")).toEqual({0: [startPosition]})
    expect(repertoire.getChildPositions(startPosition, "b")).toEqual({})
  })
  it('Allows retrieval of child positions for a simple repertoire (white)', () => {
    let repertoire = createEmptyRepertoire()

    repertoire.pushLine(["e4", "Nf6", "d4", "Nc6"], "w")
    expect(repertoire.getChildPositions(startPosition, "w")).toEqual({0: [startPosition], 1: [positionAfter(["e4", "Nf6"])]})
    expect(repertoire.getChildPositions(positionAfter(["e4", "Nf6"]), "w")).toEqual({0: [positionAfter(["e4", "Nf6"])], 1: [positionAfter(["e4", "Nf6", "d4", "Nc6"])]})
  })
  it('Allows retrieval of child positions for a simple repertoire (black)', () => {
    let repertoire = createEmptyRepertoire()

    repertoire.pushLine(["e4", "Nf6", "d4", "Nc6"], "b")
    expect(repertoire.getChildPositions(positionAfter(["e4"]), "b")).toEqual({0: [positionAfter(["e4"])], 1: [positionAfter(["e4", "Nf6", "d4"])]})
  })
  it('Allows retrieval of child positions for a non matching color', () => {
    let repertoire = createEmptyRepertoire()

    repertoire.pushLine(["e4", "Nf6", "d4", "Nc6"], "w")
    // Check position where black to move a white
    expect(repertoire.getChildPositions(positionAfter(["e4"]), "w")).toEqual({0: [positionAfter(["e4", "Nf6"])], 1: [positionAfter(["e4", "Nf6", "d4", "Nc6"])]})
  })
  it('Allows retrieval of child positions for a repertoire with branches', () => {
    let repertoire = createEmptyRepertoire()

    repertoire.pushLine(["e4", "Nf6"], "w")
    repertoire.pushLine(["e4", "Nc6"], "w")
    repertoire.pushLine(["c4"], "b")

    expect(repertoire.getChildPositions(startPosition, "w")[0].sort()).toEqual([startPosition])
    expect(repertoire.getChildPositions(startPosition, "w")[1].sort()).toEqual([positionAfter(["e4", "Nf6"]), positionAfter(["e4", "Nc6"])].sort())
  })
  it('Allows retrieval of child positions for a repertoire with alternatives', () => {
    let repertoire = createEmptyRepertoire()

    repertoire.pushLine(["e4", "Nf6"], "w")
    repertoire.pushLine(["d4", "Nc6"], "w")

    repertoire.addAlternative(startPosition, "d4")

    expect(repertoire.getChildPositions(startPosition, "w")[0].sort()).toEqual([startPosition])
    expect(repertoire.getChildPositions(startPosition, "w")[1].sort()).toEqual([positionAfter(["e4", "Nf6"]), positionAfter(["d4", "Nc6"])].sort())
    expect(repertoire.getChildPositions(startPosition, "w")[2]).toBeUndefined()

  })
  it('Allows retrieval of nested child positions for a repertoire for a given depth', () => {
    let repertoire = createEmptyRepertoire()
    repertoire.pushLine(["e4", "Nc6", "Nc3", "d5", "a3", "f5", "g4", "g5", "h4", "h5"], "w")
    repertoire.pushLine(["e4", "Nc6", "Nc3", "d5", "a3", "f5", "g4", "g5", "a4", "a5"], "w")
    repertoire.pushLine(["e4", "Nc6", "Nc3", "d5", "a3", "f5", "g4", "g5", "b4", "b5"], "w")

    const childPositions = repertoire.getChildPositions(postE4, "w", 2)
    expect(childPositions[0].sort()).toEqual([
      positionAfter(["e4", "Nc6"]),
    ].sort())
    expect(childPositions[1].sort()).toEqual([
      positionAfter(["e4", "Nc6", "Nc3", "d5"])
    ].sort())
    expect(childPositions[2].sort()).toEqual([
      positionAfter(["e4", "Nc6", "Nc3", "d5", "a3", "f5"])
    ].sort())
  })
})


