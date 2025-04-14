import React from 'react';
import { ImageAnalysis } from '../../utils/imageAnalysis';

interface PaintingPlanDisplayProps {
  analysis: ImageAnalysis | null;
  isLoading: boolean;
}

const ColorSwatch = ({ color, percentage }: { color: string; percentage: number }) => (
  <div className="flex items-center mb-2">
    <div
      className="w-8 h-8 rounded-md border border-gray-300"
      style={{ backgroundColor: color }}
    />
    <div className="ml-2 flex-1">
      <div className="h-4 bg-gray-200 rounded-full">
        <div
          className="h-4 bg-indigo-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
    <span className="ml-2 text-sm text-gray-600">{percentage}%</span>
  </div>
);

const PaintingPlanDisplay: React.FC<PaintingPlanDisplayProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Painting Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color Analysis */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-lg font-medium mb-2">Color Analysis</h3>
          <div className="mb-4">
            <h4 className="text-md font-medium">Dominant Colors</h4>
            <div className="mt-2">
              {analysis.dominantColors.map((color, index) => (
                <ColorSwatch 
                  key={index} 
                  color={color.color} 
                  percentage={color.percentage} 
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Temperature Analysis */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-lg font-medium mb-2">Temperature Analysis</h3>
          <p className="text-md font-medium">
            Overall: <span className={`font-bold ${
              analysis.temperatureAnalysis.overall === 'warm' 
                ? 'text-red-600' 
                : analysis.temperatureAnalysis.overall === 'cool' 
                  ? 'text-blue-600' 
                  : 'text-gray-600'
            }`}>
              {analysis.temperatureAnalysis.overall.toUpperCase()}
            </span>
          </p>
          <div className="flex items-center mt-2">
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="h-4 bg-red-500"
                style={{ width: `${analysis.temperatureAnalysis.warmPercentage}%` }}
              ></div>
              <div
                className="h-4 bg-blue-500"
                style={{ width: `${analysis.temperatureAnalysis.coolPercentage}%` }}
              ></div>
              <div
                className="h-4 bg-gray-500"
                style={{ width: `${analysis.temperatureAnalysis.neutralPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Warm: {analysis.temperatureAnalysis.warmPercentage}%</span>
            <span>Cool: {analysis.temperatureAnalysis.coolPercentage}%</span>
            <span>Neutral: {analysis.temperatureAnalysis.neutralPercentage}%</span>
          </div>
        </div>
        
        {/* Chroma Analysis */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-lg font-medium mb-2">Chroma/Saturation</h3>
          <p className="text-md font-medium">
            Overall: <span className="font-bold">{analysis.chromaAnalysis.overall.toUpperCase()}</span>
          </p>
          <div className="flex items-center mt-2">
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="h-4 bg-purple-600"
                style={{ width: `${analysis.chromaAnalysis.highChromaPercentage}%` }}
              ></div>
              <div
                className="h-4 bg-purple-400"
                style={{ width: `${analysis.chromaAnalysis.mediumChromaPercentage}%` }}
              ></div>
              <div
                className="h-4 bg-purple-200"
                style={{ width: `${analysis.chromaAnalysis.lowChromaPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>High: {analysis.chromaAnalysis.highChromaPercentage}%</span>
            <span>Medium: {analysis.chromaAnalysis.mediumChromaPercentage}%</span>
            <span>Low: {analysis.chromaAnalysis.lowChromaPercentage}%</span>
          </div>
        </div>
        
        {/* Value/Contrast Analysis */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-lg font-medium mb-2">Value & Contrast</h3>
          <p className="text-md font-medium">
            Range: <span className="font-bold">{analysis.valueRange.overall}</span>
          </p>
          <p className="text-sm mb-1">
            Value range: {analysis.valueRange.min} to {analysis.valueRange.max}
          </p>
          <div className="flex items-center mt-2">
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="h-4 bg-gray-800"
                style={{ width: `${analysis.valueRange.darkPercentage}%` }}
              ></div>
              <div
                className="h-4 bg-gray-500"
                style={{ width: `${analysis.valueRange.midtonePercentage}%` }}
              ></div>
              <div
                className="h-4 bg-gray-300"
                style={{ width: `${analysis.valueRange.lightPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Dark: {analysis.valueRange.darkPercentage}%</span>
            <span>Mid: {analysis.valueRange.midtonePercentage}%</span>
            <span>Light: {analysis.valueRange.lightPercentage}%</span>
          </div>
        </div>
      </div>
      
      {/* Recommended Palette */}
      <div className="mt-4 bg-gray-50 p-3 rounded-md">
        <h3 className="text-lg font-medium mb-2">Recommended Palette</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-md font-medium mb-1">Primary Colors</h4>
            <div className="flex flex-wrap">
              {analysis.recommendedPalette.primary.map((color, index) => (
                <div key={index} className="mr-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-md border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium mb-1">Secondary Colors</h4>
            <div className="flex flex-wrap">
              {analysis.recommendedPalette.secondary.map((color, index) => (
                <div key={index} className="mr-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-md border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium mb-1">Accent Colors</h4>
            <div className="flex flex-wrap">
              {analysis.recommendedPalette.accents.map((color, index) => (
                <div key={index} className="mr-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-md border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-md font-medium mb-1">Consider adding these distant hues:</h4>
          <div className="flex flex-wrap">
            {analysis.distantHues.map((hue, index) => (
              <span key={index} className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded mr-2 mb-2">
                {hue}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recommended Approach */}
      <div className="mt-4 bg-gray-50 p-3 rounded-md">
        <h3 className="text-lg font-medium mb-2">Painting Strategy</h3>
        <div className="mb-3">
          <h4 className="text-md font-medium mb-1">Recommended Approach</h4>
          <p className="text-sm">{analysis.recommendedApproach}</p>
        </div>
        <div>
          <h4 className="text-md font-medium mb-1">Mixing Strategy</h4>
          <p className="text-sm">{analysis.mixingStrategy}</p>
        </div>
      </div>
    </div>
  );
};

export default PaintingPlanDisplay; 