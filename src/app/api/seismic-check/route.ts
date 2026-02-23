/**
 * /api/seismic-check – Proxy to opensees-engine microservice
 * เชื่อมต่อ Next.js → FastAPI (opensees-engine container)
 */

import { NextRequest, NextResponse } from 'next/server';
import { SeismicCheckInput } from '@/lib/arc/seismic-engine';

const OPENSEES_ENGINE_URL =
  process.env.OPENSEES_ENGINE_URL ?? 'http://opensees-engine:8000';

export async function POST(req: NextRequest) {
  let body: SeismicCheckInput;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Basic validation before hitting the microservice
  if (!body.stories || body.stories.length === 0) {
    return NextResponse.json(
      { error: 'ต้องระบุข้อมูลชั้นอาคารอย่างน้อย 1 ชั้น' },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${OPENSEES_ENGINE_URL}/analyze-seismic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // timeout for long OpenSees runs
      signal: AbortSignal.timeout(60_000),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.detail ?? 'OpenSees engine error' },
        { status: upstream.status },
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('fetch') || message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        {
          error:
            'ไม่สามารถเชื่อมต่อ OpenSees Engine ได้ กรุณาตรวจสอบว่า Docker container (opensees-engine) กำลังทำงานอยู่',
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Health-check passthrough */
export async function GET() {
  try {
    const res = await fetch(`${OPENSEES_ENGINE_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: 'unavailable', service: 'opensees-engine' },
      { status: 503 },
    );
  }
}
