import { BlobServiceClient } from '@azure/storage-blob';
import { nanoid } from 'nanoid'; // Assuming nanoid is installed or can be added
import pool from '@/lib/db';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER;

if (!AZURE_STORAGE_CONNECTION_STRING || !AZURE_STORAGE_CONTAINER) {
  throw new Error('Azure Storage credentials missing in environment variables.');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

export async function POST(request: Request, { params }: { params: { caseId: string } }) {
  const caseId = params.caseId;
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return new Response(JSON.stringify({ message: 'No file uploaded' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fileExtension = file.name.split('.').pop();
  const filename = `${nanoid()}.${fileExtension}`;
  const blobPath = `${caseId}/${filename}`;
  const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  try {
    await blockBlobClient.uploadData(file as unknown as Blob, {
      // You might want to set metadata or content type here if needed
      // metadata: { caseId: caseId },
      // blobHTTPHeaders: { blobContentType: file.type },
    });

    // Save evidence metadata to the database
    const { rows } = await pool.query(
      'INSERT INTO evidence (case_id, filename, file_type, blob_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [caseId, file.name, file.type, blobPath]
    );

    return new Response(JSON.stringify(rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error uploading file to Azure Blob:', error);
    return new Response(JSON.stringify({ message: 'Error uploading file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
