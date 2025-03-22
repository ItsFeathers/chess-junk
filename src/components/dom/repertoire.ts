import { Type, plainToInstance, instanceToPlain } from 'class-transformer';
import { AnnotationType } from './history';
import { createMoveEvent } from './moveEvent';
import { simplifyFen } from './fenUtils';
import { mergeMaps } from './utils';

const START_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq"

class MoveEvent {
    color: string = "";
    piece: string = "";
    from: string = "";
    to: string = "";
    san: string = "";
    flags: string = "";
    lan: string = "";
    before: string = "";
    after: string = "";
};

export class Option {
    from: string = "";
    to: string = "";
    promotion: string = "";
    notation: string = "";
    fen_after: string = "";
    friendly_notation: string = "";
    turn: string = "";
}

export class Position{
    selection: Option | null = null;
    alternative_selections: Option[] = []

    @Type(() => Option)
    options: Option[] = [];
    notes: string = "";
    constructor() {
    }

    getShapes(fen: string) {
        
    }

}

export class PositionMap {
    constructor(jsonRepertoire: Object) {
        new Map(Object.entries(jsonRepertoire)).forEach(this.savePosition.bind(this))
    }

    exportToObject() {
        return instanceToPlain(this.positions)
    }

    savePosition(position: any, key: string, _map: any) {
        this.positions.set(key, plainToInstance(Position, position));
    }

    exportPosition(position: any, key: string, _map: any) {
        return instanceToPlain(position)
    }

    positions: Map<string, Position> = new Map<string, Position>();
}

class Repertoire {
    @Type(() => PositionMap)
    positions: PositionMap;

    constructor(data: any) {
        this.positions = new PositionMap(data)
        this.fixUp()
    }

    getPositions() {
        return Array.from(this.positions.positions.keys())
    }

    containsPosition(fen: string) {
        return  !!this.positions.positions.get(fen)
    }

    exportToObject() {
        return this.positions.exportToObject()
    }

    addMoveToRepertoire(friendlyFenBefore: string, moveEvent: MoveEvent, playerFor: string) {
        const position = this.getPosition(friendlyFenBefore)
        if(!this.isOpponentMove(friendlyFenBefore, moveEvent.san)) {
          const newOption = plainToInstance(Option, {
            from: moveEvent.from,
            to: moveEvent.to,
            promotion: '',
            notation: moveEvent.lan,
            fen_after: toFriendlyNotation(moveEvent.after),
            friendly_notation: moveEvent.san,
            turn: moveEvent.color,
          })
          position?.options.push(newOption)
        }

        if (!this.hasPlayerMove(friendlyFenBefore) && playerFor.startsWith(moveEvent.color)) {
            this.setMainMove(friendlyFenBefore, moveEvent.san)
        }

        const positionAfter = this.getPosition(toFriendlyNotation(moveEvent.after))
        if (!positionAfter) {
            this.addNewPosition(toFriendlyNotation(moveEvent.after))
        }
    }

    pushLine(lineSan: string[], player: string) {
        var currentPosition = START_POSITION
        for (let idx=0; idx<lineSan.length; idx++) {
            var moveEvent = createMoveEvent(currentPosition, lineSan[idx])
            this.addMoveToRepertoire(currentPosition, moveEvent, player)
            currentPosition = simplifyFen(moveEvent.after)
        }
    }

    getPosition(fen: string): Position | undefined {
        return this.positions.positions.get(toFriendlyNotation(fen))
    }

    addNewPosition(fen: string) {
        this.positions.positions.set(fen, plainToInstance(Position, {options: [], selection: null})) 
    }

    getPlayerMoves(fen: string): Option[] {
        const position = this.getPosition(fen)
        if (!position) {
            return []
        }
        return position.alternative_selections
    }

    addAlternative(fen: string, san: string) {
        if (this.isRepertoireMove(fen, san)) {
            return
        }
        let matches = this.getOpponentMoves(fen).filter((option) => option.friendly_notation == san)
        let position = this.getPosition(fen)
        if (position) {
            position.alternative_selections = position.alternative_selections.concat(matches)
            if(!this.hasMainMove(fen, san) && matches.length > 0) {
                position.selection = matches[0]
            }
        }
    }
    hasMainMove(fen: string, san: string): boolean {
        return this.getMainMove(fen) != null
    }

    removeAlternative(fen: string, san: string) {
        let position = this.getPosition(fen)
        if (position) {
            position.alternative_selections = this.getAlternatives(fen)?.filter((option) => option.friendly_notation != san)
        }
        if (this.isMainMove(fen, san)) {
            this.setMainMove(fen, null)
        }
    }
    getAlternatives(fen: string) {
        let position = this.getPosition(fen)
        if (position) {
            return position.alternative_selections
        } else {
            return []
        }
    }

    getMainMove(fen: string): Option | null {
        let position = this.getPosition(fen)
        if (!position) {
            return null;
        }
        return position.selection
    }

