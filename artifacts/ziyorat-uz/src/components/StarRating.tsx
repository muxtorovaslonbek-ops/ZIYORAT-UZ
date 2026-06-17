import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value?: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating = ({ value = 0, onChange, readOnly = false, size = 'md' }: Props) => {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={cn('transition-smooth', !readOnly && 'hover:scale-110 cursor-pointer', readOnly && 'cursor-default')}
        >
          <Star
            className={cn(sizeClass, (hover || value) >= star ? 'fill-gold text-gold' : 'text-muted-foreground/40')}
          />
        </button>
      ))}
    </div>
  );
};
