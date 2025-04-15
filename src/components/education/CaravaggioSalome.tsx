import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Interactive point of interest on the painting
interface PointOfInterest {
  id: string;
  position: { top: string; left: string };
  title: string;
  description: string;
}

const CaravaggioSalome: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [showInDepth, setShowInDepth] = useState(false);
  
  // Define points of interest on the painting
  const points: PointOfInterest[] = [
    {
      id: 'salome',
      position: { top: '45%', left: '16%' },
      title: 'Salome',
      description: 'Her serious expression and sidelong glance are enigmatic: is she turning away from the head in disgust or shame, appalled at the horror of what she has brought about?'
    },
    {
      id: 'executioner',
      position: { top: '40%', left: '70%' },
      title: 'The Executioner',
      description: 'The brutish executioner places John\'s head on a salver held by Salome. His face is impassive as he thrusts the head towards Salome: he may have wielded the sword but the guilt for the Baptist\'s death lies with her.'
    },
    {
      id: 'maidservant',
      position: { top: '38%', left: '28%' },
      title: 'Elderly Maidservant',
      description: 'The elderly maidservant clasps her hands in grief, setting the emotional tone. In contrast to the young and beautiful Salome is this elderly maidservant, her face wrinkled with age.'
    },
    {
      id: 'john',
      position: { top: '65%', left: '35%' },
      title: 'John\'s Head',
      description: 'The severed head of John the Baptist, the central focus of the painting\'s narrative and emotional power.'
    },
    {
      id: 'chiaroscuro',
      position: { top: '40%', left: '55%' },
      title: 'Chiaroscuro Effect',
      description: 'Note the pronounced chiaroscuro (contrast between light and dark) typical of Caravaggio\'s mature style. He conveys the scene\'s emotional power through a restricted range of color and dramatic lighting.'
    }
  ];
  
  const handlePointClick = (id: string) => {
    setActivePointId(id === activePointId ? null : id);
  };
  
  return (
    <div className={`max-w-[1400px] mx-auto p-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif mb-4">
          Caravaggio: Salome receives the Head of John the Baptist
        </h1>
        <p className="text-sm italic mb-1">
          Michelangelo Merisi da Caravaggio, about 1609-10
        </p>
        <p className="text-sm mb-4">
          Oil on canvas, 91.5 × 106.7 cm - National Gallery, London (NG6389)
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <button 
            onClick={() => setShowInDepth(false)}
            className={`px-4 py-2 rounded-t-md transition-colors ${!showInDepth
              ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900') 
              : (isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-500')
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setShowInDepth(true)}
            className={`px-4 py-2 rounded-t-md transition-colors ${showInDepth
              ? (isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900') 
              : (isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-500')
            }`}
          >
            In-Depth Analysis
          </button>
        </div>
      </div>
      
      {/* Main Content - Side by side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Fixed size approach */}
        <div className="lg:col-span-7">
          <div className="bg-gray-800 rounded p-2 overflow-auto">
            <div className="relative" style={{ width: '900px', maxWidth: '100%', margin: '0 auto' }}>
              <img 
                src="/images/JB.jpg" 
                alt="Caravaggio: Salome receives the Head of John the Baptist" 
                className="rounded-md shadow-lg"
                width="900"
              />
              
              {/* Interactive points overlay */}
              {points.map(point => (
                <button
                  key={point.id}
                  className={`absolute w-8 h-8 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 transition-all duration-200 ${
                    activePointId === point.id 
                      ? 'bg-amber-500 border-white scale-125 z-10' 
                      : 'bg-white/80 border-amber-500 hover:scale-110'
                  }`}
                  style={{ 
                    top: point.position.top, 
                    left: point.position.left 
                  }}
                  onClick={() => handlePointClick(point.id)}
                  aria-label={`View information about ${point.title}`}
                >
                  <span className="sr-only">{point.title}</span>
                </button>
              ))}
            </div>
            
            {/* Caption */}
            <div className="mt-2 text-sm italic text-center text-white pb-2">
              Image © The National Gallery, London
            </div>
          </div>
          
          {/* Selected point info */}
          {activePointId && (
            <div className={`mt-4 p-4 rounded-md border-l-4 border-amber-500 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-md max-w-[900px] mx-auto`}>
              <h3 className="text-xl font-medium mb-2">
                {points.find(p => p.id === activePointId)?.title}
              </h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {points.find(p => p.id === activePointId)?.description}
              </p>
            </div>
          )}
        </div>
        
        {/* Right Column - Info Panels */}
        <div className="lg:col-span-5">
          <div className={`p-6 rounded-md shadow-md ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            {!showInDepth ? (
              <>
                <h2 className="text-xl font-serif mb-4">The Story</h2>
                <p className="mb-4">
                  The story of the death of John the Baptist is related in the Gospel of Mark (6: 16–29). 
                  John had criticised King Herod for marrying his brother's wife, Herodias, and she sought 
                  revenge. At Herod's birthday feast, Herodias's daughter Salome so delighted the King by 
                  her dancing that he promised her anything she wanted. Encouraged by her mother, she asked 
                  for the Baptist's head, and the King had John executed.
                </p>
                <p className="mb-4">
                  This is a late work by Caravaggio, probably painted towards the end of his life. He has 
                  reduced the story to its essentials, focusing on the human tragedy and conveying the scene's 
                  emotional power through a restricted range of colour, pronounced chiaroscuro and dramatic gesture.
                </p>
                <p>
                  The brutish executioner places John's head on a salver held by Salome, whose serious expression 
                  and sidelong glance are enigmatic. An elderly maidservant clasps her hands in grief, setting the 
                  emotional tone. Characteristic of Caravaggio's mature works, the composition appears simple but 
                  actually hides a sophisticated physical and psychological interplay between the main protagonists.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-serif mb-4">In-Depth Analysis</h2>
                <p className="mb-4">
                  This is a late work by Caravaggio, probably painted towards the end of his life in Naples, 
                  where he resided in 1606–7 and again in 1609–10. With an economy typical of his mature works, 
                  Caravaggio has reduced the story to its essentials, focusing on the human tragedy.
                </p>
                <p className="mb-4">
                  He has moved away from the broader colour range and descriptive detail of his Roman works, such 
                  as The Supper at Emmaus, and conveys the scene's emotional power through a more muted palette, 
                  pronounced chiaroscuro and dramatic gestures.
                </p>
                <p className="mb-4">
                  The half-length format brings the figures up close, enhancing the dramatic impact of the scene. 
                  Although the composition appears simple and straightforward, it hides a sophisticated physical 
                  and psychological interplay between the main protagonists.
                </p>
                <p>
                  Salome and the executioner are subtly linked by their poses – the angles of their heads echo 
                  each other and a strong raking light falls across their faces – but their role is very different. 
                  The executioner's face is impassive as he thrusts the head towards Salome: he may have wielded 
                  the sword but the guilt for the Baptist's death lies with her.
                </p>
              </>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2">Caravaggio's Technique</h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Technically, this painting is typical of Caravaggio's late style. The handling of the paint 
                is freer than in his earlier works, with a broad application in place of finely modelled 
                gradations, and the dark ground left deliberately exposed in several areas to provide the 
                mid-tone in the shadows. The marked chiaroscuro and dramatic naturalism of Caravaggio's late 
                style, and his use of people drawn from the streets as models, had an enduring influence on 
                painters in Naples.
              </p>
            </div>
            
            <div className="mt-6">
              <a 
                href="https://www.nationalgallery.org.uk/paintings/michelangelo-merisi-da-caravaggio-salome-receives-the-head-of-john-the-baptist" 
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm inline-block px-4 py-2 rounded-md transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-blue-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                }`}
              >
                View on National Gallery website
              </a>
            </div>
          </div>
          
          <div className={`mt-6 p-6 rounded-md shadow-md ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className="text-lg font-serif mb-3">Caravaggio's Chiaroscuro Mastery</h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              The marked chiaroscuro in this painting demonstrates Caravaggio's mastery of dramatic lighting. 
              He creates a stark contrast between light and dark, illuminating only what is essential to the 
              narrative while leaving the surrounding areas in deep shadow.
            </p>
            
            <h4 className="font-medium mb-2">Key Elements of Caravaggio's Chiaroscuro:</h4>
            <ul className={`list-disc pl-5 mb-4 text-sm space-y-1 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li>Strong directional lighting from a single source</li>
              <li>Deep, enveloping shadows that enhance emotional intensity</li>
              <li>Strategic illumination of important narrative elements</li>
              <li>Heightened three-dimensionality of forms</li>
              <li>Enhanced psychological depth through selective lighting</li>
              <li>Creation of spatial depth in a limited pictorial space</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-sm">
        <p>
          Text content sourced from <a href="https://www.nationalgallery.org.uk/paintings/michelangelo-merisi-da-caravaggio-salome-receives-the-head-of-john-the-baptist" 
            target="_blank" 
            rel="noopener noreferrer"
            className={isDark ? 'text-blue-300' : 'text-blue-600'}
          >
            The National Gallery, London
          </a>. Used for educational purposes only.
        </p>
      </div>
    </div>
  );
};

export default CaravaggioSalome; 