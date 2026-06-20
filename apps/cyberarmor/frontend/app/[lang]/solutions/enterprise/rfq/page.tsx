'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Shield } from 'lucide-react';
import { apiFetchJson } from '@/lib/api/client';
import { RFQCreate } from '@/lib/api/rfq';
import { Locale } from '@/lib/i18n/config';

interface RFQPageProps {
  params: { lang: Locale };
}

const INFRA_OPTIONS = [
  { value: 'on-premise', label: { en: 'On-Premise', ru: 'On-Premise' } },
  { value: 'hybrid-cloud', label: { en: 'Hybrid Cloud', ru: 'Гибридное облако' } },
  { value: 'air-gapped', label: { en: 'Air-Gapped', ru: 'Изолированная сеть' } },
  { value: 'cloud-native', label: { en: 'Cloud-Native', ru: 'Cloud-Native' } },
];

const COMPLIANCE_OPTIONS = ['FIPS', 'NIST', 'GDPR', 'HIPAA', 'SOC2', 'ISO27001'];

const TIMELINE_OPTIONS = [
  { value: 'asap', label: { en: 'ASAP', ru: 'Как можно скорее' } },
  { value: '1-3-months', label: { en: '1–3 months', ru: '1–3 месяца' } },
  { value: '3-6-months', label: { en: '3–6 months', ru: '3–6 месяцев' } },
  { value: '6-12-months', label: { en: '6–12 months', ru: '6–12 месяцев' } },
  { value: 'exploratory', label: { en: 'Exploratory', ru: 'На стадии изучения' } },
];

const labels = (isRu: boolean) => ({
  title: isRu ? 'Корпоративный запрос' : 'Enterprise RFQ',
  subtitle: isRu
    ? 'Расскажите о вашей инфраструктуре, масштабе и требованиях. Мы подготовим предложение в течение 24 часов.'
    : 'Tell us about your infrastructure, scale, and requirements. We will prepare a proposal within 24 hours.',
  step1: isRu ? 'Контакты' : 'Contact',
  step2: isRu ? 'Масштаб' : 'Scale',
  step3: isRu ? 'Требования' : 'Requirements',
  email: isRu ? 'Корпоративный email' : 'Business email',
  company: isRu ? 'Компания' : 'Company',
  firstName: isRu ? 'Имя' : 'First name',
  lastName: isRu ? 'Фамилия' : 'Last name',
  phone: isRu ? 'Телефон' : 'Phone',
  seats: isRu ? 'Количество рабочих мест' : 'Number of endpoints',
  seatsHint: isRu ? 'Минимальное количество' : 'Minimum number',
  infra: isRu ? 'Тип инфраструктуры' : 'Infrastructure',
  compliance: isRu ? 'Стандарты соответствия' : 'Compliance frameworks',
  useCase: isRu ? 'Сценарий использования' : 'Use case',
  timeline: isRu ? 'Временные рамки' : 'Timeline',
  next: isRu ? 'Далее' : 'Next',
  back: isRu ? 'Назад' : 'Back',
  submit: isRu ? 'Отправить запрос' : 'Submit request',
  submitting: isRu ? 'Отправка...' : 'Submitting...',
  successTitle: isRu ? 'Запрос отправлен' : 'Request submitted',
  successText: isRu
    ? 'Наш enterprise-консультант свяжется с вами в течение одного рабочего дня.'
    : 'Our enterprise consultant will contact you within one business day.',
  enterprisePage: isRu ? 'Страница Enterprise' : 'Enterprise page',
});

