'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '@/components/shop/cart-context';
import { useAuth } from '@/components/auth/auth-context';
import { Button } from '@/components/ui/button';
import { apiFetchJson } from '@/lib/api/client';
import { formatCents } from '@/lib/utils';
import { Locale } from '@/lib/i18n/config';
import { ProductCardProduct } from '@/components/shop/product-card';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock');

const SHIPPING_COSTS = {
  standard: 1500,
  express: 3500,
};

const UPSELL_SLUGS = ['securekey-case', 'securekey-spare'];

interface CheckoutPageProps {
  params: { lang: Locale };
}

interface ShippingForm {
  recipient_name: string;
  line_1: string;
  line_2: string;
  city: string;
  postal_code: string;
  country: string;
}

interface PromoResult {
  code: string;
  discount_percent: number | null;
  discount_amount_cents: number | null;
  valid: boolean;
  reason?: string;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const { items, total_cents, count, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<ShippingForm>({
    recipient_name: '',
    line_1: '',
    line_2: '',
    city: '',
    postal_code: '',
    country: '',
  });
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [upsells, setUpsells] = useState<ProductCardProduct[]>([]);

  useEffect(() => {
    if (!user) {
      router.push(`/${lang}/account/login?returnTo=/${lang}/checkout`);
    }
  }, [user, router, lang]);

  useEffect(() => {
    apiFetchJson<ProductCardProduct[]>('/products')
      .then((products) => setUpsells(products.filter((p) => UPSELL_SLUGS.includes(p.slug))))
      .catch(() => setUpsells([]));
  }, []);

  const quantity = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const bulkDiscountPercent = useMemo(() => {
    if (quantity >= 50) return 15;
    if (quantity >= 10) return 10;
    if (quantity >= 2) return 5;
    return 0;
  }, [quantity]);

  const bulkDiscountCents = useMemo(
    () => Math.floor((total_cents * bulkDiscountPercent) / 100),
    [total_cents, bulkDiscountPercent]
  );

  const promoDiscountCents = useMemo(() => {
    if (!promo?.valid || !promo.discount_percent) return 0;
    return Math.floor((total_cents * promo.discount_percent) / 100);
  }, [total_cents, promo]);

  const discountCents = Math.max(bulkDiscountCents, promoDiscountCents);
  const taxCents = 0;
  const shippingCents = SHIPPING_COSTS[shippingMethod];
  const finalTotalCents = total_cents - discountCents + taxCents + shippingCents;

  async function applyPromo() {
    setPromoError(null);
    if (!promoCode) return;
    try {
      const result = await apiFetchJson<PromoResult>('/checkout/validate-promo', {
        method: 'POST',
        body: JSON.stringify({ code: promoCode, item_count: count }),
      });
      if (result.valid) {
        setPromo(result);
      } else {
        setPromoError(result.reason || 'Invalid promo code');
        setPromo(null);
      }
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : 'Failed to validate promo');
      setPromo(null);
    }
  }

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const order = await apiFetchJson<{ id: string }>('/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
          currency: 'USD',
          shipping_address: address,
          shipping_method: shippingMethod,
          promo_code: promo?.valid ? promo.code : null,
        }),
      });

      const intent = await apiFetchJson<{ client_secret: string }>(`/payments/orders/${order.id}/payment-intent`, {
        method: 'POST',
      });

      setOrderId(order.id);
      setClientSecret(intent.client_secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const itemIds = new Set(items.map((i) => i.id));

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-platinum">
          {isRu ? 'Оформление заказа' : 'Secure Checkout'}
        </h1>

        <div className="mt-8 cyber-card-sharp">
          {items.length === 0 ? (
            <p className="text-platinum/50">{isRu ? 'Корзина пуста.' : 'Your cart is empty.'}</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm text-platinum">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-mono">{formatCents(item.price_cents * item.quantity, item.currency)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 space-y-1 border-t border-platinum/10 pt-4 text-sm">
            <div className="flex justify-between text-platinum/70">
              <span>{isRu ? 'Подытог' : 'Subtotal'}</span>
              <span className="font-mono">{formatCents(total_cents)}</span>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between text-cyan">
                <span>{isRu ? 'Скидка' : 'Discount'}</span>
                <span className="font-mono">-{formatCents(discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-platinum/70">
              <span>{isRu ? 'Налог' : 'Tax'}</span>
              <span className="font-mono">{formatCents(taxCents)}</span>
            </div>
            <div className="flex justify-between text-platinum/70">
              <span>{isRu ? 'Доставка' : 'Shipping'}</span>
              <span className="font-mono">{formatCents(shippingCents)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-medium text-platinum">{isRu ? 'Итого' : 'Total'}</span>
              <span className="font-mono text-xl text-cyan">{formatCents(finalTotalCents)}</span>
            </div>
          </div>
        </div>

        {upsells.filter((u) => !itemIds.has(u.id)).length > 0 && (
          <div className="mt-6 cyber-card-sharp">
            <p className="font-heading text-sm font-semibold uppercase tracking-wider text-platinum/70">
              {isRu ? 'Добавьте к заказу' : 'Add to your order'}
            </p>
            <div className="mt-3 space-y-3">
              {upsells
                .filter((u) => !itemIds.has(u.id))
                .map((product) => (
                  <UpsellRow key={product.id} product={product} lang={lang} />
                ))}
            </div>
          </div>
        )}

        {orderId && clientSecret ? (
          <div className="mt-8">
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
              <PaymentForm orderId={orderId} lang={lang} clearCart={clearCart} />
            </Elements>
          </div>
        ) : (
          <form onSubmit={createOrder} className="mt-8 space-y-5">
            {[
              { key: 'recipient_name', label: isRu ? 'Полное имя' : 'Full name' },
              { key: 'line_1', label: isRu ? 'Адрес' : 'Address line 1' },
              { key: 'line_2', label: isRu ? 'Адрес 2 (необязательно)' : 'Address line 2 (optional)' },
              { key: 'city', label: isRu ? 'Город' : 'City' },
              { key: 'postal_code', label: isRu ? 'Индекс' : 'Postal code' },
              { key: 'country', label: isRu ? 'Страна (2 буквы)' : 'Country code (2 letters)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-platinum/80">
                  {label}
                </label>
                <input
                  id={key}
                  type="text"
                  required={key !== 'line_2'}
                  value={address[key as keyof ShippingForm]}
                  onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="cyber-input-sharp mt-2 w-full"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-platinum/80">
                {isRu ? 'Способ доставки' : 'Shipping method'}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(['standard', 'express'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setShippingMethod(method)}
                    className={`border px-4 py-3 text-left text-sm transition ${
                      shippingMethod === method
                        ? 'border-cyan/50 bg-cyan/10 text-cyan'
                        : 'border-platinum/20 text-platinum hover:border-platinum/40'
                    }`}
                  >
                    <span className="block font-semibold capitalize">{method}</span>
                    <span className="block text-xs text-platinum/60">{formatCents(SHIPPING_COSTS[method])}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-platinum/80">
                {isRu ? 'Промокод' : 'Promo code'}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="EARLY10"
                  className="cyber-input-sharp flex-1"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  className="border border-platinum/20 px-4 text-sm text-platinum transition hover:border-cyan/50"
                >
                  {isRu ? 'Применить' : 'Apply'}
                </button>
              </div>
              {promo?.valid && <p className="mt-1 text-xs text-cyan">{promo.code} applied</p>}
              {promoError && <p className="mt-1 text-xs text-crimson">{promoError}</p>}
            </div>

            {error && <p className="text-sm text-crimson">{error}</p>}

            <Button type="submit" className="w-full" disabled={items.length === 0 || loading}>
              {loading ? (isRu ? 'Обработка...' : 'Processing...') : isRu ? 'Перейти к оплате' : 'Continue to Payment'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function UpsellRow({ product, lang }: { product: ProductCardProduct; lang: Locale }) {
  const { addItem } = useCart();
  const isRu = lang === 'ru';

  return (
    <div className="flex items-center justify-between border border-platinum/10 bg-obsidian/50 p-3">
      <div>
        <p className="text-sm font-medium text-platinum">{product.name}</p>
        <p className="text-xs text-platinum/50">{formatCents(product.price_cents, product.currency)}</p>
      </div>
      <button
        type="button"
        onClick={() =>
          addItem({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price_cents: product.price_cents,
            currency: product.currency,
          })
        }
        className="border border-cyan/30 px-3 py-1 text-xs font-semibold text-cyan transition hover:bg-cyan/10"
      >
        {isRu ? 'Добавить' : 'Add'}
      </button>
    </div>
  );
}

function PaymentForm({
  orderId,
  lang,
  clearCart,
}: {
  orderId: string;
  lang: Locale;
  clearCart: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isRu = lang === 'ru';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMessage(submitError.message || 'Payment validation failed');
      setIsSubmitting(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${lang}/checkout/confirm?order_id=${orderId}`,
      },
    });

    if (error) {
      setMessage(error.message || 'Payment failed');
    } else {
      clearCart();
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="cyber-input-sharp" />
      {message && <p className="mt-4 text-sm text-crimson">{message}</p>}
      <Button type="submit" className="mt-6 w-full" disabled={!stripe || isSubmitting}>
        {isSubmitting
          ? isRu
            ? 'Обработка...'
            : 'Processing...'
          : isRu
            ? 'Оплатить сейчас'
            : 'Pay now'}
      </Button>
    </form>
  );
}
