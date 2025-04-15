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

  // Start state as null
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log(`[ImageAnalyzer Render] Prop: ${preloadedImage?.src}, State: ${imagePreviewUrl}, Ref: ${imageRef.current?.src}`);

  // Effect to handle the preloadedImage prop
  useEffect(() => {
    console.log("[ImageAnalyzer Prop Effect] Running. Prop:", preloadedImage);
    if (preloadedImage && preloadedImage.complete && preloadedImage.naturalWidth > 0) {
        // Only update if the ref is not already pointing to the same image
        if (imageRef.current !== preloadedImage) {
            console.log("[ImageAnalyzer Prop Effect] Valid preloadedImage received. Updating ref and generating data URL for preview.");
            
            // Update the ref immediately
            imageRef.current = preloadedImage;
            
            // Generate a stable data URL for preview
            try {
                const canvas = document.createElement('canvas');
                // Match canvas size to the actual image dimensions
                canvas.width = preloadedImage.naturalWidth;
                canvas.height = preloadedImage.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Failed to get canvas context for data URL generation');
                ctx.drawImage(preloadedImage, 0, 0);
                const dataUrl = canvas.toDataURL(); // Defaults to PNG, which is fine
                console.log("[ImageAnalyzer Prop Effect] Setting preview URL to data URL (length:", dataUrl.length, ")");
                setImagePreviewUrl(dataUrl);
                setImageAnalysis(null); // Reset analysis
                setError(null);
            } catch (err) {
                console.error("[ImageAnalyzer Prop Effect] Error generating data URL:", err);
                setError("Could not display the preloaded image.");
                setImagePreviewUrl(null);
                imageRef.current = null;
            }
        } else {
             console.log("[ImageAnalyzer Prop Effect] Prop image already matches ref, no update needed.");
             // Ensure preview URL is still set correctly (defensive)
             if (!imagePreviewUrl && imageRef.current?.src) {
                 console.warn("[ImageAnalyzer Prop Effect] Preview URL was null, attempting to restore from ref src (might be blob):");
                 // This might still fail if src is a blob, but worth a try
                 // Ideally, the data URL generation above should handle this.
                 // Let's re-generate the data URL if preview is missing.
                 try {
                    const canvas = document.createElement('canvas');
                    canvas.width = imageRef.current.naturalWidth;
                    canvas.height = imageRef.current.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Failed to get canvas context for data URL restore');
                    ctx.drawImage(imageRef.current, 0, 0);
                    const dataUrl = canvas.toDataURL(); 
                    console.log("[ImageAnalyzer Prop Effect] Restoring preview URL with data URL (length:", dataUrl.length, ")");
                    setImagePreviewUrl(dataUrl);
                 } catch (err) {
                     console.error("[ImageAnalyzer Prop Effect] Error restoring data URL:", err);
                     setError("Could not display the image.");
                 }
             }
        }
    } else if (!preloadedImage) {
        // Prop is null/undefined, clear everything if not already cleared
        if (imageRef.current || imagePreviewUrl) {
             console.log("[ImageAnalyzer Prop Effect] preloadedImage removed. Clearing state and ref.");
            setImagePreviewUrl(null);
            imageRef.current = null;
            setImageAnalysis(null);
            setError(null);
        }
    } else {
         console.log("[ImageAnalyzer Prop Effect] preloadedImage exists but is not complete/loaded yet.");
         // We might need to add logic here to wait for the preloadedImage to load if it arrives incomplete
         // For now, we assume App.tsx sends a loaded image.
    }
  }, [preloadedImage, imagePreviewUrl]); // Add imagePreviewUrl back to potentially restore if needed

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("[ImageAnalyzer FileChange] File selected. Clearing current state/ref.");
    setError(null);
    setImageAnalysis(null);
    setImagePreviewUrl(null); // Clear previous preview
    imageRef.current = null; // Clear the ref
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log("[ImageAnalyzer FileChange] Setting preview URL from file (data URL).");
      setImagePreviewUrl(result); // Set the data URL read from the file
      const img = new Image();
      img.onload = () => {
        console.log("[ImageAnalyzer FileChange] Updating imageRef from file.");
        imageRef.current = img; // Update the ref with the newly loaded image
      };
      img.onerror = () => { 
        console.error("[ImageAnalyzer FileChange] Failed to load image from file reader result.");
        setError('Could not load the selected image file.');
        setImagePreviewUrl(null);
        imageRef.current = null;
      };
      img.src = result;
    };
    reader.onerror = () => {
      console.error("[ImageAnalyzer FileChange] FileReader error.");
      setError('Failed to read the selected file.');
    };
    reader.readAsDataURL(file); 
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    console.log("[ImageAnalyzer Drop] File dropped. Clearing current state/ref.");
    setError(null);
    setImageAnalysis(null);
    setImagePreviewUrl(null); // Clear previous preview
    imageRef.current = null; // Clear the ref

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        console.log("[ImageAnalyzer Drop] Setting preview URL from dropped file (data URL).");
        setImagePreviewUrl(result);
        const img = new Image();
        img.onload = () => {
            console.log("[ImageAnalyzer Drop] Updating imageRef from dropped file.");
          imageRef.current = img;
        };
        img.onerror = () => {
            console.error("[ImageAnalyzer Drop] Failed to load image from dropped file.");
            setError('Could not load the dropped image file.');
            setImagePreviewUrl(null); 
            imageRef.current = null;
        };
        img.src = result;
      };
      reader.onerror = () => {
        console.error("[ImageAnalyzer Drop] FileReader error on drop.");
        setError('Failed to read the dropped file.');
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select an image file (JPEG, PNG, etc.).');
    }
  };

  const handleAnalyzeClick = async () => {
    console.log("[ImageAnalyzer Analyze] Clicked. imageRef.current:", imageRef.current);
    if (!imageRef.current || !imageRef.current.src) {
        console.warn("[ImageAnalyzer Analyze] No image ref or src found.");
        setError('No image is loaded to analyze.');
        return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
        // Check completion and dimensions
        if (!imageRef.current.complete || imageRef.current.naturalWidth === 0) {
             console.log("[ImageAnalyzer Analyze] Image ref not complete or has no width, waiting...");
            await new Promise<void>((resolve, reject) => {
                const currentImage = imageRef.current;
                if (!currentImage) {
                    return reject(new Error('Image reference became null unexpectedly within promise.'));
                }
                
                const loadHandler = () => {
                    console.log("[ImageAnalyzer Analyze] Image loaded via listener.");
                    cleanup();
                    resolve();
                };
                const errorHandler = (err: Event | string) => {
                     console.error("[ImageAnalyzer Analyze] Image failed to load via listener:", err);
                    cleanup();
                    reject(new Error('Image failed to load before analysis'));
                };
                const cleanup = () => {
                    currentImage.removeEventListener('load', loadHandler);
                    currentImage.removeEventListener('error', errorHandler);
                };

                currentImage.addEventListener('load', loadHandler);
                currentImage.addEventListener('error', errorHandler);
                // Double-check completion after adding listeners
                if (currentImage.complete && currentImage.naturalWidth > 0) {
                    console.log("[ImageAnalyzer Analyze] Image already complete after adding listeners.");
                    cleanup();
                    resolve();
                }
            });
        }
      console.log("[ImageAnalyzer Analyze] Proceeding with analysis using image:", imageRef.current);
      const analysis = await analyzeImage(imageRef.current);
      setImageAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze image:', error);
      setError(`Failed to analyze the image: ${error instanceof Error ? error.message : String(error)}`);
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
  
  const resetImage = () => {
    console.log("[ImageAnalyzer Reset] Resetting...");
    setImagePreviewUrl(null);
    setImageAnalysis(null);
    setError(null);
    imageRef.current = null; 
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

      {!imagePreviewUrl ? (
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
                key={imagePreviewUrl}
                src={imagePreviewUrl}
                alt="Selected image"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxWidth: '800px',
                  maxHeight: '600px',
                  objectFit: 'contain'
                }}
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