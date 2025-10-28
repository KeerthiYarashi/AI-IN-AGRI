import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { MinimalFooter } from '@/components/MinimalFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calculator, Trash2, Lightbulb, TrendingUp, TrendingDown, AlertCircle, Award, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { activityService } from '@/services/activityService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LineChart, Line, Area, AreaChart, ReferenceLine } from 'recharts';

// Yield data for different crops (in tons per hectare)
const YIELD_DATA = {
  tomato: {
    averageYieldPerHectare: 49.4,
    averageYieldPerAcre: 20,
    name: 'Tomato',
    icon: '🍅',
    tip: 'Use drip irrigation and mulching for better yields',
  },
  wheat: {
    averageYieldPerHectare: 7.4,
    averageYieldPerAcre: 3,
    name: 'Wheat',
    icon: '🌾',
    tip: 'Ensure proper spacing and timely irrigation',
  },
  rice: {
    averageYieldPerHectare: 9.9,
    averageYieldPerAcre: 4,
    name: 'Rice',
    icon: '🌾',
    tip: 'Maintain water level at 2-3 inches during growth',
  },
  potato: {
    averageYieldPerHectare: 61.8,
    averageYieldPerAcre: 25,
    name: 'Potato',
    icon: '🥔',
    tip: 'Hill soil around plants and control pests early',
  },
  onion: {
    averageYieldPerHectare: 37.1,
    averageYieldPerAcre: 15,
    name: 'Onion',
    icon: '🧅',
    tip: 'Ensure good drainage and balanced fertilization',
  },
};

interface YieldEstimate {
  date: string;
  crop: string;
  area: number;
  unit: 'acre' | 'hectare';
  estimatedYield: number;
}

interface YieldAnalytics {
  totalEstimates: number;
  averageYield: number;
  bestYield: { crop: string; yield: number; date: string };
  worstYield: { crop: string; yield: number; date: string };
  mostEstimatedCrop: string;
  yieldTrend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  cropPerformance: { crop: string; avgYield: number; count: number }[];
}

