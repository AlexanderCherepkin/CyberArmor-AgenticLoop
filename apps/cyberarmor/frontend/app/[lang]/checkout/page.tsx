'use client';

import { useState } from 'react';
import { useCart } from '@/components/shop/cart-context';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api/client';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const order = await apiFetch('/api/v1/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
          currency: 'USD',
          shipping_address: address,
        }),
      });
      setOrderId(order.id);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  if (orderId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-heading text-3xl font-bold text-cyan">Order received</h1>
        <p className="mt-4 text-platinum/70">Order ID: {orderId}</p>
        <p className="mt-2 text-platinum/50">Payment processing will continue on the next step.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-platinum">Secure Checkout</h1>

        <div className="mt-8 rounded border border-platinum/10 bg-graphite/30 p-6">
          {items.length === 0 ? (
            <p className="text-platinum/50">Your cart is empty.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm text-platinum">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-mono">USD {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex justify-between border-t border-platinum/10 pt-4">
            <span className="font-medium text-platinum">Total</span>
            <span className="font-mono text-xl text-cyan">USD {total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-platinum/80">Shipping address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={4}
              className="w-full rounded border border-platinum/20 bg-obsidian px-4 py-3 text-platinum outline-none transition focus:border-cyan"
            />
          </div>

          {error && <p className="text-sm text-crimson">{error}</p>}

          <Button type="submit" className="w-full" disabled={items.length === 0 || loading}>
            {loading ? 'Processing...' : 'Place Order'}
          </Button>
        </form>
      </div>
    </div>
  );
}
