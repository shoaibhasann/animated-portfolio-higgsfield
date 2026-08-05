import HeroSection from './sections/HeroSection'
import TechStackSection from './sections/TechStackSection'
import MarqueeSection from './sections/MarqueeSection'
import AboutSection from './sections/AboutSection'
import ServicesSection from './sections/ServicesSection'
import ProjectsSection from './sections/ProjectsSection'
import TestimonialsSection from './sections/TestimonialsSection'
import ContactSection from './sections/ContactSection'
import FooterDrift from './sections/FooterDrift'

function App() {
  return (
    <div style={{ overflowX: 'clip', background: '#0C0C0C' }}>
      <HeroSection />
      <TechStackSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <TestimonialsSection />
      <FooterDrift />
      <ContactSection />
    </div>
  )
}

export default App
