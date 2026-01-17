import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Trust from './components/Trust';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F6F7]">
      <Navbar />
      <Hero />
      <Features />
      <Trust />
      <Footer />
    </main>
  );
}
