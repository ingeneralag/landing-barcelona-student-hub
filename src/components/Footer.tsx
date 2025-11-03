import { Facebook, Instagram, Twitter, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/i18n";

const Footer = () => {
  const { t } = useI18n();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Alojamiento-Barcelona</h3>
            <p className="text-primary-foreground/80 mb-4">
              Tu hogar lejos de casa. Residencias para estudiantes en las mejores ciudades de España.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-smooth"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-smooth"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-smooth"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t("footer_quick")}</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="text-primary-foreground/80 hover:text-secondary transition-smooth"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("cities")}
                  className="text-primary-foreground/80 hover:text-secondary transition-smooth"
                >
                  Ciudades
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("accommodations")}
                  className="text-primary-foreground/80 hover:text-secondary transition-smooth"
                >
                  Alojamientos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-primary-foreground/80 hover:text-secondary transition-smooth"
                >
                  Precios
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-primary-foreground/80 hover:text-secondary transition-smooth"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Ciudades */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t("footer_cities")}</h4>
            <ul className="space-y-2">
              <li className="text-primary-foreground/80">Barcelona</li>
              <li className="text-primary-foreground/80">Madrid</li>
              <li className="text-primary-foreground/80">Valencia</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t("footer_contact")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail size={18} className="mt-1 flex-shrink-0" />
                <a
                  href="mailto:info@alojamiento-barcelona.com"
                  className="text-primary-foreground/80 hover:text-secondary transition-smooth"
                >
                  info@alojamiento-barcelona.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  Calle Falsa 123, Barcelona
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © {new Date().getFullYear()} Alojamiento-Barcelona — Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-primary-foreground/60 hover:text-secondary transition-smooth">
                Política de privacidad
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-secondary transition-smooth">
                Términos y condiciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
