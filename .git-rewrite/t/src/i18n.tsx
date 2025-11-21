import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Locale = "es" | "en";

type Translations = Record<string, Record<Locale, string>>;

const translations: Translations = {
  // Header
  nav_home: { es: "Inicio", en: "Home" },
  nav_cities: { es: "Ciudades", en: "Cities" },
  nav_how: { es: "Cómo reservar", en: "How to book" },
  nav_pricing: { es: "Precios", en: "Prices" },
  nav_contact: { es: "Contacto", en: "Contact" },
  cta_book_now: { es: "Reservar ahora", en: "Book now" },

  // Hero
  hero_title: { es: "Residencias para estudiantes en España", en: "Student residences in Spain" },
  hero_subtitle: {
    es: "Barcelona · Madrid · Valencia — alojamiento seguro, económico y cerca de todo",
    en: "Barcelona · Madrid · Valencia — safe, affordable and close to everything",
  },
  hero_search: { es: "Buscar alojamiento", en: "Search housing" },
  hero_contact_email: { es: "Contactar por Email", en: "Contact by Email" },

  // Sections
  sec_how_title: { es: "Cómo reservar", en: "How to book" },
  sec_pricing_title: { es: "Precios y Paquetes", en: "Prices & Packages" },
  sec_pricing_sub: { es: "Opciones flexibles que se adaptan a tu presupuesto", en: "Flexible options for your budget" },
  sec_accommodations_title: { es: "Alojamientos Disponibles", en: "Available accommodations" },
  sec_accommodations_sub: {
    es: "Explora nuestras opciones de habitaciones en las mejores ubicaciones",
    en: "Explore our room options in the best locations",
  },
  sec_faq_title: { es: "Preguntas Frecuentes", en: "Frequently Asked Questions" },
  sec_testimonials_title: { es: "Lo que dicen nuestros estudiantes", en: "What our students say" },

  // Buttons / labels
  btn_check_availability: { es: "Consultar disponibilidad", en: "Check availability" },
  btn_contact_email: { es: "Contactar por Email", en: "Contact by Email" },
  label_full: { es: "Completo", en: "Full" },

  // Footer
  footer_quick: { es: "Enlaces Rápidos", en: "Quick Links" },
  footer_cities: { es: "Nuestras Ciudades", en: "Our Cities" },
  footer_contact: { es: "Contacto", en: "Contact" },
};

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof translations) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("locale");
    return (saved === "en" || saved === "es") ? (saved as Locale) : "es";
  });

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  const t = useMemo(() => {
    return (key: keyof typeof translations) => translations[key]?.[locale] ?? String(key);
  }, [locale]);

  const value: I18nContextType = { locale, setLocale, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}


