import { NextResponse } from 'next/server';

import { resolveMode } from '@/lib/stripe/client';

const MODE = resolveMode();

export async function GET() {
  return NextResponse.json({ mode: MODE });
}

export async function POST() {
  return NextResponse.json({ mode: MODE });
}
