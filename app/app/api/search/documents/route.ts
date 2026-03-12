import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import pool from '@/lib/db';

const AZURE_DI_ENDPOINT = process.env.AZURE_DI_ENDPOINT || '';
const AZURE_DI_API_KEY = process.env.AZURE_DI_API_KEY || '';

let client: DocumentAnalysisClient;
if (AZURE_DI_ENDPOINT && AZURE_DI_API_KEY) {
    const credential = new AzureKeyCredential(AZURE_DI_API_KEY);
    client = new DocumentAnalysisClient(AZURE_DI_ENDPOINT, credential);
}

export async function POST(request: Request) {
    const { case_id, file_url } = await request.json();

    if (!case_id || !file_url) {
        return new Response(JSON.stringify({ message: 'case_id and file_url are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Analyze the document using Azure Document Intelligence
        const poller = await client.beginAnalyzeDocument(
            'prebuilt-layout', // Use prebuilt-layout model for general document analysis
            file_url
        );
        const result = await poller.pollUntilDone();

        let textSnippets: string[] = [];
        if (result.content) {
            // Simple approach: split content into chunks (e.g., by sentences or paragraphs)
            // More sophisticated processing might be needed based on desired snippet granularity
            textSnippets = result.content.split(/\r?\n/).filter(line => line.trim().length > 0);
        }

        // Store snippets or references in the database
        // For now, we're just returning them. A more complete solution might
        // associate these snippets with the evidence or case.

        return new Response(JSON.stringify({ case_id, textSnippets }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return new Response(JSON.stringify({ message: 'Error analyzing document' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
