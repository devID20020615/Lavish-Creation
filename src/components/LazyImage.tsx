import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl, resolveDirectImageUrl } from '../utils/imageHelper';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  targetWidth?: number;
  className?: string;
  wrapperClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  targetWidth = 800,
  className = '',
  wrapperClassName = '',
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => getOptimizedImageUrl(src, { width: targetWidth, quality: 80 }));
  const [hasError, setHasError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgSrc(getOptimizedImageUrl(src, { width: targetWidth, quality: 80 }));
    setHasError(false);
    setIsLoaded(false);
  }, [src, targetWidth]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '600px' } // Pre-fetch 600px before scrolling into viewport
      );

      observer.observe(wrapperRef.current);
      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, []);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      // Fall back to direct unproxied URL
      const direct = resolveDirectImageUrl(src);
      if (direct && direct !== imgSrc) {
        setImgSrc(direct);
        return;
      }
    }
    // Final fallback to Unsplash placeholder
    setImgSrc('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80');
    if (onError) onError(e);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-[#E8DFD1] ${wrapperClassName}`}
    >
      {/* Skeleton Blur Placeholder */}
      <div
        className={`absolute inset-0 bg-[#E0D3C1] animate-pulse transition-opacity duration-500 ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      />

      {isInView && (
        <img
          src={imgSrc}
          alt={alt}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={`transition-all duration-500 ease-out ${
            isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};

