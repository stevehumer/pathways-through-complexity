// components/PromoBanner.tsx
import React from "react";

export const PromoBanner = () => {
  const now = new Date();
  const endDate = new Date("2025-05-06"); // End of May 5

  if (now > endDate) return null;

  return (
    <div className="bg-blue-100 text-blue-900 text-center py-3 px-4 shadow-md mt-14 md:mt-16">
      📚 <strong>Free eBook!</strong> Download <em>“Challenges at Azelica”</em> for free from <strong>May 1-5, 2025</strong>. First in the <em>Bine Ari Digit</em> series! 👉{" "}
      <a
        href="https://www.amazon.com/Challenges-Azelica-BAD-Adventures-Fable-ebook/dp/B0CP2QHQYC"
        className="underline text-blue-800 font-semibold hover:text-blue-600"
      >
        Download Now
      </a>
    </div>
  );
};