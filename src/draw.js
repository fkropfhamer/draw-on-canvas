import { chunkArray, downloadURI } from './util';

export default class Draw {
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  static getPixelArray(ctx) {
    const { height } = ctx.canvas;
    const { width } = ctx.canvas;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    return pixels;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  static getGreyScalePixelArray(ctx) {
    const pixels = Draw.getPixelArray(ctx);
    const greyScalePixels = pixels.filter((_, i) => (i + 1) % 4 === 0);

    return greyScalePixels;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  static getPixelMatrix(ctx) {
    const { width } = ctx.canvas;

    const pixelArray = Draw.getGreyScalePixelArray(ctx);
    const pixelMatrix = chunkArray(pixelArray, width);

    return pixelMatrix;
  }

  /**
   *
   * @param {HTMLElement} element
   * @param {number} width
   * @param {number} height
   * @param {object} opts
   */
  constructor(element, width, height, {
    style = { touchAction: 'none' }, backgroundColor = 'cyan', strokeColor = 'black', strokeWeight = 15,
  } = {}) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.backgroundColor = backgroundColor;

    this.setCanvasStyle(style);

    element.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.strokeColor = strokeColor;
    this.strokeWeight = strokeWeight;

    this.drawing = [{ color: strokeColor, strokeWeight, points: [] }];

    this.height = height;
    this.width = width;

    this.setupEventListeners();
  }

  /**
   *
   * @param {string | CanvasGradient | CanvasPattern} strokeColor
   */
  changeStrokeColor(strokeColor) {
    this.strokeColor = strokeColor;
  }

  /**
   *
   * @param {string} backgroundColor
   */
  changeBackgroundColor(backgroundColor) {
    this.canvas.style.backgroundColor = backgroundColor;
  }

  /**
   *
   * @param {number} strokeWeight
   */
  changeStrokeWeight(strokeWeight) {
    this.strokeWeight = strokeWeight;
  }

  /**
   *
   * @param {object} style
   */
  setCanvasStyle(style) {
    Object.entries(style).forEach(([key, value]) => {
      this.canvas.style[key] = value;
    });
  }

  getDrawing() {
    return this.drawing;
  }

  /**
   *
   * @param {string} filename
   */
  downloadPNG(filename = 'canvas.png') {
    const dataURL = this.canvas.toDataURL('image/png');
    downloadURI(dataURL, filename);
  }

  setupEventListeners() {
    this.canvas.addEventListener('pointermove', this.onMouseMove.bind(this));

    window.addEventListener('pointerdown', this.onMouseDown.bind(this));
    window.addEventListener('pointerup', this.onMouseUp.bind(this));
  }

  /**
   *
   * @param {MouseEvent} event
   */
  onMouseMove(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    if (this.mouseIsDown) {
      this.drawing[this.drawing.length - 1].points.push({ x, y });
      this.draw();
    }
  }

  onMouseDown() {
    this.mouseIsDown = true;

    this.drawing[this.drawing.length - 1].strokeWeight = this.strokeWeight;
    this.drawing[this.drawing.length - 1].color = this.strokeColor;
  }

  onMouseUp() {
    if (this.drawing[this.drawing.length - 1].points.length > 0) {
      this.drawing.push({ color: this.strokeColor, strokeWeight: this.strokeWeight, points: [] });
    }
    this.mouseIsDown = false;
  }

  getPixelArray() {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const pixels = imageData.data;

    return pixels;
  }

  getGreyScalePixelArray() {
    const pixels = this.getPixelArray();
    const greyScalePixels = pixels.filter((_, i) => (i + 1) % 4 === 0);

    return greyScalePixels;
  }

  reset() {
    this.drawing = [{ color: this.strokeColor, strokeWeight: this.strokeWeight, points: [] }];
    this.clearCanvas();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  draw() {
    this.clearCanvas();
    this.drawing.forEach((stroke) => {
      this.drawStroke(stroke);
    });
  }

  drawLinePoint(point, strokeWeight) {
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, strokeWeight / 2, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawStroke(stroke) {
    const { points, color, strokeWeight } = stroke;

    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = strokeWeight;

    if (points.length === 0) {
      return;
    }

    // draw a basic circle instead
    if (points.length < 6) {
      this.drawLinePoint(points[0]);
      return;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    // draw a bunch of quadratics, using the average of two points as the control point

    let i;

    for (i = 1; i < points.length - 2; i += 1) {
      const c = (points[i].x + points[i + 1].x) / 2;
      const d = (points[i].y + points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
    }

    this.ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    this.ctx.stroke();

    this.drawLinePoint(points[points.length - 1], strokeWeight);
  }
}
