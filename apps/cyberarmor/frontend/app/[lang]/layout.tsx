import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../globals.css';
import { locales, type Locale, defaultLocale } from '@/lib/i18n/config';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartProvider } from '@/components/shop/cart-context';
import { CartDrawer } from '@/components/shop/cart-drawer';
import { ToastProvider } from '@/components/ui/toast-context';
import { CookieBanner } from '@/components/ui/cookie-banner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const heading = Montserrat({ subsets: ['latin'], variable: '--font-heading' });

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const { lang } = params;
  if (!locales.includes(lang as Locale)) {
    notFound();
  }
  return {
    title: lang === 'ru'
      ? 'CyberArmor | Аппаратный контроль цифрового суверенитета'
      : 'CyberArmor | Hardware-Enforced Digital Sovereignty',
    description: lang === 'ru'
      ? 'Премиальный USB-токен безопасности для абсолютного физического контроля.'
      : 'Premium USB security token for absolute physical control over your PC and data.',
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [`/${l}`, `https://cyberarmor.example/${l}`])
      ),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;
  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  return (
    <html lang={lang} className="dark">
      <body
        className={`${inter.variable} ${mono.variable} ${heading.variable} min-h-screen bg-obsidian text-platinum font-sans`}
      >
        <CartProvider>
          <ToastProvider>
            <Header lang={lang as Locale} />
            <main className="relative overflow-x-hidden">{children}</main>
            <CartDrawer />
            <Footer lang={lang as Locale} />
            <CookieBanner lang={lang as Locale} />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
