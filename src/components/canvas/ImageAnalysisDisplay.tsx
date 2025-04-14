import React from 'react';
import { ImageAnalysis } from '../../utils/imageAnalysis';
import { useTheme } from '../../context/ThemeContext';
import { Paint } from '../../context/PaintContext';
import { paintDatabase } from '../../data/paintDatabase';

interface ImageAnalysisDisplayProps {
  analysis: ImageAnalysis | null;
}

const SwatchDisplay: React.FC<{ swatch: { color: string; percentage: number; lab: [number, number, number] } }> = ({ swatch }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2 mb-2">
      <div 
        className="w-8 h-8 rounded-md border border-gray-300" 
        style={{ backgroundColor: swatch.color }}
      />
      <div className="text-sm">
        <div className={isDark ? 'text-gray-200' : 'text-gray-800'}>{swatch.color}</div>
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{swatch.percentage.toFixed(1)}%</div>
      </div>
    </div>
  );
};

// Component to display paint recommendation with swatch
const PaintRecommendation: React.FC<{ paint: Paint }> = ({ paint }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2 mb-2">
      <div 
        className="w-6 h-6 rounded-md border border-gray-300" 
        style={{ backgroundColor: paint.swatch }}
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {paint.name}
        </p>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {paint.brand}
        </p>
      </div>
    </div>
  );
};

