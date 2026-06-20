import { NextResponse } from 'next/server';
import { z } from 'zod';

const strictEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const waitlistSchema = z.object({
  email: z
    .string()
    .min(5)
    .max(254)
    .refine((value) => strictEmailRegex.test(value), {
      message: 'Invalid email format',
    })
    .transform((value) => value.toLowerCase().trim()),
  lead_source: z.literal('Web_PreLaunch_Waitlist').optional().default('Web_PreLaunch_Waitlist'),
  segment_intent: z.enum(['B2C', 'B2B']).optional().default('B2C'),
  captured_at: z.string().datetime().optional(),
});

export type WaitlistPayload = z.infer<typeof waitlistSchema>;

function sanitize(input: string): string {
  return input.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
}

export async function POST(request: Request) {
  let payload: WaitlistPayload;

  try {
    const body = await request.json();
    payload = waitlistSchema.parse({
      email: sanitize(body.email || ''),
      lead_source: body.lead_source || 'Web_PreLaunch_Waitlist',
      segment_intent: body.segment_intent || 'B2C',
      captured_at: body.captured_at || new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Bad request' },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 800));

  const crmPayload = {
    email: payload.email,
    lead_source: payload.lead_source,
    segment_intent: payload.segment_intent,
    captured_at: payload.captured_at,
  };

  // eslint-disable-next-line no-console
  console.log('[WAITLIST] Lead captured:', JSON.stringify(crmPayload));

  return NextResponse.json(
    { success: true, lead: crmPayload },
    { status: 200 }
  );
}
