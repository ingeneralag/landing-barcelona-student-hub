import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Euro, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { accommodations } from "@/data/accommodations";
import { useBooking } from "@/contexts/BookingContext";
import type { Accommodation } from "@/data/accommodations";

const AccommodationGrid = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { setSelectedRoom } = useBooking();
  const [rooms, setRooms] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      // Add cache busting parameter and no-cache headers
      const timestamp = Date.now();
      const response = await fetch(`${backendUrl}/api/rooms?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store', // Prevent browser caching
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        // Fallback to static data
        setRooms(accommodations);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      // Fallback to static data
      setRooms(accommodations);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomClick = (accommodation: Accommodation) => {
    if (accommodation.available) {
      setSelectedRoom(accommodation);
      navigate(`/room/${accommodation.id}`);
    }
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

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {rooms.map((accommodation) => (
            <div
              key={accommodation.id}
              className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-elegant transition-smooth cursor-pointer"
              onClick={() => handleRoomClick(accommodation)}
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
                    handleRoomClick(accommodation);
                  }}
                  disabled={accommodation.available === false}
                  className={`w-full font-semibold ${
                    accommodation.available === false
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "gradient-accent text-accent-foreground"
                  }`}
                >
                  {accommodation.available === false ? t("label_full") : t("btn_book_now")}
                </Button>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AccommodationGrid;
