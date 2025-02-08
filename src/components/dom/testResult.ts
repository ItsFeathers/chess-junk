import type { AnnotatedHistory } from "./history";
import type { MoveEvent } from "./moveEvent";

export class IResult {
    result: number;
    streak: number;
    history: AnnotatedHistory;
    finalMove: MoveEvent;
  
    constructor(history: AnnotatedHistory, result: number, finalMove: MoveEvent, streak: number) {
      this.finalMove = finalMove;
      this.history = history;
      this.streak = streak;
      this.result = result;
    }
  }