import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const DaVinciChiaroscuro: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`flex-1 overflow-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-canvas-50'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
          Leonardo da Vinci's Mastery of Chiaroscuro in the Mona Lisa
        </h1>
        
        <div className="mb-8">
          <div className="aspect-w-2 aspect-h-3 mb-4 bg-gray-200 rounded-lg overflow-hidden">
            {/* This would be the Mona Lisa image - using placeholder for now */}
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500">Mona Lisa Image</span>
            </div>
          </div>
          <p className="text-sm text-center italic text-gray-600 dark:text-gray-400">
            "La Gioconda" (Mona Lisa), c. 1503-1506, Leonardo da Vinci
          </p>
        </div>
        
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
  );
};

export default DaVinciChiaroscuro;