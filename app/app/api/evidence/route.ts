import { BlobServiceClient } from '@azure/storage-blob';
import pool from '@/lib/db';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER!;
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    if (!caseId) return new Response(JSON.stringify({ message: 'caseId required' }), { status: 400 });
    const { rows } = await pool.query('SELECT * FROM evidence WHERE case_id = $1 ORDER BY uploaded_at DESC', [caseId]);
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error('Evidence fetch error:', error);
    return new Response(JSON.stringify({ message: 'Fetch failed' }), { status: 500 });
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const caseId = formData.get('caseId') as string;
  const displayName = formData.get('displayName') as string;
  const extractedText = formData.get('extractedText') as string;

  if (!file || !caseId) {
    return new Response(JSON.stringify({ message: 'file and caseId required' }), { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const fileType = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : file.type.startsWith('image') ? 'image' : 'document';
  const blobName = `${caseId}/${Date.now()}-${file.name}`;

  try {
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const buffer = await file.arrayBuffer();
    await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: file.type } });

    const { rows } = await pool.query(
      'INSERT INTO evidence (case_id, filename, display_name, file_type, blob_path, extracted_text) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [caseId, file.name, displayName || file.name, fileType, blobName, extractedText || null]
    );

    return new Response(JSON.stringify(rows[0]), { status: 201 });
  } catch (error) {
    console.error('Evidence upload error:', error);
    return new Response(JSON.stringify({ message: 'Upload failed' }), { status: 500 });
  }
}
