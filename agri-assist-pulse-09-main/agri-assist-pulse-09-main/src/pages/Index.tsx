// Update this page (the content is just a fallback if you fail to update the page)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { DashboardCard } from '@/components/DashboardCard';
import { TrendingUp, Bug, Droplets, Leaf, Menu, X } from 'lucide-react';
import { useTranslation } from '@/utils/translations';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-background">
      <Header isOnline={isOnline} lastSynced={lastSynced} />
      
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-strong bg-primary text-primary-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Sidebar - Desktop and Mobile Overlay */}
        <div className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)]
          transition-transform duration-300 ease-in-out
        `}>
          <Sidebar />
        </div>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30 top-16"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 md:space-y-8"
          >
            {/* Hero Section */}
            <div className="text-center space-y-3 md:space-y-4 px-4">
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-primary"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                🌾 AI Agri Assistant
              </motion.h1>
              <motion.p 
                className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Smart farming solutions powered by AI. Get market insights, detect plant diseases, 
                optimize irrigation, and track your carbon footprint.
              </motion.p>
            </div>

            {/* Main Features Grid */}
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold px-4">🚀 Core Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              <DashboardCard
                title={t('marketForecaster')}
                subtitle="📈 Price Predictions"
                value="₹24.1/kg"
                description="Best price for tomatoes today"
                icon={TrendingUp}
                gradient="market-gradient"
                color="text-market"
                onClick={() => navigate('/market-forecaster')}
                delay={0.1}
              />

              <DashboardCard
                title={t('pestDetection')}
                subtitle="🔍 AI Disease Scanner"
                value="95%"
                description="Detection accuracy"
                icon={Bug}
                gradient="pest-gradient"
                color="text-pest"
                onClick={() => navigate('/pest-detection')}
                delay={0.2}
              />

              <DashboardCard
                title={t('irrigationPredictor')}
                subtitle="💧 Smart Watering"
                value="Not Needed"
                description="Rain expected tomorrow"
                icon={Droplets}
                gradient="irrigation-gradient"
                color="text-irrigation"
                status="success"
                onClick={() => navigate('/irrigation-predictor')}
                delay={0.3}
              />

              <DashboardCard
                title={t('carbonEstimator')}
                subtitle="🌍 Eco Tracker"
                value="145 kg"
                description="CO₂ emissions this week"
                icon={Leaf}
                gradient="carbon-gradient"
                color="text-carbon"
                status="success"
                onClick={() => navigate('/carbon-estimator')}
                delay={0.4}
              />

              </div>
            </div>

            {/* Quick Stats */}
            <motion.div
              className="bg-gradient-card rounded-2xl p-4 md:p-6 shadow-soft mx-4 md:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-lg md:text-xl font-semibold mb-4">📊 Today's Farm Insights</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-xl md:text-2xl font-bold text-market">₹1,245</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Expected Revenue</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-xl md:text-2xl font-bold text-irrigation">65%</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Soil Moisture</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-xl md:text-2xl font-bold text-success">12</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Healthy Plants</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-xl md:text-2xl font-bold text-carbon">2.3x</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Efficiency Boost</div>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="text-center space-y-4 py-8 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-muted-foreground text-sm md:text-base">
                Select any feature above to get started with AI-powered farming insights
              </p>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Index;
