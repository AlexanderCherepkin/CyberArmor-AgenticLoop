'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { apiFetch } from '@/lib/api/client';
import { useToast } from '@/components/ui/toast-context';
import { Locale } from '@/lib/i18n/config';

interface ResetPasswordPageProps {
  params: { lang: Locale };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiFetch('/auth/password-reset-request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || 'Request failed');
      }
      setSent(true);
      addToast({
        title: isRu ? 'Письмо отправлено' : 'Reset email sent',
        variant: 'success',
      });
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

        <h1 className="text-center font-heading text-2xl font-bold text-platinum">
          {isRu ? 'Восстановление пароля' : 'Reset your password'}
        </h1>

        {sent ? (
          <div className="mt-8 text-center">
            <p className="text-platinum/80">
              {isRu
                ? 'Если аккаунт существует, мы отправили ссылку для восстановления.'
                : 'If an account exists, a reset link has been sent.'}
            </p>
            <Link
              href={`/${lang}/account/login`}
              className="mt-6 inline-block text-cyan transition hover:text-cyan/80"
            >
              {isRu ? 'Вернуться к входу' : 'Back to sign in'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-platinum/80">
                {isRu ? 'Email' : 'Email address'}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cyber-input-sharp mt-2 w-full"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cyber-button-sharp w-full"
            >
              {isSubmitting
                ? isRu
                  ? 'Отправка...'
                  : 'Sending...'
                : isRu
                  ? 'Отправить ссылку'
                  : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