// Function to find matching paints for a color
const findMatchingPaints = (hexColor: string, count: number = 3): Paint[] => {
  // Collect all paints from the database
  const allPaints: Paint[] = [];
  
  Object.values(paintDatabase.brands).forEach(brand => {
    allPaints.push(...brand.colors);
  });
  
  // Sort by how close they are to the target color (simple RGB distance)
  // In a real app, you would use a proper color distance algorithm
  const targetR = parseInt(hexColor.substring(1, 3), 16);
  const targetG = parseInt(hexColor.substring(3, 5), 16);
  const targetB = parseInt(hexColor.substring(5, 7), 16);
  
  return allPaints
    .map(paint => {
      // Calculate a simple RGB distance
      // Extract RGB from swatch
      const r = parseInt(paint.swatch.substring(1, 3), 16);
      const g = parseInt(paint.swatch.substring(3, 5), 16);
      const b = parseInt(paint.swatch.substring(5, 7), 16);
      
      const distance = Math.sqrt(
        Math.pow(r - targetR, 2) + 
        Math.pow(g - targetG, 2) + 
        Math.pow(b - targetB, 2)
      );
      
      return { paint, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map(item => item.paint);
};

// Group paints by brand
const groupPaintsByBrand = (paints: Paint[]): Record<string, Paint[]> => {
  const groupedPaints: Record<string, Paint[]> = {};
  
  paints.forEach(paint => {
    if (!groupedPaints[paint.brand]) {
      groupedPaints[paint.brand] = [];
    }
    groupedPaints[paint.brand].push(paint);
  });
  
  return groupedPaints;
};

// First, let's add a function to convert hex colors to paint names
const getPaintNamesForColor = (hexColor: string): string[] => {
  const matches = findMatchingPaints(hexColor, 2);
  
  if (matches.length === 0) {
    return ["Custom mix"];
  }
  
  // Group paints by brand
  const groupedPaints = groupPaintsByBrand(matches);
  const results: string[] = [];
  
  // Simplify display - don't show brand with every paint name unless from different brands
  if (Object.keys(groupedPaints).length === 1) {
    // If all paints are from same brand, list them without repeating the brand
    const brand = Object.keys(groupedPaints)[0];
    const paintNames = groupedPaints[brand].map(p => p.name).join(', ');
    results.push(paintNames);
  } else {
    // If paints are from different brands, include the brand
    Object.entries(groupedPaints).forEach(([brand, brandPaints]) => {
      const names = brandPaints.map(p => p.name).join(', ');
      results.push(`${names} (${brand})`);
    });
  }
  
  return results;
};

// Create a separate function to get full paint details including brands for the tips section
const getPaintDetails = (hexColor: string): string[] => {
  const matches = findMatchingPaints(hexColor, 2);
  if (matches.length === 0) {
    return [`Mix to match ${hexColor}`];
  }
  
  // Similar to getPaintNamesForColor but with more detail
  const groupedPaints = groupPaintsByBrand(matches);
  const results: string[] = [];
  
  Object.entries(groupedPaints).forEach(([brand, brandPaints]) => {
    // For detailed view, we'll still list them separately but with the brand only once
    if (brandPaints.length === 1) {
      results.push(`${brandPaints[0].name} (${brand})`);
    } else {
      // Create a string like "Brand: Paint1, Paint2"
      results.push(`${brand}: ${brandPaints.map(p => p.name).join(', ')}`);
    }
  });
  
  return results;
};

const ChomaSwatch: React.FC<{ color: string; label: string; value: number }> = ({ color, label, value }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-14 h-14 rounded-md border border-gray-300 mb-1" 
        style={{ backgroundColor: color }}
      />
      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</div>
      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{value.toFixed(1)}</div>
    </div>
  );
};

interface ColorSwatchProps {
  color: string;
  percentage?: number;
  isDark: boolean;
}

// Helper function to determine text color based on background luminance
const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance (perceived brightness)
  // Using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, percentage, isDark }) => {
  const contrastTextColor = getContrastColor(color);
  
  return (
    <div style={{
      backgroundColor: color,
      color: contrastTextColor,
      padding: '8px 12px',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: 500,
      boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
      marginBottom: '8px',
      width: '100%'
    }}>
      <span>{color.toUpperCase()}</span>
      {percentage !== undefined && (
        <span>{Math.round(percentage)}%</span>
      )}
    </div>
  );
};

const ImageAnalysisDisplay: React.FC<ImageAnalysisDisplayProps> = ({ analysis }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const textColor = isDarkMode ? '#fff' : '#333';
  const bgColor = isDarkMode ? '#1e1e1e' : '#ffffff';
  const sectionBgColor = isDarkMode ? '#333' : '#f5f5f5';
  const borderColor = isDarkMode ? '#444' : '#e0e0e0';
  
  if (!analysis) {
    return null;
  }

  return (
    <div className={`image-analysis ${isDarkMode ? 'dark-mode' : 'light-mode'}`} style={{
      backgroundColor: bgColor,
      color: textColor,
      padding: '20px',
      borderRadius: '12px',
      boxShadow: isDarkMode ? '0 4px 8px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ marginBottom: '20px', color: textColor }}>Image Analysis Results</h2>
      
      {/* Dominant Colors */}
      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Dominant Colors</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '15px' }}>
          {analysis.dominantColors.slice(0, 6).map((color, index) => (
            <ColorSwatch 
              key={index} 
              color={color.color} 
              percentage={color.percentage} 
              isDark={isDarkMode}
            />
          ))}
        </div>
      </section>

      {/* Temperature Analysis */}
      <section style={{ 
        marginBottom: '24px', 
        backgroundColor: sectionBgColor,
        padding: '15px',
        borderRadius: '8px',
        borderLeft: '4px solid',
        borderColor: analysis.temperatureAnalysis.overall === 'warm' ? '#ff7043' : 
                     analysis.temperatureAnalysis.overall === 'cool' ? '#4fc3f7' : '#bdbdbd'
      }}>
        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Temperature Analysis</h3>
        <p><strong>Overall:</strong> <span style={{ 
          color: analysis.temperatureAnalysis.overall === 'warm' ? '#ff7043' : 
                 analysis.temperatureAnalysis.overall === 'cool' ? '#4fc3f7' : '#bdbdbd',
          fontWeight: 600
        }}>{analysis.temperatureAnalysis.overall.charAt(0).toUpperCase() + analysis.temperatureAnalysis.overall.slice(1)}</span></p>
        <div style={{ display: 'flex', marginTop: '10px' }}>
          <div style={{ flex: 1 }}>
            <p>Warm: {analysis.temperatureAnalysis.warmPercentage}%</p>
            <div style={{ 
              height: '8px', 
              width: `${analysis.temperatureAnalysis.warmPercentage}%`, 
              backgroundColor: '#ff7043',
              borderRadius: '4px',
              marginTop: '4px'
            }}></div>
          </div>
          <div style={{ flex: 1, margin: '0 10px' }}>
            <p>Cool: {analysis.temperatureAnalysis.coolPercentage}%</p>
            <div style={{ 
              height: '8px', 
              width: `${analysis.temperatureAnalysis.coolPercentage}%`, 
              backgroundColor: '#4fc3f7',
              borderRadius: '4px',
              marginTop: '4px'
            }}></div>
          </div>
          <div style={{ flex: 1 }}>
            <p>Neutral: {analysis.temperatureAnalysis.neutralPercentage}%</p>
            <div style={{ 
              height: '8px', 
              width: `${analysis.temperatureAnalysis.neutralPercentage}%`, 
              backgroundColor: '#bdbdbd',
              borderRadius: '4px',
              marginTop: '4px'
            }}></div>
          </div>
        </div>
      </section>

      {/* Chroma Analysis */}
      <section style={{ 
        marginBottom: '24px', 
        backgroundColor: sectionBgColor,
        padding: '15px',
        borderRadius: '8px',
        borderLeft: '4px solid',
        borderColor: analysis.chromaAnalysis.overall === 'high' ? '#8bc34a' : 
                    analysis.chromaAnalysis.overall === 'medium' ? '#ffb74d' : '#90a4ae'
      }}>
        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Chroma Analysis</h3>
        <p><strong>Overall:</strong> <span style={{ 
          color: analysis.chromaAnalysis.overall === 'high' ? '#8bc34a' : 
                analysis.chromaAnalysis.overall === 'medium' ? '#ffb74d' : '#90a4ae',
          fontWeight: 600
        }}>{analysis.chromaAnalysis.overall.charAt(0).toUpperCase() + analysis.chromaAnalysis.overall.slice(1)}</span></p>
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px', marginBottom: '15px' }}>
          {/* Find high chroma colors to display */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ marginBottom: '8px' }}>High Chroma</p>
            <div style={{ 
              backgroundColor: getHighChromaColor(analysis.dominantColors) || '#8bc34a', 
              height: '60px', 
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              {analysis.chromaAnalysis.highChromaPercentage}%
            </div>
          </div>
          
          {/* Find medium chroma colors to display */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ marginBottom: '8px' }}>Medium Chroma</p>
            <div style={{ 
              backgroundColor: getMediumChromaColor(analysis.dominantColors) || '#ffb74d', 
              height: '60px', 
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              {analysis.chromaAnalysis.mediumChromaPercentage}%
            </div>
          </div>
          
          {/* Find low chroma colors to display */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ marginBottom: '8px' }}>Low Chroma</p>
            <div style={{ 
              backgroundColor: getLowChromaColor(analysis.dominantColors) || '#90a4ae', 
              height: '60px', 
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>
              {analysis.chromaAnalysis.lowChromaPercentage}%
            </div>
          </div>
        </div>
        
        {/* Progress bars showing percentages */}
        <div style={{ marginTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <p>High Chroma:</p>
            <p>{analysis.chromaAnalysis.highChromaPercentage}%</p>
          </div>
          <div style={{ 
            height: '10px', 
            width: `${analysis.chromaAnalysis.highChromaPercentage}%`, 
            backgroundColor: getHighChromaColor(analysis.dominantColors) || '#8bc34a',
            borderRadius: '5px',
            marginBottom: '12px'
          }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <p>Medium Chroma:</p>
            <p>{analysis.chromaAnalysis.mediumChromaPercentage}%</p>
          </div>
          <div style={{ 
            height: '10px', 
            width: `${analysis.chromaAnalysis.mediumChromaPercentage}%`, 
            backgroundColor: getMediumChromaColor(analysis.dominantColors) || '#ffb74d',
            borderRadius: '5px',
            marginBottom: '12px'
          }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <p>Low Chroma:</p>
            <p>{analysis.chromaAnalysis.lowChromaPercentage}%</p>
          </div>
          <div style={{ 
            height: '10px', 
            width: `${analysis.chromaAnalysis.lowChromaPercentage}%`, 
            backgroundColor: getLowChromaColor(analysis.dominantColors) || '#90a4ae',
            borderRadius: '5px'
          }}></div>
        </div>
      </section>

      {/* Value Range Analysis */}
      <div style={{
        marginBottom: '24px',
        backgroundColor: isDarkMode ? '#333333' : '#f8f8f8',
        borderRadius: '8px',
        padding: '16px',
        border: `1px solid ${isDarkMode ? '#444444' : '#e5e5e5'}`
      }}>
        <h3 style={{ 
          marginBottom: '16px', 
          color: isDarkMode ? '#ffffff' : '#333333',
          fontSize: '18px',
          fontWeight: 600
        }}>
          Value Range (Lights & Darks)
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ color: isDarkMode ? '#dddddd' : '#555555' }}>
              Dark values
            </span>
            <span style={{ 
              fontWeight: 600, 
              color: isDarkMode ? '#ffffff' : '#333333'
            }}>
              {Math.round(analysis.valueRange.darkPercentage)}%
            </span>
          </div>
          <div style={{
            height: '30px',
            backgroundColor: '#333333',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          }}>
            Dark ({Math.round(analysis.valueRange.darkPercentage)}%)
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ color: isDarkMode ? '#dddddd' : '#555555' }}>
              Midtone values
            </span>
            <span style={{ 
              fontWeight: 600, 
              color: isDarkMode ? '#ffffff' : '#333333'
            }}>
              {Math.round(analysis.valueRange.midtonePercentage)}%
            </span>
          </div>
          <div style={{
            height: '30px',
            backgroundColor: '#888888',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          }}>
            Midtone ({Math.round(analysis.valueRange.midtonePercentage)}%)
          </div>
        </div>
        
        <div>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ color: isDarkMode ? '#dddddd' : '#555555' }}>
              Light values
            </span>
            <span style={{ 
              fontWeight: 600, 
              color: isDarkMode ? '#ffffff' : '#333333'
            }}>
              {Math.round(analysis.valueRange.lightPercentage)}%
            </span>
          </div>
          <div style={{
            height: '30px',
            backgroundColor: '#eeeeee',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333333',
            boxShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          }}>
            Light ({Math.round(analysis.valueRange.lightPercentage)}%)
          </div>
        </div>
      </div>

      {/* Paint Recommendations Section */}
      <div style={{
        marginBottom: '24px',
        backgroundColor: isDarkMode ? '#333333' : '#f8f8f8',
        borderRadius: '8px',
        padding: '16px',
        border: `1px solid ${isDarkMode ? '#444444' : '#e5e5e5'}`
      }}>
        <h3 style={{ 
          marginBottom: '16px', 
          color: isDarkMode ? '#ffffff' : '#333333',
          fontSize: '18px',
          fontWeight: 600
        }}>
          Paint Recommendations
        </h3>
        
        {analysis.recommendedPalette.paints && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                color: isDarkMode ? '#dddddd' : '#555555',
                marginBottom: '8px',
                fontWeight: 600
              }}>
                Primary Brand: {analysis.recommendedPalette.primaryBrand}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  color: isDarkMode ? '#dddddd' : '#555555',
                  marginBottom: '8px'
                }}>
                  Base Colors:
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {analysis.recommendedPalette.paints.filter(paint => paint.purpose?.includes("Base") || paint.purpose?.includes("mid-tone")).map((paint, index) => (
                    <div key={index} style={{
                      backgroundColor: paint.hex,
                      color: getContrastColor(paint.hex),
                      padding: '8px 12px',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: 500,
                      boxShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                    }}>
                      <span>{paint.name}</span>
                      <span style={{ opacity: 0.8, fontSize: '0.9em' }}>{paint.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {analysis.recommendedPalette.paints.filter(paint => paint.purpose?.includes("accent") || paint.purpose?.includes("highlight") || paint.purpose?.includes("shadow")).length > 0 && (
                <div>
                  <div style={{ 
                    color: isDarkMode ? '#dddddd' : '#555555',
                    marginBottom: '8px'
                  }}>
                    Accent Colors:
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {analysis.recommendedPalette.paints.filter(paint => paint.purpose?.includes("accent") || paint.purpose?.includes("highlight") || paint.purpose?.includes("shadow")).map((paint, index) => (
                      <div key={index} style={{
                        backgroundColor: paint.hex,
                        color: getContrastColor(paint.hex),
                        padding: '8px 12px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 500,
                        boxShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                      }}>
                        <span>{paint.name}</span>
                        <span style={{ opacity: 0.8, fontSize: '0.9em' }}>{paint.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Suggested Approach */}
      <section style={{ 
        marginBottom: '24px', 
        backgroundColor: sectionBgColor,
        padding: '15px',
        borderRadius: '8px',
        borderLeft: '4px solid',
        borderColor: isDarkMode ? '#b39ddb' : '#673ab7'
      }}>
        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Painting Approach</h3>
        <p style={{ 
          lineHeight: '1.5',
          color: isDarkMode ? '#e0e0e0' : '#333333'
        }}>{analysis.recommendedApproach}</p>
        
        <h4 style={{ 
          marginTop: '15px', 
          marginBottom: '10px', 
          fontSize: '16px',
          color: isDarkMode ? '#e0e0e0' : '#333333'
        }}>Mixing Strategy</h4>
        <p style={{ 
          lineHeight: '1.5',
          color: isDarkMode ? '#e0e0e0' : '#333333'
        }}>{analysis.mixingStrategy}</p>
      </section>
    </div>
  );
};

// Helper functions to extract colors by chroma level
function getHighChromaColor(dominantColors: Array<{ color: string, percentage: number }>) {
  // This is a simple approximation - in a real app we'd use proper chroma calculations
  // Sort colors by perceived saturation
  const sorted = [...dominantColors].sort((a, b) => {
    // Convert to RGB
    const aRgb = hexToRgbSimple(a.color);
    const bRgb = hexToRgbSimple(b.color);
    
    if (!aRgb || !bRgb) return 0;
    
    // Calculate simple saturation (max-min)/max
    const aMax = Math.max(aRgb.r, aRgb.g, aRgb.b);
    const aMin = Math.min(aRgb.r, aRgb.g, aRgb.b);
    const aSat = aMax === 0 ? 0 : (aMax - aMin) / aMax;
    
    const bMax = Math.max(bRgb.r, bRgb.g, bRgb.b);
    const bMin = Math.min(bRgb.r, bRgb.g, bRgb.b);
    const bSat = bMax === 0 ? 0 : (bMax - bMin) / bMax;
    
    return bSat - aSat; // Highest saturation first
  });
  
  return sorted[0]?.color;
}

function getMediumChromaColor(dominantColors: Array<{ color: string, percentage: number }>) {
  // Get color close to the middle of saturation range
  const sorted = [...dominantColors].sort((a, b) => {
    const aRgb = hexToRgbSimple(a.color);
    const bRgb = hexToRgbSimple(b.color);
    
    if (!aRgb || !bRgb) return 0;
    
    // Calculate simple saturation
    const aMax = Math.max(aRgb.r, aRgb.g, aRgb.b);
    const aMin = Math.min(aRgb.r, aRgb.g, aRgb.b);
    const aSat = aMax === 0 ? 0 : (aMax - aMin) / aMax;
    
    const bMax = Math.max(bRgb.r, bRgb.g, bRgb.b);
    const bMin = Math.min(bRgb.r, bRgb.g, bRgb.b);
    const bSat = bMax === 0 ? 0 : (bMax - bMin) / bMax;
    
    return Math.abs(aSat - 0.5) - Math.abs(bSat - 0.5); // Closest to 50% saturation
  });
  
  return sorted[0]?.color;
}

function getLowChromaColor(dominantColors: Array<{ color: string, percentage: number }>) {
  // Get the least saturated color
  const sorted = [...dominantColors].sort((a, b) => {
    const aRgb = hexToRgbSimple(a.color);
    const bRgb = hexToRgbSimple(b.color);
    
    if (!aRgb || !bRgb) return 0;
    
    // Calculate simple saturation
    const aMax = Math.max(aRgb.r, aRgb.g, aRgb.b);
    const aMin = Math.min(aRgb.r, aRgb.g, aRgb.b);
    const aSat = aMax === 0 ? 0 : (aMax - aMin) / aMax;
    
    const bMax = Math.max(bRgb.r, bRgb.g, bRgb.b);
    const bMin = Math.min(bRgb.r, bRgb.g, bRgb.b);
    const bSat = bMax === 0 ? 0 : (bMax - bMin) / bMax;
    
    return aSat - bSat; // Lowest saturation first
  });
  
  return sorted[0]?.color;
}

function hexToRgbSimple(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper function to find the most vibrant color
function findMostVibrantColor(colors: Array<{color: string, percentage: number}>) {
  return colors.reduce((prev, curr) => {
    const prevRgb = hexToRgbSimple(prev.color);
    const currRgb = hexToRgbSimple(curr.color);
    
    if (!prevRgb || !currRgb) return curr;
    
    const prevMax = Math.max(prevRgb.r, prevRgb.g, prevRgb.b);
    const prevMin = Math.min(prevRgb.r, prevRgb.g, prevRgb.b);
    const prevSat = prevMax === 0 ? 0 : (prevMax - prevMin) / prevMax;
    
    const currMax = Math.max(currRgb.r, currRgb.g, currRgb.b);
    const currMin = Math.min(currRgb.r, currRgb.g, currRgb.b);
    const currSat = currMax === 0 ? 0 : (currMax - currMin) / currMax;
    
    return currSat > prevSat ? curr : prev;
  }).color;
}

export default ImageAnalysisDisplay; 