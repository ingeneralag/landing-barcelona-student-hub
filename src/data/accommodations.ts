import individual1 from "@/assets/individual1.jpg";
import individual2 from "@/assets/individual2.jpg";
import individual3 from "@/assets/individual3.jpg";
import shared1 from "@/assets/shared1.jpg";
import shared2 from "@/assets/shared2.jpg";
import shared3 from "@/assets/shared3.jpg";

export type Accommodation = {
  id: number;
  title: string;
  type: string;
  city: string;
  price: number;
  distance: string;
  image: string;
  features: string[];
  available: boolean;
};

export const accommodations: Accommodation[] = [
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

