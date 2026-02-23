import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const ifcProcessorUrl = process.env.IFC_PROCESSOR_URL || 'http://localhost:8001';

        const pythonFormData = new FormData();
        pythonFormData.append('file', file);

        const response = await fetch(`${ifcProcessorUrl}/building-summary`, {
            method: 'POST',
            body: pythonFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`IFC processor error: ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error fetching building summary:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get building summary' },
            { status: 500 }
        );
    }
}

export async function GET() {
    const ifcProcessorUrl = process.env.IFC_PROCESSOR_URL || 'http://localhost:8001';
    try {
        const res = await fetch(`${ifcProcessorUrl}/health`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'IFC processor unreachable' }, { status: 503 });
    }
}
