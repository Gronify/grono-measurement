'use client';

import { GlobeAltIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

type Language = {
  code: string;
  label: string;
};

const languages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'uk', label: 'Українська' },
];

const LanguageSwitcher = ({ locale }: { locale: string }) => {
  const router = useRouter();

  const changeLanguage = (locale: string) => {
    router.push(`/${locale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(lang => (
          <DropdownMenuItem key={lang.code} onClick={() => changeLanguage(lang.code)}>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
