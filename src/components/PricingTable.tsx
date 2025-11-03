import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Individual Básica",
    price: 350,
    features: [
      "Wi-Fi incluido",
      "Cocina compartida",
      "Baño compartido",
      "Limpieza zonas comunes",
    ],
  },
  {
    name: "Individual Premium",
    price: 550,
    popular: true,
    features: [
      "Wi-Fi incluido",
      "Baño privado",
      "Limpieza semanal",
      "Utilities incluidos",
      "Zona de estudio privada",
    ],
  },
  {
    name: "Compartida",
    price: 250,
    perPerson: true,
    features: [
      "Wi-Fi incluido",
      "Cocina equipada",
      "Baño compartido",
      "2 personas por habitación",
    ],
  },
];

const PricingTable = () => {
  const openWhatsApp = () => {
    const message = encodeURIComponent("Hola, me gustaría consultar disponibilidad y precios. ¿Podrían ayudarme?");
    window.open(`https://wa.me/34600000000?text=${message}`, "_blank");
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">Precios y Paquetes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Opciones flexibles que se adaptan a tu presupuesto
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
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/mes</span>
                  {plan.perPerson && (
                    <span className="text-sm text-muted-foreground block">por persona</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="text-primary flex-shrink-0" size={20} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={openWhatsApp}
                  className={`w-full font-semibold ${
                    plan.popular
                      ? "gradient-accent text-accent-foreground"
                      : "gradient-hero text-primary-foreground"
                  }`}
                >
                  Consultar disponibilidad
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
