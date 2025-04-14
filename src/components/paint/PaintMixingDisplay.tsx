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
          return (
          <div 
            key={index} 
            className={`border rounded-md overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div 
              className={`flex items-center p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div 
                className="w-8 h-8 rounded-md mr-3 shadow-sm"
                style={{ backgroundColor: recipe.estimatedHexColor || '#CCCCCC' }}
              />
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
            
            <div className="p-3">
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
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Add specific mixing guidance based on recipe type */}
              {recipe.paints.length > 1 && (
                <div className={`mt-3 p-2 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  {recipe.paints.some(p => p.paint.name.toLowerCase().includes('white')) ? (
                    <p>Tip: Add the white gradually to maintain color intensity while adjusting value.</p>
                  ) : recipe.paints.some(p => 
                      p.paint.name.toLowerCase().includes('ultramarine') && 
                      p.paint.name.toLowerCase().includes('umber')
                    ) ? (
                    <p>Tip: This chromatic black mixture creates richer, more natural darks than using black paint directly.</p>
                  ) : recipe.paints.length === 3 ? (
                    <p>Tip: Mix the two darkest colors first, then gradually add the lighter color to adjust.</p>
                  ) : (
                    <p>Tip: Start with the paint with the highest proportion and gradually mix in the others.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default PaintMixingDisplay; 