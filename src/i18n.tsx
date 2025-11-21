import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Locale = "es" | "en";

type Translations = Record<string, Record<Locale, string>>;

const translations: Translations = {
  // Header
  nav_home: { es: "Inicio", en: "Home" },
  nav_cities: { es: "Ciudades", en: "Cities" },
  nav_how: { es: "Cómo reservar", en: "How to book" },
  nav_pricing: { es: "Precios", en: "Prices" },
  nav_contact: { es: "Contacto", en: "Contact" },
  cta_book_now: { es: "Reservar ahora", en: "Book now" },

  // Hero
  hero_title: { es: "Residencias para estudiantes en España", en: "Student residences in Spain" },
  hero_subtitle: {
    es: "Barcelona · Madrid · Valencia — alojamiento seguro, económico y cerca de todo",
    en: "Barcelona · Madrid · Valencia — safe, affordable and close to everything",
  },
  hero_search: { es: "Buscar alojamiento", en: "Search housing" },
  hero_contact_email: { es: "Contactar por Email", en: "Contact by Email" },

  // Sections
  sec_how_title: { es: "Cómo reservar", en: "How to book" },
  sec_pricing_title: { es: "Precios y Paquetes", en: "Prices & Packages" },
  sec_pricing_sub: { es: "Opciones flexibles que se adaptan a tu presupuesto", en: "Flexible options for your budget" },
  sec_accommodations_title: { es: "Alojamientos Disponibles", en: "Available accommodations" },
  sec_accommodations_sub: {
    es: "Explora nuestras opciones de habitaciones en las mejores ubicaciones",
    en: "Explore our room options in the best locations",
  },
  sec_faq_title: { es: "Preguntas Frecuentes", en: "Frequently Asked Questions" },
  sec_testimonials_title: { es: "Lo que dicen nuestros estudiantes", en: "What our students say" },

  // Buttons / labels
  btn_check_availability: { es: "Consultar disponibilidad", en: "Check availability" },
  btn_contact_email: { es: "Contactar por Email", en: "Contact by Email" },
  btn_book_now: { es: "Reservar ahora", en: "Book now" },
  label_full: { es: "Completo", en: "Full" },

  // Room Details
  room_not_found: { es: "Habitación no encontrada", en: "Room not found" },
  back_to_home: { es: "Volver al inicio", en: "Back to home" },
  room_features: { es: "Características", en: "Features" },
  month: { es: "mes", en: "month" },
  select_dates: { es: "Selecciona las fechas", en: "Select dates" },
  select_dates_required: { es: "Por favor selecciona las fechas de entrada y salida", en: "Please select check-in and check-out dates" },
  select_check_in: { es: "Selecciona fecha de entrada", en: "Select check-in date" },
  select_check_out: { es: "Selecciona fecha de salida", en: "Select check-out date" },
  check_out_adjusted: { es: "La fecha de salida se ajustó automáticamente a 30 días desde la fecha de entrada", en: "Check-out date automatically adjusted to 30 days from check-in" },
  minimum_duration_warning: { es: "La duración mínima es de 30 días (1 mes)", en: "Minimum duration is 30 days (1 month)" },
  minimum_duration_error: { es: "La duración mínima de la reserva es de 30 días (1 mes)", en: "Minimum booking duration is 30 days (1 month)" },
  quick_select: { es: "Selección rápida", en: "Quick select" },
  or_select_custom_dates: { es: "O selecciona fechas personalizadas", en: "Or select custom dates" },
  one_month: { es: "1 mes", en: "1 month" },
  two_months: { es: "2 meses", en: "2 months" },
  three_months: { es: "3 meses", en: "3 months" },
  six_months: { es: "6 meses", en: "6 months" },
  check_in: { es: "Fecha de entrada", en: "Check-in" },
  check_out: { es: "Fecha de salida", en: "Check-out" },
  nights: { es: "noches", en: "nights" },
  price_per_night: { es: "Precio por noche", en: "Price per night" },
  total: { es: "Total", en: "Total" },
  room_unavailable: { es: "Esta habitación no está disponible", en: "This room is not available" },

  // Checkout
  back: { es: "Atrás", en: "Back" },
  customer_info: { es: "Información del cliente", en: "Customer information" },
  enter_your_details: { es: "Ingresa tus datos", en: "Enter your details" },
  full_name: { es: "Nombre completo", en: "Full name" },
  email: { es: "Correo electrónico", en: "Email" },
  phone: { es: "Teléfono", en: "Phone" },
  payment_info: { es: "Información de pago", en: "Payment information" },
  secure_payment: { es: "Pago seguro con Stripe", en: "Secure payment with Stripe" },
  processing: { es: "Procesando...", en: "Processing..." },
  pay_now: { es: "Pagar ahora", en: "Pay now" },
  order_summary: { es: "Resumen del pedido", en: "Order summary" },
  error: { es: "Error", en: "Error" },
  fill_all_fields: { es: "Por favor completa todos los campos", en: "Please fill all fields" },
  payment_failed: { es: "Pago fallido", en: "Payment failed" },
  payment_success: { es: "Pago exitoso", en: "Payment successful" },
  booking_confirmed: { es: "Tu reserva ha sido confirmada", en: "Your booking has been confirmed" },
  accept_terms: { es: "Acepto los términos y condiciones", en: "I accept the terms and conditions" },
  accept_terms_prefix: { es: "Acepto los", en: "I accept the" },
  accept_terms_required: { es: "Debes aceptar los términos y condiciones para continuar", en: "You must accept the terms and conditions to continue" },
  terms_description: { es: "Al continuar, aceptas nuestros términos de servicio y política de privacidad", en: "By continuing, you agree to our terms of service and privacy policy" },
  terms_and_conditions: { es: "Términos y Condiciones", en: "Terms and Conditions" },
  privacy_policy: { es: "Política de Privacidad", en: "Privacy Policy" },
  and: { es: "y", en: "and" },
  last_updated: { es: "Última actualización", en: "Last updated" },
  terms_section_1_title: { es: "1. Aceptación de los Términos", en: "1. Acceptance of Terms" },
  terms_section_1_content: {
    es: "Al acceder y utilizar este sitio web, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.",
    en: "By accessing and using this website, you agree to comply with these terms and conditions. If you do not agree with any part of these terms, you must not use our services.",
  },
  terms_section_2_title: { es: "2. Reservas y Pagos", en: "2. Bookings and Payments" },
  terms_section_2_content: {
    es: "Todas las reservas están sujetas a disponibilidad. Los pagos deben realizarse según las instrucciones proporcionadas. Los precios pueden variar y están sujetos a cambios sin previo aviso.",
    en: "All bookings are subject to availability. Payments must be made according to the provided instructions. Prices may vary and are subject to change without notice.",
  },
  terms_item_1: {
    es: "Las reservas deben confirmarse mediante pago completo o depósito según se indique",
    en: "Bookings must be confirmed by full payment or deposit as indicated",
  },
  terms_item_2: {
    es: "Los precios están en euros (€) y pueden incluir o no impuestos según se indique",
    en: "Prices are in euros (€) and may or may not include taxes as indicated",
  },
  terms_item_3: {
    es: "Las cancelaciones están sujetas a nuestra política de cancelación",
    en: "Cancellations are subject to our cancellation policy",
  },
  terms_item_4: {
    es: "No se aceptan reembolsos excepto según lo especificado en nuestra política",
    en: "Refunds are not accepted except as specified in our policy",
  },
  terms_item_5: {
    es: "No se realizará ningún reembolso sin una carta de rechazo de la embajada para aquellos que reserven desde fuera del país o para personas extranjeras",
    en: "No refund will be processed without an embassy rejection letter for those booking from outside the country or for foreign persons",
  },
  terms_section_3_title: { es: "3. Política de Cancelación", en: "3. Cancellation Policy" },
  terms_section_3_content: {
    es: "Las cancelaciones deben realizarse con al menos 7 días de antelación para recibir un reembolso parcial. Las cancelaciones realizadas con menos de 7 días de antelación no son elegibles para reembolso.",
    en: "Cancellations must be made at least 7 days in advance to receive a partial refund. Cancellations made with less than 7 days notice are not eligible for a refund.",
  },
  terms_section_4_title: { es: "4. Responsabilidades", en: "4. Responsibilities" },
  terms_section_4_content: {
    es: "El huésped es responsable de mantener la habitación en buen estado y de cumplir con las reglas del alojamiento. Cualquier daño causado será responsabilidad del huésped.",
    en: "The guest is responsible for maintaining the room in good condition and complying with the accommodation rules. Any damage caused will be the responsibility of the guest.",
  },
  privacy_policy_title: { es: "Política de Privacidad", en: "Privacy Policy" },
  privacy_policy_content: {
    es: "Respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política explica cómo recopilamos, usamos y protegemos tu información.",
    en: "We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use and protect your information.",
  },
  privacy_item_1: {
    es: "Recopilamos información que nos proporcionas directamente, como nombre, email y número de teléfono",
    en: "We collect information you provide directly to us, such as name, email and phone number",
  },
  privacy_item_2: {
    es: "Utilizamos tu información para procesar reservas y comunicarnos contigo",
    en: "We use your information to process bookings and communicate with you",
  },
  privacy_item_3: {
    es: "No compartimos tu información personal con terceros sin tu consentimiento",
    en: "We do not share your personal information with third parties without your consent",
  },
  privacy_item_4: {
    es: "Implementamos medidas de seguridad para proteger tus datos",
    en: "We implement security measures to protect your data",
  },
  contact_us_title: { es: "Contáctanos", en: "Contact Us" },
  contact_us_content: {
    es: "Si tienes preguntas sobre estos términos o nuestra política de privacidad, por favor contáctanos en info@alojamiento-barcelona.com",
    en: "If you have questions about these terms or our privacy policy, please contact us at info@alojamiento-barcelona.com",
  },
  booking_confirmed_message: {
    es: "Recibirás un correo electrónico con los detalles de tu reserva.",
    en: "You will receive an email with your booking details.",
  },
  payment_error: { es: "Ocurrió un error al procesar el pago", en: "An error occurred processing the payment" },
  payment_intent_failed: { es: "No se pudo crear la intención de pago. Por favor, inténtalo de nuevo.", en: "Failed to create payment intent. Please try again." },
  loading: { es: "Cargando...", en: "Loading..." },
  stripe_setup_required: { es: "Configuración de Stripe requerida", en: "Stripe setup required" },
  stripe_setup_instructions: {
    es: "Por favor, configura tu clave pública de Stripe en las variables de entorno (VITE_STRIPE_PUBLISHABLE_KEY) y crea un endpoint backend para crear PaymentIntents.",
    en: "Please set your Stripe publishable key in environment variables (VITE_STRIPE_PUBLISHABLE_KEY) and create a backend endpoint to create PaymentIntents.",
  },

  // Booking Success
  no_booking_found: { es: "No se encontró la reserva", en: "No booking found" },
  booking_receipt: { es: "Recibo de Reserva", en: "Booking Receipt" },
  booking_id: { es: "Número de Reserva", en: "Booking ID" },
  print: { es: "Imprimir", en: "Print" },
  download_pdf: { es: "Descargar PDF", en: "Download PDF" },
  student_accommodation_spain: { es: "Alojamiento para Estudiantes en España", en: "Student Accommodation in Spain" },
  booking_date: { es: "Fecha de Reserva", en: "Booking Date" },
  room_details: { es: "Detalles de la Habitación", en: "Room Details" },
  booking_information: { es: "Información de la Reserva", en: "Booking Information" },
  duration: { es: "Duración", en: "Duration" },
  customer_information: { es: "Información del Cliente", en: "Customer Information" },
  payment_summary: { es: "Resumen de Pago", en: "Payment Summary" },
  total_amount: { es: "Monto Total", en: "Total Amount" },
  payment_status: { es: "Estado del Pago", en: "Payment Status" },
  paid: { es: "Pagado", en: "Paid" },
  payment_date: { es: "Fecha de Pago", en: "Payment Date" },
  booking_code: { es: "Código de Reserva", en: "Booking Code" },
  booking_code_description: { es: "Guarda este código para verificar tu reserva más tarde", en: "Save this code to verify your booking later" },
  verify_booking: { es: "Verificar Reserva", en: "Verify Booking" },
  verify_booking_description: { es: "Ingresa tu código de reserva para ver los detalles de tu reserva", en: "Enter your booking code to view your booking details" },
  verify: { es: "Verificar", en: "Verify" },
  verifying: { es: "Verificando...", en: "Verifying..." },
  booking_found: { es: "Reserva Encontrada", en: "Booking Found" },
  booking_verified_successfully: { es: "Tu reserva ha sido verificada exitosamente", en: "Your booking has been verified successfully" },
  not_available: { es: "No disponible", en: "Not available" },
  room_title: { es: "Título de la Habitación", en: "Room Title" },
  room_type: { es: "Tipo de Habitación", en: "Room Type" },
  name: { es: "Nombre", en: "Name" },
  important_notes: { es: "Notas Importantes", en: "Important Notes" },
  check_in_instructions: {
    es: "Presenta este recibo al hacer el check-in en la fecha indicada.",
    en: "Present this receipt when checking in on the indicated date.",
  },
  contact_support: {
    es: "Para cualquier consulta, contacta con nuestro equipo de soporte.",
    en: "For any inquiries, please contact our support team.",
  },
  view_room_details: { es: "Ver Detalles de la Habitación", en: "View Room Details" },

  // Footer
  footer_quick: { es: "Enlaces Rápidos", en: "Quick Links" },
  footer_cities: { es: "Nuestras Ciudades", en: "Our Cities" },
  footer_contact: { es: "Contacto", en: "Contact" },
};

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof translations) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("locale");
    return (saved === "en" || saved === "es") ? (saved as Locale) : "es";
  });

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  const t = useMemo(() => {
    return (key: keyof typeof translations) => translations[key]?.[locale] ?? String(key);
  }, [locale]);

  const value: I18nContextType = { locale, setLocale, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}


