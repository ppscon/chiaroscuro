import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { analyzeImage, ImageAnalysis } from '../../utils/imageAnalysis';
import ImageAnalysisDisplay from './ImageAnalysisDisplay';
import { useTheme } from '../../context/ThemeContext';
import { useDropzone } from 'react-dropzone';
import { Loader2, AlertCircle, UploadCloud, CheckCircle } from 'lucide-react';

interface ImageAnalyzerProps {
  preloadedImage?: HTMLImageElement;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 1200; // Max width or height

// Memoized Image Preview Component
const ImagePreview = memo(({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="max-w-full max-h-[600px] object-contain rounded-lg shadow-md" />
));

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ preloadedImage }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State variables
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null); // Ref to hold the actual Image element
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For analysis loading
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false); // For initial file reading
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Keep fileInputRef if direct click-to-upload is still desired alongside dropzone
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log(`[ImageAnalyzer Render] Prop: ${preloadedImage?.src}, State Preview URL: ${!!imagePreviewUrl}, Ref: ${imageRef.current?.src}`);

  // --- Cleanup Function ---
  const cleanup = useCallback(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = null;
    }
    // No need to revokeObjectURL if imagePreviewUrl always comes from reader.readAsDataURL
    // If blob URLs are ever used, add it back:
    // if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
    //   URL.revokeObjectURL(imagePreviewUrl);
    // }
    setImageAnalysis(null);
    setIsLoading(false);
    setIsImageLoading(false);
    setAnalysisError(null);
    setUploadError(null);
    setImagePreviewUrl(null);
    imageRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  }, []);

  // Effect to handle the preloadedImage prop
  useEffect(() => {
    console.log("[ImageAnalyzer Prop Effect] Running. Prop:", preloadedImage);
    if (preloadedImage && preloadedImage.complete && preloadedImage.naturalWidth > 0) {
      if (imageRef.current !== preloadedImage) {
        console.log("[ImageAnalyzer Prop Effect] Valid preloadedImage received. Updating ref and generating data URL.");
        cleanup(); // Clean up previous state first
        imageRef.current = preloadedImage;
        try {
          // Generate data URL from the preloaded image for consistent preview
          const canvas = document.createElement('canvas');
          canvas.width = preloadedImage.naturalWidth;
          canvas.height = preloadedImage.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Failed to get canvas context');
          ctx.drawImage(preloadedImage, 0, 0);
          const dataUrl = canvas.toDataURL();
          setImagePreviewUrl(dataUrl);
          console.log("[ImageAnalyzer Prop Effect] Set preview from preloaded image data URL.");
        } catch (err) {
          console.error("[ImageAnalyzer Prop Effect] Error generating data URL:", err);
          setUploadError("Could not display the provided image.");
          imageRef.current = null;
        }
      } else {
        console.log("[ImageAnalyzer Prop Effect] Prop image already matches ref.");
      }
    } else if (!preloadedImage) {
      // If prop becomes null, reset component state if it's not already clean
      if (imageRef.current || imagePreviewUrl) {
        console.log("[ImageAnalyzer Prop Effect] preloadedImage removed. Clearing state.");
        cleanup();
      }
    }
  }, [preloadedImage, cleanup, imagePreviewUrl]); // Added cleanup and imagePreviewUrl dependency

  // --- Image Processing Logic (Unified for Drop and File Change) ---
  const processImageFile = useCallback((file: File) => {
    if (!file) return;

    cleanup(); // Reset everything before processing new file
    setIsImageLoading(true);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP).');
      setIsImageLoading(false);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`);
      setIsImageLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        setUploadError('Failed to read image data.');
        setIsImageLoading(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Validate dimensions
        if (img.naturalWidth > MAX_IMAGE_DIMENSION || img.naturalHeight > MAX_IMAGE_DIMENSION) {
          setUploadError(`Image dimensions are too large (${img.naturalWidth}x${img.naturalHeight}). Maximum dimension is ${MAX_IMAGE_DIMENSION}px.`);
          setIsImageLoading(false);
          return;
        }

        // All checks passed
        console.log("Image loaded via FileReader successfully:", file.name);
        imageRef.current = img; // Store the Image object in the ref
        setImagePreviewUrl(dataUrl); // Set preview URL
        setIsImageLoading(false);

        // Automatically trigger analysis after successful load
        handleAnalyze(); // Analyze using the image in imageRef
      };
      img.onerror = () => {
        console.error("Error loading image from data URL");
        setUploadError('Could not load image data. The file might be corrupted.');
        setIsImageLoading(false);
      };
      img.src = dataUrl;
    };

    reader.onerror = () => {
      console.error("FileReader error");
      setUploadError('Failed to read the file.');
      setIsImageLoading(false);
    };

    reader.readAsDataURL(file);
  }, [cleanup]); // Include cleanup in dependencies

  // --- Event Handlers (using Dropzone) ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragActive(false);
    if (acceptedFiles.length > 0) {
      console.log("[ImageAnalyzer Dropzone] File dropped:", acceptedFiles[0].name);
      processImageFile(acceptedFiles[0]);
    }
  }, [processImageFile]);

  // Handler for the hidden file input (if using label/button click)
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("[ImageAnalyzer FileInput] File selected:", file.name);
      processImageFile(file);
    }
  }, [processImageFile]);

  // --- Analysis Function ---
  const handleAnalyze = useCallback(async () => {
    const currentImage = imageRef.current; // Get image from ref

    if (!currentImage) {
      setAnalysisError("No image loaded to analyze.");
      console.warn("[Analyze] No image found in ref.");
      return;
    }

    // Ensure the image element is fully loaded
    if (!currentImage.complete || currentImage.naturalWidth === 0) {
       console.warn("[Analyze] Image ref not complete. Attempting to wait for load.");
        try {
            await new Promise<void>((resolve, reject) => {
                const img = imageRef.current; // Re-check ref inside promise
                if (!img) return reject(new Error('Image ref became null while waiting'));

                const loadHandler = () => { console.log('[Analyze Wait] Load event fired.'); cleanupListeners(); resolve(); };
                const errorHandler = (e: Event | string) => { console.error('[Analyze Wait] Error event fired:', e); cleanupListeners(); reject(new Error('Image failed to load before analysis')); };
                const cleanupListeners = () => {
                    img.removeEventListener('load', loadHandler);
                    img.removeEventListener('error', errorHandler);
                };

                img.addEventListener('load', loadHandler);
                img.addEventListener('error', errorHandler);

                // Double-check completion after attaching listeners
                if (img.complete && img.naturalWidth > 0) {
                     console.log('[Analyze Wait] Image completed between check and listener attachment.');
                    cleanupListeners();
                    resolve();
                }
            });
             console.log("[Analyze] Image load confirmed after waiting.");
        } catch (err) {
            console.error("[Analyze] Failed waiting for image load:", err);
            setAnalysisError((err instanceof Error ? err.message : 'Failed to load image before analysis'));
            return;
        }
    }

    console.log("Starting analysis using image element:", currentImage);
    setIsLoading(true);
    setAnalysisError(null);
    setImageAnalysis(null); // Clear previous results

    // Analysis Timeout
    if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
    analysisTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setAnalysisError("Analysis is taking longer than expected. Please try again or use a smaller image.");
      console.error("Analysis timeout triggered.");
      analysisTimeoutRef.current = null; // Clear ref after triggering
    }, 30000); // 30 seconds timeout

    try {
      // Pass the HTMLImageElement directly to analyzeImage
      const analysisResult = await analyzeImage(currentImage);
      console.log("Analysis complete:", analysisResult);

      if (analysisTimeoutRef.current) { // Clear timeout if analysis completes in time
         clearTimeout(analysisTimeoutRef.current);
         analysisTimeoutRef.current = null;
      }
      setImageAnalysis(analysisResult);
    } catch (err: any) {
      if (analysisTimeoutRef.current) { // Clear timeout if analysis fails
         clearTimeout(analysisTimeoutRef.current);
         analysisTimeoutRef.current = null;
      }
      console.error("Analysis failed:", err);
      const errorMessage = err.message || "An unknown error occurred during analysis.";
      setAnalysisError(`Analysis failed: ${errorMessage}`);
    } finally {
      // Ensure timeout is cleared if it finished but wasn't cleared above (edge case)
      if (analysisTimeoutRef.current) {
         clearTimeout(analysisTimeoutRef.current);
         analysisTimeoutRef.current = null;
      }
      setIsLoading(false);
    }
  }, []);

  // --- Dropzone Setup ---
  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': [],
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    noClick: true, // Disable default click behavior if we use a separate button/label
  });

  // --- Render Logic ---
  const dropzoneClassName = `
    flex flex-col items-center justify-center w-full h-64
    border-2 border-dashed rounded-lg cursor-pointer
    transition-colors duration-200 ease-in-out
    ${isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}
    ${isDragActive ? (isDark ? 'bg-gray-700 border-blue-400' : 'bg-gray-100 border-blue-500') : (isDark ? 'bg-gray-800' : 'bg-gray-50')}
    ${isDragAccept ? (isDark ? 'border-green-500' : 'border-green-600') : ''}
    ${isDragReject ? (isDark ? 'border-red-500' : 'border-red-600') : ''}
    relative group text-center p-4
  `;

  return (
    <div className={`p-4 md:p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-850' : 'bg-white'} max-w-7xl mx-auto`}>
       <h2 className={`text-xl md:text-2xl font-semibold mb-4 md:mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
         Image Analyzer
       </h2>

      {!imagePreviewUrl && !isImageLoading && ( // Show dropzone UI if no image loaded/loading
        <div {...getRootProps()} className={dropzoneClassName}>
          {/* Hidden input for dropzone */}
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className={`w-10 h-10 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            {isDragActive ? (
              <p className={`mb-2 text-sm font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                Drop the image here...
              </p>
            ) : (
              <>
                {/* Clickable label pointing to the hidden file input */}
                 <label htmlFor="file-upload-input" className={`mb-2 text-sm cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-semibold text-blue-500 hover:text-blue-400">Click to upload</span> or drag and drop
                 </label>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  JPEG, PNG, GIF, WebP (MAX. 5MB, 1200x1200px)
                </p>
              </>
            )}
          </div>
          {uploadError && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center text-xs text-red-500 dark:text-red-400 p-1 bg-red-100 dark:bg-red-900 rounded">
              <AlertCircle className="w-3 h-3 mr-1" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* Hidden file input triggered by the label */}
       <input
          id="file-upload-input"
          ref={fileInputRef} // Keep ref if needed, though maybe not strictly necessary now
          type="file"
          onChange={handleFileInputChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="sr-only"
        />

      {isImageLoading && ( // Show spinner for initial file reading
        <div className={dropzoneClassName}> {/* Re-use dropzone style for consistency */}
           <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className={`w-10 h-10 mb-3 animate-spin ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Processing Image...
                </p>
            </div>
        </div>
      )}

      {imagePreviewUrl && !isImageLoading && ( // Show preview & analysis results/controls
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Image Preview and Controls */}
           <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-2xl mx-auto">
              <ImagePreview src={imagePreviewUrl} alt="Image Preview" />
              {isLoading && ( // Analysis loading overlay
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-lg">
                  <Loader2 className="w-12 h-12 text-white animate-spin mb-2" />
                  <p className="text-white text-sm">Analyzing...</p>
                </div>
              )}
            </div>

            {analysisError && (
              <div className="flex items-center text-sm text-red-500 dark:text-red-400 p-2 bg-red-100 dark:bg-red-900 rounded-md w-full">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Buttons Container */}
             <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button
                onClick={handleAnalyze} // Re-analyze button
                disabled={isLoading || !imageRef.current}
                className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center
                  ${isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-400 disabled:bg-gray-600'
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-gray-300'
                  } disabled:cursor-not-allowed transition-colors`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                   <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Analyzing...' : 'Re-Analyze'}
              </button>
               <label
                  htmlFor="file-upload-input" // Point to the hidden input
                  className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center
                  ${isDark
                    ? 'bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500'
                  } transition-colors`}
               >
                 <UploadCloud className="w-4 h-4 mr-2"/>
                  Replace Image
               </label>
            </div>
          </div>

          {/* Right Column: Analysis Display */}
           <div className="w-full">
             {imageAnalysis ? (
               <ImageAnalysisDisplay analysis={imageAnalysis} />
             ) : (
               // Placeholder or message if no analysis yet
               <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                 <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                   {isLoading ? 'Analysis in progress...' : 'Analysis results will appear here.'}
                 </p>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default memo(ImageAnalyzer); // Wrap export in memo 