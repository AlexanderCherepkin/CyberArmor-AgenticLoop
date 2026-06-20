'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePrivacyConsent } from '@/components/ui/privacy-context';
import { Locale } from '@/lib/i18n/config';
import { Shield, Check } from 'lucide-react';

interface CookieBannerProps {
  lang: Locale;
  messages?: {
    title: string;
    description: string;
    accept: string;
    reject: string;
    manage: string;
    learnMore: string;
  };
}

export function CookieBanner({ lang, messages }: CookieBannerProps) {
  const { decision, acceptAll, rejectNonEssential, setCustom, consent, isReady } = usePrivacyConsent();
  const [show, setShow] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    if (isReady) {
      setShow(decision === 'undecided');
    }
  }, [decision, isReady]);

  const handleAccept = () => {
    acceptAll();
    setShow(false);
  };

  const handleReject = () => {
    rejectNonEssential();
    setShow(false);
  };

  const handleSavePreferences = () => {
    setCustom({ analytics: prefs.analytics, marketing: prefs.marketing });
    setShow(false);
  };

  if (!show) return null;

  const isRu = lang === 'ru';
  const t = messages || {
    title: isRu ? 'Ваши данные. Ваше согласие.' : 'Your data. Your consent.',
    description: isRu
      ? 'CyberArmor не использует сторонние трекеры. Аналитические и маркетинговые скрипты загружаются только после явного согласия.'
      : 'CyberArmor does not use third-party trackers. Analytics and marketing scripts load only after explicit opt-in.',
    accept: isRu ? 'Принять все' : 'Accept All',
    reject: isRu ? 'Отклонить необязательные' : 'Reject Non-Essential',
    manage: isRu ? 'Настроить' : 'Manage Preferences',
    learnMore: isRu ? 'Подробнее' : 'Learn more',
  };

  const categoryLabels = {
    necessary: isRu ? 'Необходимые' : 'Necessary',
    necessaryDesc: isRu
      ? 'Обеспечивают работу сайта и безопасность.'
      : 'Required for site operation and security.',
    analytics: isRu ? 'Аналитика' : 'Analytics',
    analyticsDesc: isRu
      ? 'Помогают понять, как используется сайт, без персональной идентификации.'
      : 'Helps us understand site usage without personally identifying you.',
    marketing: isRu ? 'Маркетинг' : 'Marketing',
    marketingDesc: isRu
      ? 'Используются только для персонализированных предложений CyberArmor.'
      : 'Used only for personalized CyberArmor offers.',
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={isRu ? 'Согласие на обработку данных' : 'Privacy consent'}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[90] border-t border-platinum/20 bg-graphite/95 backdrop-blur-md',
        'cyber-sharp'
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3 md:max-w-xl">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-cyan/30 bg-cyan/10">
            <Shield className="h-4 w-4 text-cyan" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-platinum">
              {t.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-platinum/70">{t.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          {!manageMode ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant="primary"
                className="cyber-sharp"
                onClick={handleAccept}
              >
                {t.accept}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="cyber-sharp"
                onClick={handleReject}
              >
                {t.reject}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="cyber-sharp"
                onClick={() => {
                  setManageMode(true);
                  setPrefs({ analytics: consent.analytics, marketing: consent.marketing });
                }}
              >
                {t.manage}
              </Button>
              <a
                href={`/${lang}/privacy`}
                className="ml-0 text-xs text-cyan underline underline-offset-2 transition hover:text-cyan/80 md:ml-2"
              >
                {t.learnMore}
              </a>
            </div>
          ) : (
            <div className="w-full border border-platinum/10 bg-obsidian/50 p-4 cyber-sharp md:w-auto md:min-w-[320px]">
              <div className="space-y-3">
                <PreferenceRow
                  id="necessary"
                  checked
                  disabled
                  label={categoryLabels.necessary}
                  description={categoryLabels.necessaryDesc}
                />
                <PreferenceRow
                  id="analytics"
                  checked={prefs.analytics}
                  onChange={(checked) => setPrefs((p) => ({ ...p, analytics: checked }))}
                  label={categoryLabels.analytics}
                  description={categoryLabels.analyticsDesc}
                />
                <PreferenceRow
                  id="marketing"
                  checked={prefs.marketing}
                  onChange={(checked) => setPrefs((p) => ({ ...p, marketing: checked }))}
                  label={categoryLabels.marketing}
                  description={categoryLabels.marketingDesc}
                />
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="cyber-sharp"
                  onClick={() => setManageMode(false)}
                >
                  {isRu ? 'Отмена' : 'Cancel'}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="cyber-sharp"
                  onClick={handleSavePreferences}
                >
                  {isRu ? 'Сохранить' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PreferenceRowProps {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  label: string;
  description: string;
}

function PreferenceRow({ id, checked, disabled, onChange, label, description }: PreferenceRowProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <span
        className={cn(
          'relative flex h-5 w-5 shrink-0 items-center justify-center border border-platinum/30 bg-graphite/50',
          'cyber-sharp',
          disabled && 'opacity-60'
        )}
      >
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <Check
          className="h-3.5 w-3.5 text-cyan opacity-0 transition peer-checked:opacity-100"
          strokeWidth={3}
        />
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-platinum">{label}</span>
        <span className="text-[11px] leading-relaxed text-platinum/50">{description}</span>
      </div>
    </label>
  );
}
