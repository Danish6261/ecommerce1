import { useEffect, useState } from 'react';
import { Atelier3DSection } from './components/Atelier3DSection';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HoverSpecsDrawer } from './components/HoverSpecsDrawer';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AtelierModelId, PRODUCTS, Product } from './data/products';

const CATEGORIES = [
  'All',
  'Outerwear',
  'Suiting & Trousers',
  'Knitwear',
  'Leather Goods',
  'Footwear',
];

const CART_STORAGE_KEY = 'dasbrothers_bag_v1';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selected3DModel, setSelected3DModel] = useState<AtelierModelId>('alder-overcoat');
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHoverSpecsOpen, setIsHoverSpecsOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota restrictions
    }
  }, [cart]);

  const filteredProducts =
    selectedCategory === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  const totalBagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: Product, variant: string) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && item.variant === variant
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, variant: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId && item.variant === variant
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string, variant: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.variant === variant))
    );
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInspect3D = (modelId: AtelierModelId) => {
    setSelected3DModel(modelId);
    scrollToSection('atelier-3d');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#18181B]">
      <Header cartCount={totalBagCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-1">
        <Hero
          onScrollToCollection={() => scrollToSection('collection')}
          onScrollTo3D={() => scrollToSection('atelier-3d')}
        />

        {/* Pure Storefront 3-Column Product Collection */}
        <section id="collection" className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-xl">
              <p className="font-display text-xs font-medium tracking-[0.18em] uppercase text-[#9A7B3E]">
                Permanent Collection · Edition IV
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-medium tracking-[0.01em] text-[#18181B] mt-2"
                style={{ textWrap: 'balance' }}
              >
                Tailored Garments &amp; Bridle Leather
              </h2>
              <p className="text-sm text-[#52525B] mt-2">
                Pause the crosshair over any piece to stream its multi-angle studio reel.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div
              className="flex flex-wrap items-center gap-1 p-1 bg-[#EAE7DF] rounded-lg w-fit"
              role="tablist"
              aria-label="Filter collection by category"
            >
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E] ${
                    selectedCategory === category
                      ? 'bg-white text-[#18181B] shadow-sm'
                      : 'text-[#52525B] hover:text-[#18181B]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onQuickView={setQuickViewProduct}
                onInspect3D={handleInspect3D}
              />
            ))}
          </div>
        </section>

        {/* Interactive Three.js 3D Atelier Scenes */}
        <Atelier3DSection
          selectedModel={selected3DModel}
          onSelectModel={setSelected3DModel}
        />

        {/* Craftsmanship Story Band */}
        <section id="craftsmanship" className="border-t border-[#E6E3DC] bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="max-w-2xl mb-12">
              <p className="font-display text-xs font-medium tracking-[0.18em] uppercase text-[#9A7B3E]">
                Material Provenance · DASBROTHERS Standard
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-medium tracking-[0.01em] text-[#18181B] mt-2"
                style={{ textWrap: 'balance' }}
              >
                Cut from Traceable Cloth, Finished by Hand
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <p className="font-mono text-xs font-medium text-[#71717A] mb-2">01. Tailored Cloth</p>
                <h3 className="font-display text-lg font-medium text-[#18181B] mb-2">
                  Full-Canvas Construction
                </h3>
                <p className="text-sm text-[#52525B] leading-relaxed">
                  Our coats and pleated trousers pair high-twist Bishu gabardine and 580g Biella
                  virgin merino with floating horsehair canvases that mold naturally over years of
                  wear.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs font-medium text-[#71717A] mb-2">
                  02. Bridle &amp; Calfskin
                </p>
                <h3 className="font-display text-lg font-medium text-[#18181B] mb-2">
                  Vegetable-Tanned Hides
                </h3>
                <p className="text-sm text-[#52525B] leading-relaxed">
                  Every weekender and folio is cut from pit-tanned Walsall bridle leather and
                  Tuscan calfskin, saddle-stitched with waxed linen thread and solid cast brass.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs font-medium text-[#71717A] mb-2">
                  03. Spatial Inspection
                </p>
                <h3 className="font-display text-lg font-medium text-[#18181B] mb-2">
                  3D &amp; Multi-Angle Flow
                </h3>
                <p className="text-sm text-[#52525B] leading-relaxed">
                  Inspect garment silhouettes and leather hardware in real-time 3D or pause your
                  crosshair over any product frame to preview all four studio camera angles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E6E3DC] bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <span className="font-display text-sm font-semibold tracking-[0.14em] text-[#18181B]">
            DASBROTHERS
          </span>
          <div className="flex items-center gap-6">
            <a href="#collection" className="hover:text-[#18181B] transition-colors">
              Collection
            </a>
            <a href="#atelier-3d" className="hover:text-[#18181B] transition-colors">
              3D Atelier
            </a>
            <a href="#tailoring" className="hover:text-[#18181B] transition-colors">
              Tailoring
            </a>
            <a href="#craftsmanship" className="hover:text-[#18181B] transition-colors">
              Craftsmanship
            </a>
            <button
              type="button"
              onClick={() => setIsHoverSpecsOpen(true)}
              className="hover:text-[#18181B] transition-colors cursor-pointer"
            >
              Hover Specs
            </button>
          </div>
          <span>Royal Tailoring &amp; Bridle Leather</span>
        </div>
      </footer>

      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />

      <HoverSpecsDrawer
        isOpen={isHoverSpecsOpen}
        onClose={() => setIsHoverSpecsOpen(false)}
      />
    </div>
  );
}
