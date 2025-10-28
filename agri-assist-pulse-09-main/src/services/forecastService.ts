import { MarketForecasts, MarketForecast, MarketData, ForecastData } from '@/types';
import { mandiApiService } from './mandiApiService';

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
      // Try Mandi API first for real-time data
      console.log('📡 Attempting to fetch from Mandi API...');
      const mandiData = await this.fetchFromMandiAPI();
      if (mandiData) {
        this.cache = mandiData;
        this.lastFetch = Date.now();
        console.log('✅ Market forecasts loaded from Mandi API (REAL-TIME)');
        return mandiData;
      }
    } catch (error) {
      console.warn('⚠️ Mandi API failed, falling back to remote/local data:', error);
    }

    try {
      // Try remote URL as fallback
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
          console.warn('⚠️ Remote forecast URL failed:', error);
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
      console.log('✅ Market forecasts loaded from local data (SAMPLE)');
      
      return data;
    } catch (error) {
      console.error('❌ Error loading market forecasts:', error);
      throw new Error('Failed to load market forecasts. Please check your connection.');
    }
  }

  /**
   * Fetch real-time data from Mandi API
   */
  private async fetchFromMandiAPI(): Promise<MarketForecasts | null> {
    try {
      const crops = ['tomato', 'onion', 'potato', 'wheat'];
      const forecasts: MarketForecasts = {};

      for (const crop of crops) {
        const commodityName = mandiApiService.getCommodityName(crop);
        const trendsData = await mandiApiService.getPriceTrendsWithAI(commodityName);
        
        forecasts[crop] = {
          historical: trendsData.historical,
          forecast: trendsData.forecast,
          insights: trendsData.insights
        };
      }

      return forecasts;
    } catch (error) {
      console.error('❌ Mandi API integration failed:', error);
      return null;
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

  /**
   * Calculate Simple Moving Average
   */
  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) {
      return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    }
    
    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((sum, price) => sum + price, 0) / period;
  }

  /**
   * Calculate all SMAs for a dataset
   */
  private calculateAllSMAs(prices: number[], period: number): number[] {
    const smas: number[] = [];
    
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        // Use available data if we don't have enough for full period
        const available = prices.slice(0, i + 1);
        smas.push(available.reduce((sum, price) => sum + price, 0) / available.length);
      } else {
        // Calculate SMA for the period
        const periodPrices = prices.slice(i - period + 1, i + 1);
        smas.push(periodPrices.reduce((sum, price) => sum + price, 0) / period);
      }
    }
    
    return smas;
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

    // Calculate volatility
    const volatility = this.calculateVolatility(historicalPrices);

    // Calculate SMAs using historical prices only
    const sma7 = this.calculateSMA(historicalPrices, 7);
    const sma14 = this.calculateSMA(historicalPrices, 14);
    const sma30 = this.calculateSMA(historicalPrices, 30);

    // Calculate all SMAs for charting (optional)
    const sma7Series = this.calculateAllSMAs(historicalPrices, 7);
    const sma14Series = this.calculateAllSMAs(historicalPrices, 14);

    // Market signal based on SMA crossover
    const marketSignal = sma7 > sma14 ? 'BUY' : sma7 < sma14 ? 'SELL' : 'HOLD';

    // Relative Strength Index (RSI) - optional enhancement
    const rsi = this.calculateRSI(historicalPrices);

    return {
      averagePrice: Math.round(avgPrice * 100) / 100,
      highestPrice: Math.round(maxPrice * 100) / 100,
      lowestPrice: Math.round(minPrice * 100) / 100,
      bestSellingDay: {
        date: bestDay.date,
        price: Math.round(bestDay.pred * 100) / 100
      },
      percentChange: Math.round(percentChange * 100) / 100,
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      volatility: Math.round(volatility * 100) / 100,
      sma7: Math.round(sma7 * 100) / 100,
      sma14: Math.round(sma14 * 100) / 100,
      sma30: Math.round(sma30 * 100) / 100,
      sma7Series,
      sma14Series,
      marketSignal,
      rsi: Math.round(rsi * 100) / 100
    };
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      return 50; // Neutral RSI
    }

    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate average gain and loss
    const recentGains = gains.slice(-period);
    const recentLosses = losses.slice(-period);

    const avgGain = recentGains.reduce((sum, val) => sum + val, 0) / period;
    const avgLoss = recentLosses.reduce((sum, val) => sum + val, 0) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  /**
   * Calculate price volatility
   */
  private calculateVolatility(prices: number[]): number {
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance);
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
    mandiApiService.clearCache();
  }

  // Get cached data without fetching
  getCachedData(): MarketForecasts | null {
    return this.cache;
  }
}

export const forecastService = new ForecastService();