import React, { useState } from 'react';
import { Droplet, Palette, Sun, Moon, ArrowRight } from 'lucide-react';

interface ArtisticLandingPageProps {
  onEnterApp: () => void;
}

interface ColorPoint {
  id: string;
  position: { top: string; left: string };
  label: string;
  color: string;
  description: string;
  paintMix: string;
}

// Accept onEnterApp as a prop
const ArtisticLandingPage: React.FC<ArtisticLandingPageProps> = ({ onEnterApp }) => {
  const [activePoint, setActivePoint] = useState<string | null>(null);
  
  // Points of interest on the painting with color theory information
  const colorPoints: ColorPoint[] = [
    {
      id: 'highlight',
      position: { top: '25%', left: '22%' },
      label: 'Highlight',
      color: 'RGB(231, 207, 178)',
      description: 'Notice how the highlight areas contain more white and show the influence of the light source.',
      paintMix: 'Titanium White (PW6) 70%, Yellow Ochre (PY42) 20%, Cadmium Red Light (PR108) 10%'
    },
    {
      id: 'midtone',
      position: { top: '35%', left: '55%' },
      label: 'Midtone (Local Color)',
      color: 'RGB(191, 153, 124)',
      description: 'Midtones reveal the true local color of the subject - the app helps you identify these areas.',
      paintMix: 'Yellow Ochre (PY42) 45%, Titanium White (PW6) 40%, Burnt Sienna (PBr7) 15%'
    },
    {
      id: 'shadow',
      position: { top: '60%', left: '22%' },
      label: 'Shadow',
      color: 'RGB(87, 78, 59)',
      description: 'Shadow areas aren\'t simply darker versions of the local color but often shift in hue.',
      paintMix: 'Burnt Umber (PBr7) 50%, Ultramarine Blue (PB29) 30%, Yellow Ochre (PY42) 20%'
    },
    {
      id: 'reflected',
      position: { top: '70%', left: '65%' },
      label: 'Reflected Light',
      color: 'RGB(119, 101, 73)',
      description: 'Subtle warm bounce light illuminates shadow areas, adding depth and dimension.',
      paintMix: 'Raw Umber (PBr7) 40%, Yellow Ochre (PY42) 40%, Burnt Sienna (PBr7) 20%'
    },
    {
      id: 'background',
      position: { top: '28%', left: '48%' },
      label: 'Background',
      color: 'RGB(150, 128, 87)',
      description: 'The unified warm neutral background creates harmony and focuses attention on the subjects.',
      paintMix: 'Yellow Ochre (PY42) 60%, Raw Umber (PBr7) 30%, Titanium White (PW6) 10%'
    },
    {
      id: 'hat-left',
      position: { top: '18%', left: '32%' },
      label: 'Dark Hat (Deep Shadow)',
      color: 'RGB(42, 39, 31)',
      description: 'Darkest areas of the painting create depth and define forms - notice how they still contain color, not just black.',
      paintMix: 'Ivory Black (PBk9) 60%, Ultramarine Blue (PB29) 25%, Burnt Umber (PBr7) 15%'
    },
    {
      id: 'hat-right',
      position: { top: '14%', left: '65%' },
      label: 'Hat Rim (Sharp Edge)',
      color: 'RGB(53, 48, 38)',
      description: 'Hard edges with high contrast help define important elements and direct the viewer\'s eye through the composition.',
      paintMix: 'Burnt Umber (PBr7) 45%, Ivory Black (PBk9) 40%, Ultramarine Blue (PB29) 15%'
    }
  ];

  // Helper functions to determine active state styles
  const getButtonStyles = (pointId: string) => {
    return `absolute w-14 h-14 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 border-4 transition-all duration-200 ${
      activePoint === pointId 
        ? 'bg-white border-amber-500 scale-125 z-10 shadow-xl' 
        : 'bg-white/90 border-amber-900/70 hover:scale-110 shadow-lg'
    }`;
  };
  
  const getIconForPoint = (pointId: string) => {
    switch(pointId) {
      case 'highlight': return <Sun size={28} className="text-amber-500" />;
      case 'shadow': return <Moon size={28} className="text-amber-800" />;
      case 'hat-left': return <Moon size={28} className="text-stone-900" />;
      case 'hat-right': return <Moon size={28} className="text-stone-800" />;
      case 'midtone': return <Palette size={28} className="text-amber-600" />;
      default: return <Droplet size={28} className="text-amber-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D2B48C] to-[#8B6914]">
      {/* Hero Section */}
      <header className="pt-6 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex flex-col items-center">
              <img 
                src="/images/palette.png" 
                alt="Artist Palette" 
                className="h-32 w-auto"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-light text-amber-900">Paint Match Lab</h1>
              <p className="text-xl text-stone-600 font-light max-w-2xl mx-auto mt-2">
                Bridging the Digital Canvas and the Artist's Palette
              </p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Showcase with Painting */}
      <main className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Painting with Interactive Points */}
            <div className="md:w-3/4 relative">
              <div className="relative">
                <img 
                  src="/images/LH-Color.png" 
                  alt="Laurel and Hardy painting by artist" 
                  className="w-full"
                />
                
                {/* Interactive color points */}
                {colorPoints.map(point => (
                  <button
                    key={point.id}
                    className={getButtonStyles(point.id)}
                    style={{ 
                      top: point.position.top, 
                      left: point.position.left
                    }}
                    onClick={() => setActivePoint(point.id)}
                    aria-label={`View ${point.label} color analysis`}
                  >
                    {getIconForPoint(point.id)}
                  </button>
                ))}
              </div>

              {/* Condensed legend */}
              <div className="absolute bottom-5 right-5 bg-black/80 p-3 rounded-md shadow-xl text-sm max-w-fit">
                <p className="text-white font-medium mb-2">Chiaroscuro Points</p>
                <div className="flex gap-5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-300 rounded-full"></span>
                    <span className="text-amber-100 font-medium">Light</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-700 rounded-full"></span>
                    <span className="text-amber-100 font-medium">Shadow</span>
                  </div>
                </div>
              </div>

              {/* Painting attribution - semi-transparent box with white text and red signature */}
              <div className="absolute bottom-5 left-5 text-left bg-black/40 p-2 rounded">
                <p className="text-white text-sm italic">
                  Original painting, oil on canvas 40x30 cm
                </p>
                <p className="font-dancing-script text-red-600 text-2xl mt-1" style={{ letterSpacing: '1px', transform: 'rotate(-2deg)' }}>
                  Thomas Morley
                </p>
              </div>
            </div>
            
            {/* Color Analysis Panel (Dark Mode) */}
            <div className="md:w-1/4 border-t md:border-t-0 md:border-l border-gray-800 bg-gray-900">
              {activePoint ? (
                <div className="p-6 h-full flex items-center">
                  <div className="w-full">
                    <div className="flex items-start gap-5 mb-6">
                      <div 
                        className="w-20 h-20 rounded-md shadow-inner flex-shrink-0 border border-gray-700"
                        style={{ backgroundColor: colorPoints.find(p => p.id === activePoint)?.color }}
                      ></div>
                      
                      <div className="flex-1">
                        <h2 className="text-2xl font-serif text-amber-300 mb-1">
                          {colorPoints.find(p => p.id === activePoint)?.label || ''}
                        </h2>
                        <p className="text-gray-400 text-sm mb-1">
                          {colorPoints.find(p => p.id === activePoint)?.color || ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium text-amber-200 text-base mb-2">Color Theory:</h3>
                      <p className="text-gray-300 text-base">
                        {colorPoints.find(p => p.id === activePoint)?.description || ''}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-amber-200 text-base mb-2">Suggested Paint Mixture:</h3>
                      <div className="p-4 bg-gray-800 rounded-md border border-gray-700 text-gray-300 text-base">
                        {colorPoints.find(p => p.id === activePoint)?.paintMix || ''}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
                      <Palette size={32} className="text-amber-300" />
                    </div>
                    <h3 className="text-xl font-medium text-amber-300 mb-2">Color Analysis</h3>
                    <p className="text-gray-400 text-base">
                      Click on any colored point on the painting to see detailed color information and paint mixing guidance.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* App Features Section */}
      <section className="py-16 px-4 bg-white border-t border-amber-100">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-serif text-amber-900 mb-4">Translating Digital Colors to Physical Paints</h2>
          <p className="text-lg text-stone-600 max-w-3xl mx-auto">
            Our application bridges the gap between what you see on screen and what you mix on your palette
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-amber-50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Droplet size={28} className="text-amber-800" />
            </div>
            <h3 className="text-xl font-medium text-amber-900 mb-3">Color Identification</h3>
            <p className="text-stone-600">
              Select any color from your reference image and our algorithm identifies its precise values
            </p>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Palette size={28} className="text-amber-800" />
            </div>
            <h3 className="text-xl font-medium text-amber-900 mb-3">Paint Formulation</h3>
            <p className="text-stone-600">
              Receive precise mixing ratios for your selected artist-grade oil paint brands
            </p>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Sun size={28} className="text-amber-800" />
            </div>
            <h3 className="text-xl font-medium text-amber-900 mb-3">Lighting Guidance</h3>
            <p className="text-stone-600">
              Learn to identify true local colors vs. highlights and shadows for accurate color matching
            </p>
          </div>
        </div>
        
        <div className="max-w-md mx-auto mt-12 text-center">
          <button 
            onClick={onEnterApp} 
            className="px-8 py-4 bg-amber-800 hover:bg-amber-900 text-white rounded-md font-medium transition flex items-center justify-center gap-2 mx-auto"
          >
            Try the Color Mixer App
            <ArrowRight size={16} />
          </button>
          <p className="text-stone-500 text-sm mt-3">
            Supports Winsor & Newton, Michael Harding, Gamblin, and more
          </p>
        </div>
      </section>
      
      {/* Artist Quote */}
      <section className="py-20 px-4 bg-amber-800 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-2xl font-serif italic text-amber-100 mb-6">
            "Color is my day-long obsession, joy and torment."
          </p>
          <p className="text-amber-200">— Claude Monet</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-stone-900 text-stone-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-serif text-white mb-1">Oil Paint Color Mixer</h2>
            <p className="text-sm">Bridging digital and physical color worlds</p>
          </div>
          
          <nav className="flex gap-6">
            <a href="#" className="hover:text-white transition">About</a>
            <a href="#" className="hover:text-white transition">Features</a>
            <a href="#" className="hover:text-white transition">FAQs</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default ArtisticLandingPage;