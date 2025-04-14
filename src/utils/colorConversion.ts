import chroma from 'chroma-js';
import { rgb, lab, differenceCiede2000 } from 'culori';
import { RGBColor, LABColor } from '../context/ColorContext';

/**
 * Converts RGB color to CIE LAB color space
 */
export const rgbToLab = (rgbColor: RGBColor): LABColor => {
  try {
    // Using culori for conversion
    const result = lab(rgb({
      r: rgbColor.r / 255, 
      g: rgbColor.g / 255, 
      b: rgbColor.b / 255
    }));
    
    if (!result) {
      throw new Error('Color conversion failed');
    }
    
    return {
      L: result.l,
      a: result.a,
      b: result.b
    };
  } catch (error) {
    console.error('Error converting RGB to LAB:', error);
    
    // Fallback to chroma-js in case of error
    try {
      const labValues = chroma(
        rgbColor.r, 
        rgbColor.g, 
        rgbColor.b
      ).lab();
      
      return {
        L: labValues[0],
        a: labValues[1],
        b: labValues[2]
      };
    } catch (chromaError) {
      console.error('Fallback conversion also failed:', chromaError);
      
      // Return a default value if all else fails
      return { L: 50, a: 0, b: 0 };
    }
  }
};

/**
 * Converts LAB color to RGB color space
 */
export const labToRgb = (labColor: LABColor): RGBColor => {
  try {
    // Using chroma-js for conversion
    const chromaColor = chroma.lab(labColor.L, labColor.a, labColor.b);
    const [r, g, b] = chromaColor.rgb();
    
    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    };
  } catch (error) {
    console.error('Error converting LAB to RGB:', error);
    return { r: 0, g: 0, b: 0 };
  }
};

/**
 * Converts RGB color to HEX string
 */
export const rgbToHex = (rgbColor: RGBColor): string => {
  try {
    return chroma(rgbColor.r, rgbColor.g, rgbColor.b).hex();
  } catch (error) {
    console.error('Error converting RGB to HEX:', error);
    return '#000000';
  }
};

/**
 * Converts HEX string to RGB color
 */
export const hexToRgb = (hex: string): RGBColor => {
  try {
    const [r, g, b] = chroma(hex).rgb();
    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    };
  } catch (error) {
    console.error('Error converting HEX to RGB:', error);
    return { r: 0, g: 0, b: 0 };
  }
};

/**
 * Calculates the perceptual color difference (Delta E 2000)
 * between two LAB colors
 */
export const calculateDeltaE = (lab1: LABColor, lab2: LABColor): number => {
  try {
    // Using culori's implementation of Delta E 2000
    const color1 = { mode: 'lab', l: lab1.L, a: lab1.a, b: lab1.b };
    const color2 = { mode: 'lab', l: lab2.L, a: lab2.a, b: lab2.b };
    
    return differenceCiede2000(color1, color2);
  } catch (error) {
    console.error('Error calculating Delta E:', error);
    
    // Fallback to a simpler Euclidean distance if the Delta E calculation fails
    const dL = lab1.L - lab2.L;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    
    return Math.sqrt(dL * dL + da * da + db * db);
  }
};

/**
 * Converts opacity string representation to numeric value
 */
export const opacityToNumeric = (opacity: 'O' | 'SO' | 'ST' | 'T'): number => {
  switch (opacity) {
    case 'O': return 1.0;    // Opaque
    case 'SO': return 0.75;  // Semi-Opaque
    case 'ST': return 0.5;   // Semi-Transparent
    case 'T': return 0.25;   // Transparent
    default: return 0.5;
  }
};

/**
 * Converts tinting strength string to numeric multiplier
 */
export const tintingStrengthToNumeric = (strength?: 'High' | 'Medium' | 'Low'): number => {
  switch (strength) {
    case 'High': return 2.0;
    case 'Medium': return 1.0;
    case 'Low': return 0.5;
    default: return 1.0;
  }
};

/**
 * Calculates the chroma (saturation) of a LAB color
 */
export const calculateChroma = (labColor: LABColor): number => {
  return Math.sqrt(labColor.a * labColor.a + labColor.b * labColor.b);
};

/**
 * Calculates the hue angle of a LAB color
 */
export const calculateHueAngle = (labColor: LABColor): number => {
  return Math.atan2(labColor.b, labColor.a) * (180 / Math.PI);
};