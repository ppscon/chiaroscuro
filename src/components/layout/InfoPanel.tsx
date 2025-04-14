import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface InfoPanelProps {
  show: boolean;
  onClose: () => void;
  content?: 'chiaroscuro' | 'pigments' | 'mixing';
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  show, 
  onClose, 
  content = 'chiaroscuro' 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (!show) return null;
  
  return (
    <div 
      className={`w-96 overflow-auto border-l transition-colors ${
        isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-xl font-medium">
            {content === 'chiaroscuro' && 'Chiaroscuro Guide'}
            {content === 'pigments' && 'Pigment Information'}
            {content === 'mixing' && 'Mixing Tips'}
          </h2>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>
        
        {content === 'chiaroscuro' && (
          <ChiaroscuroContent isDark={isDark} />
        )}
        
        {content === 'pigments' && (
          <PigmentContent isDark={isDark} />
        )}
        
        {content === 'mixing' && (
          <MixingContent isDark={isDark} />
        )}
      </div>
    </div>
  );
};

// Content for different panel types
const ChiaroscuroContent: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className="space-y-6">
    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      Understanding light and shadow is key to selecting the right color to match.
    </p>
    
    <div className="space-y-5">
      <div>
        <h3 className="font-medium mb-1">Highlight</h3>
        <div className="flex items-center mb-1">
          <div className="w-6 h-6 rounded-full bg-gray-100 mr-2 border border-gray-300"></div>
          <p className="text-sm">Brightest area, often washed out</p>
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-gray-400 to-white rounded-full"></div>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Halftone</h3>
        <div className="flex items-center mb-1">
          <div className="w-6 h-6 rounded-full bg-red-600 mr-2"></div>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Best for color matching!</p>
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-red-900 to-red-500 rounded-full"></div>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Shadow</h3>
        <div className="flex items-center mb-1">
          <div className="w-6 h-6 rounded-full bg-red-900 mr-2"></div>
          <p className="text-sm">Darker area, often has less saturation</p>
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-black to-red-800 rounded-full"></div>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Reflected Light</h3>
        <div className="flex items-center mb-1">
          <div className="w-6 h-6 rounded-full bg-red-800 mr-2 border border-purple-300"></div>
          <p className="text-sm">Often affected by nearby colors</p>
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-red-900 via-red-800 to-purple-900 rounded-full"></div>
      </div>
    </div>
    
    <div className="pt-6 border-t border-gray-600">
      <h3 className="font-medium text-lg mb-3">Historical Context</h3>
      <p className="text-sm mb-3">
        The term <em>chiaroscuro</em> comes from Italian meaning "light-dark." Renaissance 
        masters like Leonardo da Vinci used this technique to create volume and depth in their paintings.
      </p>
      <p className="text-sm">
        When selecting colors from reference images, understanding chiaroscuro helps you 
        identify the true local color of objects, separating it from lighting effects.
      </p>
    </div>
    
    {/* Tips for Color Selection - Added from ColorPicker */}
    <div className="pt-6 border-t border-gray-600">
      <h3 className="font-medium text-lg mb-3">Tips for Color Selection</h3>
      <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>
          <strong>Understanding Chiaroscuro:</strong> The interplay of light and shadow in visual art.
        </p>
        <p>
          For best results, select the "halftone" or mid-tone areas of your subject - 
          avoid highlights (too bright) and shadows (too dark).
        </p>
        <p>
          The halftone represents the true local color of an object, while highlights and shadows
          are influenced by lighting conditions.
        </p>
        <div className="mt-4">
          <p className="font-medium mb-1">Key Points for Color Identification:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identify the local color in areas with direct, even lighting</li>
            <li>Avoid specular highlights (reflections) which appear white regardless of object color</li>
            <li>Look for color in shadows - shadows aren't just darker versions of local color</li>
          </ul>
        </div>
      </div>
    </div>
    
    {/* Professional Mixing Techniques - Added from ColorPicker */}
    <div className="pt-6 border-t border-gray-600">
      <h3 className="font-medium text-lg mb-3">Professional Mixing Techniques</h3>
      <div className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <div>
          <p className="font-medium mb-1">Chromatic Blacks vs. Black Paint</p>
          <p>
            Professional artists rarely use black paint directly. Instead, they create "chromatic blacks" 
            by mixing complementary colors such as Burnt Umber + Ultramarine Blue (warm black) or 
            Phthalo Blue + Alizarin Crimson (cool black).
          </p>
        </div>
        
        <div>
          <p className="font-medium mb-1">Controlling Value</p>
          <p>
            To darken a color, avoid using black. Instead, mix in its complementary color
            or use a chromatic black. To lighten, white works for tints, but consider using yellow
            for warm colors to maintain vibrancy.
          </p>
        </div>
        
        <div>
          <p className="font-medium mb-1">Controlling Chroma</p>
          <p>
            To reduce a color's intensity, add a small amount of its complement rather than 
            grey or black. This creates more harmonious mixes while maintaining the color's life.
          </p>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-right">
        <a 
          href="https://willkempartschool.com/hue-value-chroma-the-3-keys-to-colour-mixing/" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${isDark ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'}`}
        >
          Learn more →
        </a>
      </div>
    </div>
  </div>
);

const PigmentContent: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className="space-y-4">
    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      Understanding your pigments is essential for accurate color mixing.
    </p>
    
    <div>
      <h3 className="font-medium mb-2">Pigment Properties</h3>
      
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium">Opacity</h4>
          <p className="text-xs mb-1">How transparent or opaque a pigment appears</p>
          <div className="flex items-center text-xs">
            <span className="w-6 text-center font-bold">O</span>
            <span className="w-6 text-center font-bold">SO</span>
            <span className="w-6 text-center font-bold">ST</span>
            <span className="w-6 text-center font-bold">T</span>
          </div>
          <div className="flex items-center text-xs">
            <span className="w-6 text-center">Opaque</span>
            <span className="w-6 text-center">Semi-Opaque</span>
            <span className="w-6 text-center">Semi-Transparent</span>
            <span className="w-6 text-center">Transparent</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium">Tinting Strength</h4>
          <p className="text-xs">How strongly a pigment affects other colors when mixed</p>
          <div className="mt-1 flex space-x-2">
            <div className="flex-1 p-1 bg-blue-900 text-white text-xs text-center rounded">High</div>
            <div className="flex-1 p-1 bg-blue-700 text-white text-xs text-center rounded">Medium</div>
            <div className="flex-1 p-1 bg-blue-500 text-white text-xs text-center rounded">Low</div>
          </div>
          <p className="text-xs mt-1">
            High tinting strength pigments (like Phthalo Blue) require very small amounts in mixes.
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium">CI Pigment Codes</h4>
          <p className="text-xs">International standardized pigment identifiers</p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div className={`p-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className="font-bold">PB29:</span> Ultramarine Blue
            </div>
            <div className={`p-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className="font-bold">PR108:</span> Cadmium Red
            </div>
            <div className={`p-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className="font-bold">PY35:</span> Cadmium Yellow
            </div>
            <div className={`p-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className="font-bold">PW6:</span> Titanium White
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MixingContent: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className="space-y-4">
    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      Tips for successful oil paint mixing.
    </p>
    
    <div>
      <h3 className="font-medium mb-2">Mixing Principles</h3>
      <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span>Start with the main color, then adjust with secondary colors in small amounts</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span>Mix colors with similar opacity for more predictable results</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span>When using high tinting strength colors (like Phthalo), start with tiny amounts</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span>Test your mixture on scrap paper or canvas before applying to your work</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">•</span>
          <span>Remember that oil colors darken slightly as they dry</span>
        </li>
      </ul>
    </div>
    
    <div className="mt-4">
      <h3 className="font-medium mb-2">Color Relationships</h3>
      <div className="aspect-square relative rounded-full overflow-hidden border border-gray-400 mb-2">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-blue-500 to-green-500 opacity-70"></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          Color wheel simplified
        </div>
      </div>
      <p className="text-xs">
        Complementary colors (opposite on the wheel) neutralize each other when mixed.
        For example, mix a small amount of purple into yellow to desaturate it.
      </p>
    </div>
  </div>
);

export default InfoPanel;