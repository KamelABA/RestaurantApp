import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { MenuItem } from "./RestaurantMenu";
import steakImg from "@/assets/steak.jpg";
import saladImg from "@/assets/salad.jpg";
import soupImg from "@/assets/soup.jpg";
import dessertImg from "@/assets/dessert.jpg";

interface DishModalProps {
  dish: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: MenuItem, quantity: number) => void;
}

// Image Slider Component for DishModal
const ImageSlider = ({ images, alt, className = "" }: { images: string[], alt: string, className?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  console.log('ImageSlider rendered with:', { images, alt, currentIndex });

  // Reset currentIndex when images change
  useEffect(() => {
    setCurrentIndex(0);
    setIsAutoPlaying(true);
    console.log('ImageSlider: Reset currentIndex to 0 for new images');
  }, [images]);

  // Ensure currentIndex is always valid
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
      console.log('ImageSlider: Fixed invalid currentIndex, reset to 0');
    }
  }, [currentIndex, images.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % images.length;
        console.log('Auto-play: Next image:', prev, '->', next);
        
        // Stop auto-play when we reach the last image
        if (next === 0) {
          setIsAutoPlaying(false);
          console.log('Auto-play: Reached end, stopping auto-play');
        }
        
        return next;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        className={className}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    );
  }

  const nextImage = () => {
    if (images.length <= 1) return;
    setIsAutoPlaying(false); // Stop auto-play when user manually navigates
    setCurrentIndex((prev) => {
      const next = (prev + 1) % images.length;
      console.log('Next image:', prev, '->', next, 'Total images:', images.length);
      return next;
    });
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setIsAutoPlaying(false); // Stop auto-play when user manually navigates
    setCurrentIndex((prev) => {
      const prevIndex = (prev - 1 + images.length) % images.length;
      console.log('Previous image:', prev, '->', prevIndex, 'Total images:', images.length);
      return prevIndex;
    });
  };

  return (
    <div className="relative group">
      <img
        src={images[currentIndex]}
        alt={alt}
        className={className}
        onLoad={() => console.log('Image loaded:', images[currentIndex])}
        onError={(e) => {
          console.log('Image failed to load:', images[currentIndex]);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      
      {/* Navigation arrows */}
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next image"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      
      {/* Image indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              console.log('Dot clicked:', index, 'Current:', currentIndex);
              setIsAutoPlaying(false); // Stop auto-play when user manually navigates
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Image counter */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>
      
      {/* Play/Pause button */}
      {images.length > 1 && (
        <button
          onClick={() => {
            setIsAutoPlaying(!isAutoPlaying);
            console.log('Auto-play toggled:', !isAutoPlaying);
          }}
          className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
};

const DishModal = ({ dish, isOpen, onClose, onAddToCart }: DishModalProps) => {
  const [quantity, setQuantity] = useState(1);

  // Don't render if no dish or modal is not open
  if (!dish || !isOpen) return null;

  const handleAddToCart = () => {
    onAddToCart(dish, quantity);
    setQuantity(1);
    onClose();
  };

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto dialog-content">
        <DialogHeader>
          <DialogTitle className="text-xl">{dish.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pb-4">
          {/* Image */}
          <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
            {dish.image || (dish.images && dish.images.length > 0) ? (
              <ImageSlider 
                images={dish.images || [dish.image]} 
                alt={dish.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-sm">Image non disponible</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Description and Price */}
          <div className="space-y-2">
            <p className="text-muted-foreground">{dish.description}</p>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="bg-restaurant-gold/20 text-restaurant-dark text-lg px-3 py-1">
                {typeof dish.price === 'number' ? dish.price.toFixed(2) : parseFloat(dish.price || 0).toFixed(2)} DZD
              </Badge>
              <Badge variant="outline">{dish.category}</Badge>
            </div>
          </div>
          
          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantité</label>
            <div className="flex items-center gap-3">
              <Button 
                size="icon" 
                variant="outline" 
                onClick={decreaseQuantity}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-medium w-12 text-center">{quantity}</span>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={increaseQuantity}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          

          
          {/* Total and Add Button */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold text-primary">
                {((typeof dish.price === 'number' ? dish.price : parseFloat(dish.price || 0)) * quantity).toFixed(2)} DZD
              </span>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-primary to-restaurant-warm hover:from-primary/90 hover:to-restaurant-warm/90 text-white font-medium h-12"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ajouter au panier ({quantity})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishModal;