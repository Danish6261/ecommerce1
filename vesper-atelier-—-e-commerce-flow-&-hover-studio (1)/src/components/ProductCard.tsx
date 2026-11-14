import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Box, Check, Package, Plus } from 'lucide-react';
import { AtelierModelId, Product } from '../data/products';
import { MultiAngleHoverVideo } from './MultiAngleHoverVideo';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: string) => void;
  onQuickView: (product: Product) => void;
  onInspect3D?: (modelId: AtelierModelId) => void;
}

const CROSSHAIR_DWELL_MS = 220;

export function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  onInspect3D,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isHoveringMedia, setIsHoveringMedia] = useState(false);
  const [dwellActive, setDwellActive] = useState(false);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [tilt, setTilt] = useState<{ rx: number; ry: number; gx: number; gy: number }>({
    rx: 0,
    ry: 0,
    gx: 50,
    gy: 50,
  });

  const dwellTimerRef = useRef<number | null>(null);
  const activeHoverStyle = product.hoverStyle;

  useEffect(() => {
    return () => {
      if (dwellTimerRef.current !== null) {
        window.clearTimeout(dwellTimerRef.current);
      }
    };
  }, []);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, product.variants[0]);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeHoverStyle !== 'perspective-tilt') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 7;
    const rx = (0.5 - py) * 7;
    setTilt({ rx, ry, gx: px * 100, gy: py * 100 });
  };

  const handleCardPointerLeave = () => {
    if (activeHoverStyle === 'perspective-tilt') {
      setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
    }
  };

  // Track crosshair movement inside image frame; play multi-angle video when crosshair stops
  const handleMediaPointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsHoveringMedia(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setCrosshair({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
    if (dwellTimerRef.current !== null) window.clearTimeout(dwellTimerRef.current);
    dwellTimerRef.current = window.setTimeout(() => {
      setDwellActive(true);
    }, CROSSHAIR_DWELL_MS);
  };

  const handleMediaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nextX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const nextY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    // Only reset dwell timer if crosshair actually moved meaningfully (> 0.6%)
    const dist = Math.hypot(nextX - crosshair.x, nextY - crosshair.y);
    setCrosshair({ x: nextX, y: nextY });

    if (dist > 0.6) {
      setDwellActive(false);
      if (dwellTimerRef.current !== null) window.clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = window.setTimeout(() => {
        setDwellActive(true);
      }, CROSSHAIR_DWELL_MS);
    }
  };

  const handleMediaPointerLeave = () => {
    setIsHoveringMedia(false);
    setDwellActive(false);
    if (dwellTimerRef.current !== null) {
      window.clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  };

  const cardTransformStyle =
    activeHoverStyle === 'perspective-tilt'
      ? {
          transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: 'transform 140ms cubic-bezier(0.16, 1, 0.3, 1)',
        }
      : undefined;

  const isElevation = activeHoverStyle === 'elevation-lift';
  const isBorderTrace = activeHoverStyle === 'border-trace';

  return (
    <article
      onPointerMove={handleCardPointerMove}
      onPointerLeave={handleCardPointerLeave}
      style={cardTransformStyle}
      className={`group relative flex flex-col bg-white rounded-lg border border-[#E6E3DC] overflow-hidden transition-[transform,box-shadow,border-color] duration-200 ease-flow ${
        isElevation
          ? 'hover:-translate-y-1 hover:shadow-[0_14px_30px_-12px_rgba(24,24,27,0.14)] hover:border-[#C9C3B8]'
          : isBorderTrace
          ? 'hover:border-[#18181B]'
          : 'hover:border-[#D4CFC4]'
      }`}
    >
      {/* 4:3 Media Frame with Crosshair Dwell -> Multi-Angle Video Reel */}
      <div
        onClick={() => onQuickView(product)}
        onPointerEnter={handleMediaPointerEnter}
        onPointerMove={handleMediaPointerMove}
        onPointerLeave={handleMediaPointerLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onQuickView(product);
          }
        }}
        aria-label={`Inspect ${product.name}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFECE5] cursor-crosshair focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2D4A3E]"
      >
        {!imgError ? (
          <>
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-[transform,opacity] duration-200 ease-flow ${
                activeHoverStyle === 'scale-scrim'
                  ? 'group-hover:scale-105'
                  : activeHoverStyle === 'dual-view-fade'
                  ? 'group-hover:opacity-0'
                  : 'group-hover:scale-[1.02]'
              }`}
            />

            {/* Hover Style 03: Macro Detail Crossfade Layer */}
            {activeHoverStyle === 'dual-view-fade' && (
              <img
                src={product.angleImage}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover scale-[1.08] contrast-105 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-[#71717A] bg-gradient-to-br from-[#F1EFEA] to-[#E5E1D8]">
            <Package className="w-8 h-8 opacity-60" aria-hidden="true" />
            <span className="text-xs font-medium text-center">{product.name}</span>
          </div>
        )}

        {/* Multi-Angle Clothing/Leather Video Stream (Plays when crosshair stops on image) */}
        <MultiAngleHoverVideo
          active={dwellActive && !imgError}
          primaryImage={product.image}
          angleImage={product.angleImage}
          angleLabels={product.angleLabels}
          productName={product.name}
        />

        {/* Subtle Architectural Crosshair Reticle while pointer moves */}
        {isHoveringMedia && !dwellActive && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${crosshair.x}%`, top: `${crosshair.y}%` }}
            aria-hidden="true"
          >
            <div className="w-7 h-7 rounded-full border border-white/90 shadow-sm flex items-center justify-center bg-black/15">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>
        )}

        {/* Hover Style 01: Editorial Scale & Scrim Overlay */}
        {activeHoverStyle === 'scale-scrim' && !dwellActive && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-flow flex flex-col justify-end p-5">
            <p className="text-xs font-medium text-white/95 translate-y-1.5 group-hover:translate-y-0 transition-transform duration-200 ease-flow">
              {product.detailNote}
            </p>
          </div>
        )}

        {/* Hover Style 02: Quick-Add Drawer Slide */}
        {activeHoverStyle === 'quick-add-slide' && (
          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-flow bg-white/95 border-t border-[#E6E3DC] px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-xs text-[#52525B] truncate">{product.variants[0]}</span>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#2D4A3E] rounded transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E]"
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Hover Style 03: Macro Detail Metadata Reveal */}
        {activeHoverStyle === 'dual-view-fade' && !dwellActive && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out flex items-end justify-between p-5 gap-2">
            <span className="text-xs text-white/95 truncate">{product.dimensions}</span>
            <span className="text-xs text-white/80 shrink-0">{product.origin}</span>
          </div>
        )}

        {/* Hover Style 05: Directional Sheen */}
        {activeHoverStyle === 'perspective-tilt' && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{
              background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 60%)`,
            }}
          />
        )}

        {/* Hover Style 06: Corner Arrow Glide */}
        {activeHoverStyle === 'border-trace' && (
          <div className="pointer-events-none absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 border border-[#E6E3DC] flex items-center justify-center opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-[transform,opacity] duration-200 ease-flow">
            <ArrowUpRight className="w-4 h-4 text-[#18181B]" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Card Body — Identical Field Order & Clean Zero-Pill Metadata */}
      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#71717A]">
            <span className="truncate">
              {product.category} · {product.material}
            </span>
            <span className="shrink-0 text-[#52525B]">{product.availability}</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-3">
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] rounded-sm cursor-pointer"
            >
              <h3 className="font-display text-[15px] font-medium text-[#18181B] leading-snug tracking-[0.01em]">
                <span
                  className={
                    isBorderTrace
                      ? 'relative inline-block after:content-[""] after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-[#18181B] after:scale-x-0 group-hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200 ease-flow'
                      : ''
                  }
                >
                  {product.name}
                </span>
              </h3>
            </button>
            <span className="font-mono text-[15px] font-medium text-[#18181B] tabular-nums shrink-0">
              ${product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer Row: Origin / 3D Link & Add to Bag */}
        <div className="pt-3 border-t border-[#F1EFEA] flex items-center justify-between gap-3">
          {product.atelierModelId && onInspect3D ? (
            <button
              type="button"
              onClick={() => onInspect3D(product.atelierModelId!)}
              className="inline-flex items-center gap-1.5 text-xs text-[#2D4A3E] hover:text-[#18181B] font-medium transition-colors cursor-pointer truncate"
            >
              <Box className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">View in 3D</span>
            </button>
          ) : (
            <span className="text-xs text-[#71717A] truncate">{product.origin}</span>
          )}

          <button
            type="button"
            onClick={handleAdd}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] ${
              justAdded
                ? 'bg-[#2D4A3E] text-white'
                : 'bg-[#F1EFEA] text-[#18181B] hover:bg-[#18181B] hover:text-white'
            }`}
          >
            {justAdded ? 'Added to Bag' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </article>
  );
}
