import React, { useState } from 'react';
import { Upload, Eye, Palette, Book, Info, BarChart2, Home } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  showInfoPanel: boolean;
  setShowInfoPanel: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedTab, 
  setSelectedTab, 
  showInfoPanel, 
  setShowInfoPanel 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Define tabs
  const tabs = [
    { id: 'home', icon: <Home size={24} />, title: 'Home' },
    { id: 'canvas', icon: <Upload size={24} />, title: 'Upload Image' },
    { id: 'picker', icon: <Eye size={24} />, title: 'Pick Color' },
    { id: 'analyze', icon: <BarChart2 size={24} />, title: 'Analyze Image' },
    { id: 'mixer', icon: <Palette size={24} />, title: 'Paint Mixer' },
    { id: 'education', icon: <Book size={24} />, title: 'Learn' },
  ];
  
  return (
    <div 
      className={`w-16 flex flex-col items-center py-6 border-r transition-colors ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Tab Buttons */}
      <div className="space-y-4">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`p-3 rounded-lg transition-all transform ${
              selectedTab === tab.id 
                ? isDark 
                  ? 'bg-pigment-700 text-white shadow-lg scale-105' 
                  : 'bg-pigment-100 text-pigment-800 shadow'
                : isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={tab.title}
            aria-label={tab.title}
          >
            {tab.icon}
          </button>
        ))}
      </div>
      
      {/* Bottom Section */}
      <div className="flex-grow"></div>
      
      <button 
        onClick={() => setShowInfoPanel(!showInfoPanel)}
        className={`p-3 rounded-lg transition-colors ${
          showInfoPanel 
            ? isDark 
              ? 'bg-pigment-700 text-white' 
              : 'bg-pigment-100 text-pigment-800'
            : isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        title="Toggle info panel"
        aria-label="Toggle info panel"
      >
        <Info size={24} />
      </button>
    </div>
  );
};

export default Sidebar;