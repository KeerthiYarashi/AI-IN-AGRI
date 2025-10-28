import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CarbonCreditEstimator } from '@/components/CarbonCreditEstimator';
import { MinimalFooter } from '@/components/MinimalFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Leaf, Factory, Tractor, Lightbulb, TrendingDown, Calculator } from 'lucide-react';
import { carbonService } from '@/services/carbonService';
import { CarbonFootprint } from '@/types';
import { CROPS } from '@/utils/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { activityService } from '@/services/activityService';

const CarbonEstimator = () => {
  const { t } = useLanguage();
  const { farmer } = useAuth();
  const [inputs, setInputs] = useState({
    fertilizerUrea: 0,
    fertilizerDAP: 0,
    tractorHours: 0,
    pumpHours: 0,
    farmArea: 0,
    fuelUsed: 0,
    electricityUsed: 0,
  });
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [result, setResult] = useState<CarbonFootprint | null>(null);
  const [perHectareResult, setPerHectareResult] = useState<CarbonFootprint | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      // Calculate total footprint
      const carbonResult = carbonService.calculateCarbonFootprint(inputs);
      setResult(carbonResult);

      // Track carbon calculation activity
      if (farmer && carbonResult) {
        activityService.addCarbonHistory(farmer.id, {
          total: carbonResult.total,
          level: carbonResult.level,
        });
      }

      // Calculate per hectare if farm area is provided
      if (inputs.farmArea > 0) {
        const perHectareResult = carbonService.calculatePerHectareEmissions(inputs);
        setPerHectareResult(perHectareResult);
      }
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const chartData = result ? [
    { name: 'Fertilizer', value: result.fertilizer, color: '#22c55e' },
    { name: 'Machinery', value: result.machinery, color: '#f59e0b' },
    { name: 'Other', value: result.other, color: '#ef4444' },
  ] : [];

  const CHART_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isOnline={true} />
      
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {/* Bilingual Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                🌍 {t('carbonEstimator')}
              </h1>
              <p className="text-muted-foreground text-base">
                Calculate your farm's carbon footprint and get AI-powered recommendations
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              {/* Input Form */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    {t('farmInputs') || 'Farm Inputs'}
                  </CardTitle>
                  <CardDescription>
                    Enter your farming activity data for the season
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="crop">Crop Type</Label>
                      <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop" />
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
                      <Label htmlFor="farmArea">Farm Area (hectares)</Label>
                      <Input
                        id="farmArea"
                        type="number"
                        min="0"
                        step="0.1"
                        value={inputs.farmArea || ''}
                        onChange={(e) => handleInputChange('farmArea', Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      Fertilizers (kg)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="urea">Urea</Label>
                        <Input
                          id="urea"
                          type="number"
                          min="0"
                          value={inputs.fertilizerUrea || ''}
                          onChange={(e) => handleInputChange('fertilizerUrea', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dap">DAP</Label>
                        <Input
                          id="dap"
                          type="number"
                          min="0"
                          value={inputs.fertilizerDAP || ''}
                          onChange={(e) => handleInputChange('fertilizerDAP', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Tractor className="h-4 w-4 text-amber-500" />
                      Machinery (hours)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tractor">Tractor Hours</Label>
                        <Input
                          id="tractor"
                          type="number"
                          min="0"
                          value={inputs.tractorHours || ''}
                          onChange={(e) => handleInputChange('tractorHours', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pump">Pump Hours</Label>
                        <Input
                          id="pump"
                          type="number"
                          min="0"
                          value={inputs.pumpHours || ''}
                          onChange={(e) => handleInputChange('pumpHours', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Factory className="h-4 w-4 text-blue-500" />
                      Energy (optional)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fuel">Fuel Used (liters)</Label>
                        <Input
                          id="fuel"
                          type="number"
                          min="0"
                          value={inputs.fuelUsed || ''}
                          onChange={(e) => handleInputChange('fuelUsed', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="electricity">Electricity (kWh)</Label>
                        <Input
                          id="electricity"
                          type="number"
                          min="0"
                          value={inputs.electricityUsed || ''}
                          onChange={(e) => handleInputChange('electricityUsed', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full"
                  >
                    {isCalculating ? (
                      <>
                        <LoadingSpinner />
                        {t('loading')}
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        {t('calculate')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-primary" />
                    {t('carbonFootprint')} Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!result ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Leaf className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Enter your farm data and calculate to see results
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Total Emissions */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground mb-2">
                          {result.total} kg CO₂e
                        </div>
                        <Badge className={getLevelColor(result.level)}>
                          {result.level.toUpperCase()} EMISSION LEVEL
                        </Badge>
                        {perHectareResult && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Per hectare: {perHectareResult.total} kg CO₂e/ha
                          </p>
                        )}
                      </div>

                      {/* Breakdown Chart */}
                      {chartData.length > 0 && (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => [`${value} kg CO₂e`, 'Emissions']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Breakdown Values */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {result.fertilizer}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fertilizer
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-amber-600">
                            {result.machinery}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Machinery
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-red-600">
                            {result.other}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Other
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Reduction Tips */}
            {result && result.tips.length > 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    {t('ecoTips')}
                  </CardTitle>
                  <CardDescription>
                    Actionable steps to reduce your carbon footprint
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.tips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-muted/30 rounded-lg p-4 border border-border/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Leaf className="h-3 w-3 text-primary" />
                          </div>
                          <p className="text-sm">{tip}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Carbon Credit Estimator */}
            {result && (
              <CarbonCreditEstimator 
                currentEmission={
                  perHectareResult 
                    ? perHectareResult.total / 1000
                    : inputs.farmArea > 0 
                      ? result.total / 1000 / inputs.farmArea 
                      : result.total / 1000
                } 
              />
            )}
          </motion.div>
        </div>
      </main>
      
      <MinimalFooter />
    </div>
  );
};

export default CarbonEstimator;