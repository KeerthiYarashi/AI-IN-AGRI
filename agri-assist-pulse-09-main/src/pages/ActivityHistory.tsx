import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { MinimalFooter } from '@/components/MinimalFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  TrendingUp, 
  Bug, 
  Droplets, 
  Leaf, 
  BarChart3,
  Calendar,
  Download,
  Trash2,
  AlertCircle,
  Activity,
  Clock,
  Award,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { activityService } from '@/services/activityService';
import { useLanguage } from '@/contexts/LanguageContext';
import { FarmerActivity } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart, ReferenceLine } from 'recharts';

const ActivityHistory = () => {
  const { farmer } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activity, setActivity] = useState<FarmerActivity | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [yieldAnalytics, setYieldAnalytics] = useState<any>(null);

  useEffect(() => {
    if (farmer) {
      loadActivity();
      loadYieldAnalytics();
    }
  }, [farmer]);

  const loadActivity = () => {
    if (!farmer) return;
    const data = activityService.getFarmerActivity(farmer.id);
    const statistics = activityService.getActivityStats(farmer.id);
    setActivity(data);
    setStats(statistics);
  };

  // NEW: Load yield analytics from localStorage
  const loadYieldAnalytics = () => {
    const stored = localStorage.getItem('yieldEstimateHistory');
    if (stored) {
      const history = JSON.parse(stored);
      if (history.length > 0) {
        calculateYieldAnalytics(history);
      }
    }
  };

  // NEW: Calculate yield analytics
  const calculateYieldAnalytics = (history: any[]) => {
    const totalEstimates = history.length;
    const averageYield = history.reduce((sum: number, item: any) => sum + item.estimatedYield, 0) / totalEstimates;

    const sortedByYield = [...history].sort((a, b) => b.estimatedYield - a.estimatedYield);
    const bestYield = {
      crop: sortedByYield[0].crop,
      yield: sortedByYield[0].estimatedYield,
      date: new Date(sortedByYield[0].date).toLocaleDateString(),
    };

    const midpoint = Math.floor(history.length / 2);
    const firstHalfAvg = history.slice(midpoint).reduce((sum: number, item: any) => sum + item.estimatedYield, 0) / (history.length - midpoint);
    const secondHalfAvg = history.slice(0, midpoint).reduce((sum: number, item: any) => sum + item.estimatedYield, 0) / midpoint;
    const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    const yieldTrend = Math.abs(trendPercentage) < 5 ? 'stable' : trendPercentage > 0 ? 'increasing' : 'decreasing';

    setYieldAnalytics({
      totalEstimates,
      averageYield,
      bestYield,
      yieldTrend,
      trendPercentage,
    });
  };

  const handleClearHistory = (type: 'market' | 'pest' | 'irrigation' | 'carbon' | 'yield') => {
    if (!farmer) return;
    
    activityService.clearActivityType(farmer.id, type);
    loadActivity();
    
    toast({
      title: 'History cleared',
      description: `${type} history has been deleted successfully`,
    });
  };

  const exportToCSV = (type: string) => {
    if (!activity) return;
    
    let csvContent = '';
    let filename = '';
    
    switch (type) {
      case 'market':
        csvContent = 'Date,Crop,Price\n' + 
          activity.marketForecasts.map(item => 
            `${new Date(item.date).toLocaleDateString()},${item.crop},${item.price}`
          ).join('\n');
        filename = 'market_forecasts.csv';
        break;
      case 'pest':
        csvContent = 'Date,Crop,Disease,Confidence\n' + 
          activity.pestDetections.map(item => 
            `${new Date(item.date).toLocaleDateString()},${item.crop},${item.disease},${item.confidence}%`
          ).join('\n');
        filename = 'pest_detections.csv';
        break;
      case 'irrigation':
        csvContent = 'Date,Crop,Decision,Soil Moisture\n' + 
          activity.irrigationHistory.map(item => 
            `${new Date(item.date).toLocaleDateString()},${item.crop},${item.decision ? 'Needed' : 'Not Needed'},${item.soilMoisture}%`
          ).join('\n');
        filename = 'irrigation_history.csv';
        break;
      case 'carbon':
        csvContent = 'Date,Total Emissions,Level\n' + 
          activity.carbonHistory.map(item => 
            `${new Date(item.date).toLocaleDateString()},${item.total} kg CO₂e,${item.level}`
          ).join('\n');
        filename = 'carbon_history.csv';
        break;
      case 'yield':
        csvContent = 'Date,Crop,Area,Estimated Yield\n' + 
          activity.yieldEstimates.map(item => 
            `${new Date(item.date).toLocaleDateString()},${item.crop},${item.area} ha,${item.estimatedYield} tons`
          ).join('\n');
        filename = 'yield_estimates.csv';
        break;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    toast({
      title: 'Export successful',
      description: `${filename} has been downloaded`,
    });
  };

  if (!farmer || !activity || !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header isOnline={true} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading activity history...</p>
          </div>
        </main>
        <MinimalFooter />
      </div>
    );
  }

  const featureChartData = [
    { name: 'Market Forecasts', value: stats.featureUsage.market, color: '#10b981' },
    { name: 'Pest Detection', value: stats.featureUsage.pest, color: '#ec4899' },
    { name: 'Irrigation', value: stats.featureUsage.irrigation, color: '#3b82f6' },
    { name: 'Carbon Tracking', value: stats.featureUsage.carbon, color: '#14b8a6' },
    { name: 'Yield Estimates', value: stats.featureUsage.yield, color: '#f59e0b' },
  ];

  const CHART_COLORS = ['#10b981', '#ec4899', '#3b82f6', '#14b8a6', '#f59e0b'];

  // Add yield trend chart data
  const yieldTrendData = activity.yieldEstimates.slice(0, 10).reverse().map((item, index) => ({
    index: index + 1,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    yield: item.estimatedYield,
    crop: item.crop,
  }));

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
                <History className="h-8 w-8 text-primary" />
                Activity History & Usage
              </h1>
              <p className="text-muted-foreground">
                Track your farming activities and feature usage across all tools
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Total Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.totalActivities}</div>
                  <p className="text-xs text-muted-foreground mt-1">All-time usage</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    Most Used Feature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize text-green-600">
                    {stats.mostUsedFeature}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.featureUsage[stats.mostUsedFeature]} times
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Last Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold text-blue-600">
                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'No activity'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleTimeString() : '—'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    Member Since
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold text-purple-600">
                    {new Date(farmer.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.floor((Date.now() - new Date(farmer.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Feature Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Distribution</CardTitle>
                <CardDescription>Visual breakdown of how you use different features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={featureChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {featureChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981">
                          {featureChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="market">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Market ({activity.marketForecasts.length})
                </TabsTrigger>
                <TabsTrigger value="pest">
                  <Bug className="h-4 w-4 mr-2" />
                  Pest ({activity.pestDetections.length})
                </TabsTrigger>
                <TabsTrigger value="irrigation">
                  <Droplets className="h-4 w-4 mr-2" />
                  Irrigation ({activity.irrigationHistory.length})
                </TabsTrigger>
                <TabsTrigger value="carbon">
                  <Leaf className="h-4 w-4 mr-2" />
                  Carbon ({activity.carbonHistory.length})
                </TabsTrigger>
                <TabsTrigger value="yield">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Yield ({activity.yieldEstimates.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: TrendingUp, label: 'Market Forecasts', count: activity.marketForecasts.length, color: 'text-green-600' },
                        { icon: Bug, label: 'Pest Detections', count: activity.pestDetections.length, color: 'text-pink-600' },
                        { icon: Droplets, label: 'Irrigation Checks', count: activity.irrigationHistory.length, color: 'text-blue-600' },
                        { icon: Leaf, label: 'Carbon Calculations', count: activity.carbonHistory.length, color: 'text-teal-600' },
                        { icon: BarChart3, label: 'Yield Estimates', count: activity.yieldEstimates.length, color: 'text-amber-600' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                          <item.icon className={`h-10 w-10 ${item.color}`} />
                          <div>
                            <div className="text-2xl font-bold">{item.count}</div>
                            <div className="text-sm text-muted-foreground">{item.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Market Forecasts Tab */}
              <TabsContent value="market">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Market Forecast History</CardTitle>
                        <CardDescription>Your crop price checking history</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => exportToCSV('market')}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Clear Market History?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete all your market forecast history. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleClearHistory('market')}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activity.marketForecasts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No market forecast history yet
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Crop</TableHead>
                            <TableHead>Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activity.marketForecasts.slice(0, 20).map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}</TableCell>
                              <TableCell className="capitalize">{item.crop}</TableCell>
                              <TableCell className="font-medium">₹{item.price}/kg</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pest Detection Tab */}
              <TabsContent value="pest">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Pest Detection History</CardTitle>
                        <CardDescription>Your plant disease scanning history</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => exportToCSV('pest')}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Clear Pest History?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete all your pest detection history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleClearHistory('pest')}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activity.pestDetections.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No pest detection history yet
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Crop</TableHead>
                            <TableHead>Disease</TableHead>
                            <TableHead>Confidence</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activity.pestDetections.slice(0, 20).map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                              <TableCell className="capitalize">{item.crop}</TableCell>
                              <TableCell>{item.disease}</TableCell>
                              <TableCell>
                                <Badge variant={item.confidence > 80 ? 'default' : item.confidence > 60 ? 'secondary' : 'destructive'}>
                                  {item.confidence}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Irrigation Tab */}
              <TabsContent value="irrigation">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Irrigation History</CardTitle>
                        <CardDescription>Your irrigation decision history</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => exportToCSV('irrigation')}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Clear Irrigation History?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete all your irrigation history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleClearHistory('irrigation')}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activity.irrigationHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No irrigation history yet
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Crop</TableHead>
                            <TableHead>Decision</TableHead>
                            <TableHead>Soil Moisture</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activity.irrigationHistory.slice(0, 20).map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                              <TableCell className="capitalize">{item.crop}</TableCell>
                              <TableCell>
                                <Badge variant={item.decision ? 'destructive' : 'default'}>
                                  {item.decision ? 'Needed' : 'Not Needed'}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.soilMoisture}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Carbon Tab */}
              <TabsContent value="carbon">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Carbon Footprint History</CardTitle>
                        <CardDescription>Your carbon emission calculations</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => exportToCSV('carbon')}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Clear Carbon History?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete all your carbon footprint history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleClearHistory('carbon')}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activity.carbonHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No carbon footprint history yet
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Total Emissions</TableHead>
                            <TableHead>Level</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activity.carbonHistory.slice(0, 20).map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                              <TableCell>{item.total} kg CO₂e</TableCell>
                              <TableCell>
                                <Badge variant={
                                  item.level === 'low' ? 'default' :
                                  item.level === 'medium' ? 'secondary' : 'destructive'
                                }>
                                  {item.level.toUpperCase()}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Yield Estimates Tab - ENHANCED */}
              <TabsContent value="yield">
                <div className="space-y-6">
                  {/* Yield Analytics Card */}
                  {yieldAnalytics && activity.yieldEstimates.length > 0 && (
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          Yield Performance Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 rounded-xl border border-green-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="h-4 w-4 text-green-600" />
                              <p className="text-xs font-medium text-muted-foreground">Total Estimates</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                              {yieldAnalytics.totalEstimates}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">All-time</p>
                          </div>

                          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                              <p className="text-xs font-medium text-muted-foreground">Average Yield</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                              {yieldAnalytics.averageYield.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">tons/hectare</p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4 rounded-xl border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="h-4 w-4 text-purple-600" />
                              <p className="text-xs font-medium text-muted-foreground">Best Yield</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">
                              {yieldAnalytics.bestYield.yield.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">{yieldAnalytics.bestYield.crop}</p>
                          </div>

                          <div className={`bg-gradient-to-br p-4 rounded-xl border ${
                            yieldAnalytics.yieldTrend === 'increasing' 
                              ? 'from-green-500/10 to-green-500/5 border-green-500/20'
                              : yieldAnalytics.yieldTrend === 'decreasing'
                              ? 'from-red-500/10 to-red-500/5 border-red-500/20'
                              : 'from-gray-500/10 to-gray-500/5 border-gray-500/20'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {yieldAnalytics.yieldTrend === 'increasing' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : yieldAnalytics.yieldTrend === 'decreasing' ? (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              ) : (
                                <Activity className="h-4 w-4 text-gray-600" />
                              )}
                              <p className="text-xs font-medium text-muted-foreground">Trend</p>
                            </div>
                            <p className={`text-xl font-bold capitalize ${
                              yieldAnalytics.yieldTrend === 'increasing' ? 'text-green-600' :
                              yieldAnalytics.yieldTrend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {yieldAnalytics.yieldTrend}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {yieldAnalytics.trendPercentage > 0 ? '+' : ''}{yieldAnalytics.trendPercentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Yield Trend Chart */}
                  {yieldTrendData.length > 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Yield Trend Over Time</CardTitle>
                        <CardDescription>Historical yield estimates with average benchmark</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={yieldTrendData}>
                              <defs>
                                <linearGradient id="colorYieldHistory" x1="0" y1="0" x2="0" y2="1">
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
                                        <p className="text-xs text-muted-foreground mb-1 capitalize">
                                          Crop: {payload[0].payload.crop}
                                        </p>
                                        <p className="text-sm font-bold text-green-600">
                                          Yield: {payload[0].value} tons
                                        </p>
                                        {yieldAnalytics && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Avg: {yieldAnalytics.averageYield.toFixed(2)} tons
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              {yieldAnalytics && (
                                <ReferenceLine 
                                  y={yieldAnalytics.averageYield} 
                                  stroke="#f59e0b" 
                                  strokeDasharray="5 5"
                                  label={{ 
                                    value: `Avg: ${yieldAnalytics.averageYield.toFixed(2)}`, 
                                    fontSize: 10,
                                    fill: '#f59e0b'
                                  }}
                                />
                              )}
                              <Area
                                type="monotone"
                                dataKey="yield"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorYieldHistory)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Existing Table */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Yield Estimate History</CardTitle>
                          <CardDescription>Your crop yield calculations</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => exportToCSV('yield')}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Clear Yield History?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete all your yield estimate history.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  handleClearHistory('yield');
                                  localStorage.removeItem('yieldEstimateHistory');
                                  setYieldAnalytics(null);
                                }}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {activity.yieldEstimates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No yield estimates yet. Go to Yield Estimator to start tracking!
                        </div>
                      ) : (
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
                            {activity.yieldEstimates.slice(0, 20).map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                <TableCell className="capitalize">{item.crop}</TableCell>
                                <TableCell>{item.area.toFixed(2)} ha</TableCell>
                                <TableCell className="font-medium">{item.estimatedYield.toFixed(2)} tons</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <MinimalFooter />
    </div>
  );
};

export default ActivityHistory;
