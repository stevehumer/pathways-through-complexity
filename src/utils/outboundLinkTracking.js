import ReactGA from "react-ga4";

// These links open in a new tab (target="_blank"), so there's no need to
// delay navigation for the analytics event to fire like same-tab navigation
// required; the current page never unloads.
export function createOutboundLinkHandler(label) {
  return () => {
    ReactGA.event({
      category: "Outbound Link",
      action: "click",
      label,
    });
  };
}
