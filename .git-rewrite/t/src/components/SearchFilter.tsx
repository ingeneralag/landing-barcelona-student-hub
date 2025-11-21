import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface SearchFilters {
  city: string;
  roomType: string;
  startDate: string;
  duration: string;
}

const SearchFilter = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    city: "",
    roomType: "",
    startDate: "",
    duration: "",
  });

  const handleSearch = () => {
    console.log("Buscando con filtros:", filters);
    // Aquí se implementaría la lógica de filtrado
    const accommodationsSection = document.getElementById("accommodations");
    if (accommodationsSection) {
      accommodationsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="search" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-2xl shadow-elegant p-6 md:p-8">
            <h2 className="text-center mb-8">Encuentra tu alojamiento ideal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Ciudad */}
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Select value={filters.city} onValueChange={(value) => setFilters({ ...filters, city: value })}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Selecciona ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barcelona">Barcelona</SelectItem>
                    <SelectItem value="madrid">Madrid</SelectItem>
                    <SelectItem value="valencia">Valencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de habitación */}
              <div className="space-y-2">
                <Label htmlFor="roomType">Tipo de habitación</Label>
                <Select value={filters.roomType} onValueChange={(value) => setFilters({ ...filters, roomType: value })}>
                  <SelectTrigger id="roomType">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="compartida">Compartida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha entrada */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de entrada</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              {/* Duración */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (meses)</Label>
                <Select value={filters.duration} onValueChange={(value) => setFilters({ ...filters, duration: value })}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="9">9 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botón de búsqueda */}
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full gradient-hero text-primary-foreground font-semibold"
                >
                  <Search className="mr-2" size={20} />
                  Ver opciones
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              * Los resultados se mostrarán en la sección de alojamientos disponibles
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFilter;
