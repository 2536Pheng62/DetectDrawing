'use client';

import { useState } from 'react';
import { Upload, File, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface ValidationResult {
    status: boolean;
    passed_requirements: number;
    failed_requirements: number;
    details: any[];
}

export default function ARCCheckPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/validate-rules', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to validate file');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">ตรวจสอบแบบแปลนอัตโนมัติ (ARC)</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">อัปโหลดไฟล์ IFC</h2>
                
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง</p>
                            <p className="text-xs text-gray-500">รองรับไฟล์ .ifc เท่านั้น</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept=".ifc" onChange={handleFileChange} />
                    </label>
                </div>

                {file && (
                    <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center">
                            <File className="w-5 h-5 text-blue-500 mr-3" />
                            <span className="text-sm font-medium text-blue-700">{file.name}</span>
                            <span className="ml-2 text-xs text-blue-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    กำลังตรวจสอบ...
                                </>
                            ) : (
                                'เริ่มตรวจสอบ'
                            )}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </div>

            {result && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">ผลการตรวจสอบ (Compliance Report)</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className={`p-4 rounded-lg border ${result.status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">สถานะรวม</span>
                                {result.status ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                            </div>
                            <p className={`text-2xl font-bold mt-2 ${result.status ? 'text-green-700' : 'text-red-700'}`}>
                                {result.status ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}
                            </p>
                        </div>
                        
                        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                            <div className="text-sm font-medium text-gray-600">ข้อกำหนดที่ผ่าน</div>
                            <p className="text-2xl font-bold mt-2 text-green-600">{result.passed_requirements}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                            <div className="text-sm font-medium text-gray-600">ข้อกำหนดที่ไม่ผ่าน</div>
                            <p className="text-2xl font-bold mt-2 text-red-600">{result.failed_requirements}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-md font-medium text-gray-700">รายละเอียดข้อกำหนด (IDS Requirements)</h3>
                        {result.details && result.details.length > 0 ? (
                            result.details.map((detail, index) => (
                                <div key={index} className={`p-4 rounded-lg border ${detail.status ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-800">{detail.name || `Requirement ${index + 1}`}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{detail.description || 'ไม่มีคำอธิบาย'}</p>
                                        </div>
                                        {detail.status ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ผ่าน
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                ไม่ผ่าน
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">ไม่มีรายละเอียดข้อกำหนด</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
