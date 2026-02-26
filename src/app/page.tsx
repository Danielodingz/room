import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import About from "@/components/About";
import FAQs from "@/components/FAQs";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <main className="min-h-screen bg-background overflow-x-hidden">
            <Navbar />
            <Hero />
            <Services />
            <Process />
            <About />
            <FAQs />
            <Footer />
        </main>
    );
}
