// No explicit React import needed in newer JSX runtimes; avoid unused import
import { Header } from './components/Header';
// PromoBanner is temporarily disabled for post-sale. To re-enable, uncomment the
// import below and the <PromoBanner /> element in the JSX return.
// import { PromoBanner } from './components/PromoBanner';
import { PathwaysHero } from './components/PathwaysHero';
import { VideoSection } from './components/VideoSection';
import { BadAdventures } from './components/BadAdventures';
import { TrilogySection } from './components/TrilogySection';
import { AskAriChat } from './components/AskAriChat';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import ReactGA from "react-ga4";
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    ReactGA.initialize('G-4EMQ08D9PM');
  }, []);

  return (
    <>
      <Header />
    <div id="top" className="h-16 md:h-20" /> {/* Spacer equal to header height; #top anchors the wordmark's back-to-top link */}
    {/* PromoBanner is disabled. To re-enable for a sale: uncomment the import
        at the top of this file and add <PromoBanner /> right here — it renders
        its own space, no separate spacer needed. */}
      <PathwaysHero />
      <VideoSection />
      <BadAdventures />
      <TrilogySection />
      <ContactSection />
      <Footer />
      <AskAriChat />
    </>
  );
}

export default App;