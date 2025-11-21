import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Euro, CalendarIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBooking } from "@/contexts/BookingContext";
import { useI18n } from "@/i18n";
import { toast } from "@/hooks/use-toast";

// Initialize Stripe with publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error('ERROR: VITE_STRIPE_PUBLISHABLE_KEY environment variable is not set!');
}
console.log('Stripe Publishable Key:', stripePublishableKey ? `${stripePublishableKey.substring(0, 20)}...` : 'Not found');
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { selectedRoom, bookingDates, setBookingInfo } = useBooking();
  const { t } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentElementReady, setPaymentElementReady] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    // Give time for localStorage to load
    const timer = setTimeout(() => {
      if (!selectedRoom || !bookingDates.checkIn || !bookingDates.checkOut) {
        navigate("/");
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedRoom, bookingDates, navigate]);

  if (!selectedRoom || !bookingDates.checkIn || !bookingDates.checkOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const calculateNights = () => {
    const diffTime = bookingDates.checkOut!.getTime() - bookingDates.checkIn!.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const dailyPrice = selectedRoom.price / 30;
    return Math.round(dailyPrice * nights);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: t("error"),
        description: t("fill_all_fields"),
        variant: "destructive",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: t("error"),
        description: t("accept_terms_required"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get the client secret from the parent component (already created)
      // The PaymentIntent should already be created when the page loads
      // We just need to confirm the payment here
      
      // Note: The clientSecret is passed via Elements options
      // We need to get it from the elements instance
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // Confirm payment with Stripe
      // The clientSecret is already in the Elements context
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success`,
          payment_method_data: {
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        // Save failed booking attempt
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
          const failedBookingId = `BK-FAILED-${Date.now().toString(36).toUpperCase()}`;
          
          await fetch(`${backendUrl}/api/bookings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId: failedBookingId,
              roomId: selectedRoom.id,
              customerName: customerInfo.name,
              customerEmail: customerInfo.email,
              customerPhone: customerInfo.phone,
              checkIn: bookingDates.checkIn!.toISOString().split('T')[0],
              checkOut: bookingDates.checkOut!.toISOString().split('T')[0],
              totalAmount: calculateTotal(),
              paymentIntentId: error.payment_intent?.id || null,
              paymentStatus: 'failed',
            }),
          });
        } catch (saveError) {
          console.error('Error saving failed booking:', saveError);
        }

        toast({
          title: t("payment_failed"),
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Generate booking ID
        const bookingId = `BK-${paymentIntent.id.slice(-8).toUpperCase()}`;
        
        // Save booking info to context
        setBookingInfo({
          bookingId,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          totalAmount: calculateTotal(),
          paymentDate: new Date(),
        });

        // Save booking to database
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
          const bookingResponse = await fetch(`${backendUrl}/api/bookings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId,
              roomId: selectedRoom.id,
              customerName: customerInfo.name,
              customerEmail: customerInfo.email,
              customerPhone: customerInfo.phone,
              checkIn: bookingDates.checkIn!.toISOString().split('T')[0],
              checkOut: bookingDates.checkOut!.toISOString().split('T')[0],
              totalAmount: calculateTotal(),
              paymentIntentId: paymentIntent.id,
            }),
          });

          if (!bookingResponse.ok) {
            const errorData = await bookingResponse.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Failed to save booking to database:', errorData);
            toast({
              title: "Warning",
              description: "Payment succeeded but failed to save booking details. Please contact support.",
              variant: "destructive",
            });
          } else {
            const savedBooking = await bookingResponse.json();
            console.log('Booking saved successfully:', savedBooking);
            
            // Update booking info with booking_code from server
            setBookingInfo({
              bookingId,
              bookingCode: savedBooking.booking_code,
              customerName: customerInfo.name,
              customerEmail: customerInfo.email,
              customerPhone: customerInfo.phone,
              totalAmount: calculateTotal(),
              paymentDate: new Date(),
            });
          }
        } catch (error: any) {
          console.error('Error saving booking:', error);
          toast({
            title: "Warning",
            description: "Payment succeeded but failed to save booking details. Please contact support.",
            variant: "destructive",
          });
          // Don't block navigation if booking save fails
        }

        toast({
          title: t("payment_success"),
          description: t("booking_confirmed"),
        });
        
        navigate(`/booking-success?payment_intent=${paymentIntent.id}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: t("error"),
        description: t("payment_error"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("customer_info")}</CardTitle>
          <CardDescription>{t("enter_your_details")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("full_name")}</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("payment_info")}</CardTitle>
          <CardDescription>{t("secure_payment")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!stripe || !elements ? (
            <div className="py-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Loading payment form...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative border-2 border-orange-200 rounded-2xl p-6 md:p-8 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 shadow-lg min-h-[280px] transition-all duration-300 hover:shadow-xl hover:border-orange-300 overflow-hidden">
                <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 z-10 flex items-center gap-1 md:gap-1.5 text-[9px] sm:text-[10px] md:text-xs text-orange-700 bg-orange-100/95 backdrop-blur-sm px-2 md:px-2.5 py-0.5 md:py-1 rounded-full font-semibold shadow-md border border-orange-200/60 whitespace-nowrap">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="leading-tight">Secure Payment</span>
                </div>
                <PaymentElement 
                  onReady={() => {
                    console.log('PaymentElement is ready');
                    setPaymentElementReady(true);
                  }}
                  onLoadError={(error) => {
                    console.error('PaymentElement load error:', error);
                    toast({
                      title: t("error"),
                      description: error.message || "Failed to load payment methods. Please check your Stripe configuration.",
                      variant: "destructive",
                    });
                  }}
                  options={{
                    layout: "tabs",
                    fields: {
                      billingDetails: {
                        email: 'never',
                        phone: 'never',
                      },
                    },
                    wallets: {
                      applePay: 'auto',
                      googlePay: 'auto',
                    },
                  }}
                />
              </div>
              {!paymentElementReady && (
                <p className="text-xs text-muted-foreground text-center">
                  Loading payment methods...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              className="mt-1"
            />
            <div className="space-y-1 flex-1">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <span>{t("accept_terms_prefix")} </span>
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("terms_and_conditions")}
                </Link>
                <span> {t("and")} </span>
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("privacy_policy")}
                </Link>
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("terms_description")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing || !acceptedTerms}
        className="w-full gradient-accent text-accent-foreground font-semibold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("processing")}
          </>
        ) : (
          `${t("pay_now")} ${calculateTotal()}€`
        )}
      </Button>
    </form>
  );
};

