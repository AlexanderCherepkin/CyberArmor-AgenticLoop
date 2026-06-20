'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { apiFetchJson } from '@/lib/api/client';
import { formatCents } from '@/lib/utils';
import { Locale } from '@/lib/i18n/config';

interface ConfirmPageProps {
  params: { lang: Locale };
}

export default function CheckoutConfirmPage({ params }: ConfirmPageProps) {
  return (
    <Suspense fallback={<ConfirmSkeleton />}>
      <ConfirmContent params={params} />
    </Suspense>
  );
}

function ConfirmSkeleton() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="h-16 w-16 animate-pulse border border-cyan/30 bg-cyan/10" />
      <p className="mt-6 text-platinum/70">Loading...</p>
    </div>
  );
}

function ConfirmContent({ params }: ConfirmPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [order, setOrder] = useState<{ status: string; id: string; total_cents: number; currency: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setError(isRu ? 'Не указан номер заказа' : 'Order ID is missing');
      return;
    }

    apiFetchJson<{ status: string; id: string; total_cents: number; currency: string }>(`/checkout/orders/${orderId}`)
      .then((data) => {
        setOrder(data);
        setStatus(data.status === 'paid' ? 'success' : 'loading');
      })
      .catch((err) => {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      });
  }, [orderId, isRu]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      {status === 'success' ? (
        <>
          <CheckCircle className="h-16 w-16 text-cyan" />
          <h1 className="mt-6 font-heading text-3xl font-bold text-platinum">
            {isRu ? 'Оплата прошла успешно' : 'Payment successful'}
          </h1>
          <p className="mt-4 text-platinum/70">
            {isRu ? 'Заказ' : 'Order'} #{order?.id.slice(0, 8)}
          </p>
          <p className="mt-2 font-mono text-cyan">
            {order && formatCents(order.total_cents, order.currency)}
          </p>
          <Link
            href={`/${lang}/account/dashboard`}
            className="mt-8 inline-block border border-cyan/40 bg-cyan/10 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cyan transition hover:bg-cyan/20"
          >
            {isRu ? 'В кабинет' : 'Go to dashboard'}
          </Link>
        </>
      ) : status === 'error' ? (
        <>
          <XCircle className="h-16 w-16 text-crimson" />
          <h1 className="mt-6 font-heading text-3xl font-bold text-platinum">
            {isRu ? 'Ошибка оплаты' : 'Payment error'}
          </h1>
          <p className="mt-4 text-platinum/70">{error || (isRu ? 'Что-то пошло не так' : 'Something went wrong')}</p>
          <Link
            href={`/${lang}/checkout`}
            className="mt-8 inline-block border border-platinum/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-platinum transition hover:border-cyan/40"
          >
            {isRu ? 'Вернуться к оформлению' : 'Return to checkout'}
          </Link>
        </>
      ) : (
        <>
          <div className="h-16 w-16 animate-pulse border border-cyan/30 bg-cyan/10" />
          <p className="mt-6 text-platinum/70">
            {isRu ? 'Подтверждаем статус оплаты...' : 'Confirming payment status...'}
          </p>
        </>
      )}
    </div>
  );
}
