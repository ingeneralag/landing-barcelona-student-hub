import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cuánto cuesta el depósito?",
    answer: "Normalmente 1 mes de fianza. El depósito varía según la residencia y se devuelve al finalizar el contrato si no hay daños.",
  },
  {
    question: "¿Incluye servicios?",
    answer: "Algunas tarifas incluyen Wi-Fi y agua, otras solo electricidad. Revisa cada oferta específica para conocer qué servicios están incluidos en el precio.",
  },
  {
    question: "¿Puedo cancelar mi reserva?",
    answer: "Política flexible hasta 14 días antes de la fecha de entrada. Revisa las condiciones específicas al realizar la reserva.",
  },
  {
    question: "¿Cuál es la duración mínima del contrato?",
    answer: "La duración mínima suele ser de 3 meses, aunque algunas residencias ofrecen opciones más cortas. Consulta disponibilidad según tus necesidades.",
  },
  {
    question: "¿Qué necesito para hacer la reserva?",
    answer: "Necesitarás DNI/pasaporte, carta de aceptación de la universidad (si aplica), y realizar el pago del depósito y primer mes.",
  },
  {
    question: "¿Hay límite de edad?",
    answer: "Nuestras residencias están diseñadas principalmente para estudiantes universitarios entre 18 y 30 años.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">Preguntas Frecuentes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
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
