import { useState } from 'react';
import { useLanguage } from '@/lib/languages';
import { Language, LanguageOption } from '@/types';
import { Languages, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { languages } from '@/lib/languages';

export default function NavigationBar() {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  // Find the current language details
  const currentLangDetails = languages.find(lang => lang.code === currentLanguage);

  return (
    <nav className="flex justify-between items-center px-4 py-3 bg-dark-800 border-b border-dark-600">
      <div className="flex items-center space-x-2">
        <span className="material-icons text-primary-400">psychology</span>
        <h1 className="text-xl font-semibold text-white">{t('appName')}</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-dark-700">
          <History className="h-5 w-5 text-gray-300" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-dark-700">
          <Settings className="h-5 w-5 text-gray-300" />
        </Button>
        
        <DropdownMenu open={languageMenuOpen} onOpenChange={setLanguageMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center space-x-1 px-3 py-1 rounded-full bg-dark-700 hover:bg-dark-600 border-none"
            >
              <span className="text-sm">{currentLangDetails?.code.toUpperCase()}</span>
              <Languages className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-dark-700 border-dark-600">
            {languages.map((lang: LanguageOption) => (
              <DropdownMenuItem 
                key={lang.code}
                className={`flex items-center justify-between cursor-pointer ${lang.code === currentLanguage ? 'text-primary-400' : 'text-gray-300'}`}
                onClick={() => {
                  setLanguage(lang.code as Language);
                  setLanguageMenuOpen(false);
                }}
              >
                <span>{lang.name}</span>
                <span className="ml-2 text-xs opacity-70">{lang.nativeName}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
