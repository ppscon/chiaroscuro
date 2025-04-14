import { Paint, MixingRecipe } from '../context/PaintContext';
import { LABColor } from '../context/ColorContext';
import { 
  calculateDeltaE, 
  opacityToNumeric, 
  tintingStrengthToNumeric,
  calculateChroma
} from './colorConversion';

// Constants for algorithm tuning
const ACCEPTABLE_MATCH_THRESHOLD = 5.0; // DeltaE threshold for "good enough" match
const MAX_ATTEMPTS = 100000; // Maximum number of mix combinations to try
const MAX_COMPONENTS = 3; // Maximum number of paints in a mixture

/**
 * Finds optimal paint mixtures to match a target color
 */
export const findOptimalPaintMixture = (
  targetLabColor: LABColor, 
  availablePaints: Paint[],
  maxComponents: number = MAX_COMPONENTS
): MixingRecipe[] => {
  if (!targetLabColor || !availablePaints || availablePaints.length === 0) {
    return [];
  }
  
  // All calculated recipes will be stored here
  const recipes: MixingRecipe[] = [];
  
  // 1. Check for direct matches (single paint)
  const singlePaintMatches = findSinglePaintMatches(targetLabColor, availablePaints);
  recipes.push(...singlePaintMatches);
  
  // If we found a perfect match, no need to continue
  if (recipes.length > 0 && recipes[0].matchPercentage > 98) {
    return recipes.slice(0, 5); // Return top 5 matches
  }
  
  // 2. Try binary mixes (two paints)
  if (maxComponents >= 2) {
    const binaryMixes = findBinaryMixes(targetLabColor, availablePaints);
    recipes.push(...binaryMixes);
  }
  
  // 3. Try ternary mixes if needed (three paints)
  if (maxComponents >= 3 && (recipes.length === 0 || recipes[0].matchPercentage < 90)) {
    const ternaryMixes = findTernaryMixes(targetLabColor, availablePaints);
    recipes.push(...ternaryMixes);
  }
  
  // Sort all recipes by match quality (descending)
  recipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  // Return top results, removing duplicates
  return removeRedundantRecipes(recipes).slice(0, 5);
};

/**
 * Finds the best single paint matches
 */
const findSinglePaintMatches = (
  targetLabColor: LABColor, 
  availablePaints: Paint[]
): MixingRecipe[] => {
  const matches: MixingRecipe[] = [];
  
  for (const paint of availablePaints) {
    if (!paint.lab) continue;
    
    const deltaE = calculateDeltaE(targetLabColor, paint.lab);
    const matchPercentage = deltaEToPercentage(deltaE);
    
    matches.push({
      paints: [{ paint, proportion: 1.0 }],
      matchPercentage,
      estimatedLabColor: paint.lab
    });
  }
  
  // Sort by match quality (descending)
  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 10);
};

/**
 * Finds the best binary (two paint) mixes
 */
