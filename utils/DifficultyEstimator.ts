import { Image, Canvas, ImageData, createCanvas, loadImage } from "canvas";
import FloodFill from "./FloodFill";
import { getColorAtPixel } from "./pixelColors";
const ProgressBar = require("progress");

type AreasInfo = {
  [key: string]: number;
};

export type Difficulty = {
  totalAreas: number;
  smallAreas: number;
  mediumAreas: number;
  difficultyNumber: number;
};

export default class DifficultyEstimator {
  imgPath: string;
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData;
  width: number;
  height: number;
  private _ignorePixelCoords: Set<string>; // e.g ['12|4', '3|4', ...'x|y']

  constructor(imgPath: string) {
    this.imgPath = imgPath;
    // 1240 x 1754 is A4 paper size in pixels with 150 PPI printer
    this.width = 992;
    this.height = 1403;
    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d");
    this._ignorePixelCoords = new Set();
  }

  testFill(x: number, y: number): number {
    const { width, height, data } = this.imageData;
    const pixelsDataClone = new Uint8ClampedArray(data);
    const imgDataClone = new ImageData(pixelsDataClone, width, height);
    const floodFill = new FloodFill(imgDataClone);
    floodFill.collectModifiedPixels = true;
    floodFill.fill("#f00", x, y, 20);
    floodFill.modifiedPixels.forEach(pixel => {
      this._ignorePixelCoords.add(pixel);
    });
    return floodFill.modifiedPixelsCount;
  }

  findFillSpaces(): AreasInfo {
    const areas: AreasInfo = {};
    const bar = new ProgressBar(
      `${this.imgPath.split("/").pop()} [:bar] | Elapsed::elapsed / ETA::eta`,
      {
        total: this.imageData.width * this.imageData.height
      }
    );
    for (let x = 0; x < this.imageData.width; x++) {
      for (let y = 0; y < this.imageData.height; y++) {
        const coordsStr = `${x}|${y}`;
        bar.tick();
        if (!this._ignorePixelCoords.has(coordsStr)) {
          const pixelColor = getColorAtPixel(this.imageData, x, y);
          const isTransparent = pixelColor["a"] === 0;
          if (isTransparent) {
            const areaSize = this.testFill(x, y);
            areas[areaSize] = (areas[areaSize] || 0) + 1;
          }
        }
      }
    }
    return areas;
  }

  async estimate(): Promise<Difficulty> {
    const image = await loadImage(this.imgPath);
    this.drawImageContain(image);
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const areas = this.findFillSpaces();
    const sizes = Object.keys(areas).map(Number);
    const smallAreas = sizes
      .filter(size => size <= 100)
      .reduce((acc, val) => {
        return areas[val.toString()] + acc;
      }, 0);
    const mediumAreas = sizes
      .filter(size => size > 100 && size <= 400)
      .reduce((acc, val) => {
        return areas[val.toString()] + acc;
      }, 0);
    const totalAreas = sizes.reduce((acc, val) => {
      return areas[val.toString()] + acc;
    }, 0);
    return {
      totalAreas,
      smallAreas,
      mediumAreas,
      difficultyNumber:
        totalAreas + Math.ceil(mediumAreas * 1.5) + smallAreas * 2
    };
  }

  drawImageContain(image: Image) {
    const hRatio = this.width / image.width;
    const vRatio = this.height / image.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = (this.width - image.width * ratio) / 2;
    const centerShiftY = (this.height - image.height * ratio) / 2;
    this.ctx.drawImage(
      image as any,
      0,
      0,
      image.width,
      image.height,
      centerShiftX,
      centerShiftY,
      image.width * ratio,
      image.height * ratio
    );
  }
}
