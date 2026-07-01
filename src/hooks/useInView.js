import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useInView({ threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(prefersReducedMotion);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isInView];
}
