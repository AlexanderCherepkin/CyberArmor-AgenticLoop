'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { apiFetch } from '@/lib/api/client';
import { useToast } from '@/components/ui/toast-context';
import { Locale } from '@/lib/i18n/config';

interface ConfirmPageProps {
  params: { lang: Locale };
}

const labels = (isRu: boolean) => ({
  title: isRu ? 'Новый пароль' : 'New password',
  password: isRu ? 'Новый пароль' : 'New password',
  confirm: isRu ? 'Подтвердите пароль' : 'Confirm password',
  submit: isRu ? 'Сохранить пароль' : 'Save password',
  submitting: isRu ? 'Сохранение...' : 'Saving...',
  mismatch: isRu ? 'Пароли не совпадают' : 'Passwords do not match',
  success: isRu ? 'Пароль обновлён' : 'Password updated',
  login: isRu ? 'Войти' : 'Sign in',
});

function ConfirmForm({ lang }: { lang: Locale }) {
  const isRu = lang === 'ru';
  const t = labels(isRu);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      addToast({ title: t.mismatch, variant: 'error' });
      return;
    }
    if (password.length < 12) {
      addToast({
        title: isRu ? 'Минимум 12 символов' : 'Minimum 12 characters',
        variant: 'error',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await apiFetch('/auth/password-reset-confirm', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || 'Request failed');
      }
      setDone(true);
      addToast({ title: t.success, variant: 'success' });
    } catch (err) {
      addToast({
        title: isRu ? 'Ошибка' : 'Error',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-24">
      <div className="w-full max-w-md border border-platinum/10 bg-graphite/40 p-8 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.6)]">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center border border-cyan/30 bg-cyan/10">
            <Shield className="h-6 w-6 text-cyan" />
          </div>
        </div>

        <h1 className="text-center font-heading text-2xl font-bold text-platinum">{t.title}</h1>

        {done ? (
          <div className="mt-8 text-center">
            <p className="text-platinum/80">{t.success}</p>
            <Link
              href={`/${lang}/account/login`}
              className="mt-6 inline-block text-cyan transition hover:text-cyan/80"
            >
              {t.login}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-platinum/80">
                {t.password}
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={12}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cyber-input-sharp mt-2 w-full"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-platinum/80">
                {t.confirm}
              </label>
              <input
                id="confirm"
                type="password"
                required
                minLength={12}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="cyber-input-sharp mt-2 w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cyber-button-sharp w-full"
            >
              {isSubmitting ? t.submitting : t.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ConfirmSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-24">
      <div className="w-full max-w-md border border-platinum/10 bg-graphite/40 p-8">
        <p className="text-center text-platinum/60">Loading...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordConfirmPage({ params }: ConfirmPageProps) {
  return (
    <Suspense fallback={<ConfirmSkeleton />}>
      <ConfirmForm lang={params.lang} />
    </Suspense>
  );
}
