import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  totalRatings = 0,
  size = 'md',
  showCount = true,
  interactive = false,
  onRatingChange,
  className
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      let starClass = 'text-muted-foreground';
      
      if (i <= fullStars) {
        starClass = 'text-yellow-400 fill-current';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starClass = 'text-yellow-400 fill-current';
      }

      stars.push(
        <Star
          key={i}
          className={cn(
            sizeClasses[size],
            starClass,
            interactive && 'cursor-pointer hover:scale-110 transition-transform',
            className
          )}
          onClick={() => {
            if (interactive && onRatingChange) {
              onRatingChange(i);
            }
          }}
        />
      );
    }

    return stars;
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {renderStars()}
      </div>
      {showCount && totalRatings > 0 && (
        <span className="text-sm text-muted-foreground ml-1">
          ({totalRatings})
        </span>
      )}
    </div>
  );
}
