import { MarketForecasts, MarketForecast, MarketData, ForecastData } from '@/types';

class ForecastService {
  private cache: MarketForecasts | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private lastFetch = 0;

  async getMarketForecasts(): Promise<MarketForecasts> {
    // Return cached data if still valid
    if (this.cache && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      // Try remote URL first if configured
      const remoteUrl = import.meta.env.VITE_REMOTE_FORECAST_URL;
      if (remoteUrl) {
        try {
          const response = await fetch(remoteUrl);
          if (response.ok) {
            const data = await response.json();
            this.cache = data;
            this.lastFetch = Date.now();
            console.log('✅ Market forecasts loaded from remote URL');
            return data;
          }
        } catch (error) {
          console.warn('⚠️ Remote forecast URL failed, falling back to local data:', error);
        }
      }

      // Fallback to local JSON file
      const response = await fetch('/data/market_forecasts.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch market forecasts: ${response.statusText}`);
      }

      const data: MarketForecasts = await response.json();
      this.cache = data;
      this.lastFetch = Date.now();
      console.log('✅ Market forecasts loaded from local data');
      
      return data;
    } catch (error) {
      console.error('❌ Error loading market forecasts:', error);
      throw new Error('Failed to load market forecasts. Please check your connection.');
    }
  }

  async getForecastForCrop(cropId: string): Promise<MarketForecast | null> {
    try {
      const forecasts = await this.getMarketForecasts();
      return forecasts[cropId] || null;
    } catch (error) {
      console.error(`❌ Error getting forecast for crop ${cropId}:`, error);
      return null;
    }
  }

  calculateStats(forecast: MarketForecast) {
    const allPrices = [
      ...forecast.historical.map(d => d.price),
      ...forecast.forecast.map(d => d.pred)
    ];

    const forecastPrices = forecast.forecast.map(d => d.pred);
    const historicalPrices = forecast.historical.map(d => d.price);

    const avgPrice = forecastPrices.reduce((sum, price) => sum + price, 0) / forecastPrices.length;
    const maxPrice = Math.max(...forecastPrices);
    const minPrice = Math.min(...forecastPrices);

    // Find best selling day (highest predicted price)
    const bestDay = forecast.forecast.reduce((max, current) => 
      current.pred > max.pred ? current : max
    );

    // Calculate percentage change from last historical price
    const lastHistoricalPrice = historicalPrices[historicalPrices.length - 1];
    const percentChange = ((avgPrice - lastHistoricalPrice) / lastHistoricalPrice) * 100;

    return {
      averagePrice: Math.round(avgPrice * 100) / 100,
      highestPrice: Math.round(maxPrice * 100) / 100,
      lowestPrice: Math.round(minPrice * 100) / 100,
      bestSellingDay: {
        date: bestDay.date,
        price: Math.round(bestDay.pred * 100) / 100
      },
      percentChange: Math.round(percentChange * 100) / 100,
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable'
    };
  }

  // Get combined data for chart visualization
  getCombinedChartData(forecast: MarketForecast): Array<{
    date: string;
    historical?: number;
    forecast?: number;
    type: 'historical' | 'forecast';
  }> {
    const historicalData = forecast.historical.map(item => ({
      date: item.date,
      historical: item.price,
      type: 'historical' as const
    }));

    const forecastData = forecast.forecast.map(item => ({
      date: item.date,
      forecast: item.pred,
      type: 'forecast' as const
    }));

    return [...historicalData, ...forecastData];
  }

  // Clear cache manually
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }

  // Get cached data without fetching
  getCachedData(): MarketForecasts | null {
    return this.cache;
  }
}

export const forecastService = new ForecastService();