export const i18n = {
  defaultLocale: "en",
  locales: ["en", "de", "ar", "es", "fa", "hi", "ja", "pt", "uk", "zh"],
} as const;

export type Locale = (typeof i18n)["locales"][number];
