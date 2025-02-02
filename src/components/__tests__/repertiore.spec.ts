import "reflect-metadata";

import { describe, it, expect } from 'vitest'
import { Repertoire, createEmptyRepertoire } from '../dom/repertoire.ts'
import { createMoveEvent } from "../dom/moveEvent.ts";

const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq"
const postE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq"

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

})


