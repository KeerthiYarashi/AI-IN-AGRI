// Update this page (the content is just a fallback if you fail to update the page)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { DashboardCard } from '@/components/DashboardCard';
import { Footer } from '@/components/Footer';
import { TrendingUp, Bug, Droplets, Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isOnline={isOnline} lastSynced={lastSynced} />
      
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 lg:p-16 shadow-strong"
            >
              <div className="relative z-10 text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="text-6xl md:text-7xl lg:text-8xl mb-4 animate-[bounce_2s_ease-in-out_infinite]">🌾</div>
                </motion.div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg leading-tight">
                  {t('appTitle')}
                </h1>
                <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  {t('heroDescription')}
                </p>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
            </motion.div>

            {/* Quick Stats - Improved Grid */}
            <motion.div
              className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-medium border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">📊</span>
                <h2 className="text-xl font-semibold text-foreground">{t('todaysInsights')}</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { value: '₹1,245', label: t('expectedRevenue'), color: 'green', icon: '💰' },
                  { value: '65%', label: t('soilMoisture'), color: 'blue', icon: '💧' },
                  { value: '12', label: t('healthyPlants'), color: 'green', icon: '🌱' },
                  { value: '2.3x', label: t('efficiencyBoost'), color: 'purple', icon: '⚡' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className={`text-center p-5 rounded-xl bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-500/5 border border-${stat.color}-500/20 hover:shadow-lg transition-all cursor-pointer`}
                    whileHover={{ scale: 1.05, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Main Features Grid - Fixed Equal Size */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  <h2 className="text-xl md:text-2xl font-semibold">{t('coreFeatures')}</h2>
                </div>
              </div>
              
              {/* Equal-sized grid: 1 column mobile, 2 tablet, 4 desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <DashboardCard
                  title={t('marketForecaster')}
                  subtitle={`📈 ${t('pricePredictions')}`}
                  value="₹24.1/kg"
                  description={t('bestPriceToday')}
                  icon={TrendingUp}
                  gradient="market-gradient"
                  color="text-market-color"
                  onClick={() => navigate('/market-forecaster')}
                  delay={0.6}
                />

                <DashboardCard
                  title={t('pestDetection')}
                  subtitle={`🔍 ${t('aiDiseaseScanner')}`}
                  value="95%"
                  description={t('detectionAccuracy')}
                  icon={Bug}
                  gradient="pest-gradient"
                  color="text-pest-color"
                 
                />

                <DashboardCard
                  title={t('irrigationPredictor')}
                  subtitle={`💧 ${t('smartWatering')}`}
                  value={t('irrigationNotNeeded')}
                  description={t('rainExpectedTomorrow')}
                  icon={Droplets}
                  gradient="irrigation-gradient"
                  color="text-irrigation-color"
                  status="success"
                  onClick={() => navigate('/irrigation-predictor')}
                  delay={0.8}
                />

                <DashboardCard
                  title={t('carbonEstimator')}
                  subtitle={`🌍 ${t('ecoTracker')}`}
                  value="145 kg"
                  description={t('emissionsThisWeek')}
                  icon={Leaf}
                  gradient="carbon-gradient"
                  color="text-carbon-color"
                  status="success"
                  onClick={() => navigate('/carbon-estimator')}
                  delay={0.9}
                />
              </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              className="text-center space-y-4 py-8 px-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <div className="inline-block p-3 bg-primary/10 rounded-full mb-2">
                <span className="text-3xl">💡</span>
              </div>
              <p className="text-muted-foreground text-base max-w-3xl mx-auto leading-relaxed">
                {t('selectFeaturePrompt')} {t('autoSyncInfo')}
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[t('offlineMode'), t('autoSync'), t('multiLanguage')].map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20"
                  >
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
