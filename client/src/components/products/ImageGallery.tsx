import { useState } from 'react';

interface Props {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // If only one image, use simple display
  if (images.length <= 1) {
    return (
      <div
        className="aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in relative group"
        onClick={() => setZoomed(!zoomed)}
      >
        <img
          src={images[0]}
          alt={alt}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${zoomed ? 'scale-150' : 'group-hover:scale-[1.03]'}`}
        />
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] text-gray-500 font-light opacity-0 group-hover:opacity-100 transition-opacity">
          {zoomed ? 'Réduire' : 'Zoomer'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnails */}
      <div className="flex flex-col gap-2 w-16 shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); setZoomed(false); }}
            className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all ${
              active === i ? 'border-charcoal opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        className="flex-1 aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in relative group"
        onClick={() => setZoomed(!zoomed)}
      >
        <img
          src={images[active]}
          alt={alt}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${zoomed ? 'scale-150' : 'group-hover:scale-[1.03]'}`}
        />
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] text-gray-500 font-light opacity-0 group-hover:opacity-100 transition-opacity">
          {zoomed ? 'Réduire' : 'Zoomer'}
        </div>

        {/* Counter */}
        <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] text-gray-500 font-light">
          {active + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
