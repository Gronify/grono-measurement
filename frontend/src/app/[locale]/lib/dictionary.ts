import "server-only";
import { Locale } from "@/i18n.config";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  de: () => import("@/dictionaries/de.json").then((module) => module.default),
  ar: () => import("@/dictionaries/ar.json").then((module) => module.default),
  es: () => import("@/dictionaries/es.json").then((module) => module.default),
  fa: () => import("@/dictionaries/fa.json").then((module) => module.default),
  hi: () => import("@/dictionaries/hi.json").then((module) => module.default),
  ja: () => import("@/dictionaries/ja.json").then((module) => module.default),
  pt: () => import("@/dictionaries/pt.json").then((module) => module.default),
  uk: () => import("@/dictionaries/uk.json").then((module) => module.default),
  zh: () => import("@/dictionaries/zh.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
