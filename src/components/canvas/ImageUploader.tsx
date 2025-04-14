import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { Image as LucideImage } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ImageUploaderProps {
  onImageLoad: (image: HTMLImageElement, file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoad }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Create URL for the file
    const imageUrl = URL.createObjectURL(file);
    
    // Load the image to get dimensions
    const img = new window.Image();
    img.onload = () => {
      onImageLoad(img, file);
      
      // Revoke the object URL to free memory
      URL.revokeObjectURL(imageUrl);
    };
    
    img.onerror = () => {
      setError('Failed to load image. Please try another file.');
      URL.revokeObjectURL(imageUrl);
    };
    
    img.src = imageUrl;
  }, [onImageLoad]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div 
        {...getRootProps()} 
        className={`
          w-full max-w-xl p-8 rounded-lg border-2 border-dashed transition-all
          flex flex-col items-center justify-center text-center cursor-pointer
          ${isDragActive ? 'border-pigment-500 bg-pigment-50 dark:bg-pigment-900/20' : ''}
          ${isDark 
            ? 'border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-750' 
            : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50'
          }
          ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {error ? (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error</p>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </>
        ) : (
          <>
            {isDragActive ? (
              <>
                <div className="h-12 w-12 text-pigment-500 mb-4 animate-pulse">
                  <LucideImage size={48} />
                </div>
                <p className="text-lg font-medium mb-2">Drop your image here</p>
              </>
            ) : (
              <>
                <Upload className={`h-12 w-12 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className="text-lg font-medium mb-2">Upload your reference image</p>
                <p className={`mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Drag and drop an image file, or click to browse
                </p>
                <button className="px-4 py-2 bg-pigment-600 text-white rounded-md hover:bg-pigment-700 transition-colors">
                  Select Image
                </button>
              </>
            )}
            <p className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Supported formats: JPEG, PNG, GIF, WEBP
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;