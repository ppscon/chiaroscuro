import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { paintDatabase } from '../data/paintDatabase';
import { calculateDeltaE, labToRgb, rgbToHex } from '../utils/colorConversion';
import { LABColor } from './ColorContext';

// Paint Types
export interface Paint {
  id: string;
  brand: string;
  name: string;
  pigmentCodes: string[];
  opacity: 'O' | 'SO' | 'ST' | 'T'; // Opaque, Semi-Opaque, Semi-Transparent, Transparent
  binder: string;
  lightfastness: string;
  series: string;
  tintingStrength?: 'High' | 'Medium' | 'Low';
  lab?: { L: number; a: number; b: number };
  munsell?: { hue: string; value: number; chroma: number };
  swatch: string; // HEX color for UI display
}

export type MixingRecipe = {
  paints: { paint: Paint; proportion: number }[];
  matchPercentage: number;
  estimatedLabColor?: { L: number; a: number; b: number };
  estimatedHexColor?: string;
  description?: string;
};

// Brand structure for UI handling
export interface PaintBrand {
  id: string;
  name: string;
}

// Available brands
export const AVAILABLE_BRANDS: PaintBrand[] = [
  { id: "winsor-newton", name: "Winsor & Newton Artists' Oil Colour" },
  { id: "gamblin", name: "Gamblin Artist's Oil Colors" },
  { id: "michael-harding", name: "Michael Harding Artist Oils" },
  { id: "grumbacher", name: "Grumbacher Pre-Tested Oils" },
  { id: "old-holland", name: "Old Holland Classic Oil Colours" },
  { id: "sennelier", name: "Sennelier Artists' Oil Colours" }
];

interface PaintContextType {
  availableBrands: PaintBrand[];
  selectedBrands: string[];
  toggleBrandSelection: (brandId: string) => void;
  selectAllBrands: () => void;
  clearBrandSelection: () => void;
  
  recipes: MixingRecipe[];
  setRecipes: (recipes: MixingRecipe[]) => void;
  
  getPaintsByBrand: (brandId: string) => Paint[];
  getAllPaints: () => Paint[];
  
  isLoading: boolean;
  
  // New mixing algorithm functions
  findPaintMixtures: (targetColor: LABColor) => MixingRecipe[];
}

const PaintContext = createContext<PaintContextType | undefined>(undefined);

