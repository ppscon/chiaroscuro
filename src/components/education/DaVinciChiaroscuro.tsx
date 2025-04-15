import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Added PointOfInterest interface
interface PointOfInterest {
  id: string;
  position: { top: string; left: string };
  title: string;
  description: string;
}

const DaVinciChiaroscuro: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activePointId, setActivePointId] = useState<string | null>(null); // Added state

  // Added points array
  const points: PointOfInterest[] = [
    {
      id: 'eyes',
      position: { top: '20%', left: '48%' },
      title: 'The Gaze & Sfumato',
      description: 'Da Vinci uses sfumato around the eyes, softening the edges and creating a lifelike, slightly mysterious gaze. The shadows are subtle and lack hard lines.'
    },
    {
      id: 'smile',
      position: { top: '32%', left: '50%' },
      title: 'The Enigmatic Smile',
      description: 'Perhaps the most famous example of sfumato. The corners of the mouth blend softly into shadow, making the expression ambiguous and captivating.'
    },
    {
      id: 'hands',
      position: { top: '79%', left: '45%' },
      title: 'Modeled Hands',
      description: 'Observe the gentle chiaroscuro modeling the hands. Light softly defines the form, while shadows create volume and realism without harsh outlines.'
    },
    {
      id: 'landscape',
      position: { top: '30%', left: '80%' },
      title: 'Atmospheric Perspective',
      description: 'The background landscape uses atmospheric perspective, with colors becoming cooler and details less distinct in the distance, enhancing the depth.'
    },
    {
      id: 'face_modeling',
      position: { top: '30%', left: '37%' },
      title: 'Facial Chiaroscuro',
      description: 'The smooth transition from the light on the cheek and forehead to the subtle shadows demonstrates da Vinci\'s mastery of using light and dark to create three-dimensional form.'
    }
  ];
  
  // Added handler function
  const handlePointClick = (id: string) => {
    setActivePointId(id === activePointId ? null : id);
  };
  
  return (
    <div className={`flex-1 overflow-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-canvas-50'}`}>
      <div className="max-w-[1400px] mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
          Leonardo da Vinci's Mastery of Chiaroscuro in the Mona Lisa
        </h1>
        
        {/* Main Content - Side by side layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Image and Active Point Info */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              {/* Image section with relative positioning */}
              <div className="relative mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg mx-auto" style={{ maxWidth: '500px' }}>
                <img 
                  src="/images/ML.jpg" 
                  alt="Mona Lisa by Leonardo da Vinci" 
                  className="block w-full h-auto" 
                />
                {/* Interactive points overlay */}
                {points.map(point => (
                  <button
                    key={point.id}
                    className={`absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 transition-all duration-200 ${
                      activePointId === point.id 
                        ? 'bg-blue-500 border-white scale-125 z-10' 
                        : 'bg-white/70 border-blue-500 hover:scale-110'
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
              <p className="text-sm text-center italic text-gray-600 dark:text-gray-400">
                "La Gioconda" (Mona Lisa), c. 1503-1506, Leonardo da Vinci
              </p>
            </div>

            {/* Selected point info display (moved here) */}
            {activePointId && (
              <div className={`mt-4 p-4 rounded-md border-l-4 border-blue-500 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md max-w-[500px] mx-auto`}>
                <h3 className="text-xl font-medium mb-2">
                  {points.find(p => p.id === activePointId)?.title}
                </h3>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {points.find(p => p.id === activePointId)?.description}
                </p>
              </div>
            )}
          </div>
          
          {/* Right Column - Explanatory Text */}
          <div className="lg:col-span-5">
             <div className={`p-6 rounded-md shadow-md h-fit ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
               <div className="prose dark:prose-invert prose-lg max-w-none">
                 <h2>The Pioneer of Sfumato</h2>
                 <p>
                   Leonardo da Vinci revolutionized the use of light and shadow in Renaissance painting through his 
                   development of the <em>sfumato</em> technique, a specialized form of chiaroscuro. The word "sfumato" 
                   comes from the Italian "sfumare," meaning "to evaporate like smoke" — perfectly describing the 
                   delicate, smoke-like gradations between light and shadow in his works.
                 </p>
                 
                 <p>
                   The Mona Lisa stands as perhaps the most famous example of da Vinci's mastery of chiaroscuro and 
                   sfumato. Look carefully at the corners of the subject's mouth and eyes — areas that are neither 
                   in full light nor complete shadow. Da Vinci applied extremely thin layers of translucent paint, 
                   sometimes up to 40 layers, creating transitions so subtle that they appear "without lines or 
                   borders, in the manner of smoke."
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                   <div>
                     <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                       <h3 className="text-lg font-semibold mb-2">Key Elements in the Mona Lisa</h3>
                       <ul className="list-disc pl-5 space-y-2">
                         <li>
                           <strong>The face:</strong> Notice how the cheekbones and forehead catch the light, 
                           while the eyes recede slightly into shadow, creating depth.
                         </li>
                         <li>
                           <strong>The famous smile:</strong> The corners of the mouth are softened by shadow, 
                           creating the enigmatic expression that seems to shift as you look at it.
                         </li>
                         <li>
                           <strong>The hands:</strong> Da Vinci used subtle shadowing to model the form of the hands, 
                           making them appear three-dimensional against the darker clothing.
                         </li>
                         <li>
                           <strong>The background:</strong> The atmospheric perspective created by progressively 
                           lighter tones in the landscape enhances the three-dimensionality of the portrait.
                         </li>
                       </ul>
                     </div>
                   </div>
                   
                   <div>
                     <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                       <h3 className="text-lg font-semibold mb-2">Color Theory Application</h3>
                       <p className="mb-2">
                         Da Vinci understood that color is not merely decorative but structural—it helps create 
                         form and space:
                       </p>
                       <ul className="list-disc pl-5 space-y-2">
                         <li>
                           He used warm earth tones for the skin, with subtle variations to suggest form.
                         </li>
                         <li>
                           Shadows are not simply darker versions of local colors, but contain subtle complementary 
                           hues to create depth and atmosphere.
                         </li>
                         <li>
                           The background uses aerial perspective with cooler, bluer tones to suggest distance.
                         </li>
                         <li>
                           Transitions between values are barely perceptible, creating the illusion of continuous form.
                         </li>
                       </ul>
                     </div>
                   </div>
                 </div>
                 
                 <h2>The Importance of Halftones</h2>
                 <p>
                   Da Vinci's genius lay in his understanding of halftones—the transitional values between highlight 
                   and shadow. In the Mona Lisa, these halftones are where most of the painting's subtle modeling occurs. 
                   When looking at reference images today, understanding these transitions is crucial for accurately 
                   interpreting the true local color of an object.
                 </p>
                 
                 <p>
                   When using our color picker tool, the halftone region will give you the most accurate representation 
                   of the "local color"—the actual color of the object itself, rather than the color it appears due 
                   to lighting effects.
                 </p>
                 
                 <blockquote>
                   "The painter who draws merely by practice and by eye, without any reason, is like a mirror which 
                   copies everything placed in front of it without being conscious of their existence."
                   <cite>— Leonardo da Vinci</cite>
                 </blockquote>
                 
                 <h2>Da Vinci's Painting Technique</h2>
                 <p>
                   Leonardo approached painting with scientific precision. He would:
                 </p>
                 
                 <ol>
                   <li>Begin with careful observation of light and shadow in nature</li>
                   <li>Prepare his panel with a light ground</li>
                   <li>Create an underdrawing with precise proportions</li>
                   <li>Apply an underpainting in monochrome to establish values</li>
                   <li>Build up color through multiple thin glazes of translucent paint</li>
                   <li>Carefully blend transitions between light and shadow</li>
                 </ol>
                 
                 <p>
                   This methodical layering approach is why his paintings achieve such subtle modeling and luminosity. 
                   The transparent glazes allow light to penetrate the paint layers and reflect back, creating an 
                   inner glow that flat, opaque application cannot achieve.
                 </p>
                 
                 <h2>Contemporary Applications</h2>
                 <p>
                   Understanding da Vinci's approach to chiaroscuro and color can help modern painters in several ways:
                 </p>
                 
                 <ul>
                   <li>Recognize that form is primarily described through value changes, not color changes</li>
                   <li>Use halftones to accurately identify local colors when working from reference</li>
                   <li>Consider how light interacts with objects rather than simply copying what you see</li>
                   <li>Build depth through layering and glazing rather than applying opaque paint in a single layer</li>
                 </ul>
                 
                 <p>
                   Our color mixing tool helps you apply these principles by identifying the true local colors in your 
                   reference images and providing precise oil paint mixtures to match those colors, enabling you to 
                   focus on the artistry of light and shadow in your own work.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaVinciChiaroscuro;