import { WeatherData } from '@/types';

class WeatherService {
  private cache: WeatherData | null = null;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private lastFetch = 0;
  private readonly API_KEY = import.meta.env.VITE_OPENWEATHERMAP_KEY;
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

  async getCurrentWeather(lat?: number, lon?: number): Promise<WeatherData> {
    // Return cached data if still valid
    if (this.cache && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      // Try to get user location if not provided
      const coordinates = await this.getCoordinates(lat, lon);
      
      if (this.API_KEY && coordinates) {
        const weatherData = await this.fetchFromAPI(coordinates.lat, coordinates.lon);
        if (weatherData) {
          this.cache = weatherData;
          this.lastFetch = Date.now();
          return weatherData;
        }
      }

      // Fallback to sample data
      console.warn('⚠️ Using sample weather data (API key not configured or request failed)');
      return await this.getSampleWeatherData();
    } catch (error) {
      console.error('❌ Weather service error:', error);
      return await this.getSampleWeatherData();
    }
  }

  private async getCoordinates(lat?: number, lon?: number): Promise<{lat: number, lon: number} | null> {
    if (lat && lon) {
      return { lat, lon };
    }

    // Try to get current location
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('⚠️ Geolocation not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn('⚠️ Geolocation error:', error.message);
          resolve(null);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  private async fetchFromAPI(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      // Get current weather
      const currentResponse = await fetch(
        `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
      );

      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.statusText}`);
      }

      const currentData = await currentResponse.json();

      // Get 5-day forecast
      const forecastResponse = await fetch(
        `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.statusText}`);
      }

      const forecastData = await forecastResponse.json();

      return this.parseWeatherData(currentData, forecastData);
    } catch (error) {
      console.error('❌ OpenWeatherMap API failed:', error);
      return null;
    }
  }

  private parseWeatherData(currentData: any, forecastData: any): WeatherData {
    // Parse current weather
    const current = {
      temperature: Math.round(currentData.main.temp * 10) / 10,
      humidity: currentData.main.humidity,
      rainfall: currentData.rain?.['1h'] || 0,
      description: currentData.weather[0].description,
      location: `${currentData.name}, ${currentData.sys.country}`
    };

    // Parse forecast data (next 5 days, one reading per day)
    const forecast = [];
    const processedDates = new Set();

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      // Only take one reading per day (skip if already processed)
      if (processedDates.has(date) || forecast.length >= 5) {
        continue;
      }

      processedDates.add(date);
      forecast.push({
        date,
        rainfall: item.rain?.['3h'] || 0,
        temperature: Math.round(item.main.temp * 10) / 10,
        humidity: item.main.humidity,
        description: item.weather[0].description
      });
    }

    return {
      temperature: current.temperature,
      humidity: current.humidity,
      rainfall: current.rainfall,
      current: {
        temperature: current.temperature,
        humidity: current.humidity,
        rainfall: current.rainfall,
      },
      forecast
    };
  }

  private async getSampleWeatherData(): Promise<WeatherData> {
    try {
      const response = await fetch('/data/weather_sample.json');
      if (response.ok) {
        const data = await response.json();
        return {
          temperature: data.current.temperature,
          humidity: data.current.humidity,
          rainfall: data.current.rainfall,
          current: {
            temperature: data.current.temperature,
            humidity: data.current.humidity,
            rainfall: data.current.rainfall,
          },
          forecast: data.forecast
        };
      }
    } catch (error) {
      console.error('❌ Failed to load sample weather data:', error);
    }

    // Hardcoded fallback
    return {
      temperature: 28.5,
      humidity: 65,
      rainfall: 0,
      current: {
        temperature: 28.5,
        humidity: 65,
        rainfall: 0,
      },
      forecast: [
        { date: '2025-09-24', rainfall: 2.3, temperature: 27.2, humidity: 72, description: 'Light Rain' },
        { date: '2025-09-25', rainfall: 8.7, temperature: 25.8, humidity: 78, description: 'Moderate Rain' },
        { date: '2025-09-26', rainfall: 0.5, temperature: 29.1, humidity: 58, description: 'Partly Cloudy' },
        { date: '2025-09-27', rainfall: 0, temperature: 30.2, humidity: 52, description: 'Sunny' },
        { date: '2025-09-28', rainfall: 15.2, temperature: 24.5, humidity: 85, description: 'Heavy Rain' }
      ]
    };
  }

  // Get rainfall forecast for next N days
  getRainfallForecast(days: number = 3): Array<{date: string, rainfall: number}> {
    if (!this.cache) return [];

    return this.cache.forecast
      .slice(0, days)
      .map(day => ({
        date: day.date,
        rainfall: day.rainfall
      }));
  }

  // Get total expected rainfall for next N days
  getTotalRainfall(days: number = 3): number {
    const forecast = this.getRainfallForecast(days);
    return forecast.reduce((total, day) => total + day.rainfall, 0);
  }

  // Clear cache
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }

  // Check if API is configured
  isAPIConfigured(): boolean {
    return !!this.API_KEY;
  }

  // Get cached weather data
  getCachedData(): WeatherData | null {
    return this.cache;
  }
}

export const weatherService = new WeatherService();