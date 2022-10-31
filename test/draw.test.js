import Draw from '../src/draw';
import * as util from '../src/util';

let draw;
let mockCtx;
let mockCanvas;
let mockElement;

describe('Draw', () => {
  beforeEach(() => {
    mockCtx = {
      canvas: { height: 100, width: 200 },
      getImageData: jest.fn(() => ({ data: [] })),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      moveTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      stroke: jest.fn(),
    };

    mockCanvas = {
      style: {},
      getContext: jest.fn(() => mockCtx),
      addEventListener: jest.fn(),
      toDataURL: jest.fn(() => 'test'),
    };

    util.downloadURI = jest.fn();

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
    mockCtx = { canvas: { width: 2 } };

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
    expect(mockCanvas.style).toMatchObject({ backgroundColor: 'cyan', touchAction: 'none' });

    expect(mockElement.appendChild).toHaveBeenCalledTimes(1);
    expect(mockElement.appendChild).toHaveBeenCalledWith(mockCanvas);

    expect(mockCanvas.getContext).toHaveBeenCalledTimes(1);
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');

    expect(draw.ctx).toBe(mockCtx);
    expect(draw.strokeColor).toBe('black');
    expect(draw.strokeWeight).toBe(15);

    expect(draw.drawing).toEqual([{ color: 'black', strokeWeight: 15, points: [] }]);

    expect(draw.height).toBe(2);
    expect(draw.width).toBe(1);

    expect(mockCanvas.addEventListener).toHaveBeenCalledTimes(1);
    expect(mockCanvas.addEventListener.mock.calls[0][0]).toBe('pointermove');

    expect(window.addEventListener).toHaveBeenCalledTimes(2);
    expect(window.addEventListener.mock.calls[0][0]).toBe('pointerdown');
    expect(window.addEventListener.mock.calls[1][0]).toBe('pointerup');
  });

  test('changeStrokeColor', () => {
    draw.changeStrokeColor('color');

    expect(draw.strokeColor).toBe('color');
  });

  test('changeBackgroundColor', () => {
    draw.changeBackgroundColor('color');

    expect(draw.canvas.style.backgroundColor).toBe('color');
  });

  test('changeStrokeWeight', () => {
    draw.changeStrokeWeight(100);

    expect(draw.strokeWeight).toBe(100);
  });

  test('getDrawing', () => {
    draw.drawing = [[1, 2, 3, 4, 5]];

    expect(draw.getDrawing()).toEqual([[1, 2, 3, 4, 5]]);
  });

  test('setCanvasStyle', () => {
    const style = { backgroundColor: 'green', borderStyle: 'dotted' };

    draw.setCanvasStyle(style);

    expect(draw.canvas.style).toMatchObject(style);
  });

  test('downloadPNG', () => {
    const mockLink = { click: jest.fn() };
    document.createElement = jest.fn(() => mockLink);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    draw.downloadPNG();

    expect(util.downloadURI).toHaveBeenCalledTimes(1);
    expect(util.downloadURI).toHaveBeenCalledWith('test', 'canvas.png');

    expect(mockCanvas.toDataURL).toHaveBeenCalledTimes(1);
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
  });

  test('onMouseMove mouseIsDown = true', () => {
    draw.mouseIsDown = true;
    draw.draw = jest.fn();

    draw.onMouseMove({ offsetX: 1, offsetY: 2 });

    expect(draw.drawing).toEqual([{ points: [{ x: 1, y: 2 }], color: 'black', strokeWeight: 15 }]);
    expect(draw.draw).toHaveBeenCalledTimes(1);
  });

  test('onMouseMove mouseIsDown = false', () => {
    draw.mouseIsDown = false;
    draw.draw = jest.fn();

    draw.onMouseMove({ offsetX: 1, offsetY: 2 });

    expect(draw.drawing).toEqual([{ points: [], color: 'black', strokeWeight: 15 }]);
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
    expect(draw.drawing).toEqual([{ points: [], color: 'black', strokeWeight: 15 }]);
  });

  test('onMouseUp last line is not empty', () => {
    draw.mouseIsDown = true;
    draw.strokeWeight = 321;
    draw.strokeColor = 'purple';
    draw.drawing = [{ points: [{ x: 1, y: 2 }] }];
    draw.onMouseUp();

    expect(draw.mouseIsDown).toBe(false);
    expect(draw.drawing).toEqual([{ points: [{ x: 1, y: 2 }] }, { color: 'purple', strokeWeight: 321, points: [] }]);
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
    draw.strokeColor = 'green';
    draw.strokeWeight = 123;

    draw.drawing = [[], [], []];

    draw.reset();

    expect(draw.drawing).toEqual([{ color: 'green', strokeWeight: 123, points: [] }]);
    expect(mockCtx.clearRect).toHaveBeenCalledTimes(1);
    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 1, 2);
  });

  test('draw', () => {
    draw.drawing = [
      { points: [], color: 'red', strokeWeight: 10 },
      { points: [], color: 'red', strokeWeight: 10 },
      { points: [], color: 'red', strokeWeight: 10 },
      { points: [], color: 'red', strokeWeight: 10 },
      { points: [], color: 'red', strokeWeight: 10 },
    ];
    draw.drawStroke = jest.fn();

    draw.draw();

    expect(draw.drawStroke).toHaveBeenCalledTimes(5);
    expect(draw.drawStroke).toHaveBeenCalledWith({ points: [], color: 'red', strokeWeight: 10 });
  });

  test('drawLinePoint', () => {
    const point = { x: 1, y: 2 };

    draw.drawLinePoint(point, 15);

    expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
    expect(mockCtx.arc).toHaveBeenCalledTimes(1);
    expect(mockCtx.arc).toHaveBeenCalledWith(1, 2, 7.5, 0, Math.PI * 2, true);
    expect(mockCtx.closePath).toHaveBeenCalledTimes(1);
    expect(mockCtx.fill).toHaveBeenCalledTimes(1);
  });

  test('drawPoints empty', () => {
    const stroke = { points: [], color: 'test-color', strokeWeight: 30 };
    draw.drawLinePoint = jest.fn();

    draw.drawStroke(stroke);

    expect(mockCtx.strokeStyle).toBe('test-color');
    expect(mockCtx.fillStyle).toBe('test-color');
    expect(mockCtx.lineWidth).toBe(30);

    expect(draw.drawLinePoint).toHaveBeenCalledTimes(0);
    expect(mockCtx.beginPath).toHaveBeenCalledTimes(0);
  });

  test('drawStroke <6', () => {
    const stroke = {
      points: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
      color: 'test-color',
      strokeWeight: 30,
    };
    draw.drawLinePoint = jest.fn();

    draw.drawStroke(stroke);

    expect(mockCtx.strokeStyle).toBe('test-color');
    expect(mockCtx.fillStyle).toBe('test-color');
    expect(mockCtx.lineWidth).toBe(30);

    expect(draw.drawLinePoint).toHaveBeenCalledTimes(1);
    expect(draw.drawLinePoint).toHaveBeenCalledWith({ x: 1, y: 2 });

    expect(mockCtx.beginPath).toHaveBeenCalledTimes(0);
  });

  test('drawStroke >6', () => {
    const stroke = {
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 },
        { x: 7, y: 8 },
        { x: 11, y: 12 },
        { x: 13, y: 14 },
      ],
      color: 'test-color',
      strokeWeight: 30,
    };
    draw.drawLinePoint = jest.fn();

    draw.drawStroke(stroke);

    expect(mockCtx.strokeStyle).toBe('test-color');
    expect(mockCtx.fillStyle).toBe('test-color');
    expect(mockCtx.lineWidth).toBe(30);

    expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
    expect(mockCtx.moveTo).toHaveBeenCalledTimes(1);
    expect(mockCtx.moveTo).toHaveBeenCalledWith(1, 2);

    expect(mockCtx.quadraticCurveTo).toHaveBeenCalledTimes(4);
    expect(mockCtx.quadraticCurveTo.mock.calls).toEqual([
      [3, 4, 4, 5],
      [5, 6, 6, 7],
      [7, 8, 9, 10],
      [11, 12, 13, 14],
    ]);

    expect(mockCtx.stroke).toHaveBeenCalledTimes(1);

    expect(draw.drawLinePoint).toHaveBeenCalledTimes(1);
    expect(draw.drawLinePoint).toHaveBeenCalledWith({ x: 13, y: 14 }, 30);
  });
});
