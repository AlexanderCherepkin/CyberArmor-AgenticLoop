import { Locale } from '@/lib/i18n/config';

export default async function SupportPage({
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
          {isRu ? 'Поддержка и база знаний' : 'Support & Knowledge Base'}
        </h1>
        <p className="mt-4 text-platinum/70">
          {isRu
            ? 'Инструкции по настройке, драйверы, ПО и форма обращения в техническую поддержку.'
            : 'Setup guides, drivers, software downloads, and a technical support ticket form.'}
        </p>

        <div className="mt-12 space-y-4">
          {[
            isRu ? 'Как активировать SecureKey' : 'How to activate SecureKey',
            isRu ? 'Скачать ПО для Windows, macOS, Linux' : 'Download software for Windows, macOS, Linux',
            isRu ? 'Настройка биометрии и PIN-кода' : 'Biometric and PIN setup',
            isRu ? 'Что делать при утере токена' : 'What to do if the token is lost',
          ].map((item) => (
            <div
              key={item}
              className="rounded border border-platinum/10 bg-graphite/30 px-6 py-4 text-platinum/80 transition hover:border-cyan/30"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
