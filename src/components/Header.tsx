import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo1212.png";
import { useI18n } from "@/i18n";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();

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
              className="flex items-center gap-2"
              aria-label="Home"
            >
              <img src={logo} alt="Site logo" className="h-12 md:h-14 w-auto" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              {t("nav_home")}
            </button>
            <button
              onClick={() => scrollToSection("cities")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              {t("nav_cities")}
            </button>
            <button
              onClick={() => scrollToSection("how-to-book")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              {t("nav_how")}
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              {t("nav_pricing")}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-foreground/80 hover:text-foreground transition-smooth"
            >
              {t("nav_contact")}
            </button>
            <Button
              onClick={() => scrollToSection("search")}
              className="gradient-hero text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-smooth"
            >
              {t("cta_book_now")}
            </Button>
            <button
              onClick={() => setLocale(locale === "es" ? "en" : "es")}
              className="ml-2 px-3 py-2 text-sm rounded-md border border-border hover:bg-muted"
            >
              {locale === "es" ? "EN" : "ES"}
            </button>
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
                {t("nav_home")}
              </button>
              <button
                onClick={() => scrollToSection("cities")}
                className="text-foreground/80 hover:text-foreground transition-smooth text-left"
              >
                {t("nav_cities")}
              </button>
              <button
                onClick={() => scrollToSection("how-to-book")}
                className="text-foreground/80 hover:text-foreground transition-smooth text-left"
              >
                {t("nav_how")}
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-foreground/80 hover:text-foreground transition-smooth text-left"
              >
                {t("nav_pricing")}
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-foreground/80 hover:text-foreground transition-smooth text-left"
              >
                {t("nav_contact")}
              </button>
              <Button
                onClick={() => scrollToSection("search")}
                className="gradient-hero text-primary-foreground font-semibold"
              >
                {t("cta_book_now")}
              </Button>
              <button
                onClick={() => setLocale(locale === "es" ? "en" : "es")}
                className="mt-2 w-fit px-3 py-2 text-sm rounded-md border border-border hover:bg-muted"
              >
                {locale === "es" ? "EN" : "ES"}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
