import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/layout/Layout';
import CaravaggioSalome from '../components/education/CaravaggioSalome';

interface CaravaggioPageProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CaravaggioPage: React.FC<CaravaggioPageProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <Layout activeTab={activeTab} onTabChange={onTabChange}>
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto py-8">
          <CaravaggioSalome />
          
          <div className={`mt-12 p-6 rounded-md shadow-md max-w-4xl mx-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className="text-2xl font-serif mb-4">About Chiaroscuro</h2>
            <p className="mb-4">
              This painting exemplifies why Caravaggio is considered a master of chiaroscuro - the technique of 
              using strong contrasts between light and dark to create a sense of volume and drama in painting.
            </p>
            <p className="mb-4">
              The term "chiaroscuro" comes from the Italian words "chiaro" (light) and "scuro" (dark), and 
              Caravaggio's approach to this technique was so revolutionary that it influenced generations of 
              artists after him, giving rise to the term "Caravaggism" to describe his followers.
            </p>
            <p>
              In "Salome receives the Head of John the Baptist," observe how Caravaggio uses dramatic lighting 
              to create a theatrical atmosphere and direct the viewer's attention to the key elements of the 
              narrative. The figures emerge from the darkness, illuminated by a strong light source that 
              heightens the emotional impact of the scene.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CaravaggioPage; 