const Checkout = () => {
  const { selectedRoom, bookingDates } = useBooking();
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    // Give time for localStorage to load
    const timer = setTimeout(() => {
      if (!selectedRoom || !bookingDates.checkIn || !bookingDates.checkOut) {
        navigate("/");
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedRoom, bookingDates, navigate]);

  if (!selectedRoom || !bookingDates.checkIn || !bookingDates.checkOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const calculateNights = () => {
    const diffTime = bookingDates.checkOut!.getTime() - bookingDates.checkIn!.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const dailyPrice = selectedRoom.price / 30;
    return Math.round(dailyPrice * nights);
  };

  // Create payment intent - This should be done on your backend
  // For now, we'll create a client secret from the frontend (not recommended for production)
  // In production, create an API endpoint that creates a PaymentIntent and returns the client_secret
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(true);

  useEffect(() => {
    // Create PaymentIntent from backend
    const createPaymentIntent = async () => {
      try {
        const total = calculateTotal();
        
        // Backend endpoint for creating PaymentIntent
        // Use same origin if VITE_BACKEND_URL is not set (for production)
        const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
        const backendUrl = `${backendBaseUrl}/api/create-payment-intent`;
        
        console.log('Creating payment intent with:', {
          backendUrl,
          amount: total * 100,
          roomId: selectedRoom.id,
        });
        
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total * 100, // Convert to cents
            currency: 'eur',
            roomId: selectedRoom.id,
            customerInfo: {
              name: '',
              email: '',
              phone: '',
            },
            bookingDates: {
              checkIn: bookingDates.checkIn!.toISOString(),
              checkOut: bookingDates.checkOut!.toISOString(),
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Payment intent created successfully:', {
            clientSecret: data.clientSecret ? `${data.clientSecret.substring(0, 20)}...` : 'missing',
            publishableKey: stripePublishableKey ? `${stripePublishableKey.substring(0, 20)}...` : 'missing',
            keyType: stripePublishableKey?.includes('live') ? 'LIVE' : stripePublishableKey?.includes('test') ? 'TEST' : 'UNKNOWN',
          });
          setClientSecret(data.clientSecret);
        } else {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || 'Unknown error' };
          }
          console.error('Failed to create payment intent:', response.status, errorData);
          console.error('Response text:', errorText);
          toast({
            title: t("error"),
            description: errorData.error || errorData.message || t("payment_intent_failed"),
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        console.error('Error details:', error.message);
      } finally {
        setLoadingSecret(false);
      }
    };

    if (selectedRoom && bookingDates.checkIn && bookingDates.checkOut) {
      createPaymentIntent();
    }
  }, [selectedRoom, bookingDates]);

  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: "#f97316",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorDanger: "#ef4444",
            colorSuccess: "#22c55e",
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSizeBase: "16px",
            spacingUnit: "4px",
            borderRadius: "12px",
            colorTextSecondary: "#6b7280",
            colorTextPlaceholder: "#9ca3af",
          },
          rules: {
            ".Input": {
              borderColor: "#e5e7eb",
              borderWidth: "1.5px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              transition: "all 0.2s ease",
            },
            ".Input:focus": {
              borderColor: "#f97316",
              boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            },
            ".Input:hover": {
              borderColor: "#f97316",
            },
            ".Tab": {
              borderRadius: "10px",
              padding: "14px 20px",
              fontWeight: "500",
              borderWidth: "2px",
              transition: "all 0.2s ease",
            },
            ".Tab:hover": {
              backgroundColor: "#fff7ed",
            },
            ".Tab--selected": {
              backgroundColor: "#fff7ed",
              borderColor: "#f97316",
              color: "#f97316",
              boxShadow: "0 2px 4px 0 rgba(249, 115, 22, 0.1)",
            },
            ".Label": {
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "8px",
            },
            ".Error": {
              color: "#ef4444",
              fontSize: "13px",
            },
          },
        },
        locale: 'en' as const,
        loader: 'auto' as const,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          ← {t("back")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {loadingSecret ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>{t("loading")}</p>
                </CardContent>
              </Card>
            ) : options && clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm clientSecret={clientSecret} />
              </Elements>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t("stripe_setup_required")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("stripe_setup_instructions")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Backend URL: {import.meta.env.VITE_BACKEND_URL || window.location.origin}
                      <br />
                      Client Secret: {clientSecret ? 'Present' : 'Missing'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{t("order_summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Room Info */}
                <div className="space-y-2">
                  <img
                    src={selectedRoom.image}
                    alt={selectedRoom.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <h3 className="font-semibold">{selectedRoom.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    <span>{selectedRoom.distance}</span>
                  </div>
                </div>

                <Separator />

                {/* Booking Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon size={16} />
                    <span className="font-medium">{t("check_in")}:</span>
                    <span>{format(bookingDates.checkIn, "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon size={16} />
                    <span className="font-medium">{t("check_out")}:</span>
                    <span>{format(bookingDates.checkOut, "PPP")}</span>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("nights")}:</span>
                    <span>{calculateNights()} {t("nights")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t("price_per_night")}:</span>
                    <span>{Math.round(selectedRoom.price / 30)}€</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("total")}:</span>
                    <span className="flex items-center gap-1">
                      <Euro size={18} />
                      {calculateTotal()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;

