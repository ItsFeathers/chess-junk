import { describe, it, expect } from 'vitest'
import { mergeMaps } from '../dom/utils'

describe('Utils', () => {
    it('Allows merging of 2 empty maps', () => {
        const map1 = {}
        const map2 = {}

        var result = mergeMaps([map1, map2])
        expect(result).toEqual({})
    })
    it('Allows merging of 2 maps with differing keys', () => {
        const map1 = {1: ["a"]}
        const map2 = {2: ["b"]}

        var result = mergeMaps([map1, map2])
        expect(result).toEqual({1: ["a"], 2: ["b"]})
    })
    it('Allows merging of 2 maps with a matching key', () => {
        const map1 = {1: ["a"]}
        const map2 = {1: ["f"], 2: ["b"]}

        var result = mergeMaps([map1, map2])
        expect(result).toEqual({1: ["a", "f"], 2: ["b"]})
    })
})