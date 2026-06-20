'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { apiFetchJson } from '@/lib/api/client';
import { formatCents } from '@/lib/utils';
import { Locale } from '@/lib/i18n/config';

interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price_cents: number;
}

interface Order {
  id: string;
  status: string;
  currency: string;
  total_cents: number;
  created_at: string;
  items: OrderItem[];
}

interface OrdersPageProps {
  params: { lang: Locale };
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/${lang}/account/login`);
      return;
    }
    apiFetchJson<Order[]>('/checkout/orders')
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load orders'));
  }, [user, isLoading, router, lang]);

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-heading text-3xl font-bold text-platinum">
          {isRu ? 'Мои заказы' : 'My Orders'}
        </h1>

        {error && <p className="mt-4 text-crimson">{error}</p>}

        <div className="mt-8 space-y-4">
          {orders.length === 0 ? (
            <p className="text-platinum/60">{isRu ? 'У вас пока нет заказов.' : 'You have no orders yet.'}</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="cyber-card-sharp flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center border border-cyan/20 bg-cyan/5">
                    <Package className="h-5 w-5 text-cyan" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-platinum">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-platinum/50">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-cyan">{order.status}</p>
                  </div>
                </div>
                <span className="font-mono text-lg text-platinum">
                  {formatCents(order.total_cents, order.currency)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
