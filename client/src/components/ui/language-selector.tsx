import { useState } from 'react';
import { useLanguage } from '@/lib/languages';
import { languages } from '@/lib/languages';
import { LanguageOption, Language } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  // Find the current language details
  const currentLangDetails = languages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-dark-700 hover:bg-dark-600 border-none"
        >
          <Globe className="h-4 w-4 mr-1" />
          <span className="text-sm">{currentLangDetails?.name || 'English'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-dark-700 border-dark-600">
        {languages.map((lang: LanguageOption) => (
          <DropdownMenuItem 
            key={lang.code}
            className={`flex items-center justify-between cursor-pointer ${lang.code === currentLanguage ? 'text-primary-400' : 'text-gray-300'}`}
            onClick={() => {
              setLanguage(lang.code as Language);
              setOpen(false);
            }}
          >
            <span>{lang.name}</span>
            <span className="ml-2 text-xs opacity-70">{lang.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
