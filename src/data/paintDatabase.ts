import { Paint } from '../context/PaintContext';

interface PigmentInfo {
  name: string;
  chemicalComposition: string;
  characteristics: {
    tintingStrength: 'High' | 'Medium' | 'Low';
    transparency: 'Opaque' | 'Semi-Opaque' | 'Semi-Transparent' | 'Transparent';
    temperature: 'Warm' | 'Cool' | 'Neutral';
  };
}

interface PaintDatabase {
  brands: {
    [key: string]: {
      name: string;
      colors: Paint[];
    };
  };
  pigments: {
    [key: string]: PigmentInfo;
  };
}

// This is a starter database with a subset of paints
// In a production environment, this would be expanded
// to include all paints from all supported brands
export const paintDatabase: PaintDatabase = {
  brands: {
    "Winsor & Newton Artists' Oil Colour": {
      name: "Winsor & Newton Artists' Oil Colour",
      colors: [
        {
          id: "wn-titanium-white",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Titanium White",
          pigmentCodes: ["PW6"],
          opacity: "O",
          binder: "Safflower Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "High",
          lab: { L: 96.3, a: -0.8, b: 2.6 },
          swatch: "#FCFCFC"
        },
        {
          id: "wn-cadmium-yellow-pale",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Cadmium Yellow Pale",
          pigmentCodes: ["PY35"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "High",
          lab: { L: 90.2, a: 3.1, b: 89.6 },
          swatch: "#FFEE44"
        },
        {
          id: "wn-cadmium-yellow",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Cadmium Yellow",
          pigmentCodes: ["PY35"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "High",
          lab: { L: 88.1, a: 14.2, b: 92.7 },
          swatch: "#FBE422"
        },
        {
          id: "wn-cadmium-orange",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Cadmium Orange",
          pigmentCodes: ["PO20"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "High",
          lab: { L: 74.8, a: 57.5, b: 77.3 },
          swatch: "#F17A0F"
        },
        {
          id: "wn-cadmium-red",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Cadmium Red",
          pigmentCodes: ["PR108"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "High",
          lab: { L: 54.9, a: 70.1, b: 51.2 },
          swatch: "#D92725"
        },
        {
          id: "wn-alizarin-crimson",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Alizarin Crimson",
          pigmentCodes: ["PR83"],
          opacity: "ST",
          binder: "Linseed Oil",
          lightfastness: "ASTM III",
          series: "2",
          tintingStrength: "Medium",
          lab: { L: 42.7, a: 60.2, b: 21.3 },
          swatch: "#A60C28"
        },
        {
          id: "wn-permanent-rose",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Permanent Rose",
          pigmentCodes: ["PV19"],
          opacity: "ST",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "3",
          tintingStrength: "Medium",
          lab: { L: 58.7, a: 69.8, b: -5.6 },
          swatch: "#E04583"
        },
        {
          id: "wn-french-ultramarine",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "French Ultramarine",
          pigmentCodes: ["PB29"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "2",
          tintingStrength: "Medium",
          lab: { L: 39.4, a: 14.2, b: -47.3 },
          swatch: "#3B4C8D"
        },
        {
          id: "wn-cobalt-blue",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Cobalt Blue",
          pigmentCodes: ["PB28"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "5",
          tintingStrength: "Low",
          lab: { L: 53.8, a: -10.9, b: -42.1 },
          swatch: "#305A9E"
        },
        {
          id: "wn-phthalo-blue",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Phthalo Blue",
          pigmentCodes: ["PB15:3"],
          opacity: "T",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "2",
          tintingStrength: "High",
          lab: { L: 38.3, a: -24.7, b: -52.6 },
          swatch: "#0E2760"
        },
        {
          id: "wn-viridian",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Viridian",
          pigmentCodes: ["PG18"],
          opacity: "T",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "Low",
          lab: { L: 53.2, a: -52.3, b: 5.4 },
          swatch: "#00885A"
        },
        {
          id: "wn-sap-green",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Sap Green",
          pigmentCodes: ["PG36", "PY110"],
          opacity: "T",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "Medium",
          lab: { L: 56.1, a: -34.8, b: 34.2 },
          swatch: "#2E5C35"
        },
        {
          id: "wn-yellow-ochre",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Yellow Ochre",
          pigmentCodes: ["PY43"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "Low",
          lab: { L: 75.6, a: 13.8, b: 59.1 },
          swatch: "#C79839"
        },
        {
          id: "wn-burnt-sienna",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Burnt Sienna",
          pigmentCodes: ["PBr7"],
          opacity: "ST",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "Low",
          lab: { L: 48.2, a: 31.6, b: 36.3 },
          swatch: "#8F4E16"
        },
        {
          id: "wn-burnt-umber",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Burnt Umber",
          pigmentCodes: ["PBr7"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "Low",
          lab: { L: 39.6, a: 12.4, b: 23.1 },
          swatch: "#5E3C25"
        },
        {
          id: "wn-ivory-black",
          brand: "Winsor & Newton Artists' Oil Colour",
          name: "Ivory Black",
          pigmentCodes: ["PBk9"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "High",
          lab: { L: 24.6, a: -0.7, b: 0.4 },
          swatch: "#222222"
        }
      ]
    },
    "Gamblin Artist's Oil Colors": {
      name: "Gamblin Artist's Oil Colors",
      colors: [
        {
          id: "gamblin-titanium-white",
          brand: "Gamblin Artist's Oil Colors",
          name: "Titanium White",
          pigmentCodes: ["PW6"],
          opacity: "O",
          binder: "Safflower Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "High",
          lab: { L: 96.4, a: -1.0, b: 2.8 },
          munsell: { hue: "10Y", value: 9.5, chroma: 1 },
          swatch: "#FCFCFC"
        },
        {
          id: "gamblin-cadmium-yellow-light",
          brand: "Gamblin Artist's Oil Colors",
          name: "Cadmium Yellow Light",
          pigmentCodes: ["PY35"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "High",
          lab: { L: 90.3, a: 2.9, b: 87.2 },
          munsell: { hue: "5Y", value: 9, chroma: 10 },
          swatch: "#FFF04E"
        },
        {
          id: "gamblin-cadmium-yellow-medium",
          brand: "Gamblin Artist's Oil Colors",
          name: "Cadmium Yellow Medium",
          pigmentCodes: ["PY37"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "High",
          lab: { L: 88.7, a: 13.7, b: 93.2 },
          munsell: { hue: "2.5Y", value: 8.5, chroma: 14 },
          swatch: "#FFBE00"
        },
        {
          id: "gamblin-cadmium-orange",
          brand: "Gamblin Artist's Oil Colors",
          name: "Cadmium Orange",
          pigmentCodes: ["PO20"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "High",
          lab: { L: 74.7, a: 56.9, b: 79.1 },
          munsell: { hue: "10R", value: 7, chroma: 16 },
          swatch: "#F36C01"
        },
        {
          id: "gamblin-cadmium-red-medium",
          brand: "Gamblin Artist's Oil Colors",
          name: "Cadmium Red Medium",
          pigmentCodes: ["PR108"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "High",
          lab: { L: 54.6, a: 70.5, b: 48.9 },
          munsell: { hue: "5R", value: 5, chroma: 14 },
          swatch: "#DE372B"
        },
        {
          id: "gamblin-alizarin-permanent",
          brand: "Gamblin Artist's Oil Colors",
          name: "Alizarin Permanent",
          pigmentCodes: ["PR177", "PR264"],
          opacity: "T",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "3",
          tintingStrength: "Medium",
          lab: { L: 42.9, a: 59.8, b: 20.7 },
          munsell: { hue: "2.5R", value: 4, chroma: 10 },
          swatch: "#9F0812"
        },
        {
          id: "gamblin-ultramarine-blue",
          brand: "Gamblin Artist's Oil Colors",
          name: "Ultramarine Blue",
          pigmentCodes: ["PB29"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "2",
          tintingStrength: "Medium",
          lab: { L: 39.6, a: 15.1, b: -48.3 },
          munsell: { hue: "7.5PB", value: 3.5, chroma: 12 },
          swatch: "#1A237E"
        },
        {
          id: "gamblin-phthalo-blue",
          brand: "Gamblin Artist's Oil Colors",
          name: "Phthalo Blue",
          pigmentCodes: ["PB15:3"],
          opacity: "T",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "2",
          tintingStrength: "High",
          lab: { L: 37.9, a: -25.1, b: -53.2 },
          munsell: { hue: "5PB", value: 3, chroma: 14 },
          swatch: "#0D47A1"
        },
        {
          id: "gamblin-viridian",
          brand: "Gamblin Artist's Oil Colors",
          name: "Viridian",
          pigmentCodes: ["PG18"],
          opacity: "T",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "4",
          tintingStrength: "Low",
          lab: { L: 53.6, a: -52.8, b: 5.1 },
          munsell: { hue: "5G", value: 5, chroma: 8 },
          swatch: "#00796B"
        },
        {
          id: "gamblin-yellow-ochre",
          brand: "Gamblin Artist's Oil Colors",
          name: "Yellow Ochre",
          pigmentCodes: ["PY43"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "Low",
          lab: { L: 75.2, a: 14.2, b: 58.3 },
          munsell: { hue: "10YR", value: 7, chroma: 8 },
          swatch: "#C88A2E"
        },
        {
          id: "gamblin-burnt-sienna",
          brand: "Gamblin Artist's Oil Colors",
          name: "Burnt Sienna",
          pigmentCodes: ["PBr7"],
          opacity: "ST",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "Low",
          lab: { L: 47.9, a: 32.1, b: 35.8 },
          munsell: { hue: "7.5YR", value: 4.5, chroma: 6 },
          swatch: "#8A3D11"
        },
        {
          id: "gamblin-burnt-umber",
          brand: "Gamblin Artist's Oil Colors",
          name: "Burnt Umber",
          pigmentCodes: ["PBr7"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "Low",
          lab: { L: 39.2, a: 12.9, b: 22.4 },
          munsell: { hue: "7.5YR", value: 3.5, chroma: 4 },
          swatch: "#513625"
        },
        {
          id: "gamblin-ivory-black",
          brand: "Gamblin Artist's Oil Colors",
          name: "Ivory Black",
          pigmentCodes: ["PBk9"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "High",
          lab: { L: 24.3, a: -0.5, b: 0.6 },
          munsell: { hue: "N", value: 2, chroma: 0 },
          swatch: "#212121"
        }
      ]
    },
    "Michael Harding Artist Oils": {
      name: "Michael Harding Artist Oils",
      colors: [
        {
          id: "mh-titanium-white",
          brand: "Michael Harding Artist Oils",
          name: "Titanium White No. 1",
          pigmentCodes: ["PW6"],
          opacity: "O",
          binder: "Safflower Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "High",
          lab: { L: 96.5, a: -0.9, b: 2.7 },
          swatch: "#FDFDFD"
        },
        {
          id: "mh-cadmium-yellow-light",
          brand: "Michael Harding Artist Oils",
          name: "Cadmium Yellow Light",
          pigmentCodes: ["PY35"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "5",
          tintingStrength: "High",
          lab: { L: 90.5, a: 3.0, b: 88.7 },
          swatch: "#FFF24F"
        },
        {
          id: "mh-cadmium-red",
          brand: "Michael Harding Artist Oils",
          name: "Cadmium Red",
          pigmentCodes: ["PR108"],
          opacity: "O",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "5",
          tintingStrength: "High",
          lab: { L: 55.2, a: 71.3, b: 50.4 },
          swatch: "#DF2B26"
        },
        {
          id: "mh-rose-madder-genuine",
          brand: "Michael Harding Artist Oils",
          name: "Rose Madder Genuine",
          pigmentCodes: ["NR9"],
          opacity: "T",
          binder: "Linseed Oil",
          lightfastness: "ASTM IV",
          series: "5",
          tintingStrength: "Low",
          lab: { L: 62.5, a: 64.8, b: 16.3 },
          swatch: "#D25A72"
        },
        {
          id: "mh-french-ultramarine-blue",
          brand: "Michael Harding Artist Oils",
          name: "French Ultramarine Blue",
          pigmentCodes: ["PB29"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "3",
          tintingStrength: "Medium",
          lab: { L: 39.8, a: 15.0, b: -49.2 },
          swatch: "#283593"
        },
        {
          id: "mh-phthalo-blue",
          brand: "Michael Harding Artist Oils",
          name: "Phthalo Blue",
          pigmentCodes: ["PB15:3"],
          opacity: "T",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "2",
          tintingStrength: "High",
          lab: { L: 37.8, a: -25.3, b: -53.8 },
          swatch: "#0D47A1"
        },
        {
          id: "mh-yellow-ochre",
          brand: "Michael Harding Artist Oils",
          name: "Yellow Ochre",
          pigmentCodes: ["PY43"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "Low",
          lab: { L: 76.1, a: 14.5, b: 60.2 },
          swatch: "#CA9A3E"
        },
        {
          id: "mh-burnt-sienna",
          brand: "Michael Harding Artist Oils",
          name: "Burnt Sienna",
          pigmentCodes: ["PBr7"],
          opacity: "ST",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "Low",
          lab: { L: 48.5, a: 32.5, b: 36.9 },
          swatch: "#8F4315"
        },
        {
          id: "mh-ivory-black",
          brand: "Michael Harding Artist Oils",
          name: "Ivory Black",
          pigmentCodes: ["PBk9"],
          opacity: "SO",
          binder: "Linseed Oil",
          lightfastness: "ASTM I",
          series: "1",
          tintingStrength: "High",
          lab: { L: 24.1, a: -0.6, b: 0.5 },
          swatch: "#212121"
        }
      ]
    }
  },
  pigments: {
    "PW6": {
      name: "Titanium White",
      chemicalComposition: "Titanium Dioxide",
      characteristics: {
        tintingStrength: "High",
        transparency: "Opaque",
        temperature: "Neutral"
      }
    },
    "PY35": {
      name: "Cadmium Yellow",
      chemicalComposition: "Cadmium Zinc Sulfide",
      characteristics: {
        tintingStrength: "High",
        transparency: "Opaque",
        temperature: "Warm"
      }
    },
    "PY37": {
      name: "Cadmium Yellow Medium",
      chemicalComposition: "Cadmium Sulfide",
      characteristics: {
        tintingStrength: "High",
        transparency: "Opaque",
        temperature: "Warm"
      }
    },
    "PO20": {
      name: "Cadmium Orange",
      chemicalComposition: "Cadmium Sulfoselenide",
      characteristics: {
        tintingStrength: "High",
        transparency: "Opaque",
        temperature: "Warm"
      }
    },
    "PR108": {
      name: "Cadmium Red",
      chemicalComposition: "Cadmium Seleno-sulfide",
      characteristics: {
        tintingStrength: "High",
        transparency: "Opaque",
        temperature: "Warm"
      }
    },
    "PR83": {
      name: "Alizarin Crimson",
      chemicalComposition: "1,2-dihydroxyanthraquinone",
      characteristics: {
        tintingStrength: "Medium",
        transparency: "Semi-Transparent",
        temperature: "Cool"
      }
    },
    "PR177": {
      name: "Anthraquinone Red",
      chemicalComposition: "Anthraquinone",
      characteristics: {
        tintingStrength: "Medium",
        transparency: "Transparent",
        temperature: "Cool"
      }
    },
    "PR264": {
      name: "Naphthol Red",
      chemicalComposition: "Naphthol AS",
      characteristics: {
        tintingStrength: "Medium",
        transparency: "Semi-Transparent",
        temperature: "Warm"
      }
    },
    "PV19": {
      name: "Quinacridone Rose",
      chemicalComposition: "Quinacridone",
      characteristics: {
        tintingStrength: "Medium",
        transparency: "Semi-Transparent",
        temperature: "Cool"
      }
    },
    "PB29": {
      name: "Ultramarine Blue",
      chemicalComposition: "Complex Silicate of Sodium and Aluminum with Sulfur",
      characteristics: {
        tintingStrength: "Medium",
        transparency: "Semi-Opaque",
        temperature: "Warm"
      }
    },
    "PB28": {
      name: "Cobalt Blue",
      chemicalComposition: "Cobalt Aluminate",
      characteristics: {
        tintingStrength: "Low",
        transparency: "Semi-Opaque",
        temperature: "Cool"
      }
    },
    "PB15:3": {
      name: "Phthalo Blue",
      chemicalComposition: "Copper Phthalocyanine",
      characteristics: {
        tintingStrength: "High",
        transparency: "Transparent",
        temperature: "Cool"
      }
    },
    "PG18": {
      name: "Viridian",
      chemicalComposition: "Hydrated Chromium Oxide",
      characteristics: {
        tintingStrength: "Low",
        transparency: "Transparent",
        temperature: "Cool"
      }
    },
    "PG36": {
      name: "Phthalo Green (Yellowish)",
      chemicalComposition: "Chlorinated Copper Phthalocyanine",
      characteristics: {
        tintingStrength: "High",
        transparency: "Transparent",
        temperature: "Cool"
      }
    },
    "PY110": {
      name: "Isoindolinone Yellow",
      chemicalComposition: "Isoindolinone",
      characteristics: {
        tintingStrength: "Medium",
        transparency: "Transparent",
        temperature: "Warm"
      }
    },
    "PY43": {
      name: "Yellow Ochre",
      chemicalComposition: "Natural Hydrated Iron Oxide",
      characteristics: {
        tintingStrength: "Low",
        transparency: "Semi-Opaque",
        temperature: "Warm"
      }
    },
    "PBr7": {
      name: "Natural Earth Pigment",
      chemicalComposition: "Natural Iron Oxide",
      characteristics: {
        tintingStrength: "Low",
        transparency: "Semi-Transparent",
        temperature: "Warm"
      }
    },
    "PBk9": {
      name: "Ivory Black",
      chemicalComposition: "Amorphous Carbon from Charred Bones",
      characteristics: {
        tintingStrength: "High",
        transparency: "Semi-Opaque",
        temperature: "Cool"
      }
    },
    "NR9": {
      name: "Natural Madder Lake",
      chemicalComposition: "Natural Madder Root Extract",
      characteristics: {
        tintingStrength: "Low",
        transparency: "Transparent",
        temperature: "Cool"
      }
    }
  }
};

/**
 * Returns all paint colors from all brands in the database
 */
export function getAllPaints(): Paint[] {
  const allPaints: Paint[] = [];
  
  Object.values(paintDatabase.brands).forEach(brand => {
    allPaints.push(...brand.colors);
  });
  
  return allPaints;
}