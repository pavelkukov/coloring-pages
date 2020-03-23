import {
  getColorAtPixel,
  setColorAtPixel,
  isSameColor,
  hex2RGBA,
  restoreBlacks,
  black,
  white,
  ColorRGBA,
  AreaRect
} from "./pixelColors";
type PixelCoords = {
    x: number
    y: number
    skip?: number
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function closestInteger(a: number, b: number): number {
    const c1 = a - (a % b)
    const c2 = a + b - (a % b)
    if (a - c1 > c2 - a) {
        return c2
    } else {
        return c1
    }
}

export default class FloodFill {
    public imageData: ImageData
    public bwData: ImageData | undefined

    public maxX: number | null = null
    public minX: number | null = null
    public maxY: number | null = null
    public minY: number | null = null

    public modifiedPixelsCount = 0
    public collectModifiedPixels = false
    public modifiedPixels: Array<PixelCoords> = []

    private _tolerance = 0
    private _queue: Uint16Array
    private _queuePointer: number
    private _replacedColor: ColorRGBA
    private _newColor: ColorRGBA
    private _bwDataSrc: ImageData 

    constructor(imageData: ImageData, bwData?: ImageData) {
        this.imageData = imageData
        this.bwData =
            bwData &&
            new ImageData(
                new Uint8ClampedArray(bwData.data),
                bwData.width,
                bwData.height,
            )
        this._bwDataSrc = bwData
        this._queue = new Uint16Array(
            Math.ceil(this.imageData.data.length * 0.667),
        )
        this._queuePointer = 0
    }

    addToQueue(pixel: PixelCoords | null): void {
        if (pixel === null) {
            return
        }
        const len = this._queuePointer
        const index = closestInteger(getRandomInt(0, len - 3), 3)
        this._queue[this._queuePointer] = this._queue[index]
        this._queuePointer += 1
        this._queue[this._queuePointer] = this._queue[index + 1]
        this._queuePointer += 1
        this._queue[this._queuePointer] = this._queue[index + 2]
        this._queuePointer += 1

        this._queue[index] = pixel.skip | 0
        this._queue[index + 1] = pixel.x | 0
        this._queue[index + 2] = pixel.y | 0
    }

    popFromQueue(): PixelCoords | null {
        if (this._queuePointer <= 0) {
            return null
        }
        this._queuePointer -= 1
        const y = this._queue[this._queuePointer]
        this._queuePointer -= 1
        const x = this._queue[this._queuePointer]
        this._queuePointer -= 1
        const skip = this._queue[this._queuePointer]

        return { x, y, skip }
    }

    fill(
        newColorHEX: string,
        x: number,
        y: number,
        tolerance: number,
        immediateExec = true,
    ): void {
        this._newColor = hex2RGBA(newColorHEX)
        this._replacedColor = getColorAtPixel(this.imageData, x, y)
        this._tolerance = tolerance

        if (isSameColor(this._replacedColor, this._newColor, this._tolerance)) {
            return
        }

        this.addToQueue({ x, y, skip: 0 })
        if (immediateExec) {
            this.fillQueue(Number.MAX_SAFE_INTEGER)
        }
    }

    isValidTarget(pixel: PixelCoords | null): boolean {
        if (pixel === null) {
            return
        }
        if (this.bwData) {
            const pixelColor = getColorAtPixel(this.bwData, pixel.x, pixel.y)
            return isSameColor(pixelColor, white, 0)
        }
        const pixelColor = getColorAtPixel(this.imageData, pixel.x, pixel.y)
        const isBlack = isSameColor(pixelColor, black, 0)
        return (
            !isBlack &&
            isSameColor(this._replacedColor, pixelColor, this._tolerance)
        )
    }

    fillQueue(limit: number): { modifiedPixels: number; isReady: boolean } {
        const startWithNumPixels = this.modifiedPixelsCount
        let modifiedPixels = 0
        let pixel = this.popFromQueue()
        while (pixel && limit > 0) {
            const isValidTarget = this.isValidTarget(pixel)
            if (isValidTarget) {
                pixel.skip !== 1 &&
                    this.addToQueue(
                        this.getPixelNeighbour('up', pixel.x, pixel.y),
                    )
                pixel.skip !== 2 &&
                    this.addToQueue(
                        this.getPixelNeighbour('right', pixel.x, pixel.y),
                    )
                pixel.skip !== 3 &&
                    this.addToQueue(
                        this.getPixelNeighbour('down', pixel.x, pixel.y),
                    )
                pixel.skip !== 4 &&
                    this.addToQueue(
                        this.getPixelNeighbour('left', pixel.x, pixel.y),
                    )
                this.setPixelColor(this._newColor, pixel)
            }
            limit -= 1
            if (limit > 0) {
                pixel = this.popFromQueue()
            }
        }
        if (!pixel && this._bwDataSrc) {
            const area: AreaRect = {
                x: this.minX,
                y: this.minY,
                w: this.maxX - this.minX,
                h: this.maxY - this.minY,
            }
            modifiedPixels += restoreBlacks(
                this._bwDataSrc,
                this.imageData,
                area,
            )
        }
        modifiedPixels += this.modifiedPixelsCount - startWithNumPixels

        return { modifiedPixels, isReady: this._queuePointer === 0 }
    }

    setPixelColor(color: ColorRGBA, pixel: PixelCoords): void {
        setColorAtPixel(this.imageData, color, pixel.x, pixel.y)
        this.bwData && setColorAtPixel(this.bwData, black, pixel.x, pixel.y)
        if (!this.minX || pixel.x <= this.minX) {
            this.minX = pixel.x - 1
        }
        if (!this.minY || pixel.y <= this.minY) {
            this.minY = pixel.y - 1
        }
        if (!this.maxX || pixel.x >= this.maxX) {
            this.maxX = pixel.x + 1
        }
        if (!this.maxY || pixel.y >= this.maxY) {
            this.maxY = pixel.y + 1
        }
        this.modifiedPixelsCount += 1
        if (this.collectModifiedPixels) {
            this.modifiedPixels.push(pixel)
        }
    }

    getPixelNeighbour(
        direction: 'up' | 'right' | 'down' | 'left',
        x: number,
        y: number,
    ): PixelCoords | null {
        x = x | 0
        y = y | 0
        let coords: PixelCoords
        switch (direction) {
            case 'up':
                coords = { x, y: (y - 1) | 0, skip: 3 | 0 }
                break
            case 'right':
                coords = { x: (x + 1) | 0, y, skip: 4 | 0 }
                break
            case 'down':
                coords = { x, y: (y + 1) | 0, skip: 1 | 0 }
                break
            case 'left':
                coords = { x: (x - 1) | 0, y, skip: 2 | 0 }
                break
        }
        if (
            coords.x >= 0 &&
            coords.y >= 0 &&
            coords.x < this.imageData.width &&
            coords.y < this.imageData.height
        ) {
            return coords
        }
        return null
    }
}
