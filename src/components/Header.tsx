import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-elegant" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"
            >
              Alojamiento-Barcelona
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("cities")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              Ciudades
            </button>
            <button
              onClick={() => scrollToSection("how-to-book")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              Cómo reservar
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              Precios
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              Contacto
            </button>
            <Button
              onClick={() => scrollToSection("search")}
              className="gradient-hero text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-smooth"
            >
              Reservar ahora
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-foreground/80 hover:text-foreground transition-smooth text-left"
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection("cities")}
                className="text-foreground/80 hover:text-foreground transition-smooth text-left"
              >
                Ciudades
              </button>
              <button
                onClick={() => scrollToSection("how-to-book")}
                className="text-foreground/80 hover:text-foreground transition-smooth text-left"
              >
                Cómo reservar
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-foreground/80 hover:text-foreground transition-smooth text-left"
              >
                Precios
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-foreground/80 hover:text-foreground transition-smooth text-left"
              >
                Contacto
              </button>
              <Button
                onClick={() => scrollToSection("search")}
                className="gradient-hero text-primary-foreground font-semibold"
              >
                Reservar ahora
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
