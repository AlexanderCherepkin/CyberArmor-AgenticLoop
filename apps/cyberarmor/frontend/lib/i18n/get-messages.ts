import { Locale } from './config';

export async function getMessages(lang: Locale): Promise<Record<string, unknown>> {
  try {
    const messagesModule = await import(`@/messages/${lang}.json`);
    return messagesModule.default || messagesModule;
  } catch {
    const fallback = await import('@/messages/en.json');
    return fallback.default || fallback;
  }
}
