import { useState } from 'react';
import { ArrowDownRight, Briefcase, Box } from 'lucide-react';
import { HERO_IMAGE } from '../data/products';

interface HeroProps {
  onScrollToCollection: () => void;
  onScrollTo3D: () => void;
}

export function Hero({ onScrollToCollection, onScrollTo3D }: HeroProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="top" className="border-b border-[#E6E3DC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
        {/* Asymmetric 50/50 Editorial Flow Split — Pure Hero with Zero Hover Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              <p className="font-display text-xs font-medium tracking-[0.2em] uppercase text-[#9A7B3E]">
                Royal Heritage · Tailoring &amp; Bridle Leather
              </p>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[3.2rem] font-medium tracking-[0.02em] leading-[1.12] text-[#18181B]"
                style={{ textWrap: 'balance' }}
              >
                Tailored Majesty, Crafted for Longevity.
              </h1>

              <p className="text-base text-[#52525B] leading-relaxed max-w-md">
                DASBROTHERS unites architectural Savile-inspired outerwear and Japanese wool suiting
                with vegetable-tanned English bridle leather across sovereign European workshops.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onScrollToCollection}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#18181B] hover:bg-[#2D4A3E] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] focus-visible:ring-offset-2"
                >
                  <span>Shop Collection</span>
                  <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={onScrollTo3D}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#18181B] bg-white border border-[#D4CFC4] hover:border-[#18181B] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] focus-visible:ring-offset-2"
                >
                  <Box className="w-4 h-4 text-[#2D4A3E]" aria-hidden="true" />
                  <span>Inspect 3D Atelier</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Full-Bleed Showroom Media (Clean, zero hover-spec overlay) */}
          <div className="lg:col-span-6">
            <div className="relative w-full h-full min-h-[360px] lg:min-h-[500px] overflow-hidden rounded-lg bg-[#EAE7DF] border border-[#E6E3DC]">
              {!imgError ? (
                <img
                  src={HERO_IMAGE}
                  alt="DASBROTHERS tailored charcoal double-breasted wool coat and espresso bridle leather weekender bag"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8 text-[#52525B] bg-gradient-to-br from-[#F1EFEA] to-[#E2DFD7]">
                  <Briefcase className="w-10 h-10 opacity-60" aria-hidden="true" />
                  <span className="text-sm font-medium">DASBROTHERS Showroom Edition</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4-Column Provenance Strip */}
        <div id="tailoring" className="mt-12 pt-8 border-t border-[#E6E3DC] grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-[#71717A]">Partner Cloth Mills</p>
            <p className="font-display text-base sm:text-lg font-medium text-[#18181B] mt-1">
              Biella · Bishu · Hawick
            </p>
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Tannery Provenance</p>
            <p className="font-display text-base sm:text-lg font-medium text-[#18181B] mt-1">
              Walsall &amp; Tuscany
            </p>
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Studio Dispatch</p>
            <p className="text-base sm:text-lg font-medium text-[#18181B] mt-1 font-mono tabular-nums">
              24–48 Hours
            </p>
          </div>
          <div>
            <p className="text-xs text-[#71717A]">Complimentary Courier</p>
            <p className="text-base sm:text-lg font-medium text-[#18181B] mt-1 font-mono tabular-nums">
              Orders Over $350
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
