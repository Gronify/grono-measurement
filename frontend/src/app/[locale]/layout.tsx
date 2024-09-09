import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { i18n, Locale } from '@/i18n.config';
import { getDictionary } from '../../lib/dictionary';
import { ThemeProvider } from '@/components/theme-provide';
import DictionaryProvider from '@/components/dictionary-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Webpage Performance Data',
  description: '',
};

export function generateStaticParams() {
  return i18n.locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  const dictionary = await getDictionary(params.locale);
  return (
    <html lang={params.locale}>
      <body suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DictionaryProvider dictionary={dictionary}>{children}</DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
