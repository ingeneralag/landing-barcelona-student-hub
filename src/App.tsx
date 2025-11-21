import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RoomDetails from "./pages/RoomDetails";
import Checkout from "./pages/Checkout";
import BookingSuccess from "./pages/BookingSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import TermsAndConditions from "./pages/TermsAndConditions";
import VerifyBooking from "./pages/VerifyBooking";
import { I18nProvider } from "./i18n";
import { BookingProvider } from "./contexts/BookingContext";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <BookingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/room/:id" element={<RoomDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/booking-success" element={<BookingSuccess />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/verify-booking" element={<VerifyBooking />} />
                <Route path="/admin" element={<AdminDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </BookingProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
