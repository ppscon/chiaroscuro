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

  // Effect to draw image onto canvas when it changes or loads
  useEffect(() => {
    if (selectedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Opt-in for performance
      if (ctx) {
        // Set canvas size to match image, potentially scaled
        const MAX_PREVIEW_WIDTH = 800; // Doubled from 400
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
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-3 font-medium text-lg">{label}</label>
      <div className="flex items-center gap-5">
         <div 
            className="w-32 h-32 rounded-lg shadow-md overflow-hidden relative"
            style={{ backgroundColor: value }}
         >
            <input
              type="color"
              id={`${id}-picker`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
         </div>
         <div className="flex flex-col gap-2">
           <input 
              type="text"
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-36 px-3 py-2 border rounded font-mono text-base ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
              maxLength={7}
              placeholder="#RRGGBB"
            />
            {/* Display HSL values */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {hsl ? `H:${hsl.h}° S:${hsl.s}% L:${hsl.l}%` : '-'}
            </div>
         </div>
      </div>
    </div>
  );

  // Ratio visualization component
  const RatioVisualization = () => (
    <div className="w-full mt-4">
      <div className="relative h-12 rounded-full overflow-hidden shadow-inner">
        <div 
          className="absolute inset-y-0 left-0 border-r border-white dark:border-gray-700"
          style={{ 
            width: `${Math.round((1 - bestRatio) * 100)}%`, 
            backgroundColor: colorA 
          }}
        />
        <div 
          className="absolute inset-y-0 right-0"
          style={{ 
            width: `${Math.round(bestRatio * 100)}%`, 
            backgroundColor: colorB 
          }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{`${Math.round((1 - bestRatio) * 100)}% ${colorA}`}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{`${Math.round(bestRatio * 100)}% ${colorB}`}</span>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 p-8 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-semibold mb-8 text-center">Paint Mixer</h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Target Color & Preview */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">Target Color</h3>
                {selectedImage ? (
                  <div className="space-y-6">
                    <p className="text-lg text-gray-600 dark:text-gray-300">Click on the image to select your target color:</p>
                    <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-md">
                      <canvas 
                        ref={canvasRef}
                        onClick={handleImageClick}
                        className="cursor-crosshair max-w-full"
                        style={{ maxHeight: '500px', width: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div className="flex items-center gap-6 mt-6">
                      <ColorInput 
                        id="targetColor" 
                        label="Selected Color" 
                        value={targetColor} 
                        onChange={(v) => handleColorChange(setTargetColor, v)} 
                        hsl={targetColorInfo.hsl} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center border-2 rounded-lg border-dashed border-gray-300 dark:border-gray-600">
                    <p className="text-lg text-gray-500 dark:text-gray-400">Upload an image on the Canvas tab first to enable color picking</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column: Mixing & Results */}
            <div className="space-y-8">
              {/* Ingredients Section */}
              <div>
                <h3 className="text-2xl font-semibold mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">Paint Ingredients</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <ColorInput 
                    id="colorA" 
                    label="Color A" 
                    value={colorA} 
                    onChange={(v) => handleColorChange(setColorA, v)} 
                    hsl={colorAInfo.hsl} 
                  />
                  <ColorInput 
                    id="colorB" 
                    label="Color B" 
                    value={colorB} 
                    onChange={(v) => handleColorChange(setColorB, v)} 
                    hsl={colorBInfo.hsl} 
                  />
                </div>
              </div>
              
              {/* Results Section */}
              <div>
                <h3 className="text-2xl font-semibold mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">Mixing Result</h3>
                <div className="space-y-6">
                  {/* Swatches Comparison */}
                  <div className="flex items-center justify-center gap-6">
                    {/* Target Swatch */}
                    <div className="text-center">
                      <div 
                        className="w-40 h-40 rounded-lg shadow-inner border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: targetColor }}
                      ></div>
                      <p className="mt-3 text-base font-medium">Target</p>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex flex-col items-center">
                      <svg 
                        className="w-12 h-12 text-gray-400 dark:text-gray-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    
                    {/* Achieved Mix Swatch */}
                    <div className="text-center">
                      <div 
                        className="w-40 h-40 rounded-lg shadow-inner border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: bestMixHex }}
                      ></div>
                      <p className="mt-3 text-base font-medium">Best Mix</p>
                    </div>
                  </div>
                  
                  {/* Mix Information */}
                  <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-lg font-medium mb-3">Mixing Formula:</p>
                    <RatioVisualization />
                    <div className="mt-4 text-base text-gray-600 dark:text-gray-300">
                      {bestMixHsl ? (
                        <div className="flex flex-col gap-2">
                          <p>Mix HSL: H:{bestMixHsl.h}° S:{bestMixHsl.s}% L:{bestMixHsl.l}%</p>
                          <p>Color code: {bestMixHex}</p>
                        </div>
                      ) : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Educational Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Color Wheel Reference */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <h3 className="text-2xl font-semibold mb-6 self-start">Color Wheel</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <img 
                  src="/images/wheel.png" 
                  alt="Color Wheel"
                  className="max-w-full rounded-lg shadow-md"
                />
                <p className="text-base italic mt-3 text-center text-gray-500 dark:text-gray-400">
                  Standard artist's color wheel reference
                </p>
              </div>
            </div>
            
            {/* Understanding Colors */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-6">Understanding Color Mixing</h3>
              <div className="prose dark:prose-invert prose-lg max-w-none">
                <p className="text-lg">
                  This tool simulates mixing using RGB interpolation. Real paint mixing (subtractive) is more complex and pigment-dependent. Use this as a digital guide.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                    <h4 className="text-lg font-medium mb-2">Hue (H)</h4>
                    <p className="text-base">
                      The base color angle (0-360°). Mixing shifts the hue toward the dominant color or between the two ingredient hues.
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                    <h4 className="text-lg font-medium mb-2">Saturation (S)</h4>
                    <p className="text-base">
                      The color's intensity (0-100%). Mixing almost always <em>reduces</em> saturation, especially when combining complementary colors.
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                    <h4 className="text-lg font-medium mb-2">Lightness (L)</h4>
                    <p className="text-base">
                      How light or dark a color is (0-100%). Mixing tends to average lightness. White creates tints, black creates shades.
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                    <h4 className="text-lg font-medium mb-2">Temperature</h4>
                    <p className="text-base">
                      Colors are perceived as warm (reds, oranges, yellows) or cool (blues, greens, violets). Mixing across temperatures neutralizes colors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
