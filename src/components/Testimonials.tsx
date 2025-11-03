import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "María González",
    university: "Universidad de Barcelona",
    text: "Excelente ubicación y el equipo de soporte fue muy amable. Me ayudaron con todo el proceso de mudanza desde el primer día.",
    rating: 5,
  },
  {
    name: "Lucas Martínez",
    university: "Universidad Complutense de Madrid",
    text: "La habitación es espaciosa y moderna. El ambiente estudiantil es genial, he hecho muchos amigos internacionales.",
    rating: 5,
  },
  {
    name: "Sofia Rodríguez",
    university: "Universidad de Valencia",
    text: "Muy buena relación calidad-precio. Cerca de la playa y de mi facultad. El Wi-Fi funciona perfecto para mis clases online.",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    university: "Universidad Politécnica de Barcelona",
    text: "El proceso de reserva fue muy fácil y transparente. Todo estaba exactamente como se describía en las fotos.",
    rating: 5,
  },
  {
    name: "Emma Laurent",
    university: "IE Business School Madrid",
    text: "Perfect location and great facilities. The cleaning service is excellent and the common areas are always well maintained.",
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
          <h2 className="mb-4">Lo que dicen nuestros estudiantes</h2>
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
                "{current.text}"
              </blockquote>

              {/* Author */}
              <div>
                <p className="font-bold text-lg">{current.name}</p>
                <p className="text-muted-foreground">{current.university}</p>
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
