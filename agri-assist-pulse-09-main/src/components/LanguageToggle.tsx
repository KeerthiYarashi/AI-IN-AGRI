import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {language === 'en' && 'English'}
            {language === 'kn' && 'ಕನ್ನಡ'}
            {language === 'hi' && 'हिंदी'}
            {language === 'te' && 'తెలుగు'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('kn')}
          className={language === 'kn' ? 'bg-accent' : ''}
        >
          ಕನ್ನಡ (Kannada)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('hi')}
          className={language === 'hi' ? 'bg-accent' : ''}
        >
          हिंदी (Hindi)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('te')}
          className={language === 'te' ? 'bg-accent' : ''}
        >
          తెలుగు (Telugu)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
