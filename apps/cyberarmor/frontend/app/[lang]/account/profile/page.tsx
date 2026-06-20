'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { userApi, UserProfile, UserProfileUpdate } from '@/lib/api/user';
import { Locale } from '@/lib/i18n/config';

interface ProfilePageProps {
  params: { lang: Locale };
}

const labels = (isRu: boolean) => ({
  title: isRu ? 'Профиль' : 'Profile',
  subtitle: isRu ? 'Управление личными данными' : 'Manage your personal details',
  firstName: isRu ? 'Имя' : 'First name',
  lastName: isRu ? 'Фамилия' : 'Last name',
  phone: isRu ? 'Телефон' : 'Phone',
  company: isRu ? 'Компания' : 'Company',
  locale: isRu ? 'Язык' : 'Language',
  timezone: isRu ? 'Часовой пояс' : 'Timezone',
  save: isRu ? 'Сохранить' : 'Save',
  saving: isRu ? 'Сохранение...' : 'Saving...',
  saved: isRu ? 'Изменения сохранены' : 'Changes saved',
  error: isRu ? 'Не удалось сохранить профиль' : 'Failed to save profile',
  back: isRu ? 'Назад в кабинет' : 'Back to dashboard',
});

export default function ProfilePage({ params }: ProfilePageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const t = labels(isRu);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserProfileUpdate>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/${lang}/account/login`);
      return;
    }
    userApi
      .getProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone,
          company_name: p.company_name,
          locale: p.locale,
          timezone: p.timezone,
        });
      })
      .catch(() => setError(isRu ? 'Не удалось загрузить профиль' : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [user, isLoading, router, lang, isRu]);

  const handleChange = (field: keyof UserProfileUpdate, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value || null }));
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await userApi.updateProfile(form);
      setProfile(updated);
      setMessage(t.saved);
    } catch (err) {
      setError(t.error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <p className="text-platinum/60">{isRu ? 'Загрузка...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/${lang}/account/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-platinum/60 transition hover:text-cyan"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border border-cyan/30 bg-cyan/10">
            <User className="h-6 w-6 text-cyan" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-platinum">{t.title}</h1>
            <p className="mt-1 text-sm text-platinum/60">{user.email}</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-platinum/60">{t.subtitle}</p>

        {error && <p className="mt-4 text-crimson">{error}</p>}
        {message && <p className="mt-4 text-cyan">{message}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {[
            { key: 'first_name', label: t.firstName },
            { key: 'last_name', label: t.lastName },
            { key: 'phone', label: t.phone },
            { key: 'company_name', label: t.company },
            { key: 'locale', label: t.locale },
            { key: 'timezone', label: t.timezone },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs uppercase tracking-wider text-platinum/60">
                {field.label}
              </label>
              <input
                type="text"
                value={(form[field.key as keyof UserProfileUpdate] as string) ?? ''}
                onChange={(e) => handleChange(field.key as keyof UserProfileUpdate, e.target.value)}
                className="mt-1 w-full border border-platinum/20 bg-obsidian px-4 py-3 text-platinum placeholder:text-platinum/30 focus:border-cyan focus:outline-none"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 border border-cyan/30 bg-cyan/10 px-6 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? t.saving : t.save}
          </button>
        </form>
      </div>
    </div>
  );
}