export default function RFQPage({ params }: RFQPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const t = labels(isRu);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RFQCreate>({
    contact_email: '',
    company_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    seats_min: 100,
    seats_max: null,
    infrastructure: null,
    compliance_frameworks: [],
    use_case: '',
    timeline: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof RFQCreate>(key: K, value: RFQCreate[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const toggleCompliance = (value: string) => {
    const current = form.compliance_frameworks || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update('compliance_frameworks', next);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiFetchJson<unknown>('/rfq', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="px-6 py-24 pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-cyan/30 bg-cyan/10">
            <Check className="h-8 w-8 text-cyan" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-bold text-platinum">{t.successTitle}</h1>
          <p className="mt-4 text-platinum/70">{t.successText}</p>
          <Link
            href={`/${lang}/solutions/enterprise`}
            className="mt-8 inline-block text-cyan transition hover:text-cyan/80"
          >
            {t.enterprisePage}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/${lang}/solutions/enterprise`}
          className="inline-flex items-center gap-2 text-sm text-platinum/60 transition hover:text-cyan"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.enterprisePage}
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border border-cyan/30 bg-cyan/10">
            <Shield className="h-6 w-6 text-cyan" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-platinum">{t.title}</h1>
            <p className="mt-1 text-sm text-platinum/60">{t.subtitle}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-2">
          {[t.step1, t.step2, t.step3].map((s, idx) => (
            <div
              key={s}
              className={`flex-1 border-b-2 pb-2 text-xs uppercase tracking-wider ${
                step > idx ? 'border-cyan text-cyan' : 'border-platinum/20 text-platinum/40'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-crimson">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {step === 1 && (
            <div className="grid gap-4">
              {[
                { key: 'contact_email', label: t.email, type: 'email', required: true },
                { key: 'company_name', label: t.company, type: 'text' },
                { key: 'first_name', label: t.firstName, type: 'text' },
                { key: 'last_name', label: t.lastName, type: 'text' },
                { key: 'phone', label: t.phone, type: 'tel' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs uppercase tracking-wider text-platinum/60">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    value={(form[field.key as keyof RFQCreate] as string) ?? ''}
                    onChange={(e) => update(field.key as keyof RFQCreate, e.target.value || null)}
                    className="mt-1 w-full border border-platinum/20 bg-obsidian px-4 py-3 text-platinum placeholder:text-platinum/30 focus:border-cyan focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-platinum/60">
                  {t.seats}
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.seats_min}
                  onChange={(e) => update('seats_min', Number(e.target.value))}
                  className="mt-1 w-full border border-platinum/20 bg-obsidian px-4 py-3 text-platinum focus:border-cyan focus:outline-none"
                />
                <p className="mt-1 text-xs text-platinum/40">{t.seatsHint}</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-platinum/60">
                  {t.infra}
                </label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {INFRA_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('infrastructure', opt.value as RFQCreate['infrastructure'])}
                      className={`border px-4 py-3 text-sm text-left transition ${
                        form.infrastructure === opt.value
                          ? 'border-cyan/50 bg-cyan/10 text-cyan'
                          : 'border-platinum/20 text-platinum hover:border-platinum/40'
                      }`}
                    >
                      {opt.label[isRu ? 'ru' : 'en']}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-platinum/60">
                  {t.compliance}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {COMPLIANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleCompliance(opt)}
                      className={`border px-3 py-1.5 text-xs transition ${
                        form.compliance_frameworks?.includes(opt)
                          ? 'border-cyan/50 bg-cyan/10 text-cyan'
                          : 'border-platinum/20 text-platinum hover:border-platinum/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-platinum/60">
                  {t.useCase}
                </label>
                <textarea
                  rows={4}
                  value={form.use_case ?? ''}
                  onChange={(e) => update('use_case', e.target.value || null)}
                  className="mt-1 w-full border border-platinum/20 bg-obsidian px-4 py-3 text-platinum placeholder:text-platinum/30 focus:border-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-platinum/60">
                  {t.timeline}
                </label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {TIMELINE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('timeline', opt.value as RFQCreate['timeline'])}
                      className={`border px-4 py-3 text-sm text-left transition ${
                        form.timeline === opt.value
                          ? 'border-cyan/50 bg-cyan/10 text-cyan'
                          : 'border-platinum/20 text-platinum hover:border-platinum/40'
                      }`}
                    >
                      {opt.label[isRu ? 'ru' : 'en']}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="border border-platinum/20 px-6 py-3 text-sm text-platinum transition hover:border-platinum/40"
              >
                {t.back}
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="border border-cyan/30 bg-cyan/10 px-6 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/20"
              >
                {t.next}
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="border border-cyan/30 bg-cyan/10 px-6 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/20 disabled:opacity-50"
              >
                {submitting ? t.submitting : t.submit}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
