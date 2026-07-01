import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Wraps an image so clicking it opens a larger view in a fullscreen overlay.
 * `className` styles the clickable wrapper (card/frame treatment); `imgClassName`
 * styles the `<img>` itself. Each instance owns its own open/close state, so
 * multiple images on a page work independently with no shared state needed.
 */
export const ClickableImage = ({ src, alt, className = '', imgClassName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`View larger image: ${alt}`}
        className={`${className} cursor-zoom-in block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold`}
      >
        <img src={src} alt={alt} loading="lazy" decoding="async" className={imgClassName} />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] bg-ink/80 flex items-center justify-center p-6 cursor-zoom-out"
            onClick={() => setIsOpen(false)}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full rounded-lg shadow-2xl cursor-default"
              onClick={(event) => event.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="fixed top-6 right-6 text-white text-3xl leading-none hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
            >
              &times;
            </button>
          </div>,
          document.body,
        )}
    </>
  );
};
