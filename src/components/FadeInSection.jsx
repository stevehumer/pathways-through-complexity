import { useInView } from '../hooks/useInView';

/**
 * Top-level page section with the shared scroll-triggered fade-in.
 * `children` may be a function to receive `isInView` for content that
 * should also defer until the section is visible (e.g. the video).
 */
export const FadeInSection = ({ id, className = '', children }) => {
  const [ref, isInView] = useInView();

  return (
    <section
      ref={ref}
      id={id}
      className={`${className} transition-all duration-700 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {typeof children === 'function' ? children(isInView) : children}
    </section>
  );
};
