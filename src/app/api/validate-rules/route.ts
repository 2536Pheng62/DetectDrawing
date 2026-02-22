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

        const response = await fetch(`${ifcProcessorUrl}/validate-rules`, {
            method: 'POST',
            body: pythonFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Python service error: ${errorText}`);
        }

        const data = await response.json();
        
        // Transform the data to match the frontend expectations
        const validationResults = data.validation_results || {};
        const transformedData = {
            status: validationResults.status ?? false,
            passed_requirements: validationResults.total_requirements_pass ?? 0,
            failed_requirements: validationResults.total_requirements_fail ?? 0,
            details: validationResults.specifications?.map((spec: any) => ({
                name: spec.name || 'Unnamed Specification',
                description: spec.description || '',
                status: spec.status ?? false,
            })) || []
        };

        return NextResponse.json(transformedData);

    } catch (error: any) {
        console.error('Error validating IFC rules:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to validate IFC rules' },
            { status: 500 }
        );
    }
}
