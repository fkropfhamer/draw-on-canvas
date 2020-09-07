import Draw from '../src/draw';
import { chunkArray } from '../src/util';

let draw;
let mockCtx;
let mockCanvas;
let mockElement;

describe('Draw', () => {
    beforeEach(() => {
        mockCtx = { 
            canvas: { height: 100, width: 200 },
            getImageData: jest.fn(() => ({data: []})),
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            closePath: jest.fn(),
            fill: jest.fn(),
            moveTo: jest.fn(),
            quadraticCurveTo: jest.fn(),
            stroke: jest.fn()
        };

        mockCanvas = { 
            style: {},
            getContext: jest.fn(() => mockCtx),
            addEventListener: jest.fn(),
            toDataURL: jest.fn(() => 'test')
        };

        mockElement = { appendChild: jest.fn() };

        document.createElement = jest.fn(() => mockCanvas);
        window.addEventListener = jest.fn();

        draw = new Draw(mockElement, 1, 2);
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

        expect(mockElement.appendChild).toHaveBeenCalledTimes(1);
        expect(mockElement.appendChild).toHaveBeenCalledWith(mockCanvas);

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
        expect(mockCanvas.addEventListener.mock.calls[0][0]).toBe('mousemove');

        expect(window.addEventListener).toHaveBeenCalledTimes(2);
        expect(window.addEventListener.mock.calls[0][0]).toBe('mousedown');
        expect(window.addEventListener.mock.calls[1][0]).toBe('mouseup');
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

    test('downloadPNG', () => {
        const mockLink = { click: jest.fn() };
        document.createElement = jest.fn(() => mockLink);
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();

        draw.downloadPNG();

        expect(mockCanvas.toDataURL).toHaveBeenCalledTimes(1);
        expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    });

    test('onMouseMove mouseIsDown = true', () => {
        draw.mouseIsDown = true;
        draw.draw = jest.fn();

        draw.onMouseMove({offsetX: 1, offsetY: 2});

        expect(draw.drawing).toEqual([[{x: 1, y: 2}]]);
        expect(draw.draw).toHaveBeenCalledTimes(1);
    });

    test('onMouseMove mouseIsDown = false', () => {
        draw.mouseIsDown = false;
        draw.draw = jest.fn();

        draw.onMouseMove({offsetX: 1, offsetY: 2});

        expect(draw.drawing).toEqual([[]]);
        expect(draw.draw).toHaveBeenCalledTimes(0);
    });

    test('onMouseDown', () => {
        draw.mouseIsDown = false;
        draw.onMouseDown();

        expect(draw.mouseIsDown).toBe(true);
    });

    test('onMouseUp last line is empty', () => {
        draw.mouseIsDown = true;
        draw.onMouseUp();

        expect(draw.mouseIsDown).toBe(false);
        expect(draw.drawing).toEqual([[]]);
    });

    test('onMouseUp last line is not empty', () => {
        draw.mouseIsDown = true;
        draw.drawing = [[{x: 1, y: 2}]];
        draw.onMouseUp();

        expect(draw.mouseIsDown).toBe(false);
        expect(draw.drawing).toEqual([[{x: 1, y: 2}], []]);
    });

    test('getPixelArray', () => {
        expect(draw.getPixelArray()).toEqual([]);
        expect(mockCtx.getImageData).toHaveBeenCalledTimes(1);
        expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 1, 2);
    });

    test('getGreyScalePixelArray', () => {
        draw.getPixelArray = jest.fn(() => [1, 2, 3, 4, 5, 6]);

        expect(draw.getGreyScalePixelArray()).toEqual([4]);
        expect(draw.getPixelArray).toHaveBeenCalledTimes(1);
    });

    test('reset', () => {
        draw.drawing = [[], [], []];

        draw.reset();

        expect(draw.drawing).toEqual([[]]);
        expect(mockCtx.clearRect).toHaveBeenCalledTimes(1);
        expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 1, 2);
    });

    test('draw', () => {
        draw.drawing = [[], [], [], [], []];
        draw.drawPoints = jest.fn();

        draw.draw();

        expect(draw.drawPoints).toHaveBeenCalledTimes(5);
        expect(draw.drawPoints).toHaveBeenCalledWith([]);
    });

    test('drawLinePoint', () => {
        const point = {x: 1, y: 2};

        draw.drawLinePoint(point);

        expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
        expect(mockCtx.arc).toHaveBeenCalledTimes(1);
        expect(mockCtx.arc).toHaveBeenCalledWith(1, 2, 7.5, 0, Math.PI * 2, true);
        expect(mockCtx.closePath).toHaveBeenCalledTimes(1);
        expect(mockCtx.fill).toHaveBeenCalledTimes(1);
    });

    test('drawPoints empty', () => {
        const points = [];
        draw.drawLinePoint = jest.fn();
        
        draw.drawPoints(points);

        expect(draw.drawLinePoint).toHaveBeenCalledTimes(0);
        expect(mockCtx.beginPath).toHaveBeenCalledTimes(0);
    });

    test('drawPoints <6', () => {
        const points = [{x: 1, y: 2}, {x: 3, y: 4}];
        draw.drawLinePoint = jest.fn();
        
        draw.drawPoints(points);

        expect(draw.drawLinePoint).toHaveBeenCalledTimes(1);
        expect(draw.drawLinePoint).toHaveBeenCalledWith({x: 1, y: 2});

        expect(mockCtx.beginPath).toHaveBeenCalledTimes(0);
    });

    test('drawPoints >6', () => {
        const points = [{x: 1, y: 2}, {x: 3, y: 4}, {x: 5, y: 6}, {x: 7, y: 8}, {x: 11, y: 12}, {x: 13, y: 14}];
        draw.drawLinePoint = jest.fn();
        
        draw.drawPoints(points);

        
        expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
        expect(mockCtx.moveTo).toHaveBeenCalledTimes(1);
        expect(mockCtx.moveTo).toHaveBeenCalledWith(1, 2);

        expect(mockCtx.quadraticCurveTo).toHaveBeenCalledTimes(4);

        expect(mockCtx.stroke).toHaveBeenCalledTimes(1);

        expect(draw.drawLinePoint).toHaveBeenCalledTimes(1);
        expect(draw.drawLinePoint).toHaveBeenCalledWith({x: 13, y: 14});
    });
});
