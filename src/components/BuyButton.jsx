import amazonLogo from '../assets/amzn-logo.svg';
import { createOutboundLinkHandler } from '../utils/outboundLinkTracking';

const buyButtonClasses =
  'inline-flex items-center text-paper bg-ink border-0 py-1.5 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 hover:bg-gold transition-colors duration-200 rounded-md text-sm';

/**
 * Outbound Amazon buy link: one place for the new-tab attributes, the
 * GA outbound-click tracking, the logo, and the button styling.
 */
export const BuyButton = ({ href, trackingLabel, children, className = '' }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={createOutboundLinkHandler(trackingLabel)}
    className={`${className} ${buyButtonClasses}`.trim()}
  >
    <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
    {children}
  </a>
);
