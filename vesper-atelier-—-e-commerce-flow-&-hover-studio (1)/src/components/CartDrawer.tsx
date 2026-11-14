import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Product } from '../data/products';

export interface CartItem {
  product: Product;
  variant: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, variant: string, delta: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onClearCart: () => void;
}

interface ShippingFormState {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [form, setForm] = useState<ShippingFormState>({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormState, string>>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    total: number;
    itemCount: number;
    recipientName: string;
    destinationCity: string;
  } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 350;
  const shippingCost = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 25;
  const total = subtotal + shippingCost;

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof ShippingFormState, string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Valid email address is required.';
    }
    if (!form.address.trim()) nextErrors.address = 'Street address is required.';
    if (!form.city.trim()) nextErrors.city = 'City is required.';
    if (!form.postalCode.trim()) nextErrors.postalCode = 'Postal code is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setConfirmedOrder({
      orderNumber: `DB-${Math.floor(1000 + Math.random() * 9000)}`,
      total,
      itemCount: totalCount,
      recipientName: form.fullName.trim(),
      destinationCity: form.city.trim(),
    });
    onClearCart();
    setStep('confirmed');
  };

  const handleClose = () => {
    if (step === 'confirmed') {
      setStep('bag');
      setConfirmedOrder(null);
    } else if (step === 'checkout') {
      setStep('bag');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag and checkout"
        className="relative z-10 w-full max-w-md bg-white h-full flex flex-col border-l border-[#E6E3DC] shadow-2xl"
      >
        <div className="px-6 py-5 border-b border-[#E6E3DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' ? (
              <button
                type="button"
                onClick={() => setStep('bag')}
                aria-label="Back to shopping bag"
                className="p-1.5 -ml-1.5 text-[#52525B] hover:text-[#18181B] rounded hover:bg-[#F1EFEA] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <ShoppingBag className="w-4 h-4 text-[#18181B]" aria-hidden="true" />
            )}
            <h2 className="font-display text-lg font-medium text-[#18181B]">
              {step === 'checkout'
                ? 'Shipping & Dispatch'
                : step === 'confirmed'
                ? 'Order Confirmation'
                : `Shopping Bag (${totalCount})`}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close shopping bag"
            className="p-2 text-[#52525B] hover:text-[#18181B] rounded-md hover:bg-[#F1EFEA] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 'confirmed' && confirmedOrder ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#2D4A3E]/10 text-[#2D4A3E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-[#2D4A3E]">
                  Order Confirmed — Preparing Dispatch
                </p>
                <h3 className="font-display text-2xl text-[#18181B]">
                  Order #{confirmedOrder.orderNumber}
                </h3>
                <p className="text-sm text-[#52525B] max-w-xs mx-auto leading-relaxed">
                  Thank you, {confirmedOrder.recipientName}. Preparing {confirmedOrder.itemCount}{' '}
                  {confirmedOrder.itemCount === 1 ? 'piece' : 'pieces'} for insured courier
                  delivery to {confirmedOrder.destinationCity}.
                </p>
              </div>

              <div className="mt-6 p-4 bg-[#F8F7F4] border border-[#E6E3DC] rounded-md text-xs text-left space-y-1.5">
                <div className="flex justify-between text-[#52525B]">
                  <span>Reference</span>
                  <span className="font-mono text-[#18181B]">#{confirmedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between text-[#52525B]">
                  <span>Total Settled</span>
                  <span className="font-mono tabular-nums text-[#18181B]">
                    ${confirmedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="mt-4 inline-flex items-center px-5 py-2.5 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#2D4A3E] rounded-md transition-colors cursor-pointer"
              >
                Return to DASBROTHERS
              </button>
            </div>
          ) : step === 'checkout' ? (
            <form id="dasbrothers-checkout-form" onSubmit={validateAndSubmit} className="space-y-4" noValidate>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Enter your courier delivery details below. Orders over $350 include complimentary
                garment-bag shipping.
              </p>

              <div>
                <label htmlFor="db-fullname" className="block text-xs font-medium text-[#18181B] mb-1">
                  Full Name
                </label>
                <input
                  id="db-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Arthur Pendelton"
                  className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#E6E3DC] rounded-md text-[#18181B] focus:outline-none focus:border-[#18181B]"
                />
                {errors.fullName && (
                  <p className="text-xs text-[#991B1B] mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="db-email" className="block text-xs font-medium text-[#18181B] mb-1">
                  Email Address
                </label>
                <input
                  id="db-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="client@dasbrothers.com"
                  className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#E6E3DC] rounded-md text-[#18181B] focus:outline-none focus:border-[#18181B]"
                />
                {errors.email && <p className="text-xs text-[#991B1B] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="db-address" className="block text-xs font-medium text-[#18181B] mb-1">
                  Street Address
                </label>
                <input
                  id="db-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="14 Savile Terrace"
                  className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#E6E3DC] rounded-md text-[#18181B] focus:outline-none focus:border-[#18181B]"
                />
                {errors.address && <p className="text-xs text-[#991B1B] mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="db-city" className="block text-xs font-medium text-[#18181B] mb-1">
                    City
                  </label>
                  <input
                    id="db-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="London"
                    className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#E6E3DC] rounded-md text-[#18181B] focus:outline-none focus:border-[#18181B]"
                  />
                  {errors.city && <p className="text-xs text-[#991B1B] mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="db-postal" className="block text-xs font-medium text-[#18181B] mb-1">
                    Postal Code
                  </label>
                  <input
                    id="db-postal"
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                    placeholder="W1S 3PR"
                    className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#E6E3DC] rounded-md text-[#18181B] focus:outline-none focus:border-[#18181B]"
                  />
                  {errors.postalCode && (
                    <p className="text-xs text-[#991B1B] mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </form>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm font-medium text-[#18181B]">Your bag is currently empty.</p>
              <p className="text-xs text-[#71717A] max-w-xs mx-auto leading-relaxed">
                Select tailored menswear or bridle leather pieces from the collection to begin an
                order.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F1EFEA]">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.variant}`}
                  className="py-5 first:pt-0 flex gap-4"
                >
                  <div className="w-20 h-20 rounded bg-[#F1EFEA] overflow-hidden shrink-0 border border-[#E6E3DC]">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[#18181B] truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-[#71717A] mt-0.5">{item.variant}</p>
                      </div>
                      <span className="text-sm font-mono font-medium text-[#18181B] tabular-nums shrink-0">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-[#E6E3DC] rounded">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.variant, -1)}
                          aria-label={`Decrease quantity of ${item.product.name}`}
                          className="p-1.5 text-[#52525B] hover:text-[#18181B] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" aria-hidden="true" />
                        </button>
                        <span className="px-2.5 text-xs font-mono tabular-nums text-[#18181B]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.variant, 1)}
                          aria-label={`Increase quantity of ${item.product.name}`}
                          className="p-1.5 text-[#52525B] hover:text-[#18181B] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id, item.variant)}
                        aria-label={`Remove ${item.product.name}`}
                        className="text-xs text-[#71717A] hover:text-[#18181B] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && step !== 'confirmed' && (
          <div className="px-6 py-5 border-t border-[#E6E3DC] bg-[#F8F7F4] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#52525B]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-[#18181B]">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[#52525B]">
                <span>Insured Courier</span>
                <span className="font-mono tabular-nums text-[#18181B]">
                  {shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E6E3DC] flex justify-between text-sm font-semibold text-[#18181B]">
                <span>Total</span>
                <span className="font-mono tabular-nums">${total.toLocaleString()}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 px-4 text-sm font-medium text-white bg-[#18181B] hover:bg-[#2D4A3E] rounded-md transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E]"
              >
                Proceed to Checkout
              </button>
            ) : (
              <button
                type="submit"
                form="dasbrothers-checkout-form"
                className="w-full py-3 px-4 text-sm font-medium text-white bg-[#2D4A3E] hover:bg-[#18181B] rounded-md transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D4A3E]"
              >
                Place Order — ${total.toLocaleString()}
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
