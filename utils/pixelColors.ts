export type ColorRGBA = {
    r: number
    g: number
    b: number
    a: number
}

export const black: ColorRGBA = { r: 0, g: 0, b: 0, a: 255 }
export const white: ColorRGBA = { r: 255, g: 255, b: 255, a: 255 }

export function getColorAtPixel(
    imageData: ImageData,
    x: number,
    y: number,
): ColorRGBA {
    const { width, data } = imageData
    const startPos = 4 * (y * width + x)
    if (data[startPos + 3] === undefined) {
        throw new Error('Invalid pixel coordinates.')
    }
    return {
        r: data[startPos],
        g: data[startPos + 1],
        b: data[startPos + 2],
        a: data[startPos + 3],
    }
}

export function setColorAtPixel(
    imageData: ImageData,
    color: ColorRGBA,
    x: number,
    y: number,
): void {
    const { width, data } = imageData
    const startPos = 4 * (y * width + x)
    if (data[startPos + 3] === undefined) {
        throw new Error('Invalid pixel coordinates. Cannot set color.')
    }
    data[startPos + 0] = color.r & 0xff
    data[startPos + 1] = color.g & 0xff
    data[startPos + 2] = color.b & 0xff
    data[startPos + 3] = color.a & 0xff
}

export function isSameColor(
    a: ColorRGBA,
    b: ColorRGBA,
    tolerance = 0,
): boolean {
    return !(
        Math.abs(a.r - b.r) > tolerance ||
        Math.abs(a.g - b.g) > tolerance ||
        Math.abs(a.b - b.b) > tolerance ||
        Math.abs(a.a - b.a) > tolerance
    )
}

export function hex2RGBA(hex: string, alpha = 255): ColorRGBA {
    let parsedHex = hex
    if (hex.indexOf('#') === 0) {
        parsedHex = hex.slice(1)
    }
    // convert 3-digit hex to 6-digits.
    if (parsedHex.length === 3) {
        parsedHex =
            parsedHex[0] +
            parsedHex[0] +
            parsedHex[1] +
            parsedHex[1] +
            parsedHex[2] +
            parsedHex[2]
    }
    if (parsedHex.length !== 6) {
        throw new Error(`Invalid HEX color ${parsedHex}.`)
    }
    const r = parseInt(parsedHex.slice(0, 2), 16)
    const g = parseInt(parsedHex.slice(2, 4), 16)
    const b = parseInt(parsedHex.slice(4, 6), 16)
    return {
        r,
        g,
        b,
        a: alpha,
    }
}

export type AreaRect = {
    x: number
    y: number
    w: number
    h: number
}
export function restoreBlacks(
    blacksData: ImageData,
    imgData: ImageData,
    area?: AreaRect,
): number {
    const areaX = (area && area.x) || 0
    const areaY = (area && area.y) || 0
    const areaW = (area && area.w) || blacksData.width
    const areaH = (area && area.h) || blacksData.height
    const sX = Math.max(0, areaX)
    const sY = Math.max(0, areaY)
    const eX = sX + Math.min(blacksData.width, areaW)
    const eY = sY + Math.min(blacksData.height, areaH)
    let modifiedPixels = 0
    if (blacksData && imgData) {
        if (blacksData.width !== imgData.width) {
            throw new Error("Cannot restore blacks. Width doesn't match.")
        }
        if (blacksData.height !== imgData.height) {
            throw new Error("Cannot restore blacks. Height doesn't match.")
        }
        for (let x = sX; x < eX; x++) {
            for (let y = sY; y < eY; y++) {
                const origColor = getColorAtPixel(blacksData, x, y)
                if (isSameColor(black, origColor, 0)) {
                    setColorAtPixel(imgData, black, x, y)
                    modifiedPixels += 1
                }
            }
        }
    }
    return modifiedPixels
}
