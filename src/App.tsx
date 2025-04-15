import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ColorProvider } from './context/ColorContext';
import { PaintProvider } from './context/PaintContext';
import Layout from './components/layout/Layout';
import ImageUploader from './components/canvas/ImageUploader';
import DaVinciChiaroscuro from './components/education/DaVinciChiaroscuro';
import CaravaggioSalome from './components/education/CaravaggioSalome';
import ColorPicker from './components/color/ColorPicker';
import ImageAnalyzer from './components/canvas/ImageAnalyzer';
import ArtisticLandingPage from './pages/LandingPage';
import PaintMixer from './components/color/PaintMixer';

// Import CSS for fonts
import './assets/fonts/fonts.css';

const App: React.FC = () => {
  // Set default tab to 'home' for the landing page
  const [activeTab, setActiveTab] = useState('home');
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [educationSubject, setEducationSubject] = useState<'davinci' | 'caravaggio'>('caravaggio');
  
  const handleImageLoad = (image: HTMLImageElement, file: File) => {
    setSelectedImage(image);
    // After loading the image, switch to the analyzer tab
    setActiveTab('analyze');
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
                <div className="flex-1 flex flex-col">
                  <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                    <div className="max-w-6xl mx-auto flex gap-4">
                      <button 
                        onClick={() => setEducationSubject('davinci')}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          educationSubject === 'davinci' 
                            ? 'bg-pigment-600 text-white' 
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Leonardo da Vinci
                      </button>
                      <button 
                        onClick={() => setEducationSubject('caravaggio')}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          educationSubject === 'caravaggio' 
                            ? 'bg-pigment-600 text-white' 
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Caravaggio
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    {educationSubject === 'davinci' ? (
                      <DaVinciChiaroscuro />
                    ) : (
                      <CaravaggioSalome />
                    )}
                  </div>
                </div>
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
                <PaintMixer selectedImage={selectedImage} />
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