import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Printer, 
  Download, 
  MapPin, 
  CalendarIcon, 
  Euro, 
  Bed, 
  Mail, 
  Phone,
  User,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBooking } from "@/contexts/BookingContext";
import { useI18n } from "@/i18n";
import BookingReceipt from "@/components/BookingReceipt";
import logo from "@/assets/logo1212.png";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedRoom, bookingDates, bookingInfo, clearBooking } = useBooking();
  const { t } = useI18n();
  const printRef = useRef<HTMLDivElement>(null);

  // Generate booking ID if not exists
  useEffect(() => {
    // Generate booking info from URL params if not already set
    if (!bookingInfo && selectedRoom && bookingDates.checkIn && bookingDates.checkOut) {
      const paymentIntentId = searchParams.get("payment_intent");
      if (paymentIntentId) {
        // Booking info should already be set from Checkout, but if not, we can generate it
        // This is a fallback
      }
    }
  }, [bookingInfo, selectedRoom, bookingDates, searchParams]);

  const calculateNights = () => {
    if (!bookingDates.checkIn || !bookingDates.checkOut) return 0;
    const diffTime = bookingDates.checkOut.getTime() - bookingDates.checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    const nights = calculateNights();
    if (nights === 0) return selectedRoom.price;
    const dailyPrice = selectedRoom.price / 30;
    return Math.round(dailyPrice * nights);
  };

  const handlePrint = () => {
    if (printRef.current && selectedRoom) {
      const currentBookingId = bookingInfo?.bookingId || `BK-${Date.now().toString(36).toUpperCase()}`;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Clone the content and remove no-print elements
        const content = printRef.current.cloneNode(true) as HTMLElement;
        const noPrintElements = content.querySelectorAll('.no-print, button, .no-print-button, .animate-ping, .relative > .absolute, .no-print-price');
        noPrintElements.forEach(el => el.remove());
        
        // Remove animation classes
        content.querySelectorAll('[class*="animate"]').forEach(el => {
          el.classList.remove('animate-ping', 'animate-spin');
        });
        
        // Convert all images to absolute URLs if they're relative
        const images = content.querySelectorAll('img');
        images.forEach(img => {
          if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
            const src = img.getAttribute('src') || '';
            if (src.startsWith('/')) {
              img.src = window.location.origin + src;
            } else if (!src.startsWith('http')) {
              img.src = window.location.origin + '/' + src;
            }
          }
        });
        
        // Watermark is now included in BookingReceipt component
        // Update watermark logo URL in the component if needed
        const logoUrl = (() => {
          const headerLogo = document.querySelector('header img[alt*="logo"], header img[alt*="Logo"], header img') as HTMLImageElement;
          if (headerLogo && headerLogo.src) {
            return headerLogo.src;
          }
          if (typeof logo === 'string') {
            if (logo.startsWith('http') || logo.startsWith('data:')) {
              return logo;
            } else if (logo.startsWith('/')) {
              return window.location.origin + logo;
            }
          }
          return window.location.origin + '/src/assets/logo1212.png';
        })();
        
        const watermarkDiv = content.querySelector('.watermark-logo-print');
        if (watermarkDiv) {
          const watermarkImg = watermarkDiv.querySelector('img');
          if (watermarkImg) {
            (watermarkImg as HTMLImageElement).src = logoUrl;
          }
        }
        
        // Ensure grid classes work in print
        content.querySelectorAll('[class*="grid"]').forEach(el => {
          el.classList.add('grid');
          if (el.classList.contains('md:grid-cols-2') || el.classList.contains('grid-cols-2')) {
            el.classList.add('grid-cols-2');
          }
        });

        // Get computed styles from the actual page to match exactly
        const computedStyles = window.getComputedStyle(document.documentElement);
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${t("booking_receipt")} - ${currentBookingId}</title>
              <meta charset="utf-8">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                :root {
                  --background: 0 0% 100%;
                  --foreground: 24 35% 20%;
                  --card: 0 0% 100%;
                  --card-foreground: 215 25% 27%;
                  --muted: 24 30% 97%;
                  --muted-foreground: 24 15% 40%;
                  --primary: 24 90% 54%;
                  --primary-foreground: 0 0% 100%;
                  --border: 24 20% 88%;
                  --radius: 0.75rem;
                }
                
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Inter', sans-serif;
                  padding: 20px;
                  color: hsl(var(--foreground));
                  background: hsl(var(--background));
                  line-height: 1.6;
                  font-size: 14px;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
                }
                
                .print-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: white;
                }
                
                /* Typography */
                h1, h2, h3, h4, h5, h6 {
                  font-weight: 600;
                  line-height: 1.2;
                  margin-bottom: 0.5rem;
                  color: hsl(var(--foreground));
                }
                
                h2 { font-size: 1.5rem; }
                h3 { font-size: 1.25rem; }
                h4 { font-size: 1.125rem; }
                h5 { font-size: 1rem; }
                
                p {
                  margin-bottom: 0.5rem;
                  line-height: 1.6;
                }
                
                /* Text sizes */
                .text-xs { font-size: 0.75rem; line-height: 1rem; }
                .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                .text-base { font-size: 1rem; line-height: 1.5rem; }
                .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
                .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
                .text-2xl { font-size: 1.5rem; line-height: 2rem; }
                
                /* Font weights */
                .font-medium { font-weight: 500; }
                .font-semibold { font-weight: 600; }
                .font-bold { font-weight: 700; }
                .font-mono {
                  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                }
                
                /* Colors */
                .text-muted-foreground { color: hsl(var(--muted-foreground)); }
                .text-primary { color: hsl(var(--primary)); }
                .text-green-500 { color: rgb(34, 197, 94); }
                .text-green-600 { color: rgb(22, 163, 74); }
                .text-red-600 { color: rgb(220, 38, 38); }
                
                /* Layout */
                .flex { display: flex; }
                .flex-col { flex-direction: column; }
                .flex-row { flex-direction: row; }
                .flex-wrap { flex-wrap: wrap; }
                .flex-1 { flex: 1 1 0%; }
                .flex-shrink-0 { flex-shrink: 0; }
                .items-center { align-items: center; }
                .items-start { align-items: flex-start; }
                .justify-between { justify-content: space-between; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                
                /* Spacing */
                .gap-2 { gap: 0.5rem; }
                .gap-4 { gap: 1rem; }
                .gap-6 { gap: 1.5rem; }
                .space-y-1 > * + * { margin-top: 0.25rem; }
                .space-y-2 > * + * { margin-top: 0.5rem; }
                .space-y-4 > * + * { margin-top: 1rem; }
                .space-y-6 > * + * { margin-top: 1.5rem; }
                
                .mb-1 { margin-bottom: 0.25rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-3 { margin-bottom: 0.75rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mt-1 { margin-top: 0.25rem; }
                .mt-2 { margin-top: 0.5rem; }
                .mt-3 { margin-top: 0.75rem; }
                .mt-4 { margin-top: 1rem; }
                .pt-3 { padding-top: 0.75rem; }
                .pt-4 { padding-top: 1rem; }
                .pb-4 { padding-bottom: 1rem; }
                .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                .px-4 { padding-left: 1rem; padding-right: 1rem; }
                .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                .p-4 { padding: 1rem; }
                
                /* Grid */
                .grid { display: grid; }
                .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                
                /* Borders */
                .border { border: 1px solid hsl(var(--border)); }
                .border-t { border-top: 1px solid hsl(var(--border)); }
                .border-b { border-bottom: 1px solid hsl(var(--border)); }
                .rounded { border-radius: 0.25rem; }
                .rounded-lg { border-radius: 0.5rem; }
                
                /* Backgrounds */
                .bg-muted { background-color: hsl(var(--muted)); }
                .bg-yellow-50 { background-color: #fefce8; }
                .bg-green-50 { background-color: #f0fdf4; }
                
                /* Width/Height */
                .w-full { width: 100%; }
                .w-32 { width: 8rem; }
                .h-32 { height: 8rem; }
                .h-4 { height: 1rem; }
                .w-4 { width: 1rem; }
                
                /* Object fit */
                .object-cover { object-fit: cover; }
                
                /* Images */
                img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                  border-radius: 0.5rem;
                }
                
                /* Icons */
                svg {
                  display: inline-block;
                  width: 1rem;
                  height: 1rem;
                  vertical-align: middle;
                  flex-shrink: 0;
                }
                
                /* Container */
                .container {
                  width: 100%;
                  max-width: 56rem;
                  margin-left: auto;
                  margin-right: auto;
                }
                
                .max-w-4xl {
                  max-width: 56rem;
                }
                
                .mx-auto {
                  margin-left: auto;
                  margin-right: auto;
                }
                
                /* Card styles */
                .card {
                  border: 1px solid hsl(var(--border));
                  border-radius: calc(var(--radius) - 2px);
                  background-color: hsl(var(--card));
                  color: hsl(var(--card-foreground));
                  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                
                .card-header {
                  padding: 1.5rem;
                  border-bottom: 1px solid hsl(var(--border));
                }
                
                .card-content {
                  padding: 1.5rem;
                }
                
                .card-title {
                  font-size: 1.5rem;
                  font-weight: 600;
                  line-height: 1.2;
                }
                
                .card-description {
                  font-size: 0.875rem;
                  color: hsl(var(--muted-foreground));
                  margin-top: 0.5rem;
                }
                
                /* Responsive */
                @media (min-width: 640px) {
                  .sm\\:flex-row { flex-direction: row; }
                  .sm\\:items-center { align-items: center; }
                  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                }
                
                /* Print specific */
                @media print {
                  @page {
                    size: A4;
                    margin: 1cm;
                  }
                  
                  body {
                    padding: 0;
                    font-size: 10pt;
                    background: white !important;
                    color: black !important;
                    position: relative;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  
                  /* Fixed Watermark - Consistent across all browsers */
                  .watermark-logo-print {
                    display: block !important;
                    visibility: visible !important;
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) rotate(-45deg) !important;
                    width: 500px !important;
                    height: 500px !important;
                    z-index: 0 !important;
                    pointer-events: none !important;
                    opacity: 0.15 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    page-break-inside: avoid !important;
                    page-break-after: avoid !important;
                    page-break-before: avoid !important;
                  }
                  
                  .watermark-logo-print img {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: contain !important;
                    display: block !important;
                    visibility: visible !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                  
                  /* Legacy support for old watermark class */
                  .watermark-logo {
                    display: none !important;
                  }
                  
                  body::before {
                    display: none !important;
                  }
                  
                  /* Force watermark to print */
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                }
                  
                  .print-container {
                    max-width: 100%;
                    margin: 0;
                    position: relative;
                    z-index: 1;
                  }
                  
                  .no-print-price {
                    display: none !important;
                  }
                  
                  .print-booking-code {
                    display: block !important;
                    visibility: visible !important;
                    font-size: 0.9rem !important;
                    margin-bottom: 0.5rem !important;
                  }
                  
                  .print-booking-code strong {
                    font-weight: 600 !important;
                  }
                  
                  .print-booking-code .font-mono {
                    font-size: 1rem !important;
                    font-weight: 700 !important;
                    color: hsl(var(--foreground)) !important;
                  }
                  
                  /* Reduce spacing for compact layout */
                  .space-y-6 > * + * {
                    margin-top: 0.75rem !important;
                  }
                  
                  .space-y-4 > * + * {
                    margin-top: 0.5rem !important;
                  }
                  
                  .space-y-2 > * + * {
                    margin-top: 0.25rem !important;
                  }
                  
                  .mb-4 {
                    margin-bottom: 0.5rem !important;
                  }
                  
                  .mb-3 {
                    margin-bottom: 0.4rem !important;
                  }
                  
                  .mb-2 {
                    margin-bottom: 0.3rem !important;
                  }
                  
                  .mt-4 {
                    margin-top: 0.5rem !important;
                  }
                  
                  .mt-3 {
                    margin-top: 0.4rem !important;
                  }
                  
                  .pt-4 {
                    padding-top: 0.5rem !important;
                  }
                  
                  .pb-4 {
                    padding-bottom: 0.5rem !important;
                  }
                  
                  .p-4 {
                    padding: 0.75rem !important;
                  }
                  
                  /* Reduce font sizes slightly */
                  .text-sm {
                    font-size: 0.8rem !important;
                    line-height: 1.3 !important;
                  }
                  
                  .text-xs {
                    font-size: 0.7rem !important;
                    line-height: 1.2 !important;
                  }
                  
                  h4 {
                    font-size: 1rem !important;
                    margin-bottom: 0.4rem !important;
                  }
                  
                  h5 {
                    font-size: 0.9rem !important;
                    margin-bottom: 0.3rem !important;
                  }
                  
                  /* Compact card styles */
                  .card {
                    page-break-inside: avoid;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                    border: 1px solid #e5e7eb !important;
                    background: white !important;
                    position: relative;
                    z-index: 1;
                    margin-bottom: 0.75rem !important;
                  }
                  
                  /* Reduce image size */
                  .w-32 {
                    width: 6rem !important;
                  }
                  
                  .h-32 {
                    height: 6rem !important;
                  }
                  
                  /* Compact grid */
                  .gap-4 {
                    gap: 0.75rem !important;
                  }
                  
                  h1, h2, h3, h4 {
                    page-break-after: avoid;
                    page-break-inside: avoid;
                  }
                  
                  img {
                    page-break-inside: avoid;
                    max-width: 100%;
                    height: auto;
                  }
                  
                  .border {
                    border-color: #e5e7eb !important;
                  }
                  
                  .bg-yellow-50 {
                    background-color: #fefce8 !important;
                    border: 1px solid #eab308 !important;
                  }
                  
                  .bg-green-50 {
                    background-color: #f0fdf4 !important;
                    border: 1px solid #22c55e !important;
                  }
                  
                  /* Prevent page breaks */
                  .border-b {
                    padding-bottom: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                  }
                  
                  .border-t {
                    padding-top: 0.5rem !important;
                    margin-top: 0.5rem !important;
                  }
                  
                  /* Contact Information in Print */
                  a {
                    color: hsl(var(--primary)) !important;
                    text-decoration: underline !important;
                  }
                  
                  a[href^="mailto:"],
                  a[href^="http"] {
                    color: hsl(var(--primary)) !important;
                    word-break: break-all !important;
                  }
                }
              </style>
            </head>
            <body style="-webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; position: relative;">
              <div class="watermark-logo" style="position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) rotate(-45deg) !important; width: 500px !important; height: 500px !important; z-index: 0 !important; pointer-events: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; display: block !important; visibility: visible !important; opacity: 1 !important;">
                <img src="${logoUrl}" alt="Watermark" style="width: 100% !important; height: 100% !important; object-fit: contain !important; opacity: 0.15 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; display: block !important; visibility: visible !important;" onload="console.log('Watermark image loaded');" onerror="console.error('Watermark image failed to load:', this.src);" />
              </div>
              <div class="print-container" style="position: relative; z-index: 1; background: white;">
                ${content.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  const handleDownloadPDF = () => {
    // This would typically generate a PDF on the backend
    // For now, we'll trigger print which can save as PDF
    handlePrint();
  };

  if (!selectedRoom || !bookingDates.checkIn || !bookingDates.checkOut) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("no_booking_found")}</h1>
          <Button onClick={() => navigate("/")}>{t("back_to_home")}</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const bookingId = bookingInfo?.bookingId || `BK-${Date.now().toString(36).toUpperCase()}`;
  const totalAmount = bookingInfo?.totalAmount || calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8 pt-20 sm:pt-8">
          <div className="flex justify-center mb-4">
            <div className="relative inline-block">
              <CheckCircle2 className="h-16 w-16 sm:h-20 sm:w-20 text-green-500 relative z-10" />
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping -z-0" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("payment_success")}</h1>
          <p className="text-base sm:text-lg text-muted-foreground">{t("booking_confirmed")}</p>
        </div>

        {/* Booking Receipt */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{t("booking_receipt")}</CardTitle>
                <CardDescription className="mt-2">
                  <span className="text-sm font-medium">{t("booking_code")}: </span>
                  <span className="font-mono font-semibold">{bookingInfo?.bookingCode || bookingId}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("booking_code_description")}
                  </p>
                </CardDescription>
              </div>
              <div className="flex gap-2 no-print">
                <Button variant="outline" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" />
                  {t("print")}
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t("download_pdf")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={printRef}>
                <BookingReceipt
                  bookingCode={bookingInfo?.bookingCode || bookingId}
                  totalAmount={totalAmount}
                  nights={calculateNights()}
                  roomTitle={selectedRoom.title}
                  roomCity={selectedRoom.city}
                  roomType={selectedRoom.type}
                  roomImage={selectedRoom.image}
                  roomFeatures={selectedRoom.features}
                  checkIn={bookingDates.checkIn!}
                  checkOut={bookingDates.checkOut!}
                  customerName={bookingInfo?.customerName || ""}
                  customerEmail={bookingInfo?.customerEmail}
                  customerPhone={bookingInfo?.customerPhone}
                  paymentStatus="succeeded"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center no-print">
            <Button 
              onClick={() => navigate("/")} 
              className="gradient-accent text-accent-foreground"
              size="lg"
            >
              {t("back_to_home")}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/room/" + selectedRoom.id)}
              size="lg"
            >
              {t("view_room_details")}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingSuccess;
