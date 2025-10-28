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

export interface Language {
  code: 'en' | 'kn';
  name: string;
  nativeName: string;
}

export interface Translations {
  [key: string]: {
    en: string;
    kn: string;
  };
}