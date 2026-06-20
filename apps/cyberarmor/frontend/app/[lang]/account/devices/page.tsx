'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { userApi, UserDevice, UserDeviceCreate } from '@/lib/api/user';
import { Locale } from '@/lib/i18n/config';

interface DevicesPageProps {
  params: { lang: Locale };
}

const VARIANTS = ['Standard', 'Pro', 'Enterprise'];

const labels = (isRu: boolean) => ({
  title: isRu ? 'Мои устройства' : 'My Devices',
  subtitle: isRu
    ? 'Регистрируйте физические токены по серийному номеру. Мы храним только хэш и последние 4 символа.'
    : 'Register physical tokens by serial number. We only store a hash and the last 4 characters.',
  serial: isRu ? 'Серийный номер' : 'Serial number',
  name: isRu ? 'Название устройства' : 'Device name',
  variant: isRu ? 'Модель' : 'Variant',
  add: isRu ? 'Добавить устройство' : 'Add device',
  adding: isRu ? 'Добавление...' : 'Adding...',
  revoke: isRu ? 'Отозвать' : 'Revoke',
  none: isRu ? 'Устройства пока не зарегистрированы.' : 'No devices registered yet.',
  active: isRu ? 'Активно' : 'Active',
  revoked: isRu ? 'Отозвано' : 'Revoked',
  invalidSerial: isRu
    ? 'Серийный номер должен содержать 8–32 символа: заглавные буквы, цифры и дефисы.'
    : 'Serial must be 8–32 uppercase letters, digits, and dashes.',
  back: isRu ? 'Назад в кабинет' : 'Back to dashboard',
});

export default function DevicesPage({ params }: DevicesPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const t = labels(isRu);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [serial, setSerial] = useState('');
  const [name, setName] = useState('');
  const [variant, setVariant] = useState(VARIANTS[0]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = () => {
    userApi
      .getDevices()
      .then(setDevices)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load devices'));
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/${lang}/account/login`);
      return;
    }
    loadDevices();
    setLoading(false);
  }, [user, isLoading, router, lang]);

  const validateSerial = (value: string) => /^[A-Z0-9-]{8,32}$/.test(value.trim().toUpperCase());

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = serial.trim().toUpperCase();
    if (!validateSerial(normalized)) {
      setError(t.invalidSerial);
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const payload: UserDeviceCreate = {
        serial_number: normalized,
        name: name.trim() || null,
        product_variant: variant,
      };
      const device = await userApi.registerDevice(payload);
      setDevices((prev) => [device, ...prev]);
      setSerial('');
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add device');
    } finally {
      setAdding(false);
    }
  };

  const handleRevoke = async (deviceId: string) => {
    setError(null);
    try {
      await userApi.revokeDevice(deviceId);
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId ? { ...d, is_active: false, is_revoked: true } : d
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke device');
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
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/${lang}/account/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-platinum/60 transition hover:text-cyan"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border border-cyan/30 bg-cyan/10">
            <Shield className="h-6 w-6 text-cyan" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-platinum">{t.title}</h1>
            <p className="mt-1 text-sm text-platinum/60">{user.email}</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-platinum/60">{t.subtitle}</p>

        {error && <p className="mt-4 text-crimson">{error}</p>}

        <form onSubmit={handleAdd} className="mt-6 cyber-card-sharp border border-platinum/10 bg-graphite/30 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-platinum/60">
                {t.serial}
              </label>
              <input
                type="text"
                value={serial}
                onChange={(e) => {
                  setSerial(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="SK-XXXX-XXXX-XXXX"
                className="mt-1 w-full border border-platinum/20 bg-obsidian px-4 py-3 font-mono text-sm text-platinum placeholder:text-platinum/30 focus:border-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-platinum/60">
                {t.variant}
              </label>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="mt-1 w-full border border-platinum/20 bg-obsidian px-4 py-3 text-platinum focus:border-cyan focus:outline-none"
              >
                {VARIANTS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs uppercase tracking-wider text-platinum/60">
                {t.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-platinum/20 bg-obsidian px-4 py-3 text-platinum placeholder:text-platinum/30 focus:border-cyan focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="mt-4 inline-flex items-center gap-2 border border-cyan/30 bg-cyan/10 px-6 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/20 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {adding ? t.adding : t.add}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          {devices.length === 0 ? (
            <p className="text-platinum/60">{t.none}</p>
          ) : (
            devices.map((device) => (
              <div
                key={device.id}
                className="cyber-card-sharp flex items-start justify-between gap-4 border border-platinum/10 bg-graphite/30 p-6"
              >
                <div>
                  <p className="font-mono text-sm text-platinum">
                    SN: ****{device.serial_number_masked}
                  </p>
                  {device.name && (
                    <p className="mt-1 text-sm text-platinum/80">{device.name}</p>
                  )}
                  <p className="mt-1 text-xs text-platinum/50">
                    {device.product_variant} ·{' '}
                    {new Date(device.activated_at).toLocaleDateString()}
                  </p>
                  <span
                    className={`mt-2 inline-block text-xs uppercase tracking-wider ${
                      device.is_active && !device.is_revoked
                        ? 'text-cyan'
                        : 'text-crimson'
                    }`}
                  >
                    {device.is_active && !device.is_revoked ? t.active : t.revoked}
                  </span>
                </div>
                {device.is_active && !device.is_revoked && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(device.id)}
                    className="flex items-center gap-1 border border-crimson/30 px-3 py-2 text-xs text-crimson transition hover:bg-crimson/10"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t.revoke}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