const YieldEstimator = () => {
  const { farmer } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [farmArea, setFarmArea] = useState<number>(0);
  const [unit, setUnit] = useState<'acre' | 'hectare'>('hectare');
  const [estimatedYield, setEstimatedYield] = useState<number | null>(null);
  const [estimateHistory, setEstimateHistory] = useState<YieldEstimate[]>([]);
  const [analytics, setAnalytics] = useState<YieldAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    // Load history from localStorage
    const stored = localStorage.getItem('yieldEstimateHistory');
    if (stored) {
      const history = JSON.parse(stored);
      setEstimateHistory(history);
      calculateAnalytics(history);
    }
  }, []);

  const calculateAnalytics = (history: YieldEstimate[]) => {
    if (history.length === 0) {
      setAnalytics(null);
      return;
    }

    const totalEstimates = history.length;
    const averageYield = history.reduce((sum, item) => sum + item.estimatedYield, 0) / totalEstimates;

    // Find best and worst yields
    const sortedByYield = [...history].sort((a, b) => b.estimatedYield - a.estimatedYield);
    const bestYield = {
      crop: sortedByYield[0].crop,
      yield: sortedByYield[0].estimatedYield,
      date: new Date(sortedByYield[0].date).toLocaleDateString(),
    };
    const worstYield = {
      crop: sortedByYield[sortedByYield.length - 1].crop,
      yield: sortedByYield[sortedByYield.length - 1].estimatedYield,
      date: new Date(sortedByYield[sortedByYield.length - 1].date).toLocaleDateString(),
    };

    // Find most estimated crop
    const cropCounts = history.reduce((acc, item) => {
      acc[item.crop] = (acc[item.crop] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostEstimatedCrop = Object.entries(cropCounts).reduce((a, b) => 
      cropCounts[a[0]] > cropCounts[b[0]] ? a : b
    )[0];

    // Calculate trend (comparing first half vs second half)
    const midpoint = Math.floor(history.length / 2);
    const firstHalfAvg = history.slice(midpoint).reduce((sum, item) => sum + item.estimatedYield, 0) / (history.length - midpoint);
    const secondHalfAvg = history.slice(0, midpoint).reduce((sum, item) => sum + item.estimatedYield, 0) / midpoint;
    const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    const yieldTrend = Math.abs(trendPercentage) < 5 ? 'stable' : trendPercentage > 0 ? 'increasing' : 'decreasing';

    // Crop performance analysis
    const cropPerformance = Object.entries(
      history.reduce((acc, item) => {
        if (!acc[item.crop]) {
          acc[item.crop] = { total: 0, count: 0 };
        }
        acc[item.crop].total += item.estimatedYield;
        acc[item.crop].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>)
    ).map(([crop, data]) => ({
      crop,
      avgYield: data.total / data.count,
      count: data.count,
    })).sort((a, b) => b.avgYield - a.avgYield);

    setAnalytics({
      totalEstimates,
      averageYield,
      bestYield,
      worstYield,
      mostEstimatedCrop,
      yieldTrend,
      trendPercentage,
      cropPerformance,
    });

    setShowAnalytics(true);
  };

  const handleCalculate = () => {
    if (!selectedCrop || !farmArea) {
      toast({
        title: 'Missing information',
        description: 'Please select a crop and enter farm area',
        variant: 'destructive',
      });
      return;
    }

    const yieldData = YIELD_DATA[selectedCrop];
    const averageYieldPerUnit = unit === 'acre' 
      ? yieldData.averageYieldPerAcre 
      : yieldData.averageYieldPerHectare;
    
    const calculated = farmArea * averageYieldPerUnit;
    setEstimatedYield(calculated);

    // Track activity
    if (farmer) {
      activityService.addYieldEstimate(farmer.id, {
        crop: selectedCrop,
        area: unit === 'acre' ? farmArea * 0.404686 : farmArea, // Convert to hectares
        estimatedYield: calculated,
      });
    }

    // Save to history
    const newEstimate: YieldEstimate = {
      date: new Date().toISOString(),
      crop: selectedCrop,
      area: farmArea,
      unit,
      estimatedYield: calculated,
    };

    const updatedHistory = [newEstimate, ...estimateHistory].slice(0, 20); // Increased to 20
    setEstimateHistory(updatedHistory);
    localStorage.setItem('yieldEstimateHistory', JSON.stringify(updatedHistory));
    
    // Recalculate analytics
    calculateAnalytics(updatedHistory);

    toast({
      title: 'Yield estimated! 🌾',
      description: `Expected yield: ${calculated.toFixed(2)} tons`,
    });
  };

  const handleClearHistory = () => {
    setEstimateHistory([]);
    setAnalytics(null);
    setShowAnalytics(false);
    localStorage.removeItem('yieldEstimateHistory');
    toast({
      title: 'History cleared',
      description: 'All yield estimates have been deleted',
    });
  };

  // Enhanced chart data with trend line
  const trendChartData = estimateHistory.slice(0, 10).reverse().map((item, index) => ({
    index: index + 1,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    yield: item.estimatedYield,
    crop: `${YIELD_DATA[item.crop]?.icon || ''} ${item.crop}`,
    average: analytics?.averageYield || 0,
  }));

  const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isOnline={true} />
      
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Page Header */}
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                Yield Estimator with AI Analytics
              </h1>
              <p className="text-muted-foreground">
                Calculate expected crop yield and track performance over time with smart insights
              </p>
            </div>

            {/* Analytics Dashboard */}
            {analytics && showAnalytics && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Your Yield Performance Analytics
                      </CardTitle>
                      <Badge variant="outline" className="gap-2">
                        {analytics.totalEstimates} Estimates
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 rounded-xl border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-green-600" />
                          <p className="text-xs font-medium text-muted-foreground">Average Yield</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {analytics.averageYield.toFixed(2)} tons
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Across all crops</p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <p className="text-xs font-medium text-muted-foreground">Best Yield</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {analytics.bestYield.yield.toFixed(2)} tons
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {YIELD_DATA[analytics.bestYield.crop]?.icon} {analytics.bestYield.crop}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4 rounded-xl border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Leaf className="h-4 w-4 text-purple-600" />
                          <p className="text-xs font-medium text-muted-foreground">Most Estimated</p>
                        </div>
                        <p className="text-xl font-bold text-purple-600 capitalize">
                          {YIELD_DATA[analytics.mostEstimatedCrop]?.icon} {analytics.mostEstimatedCrop}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {analytics.cropPerformance.find(c => c.crop === analytics.mostEstimatedCrop)?.count || 0} times
                        </p>
                      </div>

                      <div className={`bg-gradient-to-br p-4 rounded-xl border ${
                        analytics.yieldTrend === 'increasing' 
                          ? 'from-green-500/10 to-green-500/5 border-green-500/20'
                          : analytics.yieldTrend === 'decreasing'
                          ? 'from-red-500/10 to-red-500/5 border-red-500/20'
                          : 'from-gray-500/10 to-gray-500/5 border-gray-500/20'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {analytics.yieldTrend === 'increasing' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : analytics.yieldTrend === 'decreasing' ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-gray-600" />
                          )}
                          <p className="text-xs font-medium text-muted-foreground">Yield Trend</p>
                        </div>
                        <p className={`text-xl font-bold capitalize ${
                          analytics.yieldTrend === 'increasing' ? 'text-green-600' :
                          analytics.yieldTrend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {analytics.yieldTrend}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {analytics.trendPercentage > 0 ? '+' : ''}{analytics.trendPercentage.toFixed(1)}% change
                        </p>
                      </div>
                    </div>

                    {/* Crop Performance Comparison */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Crop Performance Comparison</h4>
                      {analytics.cropPerformance.map((crop, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">
                                {YIELD_DATA[crop.crop]?.icon} {crop.crop}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {crop.avgYield.toFixed(2)} tons avg ({crop.count}x)
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                style={{ 
                                  width: `${(crop.avgYield / analytics.cropPerformance[0].avgYield) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Calculate Yield
                  </CardTitle>
                  <CardDescription>
                    Enter your farm details to estimate crop yield
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crop">Select Crop</Label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(YIELD_DATA).map(([key, data]) => (
                          <SelectItem key={key} value={key}>
                            {data.icon} {data.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Farm Area</Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.1"
                        min="0"
                        value={farmArea || ''}
                        onChange={(e) => setFarmArea(Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={unit} onValueChange={(val: 'acre' | 'hectare') => setUnit(val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hectare">Hectare (ha)</SelectItem>
                          <SelectItem value="acre">Acre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedCrop && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Average Yield:</strong>{' '}
                        {unit === 'acre'
                          ? YIELD_DATA[selectedCrop].averageYieldPerAcre
                          : YIELD_DATA[selectedCrop].averageYieldPerHectare}{' '}
                        tons/{unit}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleCalculate}
                    disabled={!selectedCrop || !farmArea}
                    className="w-full"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Yield
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Estimated Yield
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {estimatedYield === null ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Enter details and calculate to see results
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="text-5xl mb-2">
                          {YIELD_DATA[selectedCrop]?.icon || '🌾'}
                        </div>
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                          {estimatedYield.toFixed(2)} tons
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Expected yield for {farmArea} {unit}
                        </div>
                      </div>

                      {selectedCrop && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-900 dark:text-amber-100">
                              <strong>Pro Tip:</strong> {YIELD_DATA[selectedCrop].tip}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Trend Analysis Chart */}
            {trendChartData.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Yield Trend Analysis</CardTitle>
                  <CardDescription>
                    Track your yield estimates over time with average benchmark
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendChartData}>
                        <defs>
                          <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          label={{ 
                            value: 'Yield (tons)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fontSize: 11 }
                          }}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-medium text-sm mb-1">{payload[0].payload.date}</p>
                                  <p className="text-xs text-muted-foreground mb-2">{payload[0].payload.crop}</p>
                                  <p className="text-sm font-bold text-green-600">
                                    Yield: {payload[0].value} tons
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Avg: {analytics?.averageYield.toFixed(2)} tons
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <ReferenceLine 
                          y={analytics?.averageYield} 
                          stroke="#f59e0b" 
                          strokeDasharray="5 5"
                          label={{ 
                            value: 'Average', 
                            fontSize: 10,
                            fill: '#f59e0b'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="yield"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorYield)"
                        />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comparison Bar Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Estimates Comparison</CardTitle>
                  <CardDescription>Visual comparison of your last 5 yield estimates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={11} />
                        <YAxis label={{ value: 'Yield (tons)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                        <Tooltip formatter={(value: number) => [`${value.toFixed(2)} tons`, 'Estimated Yield']} />
                        <Bar dataKey="yield" fill="#10b981" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            {analytics && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    AI-Powered Insights & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                      <p className="text-sm font-medium mb-2">📊 Performance Analysis</p>
                      <p className="text-xs text-muted-foreground">
                        {analytics.yieldTrend === 'increasing' 
                          ? `Great job! Your yields are trending upward by ${analytics.trendPercentage.toFixed(1)}%. Keep using the techniques that are working.`
                          : analytics.yieldTrend === 'decreasing'
                          ? `Your yields have decreased by ${Math.abs(analytics.trendPercentage).toFixed(1)}%. Consider reviewing soil health, irrigation, and pest control methods.`
                          : 'Your yields are stable. Look for opportunities to optimize and increase productivity.'
                        }
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                      <p className="text-sm font-medium mb-2">🌾 Crop Recommendation</p>
                      <p className="text-xs text-muted-foreground">
                        {analytics.cropPerformance[0].crop.charAt(0).toUpperCase() + analytics.cropPerformance[0].crop.slice(1)} shows the best average yield ({analytics.cropPerformance[0].avgYield.toFixed(2)} tons). 
                        Consider allocating more area to this crop for maximum returns.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                      <p className="text-sm font-medium mb-2">💡 Optimization Tip</p>
                      <p className="text-xs text-muted-foreground">
                        Based on your history, {YIELD_DATA[selectedCrop || analytics.mostEstimatedCrop]?.tip || 'Focus on proper irrigation and pest control for better yields.'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                      <p className="text-sm font-medium mb-2">📈 Growth Potential</p>
                      <p className="text-xs text-muted-foreground">
                        Your current average is {analytics.averageYield.toFixed(2)} tons. 
                        With optimized practices, you could potentially achieve {(analytics.averageYield * 1.2).toFixed(2)} tons (20% increase).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History Table */}
            {estimateHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Estimate History</CardTitle>
                      <CardDescription>Your recent yield calculations</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleClearHistory}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Crop</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Est. Yield</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimateHistory.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {new Date(item.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{YIELD_DATA[item.crop]?.icon || '🌾'}</span>
                              <span className="capitalize">{item.crop}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.area} {item.unit}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.estimatedYield.toFixed(2)} tons
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
      
      <MinimalFooter />
    </div>
  );
};

export default YieldEstimator;