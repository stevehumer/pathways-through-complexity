import bookCover from '../assets/ptc-cover.jpg';
import amazonLogo from '../assets/amzn-logo.svg';
import { useInView } from '../hooks/useInView';
import { createOutboundLinkHandler } from '../utils/outboundLinkTracking';
import { buyButtonClasses } from '../styles/buttons';
import { ClickableImage } from './ClickableImage';

const handleOutboundPaperbackLinkClick = createOutboundLinkHandler('Paperback');
const handleOutboundKindleLinkClick = createOutboundLinkHandler('Kindle');

export const PathwaysHero = () => {
    const [ref, isInView] = useInView();

    return (
        <section
            ref={ref}
            id="pathways"
            className={`bg-paper scroll-mt-16 md:scroll-mt-20 pt-10 md:pt-12 pb-20 md:pb-24 transition-all duration-700 ease-out ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            <div className="container mx-auto flex px-5 items-center justify-center flex-col md:flex-row max-w-5xl"> {/* Constrain the maximum width */}
                <ClickableImage
                    src={bookCover}
                    alt="Pathways Through Complexity book cover"
                    className="rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden w-4/5 md:w-1/4 mb-10 md:mb-0"
                    imgClassName="object-cover object-center w-full h-full"
                />
                <div className="lg:flex-grow md:w-4/5 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
                    {/* The page's single h1: this hero is the site's headline content */}
                    <h1 className="font-display text-3xl md:text-4xl mb-4 text-ink">Pathways Through Complexity</h1>
                    <p className="leading-relaxed mb-6 text-ink/80">
                    Why is business so complex? In Pathways Through Complexity, the author offers his approach to understanding and interpreting the many attributes of the business world, and discusses the factors and forces affecting owners, employees, customers, and stakeholders. Also included is a fictional novella, The Challenges at Azelica, which shares the experiences of a middle manager in a large corporation and how he assists the company in its pursuit of success.
                    </p>
                    <span className="text-sm font-light text-ink/60">Buying options:</span> {/* Smaller and lighter text */}
                    <div className="flex justify-center items-center">
                        <a href="https://www.amazon.com/Pathways-Through-Complexity-Business-Choices/dp/B0CLVN6MBV" target="_blank" rel="noopener noreferrer" className={buyButtonClasses} onClick={handleOutboundPaperbackLinkClick}>
                            <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                            Buy Paperback
                        </a>
                        <div className="mx-2 h-5 border-l border-ink/20"></div> {/* Custom divider */}
                        <a href="https://www.amazon.com/Pathways-Through-Complexity-Business-Choices-ebook/dp/B0CM7942YC" target="_blank" rel="noopener noreferrer" className={buyButtonClasses} onClick={handleOutboundKindleLinkClick}>
                            <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                            Buy Kindle
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
