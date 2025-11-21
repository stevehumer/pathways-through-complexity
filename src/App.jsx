// No explicit React import needed in newer JSX runtimes; avoid unused import
import { Header } from './components/Header';
// PromoBanner is temporarily disabled for post-sale. To re-enable, uncomment the
// import below and the <PromoBanner /> element in the JSX return.
// import { PromoBanner } from './components/PromoBanner';
import { BookSection } from './components/BookSection';
import { VideoSection } from './components/VideoSection';
import { ContactForm } from './components/ContactSection';
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
    <div className="h-8 md:h-8" /> {/* Spacer equal to header height */}
    {/* PromoBanner temporarily disabled (Nov 14-18 sale). To re-enable:
      1) Uncomment the import at the top of this file.
      2) Replace the invisible spacer below with <PromoBanner /> to render it again.
    */}
    {/* Invisible spacer to preserve the banner's layout space so page spacing doesn't jump when the banner is hidden.
        It keeps the same classes as the banner but is hidden (occupies space but not visible). */}
    <div
      className="invisible bg-blue-100 text-center py-2 px-4 shadow-md mt-8 md:mt-10"
      aria-hidden="true"
    />
      <BookSection />
      <div className="container mx-auto flex justify-center">
        <hr className="border-gray-200 w-3/5 my-8" />
      </div>
      <VideoSection />
      <div className="container mx-auto flex justify-center">
        <hr className="border-gray-200 w-3/5 my-8" />
      </div>
      <ContactForm />
      <Footer />
    </>
  );
}

export default App;