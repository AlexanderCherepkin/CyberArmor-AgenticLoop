'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileCheck } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { userApi, InstallerDownload } from '@/lib/api/user';
import { Locale } from '@/lib/i18n/config';

interface DownloadsPageProps {
  params: { lang: Locale };
}

const labels = (isRu: boolean) => ({
  title: isRu ? 'Загрузки ПО' : 'Software Downloads',
  subtitle: isRu
    ? 'Установщики подписаны в автономном режиме. Проверяйте контрольную сумму перед запуском.'
    : 'Installers are signed offline. Verify the checksum before running.',
  platform: isRu ? 'Платформа' : 'Platform',
  version: isRu ? 'Версия' : 'Version',
  checksum: isRu ? 'SHA-256' : 'SHA-256',
  size: isRu ? 'Размер' : 'Size',
  download: isRu ? 'Скачать' : 'Download',
  signature: isRu ? 'Подпись' : 'Signature',
  back: isRu ? 'Назад в кабинет' : 'Back to dashboard',
});

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

export default function DownloadsPage({ params }: DownloadsPageProps) {
  const { lang } = params;
  const isRu = lang === 'ru';
  const t = labels(isRu);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [downloads, setDownloads] = useState<InstallerDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/${lang}/account/login`);
      return;
    }
    userApi
      .getDownloads()
      .then(setDownloads)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load downloads'))
      .finally(() => setLoading(false));
  }, [user, isLoading, router, lang]);

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
            <Download className="h-6 w-6 text-cyan" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-platinum">{t.title}</h1>
            <p className="mt-1 text-sm text-platinum/60">{user.email}</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-platinum/60">{t.subtitle}</p>

        {error && <p className="mt-4 text-crimson">{error}</p>}

        <div className="mt-8 space-y-4">
          {downloads.map((item) => (
            <div
              key={item.filename}
              className="cyber-card-sharp border border-platinum/10 bg-graphite/30 p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center border border-cyan/20 bg-cyan/5">
                      <FileCheck className="h-4 w-4 text-cyan" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-platinum">
                      {item.platform}
                    </h3>
                  </div>
                  <p className="mt-2 font-mono text-sm text-platinum">{item.filename}</p>
                  <p className="mt-1 text-xs text-platinum/50">
                    {t.version}: {item.version} · {t.size}: {formatBytes(item.size_bytes)}
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-platinum/40">{t.checksum}:</p>
                    <p className="break-all font-mono text-xs text-platinum/60">
                      {item.checksum_sha256}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={item.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-cyan/30 bg-cyan/10 px-6 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/20"
                  >
                    <Download className="h-4 w-4" />
                    {t.download}
                  </a>
                  {item.signature_url && (
                    <a
                      href={item.signature_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-xs text-platinum/50 transition hover:text-cyan"
                    >
                      {t.signature}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
