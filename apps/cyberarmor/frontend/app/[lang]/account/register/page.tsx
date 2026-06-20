'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { useToast } from '@/components/ui/toast-context';
import { Locale } from '@/lib/i18n/config';

interface RegisterPageProps {
  params: { lang: Locale };
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      addToast({
        title: isRu ? 'Пароли не совпадают' : 'Passwords do not match',
        variant: 'error',
      });
      return;
    }
    if (password.length < 12) {
      addToast({
        title: isRu ? 'Пароль слишком короткий' : 'Password too short',
        description: isRu ? 'Минимум 12 символов' : 'Minimum 12 characters',
        variant: 'error',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await register(email, password);
      addToast({
        title: isRu ? 'Аккаунт создан' : 'Account created',
        variant: 'success',
      });
      router.push(`/${lang}/account/dashboard`);
    } catch (err) {
      addToast({
        title: isRu ? 'Ошибка регистрации' : 'Registration failed',
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
          {isRu ? 'Регистрация' : 'Create your account'}
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
            <p className="mt-1 text-xs text-platinum/50">
              {isRu ? 'Минимум 12 символов' : 'At least 12 characters'}
            </p>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-platinum/80">
              {isRu ? 'Подтвердите пароль' : 'Confirm password'}
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
                ? 'Создание...'
                : 'Creating...'
              : isRu
                ? 'Создать аккаунт'
                : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isRu ? 'Уже есть аккаунт?' : 'Already have an account?'}{' '}
          <Link
            href={`/${lang}/account/login`}
            className="text-cyan transition hover:text-cyan/80"
          >
            {isRu ? 'Войти' : 'Sign in'}
          </Link>
        </div>
      </div>
    </div>
  );
}
