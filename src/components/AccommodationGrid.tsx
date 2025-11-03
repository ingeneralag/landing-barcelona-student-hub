import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Bed, Euro } from "lucide-react";
import roomIndividual from "@/assets/room-individual.jpg";
import roomShared from "@/assets/room-shared.jpg";

const accommodations = [
  {
    id: 1,
    title: "Habitación Individual Premium - Barcelona",
    type: "Individual",
    city: "Barcelona",
    price: 550,
    distance: "5 min de UB",
    image: roomIndividual,
    features: ["Wi-Fi incluido", "Limpieza semanal", "Baño privado"],
  },
  {
    id: 2,
    title: "Habitación Individual Básica - Barcelona",
    type: "Individual",
    city: "Barcelona",
    price: 350,
    distance: "10 min de UPC",
    image: roomIndividual,
    features: ["Wi-Fi incluido", "Cocina compartida"],
  },
  {
    id: 3,
    title: "Habitación Compartida - Barcelona",
    type: "Compartida",
    city: "Barcelona",
    price: 250,
    distance: "8 min de UPF",
    image: roomShared,
    features: ["Wi-Fi incluido", "2 personas", "Cocina equipada"],
  },
  {
    id: 4,
    title: "Habitación Individual Premium - Madrid",
    type: "Individual",
    city: "Madrid",
    price: 530,
    distance: "7 min de UCM",
    image: roomIndividual,
    features: ["Wi-Fi incluido", "Limpieza incluida", "Baño privado"],
  },
  {
    id: 5,
    title: "Habitación Individual - Madrid",
    type: "Individual",
    city: "Madrid",
    price: 330,
    distance: "12 min de UAM",
    image: roomIndividual,
    features: ["Wi-Fi incluido", "Zona tranquila"],
  },
  {
    id: 6,
    title: "Habitación Individual - Valencia",
    type: "Individual",
    city: "Valencia",
    price: 300,
    distance: "6 min de UV",
    image: roomIndividual,
    features: ["Wi-Fi incluido", "Cerca de la playa"],
  },
];

const AccommodationGrid = () => {
  const [selectedAccommodation, setSelectedAccommodation] = useState<typeof accommodations[0] | null>(null);

  const openWhatsApp = (accommodation: typeof accommodations[0]) => {
    const message = encodeURIComponent(
      `Hola, me interesa la ${accommodation.title}. Precio: ${accommodation.price}€/mes. ¿Podrían darme más información?`
    );
    window.open(`https://wa.me/34600000000?text=${message}`, "_blank");
  };

  return (
    <section id="accommodations" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">Alojamientos Disponibles</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestras opciones de habitaciones en las mejores ubicaciones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {accommodations.map((accommodation) => (
            <div
              key={accommodation.id}
              className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-elegant transition-smooth cursor-pointer"
              onClick={() => setSelectedAccommodation(accommodation)}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={accommodation.image}
                  alt={accommodation.title}
                  className="w-full h-full object-cover hover:scale-110 transition-smooth"
                />
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  {accommodation.type}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{accommodation.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{accommodation.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro size={16} />
                    <span className="font-bold text-foreground">{accommodation.price}€/mes</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {accommodation.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    openWhatsApp(accommodation);
                  }}
                  className="w-full gradient-accent text-accent-foreground font-semibold"
                >
                  Reservar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalles */}
      <Dialog open={!!selectedAccommodation} onOpenChange={() => setSelectedAccommodation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAccommodation?.title}</DialogTitle>
          </DialogHeader>
          {selectedAccommodation && (
            <div className="space-y-4">
              <img
                src={selectedAccommodation.image}
                alt={selectedAccommodation.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-semibold">{selectedAccommodation.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio</p>
                  <p className="font-semibold">{selectedAccommodation.price}€/mes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ciudad</p>
                  <p className="font-semibold">{selectedAccommodation.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distancia</p>
                  <p className="font-semibold">{selectedAccommodation.distance}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Características</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAccommodation.features.map((feature, index) => (
                    <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => openWhatsApp(selectedAccommodation)}
                className="w-full gradient-accent text-accent-foreground font-semibold"
              >
                Contactar por WhatsApp
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AccommodationGrid;
