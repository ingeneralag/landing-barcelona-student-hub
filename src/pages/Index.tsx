import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchFilter from "@/components/SearchFilter";
import WhyChooseUs from "@/components/WhyChooseUs";
import CitiesSection from "@/components/CitiesSection";
import AccommodationGrid from "@/components/AccommodationGrid";
import HowToBook from "@/components/HowToBook";
import PricingTable from "@/components/PricingTable";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <SearchFilter />
      <WhyChooseUs />
      <CitiesSection />
      <AccommodationGrid />
      <HowToBook />
      <PricingTable />
      <FAQ />
      <Testimonials />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default Index;
