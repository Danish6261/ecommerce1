import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Product } from '../data/products';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variant: string) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedVariant, setSelectedVariant] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0]);
      setAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, selectedVariant || product.variants[0]);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="relative z-10 w-full max-w-3xl bg-white rounded-lg border border-[#E6E3DC] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product preview"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/95 border border-[#E6E3DC] flex items-center justify-center text-[#18181B] hover:bg-[#F1EFEA] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Left Media */}
        <div className="md:col-span-6 bg-[#EFECE5] aspect-[4/3] md:aspect-auto">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contiguous Purchase Module */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="text-xs text-[#71717A]">
              <span>{product.category}</span>
              <span aria-hidden="true"> · </span>
              <span>{product.origin}</span>
            </div>

            <div>
              <h2 className="font-display text-2xl font-normal text-[#18181B] leading-snug">
                {product.name}
              </h2>
              <p className="text-lg font-medium font-mono tabular-nums text-[#18181B] mt-1.5">
                ${product.price.toLocaleString()}
              </p>
            </div>

            <p className="text-sm text-[#52525B] leading-relaxed">{product.description}</p>

            {/* Variant Selector */}
            <div className="pt-2">
              <p className="text-xs font-medium text-[#18181B] mb-2">
                Select {product.variantLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3.5 py-2 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] ${
                      selectedVariant === variant
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-[#F8F7F4] text-[#18181B] border-[#E6E3DC] hover:border-[#A1A1AA]'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1EFEA] grid grid-cols-1 gap-3 text-xs">
              <div>
                <span className="text-[#71717A] block">Cut &amp; Dimensions</span>
                <span className="text-[#18181B] font-mono tabular-nums mt-0.5 block">
                  {product.dimensions}
                </span>
              </div>
              <div>
                <span className="text-[#71717A] block">Material</span>
                <span className="text-[#18181B] mt-0.5 block">{product.material}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`w-full py-3 px-4 text-sm font-medium rounded-md transition-colors duration-150 inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] ${
              added
                ? 'bg-[#2D4A3E] text-white'
                : 'bg-[#18181B] text-white hover:bg-[#2D4A3E]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Added to Bag</span>
              </>
            ) : (
              <span>Add to Bag — ${product.price.toLocaleString()}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
