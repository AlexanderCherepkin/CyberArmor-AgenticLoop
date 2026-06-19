import Link from 'next/link';
import { Locale } from '@/lib/i18n/config';
import { Shield } from 'lucide-react';

export function Footer({ lang }: { lang: Locale }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-platinum/10 bg-graphite">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyan" />
            <span className="font-heading font-bold text-platinum">CyberArmor</span>
          </div>

          <div className="flex gap-8 text-sm text-platinum/60">
            <Link href={`/${lang}/product`} className="hover:text-cyan">
              {lang === 'ru' ? 'Продукт' : 'Product'}
            </Link>
            <Link href={`/${lang}/solutions`} className="hover:text-cyan">
              {lang === 'ru' ? 'Решения' : 'Solutions'}
            </Link>
            <Link href={`/${lang}/support`} className="hover:text-cyan">
              {lang === 'ru' ? 'Поддержка' : 'Support'}
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-platinum/40">
          © {year} CyberArmor. {lang === 'ru'
            ? 'Все права защищены. Соответствует GDPR и 152-ФЗ.'
            : 'All rights reserved. GDPR & 152-ФЗ compliant.'}
        </p>
      </div>
    </footer>
  );
}
