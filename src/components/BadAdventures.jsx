import azelicaBookCover from '../assets/azelica-cover.jpg';
import sunblastBookCover from '../assets/sunblast-cover.jpg';
import belmonticaBookCover from '../assets/belmontica-cover.jpg';
import amazonLogo from '../assets/amzn-logo.svg';
import { useInView } from '../hooks/useInView';
import { createOutboundLinkHandler } from '../utils/outboundLinkTracking';
import { buyButtonClasses } from '../styles/buttons';
import { ClickableImage } from './ClickableImage';

const BOOKS = [
    { label: "Book 1", title: "The Challenges at Azelica", img: azelicaBookCover, link: "https://www.amazon.com/Challenges-Azelica-BAD-Adventures-Fable-ebook/dp/B0CP2QHQYC", description:
        "We first encounter Ari as a middle manager working in an operations staff role for Azelica Technologies, a large & diversified B2B firm. He is tasked with finding effective solutions to a variety of operations challenges."
        //"Bine Ari Digit navigates the complexities of a B2B corporation, facing challenges that test his growth, leadership, and problem-solving skills as he helps drive success."
    },
    // TODO: replace with the book's real Amazon product URL. The previous link
    // here was Book 1's ASIN (B0CP2QHQYC, The Challenges at Azelica), so the
    // button sold the wrong book; until the correct ASIN is known, a pinned
    // title search is the safest destination.
    { label: "Book 2", title: "Solutions for Sunblast", img: sunblastBookCover, link: "https://www.amazon.com/s?k=%22Solutions+for+Sunblast%22+Humer", description:
        "Radical career changes can lead to satisfying outcomes. Ari has joined Mountain Vista, a boutique consulting company. His initial client, Sunblast Innovations, will test his skills and abilities in helping them find success."
        //"Now a consultant at Mountain Vista, Ari’s first project takes him to Sunblast Innovations, where he must steer the company through strategic and operational challenges."
    },
    { label: "Book 3", title: "School Days", img: belmonticaBookCover, link: "https://www.amazon.com/School-Days-Adventures-Fable-Digit-ebook/dp/B0DQ1V8P5V", description:
        "Ari has fond remembrances of his college days. However, being a student has not prepared him for how significantly strategic changes will impact Belmontica College, his next consulting assignment."
        //"Ari’s next challenge leads him to Belmontica College, where he works with faculty and staff to enhance academic effectiveness while tackling unexpected institutional crises."
    },
];

export const BadAdventures = () => {
    const [ref, isInView] = useInView();

    return (
        <section
            ref={ref}
            id="novels"
            className={`bg-paper scroll-mt-16 md:scroll-mt-20 py-20 md:py-24 transition-all duration-700 ease-out ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            <div className="container mx-auto px-5 max-w-5xl">
                <h2 className="font-display text-3xl md:text-4xl mb-6 text-ink text-center">Bine Ari Digit (BAD) Adventures</h2>
                <div className="flex flex-col md:flex-row gap-6 justify-center">
                    {BOOKS.map((book, index) => (
                            <div key={index} className="w-full md:w-1/3 flex flex-col items-center bg-paper border border-ink/10 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <ClickableImage
                                src={book.img}
                                alt={`${book.label}: ${book.title}`}
                                className="mb-4"
                                imgClassName="h-72 w-auto max-w-full object-contain rounded-lg"
                            />
                            <div className="flex-1 flex flex-col items-center">
                                <span className="text-xs font-semibold tracking-wide uppercase text-gold mb-1">{book.label}</span>
                                <h3 className="font-display text-xl text-ink mb-2 text-center">{book.title}</h3>
                                <p className="text-sm text-ink/70 text-center">
                                    {book.description}
                                </p>
                            </div>
                            <a href={book.link} target="_blank" rel="noopener noreferrer"
                            onClick={createOutboundLinkHandler(`Kindle: ${book.title}`)}
                            className={`mt-4 ${buyButtonClasses}`}>
                                <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                                Buy Kindle
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
