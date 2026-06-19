import { Locale } from '@/lib/i18n/config';

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
            ? 'Заполните форму, чтобы получить персональное демо и коммерческое предложение для вашей инфраструктуры.'
            : 'Fill in the form to receive a personalized demo and commercial proposal for your infrastructure.'}
        </p>

        <form className="mt-12 space-y-6">
          {[
            { name: 'name', type: 'text', label: isRu ? 'Имя' : 'Name' },
            { name: 'email', type: 'email', label: isRu ? 'Email' : 'Email' },
            { name: 'company', type: 'text', label: isRu ? 'Компания' : 'Company' },
            { name: 'endpoints', type: 'number', label: isRu ? 'Количество рабочих мест' : 'Number of endpoints' },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-2 block text-sm font-medium text-platinum/80">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                className="w-full rounded border border-platinum/20 bg-obsidian px-4 py-3 text-platinum outline-none transition focus:border-cyan"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full rounded bg-cyan px-6 py-3 font-medium text-obsidian transition hover:bg-cyan/90"
          >
            {isRu ? 'Отправить заявку' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
