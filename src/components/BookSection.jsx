import bookCover from '../assets/ptc-cover.jpg';
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
        <div className="container mx-auto flex px-5 py-2 items-center justify-center flex-col md:flex-row max-w-5xl"> {/* Constrain the maximum width */}
            <img src={bookCover} alt="Book Cover" className="object-cover object-center rounded w-4/5 md:w-1/4 mb-10 md:mb-0" /> {/* Image 20% smaller */}
            <div className="lg:flex-grow md:w-4/5 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
                <h2 className="text-3xl mb-4 text-gray-900">About the Book</h2>
                <p className="leading-relaxed mb-6">
                Why is the business so complex? In <span className="font-bold italic">Pathways Through Complexity</span>, the author investigates many of the attributes of the business world and 
                offers his insights and observations to understanding and interpreting the factors and forces that affect corporate behaviors that affect 
                owners, employees, customers, and stakeholders. A fictional novella is included, describing how life in a major corporation is experienced 
                by a middle manager who finds ways to assist the company in their pursuit of success.
                </p>
                <span className="text-sm font-light">Buy the book:</span> {/* Smaller and lighter text */}
                <div className="flex justify-center items-center">
                    <a href="https://www.amazon.com/Pathways-Through-Complexity-Business-Choices/dp/B0CLVN6MBV" className="inline-flex items-center text-white bg-indigo-500 border-0 py-1 px-4 focus:outline-none hover:bg-indigo-600 rounded text-sm" onClick={handleOutboundPaperbackLinkClick}>
                        <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                        Paperback
                    </a>
                    <div className="mx-2 h-5 border-l border-gray-400"></div> {/* Custom divider */}
                    <a href="https://www.amazon.com/Pathways-Through-Complexity-Business-Choices-ebook/dp/B0CM7942YC" className="inline-flex items-center text-white bg-indigo-500 border-0 py-1 px-4 focus:outline-none hover:bg-indigo-600 rounded text-sm" onClick={handleOutboundKindleLinkClick}>
                        <img src={amazonLogo} alt="Amazon" className="w-4 mr-2" />
                        Kindle
                    </a>
                </div>
            </div>
        </div>
        </section>
    );
};
