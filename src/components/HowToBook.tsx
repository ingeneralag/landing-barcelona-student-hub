import { Search, MessageSquare, FileText, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Selecciona",
    description: "Selecciona ciudad, fechas y tipo de habitación.",
  },
  {
    icon: MessageSquare,
    title: "Reserva",
    description: "Revisa las opciones y reserva online o solicita más info por WhatsApp.",
  },
  {
    icon: FileText,
    title: "Firma",
    description: "Firma contrato digital y realiza el pago seguro.",
  },
  {
    icon: Key,
    title: "Check-in",
    description: "Check-in y bienvenida.",
  },
];

const HowToBook = () => {
  const scrollToSearch = () => {
    const element = document.getElementById("search");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="how-to-book" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">Cómo reservar</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proceso simple y rápido en 4 pasos
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative text-center">
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-primary/20" />
                  )}
                  
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-hero mb-4 relative">
                      <Icon className="text-primary-foreground" size={40} />
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={scrollToSearch}
            size="lg"
            className="gradient-accent text-accent-foreground font-semibold text-lg px-8"
          >
            Reservar ahora
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowToBook;
