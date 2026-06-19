'use client';

import { useEffect, useState } from 'react';
import { Locale } from '@/lib/i18n/config';

interface SVGFallbackProps {
  lang: Locale;
  className?: string;
}

export function SVGFallback({ lang, className = '' }: SVGFallbackProps) {
  const isRu = lang === 'ru';
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      role="img"
      aria-label={isRu ? 'Иллюстрация USB-токена SecureKey' : 'SecureKey USB token illustration'}
    >
      <svg
        viewBox="0 0 200 420"
        className="h-full w-auto max-w-[280px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1F2833" />
            <stop offset="50%" stopColor="#2A3542" />
            <stop offset="100%" stopColor="#1F2833" />
          </linearGradient>
          <linearGradient id="usbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C5C6C7" />
            <stop offset="50%" stopColor="#E0E1E2" />
            <stop offset="100%" stopColor="#C5C6C7" />
          </linearGradient>
          <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#45A29E" stopOpacity="0" />
            <stop offset="100%" stopColor="#66FCF1" stopOpacity="0.8" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* USB-C connector */}
        <rect x="70" y="20" width="60" height="55" rx="4" fill="url(#usbGrad)" stroke="#A0A1A2" strokeWidth="1" />
        <rect x="80" y="28" width="40" height="6" rx="3" fill="#0B0C10" />
        <rect x="80" y="44" width="40" height="6" rx="3" fill="#0B0C10" />

        {/* Main body */}
        <rect x="40" y="70" width="120" height="300" rx="60" fill="url(#bodyGrad)" stroke="#45A29E" strokeWidth="1.5" />

        {/* Status ring */}
        <circle
          cx="100"
          cy="140"
          r="32"
          fill="none"
          stroke="#66FCF1"
          strokeWidth="3"
          opacity={pulse ? 1 : 0.4}
          className="transition-opacity duration-700"
          filter="url(#glow)"
        />

        {/* Biometric sensor */}
        <circle cx="100" cy="140" r="18" fill="#0B0C10" stroke="#45A29E" strokeWidth="1" />
        <path
          d="M100 130
             C94 130, 90 135, 90 141
             C90 149, 100 155, 100 155
             C100 155, 110 149, 110 141
             C110 135, 106 130, 100 130"
          fill="#45A29E"
          opacity="0.7"
        />

        {/* Brand accent lines */}
        <rect x="86" y="210" width="28" height="4" rx="2" fill="#66FCF1" opacity="0.8" />
        <rect x="86" y="225" width="28" height="4" rx="2" fill="#66FCF1" opacity="0.5" />

        {/* Lock indicator */}
        <g transform="translate(88, 280)" fill="#66FCF1" opacity="0.9">
          <rect x="4" y="10" width="16" height="14" rx="2" />
          <path d="M8 10 V6 A4 4 0 0 1 16 6 V10" fill="none" stroke="#66FCF1" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>

      <p className="mt-4 max-w-xs text-center text-xs text-platinum/50">
        {isRu
          ? 'Интерактивная 3D-модель недоступна в вашем браузере. Используется статичная иллюстрация.'
          : 'Interactive 3D model is unavailable in your browser. Using static illustration.'}
      </p>
    </div>
  );
}
