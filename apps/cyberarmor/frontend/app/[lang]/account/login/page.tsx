'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { useToast } from '@/components/ui/toast-context';
import { Locale } from '@/lib/i18n/config';

interface LoginPageProps {
  params: { lang: Locale };
}

export default function LoginPage({ params }: LoginPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      addToast({
        title: isRu ? 'Вход выполнен' : 'Welcome back',
        variant: 'success',
      });
      router.push(`/${lang}/account/dashboard`);
    } catch (err) {
      addToast({
        title: isRu ? 'Ошибка входа' : 'Login failed',
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
          {isRu ? 'Вход в кабинет' : 'Sign in to your account'}
        </h1>

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-platinum/80">
              {isRu ? 'Пароль' : 'Password'}
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cyber-input-sharp mt-2 w-full"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="cyber-button-sharp w-full"
          >
            {isSubmitting
              ? isRu
                ? 'Вход...'
                : 'Signing in...'
              : isRu
                ? 'Войти'
                : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            href={`/${lang}/account/register`}
            className="text-cyan transition hover:text-cyan/80"
          >
            {isRu ? 'Создать аккаунт' : 'Create account'}
          </Link>
          <Link
            href={`/${lang}/account/reset-password`}
            className="text-platinum/60 transition hover:text-platinum"
          >
            {isRu ? 'Забыли пароль?' : 'Forgot password?'}
          </Link>
        </div>
      </div>
    </div>
  );
}
