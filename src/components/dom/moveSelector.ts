export class ProbabilisticMove {
    constructor(san: string, probability: number) {
        this.san = san
        this.probability = probability
    }
    san: string
    probability: number
}

export class OptionSet {
    constructor(position: string, support: number, moves: ProbabilisticMove[]) {
        this.position = position
        this.support = support
        this.moves = moves
    }
    getSupportedMoves(allowedMoves: string[] | null = null): [string, number][] {
        var filteredMoves = this.moves.filter((element) => allowedMoves == null || allowedMoves.includes(element.san))
        var totalProbability = this.moves.reduce((partialSum, a) => partialSum + a.probability, 0);
        var filteredProbability = filteredMoves.reduce((partialSum, a) => partialSum + a.probability, 0);
        var adjustedSupport = this.support * (filteredProbability / totalProbability);

        if (filteredProbability == 0) {
            return []
        }

        var retVal: [string, number][] = [];

        for (let idx=0; idx < filteredMoves.length; ++idx) {
            retVal.push([filteredMoves[idx].san, (filteredMoves[idx].probability/filteredProbability) * adjustedSupport]);
        }
        return retVal;
    }
    position: string
    support: number
    moves: ProbabilisticMove[]
}

export class MoveSelector {
    constructor(requiredOptionSets=["repertoire"]) {
        this.requiredOptionSets = requiredOptionSets
    }

    isReady(position: string): Boolean {
        for (let idx=0; idx < this.requiredOptionSets.length; ++idx) {
            const optionSetName = this.requiredOptionSets[idx];
            if (!(optionSetName in this.optionSets) || this.optionSets[optionSetName].position != position) {
                return false
            }
        }
        return true;
    }

    getMove(position: string): any {
        const priorityMoves = this.priority ? this.optionSets[this.priority].moves.map((x) => x.san) : null

        var moveWeights: [string, number][] = [] 
        for (let idx=0; idx < this.requiredOptionSets.length; ++idx) {
            const optionSetName = this.requiredOptionSets[idx];
            moveWeights = moveWeights.concat(this.optionSets[optionSetName].getSupportedMoves(priorityMoves))
        }

        if (moveWeights.length == 0) {
            return null;
        }

        var totalSupport = moveWeights.reduce((partialSum, a) => partialSum + a[1], 0);
        if (totalSupport <= 0) {
            return null
        }

        var option = Math.random();
        var selection = totalSupport * option

        var currentSelection = 0.0
        var currentIndex = 0

        while (currentSelection + moveWeights[currentIndex][1] <= selection) {
            currentSelection += moveWeights[currentIndex][1]
            currentIndex += 1
            currentIndex %= moveWeights.length
        }
        console.log(moveWeights)
        return moveWeights[currentIndex][0]
    }

    setPrioritySource(source: string) {
        this.priority = source
    }

    pushOptions(name: string, options: OptionSet) {
        this.optionSets[name] = options;
    }

    priority: string | null = null;
    requiredOptionSets: string[];
    optionSets: Record<string, OptionSet> = {};
}