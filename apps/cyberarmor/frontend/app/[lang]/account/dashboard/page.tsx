'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, LogOut, Package, Shield, User } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { Locale } from '@/lib/i18n/config';

interface DashboardPageProps {
  params: { lang: Locale };
}

const cards = (isRu: boolean, lang: Locale) => [
  {
    href: `/${lang}/account/profile`,
    title: isRu ? 'Профиль' : 'Profile',
    desc: isRu
      ? 'Имя, компания, язык и контакты'
      : 'Name, company, language, and contacts',
    icon: User,
  },
  {
    href: `/${lang}/account/devices`,
    title: isRu ? 'Мои устройства' : 'My Devices',
    desc: isRu
      ? 'Регистрация токена по серийному номеру'
      : 'Register tokens by serial number',
    icon: Shield,
  },
  {
    href: `/${lang}/account/orders`,
    title: isRu ? 'Заказы и доставка' : 'Orders & Shipping',
    desc: isRu ? 'Отслеживание статуса доставки' : 'Track shipping status',
    icon: Package,
  },
  {
    href: `/${lang}/account/downloads`,
    title: isRu ? 'Загрузки ПО' : 'Software Downloads',
    desc: isRu
      ? 'Установщики и подписанные обновления'
      : 'Installers and signed updates',
    icon: Download,
  },
];

export default function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${lang}/account/login`);
    }
  }, [isLoading, user, router, lang]);

  const handleLogout = async () => {
    await logout();
    router.push(`/${lang}/account/login`);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <p className="text-platinum/60">{isRu ? 'Загрузка...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-cyan/30 bg-cyan/10">
              <User className="h-6 w-6 text-cyan" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-platinum">
                {isRu ? 'Личный кабинет' : 'Secure Dashboard'}
              </h1>
              <p className="mt-1 text-sm text-platinum/60">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 border border-platinum/20 px-4 py-2 text-sm text-platinum transition hover:border-crimson/50 hover:text-crimson"
          >
            <LogOut className="h-4 w-4" />
            {isRu ? 'Выйти' : 'Log out'}
          </button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards(isRu, lang).map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="cyber-card-sharp group block border border-platinum/10 bg-graphite/30 p-6 transition hover:border-cyan/30"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center border border-cyan/20 bg-cyan/5 transition group-hover:bg-cyan/10">
                  <Icon className="h-4 w-4 text-cyan" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-platinum">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-platinum/60">{card.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
