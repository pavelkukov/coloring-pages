import {
  getColorAtPixel,
  setColorAtPixel,
  isSameColor,
  hex2RGBA,
  black,
  ColorRGBA,
} from "./pixelColors";

type PixelCoords = {
    x: number
    y: number
}

type LineQueued = [number, number, number, number]

// Inspired by QuickFill -> https://www.codeproject.com/Articles/6017/QuickFill-An-Efficient-Flood-Fill-Algorithm
export default class FloodFill {
    public imageData: ImageData
    public bwData: ImageData | undefined

    public maxX: number | null = null
    public minX: number | null = null
    public maxY: number | null = null
    public minY: number | null = null

    public collectModifiedPixels: boolean
    public modifiedPixels: Set<string>
    public modifiedPixelsCount: number

    private _tolerance = 0
    private _queue: Array<LineQueued>
    private _replacedColor: ColorRGBA
    private _newColor: ColorRGBA

    constructor(imageData: ImageData, bwData?: ImageData) {
        this.imageData = imageData
        this._queue = []
        this.modifiedPixelsCount = 0
        this.collectModifiedPixels = false
        this.modifiedPixels = new Set()
    }

    addToQueue(line: LineQueued): void {
        this._queue.push(line)
    }

    popFromQueue(): LineQueued | null {
        if (!this._queue.length) {
            return null
        }
        return this._queue.pop()
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

        this.addToQueue([x, x, y, -1])
        if (immediateExec) {
            this.fillQueue(Number.MAX_SAFE_INTEGER)
        }
    }

    isValidTarget(pixel: PixelCoords | null): boolean {
        if (pixel === null) {
            return
        }
        const pixelColor = getColorAtPixel(this.imageData, pixel.x, pixel.y)
        const isBlack = isSameColor(pixelColor, black, 0)
        return (
            !isBlack &&
            isSameColor(this._replacedColor, pixelColor, this._tolerance)
        )
    }

    fillLineAt(x: number, y: number): [number, number] {
        if (!this.isValidTarget({ x, y })) {
            return [-1, -1]
        }
        this.setPixelColor(this._newColor, { x, y })
        let minX = x
        let maxX = x
        let px = this.getPixelNeighbour('left', minX, y)
        while (px && this.isValidTarget(px)) {
            this.setPixelColor(this._newColor, px)
            minX = px.x
            px = this.getPixelNeighbour('left', minX, y)
        }
        px = this.getPixelNeighbour('right', maxX, y)
        while (px && this.isValidTarget(px)) {
            this.setPixelColor(this._newColor, px)
            maxX = px.x
            px = this.getPixelNeighbour('right', maxX, y)
        }
        return [minX, maxX]
    }

    fillQueue(limit: number): { modifiedPixels: number; isReady: boolean } {
        const startWithNumPixels = this.modifiedPixelsCount
        let modifiedPixels = 0
        let line = this.popFromQueue()
        while (line && limit) {
            const [start, end, y, parentY] = line
            let currX = start
            while (currX !== -1 && currX <= end) {
                const [lineStart, lineEnd] = this.fillLineAt(currX, y)
                if (lineStart !== -1) {
                    if (
                        lineStart >= start &&
                        lineEnd <= end &&
                        parentY !== -1
                    ) {
                        if (parentY < y && y + 1 < this.imageData.height) {
                            this.addToQueue([lineStart, lineEnd, y + 1, y])
                        }
                        if (parentY > y && y > 0) {
                            this.addToQueue([lineStart, lineEnd, y - 1, y])
                        }
                    } else {
                        if (y > 0) {
                            this.addToQueue([lineStart, lineEnd, y - 1, y])
                        }
                        if (y + 1 < this.imageData.height) {
                            this.addToQueue([lineStart, lineEnd, y + 1, y])
                        }
                    }
                }
                if (lineEnd === -1 && currX <= end) {
                    currX += 1
                } else {
                    currX = lineEnd + 1
                }
            }
            limit--
            if (limit) {
                line = this.popFromQueue()
            }
        }

        modifiedPixels += this.modifiedPixelsCount - startWithNumPixels

        return { modifiedPixels, isReady: this._queue.length === 0 }
    }

    setPixelColor(color: ColorRGBA, pixel: PixelCoords): void {
        setColorAtPixel(this.imageData, color, pixel.x, pixel.y)
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
        this.modifiedPixelsCount++
        this.collectModifiedPixels &&
            this.modifiedPixels.add(`${pixel.x}|${pixel.y}`)
    }

    getPixelNeighbour(
        direction: string,
        x: number,
        y: number,
    ): PixelCoords | null {
        x = x | 0
        y = y | 0
        let coords: PixelCoords
        switch (direction) {
            case 'up':
                coords = { x, y: (y - 1) | 0 }
                break
            case 'right':
                coords = { x: (x + 1) | 0, y }
                break
            case 'down':
                coords = { x, y: (y + 1) | 0 }
                break
            case 'left':
                coords = { x: (x - 1) | 0, y }
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
