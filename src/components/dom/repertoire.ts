import { Expose, Transform, Type, plainToClass, plainToInstance } from 'class-transformer';


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

    savePosition(position: any, key: string, _map: any) {
        this.positions.set(key, plainToInstance(Position, position));
    }

    positions: Map<string, Position> = new Map<string, Position>();
}

class Repertoire {
    @Type(() => PositionMap)
    positions: PositionMap;

    constructor(data: any) {
        this.positions = new PositionMap(data)
    }

    getPositions() {
        return Array.from(this.positions.positions.keys())
    }

    containsPosition(fen: string) {
        return  !!this.positions.positions.get(fen)
    }

    exportToObject() {

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
        if (position.selection) {
            return [position.selection]
        } else {
            return []
        }
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
        return (
            this.positions.positions.get(position)?.selection?.friendly_notation == san
        );
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
        if (san) {
            position.selection = position.options.filter(
                (option) => option.friendly_notation == san
            )[0];
        } else {
            position.selection = null
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

        if (position.selection && position.selection.friendly_notation == san) {
            position.selection = null
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