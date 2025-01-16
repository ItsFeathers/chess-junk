import { Expose, Transform, Type, plainToClass, plainToInstance } from 'class-transformer';


type PrimitiveType = StringConstructor | NumberConstructor | BooleanConstructor;


function loadRepertoire(json: any) {
    console.log(new Repertoire(json));
}

export class Option {
    from: string = "";
    to: string = "";
    promotion: string = "";
    notation: string = "";
    fen_after: string = "";
    friendly_notation: string = "";
    turn: string = "";

    toString() {
        return "";
    }
}

export class Position{
    selection: Option | null = null;

    @Type(() => Option)
    options: Option[] = [];
    constructor(data: any) {
    }
}

export class PositionMap {
    constructor(jsonRepertoire: Object) {
        console.log(jsonRepertoire)
        new Map(Object.entries(jsonRepertoire)).forEach(this.savePosition.bind(this))
    }

    savePosition(position: any, key: string, _map) {
        console.log(position)
        this.positions[key] = plainToInstance(Position, position);
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

    exportToObject() {

    }

}

export {Repertoire}
export {loadRepertoire}