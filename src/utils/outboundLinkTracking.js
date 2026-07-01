import ReactGA from "react-ga4";

export function createOutboundLinkHandler(label) {
  return (event) => {
    event.preventDefault();
    const href = event.currentTarget.href;

    ReactGA.event({
      category: "Outbound Link",
      action: "click",
      label,
    });

    setTimeout(() => {
      window.location.href = href;
    }, 150);
  };
}
