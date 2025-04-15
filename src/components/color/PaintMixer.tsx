import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { hexToRgb, rgbToHex, rgb2lab, deltaE, rgbToHsl } from '../../utils/colorUtils';

// Basic Hex Color Validation Regex
const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i;

interface PaintMixerProps {
  selectedImage: HTMLImageElement | null;
}

const PaintMixer: React.FC<PaintMixerProps> = ({ selectedImage }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [colorA, setColorA] = useState<string>('#FF0000'); // Default Red
  const [colorB, setColorB] = useState<string>('#FFFF00'); // Default Yellow
  const [targetColor, setTargetColor] = useState<string>('#FF8000'); // Default Orange

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagePreviewRef = useRef<HTMLImageElement>(null);

  // Effect to draw image onto canvas when it changes or loads
  useEffect(() => {
    if (selectedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Opt-in for performance
      if (ctx) {
        // Set canvas size to match image, potentially scaled
        const MAX_PREVIEW_WIDTH = 400; 
        const scale = Math.min(1, MAX_PREVIEW_WIDTH / selectedImage.naturalWidth);
        canvas.width = selectedImage.naturalWidth * scale;
        canvas.height = selectedImage.naturalHeight * scale;

        // Draw the image scaled
        ctx.drawImage(selectedImage, 0, 0, canvas.width, canvas.height);
      }
    }
  }, [selectedImage]);

  // --- Input Handlers with Validation ---
  const handleColorChange = useCallback((setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    // Allow direct hex input
    if (HEX_COLOR_REGEX.test(value)) {
      setter(value.toUpperCase());
    } else if (value === '' || value === '#') {
       // Allow clearing or starting input
       setter(value);
    } else {
       // For picker changes or invalid text input, use picker value 
       // (this logic might need refinement depending on desired UX)
       const pickerValue = value.startsWith('#') ? value : `#${value}`;
       if (HEX_COLOR_REGEX.test(pickerValue)) {
           setter(pickerValue.toUpperCase());
       }
       // else: ignore invalid partial text input
    }
  }, []);

  // --- Color Info Calculations ---
  const getColorInfo = (hex: string): { hsl: { h: number, s: number, l: number } | null, rgb: { r: number, g: number, b: number } | null } => {
    const rgb = hexToRgb(hex);
    if (!rgb) return { hsl: null, rgb: null };
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hsl, rgb };
  };

  const colorAInfo = useMemo(() => getColorInfo(colorA), [colorA]);
  const colorBInfo = useMemo(() => getColorInfo(colorB), [colorB]);
  const targetColorInfo = useMemo(() => getColorInfo(targetColor), [targetColor]);

  // --- Mixing Calculation ---
  const { bestMixHex, bestRatio, bestMixHsl } = useMemo(() => {
    const rgbA = colorAInfo.rgb;
    const rgbB = colorBInfo.rgb;
    const rgbTarget = targetColorInfo.rgb;

    if (!rgbA || !rgbB || !rgbTarget) {
      return { bestMixHex: '#808080', bestRatio: 0.5, bestMixHsl: null }; // Defaults on error
    }

    const labTarget = rgb2lab([rgbTarget.r, rgbTarget.g, rgbTarget.b]);
    
    let minDeltaE = Infinity;
    let currentBestRatio = 0.5;
    let currentBestMixRgb = { r: 128, g: 128, b: 128 };

    for (let ratio = 0; ratio <= 1; ratio += 0.01) {
      const mixedR = rgbA.r * (1 - ratio) + rgbB.r * ratio;
      const mixedG = rgbA.g * (1 - ratio) + rgbB.g * ratio;
      const mixedB = rgbA.b * (1 - ratio) + rgbB.b * ratio;
      const currentMixRgb = { r: mixedR, g: mixedG, b: mixedB };
      
      const labMix = rgb2lab([currentMixRgb.r, currentMixRgb.g, currentMixRgb.b]);
      const dE = deltaE(labTarget, labMix);

      if (dE < minDeltaE) {
        minDeltaE = dE;
        currentBestRatio = ratio;
        currentBestMixRgb = currentMixRgb;
      }
    }

    const finalBestMixHex = rgbToHex(currentBestMixRgb.r, currentBestMixRgb.g, currentBestMixRgb.b);
    const finalBestMixHsl = rgbToHsl(currentBestMixRgb.r, currentBestMixRgb.g, currentBestMixRgb.b);

    return {
      bestMixHex: finalBestMixHex,
      bestRatio: currentBestRatio,
      bestMixHsl: finalBestMixHsl,
    };
  }, [colorAInfo, colorBInfo, targetColorInfo]);

  // --- Canvas Click Handler ---
  const handleImageClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      try {
          const pixelData = ctx.getImageData(x, y, 1, 1).data;
          const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
          setTargetColor(hex);
      } catch (e) {
         // Ignore security errors if image is cross-origin and not configured correctly
         console.warn("Could not get pixel data (cross-origin issue?)", e);
      }
    }
  };

  // Helper component for color inputs
  const ColorInput = ({ id, label, value, onChange, hsl }: { 
    id: string, 
    label: string, 
    value: string, 
    onChange: (value: string) => void, 
    hsl: { h: number, s: number, l: number } | null 
  }) => (
    <div className="flex flex-col items-center">
      <label htmlFor={id} className="mb-2 font-medium">{label}</label>
      <div className="flex items-center gap-2">
         <input
            type="color"
            id={`${id}-picker`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 h-16 border-none cursor-pointer rounded-md shadow-md p-0"
          />
         <input 
            type="text"
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-24 px-2 py-1 border rounded font-mono text-sm ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            maxLength={7}
            placeholder="#RRGGBB"
          />
      </div>
      {/* Display HSL values */}
      <div className="mt-2 text-xs h-4 text-gray-500 dark:text-gray-400">
        {hsl ? `H:${hsl.h}° S:${hsl.s}% L:${hsl.l}%` : '-'}
      </div> 
    </div>
  );

  return (
    <div className={`flex-1 p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Paint Mixer (Target Matching)</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Preview & Target Color Input */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Select Target Color</h3>
            {selectedImage ? (
              <div className="mb-4 text-center">
                <p className="text-sm mb-2">Click image to pick target color:</p>
                 <canvas 
                    ref={canvasRef}
                    onClick={handleImageClick}
                    className="cursor-crosshair rounded-md shadow-md border border-gray-400 dark:border-gray-600"
                    style={{ maxWidth: '100%', height: 'auto' }} // Ensure responsive display
                  />
              </div>
            ) : (
               <div className="mb-4 p-4 text-center border rounded-md border-dashed border-gray-400 dark:border-gray-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image on the Canvas tab to enable color picking.</p>
               </div>
            )}
            <ColorInput id="targetColor" label="Target Color" value={targetColor} onChange={(v) => handleColorChange(setTargetColor, v)} hsl={targetColorInfo.hsl} />
          </div>

          {/* Center Column: Ingredient Colors */}
          <div className="lg:col-span-4 flex flex-col items-center">
             <h3 className="text-lg font-semibold mb-4">Choose Ingredients</h3>
             <div className="flex flex-col gap-6">
                <ColorInput id="colorA" label="Color A" value={colorA} onChange={(v) => handleColorChange(setColorA, v)} hsl={colorAInfo.hsl} />
                <ColorInput id="colorB" label="Color B" value={colorB} onChange={(v) => handleColorChange(setColorB, v)} hsl={colorBInfo.hsl} />
             </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Mixing Result</h3>
            <div className={`flex flex-col items-center gap-2 p-4 border rounded-md ${isDark ? 'border-gray-700' : 'border-gray-200'} bg-white dark:bg-gray-800 shadow-sm w-full`}>
              <div className="flex items-center justify-center gap-4 mb-2"> {/* Container for swatches */} 
                {/* Target Swatch */}
                <div className="text-center">
                  <div 
                    className="w-24 h-24 rounded-lg shadow-inner border-2 border-gray-300 dark:border-gray-600 mb-1"
                    style={{ backgroundColor: targetColor }}
                    title={`Target: ${targetColor}`}
                  ></div>
                  <span className="text-xs font-medium">Target</span>
                </div>
                 {/* Achieved Mix Swatch */} 
                 <div className="text-center">
                   <div 
                    className="w-24 h-24 rounded-lg shadow-inner border-2 border-gray-300 dark:border-gray-600 mb-1"
                    style={{ backgroundColor: bestMixHex }}
                    title={`Achieved Mix: ${bestMixHex}`}
                  ></div>
                   <span className="text-xs font-medium">Achieved Mix</span>
                 </div>
               </div>
                {/* HSL for Result */}
               <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                 {bestMixHsl ? `H:${bestMixHsl.h}° S:${bestMixHsl.s}% L:${bestMixHsl.l}%` : '-'} (Achieved)
               </div>
               <p className="text-sm font-semibold mt-3">Calculated Ratio:</p>
               <p className="text-sm">{`${Math.round((1 - bestRatio) * 100)}% Color A`}</p>
               <p className="text-sm">{`${Math.round(bestRatio * 100)}% Color B`}</p>
            </div>
          </div>
        </div>

        {/* Color Wheel Reference Image */}
        <div className="my-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-3">Color Wheel Reference</h3>
            <img 
                src="/images/wheel.png" 
                alt="Color Wheel"
                className="max-w-xs md:max-w-sm rounded-lg shadow-md"
            />
            <p className="text-xs italic mt-2 text-gray-500 dark:text-gray-400">A standard artist's color wheel.</p>
        </div>

        {/* Mixing Tips */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 prose dark:prose-invert max-w-none">
           <h3 className="text-xl font-semibold mb-3">Understanding the Mix</h3>
           <p className="mb-4">
               This tool simulates mixing using RGB interpolation. Real paint mixing (subtractive) is more complex and pigment-dependent. Use this as a digital guide.
           </p>
           <ul className="mb-4 space-y-2">
             <li>
               <strong>Hue (H):</strong> The base color angle (0-360°). Mixing generally shifts the hue towards the dominant color or lands somewhere between the two ingredient hues.
             </li>
             <li>
               <strong>Saturation (S):</strong> The color's intensity or purity (0-100%). Mixing almost always <em>reduces</em> saturation, especially when combining colors far apart on the color wheel (like complements). A less saturated color is often called a 'tone'.
             </li>
             <li>
               <strong>Lightness (L) / Value:</strong> How light or dark the color is (0-100%). Mixing tends to average the lightness. Adding white creates 'tints' (higher L), while adding black creates 'shades' (lower L). Value is critical for defining form and structure in a painting.
             </li>
             <li>
               <strong>Temperature:</strong> Colors are perceived as warm (reds, oranges, yellows) or cool (blues, greens, violets). Mixing across temperatures can neutralize colors. Consider the temperature bias of your specific paints (e.g., Ultramarine Blue is warmer than Phthalo Blue).
             </li>
           </ul>
           <p>
                Observe how the HSL values change for the 'Achieved Mix' compared to your chosen ingredients (Color A & B) and your desired Target color.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PaintMixer;

// Helper function assumptions (should be in utils/colorUtils.ts)
/*
export function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (num: number) => Math.max(0, Math.min(255, Math.round(num)));
  r = clamp(r);
  g = clamp(g);
  b = clamp(b);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
*/
