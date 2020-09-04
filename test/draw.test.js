import Draw from '../src/draw';
import { chunkArray } from '../src/util';

let draw;
let mockCtx;
let mockCanvas;
let el;

describe('Draw', () => {
    beforeEach(() => {
        mockCtx = { canvas: { height: 100, width: 200 }, getImageData: jest.fn(() => ({data: []})) };
        mockCanvas = { style: {}, getContext: jest.fn(() => mockCtx), addEventListener: jest.fn()};
        el = { appendChild: jest.fn() };

        document.createElement = jest.fn(() => mockCanvas);
        window.addEventListener = jest.fn();

        draw = new Draw(el, 1, 2);
    });

    test('getPixelArray', () => {
        expect(Draw.getPixelArray(mockCtx)).toEqual([]);

        expect(mockCtx.getImageData).toHaveBeenCalledTimes(1);
        expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 200, 100);
    });

    test('getGreyScalePixelArray', () => {
        Draw.getPixelArray = jest.fn(() => [1, 2, 3, 4, 5, 6, 7, 8, 9]);

        expect(Draw.getGreyScalePixelArray(mockCtx)).toEqual([4, 8]);
        expect(Draw.getPixelArray).toHaveBeenCalledTimes(1);
        expect(Draw.getPixelArray).toHaveBeenCalledWith(mockCtx);
    });

    test('getPixelMatrix', () => {
        mockCtx = { canvas: { width: 2 }};

        Draw.getGreyScalePixelArray = jest.fn(() => [1, 2, 3, 4, 5, 6, 7, 8]);

        expect(Draw.getPixelMatrix(mockCtx)).toEqual([[1, 2], [3, 4], [5, 6], [7, 8]]);
        expect(Draw.getGreyScalePixelArray).toHaveBeenCalledTimes(1);
        expect(Draw.getGreyScalePixelArray).toHaveBeenCalledWith(mockCtx);
    });

    test('constructor', () => {
        expect(draw.canvas).toBe(mockCanvas);
        expect(document.createElement).toHaveBeenCalledTimes(1);
        expect(document.createElement).toHaveBeenCalledWith('canvas');
        expect(mockCanvas.width).toBe(1);
        expect(mockCanvas.height).toBe(2);
        expect(mockCanvas.style.backgroundColor).toBe('cyan');

        expect(el.appendChild).toHaveBeenCalledTimes(1);
        expect(el.appendChild).toHaveBeenCalledWith(mockCanvas);

        expect(mockCanvas.getContext).toHaveBeenCalledTimes(1);
        expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');

        expect(draw.ctx).toBe(mockCtx);
        expect(mockCtx.strokeStyle).toBe('black');
        expect(mockCtx.fillStyle).toBe('black');
        expect(mockCtx.lineWidth).toBe(15);

        expect(draw.drawing).toEqual([[]]);

        expect(draw.height).toBe(2);
        expect(draw.width).toBe(1);
    
        expect(mockCanvas.addEventListener).toHaveBeenCalledTimes(1);
        expect(window.addEventListener).toHaveBeenCalledTimes(2);
    });

    test('changeStrokeColor', () => {
        draw.changeStrokeColor('color');

        expect(draw.ctx.strokeStyle).toBe('color');
        expect(draw.ctx.fillStyle).toBe('color');
    });

    test('changeBackgroundColor', () => {
        draw.changeBackgroundColor('color');

        expect(draw.canvas.style.backgroundColor).toBe('color');
    });

    test('changeStrokeWeight', () => {
        draw.changeStrokeWeight(100);

        expect(draw.ctx.lineWidth).toBe(100);
    });

    test('getDrawing', () => {
        draw.drawing = [[1,2,3,4,5]];
        
        expect(draw.getDrawing()).toEqual([[1,2,3,4,5]]);
    });
});
