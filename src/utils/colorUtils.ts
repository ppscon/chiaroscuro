/**
 * Utility functions for color calculations and conversions
 */

/**
 * Calculates Delta E (color difference) between two colors in LAB space
 * Using CIEDE2000 formula approximation
 */
export function deltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  // Simple Euclidean distance for LAB values
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Converts RGB color to LAB color space
 */
export function rgb2lab(rgb: [number, number, number]): [number, number, number] {
  // Convert RGB to XYZ
  let rVal = rgb[0] / 255;
  let gVal = rgb[1] / 255;
  let bVal = rgb[2] / 255;
  
  // Apply gamma correction
  rVal = rVal > 0.04045 ? Math.pow((rVal + 0.055) / 1.055, 2.4) : rVal / 12.92;
  gVal = gVal > 0.04045 ? Math.pow((gVal + 0.055) / 1.055, 2.4) : gVal / 12.92;
  bVal = bVal > 0.04045 ? Math.pow((bVal + 0.055) / 1.055, 2.4) : bVal / 12.92;
  
  // Scale to D65 illuminant
  rVal *= 100;
  gVal *= 100;
  bVal *= 100;
  
  // RGB to XYZ conversion
  const x = rVal * 0.4124 + gVal * 0.3576 + bVal * 0.1805;
  const y = rVal * 0.2126 + gVal * 0.7152 + bVal * 0.0722;
  const z = rVal * 0.0193 + gVal * 0.1192 + bVal * 0.9505;
  
  // XYZ to LAB conversion
  const xRef = 95.047;   // D65 reference white
  const yRef = 100.0;
  const zRef = 108.883;
  
  const xRatio = x / xRef;
  const yRatio = y / yRef;
  const zRatio = z / zRef;
  
  const fx = xRatio > 0.008856 ? Math.pow(xRatio, 1/3) : (7.787 * xRatio) + (16/116);
  const fy = yRatio > 0.008856 ? Math.pow(yRatio, 1/3) : (7.787 * yRatio) + (16/116);
  const fz = zRatio > 0.008856 ? Math.pow(zRatio, 1/3) : (7.787 * zRatio) + (16/116);
  
  const L = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);
  
  return [L, a, b];
} 