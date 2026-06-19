import { Locale } from '@/lib/i18n/config';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, Building2 } from 'lucide-react';

export default async function SolutionsPage({
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
          {isRu ? 'Решения' : 'Solutions'}
        </h1>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded border border-platinum/10 bg-graphite/30 p-8">
            <User className="h-10 w-10 text-cyan" />
            <h2 className="mt-6 font-heading text-2xl font-semibold text-platinum">
              {isRu ? 'Для частных лиц' : 'For Sovereign Individuals'}
            </h2>
            <p className="mt-4 text-platinum/70">
              {isRu
                ? 'Защита криптокошельков, личных фото, паролей и переписок. Абсолютная приватность без компромиссов.'
                : 'Protect crypto wallets, personal photos, passwords, and communications. Absolute privacy without compromise.'}
            </p>
          </div>

          <div className="rounded border border-platinum/10 bg-graphite/30 p-8">
            <Building2 className="h-10 w-10 text-cyan" />
            <h2 className="mt-6 font-heading text-2xl font-semibold text-platinum">
              {isRu ? 'Для бизнеса' : 'For Enterprise'}
            </h2>
            <p className="mt-4 text-platinum/70">
              {isRu
                ? 'Active Directory, централизованный контроль доступа, аудит событий, удалённое отзывание токенов и оптовые закупки.'
                : 'Active Directory integration, centralized access control, audit events, remote token revocation, and volume procurement.'}
            </p>
            <Link href={`/${lang}/solutions/enterprise`} className="mt-6 inline-block">
              <Button variant="outline">{isRu ? 'Запросить корпоративное демо' : 'Request Enterprise Demo'}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
