import React, { createContext, useContext, useState } from 'react';

// Define Color Types
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface LABColor {
  L: number;
  a: number;
  b: number;
}

export interface SelectedColor {
  rgb: RGBColor;
  hex: string;
  lab?: LABColor;
  pixelCoords?: { x: number, y: number };
  isOutOfGamut?: boolean;
}

interface ColorContextType {
  selectedColor: SelectedColor | null;
  setSelectedColor: (color: SelectedColor | null) => void;
  colorHistory: SelectedColor[];
  addToHistory: (color: SelectedColor) => void;
  clearHistory: () => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const ColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedColor, setSelectedColor] = useState<SelectedColor | null>(null);
  const [colorHistory, setColorHistory] = useState<SelectedColor[]>([]);

  const addToHistory = (color: SelectedColor) => {
    setColorHistory(prev => {
      // Only keep the latest 10 colors in history
      const newHistory = [color, ...prev];
      return newHistory.slice(0, 10);
    });
  };

  const clearHistory = () => {
    setColorHistory([]);
  };

  return (
    <ColorContext.Provider
      value={{
        selectedColor,
        setSelectedColor,
        colorHistory,
        addToHistory,
        clearHistory
      }}
    >
      {children}
    </ColorContext.Provider>
  );
};

export const useColor = (): ColorContextType => {
  const context = useContext(ColorContext);
  
  if (context === undefined) {
    throw new Error('useColor must be used within a ColorProvider');
  }
  
  return context;
};