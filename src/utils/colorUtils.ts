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

// Restore original hexToRgb
export function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Restore original rgbToHex
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (num: number) => Math.max(0, Math.min(255, Math.round(num)));
  r = clamp(r);
  g = clamp(g);
  b = clamp(b);
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b).toUpperCase();
}

// Add rgbToHsl function (fixed syntax)
export function rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
  r /= 255; // Separated line
  g /= 255; // Separated line
  b /= 255; // Separated line
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
} 