import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ColorProvider } from './context/ColorContext';
import { PaintProvider } from './context/PaintContext';
import Layout from './components/layout/Layout';
import ImageUploader from './components/canvas/ImageUploader';
import DaVinciChiaroscuro from './components/education/DaVinciChiaroscuro';
import ColorPicker from './components/color/ColorPicker';
import ImageAnalyzer from './components/canvas/ImageAnalyzer';
import ArtisticLandingPage from './pages/LandingPage';

// Import CSS for fonts
import './assets/fonts/fonts.css';

const App: React.FC = () => {
  // Set default tab to 'home' for the landing page
  const [activeTab, setActiveTab] = useState('home');
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  
  const handleImageLoad = (image: HTMLImageElement, file: File) => {
    setSelectedImage(image);
    // After loading the image, switch to the color picker tab
    setActiveTab('picker');
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Function to navigate from landing page to app
  const handleEnterApp = () => {
    setActiveTab('canvas');
  };
  
  return (
    <ThemeProvider>
      <ColorProvider>
        <PaintProvider>
          {activeTab === 'home' ? (
            <ArtisticLandingPage onEnterApp={handleEnterApp} />
          ) : (
            <Layout activeTab={activeTab} onTabChange={handleTabChange}>
              {activeTab === 'canvas' && (
                <ImageUploader onImageLoad={handleImageLoad} />
              )}
              
              {activeTab === 'education' && (
                <DaVinciChiaroscuro />
              )}
              
              {/* Use the new ColorPicker component */}
              {activeTab === 'picker' && selectedImage && (
                <ColorPicker image={selectedImage} />
              )}
              
              {/* Add the Image Analyzer component */}
              {activeTab === 'analyze' && selectedImage && (
                <ImageAnalyzer preloadedImage={selectedImage} />
              )}
              
              {activeTab === 'analyze' && !selectedImage && (
                <ImageAnalyzer />
              )}
              
              {activeTab === 'mixer' && (
                <div className="flex-1 flex items-center justify-center">
                  <p>Paint Mixer Component (Coming Soon)</p>
                </div>
              )}
              
              {/* Prompt to upload an image if needed */}
              {activeTab === 'picker' && !selectedImage && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 text-gray-500">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path 
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Image Selected</h3>
                  <p className="mb-4 text-gray-600">Please upload an image first to use this feature.</p>
                  <button 
                    onClick={() => setActiveTab('canvas')}
                    className="px-4 py-2 bg-pigment-600 text-white rounded-md hover:bg-pigment-700 transition-colors"
                  >
                    Go to Upload Image
                  </button>
                </div>
              )}
            </Layout>
          )}
        </PaintProvider>
      </ColorProvider>
    </ThemeProvider>
  );
};

export default App;