import Draw from '../src/index';

describe('Draw', () => {
    test('constructor', () => {
        const mockCanvas = { style: {}, getContext: jest.fn(() => ({})), addEventListener: jest.fn()};
        document.createElement = jest.fn(() => mockCanvas);

        const el = { appendChild: jest.fn() };

        const d = new Draw(el, 1, 2)

        expect(mockCanvas.getContext).toHaveBeenCalledTimes(1);
        expect(mockCanvas.style).toEqual({ backgroundColor: 'cyan' });
    });
});
