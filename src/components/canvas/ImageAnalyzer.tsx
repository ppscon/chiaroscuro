import React, { useState, useRef, useEffect } from 'react';
import { analyzeImage, ImageAnalysis } from '../../utils/imageAnalysis';
import ImageAnalysisDisplay from './ImageAnalysisDisplay';
import { useTheme } from '../../context/ThemeContext';

interface ImageAnalyzerProps {
  preloadedImage?: HTMLImageElement;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ preloadedImage }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Use preloaded image if available
  useEffect(() => {
    if (preloadedImage) {
      // Create a data URL from the preloaded image
      const canvas = document.createElement('canvas');
      canvas.width = preloadedImage.width;
      canvas.height = preloadedImage.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(preloadedImage, 0, 0);
        try {
          const dataUrl = canvas.toDataURL('image/png');
          setImagePreview(dataUrl);
        } catch (error) {
          console.error('Error creating data URL from preloaded image:', error);
          setError('Failed to load the preloaded image.');
        }
      }
    }
  }, [preloadedImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setImageAnalysis(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
    };
    reader.onerror = () => {
      setError('Failed to read the selected file.');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = async () => {
    if (!imageRef.current || !imagePreview) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Make sure image is fully loaded before analysis
      if (!imageRef.current.complete) {
        await new Promise<void>((resolve) => {
          const onLoad = () => {
            imageRef.current?.removeEventListener('load', onLoad);
            resolve();
          };
          imageRef.current!.addEventListener('load', onLoad);
        });
      }
      
      const analysis = await analyzeImage(imageRef.current);
      setImageAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze image:', error);
      setError('Failed to analyze the image. Please try again with a different image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setImageAnalysis(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImagePreview(result);
        };
        reader.onerror = () => {
          setError('Failed to read the dropped file.');
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select an image file (JPEG, PNG, etc.).');
      }
    }
  };

  const resetImage = () => {
    setImagePreview(null);
    setImageAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1800px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      <h2 style={{ 
        fontSize: '24px', 
        marginBottom: '20px',
        color: isDark ? '#ffffff' : '#333333'
      }}>
        Image Analyzer
      </h2>

      {!imagePreview ? (
        <div
          style={{
            border: `2px dashed ${isDark ? '#555555' : '#cccccc'}`,
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: isDark ? '#333333' : '#f8f8f8',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleDropZoneClick}
        >
          <p style={{ marginBottom: '15px', color: isDark ? '#dddddd' : '#555555' }}>
            Drag and drop an image here, or click to select
          </p>
          <button
            style={{
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Upload Image
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*"
          />
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '30px', 
          flexWrap: 'wrap',
          alignItems: 'flex-start'
        }}>
          {/* Image Display Section */}
          <div style={{ 
            flex: '1 1 48%',
            minWidth: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              marginBottom: '20px',
              backgroundColor: isDark ? '#222222' : '#ffffff',
              border: `1px solid ${isDark ? '#444444' : '#dddddd'}`
            }}>
              <img
                src={imagePreview}
                alt="Selected image"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '1000px',
                  objectFit: 'contain'
                }}
                ref={imageRef}
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'space-between'
            }}>
              <button
                onClick={resetImage}
                style={{
                  backgroundColor: isDark ? '#444444' : '#f0f0f0',
                  color: isDark ? '#ffffff' : '#333333',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: '1'
                }}
              >
                Reset
              </button>
              
              {!imageAnalysis && (
                <button
                  onClick={handleAnalyzeClick}
                  style={{
                    backgroundColor: '#4a90e2',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: '1'
                  }}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                </button>
              )}
            </div>
          </div>
          
          {/* Analysis Results Section */}
          <div style={{ 
            flex: '1 1 48%',
            minWidth: '600px',
            maxHeight: '1000px',
            overflowY: 'auto',
            padding: '15px',
            borderRadius: '8px',
            position: 'sticky',
            top: '20px'
          }}>
            {isAnalyzing ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                backgroundColor: isDark ? '#333333' : '#f8f8f8',
                borderRadius: '8px'
              }}>
                <p style={{ marginBottom: '15px' }}>Analyzing image...</p>
                {/* Loading indicator or spinner could go here */}
              </div>
            ) : imageAnalysis ? (
              <ImageAnalysisDisplay analysis={imageAnalysis} />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                backgroundColor: isDark ? '#333333' : '#f8f8f8',
                borderRadius: '8px',
                border: `1px solid ${isDark ? '#444444' : '#eeeeee'}`
              }}>
                <p style={{ color: isDark ? '#dddddd' : '#666666' }}>
                  Click "Analyze Image" to see color analysis and paint recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer; 