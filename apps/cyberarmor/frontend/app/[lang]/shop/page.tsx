'use client';

import { useEffect, useState } from 'react';
import { ProductCard, ProductCardProduct } from '@/components/shop/product-card';
import { apiFetchJson } from '@/lib/api/client';
import { Locale } from '@/lib/i18n/config';

interface ShopPageProps {
  params: { lang: Locale };
}

export default function ShopPage({ params }: ShopPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchJson<ProductCardProduct[]>('/products')
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-heading text-4xl font-bold text-platinum md:text-5xl">
          {isRu ? 'Магазин' : 'Shop'}
        </h1>
        <p className="mt-4 max-w-2xl text-platinum/70">
          {isRu
            ? 'Выберите модель SecureKey. Корпоративные заказы от 10 единиц — скидки и персональное предложение.'
            : 'Choose your SecureKey model. Enterprise orders of 10+ units unlock volume pricing.'}
        </p>

        {loading ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-96 animate-pulse border border-platinum/10 bg-graphite/30"
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
