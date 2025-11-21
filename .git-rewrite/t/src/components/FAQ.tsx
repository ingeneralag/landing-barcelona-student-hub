import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/i18n";

const faqs = [
  {
    question: {
      es: "¿Cuánto cuesta el depósito?",
      en: "How much is the deposit?",
    },
    answer: {
      es: "Normalmente 1 mes de fianza. El depósito varía según la residencia y se devuelve al finalizar el contrato si no hay daños.",
      en: "Usually 1 month. The amount may vary by residence and is returned at the end of the contract if there are no damages.",
    },
  },
  {
    question: { es: "¿Incluye servicios?", en: "Are utilities included?" },
    answer: {
      es: "Algunas tarifas incluyen Wi-Fi y agua, otras solo electricidad. Revisa cada oferta específica para conocer qué servicios están incluidos en el precio.",
      en: "Some rates include Wi‑Fi and water, others only electricity. Check each offer to see what's included.",
    },
  },
  {
    question: { es: "¿Puedo cancelar mi reserva?", en: "Can I cancel my booking?" },
    answer: {
      es: "Política flexible hasta 14 días antes de la fecha de entrada. Revisa las condiciones específicas al realizar la reserva.",
      en: "Flexible policy up to 14 days before check‑in. Check specific conditions during booking.",
    },
  },
  {
    question: { es: "¿Cuál es la duración mínima del contrato?", en: "What is the minimum contract length?" },
    answer: {
      es: "La duración mínima suele ser de 3 meses, aunque algunas residencias ofrecen opciones más cortas. Consulta disponibilidad según tus necesidades.",
      en: "Minimum stay is usually 3 months, though some residences offer shorter options. Ask for availability.",
    },
  },
  {
    question: { es: "¿Qué necesito para hacer la reserva?", en: "What do I need to book?" },
    answer: {
      es: "Necesitarás DNI/pasaporte, carta de aceptación de la universidad (si aplica), y realizar el pago del depósito y primer mes.",
      en: "ID/passport, university acceptance letter (if applicable), and payment of deposit and first month.",
    },
  },
  {
    question: { es: "¿Hay límite de edad?", en: "Is there an age limit?" },
    answer: {
      es: "Nuestras residencias están diseñadas principalmente para estudiantes universitarios entre 18 y 30 años.",
      en: "Our residences are mainly designed for university students between 18 and 30 years old.",
    },
  },
  {
    question: {
      es: "¿Cuándo no puedo recuperar mi dinero?",
      en: "When can I not get a refund?",
    },
    answer: {
      es: "Si no nos avisas como máximo 2 días antes de la fecha de inicio del alojamiento o si no dispones de la documentación necesaria para solicitar el reembolso, como: (1) carta de denegación de la embajada correspondiente y (2) justificante oficial de la universidad sobre los pagos/recibos. Todo ello conforme a la normativa de la Unión Europea.",
      en: "If you do not notify us at least 2 days before the start date of your accommodation, or if you do not provide the required documents to request a refund, such as: (1) a refusal letter from the relevant embassy and (2) an official receipt/fee confirmation from your university. All in accordance with EU regulations.",
    },
  },
];

const FAQ = () => {
  const { t, locale } = useI18n();
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-3xl sm:text-4xl">{t("sec_faq_title")}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Resuelve tus dudas sobre nuestro proceso de reserva y alojamientos
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-lg px-6 shadow-md"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary text-base sm:text-lg">
                  {faq.question[locale]}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base">
                  {faq.answer[locale]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
