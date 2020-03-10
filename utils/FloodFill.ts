import {
    getColorAtPixel,
    setColorAtPixel,
    isSameColor,
    hex2PixelColor,
    restoreBlacks,
    PixelColor,
    AreaRect,
} from './pixelColors'

type PixelCoords = {
    x: number
    y: number
}

export default class FloodFill {
    public imageData: ImageData
    public restoreBlacksData: ImageData | undefined

    public maxX: number | null = null
    public minX: number | null = null
    public maxY: number | null = null
    public minY: number | null = null

    public modifiedPixelsCount = 0
    public collectModifiedPixels = false
    public modifiedPixels: Array<PixelCoords> = []

    private _tolerance = 0
    private _queue: Array<PixelCoords>
    private _replacedColor: PixelColor
    private _newColor: PixelColor

    constructor(imageData: ImageData, restoreBlacksData?: ImageData) {
        this.imageData = imageData
        this.restoreBlacksData = restoreBlacksData
        this._queue = []
    }

    fill(newColorHEX: string, x: number, y: number, tolerance: number): void {
        this._newColor = hex2PixelColor(newColorHEX)
        this._replacedColor = getColorAtPixel(this.imageData, x, y)
        this._tolerance = tolerance

        if (isSameColor(this._replacedColor, this._newColor, this._tolerance)) {
            return
        }

        this._queue = [{ x, y }]
        while (this._queue.length) {
            const pixel = this._queue.pop()
            const pixelColor = getColorAtPixel(this.imageData, pixel.x, pixel.y)
            const isSame = isSameColor(
                this._replacedColor,
                pixelColor,
                this._tolerance,
            )
            if (isSame || this.restoreBlacksData) {
                this.setPixelColor(this._newColor, pixel)
            }
            if (isSame) {
                const pixelNeighbours = [
                    this.getPixelNeighbour('up', pixel.x, pixel.y),
                    this.getPixelNeighbour('down', pixel.x, pixel.y),
                    this.getPixelNeighbour('left', pixel.x, pixel.y),
                    this.getPixelNeighbour('right', pixel.x, pixel.y),
                ]
                pixelNeighbours.forEach(coords => {
                    if (coords) {
                        this._queue.push(coords)
                    }
                })
            }
        }
        if (this.restoreBlacksData) {
            const area: AreaRect = {
                x: this.minX,
                y: this.minY,
                w: this.maxX - this.minX,
                h: this.maxY - this.minY,
            }
            restoreBlacks(this.restoreBlacksData, this.imageData, area)
        }
    }

    setPixelColor(color: PixelColor, pixel: PixelCoords): void {
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
        this.modifiedPixelsCount += 1
        if (this.collectModifiedPixels) {
            this.modifiedPixels.push(pixel)
        }
    }

    getPixelNeighbour(
        direction: 'up' | 'down' | 'left' | 'right',
        x: number,
        y: number,
    ): PixelCoords | null {
        let coords: PixelCoords
        switch (direction) {
            case 'up':
                coords = { x, y: y - 1 }
                break
            case 'down':
                coords = { x, y: y + 1 }
                break
            case 'left':
                coords = { x: x - 1, y }
                break
            case 'right':
                coords = { x: x + 1, y }
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