export const PaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with AVAILABLE_BRANDS directly instead of empty array
  const [availableBrands, setAvailableBrands] = useState<PaintBrand[]>(AVAILABLE_BRANDS);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    // Try to load saved selected brands from localStorage
    const saved = localStorage.getItem('chiaroscuro-selected-brands');
    return saved ? JSON.parse(saved) : ['winsor-newton', 'gamblin'];
  });
  
  const [recipes, setRecipes] = useState<MixingRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Log the initial state for debugging
  useEffect(() => {
    console.log('PaintContext initialized with:', {
      availableBrands: availableBrands.map(b => b.name),
      selectedBrands
    });
  }, []);
  
  useEffect(() => {
    // Save selected brands to localStorage
    localStorage.setItem('chiaroscuro-selected-brands', JSON.stringify(selectedBrands));
  }, [selectedBrands, availableBrands]);
  
  const toggleBrandSelection = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId) 
        : [...prev, brandId]
    );
  };
  
  const selectAllBrands = () => {
    setSelectedBrands(availableBrands.map(brand => brand.id));
    console.log("Selected all brands:", availableBrands.map(brand => brand.id));
  };
  
  const clearBrandSelection = () => {
    setSelectedBrands([]);
    console.log("Cleared all brand selections");
  };
  
  const getPaintsByBrand = (brandId: string): Paint[] => {
    // Find brand name by ID
    const brandName = AVAILABLE_BRANDS.find(brand => brand.id === brandId)?.name;
    console.log(`Getting paints for brand ID: ${brandId}, Brand name: ${brandName}`);
    
    if (!brandName) {
      console.warn(`No brand name found for ID: ${brandId}`);
      return [];
    }
    
    // Return all paints from the specified brand
    const paints = paintDatabase.brands[brandName]?.colors || [];
    console.log(`Found ${paints.length} paints for ${brandName}`);
    return paints;
  };
  
  const getAllPaints = useCallback(() => {
    return selectedBrands.flatMap(brandId => {
      return getPaintsByBrand(brandId);
    });
  }, [selectedBrands]);
  
  /**
   * Identifies complementary colors for a given paint
   * Used for creating more harmonious mixes and reducing chroma
   */
  const findComplementaryPaints = (paint: Paint, availablePaints: Paint[]): Paint[] => {
    if (!paint.lab) return [];
    
    // Get the paint's hue angle in LAB space
    const a = paint.lab.a;
    const b = paint.lab.b;
    const hueAngle = Math.atan2(b, a) * (180 / Math.PI);
    
    // The complementary hue is roughly 180 degrees away
    const complementaryHue = (hueAngle + 180) % 360;
    const complementaryRadians = complementaryHue * (Math.PI / 180);
    
    // Find paints with similar hue to the complementary
    return availablePaints
      .filter(p => p.lab && p.id !== paint.id && p.brand === paint.brand)
      .map(p => {
        const pHueAngle = Math.atan2(p.lab!.b, p.lab!.a) * (180 / Math.PI);
        // Calculate angular distance (considering the circle)
        let hueDiff = Math.abs(pHueAngle - complementaryHue);
        if (hueDiff > 180) hueDiff = 360 - hueDiff;
        
        return { paint: p, hueDiff };
      })
      .sort((a, b) => a.hueDiff - b.hueDiff)
      .slice(0, 3)
      .map(item => item.paint);
  };
  
  /**
   * Finds chromatic black pairs that are better alternatives to using black directly
   * Based on traditional painting techniques
   */
  const findChromaticBlackPairs = (availablePaints: Paint[]): { warm: Paint[], cool: Paint[], neutral: Paint[] } => {
    // Find specific pigments for creating chromatic blacks
    const burntUmber = availablePaints.find(p => 
      p.name.toLowerCase().includes('burnt umber') || 
      (p.pigmentCodes.includes('PBr7') && p.name.toLowerCase().includes('umber'))
    );
    
    const burntSienna = availablePaints.find(p => 
      p.name.toLowerCase().includes('burnt sienna') ||
      (p.pigmentCodes.includes('PBr7') && p.name.toLowerCase().includes('sienna'))
    );
    
    const ultramarine = availablePaints.find(p => 
      p.name.toLowerCase().includes('ultramarine') && 
      p.pigmentCodes.includes('PB29')
    );
    
    const phthaloBlue = availablePaints.find(p => 
      (p.name.toLowerCase().includes('phthalo blue') || p.name.toLowerCase().includes('phthalocyanine blue')) && 
      p.pigmentCodes.includes('PB15:3')
    );
    
    const phthaloGreen = availablePaints.find(p => 
      (p.name.toLowerCase().includes('phthalo green') || p.name.toLowerCase().includes('phthalocyanine green')) && 
      (p.pigmentCodes.includes('PG7') || p.pigmentCodes.includes('PG36'))
    );
    
    const alizarinCrimson = availablePaints.find(p => 
      p.name.toLowerCase().includes('alizarin') || 
      p.name.toLowerCase().includes('crimson permanent') ||
      p.pigmentCodes.includes('PR83') || 
      p.pigmentCodes.includes('PR177')
    );
    
    // Define warm, cool, and neutral chromatic black combinations
    const warmBlacks: Paint[] = [];
    const coolBlacks: Paint[] = [];
    const neutralBlacks: Paint[] = [];
    
    // Warm chromatic black: Burnt Umber + Ultramarine Blue
    if (burntUmber && ultramarine) {
      warmBlacks.push(burntUmber, ultramarine);
    } else if (burntSienna && ultramarine) {
      warmBlacks.push(burntSienna, ultramarine);
    }
    
    // Cool chromatic black: Pthalo Blue + Alizarin Crimson
    if (phthaloBlue && alizarinCrimson) {
      coolBlacks.push(phthaloBlue, alizarinCrimson);
    } else if (ultramarine && alizarinCrimson) {
      coolBlacks.push(ultramarine, alizarinCrimson);
    }
    
    // Neutral chromatic black: Phthalo Green + Alizarin Crimson
    if (phthaloGreen && alizarinCrimson) {
      neutralBlacks.push(phthaloGreen, alizarinCrimson);
    }
    
    return { warm: warmBlacks, cool: coolBlacks, neutral: neutralBlacks };
  };
  
  /**
   * Determines the temperature (warm/cool) of a color in LAB space
   */
  const getColorTemperature = (lab: LABColor): 'warm' | 'cool' | 'neutral' => {
    // In LAB, positive 'b' values (yellow) and positive 'a' values (red) generally indicate warmth
    // Negative 'b' values (blue) and negative 'a' values (green) generally indicate coolness
    
    const warmth = lab.a + lab.b;
    const coolness = -lab.a - lab.b;
    
    if (warmth > coolness + 15) return 'warm';
    if (coolness > warmth + 15) return 'cool';
    return 'neutral';
  };
  
  /**
   * Paint mixing algorithm that finds the closest matching paints
   * and suggests mixing formulas based on professional painting principles.
   */
  const findPaintMixtures = (targetColor: LABColor): MixingRecipe[] => {
    console.log('DEBUG: Starting enhanced findPaintMixtures with target color:', targetColor);
    setIsLoading(true);
    
    try {
      console.log('Finding paint mixtures for target color using professional painting principles');
      
      const availablePaints = getAllPaints();
      console.log('Available paints count:', availablePaints.length, 'Selected brands:', selectedBrands);
      
      // Always create at least one recipe with the first available paint
      const fallbackRecipe: MixingRecipe = {
        paints: [
          { 
            paint: {
              id: "error-fallback",
              brand: "Error Recovery",
              name: "Error Fallback White",
              pigmentCodes: ["PW6"],
              opacity: "O" as const,
              binder: "Oil",
              lightfastness: "I",
              series: "1",
              tintingStrength: "High" as const,
              lab: { L: 95, a: 0, b: 2 },
              swatch: "#FFFFFF"
            }, 
            proportion: 1 
          }
        ],
        matchPercentage: 50.0,
        estimatedHexColor: "#FFFFFF"
      };
      
      if (availablePaints.length === 0) {
        console.warn('No available paints found, using fallback recipe');
        setRecipes([fallbackRecipe]);
        setIsLoading(false);
        return [fallbackRecipe];
      }
      
      // Only consider paints that have LAB values
      const paintsWithLab = availablePaints.filter(paint => paint.lab);
      console.log('Paints with LAB values:', paintsWithLab.length);
      
      if (paintsWithLab.length === 0) {
        console.warn('No paints with LAB values found, using fallback recipe');
        setRecipes([fallbackRecipe]);
        setIsLoading(false);
        return [fallbackRecipe];
      }
      
      // Store all our recipes
      const recipes: MixingRecipe[] = [];
      
      // Find the closest paints by simple Euclidean distance in LAB space
      const sortedPaints = [...paintsWithLab].sort((a, b) => {
        if (!a.lab || !b.lab) return 0;
        
        const distA = Math.sqrt(
          Math.pow(a.lab.L - targetColor.L, 2) +
          Math.pow(a.lab.a - targetColor.a, 2) +
          Math.pow(a.lab.b - targetColor.b, 2)
        );
        
        const distB = Math.sqrt(
          Math.pow(b.lab.L - targetColor.L, 2) +
          Math.pow(b.lab.a - targetColor.a, 2) +
          Math.pow(b.lab.b - targetColor.b, 2)
        );
        
        return distA - distB;
      });
      
      // Find the target color temperature
      const targetTemperature = getColorTemperature(targetColor);
      console.log(`Target color temperature: ${targetTemperature}, L value: ${targetColor.L}`);
      
      // Find chromatic black pairs if we need to darken colors
      const chromaticBlacks = findChromaticBlackPairs(paintsWithLab);
      
      // Define isDarkColor outside the loop so it's available throughout the function
      const isDarkColor = targetColor.L < 40;
      
      // 1. Add best single-paint matches as recipes
      for (let i = 0; i < Math.min(3, sortedPaints.length); i++) {
        const paint = sortedPaints[i];
        
        // Calculate a match percentage
        const dist = Math.sqrt(
          Math.pow(paint.lab!.L - targetColor.L, 2) +
          Math.pow(paint.lab!.a - targetColor.a, 2) +
          Math.pow(paint.lab!.b - targetColor.b, 2)
        );
        
        const matchPercentage = Math.max(0, Math.min(100, 100 - (dist * 2)));
        
        // Only add if it's a decent match
        if (matchPercentage > 50) {
          recipes.push({
            paints: [{ paint, proportion: 1 }],
            matchPercentage,
            estimatedLabColor: paint.lab,
            estimatedHexColor: paint.swatch
          });
        }
      }
      
      // 2. Process paints by brand to create binary mixes
      const paintsByBrand: { [brand: string]: Paint[] } = {};
      
      paintsWithLab.forEach(paint => {
        if (!paintsByBrand[paint.brand]) {
          paintsByBrand[paint.brand] = [];
        }
        paintsByBrand[paint.brand].push(paint);
      });
      
      // For each brand
      Object.entries(paintsByBrand).forEach(([brandName, brandPaints]) => {
        if (brandPaints.length < 2) return;
        
        // A. If it's a dark color (low L value), try chromatic black recipes instead of black
        if (isDarkColor) {
          console.log('Creating chromatic black recipes for dark color');
          // Choose the appropriate chromatic black based on target temperature
          let blackPair: Paint[] = [];
          
          if (targetTemperature === 'warm' && chromaticBlacks.warm.length >= 2) {
            blackPair = chromaticBlacks.warm;
            console.log('Using warm chromatic black:', blackPair.map(p => p.name).join(' + '));
          } else if (targetTemperature === 'cool' && chromaticBlacks.cool.length >= 2) {
            blackPair = chromaticBlacks.cool;
            console.log('Using cool chromatic black:', blackPair.map(p => p.name).join(' + '));
          } else if (chromaticBlacks.neutral.length >= 2) {
            blackPair = chromaticBlacks.neutral;
            console.log('Using neutral chromatic black:', blackPair.map(p => p.name).join(' + '));
          } else if (chromaticBlacks.warm.length >= 2) {
            blackPair = chromaticBlacks.warm;
            console.log('Falling back to warm chromatic black:', blackPair.map(p => p.name).join(' + '));
          } else if (chromaticBlacks.cool.length >= 2) {
            blackPair = chromaticBlacks.cool;
            console.log('Falling back to cool chromatic black:', blackPair.map(p => p.name).join(' + '));
          }
          
          if (blackPair.length === 2 && brandPaints.some(p => p.name.toLowerCase().includes('white'))) {
            // Make a recipe with chromatic black pair + white to match the target value
            const whitePaint = brandPaints.find(p => p.name.toLowerCase().includes('white'));
            
            if (whitePaint) {
              // Mix the chromatic black pair first (50/50)
              const mixedBlackLab = {
                L: (blackPair[0].lab!.L + blackPair[1].lab!.L) / 2,
                a: (blackPair[0].lab!.a + blackPair[1].lab!.a) / 2,
                b: (blackPair[0].lab!.b + blackPair[1].lab!.b) / 2
              };
              
              // Then calculate how much white to add to reach target lightness
              // We'll use 10-30% white to adjust the value
              for (let whiteRatio of [0.1, 0.2, 0.3]) {
                const blackRatio = 1 - whiteRatio;
                
                const mixedLab = {
                  L: mixedBlackLab.L * blackRatio + whitePaint.lab!.L * whiteRatio,
                  a: mixedBlackLab.a * blackRatio + whitePaint.lab!.a * whiteRatio,
                  b: mixedBlackLab.b * blackRatio + whitePaint.lab!.b * whiteRatio
                };
                
                // Calculate color distance
                const dist = Math.sqrt(
                  Math.pow(mixedLab.L - targetColor.L, 2) +
                  Math.pow(mixedLab.a - targetColor.a, 2) +
                  Math.pow(mixedLab.b - targetColor.b, 2)
                );
                
                const matchPercentage = Math.max(0, Math.min(100, 100 - (dist * 2)));
                
                // Generate the mixed color preview
                const mixedRgb = labToRgb(mixedLab);
                const mixedHex = rgbToHex(mixedRgb);
                
                // Only add good matches
                if (matchPercentage > 60) {
                  recipes.push({
                    paints: [
                      { paint: blackPair[0], proportion: blackRatio * 0.5 },
                      { paint: blackPair[1], proportion: blackRatio * 0.5 },
                      { paint: whitePaint, proportion: whiteRatio }
                    ],
                    matchPercentage,
                    estimatedLabColor: mixedLab,
                    estimatedHexColor: mixedHex
                  });
                }
              }
            }
          }
        }
        
        // B. For normal colors, try harmonious pairs that improve on single paint matches
        
        // Get the top 5 closest paints by lightness and hue for this brand
        const closestByValue = [...brandPaints].sort((a, b) => 
          Math.abs(a.lab!.L - targetColor.L) - Math.abs(b.lab!.L - targetColor.L)
        ).slice(0, 5);
        
        const closestByHue = [...brandPaints].sort((a, b) => {
          const aHueDist = Math.sqrt(
            Math.pow(a.lab!.a - targetColor.a, 2) + 
            Math.pow(a.lab!.b - targetColor.b, 2)
          );
          const bHueDist = Math.sqrt(
            Math.pow(b.lab!.a - targetColor.a, 2) + 
            Math.pow(b.lab!.b - targetColor.b, 2)
          );
          return aHueDist - bHueDist;
        }).slice(0, 5);
        
        // Create a unique set of candidate paints
        const candidatePaintsSet = new Set([...closestByValue, ...closestByHue]);
        const candidatePaints = Array.from(candidatePaintsSet);
        
        // Try pairs of paints
        for (let i = 0; i < candidatePaints.length; i++) {
          const paint1 = candidatePaints[i];
          
          for (let j = i + 1; j < candidatePaints.length; j++) {
            const paint2 = candidatePaints[j];
            
            // Skip if the paints are too similar in hue
            const hue1 = Math.atan2(paint1.lab!.b, paint1.lab!.a);
            const hue2 = Math.atan2(paint2.lab!.b, paint2.lab!.a);
            const hueDiff = Math.abs(hue1 - hue2);
            
            if (hueDiff < 0.2) continue; // Skip very similar hues
            
            // If one paint is much lighter than the other, it's a good candidate for value mixing
            const valueDiff = Math.abs(paint1.lab!.L - paint2.lab!.L);
            
            // Try different proportions
            for (let ratio of [0.2, 0.35, 0.5, 0.65, 0.8]) {
              const inversedRatio = 1 - ratio;
              
              // For paints with different values, try to balance based on target value
              let adjustedRatio = ratio;
              if (valueDiff > 20) {
                // If we need to adjust the value, bias the ratio to get closer to target L
                const lighter = paint1.lab!.L > paint2.lab!.L ? paint1 : paint2;
                const darker = lighter === paint1 ? paint2 : paint1;
                
                // Calculate ideal ratio to reach target lightness
                if (targetColor.L > darker.lab!.L && targetColor.L < lighter.lab!.L) {
                  const idealRatio = (targetColor.L - darker.lab!.L) / (lighter.lab!.L - darker.lab!.L);
                  
                  // Use the paint that's closer to the ideal ratio
                  if (lighter === paint1) {
                    adjustedRatio = Math.min(0.9, Math.max(0.1, idealRatio)); 
                  } else {
                    adjustedRatio = Math.min(0.9, Math.max(0.1, 1 - idealRatio));
                  }
                }
              }
              
              const inversedAdjustedRatio = 1 - adjustedRatio;
              
              // Mix the colors (weighted average in LAB space)
              const mixedLab = {
                L: paint1.lab!.L * adjustedRatio + paint2.lab!.L * inversedAdjustedRatio,
                a: paint1.lab!.a * adjustedRatio + paint2.lab!.a * inversedAdjustedRatio,
                b: paint1.lab!.b * adjustedRatio + paint2.lab!.b * inversedAdjustedRatio
              };
              
              // Calculate color distance
              const dist = Math.sqrt(
                Math.pow(mixedLab.L - targetColor.L, 2) +
                Math.pow(mixedLab.a - targetColor.a, 2) +
                Math.pow(mixedLab.b - targetColor.b, 2)
              );
              
              const matchPercentage = Math.max(0, Math.min(100, 100 - (dist * 2)));
              
              // Generate the mixed color preview
              const mixedRgb = labToRgb(mixedLab);
              const mixedHex = rgbToHex(mixedRgb);
              
              // Only add good matches
              if (matchPercentage > 70) {
                recipes.push({
                  paints: [
                    { paint: paint1, proportion: adjustedRatio },
                    { paint: paint2, proportion: inversedAdjustedRatio }
                  ],
                  matchPercentage,
                  estimatedLabColor: mixedLab,
                  estimatedHexColor: mixedHex
                });
              }
            }
          }
        }
        
        // C. For high chroma colors, try complements to adjust chroma naturally
        const topPaint = brandPaints[0];
        if (topPaint) {
          const complementaryPaints = findComplementaryPaints(topPaint, brandPaints);
          
          if (complementaryPaints.length > 0) {
            const complement = complementaryPaints[0];
            
            // Try varying small amounts of the complement to adjust chroma
            for (let ratio of [0.85, 0.9, 0.95]) {
              const complementRatio = 1 - ratio;
              
              // Mix the colors with just a touch of the complement
              const mixedLab = {
                L: topPaint.lab!.L * ratio + complement.lab!.L * complementRatio,
                a: topPaint.lab!.a * ratio + complement.lab!.a * complementRatio,
                b: topPaint.lab!.b * ratio + complement.lab!.b * complementRatio
              };
              
              // Calculate color distance
              const dist = Math.sqrt(
                Math.pow(mixedLab.L - targetColor.L, 2) +
                Math.pow(mixedLab.a - targetColor.a, 2) +
                Math.pow(mixedLab.b - targetColor.b, 2)
              );
              
              const matchPercentage = Math.max(0, Math.min(100, 100 - (dist * 2)));
              
              // Generate the mixed color preview
              const mixedRgb = labToRgb(mixedLab);
              const mixedHex = rgbToHex(mixedRgb);
              
              // Only add if adjusting with complement improves the match
              if (matchPercentage > 65) {
                recipes.push({
                  paints: [
                    { paint: topPaint, proportion: ratio },
                    { paint: complement, proportion: complementRatio }
                  ],
                  matchPercentage,
                  estimatedLabColor: mixedLab,
                  estimatedHexColor: mixedHex,
                });
              }
            }
          }
        }
      });
      
      // Sort recipes by match percentage (highest first)
      const finalRecipes = recipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
      
      // Remove duplicates and take top results
      const uniqueRecipes = [];
      const seenPaintCombos = new Set();
      
      for (const recipe of finalRecipes) {
        // Create a key based on the paint IDs and proportions (rounded)
        const paintIds = recipe.paints.map(p => p.paint.id + "-" + Math.round(p.proportion * 10)).sort().join("|");
        
        if (!seenPaintCombos.has(paintIds)) {
          seenPaintCombos.add(paintIds);
          uniqueRecipes.push(recipe);
          
          // Stop after we have 5 unique recipes
          if (uniqueRecipes.length >= 5) break;
        }
      }
      
      console.log('Generated recipes count:', uniqueRecipes.length);
      if (uniqueRecipes.length > 0) {
        console.log('First recipe:', {
          paints: uniqueRecipes[0].paints.map(p => p.paint.name + " (" + (p.proportion * 100).toFixed(0) + "%)"),
          match: uniqueRecipes[0].matchPercentage.toFixed(1) + '%'
        });
      }
      
      // Always ensure we have at least one recipe
      if (uniqueRecipes.length === 0 && sortedPaints.length > 0) {
        const bestPaint = sortedPaints[0];
        uniqueRecipes.push({
          paints: [{ paint: bestPaint, proportion: 1 }],
          matchPercentage: 70,
          estimatedLabColor: bestPaint.lab,
          estimatedHexColor: bestPaint.swatch
        });
      } else if (uniqueRecipes.length === 0) {
        uniqueRecipes.push(fallbackRecipe);
      }
      
      // Ensure we have both direct match and chromatic black recipes when appropriate
      // Check if the target color is dark enough to warrant a chromatic black recipe
      
      // Find if we already have a direct match recipe
      const hasDirectMatch = uniqueRecipes.some(r => 
        r.paints.length === 1 || 
        r.description?.includes('Direct match') || 
        r.paints.every(p => !p.paint.name.toLowerCase().includes('ultramarine') && 
                             !p.paint.name.toLowerCase().includes('umber') &&
                             !p.paint.name.toLowerCase().includes('phthalo') &&
                             !p.paint.name.toLowerCase().includes('crimson'))
      );
      
      // Find if we already have a chromatic black recipe
      const hasChromatic = uniqueRecipes.some(r => 
        (r.paints.length >= 2 && 
         r.paints.some(p => p.paint.name.toLowerCase().includes('ultramarine') || p.paint.name.toLowerCase().includes('phthalo')) &&
         r.paints.some(p => p.paint.name.toLowerCase().includes('umber') || p.paint.name.toLowerCase().includes('crimson')))
      );
      
      // If we're missing one and the color is dark, try to generate the missing type
      if (isDarkColor && !hasDirectMatch && sortedPaints.length > 0) {
        // Add a direct match recipe
        const bestPaint = sortedPaints[0];
        uniqueRecipes.push({
          paints: [{ paint: bestPaint, proportion: 1 }],
          matchPercentage: Math.max(60, 100 - calculateDeltaE(bestPaint.lab!, targetColor) * 2),
          estimatedLabColor: bestPaint.lab,
          estimatedHexColor: bestPaint.swatch,
          description: 'Direct match with a single paint'
        });
      }
      
      if (isDarkColor && !hasChromatic) {
        // Try to find ultramarine and burnt umber or similar dark paints
        const ultramarineOrPhthalo = paintsWithLab.find(p => 
          p.name.toLowerCase().includes('ultramarine') || 
          p.name.toLowerCase().includes('phthalo')
        );
        
        const umberOrCrimson = paintsWithLab.find(p => 
          p.name.toLowerCase().includes('umber') || 
          p.name.toLowerCase().includes('crimson')
        );
        
        if (ultramarineOrPhthalo && umberOrCrimson) {
          // Mix ultramarine and umber to create a chromatic black
          const mixedLab = {
            L: (ultramarineOrPhthalo.lab!.L + umberOrCrimson.lab!.L) / 2,
            a: (ultramarineOrPhthalo.lab!.a + umberOrCrimson.lab!.a) / 2,
            b: (ultramarineOrPhthalo.lab!.b + umberOrCrimson.lab!.b) / 2
          };
          
          // Calculate match percentage
          const dist = Math.sqrt(
            Math.pow(mixedLab.L - targetColor.L, 2) +
            Math.pow(mixedLab.a - targetColor.a, 2) +
            Math.pow(mixedLab.b - targetColor.b, 2)
          );
          
          const matchPercentage = Math.max(0, Math.min(100, 100 - (dist * 2)));
          
          // Generate the mixed color preview
          const mixedRgb = labToRgb(mixedLab);
          const mixedHex = rgbToHex(mixedRgb);
          
          uniqueRecipes.push({
            paints: [
              { paint: ultramarineOrPhthalo, proportion: 0.5 },
              { paint: umberOrCrimson, proportion: 0.5 }
            ],
            matchPercentage,
            estimatedLabColor: mixedLab,
            estimatedHexColor: mixedHex,
            description: 'Chromatic black mixture (richer, more natural darks)'
          });
        }
      }
      
      // Add recipe descriptions based on the mixing technique
      const recipesWithDescriptions = uniqueRecipes.map(recipe => {
        // Skip if recipe already has a description
        if (recipe.description) return recipe;
        
        let description = '';
        const paintNames = recipe.paints.map(p => p.paint.name);
        
        if (recipe.paints.length === 1) {
          description = 'Direct match with a single paint';
        } else if (recipe.paints.length === 2) {
          if (paintNames.some(name => name.toLowerCase().includes('white'))) {
            description = 'Tint mixture (adding white to adjust value)';
          } else if (paintNames.some(name => name.toLowerCase().includes('yellow'))) {
            description = 'Warm tint mixture (adding yellow to brighten)';
          } else if (findComplementaryPaints(recipe.paints[0].paint, [recipe.paints[1].paint]).length > 0) {
            description = 'Chroma reduction using complementary colors';
          } else if (
            (paintNames.some(name => name.toLowerCase().includes('ultramarine') || name.toLowerCase().includes('phthalo')) && 
             paintNames.some(name => name.toLowerCase().includes('umber') || name.toLowerCase().includes('crimson')))
          ) {
            description = 'Chromatic black mixture (richer, more natural darks)';
          } else {
            description = 'Traditional binary mixture for hue adjustment';
          }
        } else if (recipe.paints.length === 3) {
          if (
            (paintNames.some(name => name.toLowerCase().includes('ultramarine')) && 
             paintNames.some(name => name.toLowerCase().includes('umber'))) ||
            (paintNames.some(name => name.toLowerCase().includes('phthalo')) && 
             paintNames.some(name => name.toLowerCase().includes('crimson')))
          ) {
            description = 'Chromatic black mixture with value adjustment';
          } else {
            description = 'Complex mixture for precise color matching';
          }
        }
        
        return {
          ...recipe,
          description
        };
      });
      
      // Sort recipes to prioritize best matches but ensure variety of approaches
      const sortedRecipes = [...recipesWithDescriptions].sort((a, b) => {
        // If one is a chromatic black and the other is a direct match, keep them separate
        const aIsChromatic = a.description?.includes('Chromatic black');
        const bIsChromatic = b.description?.includes('Chromatic black');
        
        if (aIsChromatic && !bIsChromatic) return -1; // Chromatic first
        if (!aIsChromatic && bIsChromatic) return 1;  // Chromatic first
        
        // Otherwise, sort by match percentage
        return b.matchPercentage - a.matchPercentage;
      });
      
      // Limit to top 5 recipes
      const finalSortedRecipes = sortedRecipes.slice(0, 5);
      
      // Set recipes in state and return them
      setIsLoading(false);
      setRecipes(finalSortedRecipes);
      return finalSortedRecipes;
      
    } catch (error) {
      console.error('Error finding paint mixtures:', error);
      const fallbackRecipe: MixingRecipe = {
        paints: [
          { 
            paint: {
              id: "error-fallback",
              brand: "Error Recovery",
              name: "Error Fallback White",
              pigmentCodes: ["PW6"],
              opacity: "O" as const,
              binder: "Oil",
              lightfastness: "I",
              series: "1",
              tintingStrength: "High" as const,
              lab: { L: 95, a: 0, b: 2 },
              swatch: "#FFFFFF"
            }, 
            proportion: 1 
          }
        ],
        matchPercentage: 50.0,
        estimatedHexColor: "#FFFFFF"
      };
      setIsLoading(false);
      setRecipes([fallbackRecipe]);
      return [fallbackRecipe];
    }
  };
  
  return (
    <PaintContext.Provider
      value={{
        availableBrands: AVAILABLE_BRANDS,
        selectedBrands,
        toggleBrandSelection,
        selectAllBrands,
        clearBrandSelection,
        recipes,
        setRecipes,
        getPaintsByBrand,
        getAllPaints,
        isLoading,
        findPaintMixtures
      }}
    >
      {children}
    </PaintContext.Provider>
  );
};

export const usePaint = (): PaintContextType => {
  const context = useContext(PaintContext);
  
  if (context === undefined) {
    throw new Error('usePaint must be used within a PaintProvider');
  }
  
  return context;
};