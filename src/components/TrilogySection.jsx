import exploitsBookCover from '../assets/exploits-cover.jpg';
import amazonLogo from '../assets/amzn-logo.svg';
import { useInView } from '../hooks/useInView';
import { createOutboundLinkHandler } from '../utils/outboundLinkTracking';
import { buyButtonClasses } from '../styles/buttons';
import { ClickableImage } from './ClickableImage';

const handleOutboundPaperbackLinkClick = createOutboundLinkHandler('Paperback');

export const TrilogySection = () => {
    const [ref, isInView] = useInView();

    return (
        <section
            ref={ref}
            className={`bg-paper-tint py-20 md:py-24 transition-all duration-700 ease-out ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            <div className="container mx-auto px-5 max-w-5xl text-center">
                <h2 className="font-display text-3xl md:text-4xl mb-6 text-ink">The BAD Adventures Trilogy</h2>
                <div className="flex justify-center">
                    <ClickableImage
                        src={exploitsBookCover}
                        alt="The BAD Trilogy Book Cover"
                        className="w-full max-w-4xl mb-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                        imgClassName="w-full object-cover rounded-lg"
                    />
                </div>
                <p className="text-sm text-ink/70 mb-6 max-w-2xl mx-auto">
                    All three BAD Adventures novels, The Challenges at Azelica, Solutions for
                    Sunblast, and School Days, collected in a single paperback volume.
                </p>
                <div className="flex justify-center items-center">
                    <a href="https://www.amazon.com/Exploits-Bine-Ari-Digit/dp/B0DVCBK677/ref=sr_1_1?crid=1WUTO4E955UJW" className={buyButtonClasses} onClick={handleOutboundPaperbackLinkClick}>
                        <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                        Buy Paperback
                    </a>
                </div>
            </div>
        </section>
    );
};
