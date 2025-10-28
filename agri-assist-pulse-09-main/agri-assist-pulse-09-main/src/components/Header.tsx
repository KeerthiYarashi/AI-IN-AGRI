import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/utils/translations';

interface HeaderProps {
  isOnline: boolean;
  lastSynced?: Date;
}

export const Header: React.FC<HeaderProps> = ({ isOnline, lastSynced }) => {
  const { t } = useTranslation();

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-3 md:px-4">
        <div className="flex items-center space-x-2 md:space-x-3">
          <motion.div
            className="text-xl md:text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🌾
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold text-gradient-primary">
              AI Agri Assistant
            </h1>
            <p className="text-xs text-muted-foreground hidden md:block">
              {t('welcome')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Online/Offline Status */}
          <motion.div
            className={`flex items-center space-x-2 rounded-full px-3 py-1 text-xs font-medium ${
              isOnline 
                ? 'bg-success/10 text-success border border-success/20' 
                : 'bg-warning/10 text-warning border border-warning/20'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>{t('online')}</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>{t('offline')}</span>
              </>
            )}
          </motion.div>

          {/* Last Synced */}
          {lastSynced && (
            <div className="hidden sm:block text-xs text-muted-foreground">
              Last synced: {lastSynced.toLocaleTimeString()}
            </div>
          )}

          {/* Language Toggle - Simple button for demo */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-1.5 md:px-2 py-1 h-7 md:h-8"
            onClick={() => {
              // In a real app, this would toggle language in context
              console.log('Language toggle clicked - implement in context');
            }}
          >
            <span className="hidden sm:inline">EN / </span>ಕನ್ನಡ
          </Button>
        </div>
      </div>
    </motion.header>
  );
};