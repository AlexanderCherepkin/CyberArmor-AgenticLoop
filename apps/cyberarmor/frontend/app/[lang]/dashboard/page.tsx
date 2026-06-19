import { Locale } from '@/lib/i18n/config';

export default async function DashboardPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const isRu = lang === 'ru';

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-heading text-4xl font-bold text-platinum">
          {isRu ? 'Личный кабинет' : 'Secure Dashboard'}
        </h1>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: isRu ? 'Мои устройства' : 'My Devices',
              desc: isRu ? 'Регистрация токена по серийному номеру' : 'Register tokens by serial number',
            },
            {
              title: isRu ? 'Лицензии ПО' : 'Software Licenses',
              desc: isRu ? 'Управление подписками и обновлениями' : 'Manage subscriptions and updates',
            },
            {
              title: isRu ? 'Заказы и доставка' : 'Orders & Shipping',
              desc: isRu ? 'Отслеживание статуса доставки' : 'Track shipping status',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded border border-platinum/10 bg-graphite/30 p-6 transition hover:border-cyan/30"
            >
              <h3 className="font-heading text-lg font-semibold text-platinum">{card.title}</h3>
              <p className="mt-2 text-sm text-platinum/60">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
