import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const heading = Montserrat({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'CyberArmor | Hardware-Enforced Digital Sovereignty',
  description: 'Premium USB security token for absolute physical control over your PC, data, and digital identity.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${mono.variable} ${heading.variable} min-h-screen bg-obsidian text-platinum font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
