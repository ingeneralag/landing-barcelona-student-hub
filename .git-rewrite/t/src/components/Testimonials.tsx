import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

const testimonials = [
  {
    name: "María González",
    university: { es: "Universidad de Barcelona", en: "University of Barcelona" },
    text: {
      es: "Excelente ubicación y el equipo de soporte fue muy amable. Me ayudaron con todo el proceso de mudanza desde el primer día.",
      en: "Excellent location and very friendly support team. They helped me through the whole move‑in process from day one.",
    },
    rating: 5,
  },
  {
    name: "Lucas Martínez",
    university: { es: "Universidad Complutense de Madrid", en: "Complutense University of Madrid" },
    text: {
      es: "La habitación es espaciosa y moderna. El ambiente estudiantil es genial, he hecho muchos amigos internacionales.",
      en: "The room is spacious and modern. The student vibe is great; I made many international friends.",
    },
    rating: 5,
  },
  {
    name: "Sofia Rodríguez",
    university: { es: "Universidad de Valencia", en: "University of Valencia" },
    text: {
      es: "Muy buena relación calidad-precio. Cerca de la playa y de mi facultad. El Wi-Fi funciona perfecto para mis clases online.",
      en: "Great value for money. Close to the beach and my faculty. Wi‑Fi works perfectly for my online classes.",
    },
    rating: 5,
  },
  {
    name: "James Walker",
    university: { es: "Universidad Politécnica de Barcelona", en: "Polytechnic University of Barcelona" },
    text: {
      es: "El proceso de reserva fue muy fácil y transparente. Todo estaba exactamente como se describía en las fotos.",
      en: "The booking process was very easy and transparent. Everything was exactly as described in the photos.",
    },
    rating: 5,
  },
  {
    name: "Emma Laurent",
    university: { es: "IE Business School Madrid", en: "IE Business School Madrid" },
    text: {
      es: "Ubicación perfecta e instalaciones excelentes. La limpieza es muy buena y las zonas comunes siempre están cuidadas.",
      en: "Perfect location and great facilities. Cleaning is excellent and common areas are always well maintained.",
    },
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { t, locale } = useI18n();

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">{t("sec_testimonials_title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experiencias reales de estudiantes que viven en nuestras residencias
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-elegant p-8 md:p-12 relative">
            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={goToPrevious}
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={goToNext}
            >
              <ChevronRight size={20} />
            </Button>

            {/* Content */}
            <div className="text-center max-w-2xl mx-auto">
              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="fill-secondary text-secondary" size={20} />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-lg md:text-xl text-foreground mb-8 leading-relaxed">
                "{current.text[locale]}"
              </blockquote>

              {/* Author */}
              <div>
                <p className="font-bold text-lg">{current.name}</p>
                <p className="text-muted-foreground">{current.university[locale]}</p>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-smooth ${
                    index === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30"
                  }`}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
