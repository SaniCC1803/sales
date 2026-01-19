import { useEffect, useState } from 'react';

type ProductCarouselProps = {
  images: string[];
};

export default function ProductCarousel({ images }: ProductCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000); // 5 seconds
    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-80 md:h-[32rem] flex items-center justify-center overflow-hidden bg-neutral-200">
      {images.map((img, i) => (
        <img
          key={img}
          src={img}
          alt={`Promotional ${i + 1}`}
          className={`absolute w-full h-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          style={{ pointerEvents: i === index ? 'auto' : 'none' }}
        />
      ))}
      {/* Left Arrow */}
      {images.length > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white rounded-full p-2 shadow-md"
          onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)}
          aria-label="Previous slide"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {/* Right Arrow */}
      {images.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white rounded-full p-2 shadow-md"
          onClick={() => setIndex((prev) => (prev + 1) % images.length)}
          aria-label="Next slide"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
      {/* Dots removed as requested */}
    </div>
  );
}
