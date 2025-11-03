import { Button } from "@/components/ui/button";
import barcelonaImage from "@/assets/barcelona-city.jpg";
import madridImage from "@/assets/madrid-city.jpg";
import valenciaImage from "@/assets/valencia-city.jpg";

const cities = [
  {
    name: "Barcelona",
    image: barcelonaImage,
    description: "Vive en el corazón de la ciudad condal. A pocos minutos de la Universidad.",
    price: "Desde 350 €/mes",
  },
  {
    name: "Madrid",
    image: madridImage,
    description: "Conexión excelente y vida estudiantil activa.",
    price: "Desde 330 €/mes",
  },
  {
    name: "Valencia",
    image: valenciaImage,
    description: "Clima agradable y playas cerca.",
    price: "Desde 300 €/mes",
  },
];

const CitiesSection = () => {
  const scrollToAccommodations = () => {
    const element = document.getElementById("accommodations");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="cities" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">Nuestras Ciudades</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra el destino perfecto para tu experiencia universitaria en España
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cities.map((city, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-elegant transition-smooth"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={city.image}
                  alt={`Vista de ${city.name}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-2xl font-bold mb-1">{city.name}</h3>
                  <p className="text-white/90 text-sm">{city.price}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground mb-4">{city.description}</p>
                <Button
                  onClick={scrollToAccommodations}
                  className="w-full gradient-hero text-primary-foreground font-semibold"
                >
                  Ver alojamientos
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CitiesSection;
