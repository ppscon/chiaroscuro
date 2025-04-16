import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { usePaint } from '../../context/PaintContext';
import { MixingRecipe } from '../../context/PaintContext';

interface PaintMixingDisplayProps {
  recipes: Array<MixingRecipe & { description?: string }>;
  targetColor: string; // HEX color
}

const PaintMixingDisplay: React.FC<PaintMixingDisplayProps> = ({ recipes, targetColor }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string>('');
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  
  // Debug: Log recipes received by the component
  useEffect(() => {
    console.log('PaintMixingDisplay received recipes:', recipes);
    console.log('PaintMixingDisplay received targetColor:', targetColor);
    
    // Validate recipes format
    try {
      if (recipes && recipes.length > 0) {
        recipes.forEach((recipe, index) => {
          if (!recipe.paints || !Array.isArray(recipe.paints)) {
            throw new Error(`Recipe ${index} is missing paints array`);
          }
          recipe.paints.forEach((paintItem, paintIndex) => {
            if (!paintItem.paint) {
              throw new Error(`Recipe ${index}, paint ${paintIndex} is missing paint object`);
            }
            if (typeof paintItem.proportion !== 'number') {
              throw new Error(`Recipe ${index}, paint ${paintIndex} has invalid proportion`);
            }
          });
        });
        console.log('All recipes validated successfully');
      }
    } catch (error) {
      console.error('Recipe validation error:', error);
      setHasError(true);
      setErrorInfo((error as Error).message || 'Unknown error in recipes data');
    }
  }, [recipes, targetColor]);
  
  // If there's an error in the recipe format
  if (hasError) {
    return (
      <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md border-l-4 border-red-500`}>
        <h3 className={`text-lg font-serif mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Error Displaying Recipes
        </h3>
        <p className={`${isDark ? 'text-red-300' : 'text-red-600'}`}>
          There was an error processing the recipe data: {errorInfo}
        </p>
      </div>
    );
  }
  
  // If no recipes, show a message
  if (!recipes || recipes.length === 0) {
    console.log('No recipes available to display');
    return (
      <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <h3 className={`text-lg font-serif mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Paint Mixing Suggestions
        </h3>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          No paint mixing recipes available. Please select a color from the image and make sure
          you have at least one paint brand selected.
        </p>
      </div>
    );
  }
  
  // Format percentage as a readable string
  const formatPercentage = (value: number): string => {
    return value.toFixed(1) + '%';
  };
  
  // Format proportion as a percentage or ratio
  const formatProportion = (proportion: number): string => {
    // Show as percentage if there are multiple paints
    if (recipes.some(recipe => recipe.paints.length > 1)) {
      return Math.round(proportion * 100) + '%';
    }
    // Show as "Pure" if it's a single paint
    return proportion === 1 ? 'Pure' : Math.round(proportion * 100) + '%';
  };

  // Generate detailed mixing instructions based on recipe
  const getMixingInstructions = (recipe: MixingRecipe): string => {
    const paints = recipe.paints;
    
    if (paints.length === 1) {
      return `Use this paint directly without mixing. For subtle adjustments, consider adding a small amount of white for highlights or a complementary color to reduce intensity.`;
    }
    
    if (paints.length === 2) {
      const [paint1, paint2] = paints;
      const ratio = `${Math.round(paint1.proportion * 100)}:${Math.round(paint2.proportion * 100)}`;
      
      // Check for specific mixing cases
      if (paint1.paint.name.toLowerCase().includes('white') || paint2.paint.name.toLowerCase().includes('white')) {
        const whitePaint = paint1.paint.name.toLowerCase().includes('white') ? paint1 : paint2;
        const colorPaint = paint1.paint.name.toLowerCase().includes('white') ? paint2 : paint1;
        return `Start with ${colorPaint.paint.name} and gradually add small amounts of ${whitePaint.paint.name} until you reach the desired lightness. Final ratio should be approximately ${ratio}.`;
      }
      
      // Check for complementary colors (creates more neutral tones)
      const isComplementary = paint1.paint.pigmentCodes.some(code => {
        return code.startsWith('PR') || code.startsWith('PO') || code.startsWith('PY');
      }) && paint2.paint.pigmentCodes.some(code => {
        return code.startsWith('PB') || code.startsWith('PG');
      });
      
      if (isComplementary) {
        return `These are complementary colors which will neutralize each other. Start with the more dominant color (${paint1.proportion > paint2.proportion ? paint1.paint.name : paint2.paint.name}) and add the other in very small increments to avoid overmixing. Aim for a ratio of ${ratio}.`;
      }
      
      return `Mix approximately ${ratio} ratio of ${paint1.paint.name} and ${paint2.paint.name}. Start with the color of higher proportion and gradually add the second.`;
    }
    
    if (paints.length >= 3) {
      // Sort paints by proportion for logical mixing order
      const sortedPaints = [...paints].sort((a, b) => b.proportion - a.proportion);
      
      return `For this complex mix:\n1. Start with ${sortedPaints[0].paint.name} (${Math.round(sortedPaints[0].proportion * 100)}%)\n2. Add ${sortedPaints[1].paint.name} (${Math.round(sortedPaints[1].proportion * 100)}%)\n3. Finally add small amounts of ${sortedPaints.slice(2).map(p => `${p.paint.name} (${Math.round(p.proportion * 100)}%)`).join(', ')} to fine-tune the color.`;
    }
    
    return "Mix the paints in the proportions indicated, starting with the paint of highest proportion.";
  };
  
  // Visual representation of the mix
  const MixingVisualization = ({ recipe }: { recipe: MixingRecipe }) => {
    return (
      <div className="mt-3 relative h-6 rounded-full overflow-hidden">
        {recipe.paints.map((paintItem, index) => {
          // Calculate previous proportions total for positioning
          const previousProportions = recipe.paints
            .slice(0, index)
            .reduce((acc, item) => acc + item.proportion, 0);
          
          return (
            <div
              key={index}
              className="absolute top-0 bottom-0 border-r border-white dark:border-gray-700 last:border-r-0"
              style={{
                left: `${previousProportions * 100}%`,
                width: `${paintItem.proportion * 100}%`,
                backgroundColor: paintItem.paint.swatch,
              }}
              title={`${paintItem.paint.name}: ${Math.round(paintItem.proportion * 100)}%`}
            />
          );
        })}
      </div>
    );
  };
  
  console.log('Rendering recipes:', recipes.length);
  
  return (
    <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <h3 className={`text-lg font-serif mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        Mixing Recipes
      </h3>
      
      <div className="flex items-center mb-4">
        <div className="w-full max-w-xs flex items-center">
          <div 
            className="w-10 h-10 rounded-md mr-3 shadow-sm"
            style={{ backgroundColor: targetColor }}
          />
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Target Color
            </p>
            <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {targetColor}
            </p>
          </div>
        </div>
      </div>
      
      {/* Recipe area with scroll capability */}
      <div className="space-y-4 mt-4 pr-1">
        {recipes.map((recipe, index) => {
          console.log(`Rendering recipe #${index+1}:`, recipe);
          const isExpanded = expandedRecipe === index;
          
          return (
          <div 
            key={index} 
            className={`border rounded-md overflow-hidden transition-all duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'} ${isExpanded ? 'shadow-md' : ''}`}
          >
            <div 
              className={`flex items-center p-3 cursor-pointer ${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'}`}
              onClick={() => setExpandedRecipe(isExpanded ? null : index)}
            >
              <div className="flex-shrink-0 flex items-center">
                <div 
                  className="w-8 h-8 rounded-md mr-3 shadow-sm"
                  style={{ backgroundColor: recipe.estimatedHexColor || '#CCCCCC' }}
                />
                <svg 
                  className={`w-5 h-5 mr-2 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''} ${isDark ? 'text-gray-300' : 'text-gray-500'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline flex-wrap gap-2">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Recipe #{index + 1}
                  </p>
                  <span 
                    className={`text-sm rounded-md px-2 py-0.5 ${
                      recipe.matchPercentage > 85
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : recipe.matchPercentage > 70
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    Match: {formatPercentage(recipe.matchPercentage)}
                  </span>
                </div>
                {recipe.description && (
                  <p className={`text-xs italic mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {recipe.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Collapsed quick visualization */}
            {!isExpanded && recipe.paints.length > 1 && (
              <MixingVisualization recipe={recipe} />
            )}
            
            {/* Expanded detailed view */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-3">
                {/* More prominent visualization for expanded view */}
                {recipe.paints.length > 1 && (
                  <div className="mb-4">
                    <MixingVisualization recipe={recipe} />
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
                
                <ul className="space-y-2">
                  {recipe.paints.map((paintItem, paintIndex) => (
                    <li key={paintIndex} className="flex items-start">
                      <div 
                        className="w-6 h-6 rounded-md mr-3 mt-1"
                        style={{ backgroundColor: paintItem.paint.swatch }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                          <p className={`font-medium break-words ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {paintItem.paint.name}
                          </p>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatProportion(paintItem.proportion)}
                          </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {paintItem.paint.brand} · {paintItem.paint.pigmentCodes.join(', ')}
                          {paintItem.paint.opacity && ` · ${paintItem.paint.opacity} opacity`}
                          {paintItem.paint.lightfastness && ` · Lightfastness: ${paintItem.paint.lightfastness}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {/* Detailed mixing instructions */}
                <div className={`mt-4 p-3 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  <h4 className="font-medium mb-1">Mixing Instructions</h4>
                  <p className="whitespace-pre-line">{getMixingInstructions(recipe)}</p>
                  
                  {/* Additional mixing tips based on recipe properties */}
                  {recipe.paints.some(p => p.paint.opacity === 'ST' || p.paint.opacity === 'T') && (
                    <p className="mt-2 text-xs italic">Note: This mix includes semi-transparent or transparent paints. You may need to apply multiple layers for full coverage.</p>
                  )}
                  
                  {recipe.paints.some(p => 
                    p.paint.pigmentCodes.some(code => ['PW6', 'PW4'].includes(code)) && 
                    p.proportion > 0.4
                  ) && (
                    <p className="mt-2 text-xs italic">Tip: This mix contains a significant amount of white. Consider mixing a slightly more saturated version for your first layer to account for color shift when drying.</p>
                  )}
                </div>
                
                {/* Comparative view - target vs mix */}
                <div className="mt-4 flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg shadow-inner"
                      style={{ backgroundColor: targetColor }}
                    ></div>
                    <p className="text-xs mt-1 font-medium">Target</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <svg 
                      className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <p className="text-xs">{formatPercentage(recipe.matchPercentage)}</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg shadow-inner"
                      style={{ backgroundColor: recipe.estimatedHexColor || '#CCCCCC' }}
                    ></div>
                    <p className="text-xs mt-1 font-medium">Mix Result</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>
      
      {/* Enhanced mixing tips section */}
      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}>
        <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Palette Mixing Tips</h4>
        <ul className={`list-disc pl-5 space-y-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          <li>Mix on a clean surface, starting with the paint in the highest proportion.</li>
          <li>For better accuracy, measure paints by volume using a palette knife or mixing tool.</li>
          <li>Mix slightly more than you need to avoid color matching issues if you run out.</li>
          <li>Test your mix by applying a small amount to a scrap surface and allowing it to dry, as oil paints often dry darker.</li>
          <li>Record your successful mixes with notes on proportions for future reference.</li>
        </ul>
      </div>
    </div>
  );
};

export default PaintMixingDisplay; 