const findBinaryMixes = (
  targetLabColor: LABColor, 
  availablePaints: Paint[]
): MixingRecipe[] => {
  const matches: MixingRecipe[] = [];
  let attempts = 0;
  
  // First find white and black paints for tinting/shading
  const whitePaints = availablePaints.filter(p => 
    p.pigmentCodes.includes('PW6') || p.name.toLowerCase().includes('white')
  );
  
  const blackPaints = availablePaints.filter(p => 
    p.pigmentCodes.includes('PBk9') || p.pigmentCodes.includes('PBk11') || 
    p.name.toLowerCase().includes('black')
  );
  
  // Test a range of mixture proportions
  for (let i = 0; i < availablePaints.length && attempts < MAX_ATTEMPTS; i++) {
    const paint1 = availablePaints[i];
    if (!paint1.lab) continue;
    
    for (let j = i + 1; j < availablePaints.length && attempts < MAX_ATTEMPTS; j++) {
      const paint2 = availablePaints[j];
      if (!paint2.lab) continue;
      
      // Try different proportions
      for (let ratio = 0.1; ratio <= 0.9; ratio += 0.1) {
        attempts++;
        
        // Adjust ratio based on relative tinting strengths
        const tintRatio1 = tintingStrengthToNumeric(paint1.tintingStrength);
        const tintRatio2 = tintingStrengthToNumeric(paint2.tintingStrength);
        const adjustedRatio = adjustRatioForTintingStrength(
          ratio, 
          tintRatio1, 
          tintRatio2
        );
        
        // Estimate the mixed color
        const mixedColor = estimateMixedColor(paint1, paint2, adjustedRatio);
        
        // Calculate match quality
        const deltaE = calculateDeltaE(targetLabColor, mixedColor);
        const matchPercentage = deltaEToPercentage(deltaE);
        
        matches.push({
          paints: [
            { paint: paint1, proportion: adjustedRatio },
            { paint: paint2, proportion: 1 - adjustedRatio }
          ],
          matchPercentage,
          estimatedLabColor: mixedColor
        });
      }
    }
    
    // Also try mixing with white and black (common in painting)
    if (whitePaints.length > 0) {
      const whitePaint = whitePaints[0];
      if (whitePaint.lab) {
        for (let ratio = 0.1; ratio <= 0.9; ratio += 0.1) {
          attempts++;
          
          // Adjust for white's strong tinting power
          const adjustedRatio = adjustRatioForTintingStrength(
            ratio, 
            tintingStrengthToNumeric(paint1.tintingStrength), 
            tintingStrengthToNumeric(whitePaint.tintingStrength)
          );
          
          const mixedColor = estimateMixedColor(paint1, whitePaint, adjustedRatio);
          const deltaE = calculateDeltaE(targetLabColor, mixedColor);
          const matchPercentage = deltaEToPercentage(deltaE);
          
          matches.push({
            paints: [
              { paint: paint1, proportion: adjustedRatio },
              { paint: whitePaint, proportion: 1 - adjustedRatio }
            ],
            matchPercentage,
            estimatedLabColor: mixedColor
          });
        }
      }
    }
    
    if (blackPaints.length > 0) {
      const blackPaint = blackPaints[0];
      if (blackPaint.lab) {
        for (let ratio = 0.7; ratio <= 0.98; ratio += 0.02) {
          attempts++;
          
          // Black has very strong tinting power
          const adjustedRatio = adjustRatioForTintingStrength(
            ratio, 
            tintingStrengthToNumeric(paint1.tintingStrength), 
            tintingStrengthToNumeric('High') // Black is always high tinting strength
          );
          
          const mixedColor = estimateMixedColor(paint1, blackPaint, adjustedRatio);
          const deltaE = calculateDeltaE(targetLabColor, mixedColor);
          const matchPercentage = deltaEToPercentage(deltaE);
          
          matches.push({
            paints: [
              { paint: paint1, proportion: adjustedRatio },
              { paint: blackPaint, proportion: 1 - adjustedRatio }
            ],
            matchPercentage,
            estimatedLabColor: mixedColor
          });
        }
      }
    }
  }
  
  // Sort by match quality (descending)
  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 20);
};

/**
 * Finds the best ternary (three paint) mixes
 * This is a more selective algorithm since there are many more combinations
 */
