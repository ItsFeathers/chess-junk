import { Chess } from 'chess.js'
import { plainToInstance } from 'class-transformer';

export class MoveEvent {
    color: string = "";
    piece: string = "";
    from: string = "";
    to: string = "";
    san: string = "";
    flags: string = "";
    lan: string = "";
    before: string = "";
    after: string = "";
}

export function createMoveEvent(position: string, san: string): MoveEvent {
    let chess = new Chess(position)
    chess.move(san)
    let history = chess.history({ verbose: true })
    let event = plainToInstance(MoveEvent, history[history.length - 1])
    return event
}