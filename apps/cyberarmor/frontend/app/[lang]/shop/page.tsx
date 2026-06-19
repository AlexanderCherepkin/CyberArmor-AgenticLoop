import { Locale } from '@/lib/i18n/config';
import { ProductCard } from '@/components/shop/product-card';

const products = [
  {
    id: 'securekey-standard',
    name: 'SecureKey Standard',
    slug: 'securekey-standard',
    description: 'USB-A security token with AES-256-XTS and PIN protection.',
    price: 149.0,
    currency: 'USD',
    image: '/models/placeholder.svg',
  },
  {
    id: 'securekey-pro',
    name: 'SecureKey Pro',
    slug: 'securekey-pro',
    description: 'USB-C token with biometric scanner and EAL6+ secure element.',
    price: 249.0,
    currency: 'USD',
    image: '/models/placeholder.svg',
  },
  {
    id: 'securekey-enterprise',
    name: 'SecureKey Enterprise',
    slug: 'securekey-enterprise',
    description: 'Ruggedized titanium body with AD/LDAP management support.',
    price: 399.0,
    currency: 'USD',
    image: '/models/placeholder.svg',
  },
];

export default async function ShopPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const isRu = lang === 'ru';

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

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
