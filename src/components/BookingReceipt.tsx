import { MapPin, Bed, CalendarIcon, Euro } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface BookingReceiptProps {
  bookingCode: string; // Required - this is the main identifier
  totalAmount: number;
  nights: number;
  roomTitle: string;
  roomCity: string;
  roomType: string;
  roomImage?: string;
  roomFeatures?: string[];
  checkIn: Date | string;
  checkOut: Date | string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentStatus?: string;
}

const BookingReceipt = ({
  bookingCode,
  totalAmount,
  nights,
  roomTitle,
  roomCity,
  roomType,
  roomImage,
  roomFeatures = [],
  checkIn,
  checkOut,
  customerName,
  customerEmail,
  customerPhone,
  paymentStatus = "succeeded",
}: BookingReceiptProps) => {
  const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground print-booking-code">
              <strong>Confirmation number:</strong> <span className="font-mono font-semibold text-base">{bookingCode}</span>
            </p>
          </div>
          <div className="text-right no-print-price">
            <div className="text-sm text-muted-foreground mb-1">PRICE</div>
            <div className="text-2xl font-bold text-primary">
              {totalAmount}€
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              for {nights} {nights === 1 ? 'night' : 'nights'}
            </div>
          </div>
        </div>
      </div>

      {/* Room Details Section */}
      <div className="border rounded-lg p-4">
        <div className="flex gap-4">
          {roomImage && (
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src={roomImage}
                alt={roomTitle}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{roomTitle}</h3>
            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{roomCity}, España</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4" />
                <span>{roomType}</span>
              </div>
            </div>
            
            {/* Check-in/Check-out with times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">CHECK-IN</p>
                <p className="font-semibold text-sm">
                  {format(checkInDate, "d MMMM")}, from 14:00 - 23:00
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">CHECK-OUT</p>
                <p className="font-semibold text-sm">
                  {format(checkOutDate, "d MMMM")}, from 00:00 - 11:00
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-semibold mb-2">
            1 {roomType}:
          </p>
          <p className="text-sm">
            <strong>Guest name:</strong> {customerName}, for max. 1 person.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Meal Plan: There is no meal included in the rate for this dormitory Studio Room.
          </p>
        </div>

        {/* Amenities */}
        {roomFeatures && roomFeatures.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-semibold mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {roomFeatures.map((feature, index) => (
                <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Policy */}
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Cancellation policy</h4>
        <div className="space-y-2 text-sm">
          <p>
            Free cancellation until 3 days before arrival.
          </p>
          <p>
            If cancelled within 3 days before arrival, the cancellation fee will be the total price of the reservation.
          </p>
          <p>
            No-show fee: the total price of the reservation.
          </p>
        </div>
        <div className="mt-4">
          <h5 className="font-semibold text-sm mb-2">Refund schedule:</h5>
          <p className="text-sm">
            Full refund with administrative fees deducted if cancelled before {format(new Date(checkInDate.getTime() - 3 * 24 * 60 * 60 * 1000), "d MMM yyyy")}.
          </p>
          <p className="text-sm text-muted-foreground">
            If cancelled on {format(checkInDate, "d MMM yyyy")}, you will no longer be eligible for a refund.
          </p>
        </div>
      </div>

      {/* Important Information */}
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-3">
          Important information
        </h4>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Damage Deposit:</strong> A damage deposit of EUR 10 is required on arrival, collected by credit card, and reimbursed on check-out after property inspection.
          </p>
        </div>
        
        <h4 className="font-semibold mt-4 mb-3">
          Hotel Policies
        </h4>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Guest parking:</strong> No parking available.
          </p>
          <p>
            <strong>WiFi:</strong> Available in all areas and is free of charge.
          </p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
        <h4 className="font-semibold mb-3">Payment Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="font-semibold">Visa Card</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Paid:</span>
            <span className="font-bold text-lg">{totalAmount}€</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This is the total amount charged, and the full amount of {totalAmount}€ was paid in advance.
          </p>
          <div className="flex justify-between mt-3 pt-3 border-t">
            <span className="text-muted-foreground">Payment Status:</span>
            <span className={`font-semibold ${
              paymentStatus === "succeeded" ? "text-green-600" : "text-red-600"
            }`}>
              {paymentStatus === "succeeded" ? "Paid in Full" : "Payment Failed"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        <p>This print version contains the most important information about the booking and can be used for check-in.</p>
      </div>

      {/* Contact Information */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t mt-4">
        <p className="mb-2">
          <strong>Contact Information:</strong>
        </p>
        <p className="mb-1">
          Email: <span className="text-muted-foreground">info@alojamiento-barcelona.com</span>
        </p>
        <p>
          Website: <span className="text-muted-foreground">www.alojamiento-barcelona.com</span>
        </p>
      </div>
    </div>
  );
};

export default BookingReceipt;

