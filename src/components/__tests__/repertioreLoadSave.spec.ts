import "reflect-metadata";

import { describe, it, expect } from 'vitest'
import { createEmptyRepertoire, loadRepertoire } from '../dom/repertoire.ts'
import { createMoveEvent } from "../dom/moveEvent.ts";
import { AnnotationType } from "../dom/history.ts";

const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq"
const postE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq"

describe('Repertoire Load/Save', () => {
  it('Allows loading and saving of default repertoire with one move', () => {
    let setup = createEmptyRepertoire()
    setup.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    let exported = setup.exportToObject()
    let imported = loadRepertoire(exported)


    expect(imported.hasPlayerMove(startPosition)).true
    expect(imported.getPlayerMoves(startPosition).length).to.equal(1)

    expect(imported.getPlayerMoves(startPosition)[0].fen_after).to.equal("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq")
    expect(imported.getPlayerMoves(startPosition)[0].friendly_notation).to.equal("e4")
    expect(imported.getPlayerMoves(startPosition)[0].from).to.equal("e2")
    expect(imported.getPlayerMoves(startPosition)[0].to).to.equal("e4")
    expect(imported.getPlayerMoves(startPosition)[0].notation).to.equal("e2e4")
    expect(imported.getPlayerMoves(startPosition)[0].promotion).to.equal("")
    expect(imported.getPlayerMoves(startPosition)[0].turn).to.equal("w")


    expect(imported.hasOpponentMove(startPosition)).true
    expect(imported.getOpponentMoves(startPosition).length).to.equal(1)
    expect(imported.getOpponentMoves(startPosition)[0].friendly_notation).to.equal("e4")
    expect(imported.getOpponentMoves(startPosition)[0].from).to.equal("e2")
    expect(imported.getOpponentMoves(startPosition)[0].to).to.equal("e4")
    expect(imported.getOpponentMoves(startPosition)[0].notation).to.equal("e2e4")
    expect(imported.getOpponentMoves(startPosition)[0].promotion).to.equal("")
    expect(imported.getOpponentMoves(startPosition)[0].turn).to.equal("w")


    expect(imported.getPositions().length).toEqual(2)
    expect(imported.getPositions()).toContain(startPosition)
    expect(imported.getPositions()).toContain(postE4)
  })
  it('allows saving and loading of main moves', () => {
    let setup = createEmptyRepertoire()
    setup.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    setup.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    setup.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")
    setup.setMainMove(startPosition, null)
    setup.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "g3"), "w")

    let exported = setup.exportToObject()
    let imported = loadRepertoire(exported)

    expect(imported.hasPlayerMove(startPosition))
    expect(imported.getPlayerMoves(startPosition).length).to.equal(1)
    expect(imported.getPlayerMoves(startPosition)[0].friendly_notation).to.equal("g3")
    expect(imported.isRepertoireMove(startPosition, "g3"))
    expect(imported.isRepertoireMove(startPosition, "e4")).false
  })
  it('allows assigning as alternative move', () => {
    let setup = createEmptyRepertoire()
    setup.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "e4"), "w")
    setup.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "d4"), "w")
    setup.addMoveToRepertoire(startPosition, createMoveEvent(startPosition, "c4"), "w")
    setup.addAlternative(startPosition, "c4")

    let exported = setup.exportToObject()
    let imported = loadRepertoire(exported)    

    expect(imported.isRepertoireMove(startPosition, "e4")).true
    expect(imported.isRepertoireMove(startPosition, "c4")).true

    expect(imported.isRepertoireMove(startPosition, "c4")).true
    expect(imported.isMainMove(startPosition, "e4")).true
    expect(imported.isMainMove(startPosition, "c4")).false
  })
})


