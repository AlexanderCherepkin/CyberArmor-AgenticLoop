'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Shield,
  Users,
  ClipboardList,
  Activity,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { apiFetchJson } from '@/lib/api/client';
import { RFQRead } from '@/lib/api/rfq';
import { Locale } from '@/lib/i18n/config';

interface AuditEvent {
  id: string;
  event_type: string;
  user_email: string;
  device_serial: string | null;
  created_at: string;
}

interface EnterprisePageProps {
  params: { lang: Locale };
}

const labels = (isRu: boolean) => ({
  title: isRu ? 'Enterprise Console' : 'Enterprise Console',
  subtitle: isRu
    ? 'Мульти-тенантный вид для B2B-администраторов.'
    : 'Multi-tenant view for B2B administrators.',
  back: isRu ? 'Назад в кабинет' : 'Back to dashboard',
  rfq: isRu ? 'Запросы цен' : 'RFQ leads',
  seats: isRu ? 'Лицензии' : 'Licenses',
  audit: isRu ? 'Журнал событий' : 'Audit log',
  users: isRu ? 'Пользователи' : 'Users',
  pending: isRu ? 'В ожидании' : 'Pending',
  converted: isRu ? 'Конвертировано' : 'Converted',
  noAccess: isRu
    ? 'Эта страница доступна только B2B-администраторам.'
    : 'This page is available to B2B administrators only.',
});

export default function EnterprisePage({ params }: EnterprisePageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const t = labels(isRu);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [rfqs, setRfqs] = useState<RFQRead[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/${lang}/account/login`);
      return;
    }
    const admin = Boolean(
      user.roles?.some((r) => r.name === 'b2b_admin') ||
        (user as unknown as { is_superuser?: boolean }).is_superuser
    );
    setIsAdmin(admin);

    if (!admin) {
      setLoading(false);
      return;
    }

    apiFetchJson<RFQRead[]>('/rfq/admin/rfqs')
      .then(setRfqs)
      .catch(() => setRfqs([]));

    // Placeholder audit feed until backend endpoint exists
    setEvents([
      {
        id: '1',
        event_type: 'device_registered',
        user_email: 'admin@example.com',
        device_serial: '****7821',
        created_at: new Date(Date.now() - 3600_000).toISOString(),
      },
      {
        id: '2',
        event_type: 'device_revoked',
        user_email: 'admin@example.com',
        device_serial: '****9012',
        created_at: new Date(Date.now() - 7200_000).toISOString(),
      },
    ]);
    setLoading(false);
  }, [user, isLoading, router, lang]);

  if (isLoading || loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <p className="text-platinum/60">{isRu ? 'Загрузка...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="px-6 py-24 pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <Lock className="mx-auto h-12 w-12 text-crimson" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-platinum">{t.noAccess}</h1>
          <Link
            href={`/${lang}/account/dashboard`}
            className="mt-6 inline-block text-cyan transition hover:text-cyan/80"
          >
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  const pending = rfqs.filter((r) => r.status === 'new' || r.status === 'contacted').length;
  const converted = rfqs.filter((r) => r.is_converted).length;

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/${lang}/account/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-platinum/60 transition hover:text-cyan"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border border-cyan/30 bg-cyan/10">
            <Building2 className="h-6 w-6 text-cyan" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-platinum">{t.title}</h1>
            <p className="mt-1 text-sm text-platinum/60">{user.email}</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-platinum/60">{t.subtitle}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ClipboardList, label: t.rfq, value: rfqs.length },
            { icon: Users, label: t.users, value: '—' },
            { icon: Shield, label: t.pending, value: pending },
            { icon: Activity, label: t.converted, value: converted },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="cyber-card-sharp border border-platinum/10 bg-graphite/30 p-6"
              >
                <div className="flex h-8 w-8 items-center justify-center border border-cyan/20 bg-cyan/5">
                  <Icon className="h-4 w-4 text-cyan" />
                </div>
                <p className="mt-2 text-2xl font-bold text-platinum">{card.value}</p>
                <p className="text-xs uppercase tracking-wider text-platinum/60">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="cyber-card-sharp border border-platinum/10 bg-graphite/30 p-6">
            <h2 className="font-heading text-lg font-semibold text-platinum">{t.rfq}</h2>
            <div className="mt-4 space-y-3">
              {rfqs.length === 0 ? (
                <p className="text-sm text-platinum/50">{isRu ? 'Пока нет запросов.' : 'No RFQs yet.'}</p>
              ) : (
                rfqs.slice(0, 6).map((rfq) => (
                  <div
                    key={rfq.id}
                    className="flex items-center justify-between border-b border-platinum/10 pb-3"
                  >
                    <div>
                      <p className="font-mono text-sm text-platinum">{rfq.contact_email}</p>
                      <p className="text-xs text-platinum/50">
                        {rfq.company_name || '—'} · {rfq.seats_min} seats · score {rfq.urgency_score}
                      </p>
                    </div>
                    <span
                      className={`text-xs uppercase tracking-wider ${
                        rfq.status === 'new' ? 'text-cyan' : 'text-platinum/60'
                      }`}
                    >
                      {rfq.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="cyber-card-sharp border border-platinum/10 bg-graphite/30 p-6">
            <h2 className="font-heading text-lg font-semibold text-platinum">{t.audit}</h2>
            <div className="mt-4 space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between border-b border-platinum/10 pb-3"
                >
                  <div>
                    <p className="text-sm text-platinum">{event.event_type}</p>
                    <p className="text-xs text-platinum/50">
                      {event.user_email} {event.device_serial && `· ${event.device_serial}`}
                    </p>
                  </div>
                  <p className="text-xs text-platinum/40">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
