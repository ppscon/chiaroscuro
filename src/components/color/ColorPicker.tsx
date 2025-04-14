import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useColor } from '../../context/ColorContext';
import { usePaint } from '../../context/PaintContext';
import { rgbToHex, rgbToLab } from '../../utils/colorConversion';
import BrandSelector from '../paint/BrandSelector';
import PaintMixingDisplay from '../paint/PaintMixingDisplay';

interface ColorPickerProps {
  image: HTMLImageElement;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ image }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { selectedColor, setSelectedColor } = useColor();
  const { selectedBrands, findPaintMixtures, recipes, setRecipes } = usePaint();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState<boolean>(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [pixelData, setPixelData] = useState<Uint8ClampedArray | null>(null);
  const [magnificationFactor] = useState(3); // Magnification factor for zooming
  
  // DEBUG: Create a test recipe to verify display
  const testRecipe = {
    paints: [
      {
        paint: {
          id: "test-paint-1",
          brand: "Debug Brand",
          name: "Test Titanium White",
          pigmentCodes: ["PW6"],
          opacity: "O" as const,
          binder: "Oil",
          lightfastness: "I",
          series: "1",
          tintingStrength: "High" as const,
          lab: { L: 95, a: 0, b: 2 },
          swatch: "#FFFFFF"
        },
        proportion: 0.7
      },
      {
        paint: {
          id: "test-paint-2",
          brand: "Debug Brand",
          name: "Test Ultramarine Blue",
          pigmentCodes: ["PB29"],
          opacity: "SO" as const,
          binder: "Oil",
          lightfastness: "I",
          series: "2",
          tintingStrength: "Medium" as const,
          lab: { L: 40, a: 15, b: -48 },
          swatch: "#1A237E"
        },
        proportion: 0.3
      }
    ],
    matchPercentage: 85.5,
    estimatedLabColor: { L: 80, a: 5, b: -20 },
    estimatedHexColor: "#AABBDD"
  };
  
  // Initialize canvas with image when component mounts
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match image (with max dimensions)
    const maxWidth = 800;
    const maxHeight = 600;
    
    let width = image.width;
    let height = image.height;
    
    // Scale down if image is too large
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0, width, height);
    setIsCanvasReady(true);
  }, [image]);
  
  // Clear recipes when selected brands change
  useEffect(() => {
    if (selectedColor && selectedBrands.length > 0) {
      // Re-calculate recipes when brands change
      const newRecipes = findPaintMixtures(selectedColor.lab!);
      setRecipes(newRecipes);
    } else if (selectedBrands.length === 0) {
      // Clear recipes if no brands are selected
      setRecipes([]);
    }
  }, [selectedBrands, selectedColor, findPaintMixtures, setRecipes]);
  
  // Generate recipes whenever selectedColor changes
  useEffect(() => {
    if (selectedColor && selectedColor.lab && selectedBrands.length > 0) {
      console.log('Auto-generating recipes based on selected color change');
      const autoRecipes = findPaintMixtures(selectedColor.lab);
      console.log(`Auto-generated ${autoRecipes.length} recipes`);
      setRecipes(autoRecipes);
    }
  }, [selectedColor, selectedBrands, findPaintMixtures, setRecipes]);
  
  // Handle mouse move to show color under cursor
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isCanvasReady) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    
    // Update magnifier position
    setMagnifierPosition({ x, y });
    setShowMagnifier(true);
    
    // Get pixel data at cursor position
    const data = ctx.getImageData(x, y, 1, 1).data;
    setPixelData(data);
    
    // Convert to hex for display
    const hex = rgbToHex({ r: data[0], g: data[1], b: data[2] });
    setHoveredColor(hex);
  };
  
  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };
  
  const handleClick = () => {
    if (!pixelData) return;
    
    console.log('DEBUG: Click handler triggered, pixelData available');
    
    // Create RGB color from pixel data
    const rgb = { r: pixelData[0], g: pixelData[1], b: pixelData[2] };
    
    // Convert to LAB for better color analysis
    const lab = rgbToLab(rgb);
    console.log('Selected color in LAB:', lab);
    
    // Set the selected color in context
    const newColor = {
      rgb,
      lab,
      hex: rgbToHex(rgb)
    };
    
    setSelectedColor(newColor);
    console.log('Setting new selected color:', newColor);
    
    // Find paint mixtures based on the selected color if brands are selected
    if (selectedBrands.length > 0) {
      console.log('Finding recipes for selected color, brands:', selectedBrands);
      
      try {
        // Explicitly request fresh recipes based on the selected color
        const newRecipes = findPaintMixtures(lab);
        console.log('Generated recipes count:', newRecipes.length);
        
        if (newRecipes.length > 0) {
          console.log('First recipe:', {
            paints: newRecipes[0].paints.map(p => p.paint.name),
            match: newRecipes[0].matchPercentage.toFixed(1) + '%'
          });
        } else {
          console.warn('No recipes were generated');
        }
        
        // Set the recipes in the paint context
        setRecipes(newRecipes);
        
        // Verify the recipes were set correctly
        console.log('Recipe state after update should match the generated recipes');
      } catch (error) {
        console.error('Error generating recipes:', error);
      }
    } else {
      console.log('No brands selected, skipping recipe generation');
      setRecipes([]); // Clear recipes if no brands selected
    }
  };
  
  // Helper to determine if a section should be shown
  const showColorInfo = hoveredColor !== null;
  const showSelectedColor = selectedColor !== null;
  const showPaintMixingResults = showSelectedColor && recipes.length > 0;
  
  return (
    <div className="flex flex-col gap-6 p-4 w-full max-w-7xl mx-auto">
      {/* Main content area with grid layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left column - Canvas and color info */}
        <div className="col-span-6 flex flex-col">
          <div className="w-full">
            <h2 className={`text-2xl font-serif mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Color Picker
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Click on any point in the image to select a color for analysis.
              Try to select mid-tones rather than highlights or shadows for best results.
            </p>
          </div>
          
          <div className="relative inline-block">
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              className={`border-2 ${isDark ? 'border-gray-700' : 'border-gray-300'} rounded-md cursor-crosshair`}
            />
            
            {/* Magnifier with Zoom */}
            {showMagnifier && pixelData && (
              <div 
                className="absolute w-40 h-40 border-2 border-gray-500 rounded-full overflow-hidden pointer-events-none z-10 shadow-lg"
                style={{
                  left: magnifierPosition.x - 80,
                  top: magnifierPosition.y - 80,
                  backgroundColor: `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, 0.3)`, // More transparent background
                }}
              >
                {/* Magnified content */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: canvasRef.current ? `url(${canvasRef.current.toDataURL()})` : 'none',
                    backgroundPosition: `${-magnifierPosition.x * magnificationFactor + 80}px ${-magnifierPosition.y * magnificationFactor + 80}px`,
                    backgroundSize: `${canvasRef.current?.width ? canvasRef.current.width * magnificationFactor : 0}px ${canvasRef.current?.height ? canvasRef.current.height * magnificationFactor : 0}px`,
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.9, // Slightly transparent magnified view
                  }}
                />
                
                {/* Target crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-20 h-20">
                    {/* Horizontal line */}
                    <div className="absolute top-1/2 left-0 w-full h-px bg-white" style={{ boxShadow: '0 0 1px #000' }}></div>
                    {/* Vertical line */}
                    <div className="absolute top-0 left-1/2 w-px h-full bg-white" style={{ boxShadow: '0 0 1px #000' }}></div>
                    {/* Center point */}
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-red-500 transform -translate-x-1/2 -translate-y-1/2" style={{ boxShadow: '0 0 2px #000' }}></div>
                  </div>
                  
                  {/* Color value display */}
                  <span className="absolute bottom-2 text-xs font-mono bg-black bg-opacity-70 text-white p-1 px-2 rounded">
                    {hoveredColor}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Color information panel */}
          {showColorInfo && (
            <div className={`mt-4 p-4 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center mb-2">
                <div 
                  className="w-10 h-10 rounded-md mr-3 border border-gray-300"
                  style={{ backgroundColor: hoveredColor }}
                />
                <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{hoveredColor}</span>
              </div>
              
              {pixelData && (
                <div className="text-sm font-mono opacity-75">
                  <p>RGB: {pixelData[0]}, {pixelData[1]}, {pixelData[2]}</p>
                </div>
              )}
              
              <button 
                onClick={handleClick} 
                className="mt-2 bg-pigment-600 hover:bg-pigment-700 text-white py-1 px-3 rounded-md text-sm"
              >
                Select this color
              </button>
            </div>
          )}
          
          {/* Selected color information */}
          {showSelectedColor && (
            <div className={`mt-4 p-4 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Selected Color
              </h3>
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 rounded-md mr-4 border border-gray-300 shadow-sm"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div>
                  <p className={`font-mono font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {selectedColor.hex}
                  </p>
                  <p className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    RGB: {selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b}
                  </p>
                  {selectedColor.lab && (
                    <p className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      LAB: {selectedColor.lab.L.toFixed(1)}, {selectedColor.lab.a.toFixed(1)}, {selectedColor.lab.b.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Color Variation Guide */}
              <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className={`text-md font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Color Variation Guide
                </h4>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Light</span>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Shadow</span>
                  </div>
                  <div className="h-10 rounded-md overflow-hidden flex">
                    <div className="w-1/5" style={{ backgroundColor: `color-mix(in srgb, ${selectedColor.hex} 30%, white 70%)` }}></div>
                    <div className="w-1/5" style={{ backgroundColor: `color-mix(in srgb, ${selectedColor.hex} 60%, white 40%)` }}></div>
                    <div className="w-1/5" style={{ backgroundColor: selectedColor.hex }}></div>
                    <div className="w-1/5" style={{ backgroundColor: `color-mix(in srgb, ${selectedColor.hex} 60%, black 40%)` }}></div>
                    <div className="w-1/5" style={{ backgroundColor: `color-mix(in srgb, ${selectedColor.hex} 30%, black 70%)` }}></div>
                  </div>
                </div>
                
                <div className="text-sm leading-tight space-y-2">
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    <strong>For highlights:</strong> Mix with white, but be aware this reduces chroma (intensity). Consider adding a touch of yellow to maintain vibrancy in warm colors.
                  </p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    <strong>For shadows:</strong> Avoid black! Instead, mix with the complementary color or a "chromatic black" mixture (like Ultramarine + Burnt Sienna). This creates richer, more natural shadows.
                  </p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    <strong>For transitions:</strong> Create 3-5 values between your lightest and darkest mixtures for smooth gradations. This allows for more convincing form modeling.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Brand selector and mixing recipes column */}
        <div className="col-span-6 flex flex-col space-y-4">
          <BrandSelector />
          
          {showSelectedColor && (
            <PaintMixingDisplay 
              recipes={recipes.length > 0 ? recipes : [testRecipe]} 
              targetColor={selectedColor ? selectedColor.hex : "#555555"} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker; 