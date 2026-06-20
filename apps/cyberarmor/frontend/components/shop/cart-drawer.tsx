'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from './cart-context';
import { X, Minus, Plus, ShoppingBag, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetchJson } from '@/lib/api/client';
import { formatCents } from '@/lib/utils';
import { ProductCardProduct } from './product-card';

const UPSELL_SLUGS = ['securekey-case', 'securekey-spare'];

export function CartDrawer() {
  const { items, isOpen, setIsOpen, total_cents, count, updateQuantity, removeItem, addItem } = useCart();
  const [upsells, setUpsells] = useState<ProductCardProduct[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    apiFetchJson<ProductCardProduct[]>('/products')
      .then((products) => {
        setUpsells(products.filter((p) => UPSELL_SLUGS.includes(p.slug)));
      })
      .catch(() => setUpsells([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const itemIds = new Set(items.map((i) => i.id));

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-graphite shadow-2xl">
        <div className="flex items-center justify-between border-b border-platinum/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-cyan" />
            <span className="font-heading font-semibold text-platinum">Your cart ({count})</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-platinum/60 hover:text-cyan"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-center text-platinum/50">Your cart is empty.</p>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-platinum">{item.name}</p>
                    <p className="text-sm text-platinum/50">
                      {formatCents(item.price_cents, item.currency)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="rounded border border-platinum/20 p-1 text-platinum hover:border-cyan"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm text-platinum">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="rounded border border-platinum/20 p-1 text-platinum hover:border-cyan"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-platinum">
                      {formatCents(item.price_cents * item.quantity, item.currency)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-1 text-xs text-crimson hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {upsells.length > 0 && (
            <div className="mt-8 border-t border-platinum/10 pt-6">
              <p className="font-heading text-sm font-semibold uppercase tracking-wider text-platinum/70">
                Enhance your setup
              </p>
              <div className="mt-4 space-y-3">
                {upsells
                  .filter((u) => !itemIds.has(u.id))
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border border-platinum/10 bg-obsidian/50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-platinum">{product.name}</p>
                        <p className="text-xs text-platinum/50">{formatCents(product.price_cents, product.currency)}</p>
                      </div>
                      <button
                        onClick={() =>
                          addItem({
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            price_cents: product.price_cents,
                            currency: product.currency,
                          })
                        }
                        className="flex items-center gap-1 rounded border border-cyan/30 px-3 py-1 text-xs font-semibold text-cyan transition hover:bg-cyan/10"
                      >
                        <PlusCircle className="h-3 w-3" />
                        Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-platinum/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-platinum/70">Total</span>
            <span className="font-mono text-xl text-cyan">{formatCents(total_cents)}</span>
          </div>
          <Link href="/en/checkout" className="mt-4 block w-full" onClick={() => setIsOpen(false)}>
            <Button className="w-full" disabled={items.length === 0}>Checkout</Button>
          </Link>
        </div>
      </aside>
    </div>
  );
}
