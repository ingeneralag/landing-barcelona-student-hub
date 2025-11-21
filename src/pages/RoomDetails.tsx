import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { MapPin, Bed, Euro, CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBooking } from "@/contexts/BookingContext";
import { useI18n } from "@/i18n";
import { toast } from "@/hooks/use-toast";
import { accommodations } from "@/data/accommodations";
import type { Accommodation } from "@/data/accommodations";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedRoom, setSelectedRoom, bookingDates, setBookingDates } = useBooking();
  const { t } = useI18n();
  const [room, setRoom] = useState<Accommodation | null>(selectedRoom || null);
  const [isLoading, setIsLoading] = useState(!selectedRoom);

  useEffect(() => {
    if (selectedRoom && selectedRoom.id === Number(id)) {
      setRoom(selectedRoom);
      setIsLoading(false);
    } else if (id) {
      fetchRoom();
    }
  }, [id, selectedRoom]);

  // Clear booking dates when navigating to a new room or on initial mount
  useEffect(() => {
    // Clear dates when room ID changes or when component first mounts
    if (id) {
      const currentRoomId = Number(id);
      if (selectedRoom && currentRoomId !== selectedRoom.id) {
        // Different room, clear dates
        setBookingDates({ checkIn: null, checkOut: null });
      } else if (!selectedRoom) {
        // No room selected yet, ensure dates are cleared
        setBookingDates({ checkIn: null, checkOut: null });
      }
    }
  }, [id]);

  const fetchRoom = async () => {
    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4242";
      const response = await fetch(`${backendUrl}/api/rooms/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRoom(data);
        setSelectedRoom(data);
      } else {
        // Fallback to static data
        const foundRoom = accommodations.find((a) => a.id === Number(id));
        if (foundRoom) {
          setRoom(foundRoom);
          setSelectedRoom(foundRoom);
        }
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      // Fallback to static data
      const foundRoom = accommodations.find((a) => a.id === Number(id));
      if (foundRoom) {
        setRoom(foundRoom);
        setSelectedRoom(foundRoom);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t("loading")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("room_not_found")}</h1>
          <Button onClick={() => navigate("/")}>{t("back_to_home")}</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleBookNow = () => {
    if (!bookingDates.checkIn || !bookingDates.checkOut) {
      toast({
        title: t("error"),
        description: t("select_dates_required"),
        variant: "destructive",
      });
      return;
    }
    
    const nights = calculateNights();
    if (nights < 30) {
      toast({
        title: t("error"),
        description: t("minimum_duration_error"),
        variant: "destructive",
      });
      return;
    }
    
    navigate("/checkout");
  };

  const calculateNights = () => {
    if (!bookingDates.checkIn || !bookingDates.checkOut) return 0;
    const diffTime = bookingDates.checkOut.getTime() - bookingDates.checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    if (nights === 0) return room.price;
    // Assuming monthly price, calculate daily price (approximate)
    const dailyPrice = room.price / 30;
    return Math.round(dailyPrice * nights);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          ← {t("back_to_home")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card>
              <CardContent className="p-0">
                <img
                  src={room.image}
                  alt={room.title}
                  className="w-full h-96 object-cover rounded-t-lg"
                />
              </CardContent>
            </Card>

            {/* Room Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{room.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{room.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed size={16} />
                    <span>{room.type}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{t("room_features")}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {room.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro size={20} />
                  {room.price}€/{t("month")}
                </CardTitle>
                <CardDescription>{t("select_dates")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Selection Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("quick_select")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkOut = new Date(today);
                        checkOut.setMonth(checkOut.getMonth() + 1);
                        setBookingDates({
                          checkIn: today,
                          checkOut,
                        });
                      }}
                      className="text-xs"
                    >
                      {t("one_month")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkOut = new Date(today);
                        checkOut.setMonth(checkOut.getMonth() + 2);
                        setBookingDates({
                          checkIn: today,
                          checkOut,
                        });
                      }}
                      className="text-xs"
                    >
                      {t("two_months")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkOut = new Date(today);
                        checkOut.setMonth(checkOut.getMonth() + 3);
                        setBookingDates({
                          checkIn: today,
                          checkOut,
                        });
                      }}
                      className="text-xs"
                    >
                      {t("three_months")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkOut = new Date(today);
                        checkOut.setMonth(checkOut.getMonth() + 6);
                        setBookingDates({
                          checkIn: today,
                          checkOut,
                        });
                      }}
                      className="text-xs"
                    >
                      {t("six_months")}
                    </Button>
                  </div>
                </div>

                {/* Date Selection - Separate Check-in and Check-out */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t("or_select_custom_dates")}</Label>
                  
                  {/* Check-in Date */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("check_in")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !bookingDates.checkIn && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bookingDates.checkIn ? (
                            format(bookingDates.checkIn, "PPP")
                          ) : (
                            <span>{t("select_check_in")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          key={`checkin-${bookingDates.checkIn?.getTime() || 'none'}-${room?.id || 'no-room'}`}
                          mode="single"
                          selected={(() => {
                            // Only return a date if checkIn is explicitly set and is a valid Date
                            if (!bookingDates.checkIn) return undefined;
                            
                            // Validate that it's actually a Date object
                            if (!(bookingDates.checkIn instanceof Date) || isNaN(bookingDates.checkIn.getTime())) {
                              return undefined;
                            }
                            
                            // Create a completely new date object with only date components
                            const d = bookingDates.checkIn;
                            const newDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                            newDate.setHours(0, 0, 0, 0);
                            return newDate;
                          })()}
                          onSelect={(date) => {
                            if (date) {
                              // Create a completely new date object with only date components (no time)
                              const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                              normalizedDate.setHours(0, 0, 0, 0);
                              
                              // If check-out exists and is before or equal to the new check-in, clear it
                              setBookingDates((prev) => {
                                let checkOut = prev.checkOut;
                                if (checkOut) {
                                  const checkOutDate = new Date(checkOut);
                                  checkOutDate.setHours(0, 0, 0, 0);
                                  if (checkOutDate <= normalizedDate) {
                                    checkOut = null;
                                  }
                                }
                                
                                return {
                                  checkIn: normalizedDate,
                                  checkOut: checkOut || prev.checkOut,
                                };
                              });
                            } else {
                              // If date is null, clear check-in
                              setBookingDates((prev) => ({
                                ...prev,
                                checkIn: null,
                              }));
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const checkDate = new Date(date);
                            checkDate.setHours(0, 0, 0, 0);
                            return checkDate < today;
                          }}
                          initialFocus
                          defaultMonth={bookingDates.checkIn || new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Check-out Date */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("check_out")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !bookingDates.checkOut && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bookingDates.checkOut ? (
                            format(bookingDates.checkOut, "PPP")
                          ) : (
                            <span>{t("select_check_out")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          key={`checkout-${bookingDates.checkOut?.getTime() || 'none'}`}
                          mode="single"
                          selected={(() => {
                            if (!bookingDates.checkOut) return undefined;
                            // Create a completely new date object with only date components
                            const d = bookingDates.checkOut;
                            const newDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                            newDate.setHours(0, 0, 0, 0);
                            return newDate;
                          })()}
                          onSelect={(date) => {
                            if (date) {
                              // Create a completely new date object with only date components (no time)
                              const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                              normalizedDate.setHours(0, 0, 0, 0);
                              
                              // Use functional update to get current state
                              setBookingDates((prev) => {
                                const checkIn = prev.checkIn;
                                
                                // Validate minimum duration
                                if (checkIn) {
                                  const normalizedCheckIn = new Date(checkIn);
                                  normalizedCheckIn.setHours(0, 0, 0, 0);
                                  
                                  const diffTime = normalizedDate.getTime() - normalizedCheckIn.getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  
                                  // If less than 30 days, set to 30 days from check-in
                                  if (diffDays < 30) {
                                    const minCheckOut = new Date(normalizedCheckIn);
                                    minCheckOut.setDate(minCheckOut.getDate() + 30);
                                    minCheckOut.setHours(0, 0, 0, 0);
                                    toast({
                                      title: t("minimum_duration_warning"),
                                      description: t("check_out_adjusted"),
                                      variant: "default",
                                    });
                                    return {
                                      ...prev,
                                      checkOut: minCheckOut,
                                    };
                                  }
                                }
                                
                                return {
                                  ...prev,
                                  checkOut: normalizedDate,
                                };
                              });
                            } else {
                              // If date is null, clear check-out
                              setBookingDates((prev) => ({
                                ...prev,
                                checkOut: null,
                              }));
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const checkDate = new Date(date);
                            checkDate.setHours(0, 0, 0, 0);
                            
                            // Disable dates before today
                            if (checkDate < today) return true;
                            
                            // Disable dates before or equal to check-in + 30 days minimum
                            if (bookingDates.checkIn) {
                              const normalizedCheckIn = new Date(bookingDates.checkIn);
                              normalizedCheckIn.setHours(0, 0, 0, 0);
                              
                              // Calculate minimum check-out date (30 days from check-in)
                              const minCheckOut = new Date(normalizedCheckIn);
                              minCheckOut.setDate(minCheckOut.getDate() + 30);
                              
                              // Disable dates before or equal to check-in
                              if (checkDate <= normalizedCheckIn) {
                                return true;
                              }
                              
                              // Disable dates within the first 30 days (minimum duration)
                              if (checkDate < minCheckOut) {
                                return true;
                              }
                            }
                            
                            return false;
                          }}
                          modifiers={{
                            minimum_duration: bookingDates.checkIn ? (() => {
                              const checkIn = new Date(bookingDates.checkIn);
                              checkIn.setHours(0, 0, 0, 0);
                              
                              const dates: Date[] = [];
                              for (let i = 1; i < 30; i++) {
                                const date = new Date(checkIn);
                                date.setDate(date.getDate() + i);
                                date.setHours(0, 0, 0, 0);
                                dates.push(date);
                              }
                              return dates;
                            })() : [],
                          }}
                          modifiersClassNames={{
                            minimum_duration: "minimum-duration-day",
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Minimum duration warning */}
                  {bookingDates.checkIn && bookingDates.checkOut && calculateNights() < 30 && (
                    <p className="text-xs text-destructive">
                      {t("minimum_duration_warning")}
                    </p>
                  )}
                </div>

                {/* Price Summary */}
                {bookingDates.checkIn && bookingDates.checkOut && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("nights")}:</span>
                      <span>{calculateNights()} {t("nights")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("price_per_night")}:</span>
                      <span>{Math.round(room.price / 30)}€</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>{t("total")}:</span>
                      <span>{calculateTotal()}€</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBookNow}
                  disabled={!bookingDates.checkIn || !bookingDates.checkOut || !room.available}
                  className="w-full gradient-accent text-accent-foreground font-semibold"
                >
                  {t("btn_book_now")}
                </Button>

                {!room.available && (
                  <p className="text-sm text-destructive text-center">{t("room_unavailable")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RoomDetails;

