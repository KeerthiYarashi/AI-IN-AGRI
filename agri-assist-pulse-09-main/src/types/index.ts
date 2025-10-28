// Type definitions for AI Agri Assistant

export interface MarketData {
  date: string;
  price: number;
}

export interface ForecastData {
  date: string;
  pred: number;
}

export interface MarketForecast {
  historical: MarketData[];
  forecast: ForecastData[];
  insights?: {
    trend: 'bullish' | 'bearish' | 'stable';
    volatility: 'low' | 'medium' | 'high';
    recommendation: string;
    confidence: number;
  };
}

export interface MarketForecasts {
  [crop: string]: MarketForecast;
}

export interface PestDetectionResult {
  diseaseName: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  remedies: string[];
  isHealthy: boolean;
  source?: 'local_model' | 'plant_id_api' | 'sample';
  lowConfidence?: boolean;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
  forecast: {
    date: string;
    rainfall: number;
    temperature: number;
    humidity: number;
    description: string;
  }[];
}

export interface IrrigationDecision {
  shouldIrrigate: boolean;
  reason: string;
  nextIrrigationDate: string;
  soilMoistureThreshold: number;
}

export interface CropThreshold {
  soilMoistureMin: number;
  rainfallThreshold: number;
  name: string;
}

export interface CarbonFootprint {
  fertilizer: number;
  machinery: number;
  other: number;
  total: number;
  level: 'low' | 'medium' | 'high';
  tips: string[];
}

export interface EmissionFactors {
  urea: number;
  dap: number;
  tractor: number;
  pump: number;
}

export interface CropType {
  id: string;
  name: string;
  nameKannada: string;
  icon: string;
}

export interface DashboardKPI {
  bestCropToSell: string;
  irrigationStatus: 'needed' | 'not-needed' | 'unknown';
  pestRiskLevel: 'low' | 'medium' | 'high';
  carbonIndex: number;
}

export type LanguageCode = 'en' | 'kn' | 'hi' | 'te' | 'ta';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export interface Translations {
  [key: string]: Partial<Record<LanguageCode, string>>;
}

export interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  farmArea: number;
  location: string;
  createdAt: string;
  lastLogin: string;
}

export interface FarmerActivity {
  farmerId: string;
  marketForecasts: {
    crop: string;
    date: string;
    price: number;
  }[];
  pestDetections: {
    date: string;
    crop: string;
    disease: string;
    confidence: number;
  }[];
  irrigationHistory: {
    date: string;
    crop: string;
    decision: boolean;
    soilMoisture: number;
  }[];
  carbonHistory: {
    date: string;
    total: number;
    level: string;
  }[];
  yieldEstimates: {
    date: string;
    crop: string;
    area: number;
    estimatedYield: number;
  }[];
}

export interface AuthState {
  isAuthenticated: boolean;
  farmer: Farmer | null;
  loading: boolean;
  error: string | null;
}

// Add missing PlantIdResponse type
export interface PlantIdResponse {
  result: {
    is_healthy: boolean;
    disease: {
      name: string;
      probability: number;
      treatment?: {
        prevention?: string[];
        chemical?: string[];
        biological?: string[];
      };
    };
  };
}