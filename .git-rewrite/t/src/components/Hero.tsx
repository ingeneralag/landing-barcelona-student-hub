import { Button } from "@/components/ui/button";
import { MapPin, Wifi, Clock } from "lucide-react";
import heroImage from "@/assets/hero-students.jpg";
import { useI18n } from "@/i18n";

const Hero = () => {
  const { t } = useI18n();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openEmail = () => {
    const subject = encodeURIComponent("Consulta de alojamiento");
    const body = encodeURIComponent("Hola, me interesa alojamiento en Barcelona. ¿Podrían darme más información?");
    window.location.href = `mailto:info@alojamiento-barcelona.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Estudiantes internacionales en Barcelona"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="mb-6 animate-fade-in">
            {t("hero_title")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/95 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {t("hero_subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button
              onClick={() => scrollToSection("search")}
              size="lg"
              className="gradient-accent text-accent-foreground font-semibold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-smooth"
            >
              {t("hero_search")}
            </Button>
            <Button
              onClick={openEmail}
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm font-semibold text-lg px-8 py-6"
            >
              {t("hero_contact_email")}
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <MapPin className="text-secondary" size={24} />
              <span className="font-semibold">Ubicación céntrica</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Wifi className="text-secondary" size={24} />
              <span className="font-semibold">Precios transparentes</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Clock className="text-secondary" size={24} />
              <span className="font-semibold">Contratos flexibles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
