'use client';

import Link from 'next/link';
import { Locale, localeLabels } from '@/lib/i18n/config';
import { useCart } from '@/components/shop/cart-context';
import { Shield, ShoppingBag } from 'lucide-react';

const navItems = (lang: Locale) => [
  { href: `/${lang}/product`, label: lang === 'ru' ? 'Продукт' : 'Product' },
  { href: `/${lang}/solutions`, label: lang === 'ru' ? 'Решения' : 'Solutions' },
  { href: `/${lang}/shop`, label: lang === 'ru' ? 'Магазин' : 'Shop' },
  { href: `/${lang}/support`, label: lang === 'ru' ? 'Поддержка' : 'Support' },
];

export function Header({ lang }: { lang: Locale }) {
  const otherLocale = lang === 'en' ? 'ru' : 'en';
  const { count, setIsOpen } = useCart();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-platinum/10 bg-obsidian/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-cyan" />
          <span className="font-heading text-lg font-bold tracking-tight text-platinum">
            CyberArmor
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems(lang).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-platinum/80 transition hover:text-cyan"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={`/${lang}/dashboard`}
            className="hidden text-sm font-medium text-platinum/80 transition hover:text-cyan md:block"
          >
            {lang === 'ru' ? 'Кабинет' : 'Dashboard'}
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="relative rounded border border-platinum/20 p-2 text-platinum/70 transition hover:border-cyan/50 hover:text-cyan"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan text-[10px] font-bold text-obsidian">
                {count}
              </span>
            )}
          </button>

          <Link
            href={`/${otherLocale}`}
            className="rounded border border-platinum/20 px-3 py-1 text-xs font-medium text-platinum/70 transition hover:border-cyan/50 hover:text-cyan"
          >
            {localeLabels[otherLocale]}
          </Link>
        </div>
      </div>
    </header>
  );
}
