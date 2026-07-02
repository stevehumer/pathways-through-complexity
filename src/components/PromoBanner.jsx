import ReactGA from "react-ga4";

export const PromoBanner = () => {
  const handleFreeEbookClick = () => {
    // Link opens in a new tab (target="_blank"), so the current page never
    // unloads and there's no need to delay navigation for this to fire.
    ReactGA.event({
      category: "Promo Banner",
      action: "click",
      label: "Free eBook Download",
    });
  };

  return (
    <div className="bg-blue-100 text-blue-900 text-center py-3 px-4 shadow-md mt-14 md:mt-16">
      📚 <strong>Free eBook!</strong> Download <em>“School Days”</em> for free from <strong>Nov 14 - Nov 18, 2025</strong>. First book in the <em>Bine Ari Digit</em> fiction series! 👉{" "}
      <a
        href="https://www.amazon.com/School-Days-Adventures-Fable-Digit-ebook/dp/B0DQ1V8P5V"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleFreeEbookClick}
        className="underline text-blue-800 font-semibold hover:text-blue-600"
      >
        Download Now
      </a>
    </div>
  );
};