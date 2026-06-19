'use client';

import Link from 'next/link';
import { useCart } from './cart-context';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, total, count, updateQuantity, removeItem } = useCart();

  if (!isOpen) return null;

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
                      {item.currency} {item.price.toFixed(2)}
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
                      {item.currency} {(item.price * item.quantity).toFixed(2)}
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
        </div>

        <div className="border-t border-platinum/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-platinum/70">Total</span>
            <span className="font-mono text-xl text-cyan">USD {total.toFixed(2)}</span>
          </div>
          <Link href="/en/checkout" className="mt-4 block w-full" onClick={() => setIsOpen(false)}>
            <Button className="w-full" disabled={items.length === 0}>Checkout</Button>
          </Link>
        </div>
      </aside>
    </div>
  );
}
