// components/PromoBanner.tsx
import React from "react";
import ReactGA from "react-ga4";

export const PromoBanner = () => {
  const handleFreeEbookClick = (event) => {
    event.preventDefault();
    const href = event.currentTarget.href;
  
    // Track event with Google Analytics
    ReactGA.event({
      category: "Promo Banner",
      action: "click",
      label: "Free eBook Download",
    });
  
    // Redirect after slight delay to ensure tracking fires
    setTimeout(() => {
      window.location.href = href;
    }, 150);
  };

  return (
    <div className="bg-blue-100 text-blue-900 text-center py-3 px-4 shadow-md mt-14 md:mt-16">
      📚 <strong>Free eBook!</strong> Download <em>“Challenges at Azelica”</em> for free from <strong>May 1-5, 2025</strong>. First in the <em>Bine Ari Digit</em> series! 👉{" "}
      <a
        href="https://www.amazon.com/Challenges-Azelica-BAD-Adventures-Fable-ebook/dp/B0CP2QHQYC"
        onClick={handleFreeEbookClick}
        className="underline text-blue-800 font-semibold hover:text-blue-600"
      >
        Download Now
      </a>
    </div>
  );
};