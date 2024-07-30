import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { i18n, Locale } from "@/i18n.config";
import DictionaryProvider from "./components/dictionary-provider";
import { getDictionary } from "./lib/dictionary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Webpage Performance Data",
  description: "",
};

export function generateStaticParams() {
  return i18n.locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  const dictionary = await getDictionary(params.locale)
  return (
    <html lang={params.locale} >

      <body suppressHydrationWarning={true}>
        <DictionaryProvider dictionary={dictionary}>
          {children}
        </DictionaryProvider></body>
    </html>
  );
}
