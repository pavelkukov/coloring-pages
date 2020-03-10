import { Image, Canvas, ImageData, createCanvas, loadImage } from "canvas";
import FloodFill from "./FloodFill";
import { getColorAtPixel } from "./pixelColors";

type AreasInfo = {
    [key: string]: number
}

export type Difficulty = {
    totalAreas: number;
    smallAreas: number;
    mediumAreas: number;
    difficultyNumber: number;
}

export default class DifficultyEstimator {
  imgPath: string;
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData;
  width: number;
  height: number;
  private _ignorePixelCoords: Array<string>; // e.g ['12|4', '3|4', ...'x|y']

  constructor(imgPath: string) {
    this.imgPath = imgPath;
    // A4 at 36 PPI
    this.width = 298;
    this.height = 421;
    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d");
    this._ignorePixelCoords = [];
  }

  testFill(x: number, y: number): number {
    const { width, height, data } = this.imageData;
    const pixelsDataClone = new Uint8ClampedArray(data);
    const imgDataClone = new ImageData(pixelsDataClone, width, height);
    const floodFill = new FloodFill(imgDataClone);
    floodFill.collectModifiedPixels = true;
    floodFill.fill("#f00", x, y, 20);
    floodFill.modifiedPixels.forEach(pixel => {
      this._ignorePixelCoords.push(`${pixel.x}|${pixel.y}`);
    });
    return floodFill.modifiedPixelsCount;
  }

  findFillSpaces(): AreasInfo {
    const areas: AreasInfo = {};
    for (let x = 0; x < this.imageData.width; x++) {
      for (let y = 0; y < this.imageData.height; y++) {
        const pixelColor = getColorAtPixel(this.imageData, x, y);
        const isTransparent = pixelColor['a'] === 0;
        const coordsStr = `${x}|${y}`;
        if (isTransparent && !this._ignorePixelCoords.includes(coordsStr)) {
          const areaSize = this.testFill(x, y);
          areas[areaSize] = (areas[areaSize] || 0) + 1
        }
      }
    }
    return areas
  }

  async estimate(): Promise<Difficulty> {
    const image = await loadImage(this.imgPath);
    this.drawImageContain(image);
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const areas = this.findFillSpaces();
    const sizes = Object.keys(areas).map(Number)
    const smallAreas = sizes.filter(size => size <= 10).reduce((acc, val) => {
        return areas[val.toString()] + acc
    }, 0)
    const mediumAreas = sizes.filter(size => size > 10 && size <= 30).reduce((acc, val) => {
        return areas[val.toString()] + acc
    }, 0)
    const totalAreas = sizes.reduce((acc, val) => {
        return areas[val.toString()] + acc
    }, 0)
    return {
        totalAreas,
        smallAreas,
        mediumAreas,
        difficultyNumber: (totalAreas + (mediumAreas * 2) + (smallAreas * 4))
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
