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
import { PrivacyConsentProvider } from '@/components/ui/privacy-context';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { AuthProvider } from '@/components/auth/auth-context';
import { getMessages } from '@/lib/i18n/get-messages';

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

  const messages = await getMessages(lang as Locale);
  const cookieMessages = messages.cookieBanner as {
    title: string;
    description: string;
    accept: string;
    reject: string;
    manage: string;
    learnMore: string;
  };

  return (
    <html lang={lang} className="dark">
      <body
        className={`${inter.variable} ${mono.variable} ${heading.variable} min-h-screen bg-obsidian text-platinum font-sans`}
      >
        <CartProvider>
          <ToastProvider>
            <PrivacyConsentProvider>
              <AuthProvider>
                <Header lang={lang as Locale} />
                <main className="relative overflow-x-hidden">{children}</main>
                <CartDrawer />
                <Footer lang={lang as Locale} />
                <CookieBanner lang={lang as Locale} messages={cookieMessages} />
              </AuthProvider>
            </PrivacyConsentProvider>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
