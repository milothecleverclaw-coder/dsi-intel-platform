import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import { BlobServiceClient } from '@azure/storage-blob';

export async function POST(request: Request) {
    try {
        const endpoint = process.env.AZURE_DI_ENDPOINT;
        const apiKey = process.env.AZURE_DI_API_KEY;
        const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        const container = process.env.AZURE_STORAGE_CONTAINER;

        if (!endpoint || !apiKey || !connString || !container) {
             return new Response(JSON.stringify({ 
                message: 'Server configuration missing',
                missing: {
                    endpoint: !endpoint,
                    apiKey: !apiKey,
                    connString: !connString,
                    container: !container
                }
             }), { status: 500 });
        }

        const credential = new AzureKeyCredential(apiKey);
        const diClient = new DocumentAnalysisClient(endpoint, credential);
        const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response(JSON.stringify({ message: 'file is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Only process document types
        const isDocument = file.type.includes('pdf') || 
                          file.type.includes('word') || 
                          file.type.includes('text') ||
                          file.type.includes('image');
        
        if (!isDocument) {
            return new Response(JSON.stringify({ 
                message: 'File type not supported for preview',
                fileType: file.type 
            }), { status: 400 });
        }

        // Upload to temporary blob for analysis
        const containerClient = blobServiceClient.getContainerClient(container);
        const tempBlobName = `temp/${Date.now()}-${file.name}`;
        const blockBlobClient = containerClient.getBlockBlobClient(tempBlobName);
        
        const buffer = await file.arrayBuffer();
        await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: file.type } });

        try {
            // Analyze the document using Azure Document Intelligence
            // Use the buffer directly instead of URL
            const poller = await diClient.beginAnalyzeDocument('prebuilt-layout', buffer);
            const result = await poller.pollUntilDone();

            // Extract text content
            let extractedText = '';
            let pages: any[] = [];

            if (result.content) {
                extractedText = result.content;
            }

            if (result.pages) {
                pages = result.pages.map((page: any, index: number) => ({
                    pageNumber: index + 1,
                    lines: page.lines?.map((line: any) => line.content) || [],
                    words: page.words?.length || 0,
                }));
            }

            // Extract tables if any
            const tables = result.tables?.map((table: any) => ({
                rowCount: table.rowCount,
                columnCount: table.columnCount,
                cells: table.cells?.map((cell: any) => ({
                    rowIndex: cell.rowIndex,
                    columnIndex: cell.columnIndex,
                    content: cell.content,
                })),
            })) || [];

            // Clean up temp blob
            await blockBlobClient.delete().catch(() => {});

            return new Response(JSON.stringify({
                success: true,
                filename: file.name,
                fileType: file.type,
                extractedText,
                pages,
                tables,
                wordCount: extractedText.split(/\s+/).length,
                characterCount: extractedText.length,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });

        } catch (diError) {
            // Clean up temp blob on error
            await blockBlobClient.delete().catch(() => {});
            throw diError;
        }

    } catch (error) {
        console.error('Document preview error:', error);
        return new Response(JSON.stringify({ 
            message: 'Error analyzing document',
            error: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
