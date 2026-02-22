import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Forward the file to the Python FastAPI microservice
        const ifcProcessorUrl = process.env.IFC_PROCESSOR_URL || 'http://localhost:8001';
        
        const pythonFormData = new FormData();
        pythonFormData.append('file', file);

        const response = await fetch(`${ifcProcessorUrl}/extract-foundation`, {
            method: 'POST',
            body: pythonFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Python service error: ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error processing IFC file:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process IFC file' },
            { status: 500 }
        );
    }
}