const findTernaryMixes = (
  targetLabColor: LABColor, 
  availablePaints: Paint[]
): MixingRecipe[] => {
  const matches: MixingRecipe[] = [];
  let attempts = 0;
  
  // Find white paint for tinting
  const whitePaint = availablePaints.find(p => 
    p.pigmentCodes.includes('PW6') || p.name.toLowerCase().includes('white'));
    
  // Get the most promising paints based on similarity to target color
  const closestPaints = availablePaints
    .filter(p => p.lab)
    .sort((a, b) => {
      if (!a.lab || !b.lab) return 0;
      const deltaA = calculateDeltaE(targetLabColor, a.lab);
      const deltaB = calculateDeltaE(targetLabColor, b.lab);
      return deltaA - deltaB;
    })
    .slice(0, 10); // Use only the closest 10 paints to limit combinations
  
  // Try combinations of three paints using strategic ratios
  for (let i = 0; i < closestPaints.length && attempts < MAX_ATTEMPTS; i++) {
    const paint1 = closestPaints[i];
    if (!paint1.lab) continue;
    
    for (let j = i + 1; j < closestPaints.length && attempts < MAX_ATTEMPTS; j++) {
      const paint2 = closestPaints[j];
      if (!paint2.lab) continue;
      
      for (let k = j + 1; k < closestPaints.length && attempts < MAX_ATTEMPTS; k++) {
        const paint3 = closestPaints[k];
        if (!paint3.lab) continue;
        
        // Try a limited set of ratios for efficiency
        // Focus on combinations where one paint is dominant
        const ratioSets = [
          [0.7, 0.2, 0.1],
          [0.6, 0.3, 0.1],
          [0.5, 0.3, 0.2],
          [0.4, 0.4, 0.2],
          [0.33, 0.33, 0.34]  // Equal parts
        ];
        
        for (const [r1, r2, r3] of ratioSets) {
          attempts++;
          
          // Adjust ratios based on tinting strength
          const tintRatio1 = tintingStrengthToNumeric(paint1.tintingStrength);
          const tintRatio2 = tintingStrengthToNumeric(paint2.tintingStrength);
          const tintRatio3 = tintingStrengthToNumeric(paint3.tintingStrength);
          
          const totalTinting = r1 * tintRatio1 + r2 * tintRatio2 + r3 * tintRatio3;
          
          const adjustedR1 = (r1 * tintRatio1) / totalTinting;
          const adjustedR2 = (r2 * tintRatio2) / totalTinting;
          const adjustedR3 = (r3 * tintRatio3) / totalTinting;
          
          // Estimate the mixed color
          const mixedColor = estimateTernaryMixedColor(
            paint1, paint2, paint3, adjustedR1, adjustedR2, adjustedR3
          );
          
          // Calculate match quality
          const deltaE = calculateDeltaE(targetLabColor, mixedColor);
          const matchPercentage = deltaEToPercentage(deltaE);
          
          matches.push({
            paints: [
              { paint: paint1, proportion: adjustedR1 },
              { paint: paint2, proportion: adjustedR2 },
              { paint: paint3, proportion: adjustedR3 }
            ],
            matchPercentage,
            estimatedLabColor: mixedColor
          });
        }
      }
    }
    
    // Also try combinations with white if appropriate (for tints)
    if (whitePaint && whitePaint.lab) {
      for (let j = 0; j < closestPaints.length && j !== i && attempts < MAX_ATTEMPTS; j++) {
        const paint2 = closestPaints[j];
        if (!paint2.lab) continue;
        
        const ratioSets = [
          [0.7, 0.2, 0.1],  // Main color dominant
          [0.5, 0.4, 0.1],  // More balanced
          [0.4, 0.3, 0.3]   // Equal secondary colors
        ];
        
        for (const [r1, r2, r3] of ratioSets) {
          attempts++;
          
          const mixedColor = estimateTernaryMixedColor(
            paint1, paint2, whitePaint, r1, r2, r3
          );
          
          const deltaE = calculateDeltaE(targetLabColor, mixedColor);
          const matchPercentage = deltaEToPercentage(deltaE);
          
          matches.push({
            paints: [
              { paint: paint1, proportion: r1 },
              { paint: paint2, proportion: r2 },
              { paint: whitePaint, proportion: r3 }
            ],
            matchPercentage,
            estimatedLabColor: mixedColor
          });
        }
      }
    }
  }
  
  // Sort by match quality (descending)
  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 15);
};

/**
 * Adjusts mixing ratio based on tinting strength of paints
 */
const adjustRatioForTintingStrength = (
  ratio: number, 
  tintStrength1: number, 
  tintStrength2: number
): number => {
  // Simple adjustment based on relative tinting strength
  const relativeTintingStrength = tintStrength1 / (tintStrength1 + tintStrength2);
  const adjustedRatio = ratio * relativeTintingStrength * 2;
  
  // Clamp to valid range [0, 1]
  return Math.max(0, Math.min(1, adjustedRatio));
};

/**
 * Estimates the LAB color of a mixture of two paints
 */
