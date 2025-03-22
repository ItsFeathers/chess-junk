export function mergeMaps<T>(maps: Record<string | number, T[]>[]): Record<string | number, T[]>{
    var merged: Record<string | number, T[]> = {}
    var keys: (string | number)[] = []

    for (let idx=0; idx<maps.length; idx++) {
        for (const key in maps[idx]) {
            if (!(key in merged)) {
                merged[key] = []
            }
            merged[key] = merged[key].concat(maps[idx][key])
        }
    }

    return merged
}