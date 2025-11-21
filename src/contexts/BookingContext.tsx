import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  // Load from localStorage on mount
  const [selectedRoom, setSelectedRoomState] = useState<Accommodation | null>(() => {
    try {
      const saved = localStorage.getItem("booking_selectedRoom");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [bookingDates, setBookingDatesState] = useState<{
    checkIn: Date | null;
    checkOut: Date | null;
  }>(() => {
    try {
      const saved = localStorage.getItem("booking_dates");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          checkIn: parsed.checkIn ? new Date(parsed.checkIn) : null,
          checkOut: parsed.checkOut ? new Date(parsed.checkOut) : null,
        };
      }
    } catch {}
    return { checkIn: null, checkOut: null };
  });

  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  // Save to localStorage when selectedRoom changes
  useEffect(() => {
    if (selectedRoom) {
      localStorage.setItem("booking_selectedRoom", JSON.stringify(selectedRoom));
    } else {
      localStorage.removeItem("booking_selectedRoom");
    }
  }, [selectedRoom]);

  // Save to localStorage when bookingDates changes
  useEffect(() => {
    if (bookingDates.checkIn || bookingDates.checkOut) {
      localStorage.setItem("booking_dates", JSON.stringify({
        checkIn: bookingDates.checkIn?.toISOString() || null,
        checkOut: bookingDates.checkOut?.toISOString() || null,
      }));
    } else {
      localStorage.removeItem("booking_dates");
    }
  }, [bookingDates]);

  const setSelectedRoom = (room: Accommodation | null) => {
    setSelectedRoomState(room);
  };

  const setBookingDates = (dates: { checkIn: Date | null; checkOut: Date | null }) => {
    setBookingDatesState(dates);
  };

  const clearBooking = () => {
    setSelectedRoomState(null);
    setBookingDatesState({ checkIn: null, checkOut: null });
    setBookingInfo(null);
    localStorage.removeItem("booking_selectedRoom");
    localStorage.removeItem("booking_dates");
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

