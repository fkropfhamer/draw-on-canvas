import { chunkArray } from './util';

export default class Draw {
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    static getPixelArray(ctx) {
        const height = ctx.canvas.height;
        const width = ctx.canvas.width;

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
        const greyScalePixels  = pixels.filter((_, i) => (i + 1) % 4 === 0);
        
        return greyScalePixels;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    static getPixelMatrix(ctx) {
        const width = ctx.canvas.width;
    
        const pixelArray = Draw.getGreyScalePixelArray(ctx);
        const pixelMatrix = chunkArray(pixelArray, width);
    
        return pixelMatrix;
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @param {number} width 
     * @param {number} height 
     * @param {string} backgroundColor
     * @param {string | CanvasGradient | CanvasPattern} strokeColor
     * @param {number} strokeWeight
     */
    constructor(element, width, height, backgroundColor = 'cyan', strokeColor = 'black', strokeWeight = 15) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.backgroundColor = backgroundColor;

        element.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = strokeWeight;

        this.drawing = [[]];

        this.height = height;
        this.width = width;

        this.setupEventListeners();
    }

    /**
     * 
     * @param {string | CanvasGradient | CanvasPattern} strokeColor 
     */
    changeStrokeColor(strokeColor) {
        this.ctx.strokeStyle = strokeColor;
    }

    /**
     * 
     * @param {string} backgroundColor 
     */
    changeBackgroundColor(backgroundColor) {
        this.canvas.style.backgroudColor = backgroundColor;
    }

    /**
     * 
     * @param {number} strokeWeight 
     */
    changeStrokeWeight(strokeWeight) {
        this.ctx.lineWidth = strokeWeight;
    }

    getDrawing() {
        return this.drawing;
    }

    setupEventListeners() {
        this.canvas.addEventListener("mousemove", (event) => {
            const x = event.offsetX;
            const y = event.offsetY;
            if (this.mouseIsDown) {
                this.drawing[this.drawing.length - 1].push({x, y});
                this.draw();
            }
        });
        
        window.addEventListener("mousedown", () => {
            this.mouseIsDown = true;
        });
        
        window.addEventListener("mouseup", () => {
            if (this.drawing[this.drawing.length - 1].length > 0) {
                this.drawing.push([])
            }
            this.mouseIsDown = false;
        })
    }

    getPixelArray() {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const pixels = imageData.data;
    
        return pixels;
    }

    getGreyScalePixelArray() {
        const pixels = this.getPixelArray();
        const greyScalePixels  = pixels.filter((_, i) => (i + 1) % 4 === 0);
        
        return greyScalePixels;
    }

    reset() {
        this.drawing = [[]];
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    draw() {
        this.drawing.forEach((stroke) => {
            this.drawPoints(stroke);
        });
    }

    drawLinePoint(point) {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.ctx.lineWidth / 2, 0, Math.PI * 2, true);
        this.ctx.closePath(); 
        this.ctx.fill();
    }

    drawPoints(points) {
        if (points.length === 0) {
            return;
        }

        // draw a basic circle instead
        if (points.length < 6) {
            this.drawLinePoint(points[0]);
            return
        }

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        // draw a bunch of quadratics, using the average of two points as the control point
        
        let i;

        for (i = 1; i < points.length - 2; i++) {
            const c = (points[i].x + points[i + 1].x) / 2;
            const d = (points[i].y + points[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(points[i].x, points[i].y, c, d)
        }

        this.ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        this.ctx.stroke();

        this.drawLinePoint(points[points.length - 1]);
    }
}

