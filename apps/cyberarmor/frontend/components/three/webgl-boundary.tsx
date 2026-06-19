'use client';

import { Component, ReactNode } from 'react';
import { SVGFallback } from './svg-fallback';
import { Locale } from '@/lib/i18n/config';

interface Props {
  children: ReactNode;
  lang: Locale;
  className?: string;
}

interface State {
  hasError: boolean;
}

export class WebGLBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('WebGL rendering failed, fallback to SVG:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return <SVGFallback lang={this.props.lang} className={this.props.className} />;
    }
    return this.props.children;
  }
}

export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const ctx =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!ctx;
  } catch {
    return false;
  }
}
