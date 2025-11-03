import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

const plans = [
  {
    name: { es: "Individual Básica", en: "Individual Basic" },
    price: 350,
    features: [
      { es: "Wi‑Fi incluido", en: "Wi‑Fi included" },
      { es: "Cocina compartida", en: "Shared kitchen" },
      { es: "Baño compartido", en: "Shared bathroom" },
      { es: "Limpieza zonas comunes", en: "Common areas cleaning" },
    ],
  },
  {
    name: { es: "Individual Premium", en: "Individual Premium" },
    price: 550,
    popular: true,
    features: [
      { es: "Wi‑Fi incluido", en: "Wi‑Fi included" },
      { es: "Baño privado", en: "Private bathroom" },
      { es: "Limpieza semanal", en: "Weekly cleaning" },
      { es: "Utilities incluidos", en: "Utilities included" },
      { es: "Zona de estudio privada", en: "Private study area" },
    ],
  },
  {
    name: { es: "Compartida", en: "Shared" },
    price: 250,
    perPerson: true,
    features: [
      { es: "Wi‑Fi incluido", en: "Wi‑Fi included" },
      { es: "Cocina equipada", en: "Equipped kitchen" },
      { es: "Baño compartido", en: "Shared bathroom" },
      { es: "2 personas por habitación", en: "2 people per room" },
    ],
  },
];

const PricingTable = () => {
  const { t, locale } = useI18n();
  const openEmail = () => {
    const subject = encodeURIComponent("Consulta de disponibilidad y precios");
    const body = encodeURIComponent("Hola, me gustaría consultar disponibilidad y precios. ¿Podrían ayudarme?");
    window.location.href = `mailto:info@alojamiento-barcelona.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">{t("sec_pricing_title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("sec_pricing_sub")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-elegant transition-smooth ${
                plan.popular ? "ring-2 ring-secondary scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{(plan.name as any)[locale]}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/ {locale === "es" ? "mes" : "month"}</span>
                  {plan.perPerson && (
                    <span className="text-sm text-muted-foreground block">{locale === "es" ? "por persona" : "per person"}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {(plan.features as any).map((feature: any, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="text-primary flex-shrink-0" size={20} />
                      <span>{feature[locale]}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={openEmail}
                  className={`w-full font-semibold ${
                    plan.popular
                      ? "gradient-accent text-accent-foreground"
                      : "gradient-hero text-primary-foreground"
                  }`}
                >
                  {t("btn_check_availability")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          * Precios orientativos. Consultar disponibilidad y condiciones específicas por ciudad.
        </p>
      </div>
    </section>
  );
};

export default PricingTable;
