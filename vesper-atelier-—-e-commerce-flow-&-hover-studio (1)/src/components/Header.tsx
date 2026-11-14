import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export function Header({ cartCount, onOpenCart }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-[#E6E3DC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Royal Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-lg sm:text-xl font-semibold tracking-[0.14em] text-[#18181B] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] rounded-sm"
        >
          DASBROTHERS
        </a>

        {/* Zone 2: 4 Single-line Navigation Links (Zero Hover Specs in Header) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#52525B]" aria-label="Primary">
          <a
            href="#collection"
            className="relative py-1 hover:text-[#18181B] transition-colors duration-150 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-[#18181B] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200 ease-flow"
          >
            Collection
          </a>
          <a
            href="#atelier-3d"
            className="relative py-1 hover:text-[#18181B] transition-colors duration-150 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-[#18181B] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200 ease-flow"
          >
            3D Atelier
          </a>
          <a
            href="#tailoring"
            className="relative py-1 hover:text-[#18181B] transition-colors duration-150 whitespace-nowrap shrink-0 after:content-[''] after:left-0 after:bottom-0 after:h-px after:w-full after:bg-[#18181B] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200 ease-flow"
          >
            Tailoring
          </a>
          <a
            href="#craftsmanship"
            className="relative py-1 hover:text-[#18181B] transition-colors duration-150 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-[#18181B] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200 ease-flow"
          >
            Craftsmanship
          </a>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#18181B] hover:bg-[#2D4A3E] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F7F4]"
            aria-label={`Open shopping bag, ${cartCount} items`}
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="tabular-nums">Bag ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
