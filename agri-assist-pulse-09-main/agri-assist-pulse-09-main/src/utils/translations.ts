import { Translations } from '@/types';

export const translations: Translations = {
  // Navigation
  dashboard: { en: 'Dashboard', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  marketForecaster: { en: 'Market Forecaster', kn: 'ಮಾರುಕಟ್ಟೆ ಮುನ್ಸೂಚಕ' },
  pestDetection: { en: 'Pest Detection', kn: 'ಕೀಟ ಪತ್ತೆ' },
  irrigationPredictor: { en: 'Irrigation Predictor', kn: 'ನೀರಾವರಿ ಮುನ್ಸೂಚಕ' },
  carbonEstimator: { en: 'Carbon Estimator', kn: 'ಇಂಗಾಲ ಅಂದಾಜುಗಾರ' },

  // Dashboard
  welcome: { en: 'Welcome to AI Agri Assistant', kn: 'AI ಕೃಷಿ ಸಹಾಯಕಕ್ಕೆ ಸ್ವಾಗತ' },
  todaysInsights: { en: "Today's Insights", kn: 'ಇಂದಿನ ಒಳನೋಟಗಳು' },
  bestCropToSell: { en: 'Best Crop to Sell', kn: 'ಮಾರಾಟ ಮಾಡಲು ಉತ್ತಮ ಬೆಳೆ' },
  irrigationStatus: { en: 'Irrigation Status', kn: 'ನೀರಾವರಿ ಸ್ಥಿತಿ' },
  pestRiskLevel: { en: 'Pest Risk Level', kn: 'ಕೀಟ ಅಪಾಯ ಮಟ್ಟ' },
  carbonFootprint: { en: 'Carbon Footprint', kn: 'ಇಂಗಾಲದ ಹೆಜ್ಜೆಗುರುತು' },

  // Market Forecaster
  selectCrop: { en: 'Select Crop', kn: 'ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ' },
  priceHistory: { en: 'Price History & Forecast', kn: 'ಬೆಲೆ ಇತಿಹಾಸ ಮತ್ತು ಮುನ್ಸೂಚನೆ' },
  bestSellingDay: { en: 'Best Selling Day', kn: 'ಉತ್ತಮ ಮಾರಾಟದ ದಿನ' },
  averagePrice: { en: 'Average Price', kn: 'ಸರಾಸರಿ ಬೆಲೆ' },
  highestPrice: { en: 'Highest Price', kn: 'ಅತ್ಯಧಿಕ ಬೆಲೆ' },
  lowestPrice: { en: 'Lowest Price', kn: 'ಕಡಿಮೆ ಬೆಲೆ' },

  // Pest Detection
  uploadImage: { en: 'Upload Crop Image', kn: 'ಬೆಳೆಯ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' },
  dragDropImage: { en: 'Drag & drop image or click to select', kn: 'ಚಿತ್ರವನ್ನು ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ' },
  scanning: { en: 'Scanning...', kn: 'ಸ್ಕಾನ್ ಮಾಡುತ್ತಿದೆ...' },
  diseaseDetected: { en: 'Disease Detected', kn: 'ರೋಗ ಪತ್ತೆಯಾಗಿದೆ' },
  healthy: { en: 'Healthy', kn: 'ಆರೋಗ್ಯಕರ' },
  confidence: { en: 'Confidence', kn: 'ವಿಶ್ವಾಸ' },
  remedies: { en: 'Remedies', kn: 'ಪರಿಹಾರಗಳು' },

  // Irrigation
  soilMoisture: { en: 'Soil Moisture', kn: 'ಮಣ್ಣಿನ ತೇವಾಂಶ' },
  weatherForecast: { en: 'Weather Forecast', kn: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ' },
  irrigationNeeded: { en: 'Irrigation Needed', kn: 'ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ' },
  irrigationNotNeeded: { en: 'Irrigation Not Needed', kn: 'ನೀರಾವರಿ ಅಗತ್ಯವಿಲ್ಲ' },
  nextIrrigation: { en: 'Next Irrigation', kn: 'ಮುಂದಿನ ನೀರಾವರಿ' },
  rainfall: { en: 'Rainfall', kn: 'ಮಳೆ' },

  // Carbon Estimator
  fertilizerUsed: { en: 'Fertilizer Used (kg)', kn: 'ಬಳಸಿದ ರಸಗೊಬ್ಬರ (ಕೆಜಿ)' },
  machineryHours: { en: 'Machinery Hours', kn: 'ಯಂತ್ರೋಪಕರಣ ಗಂಟೆಗಳು' },
  totalEmissions: { en: 'Total Emissions', kn: 'ಒಟ್ಟು ಹೊರಸೂಸುವಿಕೆ' },
  emissionLevel: { en: 'Emission Level', kn: 'ಹೊರಸೂಸುವಿಕೆ ಮಟ್ಟ' },
  ecoTips: { en: 'Eco Tips', kn: 'ಪರಿಸರ ಸಲಹೆಗಳು' },

  // Common
  loading: { en: 'Loading...', kn: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' },
  error: { en: 'Error', kn: 'ದೋಷ' },
  retry: { en: 'Retry', kn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' },
  offline: { en: 'Offline', kn: 'ಆಫ್‌ಲೈನ್' },
  online: { en: 'Online', kn: 'ಆನ್‌ಲೈನ್' },
  low: { en: 'Low', kn: 'ಕಡಿಮೆ' },
  medium: { en: 'Medium', kn: 'ಮಧ್ಯಮ' },
  high: { en: 'High', kn: 'ಹೆಚ್ಚು' },
  yes: { en: 'Yes', kn: 'ಹೌದು' },
  no: { en: 'No', kn: 'ಇಲ್ಲ' },
  today: { en: 'Today', kn: 'ಇಂದು' },
  tomorrow: { en: 'Tomorrow', kn: 'ನಾಳೆ' }
};

export const useTranslation = () => {
  // In a real app, this would get language from context/localStorage
  const currentLang: 'en' | 'kn' = 'en';

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][currentLang];
    }
    return key; // fallback to key if translation not found
  };

  const getTranslationWithFallback = (key: string): { primary: string; secondary: string } => {
    const translation = translations[key];
    if (!translation) return { primary: key, secondary: '' };
    
    return {
      primary: translation.en,
      secondary: translation.kn
    };
  };

  return { t, getTranslationWithFallback, currentLang };
};

// Create TRANSLATIONS object for backwards compatibility
export const TRANSLATIONS = {
  en: {} as Record<string, string>,
  kn: {} as Record<string, string>
};

// Populate TRANSLATIONS with direct access to translations
Object.keys(translations).forEach(key => {
  TRANSLATIONS.en[key] = translations[key].en;
  TRANSLATIONS.kn[key] = translations[key].kn;
});