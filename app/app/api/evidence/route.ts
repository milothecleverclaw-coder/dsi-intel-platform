import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER!;
const TWELVE_LABS_API_KEY = process.env.TWELVE_LABS_API_KEY!;
const TWELVE_LABS_BASE_URL = 'https://api.twelvelabs.io/v1.3';

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Helper to generate SAS URL for a blob
async function generateSASUrl(blobName: string): Promise<string> {
  const connectionStringParts = AZURE_STORAGE_CONNECTION_STRING.split(';');
  let accountName = '';
  let accountKey = '';
  
  for (const part of connectionStringParts) {
    if (part.startsWith('AccountName=')) {
      accountName = part.replace('AccountName=', '');
    }
    if (part.startsWith('AccountKey=')) {
      accountKey = part.replace('AccountKey=', '');
    }
  }
  
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  const sasOptions = {
    containerName: AZURE_STORAGE_CONTAINER,
    blobName: blobName,
    permissions: BlobSASPermissions.parse('r'),
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 24 * 60 * 60 * 1000), // 24 hours for indexing
  };
  
  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
  return `https://${accountName}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${blobName}?${sasToken}`;
}

// Helper to get or create Twelve Labs index for a case
async function getOrCreateIndex(caseId: string): Promise<string> {
  // Check if case already has an index
  const { rows } = await pool.query('SELECT twelve_labs_index_id FROM cases WHERE case_id = $1', [caseId]);
  
  if (rows[0]?.twelve_labs_index_id) {
    return rows[0].twelve_labs_index_id;
  }
  
  // Create new index
  const response = await fetch(`${TWELVE_LABS_BASE_URL}/indexes`, {
    method: 'POST',
    headers: {
      'x-api-key': TWELVE_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      engine_id: 'marengo2.7',
      index_options: ['visual', 'conversation', 'text_in_video', 'logo'],
      index_name: `case-${caseId}`,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create Twelve Labs index: ${await response.text()}`);
  }
  
  const data = await response.json();
  const indexId = data._id;
  
  // Store index_id in case
  await pool.query('UPDATE cases SET twelve_labs_index_id = $1 WHERE case_id = $2', [indexId, caseId]);
  
  return indexId;
}

// Helper to start video indexing
async function startIndexing(videoUrl: string, indexId: string): Promise<string> {
  const response = await fetch(`${TWELVE_LABS_BASE_URL}/videos`, {
    method: 'POST',
    headers: {
      'x-api-key': TWELVE_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      index_id: indexId,
      url: videoUrl,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to start video indexing: ${await response.text()}`);
  }
  
  const data = await response.json();
  return data._id; // task_id
}

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
    // Upload to Azure Blob Storage
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const buffer = await file.arrayBuffer();
    await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: file.type } });

    // Insert evidence record (using correct column names)
    const insertResult = await pool.query(
      `INSERT INTO evidence (case_id, filename, display_name, file_type, blob_path, extracted_text) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [caseId, file.name, displayName || file.name, fileType, blobName, extractedText || null]
    );
    
    const evidence = insertResult.rows[0];

    // If video, start indexing with Twelve Labs
    if (fileType === 'video' && TWELVE_LABS_API_KEY) {
      try {
        // Get or create index for this case
        const indexId = await getOrCreateIndex(caseId);
        
        // Generate SAS URL for the video
        const videoUrl = await generateSASUrl(blobName);
        
        // Start indexing
        const taskId = await startIndexing(videoUrl, indexId);
        
        // Update evidence with index info
        await pool.query(
          'UPDATE evidence SET twelve_labs_index_id = $1, indexing_task_id = $2 WHERE evidence_id = $3',
          [indexId, taskId, evidence.evidence_id]
        );
        
        // Add indexing info to response
        evidence.twelve_labs_index_id = indexId;
        evidence.indexing_task_id = taskId;
        evidence.indexing_status = 'pending';
        
        console.log(`Started indexing video ${evidence.evidence_id} with task ${taskId}`);
      } catch (indexError) {
        console.error('Video indexing failed (upload succeeded):', indexError);
        // Don't fail the upload, just log the error
        evidence.indexing_error = indexError instanceof Error ? indexError.message : 'Indexing failed';
      }
    }

    return NextResponse.json(evidence, { status: 201 });
  } catch (error) {
    console.error('Evidence upload error:', error);
    return new Response(JSON.stringify({ message: 'Upload failed' }), { status: 500 });
  }
}
