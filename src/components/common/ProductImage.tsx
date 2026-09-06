import React, { useState } from 'react';
import { Gift, Banknote, Sparkles } from 'lucide-react';
import { Product } from '../../types';

interface ProductImageProps {
  product: Product;
  className?: string;
  containerClassName?: string;
  fallbackSize?: 'sm' | 'md' | 'lg';
}

// Map known product IDs or keywords to local ultra-reliable assets
export const getSafeProductImageUrl = (product: Product): string => {
  if (!product) return '';

  const id = (product.id || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const url = product.imageUrl || '';

  // Local assets mapping
  if (id.includes('kit') || name.includes('kit supergiros')) {
    return '/products/kit-supergiros.png';
  }
  if (id.includes('gafas') || name.includes('gafas')) {
    return '/products/gafas-mundialistas.png';
  }
  if (id.includes('olla') || name.includes('olla a presi') || name.includes('olla')) {
    return '/products/olla-presion.png';
  }
  if (id.includes('bono_100k') || name.includes('100.000') || name.includes('100k')) {
    return '/products/bono-100k.svg';
  }
  if (id.includes('bono_150k') || name.includes('150.000') || name.includes('150k')) {
    return '/products/bono-150k.svg';
  }

  // If already a local product path, return as is
  if (url.startsWith('/products/')) {
    return url;
  }

  // If empty and it's a bono, use standard bono SVG
  if (!url && (product.category === 'Bonos' || product.isDigital)) {
    return '/products/bono-100k.svg';
  }

  return url;
};

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  className = 'w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-300',
  containerClassName = 'w-full h-full flex items-center justify-center relative overflow-hidden',
  fallbackSize = 'md'
}) => {
  const primaryUrl = getSafeProductImageUrl(product);
  const [currentSrc, setCurrentSrc] = useState<string>(primaryUrl);
  const [hasError, setHasError] = useState<boolean>(!primaryUrl);

  const handleError = () => {
    // If the error was from an external URL, try the local safe URL first
    const safeLocal = getSafeProductImageUrl(product);
    if (currentSrc !== safeLocal && safeLocal) {
      setCurrentSrc(safeLocal);
    } else {
      setHasError(true);
    }
  };

  const isBono = product.isDigital || product.category === 'Bonos';

  if (hasError || !currentSrc) {
    return (
      <div className={containerClassName}>
        <div 
          className={`rounded-2xl flex flex-col items-center justify-center p-3 text-center shadow-xs transition-transform ${
            isBono 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white' 
              : 'bg-gradient-to-br from-blue-900 to-indigo-800 text-white'
          } ${
            fallbackSize === 'sm' ? 'w-10 h-10' : fallbackSize === 'lg' ? 'w-24 h-24' : 'w-20 h-20'
          }`}
        >
          {isBono ? (
            <Banknote className={fallbackSize === 'sm' ? 'w-5 h-5' : 'w-8 h-8'} />
          ) : (
            <Gift className={fallbackSize === 'sm' ? 'w-5 h-5' : 'w-8 h-8'} />
          )}
          {fallbackSize !== 'sm' && (
            <span className="text-[9px] font-black uppercase tracking-wider mt-1 opacity-90 truncate max-w-full">
              {product.brand || 'SuperGIROS'}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <img
        src={currentSrc}
        alt={product.name}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={handleError}
      />
    </div>
  );
};
