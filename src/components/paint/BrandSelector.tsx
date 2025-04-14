import React, { useEffect } from 'react';
import { usePaint } from '../../context/PaintContext';
import { useTheme } from '../../context/ThemeContext';

const BrandSelector: React.FC = () => {
  const { 
    availableBrands, 
    selectedBrands, 
    toggleBrandSelection,
    selectAllBrands,
    clearBrandSelection,
    getAllPaints
  } = usePaint();
  
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Select at least one brand by default if none are selected
  useEffect(() => {
    if (selectedBrands.length === 0) {
      // Default select Winsor & Newton, Gamblin, and Michael Harding
      toggleBrandSelection('winsor-newton');
      toggleBrandSelection('gamblin');
      toggleBrandSelection('michael-harding');
    }
    
    // Debug: Log available paints when brands change
    console.log(`Selected brands (${selectedBrands.length}):`, selectedBrands);
    const availablePaints = getAllPaints();
    console.log(`Available paints (${availablePaints.length}):`, 
      availablePaints.map(p => `${p.name} (${p.brand})`).slice(0, 5));
  }, [selectedBrands, toggleBrandSelection, getAllPaints]);
  
  return (
    <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <h3 className={`text-lg font-serif mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        Paint Brands Available
      </h3>
      
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Color matching is performed using these established paint brands:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {availableBrands.filter(brand => selectedBrands.includes(brand.id)).map((brand) => (
          <div 
            key={brand.id} 
            className={`
              flex items-center p-3 rounded-md border
              ${isDark ? 'bg-pigment-900 border-pigment-700' : 'bg-pigment-50 border-pigment-200'}
            `}
          >
            <div className="w-3 h-3 mr-3 rounded-full bg-pigment-600"></div>
            <span className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {brand.name}
            </span>
          </div>
        ))}
      </div>
      
      <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Paint Match Lab analyzes colors using professional-grade artist paints to provide accurate color matching.
      </p>
    </div>
  );
};

export default BrandSelector; 