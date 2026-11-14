export type HoverStyleId =
  | 'scale-scrim'
  | 'quick-add-slide'
  | 'dual-view-fade'
  | 'elevation-lift'
  | 'perspective-tilt'
  | 'border-trace';

export type AtelierModelId = 'alder-overcoat' | 'kessler-weekender' | 'vance-derby';

export interface HoverStyleDefinition {
  id: HoverStyleId;
  name: string;
  shortLabel: string;
  timing: string;
  summary: string;
  cssRule: string;
  productExample: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  material: string;
  price: number;
  dimensions: string;
  origin: string;
  availability: string;
  description: string;
  image: string;
  angleImage: string;
  angleLabels: [string, string, string, string];
  variantLabel: string;
  variants: string[];
  hoverStyle: HoverStyleId;
  detailNote: string;
  atelierModelId?: AtelierModelId;
}

export const HERO_IMAGE = '/src/assets/images/hero_dasbrothers_tailoring_1794645348653.jpg';

export const HOVER_STYLES: HoverStyleDefinition[] = [
  {
    id: 'scale-scrim',
    name: '01. Editorial Scale & Scrim',
    shortLabel: 'Scale & Scrim',
    timing: '180ms cubic-bezier(0.16, 1, 0.3, 1)',
    summary:
      'Image gently scales 1.05x within its frame while a measured contrast scrim reveals garment and fabric specification details.',
    cssRule:
      'img { transition: transform 180ms cubic-bezier(0.16,1,0.3,1); } .card:hover img { transform: scale(1.05); } .scrim { opacity: 0 -> 1; }',
    productExample: 'Alder Double-Breasted Overcoat',
  },
  {
    id: 'quick-add-slide',
    name: '02. Quick-Add Drawer Slide',
    shortLabel: 'Quick-Add Slide',
    timing: '180ms cubic-bezier(0.16, 1, 0.3, 1)',
    summary:
      'An anchored action bar glides upward from the lower edge on pointer entry for zero-friction bag additions.',
    cssRule:
      '.quick-bar { transform: translateY(100%); transition: transform 180ms cubic-bezier(0.16,1,0.3,1); } .card:hover .quick-bar { transform: translateY(0); }',
    productExample: 'Kessler Bridle Leather Weekender',
  },
  {
    id: 'dual-view-fade',
    name: '03. Macro Detail Crossfade',
    shortLabel: 'Macro Crossfade',
    timing: '200ms ease-out',
    summary:
      'Crossfades seamlessly into a zoomed material weave or grain study with craftsmanship metadata overlaid on top.',
    cssRule:
      '.detail-layer { opacity: 0; transform: scale(1.16); transition: opacity 200ms ease-out; } .card:hover .detail-layer { opacity: 1; }',
    productExample: 'Morin Pleated Gabardine Trousers',
  },
  {
    id: 'elevation-lift',
    name: '04. Architectural Elevation Lift',
    shortLabel: 'Elevation Lift',
    timing: '160ms cubic-bezier(0.16, 1, 0.3, 1)',
    summary:
      'Card lifts 4px along the Y-axis as a crisp diffused shadow and subtle border contrast settle beneath it.',
    cssRule:
      '.card { transition: transform 160ms cubic-bezier(0.16,1,0.3,1), box-shadow 160ms ease; } .card:hover { transform: translateY(-4px); }',
    productExample: 'Bramwell Cashmere Rib Rollneck',
  },
  {
    id: 'perspective-tilt',
    name: '05. Cursor Perspective Tilt',
    shortLabel: 'Perspective Tilt',
    timing: '140ms compositor transform',
    summary:
      'Tracks pointer coordinates inside the card bounds for subtle 3.5deg axial tilt and directional sheen.',
    cssRule:
      'transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)); transition: transform 140ms cubic-bezier(0.16,1,0.3,1);',
    productExample: 'Sorensen Calfskin Folio Briefcase',
  },
  {
    id: 'border-trace',
    name: '06. Hairline Underline & Frame Trace',
    shortLabel: 'Underline & Trace',
    timing: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
    summary:
      'Minimal gallery presentation where an underline sweeps left-to-right across the product title and a crisp corner arrow glides in.',
    cssRule:
      '.title-line { transform: scaleX(0); transform-origin: left; transition: transform 200ms cubic-bezier(0.16,1,0.3,1); } .card:hover .title-line { transform: scaleX(1); }',
    productExample: 'Vance Shell Cordovan Derby Boots',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'alder-overcoat',
    name: 'Alder Double-Breasted Overcoat',
    category: 'Outerwear',
    material: '580g Virgin Merino Wool',
    price: 1180,
    dimensions: 'Back Length 114 cm · Drop 7 Tailored Cut',
    origin: 'Biella Mill · Porto Atelier',
    availability: 'In Stock',
    description:
      'Full-canvas double-breasted architectural overcoat cut with a roped shoulder, wide peak lapels, and genuine horn buttons from 580g Italian virgin wool.',
    image: '/src/assets/images/product_alder_overcoat_1794645348955.jpg',
    angleImage: '/src/assets/images/angle_alder_overcoat_1794645873032.jpg',
    angleLabels: [
      'Front Lapel Silhouette',
      'Rear Center-Vent Drape',
      'Merino Herringbone Macro',
      'Roped Shoulder Profile',
    ],
    variantLabel: 'Size',
    variants: ['46 EU / S', '48 EU / M', '50 EU / L', '52 EU / XL'],
    hoverStyle: 'scale-scrim',
    detailNote: '580g Biella virgin wool · Full Bemberg cupro lining',
    atelierModelId: 'alder-overcoat',
  },
  {
    id: 'kessler-weekender',
    name: 'Kessler Bridle Leather Weekender',
    category: 'Leather Goods',
    material: 'Full-Grain English Bridle',
    price: 940,
    dimensions: '520 × 270 × 290 mm · 40L Cabin Volume',
    origin: 'Walsall Tannery · Florence Craft',
    availability: 'In Stock',
    description:
      'Structured overnight duffel crafted from vegetable-tanned dark espresso bridle leather with hand-rolled handles, solid brass buckles, and heavy cotton twill lining.',
    image: '/src/assets/images/product_kessler_weekender_1794645349686.jpg',
    angleImage: '/src/assets/images/angle_kessler_weekender_1794645874822.jpg',
    angleLabels: [
      'Three-Quarter Exterior',
      'Open Twill Interior',
      'Bridle Hide Grain Macro',
      'Cast Brass Hardware',
    ],
    variantLabel: 'Hide Finish',
    variants: ['Dark Espresso Bridle', 'Blackened Chestnut'],
    hoverStyle: 'quick-add-slide',
    detailNote: 'Vegetable-tanned bridle hide · Solid cast brass fittings',
    atelierModelId: 'kessler-weekender',
  },
  {
    id: 'morin-trousers',
    name: 'Morin Pleated Gabardine Trousers',
    category: 'Suiting & Trousers',
    material: 'Japanese Wool Gabardine',
    price: 410,
    dimensions: 'High Rise · 21.5 cm Hem Opening',
    origin: 'Bishu Looms · Milan Tailoring',
    availability: 'In Stock',
    description:
      'Double-pleated tailored trousers woven in Bishu from high-twist dry-hand wool gabardine, featuring an extended horn-button waistband and clean drape.',
    image: '/src/assets/images/product_morin_trousers_1794645350480.jpg',
    angleImage: '/src/assets/images/angle_morin_trousers_1794645873900.jpg',
    angleLabels: [
      'Extended Waistband Fold',
      'Brass Side-Tab Profile',
      'Bishu Twill Weave Macro',
      'Double Pleat Fall',
    ],
    variantLabel: 'Waist',
    variants: ['30 / 46', '32 / 48', '34 / 50', '36 / 52'],
    hoverStyle: 'dual-view-fade',
    detailNote: 'High-twist Bishu wool · Hand-finished pick stitching',
  },
  {
    id: 'bramwell-knitwear',
    name: 'Bramwell Cashmere Rib Rollneck',
    category: 'Knitwear',
    material: '70% Merino · 30% Cashmere',
    price: 365,
    dimensions: '5-Gauge Heavyweight Fisherman Rib',
    origin: 'Hawick Mill, Scotland',
    availability: 'Limited Run',
    description:
      'Knitted in Hawick using pure Scottish spring water for exceptional loft, pairing resilient fine merino structure with brushed cashmere warmth.',
    image: '/src/assets/images/product_bramwell_knitwear_1794645349941.jpg',
    angleImage: '/src/assets/images/angle_bramwell_knitwear_1794645874892.jpg',
    angleLabels: [
      'Folded Ribbed Presentation',
      'Linked Saddle Shoulder',
      '5-Gauge Cashmere Macro',
      'Turned Rollneck Collar',
    ],
    variantLabel: 'Size',
    variants: ['S', 'M', 'L', 'XL'],
    hoverStyle: 'elevation-lift',
    detailNote: '5-gauge saddle shoulder · Zero-twist Scottish yarn',
  },
  {
    id: 'sorensen-folio',
    name: 'Sorensen Calfskin Folio Briefcase',
    category: 'Leather Goods',
    material: 'Vegetable-Tanned Calfskin',
    price: 590,
    dimensions: '380 × 275 × 45 mm · Fits 16" Laptop',
    origin: 'Tuscany Tannery · Milan Bench',
    availability: 'In Stock',
    description:
      'Slim architectural document and laptop folio saddle-stitched in cognac Tuscan calfskin with edge-painted seams and brushed Excella brass zip.',
    image: '/src/assets/images/product_sorensen_folio_1794645369842.jpg',
    angleImage: '/src/assets/images/angle_sorensen_folio_1794645875411.jpg',
    angleLabels: [
      'Closed Architectural Profile',
      'Open Gusset & Suede Lining',
      'Saddle Stitch Seam Macro',
      'Brushed Brass Clasp',
    ],
    variantLabel: 'Leather Tone',
    variants: ['Cognac Calfskin', 'Espresso Calfskin'],
    hoverStyle: 'perspective-tilt',
    detailNote: 'Full-grain Tuscan calf · Solid brass Excella zip',
  },
  {
    id: 'vance-derby',
    name: 'Vance Shell Cordovan Derby Boots',
    category: 'Footwear',
    material: 'Horween Shell Cordovan',
    price: 890,
    dimensions: '360° Goodyear Storm Welt · Dainite Sole',
    origin: 'Northampton Workshop',
    availability: 'In Stock',
    description:
      'Bench-made service derby boots lasted in dark espresso Horween shell cordovan, built on a cork-filled Goodyear storm welt for decades of resoling.',
    image: '/src/assets/images/product_vance_derby_1794645351507.jpg',
    angleImage: '/src/assets/images/angle_vance_derby_1794645875964.jpg',
    angleLabels: [
      'Three-Quarter Last Profile',
      'Rear Stacked Heel & Welt',
      'Shell Cordovan Luster Macro',
      'Brass Speed-Hook Quarter',
    ],
    variantLabel: 'UK Size',
    variants: ['UK 8', 'UK 9', 'UK 10', 'UK 11'],
    hoverStyle: 'border-trace',
    detailNote: 'Hand-lasted Horween cordovan · Cork midsole footbed',
    atelierModelId: 'vance-derby',
  },
];
