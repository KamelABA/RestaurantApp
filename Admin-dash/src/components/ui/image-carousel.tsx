import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageCarousel({ 
  images, 
  alt, 
  className
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "aspect-video w-full bg-muted rounded-lg flex items-center justify-center",
        className
      )}>
        <img
          src="https://dummyimage.com/400x300/cccccc/000000&text=Plat"
          alt="Food placeholder"
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            // If dummyimage fails, show a simple placeholder
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `
              <div class="flex items-center justify-center w-full h-full">
                <div class="text-center">
                  <svg class="w-16 h-16 mx-auto text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-500 text-sm">No image available</span>
                </div>
              </div>
            `;
          }}
        />
      </div>
    );
  }

  // Filter out images that have errors
  const validImages = images.filter((_, index) => !imageErrors.has(index));
  const validCurrentIndex = validImages.length > 0 ? Math.min(currentIndex, validImages.length - 1) : 0;

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
  };

  const nextImage = () => {
    if (validImages.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }
  };

  const prevImage = () => {
    if (validImages.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // If all images have errors, show dummy food image
  if (validImages.length === 0) {
    return (
      <div className={cn(
        "aspect-video w-full bg-muted rounded-lg flex items-center justify-center",
        className
      )}>
        <img
          src="https://dummyimage.com/400x300/cccccc/000000&text=Plat"
          alt="Food placeholder"
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            // If dummyimage fails, show a simple placeholder
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `
              <div class="flex items-center justify-center w-full h-full">
                <div class="text-center">
                  <svg class="w-16 h-16 mx-auto text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-500 text-sm">No image available</span>
                </div>
              </div>
            `;
          }}
        />
      </div>
    );
  }

  const CarouselContent = () => (
    <div className="relative group">
      {/* Main Image */}
             <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
         <img
           src={validImages[validCurrentIndex]}
           alt={`${alt} ${validCurrentIndex + 1}`}
           className="w-full h-full object-cover transition-transform duration-300"
           onError={() => handleImageError(validCurrentIndex)}
         />
       </div>

      {/* Navigation Arrows */}
      {validImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Image Counter */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {validCurrentIndex + 1} / {validImages.length}
        </div>
      )}

      {/* Thumbnail Dots */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                                 index === validCurrentIndex 
                   ? "bg-foreground" 
                   : "bg-foreground/50 hover:bg-foreground/75"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );



  return <CarouselContent />;
}
