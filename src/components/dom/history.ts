import type { MoveEvent } from "./moveEvent";

function toFriendlyNotation(fullFen: string) {
    var elements = fullFen.split(" ");
    var sanitized = elements.slice(0, 3).join(" ");
    return sanitized;
}

const startPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq"
export enum AnnotationType {
  Played = 1,
  BreaksRepertoire,
  EngineGood,
  EngineInnacuracy,
  EngineMistake,
  EngineBlunder
}

export class Annotation {
    type: AnnotationType
    from: string
    to: string
    constructor(type: AnnotationType, from: string, to: string) {
        this.type = type
        this.from = from
        this.to = to
    }
}

class AnnotatedPosition {
    fen: string;
    annotations: Annotation[] = []
    constructor(position: string, annotations: Annotation[]) {
        this.fen = position
        this.annotations = annotations
    }
}

export class AnnotatedHistory {
    pushAnnotatedMove(move: MoveEvent, annotations: Annotation[], index: number=-1) {
        if (index != -1) {
            let positionAfter = this.positions[index + 1]
            let newPositionAfter = toFriendlyNotation(move.after)
            if (newPositionAfter == toFriendlyNotation(positionAfter.fen)) {
                return
            } else {
                this.positions = this.positions.slice(index)
            }
        }
        this.positions[this.positions.length -1].annotations.push(new Annotation(AnnotationType.Played, move.from, move.to))
        this.positions.push(new AnnotatedPosition(toFriendlyNotation(move.after), annotations))

    }
    getLatestPosition(): AnnotatedPosition {
        return this.positions[this.positions.length - 1];
    }
    positions: AnnotatedPosition[] = [new AnnotatedPosition(startPosition, [])];
    startPosition() {
        return startPosition
    }
    pushMove(move: MoveEvent) {
        this.pushAnnotatedMove(move, [])
    }

    getPositionIndex(idx: number, player: string) {
        let offset = 0
        if (player == "w") {
            offset = 0
        } else if(player == "b") {
            offset = 1
        } else if(player == "s") {
            offset = 0
        } else {
            console.log("Bad player type " + player)
        }

        return idx * 2 + offset
    }

    positionAt(idx: number, player: string) {
        let positionIndex = this.getPositionIndex(idx, player)
        console.log(positionIndex)
        return this.positions[positionIndex]
    }

    positionAfter(idx: number, player: string) {
        let positionIndex = this.getPositionIndex(idx, player)
        console.log(positionIndex)
        return this.positions[positionIndex + 1]
    }

    getAnnotations(idx: number, player: string) {
        return this.positions[this.getPositionIndex(idx, player)].annotations
    }
}