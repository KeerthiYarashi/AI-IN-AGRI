import { CropType, EmissionFactors, CropThreshold, Language } from '@/types';

// Crop types with bilingual support
export const CROP_TYPES: CropType[] = [
  { id: 'tomato', name: 'Tomato', nameKannada: 'ಟೊಮೆಟೊ', icon: '🍅' },
  { id: 'onion', name: 'Onion', nameKannada: 'ಈರುಳ್ಳಿ', icon: '🧅' },
  { id: 'potato', name: 'Potato', nameKannada: 'ಆಲೂಗಡ್ಡೆ', icon: '🥔' },
  { id: 'wheat', name: 'Wheat', nameKannada: 'ಗೋಧಿ', icon: '🌾' },
  { id: 'rice', name: 'Rice', nameKannada: 'ಅಕ್ಕಿ', icon: '🌾' },
  { id: 'sugarcane', name: 'Sugarcane', nameKannada: 'ಕಬ್ಬು', icon: '🎋' }
];

// Alias for backwards compatibility
export const CROPS = CROP_TYPES;

// Emission factors for carbon footprint calculation (kg CO2e)
export const EMISSION_FACTORS: EmissionFactors = {
  urea: 1.5,        // kg CO2e per kg urea
  dap: 1.3,         // kg CO2e per kg DAP fertilizer
  tractor: 2.6,     // kg CO2e per hour
  pump: 1.2         // kg CO2e per hour
};

// Crop-specific irrigation thresholds
export const CROP_THRESHOLDS: Record<string, CropThreshold> = {
  tomato: { soilMoistureMin: 30, rainfallThreshold: 5, name: 'Tomato' },
  onion: { soilMoistureMin: 25, rainfallThreshold: 3, name: 'Onion' },
  potato: { soilMoistureMin: 35, rainfallThreshold: 6, name: 'Potato' },
  wheat: { soilMoistureMin: 20, rainfallThreshold: 4, name: 'Wheat' },
  rice: { soilMoistureMin: 80, rainfallThreshold: 10, name: 'Rice' },
  sugarcane: { soilMoistureMin: 40, rainfallThreshold: 8, name: 'Sugarcane' }
};

// Carbon footprint thresholds (kg CO2e per week)
export const CARBON_THRESHOLDS = {
  LOW: 150,
  MEDIUM: 300
};

// API endpoints (with fallbacks)
export const API_ENDPOINTS = {
  WEATHER: 'https://api.openweathermap.org/data/2.5',
  PLANT_ID: 'https://api.plant.id/v3',
  FORECAST: import.meta.env.VITE_REMOTE_FORECAST_URL || null
};

// Languages
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
];

// Disease remedy suggestions
export const ORGANIC_REMEDIES: Record<string, string[]> = {
  'leaf_blight': [
    'Apply neem oil spray (organic pesticide)',
    'Remove affected leaves immediately',
    'Improve air circulation around plants',
    'Apply copper-based fungicide'
  ],
  'powdery_mildew': [
    'Spray baking soda solution (1 tsp per liter)',
    'Apply neem oil in early morning',
    'Ensure proper spacing between plants',
    'Use organic sulfur spray'
  ],
  'bacterial_spot': [
    'Remove infected plant parts',
    'Apply copper hydroxide spray',
    'Avoid overhead watering',
    'Use disease-resistant varieties'
  ],
  'healthy': [
    'Continue current care practices',
    'Maintain regular watering schedule',
    'Monitor for early signs of disease',
    'Apply organic compost regularly'
  ]
};

// Carbon reduction tips
export const CARBON_TIPS = {
  HIGH: [
    'Switch to organic compost instead of chemical fertilizers',
    'Use solar-powered irrigation pumps',
    'Implement drip irrigation to reduce machinery use',
    'Practice crop rotation to improve soil health naturally'
  ],
  MEDIUM: [
    'Reduce fertilizer usage by 15-20%',
    'Use precision farming techniques',
    'Implement cover cropping',
    'Optimize machinery usage timing'
  ],
  LOW: [
    'Maintain current sustainable practices',
    'Consider adding more organic matter to soil',
    'Monitor and optimize resource usage',
    'Share best practices with other farmers'
  ]
};

// Default chart colors
export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  market: 'hsl(var(--market-color))',
  pest: 'hsl(var(--pest-color))',
  irrigation: 'hsl(var(--irrigation-color))',
  carbon: 'hsl(var(--carbon-color))'
};