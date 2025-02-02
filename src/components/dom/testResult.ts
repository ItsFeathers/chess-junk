import type { MoveEvent } from "./moveEvent";

export class IResult {
    result: number = 0;
    streak: number = 0;
    history: MoveEvent[] = [];
    finalMove: MoveEvent;
  
    constructor() {
      // this.finalMove = new MoveEvent();
    }
  }