import { createContext, useContext, useState, ReactNode } from "react";
import type { Accommodation } from "@/data/accommodations";

export type BookingInfo = {
  bookingId: string;
  bookingCode?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentDate: Date;
};

type BookingContextType = {
  selectedRoom: Accommodation | null;
  setSelectedRoom: (room: Accommodation | null) => void;
  bookingDates: {
    checkIn: Date | null;
    checkOut: Date | null;
  };
  setBookingDates: (dates: { checkIn: Date | null; checkOut: Date | null }) => void;
  bookingInfo: BookingInfo | null;
  setBookingInfo: (info: BookingInfo | null) => void;
  clearBooking: () => void;
};

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedRoom, setSelectedRoom] = useState<Accommodation | null>(null);
  const [bookingDates, setBookingDates] = useState<{
    checkIn: Date | null;
    checkOut: Date | null;
  }>({
    checkIn: null,
    checkOut: null,
  });
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  const clearBooking = () => {
    setSelectedRoom(null);
    setBookingDates({ checkIn: null, checkOut: null });
    setBookingInfo(null);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedRoom,
        setSelectedRoom,
        bookingDates,
        setBookingDates,
        bookingInfo,
        setBookingInfo,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}

