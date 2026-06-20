'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export type ConsentDecision = 'undecided' | 'accepted' | 'rejected' | 'custom';

interface PrivacyConsentContextValue {
  decision: ConsentDecision;
  consent: ConsentState;
  isReady: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  setCustom: (next: Partial<ConsentState>) => void;
  reset: () => void;
}

const STORAGE_KEY = 'cyberarmor_privacy_consent';

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const PrivacyConsentContext = createContext<PrivacyConsentContextValue | undefined>(undefined);

export function usePrivacyConsent() {
  const ctx = useContext(PrivacyConsentContext);
  if (!ctx) {
    throw new Error('usePrivacyConsent must be used within PrivacyConsentProvider');
  }
  return ctx;
}

interface StoredConsent {
  decision: ConsentDecision;
  consent: ConsentState;
  version?: number;
}

function readStoredConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    return {
      decision: parsed.decision ?? 'undecided',
      consent: { ...defaultConsent, ...(parsed.consent || {}) },
    };
  } catch {
    return null;
  }
}

function writeStoredConsent(value: StoredConsent) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable or blocked
  }
}

interface PrivacyConsentProviderProps {
  children: ReactNode;
}

export function PrivacyConsentProvider({ children }: PrivacyConsentProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [decision, setDecision] = useState<ConsentDecision>('undecided');
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored) {
      setDecision(stored.decision);
      setConsent(stored.consent);
    }
    setMounted(true);
  }, []);

  const persist = useCallback((nextDecision: ConsentDecision, nextConsent: ConsentState) => {
    setDecision(nextDecision);
    setConsent(nextConsent);
    writeStoredConsent({ decision: nextDecision, consent: nextConsent });
  }, []);

  const acceptAll = useCallback(() => {
    const next: ConsentState = { necessary: true, analytics: true, marketing: true };
    persist('accepted', next);
  }, [persist]);

  const rejectNonEssential = useCallback(() => {
    const next: ConsentState = { necessary: true, analytics: false, marketing: false };
    persist('rejected', next);
  }, [persist]);

  const setCustom = useCallback(
    (next: Partial<ConsentState>) => {
      const merged: ConsentState = { ...consent, ...next, necessary: true };
      const hasAnyOptional = merged.analytics || merged.marketing;
      persist(hasAnyOptional ? 'custom' : 'rejected', merged);
    },
    [consent, persist]
  );

  const reset = useCallback(() => {
    setDecision('undecided');
    setConsent(defaultConsent);
    writeStoredConsent({ decision: 'undecided', consent: defaultConsent });
  }, []);

  const value: PrivacyConsentContextValue = {
    decision,
    consent,
    isReady: mounted,
    acceptAll,
    rejectNonEssential,
    setCustom,
    reset,
  };

  return <PrivacyConsentContext.Provider value={value}>{children}</PrivacyConsentContext.Provider>;
}
