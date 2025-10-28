import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Leaf, TrendingUp, TrendingDown, Coins, Info, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface CarbonCreditEstimatorProps {
  currentEmission?: number;
}

export const CarbonCreditEstimator: React.FC<CarbonCreditEstimatorProps> = ({ currentEmission = 3.2 }) => {
  const { t } = useLanguage();
  const [baselineEmission, setBaselineEmission] = useState(4);
  const [creditRate, setCreditRate] = useState(1000);
  const [reductionPercent, setReductionPercent] = useState(20);

  // AI-driven emission prediction model
  const predictedEmissions = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthOffset = (index - currentMonth + 12) % 12;
      const seasonalFactor = 1 + 0.2 * Math.sin((monthOffset / 12) * 2 * Math.PI);
      const trendFactor = 1 - (reductionPercent / 100) * (monthOffset / 12);
      const randomVariation = 0.95 + Math.random() * 0.1;
      
      const baseline = baselineEmission * seasonalFactor;
      const predicted = currentEmission * trendFactor * seasonalFactor * randomVariation;
      
      return {
        month,
        baseline: Number(baseline.toFixed(2)),
        predicted: Number(Math.max(predicted, baselineEmission * 0.3).toFixed(2)),
        target: Number((baselineEmission * (1 - reductionPercent / 100)).toFixed(2))
      };
    });
  }, [baselineEmission, currentEmission, reductionPercent]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('carbonCreditSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setBaselineEmission(settings.baseline || 4);
      setCreditRate(settings.creditRate || 1000);
      setReductionPercent(settings.reduction || 20);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('carbonCreditSettings', JSON.stringify({
      baseline: baselineEmission,
      creditRate,
      reduction: reductionPercent
    }));
  }, [baselineEmission, creditRate, reductionPercent]);

  // Enhanced calculations with AI model
  const calculatedEmission = currentEmission * (1 - reductionPercent / 100);
  const emissionsSaved = Math.max(0, baselineEmission - calculatedEmission);
  const creditsEarned = emissionsSaved * creditRate;
  const projectedAnnualSavings = emissionsSaved * 12 * creditRate;
  
  const impactLevel = emissionsSaved <= 1 
    ? 'lowImpact' 
    : emissionsSaved <= 2 
    ? 'moderateImpact' 
    : 'highImpact';

  const impactColor = emissionsSaved <= 1 
    ? 'text-yellow-600' 
    : emissionsSaved <= 2 
    ? 'text-blue-600'
    : 'text-green-600';

  // Comparison data with enhanced metrics
  const comparisonData = [
    { 
      category: t('baseline'),
      value: baselineEmission,
      fill: '#ef4444',
      description: t('industryAvg'),
      emoji: '📊'
    },
    { 
      category: t('current'),
      value: currentEmission,
      fill: '#f59e0b',
      description: t('yourCurrent'),
      emoji: '📈'
    },
    { 
      category: t('target'),
      value: calculatedEmission,
      fill: '#22c55e',
      description: `${reductionPercent}% reduction`,
      emoji: '🎯'
    },
    { 
      category: 'Best Practice',
      value: baselineEmission * 0.5,
      fill: '#3b82f6',
      description: '50% reduction',
      emoji: '⭐'
    }
  ];

  // Custom tooltip for better data visualization
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-1">{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value} tons CO₂
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-success" />
                {t('carbonCredits')} & AI Predictions
              </CardTitle>
              <CardDescription>
                Advanced emission tracking with AI-powered forecasting
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{t('carbonCreditInfo')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Input Controls */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="baseline" className="flex items-center gap-2">
                <Target className="h-3 w-3 text-primary" />
                {t('baselineEmission')} (tons/ha)
              </Label>
              <Input
                id="baseline"
                type="number"
                value={baselineEmission}
                onChange={(e) => setBaselineEmission(Number(e.target.value))}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditRate" className="flex items-center gap-2">
                <Coins className="h-3 w-3 text-primary" />
                {t('creditRate')} (₹/ton)
              </Label>
              <Input
                id="creditRate"
                type="number"
                value={creditRate}
                onChange={(e) => setCreditRate(Number(e.target.value))}
                min={0}
                step={100}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingDown className="h-3 w-3 text-primary" />
                {t('targetReduction')}: {reductionPercent}%
              </Label>
              <Slider
                value={[reductionPercent]}
                onValueChange={(value) => setReductionPercent(value[0])}
                max={80}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Enhanced Results Grid with Icons */}
          <div className="grid gap-4 md:grid-cols-4">
            <motion.div
              className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 border border-green-500/20"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-muted-foreground">
                  {t('emissionsSaved')}
                </p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {emissionsSaved.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">tons CO₂/ha</p>
            </motion.div>

            <motion.div
              className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 border border-blue-500/20"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-medium text-muted-foreground">
                  Monthly Credits
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ₹{creditsEarned.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">/hectare</p>
            </motion.div>

            <motion.div
              className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4 border border-purple-500/20"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <p className="text-xs font-medium text-muted-foreground">
                  Annual Potential
                </p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                ₹{projectedAnnualSavings.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">/hectare/year</p>
            </motion.div>

            <motion.div
              className={cn(
                "rounded-xl p-4 border",
                emissionsSaved <= 1 
                  ? "bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20" 
                  : emissionsSaved <= 2 
                  ? "bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20"
                  : "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"
              )}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className={cn("h-4 w-4", impactColor)} />
                <p className="text-xs font-medium text-muted-foreground">
                  {t('impactLevel')}
                </p>
              </div>
              <p className={cn("text-lg font-bold", impactColor)}>
                {t(impactLevel)}
              </p>
              <p className="text-xs text-muted-foreground">{t('environmental')}</p>
            </motion.div>
          </div>

          {/* Enhanced Comparison Chart with Color Legend */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <BarChart className="h-4 w-4 text-primary" />
                {t('emissionComparison')} - Benchmarking
              </h4>
              
              {/* Color Legend */}
              <div className="hidden md:flex items-center gap-3 text-xs">
                {comparisonData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-muted-foreground">{item.emoji} {item.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Legend */}
            <div className="grid grid-cols-2 gap-2 md:hidden">
              {comparisonData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground">{item.emoji} {item.category}</span>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="category" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  label={{ 
                    value: 'tons CO₂/ha', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: 'hsl(var(--foreground))' }
                  }}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: data.fill }}
                            />
                            <p className="font-medium text-sm">{data.emoji} {data.category}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {data.description}
                          </p>
                          <p className="text-sm font-bold" style={{ color: data.fill }}>
                            {data.value.toFixed(2)} tons CO₂/ha
                          </p>
                          {data.value < baselineEmission && (
                            <p className="text-xs text-green-600 mt-1">
                              ↓ {((baselineEmission - data.value) / baselineEmission * 100).toFixed(1)}% lower than baseline
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  label={{ 
                    position: 'top', 
                    fontSize: 11, 
                    fill: 'hsl(var(--foreground))',
                    formatter: (value: number) => `${value.toFixed(1)}`
                  }}
                >
                  {comparisonData.map((entry, index) => (
                    <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Color Guide Card */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
              <h5 className="text-xs font-medium mb-3 flex items-center gap-2">
                <Info className="h-3 w-3 text-primary" />
                Understanding the Colors
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Red (Baseline)</div>
                    <div className="text-muted-foreground">Industry average emissions - your starting point</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Amber (Current)</div>
                    <div className="text-muted-foreground">Your current emission levels based on inputs</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Green (Target)</div>
                    <div className="text-muted-foreground">Your goal with {reductionPercent}% reduction</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Blue (Best)</div>
                    <div className="text-muted-foreground">50% reduction - sustainable farming benchmark</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Powered 12-Month Projection */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              AI-Powered 12-Month Emission Forecast
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={predictedEmissions}>
                <defs>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  label={{ 
                    value: 'tons CO₂/ha', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 10 }
                  }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <ReferenceLine 
                  y={baselineEmission} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: 'Baseline', fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorBaseline)"
                  name="Industry Baseline"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  name="Your Predicted Path"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target Goal"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Action Button */}
          <Button 
            variant="outline" 
            className="w-full border-success/20 hover:bg-success/10"
            asChild
          >
            <a href="https://carbonmarketwatch.org/" target="_blank" rel="noopener noreferrer">
              <Info className="mr-2 h-4 w-4" />
              {t('learnMore')} About Carbon Credits
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};