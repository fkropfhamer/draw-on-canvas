import { chunkArray, downloadURI } from '../src/util';

describe('util', () => {
    test('chunkArray', () => {
        expect(chunkArray([], 0)).toEqual([]);
        expect(chunkArray([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
        expect(chunkArray([1, 2, 3, 4], 3)).toEqual([[1, 2, 3], [4]]);
        expect(chunkArray(['a', 'b', 'c'], 1)).toEqual([['a'], ['b'], ['c']]);
    });

    test('donwloadURI', () => {
        const mockLink = { click: jest.fn() };
        document.createElement = jest.fn(() => mockLink);
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();

        downloadURI('test', 'test.txt');

        expect(document.createElement).toHaveBeenCalledTimes(1);
        expect(document.createElement).toHaveBeenCalledWith('a');

        expect(mockLink.download).toBe('test.txt');
        expect(mockLink.href).toBe('test');

        expect(document.body.appendChild).toHaveBeenCalledTimes(1);
        expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
        
        expect(mockLink.click).toHaveBeenCalledTimes(1);

        expect(document.body.removeChild).toHaveBeenCalledTimes(1);
        expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    })
});
