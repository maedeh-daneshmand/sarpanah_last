import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import WelcomeSection from '@/components/WelcomeSection';
import FeaturesSection from '@/components/FeaturesSection';
import RegionSection from '@/components/RegionSection';
import GroupTravelSection from '@/components/GroupTravelSection';
import FeaturedProperties from '@/components/FeaturedProperties';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import HostSection from '@/components/HostSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen dynamic-theme-bg overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <WelcomeSection />
      <FeaturesSection />
      <RegionSection />
      <GroupTravelSection />
      <FeaturedProperties />
      <HowItWorks />
      <Testimonials />
      <HostSection />
      <Footer />
    </main>
  );
}
