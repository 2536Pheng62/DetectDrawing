import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const idsFile = formData.get('ids_file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Forward the file to the Python FastAPI microservice
        const ifcProcessorUrl = process.env.IFC_PROCESSOR_URL || 'http://localhost:8001';
        
        const pythonFormData = new FormData();
        pythonFormData.append('file', file);
        if (idsFile) {
            pythonFormData.append('ids_file', idsFile);
        }

        const response = await fetch(`${ifcProcessorUrl}/validate-rules`, {
            method: 'POST',
            body: pythonFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Python service error: ${errorText}`);
        }

        const data = await response.json();
        
        // v2: Python now returns structured response directly
        return NextResponse.json({
            status:               data.status ?? false,
            project_name:         data.project_name ?? 'Unknown',
            ids_file_used:        data.ids_file_used ?? '',
            passed_requirements:  data.passed_requirements ?? 0,
            failed_requirements:  data.failed_requirements ?? 0,
            details:              data.details ?? [],
        });

    } catch (error: any) {
        console.error('Error validating IFC rules:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to validate IFC rules' },
            { status: 500 }
        );
    }
}
