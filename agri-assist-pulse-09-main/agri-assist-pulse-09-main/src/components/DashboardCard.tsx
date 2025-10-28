import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  description?: string;
  icon: LucideIcon;
  gradient: string;
  color: string;
  onClick?: () => void;
  isLoading?: boolean;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  children?: React.ReactNode;
  delay?: number;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  value,
  description,
  icon: Icon,
  gradient,
  color,
  onClick,
  isLoading = false,
  status = 'neutral',
  children,
  delay = 0
}) => {
  const statusStyles = {
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    error: 'border-destructive/20 bg-destructive/5',
    neutral: 'border-border/50 bg-card/50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn(
        "feature-card relative overflow-hidden transition-all duration-300 hover:shadow-glow",
        statusStyles[status],
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
      >
        {/* Background Gradient Accent */}
        <div className={cn(
          "absolute inset-0 opacity-5",
          gradient
        )} />
        
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground/80">
                {subtitle}
              </p>
            )}
          </div>
          
          <motion.div
            className={cn(
              "p-2 rounded-lg",
              gradient
            )}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="h-4 w-4 text-white" />
          </motion.div>
        </CardHeader>

        <CardContent className="relative space-y-3">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <motion.div
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          ) : (
            <>
              {value && (
                <motion.div
                  className="text-2xl font-bold"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: delay + 0.2 }}
                >
                  {value}
                </motion.div>
              )}
              
              {description && (
                <motion.p
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.3 }}
                >
                  {description}
                </motion.p>
              )}
              
              {children}
            </>
          )}

          {onClick && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.4 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "w-full mt-3 hover:bg-accent/10",
                  color
                )}
              >
                View Details →
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};