import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { CropSelector } from '@/components/CropSelector';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { forecastService } from '@/services/forecastService';
import { useTranslation } from '@/utils/translations';

const MarketForecaster = () => {
  const { t } = useTranslation();
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
        setStats(forecastService.calculateStats(data));
      }
    } catch (error) {
      console.error('Failed to load forecast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = forecastData ? forecastService.getCombinedChartData(forecastData) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header isOnline={navigator.onLine} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gradient-primary">📈 Market Price Forecaster</h1>
            </div>

            <CropSelector value={selectedCrop} onValueChange={setSelectedCrop} />

            {isLoading ? (
              <LoadingSpinner size="lg" text="Loading market data..." />
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="feature-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Best Selling Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success">₹{stats?.bestSellingDay.price}</div>
                      <p className="text-xs text-muted-foreground">{stats?.bestSellingDay.date}</p>
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Average Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{stats?.averagePrice}</div>
                      <p className="text-xs text-muted-foreground">This week</p>
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
                    </CardContent>
                  </Card>

                  <Card className="feature-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Highest Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-market">₹{stats?.highestPrice}</div>
                      <p className="text-xs text-muted-foreground">Peak forecast</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart */}
                <Card className="feature-card">
                  <CardHeader>
                    <CardTitle>Price History & Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="historical" stroke="#22c55e" strokeWidth={2} name="Historical" />
                        <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MarketForecaster;