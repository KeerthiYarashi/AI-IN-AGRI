import { IrrigationDecision, CropThreshold } from '@/types';
import { CROP_THRESHOLDS } from '@/utils/constants';
import { weatherService } from './weatherService';

class IrrigationService {
  
  async getIrrigationRecommendation(
    cropId: string, 
    soilMoisture: number,
    manualWeatherOverride?: Array<{date: string, rainfall: number}>
  ): Promise<IrrigationDecision> {
    try {
      // Get crop-specific thresholds
      const threshold = CROP_THRESHOLDS[cropId];
      if (!threshold) {
        throw new Error(`Unknown crop: ${cropId}`);
      }

      // Get weather forecast
      let rainfallForecast;
      if (manualWeatherOverride) {
        rainfallForecast = manualWeatherOverride;
      } else {
        const weather = await weatherService.getCurrentWeather();
        rainfallForecast = weather.forecast.slice(0, 3).map(day => ({
          date: day.date,
          rainfall: day.rainfall
        }));
      }

      // Calculate expected rainfall in next 24-48 hours
      const expectedRainfall = rainfallForecast.slice(0, 2).reduce((total, day) => total + day.rainfall, 0);

      // Make irrigation decision
      const decision = this.makeDecision(threshold, soilMoisture, expectedRainfall);
      
      // Calculate next irrigation date
      const nextIrrigationDate = this.calculateNextIrrigationDate(decision.shouldIrrigate, rainfallForecast);

      return {
        shouldIrrigate: decision.shouldIrrigate,
        reason: decision.reason,
        nextIrrigationDate,
        soilMoistureThreshold: threshold.soilMoistureMin
      };
    } catch (error) {
      console.error('❌ Irrigation service error:', error);
      
      // Fallback decision
      return {
        shouldIrrigate: soilMoisture < 30,
        reason: 'Unable to fetch weather data. Based on soil moisture level only.',
        nextIrrigationDate: this.formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        soilMoistureThreshold: 30
      };
    }
  }

  private makeDecision(
    threshold: CropThreshold, 
    soilMoisture: number, 
    expectedRainfall: number
  ): { shouldIrrigate: boolean; reason: string } {
    
    // Check if soil moisture is below threshold
    const needsWater = soilMoisture < threshold.soilMoistureMin;
    
    // Check if rainfall is expected
    const rainExpected = expectedRainfall >= threshold.rainfallThreshold;

    if (!needsWater) {
      return {
        shouldIrrigate: false,
        reason: `Soil moisture (${soilMoisture}%) is above the minimum threshold (${threshold.soilMoistureMin}%) for ${threshold.name}. No irrigation needed.`
      };
    }

    if (needsWater && rainExpected) {
      return {
        shouldIrrigate: false,
        reason: `Although soil moisture is low (${soilMoisture}%), ${expectedRainfall.toFixed(1)}mm of rain is expected in the next 48 hours. Wait for natural rainfall.`
      };
    }

    if (needsWater && !rainExpected) {
      return {
        shouldIrrigate: true,
        reason: `Soil moisture (${soilMoisture}%) is below threshold (${threshold.soilMoistureMin}%) and minimal rainfall (${expectedRainfall.toFixed(1)}mm) expected. Irrigation recommended.`
      };
    }

    // Edge case - shouldn't reach here
    return {
      shouldIrrigate: false,
      reason: 'Unable to determine irrigation need. Please check sensor data.'
    };
  }

  private calculateNextIrrigationDate(
    shouldIrrigateNow: boolean, 
    rainfallForecast: Array<{date: string, rainfall: number}>
  ): string {
    if (shouldIrrigateNow) {
      return 'Today';
    }

    // Find the next day with low rainfall
    for (let i = 1; i < rainfallForecast.length; i++) {
      if (rainfallForecast[i].rainfall < 5) {
        const daysFromNow = i;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysFromNow);
        
        if (daysFromNow === 1) return 'Tomorrow';
        return this.formatDate(nextDate);
      }
    }

    // Default to 3 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    return this.formatDate(defaultDate);
  }

  private formatDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  }

  // Get irrigation schedule for the week
  async getWeeklySchedule(cropId: string, currentSoilMoisture: number): Promise<Array<{
    date: string;
    shouldIrrigate: boolean;
    expectedMoisture: number;
    reason: string;
  }>> {
    const schedule = [];
    let moisture = currentSoilMoisture;
    
    try {
      const weather = await weatherService.getCurrentWeather();
      const forecast = weather.forecast;

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        // Get rainfall for this day
        const dayRainfall = forecast[i]?.rainfall || 0;
        
        // Simulate daily moisture loss (2-4% per day without rain)
        moisture -= (2 + Math.random() * 2);
        
        // Add moisture from rainfall (roughly 1% per mm of rain)
        moisture += dayRainfall * 0.8;
        moisture = Math.min(moisture, 100); // Cap at 100%

        const decision = await this.getIrrigationRecommendation(cropId, moisture);
        
        // If irrigation happens, boost moisture
        if (decision.shouldIrrigate) {
          moisture += 25; // Irrigation adds ~25% moisture
          moisture = Math.min(moisture, 100);
        }

        schedule.push({
          date: this.formatDate(date),
          shouldIrrigate: decision.shouldIrrigate,
          expectedMoisture: Math.round(moisture),
          reason: decision.reason
        });
      }

      return schedule;
    } catch (error) {
      console.error('❌ Error generating weekly schedule:', error);
      return [];
    }
  }

  // Get crop-specific irrigation tips
  getIrrigationTips(cropId: string): string[] {
    const tips: Record<string, string[]> = {
      tomato: [
        'Water deeply but less frequently to encourage root growth',
        'Avoid watering leaves to prevent disease',
        'Best time to water is early morning',
        'Mulch around plants to retain moisture'
      ],
      onion: [
        'Maintain consistent moisture during bulb formation',
        'Reduce watering as harvest approaches',
        'Shallow roots need frequent light watering',
        'Stop watering 2 weeks before harvest'
      ],
      potato: [
        'Keep soil consistently moist during tuber formation',
        'Hill up soil around plants to protect tubers',
        'Avoid overwatering which can cause rot',
        'Deep watering encourages deeper root growth'
      ],
      wheat: [
        'Critical water need during grain filling stage',
        'Deep, infrequent watering builds drought tolerance',
        'Monitor for water stress during heading',
        'Reduce watering as crop matures'
      ],
      rice: [
        'Maintain 2-5cm standing water during most growth stages',
        'Drain fields before harvest',
        'Alternate wetting and drying can save water',
        'Ensure good drainage to prevent root rot'
      ],
      sugarcane: [
        'High water requirement throughout growing season',
        'Critical need during tillering and grand growth phase',
        'Furrow irrigation is most efficient',
        'Reduce watering during maturity'
      ]
    };

    return tips[cropId] || [
      'Monitor soil moisture regularly',
      'Water early morning or evening',
      'Ensure good drainage',
      'Adjust based on weather conditions'
    ];
  }

  // Check if conditions are ideal for irrigation
  isIdealIrrigationCondition(temperature: number, humidity: number, windSpeed: number = 5): boolean {
    // Ideal conditions: moderate temperature, not too windy, not during hottest part of day
    const hour = new Date().getHours();
    
    return (
      temperature >= 15 && temperature <= 30 && // Moderate temperature
      humidity >= 40 && // Not too dry
      (hour <= 10 || hour >= 17) && // Early morning or evening
      windSpeed <= 15 // Not too windy
    );
  }
}

export const irrigationService = new IrrigationService();