    isMainMove(fen: string, san: string): boolean {
        let mainMove = this.getMainMove(fen);
        return mainMove?.friendly_notation == san        
    }

    hasPlayerMove(fen: string): boolean {
        return this.getPlayerMoves(fen).length != 0
    }

    getOpponentMoves(fen: string): Option[] {
        const position = this.getPosition(fen)
        if (!position) {
            return []
        }
        return position.options
    }

    hasOpponentMove(fen: string) {
        return this.getOpponentMoves(fen).length != 0
    }

    isRepertoireMove(position: string, san: string) {
        let moves = this.getPlayerMoves(position);
        let matches = moves.filter((option) => option.friendly_notation == san)
        return matches && matches.length > 0
    }

    isOpponentMove(position: string, san: string) {
        let matches = this.getOpponentMoves(position)?.filter((option) => option.friendly_notation == san)
        return matches && matches.length > 0
    }

    setMainMove(fen: string, san: string | null) {
        const position = this.getPosition(fen)
        if (!position) {
            return;
        }
        if (!san) {
            this.unsetMainMove(fen)
            return;
        }

        // Determine if we have only a single main move, or something else
        let hasMultipleOptions = this.getPlayerMoves(fen).length > 1
        position.selection = position.options.filter((option) => option.friendly_notation == san)[0];

        if (!hasMultipleOptions) {
            position.alternative_selections = [position.selection]
        }
    }

    unsetMainMove(fen: string) {
        const position = this.getPosition(fen)
        if (!position) {
            return;
        }

        let oldMainMove = this.getMainMove(fen)
        if (!oldMainMove) {
            return
        } 

        // unset main move
        position.selection = null
        let alternatives = this.getAlternatives(fen);
        let otherAlternatives = alternatives.filter((option) => option.friendly_notation != oldMainMove.friendly_notation);
        if (otherAlternatives.length == 0) {
            position.alternative_selections = []
        } else {
            position.selection = otherAlternatives[0]
        }
    }

    deleteMove(fen: string, san: string) {
        const position = this.getPosition(fen)

        if (!position) {
            return;
        }

        position.options = position.options.filter(
            (option) => option.friendly_notation != san
        );

        position.alternative_selections = position.alternative_selections.filter(
            (option) => option.friendly_notation != san
        );

        if (position.selection && position.selection.friendly_notation == san) {
            position.selection = null
            if (position.alternative_selections.length > 0) {
                position.selection = position.alternative_selections[0]
            }
        }
    }

    evaluate(fen: string, san: string, color:string): AnnotationType {
        
        let position = this.getPosition(fen)
        if (!position) {
            return AnnotationType.NotFound
        }

        if(!color.startsWith(this.getPlayerToMove(fen)) ) {
            if (this.isOpponentMove(fen, san)) {
                return AnnotationType.RepertoireOpponentMove
            } else {
                return AnnotationType.BreaksOpponentRepertoire
            }
        } else {
            if (!this.hasPlayerMove(fen)) {
                return AnnotationType.NotFound
            }
            if (this.isMainMove(fen, san)) {
                return AnnotationType.RepertoireMatch
            }

            if (this.isRepertoireMove(fen, san)) {
                return AnnotationType.RepertoireAlternative
            }
            return AnnotationType.BreaksRepertoire
        }
    }

    getChildPositions(fen: string, color: string, depth=1, depthSoFar=0): Record<number, string[]> {
        var response : Record<number, string[]> = {}

        if (color.startsWith(this.getPlayerToMove(fen))) {
            response[depthSoFar] = [fen]
            depthSoFar += 1
        }

        var merged: Record<number, string[]> = {}
        if (depthSoFar <= depth) {
            var searchSpace = []

            if (color.startsWith(this.getPlayerToMove(fen))) {
                searchSpace = this.getPlayerMoves(fen)
            } else {
                searchSpace = this.getOpponentMoves(fen)
            }
            var responses = searchSpace.map((x) => this.getChildPositions(simplifyFen(x.fen_after), color, depth, depthSoFar))
            merged = mergeMaps(responses)
        }

        merged = mergeMaps([response, merged])

        return merged
    }

    getPlayerToMove(fen: string) {
        var elements = fen.split(" ");
        return elements[1].trim();    
    }

    fixUp() {
        for (const [key, position] of this.positions.positions.entries()) {
            let sel = position.selection?.friendly_notation
            if (sel) {
                this.addAlternative(key, sel)
            }
        }
    }
}

function toFriendlyNotation(fullFen: string) {
    var elements = fullFen.split(" ");
    var sanitized = elements.slice(0, 3).join(" ");
    return sanitized;
}

function loadRepertoire(json: any): Repertoire {
  return new Repertoire(json);
}

function createEmptyRepertoire(): Repertoire {
    return new Repertoire({"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq": new Position()});
}

export {Repertoire}
export {createEmptyRepertoire}
export {loadRepertoire}