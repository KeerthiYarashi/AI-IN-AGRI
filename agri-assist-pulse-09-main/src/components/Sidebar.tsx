import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Bug, 
  Droplets, 
  Leaf,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navigationItems = [
  {
    id: 'dashboard',
    to: '/',
    icon: LayoutDashboard,
    translationKey: 'dashboard',
    gradient: 'bg-gradient-primary',
    color: 'text-primary'
  },
  {
    id: 'market',
    to: '/market-forecaster',
    icon: TrendingUp,
    translationKey: 'marketForecaster',
    gradient: 'market-gradient',
    color: 'text-market'
  },
  {
    id: 'pest',
    to: '/pest-detection',
    icon: Bug,
    translationKey: 'pestDetection',
    gradient: 'pest-gradient',
    color: 'text-pest'
  },
  {
    id: 'irrigation',
    to: '/irrigation-predictor',
    icon: Droplets,
    translationKey: 'irrigationPredictor',
    gradient: 'irrigation-gradient',
    color: 'text-irrigation'
  },
  {
    id: 'carbon',
    to: '/carbon-estimator',
    icon: Leaf,
    translationKey: 'carbonEstimator',
    gradient: 'carbon-gradient',
    color: 'text-carbon'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const { language } = useLanguage();
  
  const getTranslationWithFallback = (key: string): { primary: string; secondary: string } => {
    const translation = translations[key];
    if (!translation) return { primary: key, secondary: '' };
    
    const primary = translation[language] || translation['en'] || key;
    const secondary = language !== 'en' ? (translation['en'] || '') : (translation['kn'] || '');
    
    return { primary, secondary };
  };

  return (
    <motion.aside
      className={cn(
        "h-full border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64 md:w-72"
      )}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex h-full flex-col">
        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 p-4">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            const translation = getTranslationWithFallback(item.translationKey);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive: navIsActive }) =>
                    cn(
                      "group flex items-center rounded-xl px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
                      navIsActive || isActive
                        ? `${item.gradient} text-white shadow-soft`
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )
                  }
                >
                  <motion.div
                    className="flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={cn(
                      "h-4 w-4 md:h-5 md:w-5 transition-colors",
                      (isActive || location.pathname === item.to) ? "text-white" : item.color
                    )} />
                  </motion.div>
                  
                  {!isCollapsed && (
                    <motion.div
                      className="ml-2 md:ml-3 flex-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="font-medium text-xs md:text-sm">
                        {translation.primary}
                      </div>
                      <div className="text-[10px] md:text-xs opacity-75">
                        {translation.secondary}
                      </div>
                    </motion.div>
                  )}
                  
                  {!isCollapsed && (isActive || location.pathname === item.to) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.3 }}
                    >
                      <ChevronRight className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/50 p-4">
          {!isCollapsed ? (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-muted-foreground">
                AI Agri Assistant v1.0
              </p>
              <p className="text-xs text-muted-foreground">
                Built with ❤️ for farmers
              </p>
            </motion.div>
          ) : (
            <div className="flex justify-center">
              <motion.div
                className="text-lg"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 5 
                }}
              >
                ❤️
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};