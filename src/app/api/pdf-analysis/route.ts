/**
 * /api/pdf-analysis – Proxy to pdf-analyzer microservice
 * รองรับ multipart/form-data (ไฟล์ PDF + options)
 */

import { NextRequest, NextResponse } from 'next/server';

const PDF_ANALYZER_URL =
  process.env.PDF_ANALYZER_URL ?? 'http://pdf-analyzer:8000';

const UPLOAD_TIMEOUT_MS = 120_000;   // 2 min: OCR + YOLO อาจใช้เวลา

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'ต้องแนบไฟล์ PDF' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${PDF_ANALYZER_URL}/parse-pdf`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.detail ?? 'PDF Analyzer error' },
        { status: upstream.status },
      );
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('fetch') || msg.includes('ECONNREFUSED')) {
      return NextResponse.json(
        {
          error:
            'ไม่สามารถเชื่อมต่อ PDF Analyzer ได้ กรุณาตรวจสอบว่า Docker container (pdf-analyzer) กำลังทำงานอยู่',
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Extract vectors only (debug) */
export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${PDF_ANALYZER_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: 'unavailable', service: 'pdf-analyzer' },
      { status: 503 },
    );
  }
}
