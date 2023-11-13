import React from 'react';
import { Header } from './components/Header';
import { BookSection } from './components/BookSection';
import { VideoSection } from './components/VideoSection';
import { ContactForm } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ReactGA } from "react-ga4";

ReactGA.initialize('G-4EMQ08D9PM');

const App = () => {
  return (
    <>
      <Header />
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