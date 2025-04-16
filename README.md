# Chiaroscuro - Artist's Paint Mixing Assistant

## Overview

Chiaroscuro is a specialized web application designed for artists that helps bridge the gap between digital colors and real-world oil paints. The application allows users to upload an image, analyze its color composition, select specific colors, and receive customized paint mixing recipes using professional oil paint brands.

## Features

- **Image Upload & Analysis:** Upload and analyze images to extract dominant colors, temperature, and chroma characteristics
- **Interactive Color Picker:** Select specific colors from your uploaded images
- **Paint Mixing Assistant:** Get customized mixing recipes using professional-grade oil paints
- **Artist Education:** Explore art principles including chiaroscuro technique through interactive examples
- **Multi-Brand Support:** Works with multiple premium paint brands:
  - Winsor & Newton Artists' Oil Colour
  - Michael Harding Artist Oils
  - Gamblin Artist's Oil Colors

## Technology Stack

- React 19 with TypeScript
- TailwindCSS for styling
- Framer Motion for animations
- Advanced color science libraries:
  - chroma-js
  - color-diff
  - culori
- Responsive design for all device sizes

## Color Science

Chiaroscuro employs sophisticated color science algorithms to:

- Convert between RGB and CIELAB color spaces
- Analyze color temperature and chroma characteristics
- Map digital colors to real-world paint pigments
- Calculate optimal paint mixing ratios based on pigment properties
- Account for the non-linear mixing behavior of oil paints

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ppscon/chiaroscuro.git
   cd chiaroscuro
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

## Usage Guide

1. **Start at the Landing Page:** Learn about the application's capabilities
2. **Upload an Image:** Use the drag-and-drop interface or file browser
3. **Analyze the Image:** View color composition, temperature, and chroma information
4. **Select Colors:** Use the color picker to select specific areas of interest
5. **Get Paint Recipes:** Receive customized mixing formulas using professional oil paints
6. **Explore Educational Content:** Learn about chiaroscuro technique through interactive examples

## Educational Components

The application includes educational resources about:

- The principle of chiaroscuro in painting
- Color temperature and its impact on composition
- Famous works demonstrating chiaroscuro techniques
- Interactive examples from masters like Caravaggio

## Project Milestones

### Version 0.4.0 (Current)
- Optimized image analyzer component for better performance
- Improved workflow to guide users from upload directly to analysis
- Enhanced paint mixing algorithm with more accurate color matching
- Added educational content featuring Caravaggio masterpieces with interactive exploration

### Version 0.3.0
- Implemented PaintMixer component with RGB/HSL interpolation
- Added comprehensive paint database with LAB color values
- Created color picker functionality to sample from uploaded images
- Integrated responsive design for all device sizes

### Version 0.2.0
- Added image analysis features (dominant colors, temperature, chroma)
- Implemented drag-and-drop image upload functionality
- Created initial UI with dark/light theme support
- Built foundation for color science algorithms

### Version 0.1.0
- Initial project setup with React and TypeScript
- Implemented basic routing and component structure
- Added TailwindCSS for styling
- Created project documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Color science libraries and research
- Oil paint pigment data from manufacturer specifications
- Art education resources for chiaroscuro examples
