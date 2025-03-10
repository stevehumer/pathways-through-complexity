import bookCover from '../assets/ptc-cover.jpg';
import azelicaBookCover from '../assets/azelica-cover.png';
import sunblastBookCover from '../assets/sunblast-cover.png';
import belmonticaBookCover from '../assets/belmontica-cover.png';
import exploitsBookCover from '../assets/exploits-cover.jpg';
import amazonLogo from '../assets/amzn-logo.svg';
import ReactGA from "react-ga4";
  
export const BookSection = () => {
    const handleOutboundPaperbackLinkClick = (event) => {
        event.preventDefault();
        const href = event.currentTarget.href;
        
        ReactGA.event({
            category: "Outbound Link",
            action: "click",
            label: "Paperback",
        });
        
        setTimeout(() => {
            window.location.href = href;
        }, 150);
    };

    const handleOutboundKindleLinkClick = (event) => {
        event.preventDefault();
        const href = event.currentTarget.href;
        
        ReactGA.event({
            category: "Outbound Link",
            action: "click",
            label: "Kindle",
        });
        
        setTimeout(() => {
            window.location.href = href;
        }, 150);
    };

    return (
        <section className="text-gray-600 body-font pt-24">
            {/* Pathways Through Complexity Section */}
            <div className="container mx-auto flex px-5 py-2 items-center justify-center flex-col md:flex-row max-w-5xl"> {/* Constrain the maximum width */}
                <img src={bookCover} alt="Book Cover" className="object-cover object-center rounded w-4/5 md:w-1/4 mb-10 md:mb-0" /> {/* Image 20% smaller */}
                <div className="lg:flex-grow md:w-4/5 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
                    <h2 className="text-3xl mb-4 text-gray-900">Pathways Through Complexity</h2>
                    <p className="leading-relaxed mb-6">
                    Why is business so complex? In Pathways Through Complexity, the author offers his approach to understanding and interpreting the many attributes of the business world, and discusses the factors and forces affecting owners, employees, customers, and stakeholders. Also included is a fictional novella, The Challenges at Azelica, which shares the experiences of a middle manager in a large corporation and how he assists the company in its pursuit of success.
                    </p>
                    <span className="text-sm font-light">Buying options:</span> {/* Smaller and lighter text */}
                    <div className="flex justify-center items-center">
                        <a href="https://www.amazon.com/Pathways-Through-Complexity-Business-Choices/dp/B0CLVN6MBV" className="inline-flex items-center text-white bg-indigo-500 border-0 py-1 px-4 focus:outline-none hover:bg-indigo-600 rounded text-sm" onClick={handleOutboundPaperbackLinkClick}>
                            <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                            Buy Paperback
                        </a>
                        <div className="mx-2 h-5 border-l border-gray-400"></div> {/* Custom divider */}
                        <a href="https://www.amazon.com/Pathways-Through-Complexity-Business-Choices-ebook/dp/B0CM7942YC" className="inline-flex items-center text-white bg-indigo-500 border-0 py-1 px-4 focus:outline-none hover:bg-indigo-600 rounded text-sm" onClick={handleOutboundKindleLinkClick}>
                            <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                            Buy Kindle
                        </a>
                    </div>
                </div>
            </div>

            <div className="container mx-auto flex justify-center">
                <hr className="border-gray-200 w-3/5 my-2" />
            </div>

            {/* BAD Adventures Individual eBook Section */}
            <div className="container mx-auto px-5 py-6 max-w-5xl">
                <h2 className="text-3xl mb-6 text-gray-900 text-center">Bine Ari Digit (BAD) Adventures</h2>
                <div className="flex flex-col md:flex-row justify-between">
                    {[
                        { title: "Book 1: Challenges at Azelica", img: azelicaBookCover, link: "https://www.amazon.com/Challenges-Azelica-BAD-Adventures-Fable-ebook/dp/B0CP2QHQYC", description: 
                            "We first encounter Ari as a middle manager working in an operations staff role for Azelica Technologies, a large & diversified B2B firm. He is tasked with finding effective solutions to a variety of operations challenges."
                            //"Bine Ari Digit navigates the complexities of a B2B corporation, facing challenges that test his growth, leadership, and problem-solving skills as he helps drive success."
                        },
                        { title: "Book 2: Solutions for Sunblast", img: sunblastBookCover, link: "https://www.amazon.com/Challenges-Azelica-BAD-Adventures-Fable-ebook/dp/B0CP2QHQYC", description:
                            "Radical career changes can lead to satisfying outcomes. Ari has joined Mountain Vista, a boutique consulting company. His initial client, Sunblast Innovations, will test his skills and abilities in helping them find success."
                            //"Now a consultant at Mountain Vista, Ari’s first project takes him to Sunblast Innovations, where he must steer the company through strategic and operational challenges."
                        },
                        { title: "Book 3: School Days", img: belmonticaBookCover, link: "https://www.amazon.com/School-Days-Adventures-Fable-Digit-ebook/dp/B0DQ1V8P5V", description:
                            "Ari has fond remembrances of his college days. However, being a student has not prepared him for how significantly strategic changes will impact Belmontica College, his next consulting assignment."
                            //"Ari’s next challenge leads him to Belmontica College, where he works with faculty and staff to enhance academic effectiveness while tackling unexpected institutional crises."
                        }
                        ].map((book, index) => (
                            <div key={index} className="w-full md:w-1/3 flex flex-col items-center px-4 mb-8 last:mb-0 md:mb-0">
                            <img 
                                src={book.img} 
                                alt={book.title} 
                                className="h-72 w-auto max-w-full object-contain rounded mb-4 shadow-md" 
                            />
                            <h3 className="text-xl text-gray-900">{book.title}</h3>
                            <p className="text-sm text-gray-700 text-center">
                                {book.description}
                            </p>
                            <a href={book.link} 
                            className="mt-3 inline-flex items-center text-white bg-indigo-500 border-0 py-1 px-4 focus:outline-none hover:bg-indigo-600 rounded text-sm">
                                <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                                Buy Kindle
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* BAD Adventures Trilogy Hardcopy Section */}
            <div className="container mx-auto px-5 py-6 max-w-5xl text-center">
                <h2 className="text-3xl mb-6 text-gray-900">The BAD Adventures Trilogy</h2>
                <div className="flex justify-center">
                    <img src={exploitsBookCover} alt="The BAD Trilogy Book Cover" 
                        className="w-full max-w-4xl object-cover rounded-lg shadow-md mb-6" />
                </div>
                <div className="flex justify-center items-center">
                    <a href="https://www.amazon.com/Exploits-Bine-Ari-Digit/dp/B0DVCBK677/ref=sr_1_1?crid=1WUTO4E955UJW" className="inline-flex items-center text-white bg-indigo-500 border-0 py-1 px-4 focus:outline-none hover:bg-indigo-600 rounded text-sm" onClick={handleOutboundPaperbackLinkClick}>
                        <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                        Buy Paperback
                    </a>
                </div>
            </div>
        </section>
    );
};
