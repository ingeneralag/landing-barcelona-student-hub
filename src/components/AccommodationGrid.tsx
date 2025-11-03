import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Bed, Euro } from "lucide-react";
import individual1 from "@/assets/individual1.jpg";
import individual2 from "@/assets/individual2.jpg";
import individual3 from "@/assets/individual3.jpg";
import shared1 from "@/assets/shared1.jpg";
import shared2 from "@/assets/shared2.jpg";
import shared3 from "@/assets/shared3.jpg";
import { useI18n } from "@/i18n";

const accommodations = [
  // Barcelona
  {
    id: 1,
    title: "Habitación Individual - Barcelona",
    type: "Individual",
    city: "Barcelona",
    price: 550,
    distance: "5 min de UB",
    image: individual1,
    features: ["Wi-Fi incluido", "Limpieza semanal", "Baño privado"],
    available: true,
  },
  {
    id: 2,
    title: "Habitación Compartida - Barcelona",
    type: "Compartida",
    city: "Barcelona",
    price: 400,
    distance: "8 min de UPF",
    image: shared1,
    features: ["Wi-Fi incluido", "2 personas", "Cocina equipada"],
    available: false,
  },

  // Madrid
  {
    id: 3,
    title: "Habitación Individual - Madrid",
    type: "Individual",
    city: "Madrid",
    price: 550,
    distance: "7 min de UCM",
    image: individual2,
    features: ["Wi-Fi incluido", "Limpieza incluida", "Zona de estudio"],
    available: true,
  },
  {
    id: 4,
    title: "Habitación Compartida - Madrid",
    type: "Compartida",
    city: "Madrid",
    price: 400,
    distance: "12 min de UAM",
    image: shared2,
    features: ["Wi-Fi incluido", "2 personas", "Cocina equipada"],
    available: false,
  },

  // Valencia
  {
    id: 5,
    title: "Habitación Individual - Valencia",
    type: "Individual",
    city: "Valencia",
    price: 480,
    distance: "6 min de UV",
    image: individual3,
    features: ["Wi-Fi incluido", "Cerca de la playa"],
    available: true,
  },
  {
    id: 6,
    title: "Habitación Compartida - Valencia",
    type: "Compartida",
    city: "Valencia",
    price: 300,
    distance: "10 min de UV",
    image: shared3,
    features: ["Wi-Fi incluido", "2 personas", "Cocina equipada"],
    available: false,
  },
];

const AccommodationGrid = () => {
  const [selectedAccommodation, setSelectedAccommodation] = useState<typeof accommodations[0] | null>(null);
  const { t } = useI18n();

  const openEmail = (accommodation: typeof accommodations[0]) => {
    const subject = encodeURIComponent(`Interés en ${accommodation.title}`);
    const body = encodeURIComponent(
      `Hola, me interesa la ${accommodation.title}. Precio: ${accommodation.price}€/mes. ¿Podrían darme más información?`
    );
    window.location.href = `mailto:info@alojamiento-barcelona.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="accommodations" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">{t("sec_accommodations_title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("sec_accommodations_sub")}
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
                  className={`w-full h-full object-cover hover:scale-110 transition-smooth ${
                    accommodation.available === false ? "opacity-60 grayscale" : ""
                  }`}
                />
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  {accommodation.type}
                </div>
                {accommodation.available === false && (
                  <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {t("label_full")}
                  </div>
                )}
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
                    if (accommodation.available === false) return;
                    openEmail(accommodation);
                  }}
                  disabled={accommodation.available === false}
                  className={`w-full font-semibold ${
                    accommodation.available === false
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "gradient-accent text-accent-foreground"
                  }`}
                >
                  {accommodation.available === false ? t("label_full") : t("btn_contact_email")}
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
                onClick={() => {
                  if (!selectedAccommodation || selectedAccommodation.available === false) return;
                  openEmail(selectedAccommodation);
                }}
                disabled={selectedAccommodation?.available === false}
                className={`w-full font-semibold ${
                  selectedAccommodation?.available === false
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "gradient-accent text-accent-foreground"
                }`}
              >
                {selectedAccommodation?.available === false ? t("label_full") : t("btn_contact_email")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AccommodationGrid;
