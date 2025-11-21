import { MapPin, Wifi, Headphones, Users } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Cerca de la universidad",
    description: "Todos nuestros alojamientos están ubicados cerca de las principales universidades",
  },
  {
    icon: Wifi,
    title: "Wi-Fi incluido",
    description: "Internet de alta velocidad incluido en todas nuestras residencias",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Equipo de atención disponible las 24 horas para ayudarte cuando lo necesites",
  },
  {
    icon: Users,
    title: "Comunidad estudiantil",
    description: "Conoce estudiantes de todo el mundo y haz amigos para toda la vida",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">¿Por qué elegir Alojamiento-Barcelona?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ofrecemos más que un simple lugar donde vivir. Te brindamos una experiencia completa para estudiantes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-card shadow-md hover:shadow-elegant transition-smooth"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-hero mb-4">
                  <Icon className="text-primary-foreground" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
