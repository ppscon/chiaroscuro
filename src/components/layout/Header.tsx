import React from 'react';
import { Sun, Moon, Save, Settings, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <header className={`px-6 py-4 flex justify-between items-center border-b transition-colors ${
      isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <div className="flex items-center">
        {/* Logo area - replace with your actual logo */}
        <div className="mr-2 h-8 w-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pigment-500 to-pigment-700 rounded-lg transform rotate-45"></div>
          <div className="absolute inset-0 flex items-center justify-center font-serif text-white text-xl font-bold">C</div>
        </div>
        <h1 className="text-2xl font-serif font-semibold">Chiaroscuro</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          className={`p-2 rounded-full transition-colors ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-label="Help & Information"
          title="Help & Information"
        >
          <Info size={20} />
        </button>
        
        <button 
          className={`p-2 rounded-full transition-colors ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={20} />
        </button>
        
        <button 
          className={`p-2 rounded-full transition-colors ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-label="Save"
          title="Save current recipes"
        >
          <Save size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;