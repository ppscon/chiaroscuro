declare module 'colorthief' {
  export default class ColorThief {
    /**
     * Get the dominant color from an image
     * @param img - Image element or canvas
     * @return {Array} The dominant RGB color as an array [r, g, b]
     */
    getColor(img: HTMLImageElement | HTMLCanvasElement): [number, number, number];
    
    /**
     * Get a palette of colors from an image
     * @param img - Image element or canvas
     * @param colorCount - The number of colors to return (default: 10)
     * @return {Array} Array of RGB arrays, e.g. [[r, g, b], [r, g, b], ...]
     */
    getPalette(img: HTMLImageElement | HTMLCanvasElement, colorCount?: number): Array<[number, number, number]>;
  }
} 