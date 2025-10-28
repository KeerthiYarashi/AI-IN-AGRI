import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CROP_TYPES } from '@/utils/constants';
import { useTranslation } from '@/utils/translations';
import { cn } from '@/lib/utils';

interface CropSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  value,
  onValueChange,
  className,
  placeholder
}) => {
  const { t } = useTranslation();
  
  const selectedCrop = CROP_TYPES.find(crop => crop.id === value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-2", className)}
    >
      <label className="text-sm font-medium text-foreground">
        {t('selectCrop')}
      </label>
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
          <SelectValue placeholder={placeholder || t('selectCrop')}>
            {selectedCrop && (
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-lg">{selectedCrop.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{selectedCrop.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedCrop.nameKannada}
                  </span>
                </div>
              </motion.div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="bg-card/95 backdrop-blur-sm border-border/50">
          {CROP_TYPES.map((crop, index) => (
            <SelectItem 
              key={crop.id} 
              value={crop.id}
              className="hover:bg-accent/50 cursor-pointer"
            >
              <motion.div
                className="flex items-center space-x-3 w-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <motion.span 
                  className="text-lg"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {crop.icon}
                </motion.span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{crop.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {crop.nameKannada}
                  </span>
                </div>
                {value === crop.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className="ml-auto"
                  >
                    <Check className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};