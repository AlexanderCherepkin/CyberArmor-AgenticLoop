import { Locale } from '@/lib/i18n/config';
import Link from 'next/link';

export default async function EnterprisePage({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const isRu = lang === 'ru';

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-platinum">
          {isRu ? 'Корпоративное демо и RFQ' : 'Enterprise Demo & RFQ'}
        </h1>
        <p className="mt-4 text-platinum/70">
          {isRu
            ? 'Заполните многошаговую форму, чтобы получить персональное демо и коммерческое предложение для вашей инфраструктуры.'
            : 'Complete the multi-step form to receive a personalized demo and commercial proposal for your infrastructure.'}
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href={`/${lang}/solutions/enterprise/rfq`}
            className="border border-cyan/30 bg-cyan/10 px-6 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/20"
          >
            {isRu ? 'Запросить предложение' : 'Request a quote'}
          </Link>
          <Link
            href={`/${lang}/account/enterprise`}
            className="border border-platinum/20 px-6 py-3 text-sm text-platinum transition hover:border-platinum/40"
          >
            {isRu ? 'Enterprise Console' : 'Enterprise Console'}
          </Link>
        </div>
      </div>
    </div>
  );
}