const estimateMixedColor = (
  paint1: Paint, 
  paint2: Paint, 
  ratio: number
): LABColor => {
  if (!paint1.lab || !paint2.lab) {
    return { L: 50, a: 0, b: 0 }; // Default fallback
  }
  
  const opacity1 = opacityToNumeric(paint1.opacity);
  const opacity2 = opacityToNumeric(paint2.opacity);
  
  // Calculate base mixed color using weighted average in LAB space
  const mixedLab = {
    L: paint1.lab.L * ratio + paint2.lab.L * (1 - ratio),
    a: paint1.lab.a * ratio + paint2.lab.a * (1 - ratio),
    b: paint1.lab.b * ratio + paint2.lab.b * (1 - ratio)
  };
  
  // Apply saturation reduction based on color difference
  // This simulates the dulling effect that occurs when mixing paints
  const deltaE = calculateDeltaE(paint1.lab, paint2.lab);
  
  // The dulling effect is more pronounced:
  // 1. When the colors are very different (high deltaE)
  // 2. For more transparent pigments
  const dullingFactor = 1 - (deltaE / 100) * 0.3 * (1 - Math.min(opacity1, opacity2) * 0.5);
  
  // Apply dulling to the a and b components (chroma)
  const chroma = calculateChroma(mixedLab);
  const reducedChroma = chroma * dullingFactor;
  
  if (chroma > 0) {
    const chromaticityRatio = reducedChroma / chroma;
    mixedLab.a *= chromaticityRatio;
    mixedLab.b *= chromaticityRatio;
  }
  
  return mixedLab;
};

/**
 * Estimates the LAB color of a mixture of three paints
 */
const estimateTernaryMixedColor = (
  paint1: Paint, 
  paint2: Paint, 
  paint3: Paint,
  ratio1: number,
  ratio2: number,
  ratio3: number
): LABColor => {
  if (!paint1.lab || !paint2.lab || !paint3.lab) {
    return { L: 50, a: 0, b: 0 }; // Default fallback
  }
  
  // Normalize ratios
  const sum = ratio1 + ratio2 + ratio3;
  const r1 = ratio1 / sum;
  const r2 = ratio2 / sum;
  const r3 = ratio3 / sum;
  
  // Calculate base mixed color using weighted average in LAB space
  const mixedLab = {
    L: paint1.lab.L * r1 + paint2.lab.L * r2 + paint3.lab.L * r3,
    a: paint1.lab.a * r1 + paint2.lab.a * r2 + paint3.lab.a * r3,
    b: paint1.lab.b * r1 + paint2.lab.b * r2 + paint3.lab.b * r3
  };
  
  // Apply greater saturation reduction for three-paint mixtures
  // Mixing three paints typically results in more dulling than just two
  const maxDeltaE = Math.max(
    calculateDeltaE(paint1.lab, paint2.lab),
    calculateDeltaE(paint1.lab, paint3.lab),
    calculateDeltaE(paint2.lab, paint3.lab)
  );
  
  const averageOpacity = (
    opacityToNumeric(paint1.opacity) +
    opacityToNumeric(paint2.opacity) +
    opacityToNumeric(paint3.opacity)
  ) / 3;
  
  // More paints and more different pigments = more dulling
  const dullingFactor = 1 - (maxDeltaE / 100) * 0.4 * (1 - averageOpacity * 0.5);
  
  // Apply dulling to the a and b components (chroma)
  const chroma = calculateChroma(mixedLab);
  const reducedChroma = chroma * dullingFactor;
  
  if (chroma > 0) {
    const chromaticityRatio = reducedChroma / chroma;
    mixedLab.a *= chromaticityRatio;
    mixedLab.b *= chromaticityRatio;
  }
  
  return mixedLab;
};

/**
 * Converts deltaE value to a match percentage (0-100)
 */
const deltaEToPercentage = (deltaE: number): number => {
  // DeltaE of 0 is perfect match (100%)
  // DeltaE above 10 is very noticeable difference (0%)
  const percentage = 100 - (deltaE * 5);
  return Math.max(0, Math.min(100, percentage));
};

/**
 * Removes redundant recipes with similar paint combinations
 */
const removeRedundantRecipes = (recipes: MixingRecipe[]): MixingRecipe[] => {
  const uniqueRecipes: MixingRecipe[] = [];
  
  for (const recipe of recipes) {
    // Check if this recipe uses the same paints as any recipe we already have
    const isDuplicate = uniqueRecipes.some(existing => {
      // If they have different numbers of paints, they're not duplicates
      if (existing.paints.length !== recipe.paints.length) {
        return false;
      }
      
      // Check if they use the same paints, regardless of proportions
      const existingPaintIds = existing.paints.map(p => p.paint.id).sort();
      const recipePaintIds = recipe.paints.map(p => p.paint.id).sort();
      
      return existingPaintIds.every((id, index) => id === recipePaintIds[index]);
    });
    
    if (!isDuplicate) {
      uniqueRecipes.push(recipe);
    }
  }
  
  return uniqueRecipes;
};