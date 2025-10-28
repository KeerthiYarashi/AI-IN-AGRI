import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Droplets, Cloud, Calendar, Thermometer, Eye, AlertTriangle } from 'lucide-react';
import { irrigationService } from '@/services/irrigationService';
import { weatherService } from '@/services/weatherService';
import { IrrigationDecision, WeatherData } from '@/types';
import { CROPS } from '@/utils/constants';
import { TRANSLATIONS } from '@/utils/translations';

const IrrigationPredictor = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [soilMoisture, setSoilMoisture] = useState([45]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [decision, setDecision] = useState<IrrigationDecision | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<any[]>([]);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      const weather = await weatherService.getCurrentWeather();
      setWeatherData(weather);
    } catch (error) {
      console.error('Failed to load weather data:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedCrop) return;

    setIsAnalyzing(true);
    try {
      // Get irrigation recommendation
      const result = await irrigationService.getIrrigationRecommendation(
        selectedCrop,
        soilMoisture[0]
      );
      setDecision(result);

      // Get weekly schedule
      const schedule = await irrigationService.getWeeklySchedule(
        selectedCrop,
        soilMoisture[0]
      );
      setWeeklySchedule(schedule);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMoistureColor = (moisture: number) => {
    if (moisture >= 60) return 'text-blue-600';
    if (moisture >= 40) return 'text-green-600';
    if (moisture >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMoistureStatus = (moisture: number) => {
    if (moisture >= 60) return 'Optimal';
    if (moisture >= 40) return 'Good';
    if (moisture >= 20) return 'Low';
    return 'Critical';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isOnline={true} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {TRANSLATIONS.en.irrigationPredictor}
              </h1>
              <p className="text-muted-foreground text-sm">
                {TRANSLATIONS.kn.irrigationPredictor}
              </p>
              <p className="text-muted-foreground mt-2">
                Get smart irrigation recommendations based on soil moisture, weather forecast, and crop requirements
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Input Form */}
              <Card className="lg:col-span-1 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-primary" />
                    Irrigation Analysis
                  </CardTitle>
                  <CardDescription>
                    Configure your crop and soil conditions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Crop
                    </label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROPS.map((crop) => (
                          <SelectItem key={crop.id} value={crop.id}>
                            {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">
                        Soil Moisture Level
                      </label>
                      <Badge variant="outline" className={getMoistureColor(soilMoisture[0])}>
                        {soilMoisture[0]}% - {getMoistureStatus(soilMoisture[0])}
                      </Badge>
                    </div>
                    <Slider
                      value={soilMoisture}
                      onValueChange={setSoilMoisture}
                      max={100}
                      min={0}
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Dry (0%)</span>
                      <span>Saturated (100%)</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedCrop || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <LoadingSpinner />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Analyze Irrigation Need
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Weather Info */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-primary" />
                    Weather Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weatherData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">Temperature</span>
                        </div>
                        <span className="font-medium">
                          {weatherData.current.temperature}°C
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">3-Day Forecast</h4>
                        {weatherData.forecast.slice(0, 3).map((day, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{day.date}</span>
                            <div className="flex items-center gap-2">
                              <Droplets className="h-3 w-3 text-blue-500" />
                              <span>{day.rainfall}mm</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <LoadingSpinner />
                      <p className="text-sm text-muted-foreground mt-2">
                        Loading weather data...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Decision Result */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {decision?.shouldIrrigate ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Droplets className="h-5 w-5 text-green-500" />
                    )}
                    Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!decision ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Droplets className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Select crop and analyze to get recommendation
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className={`text-center p-4 rounded-lg ${
                        decision.shouldIrrigate 
                          ? 'bg-amber-50 border border-amber-200' 
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className={`text-lg font-bold ${
                          decision.shouldIrrigate ? 'text-amber-700' : 'text-green-700'
                        }`}>
                          {decision.shouldIrrigate ? 'IRRIGATION NEEDED' : 'NO IRRIGATION NEEDED'}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-1">Reason:</h4>
                          <p className="text-sm text-muted-foreground">
                            {decision.reason}
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span>Threshold:</span>
                          <span className="font-medium">
                            {decision.soilMoistureThreshold}%
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span>Next irrigation:</span>
                          <span className="font-medium">
                            {decision.nextIrrigationDate}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Weekly Schedule */}
            {weeklySchedule.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    7-Day Irrigation Schedule
                  </CardTitle>
                  <CardDescription>
                    Predicted irrigation needs for the next week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {weeklySchedule.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          day.shouldIrrigate
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-medium text-sm mb-2">
                            {day.date}
                          </div>
                          <div className={`text-xs mb-2 ${
                            day.shouldIrrigate ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {day.shouldIrrigate ? 'Irrigate' : 'No irrigation'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Moisture: {day.expectedMoisture}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default IrrigationPredictor;