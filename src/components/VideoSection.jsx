import slideshowVideo from '../assets/slideshow.mp4';
import { useInView } from '../hooks/useInView';

export const VideoSection = () => {
    const [ref, isInView] = useInView();

    return (
      <section
        ref={ref}
        className={`bg-paper-tint py-20 md:py-24 transition-all duration-700 ease-out ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="container mx-auto flex px-5 items-center justify-center flex-col md:flex-row max-w-6xl"> {/* Constrain the maximum width */}
          <div className="md:w-2/5 lg:pr-16 md:pr-8 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-4 text-ink">Key Topics in Pathways</h2>
            <div className="flex flex-wrap -mx-2">
                <div className="w-full px-2">
                    <ul className="list-disc marker:text-gold space-y-2 italic ml-6 text-ink/80">
                        <li>Thriving in the Business Environment</li>
                        <li>Defining the Purpose of a Business</li>
                        <li>Characteristics of Business Operations</li>
                        <li>Models, Frameworks, and Concepts</li>
                        <li>Enabling Strategy - Factors and Forces</li>
                        <li>Optimizing Business Operations</li>
                    </ul>
                </div>
            </div>
            </div>
            <div className="w-full md:w-3/5">
                <div className="rounded-lg shadow-lg overflow-hidden border border-ink/10 aspect-video bg-ink/5">
                  {/* Deferred until the section is actually scrolled into view: this
                      video is the single largest asset on the site (~2.8MB), and
                      `autoPlay` would otherwise make the browser fetch it immediately
                      on page load regardless of scroll position. */}
                  {isInView && (
                    <video
                    autoPlay
                    muted // Add this if you want to ensure autoplay
                    loop // If you want the video to loop
                    controls
                    controlsList="nodownload"
                    className="object-cover object-center w-full h-full"
                    >
                    <source src={slideshowVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                    </video>
                  )}
                </div>
            </div>
        </div>
      </section>
    );
  };
