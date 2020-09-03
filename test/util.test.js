import { chunkArray } from '../src/util';

describe('util', () => {
    test('chunkArray', () => {
        expect(chunkArray([], 0)).toEqual([]);
        expect(chunkArray([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
        expect(chunkArray([1, 2, 3, 4], 3)).toEqual([[1, 2, 3], [4]]);
        expect(chunkArray(['a', 'b', 'c'], 1)).toEqual([['a'], ['b'], ['c']]);
    })
});
