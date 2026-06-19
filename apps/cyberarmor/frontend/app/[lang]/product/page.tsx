import { Locale } from '@/lib/i18n/config';
import { Cpu, Fingerprint, ShieldCheck, Zap } from 'lucide-react';

export default async function ProductPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const isRu = lang === 'ru';

  const specs = [
    { icon: Cpu, label: isRu ? 'Защищённый элемент' : 'Secure Element', value: 'EAL6+ certified' },
    { icon: Fingerprint, label: isRu ? 'Биометрия' : 'Biometrics', value: 'Capacitive touch sensor' },
    { icon: ShieldCheck, label: isRu ? 'Шифрование' : 'Encryption', value: 'AES-256-XTS' },
    { icon: Zap, label: isRu ? 'Интерфейс' : 'Interface', value: 'USB-C / USB-A' },
  ];

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-heading text-4xl font-bold text-platinum md:text-5xl">
          {isRu ? 'Продукт и технология' : 'Product & Technology'}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-platinum/70">
          {isRu
            ? 'Глубокий технический разбор архитектуры SecureKey: защищённый чип, протоколы аутентификации, PKI и zero-knowledge архитектура.'
            : 'Deep technical breakdown of the SecureKey architecture: secure chip, authentication protocols, PKI, and zero-knowledge design.'}
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="rounded border border-platinum/10 bg-graphite/40 p-6 transition hover:border-cyan/30"
            >
              <spec.icon className="h-8 w-8 text-cyan" />
              <p className="mt-4 text-xs uppercase tracking-wider text-platinum/50">{spec.label}</p>
              <p className="mt-1 font-mono text-lg text-platinum">{spec.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
