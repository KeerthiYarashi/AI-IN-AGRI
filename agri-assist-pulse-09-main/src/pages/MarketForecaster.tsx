import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/Header';
import { CropSelector } from '@/components/CropSelector';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, TrendingDown, Calendar, DollarSign, Activity, Target, Brain } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { forecastService } from '@/services/forecastService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { activityService } from '@/services/activityService';

const MarketForecaster = () => {
  const { t } = useLanguage();
  const { farmer } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadForecast();
  }, [selectedCrop]);

  const loadForecast = async () => {
    setIsLoading(true);
    try {
      const data = await forecastService.getForecastForCrop(selectedCrop);
      if (data) {
        setForecastData(data);
        const calculatedStats = forecastService.calculateStats(data);
        setStats(calculatedStats);
        
        // Track activity when forecast is loaded
        if (farmer && calculatedStats) {
          activityService.addMarketForecast(farmer.id, {
            crop: selectedCrop,
            price: calculatedStats.averagePrice,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load forecast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = forecastData ? forecastService.getCombinedChartData(forecastData) : [];

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header isOnline={navigator.onLine} />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-7xl mx-auto"
          >
            {/* Bilingual Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    📈 {t('marketForecaster')}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Real-time Mandi API integration with AI-powered forecasting
                  </p>
                </div>
                <Badge variant="outline" className="gap-2">
                  <Brain className="h-3 w-3" />
                  AI-Powered
                </Badge>
              </div>
            </div>

            <CropSelector value={selectedCrop} onValueChange={setSelectedCrop} />

            {isLoading ? (
              <LoadingSpinner size="lg" text={t('loading')} />
            ) : (
              <>
                {/* AI Insights Banner */}
                {forecastData?.insights && (
                  <Alert className={`border-l-4 ${
                    forecastData.insights.trend === 'bullish' ? 'border-l-green-500 bg-green-50 dark:bg-green-950' :
                    forecastData.insights.trend === 'bearish' ? 'border-l-red-500 bg-red-50 dark:bg-red-950' :
                    'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
                  }`}>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={forecastData.insights.trend === 'bullish' ? 'default' : 'destructive'}>
                            {forecastData.insights.trend === 'bullish' ? '📈' : forecastData.insights.trend === 'bearish' ? '📉' : '➡️'} 
                            {forecastData.insights.trend.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {t('volatility')}: {forecastData.insights.volatility.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {t('confidence')}: {(forecastData.insights.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{forecastData.insights.recommendation}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="feature-card border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{t('bestSellingDay')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">₹{stats?.bestSellingDay.price}</div>
                      <p className="text-xs text-muted-foreground">{stats?.bestSellingDay.date}</p>
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{t('averagePrice')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{stats?.averagePrice}</div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Volatility: ₹{stats?.volatility}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Price Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold flex items-center ${stats?.percentChange > 0 ? 'text-success' : 'text-destructive'}`}>
                        {stats?.percentChange > 0 ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                        {stats?.percentChange}%
                      </div>
                      <p className="text-xs text-muted-foreground">vs last week</p>
                    </CardContent>
                  </Card>

                  <Card className="feature-card border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{t('highestPrice')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">₹{stats?.highestPrice}</div>
                      <p className="text-xs text-muted-foreground">Forecast maximum</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Chart */}
                <Card className="feature-card">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <CardTitle>{t('priceHistory')}</CardTitle>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span>Historical</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span>AI Forecast</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tick={{ fontSize: 11 }} label={{ value: 'Price (₹/kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }}
                          formatter={(value: number, name: string) => [
                            `₹${value.toFixed(2)}/kg`,
                            name === 'historical' ? 'Historical Price' : 'Predicted Price'
                          ]}
                          labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="historical" 
                          stroke="#22c55e" 
                          strokeWidth={2} 
                          name="Historical"
                          dot={{ fill: '#22c55e', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="forecast" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          strokeDasharray="5 5" 
                          name="Forecast"
                          dot={{ fill: '#3b82f6', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Technical Indicators */}
                {stats && (
                  <Card className="feature-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        {t('technicalIndicators')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <div className="text-sm text-muted-foreground mb-1">7-Day SMA</div>
                          <div className="text-xl font-bold">₹{stats.sma7}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.sma7 > stats.averagePrice ? '📈 Above Avg' : '📉 Below Avg'}
                          </div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <div className="text-sm text-muted-foreground mb-1">14-Day SMA</div>
                          <div className="text-xl font-bold">₹{stats.sma14}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.sma14 > stats.averagePrice ? '📈 Above Avg' : '📉 Below Avg'}
                          </div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <div className="text-sm text-muted-foreground mb-1">RSI (14)</div>
                          <div className={`text-xl font-bold ${
                            stats.rsi > 70 ? 'text-red-600' : 
                            stats.rsi < 30 ? 'text-green-600' : 
                            'text-foreground'
                          }`}>
                            {stats.rsi}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {stats.rsi > 70 ? '⚠️ Overbought' : 
                             stats.rsi < 30 ? '⚠️ Oversold' : 
                             '✅ Neutral'}
                          </div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <div className="text-sm text-muted-foreground mb-1">Market Signal</div>
                          <div className={`text-xl font-bold ${
                            stats.marketSignal === 'BUY' ? 'text-green-600' : 
                            stats.marketSignal === 'SELL' ? 'text-red-600' : 
                            'text-amber-600'
                          }`}>
                            {stats.marketSignal}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            SMA 7 vs SMA 14
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Technical Info */}
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-sm space-y-1">
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            📊 Technical Analysis Summary
                          </p>
                          <p className="text-blue-800 dark:text-blue-200">
                            <strong>SMA Crossover:</strong> {
                              stats.sma7 > stats.sma14 
                                ? 'Bullish trend - Short-term momentum is positive'
                                : stats.sma7 < stats.sma14
                                ? 'Bearish trend - Short-term momentum is negative'
                                : 'Neutral trend - Prices are consolidating'
                            }
                          </p>
                          <p className="text-blue-800 dark:text-blue-200">
                            <strong>Volatility:</strong> ₹{stats.volatility} - {
                              stats.volatility < stats.averagePrice * 0.05 ? 'Low (Stable market)' :
                              stats.volatility < stats.averagePrice * 0.15 ? 'Moderate (Normal fluctuation)' :
                              'High (Unpredictable market)'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MarketForecaster;