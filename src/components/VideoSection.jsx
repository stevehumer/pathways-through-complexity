import slideshowVideo from '../assets/slideshow.mp4';

export const VideoSection = () => {
    return (
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-2 items-center justify-center flex-col md:flex-row max-w-5xl"> {/* Constrain the maximum width */}
          <div className="lg:flex-grow md:w-1/2 lg:pr-16 md:pr-2 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h2 className="text-3xl mb-4 text-gray-900">Key Topics</h2>
            <div className="flex flex-wrap -mx-2">
                <div className="w-full px-2">
                    <ul className="list-disc space-y-2 italic ml-6">
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
            <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
                <video
                autoPlay
                muted // Add this if you want to ensure autoplay
                loop // If you want the video to loop
                controls
                controlsList="nodownload"
                className="object-cover object-center rounded"
                style={{ width: '100%', height: 'auto' }}
                >
                <source src={slideshowVideo} type="video/mp4" />
                Your browser does not support the video tag.
                </video>
            </div>
        </div>
      </section>
    );
  };
  